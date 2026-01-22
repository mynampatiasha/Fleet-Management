// Simple Notification System Diagnostic (MongoDB only)
const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

// Test user (driver from credentials)
const TEST_USER_ID = 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2';

async function diagnoseNotificationIssue() {
    console.log('\n' + '🔍'.repeat(60));
    console.log('🏥 NOTIFICATION SYSTEM ISSUE DIAGNOSIS');
    console.log('🔍'.repeat(60));
    console.log('Test User ID:', TEST_USER_ID);
    console.log('Timestamp:', new Date().toISOString());
    console.log('🔍'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== STEP 1: Check Notifications in MongoDB ==========
        console.log('\n📋 STEP 1: MongoDB Notifications Analysis');
        console.log('─'.repeat(80));
        
        const notifications = await db.collection('notifications')
            .find({ userId: TEST_USER_ID })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();
        
        const unreadCount = await db.collection('notifications')
            .countDocuments({ userId: TEST_USER_ID, isRead: false });
        
        const totalCount = await db.collection('notifications')
            .countDocuments({ userId: TEST_USER_ID });
        
        console.log('📊 MongoDB Notification Stats:');
        console.log(`   Total notifications: ${totalCount}`);
        console.log(`   Unread notifications: ${unreadCount}`);
        console.log(`   Recent notifications: ${notifications.length}`);
        
        if (notifications.length > 0) {
            console.log('\n📋 Recent notifications in MongoDB:');
            notifications.forEach((notif, index) => {
                console.log(`   ${index + 1}. "${notif.title}" (${notif.type})`);
                console.log(`      User ID: ${notif.userId}`);
                console.log(`      Created: ${notif.createdAt}`);
                console.log(`      Read: ${notif.isRead}`);
                console.log(`      ID: ${notif._id}`);
                console.log('');
            });
        }
        
        // ========== STEP 2: Check User Profile ==========
        console.log('📋 STEP 2: User Profile Analysis');
        console.log('─'.repeat(80));
        
        const user = await db.collection('users').findOne({ firebaseUid: TEST_USER_ID });
        
        console.log('👤 User Profile in MongoDB:');
        if (user) {
            console.log('✅ User document exists');
            console.log(`   Firebase UID: ${user.firebaseUid}`);
            console.log(`   Email: ${user.email || 'Not set'}`);
            console.log(`   Name: ${user.name || 'Not set'}`);
            console.log(`   Mobile FCM Token: ${user.mobileFcmToken ? 'Registered' : 'Not registered'}`);
            console.log(`   Web FCM Token: ${user.webFcmToken ? 'Registered' : 'Not registered'}`);
            console.log(`   FCM Tokens Array: ${user.fcmTokens?.length || 0} devices`);
            
            if (user.mobileFcmToken) {
                console.log(`   Mobile Token Preview: ${user.mobileFcmToken.substring(0, 30)}...`);
            }
            if (user.webFcmToken) {
                console.log(`   Web Token Preview: ${user.webFcmToken.substring(0, 30)}...`);
            }
        } else {
            console.log('❌ User document not found');
            console.log('   This could be why notifications aren\'t working');
        }
        
        // ========== STEP 3: Check Different User ID Formats ==========
        console.log('\n📋 STEP 3: User ID Format Analysis');
        console.log('─'.repeat(80));
        
        console.log('🔍 Checking for notifications with different userId formats:');
        
        // Check exact match
        const exactMatch = await db.collection('notifications').countDocuments({ userId: TEST_USER_ID });
        console.log(`   Exact match "${TEST_USER_ID}": ${exactMatch} notifications`);
        
        // Check with quotes
        const quotedMatch = await db.collection('notifications').countDocuments({ userId: `"${TEST_USER_ID}"` });
        console.log(`   Quoted match "\\"${TEST_USER_ID}\\"": ${quotedMatch} notifications`);
        
        // Check case variations
        const lowerMatch = await db.collection('notifications').countDocuments({ userId: TEST_USER_ID.toLowerCase() });
        console.log(`   Lowercase match: ${lowerMatch} notifications`);
        
        const upperMatch = await db.collection('notifications').countDocuments({ userId: TEST_USER_ID.toUpperCase() });
        console.log(`   Uppercase match: ${upperMatch} notifications`);
        
        // Check for partial matches
        const regexMatch = await db.collection('notifications').countDocuments({ 
            userId: { $regex: TEST_USER_ID.substring(0, 10), $options: 'i' } 
        });
        console.log(`   Partial match (first 10 chars): ${regexMatch} notifications`);
        
        // ========== STEP 4: Sample All User IDs ==========
        console.log('\n📋 STEP 4: All User IDs in Notifications');
        console.log('─'.repeat(80));
        
        const uniqueUserIds = await db.collection('notifications').distinct('userId');
        console.log(`📊 Found ${uniqueUserIds.length} unique user IDs in notifications:`);
        
        uniqueUserIds.slice(0, 10).forEach((userId, index) => {
            console.log(`   ${index + 1}. "${userId}"`);
        });
        
        if (uniqueUserIds.length > 10) {
            console.log(`   ... and ${uniqueUserIds.length - 10} more`);
        }
        
        // Check if our test user ID is in the list
        const isTestUserInList = uniqueUserIds.includes(TEST_USER_ID);
        console.log(`\n🎯 Test user ID "${TEST_USER_ID}" in list: ${isTestUserInList ? 'YES' : 'NO'}`);
        
        // ========== STEP 5: Backend API Simulation ==========
        console.log('\n📋 STEP 5: Backend API Query Simulation');
        console.log('─'.repeat(80));
        
        console.log('🔄 Simulating backend API call: GET /api/notifications');
        console.log(`   Query: { userId: "${TEST_USER_ID}" }`);
        console.log(`   Sort: { createdAt: -1 }`);
        console.log(`   Limit: 50`);
        
        const apiSimulation = await db.collection('notifications')
            .find({ userId: TEST_USER_ID })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();
        
        console.log(`📊 API would return: ${apiSimulation.length} notifications`);
        
        if (apiSimulation.length > 0) {
            console.log('✅ Backend API should work correctly');
            console.log('   Notification screen should show these notifications');
        } else {
            console.log('❌ Backend API returns empty array');
            console.log('   This explains why notification screen is empty');
        }
        
        // ========== STEP 6: Root Cause Analysis ==========
        console.log('\n📋 STEP 6: Root Cause Analysis');
        console.log('─'.repeat(80));
        
        console.log('🔍 DIAGNOSIS SUMMARY:');
        
        if (totalCount > 0) {
            console.log('✅ Notifications exist in MongoDB');
            console.log('✅ Backend API query works correctly');
            console.log('✅ Notification screen should display notifications');
            
            if (!user) {
                console.log('❌ ISSUE: User profile missing in MongoDB');
                console.log('   - FCM tokens not saved');
                console.log('   - Push notifications won\'t work');
                console.log('   - Floating notifications won\'t work');
            } else if (!user.mobileFcmToken && !user.webFcmToken) {
                console.log('⚠️  ISSUE: No FCM tokens registered');
                console.log('   - Push notifications won\'t work');
                console.log('   - Floating notifications won\'t work');
                console.log('   - But notification screen should still work');
            } else {
                console.log('✅ User profile exists with FCM tokens');
                console.log('🤔 If notifications aren\'t showing, check:');
                console.log('   1. Frontend authentication (correct user ID)');
                console.log('   2. API endpoint connectivity');
                console.log('   3. Firebase Realtime Database sync');
            }
        } else {
            console.log('❌ PRIMARY ISSUE: No notifications in MongoDB');
            console.log('   - Check notification creation process');
            console.log('   - Verify createNotification() is being called');
            console.log('   - Check if events are triggering notifications');
        }
        
        // ========== STEP 7: Recommendations ==========
        console.log('\n📋 STEP 7: Recommendations');
        console.log('─'.repeat(80));
        
        console.log('💡 NEXT STEPS:');
        
        if (totalCount > 0) {
            console.log('1. ✅ MongoDB notifications are working');
            console.log('2. 🔍 Check frontend authentication:');
            console.log('   - Verify user is logged in with correct Firebase UID');
            console.log('   - Check API calls are using correct Authorization header');
            console.log('3. 🔍 Test backend API directly:');
            console.log('   - GET /api/notifications with proper auth token');
            console.log('4. 🔍 Check Firebase Realtime Database:');
            console.log('   - Verify notifications are synced to Firebase RTDB');
            console.log('   - Check path: notifications/' + TEST_USER_ID);
        } else {
            console.log('1. ❌ Create test notifications first');
            console.log('2. 🔍 Check notification creation process');
            console.log('3. 🔍 Verify event triggers are working');
        }
        
        if (!user || (!user.mobileFcmToken && !user.webFcmToken)) {
            console.log('5. 📱 Fix FCM token registration:');
            console.log('   - Call POST /api/notifications/register-token from app');
            console.log('   - Ensure user profile is created on login');
        }
        
        console.log('\n' + '🔍'.repeat(60));
        console.log('✅ DIAGNOSIS COMPLETE');
        console.log('🔍'.repeat(60) + '\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

diagnoseNotificationIssue();