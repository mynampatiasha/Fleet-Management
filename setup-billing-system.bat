@echo off
echo ========================================
echo ABRA FLEET BILLING SYSTEM SETUP
echo ========================================
echo.

echo 🚀 Step 1: Creating billing dummy data...
node abra_fleet_backend/create-billing-dummy-data.js
if %errorlevel% neq 0 (
    echo ❌ Failed to create dummy data
    pause
    exit /b 1
)
echo.

echo 🧪 Step 2: Testing backend connection...
node test-billing-backend-connection.js
if %errorlevel% neq 0 (
    echo ❌ Backend connection test failed
    pause
    exit /b 1
)
echo.

echo 🔧 Step 3: Starting backend server...
echo Starting backend in new window...
start "ABRA Fleet Backend" cmd /k "cd abra_fleet_backend && npm start"
echo Backend server starting at http://localhost:3001
echo.

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul
echo.

echo 📱 Step 4: Flutter app setup...
echo Navigate to the Flutter app and run:
echo   cd abra_fleet
echo   flutter run
echo.

echo ✅ BILLING SYSTEM SETUP COMPLETE!
echo ========================================
echo 🎯 What's Ready:
echo   • Backend API running at http://localhost:3001
echo   • Billing endpoints: /api/billing/*
echo   • Dummy data populated in MongoDB
echo   • Frontend connected to backend
echo.
echo 📋 Test the System:
echo   1. Open Flutter app
echo   2. Go to Client ^> Billing Invoices
echo   3. Data should load from backend
echo   4. Try recording payments
echo   5. Test refresh functionality
echo.
echo 🔗 API Endpoints Available:
echo   GET  /api/billing/contracts
echo   GET  /api/billing/invoices
echo   POST /api/billing/invoices/generate
echo   PATCH /api/billing/invoices/:id/payment
echo ========================================
pause