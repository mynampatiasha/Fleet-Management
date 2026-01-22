@echo off
echo ========================================
echo MongoDB Document Storage Setup
echo ========================================
echo.

echo Step 1: Installing multer package...
cd abra_fleet_backend
call npm install multer
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install multer
    pause
    exit /b 1
)
echo ✓ multer installed

echo.
echo Step 2: Checking if backend is running...
curl -s http://localhost:3000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Backend is running. Please restart it:
    echo    1. Press Ctrl+C in the backend terminal
    echo    2. Run: node index.js
) else (
    echo ✓ Backend is not running
    echo.
    echo Starting backend server...
    start cmd /k "cd abra_fleet_backend && node index.js"
)

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo MongoDB document storage is now ready!
echo.
echo Features:
echo  ✓ No CORS issues
echo  ✓ Works on web, mobile, desktop
echo  ✓ Files stored in MongoDB
echo  ✓ 10MB file size limit
echo.
echo API Endpoints:
echo  - Upload: POST /api/documents/vehicles/:id/documents
echo  - Download: GET /api/documents/download/:fileId
echo  - Delete: DELETE /api/documents/vehicles/:id/documents/:docId
echo.
echo Next steps:
echo  1. Make sure backend is running (node index.js)
echo  2. Refresh your Flutter web app
echo  3. Try uploading a document
echo  4. No more CORS errors!
echo.
pause
