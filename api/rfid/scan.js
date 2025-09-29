const { requireRole } = require('../_lib/auth');
const { getDB } = require('../_lib/db');

module.exports = requireRole(['government', 'teacher'], async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { rfidCard } = req.body;
        
        if (!rfidCard) {
            return res.status(400).json({ error: 'RFID card ID is required' });
        }

        const db = await getDB();
        
        // Find user by RFID card
        const users = await db.getAllUsers();
        const user = users.find(u => u.rfid_card === rfidCard);
        
        if (!user) {
            return res.status(404).json({ error: 'RFID card not found in system' });
        }

        // Check if teacher has permission for this class
        if (req.user.role === 'teacher' && req.user.classes && !req.user.classes.includes(user.CLASS)) {
            return res.status(403).json({ error: 'You do not have permission to mark attendance for this class' });
        }

        // Mark attendance
        const attendance = await db.markAttendance({
            name: user.NAME,
            className: user.CLASS,
            rollNo: user['ROLL NO'],
            gender: user.GENDER || '',
            city: user.CITY || '',
            status: 'Present',
            timestamp: new Date(),
            rfidCard: rfidCard
        });

        res.json({
            message: 'Attendance marked via RFID scan',
            user: {
                name: user.NAME,
                rollNo: user['ROLL NO'],
                class: user.CLASS
            },
            attendance
        });
    } catch (error) {
        console.error('Error processing RFID scan:', error);
        res.status(500).json({ error: 'Failed to process RFID scan' });
    }
});