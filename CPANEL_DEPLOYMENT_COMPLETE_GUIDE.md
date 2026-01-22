# 🚀 Complete cPanel Deployment Guide
## Abra Fleet Management System

**Total Time:** ~35 minutes  
**Server:** 103.185.75.245  
**Domain:** abra-fleet-management.com

---

## STEP 1: Get Your Tools Ready (5 minutes)

Download and install a file transfer client:

**Option A: FileZilla** (Recommended)
- Download: https://filezilla-project.org/download.php?type=client
- Free, cross-platform, easy to use

**Option B: WinSCP**
- Download: https://winscp.net/eng/download.php
- Windows only, more features

---

## STEP 2: Upload Backend Files (10 minutes)

### Connect to Server
1. Open FileZilla/WinSCP
2. Enter connection details:
   - **Host:** 103.185.75.245
   - **Username:** royaldxd
   - **Password:** [your cPanel password]
   - **Port:** 22 (SFTP)
3. Click "Connect"

### Create Directory Structure
Navigate to: `/home/royaldxd/public_html/`

Create folders:
```
public_html/
└── abra-fleet-management/
    └── backend/
```

### Upload Files
Upload your entire `abra_fleet_backend` folder contents to:
```
/home/royaldxd/public_html/abra-fleet-management/backend/
```

**Important:** Also upload your Firebase key file:
- File starts with: `abrafleet-cec94-firebase-adminsdk-...`
- Upload to the `backend/` folder

---

## STEP 3: Setup Node.js in cPanel (5 minutes)

1. Open browser: https://103.185.75.245:2083
2. Login with cPanel credentials
3. Search for: **"Setup Node.js App"**
4. Click: **"Create Application"**

### Application Settings
Fill in these details:
- **Node.js version:** 18.x (or latest available)
- **Application mode:** Production
- **Application root:** `public_html/abra-fleet-management/backend`
- **Application URL:** Leave blank
- **Application startup file:** `index.js`

5. Click: **"Create"**
6. **IMPORTANT:** Copy the command shown (looks like: `source /home/royaldxd/nodevenv/...`)

---

## STEP 4: Install Dependencies (3 minutes)

1. In cPanel, search for: **"Terminal"**
2. Click to open Terminal
3. Paste the command you copied from Step 3
4. Run:
```bash
cd /home/royaldxd/public_html/abra-fleet-management/backend
npm install --production
```
5. Wait for installation (2-3 minutes)

---

## STEP 5: Create .env File (5 minutes)

### Create File
1. In cPanel, go to: **"File Manager"**
2. Navigate to: `public_html/abra-fleet-management/backend/`
3. Click: **"+ File"**
4. Name it: `.env`
5. Right-click → **Edit**

### Paste Configuration
```env
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=abrafleet-cec94
JWT_SECRET=REPLACE_THIS_NOW
JWT_EXPIRES_IN=7d
WEBSOCKET_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=vwng vlfv immf udam
```

### Generate JWT Secret
1. Go back to Terminal
2. Run:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
3. Copy the output
4. Replace `REPLACE_THIS_NOW` with that value
5. **Save the file**

---

## STEP 6: Configure MongoDB (2 minutes)

1. Go to: https://cloud.mongodb.com
2. Login to MongoDB Atlas
3. Click: **"Network Access"** (left sidebar)
4. Click: **"Add IP Address"**
5. Enter: `103.185.75.245`
6. Click: **"Confirm"**

---

## STEP 7: Create .htaccess File (3 minutes)

1. In File Manager, go to: `public_html/abra-fleet-management/`
2. Create new file: `.htaccess`
3. Edit and paste:

```apache
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]

# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, Accept"

# Handle OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

4. **Save**

---

## STEP 8: Start Your Backend (1 minute)

1. In cPanel, go back to: **"Setup Node.js App"**
2. Find your application
3. Click: **"Start App"** (or "Restart App")
4. Status should show: **"Running"** ✅

---

## STEP 9: Test Backend (1 minute)

Open browser and visit:

**Option 1 (with domain):**
```
https://abra-fleet-management.com/api/health
```

**Option 2 (with IP):**
```
http://103.185.75.245/abra-fleet-management/api/health
```

### Expected Response:
```json
{
  "status": "ok",
  "message": "Abra Fleet Backend is running!"
}
```

✅ **If you see this, your backend is LIVE!**

---

## 📱 STEP 10: Update Flutter Config (5 minutes)

On your local computer:

1. Open: `abra_fleet/.env`
2. Update to:
```env
API_BASE_URL=https://abra-fleet-management.com/api
WEBSOCKET_URL=wss://abra-fleet-management.com
FIREBASE_PROJECT_ID=abrafleet-cec94
```
3. Save

---

## STEP 11: Build APK (5 minutes)

Open terminal/command prompt in your project folder:

```bash
cd abra_fleet
flutter clean
flutter pub get
flutter build apk --release
```

### APK Location:
```
abra_fleet\build\app\outputs\flutter-apk\app-release.apk
```

---

## STEP 12: Distribute APK

**Option 1:** Email to users  
**Option 2:** Upload to server and share download link  
**Option 3:** Share via Google Drive

---

## 🎯 Deployment Complete!

Your Abra Fleet Management system is now live and ready to use!

---

## 🔧 Troubleshooting

### Backend Not Starting?
1. Check application logs in cPanel (Setup Node.js App → View Logs)
2. Verify `.env` file has correct values
3. Ensure Firebase key file is uploaded

### Can't Connect to MongoDB?
1. Verify MongoDB IP whitelist includes: `103.185.75.245`
2. Check MongoDB connection string in `.env`
3. Test connection from Terminal:
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error(err));"
```

### API Returns 404?
1. Check `.htaccess` file exists and is correct
2. Verify Node.js app is running
3. Check application root path in Node.js setup

### CORS Errors?
1. Verify `.htaccess` CORS headers
2. Check backend CORS middleware
3. Ensure API_BASE_URL in Flutter app is correct

---

## 📞 Need Help?

If anything doesn't work:
1. Check application logs
2. Verify all configuration files
3. Test each endpoint individually
4. Review error messages carefully

---

## ✅ Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] MongoDB connection successful
- [ ] Firebase authentication working
- [ ] Flutter app connects to backend
- [ ] Test user login
- [ ] Test core features
- [ ] Verify notifications
- [ ] Check file uploads
- [ ] Test route optimization
- [ ] Verify email notifications

---

**Deployment Date:** December 17, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
