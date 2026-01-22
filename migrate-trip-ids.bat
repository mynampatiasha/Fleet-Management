@echo off
echo ========================================
echo ABRA Fleet - Trip ID Migration
echo ========================================
echo.
echo This script will convert all existing trip IDs to the new Trip-XXXXX format
echo.
pause

cd abra_fleet_backend

echo Starting migration...
node migrate-trip-ids.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo All trip IDs have been converted to Trip-XXXXX format
    echo Related collections have been updated
    echo.
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo.
    echo Please check the error messages above
    echo.
)

pause