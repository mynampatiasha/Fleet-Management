# Admin Role Fix - FINAL SOLUTION ✅

## Problem
The admin user keeps showing as "customer" role in MongoDB even though:
- ✅ Firestore has role = "admin"
- ✅ MongoDB user was created with role = "admin"
- ❌ Backend was NOT updating role for existing users

## Root Cause
The backend's `/api/auth/login` endpoint had this logic:
```javascript
if (user exists) {
  // Update user but KEEP EXISTING ROLE (don't update it)
  updateData = { email, name, lastLogin };
  // ❌ Role was NOT being updated!
}
```

## Complete Fix Applied

### 1. Backend: Allow Role Updates ✅
**File**: `abra_fleet_backend/routes/auth.js`

**Changed**: Now updates role when provided by Flutter app:
```javascript
if (user exists) {
  const updateData = { email, name, lastLogin };
  
  // ✅ NEW: Update role if provided
  if (role) {
    updateData.role = role;
    console.log('   Updating role to:', role);
  }
  
  await db.collection('users').updateOne({ firebaseUid }, { $set: updateData });
}
```

### 2. Flutter: Pass Role from Firestore ✅
**File**: `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart`

**Changed**: Fetches role from Firestore before syncing to MongoDB:
```dart
// Get role from Firestore
String? firestoreRole;
final userDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(firebaseUser.uid)
    .get();
if (userDoc.exists) {
  firestoreRole = userDoc.data()?['role'] as String?;
}

// Pass role to MongoDB
await _apiService.loginToBackend(
  firebaseUid: firebaseUser.uid,
  email: firebaseUser.email ?? '',
  name: firebaseUser.displayName,
  role: firestoreRole, // ✅ Now passing role!
);
```

### 3. MongoDB: Admin User Created ✅
**Script**: `abra_fleet_backend/create-admin-user.js`

Admin user in MongoDB:
- Email: admin@abrafleet.com
- Role: admin ✅
- Firebase UID: qnwp8d0clDSSNuSm3ugmXYLSI3K2

## CRITICAL: Restart Backend Required! 🔴

The backend code was updated but **you need to restart it** for changes to take effect.

### How to Restart Backend

**Option 1: If running in terminal**
1. Press `Ctrl+C` to stop the backend
2. Run: `npm start` or `node index.js`

**Option 2: If running as service**
```bash
cd abra_fleet_backend
npm start
```

## Testing Steps

### After Backend Restart:

1. **Hot reload Flutter app** (press "r" in terminal)
2. **Logout** from the app
3. **Login again** as:
   - Email: admin@abrafleet.com
   - Password: admin123

4. **Check logs** - should now see:
   ```
   [2025-12-18T10:25:01.601] Found role in Firestore: admin ✅
   [2025-12-18T10:25:01.601] User data fetched from MongoDB: admin@abrafleet.com, role: admin ✅
   ```

5. **Verify navigation** - should go to Admin Dashboard, not Customer Dashboard

## Verification Commands

### Check MongoDB Role
```bash
cd abra_fleet_backend
node -e "
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
client.connect().then(async () => {
  const user = await client.db('abrafleet').collection('users')
    .findOne({ email: 'admin@abrafleet.com' });
  console.log('Email:', user?.email);
  console.log('Role:', user?.role);
  console.log('Firebase UID:', user?.firebaseUid);
  await client.close();
});
"
```

Should output:
```
Email: admin@abrafleet.com
Role: admin ✅
Firebase UID: qnwp8d0clDSSNuSm3ugmXYLSI3K2
```

## What This Fixes
✅ Backend now updates role when provided by Flutter  
✅ Flutter passes role from Firestore to MongoDB  
✅ Admin user has correct role in MongoDB  
✅ Role sync works for all users (not just admin)  
✅ Future logins will maintain correct role  

## Files Modified
1. `abra_fleet_backend/routes/auth.js` - Allow role updates for existing users
2. `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart` - Pass role from Firestore
3. `abra_fleet_backend/create-admin-user.js` - Script to create/fix admin user

## Admin Credentials
- **Email**: admin@abrafleet.com
- **Password**: admin123
- **Role**: admin (in both Firestore and MongoDB)

---

## 🔴 ACTION REQUIRED NOW:

1. **RESTART THE BACKEND SERVER** (critical!)
2. Hot reload Flutter app (press "r")
3. Logout and login again
4. Verify admin dashboard loads

**Status**: ✅ Code fixed, ⏳ Waiting for backend restart
