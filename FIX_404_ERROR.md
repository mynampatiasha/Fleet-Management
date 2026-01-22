# Fix 404 Error - Address Change Feature

## The Problem

```
POST http://localhost:3000/api/address-change/customer/request 404 (Not Found)
```

## The Cause

**Backend server is running OLD code** (before we added the address-change route)

The route was added to `index.js` but the server hasn't been restarted to load it.

---

## The Fix (3 Steps)

### 1️⃣ Restart Backend

**Option A: Use restart script (Easiest)**
```bash
cd abra_fleet_backend
restart-backend.bat
```

**Option B: Manual restart**
```bash
# Stop current backend (Ctrl+C in backend terminal)
# Then start again:
cd abra_fleet_backend
node index.js
```

### 2️⃣ Verify Route is Loaded

```bash
cd abra_fleet_backend
node test-address-change-route.js
```

Should see:
```
✅ Route EXISTS (401 = Unauthorized, which is expected)
```

### 3️⃣ Hot Restart Flutter App

In Flutter terminal, press:
```
R  (capital R for full restart)
```

Or restart from IDE.

---

## Test Again

1. Open My Trips
2. Tap menu (⋮) → "Change Address"
3. Fill in new addresses
4. Submit

**Should work now - no more 404!**

---

## What We Fixed

1. ✅ Added `addressChangeRoutes` import to index.js
2. ✅ Registered route: `app.use('/api/address-change', ...)`
3. ✅ Fixed `getDb()` → `req.db` in address_change_router.js
4. ⏳ **Need to restart backend to load changes**

---

## Quick Check

**Is backend restarted?**
- Look at backend terminal
- Should show recent startup time
- Should see: "✅ Connected to MongoDB Atlas!"
- Should see: "Server running on port 3000"

**Is route working?**
```bash
node test-address-change-route.js
```
- Should NOT see 404
- Should see 401 (which is good - means route exists)

**Is Flutter restarted?**
- Press R in Flutter terminal
- Or restart from IDE
- Try address change feature again

---

## Still Getting 404?

### Check backend logs:
- Any errors during startup?
- Does it say "Cannot find module"?

### Check if multiple backends running:
```bash
netstat -ano | findstr :3000
```
- Should show only ONE process
- If multiple, kill all and restart

### Check if changes saved:
```bash
cd abra_fleet_backend
findstr "addressChangeRoutes" index.js
```
- Should show 2 lines
- If not, changes weren't saved

---

## Expected Result

### Before Fix:
```
❌ 404 (Not Found)
❌ Route not found
```

### After Fix:
```
✅ Request submitted successfully
✅ "Processing will take 4-5 working days"
✅ Admin receives notification
```

---

## Summary

**The code is correct. Just restart the backend!**

1. Stop backend (Ctrl+C)
2. Start backend (node index.js or restart-backend.bat)
3. Restart Flutter app (R)
4. Try again

The 404 error will be gone. ✅
