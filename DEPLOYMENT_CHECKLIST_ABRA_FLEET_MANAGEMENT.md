# ✅ Deployment Checklist - abra-fleet-management.com

## 📋 Pre-Deployment Preparation

### Local Setup
- [ ] Node.js installed (v18+)
- [ ] Flutter SDK installed
- [ ] Git repository up to date
- [ ] All code tested locally
- [ ] Firebase service account key file available
- [ ] MongoDB Atlas credentials ready

### Server Access
- [ ] cPanel login credentials available
- [ ] Server IP: 103.185.75.245
- [ ] cPanel URL: https://103.185.75.245:2083
- [ ] FTP/SFTP client installed (FileZilla/WinSCP)

---

## 🔧 Backend Deployment

### 1. Upload Backend Files
- [ ] Connect to server via SFTP (103.185.75.245)
- [ ] Create directory: `/home/royaldxd/public_html/abra-fleet-management/backend/`
- [ ] Upload all files from `abra_fleet_backend` folder
- [ ] Upload Firebase service account key: `abrafleet-cec94-firebase-adminsdk-*.json`
- [ ] Verify all files uploaded successfully

### 2. Configure Node.js Application
- [ ] Login to cPanel: https://103.185.75.245:2083
- [ ] Navigate to "Setup Node.js App"
- [ ] Click "Create Application"
- [ ] Set Node.js version: 18.x or higher
- [ ] Set Application mode: Production
- [ ] Set Application root: `public_html/abra-fleet-management/backend`
- [ ] Set Startup file: `index.js`
- [ ] Click "Create"
- [ ] Copy virtual environment command

### 3. Install Dependencies
- [ ] Open cPanel Terminal
- [ ] Enter Node.js virtual environment
- [ ] Navigate to backend directory
- [ ] Run: `npm install --production`
- [ ] Wait for installation to complete
- [ ] Verify no errors

### 4. Create Environment File
- [ ] Navigate to backend folder in File Manager
- [ ] Create new file: `.env`
- [ ] Copy content from `.env.abra-fleet-management.com`
- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Replace `REPLACE_WITH_STRONG_RANDOM_SECRET_HERE` with generated secret
- [ ] Save file
- [ ] Verify all variables are set correctly

### 5. Configure MongoDB Atlas
- [ ] Login to MongoDB Atlas: https://cloud.mongodb.com
- [ ] Navigate to "Network Access"
- [ ] Click "Add IP Address"
- [ ] Add server IP: `103.185.75.245`
- [ ] Click "Confirm"
- [ ] Verify IP is whitelisted

### 6. Create .htaccess File
- [ ] Navigate to: `/home/royaldxd/public_html/abra-fleet-management/`
- [ ] Create file: `.htaccess`
- [ ] Copy content from `.htaccess.cpanel`
- [ ] Save file
- [ ] Verify RewriteEngine rules are correct

### 7. Start Backend Application
- [ ] Go to "Setup Node.js App" in cPanel
- [ ] Find your application
- [ ] Click "Start App" or "Restart App"
- [ ] Verify status shows "Running"
- [ ] Check application logs for errors

### 8. Test Backend
- [ ] Open browser
- [ ] Visit: `https://abra-fleet-management.com/api/health`
- [ ] Verify response: `{"status":"ok",...}`
- [ ] Test other endpoints if needed
- [ ] Check for CORS errors in console

---

## 🌐 Frontend Web Deployment

### 1. Update Flutter Configuration
- [ ] Open `abra_fleet/.env`
- [ ] Set: `API_BASE_URL=https://abra-fleet-management.com/api`
- [ ] Set: `WEBSOCKET_URL=wss://abra-fleet-management.com`
- [ ] Save file
- [ ] Open `abra_fleet/lib/app/config/api_config.dart`
- [ ] Update baseUrl to production URL
- [ ] Save file

### 2. Build Flutter Web
- [ ] Open terminal in `abra_fleet` directory
- [ ] Run: `flutter clean`
- [ ] Run: `flutter pub get`
- [ ] Run: `flutter build web --release`
- [ ] Verify build completes successfully
- [ ] Check `build/web/` folder exists

### 3. Upload Web Build
- [ ] Connect to server via SFTP
- [ ] Navigate to: `/home/royaldxd/public_html/abra-fleet-management/`
- [ ] Create folder: `web`
- [ ] Upload entire `build/web/` folder contents
- [ ] Verify all files uploaded (index.html, main.dart.js, etc.)

### 4. Test Web Application
- [ ] Open browser
- [ ] Visit: `https://abra-fleet-management.com/web/`
- [ ] Verify app loads correctly
- [ ] Test login functionality
- [ ] Check browser console for errors
- [ ] Test API connectivity

---

## 📱 Mobile App Deployment

### 1. Update Mobile Configuration
- [ ] Open `abra_fleet/.env`
- [ ] Verify: `API_BASE_URL=https://abra-fleet-management.com/api`
- [ ] Verify: `WEBSOCKET_URL=wss://abra-fleet-management.com`
- [ ] Save file

### 2. Build Android APK
- [ ] Open terminal in `abra_fleet` directory
- [ ] Run: `flutter clean`
- [ ] Run: `flutter pub get`
- [ ] Run: `flutter build apk --release`
- [ ] Verify build completes successfully
- [ ] Locate APK: `build/app/outputs/flutter-apk/app-release.apk`

### 3. Test APK
- [ ] Install APK on Android device
- [ ] Open app
- [ ] Test login
- [ ] Test API connectivity
- [ ] Test all major features
- [ ] Check for crashes or errors

### 4. Distribute APK
**Option A: Server Download**
- [ ] Upload APK to: `/home/royaldxd/public_html/abra-fleet-management/downloads/`
- [ ] Share link: `https://abra-fleet-management.com/downloads/app-release.apk`

**Option B: Direct Distribution**
- [ ] Email APK to users
- [ ] Upload to Google Drive
- [ ] Share download link

**Option C: Google Play Store**
- [ ] Build App Bundle: `flutter build appbundle --release`
- [ ] Create Google Play Console account
- [ ] Upload to Play Store
- [ ] Complete store listing
- [ ] Submit for review

---

## 🔒 Security Configuration

### SSL/HTTPS Setup
- [ ] Login to cPanel
- [ ] Navigate to "SSL/TLS Status"
- [ ] Find domain: `abra-fleet-management.com`
- [ ] Click "Run AutoSSL"
- [ ] Wait for certificate to be issued
- [ ] Verify HTTPS works: `https://abra-fleet-management.com/`
- [ ] Update app URLs to use HTTPS

### File Permissions
- [ ] Set .env file permissions: 600 (read/write owner only)
- [ ] Set Firebase key permissions: 600
- [ ] Verify .htaccess protects sensitive files
- [ ] Check directory listing is disabled

### Security Headers
- [ ] Verify .htaccess includes security headers
- [ ] Test CORS configuration
- [ ] Check rate limiting is enabled
- [ ] Verify JWT secret is strong and unique

---

## 🧪 Testing & Verification

### Backend Testing
- [ ] Health endpoint: `https://abra-fleet-management.com/api/health`
- [ ] Login endpoint works
- [ ] Database connection successful
- [ ] Firebase authentication works
- [ ] Email notifications work
- [ ] File uploads work
- [ ] WebSocket connections work

### Frontend Testing
- [ ] Web app loads: `https://abra-fleet-management.com/web/`
- [ ] Login works
- [ ] Dashboard displays correctly
- [ ] API calls successful
- [ ] No CORS errors
- [ ] All features functional

### Mobile App Testing
- [ ] App installs successfully
- [ ] Login works
- [ ] API connectivity works
- [ ] Push notifications work (if enabled)
- [ ] All features functional
- [ ] No crashes

---

## 📊 Monitoring & Maintenance

### Application Monitoring
- [ ] Check application logs in cPanel
- [ ] Monitor error logs
- [ ] Check MongoDB Atlas metrics
- [ ] Monitor Firebase usage
- [ ] Check email delivery

### Performance
- [ ] Test page load times
- [ ] Check API response times
- [ ] Monitor server resources
- [ ] Check database query performance

### Backups
- [ ] Setup automated backups in cPanel
- [ ] Backup MongoDB database
- [ ] Backup Firebase data
- [ ] Document backup procedures

---

## 📝 Documentation

### Update Documentation
- [ ] Document deployment date
- [ ] Record production URLs
- [ ] Document any issues encountered
- [ ] Update README with production info
- [ ] Create user guides if needed

### Share Information
- [ ] Share production URLs with team
- [ ] Provide login credentials to admins
- [ ] Share APK download link with users
- [ ] Document support procedures

---

## 🎯 Post-Deployment Tasks

### User Setup
- [ ] Create admin accounts
- [ ] Create test user accounts
- [ ] Configure user roles
- [ ] Test user workflows

### Data Migration (if needed)
- [ ] Migrate existing data
- [ ] Verify data integrity
- [ ] Test with production data
- [ ] Backup before migration

### Training
- [ ] Train administrators
- [ ] Create user documentation
- [ ] Provide support contact info
- [ ] Schedule follow-up sessions

---

## ✅ Final Verification

### All Systems Go
- [ ] Backend running: ✓
- [ ] Web app accessible: ✓
- [ ] Mobile app working: ✓
- [ ] SSL/HTTPS enabled: ✓
- [ ] Database connected: ✓
- [ ] Firebase working: ✓
- [ ] Email working: ✓
- [ ] All features tested: ✓
- [ ] Documentation complete: ✓
- [ ] Users notified: ✓

---

## 🆘 Troubleshooting Resources

### If Something Goes Wrong
1. Check application logs in cPanel
2. Review error messages in browser console
3. Test API endpoints with curl or Postman
4. Verify environment variables are set correctly
5. Check MongoDB Atlas connection
6. Verify Firebase configuration
7. Review .htaccess configuration
8. Check file permissions
9. Restart application in cPanel
10. Contact hosting support if needed

### Useful Commands
```bash
# SSH into server
ssh royaldxd@103.185.75.245

# View logs
tail -f /home/royaldxd/logs/abra-fleet-management-error.log

# Restart app (via cPanel)
# Go to: Setup Node.js App > Restart

# Test API
curl https://abra-fleet-management.com/api/health
```

---

## 📞 Support Contacts

- **Hosting Support**: Contact cPanel provider
- **MongoDB Atlas**: https://cloud.mongodb.com/support
- **Firebase**: https://firebase.google.com/support
- **Flutter**: https://flutter.dev/community

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Version**: 1.0.0
**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Notes

_Use this space to document any issues, solutions, or important information during deployment:_

```
[Your notes here]
```
