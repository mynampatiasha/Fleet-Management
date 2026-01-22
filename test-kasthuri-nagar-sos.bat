@echo off
echo Testing SOS Police Station Search for Kasthuri Nagar
echo =====================================================

curl -X POST http://localhost:3001/api/sos ^
  -H "Content-Type: application/json" ^
  -d "{\"customerId\":\"test_kasthuri_customer\",\"customerName\":\"Test Customer\",\"customerEmail\":\"test@example.com\",\"customerPhone\":\"+91-9876543210\",\"tripId\":\"TEST_TRIP_001\",\"driverId\":\"test_driver\",\"driverName\":\"Test Driver\",\"driverPhone\":\"+91-9876543211\",\"vehicleReg\":\"KA-01-AB-1234\",\"vehicleMake\":\"Tata\",\"vehicleModel\":\"Ace\",\"pickupLocation\":\"Kasthuri Nagar Main Road\",\"dropLocation\":\"Banaswadi Railway Station\",\"gps\":{\"latitude\":12.9850,\"longitude\":77.6362},\"timestamp\":\"%date:~-4,4%-%date:~-10,2%-%date:~-7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%.000Z\"}"

echo.
echo.
echo Test completed! Check the response above for:
echo - nearbyPoliceStations array
echo - Kasthuri Nagar Police Station should be first
echo - Phone numbers should be real (080-XXXXXXXX format)
echo - Area matches should be marked as priority

pause