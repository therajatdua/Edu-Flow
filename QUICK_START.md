# 🚀 Quick Setup Instructions for Your RFID Attendance System

## ✅ What's Already Done:
- ✅ Google Service Account credentials are configured
- ✅ All dependencies are installed
- ✅ Code is configured for your sheet structure (Sheet1 = data, Sheet2 = login)

## 📋 Next Steps:

### 1. Create Your Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. **Share it with your service account email**: `attendence@attendencd.iam.gserviceaccount.com`
   - Click "Share" button
   - Add the email address
   - Grant "Editor" permissions
   - Uncheck "Notify people"

### 2. Get Your Sheet ID
From the URL of your Google Sheet, copy the Sheet ID:
```
https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
```

### 3. Update Configuration
Edit the `.env` file and replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID:
```bash
GOOGLE_SHEET_ID=your_actual_sheet_id_here
```

### 4. Configure Your RFID Port (if using hardware)
Update the RFID_PORT in `.env` file:
- **Windows**: `RFID_PORT=COM3` (or COM4, COM5, etc.)
- **macOS**: `RFID_PORT=/dev/tty.usbserial-1410` 
- **Linux**: `RFID_PORT=/dev/ttyUSB0`

### 5. Initialize the System
Run the setup script to create the sheet structure and add default users:
```bash
npm run setup
```

### 6. Start the Application
Open two terminals:

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run frontend
```

### 7. Access the System
- Open your browser to: http://localhost:3000
- Login with default credentials:
  - **Government**: admin / admin123
  - **Teacher**: teacher / teacher123

## 📊 Your Google Sheet Structure:
- **Sheet1**: Main attendance data (RFID scans, timestamps, status)
- **Sheet2**: Login credentials (usernames, passwords, roles)
- **Users**: RFID user information (names, card IDs, roles)

## 🏷️ Test RFID Cards:
The system includes these sample RFID cards for testing:
- `RFID001` - John Doe (Student)
- `RFID002` - Jane Smith (Student)  
- `RFID003` - Bob Wilson (Teacher)

## 🔧 Hardware Testing:
1. Go to RFID Scanner page in the web interface
2. Use "Manual RFID Entry" to test with sample cards
3. Connect your physical RFID reader to test real hardware

## 🆘 Need Help?
If you encounter any issues:
1. Check that the service account email is added to your Google Sheet
2. Verify the GOOGLE_SHEET_ID in the .env file
3. Ensure your RFID hardware is connected to the correct port
4. Check the console logs for error messages

**Ready to go!** 🎉