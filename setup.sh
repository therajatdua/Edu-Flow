#!/bin/bash

# RFID Attendance System - Quick Setup Script
echo "🚀 RFID Attendance System - Quick Setup"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo "⚠️  Please edit .env file with your Google Sheets configuration"
else
    echo "✅ .env file already exists"
fi

# Check if credentials.json exists
if [ ! -f "backend/credentials.json" ]; then
    echo ""
    echo "⚠️  Google Sheets credentials not found!"
    echo "   Please follow these steps:"
    echo "   1. Complete Google Sheets API setup (see GOOGLE_SHEETS_SETUP.md)"
    echo "   2. Download credentials.json to backend/ folder"
    echo "   3. Update GOOGLE_SHEET_ID in .env file"
else
    echo "✅ Google Sheets credentials found"
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Display next steps
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. 📊 Setup Google Sheets (see GOOGLE_SHEETS_SETUP.md)"
echo "2. 🔧 Configure RFID hardware (see RFID_HARDWARE_SETUP.md)"  
echo "3. 📝 Edit .env file with your configuration"
echo "4. 🚀 Start the application:"
echo ""
echo "   # Terminal 1 - Start backend server"
echo "   npm run dev"
echo ""
echo "   # Terminal 2 - Start frontend server"
echo "   npm run frontend"
echo ""
echo "5. 🌐 Open http://localhost:3000 in your browser"
echo "6. 🔐 Login with default credentials:"
echo "   - Government: admin / admin123"
echo "   - Teacher: teacher / teacher123"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Main documentation"
echo "   - GOOGLE_SHEETS_SETUP.md - Database setup"
echo "   - RFID_HARDWARE_SETUP.md - Hardware configuration"
echo ""
echo "🔒 Security Note:"
echo "   Change default passwords in production!"
echo ""
echo "Happy coding! 🎉"