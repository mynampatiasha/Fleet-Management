# Driver Dashboard Backend Connection Guide

## Overview
This guide connects your Flutter driver dashboard to the existing backend APIs. The backend routes are already implemented and ready to use.

## Backend API Endpoints

### 1. Dashboard Stats API
**Endpoint:** `GET /api/driver/dashboard/stats`  
**Auth:** Required (Firebase Token)  
**Response:**
```json
{
  "status": "success",
  "data": {
    "totalTrips": 7,
    "totalDistance": 156.5,
    "averageRating": "4.8",
    "onTimePercentage": "98%"
  }
}
```

### 2. Vehicle Check API
**Endpoint:** `GET /api/driver/dashboard/vehicle-check`  
**Auth:** Required  
**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicleAssigned": true,
    "vehicleId": "vehicle_id_here",
    "vehicleNumber": "KA-01-AB-1234",
    "vehicleModel": "Toyota Innova",
    "checks": [
      {
        "label": "Fuel Level",
        "status": "Full",
        "isOk": true,
        "lastChecked": "2025-12-12T10:30:00Z"
      },
      {
        "label": "Engine Oil",
        "status": "Low",
        "isOk": false,
        "lastChecked": "2025-12-12T10:30:00Z"
      }
    ],
    "lastCheckDate": "2025-12-12T10:30:00Z"
  }
}
```

### 3. Active Trip API
**Endpoint:** `GET /api/driver/trips/active`  
**Auth:** Required  
**Response:**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "id": "trip_id",
      "tripNumber": "TR-1234",
      "from": "Cyber City",
      "to": "Connaught Place",
      "distance": 45.2,
      "customers": 4,
      "status": "in_progress",
      "startTime": "2025-12-12T09:15:00Z",
      "estimatedEndTime": "2025-12-12T10:30:00Z",
      "currentLocation": {
        "type": "Point",
        "coordinates": [77.0688, 28.4595]
      }
    },
    "customer": {
      "name": "Sarah Kumar",
      "phone": "+91 98765 43210"
    },
    "vehicle": {
      "registrationNumber": "KA-01-AB-1234",
      "model": "Toyota Innova"
    }
  }
}
```

### 4. Update Trip Status API
**Endpoint:** `PATCH /api/driver/trips/update-status`  
**Auth:** Required  
**Body:**
```json
{
  "tripId": "trip_id",
  "status": "on_route"
}
```
**Valid Statuses:** `in_progress`, `on_route`, `delayed`, `waiting`, `completed`

### 5. Share Location API
**Endpoint:** `POST /api/driver/trips/share-location`  
**Auth:** Required  
**Body:**
```json
{
  "tripId": "trip_id",
  "latitude": 28.4595,
  "longitude": 77.0688
}
```

### 6. End Trip API
**Endpoint:** `POST /api/driver/trips/end-trip`  
**Auth:** Required  
**Body:**
```json
{
  "tripId": "trip_id",
  "endLocation": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "finalOdometer": 12345
}
```

### 7. Reports APIs

#### Performance Summary
**Endpoint:** `GET /api/driver/reports/performance-summary`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "totalTrips": 247,
    "avgRating": 4.8,
    "onTimePercentage": 98,
    "totalKm": 2450
  }
}
```

#### Daily Analytics
**Endpoint:** `GET /api/driver/reports/daily-analytics`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "workingHours": "6h 45min",
    "fuelEfficiency": "12.5 KM/L",
    "tripsToday": 7,
    "distanceToday": "156.0"
  }
}
```

#### Filtered Trips
**Endpoint:** `GET /api/driver/reports/trips?startDate=2025-12-01&endDate=2025-12-12`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "trips": [...],
    "summary": {
      "totalTrips": 45,
      "completedTrips": 42,
      "totalDistance": "1250.5",
      "totalDurationHours": "85.5"
    }
  }
}
```

#### Generate Report
**Endpoint:** `POST /api/driver/reports/generate`  
**Body:**
```json
{
  "type": "daily"
}
```
OR for custom reports:
```json
{
  "type": "custom",
  "startDate": "2025-12-01",
  "endDate": "2025-12-12"
}
```

#### Download Report
**Endpoint:** `GET /api/driver/reports/download/:reportId`  
**Returns:** PDF file

## Required Backend Setup

### 1. Register Driver Dashboard Route

Add this to `abra_fleet_backend/index.js` (around line 217):

```javascript
const driverDashboardRoutes = require('./routes/driver-dashboard');
app.use('/api/driver/dashboard', verifyToken, driverDashboardRoutes);
```

### 2. Verify Existing Routes
These should already be registered:
```javascript
app.use('/api/driver/reports', verifyToken, driverReportsRoutes);
app.use('/api/driver/trips', verifyToken, driverTripsRoutes);
```

## Flutter Implementation Changes

### Update TripService Base URL

The service already uses `ApiConfig.baseUrl`, so ensure your `.env` file has:
```
API_BASE_URL=http://10.16.47.123:3000
```

### Test the Connection

Create a test file: `abra_fleet_backend/test-driver-dashboard-apis.js`

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = 'YOUR_FIREBASE_TOKEN_HERE';

async function testDriverDashboard() {
  console.log('🧪 Testing Driver Dashboard APIs...\n');

  try {
    // Test 1: Dashboard Stats
    console.log('1️⃣ Testing Dashboard Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/driver/dashboard/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Stats:', statsResponse.data);
    console.log('');

    // Test 2: Vehicle Check
    console.log('2️⃣ Testing Vehicle Check...');
    const vehicleResponse = await axios.get(`${BASE_URL}/api/driver/dashboard/vehicle-check`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Vehicle Check:', vehicleResponse.data);
    console.log('');

    // Test 3: Active Trip
    console.log('3️⃣ Testing Active Trip...');
    const tripResponse = await axios.get(`${BASE_URL}/api/driver/trips/active`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Active Trip:', tripResponse.data);
    console.log('');

    // Test 4: Performance Summary
    console.log('4️⃣ Testing Performance Summary...');
    const perfResponse = await axios.get(`${BASE_URL}/api/driver/reports/performance-summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Performance:', perfResponse.data);
    console.log('');

    // Test 5: Daily Analytics
    console.log('5️⃣ Testing Daily Analytics...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/driver/reports/daily-analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Analytics:', analyticsResponse.data);
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDriverDashboard();
```

## Testing Steps

1. **Start Backend:**
   ```bash
   cd abra_fleet_backend
   node index.js
   ```

2. **Get Firebase Token:**
   - Login to the Flutter app as a driver
   - The token is automatically included in API calls via `FirebaseAuth.instance.currentUser.getIdToken()`

3. **Test APIs:**
   ```bash
   node test-driver-dashboard-apis.js
   ```

4. **Test in Flutter:**
   - Run the app
   - Navigate to Driver Dashboard
   - Check if data loads correctly

## Common Issues & Solutions

### Issue 1: "No active trip found"
**Solution:** Create a test trip in the database:
```javascript
db.collection('trips').insertOne({
  driverId: 'driver_firebase_uid',
  status: 'in_progress',
  tripNumber: 'TR-1234',
  pickupLocation: 'Cyber City',
  dropoffLocation: 'Connaught Place',
  distance: 45.2,
  customerCount: 4,
  startTime: new Date(),
  estimatedEndTime: new Date(Date.now() + 3600000)
});
```

### Issue 2: "No vehicle assigned"
**Solution:** Create an active roster:
```javascript
db.collection('rosters').insertOne({
  driverId: 'driver_firebase_uid',
  vehicleId: 'vehicle_object_id',
  startTime: new Date(Date.now() - 3600000),
  endTime: new Date(Date.now() + 7200000),
  status: 'active'
});
```

### Issue 3: CORS Errors
**Solution:** Ensure CORS is enabled in `index.js`:
```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

### Issue 4: 401 Unauthorized
**Solution:** Check Firebase token is being sent correctly:
```dart
final token = await FirebaseAuth.instance.currentUser?.getIdToken();
print('Token: $token'); // Debug
```

## Data Flow Diagram

```
┌─────────────────┐
│  Flutter App    │
│  (Driver)       │
└────────┬────────┘
         │
         │ Firebase Auth Token
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
└────────┬────────┘
         │
         │ verifyToken middleware
         │ extracts uid from token
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  Collections:   │
│  - trips        │
│  - vehicles     │
│  - rosters      │
│  - drivers      │
└─────────────────┘
```

## Next Steps

1. ✅ Register driver-dashboard route in index.js
2. ✅ Test all APIs with Postman or test script
3. ✅ Verify Flutter app can fetch data
4. ✅ Test trip status updates
5. ✅ Test location sharing
6. ✅ Test report generation
7. ✅ Test PDF download

## Summary

Your backend APIs are **already implemented** and ready to use! You just need to:

1. Register the `/api/driver/dashboard` route in `index.js`
2. Ensure your Flutter app is using the correct base URL
3. Test the connection with a driver account

The Flutter services (`TripService`, `DriverReportsService`) are already configured to call these endpoints correctly.
