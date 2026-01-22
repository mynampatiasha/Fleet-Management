@echo off
echo ========================================
echo ABRA Fleet - Test New Trip ID Format
echo ========================================
echo.
echo This script will test the new Trip-XXXXX format generation
echo.

cd abra_fleet_backend

echo Testing new trip ID generation...
node test-new-trip-id.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Test completed successfully!
    echo ========================================
    echo.
    echo The new Trip-XXXXX format is working correctly
    echo.
) else (
    echo.
    echo ========================================
    echo Test failed!
    echo ========================================
    echo.
    echo Please check the error messages above
    echo.
)

pause