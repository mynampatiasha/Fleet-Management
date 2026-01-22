# Firestore to MongoDB Migration - COMPLETE ✅

## Migration Summary

Successfully migrated from Firestore to MongoDB as the single source of truth for user data.

**Date**: December 17, 2025  
**Status**: ✅ COMPLETE - Ready for Testing

---

## What Was Changed

### Backend Changes ✅

1. **Created `routes/auth.js`**
   - POST `/api/auth/login` - Login and create/update user in MongoDB
   - GET `/api/auth/profile` - Get user profile from MongoDB
   - PUT `/api/auth/profile` - Update user profile in MongoDB
   - POST `/api/auth/fcm-token` - Update FCM token in MongoDB

2. **Created `routes/admin-users.js`**
   - GET `/api/admin/users` - List all users (admin only)
   - GET `/api/admin/users/:userId` - Get single user (admin only)
   - POST `/api/admin/users` - Create new user (admin only)
   - PUT `/api/admin/users/:userId` - Update user (admin only)
   - DELETE `/api/admin/users/:userId` - Delete user (admin only)

3. **Updated `middleware/auth.js`**
   - Changed priority: MongoDB first (no more Firestore)
   - Auto-creates users in MongoDB if they don't exist
   - Stores role, organizationId, and mongoId in req.user

4. **Updated `index.js`**
   - Added auth routes
   - Added admin user management routes
   - Proper route ordering (public before protected)

5. **Created `scripts/migrate_firestore_to_mongodb.js`**
   - Migration script to copy all users from Firestore to MongoDB
   - Preserves all user data: email, name, role, phone, fcmToken, etc.
   - Adds migration metadata

### Flutter Changes ✅

1. **Updated `api_service.dart`**
   - Added `loginToBackend()` - Sync user to MongoDB after Firebase auth
   - Added `getProfile()` - Fetch user profile from MongoDB
   - Added `updateProfile()` - Update user profile in MongoDB
   - Added `updateFcmToken()` - Update FCM token in MongoDB
   - Already had auto-token injection (no changes needed)

2. **Updated `user_entity.dart`**
   - Added `firebaseUid` field (stores Firebase Auth UID)
   - Added `organizationId` field
   - Removed Firestore dependency
   - Added `fromJson()` factory for backend API responses
   - Added `toJson()` method for API requests
   - Updated equality and hashCode

3. **Updated `firebase_auth_repository_impl.dart`**
   - Removed all Firestore imports and code
   - Now uses `ApiService` to communicate with backend
   - User stream fetches from MongoDB via backend API
   - Profile updates go to MongoDB via backend API
   - Sign up creates user in MongoDB via backend API
   - Admin user initialization uses backend API

4. **Updated `pubspec.yaml`**
   - Removed `cloud_firestore` dependency
   - Kept `firebase_core`, `firebase_auth`, `firebase_messaging`

---

## Architecture After Migration

```
┌─────────────────┐
│   Flutter App   │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Firebase Auth  │                  │  Firebase FCM   │
│  (Tokens Only)  │                  │ (Notifications) │
└────────┬────────┘                  └─────────────────┘
         │
         │ Get Token
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Node.js)      │
└────────┬────────┘
         │
         │ Verify Token
         │ Store/Retrieve Data
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│ (Single Source  │
│   of Truth)     │
└─────────────────┘
```

**Key Points:**
- Firebase Auth: Only for authentication tokens
- Firebase FCM: Only for push notifications
- MongoDB: ALL user data (roles, profiles, FCM tokens, etc.)
- No more Firestore for data storage

---

## Next Steps - TESTING REQUIRED

### 1. Run Migration Script

```bash
cd abra_fleet_backend
node scripts/migrate_firestore_to_mongodb.js
```

This will:
- Copy all users from Firestore to MongoDB
- Preserve all data (email, name, role, phone, fcmToken)
- Skip users that already exist in MongoDB
- Show migration summary

### 2. Restart Backend

```bash
cd abra_fleet_backend
npm start
```

The backend will now:
- Use MongoDB as the single source of truth
- Auto-create users in MongoDB on first login
- Verify tokens and fetch roles from MongoDB

### 3. Update Flutter Dependencies

```bash
cd abra_fleet
flutter pub get
```

This will:
- Remove cloud_firestore package
- Keep firebase_core, firebase_auth, firebase_messaging

### 4. Test the Application

#### Test Checklist:

- [ ] **Existing User Login**
  - Login with existing account (e.g., admin@abrafleet.com)
  - Check that user data loads correctly
  - Verify role is correct (admin, driver, customer, client)

- [ ] **New User Signup**
  - Create a new user account
  - Verify user is created in MongoDB (not Firestore)
  - Check default role is 'customer'

- [ ] **User Profile**
  - View user profile
  - Update name and phone number
  - Verify changes save to MongoDB
  - Check UI updates immediately

- [ ] **Admin Functions** (login as admin)
  - View all users
  - Create new user
  - Update user role
  - Delete user (not yourself)

- [ ] **Push Notifications**
  - Send a test notification
  - Verify FCM token is in MongoDB
  - Check notification is received

- [ ] **Role-Based Access**
  - Login as admin - should see admin features
  - Login as driver - should see driver dashboard
  - Login as customer - should see customer features
  - Login as client - should see client features

- [ ] **App Stability**
  - No crashes on startup
  - No Firestore errors in console
  - Smooth navigation between screens
  - Fast data loading

---

## Verification Commands

### Check MongoDB Users

```javascript
// In MongoDB Compass or mongo shell
use abra_fleet
db.users.find().pretty()
db.users.countDocuments()
```

### Check Backend Logs

Look for these log messages:
- `✅ User role (MongoDB): admin`
- `✅ User created in MongoDB with customer role`
- `✅ Profile updated successfully`

### Check Flutter Logs

Look for these log messages:
- `✅ User data fetched from MongoDB: email, role: admin`
- `[FirebaseAuth] Profile updated successfully`
- `Successfully signed out from Firebase.`

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

1. **Backend**: Restore `middleware/auth.js` to check Firestore first
2. **Flutter**: Re-add `cloud_firestore` to `pubspec.yaml`
3. **Flutter**: Restore old `firebase_auth_repository_impl.dart` from git history

**Note**: MongoDB data is preserved, so you won't lose anything.

---

## What Still Uses Firebase

✅ **Firebase Auth** - For login tokens (required)  
✅ **Firebase Messaging** - For push notifications (required)  
✅ **Firebase Storage** - For file uploads (if you use it)  
✅ **Firebase Database** - For real-time features (if you use it)  

❌ **Firestore** - Completely removed, replaced by MongoDB

---

## Benefits of This Migration

1. **Single Source of Truth** - No more sync issues between Firestore and MongoDB
2. **Faster Queries** - MongoDB is your main database, optimized for your use case
3. **Better Admin Control** - New admin endpoints for user management
4. **Consistent Data** - No Firestore/MongoDB mismatches
5. **Cost Savings** - No Firestore read/write costs for user data
6. **Simpler Architecture** - One database to manage

---

## Support

If you encounter any issues:

1. Check backend logs for errors
2. Check Flutter console for errors
3. Verify MongoDB connection is working
4. Ensure migration script ran successfully
5. Check that all users have `firebaseUid` field in MongoDB

---

## Files Modified

### Backend (4 files)
- ✅ `routes/auth.js` (created)
- ✅ `routes/admin-users.js` (created)
- ✅ `middleware/auth.js` (modified)
- ✅ `index.js` (modified)
- ✅ `scripts/migrate_firestore_to_mongodb.js` (created)

### Flutter (3 files)
- ✅ `lib/core/services/api_service.dart` (modified)
- ✅ `lib/features/auth/domain/entities/user_entity.dart` (modified)
- ✅ `lib/features/auth/data/repositories/firebase_auth_repository_impl.dart` (modified)
- ✅ `pubspec.yaml` (modified)

---

## Migration Complete! 🎉

The migration is complete and ready for testing. Follow the testing checklist above to verify everything works correctly.

**Remember**: Run the migration script first, then restart the backend, then test the app!
