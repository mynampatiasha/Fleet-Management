# 🚀 ABRA Fleet - cPanel Deployment Guide

## Server Details
- **Server IP**: 103.185.75.245
- **cPanel Port**: 2083 (HTTPS)
- **Home Directory**: /home/royaldxd
- **Web Directory**: /home/royaldxd/public_html/fleet-management/
- **cPanel URL**: https://103.185.75.245:2083

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] cPanel login credentials
- [ ] SSH access (if available)
- [ ] MongoDB Atlas connection string (already configured)
- [ ] Firebase service account key file
- [ ] Backend code (abra_fleet_backend folder)
- [ ] Flutter project (abra_fleet folder)

---

## Part 1: Backend Deployment on cPanel

### Step 1: Access Your Server

**Option A: Using cPanel File Manager**
1. Go to: https://103.185.75.245:2083
2. Login with your credentials
3. Navigate to "File Manager"
4. Go to `/home/royaldxd/public_html/fleet-management/`

**Option B: Using SSH (Recommended)**
```bash
ssh royaldxd@103.185.75.245
cd /home/royaldxd/public_html/fleet-management/
```

**Option C: Using FTP/SFTP**
- Use FileZilla or WinSCP
- Host: 103.185.75.245
- Username: royaldxd
- Port: 22 (SFTP) or 21 (FTP)

---

### Step 2: Upload Backend Files

**Using File Manager:**
1. In cPanel File Manager, navigate to `/home/royaldxd/public_html/fleet-management/`
2. Create a new folder called `backend`
3. Upload all files from your `abra_fleet_backend` folder
4. Extract if you uploaded as ZIP

**Using SSH/SFTP:**
```bash
# From your local machine
cd /path/to/your/project
scp -r abra_fleet_backend royaldxd@103.185.75.245:/home/royaldxd/public_html/fleet-management/backend/
```

**Using Git (if available):**
```bash
# On the server via SSH
cd /home/royaldxd/public_html/fleet-management/
git clone <your-repository-url> backend
cd backend
```

---

### Step 3: Setup Node.js Application in cPanel

1. **Login to cPanel** (https://103.185.75.245:2083)

2. **Navigate to "Setup Node.js App"**
   - Look for "Software" section
   - Click "Setup Node.js App"

3. **Create New Application**
   - Click "Create Application"
   - **Node.js version**: Select 18.x or higher
   - **Application mode**: Production
   - **Application root**: `public_html/fleet-management/backend`
   - **Application URL**: `fleet-management` (or leave blank for root)
   - **Application startup file**: `index.js`
   - **Passenger log file**: Leave default
   - Click "Create"

4. **Note the command to enter virtual environment**
   - cPanel will show something like:
   ```bash
   source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate && cd /home/royaldxd/public_html/fleet-management/backend
   ```

---

### Step 4: Install Dependencies

**Via SSH:**
```bash
# SSH into your server
ssh royaldxd@103.185.75.245

# Enter Node.js virtual environment
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate

# Navigate to backend directory
cd /home/royaldxd/public_html/fleet-management/backend

# Install dependencies
npm install --production
```

**Via cPanel Terminal:**
1. In cPanel, go to "Terminal"
2. Run the same commands as above

---

### Step 5: Configure Environment Variables

**Create .env file:**

```bash
# Via SSH
cd /home/royaldxd/public_html/fleet-management/backend
nano .env
```

**Or use cPanel File Manager:**
1. Navigate to backend folder
2. Create new file named `.env`
3. Edit and paste the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=3000
NODE_ENV=production

# Firebase Configuration
FIREBASE_PROJECT_ID=abrafleet-cec94

# JWT Configuration (GENERATE A NEW SECRET!)
JWT_SECRET=REPLACE_WITH_STRONG_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=7d

# WebSocket Configuration
WEBSOCKET_PORT=3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=vwng vlfv immf udam
```

**Generate Strong JWT Secret:**
```bash
# Run this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and replace `REPLACE_WITH_STRONG_RANDOM_SECRET_HERE` in your .env file.

---

### Step 6: Upload Firebase Service Account Key

1. **Locate your Firebase key file** on your local machine
   - File name: `abrafleet-cec94-firebase-adminsdk-xxxxx.json`

2. **Upload to server:**

**Via cPanel File Manager:**
- Upload to `/home/royaldxd/public_html/fleet-management/backend/`

**Via SSH/SFTP:**
```bash
# From your local machine
scp abrafleet-cec94-firebase-adminsdk-*.json royaldxd@103.185.75.245:/home/royaldxd/public_html/fleet-management/backend/
```

3. **Set proper permissions:**
```bash
# Via SSH
cd /home/royaldxd/public_html/fleet-management/backend
chmod 600 abrafleet-*.json
```

---

### Step 7: Configure MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Login to your account
3. Navigate to your cluster
4. Click "Network Access" in the left sidebar
5. Click "Add IP Address"
6. Add your server IP: **103.185.75.245**
7. Click "Confirm"

---

### Step 8: Start the Application

**Via cPanel:**
1. Go to "Setup Node.js App"
2. Find your application
3. Click "Start App" or "Restart App"
4. Check status - should show "Running"

**Via SSH:**
```bash
# Enter virtual environment
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate

# Navigate to backend
cd /home/royaldxd/public_html/fleet-management/backend

# Start with PM2 (if available) or node
pm2 start index.js --name abra-fleet
# OR
node index.js
```

---

### Step 9: Configure .htaccess for API Routing

Create `.htaccess` file in `/home/royaldxd/public_html/fleet-management/`:

```apache
# Enable RewriteEngine
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Proxy WebSocket connections
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^(.*)$ ws://localhost:3001/$1 [P,L]

# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Handle OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

---

### Step 10: Test Backend Deployment

**Test health endpoint:**
```bash
curl http://103.185.75.245/fleet-management/api/health
```

**Or visit in browser:**
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

---

## Part 2: Flutter Web Deployment (Optional)

### Step 1: Build Flutter Web

```bash
# On your local machine
cd abra_fleet

# Update .env with production API URL
nano .env
```

Update API URL:
```env
API_BASE_URL=http://103.185.75.245/fleet-management/api
WEBSOCKET_URL=ws://103.185.75.245/fleet-management
```

```bash
# Build for web
flutter build web --release
```

### Step 2: Upload Web Build

**Upload the entire `build/web` folder to:**
```
/home/royaldxd/public_html/fleet-management/web/
```

**Access your web app at:**
```
http://103.185.75.245/fleet-management/web/
```

---

## Part 3: Flutter Mobile App Deployment

### Step 1: Update API Configuration

```bash
# On your local machine
cd abra_fleet
nano .env
```

Update with production URL:
```env
API_BASE_URL=http://103.185.75.245/fleet-management/api
WEBSOCKET_URL=ws://103.185.75.245/fleet-management
```

### Step 2: Build Android APK

```bash
cd abra_fleet

# Clean previous builds
flutter clean
flutter pub get

# Build release APK
flutter build apk --release
```

**APK location:**
```
build/app/outputs/flutter-apk/app-release.apk
```

### Step 3: Distribute APK

**Option A: Direct Download**
1. Upload APK to your server:
```bash
scp build/app/outputs/flutter-apk/app-release.apk royaldxd@103.185.75.245:/home/royaldxd/public_html/fleet-management/downloads/
```

2. Share download link:
```
http://103.185.75.245/fleet-management/downloads/app-release.apk
```

**Option B: Share via Email/Drive**
- Email the APK file to users
- Upload to Google Drive and share link

**Option C: Google Play Store**
- Build App Bundle: `flutter build appbundle --release`
- Upload to Google Play Console

---

## Part 4: SSL/HTTPS Setup (Recommended)

### Option 1: Using cPanel AutoSSL

1. Login to cPanel
2. Go to "SSL/TLS Status"
3. Select your domain
4. Click "Run AutoSSL"
5. Wait for certificate to be issued

### Option 2: Using Let's Encrypt (via SSH)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --webroot -w /home/royaldxd/public_html/fleet-management -d yourdomain.com

# Update .htaccess to force HTTPS
```

After SSL is enabled, update your Flutter app's .env:
```env
API_BASE_URL=https://yourdomain.com/fleet-management/api
WEBSOCKET_URL=wss://yourdomain.com/fleet-management
```

---

## Part 5: Monitoring & Maintenance

### View Application Logs

**Via cPanel:**
1. Go to "Setup Node.js App"
2. Click on your application
3. View "Application Log"

**Via SSH:**
```bash
# View Node.js logs
tail -f /home/royaldxd/logs/fleet-management-error.log

# View access logs
tail -f /home/royaldxd/logs/fleet-management-access.log
```

### Restart Application

**Via cPanel:**
1. Go to "Setup Node.js App"
2. Click "Restart" button

**Via SSH:**
```bash
# If using PM2
pm2 restart abra-fleet

# Or restart via cPanel's restart button
```

### Update Application

```bash
# SSH into server
ssh royaldxd@103.185.75.245

# Navigate to backend
cd /home/royaldxd/public_html/fleet-management/backend

# Pull latest changes (if using Git)
git pull

# Or upload new files via FTP/File Manager

# Install new dependencies
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate
npm install --production

# Restart application
# Via cPanel: Setup Node.js App > Restart
```

---

## Troubleshooting

### Issue: Application won't start

**Check logs:**
```bash
tail -f /home/royaldxd/logs/fleet-management-error.log
```

**Common causes:**
- Missing dependencies: Run `npm install`
- Wrong Node.js version: Check cPanel Node.js app settings
- Port already in use: Change PORT in .env
- Missing .env file: Verify .env exists and has correct values

### Issue: Cannot connect to MongoDB

**Solutions:**
1. Verify MongoDB Atlas IP whitelist includes: 103.185.75.245
2. Check MONGODB_URI in .env file
3. Test connection:
```bash
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Issue: Firebase authentication fails

**Solutions:**
1. Verify Firebase service account key is uploaded
2. Check file permissions: `chmod 600 abrafleet-*.json`
3. Verify FIREBASE_PROJECT_ID in .env matches your project

### Issue: API returns 404

**Solutions:**
1. Check .htaccess file exists and is configured correctly
2. Verify application is running in cPanel
3. Check application URL path matches your requests

### Issue: CORS errors

**Solutions:**
1. Update CORS configuration in `index.js`
2. Add your domain to allowed origins
3. Verify .htaccess CORS headers are set

---

## Security Checklist

- [ ] Changed JWT_SECRET to strong random value
- [ ] Firebase service account key has restricted permissions (600)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] .env file is not publicly accessible
- [ ] SSL/HTTPS enabled (recommended)
- [ ] Strong passwords for cPanel and database
- [ ] Regular backups configured
- [ ] Application logs monitored
- [ ] Rate limiting enabled (already in code)
- [ ] Email credentials secured

---

## Quick Reference Commands

```bash
# SSH Login
ssh royaldxd@103.185.75.245

# Enter Node.js environment
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate

# Navigate to backend
cd /home/royaldxd/public_html/fleet-management/backend

# Install dependencies
npm install --production

# View logs
tail -f /home/royaldxd/logs/fleet-management-error.log

# Test API
curl http://103.185.75.245/fleet-management/api/health

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## URLs Reference

- **cPanel**: https://103.185.75.245:2083
- **API Base**: http://103.185.75.245/fleet-management/api
- **Health Check**: http://103.185.75.245/fleet-management/api/health
- **Web App**: http://103.185.75.245/fleet-management/web/
- **APK Download**: http://103.185.75.245/fleet-management/downloads/app-release.apk

---

## Support & Next Steps

### After Deployment:
1. Test all API endpoints
2. Test Flutter app with production backend
3. Configure domain name (optional)
4. Setup SSL certificate
5. Configure automated backups
6. Monitor application logs
7. Distribute app to users

### Need Help?
- Check application logs in cPanel
- Review error messages in browser console
- Test API endpoints with curl or Postman
- Verify all environment variables are set correctly

---

**Deployment Date**: December 16, 2025
**Server**: 103.185.75.245
**Version**: 1.0.0
