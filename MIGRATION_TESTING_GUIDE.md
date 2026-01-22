# Migration Testing Guide - Step by Step

## ✅ Migration Status: COMPLETE

All code changes have been made successfully. Now it's time to test!

---

## Step 1: Run the Migration Script (10 minutes)

### 1.1 Open Terminal in Backend Folder

```bash
cd abra_fleet_backend
```

### 1.2 Run Migration Script

```bash
node scripts/migrate_firestore_to_mongodb.js
```

### 1.3 Expected Output

You should see:
```
================================================================================
FIRESTORE TO MONGODB USER MIGRATION
================================================================================

📡 Connecting to MongoDB...
✅ Connected to MongoDB

📡 Fetching users from Firestore...
✅ Found X users in Firestore

📝 Processing: admin@abrafleet.com
   ✅ Migrated successfully
      Email: admin@abrafleet.com
      Role: admin
      Name: System Administrator

... (more users) ...

================================================================================
MIGRATION SUMMARY
================================================================================
✅ Successfully migrated: X
⏭️  Skipped (already exist): Y
❌ Errors: 0
📊 Total processed: X
================================================================================

🔍 Verifying migration...
📊 Total users in MongoDB: X

📋 Sample users in MongoDB:
... (sample users) ...

✅ Migration completed successfully!
```

### 1.4 Verify in MongoDB

Open MongoDB Compass and check:
- Database: `abra_fleet`
- Collection: `users`
- Each user should have:
  - `firebaseUid` (Firebase Auth UID)
  - `email`
  - `name`
  - `role` (admin, driver, customer, client)
  - `fcmToken` (may be null)
  - `createdAt`
  - `migratedFrom: "firestore"`

---

## Step 2: Restart Backend (2 minutes)

### 2.1 Stop Current Backend

Press `Ctrl+C` in the terminal where backend is running.

### 2.2 Start Backend Again

```bash
cd abra_fleet_backend
npm start
```

### 2.3 Expected Output

You should see:
```
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
ABRA FLEET BACKEND SERVER STARTED
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
📍 Server: http://localhost:3000
📍 Health check: http://localhost:3000/health
🔍 Database test: http://localhost:3000/test-db
🔐 Auth test: http://localhost:3000/api/test-auth
🌐 WebSocket: ws://localhost:3000
📱 Mobile access: http://192.168.1.2:3000
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
```

---

## Step 3: Update Flutter Dependencies (2 minutes)

### 3.1 Open Terminal in Flutter Folder

```bash
cd abra_fleet
```

### 3.2 Get Dependencies

```bash
flutter pub get
```

### 3.3 Expected Output

You should see:
```
Running "flutter pub get" in abra_fleet...
Resolving dependencies...
... (dependency resolution) ...
Changed X dependencies!
```

**Note**: `cloud_firestore` should be removed from the list.

---

## Step 4: Test Existing User Login (5 minutes)

### 4.1 Run Flutter App

```bash
flutter run
```

Or use your IDE's run button.

### 4.2 Login with Admin Account

- Email: `admin@abrafleet.com`
- Password: `admin123`

### 4.3 Check Backend Logs

You should see:
```
🔐 AUTH MIDDLEWARE - Token Verification
─────────────────────────────────────────────────────────────────────────────
   Auth header present: true
   Path: /api/auth/profile
   Method: GET
   Token length: XXX
   Token preview: eyJhbGciOiJSUzI1Ni...
   Verifying with Firebase...
✅ Token verified successfully
   User UID: XXXXXXXXXX
   User Email: admin@abrafleet.com
   Fetching user role from MongoDB...
   User role (MongoDB): admin
   MongoDB ID: XXXXXXXXXX
─────────────────────────────────────────────────────────────────────────────
```

### 4.4 Check Flutter Console

You should see:
```
[2025-12-17T...] Auth state changed - Firebase User: admin@abrafleet.com
[2025-12-17T...] Fetching user data from backend for: admin@abrafleet.com
✅ User data fetched from MongoDB: admin@abrafleet.com, role: admin
```

### 4.5 Verify in App

- User should be logged in
- Role should be correct (admin sees admin features)
- No errors or crashes

---

## Step 5: Test Profile Update (3 minutes)

### 5.1 Go to Profile/Settings Screen

Navigate to the profile or account settings screen in your app.

### 5.2 Update Name or Phone

- Change your name to something else
- Update phone number
- Save changes

### 5.3 Check Backend Logs

You should see:
```
✏️  UPDATE USER PROFILE
─────────────────────────────────────────────────────────────────────────────
   Firebase UID: XXXXXXXXXX
   Update data: {name: New Name, phone: +1234567890}
✅ Profile updated successfully
─────────────────────────────────────────────────────────────────────────────
```

### 5.4 Verify Changes

- Refresh the app or logout/login
- Changes should persist
- Check MongoDB Compass - user document should be updated

---

## Step 6: Test New User Signup (5 minutes)

### 6.1 Logout from Current Account

### 6.2 Create New Account

- Email: `test@example.com`
- Password: `test123456`
- Name: `Test User`

### 6.3 Check Backend Logs

You should see:
```
🔐 AUTH LOGIN - Creating/Updating User in MongoDB
─────────────────────────────────────────────────────────────────────────────
   Firebase UID: XXXXXXXXXX
   Email: test@example.com
   Name: Test User
✅ New user - creating in MongoDB
   Created user with role: customer
✅ Login successful
─────────────────────────────────────────────────────────────────────────────
```

### 6.4 Verify in MongoDB

- Open MongoDB Compass
- Check `users` collection
- New user should exist with:
  - `firebaseUid`
  - `email: test@example.com`
  - `role: customer` (default)
  - `createdAt` (recent timestamp)

---

## Step 7: Test Admin User Management (5 minutes)

### 7.1 Login as Admin

- Email: `admin@abrafleet.com`
- Password: `admin123`

### 7.2 Test Admin Endpoints (Using Postman or curl)

#### Get All Users

```bash
# Get Firebase token first (from Flutter console or browser dev tools)
TOKEN="your_firebase_token_here"

curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "count": 5,
  "users": [
    {
      "id": "...",
      "firebaseUid": "...",
      "email": "admin@abrafleet.com",
      "name": "System Administrator",
      "role": "admin",
      ...
    },
    ...
  ]
}
```

#### Create New User

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newdriver@example.com",
    "password": "driver123",
    "name": "New Driver",
    "role": "driver",
    "phone": "+1234567890"
  }'
```

#### Update User Role

```bash
curl -X PUT http://localhost:3000/api/admin/users/FIREBASE_UID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

---

## Step 8: Test Push Notifications (5 minutes)

### 8.1 Ensure FCM Token is Set

When you login, the app should automatically update the FCM token in MongoDB.

### 8.2 Check Backend Logs

You should see:
```
🔔 UPDATE FCM TOKEN
─────────────────────────────────────────────────────────────────────────────
   Firebase UID: XXXXXXXXXX
   FCM Token: dXXXXXXXXXXXXXXXXX...
✅ FCM token updated successfully
─────────────────────────────────────────────────────────────────────────────
```

### 8.3 Verify in MongoDB

- Check user document
- `fcmToken` field should be populated
- `fcmTokenUpdatedAt` should be recent

### 8.4 Send Test Notification

Use your existing notification system to send a test notification. It should work exactly as before.

---

## Step 9: Test Role-Based Access (5 minutes)

### 9.1 Test Admin Role

- Login as admin
- Should see: admin dashboard, user management, all features

### 9.2 Test Driver Role

- Login as driver (or create one)
- Should see: driver dashboard, assigned trips, route details

### 9.3 Test Customer Role

- Login as customer (or create one)
- Should see: customer dashboard, trip history, booking features

### 9.4 Test Client Role

- Login as client (or create one)
- Should see: client dashboard, organization features

---

## Step 10: Verify No Firestore Errors (2 minutes)

### 10.1 Check Flutter Console

Look for any errors containing:
- `Firestore`
- `cloud_firestore`
- `FirebaseFirestore`

**There should be NONE.**

### 10.2 Check Backend Logs

Look for any errors containing:
- `Firestore`
- `firestore()`

**There should be NONE.**

---

## Common Issues and Solutions

### Issue 1: "User not found in MongoDB"

**Solution**: Run the migration script again:
```bash
node scripts/migrate_firestore_to_mongodb.js
```

### Issue 2: "Token verification failed"

**Solution**: 
1. Logout and login again
2. Check Firebase Auth is working
3. Verify backend can connect to Firebase

### Issue 3: "Profile update failed"

**Solution**:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Ensure user has valid firebaseUid

### Issue 4: "Role is null or undefined"

**Solution**:
1. Check MongoDB user document has `role` field
2. Run migration script if role is missing
3. Default role should be 'customer'

### Issue 5: "FCM token not updating"

**Solution**:
1. Check app has notification permissions
2. Verify backend route `/api/auth/fcm-token` is working
3. Check MongoDB user document for `fcmToken` field

---

## Success Criteria ✅

Your migration is successful if:

- [ ] All existing users can login
- [ ] New users can signup and are created in MongoDB
- [ ] User profiles load correctly with roles
- [ ] Profile updates save to MongoDB
- [ ] FCM tokens are stored in MongoDB
- [ ] Push notifications work
- [ ] Admin can manage users
- [ ] Role-based access works correctly
- [ ] No Firestore errors in console
- [ ] App is stable and fast

---

## Final Verification

### Check MongoDB

```javascript
// In MongoDB Compass or mongo shell
use abra_fleet

// Count users
db.users.countDocuments()

// Check all users have firebaseUid
db.users.find({ firebaseUid: { $exists: false } }).count()
// Should be 0

// Check all users have role
db.users.find({ role: { $exists: false } }).count()
// Should be 0

// Sample user
db.users.findOne({ email: "admin@abrafleet.com" })
```

### Check Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Abra Fleet Backend is running!",
  "timestamp": "2025-12-17T..."
}
```

---

## Congratulations! 🎉

If all tests pass, your migration is complete and successful!

**What you've achieved:**
- ✅ Single source of truth (MongoDB)
- ✅ No more Firestore sync issues
- ✅ Faster and more reliable data access
- ✅ Better admin control
- ✅ Cleaner architecture

**Next steps:**
- Monitor the app for a few days
- Check for any edge cases
- Consider removing Firestore completely from Firebase console (optional)
- Update your documentation

---

## Need Help?

If you encounter any issues:
1. Check the logs (backend and Flutter)
2. Verify MongoDB connection
3. Ensure migration script ran successfully
4. Review the error messages carefully
5. Check the `FIRESTORE_TO_MONGODB_MIGRATION_COMPLETE.md` document

**Remember**: The migration is reversible if needed. Your data is safe in MongoDB!
