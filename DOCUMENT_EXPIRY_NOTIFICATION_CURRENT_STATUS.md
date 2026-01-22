# Document Expiry Notification System - Current Status

## ✅ What We've Done

### 1. Created Test Documents ✅
Successfully created 3 test documents with expiring dates:

**Vehicle: KA02CD5678**
- 📄 Test Insurance (Will Expire Soon)
  - Type: Insurance
  - Expiry Date: January 26, 2026
  - Days Until Expiry: 5 days
  - Status: 🟠 EXPIRING SOON
  - Should Notify: YES ✅

- 📄 Test PUC (EXPIRED)
  - Type: PUC
  - Expiry Date: January 20, 2026
  - Days Until Expiry: -1 day (EXPIRED)
  - Status: 🔴 EXPIRED
  - Should Notify: YES ✅

**Driver: Amit Singh**
- 📄 Test License (Will Expire Soon)
  - Type: Driving License
  - Expiry Date: January 24, 2026
  - Days Until Expiry: 3 days
  - Status: 🟠 EXPIRING SOON
  - Should Notify: YES ✅

### 2. Fixed Backend Endpoint ✅
- Updated `/api/notifications/check-document-expiry` to accept both `admin` and `super_admin` roles
- Updated `getAdminUsers()` function to find users with both `admin` and `super_admin` roles

### 3. Triggered Document Expiry Check ✅
- Successfully authenticated as admin@abrafleet.com
- Successfully triggered the document expiry check endpoint
- Backend responded with: "Document expiry check started in background"

---

## ⚠️ Current Issue

**Notifications are not appearing in the admin's notification list.**

### Possible Reasons:

1. **Admin User Not in Correct Collection**
   - The `getAdminUsers()` function looks in the `users` collection
   - But admin@abrafleet.com might be in the `employee_admins` collection
   - Need to check which collection stores admin users

2. **Firebase UID Mismatch**
   - OneSignal notifications require a valid Firebase UID
   - Admin user might not have a Firebase UID set
   - Need to verify admin user has `firebaseUid` field

3. **Backend Processing Not Complete**
   - The check runs asynchronously in the background
   - May need more time to process
   - Check backend console logs for processing messages

4. **Notification Already Sent Today**
   - System prevents duplicate notifications for the same document on the same day
   - If a notification was already sent today, it won't send again
   - Check `notifications` collection for today's notifications

---

## 🔍 What to Check Next

### 1. Check Backend Console Logs

Look for these messages in the backend console:

```
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
DOCUMENT EXPIRY CHECK STARTED
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
Timestamp: 2026-01-21T...

🚗 Checking vehicle documents...
   Found X total vehicles

👤 Checking driver documents...
   Found X total drivers

   📤 Sending expiring_soon notification for vehicle document: Test Insurance
      Entity: KA02CD5678
      Days until expiry: 5
      Notifying X admin(s)
      ✅ Sent to admin: admin@abrafleet.com

✅ Document expiry check completed successfully
```

### 2. Check Admin User Collection

Run this script to find where admin@abrafleet.com is stored:

```javascript
// check-admin-user-location.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkAdminUser() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  // Check users collection
  const userInUsers = await db.collection('users').findOne({ 
    email: 'admin@abrafleet.com' 
  });
  console.log('In users collection:', userInUsers ? 'YES ✅' : 'NO ❌');
  if (userInUsers) {
    console.log('  Role:', userInUsers.role);
    console.log('  Firebase UID:', userInUsers.firebaseUid || 'NOT SET ❌');
  }

  // Check employee_admins collection
  const userInEmployeeAdmins = await db.collection('employee_admins').findOne({ 
    email: 'admin@abrafleet.com' 
  });
  console.log('In employee_admins collection:', userInEmployeeAdmins ? 'YES ✅' : 'NO ❌');
  if (userInEmployeeAdmins) {
    console.log('  Role:', userInEmployeeAdmins.role);
    console.log('  Firebase UID:', userInEmployeeAdmins.firebaseUid || 'NOT SET ❌');
  }

  await client.close();
}

checkAdminUser().catch(console.error);
```

### 3. Check Recent Notifications

Run this to see if notifications were created:

```javascript
// check-recent-notifications.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkRecentNotifications() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications = await db.collection('notifications').find({
    $or: [
      { type: 'document_expired' },
      { type: 'document_expiring_soon' }
    ],
    createdAt: { $gte: today }
  }).toArray();

  console.log(`Found ${notifications.length} document expiry notifications today`);
  
  for (const notif of notifications) {
    console.log(`\n📬 ${notif.title}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   User ID: ${notif.userId}`);
    console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
  }

  await client.close();
}

checkRecentNotifications().catch(console.error);
```

---

## 🎯 Expected Behavior

When the document expiry check runs successfully, you should see:

### In Backend Console:
```
📄 DOCUMENT EXPIRY CHECK STARTED
🚗 Checking vehicle documents...
   Found 1 admin user(s)
   📤 Sending expiring_soon notification for vehicle document: Test Insurance
      Entity: KA02CD5678
      Days until expiry: 5
      Notifying 1 admin(s)
      ✅ Sent to admin: admin@abrafleet.com
✅ Document expiry check completed successfully
```

### In Admin App:
1. **Notifications Screen** (🔔 icon)
   - New notification: "⏰ Vehicle Document Expiring Soon"
   - Message: "Insurance for KA02CD5678 expires in 5 day(s)"

2. **Driver Management Dashboard**
   - Card: "Document Expiry Alerts"
   - Shows: "1 driver with expiring documents"

3. **Vehicle Master**
   - Vehicle KA02CD5678 shows 🟠 orange indicator
   - Filter "Expiring Soon" shows this vehicle

4. **Admin Shell Floating Notification**
   - Popup appears: "🔔 Document Expiry Alert"
   - Shows: "Expired: 1 | Expiring Soon: 2"

---

## 🔧 Quick Fixes

### Fix 1: Update getAdminUsers() to Check Multiple Collections

```javascript
async function getAdminUsers() {
  try {
    if (!documentExpiryDb) {
      console.error('❌ Cannot get admin users: database connection not available');
      return [];
    }

    // Check both users and employee_admins collections
    const usersCollection = await documentExpiryDb.collection('users').find({ 
      $or: [{ role: 'admin' }, { role: 'super_admin' }]
    }).toArray();

    const employeeAdminsCollection = await documentExpiryDb.collection('employee_admins').find({ 
      $or: [{ role: 'admin' }, { role: 'super_admin' }]
    }).toArray();

    const allAdmins = [...usersCollection, ...employeeAdminsCollection];

    console.log(`   Found ${allAdmins.length} admin user(s) (${usersCollection.length} in users, ${employeeAdminsCollection.length} in employee_admins)`);

    return allAdmins.map(user => ({
      uid: user.firebaseUid || user._id.toString(),
      email: user.email,
      displayName: user.name || user.email
    }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}
```

### Fix 2: Add Firebase UID to Admin User

If admin user doesn't have Firebase UID:

```javascript
// add-firebase-uid-to-admin.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function addFirebaseUidToAdmin() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  // Generate a Firebase-like UID
  const firebaseUid = 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(7);

  // Update in employee_admins collection
  await db.collection('employee_admins').updateOne(
    { email: 'admin@abrafleet.com' },
    { $set: { firebaseUid: firebaseUid } }
  );

  console.log('✅ Added Firebase UID to admin user:', firebaseUid);

  await client.close();
}

addFirebaseUidToAdmin().catch(console.error);
```

---

## 📊 System Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Test Documents Created | ✅ Working | 3 documents with expiring dates |
| Backend Endpoint | ✅ Working | Accepts admin and super_admin roles |
| Manual Trigger | ✅ Working | Successfully triggers check |
| Admin User Detection | ⚠️ Issue | May not be finding admin in correct collection |
| Notification Creation | ❓ Unknown | Need to check backend logs |
| Notification Display | ❌ Not Working | No notifications showing in app |

---

## 🚀 Next Steps

1. **Check backend console logs** to see if notifications are being sent
2. **Run check-admin-user-location.js** to find where admin user is stored
3. **Update getAdminUsers()** to check both collections if needed
4. **Verify Firebase UID** is set for admin user
5. **Trigger check again** after fixes
6. **Verify in app** that notifications appear

---

## 📝 Files Created

1. `trigger-document-check-now.js` - Script to manually trigger document expiry check ✅
2. `check-test-documents-status.js` - Script to verify test documents exist ✅
3. `create-test-expiring-document.js` - Script to create test documents ✅
4. `cleanup-test-documents.js` - Script to remove test documents (not yet run)

---

**Last Updated:** January 21, 2026  
**Status:** Test documents created, check triggered, investigating why notifications not appearing  
**Next Action:** Check backend logs and admin user collection
