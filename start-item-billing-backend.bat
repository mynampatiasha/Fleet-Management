@echo off
echo 🚀 Starting Item Billing Backend Server...
echo.

cd abra_fleet_backend

echo 📦 Installing dependencies...
call npm install

echo.
echo 🔥 Starting server on port 3001...
call npm start

pause