# Vehicle API CORS Fix

## Problem
The Flutter web app was unable to fetch vehicle data due to:
1. **Hardcoded placeholder URL**: The vehicle repository was trying to connect to `https://yourdomain.com/api/vehicles` instead of the actual backend
2. **CORS policy blocking**: The backend wasn't properly configured to allow requests from the Flutter web app origin

## Solution Applied

### 1. Fixed Vehicle Repository (`api_vehicle_repository_impl.dart`)
**Changed:**
```dart
final String _baseUrl = 'https://yourdomain.com/api'; // ❌ Wrong
```

**To:**
```dart
final String _baseUrl = const String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://192.168.1.2:3000',
);
```

This now reads from the environment configuration in `.env` file.

### 2. Enhanced Backend CORS Configuration (`index.js`)
**Changed:**
```javascript
app.use(cors()); // ❌ Too permissive/restrictive
```

**To:**
```javascript
const corsOptions = {
  origin: [
    'http://localhost:50050',  // Flutter web dev server
    'http://localhost:3000',
    'http://192.168.1.2:50050',
    'http://127.0.0.1:50050',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};
app.use(cors(corsOptions));
```

## How to Test

### 1. Restart Backend Server
```bash
cd abra_fleet_backend
node index.js
```

### 2. Run Flutter Web with Environment Variables
```bash
cd abra_fleet
flutter run -d chrome --dart-define=API_BASE_URL=http://192.168.1.2:3000
```

### 3. Verify Vehicle API Works
- Navigate to Admin Dashboard
- Check browser console - should see successful vehicle fetch
- No more CORS errors

## Environment Configuration

Your `.env` file already has the correct configuration:
```env
API_BASE_URL=http://192.168.1.2:3000
WEBSOCKET_URL=ws://192.168.1.2:3001
```

## Additional Notes

### For Production
Update CORS origins to include your production domain:
```javascript
origin: [
  'https://your-production-domain.com',
  'http://localhost:50050', // Keep for development
],
```

### For Different Network Configurations
If testing on different devices/networks, add their origins to the CORS whitelist:
```javascript
origin: [
  'http://localhost:50050',
  'http://192.168.1.2:50050',
  'http://YOUR_MACHINE_IP:50050', // Add your IP
],
```

### Troubleshooting

**Still seeing CORS errors?**
1. Clear browser cache
2. Restart backend server
3. Check backend console for incoming requests
4. Verify the origin in browser dev tools matches CORS whitelist

**Vehicle API returns 401 Unauthorized?**
- Ensure Firebase authentication token is being sent
- Check `_getHeaders()` method includes auth token
- Verify token hasn't expired

**Connection refused errors?**
- Verify backend is running on port 3000
- Check firewall settings
- Ensure IP address matches your machine's network IP
