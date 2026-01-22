@echo off
echo ========================================
echo NETWORK ERROR DIAGNOSTIC
echo ========================================
echo.

echo [1/5] Checking if backend is running...
curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is RUNNING
    curl -s http://localhost:3001/health
) else (
    echo ❌ Backend is NOT RUNNING
    echo.
    echo 🔧 FIX: Start backend with:
    echo    cd abra_fleet_backend
    echo    node start-server.js
    goto :end
)

echo.
echo [2/5] Checking MongoDB connection...
curl -s http://localhost:3001/api/health/db > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is connected
) else (
    echo ⚠️  Cannot verify MongoDB connection
)

echo.
echo [3/5] Checking your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo 📍 Your IP: !IP!
)

echo.
echo [4/5] Checking Flutter .env configuration...
if exist "abra_fleet\.env" (
    echo ✅ .env file exists
    findstr "API_BASE_URL" abra_fleet\.env
) else (
    echo ❌ .env file NOT FOUND
    echo.
    echo 🔧 FIX: Create abra_fleet\.env with:
    echo    API_BASE_URL=http://localhost:3001
    echo    WEBSOCKET_URL=ws://localhost:3001
)

echo.
echo [5/5] Testing roster API endpoint...
echo (This will fail if not authenticated, but shows if endpoint is reachable)
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3001/api/roster/admin/pending

echo.
echo ========================================
echo DIAGNOSIS COMPLETE
echo ========================================
echo.
echo 📋 NEXT STEPS:
echo.
echo If backend is NOT running:
echo   1. cd abra_fleet_backend
echo   2. node start-server.js
echo.
echo If using mobile device:
echo   1. Update abra_fleet\.env with your IP
echo   2. API_BASE_URL=http://YOUR_IP:3001
echo   3. Restart Flutter app
echo.
echo If using web browser:
echo   1. Ensure API_BASE_URL=http://localhost:3001
echo   2. Restart Flutter app
echo.

:end
pause
