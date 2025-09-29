const { requireRole } = require('../_lib/auth');
const { getDB } = require('../_lib/db');

module.exports = requireRole(['government', 'teacher'], async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, className, rollNo, gender, city, status = 'Present' } = req.body;
        
        if (!name || !className || !rollNo) {
            return res.status(400).json({ error: 'Name, class, and roll number are required' });
        }

        // Check if teacher has permission for this class
        if (req.user.role === 'teacher' && req.user.classes && !req.user.classes.includes(className)) {
            return res.status(403).json({ error: 'You do not have permission to mark attendance for this class' });
        }

        const db = await getDB();
        const attendance = await db.markAttendance({
            name,
            className,
            rollNo,
            gender: gender || '',
            city: city || '',
            status,
            timestamp: new Date()
        });

        res.json({
            message: 'Attendance marked successfully',
            attendance
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});