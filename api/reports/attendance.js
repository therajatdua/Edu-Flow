const { authenticateToken } = require('../_lib/auth');
const { getDB } = require('../_lib/db');

module.exports = authenticateToken(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { startDate, endDate, className } = req.query;
        
        const db = await getDB();
        const records = await db.getAttendanceRecords();
        
        // Filter records based on query parameters
        let filteredRecords = records;
        
        // Filter by teacher's classes if not government role
        if (req.user.role === 'teacher' && req.user.classes) {
            filteredRecords = filteredRecords.filter(record => 
                req.user.classes.includes(record.CLASS)
            );
        }
        
        // Filter by class if specified
        if (className) {
            filteredRecords = filteredRecords.filter(record => 
                record.CLASS === className
            );
        }
        
        // Filter by date range if specified
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filteredRecords = filteredRecords.filter(record => {
                const recordDate = new Date(record.DATE);
                return recordDate >= start && recordDate <= end;
            });
        }

        res.json({
            records: filteredRecords,
            summary: {
                totalRecords: filteredRecords.length,
                uniqueStudents: [...new Set(filteredRecords.map(r => r['ROLL NO']))].length,
                classes: [...new Set(filteredRecords.map(r => r.CLASS))],
                dateRange: {
                    start: startDate || 'All time',
                    end: endDate || 'All time'
                }
            }
        });
    } catch (error) {
        console.error('Error generating attendance report:', error);
        res.status(500).json({ error: 'Failed to generate attendance report' });
    }
});