const { handleCors } = require('./_lib/auth');

module.exports = async (req, res) => {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method === 'GET') {
        res.json({ 
            status: 'OK', 
            message: 'EduFlow - Automated Attendance System API',
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};