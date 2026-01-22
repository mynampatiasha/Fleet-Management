# 🚀 cPanel Deployment - Quick Reference Card

## 📍 Server Information
```
Server IP:      103.185.75.245
cPanel URL:     https://103.185.75.245:2083
Username:       royaldxd
Home Dir:       /home/royaldxd
Backend Path:   /home/royaldxd/public_html/fleet-management/backend
```

## 🔗 Important URLs
```
cPanel:         https://103.185.75.245:2083
API Base:       http://103.185.75.245/fleet-management/api
Health Check:   http://103.185.75.245/fleet-management/api/health
Test DB:        http://103.185.75.245/fleet-management/test-db
Test Auth:      http://103.185.75.245/fleet-management/api/test-auth
MongoDB Atlas:  https://cloud.mongodb.com
Firebase:       https://console.firebase.google.com
```

## 📦 Quick Deployment (5 Steps)

### 1️⃣ Upload Files
```bash
# Via SSH/SFTP to: /home/royaldxd/public_html/fleet-management/backend/
- All files from abra_fleet_backend folder
- Firebase service account JSON
- .env file (from .env.cpanel.template)
- .htaccess file (from .htaccess.cpanel)
```

### 2️⃣ Setup Node.js in cPanel
```
1. Login to cPanel
2. Go to "Setup Node.js App"
3. Click "Create Application"
4. Settings:
   - Node version: 18.x
   - App root: public_html/fleet-management/backend
   - Startup file: index.js
   - Mode: Production
5. Click "Create"
```

### 3️⃣ Install Dependencies
```bash
# SSH or cPanel Terminal
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate
cd /home/royaldxd/public_html/fleet-management/backend
npm install --production
```

### 4️⃣ Configure MongoDB
```
1. Go to MongoDB Atlas
2. Network Access > Add IP Address
3. Add: 103.185.75.245
4. Confirm
```

### 5️⃣ Start & Test
```bash
# In cPanel: Setup Node.js App > Start/Restart

# Test:
curl http://103.185.75.245/fleet-management/api/health
```

## 🔧 Essential Commands

### SSH Login
```bash
ssh royaldxd@103.185.75.245
```

### Enter Node Environment
```bash
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate
```

### Navigate to Backend
```bash
cd /home/royaldxd/public_html/fleet-management/backend
```

### Install Dependencies
```bash
npm install --production
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### View Logs
```bash
tail -f /home/royaldxd/logs/fleet-management-error.log
```

### Test API
```bash
curl http://103.185.75.245/fleet-management/api/health
```

### Set File Permissions
```bash
chmod 600 .env
chmod 600 abrafleet-*.json
```

## 📱 Flutter App Build

### Update Configuration
```bash
# Edit abra_fleet/.env
API_BASE_URL=http://103.185.75.245/fleet-management/api
WEBSOCKET_URL=ws://103.185.75.245/fleet-management
```

### Build APK
```bash
cd abra_fleet
flutter clean
flutter pub get
flutter build apk --release
```

### APK Location
```
build/app/outputs/flutter-apk/app-release.apk
```

## 🔍 Troubleshooting

### App Won't Start
```bash
# Check logs
tail -f /home/royaldxd/logs/fleet-management-error.log

# Restart in cPanel
Setup Node.js App > Restart
```

### MongoDB Connection Failed
```
1. Check IP whitelist: 103.185.75.245
2. Verify MONGODB_URI in .env
3. Test connection string
```

### API Returns 404
```
1. Check .htaccess exists
2. Verify app is running
3. Check application URL path
```

### CORS Errors
```
1. Update CORS in index.js
2. Check .htaccess CORS headers
3. Restart application
```

## 📋 .env File Template
```env
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=abrafleet-cec94
JWT_SECRET=GENERATE_USING_COMMAND_ABOVE
JWT_EXPIRES_IN=7d
WEBSOCKET_PORT=3001
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=vwng vlfv immf udam
```

## 🔐 Security Checklist
- [ ] Strong JWT_SECRET generated
- [ ] .env file permissions: 600
- [ ] Firebase key permissions: 600
- [ ] MongoDB IP whitelist configured
- [ ] .htaccess protects sensitive files
- [ ] SSL/HTTPS enabled (optional)

## 📞 Support Resources
- **Full Guide**: CPANEL_DEPLOYMENT_GUIDE.md
- **Checklist**: cpanel-deploy-checklist.md
- **Deploy Script**: deploy-to-cpanel.sh (Linux/Mac)
- **Deploy Script**: deploy-to-cpanel.bat (Windows)

## ⚡ Quick Test Sequence
```bash
# 1. Health check
curl http://103.185.75.245/fleet-management/api/health

# 2. Database test
curl http://103.185.75.245/fleet-management/test-db

# 3. Auth test (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://103.185.75.245/fleet-management/api/test-auth

# 4. Vehicles endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://103.185.75.245/fleet-management/api/vehicles
```

## 🎯 Success Indicators
✅ Health endpoint returns `{"status":"ok"}`
✅ Database test returns success
✅ App status shows "Running" in cPanel
✅ Flutter app connects successfully
✅ User can register/login
✅ Dashboard loads with data

---

**Print this page for quick reference during deployment!**

**Last Updated**: December 16, 2025
