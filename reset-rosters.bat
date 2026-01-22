@echo off
echo ========================================
echo  Reset Roster Assignments
echo ========================================
echo.
echo This will reset all roster assignments
echo and clear vehicle seat assignments.
echo.
pause

cd abra_fleet_backend
node reset-roster-assignments.js

echo.
echo ========================================
echo Press any key to exit...
pause > nul
