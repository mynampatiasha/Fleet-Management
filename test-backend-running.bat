@echo off
echo ========================================
echo BACKEND STATUS CHECK
echo ========================================
echo.

echo Checking if backend is running on port 3001...
curl -s http://localhost:3001/health
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backend is RUNNING on port 3001
) else (
    echo.
    echo ❌ Backend is NOT running on port 3001
    echo.
    echo Starting backend now...
    cd abra_fleet_backend
    start cmd /k "node start-server.js"
    echo.
    echo ⏳ Waiting 5 seconds for backend to start...
    timeout /t 5 /nobreak > nul
    echo.
    echo Testing again...
    curl -s http://localhost:3001/health
)

echo.
echo ========================================
echo.
pause
