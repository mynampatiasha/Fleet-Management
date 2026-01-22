# 🔄 OLD FIREBASE NOTIFICATIONS - MIGRATION GUIDE

**Your Question:** "Can old notifications from Firebase be visible in the new OneSignal/MongoDB system?"

**Answer:** ❌ **NO - They are NOT automatically visible**

**Solution:** ✅ **YES - We can migrate them!**

---

## 🎯 THE PROBLEM

### Before (Firebase):
- Notifications stored in **Firebase Firestore**
- Collection: `notifications` or similar
- Each user had their notifications in Firebase

### After (OneSignal + MongoDB):
- Notifications stored in **MongoDB**
- Collection: `onesignal_notifications`
- New notifications go to MongoDB

### Result:
- ❌ Old Firebase notifications are NOT visible in new system
- ❌ Users cannot see their notification history from before migration
- ❌ Two separate databases (Firebase + MongoDB)

---

## ✅ THE SOLUTION

We need to **migrate old Firebase notifications to MongoDB** so users can see their complete notification history.

---

## 📋 MIGRATION STEPS

### Step 1: Check if Firebase Notifications Exist

First, let's check if you still have Firebase notifications:

```javascript
// check-firebase-notifications.js
const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./path/to/serviceAccountKey.json'))
  });
}

const firestore = admin.firestore();

async function checkFirebaseNotifications() {
  try {
    console.log('🔍 Checking Firebase notifications...');
    
    // Check notifications collection
    const snapshot = await firestore.collection('notifications').limit(10).get();
    
    if (snapshot.empty) {
      console.log('❌ No notifications found in Firebase');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} notifications (showing first 10)`);
    console.log('\nSample notifications:');
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nID: ${doc.id}`);
      console.log(`  User: ${data.userId || 'N/A'}`);
      console.log(`  Type: ${data.type || 'N/A'}`);
      console.log(`  Title: ${data.title || 'N/A'}`);
      console.log(`  Created: ${data.createdAt || 'N/A'}`);
    });
    
    // Get total count
    const allSnapshot = await firestore.collection('notifications').get();
    console.log(`\n📊 Total notifications in Firebase: ${allSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error checking Firebase notifications:', error);
  }
}

checkFirebaseNotifications();
```

### Step 2: Migrate Firebase Notifications to MongoDB

```javascript
// migrate-firebase-notifications-to-mongodb.js
const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./path/to/serviceAccountKey.json'))
  });
}

const firestore = admin.firestore();

async function migrateNotifications() {
  let mongoClient;
  
  try {
    console.log('🚀 Starting Firebase to MongoDB notification migration...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    mongoClient = await MongoClient.connect(process.env.MONGODB_URI);
    const db = mongoClient.db('abra_fleet');
    const collection = db.collection('onesignal_notifications');
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get all Firebase notifications
    console.log('📥 Fetching Firebase notifications...');
    const snapshot = await firestore.collection('notifications').get();
    
    if (snapshot.empty) {
      console.log('❌ No notifications found in Firebase');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} notifications in Firebase\n`);
    
    // Migrate each notification
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const doc of snapshot.docs) {
      try {
        const firebaseData = doc.data();
        
        // Check if already migrated
        const existing = await collection.findOne({ 
          firebaseId: doc.id 
        });
        
        if (existing) {
          console.log(`⏭️  Skipping ${doc.id} (already migrated)`);
          skipped++;
          continue;
        }
        
        // Transform Firebase notification to MongoDB format
        const mongoNotification = {
          // Original Firebase ID for reference
          firebaseId: doc.id,
          
          // User information
          userId: firebaseData.userId || firebaseData.uid || 'unknown',
          userRole: firebaseData.userRole || firebaseData.role || 'customer',
          
          // Notification content
          type: firebaseData.type || 'system',
          title: firebaseData.title || 'Notification',
          message: firebaseData.message || firebaseData.body || '',
          body: firebaseData.body || firebaseData.message || '',
          
          // Additional data
          data: firebaseData.data || {},
          priority: firebaseData.priority || 'normal',
          category: firebaseData.category || 'general',
          
          // Status
          isRead: firebaseData.isRead || firebaseData.read || false,
          
          // Timestamps
          createdAt: firebaseData.createdAt?.toDate?.() || 
                     firebaseData.timestamp?.toDate?.() || 
                     new Date(firebaseData.createdAt) ||
                     new Date(),
          readAt: firebaseData.readAt?.toDate?.() || null,
          
          // Migration metadata
          migratedFrom: 'firebase',
          migratedAt: new Date()
        };
        
        // Insert into MongoDB
        await collection.insertOne(mongoNotification);
        
        console.log(`✅ Migrated: ${doc.id} (${mongoNotification.type})`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${doc.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${snapshot.size}`);
    console.log('='.repeat(60));
    
    if (migrated > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('📱 Users can now see their old notifications in the app');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('\n📡 MongoDB connection closed');
    }
  }
}

// Run migration
migrateNotifications();
```

### Step 3: Verify Migration

```javascript
// verify-notification-migration.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verifyMigration() {
  let mongoClient;
  
  try {
    console.log('🔍 Verifying notification migration...\n');
    
    // Connect to MongoDB
    mongoClient = await MongoClient.connect(process.env.MONGODB_URI);
    const db = mongoClient.db('abra_fleet');
    const collection = db.collection('onesignal_notifications');
    
    // Count total notifications
    const total = await collection.countDocuments();
    console.log(`📊 Total notifications in MongoDB: ${total}`);
    
    // Count migrated notifications
    const migrated = await collection.countDocuments({ 
      migratedFrom: 'firebase' 
    });
    console.log(`🔄 Migrated from Firebase: ${migrated}`);
    
    // Count new notifications
    const newNotifications = await collection.countDocuments({ 
      migratedFrom: { $exists: false } 
    });
    console.log(`🆕 New notifications: ${newNotifications}`);
    
    // Sample migrated notifications
    console.log('\n📋 Sample migrated notifications:');
    const samples = await collection
      .find({ migratedFrom: 'firebase' })
      .limit(5)
      .toArray();
    
    samples.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   User: ${notif.userId}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Created: ${notif.createdAt}`);
      console.log(`   Firebase ID: ${notif.firebaseId}`);
    });
    
    // Check notifications by user
    console.log('\n👥 Notifications by user:');
    const userCounts = await collection.aggregate([
      { $match: { migratedFrom: 'firebase' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    userCounts.forEach(user => {
      console.log(`   ${user._id}: ${user.count} notifications`);
    });
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

verifyMigration();
```

---

## 🚀 HOW TO RUN MIGRATION

### Step 1: Install Dependencies (if needed)
```bash
cd abra_fleet_backend
npm install firebase-admin
```

### Step 2: Check Firebase Notifications
```bash
node check-firebase-notifications.js
```

### Step 3: Run Migration
```bash
node migrate-firebase-notifications-to-mongodb.js
```

### Step 4: Verify Migration
```bash
node verify-notification-migration.js
```

---

## ✅ AFTER MIGRATION

### What Users Will See:

1. **Complete Notification History:**
   - Old notifications from Firebase
   - New notifications from OneSignal
   - All in one place!

2. **Seamless Experience:**
   - Users open notification screen
   - See all notifications (old + new)
   - No difference between migrated and new

3. **Preserved Data:**
   - Original timestamps
   - Read/unread status
   - All notification content

---

## 🔍 TROUBLESHOOTING

### Issue 1: Firebase Collection Name Different

If your Firebase notifications are in a different collection:

```javascript
// Change this line:
const snapshot = await firestore.collection('notifications').get();

// To your collection name:
const snapshot = await firestore.collection('your_collection_name').get();
```

### Issue 2: Different Field Names

If your Firebase notifications have different field names:

```javascript
// Adjust the mapping in migrate script:
const mongoNotification = {
  userId: firebaseData.your_user_field || 'unknown',
  title: firebaseData.your_title_field || 'Notification',
  // ... adjust other fields
};
```

### Issue 3: Firebase Service Account

If you don't have Firebase service account key:

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Save as `serviceAccountKey.json`
5. Place in `abra_fleet_backend/` folder

---

## 📊 MIGRATION CHECKLIST

- [ ] Check if Firebase notifications exist
- [ ] Install firebase-admin package
- [ ] Get Firebase service account key
- [ ] Run check script to see notification count
- [ ] Run migration script
- [ ] Verify migration completed
- [ ] Test in app - open notification screen
- [ ] Confirm old notifications are visible
- [ ] (Optional) Delete Firebase notifications after verification

---

## ⚠️ IMPORTANT NOTES

1. **Backup First:**
   - Export Firebase notifications before migration
   - Keep Firebase data until verified

2. **Run Once:**
   - Migration script checks for duplicates
   - Safe to run multiple times
   - Already migrated notifications are skipped

3. **User ID Mapping:**
   - Ensure Firebase userId matches MongoDB userId
   - Check user ID format consistency

4. **Timestamps:**
   - Firebase timestamps converted to JavaScript Date
   - Preserves original creation time

---

## 🎯 SUMMARY

### Your Question:
> "Can old Firebase notifications be visible?"

### Answer:
❌ **Not automatically** - They're in different databases

### Solution:
✅ **Yes, after migration!**

**Steps:**
1. Run migration script
2. Old Firebase notifications → MongoDB
3. Users see complete history
4. Old + new notifications together

**Result:**
- ✅ Complete notification history
- ✅ Seamless user experience
- ✅ No data loss
- ✅ All notifications in one place

---

**Generated:** January 20, 2026  
**System:** Abra Fleet Management  
**Status:** Ready to migrate old notifications
