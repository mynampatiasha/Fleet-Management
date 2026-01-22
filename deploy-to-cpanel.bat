@echo off
REM ABRA Fleet - cPanel Deployment Script (Windows)
REM Server: 103.185.75.245
REM User: royaldxd

echo ==========================================
echo ABRA Fleet - cPanel Deployment Script
echo ==========================================
echo.

REM Configuration
set SERVER_IP=103.185.75.245
set SERVER_USER=royaldxd
set REMOTE_PATH=/home/royaldxd/public_html/fleet-management
set BACKEND_PATH=abra_fleet_backend
set FLUTTER_PATH=abra_fleet

echo Checking if backend directory exists...
if not exist "%BACKEND_PATH%" (
    echo ERROR: Backend directory not found: %BACKEND_PATH%
    pause
    exit /b 1
)

echo.
echo ==========================================
echo DEPLOYMENT OPTIONS
echo ==========================================
echo.
echo This script will help you deploy to cPanel.
echo.
echo You'll need:
echo 1. SSH/SFTP client (like WinSCP or FileZilla)
echo 2. cPanel login credentials
echo 3. Firebase service account key file
echo.
echo ==========================================
echo MANUAL DEPLOYMENT STEPS
echo ==========================================
echo.
echo 1. UPLOAD BACKEND FILES
echo    - Use WinSCP or FileZilla
echo    - Connect to: %SERVER_IP%
echo    - Username: %SERVER_USER%
echo    - Upload '%BACKEND_PATH%' folder to:
echo      %REMOTE_PATH%/backend/
echo.
echo 2. UPLOAD CONFIGURATION FILES
echo    - Upload .htaccess.cpanel as .htaccess to:
echo      %REMOTE_PATH%/.htaccess
echo    - Upload .env.cpanel.template as .env to:
echo      %REMOTE_PATH%/backend/.env
echo    - Edit .env and replace JWT_SECRET
echo.
echo 3. UPLOAD FIREBASE KEY
echo    - Find: abrafleet-*-firebase-adminsdk-*.json
echo    - Upload to: %REMOTE_PATH%/backend/
echo.
echo 4. SETUP NODE.JS IN CPANEL
echo    - Login to: https://%SERVER_IP%:2083
echo    - Go to: Setup Node.js App
echo    - Create application:
echo      * Node version: 18.x
echo      * App root: public_html/fleet-management/backend
echo      * Startup file: index.js
echo      * Mode: Production
echo.
echo 5. INSTALL DEPENDENCIES
echo    - In cPanel Terminal or SSH:
echo      cd %REMOTE_PATH%/backend
echo      npm install --production
echo.
echo 6. CONFIGURE MONGODB
echo    - Login to MongoDB Atlas
echo    - Add IP to whitelist: %SERVER_IP%
echo.
echo 7. START APPLICATION
echo    - In cPanel: Setup Node.js App
echo    - Click: Start App / Restart App
echo.
echo 8. TEST DEPLOYMENT
echo    - Visit: http://%SERVER_IP%/fleet-management/api/health
echo    - Should return: {"status":"ok"}
echo.
echo ==========================================
echo FLUTTER APP BUILD
echo ==========================================
echo.
echo 1. Update configuration:
echo    - Edit %FLUTTER_PATH%\.env
echo    - Set: API_BASE_URL=http://%SERVER_IP%/fleet-management/api
echo.
echo 2. Build APK:
echo    cd %FLUTTER_PATH%
echo    flutter clean
echo    flutter pub get
echo    flutter build apk --release
echo.
echo 3. APK location:
echo    %FLUTTER_PATH%\build\app\outputs\flutter-apk\app-release.apk
echo.
echo ==========================================
echo USEFUL URLS
echo ==========================================
echo.
echo cPanel: https://%SERVER_IP%:2083
echo API: http://%SERVER_IP%/fleet-management/api
echo Health: http://%SERVER_IP%/fleet-management/api/health
echo MongoDB: https://cloud.mongodb.com
echo Firebase: https://console.firebase.google.com
echo.
echo ==========================================
echo.

REM Generate JWT Secret
echo Generating JWT secret...
echo.
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))" > jwt-secret.txt
if exist jwt-secret.txt (
    echo JWT Secret generated and saved to: jwt-secret.txt
    echo IMPORTANT: Copy this secret to your .env file!
    echo.
    type jwt-secret.txt
    echo.
) else (
    echo Note: Could not generate JWT secret automatically.
    echo Please generate manually using Node.js
)

echo.
echo ==========================================
echo NEXT STEPS
echo ==========================================
echo.
echo 1. Use WinSCP/FileZilla to upload files
echo 2. Follow the manual steps above
echo 3. Refer to CPANEL_DEPLOYMENT_GUIDE.md for details
echo 4. Use cpanel-deploy-checklist.md to track progress
echo.
echo ==========================================
echo.
pause
