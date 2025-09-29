# RFID Attendance System - Google Sheets Setup Guide

## 1. Create Google Sheets Database

### Step 1: Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "RFID Attendance System Database"

### Step 2: Create Required Sheets
Create 3 sheets with the following structure:

#### Sheet 1: "Users"
| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| id       | name     | rfid_card| role     | email    | created_at |

#### Sheet 2: "Attendance"
| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| id       | user_id  | name     | timestamp| status   | rfid_card| location |

#### Sheet 3: "Auth"
| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| username | password | role     | created_at | last_login |

### Step 3: Add Default Auth Users
In the "Auth" sheet, add these default users:

| username | password  | role       | created_at | last_login |
|----------|-----------|------------|------------|------------|
| admin    | admin123  | government | 2024-01-01 |            |
| teacher  | teacher123| teacher    | 2024-01-01 |            |

### Step 4: Add Sample Users (Optional)
In the "Users" sheet, you can add sample users:

| id    | name        | rfid_card | role    | email              | created_at |
|-------|-------------|-----------|---------|-------------------|------------|
| 1001  | John Doe    | RFID001   | student | john@example.com  | 2024-01-01 |
| 1002  | Jane Smith  | RFID002   | student | jane@example.com  | 2024-01-01 |
| 1003  | Bob Wilson  | RFID003   | teacher | bob@example.com   | 2024-01-01 |

## 2. Enable Google Sheets API

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "RFID Attendance System"

### Step 2: Enable Google Sheets API
1. Go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### Step 3: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter name: "rfid-attendance-service"
4. Click "Create and Continue"
5. Grant role: "Editor"
6. Click "Continue" and "Done"

### Step 4: Generate JSON Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the JSON file
6. Rename it to `credentials.json`
7. Place it in the `backend` folder

### Step 5: Share Sheet with Service Account
1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (from credentials.json)
4. Grant "Editor" permissions
5. Uncheck "Notify people"
6. Click "Share"

### Step 6: Get Sheet ID
Copy the Sheet ID from the URL:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```

## 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_CREDENTIALS_PATH=./backend/credentials.json
RFID_PORT=COM3

NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

SESSION_TIMEOUT=24h

DEFAULT_GOV_USERNAME=admin
DEFAULT_GOV_PASSWORD=admin123
DEFAULT_TEACHER_USERNAME=teacher
DEFAULT_TEACHER_PASSWORD=teacher123
```

## 4. Verify Setup

1. Install dependencies: `npm install`
2. Start the backend: `npm run dev`
3. Start the frontend: `npm run frontend`
4. Open browser to `http://localhost:3000`
5. Login with default credentials

## Troubleshooting

### Error: "No access to Google Sheets"
- Verify the service account email is added to the sheet
- Check the credentials.json file path
- Ensure Google Sheets API is enabled

### Error: "Sheet not found"
- Verify the GOOGLE_SHEET_ID in .env file
- Check if the sheet is accessible

### Error: "Permission denied"
- Make sure service account has Editor permissions
- Check if the JSON key file is valid and not expired

## Security Notes

1. **Change default passwords** in production
2. **Use strong JWT secret** in production
3. **Enable HTTPS** in production
4. **Restrict service account permissions** to minimum required
5. **Regularly rotate API keys**

## Next Steps

1. Connect physical RFID reader to your computer
2. Update RFID_PORT in .env file to match your hardware
3. Configure RFID reader to send card data via serial port
4. Test the system with actual RFID cards