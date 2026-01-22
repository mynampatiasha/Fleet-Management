# Real-time Fleet Dashboard Debug Guide

## Overview
The real-time fleet dashboard is not showing any data. This guide provides comprehensive debugging steps and detailed logging to identify the root cause.

## Debug Features Added

### 1. Enhanced Logging in Flutter App
- **File**: `abra_fleet/lib/features/driver/dashboard/presentation/screens/real_time_fleet_dashboard.dart`
- **Changes**: Added detailed console logging for:
  - Fleet service initialization
  - Stream subscriptions and data flow
  - Customer data reception
  - Route optimization
  - Error handling

### 2. Enhanced Logging in Service Layer
- **File**: `abra_fleet/lib/core/services/real_time_fleet_service.dart`
- **Changes**: Added comprehensive logging for:
  - Service initialization
  - API requests and responses
  - Customer data parsing
  - Route optimization logic
  - Stream updates

### 3. Debug UI Components
- **Debug Info Card**: Shows current state, customer count, error messages
- **Force Refresh Button**: Manually triggers data reload with logging
- **View Logs Button**: Shows troubleshooting steps

## How to Debug

### Step 1: Check Console Output
1. Open Flutter app in debug mode
2. Navigate to Real-time Fleet Dashboard
3. Check console for detailed logs starting with:
   ```
   🚐 ========== REAL TIME FLEET DASHBOARD DEBUG ==========
   ```

### Step 2: Look for Key Log Sections
1. **Authentication Check**:
   ```
   ✅ Authenticated user found:
      UID: [user_uid]
      Email: [user_email]
   ```

2. **API Request**:
   ```
   🔄 Making API request to: [api_url]
   📡 API Response received:
      Status Code: [status]
   ```

3. **Customer Data**:
   ```
   📋 Customers array:
      Length: [count]
   ```

### Step 3: Common Issues and Solutions

#### Issue 1: No Authenticated User
**Symptoms**: 
```
❌ No authenticated user found
```
**Solution**: Ensure user is properly logged in

#### Issue 2: API Request Fails
**Symptoms**:
```
❌ API request failed:
   Status Code: 401/404/500
```
**Solutions**:
- Check backend is running
- Verify API endpoint URL
- Check authentication token

#### Issue 3: Driver Not Found
**Symptoms**:
```
❌ Driver not found in database
```
**Solutions**:
- Verify driver profile exists in database
- Check Firebase UID mapping
- Run driver creation script if needed

#### Issue 4: No Rosters for Today
**Symptoms**:
```
⚠️ No customers found in API response
```
**Solutions**:
- Check if rosters are assigned for today's date
- Verify roster status (should be 'assigned', 'approved', etc.)
- Check date filtering logic

## Testing Tools

### 1. Backend API Test Script
Run the test script to verify backend API:
```bash
node test-real-time-fleet-api.js
```

### 2. Manual API Testing
Use curl or Postman to test the API directly:
```bash
curl -H "Authorization: Bearer [token]" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/driver/todays-customers
```

### 3. Database Queries
Check database directly:
```javascript
// Check if driver exists
db.drivers.findOne({firebaseUid: "drivertest"})

// Check rosters for today
db.rosters.find({
  driverId: "drivertest",
  status: {$in: ["assigned", "approved", "scheduled"]},
  startDate: {$gte: new Date("2025-12-27T00:00:00Z")}
})
```

## Debug Checklist

### Frontend (Flutter)
- [ ] User is authenticated (check Firebase Auth)
- [ ] API request is being made (check network logs)
- [ ] Response is received (check console logs)
- [ ] Data is being parsed correctly
- [ ] Stream is receiving data
- [ ] UI is updating with new data

### Backend (Node.js)
- [ ] Server is running on correct port
- [ ] Route is registered correctly
- [ ] Authentication middleware is working
- [ ] Driver lookup is successful
- [ ] Database query returns results
- [ ] Response is formatted correctly

### Database
- [ ] Driver profile exists with correct Firebase UID
- [ ] Rosters exist for today's date
- [ ] Roster status is valid ('assigned', 'approved', etc.)
- [ ] Driver ID matches between driver and roster collections

## Expected Log Flow

### Successful Flow:
```
🚐 ========== REAL TIME FLEET DASHBOARD DEBUG ==========
🔄 Starting fleet service initialization...
✅ Fleet service initialized successfully
📋 ========== LOADING TODAY'S CUSTOMERS ==========
✅ Authenticated user found: [uid]
🔄 Making API request to: [url]
📡 API Response received: Status Code: 200
📋 Customers array: Length: [count]
✅ Successfully parsed [count] customer objects
🗺️ ========== ROUTE OPTIMIZATION ==========
✅ Route optimization completed successfully
📡 ========== ADDING CUSTOMERS TO STREAM ==========
✅ Successfully added customers to stream
📋 ========== CUSTOMERS STREAM UPDATE ==========
📊 Received [count] customers
✅ UI state updated with [count] customers
```

### Failed Flow Examples:
```
❌ No authenticated user found
❌ API request failed: Status Code: 401
❌ Driver not found in database
⚠️ No customers found in API response
```

## Quick Fixes

### 1. Force Refresh
Use the "Force Refresh" button in the debug card to manually reload data.

### 2. Check Authentication
Ensure user is logged in and has valid Firebase token.

### 3. Restart Backend
If API is failing, restart the backend server:
```bash
cd abra_fleet_backend
npm start
```

### 4. Create Test Data
If no rosters exist, create test data:
```bash
node create-drivertest-demo-data.js
```

## Contact Support
If issues persist after following this guide:
1. Collect console logs from both frontend and backend
2. Note the specific error messages
3. Check database state
4. Contact development team with detailed information

---

**Last Updated**: December 27, 2025
**Version**: 1.0