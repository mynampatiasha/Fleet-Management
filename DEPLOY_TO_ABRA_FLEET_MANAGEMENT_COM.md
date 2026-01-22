# 🚀 Deploy to https://abra-fleet-management.com/

## Server Information
- **Domain**: abra-fleet-management.com
- **Server IP**: 103.185.75.245
- **cPanel**: https://103.185.75.245:2083
- **User**: royaldxd
- **Home**: /home/royaldxd

---

## 🎯 Quick Deployment Steps

### 1️⃣ Upload Backend to cPanel

**Using FileZilla/WinSCP:**
1. Connect to: `103.185.75.245`
2. Username: `royaldxd`
3. Protocol: SFTP (Port 22) or FTP (Port 21)
4. Upload `abra_fleet_backend` folder to:
   ```
   /home/royaldxd/public_html/abra-fleet-management/backend/
   ```

**Files to upload:**
- All files from `abra_fleet_backend` folder
- Firebase service account key: `abrafleet-cec94-firebase-adminsdk-*.json`

---

### 2️⃣ Setup Node.js in cPanel

1. Login: https://103.185.75.245:2083
2. Find: **"Setup Node.js App"** (under Software section)
3. Click: **"Create Application"**
4. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `public_html/abra-fleet-management/backend`
   - **Application URL**: Leave blank or use `abra-fleet-management`
   - **Application startup file**: `index.js`
5. Click: **"Create"**

---

### 3️⃣ Install Dependencies

**Via cPanel Terminal:**
```bash
# Enter Node.js virtual environment (copy command from cPanel)
source /home/royaldxd/nodevenv/public_html/abra-fleet-management/backend/18/bin/activate

# Navigate to backend
cd /home/royaldxd/public_html/abra-fleet-management/backend

# Install packages
npm install --production
```

---

### 4️⃣ Create .env File

**In cPanel File Manager:**
1. Navigate to: `/home/royaldxd/public_html/abra-fleet-management/backend/`
2. Create new file: `.env`
3. Add this content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=3000
NODE_ENV=production

# Firebase Configuration
FIREBASE_PROJECT_ID=abrafleet-cec94

# JWT Configuration - GENERATE NEW SECRET!
JWT_SECRET=REPLACE_WITH_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=7d

# WebSocket Configuration
WEBSOCKET_PORT=3001

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=vwng vlfv immf udam
```

**Generate JWT Secret:**
```bash
# Run in cPanel Terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy output and replace `REPLACE_WITH_RANDOM_SECRET_HERE`

---

### 5️⃣ Configure MongoDB Atlas

1. Go to: https://cloud.mongodb.com
2. Navigate to: **Network Access**
3. Click: **"Add IP Address"**
4. Add: `103.185.75.245`
5. Click: **"Confirm"**

---

### 6️⃣ Create .htaccess File

**In cPanel File Manager:**
1. Navigate to: `/home/royaldxd/public_html/abra-fleet-management/`
2. Create file: `.htaccess`
3. Add this content:

```apache
# Enable RewriteEngine
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]

# Proxy WebSocket connections
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^(.*)$ ws://localhost:3001/$1 [P,L]

# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, Accept, X-Requested-With"
Header always set Access-Control-Max-Age "3600"

# Handle preflight OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Security Headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"

# Increase upload size
php_value upload_max_filesize 50M
php_value post_max_size 50M

# Prevent directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\.env$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

### 7️⃣ Start Backend Application

**In cPanel:**
1. Go to: **"Setup Node.js App"**
2. Find your application
3. Click: **"Start App"** or **"Restart App"**
4. Status should show: **"Running"**

---

### 8️⃣ Test Backend

**Open in browser:**
```
https://abra-fleet-management.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Abra Fleet Backend is running!",
  "timestamp": "2025-12-17T..."
}
```

---

## 📱 Deploy Flutter Web App

### 1️⃣ Update Flutter Configuration

**Edit `abra_fleet/.env`:**
```env
API_BASE_URL=https://abra-fleet-management.com/api
WEBSOCKET_URL=wss://abra-fleet-management.com
FIREBASE_PROJECT_ID=abrafleet-cec94
```

**Edit `abra_fleet/lib/app/config/api_config.dart`:**
```dart
class ApiConfig {
  static const String baseUrl = 'https://abra-fleet-management.com/api';
  static const String websocketUrl = 'wss://abra-fleet-management.com';
  // ... rest of config
}
```

### 2️⃣ Build Flutter Web

```bash
cd abra_fleet

# Clean previous builds
flutter clean
flutter pub get

# Build for web
flutter build web --release
```

### 3️⃣ Upload Web Build

**Using FileZilla/WinSCP:**
1. Upload entire `abra_fleet/build/web/` folder to:
   ```
   /home/royaldxd/public_html/abra-fleet-management/web/
   ```

### 4️⃣ Access Web App

**URL:**
```
https://abra-fleet-management.com/web/
```

Or configure as root:
```
https://abra-fleet-management.com/
```

---

## 📱 Build Mobile App (Android)

### 1️⃣ Update Configuration

**Edit `abra_fleet/.env`:**
```env
API_BASE_URL=https://abra-fleet-management.com/api
WEBSOCKET_URL=wss://abra-fleet-management.com
```

### 2️⃣ Build APK

```bash
cd abra_fleet

# Clean
flutter clean
flutter pub get

# Build release APK
flutter build apk --release
```

**APK Location:**
```
abra_fleet/build/app/outputs/flutter-apk/app-release.apk
```

### 3️⃣ Distribute APK

**Option A: Upload to Server**
```bash
# Upload APK to server
scp build/app/outputs/flutter-apk/app-release.apk royaldxd@103.185.75.245:/home/royaldxd/public_html/abra-fleet-management/downloads/
```

**Download URL:**
```
https://abra-fleet-management.com/downloads/app-release.apk
```

**Option B: Share Directly**
- Email APK to users
- Upload to Google Drive
- Publish to Google Play Store

---

## 🔒 Setup SSL/HTTPS (Important!)

### Using cPanel AutoSSL

1. Login to cPanel: https://103.185.75.245:2083
2. Search for: **"SSL/TLS Status"**
3. Find domain: `abra-fleet-management.com`
4. Click: **"Run AutoSSL"**
5. Wait for certificate to be issued (usually 5-10 minutes)

### Verify SSL

**Test URL:**
```
https://abra-fleet-management.com/api/health
```

Should work with HTTPS (secure padlock icon)

---

## 🔧 Troubleshooting

### Backend Not Starting

**Check logs in cPanel:**
1. Go to: "Setup Node.js App"
2. Click on your app
3. View: "Application Log"

**Common issues:**
- Missing dependencies: Run `npm install`
- Wrong Node.js version: Use 18.x or higher
- Missing .env file: Verify it exists
- Firebase key missing: Upload service account key

### Cannot Connect to MongoDB

**Solutions:**
1. Add server IP to MongoDB Atlas whitelist: `103.185.75.245`
2. Verify MONGODB_URI in .env
3. Check MongoDB Atlas is not paused

### API Returns 404

**Solutions:**
1. Verify .htaccess file exists
2. Check application is running in cPanel
3. Verify RewriteEngine is enabled

### CORS Errors

**Solutions:**
1. Check .htaccess CORS headers
2. Verify backend CORS configuration
3. Clear browser cache

---

## 📋 Deployment Checklist

### Backend
- [ ] Upload backend files to server
- [ ] Create Node.js app in cPanel
- [ ] Install npm dependencies
- [ ] Create .env file with all variables
- [ ] Generate and set JWT_SECRET
- [ ] Upload Firebase service account key
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Create .htaccess file
- [ ] Start application in cPanel
- [ ] Test API health endpoint

### Frontend (Web)
- [ ] Update API URLs in .env
- [ ] Update api_config.dart
- [ ] Build Flutter web
- [ ] Upload web build to server
- [ ] Test web app access

### Mobile App
- [ ] Update API URLs in .env
- [ ] Build release APK
- [ ] Test APK on device
- [ ] Distribute to users

### Security
- [ ] Setup SSL/HTTPS
- [ ] Secure .env file
- [ ] Set Firebase key permissions
- [ ] Configure rate limiting
- [ ] Enable security headers

---

## 🌐 Important URLs

| Service | URL |
|---------|-----|
| **cPanel** | https://103.185.75.245:2083 |
| **Website** | https://abra-fleet-management.com/ |
| **API** | https://abra-fleet-management.com/api |
| **Health Check** | https://abra-fleet-management.com/api/health |
| **Web App** | https://abra-fleet-management.com/web/ |
| **APK Download** | https://abra-fleet-management.com/downloads/app-release.apk |
| **MongoDB Atlas** | https://cloud.mongodb.com |
| **Firebase Console** | https://console.firebase.google.com |

---

## 🆘 Need Help?

### View Logs
```bash
# SSH into server
ssh royaldxd@103.185.75.245

# View application logs
tail -f /home/royaldxd/logs/abra-fleet-management-error.log
```

### Restart Application
1. cPanel → "Setup Node.js App"
2. Click "Restart" button

### Update Code
```bash
# SSH into server
cd /home/royaldxd/public_html/abra-fleet-management/backend

# Pull changes (if using Git)
git pull

# Or upload new files via FTP

# Install dependencies
source /home/royaldxd/nodevenv/public_html/abra-fleet-management/backend/18/bin/activate
npm install --production

# Restart in cPanel
```

---

## ✅ Success Indicators

Your deployment is successful when:
- ✅ https://abra-fleet-management.com/api/health returns `{"status":"ok"}`
- ✅ Web app loads at https://abra-fleet-management.com/web/
- ✅ Mobile app connects to backend
- ✅ Users can login and access features
- ✅ SSL certificate is active (padlock icon)
- ✅ No CORS errors in browser console

---

**Deployment Guide Version**: 1.0
**Last Updated**: December 17, 2025
**Domain**: abra-fleet-management.com
