@echo off
echo 🚀 Starting Abra Fleet Backend Server...
echo.

REM Check if we're in the right directory
if not exist "abra_fleet_backend\index.js" (
    echo ❌ Error: Backend files not found!
    echo Please run this script from the project root directory.
    echo Expected structure:
    echo   project-root\
    echo     abra_fleet_backend\
    echo       index.js
    echo.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd abra_fleet_backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo Please create a .env file with the following variables:
    echo   MONGODB_URI=mongodb://localhost:27017/abra_fleet
    echo   FIREBASE_PROJECT_ID=your-firebase-project-id
    echo   FIREBASE_PRIVATE_KEY=your-firebase-private-key
    echo   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
    echo.
    echo Creating a sample .env file...
    echo MONGODB_URI=mongodb://localhost:27017/abra_fleet > .env
    echo FIREBASE_PROJECT_ID=abra-fleet-management >> .env
    echo # Add your Firebase credentials here >> .env
    echo.
)

REM Start the server
echo 🔥 Starting server on port 3001...
echo Press Ctrl+C to stop the server
echo.
node index.js

pause