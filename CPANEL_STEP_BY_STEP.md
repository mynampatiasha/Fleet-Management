# 📖 cPanel Deployment - Step by Step Visual Guide

## 🎯 Goal
Deploy ABRA Fleet backend to cPanel server and build Flutter mobile app.

**Time Required**: 30-45 minutes
**Difficulty**: Intermediate

---

## 📦 What You'll Deploy

```
┌─────────────────────────────────────────┐
│         cPanel Server                    │
│      103.185.75.245:2083                │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  Node.js Backend (Port 3000)   │    │
│  │  /fleet-management/backend/    │    │
│  │  - Express API                  │    │
│  │  - WebSocket (Port 3001)       │    │
│  │  - Firebase Auth               │    │
│  └────────────────────────────────┘    │
│              ↕                          │
│  ┌────────────────────────────────┐    │
│  │  MongoDB Atlas (Cloud)         │    │
│  │  Database: abra_fleet          │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│      Flutter Mobile App (APK)           │
│  - Android/iOS                          │
│  - Connects to API                      │
└─────────────────────────────────────────┘
```

---

## 🚀 PHASE 1: Prepare Files (5 minutes)

### Step 1.1: Organize Your Files

Create a deployment folder on your computer:
```
deployment/
├── backend/              (copy from abra_fleet_backend)
├── firebase-key.json     (your Firebase service account key)
├── .env                  (from .env.cpanel.template)
└── .htaccess            (from .htaccess.cpanel)
```

### Step 1.2: Generate JWT Secret

Open terminal/command prompt:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copy the output** - you'll need it for .env file.

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4
```

### Step 1.3: Configure .env File

Edit your .env file and replace `JWT_SECRET`:
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4
```

✅ **Checkpoint**: You have backend folder, Firebase key, .env, and .htaccess ready.

---

## 🌐 PHASE 2: Upload to Server (10 minutes)

### Step 2.1: Access cPanel

1. Open browser
2. Go to: `https://103.185.75.245:2083`
3. Login with your credentials
4. You should see the cPanel dashboard

### Step 2.2: Open File Manager

1. In cPanel, find "Files" section
2. Click "File Manager"
3. Navigate to: `public_html`
4. Create new folder: `fleet-management`
5. Inside `fleet-management`, create: `backend`

Your path should be:
```
/home/royaldxd/public_html/fleet-management/backend/
```

### Step 2.3: Upload Backend Files

**Option A: Using File Manager (Recommended for beginners)**

1. Click "Upload" button in File Manager
2. Select all files from your backend folder
3. Wait for upload to complete
4. Upload .env file
5. Upload Firebase key JSON file
6. Go back to `fleet-management` folder
7. Upload .htaccess file

**Option B: Using FTP Client (FileZilla/WinSCP)**

1. Open FileZilla or WinSCP
2. Connect to:
   - Host: `103.185.75.245`
   - Username: `royaldxd`
   - Password: (your password)
   - Port: 21 (FTP) or 22 (SFTP)
3. Navigate to: `/home/royaldxd/public_html/fleet-management/`
4. Upload backend folder
5. Upload .htaccess to fleet-management folder

✅ **Checkpoint**: All files uploaded to server.

---

## ⚙️ PHASE 3: Setup Node.js Application (10 minutes)

### Step 3.1: Create Node.js App

1. In cPanel, find "Software" section
2. Click "Setup Node.js App"
3. Click "Create Application" button

### Step 3.2: Configure Application

Fill in the form:

```
┌─────────────────────────────────────────┐
│ Node.js version:  [18.x ▼]             │
│                                          │
│ Application mode: [Production ▼]        │
│                                          │
│ Application root:                        │
│ public_html/fleet-management/backend    │
│                                          │
│ Application URL:                         │
│ fleet-management                         │
│                                          │
│ Application startup file:                │
│ index.js                                 │
│                                          │
│ [Create] [Cancel]                        │
└─────────────────────────────────────────┘
```

4. Click "Create"
5. Wait for application to be created

### Step 3.3: Note the Virtual Environment Command

cPanel will show something like:
```bash
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate && cd /home/royaldxd/public_html/fleet-management/backend
```

**Copy this command** - you'll need it next.

✅ **Checkpoint**: Node.js app created in cPanel.

---

## 📦 PHASE 4: Install Dependencies (5 minutes)

### Step 4.1: Open Terminal

1. In cPanel, find "Advanced" section
2. Click "Terminal"
3. A terminal window will open

### Step 4.2: Enter Node.js Environment

Paste the command from Step 3.3:
```bash
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate
```

Your prompt should change to show `(nodejs)` or similar.

### Step 4.3: Navigate to Backend

```bash
cd /home/royaldxd/public_html/fleet-management/backend
```

### Step 4.4: Install Packages

```bash
npm install --production
```

This will take 2-3 minutes. You'll see packages being installed.

### Step 4.5: Set File Permissions

```bash
chmod 600 .env
chmod 600 abrafleet-*.json
```

✅ **Checkpoint**: Dependencies installed, permissions set.

---

## 🗄️ PHASE 5: Configure MongoDB (3 minutes)

### Step 5.1: Login to MongoDB Atlas

1. Open new browser tab
2. Go to: `https://cloud.mongodb.com`
3. Login with your MongoDB account

### Step 5.2: Add Server IP to Whitelist

1. Click on your cluster
2. Click "Network Access" in left sidebar
3. Click "Add IP Address" button
4. Enter IP: `103.185.75.245`
5. Description: "cPanel Server"
6. Click "Confirm"

Wait for status to show "Active" (green).

✅ **Checkpoint**: MongoDB configured to accept connections from your server.

---

## 🚀 PHASE 6: Start Application (2 minutes)

### Step 6.1: Start the App

1. Go back to cPanel
2. Navigate to "Setup Node.js App"
3. Find your application in the list
4. Click "Start App" or "Restart App" button
5. Status should change to "Running" (green)

### Step 6.2: Check Application Log

1. Click "Open Application" or view logs
2. Look for:
```
✅ Connected to MongoDB Atlas!
✅ Email service initialized
🚀 ABRA FLEET BACKEND SERVER STARTED
📍 Server: http://localhost:3000
```

✅ **Checkpoint**: Application is running!

---

## ✅ PHASE 7: Test Backend (3 minutes)

### Test 7.1: Health Check

Open browser and visit:
```
http://103.185.75.245/fleet-management/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Abra Fleet Backend is running!",
  "timestamp": "2025-12-16T..."
}
```

### Test 7.2: Database Connection

Visit:
```
http://103.185.75.245/fleet-management/test-db
```

**Expected response:**
```json
{
  "status": "success",
  "message": "Database connection is working!"
}
```

### Test 7.3: Using curl (Optional)

In terminal:
```bash
curl http://103.185.75.245/fleet-management/api/health
```

✅ **Checkpoint**: Backend is working and accessible!

---

## 📱 PHASE 8: Build Flutter App (10 minutes)

### Step 8.1: Update Flutter Configuration

On your local machine:

1. Open `abra_fleet/.env` file
2. Update these lines:
```env
API_BASE_URL=http://103.185.75.245/fleet-management/api
WEBSOCKET_URL=ws://103.185.75.245/fleet-management
```
3. Save the file

### Step 8.2: Clean and Build

Open terminal in your project root:

```bash
cd abra_fleet

# Clean previous builds
flutter clean

# Get dependencies
flutter pub get

# Build release APK
flutter build apk --release
```

This will take 5-10 minutes.

### Step 8.3: Locate APK

Your APK is at:
```
abra_fleet/build/app/outputs/flutter-apk/app-release.apk
```

File size: ~50-80 MB

✅ **Checkpoint**: APK built successfully!

---

## 📲 PHASE 9: Test Mobile App (5 minutes)

### Step 9.1: Install APK

1. Copy `app-release.apk` to your Android phone
2. Open the file on your phone
3. Allow installation from unknown sources if prompted
4. Install the app

### Step 9.2: Test App Features

1. Open ABRA Fleet app
2. Try to register a new account
3. Login with credentials
4. Check if dashboard loads
5. Verify data appears

✅ **Checkpoint**: App works with production backend!

---

## 🎉 SUCCESS! What You've Accomplished

```
✅ Backend deployed to cPanel server
✅ Node.js application running
✅ MongoDB Atlas connected
✅ Firebase authentication configured
✅ API endpoints accessible
✅ Flutter app built and tested
✅ Mobile app connects to production backend
```

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Internet                            │
└─────────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────────┐
│         cPanel Server (103.185.75.245)              │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Nginx/Apache (Port 80/443)                  │  │
│  │  - Handles HTTP requests                     │  │
│  │  - Routes to Node.js via .htaccess          │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Node.js App (Port 3000)                     │  │
│  │  /fleet-management/backend/                  │  │
│  │  - Express.js API                            │  │
│  │  - Firebase Auth                             │  │
│  │  - WebSocket (Port 3001)                     │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────────┐
│         External Services                            │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  MongoDB     │  │  Firebase    │                │
│  │  Atlas       │  │  Auth        │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────────┐
│         Mobile Devices                               │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Android     │  │  iOS         │                │
│  │  App (APK)   │  │  App         │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Updating Your Deployment

When you make changes to your code:

### Update Backend:
```bash
# 1. Upload new files via File Manager or FTP
# 2. In cPanel Terminal:
cd /home/royaldxd/public_html/fleet-management/backend
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate
npm install --production

# 3. Restart app in cPanel: Setup Node.js App > Restart
```

### Update Mobile App:
```bash
# 1. Make your code changes
# 2. Build new APK:
cd abra_fleet
flutter clean
flutter pub get
flutter build apk --release

# 3. Distribute new APK to users
```

---

## 🆘 Common Issues & Solutions

### ❌ "Application failed to start"
**Solution:**
1. Check logs in cPanel
2. Verify .env file exists
3. Check Node.js version is 18.x
4. Reinstall dependencies

### ❌ "Cannot connect to MongoDB"
**Solution:**
1. Check IP whitelist: 103.185.75.245
2. Verify MONGODB_URI in .env
3. Test from MongoDB Atlas dashboard

### ❌ "API returns 404"
**Solution:**
1. Check .htaccess file exists
2. Verify app is running
3. Check URL path is correct

### ❌ "App can't connect to backend"
**Solution:**
1. Verify API_BASE_URL in Flutter .env
2. Rebuild APK after changing .env
3. Test API in browser first

---

## 📞 Need More Help?

- **Full Documentation**: CPANEL_DEPLOYMENT_GUIDE.md
- **Quick Reference**: CPANEL_QUICK_REFERENCE.md
- **Checklist**: cpanel-deploy-checklist.md
- **Automated Script**: deploy-to-cpanel.sh / deploy-to-cpanel.bat

---

## 🎯 Next Steps

1. **Setup SSL/HTTPS** (Recommended)
   - Use cPanel AutoSSL
   - Update app URLs to https://

2. **Configure Domain Name**
   - Point domain to 103.185.75.245
   - Update DNS records
   - Update app configuration

3. **Setup Monitoring**
   - Monitor application logs
   - Setup uptime monitoring
   - Configure email alerts

4. **Distribute App**
   - Share APK with users
   - Or upload to Google Play Store

---

**Congratulations! Your ABRA Fleet application is now live! 🎉**

**Deployment Date**: December 16, 2025
**Server**: 103.185.75.245
**Status**: ✅ Production Ready
