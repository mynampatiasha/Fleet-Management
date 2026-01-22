@echo off
echo ========================================
echo TMS SYSTEM FIX - POST FIREBASE REMOVAL
echo ========================================
echo.

echo Step 1: Backing up current TMS routes...
copy "abra_fleet_backend\routes\tms.js" "abra_fleet_backend\routes\tms.js.backup" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backup created: tms.js.backup
) else (
    echo [WARN] Could not create backup
)
echo.

echo Step 2: Replacing with fixed TMS routes...
copy /Y "abra_fleet_backend\routes\tms_fixed.js" "abra_fleet_backend\routes\tms.js" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] TMS routes replaced successfully
) else (
    echo [ERROR] Failed to replace TMS routes
    pause
    exit /b 1
)
echo.

echo Step 3: Restarting backend server...
echo Please restart your backend server manually:
echo   cd abra_fleet_backend
echo   npm start
echo.

echo ========================================
echo TMS FIX COMPLETE!
echo ========================================
echo.
echo What was fixed:
echo  - Removed Firebase UID dependencies
echo  - Simplified user ID handling (uses JWT userId directly)
echo  - Fixed /api/tickets/my endpoint to properly filter by user
echo  - Improved error handling and logging
echo  - Fixed ObjectId conversions
echo.
echo Next steps:
echo  1. Restart the backend server
echo  2. Test the TMS system in the app
echo  3. Check that tickets are filtered correctly
echo.
pause
