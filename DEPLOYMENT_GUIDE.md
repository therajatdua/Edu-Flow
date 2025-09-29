# 🚀 Deploy EduFlow to Vercel - Complete Guide

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Google Sheet**: Set up according to the main README

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub with all the Vercel-specific files:
- ✅ `/api/` directory with serverless functions
- ✅ `vercel.json` configuration file
- ✅ Updated `frontend/enhanced.html` with dynamic API_BASE

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it as a Node.js project

### 3. Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
GOOGLE_SHEET_ID=1Q9E894LFURKadLXYiW_pk_bvcKyTpd1xdb461vMG16s
NODE_ENV=production
```

**Important**: Make sure to:
- Select all environments (Production, Preview, Development)
- Use your actual Google Sheet ID
- Generate a strong JWT secret

### 4. Deploy

1. Click "Deploy" in Vercel
2. Vercel will build and deploy your app
3. You'll get a live URL like: `https://your-app-name.vercel.app`

### 5. Verify Deployment

Test these endpoints:
- `https://your-app.vercel.app/` - Frontend should load
- `https://your-app.vercel.app/api/health` - Should return OK
- Login functionality with default credentials

## 🔧 Architecture Overview

**Production Setup:**
```
Frontend (Static) → Vercel Edge Network
         ↓
API Endpoints → Vercel Serverless Functions
         ↓
Google Sheets API → Your Google Sheet
```

**Key Changes Made for Vercel:**

1. **Serverless Functions**: Converted Express routes to individual `/api/*.js` files
2. **Dynamic API Base**: Frontend automatically uses correct API URL
3. **CORS Handling**: Added proper CORS headers for cross-origin requests
4. **Environment Variables**: Production-ready configuration

## 📊 Available API Endpoints

Once deployed, your app will have these endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication  
- `GET /api/users` - Get users list
- `POST /api/users` - Add new user
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/rfid/scan` - RFID scan (simulated)
- `GET /api/rfid/status` - RFID status
- `GET /api/reports/attendance` - Attendance reports

## 🔐 Default Login Credentials

- **Government**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`

## ⚠️ Important Notes

1. **RFID Hardware**: Not supported in serverless environment - use manual entry
2. **Google Sheets**: Must share sheet with service account before deployment
3. **Environment Variables**: Set these in Vercel dashboard, not in code
4. **Auto-scaling**: Vercel handles traffic automatically
5. **Cold Starts**: First request might be slower (normal for serverless)

## 🚨 Troubleshooting

**Common Issues:**

1. **API calls failing**: Check environment variables are set correctly
2. **Google Sheets errors**: Verify sheet sharing permissions
3. **JWT errors**: Ensure JWT_SECRET is set and consistent
4. **CORS issues**: Should be handled automatically by our setup

**Debug Steps:**
1. Check Vercel function logs in dashboard
2. Test API endpoints individually
3. Verify Google Sheet ID format
4. Ensure all environment variables are set

## 📈 Post-Deployment

After successful deployment:
1. Test all functionality thoroughly
2. Set up custom domain (optional)
3. Monitor usage in Vercel dashboard
4. Update Google Sheet structure as needed

**Your EduFlow app is now ready for production use! 🎉**