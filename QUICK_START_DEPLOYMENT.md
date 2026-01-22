# 🚀 Quick Start - Deploy to abra-fleet-management.com

## ⚡ 5-Minute Overview

```
Your Project → cPanel Server → Live Website
   (Local)      (103.185.75.245)  (abra-fleet-management.com)
```

---

## 📦 What You're Deploying

1. **Backend** (Node.js + Express + MongoDB + Firebase)
2. **Frontend Web** (Flutter Web)
3. **Mobile App** (Flutter Android APK)

---

## 🎯 Step-by-Step (Simplified)

### Step 1: Upload Backend (5 minutes)

**Using FileZilla or WinSCP:**
```
Connect to: 103.185.75.245
Username: royaldxd
Upload: abra_fleet_backend folder
To: /home/royaldxd/public_html/abra-fleet-management/backend/
```

### Step 2: Setup Node.js (3 minutes)

**In cPanel (https://103.185.75.245:2083):**
1. Find "Setup Node.js App"
2. Click "Create Application"
3. Fill in:
   - Node version: 18.x
   - App root: `public_html/abra-fleet-management/backend`
   - Startup file: `index.js`
4. Click "Create"

### Step 3: Install Packages (2 minutes)

**In cPanel Terminal:**
```bash
source /home/royaldxd/nodevenv/public_html/abra-fleet-management/backend/18/bin/activate
cd /home/royaldxd/public_html/abra-fleet-management/backend
npm install --production
```

### Step 4: Create .env File (2 minutes)

**In cPanel File Manager:**
1. Go to backend folder
2. Create file: `.env`
3. Copy from: `.env.abra-fleet-management.com`
4. Generate JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
5. Replace `REPLACE_WITH_STRONG_RANDOM_SECRET_HERE`

### Step 5: Configure MongoDB (1 minute)

**In MongoDB Atlas:**
1. Go to "Network Access"
2. Add IP: `103.185.75.245`
3. Click "Confirm"

### Step 6: Start Backend (1 minute)

**In cPanel:**
1. Go to "Setup Node.js App"
2. Click "Start App"
3. Verify status: "Running"

### Step 7: Test Backend (30 seconds)

**Open in browser:**
```
https://abra-fleet-management.com/api/health
```

**Should see:**
```json
{"status":"ok","message":"Abra Fleet Backend is running!"}
```

✅ **Backend is live!**

---

## 🌐 Deploy Web App (Optional)

### Step 1: Update Config (1 minute)

**Edit `abra_fleet/.env`:**
```env
API_BASE_URL=https://abra-fleet-management.com/api
WEBSOCKET_URL=wss://abra-fleet-management.com
```

### Step 2: Build (2 minutes)

```bash
cd abra_fleet
flutter clean
flutter pub get
flutter build web --release
```

### Step 3: Upload (2 minutes)

**Upload `build/web/` folder to:**
```
/home/royaldxd/public_html/abra-fleet-management/web/
```

### Step 4: Test

**Open:**
```
https://abra-fleet-management.com/web/
```

✅ **Web app is live!**

---

## 📱 Build Mobile App

### Step 1: Update Config (1 minute)

**Edit `abra_fleet/.env`:**
```env
API_BASE_URL=https://abra-fleet-management.com/api
WEBSOCKET_URL=wss://abra-fleet-management.com
```

### Step 2: Build APK (3 minutes)

```bash
cd abra_fleet
flutter clean
flutter pub get
flutter build apk --release
```

### Step 3: Get APK

**Location:**
```
abra_fleet/build/app/outputs/flutter-apk/app-release.apk
```

### Step 4: Distribute

- Email to users
- Upload to server
- Share via Google Drive
- Publish to Play Store

✅ **Mobile app ready!**

---

## 🔧 Helper Scripts

### Windows Users

**Run this script:**
```bash
deploy-abra-fleet-management.bat
```

**Menu options:**
1. Generate JWT Secret
2. Build Flutter Web
3. Build Android APK
4. Show Upload Instructions
5. Test Backend Connection
6. Open cPanel
7. Open Deployment Guide

---

## 📋 Quick Checklist

**Backend:**
- [ ] Upload backend files
- [ ] Setup Node.js app in cPanel
- [ ] Install npm packages
- [ ] Create .env file
- [ ] Add MongoDB IP whitelist
- [ ] Start application
- [ ] Test health endpoint

**Web App:**
- [ ] Update .env config
- [ ] Build Flutter web
- [ ] Upload to server
- [ ] Test in browser

**Mobile App:**
- [ ] Update .env config
- [ ] Build APK
- [ ] Test on device
- [ ] Distribute to users

---

## 🆘 Common Issues

### Backend won't start
```bash
# Check logs in cPanel: Setup Node.js App > View Logs
# Common fix: npm install --production
```

### Can't connect to MongoDB
```bash
# Add server IP to MongoDB Atlas whitelist: 103.185.75.245
```

### API returns 404
```bash
# Create .htaccess file in abra-fleet-management folder
# Copy from: .htaccess.cpanel
```

### CORS errors
```bash
# Check .htaccess CORS headers
# Verify backend CORS configuration
```

---

## 📞 Important URLs

| What | URL |
|------|-----|
| **cPanel** | https://103.185.75.245:2083 |
| **Website** | https://abra-fleet-management.com/ |
| **API** | https://abra-fleet-management.com/api |
| **Health** | https://abra-fleet-management.com/api/health |
| **Web App** | https://abra-fleet-management.com/web/ |

---

## 📚 Detailed Guides

For more details, see:
- **DEPLOY_TO_ABRA_FLEET_MANAGEMENT_COM.md** - Complete guide
- **DEPLOYMENT_CHECKLIST_ABRA_FLEET_MANAGEMENT.md** - Detailed checklist
- **CPANEL_DEPLOYMENT_GUIDE.md** - cPanel specific guide

---

## ✅ Success!

Your deployment is complete when:
- ✅ Backend health check returns OK
- ✅ Web app loads in browser
- ✅ Mobile app connects to backend
- ✅ Users can login and use features

---

**Need Help?**
1. Check application logs in cPanel
2. Review browser console for errors
3. Test API with curl or Postman
4. Verify all environment variables
5. Check MongoDB connection
6. Review deployment guides

---

**Total Time**: ~20-30 minutes
**Difficulty**: Beginner-friendly
**Support**: See detailed guides for troubleshooting
