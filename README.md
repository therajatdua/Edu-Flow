<<<<<<< HEAD
# Edu-Flow
Automatic Attendance System by using RFID

A comprehensive RFID-based attendance system with Google Sheets integration and dual login system for Government and Teacher roles.

## Features

- 🔐 Dual Login System (Government & Teacher)
- 📊 Google Sheets Database Integration
- 🏷️ RFID Card Scanning
- 📱 Responsive Web Interface
- 📈 Real-time Attendance Tracking
- 📋 Comprehensive Reports

## System Architecture

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: Google Sheets API
- **Hardware**: RFID Reader (Arduino/USB)
- **Authentication**: JWT Tokens

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Google Sheets Setup
1. Create a new Google Sheet with the following structure:
   - Sheet 1: "Users" (columns: id, name, rfid_card, role, email, created_at)
   - Sheet 2: "Attendance" (columns: id, user_id, name, timestamp, status, rfid_card)
   - Sheet 3: "Auth" (columns: username, password, role, created_at)

2. Enable Google Sheets API and download credentials.json
3. Place credentials.json in the backend folder

### 3. Environment Configuration
Create a `.env` file in the root directory:
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_CREDENTIALS_PATH=./backend/credentials.json
RFID_PORT=COM3
```

### 4. Run the Application
```bash
# Start backend server
npm run dev

# Start frontend (in another terminal)
npm run frontend
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## User Roles

### Government Login
- View all attendance records
- Generate comprehensive reports
- Manage teachers and students
- System administration

### Teacher Login
- Mark attendance via RFID
- View class attendance
- Generate class reports
- Student management

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/mark` - Mark attendance via RFID
- `GET /api/users` - Get user list
- `POST /api/users` - Add new user
- `GET /api/reports` - Generate reports

## Hardware Requirements

- RFID Reader (RC522 or similar)
- Arduino/USB-to-Serial adapter
- RFID Cards/Tags

## Development

The system is designed to be simple yet powerful, with all data stored in Google Sheets for easy access and management.
=======
# Edu-Flow
Automatic Attendance System by using RFID
>>>>>>> 31e17137600832d96e857ea710d66abf0324608c
# Edu-Flow
