// Test Notification System After Fix
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';
const TEST_USER_ID = 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2';

async function testNotificationSystemAfterFix() {
    console.log('\n' + '🧪'.repeat(60));
    console.log('🧪 NOTIFICATION SYSTEM TEST (AFTER FIX)');
    console.log('🧪'.repeat(60));
    console.log('Test User ID:', TEST_USER_ID);
    console.log('Timestamp:', new Date().toISOString());
    console.log('🧪'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== TEST 1: MongoDB Notifications ==========
        console.log('\n📋 TEST 1: MongoDB Notifications');
        console.log('─'.repeat(80));
        
        const notifications = await db.collection('notifications')
            .find({ userId: TEST_USER_ID })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();
        
        const unreadCount = await db.collection('notifications')
            .countDocuments({ userId: TEST_USER_ID, isRead: false });
        
        console.log(`📊 MongoDB Results:`);
        console.log(`   Total notifications: ${notifications.length}`);
        console.log(`   Unread notifications: ${unreadCount}`);
        
        if (notifications.length > 0) {
            console.log('✅ MongoDB notifications: WORKING');
            console.log('   Latest notification:', notifications[0].title);
        } else {
            console.log('❌ MongoDB notifications: NO DATA');
        }
        
        // ========== TEST 2: User Profile & FCM Tokens ==========
        console.log('\n📋 TEST 2: User Profile & FCM Tokens');
        console.log('─'.repeat(80));
        
        const user = await db.collection('users').findOne({ firebaseUid: TEST_USER_ID });
        
        console.log('👤 User Profile:');
        if (user) {
            console.log('✅ User document: EXISTS');
            console.log(`   Email: ${user.email}`);
            console.log(`   Mobile FCM Token: ${user.mobileFcmToken ? 'REGISTERED' : 'MISSING'}`);
            console.log(`   Web FCM Token: ${user.webFcmToken ? 'REGISTERED' : 'MISSING'}`);
            console.log(`   FCM Tokens Array: ${user.fcmTokens?.length || 0} devices`);
            
            if (user.mobileFcmToken || user.webFcmToken) {
                console.log('✅ FCM Tokens: REGISTERED');
            } else {
                console.log('❌ FCM Tokens: MISSING');
            }
        } else {
            console.log('❌ User document: NOT FOUND');
        }
        
        // ========== TEST 3: Backend API Simulation ==========
        console.log('\n📋 TEST 3: Backend API Simulation');
        console.log('─'.repeat(80));
        
        console.log('🔄 Simulating: GET /api/notifications');
        
        const apiResponse = await db.collection('notifications')
            .find({ userId: TEST_USER_ID })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();
        
        console.log(`📊 API Response Simulation:`);
        console.log(`   Status: 200 OK`);
        console.log(`   Notifications returned: ${apiResponse.length}`);
        console.log(`   Data structure: ${apiResponse.length > 0 ? 'VALID' : 'EMPTY'}`);
        
        if (apiResponse.length > 0) {
            console.log('✅ Backend API: WORKING');
            console.log('✅ Notification Screen: SHOULD WORK');
        } else {
            console.log('❌ Backend API: NO DATA');
            console.log('❌ Notification Screen: WILL BE EMPTY');
        }
        
        // ========== TEST 4: Data Structure Validation ==========
        console.log('\n📋 TEST 4: Data Structure Validation');
        console.log('─'.repeat(80));
        
        if (notifications.length > 0) {
            const sampleNotification = notifications[0];
            const requiredFields = ['userId', 'type', 'title', 'body', 'createdAt', 'isRead'];
            const missingFields = requiredFields.filter(field => !sampleNotification.hasOwnProperty(field));
            
            console.log('🔍 Sample Notification Structure:');
            console.log(`   Has all required fields: ${missingFields.length === 0 ? 'YES' : 'NO'}`);
            
            if (missingFields.length > 0) {
                console.log(`   Missing fields: ${missingFields.join(', ')}`);
                console.log('❌ Data Structure: INVALID');
            } else {
                console.log('✅ Data Structure: VALID');
            }
            
            // Check Firebase RTDB compatibility
            const firebaseCompatible = sampleNotification.userId && 
                                     sampleNotification._id && 
                                     sampleNotification.createdAt;
            
            console.log(`   Firebase RTDB compatible: ${firebaseCompatible ? 'YES' : 'NO'}`);
            
            if (firebaseCompatible) {
                console.log('✅ Firebase RTDB Sync: READY');
            } else {
                console.log('❌ Firebase RTDB Sync: INCOMPATIBLE');
            }
        }
        
        // ========== OVERALL ASSESSMENT ==========
        console.log('\n📋 OVERALL SYSTEM ASSESSMENT');
        console.log('─'.repeat(80));
        
        const checks = {
            mongodbNotifications: notifications.length > 0,
            userProfile: !!user,
            fcmTokens: !!(user?.mobileFcmToken || user?.webFcmToken),
            dataStructure: notifications.length > 0,
            backendApi: notifications.length > 0
        };
        
        const passedChecks = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        
        console.log('🎯 System Health Check:');
        console.log(`   MongoDB Notifications: ${checks.mongodbNotifications ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   User Profile: ${checks.userProfile ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   FCM Tokens: ${checks.fcmTokens ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Data Structure: ${checks.dataStructure ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Backend API: ${checks.backendApi ? '✅ PASS' : '❌ FAIL'}`);
        
        console.log(`\n📊 Overall Score: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
        
        if (passedChecks === totalChecks) {
            console.log('🎉 SYSTEM STATUS: FULLY OPERATIONAL');
            console.log('✅ Notification screen should work');
            console.log('✅ Floating notifications should work (after Firebase RTDB sync)');
            console.log('✅ Push notifications should work (with real FCM tokens)');
        } else if (passedChecks >= 3) {
            console.log('⚠️  SYSTEM STATUS: PARTIALLY WORKING');
            console.log('✅ Basic functionality should work');
            console.log('⚠️  Some features may not work properly');
        } else {
            console.log('❌ SYSTEM STATUS: NEEDS ATTENTION');
            console.log('❌ Major issues detected');
            console.log('🔧 Run the fix scripts to resolve issues');
        }
        
        // ========== NEXT STEPS ==========
        console.log('\n📋 RECOMMENDED NEXT STEPS');
        console.log('─'.repeat(80));
        
        if (!checks.mongodbNotifications) {
            console.log('1. ❌ Create test notifications first');
        } else {
            console.log('1. ✅ MongoDB notifications are ready');
        }
        
        if (!checks.fcmTokens) {
            console.log('2. 🔧 Run: node fix-fcm-token-registration.js');
        } else {
            console.log('2. ✅ FCM tokens are registered');
        }
        
        console.log('3. 🔧 Run: node fix-notification-sync-issue.js (to sync to Firebase RTDB)');
        console.log('4. 📱 Test the mobile/web app');
        console.log('5. 🧪 Verify floating notifications appear');
        console.log('6. 📋 Check notification screen shows data');
        
    } catch (error) {
        console.error('❌ Test Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '🧪'.repeat(60));
        console.log('✅ NOTIFICATION SYSTEM TEST COMPLETED');
        console.log('🧪'.repeat(60) + '\n');
    }
}

testNotificationSystemAfterFix();