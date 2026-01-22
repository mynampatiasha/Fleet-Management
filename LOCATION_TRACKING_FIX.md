# Location Tracking Connection Fix

## Problem
Driver app shows: `Cannot send Null ❌ Failed to send location: ClientException: Failed to fetch, uri=http://localhost:3000/api/tracking/driver/location`

## Root Cause
The Flutter app is configured to use `localhost:3000`, which doesn't work on mobile devices/emulators because:
- **Android Emulator**: `localhost` refers to the emulator itself, not your computer
- **Physical Device**: `localhost` refers to the device, not your computer

## Solution

### Option 1: Testing on Android Emulator
Edit `abra_fleet/.env`:
```env
# Comment out localhost
# API_BASE_URL=http://localhost:3000
# WEBSOCKET_URL=ws://localhost:3001

# Uncomment emulator config
API_BASE_URL=http://10.0.2.2:3000
WEBSOCKET_URL=ws://10.0.2.2:3001
```

### Option 2: Testing on Physical Device
1. Find your computer's IP address:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

2. Edit `abra_fleet/.env`:
   ```env
   # Comment out localhost
   # API_BASE_URL=http://localhost:3000
   # WEBSOCKET_URL=ws://localhost:3001

   # Use your computer's IP
   API_BASE_URL=http://192.168.1.100:3000
   WEBSOCKET_URL=ws://192.168.1.100:3001
   ```

### Option 3: Testing on Web
Keep current config (already correct):
```env
API_BASE_URL=http://localhost:3000
WEBSOCKET_URL=ws://localhost:3001
```

## After Changing .env

1. **Stop the app** (hot reload won't work for .env changes)
2. **Restart the app** completely
3. **Test location tracking**

## Verify Backend is Running
```cmd
cd abra_fleet_backend
node test-driver-location-endpoint.js
```

Should show:
```
✅ Correctly rejected: 401 - No valid authorization token provided
✅ Backend is running: Abra Travels Backend is running!
```

## Test Location Tracking

1. Login as driver (e.g., `drivertest@example.com`)
2. Navigate to active trip
3. Check console for:
   ```
   ✅ Started backend tracking for driver: [driverId]
   📍 Location updated: X trips
   ```

## Network Requirements

For physical device testing:
- ✅ Device and computer on **same WiFi network**
- ✅ Firewall allows port 3000
- ✅ Backend running on port 3000

## Quick Test Command
```cmd
# From your device browser, visit:
http://YOUR_COMPUTER_IP:3000/health

# Should show: "Abra Travels Backend is running!"
```
