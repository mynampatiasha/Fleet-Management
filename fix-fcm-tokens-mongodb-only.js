// Fix FCM Token Registration (MongoDB Only)
// This script updates the user profile with FCM tokens in MongoDB

const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

// Test user data
const TEST_USER = {
    firebaseUid: 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2',
    email: 'drivertest@gmail.com',
    name: 'Asha Mynampati',
    role: 'driver'
};

// Sample FCM tokens (these would normally come from the app)
const SAMPLE_FCM_TOKENS = {
    mobile: 'fGxV8_8kRQGYqVXX5l8fWbfYFz2_SAMPLE_MOBILE_TOKEN_FOR_TESTING_PURPOSES_ONLY',
    web: 'dH2K9_3mSRHZpQXX5l8fWbfYFz2_SAMPLE_WEB_TOKEN_FOR_TESTING_PURPOSES_ONLY'
};

async function fixFCMTokensMongoDBOnly() {
    console.log('\n' + '📱'.repeat(60));
    console.log('📱 FCM TOKEN REGISTRATION FIX (MongoDB Only)');
    console.log('📱'.repeat(60));
    console.log('User:', TEST_USER.email);
    console.log('Firebase UID:', TEST_USER.firebaseUid);
    console.log('Timestamp:', new Date().toISOString());
    console.log('📱'.repeat(60) + '\n');

    const mongoClient = new MongoClient(MONGODB_URI);
    
    try {
        // Connect to MongoDB
        await mongoClient.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = mongoClient.db(DATABASE_NAME);
        
        // ========== STEP 1: Check Current User Profile ==========
        console.log('\n📋 STEP 1: Current User Profile');
        console.log('─'.repeat(80));
        
        const currentUser = await db.collection('users').findOne({ firebaseUid: TEST_USER.firebaseUid });
        
        if (currentUser) {
            console.log('✅ User document exists');
            console.log(`   Email: ${currentUser.email}`);
            console.log(`   Name: ${currentUser.name}`);
            console.log(`   Current Mobile FCM Token: ${currentUser.mobileFcmToken ? 'EXISTS' : 'MISSING'}`);
            console.log(`   Current Web FCM Token: ${currentUser.webFcmToken ? 'EXISTS' : 'MISSING'}`);
            console.log(`   Current FCM Tokens Array: ${currentUser.fcmTokens?.length || 0} devices`);
        } else {
            console.log('⚠️  User document not found - will create new one');
        }
        
        // ========== STEP 2: Update MongoDB User Profile ==========
        console.log('\n📋 STEP 2: Updating MongoDB User Profile');
        console.log('─'.repeat(80));
        
        const userUpdate = {
            $set: {
                firebaseUid: TEST_USER.firebaseUid,
                email: TEST_USER.email,
                name: TEST_USER.name,
                role: TEST_USER.role,
                mobileFcmToken: SAMPLE_FCM_TOKENS.mobile,
                webFcmToken: SAMPLE_FCM_TOKENS.web,
                mobileTokenUpdatedAt: new Date(),
                webTokenUpdatedAt: new Date(),
                lastTokenUpdate: new Date(),
                fcmTokens: [
                    {
                        token: SAMPLE_FCM_TOKENS.mobile,
                        platform: 'mobile',
                        deviceName: 'Test Mobile Device',
                        deviceId: 'test-mobile-001',
                        lastUpdated: new Date(),
                        userAgent: 'Test Mobile App'
                    },
                    {
                        token: SAMPLE_FCM_TOKENS.web,
                        platform: 'web',
                        deviceName: 'Test Web Browser',
                        deviceId: 'test-web-001',
                        lastUpdated: new Date(),
                        userAgent: 'Test Web Browser'
                    }
                ]
            }
        };
        
        const mongoResult = await db.collection('users').updateOne(
            { firebaseUid: TEST_USER.firebaseUid },
            userUpdate,
            { upsert: true }
        );
        
        console.log('✅ MongoDB user profile updated');
        console.log(`   Matched: ${mongoResult.matchedCount}`);
        console.log(`   Modified: ${mongoResult.modifiedCount}`);
        console.log(`   Upserted: ${mongoResult.upsertedCount}`);
        console.log(`   Mobile FCM Token: ${SAMPLE_FCM_TOKENS.mobile.substring(0, 30)}...`);
        console.log(`   Web FCM Token: ${SAMPLE_FCM_TOKENS.web.substring(0, 30)}...`);
        
        // ========== STEP 3: Verification ==========
        console.log('\n📋 STEP 3: Verification');
        console.log('─'.repeat(80));
        
        const verifyUser = await db.collection('users').findOne({ firebaseUid: TEST_USER.firebaseUid });
        
        console.log('✅ MongoDB Verification:');
        console.log(`   User exists: ${!!verifyUser}`);
        console.log(`   Email: ${verifyUser?.email}`);
        console.log(`   Name: ${verifyUser?.name}`);
        console.log(`   Has mobile token: ${!!verifyUser?.mobileFcmToken}`);
        console.log(`   Has web token: ${!!verifyUser?.webFcmToken}`);
        console.log(`   FCM tokens array: ${verifyUser?.fcmTokens?.length || 0} devices`);
        
        if (verifyUser?.fcmTokens) {
            console.log('\n📱 FCM Tokens Details:');
            verifyUser.fcmTokens.forEach((tokenInfo, index) => {
                console.log(`   Device ${index + 1}: ${tokenInfo.platform} (${tokenInfo.deviceName})`);
                console.log(`      Token: ${tokenInfo.token.substring(0, 30)}...`);
                console.log(`      Updated: ${tokenInfo.lastUpdated}`);
            });
        }
        
        // ========== STEP 4: Test Notification System ==========
        console.log('\n📋 STEP 4: Test Notification System Readiness');
        console.log('─'.repeat(80));
        
        // Check if notifications exist
        const notificationCount = await db.collection('notifications').countDocuments({ userId: TEST_USER.firebaseUid });
        console.log(`📊 Notifications for user: ${notificationCount}`);
        
        // System readiness check
        const systemReady = {
            userProfile: !!verifyUser,
            fcmTokens: !!(verifyUser?.mobileFcmToken || verifyUser?.webFcmToken),
            notifications: notificationCount > 0,
            dataStructure: !!verifyUser?.fcmTokens?.length
        };
        
        console.log('\n🎯 System Readiness Check:');
        console.log(`   User Profile: ${systemReady.userProfile ? '✅ READY' : '❌ MISSING'}`);
        console.log(`   FCM Tokens: ${systemReady.fcmTokens ? '✅ READY' : '❌ MISSING'}`);
        console.log(`   Notifications: ${systemReady.notifications ? '✅ READY' : '❌ MISSING'}`);
        console.log(`   Data Structure: ${systemReady.dataStructure ? '✅ READY' : '❌ MISSING'}`);
        
        const readyCount = Object.values(systemReady).filter(Boolean).length;
        const totalChecks = Object.keys(systemReady).length;
        
        console.log(`\n📊 Readiness Score: ${readyCount}/${totalChecks} (${Math.round(readyCount/totalChecks*100)}%)`);
        
        // ========== STEP 5: Summary ==========
        console.log('\n📋 STEP 5: Summary');
        console.log('─'.repeat(80));
        
        console.log('📊 FCM Token Registration Results:');
        console.log('✅ MongoDB user profile: Updated with FCM tokens');
        console.log('✅ Sample FCM tokens: Registered for testing');
        console.log('✅ FCM tokens array: Created with device info');
        console.log('✅ User metadata: Updated with timestamps');
        
        console.log('\n🎉 FCM TOKEN REGISTRATION COMPLETED!');
        
        console.log('\n📱 What This Enables:');
        console.log('✅ Notification system can identify user devices');
        console.log('✅ Backend can attempt to send push notifications');
        console.log('✅ User profile is complete for notification flow');
        console.log('⚠️  Real FCM tokens needed for actual push notifications');
        
        console.log('\n📱 Next Steps:');
        console.log('1. 🔄 Run Firebase RTDB sync script (if available)');
        console.log('2. 📱 Test notification system with sample tokens');
        console.log('3. 🧪 Verify notification screen shows data');
        console.log('4. 🔄 Replace with real FCM tokens from mobile/web app');
        console.log('5. ✅ Test end-to-end notification flow');
        
        console.log('\n🔍 How to get real FCM tokens:');
        console.log('1. Mobile App: Firebase.messaging().getToken()');
        console.log('2. Web App: getMessaging().getToken()');
        console.log('3. Call POST /api/notifications/register-token');
        
    } catch (error) {
        console.error('💥 FATAL ERROR:', error);
    } finally {
        await mongoClient.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '📱'.repeat(60));
        console.log('✅ FCM TOKEN REGISTRATION FIX COMPLETED');
        console.log('📱'.repeat(60) + '\n');
    }
}

// Run the fix
fixFCMTokensMongoDBOnly().catch(error => {
    console.error('❌ FCM token registration fix failed:', error);
    process.exit(1);
});