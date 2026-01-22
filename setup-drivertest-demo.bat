@echo off
echo.
echo ========================================
echo   SETTING UP DRIVERTEST DEMO DATA
echo ========================================
echo.

echo 1. Creating demo data in MongoDB...
cd abra_fleet_backend
node create-drivertest-demo-data.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Demo data creation failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 2. Starting backend server...
start "Backend Server" cmd /k "node index.js"

echo.
echo 3. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo   DEMO SETUP COMPLETE!
echo ========================================
echo.
echo ✅ Demo driver created: drivertest@gmail.com
echo ✅ Password: Driver123!
echo ✅ Demo customer: customer123@abrafleet.com
echo ✅ Password: Customer123!
echo ✅ Vehicle: KA01AB1234 (Tata Ace Gold)
echo ✅ Backend server started
echo.
echo 📱 You can now:
echo    1. Login as driver: drivertest@gmail.com
echo    2. View active trip with customer Priya Sharma
echo    3. See today's route with 4 customers
echo    4. Check dashboard stats (15 trips completed)
echo    5. View vehicle check status
echo    6. See SOS alert history
echo.
echo 🔗 Backend running at: http://localhost:3000
echo 🔗 Demo APIs available at: http://localhost:3000/api/driver/demo/
echo.
pause