const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');
require('dotenv').config();

class GoogleSheetsDB {
    constructor() {
        this.doc = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Create JWT auth
            const serviceAccountAuth = new JWT({
                email: 'attendence@attendencd.iam.gserviceaccount.com',
                key: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDsqpIXEp9gs4a7\n22DOaJ+ghg5v2ACLu1j/ze9qcnxa7aKfCmLJKiwscXAs44nMuoT6zYz3XwDSyjyS\ng+fYeXZes/G/7jaTZ/Mw0Sw5mzO3pHvCem32PplTy1uXWcdGf3v3xauExE9cWPbD\nfxK0Hd1bEZTiZuF49OvQD9qMUE7ydt6BQpPT2jS445ModZelpz5NCAEHRXVKTeCM\na0N4TG2qyoJ5SzE4g3N3YWSTUKTDNPxyXMQBlDtRDNo6b6B3vPZbqX9lOceKPYZG\nuT4JhruSBEE82DWCLMujCir1mEsECi+PMvkku/W4kdKVSmngem8CEbpDIFaAF5PY\nA/XDbkIpAgMBAAECggEAFcyj2n93AgCjVFYxmW2iZ3Y1qfhs23IZMW3SA91yBiud\npzXdEc/CRCE6To4ybRLQqSvqFEaSVDg34lyHTGWqwTAkwFO0P/lrGYfo4ZEBz2R1\nmF0v2Abd122zvPISdJRNUk4pPXhaIYTZzPndWo0mLKtmygBlPB+eQXrWXAaRMQzT\n2jz7IlpRtPC8KQQnZCcmqZbJ1ytKGhiBBd9wh2JymHvrTqupFUxwjaxCGBYoF3La\ndNc+AwzUazNwgcN3znpBzDZ8vAC9W4slGpLp7kaYaj7TA9qgyAbWfvknqAak/B22\njwcDdOdBkF47sYWrgsdNIQiuw8PwmHVnkvFij6OU0QKBgQD5hB/TfUZyF3AK7sVG\nT5UbHDa16OnJvehX3q71cRLDSkR1VDHgkct6RnOREIe0fDsJbqGflulJwwFxA0zg\nO4elQIesLl55vXftoo86s6t7LBobMZ4+ZbnLhivULQkerr9aAW6bLw7BO9AEifyF\ngC+a673FZBtipCnAHGgRotbJuQKBgQDy0PboNWUiu00jYSmSI2LtRl+XKw3AC/9I\nncVHOVNltgssSMquIrvnA72qh8MzX15VI1O3QzK2piziFbxA6y4fULETVzGWp7O4\nbV9bRpwXy0kgMHcK7Mcdh9SbMK3KiPfrZkWQJcTDkkAhOhHpADLqFSi8UTheCWEr\nbDkpCJ6z8QKBgGlsQ64t3hfSg0p7O+rLMSq1LwCJGk5c6NBHjBCz58OPm4EfQ7uo\nnhpZrfZ6z3uYibEghzVQo9zAgdloFZEgVd2ieDBtnwk83nEPIAkjZK60IYuf2UZv\n4KJ3XAlXxeSq3LqApGT46vkF9owUaRdW48ZHGHVQKKnyxpke53GcJbgxAoGAHKl9\n+7sRzR++40Y82ftDWi7MadOzM9A2uiOlfdrOdVsfxoJxKkz/US2n3dFYwV+oivQ4\nlZFhEx5affWC20bnktq7jETmnZn+JO8EKooTMtvULfCKnMeGWX4HIqqEWTwBx8+y\ntmk+6LcCyulH4/EaEXed71zHApKo3a9Qr/9MfIECgYBQYKZy15Fe86hGNL7GwYyM\njY4SAIv8ok9janKZ4ifJHWo5/lwuuy2QJxUr/JjqADkEhjEO7HP1t98V/ar0zI6y\nRpdollpvVvZREjXyJN1WNETj8vE+gsBmEnikqHw7fGSFOlGP2k63V02TnLLtAGif\nE/QCIUTXUyjz2ycBUEbSRA==\n-----END PRIVATE KEY-----\n`,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            // Initialize the sheet with auth
            this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

            // Load document properties and worksheets
            await this.doc.loadInfo();
            console.log('Google Sheets connected:', this.doc.title);

            // Setup worksheets
            await this.setupWorksheets();
            this.initialized = true;
            
            return true;
        } catch (error) {
            console.error('Error initializing Google Sheets:', error);
            return false;
        }
    }

    async setupWorksheets() {
        try {
            // Check if required sheets exist, if not create them
            // Sheet 1: Attendance data, Sheet 2: Auth data, Sheet 3: Users (if needed)
            const requiredSheets = ['Sheet1', 'Sheet2', 'Users'];
            
            for (const sheetName of requiredSheets) {
                let sheet = this.doc.sheetsByTitle[sheetName];
                
                if (!sheet) {
                    console.log(`Creating sheet: ${sheetName}`);
                    sheet = await this.doc.addSheet({ title: sheetName });
                }

                // Setup headers based on sheet type
                await this.setupSheetHeaders(sheet, sheetName);
            }
        } catch (error) {
            console.error('Error setting up worksheets:', error);
        }
    }

    async setupSheetHeaders(sheet, sheetName) {
        try {
            let headers = [];
            switch (sheetName) {
                case 'Sheet1':
                    // Use existing Sheet1 format - don't modify existing headers
                    // Format: NAME, CLASS, ROLL NO, GENDER, CITY, DATE, TIME
                    await sheet.loadHeaderRow();
                    if (sheet.headerValues.length === 0) {
                        headers = ['NAME', 'CLASS', 'ROLL NO', 'GENDER', 'CITY', 'DATE', 'TIME'];
                        await sheet.setHeaderRow(headers);
                        console.log(`Headers set for ${sheetName}`);
                    } else {
                        console.log(`Sheet1 existing headers: ${sheet.headerValues.join(', ')}`);
                    }
                    return; // Don't modify existing Sheet1
                case 'Sheet2':
                    // Authentication/login data sheet
                    headers = ['username', 'password', 'role', 'created_at', 'last_login'];
                    break;
                case 'Users':
                    // User information sheet - map to existing format
                    headers = ['ROLL NO', 'NAME', 'CLASS', 'GENDER', 'CITY', 'rfid_card', 'created_at'];
                    break;
            }

            // Check if headers exist, if not set them
            try {
                await sheet.loadHeaderRow();
                if (sheet.headerValues.length === 0) {
                    await sheet.setHeaderRow(headers);
                    console.log(`Headers set for ${sheetName}`);
                }
            } catch (error) {
                // If no headers exist, set them
                await sheet.setHeaderRow(headers);
                console.log(`Headers set for ${sheetName}`);
            }
        } catch (error) {
            console.error(`Error setting headers for ${sheetName}:`, error);
        }
    }

    // User Management - adapted for existing format
    async createUser(userData) {
        try {
            const usersSheet = this.doc.sheetsByTitle['Users'];
            const newUser = {
                'ROLL NO': userData.rollNo || userData.roll_no,
                'NAME': userData.name,
                'CLASS': userData.class || userData.className,
                'GENDER': userData.gender,
                'CITY': userData.city,
                'rfid_card': userData.rfid_card,
                'created_at': new Date().toISOString()
            };

            await usersSheet.addRow(newUser);
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUserByRFID(rfidCard) {
        try {
            const usersSheet = this.doc.sheetsByTitle['Users'];
            const rows = await usersSheet.getRows();
            
            return rows.find(row => row.get('rfid_card') === rfidCard);
        } catch (error) {
            console.error('Error getting user by RFID:', error);
            return null;
        }
    }

    async getUserByRollNo(rollNo) {
        try {
            // First check Users sheet
            const usersSheet = this.doc.sheetsByTitle['Users'];
            if (usersSheet) {
                const rows = await usersSheet.getRows();
                const user = rows.find(row => row.get('ROLL NO') === rollNo);
                if (user) return user;
            }

            // If not found in Users, check existing attendance data in Sheet1
            const attendanceSheet = this.doc.sheetsByTitle['Sheet1'];
            const rows = await attendanceSheet.getRows();
            const attendanceRecord = rows.find(row => row.get('ROLL NO') === rollNo);
            
            if (attendanceRecord) {
                // Return user info from attendance record
                return {
                    get: (field) => {
                        switch(field) {
                            case 'ROLL NO': return attendanceRecord.get('ROLL NO');
                            case 'NAME': return attendanceRecord.get('NAME');
                            case 'CLASS': return attendanceRecord.get('CLASS');
                            case 'GENDER': return attendanceRecord.get('GENDER');
                            case 'CITY': return attendanceRecord.get('CITY');
                            default: return '';
                        }
                    }
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting user by Roll No:', error);
            return null;
        }
    }

    async getAllUsers() {
        try {
            const usersSheet = this.doc.sheetsByTitle['Users'];
            const rows = await usersSheet.getRows();
            return rows.map(row => ({
                rollNo: row.get('ROLL NO'),
                name: row.get('NAME'),
                class: row.get('CLASS'),
                gender: row.get('GENDER'),
                city: row.get('CITY'),
                rfid_card: row.get('rfid_card'),
                created_at: row.get('created_at')
            }));
        } catch (error) {
            console.error('Error getting all users:', error);
            return [];
        }
    }

    // Attendance Management - adapted for existing Sheet1 format
    async markAttendance(rollNoOrRfid, userInfo = {}) {
        try {
            let user = null;
            
            // Try to find user by RFID first, then by Roll No
            if (rollNoOrRfid.length > 10) { // Assume it's RFID if longer
                user = await this.getUserByRFID(rollNoOrRfid);
            } else {
                user = await this.getUserByRollNo(rollNoOrRfid);
            }

            // If user not found and we have userInfo, use that
            if (!user && userInfo.name) {
                user = {
                    get: (field) => {
                        switch(field) {
                            case 'ROLL NO': return userInfo.rollNo || rollNoOrRfid;
                            case 'NAME': return userInfo.name;
                            case 'CLASS': return userInfo.class || 'N/A';
                            case 'GENDER': return userInfo.gender || 'N/A';
                            case 'CITY': return userInfo.city || 'N/A';
                            default: return '';
                        }
                    }
                };
            }

            if (!user) {
                throw new Error('User not found for this identifier');
            }

            const attendanceSheet = this.doc.sheetsByTitle['Sheet1'];
            const now = new Date();
            const attendanceRecord = {
                'NAME': user.get('NAME'),
                'CLASS': user.get('CLASS'),
                'ROLL NO': user.get('ROLL NO'),
                'GENDER': user.get('GENDER'),
                'CITY': user.get('CITY'),
                'DATE': now.toISOString().split('T')[0], // YYYY-MM-DD format
                'TIME': now.toTimeString().split(' ')[0] // HH:MM:SS format
            };

            await attendanceSheet.addRow(attendanceRecord);
            return attendanceRecord;
        } catch (error) {
            console.error('Error marking attendance:', error);
            throw error;
        }
    }

    async getAttendanceRecords(filters = {}) {
        try {
            const attendanceSheet = this.doc.sheetsByTitle['Sheet1'];
            const rows = await attendanceSheet.getRows();
            
            let records = rows.map(row => ({
                NAME: row.get('NAME'),
                CLASS: row.get('CLASS'),
                'ROLL NO': row.get('ROLL NO'),
                GENDER: row.get('GENDER'),
                CITY: row.get('CITY'),
                DATE: row.get('DATE'),
                TIME: row.get('TIME'),
                timestamp: `${row.get('DATE')}T${row.get('TIME')}` // Create combined timestamp
            }));

            // Apply filters
            if (filters.date) {
                records = records.filter(record => 
                    record.DATE === filters.date
                );
            }

            if (filters.rollNo) {
                records = records.filter(record => record['ROLL NO'] === filters.rollNo);
            }

            if (filters.name) {
                records = records.filter(record => 
                    record.NAME.toLowerCase().includes(filters.name.toLowerCase())
                );
            }

            // Sort by date and time (most recent first)
            records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return records;
        } catch (error) {
            console.error('Error getting attendance records:', error);
            return [];
        }
    }

    // Authentication
    async createAuthUser(username, password, role) {
        try {
            const authSheet = this.doc.sheetsByTitle['Sheet2']; // Use Sheet2 for auth
            const authRecord = {
                username: username,
                password: password, // In real app, this should be hashed
                role: role,
                created_at: new Date().toISOString(),
                last_login: ''
            };

            await authSheet.addRow(authRecord);
            return authRecord;
        } catch (error) {
            console.error('Error creating auth user:', error);
            throw error;
        }
    }

    async authenticateUser(username, password) {
        try {
            const authSheet = this.doc.sheetsByTitle['Sheet2']; // Read from Sheet2
            const rows = await authSheet.getRows();
            
            const user = rows.find(row => 
                row.get('username') === username && row.get('password') === password
            );

            if (user) {
                // Update last login
                user.set('last_login', new Date().toISOString());
                await user.save();
                
                return {
                    username: user.get('username'),
                    role: user.get('role'),
                    last_login: user.get('last_login')
                };
            }

            return null;
        } catch (error) {
            console.error('Error authenticating user:', error);
            return null;
        }
    }

    // Reports - adapted for existing format
    async generateAttendanceReport(startDate, endDate) {
        try {
            const attendanceRecords = await this.getAttendanceRecords();
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Filter records by date range
            const filteredRecords = attendanceRecords.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= start && recordDate <= end;
            });

            // Generate summary
            const report = {
                period: { start: startDate, end: endDate },
                total_records: filteredRecords.length,
                unique_students: [...new Set(filteredRecords.map(r => r.rollNo))].length,
                by_class: {},
                by_student: {},
                daily_summary: {}
            };

            // Group by class
            filteredRecords.forEach(record => {
                report.by_class[record.class] = (report.by_class[record.class] || 0) + 1;
            });

            // Group by student
            filteredRecords.forEach(record => {
                if (!report.by_student[record.rollNo]) {
                    report.by_student[record.rollNo] = {
                        name: record.name,
                        class: record.class,
                        gender: record.gender,
                        city: record.city,
                        total_attendance: 0,
                        records: []
                    };
                }
                report.by_student[record.rollNo].total_attendance++;
                report.by_student[record.rollNo].records.push(record);
            });

            // Group by date
            filteredRecords.forEach(record => {
                const date = record.date;
                if (!report.daily_summary[date]) {
                    report.daily_summary[date] = 0;
                }
                report.daily_summary[date]++;
            });

            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    // Add sample data to Sheet1 for testing
    async addSampleData() {
        try {
            const sheet1 = this.doc.sheetsByTitle['Sheet1'];
            
            // Sample students data
            const sampleData = [
                { NAME: 'Rahul Sharma', CLASS: 'CSE-IOT', 'ROLL NO': '2022001', GENDER: 'Male', CITY: 'Mumbai', DATE: '2025-09-22', TIME: '09:15:00' },
                { NAME: 'Priya Patel', CLASS: 'CSE-AIML', 'ROLL NO': '2022002', GENDER: 'Female', CITY: 'Delhi', DATE: '2025-09-22', TIME: '09:20:00' },
                { NAME: 'Amit Kumar', CLASS: 'CSE-CORE', 'ROLL NO': '2022003', GENDER: 'Male', CITY: 'Bangalore', DATE: '2025-09-22', TIME: '09:25:00' },
                { NAME: 'Neha Singh', CLASS: 'CSE-IOT', 'ROLL NO': '2022004', GENDER: 'Female', CITY: 'Pune', DATE: '2025-09-22', TIME: '09:30:00' },
                { NAME: 'Rohit Verma', CLASS: 'CSE-AIML', 'ROLL NO': '2022005', GENDER: 'Male', CITY: 'Chennai', DATE: '2025-09-22', TIME: '09:35:00' },
                { NAME: 'Sonia Gupta', CLASS: 'CSE-CORE', 'ROLL NO': '2022006', GENDER: 'Female', CITY: 'Kolkata', DATE: '2025-09-21', TIME: '09:15:00' },
                { NAME: 'Vikash Yadav', CLASS: 'CSE-IOT', 'ROLL NO': '2022007', GENDER: 'Male', CITY: 'Lucknow', DATE: '2025-09-21', TIME: '09:20:00' },
                { NAME: 'Deepika Reddy', CLASS: 'CSE-AIML', 'ROLL NO': '2022008', GENDER: 'Female', CITY: 'Hyderabad', DATE: '2025-09-21', TIME: '09:25:00' },
                { NAME: 'Suresh Nair', CLASS: 'CSE-CORE', 'ROLL NO': '2022009', GENDER: 'Male', CITY: 'Kochi', DATE: '2025-09-20', TIME: '09:30:00' },
                { NAME: 'Kavya Joshi', CLASS: 'CSE-IOT', 'ROLL NO': '2022010', GENDER: 'Female', CITY: 'Jaipur', DATE: '2025-09-20', TIME: '09:35:00' }
            ];

            // Add rows to Sheet1
            for (const record of sampleData) {
                await sheet1.addRow(record);
            }

            console.log('✅ Sample data added to Google Sheet');
            return true;
        } catch (error) {
            console.error('Error adding sample data:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetsDB;