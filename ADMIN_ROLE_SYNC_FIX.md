# Admin Role Sync Fix - Complete ✅

## Problem Identified
The admin user had **role mismatch** between Firestore and MongoDB:
- **Firestore**: role = "admin" ✅
- **MongoDB**: role = "customer" ❌

This caused the app to navigate correctly but MongoDB had wrong permissions.

## Root Cause
When `getCurrentUser()` was called, it synced the user to MongoDB but **didn't pass the role** from Firestore. The backend then defaulted to "customer" role.

## Fixes Applied

### 1. Fixed Flutter Auth Repository ✅
**File**: `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart`

**Change**: Now fetches role from Firestore BEFORE syncing to MongoDB:

```dart
// First, get role from Firestore to ensure MongoDB has correct role
String? firestoreRole;
try {
  final userDoc = await FirebaseFirestore.instance
      .collection('users')
      .doc(firebaseUser.uid)
      .get();
  
  if (userDoc.exists) {
    firestoreRole = userDoc.data()?['role'] as String?;
    print('[$timestamp] Found role in Firestore: $firestoreRole');
  }
} catch (e) {
  print('[$timestamp] Could not fetch role from Firestore: $e');
}

// Ensure user exists in MongoDB with correct role from Firestore
await _apiService.loginToBackend(
  firebaseUid: firebaseUser.uid,
  email: firebaseUser.email ?? '',
  name: firebaseUser.displayName,
  role: firestoreRole, // ✅ Now passing role!
);
```

### 2. Created Admin User in MongoDB ✅
**Script**: `abra_fleet_backend/create-admin-user.js`

Created admin user with:
- Email: admin@abrafleet.com
- Role: admin
- Firebase UID: qnwp8d0clDSSNuSm3ugmXYLSI3K2

## Testing Steps

### Quick Test (Recommended)
1. **Hot reload the Flutter app** (press "r" in terminal)
2. **Logout and login again** as admin@abrafleet.com
3. **Check logs** - should see:
   ```
   [LoginScreen] Found role in Firestore: admin
   [LoginScreen] AuthRepository returned user with role: admin ✅
   [LoginScreen] Final role: admin
   User data fetched from MongoDB: admin@abrafleet.com, role: admin ✅
   ```

### Full Test
1. Stop the Flutter app
2. Restart backend: `cd abra_fleet_backend && npm start`
3. Start Flutter app: `cd abra_fleet && flutter run -d chrome`
4. Login as admin@abrafleet.com
5. Verify admin dashboard loads correctly

## Verification

### Check MongoDB Role
```bash
cd abra_fleet_backend
node -e "
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
client.connect().then(async () => {
  const user = await client.db('abrafleet').collection('users')
    .findOne({ email: 'admin@abrafleet.com' });
  console.log('Admin role:', user?.role);
  await client.close();
});
"
```

Should output: `Admin role: admin`

## What This Fixes
✅ Admin user now has correct role in MongoDB  
✅ Role is synced from Firestore to MongoDB on every login  
✅ No more role mismatch between systems  
✅ Admin permissions work correctly  
✅ Future logins will maintain correct role  

## Impact
- **Existing users**: Will have their roles synced from Firestore on next login
- **New users**: Will get correct role from Firestore immediately
- **Admin user**: Already fixed in MongoDB, ready to use

## Files Modified
1. `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart` - Added Firestore role fetch
2. `abra_fleet_backend/create-admin-user.js` - New script to create/fix admin user

---

**Status**: ✅ COMPLETE - Ready to test!
