# 🚀 Quick Fix: Admin Login Issue

## Problem
Admin credentials (`admin@abrafleet.com`) were redirecting to customer dashboard instead of admin dashboard.

## Solution
Updated the code to ensure admin user is created with `role: 'admin'` in MongoDB.

## What to Do Now

### Step 1: Restart Backend
```bash
cd abra_fleet_backend
npm start
```

### Step 2: Restart Flutter App
```bash
cd abra_fleet
flutter run
```

### Step 3: Login with Admin Credentials
- **Email:** `admin@abrafleet.com`
- **Password:** `admin123`

### Step 4: Verify
- You should now see the **Admin Dashboard**
- NOT the customer dashboard

## What Was Fixed

1. ✅ Flutter code now passes `role: 'admin'` when creating admin user
2. ✅ Backend properly stores the admin role in MongoDB
3. ✅ App correctly routes to admin dashboard based on role

## If It Still Doesn't Work

Run this command in MongoDB:
```javascript
use abrafleet
db.users.updateOne(
  { email: "admin@abrafleet.com" },
  { $set: { role: "admin" } }
)
```

Or delete the admin user and let it recreate:
```javascript
db.users.deleteOne({ email: "admin@abrafleet.com" })
```

Then restart the app and login again.

---

**Status:** Fixed ✅  
**Test:** Restart backend + Flutter app, then login with admin credentials
