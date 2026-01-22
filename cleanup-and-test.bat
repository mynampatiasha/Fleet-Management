@echo off
echo ========================================
echo CLEANING UP INCOMPLETE ROSTERS
echo ========================================

echo.
echo 1. Running cleanup script...
node abra_fleet_backend/cleanup-incomplete-rosters.js

echo.
echo 2. Testing customer login and rosters...
node abra_fleet_backend/test-customer123-login.js

echo.
echo ========================================
echo CLEANUP AND TEST COMPLETE
echo ========================================
pause