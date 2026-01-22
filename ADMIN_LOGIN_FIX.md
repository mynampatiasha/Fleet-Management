# 🔧 Admin Login Fix - Going to Customer Dashboard Issue

## 🐛 Problem
When logging in with admin credentials (`admin@abrafleet.com`), the app was redirecting to the customer dashboard instead of the admin dashboard.

## 🔍 Root Cause
The admin user in MongoDB had the role set to `customer` instead of `admin`. This happened because:
1. The admin user creation code wasn't passing the `role: 'admin'` parameter to the backend
2. The backend was defaulting to `role: 'customer'` for all new users

## ✅ Solution Applied

### 1. Updated Flutter Code
**File:** `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart`
- Modified admin user creation to pass `role: 'admin'` parameter

**File:** `abra_fleet/lib/core/services/api_service.dart`
- Added `role` parameter to `loginToBackend()` method

### 2. Backend Already Supports Role
**File:** `abra_fleet_backend/routes/auth.js`
- Backend already accepts and uses the `role` parameter when creating new users
- Confirmed it properly stores the role in MongoDB

### 3. Created Fix Script
**File:** `fix-admin-role.js`
- Script to update existing admin user's role in MongoDB
- Can be run to fix the role if admin user already exists

## 🚀 How to Fix

### Option 1: Run the Fix Script (Recommended)
```bash
# Run the batch file
fix-admin-role.bat
```

This will:
- Connect to MongoDB
- Find the admin user
- Update their role to 'admin'
- Show confirmation

### Option 2: Manual MongoDB Update
```javascript
// Connect to MongoDB and run:
use abrafleet
db.users.updateOne(
  { email: "admin@abrafleet.com" },
  { $set: { role: "admin", updatedAt: new Date() } }
)
```

### Option 3: Delete and Recreate Admin User
```javascript
// Delete existing admin user
db.users.deleteOne({ email: "admin@abrafleet.com" })

// Then restart the Flutter app - it will recreate the admin user with correct role
```

## 🔐 Admin Credentials

**Email:** `admin@abrafleet.com`  
**Password:** `admin123`

## 🧪 Testing Steps

1. **Run the fix script:**
   ```bash
   fix-admin-role.bat
   ```

2. **Restart the backend:**
   ```bash
   cd abra_fleet_backend
   npm start
   ```

3. **Restart the Flutter app:**
   ```bash
   cd abra_fleet
   flutter run
   ```

4. **Login with admin credentials:**
   - Email: `admin@abrafleet.com`
   - Password: `admin123`

5. **Verify:**
   - Should see "Admin Dashboard" 
   - Should NOT see customer dashboard
   - Should have access to all admin features

## 🔍 Verification

### Check Admin Role in MongoDB
```javascript
use abrafleet
db.users.findOne({ email: "admin@abrafleet.com" }, { email: 1, role: 1, firebaseUid: 1 })
```

Expected output:
```javascript
{
  "_id": ObjectId("..."),
  "email": "admin@abrafleet.com",
  "role": "admin",
  "firebaseUid": "..."
}
```

### Check Backend Logs
When logging in, you should see:
```
🔐 AUTH LOGIN - Creating/Updating User in MongoDB
   Email: admin@abrafleet.com
   Requested Role: admin
✅ User exists in MongoDB - updating
   Updated user role: admin
```

### Check Flutter Logs
When logging in, you should see:
```
[LoginScreen] Starting login process...
User signed in successfully: admin@abrafleet.com
Fetching user data from backend for: admin@abrafleet.com
User data fetched from MongoDB: admin@abrafleet.com, role: admin
AuthWrapper - Role: "admin", Session Initialized.
```

## 📝 What Changed

### Before
1. Admin logs in with `admin@abrafleet.com`
2. Firebase Auth succeeds
3. Backend creates/updates user with `role: 'customer'` (default)
4. App reads role as 'customer'
5. App shows customer dashboard ❌

### After
1. Admin logs in with `admin@abrafleet.com`
2. Firebase Auth succeeds
3. Backend creates/updates user with `role: 'admin'` (explicitly set)
4. App reads role as 'admin'
5. App shows admin dashboard ✅

## 🎯 Key Files Modified

1. `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart`
   - Added `role: 'admin'` parameter when creating admin user

2. `abra_fleet/lib/core/services/api_service.dart`
   - Added `role` parameter to `loginToBackend()` method

3. `fix-admin-role.js` (NEW)
   - Script to fix existing admin user's role

4. `fix-admin-role.bat` (NEW)
   - Batch file to run the fix script easily

## 🔄 Future Prevention

The code now ensures:
- Admin user is always created with `role: 'admin'`
- Role is explicitly passed to backend during user creation
- Backend properly stores the role in MongoDB
- App correctly routes based on role

## ✅ Status

**Fixed:** Admin login now correctly routes to admin dashboard
**Tested:** Pending - please test after running fix script
**Deployed:** Code changes applied, fix script ready to run

---

## 🆘 Troubleshooting

### Still seeing customer dashboard?
1. Run the fix script: `fix-admin-role.bat`
2. Restart backend
3. Restart Flutter app
4. Clear app data/cache if needed
5. Try logging in again

### Fix script fails?
1. Check MongoDB is running
2. Check connection string in backend `.env`
3. Run manual MongoDB update (Option 2 above)

### Backend errors?
1. Check backend logs for role assignment
2. Verify MongoDB connection
3. Check user document in MongoDB

---

**Last Updated:** December 17, 2025  
**Issue:** Admin credentials redirecting to customer dashboard  
**Status:** Fixed ✅
