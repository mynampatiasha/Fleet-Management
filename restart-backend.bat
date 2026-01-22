@echo off
echo ========================================
echo RESTARTING BACKEND SERVER
echo ========================================
echo.
echo Stopping any running backend processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *index.js*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting backend server...
cd abra_fleet_backend
start "ABRA Fleet Backend" cmd /k "npm start"
echo.
echo ========================================
echo Backend server restarted!
echo ========================================
echo.
echo Next steps:
echo 1. Hot reload Flutter app (press 'r' in terminal)
echo 2. Logout and login as admin@abrafleet.com
echo 3. Check logs for: "role: admin"
echo.
pause
