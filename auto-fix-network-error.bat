@echo off
setlocal enabledelayedexpansion
echo ========================================
echo AUTO-FIX NETWORK ERROR
echo ========================================
echo.

REM Step 1: Check if backend is running
echo [Step 1/4] Checking backend status...
curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is NOT running
    echo 🚀 Starting backend now...
    echo.
    start "Abra Fleet Backend" cmd /k "cd abra_fleet_backend && node start-server.js"
    echo ⏳ Waiting 10 seconds for backend to start...
    timeout /t 10 /nobreak > nul
    
    REM Verify backend started
    curl -s http://localhost:3001/health > nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Backend started successfully!
    ) else (
        echo ❌ Backend failed to start. Check the backend window for errors.
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend is already running
)

echo.
echo [Step 2/4] Checking .env file...
if not exist "abra_fleet\.env" (
    echo ❌ .env file not found
    echo 📝 Creating .env file...
    (
        echo # Backend Configuration
        echo API_BASE_URL=http://localhost:3001
        echo WEBSOCKET_URL=ws://localhost:3001
        echo.
        echo # Firebase Configuration
        echo FIREBASE_PROJECT_ID=abrafleet-cec94
        echo.
        echo # MongoDB Configuration
        echo MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true^&w=majority^&appName=Cluster0
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your_jwt_secret_key_here
    ) > "abra_fleet\.env"
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
    
    REM Check if API_BASE_URL is set correctly
    findstr /C:"API_BASE_URL=http://localhost:3001" "abra_fleet\.env" > nul
    if %errorlevel% neq 0 (
        echo ⚠️  API_BASE_URL might be incorrect
        echo 📝 Current configuration:
        findstr "API_BASE_URL" "abra_fleet\.env"
        echo.
        echo 💡 For web/desktop, it should be: http://localhost:3001
        echo 💡 For mobile device, it should be: http://YOUR_IP:3001
    ) else (
        echo ✅ API_BASE_URL is correctly set for web/desktop
    )
)

echo.
echo [Step 3/4] Testing API connection...
curl -s http://localhost:3001/health
if %errorlevel% equ 0 (
    echo.
    echo ✅ API is reachable
) else (
    echo.
    echo ❌ API is NOT reachable
    echo 🔧 Check if backend is running and MongoDB is connected
)

echo.
echo [Step 4/4] Getting your IP address (for mobile testing)...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo 📍 Your computer's IP: !IP!
    echo.
    echo 💡 If testing on mobile device, update abra_fleet\.env:
    echo    API_BASE_URL=http://!IP!:3001
    echo    WEBSOCKET_URL=ws://!IP!:3001
)

echo.
echo ========================================
echo AUTO-FIX COMPLETE
echo ========================================
echo.
echo ✅ Backend is running
echo ✅ .env file is configured
echo ✅ API is reachable
echo.
echo 🎯 NEXT STEPS:
echo.
echo 1. If using WEB (Chrome/Edge):
echo    - Configuration is ready
echo    - Just restart your Flutter app
echo.
echo 2. If using MOBILE (Phone/Emulator):
echo    - Update abra_fleet\.env with your IP address shown above
echo    - Ensure phone and computer are on same WiFi
echo    - Restart Flutter app
echo.
echo 3. Restart Flutter app:
echo    - Press Ctrl+C in Flutter terminal
echo    - Run: flutter run
echo.
pause
