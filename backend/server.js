const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const GoogleSheetsDB = require('./googleSheets');
const RFIDReader = require('./rfidReader');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Google Sheets Database
const db = new GoogleSheetsDB();

// Initialize RFID Reader
const rfidReader = new RFIDReader();

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Auth toggle (for development)
const AUTH_DISABLED = (process.env.DISABLE_AUTH || '').toLowerCase() === 'true';

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Role-based access control
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Conditional middlewares based on DISABLE_AUTH
const maybeAuthenticate = AUTH_DISABLED
    ? (req, res, next) => {
        // Default user context in dev mode
        req.user = { role: 'government', username: 'dev_admin', classes: ['CSE-IOT','CSE-AIML','CSE-CORE'] };
        next();
      }
    : authenticateToken;

const maybeRequireRole = AUTH_DISABLED
    ? () => (req, res, next) => next()
    : requireRole;

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'EduFlow - Automated Attendance System API',
        timestamp: new Date().toISOString()
    });
});

// Authentication Routes
// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }

        // In a real application, validate against database
        // For demo purposes, using hardcoded credentials with class assignments
        const validUsers = {
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
});

// User Management Routes
app.get('/api/users', maybeAuthenticate, async (req, res) => {
    try {
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
});

app.post('/api/users', maybeAuthenticate, maybeRequireRole(['government', 'teacher']), async (req, res) => {
    try {
        const { name, rollNo, className, gender, city, rfid_card } = req.body;

        if (!name || !rollNo) {
            return res.status(400).json({ error: 'Name and Roll Number are required' });
        }

        // Check if Roll No already exists
        const existingUser = await db.getUserByRollNo(rollNo);
        if (existingUser) {
            return res.status(400).json({ error: 'Roll Number already registered' });
        }

        const newUser = await db.createUser({ 
            name, 
            rollNo, 
            class: className || 'N/A', 
            gender: gender || 'N/A', 
            city: city || 'N/A', 
            rfid_card 
        });
        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Attendance Routes
app.get('/api/attendance', maybeAuthenticate, async (req, res) => {
    try {
        const { date, rollNo, name } = req.query;
        const filters = {};
        
        if (date) filters.date = date;
        if (rollNo) filters.rollNo = rollNo;
        if (name) filters.name = name;

        let records = await db.getAttendanceRecords(filters);
        
        // Filter records by teacher's assigned classes
        if (req.user.role === 'teacher' && req.user.classes) {
            records = records.filter(record => 
                req.user.classes.includes(record.CLASS)
            );
        }
        
        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// New endpoint specifically for attendance records (used by frontend)
app.get('/api/attendance/records', maybeAuthenticate, async (req, res) => {
    try {
        const { date, rollNo, name, className } = req.query;
        const filters = {};
        
        if (date) filters.date = date;
        if (rollNo) filters.rollNo = rollNo;
        if (name) filters.name = name;
        if (className) filters.class = className;

        let records = await db.getAttendanceRecords(filters);
        
        // Filter records by teacher's assigned classes
        if (req.user.role === 'teacher' && req.user.classes) {
            records = records.filter(record => 
                req.user.classes.includes(record.CLASS)
            );
        }
        
        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

app.post('/api/attendance/mark', maybeAuthenticate, maybeRequireRole(['government', 'teacher']), async (req, res) => {
    try {
        const { rollNo, name, className, gender, city, rfid_card } = req.body;

        if (!rollNo && !rfid_card) {
            return res.status(400).json({ error: 'Roll Number or RFID card is required' });
        }

        const userInfo = {
            rollNo,
            name,
            class: className,
            gender,
            city
        };

        const attendanceRecord = await db.markAttendance(
            rollNo || rfid_card, 
            userInfo
        );

        res.status(201).json({
            message: 'Attendance marked successfully',
            record: attendanceRecord
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        if (error.message === 'User not found for this identifier') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    }
});

// RFID Scanning Route
app.post('/api/rfid/scan', maybeAuthenticate, maybeRequireRole(['government', 'teacher']), async (req, res) => {
    try {
        // This endpoint will be called when RFID reader detects a card
        const { rfid_card, userInfo = {} } = req.body;
        
        if (!rfid_card) {
            return res.status(400).json({ error: 'RFID card data required' });
        }

        // Automatically mark attendance
        const attendanceRecord = await db.markAttendance(rfid_card, userInfo);
        
        res.json({
            message: 'RFID scanned and attendance marked',
            record: attendanceRecord
        });
    } catch (error) {
        console.error('RFID scan error:', error);
        res.status(500).json({ error: 'Failed to process RFID scan' });
    }
});

// Reports Routes
app.get('/api/reports/attendance', maybeAuthenticate, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const report = await db.generateAttendanceReport(start_date, end_date);
        res.json(report);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Real-time RFID scanning endpoint
app.get('/api/rfid/status', maybeAuthenticate, (req, res) => {
    res.json({
        status: rfidReader.isConnected() ? 'connected' : 'disconnected',
        port: process.env.RFID_PORT || 'Not configured',
        last_scan: rfidReader.getLastScan()
    });
});

// Add sample data to Google Sheets
app.post('/api/admin/add-sample-data', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'government') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        await db.addSampleData();
        res.json({ message: 'Sample data added successfully' });
    } catch (error) {
        console.error('Error adding sample data:', error);
        res.status(500).json({ error: 'Failed to add sample data' });
    }
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('🚀 Starting EduFlow - Automated Attendance System...');
        
        // Initialize Google Sheets database
        const dbInitialized = await db.initialize();
        if (!dbInitialized) {
            console.warn('⚠️ Google Sheets database not available, using sample data mode');
        } else {
            console.log('✅ Google Sheets database initialized successfully');
        }

        // Initialize RFID Reader
        await rfidReader.initialize();

        // Setup RFID event listener
        rfidReader.on('cardScanned', async (rfidCard) => {
            try {
                console.log(`📷 RFID Card scanned: ${rfidCard}`);
                await db.markAttendance(rfidCard, 'present');
                console.log(`✅ Attendance marked for card: ${rfidCard}`);
            } catch (error) {
                console.error('❌ Error auto-marking attendance:', error);
            }
        });

        // Start the server
        app.listen(PORT, () => {
            console.log(`🌐 EduFlow Server running on port ${PORT}`);
            console.log(`📊 Google Sheets connected: ${db.initialized ? 'Successfully Connected' : 'Not Available'}`);
            console.log(`🔍 RFID Reader status: ${rfidReader.isConnected() ? 'Connected' : 'Disconnected'}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        // Do not exit, allow debugging
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    rfidReader.disconnect();
    // Do not exit, allow debugging
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    rfidReader.disconnect();
    // Do not exit, allow debugging
});

// Start the application
startServer();