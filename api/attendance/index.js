const { authenticateToken } = require('../_lib/auth');
const { getDB } = require('../_lib/db');

module.exports = authenticateToken(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = await getDB();
        const records = await db.getAttendanceRecords();
        
        // Filter by teacher's classes if not government role
        if (req.user.role === 'teacher' && req.user.classes) {
            const filteredRecords = records.filter(record => 
                req.user.classes.includes(record.CLASS)
            );
            res.json(filteredRecords);
        } else {
            res.json(records);
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});