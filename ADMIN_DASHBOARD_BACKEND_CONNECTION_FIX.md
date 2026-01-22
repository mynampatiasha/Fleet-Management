# Admin Dashboard Backend Connection Fix

## Problem
The admin dashboard is showing connection errors:
```
GET http://localhost:3001/api/admin/analytics/revenue-stats net::ERR_CONNECTION_REFUSED
```

## Root Cause
The backend server is not running on port 3001. The Flutter app is trying to connect to the backend, but the server is not accessible.

## Solution

### Step 1: Start the Backend Server

**Option A: Using the batch file (Recommended)**
```bash
start-backend.bat
```

**Option B: Manual start**
```bash
cd abra_fleet_backend
node index.js
```

**Option C: Using npm**
```bash
cd abra_fleet_backend
npm start
```

### Step 2: Verify Backend is Running

Run the test script:
```bash
node test-backend-running.js
```

You should see:
```
✅ Backend is RUNNING!
   Status: 200
   Message: Backend server is accessible
```

### Step 3: Test the Analytics Endpoints

```bash
node test-admin-analytics-endpoints.js
```

## Backend Status Indicators

### ✅ Backend Running Successfully
- You'll see console output showing:
  ```
  ✅ Connected to MongoDB Atlas with Mongoose!
  🚀 Server running on port 3001
  ```

### ❌ Backend Not Running
- Connection refused errors in browser console
- ERR_CONNECTION_REFUSED errors
- No response from http://localhost:3001

## Common Issues

### Issue 1: Port 3001 Already in Use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Then restart backend
start-backend.bat
```

### Issue 2: MongoDB Connection Failed
**Solution:**
- Check `.env` file in `abra_fleet_backend` folder
- Verify `MONGODB_URI` is set correctly
- Ensure MongoDB Atlas is accessible

### Issue 3: Missing Dependencies
**Solution:**
```bash
cd abra_fleet_backend
npm install
node index.js
```

## API Endpoints Being Called

The admin dashboard calls these endpoints:

1. **Manpower Stats** (Working - Cached)
   - `GET /api/admin/analytics/manpower-stats`
   - Returns driver, vehicle, and employee counts

2. **Revenue Stats** (Failing - Backend Not Running)
   - `GET /api/admin/analytics/revenue-stats?filter=today`
   - Returns today, week, and month revenue

3. **Company Analytics** (May Fail)
   - `GET /api/admin/analytics/company-stats`
   - Returns company-wise statistics

4. **Recent Activities** (May Fail)
   - `GET /api/admin/recent-activities`
   - Returns recent system activities

## Quick Fix Checklist

- [ ] Backend server is running on port 3001
- [ ] MongoDB connection is successful
- [ ] No port conflicts
- [ ] Environment variables are set
- [ ] CORS is configured correctly
- [ ] JWT authentication is working

## Testing After Fix

1. Start backend: `start-backend.bat`
2. Wait for "Server running on port 3001" message
3. Refresh admin dashboard in Flutter app
4. Check browser console - errors should be gone
5. Dashboard should show real-time data

## Prevention

To avoid this issue in the future:

1. **Always start backend before Flutter app**
2. **Use the start-backend.bat script**
3. **Check backend logs for errors**
4. **Monitor MongoDB connection status**

## Related Files

- `abra_fleet_backend/index.js` - Main server file
- `abra_fleet_backend/routes/admin_analytics.js` - Analytics endpoints
- `abra_fleet_backend/.env` - Environment configuration
- `start-backend.bat` - Backend startup script
- `test-backend-running.js` - Backend status checker
