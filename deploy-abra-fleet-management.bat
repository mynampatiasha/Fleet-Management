@echo off
REM ==========================================
REM ABRA Fleet Management - Deployment Helper
REM Domain: https://abra-fleet-management.com/
REM ==========================================

echo.
echo ==========================================
echo   ABRA Fleet Management Deployment
echo ==========================================
echo.
echo Domain: https://abra-fleet-management.com/
echo Server IP: 103.185.75.245
echo cPanel: https://103.185.75.245:2083
echo User: royaldxd
echo.
echo ==========================================
echo   DEPLOYMENT MENU
echo ==========================================
echo.
echo 1. Generate JWT Secret
echo 2. Build Flutter Web
echo 3. Build Android APK
echo 4. Show Upload Instructions
echo 5. Test Backend Connection
echo 6. Open cPanel
echo 7. Open Deployment Guide
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto generate_jwt
if "%choice%"=="2" goto build_web
if "%choice%"=="3" goto build_apk
if "%choice%"=="4" goto upload_instructions
if "%choice%"=="5" goto test_backend
if "%choice%"=="6" goto open_cpanel
if "%choice%"=="7" goto open_guide
if "%choice%"=="8" goto end

:generate_jwt
echo.
echo ==========================================
echo Generating JWT Secret...
echo ==========================================
echo.
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))" > jwt-secret.txt
if exist jwt-secret.txt (
    echo ✓ JWT Secret generated successfully!
    echo.
    echo Copy this to your .env file:
    echo.
    type jwt-secret.txt
    echo.
    echo Saved to: jwt-secret.txt
) else (
    echo ✗ Error: Could not generate JWT secret
    echo Make sure Node.js is installed
)
echo.
pause
goto menu

:build_web
echo.
echo ==========================================
echo Building Flutter Web...
echo ==========================================
echo.
cd abra_fleet
echo Cleaning previous builds...
call flutter clean
echo.
echo Getting dependencies...
call flutter pub get
echo.
echo Building web app...
call flutter build web --release
echo.
if exist "build\web\index.html" (
    echo ✓ Web build successful!
    echo.
    echo Build location: abra_fleet\build\web\
    echo.
    echo Next steps:
    echo 1. Upload entire 'build\web' folder to server
    echo 2. Server path: /home/royaldxd/public_html/abra-fleet-management/web/
    echo 3. Access at: https://abra-fleet-management.com/web/
) else (
    echo ✗ Build failed! Check errors above.
)
cd ..
echo.
pause
goto menu

:build_apk
echo.
echo ==========================================
echo Building Android APK...
echo ==========================================
echo.
cd abra_fleet
echo Cleaning previous builds...
call flutter clean
echo.
echo Getting dependencies...
call flutter pub get
echo.
echo Building release APK...
call flutter build apk --release
echo.
if exist "build\app\outputs\flutter-apk\app-release.apk" (
    echo ✓ APK build successful!
    echo.
    echo APK location: abra_fleet\build\app\outputs\flutter-apk\app-release.apk
    echo.
    echo Next steps:
    echo 1. Test APK on Android device
    echo 2. Upload to server for distribution
    echo 3. Or share directly with users
) else (
    echo ✗ Build failed! Check errors above.
)
cd ..
echo.
pause
goto menu

:upload_instructions
echo.
echo ==========================================
echo Upload Instructions
echo ==========================================
echo.
echo BACKEND FILES:
echo --------------
echo 1. Use FileZilla or WinSCP
echo 2. Connect to: 103.185.75.245
echo 3. Username: royaldxd
echo 4. Upload 'abra_fleet_backend' folder to:
echo    /home/royaldxd/public_html/abra-fleet-management/backend/
echo.
echo FLUTTER WEB:
echo ------------
echo 1. Build web first (Option 2 in menu)
echo 2. Upload 'abra_fleet\build\web' folder to:
echo    /home/royaldxd/public_html/abra-fleet-management/web/
echo.
echo CONFIGURATION FILES:
echo -------------------
echo 1. Create .env file in backend folder
echo 2. Create .htaccess file in abra-fleet-management folder
echo 3. Upload Firebase service account key
echo.
echo FIREBASE KEY:
echo -------------
echo File: abrafleet-cec94-firebase-adminsdk-*.json
echo Upload to: /home/royaldxd/public_html/abra-fleet-management/backend/
echo.
echo For detailed steps, see: DEPLOY_TO_ABRA_FLEET_MANAGEMENT_COM.md
echo.
pause
goto menu

:test_backend
echo.
echo ==========================================
echo Testing Backend Connection...
echo ==========================================
echo.
echo Testing: https://abra-fleet-management.com/api/health
echo.
curl -s https://abra-fleet-management.com/api/health
if errorlevel 1 (
    echo.
    echo ✗ Connection failed!
    echo.
    echo Possible reasons:
    echo - Backend not started in cPanel
    echo - Domain not configured
    echo - SSL not setup
    echo.
    echo Try: http://103.185.75.245/abra-fleet-management/api/health
    echo.
    curl -s http://103.185.75.245/abra-fleet-management/api/health
) else (
    echo.
    echo ✓ Backend is responding!
)
echo.
pause
goto menu

:open_cpanel
echo.
echo Opening cPanel...
start https://103.185.75.245:2083
echo.
echo cPanel opened in browser
echo Login with your credentials
echo.
pause
goto menu

:open_guide
echo.
echo Opening deployment guide...
if exist "DEPLOY_TO_ABRA_FLEET_MANAGEMENT_COM.md" (
    start DEPLOY_TO_ABRA_FLEET_MANAGEMENT_COM.md
) else (
    echo ✗ Guide not found: DEPLOY_TO_ABRA_FLEET_MANAGEMENT_COM.md
)
echo.
pause
goto menu

:menu
cls
echo.
echo ==========================================
echo   ABRA Fleet Management Deployment
echo ==========================================
echo.
echo Domain: https://abra-fleet-management.com/
echo Server IP: 103.185.75.245
echo cPanel: https://103.185.75.245:2083
echo User: royaldxd
echo.
echo ==========================================
echo   DEPLOYMENT MENU
echo ==========================================
echo.
echo 1. Generate JWT Secret
echo 2. Build Flutter Web
echo 3. Build Android APK
echo 4. Show Upload Instructions
echo 5. Test Backend Connection
echo 6. Open cPanel
echo 7. Open Deployment Guide
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto generate_jwt
if "%choice%"=="2" goto build_web
if "%choice%"=="3" goto build_apk
if "%choice%"=="4" goto upload_instructions
if "%choice%"=="5" goto test_backend
if "%choice%"=="6" goto open_cpanel
if "%choice%"=="7" goto open_guide
if "%choice%"=="8" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:end
echo.
echo ==========================================
echo Thank you for using ABRA Fleet Deployment
echo ==========================================
echo.
echo Useful URLs:
echo - cPanel: https://103.185.75.245:2083
echo - Website: https://abra-fleet-management.com/
echo - API: https://abra-fleet-management.com/api
echo - Guide: DEPLOY_TO_ABRA_FLEET_MANAGEMENT_COM.md
echo.
pause
