# Fix Fleet Map Timeout Error - Quick Guide

## The Problem
Fleet Map View shows: **"Network error: TimeoutException after 0:00:10.000000"**

## The Cause
**MongoDB is not running!** The backend can't fetch vehicle data without it.

## The Fix (3 Simple Steps)

### Step 1: Start MongoDB
**Right-click `start-mongodb.bat` and select "Run as Administrator"**

Or manually:
```cmd
net start MongoDB
```

### Step 2: Verify It's Working
Run this test:
```cmd
node test-fleet-map-backend.js
```

You should see:
```
✅ MongoDB is running and accessible
```

### Step 3: Reload Your App
In your Flutter terminal, press `r` for hot reload

## That's It!

The Fleet Map View should now load successfully within 2-3 seconds.

---

## If MongoDB Won't Start

### Check if MongoDB is installed:
```cmd
mongod --version
```

### If not installed:
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Make sure "Install MongoDB as a Service" is checked
4. Run `start-mongodb.bat` again

---

## Quick Verification

After starting MongoDB, check these:

✅ MongoDB service is running
✅ Backend is running (`node abra_fleet_backend/index.js`)
✅ Can access http://localhost:3001/health
✅ Fleet Map View loads without errors

---

**Need Help?** Check `FLEET_MAP_TIMEOUT_ERROR_FIX.md` for detailed troubleshooting.
