@echo off
echo ========================================
echo Restarting Backend for SOS Testing
echo ========================================
echo.

cd abra_fleet_backend

echo Stopping any running backend processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend with enhanced SOS logging...
start "Abra Fleet Backend" cmd /k "node index.js"

echo.
echo ========================================
echo Backend restarted!
echo Check the backend console for detailed SOS error logs
echo ========================================
pause
