@echo off
echo.
echo ========================================
echo   SETTING UP DRIVERTEST REAL DATA
echo ========================================
echo.

echo 1. Creating real demo data in MongoDB...
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
echo   REAL DEMO SETUP COMPLETE!
echo ========================================
echo.
echo ✅ Real driver created: drivertest@gmail.com
echo ✅ Password: Driver123!
echo ✅ Real customer: customer123@abrafleet.com
echo ✅ Password: Customer123!
echo ✅ Real vehicle: KA01AB1234 (Maruti Eeco - 4 seater)
echo ✅ Real active trip with customer Priya Sharma
echo ✅ Real today's route with 3 customers
echo ✅ Real dashboard stats from actual trip data
echo ✅ Backend server started with regular APIs
echo.
echo 📱 You can now:
echo    1. Login as driver: drivertest@gmail.com
echo    2. Use ALL regular APIs - no demo mode
echo    3. View real data that works with production APIs
echo    4. Seamlessly transition from demo to production
echo.
echo 🔗 Backend running at: http://localhost:3000
echo 🔗 Using regular production APIs
echo.
echo 💡 After demo: Simply delete the demo driver/customer
echo    from database to clean up - no code changes needed!
echo.
pause