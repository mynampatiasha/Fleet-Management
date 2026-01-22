# Migration Quick Start - 3 Simple Steps

## ✅ All Code Changes Complete!

Everything is ready. Just follow these 3 steps:

---

## Step 1: Migrate Data (5 minutes)

```bash
cd abra_fleet_backend
node scripts/migrate_firestore_to_mongodb.js
```

**What it does**: Copies all users from Firestore to MongoDB

**Expected output**: 
```
✅ Successfully migrated: X users
📊 Total users in MongoDB: X
```

---

## Step 2: Restart Backend (1 minute)

```bash
# Stop current backend (Ctrl+C)
# Then start again:
cd abra_fleet_backend
npm start
```

**What it does**: Loads new code that uses MongoDB instead of Firestore

**Expected output**:
```
🚀 ABRA FLEET BACKEND SERVER STARTED
📍 Server: http://localhost:3000
✅ Connected to MongoDB Atlas!
```

---

## Step 3: Update Flutter & Test (2 minutes)

```bash
cd abra_fleet
flutter pub get
flutter run
```

**What it does**: 
- Removes Firestore dependency
- Runs app with new MongoDB-based auth

**Test**: Login with `admin@abrafleet.com` / `admin123`

**Expected**: Login works, no errors, role is correct

---

## That's It! 🎉

Your app now uses MongoDB as the single source of truth.

**What changed:**
- ✅ User data in MongoDB (not Firestore)
- ✅ Roles in MongoDB (not Firestore)
- ✅ FCM tokens in MongoDB (not Firestore)
- ✅ Firebase Auth still works (for login tokens)
- ✅ Firebase Messaging still works (for notifications)

**What to check:**
- [ ] Existing users can login
- [ ] New users can signup
- [ ] Profile updates work
- [ ] Notifications work
- [ ] No Firestore errors

---

## Quick Verification

### Check MongoDB has users:
```javascript
// In MongoDB Compass
use abra_fleet
db.users.countDocuments()
// Should show number of users
```

### Check backend logs:
```
✅ User role (MongoDB): admin
✅ Profile updated successfully
```

### Check Flutter console:
```
✅ User data fetched from MongoDB: email, role: admin
```

---

## If Something Goes Wrong

1. **Check backend is running**: `http://localhost:3000/health`
2. **Check MongoDB connection**: Look for "Connected to MongoDB" in logs
3. **Re-run migration**: `node scripts/migrate_firestore_to_mongodb.js`
4. **Check detailed guide**: See `MIGRATION_TESTING_GUIDE.md`

---

## Files Changed Summary

**Backend (5 files):**
- ✅ `routes/auth.js` (new)
- ✅ `routes/admin-users.js` (new)
- ✅ `middleware/auth.js` (updated)
- ✅ `index.js` (updated)
- ✅ `scripts/migrate_firestore_to_mongodb.js` (new)

**Flutter (4 files):**
- ✅ `api_service.dart` (updated)
- ✅ `user_entity.dart` (updated)
- ✅ `firebase_auth_repository_impl.dart` (updated)
- ✅ `pubspec.yaml` (updated)

---

## Success! ✅

Migration complete. Your app is now running on MongoDB as the single source of truth!

**Benefits:**
- No more sync issues
- Faster queries
- Better admin control
- Simpler architecture
- Cost savings

**For detailed testing**: See `MIGRATION_TESTING_GUIDE.md`
