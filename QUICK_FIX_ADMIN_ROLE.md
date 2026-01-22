# Quick Fix: Admin Role Issue 🚀

## The Problem
Admin user keeps logging in as "customer" instead of "admin".

## The Solution (3 Steps)

### Step 1: Restart Backend ⚡
**Run this command:**
```bash
restart-backend.bat
```

Or manually:
```bash
cd abra_fleet_backend
npm start
```

### Step 2: Hot Reload Flutter App 🔄
In your Flutter terminal, press: **`r`**

### Step 3: Login Again 🔐
- Email: **admin@abrafleet.com**
- Password: **admin123**

## What We Fixed

1. **Backend** - Now updates role when Flutter sends it
2. **Flutter** - Now sends role from Firestore to MongoDB
3. **MongoDB** - Admin user has correct role

## Expected Result ✅

After restart, you should see in logs:
```
[LoginScreen] Found role in Firestore: admin ✅
User data fetched from MongoDB: admin@abrafleet.com, role: admin ✅
[LoginScreen] Navigating to MainAppShell
```

And the app should navigate to **Admin Dashboard** (not Customer Dashboard).

## If It Still Doesn't Work

Run this to verify MongoDB:
```bash
cd abra_fleet_backend
node create-admin-user.js
```

Then restart backend again.

---

**TL;DR**: Run `restart-backend.bat`, press `r` in Flutter, login again. Done! 🎉
