# ✅ cPanel Deployment Checklist

## Server: 103.185.75.245

---

## Pre-Deployment (Do First)

- [ ] **Access cPanel**
  - URL: https://103.185.75.245:2083
  - Login with credentials
  
- [ ] **Test SSH Access** (if available)
  ```bash
  ssh royaldxd@103.185.75.245
  ```

- [ ] **Prepare Files Locally**
  - [ ] Backend code ready (abra_fleet_backend folder)
  - [ ] Firebase service account key file
  - [ ] .env file configured
  - [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Backend Deployment Steps

### 1. Upload Files
- [ ] Create folder: `/home/royaldxd/public_html/fleet-management/backend/`
- [ ] Upload all files from `abra_fleet_backend` folder
- [ ] Upload Firebase service account JSON file
- [ ] Create `.env` file with production settings

### 2. Setup Node.js in cPanel
- [ ] Go to cPanel > "Setup Node.js App"
- [ ] Click "Create Application"
- [ ] Set Node.js version: 18.x or higher
- [ ] Set Application root: `public_html/fleet-management/backend`
- [ ] Set Startup file: `index.js`
- [ ] Set Mode: Production
- [ ] Click "Create"

### 3. Install Dependencies
- [ ] Open cPanel Terminal or SSH
- [ ] Enter Node.js environment:
  ```bash
  source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate
  ```
- [ ] Navigate to backend:
  ```bash
  cd /home/royaldxd/public_html/fleet-management/backend
  ```
- [ ] Install packages:
  ```bash
  npm install --production
  ```

### 4. Configure MongoDB
- [ ] Login to MongoDB Atlas
- [ ] Go to Network Access
- [ ] Add IP: **103.185.75.245**
- [ ] Confirm and save

### 5. Configure .htaccess
- [ ] Create `.htaccess` in `/home/royaldxd/public_html/fleet-management/`
- [ ] Add proxy rules for API and WebSocket
- [ ] Add CORS headers

### 6. Start Application
- [ ] In cPanel > "Setup Node.js App"
- [ ] Click "Start App" or "Restart App"
- [ ] Verify status shows "Running"

### 7. Test Backend
- [ ] Test health endpoint:
  ```bash
  curl http://103.185.75.245/fleet-management/api/health
  ```
- [ ] Expected: `{"status":"ok",...}`
- [ ] Test in browser: http://103.185.75.245/fleet-management/api/health

---

## Flutter App Deployment

### 1. Update Configuration
- [ ] Edit `abra_fleet/.env`
- [ ] Set API_BASE_URL: `http://103.185.75.245/fleet-management/api`
- [ ] Set WEBSOCKET_URL: `ws://103.185.75.245/fleet-management`

### 2. Build Android APK
- [ ] Run: `flutter clean`
- [ ] Run: `flutter pub get`
- [ ] Run: `flutter build apk --release`
- [ ] Locate APK: `build/app/outputs/flutter-apk/app-release.apk`

### 3. Distribute App
- [ ] Upload APK to server (optional)
- [ ] Share APK with users
- [ ] Or upload to Google Play Store

---

## Post-Deployment Verification

### Backend Tests
- [ ] Health endpoint responds: `/api/health`
- [ ] Database connection works: `/test-db`
- [ ] Authentication works: `/api/test-auth`
- [ ] Vehicles endpoint: `/api/vehicles`
- [ ] Trips endpoint: `/api/trips`

### App Tests
- [ ] Install APK on Android device
- [ ] App opens successfully
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads
- [ ] API calls succeed
- [ ] Real-time updates work

### Security Checks
- [ ] JWT_SECRET is strong and unique
- [ ] Firebase key permissions: `chmod 600`
- [ ] .env file not publicly accessible
- [ ] MongoDB IP whitelist configured
- [ ] CORS properly configured

---

## Optional Enhancements

- [ ] **Setup SSL/HTTPS**
  - Use cPanel AutoSSL or Let's Encrypt
  - Update app URLs to https://

- [ ] **Configure Domain**
  - Point domain to server IP
  - Update DNS records
  - Update app configuration

- [ ] **Setup Monitoring**
  - Configure log rotation
  - Setup uptime monitoring
  - Configure email alerts

- [ ] **Automated Backups**
  - Database backups
  - Code backups
  - Configuration backups

---

## Troubleshooting Quick Fixes

### App won't start
```bash
# Check logs
tail -f /home/royaldxd/logs/fleet-management-error.log

# Restart app
# Via cPanel: Setup Node.js App > Restart
```

### MongoDB connection fails
```bash
# Verify IP whitelist: 103.185.75.245
# Check connection string in .env
```

### API returns 404
```bash
# Check .htaccess exists
# Verify app is running in cPanel
# Check application URL path
```

### CORS errors
```bash
# Update CORS in index.js
# Check .htaccess CORS headers
# Restart application
```

---

## Important URLs

- **cPanel**: https://103.185.75.245:2083
- **API Base**: http://103.185.75.245/fleet-management/api
- **Health Check**: http://103.185.75.245/fleet-management/api/health
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Firebase Console**: https://console.firebase.google.com

---

## Quick Commands

```bash
# SSH Login
ssh royaldxd@103.185.75.245

# Enter Node environment
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate

# Go to backend
cd /home/royaldxd/public_html/fleet-management/backend

# Install dependencies
npm install --production

# View logs
tail -f /home/royaldxd/logs/fleet-management-error.log

# Test API
curl http://103.185.75.245/fleet-management/api/health
```

---

## Status Tracking

**Deployment Started**: _______________
**Backend Deployed**: _______________
**App Built**: _______________
**Testing Complete**: _______________
**Production Live**: _______________

---

**Notes:**
_______________________________________
_______________________________________
_______________________________________
