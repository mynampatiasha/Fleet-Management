// Fix Notification Synchronization Issue
// This script syncs existing MongoDB notifications to Firebase Realtime Database

const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');
const path = require('path');

// Configuration
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

// Test user (you can change this or make it sync for all users)
const TARGET_USER_ID = 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2'; // Set to null to sync all users

// Initialize Firebase Admin
let firebaseInitialized = false;

function initializeFirebase() {
    if (firebaseInitialized) return;
    
    try {
        // Try to find the service account file
        const serviceAccountPath = path.join(__dirname, 'abra_fleet_backend', 'abra-fleet-firebase-adminsdk-ey4oj-c4b8b8b8b8.json');
        
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://abra-fleet-default-rtdb.asia-southeast1.firebasedatabase.app/'
        });
        
        console.log('✅ Firebase Admin initialized successfully');
        firebaseInitialized = true;
    } catch (error) {
        console.log('❌ Firebase Admin initialization failed:', error.message);
        console.log('   Make sure the service account file exists');
        throw error;
    }
}

async function syncNotificationsToFirebase() {
    console.log('\n' + '🔄'.repeat(60));
    console.log('🔄 NOTIFICATION SYNCHRONIZATION STARTED');
    console.log('🔄'.repeat(60));
    console.log('Target User:', TARGET_USER_ID || 'ALL USERS');
    console.log('Timestamp:', new Date().toISOString());
    console.log('🔄'.repeat(60) + '\n');

    // Initialize Firebase
    initializeFirebase();
    
    const mongoClient = new MongoClient(MONGODB_URI);
    
    try {
        // Connect to MongoDB
        await mongoClient.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = mongoClient.db(DATABASE_NAME);
        const firebaseDb = admin.database();
        
        // Build query
        const query = TARGET_USER_ID ? { userId: TARGET_USER_ID } : {};
        
        // Get notifications from MongoDB
        console.log('\n📋 STEP 1: Fetching notifications from MongoDB');
        console.log('─'.repeat(80));
        
        const notifications = await db.collection('notifications')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📊 Found ${notifications.length} notifications to sync`);
        
        if (notifications.length === 0) {
            console.log('⚠️  No notifications to sync');
            return;
        }
        
        // Group notifications by user
        const notificationsByUser = {};
        notifications.forEach(notification => {
            const userId = notification.userId;
            if (!notificationsByUser[userId]) {
                notificationsByUser[userId] = [];
            }
            notificationsByUser[userId].push(notification);
        });
        
        console.log(`👥 Notifications grouped by ${Object.keys(notificationsByUser).length} users`);
        
        // Sync each user's notifications
        console.log('\n📋 STEP 2: Syncing to Firebase Realtime Database');
        console.log('─'.repeat(80));
        
        let totalSynced = 0;
        let totalErrors = 0;
        
        for (const [userId, userNotifications] of Object.entries(notificationsByUser)) {
            console.log(`\n👤 Syncing ${userNotifications.length} notifications for user: ${userId}`);
            
            try {
                // Check if user already has notifications in Firebase RTDB
                const existingRef = firebaseDb.ref(`notifications/${userId}`);
                const existingSnapshot = await existingRef.once('value');
                const existingNotifications = existingSnapshot.val() || {};
                
                console.log(`   Existing RTDB notifications: ${Object.keys(existingNotifications).length}`);
                
                // Prepare batch update
                const updates = {};
                let newNotifications = 0;
                let skippedNotifications = 0;
                
                for (const notification of userNotifications) {
                    const notificationId = notification._id.toString();
                    const firebasePath = `notifications/${userId}/${notificationId}`;
                    
                    // Check if notification already exists in Firebase RTDB
                    if (existingNotifications[notificationId]) {
                        skippedNotifications++;
                        continue;
                    }
                    
                    // Prepare Firebase notification object
                    const firebaseNotification = {
                        id: notificationId,
                        userId: notification.userId,
                        type: notification.type,
                        title: notification.title,
                        body: notification.body,
                        data: notification.data || {},
                        metadata: notification.metadata || {},
                        isRead: notification.isRead || false,
                        priority: notification.priority || 'normal',
                        category: notification.category || 'general',
                        createdAt: notification.createdAt.toISOString(),
                        expiresAt: notification.expiresAt ? notification.expiresAt.toISOString() : null
                    };
                    
                    updates[firebasePath] = firebaseNotification;
                    newNotifications++;
                }
                
                // Perform batch update
                if (Object.keys(updates).length > 0) {
                    await firebaseDb.ref().update(updates);
                    console.log(`   ✅ Synced ${newNotifications} new notifications`);
                    console.log(`   ⏭️  Skipped ${skippedNotifications} existing notifications`);
                    totalSynced += newNotifications;
                } else {
                    console.log(`   ⏭️  All ${userNotifications.length} notifications already exist in Firebase RTDB`);
                }
                
            } catch (userError) {
                console.log(`   ❌ Error syncing user ${userId}:`, userError.message);
                totalErrors++;
            }
        }
        
        // ========== STEP 3: Verification ==========
        console.log('\n📋 STEP 3: Verification');
        console.log('─'.repeat(80));
        
        if (TARGET_USER_ID) {
            // Verify specific user
            const verifyRef = firebaseDb.ref(`notifications/${TARGET_USER_ID}`);
            const verifySnapshot = await verifyRef.once('value');
            const verifiedNotifications = verifySnapshot.val();
            
            if (verifiedNotifications) {
                const count = Object.keys(verifiedNotifications).length;
                console.log(`✅ Verification: ${count} notifications found in Firebase RTDB for user ${TARGET_USER_ID}`);
                
                // Show sample notifications
                const sampleNotifications = Object.entries(verifiedNotifications)
                    .slice(0, 3)
                    .map(([id, data]) => ({ id, ...data }));
                
                console.log('\n📋 Sample synced notifications:');
                sampleNotifications.forEach((notif, index) => {
                    console.log(`   ${index + 1}. "${notif.title}" (${notif.type})`);
                    console.log(`      ID: ${notif.id}`);
                    console.log(`      Created: ${notif.createdAt}`);
                });
            } else {
                console.log(`❌ Verification failed: No notifications found in Firebase RTDB for user ${TARGET_USER_ID}`);
            }
        }
        
        // ========== STEP 4: Summary ==========
        console.log('\n📋 STEP 4: Summary');
        console.log('─'.repeat(80));
        
        console.log('📊 Synchronization Results:');
        console.log(`   Total notifications processed: ${notifications.length}`);
        console.log(`   Successfully synced: ${totalSynced}`);
        console.log(`   Errors: ${totalErrors}`);
        console.log(`   Users processed: ${Object.keys(notificationsByUser).length}`);
        
        if (totalSynced > 0) {
            console.log('\n✅ SYNCHRONIZATION SUCCESSFUL!');
            console.log('🎉 Floating notifications should now work');
            console.log('🎉 Real-time listeners should receive notifications');
            
            console.log('\n📱 Next Steps:');
            console.log('1. Test the app - floating notifications should appear');
            console.log('2. Register FCM tokens for push notifications');
            console.log('3. Verify notification screen shows notifications');
        } else if (totalErrors === 0) {
            console.log('\n✅ All notifications were already synced');
            console.log('🤔 If notifications still don\'t work, check:');
            console.log('1. FCM token registration');
            console.log('2. Frontend authentication');
            console.log('3. Real-time listener setup');
        } else {
            console.log('\n❌ Synchronization had errors');
            console.log('🔍 Check the error messages above');
        }
        
    } catch (error) {
        console.error('💥 FATAL ERROR:', error);
    } finally {
        await mongoClient.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '🔄'.repeat(60));
        console.log('✅ SYNCHRONIZATION COMPLETED');
        console.log('🔄'.repeat(60) + '\n');
    }
}

// Run the synchronization
syncNotificationsToFirebase().catch(error => {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
});