const jwt = require('jsonwebtoken');
const { handleCors } = require('../_lib/auth');

module.exports = async (req, res) => {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, password, role } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }

        // In a real application, validate against database
        // For demo purposes, using hardcoded credentials with class assignments
        const validUsers = {
            'admin': { password: 'admin123', role: 'government', classes: [] },
            'teacher': { password: 'teacher123', role: 'teacher', classes: ['CSE-IOT'] },
            'gov_admin': { password: 'gov123', role: 'government', classes: [] },
            'teacher1': { password: 'teacher123', role: 'teacher', classes: ['CSE-IOT'] },
            'teacher2': { password: 'teach456', role: 'teacher', classes: ['CSE-AIML'] },
            'teacher3': { password: 'teach789', role: 'teacher', classes: ['CSE-CORE'] }
        };

        const user = validUsers[username];
        if (!user || user.password !== password || user.role !== role) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token with class assignments
        const token = jwt.sign(
            { 
                username, 
                role: user.role,
                classes: user.classes 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { 
                username, 
                role: user.role,
                classes: user.classes
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};