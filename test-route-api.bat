@echo off
echo ========================================
echo Testing Route Optimization + Trip Creation
echo ========================================
echo.

echo Step 1: Admin Login
echo -------------------
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@abrafleet.com\",\"password\":\"Admin@123\"}" ^
  -o login-response.json
echo.
echo Login response saved to login-response.json
echo.

echo Step 2: Extract Token (Manual - copy from login-response.json)
echo ----------------------------------------------------------------
type login-response.json
echo.
echo.
echo Copy the token from above and use it in the next commands
echo.

pause
