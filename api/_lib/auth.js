const jwt = require('jsonwebtoken');

// CORS headers for Vercel
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
const handleCors = (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return true;
    }
    // Set CORS headers for all requests
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });
    return false;
};

// JWT Authentication middleware for Vercel functions
const authenticateToken = (handler) => {
    return async (req, res) => {
        // Handle CORS
        if (handleCors(req, res)) return;

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
            return await handler(req, res);
        } catch (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
    };
};

// Role-based access control
const requireRole = (roles, handler) => {
    return authenticateToken(async (req, res) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        return await handler(req, res);
    });
};

module.exports = {
    corsHeaders,
    handleCors,
    authenticateToken,
    requireRole
};