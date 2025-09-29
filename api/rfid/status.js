const { authenticateToken } = require('../_lib/auth');

module.exports = authenticateToken(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    res.json({
        connected: false,
        port: process.env.RFID_PORT || 'Not configured',
        message: 'RFID functionality is not available in serverless environment',
        fallback: 'Use manual entry or RFID simulator'
    });
});