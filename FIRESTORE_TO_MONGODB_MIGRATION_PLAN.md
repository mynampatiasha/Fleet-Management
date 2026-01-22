# Firestore to MongoDB Migration Plan

## Current State Analysis

### What You Already Have:
1. ✅ **Backend**: `routes/auth.js` - NEW (just created)
2. ✅ **Backend**: `routes/admin-users.js` - EXISTS (empty, needs content)
3. ✅ **Flutter**: `api_service.dart` - EXISTS (already has auto-token injection!)
4. ✅ **Flutter**: `firebase_auth_repository_impl.dart` - EXISTS (uses Firestore heavily)
5. ✅ **Backend**: `middleware/auth.js` - EXISTS (checks Firestore first, MongoDB fallback)

### Key Discovery:
Your `api_service.dart` **ALREADY** has automatic Firebase token injection! This is perfect - no changes needed there.

## Safe Migration Strategy

### Phase 1: Backend Updates (No Breaking Changes)

#### 1.1 Update `middleware/auth.js` 
**Change**: Reverse the priority - check MongoDB first, Firestore as fallback

**Current Logic:**
```javascript
// Try Firestore first
const firestoreUser = await admin.firestore()...
if (firestoreUser.exists) {
  req.user.role = userData.role;
} else if (req.db) {
  // Fallback to MongoDB
  const mongoUser = await req.db.collection('users')...
}
```

**New Logic:**
```javascript
// Try MongoDB first
if (req.db) {
  const mongoUser = await req.db.collection('users').findOne({ firebaseUid: req.user.uid });
  if (mongoUser) {
    req.user.role = mongoUser.role;
    req.user.mongoId = mongoUser._id;
  } else {
    // Fallback to Firestore (during migration period)
    const firestoreUser = await admin.firestore()...
  }
}
```

**Why Safe**: Existing Firestore users still work, new users go to MongoDB.

#### 1.2 Fill `routes/admin-users.js`
Create admin endpoints for user management (all MongoDB operations).

#### 1.3 Update `index.js`
Add the new auth routes:
```javascript
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Some routes need verifyToken, some don't
```

**Note**: Your existing `/api/auth` for password reset won't conflict - we'll merge them.

### Phase 2: Flutter Updates (Minimal Changes)

#### 2.1 Update `firebase_auth_repository_impl.dart`
**Option A - Hybrid Approach (Safest)**:
- Keep all existing Firestore code
- Add MongoDB sync after successful Firestore operations
- Example: After creating user in Firestore, also call backend `/api/auth/login`

**Option B - Full Migration**:
- Replace Firestore calls with backend API calls
- Keep only Firebase Auth (for tokens)
- Remove `cloud_firestore` dependency

**Recommendation**: Start with Option A, then move to Option B after testing.

#### 2.2 Add Backend Auth Calls to `api_service.dart`
Add these methods (they'll use existing auto-token injection):
```dart
// Login to backend (creates/updates user in MongoDB)
Future<Map<String, dynamic>> loginToBackend({
  required String firebaseUid,
  required String email,
  String? name,
}) async {
  return await post('/api/auth/login', body: {
    'firebaseUid': firebaseUid,
    'email': email,
    'name': name,
  });
}

// Get profile from MongoDB
Future<Map<String, dynamic>> getProfile() async {
  return await get('/api/auth/profile');
}

// Update profile in MongoDB
Future<Map<String, dynamic>> updateProfile({
  String? name,
  String? phone,
}) async {
  return await put('/api/auth/profile', body: {
    'name': name,
    'phone': phone,
  });
}

// Update FCM token in MongoDB
Future<void> updateFcmToken(String fcmToken) async {
  await post('/api/auth/fcm-token', body: {
    'fcmToken': fcmToken,
  });
}
```

### Phase 3: Data Migration

#### 3.1 Create Migration Script
`scripts/migrate_firestore_to_mongodb.js`:
- Connects to both Firestore and MongoDB
- Copies all users from Firestore to MongoDB
- Preserves: email, name, role, phone, fcmToken
- Adds: firebaseUid, createdAt, updatedAt

#### 3.2 Run Migration
```bash
cd abra_fleet_backend
node scripts/migrate_firestore_to_mongodb.js
```

#### 3.3 Verify Migration
Check MongoDB users collection - should have all Firestore users.

### Phase 4: Testing Checklist

- [ ] Existing users can login (Firestore fallback works)
- [ ] New users get created in MongoDB
- [ ] User roles work correctly
- [ ] Profile updates save to MongoDB
- [ ] FCM tokens update in MongoDB
- [ ] Notifications still work
- [ ] Admin can manage users via new endpoints

### Phase 5: Cleanup (After Everything Works)

1. Remove Firestore fallback from `middleware/auth.js`
2. Remove Firestore code from `firebase_auth_repository_impl.dart`
3. Remove `cloud_firestore` from `pubspec.yaml`
4. Keep Firebase Auth and FCM

## What Won't Break

✅ **Notifications**: FCM tokens already in MongoDB, Firebase Messaging stays  
✅ **Roles**: Will work better (single source of truth)  
✅ **Authentication**: Firebase Auth stays for tokens  
✅ **Existing Users**: Fallback to Firestore during migration  
✅ **API Calls**: Already have auto-token injection  

## What Will Improve

✅ **No More Sync Issues**: Single source of truth  
✅ **Faster Queries**: MongoDB is your main database  
✅ **Better Admin Control**: New admin user management endpoints  
✅ **Consistent Data**: No Firestore/MongoDB mismatches  

## Files to Create/Modify

### Create:
1. `abra_fleet_backend/routes/admin-users.js` (fill empty file)
2. `abra_fleet_backend/scripts/migrate_firestore_to_mongodb.js` (new)

### Modify:
1. `abra_fleet_backend/middleware/auth.js` (reverse priority)
2. `abra_fleet_backend/index.js` (add auth routes)
3. `abra_fleet/lib/core/services/api_service.dart` (add 4 methods)
4. `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart` (hybrid or full migration)

### Don't Touch:
- `routes/auth.js` (already created, looks good)
- Firebase config
- Existing routes
- Database connections

## Next Steps

**Please review this plan and confirm:**
1. Do you want **Hybrid Approach** (keep Firestore as backup) or **Full Migration** (remove Firestore completely)?
2. Should I proceed with Phase 1 (Backend Updates)?
3. Any concerns about the migration strategy?

**I'm waiting for your approval before making any changes to existing files.**
