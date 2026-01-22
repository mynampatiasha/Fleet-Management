@echo off
echo ========================================
echo Starting MongoDB Service
echo ========================================
echo.

REM Try to start MongoDB service
net start MongoDB

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo MongoDB started successfully!
    echo ========================================
    echo.
    echo You can now:
    echo 1. Start the backend: node abra_fleet_backend/index.js
    echo 2. Refresh your Flutter app
    echo.
) else (
    echo.
    echo ========================================
    echo Failed to start MongoDB service
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Run this script as Administrator
    echo 2. Check if MongoDB is installed
    echo 3. Install MongoDB from: https://www.mongodb.com/try/download/community
    echo.
)

pause
