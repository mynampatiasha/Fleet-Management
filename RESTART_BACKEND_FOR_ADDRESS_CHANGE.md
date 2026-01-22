# ⚠️ Backend Restart Required for Address Change Feature

## Problem

You're getting **404 (Not Found)** error when trying to use the Address Change feature because:

**The backend server is running with OLD code** (before we added the address-change route)

---

## Solution: Restart Backend Server

### Step 1: Stop Current Backend

**Find the terminal/command prompt running the backend** and press:
```
Ctrl + C
```

Or if running in background, find and kill the process:
```bash
# Windows
tasklist | findstr node
taskkill /F /PID <process_id>

# Or use Task Manager to end node.exe process
```

### Step 2: Start Backend Again

```bash
cd abra_fleet_backend
node index.js
```

Or if using npm:
```bash
cd abra_fleet_backend
npm start
```

### Step 3: Verify Route is Loaded

Look for this in the startup logs:
```
✅ Connected to MongoDB Atlas!
Server running on port 3000
```

Then test the route:
```bash
node test-address-change-route.js
```

Should see:
```
✅ Route EXISTS (401 = Unauthorized, which is expected without valid token)
```

---

## What We Changed

### 1. Added Route Import (index.js)
```javascript
const addressChangeRoutes = require('./routes/address_change_router');
```

### 2. Registered Route (index.js)
```javascript
app.use('/api/address-change', verifyToken, addressChangeRoutes);
```

### 3. Fixed getDb() Error (address_change_router.js)
```javascript
// Changed from:
const db = getDb();

// To:
const db = req.db;
```

---

## After Restart

### Test from Flutter App:

1. **Hot restart Flutter app** (not just hot reload)
   ```bash
   # In Flutter terminal
   r  # for hot restart
   # Or
   R  # for full restart
   ```

2. **Try Address Change feature:**
   - Open My Trips
   - Tap menu (⋮)
   - Select "Change Address"
   - Fill in new addresses
   - Submit

3. **Should work now!**
   - No more 404 error
   - Request will be submitted
   - Admin will receive notification

---

## Quick Verification Checklist

- [ ] Backend stopped (Ctrl+C)
- [ ] Backend restarted (node index.js)
- [ ] See "Connected to MongoDB" message
- [ ] Test route: `node test-address-change-route.js`
- [ ] See "Route EXISTS (401)" message
- [ ] Flutter app hot restarted
- [ ] Try submitting address change request
- [ ] Should work without 404 error

---

## If Still Getting 404

### Check 1: Is backend actually restarted?
```bash
# Look at backend terminal - should show recent startup time
# Should see: "Server running on port 3000"
```

### Check 2: Is route registered?
```bash
# In backend terminal, look for any errors during startup
# Should NOT see: "Cannot find module './routes/address_change_router'"
```

### Check 3: Is file saved?
```bash
# Check if index.js has the changes:
cd abra_fleet_backend
findstr "addressChangeRoutes" index.js
# Should show 2 lines (import and app.use)
```

### Check 4: Port conflict?
```bash
# Make sure only ONE backend is running on port 3000
# Windows:
netstat -ano | findstr :3000
# Should show only ONE node process
```

---

## Expected Behavior After Fix

### Customer Side:
```
1. Opens My Trips → Menu → "Change Address"
2. Fills in new addresses
3. Submits request
4. Sees: "Processing will take 4-5 working days"
✅ NO 404 ERROR
```

### Backend Logs:
```
📥 INCOMING REQUEST
POST /api/address-change/customer/request
📧 Sending notification to 2 admin(s) in Abra Group
✅ Sent 2 notification(s) to admins
```

### Admin Side:
```
🔔 Receives notification:
"New Address Change Request"
"John Doe has requested an address change"
```

---

## Summary

**The code is correct, but the backend needs to be restarted to load the new route.**

1. Stop backend (Ctrl+C)
2. Start backend (node index.js)
3. Hot restart Flutter app
4. Try again - should work!

The 404 error will disappear once the backend picks up the new route registration.
