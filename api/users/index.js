const { authenticateToken } = require('../_lib/auth');
const { getDB } = require('../_lib/db');

module.exports = authenticateToken(async (req, res) => {
    if (req.method === 'GET') {
        try {
            const db = await getDB();
            const users = await db.getAllUsers();
            
            // Filter users by teacher's assigned classes
            if (req.user.role === 'teacher' && req.user.classes) {
                const filteredUsers = users.filter(user => 
                    req.user.classes.includes(user.CLASS)
                );
                res.json(filteredUsers);
            } else {
                res.json(users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, rollNo, className, gender, city, rfidCard } = req.body;
            
            if (!name || !rollNo || !className) {
                return res.status(400).json({ error: 'Name, roll number, and class are required' });
            }

            const db = await getDB();
            const newUser = await db.addUser({
                name,
                rollNo,
                className,
                gender: gender || '',
                city: city || '',
                rfidCard: rfidCard || ''
            });

            res.json({
                message: 'User added successfully',
                user: newUser
            });
        } catch (error) {
            console.error('Error adding user:', error);
            res.status(500).json({ error: 'Failed to add user' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
});