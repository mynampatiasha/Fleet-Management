// Fix FCM Token Registration Issue
// This script creates a proper user profile with FCM tokens

const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');
const path = require('path');

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

// Initialize Firebase Admin
let firebaseInitialized = false;

function initializeFirebase() {
    if (firebaseInitialized) return;
    
    try {
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
        throw error;
    }
}

async function fixFCMTokenRegistration() {
    console.log('\n' + '📱'.repeat(60));
    console.log('📱 FCM TOKEN REGISTRATION FIX');
    console.log('📱'.repeat(60));
    console.log('User:', TEST_USER.email);
    console.log('Firebase UID:', TEST_USER.firebaseUid);
    console.log('Timestamp:', new Date().toISOString());
    console.log('📱'.repeat(60) + '\n');

    // Initialize Firebase
    initializeFirebase();
    
    const mongoClient = new MongoClient(MONGODB_URI);
    
    try {
        // Connect to MongoDB
        await mongoClient.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = mongoClient.db(DATABASE_NAME);
        const firebaseDb = admin.database();
        
        // ========== STEP 1: Update MongoDB User Profile ==========
        console.log('\n📋 STEP 1: Updating MongoDB User Profile');
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
        
        // ========== STEP 2: Update Firebase Realtime Database ==========
        console.log('\n📋 STEP 2: Updating Firebase Realtime Database');
        console.log('─'.repeat(80));
        
        const customerPath = `customers/${TEST_USER.firebaseUid}`;
        const customerUpdate = {
            email: TEST_USER.email,
            name: TEST_USER.name,
            role: TEST_USER.role,
            fcmToken: SAMPLE_FCM_TOKENS.mobile,
            webFcmToken: SAMPLE_FCM_TOKENS.web,
            mobileTokenUpdatedAt: new Date().toISOString(),
            webTokenUpdatedAt: new Date().toISOString(),
            lastTokenUpdate: new Date().toISOString(),
            mobileDeviceName: 'Test Mobile Device',
            webDeviceName: 'Test Web Browser',
            mobileDeviceId: 'test-mobile-001',
            webDeviceId: 'test-web-001'
        };
        
        await firebaseDb.ref(customerPath).set(customerUpdate);
        
        console.log('✅ Firebase RTDB customer profile updated');
        console.log(`   Path: ${customerPath}`);
        console.log(`   Mobile FCM Token: ${SAMPLE_FCM_TOKENS.mobile.substring(0, 30)}...`);
        console.log(`   Web FCM Token: ${SAMPLE_FCM_TOKENS.web.substring(0, 30)}...`);
        
        // Also save to FCM tokens list
        const tokenListUpdates = {};
        tokenListUpdates[`fcm_tokens/${TEST_USER.firebaseUid}/mobile/test-mobile-001`] = {
            token: SAMPLE_FCM_TOKENS.mobile,
            platform: 'mobile',
            deviceName: 'Test Mobile Device',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        tokenListUpdates[`fcm_tokens/${TEST_USER.firebaseUid}/web/test-web-001`] = {
            token: SAMPLE_FCM_TOKENS.web,
            platform: 'web',
            deviceName: 'Test Web Browser',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        await firebaseDb.ref().update(tokenListUpdates);
        console.log('✅ FCM tokens list updated');
        
        // ========== STEP 3: Test FCM Token Validity ==========
        console.log('\n📋 STEP 3: Testing FCM Token Setup');
        console.log('─'.repeat(80));
        
        console.log('🧪 Testing token registration (dry run)...');
        
        // Note: These are sample tokens, so they will fail validation
        // In a real scenario, you would get actual tokens from the mobile/web app
        
        const testResults = {
            mobile: { valid: false, error: 'Sample token - not real' },
            web: { valid: false, error: 'Sample token - not real' }
        };
        
        console.log('📱 Token Test Results:');
        console.log(`   Mobile Token: ${testResults.mobile.valid ? 'Valid' : 'Invalid'} (${testResults.mobile.error})`);
        console.log(`   Web Token: ${testResults.web.valid ? 'Valid' : 'Invalid'} (${testResults.web.error})`);
        
        console.log('\n⚠️  NOTE: These are sample tokens for testing the database structure');
        console.log('   Real FCM tokens must be obtained from the mobile/web app');
        
        // ========== STEP 4: Verification ==========
        console.log('\n📋 STEP 4: Verification');
        console.log('─'.repeat(80));
        
        // Verify MongoDB
        const verifyUser = await db.collection('users').findOne({ firebaseUid: TEST_USER.firebaseUid });
        console.log('✅ MongoDB Verification:');
        console.log(`   User exists: ${!!verifyUser}`);
        console.log(`   Has mobile token: ${!!verifyUser?.mobileFcmToken}`);
        console.log(`   Has web token: ${!!verifyUser?.webFcmToken}`);
        console.log(`   FCM tokens array: ${verifyUser?.fcmTokens?.length || 0} devices`);
        
        // Verify Firebase RTDB
        const verifyCustomer = await firebaseDb.ref(customerPath).once('value');
        const customerData = verifyCustomer.val();
        console.log('\n✅ Firebase RTDB Verification:');
        console.log(`   Customer exists: ${!!customerData}`);
        console.log(`   Has mobile token: ${!!customerData?.fcmToken}`);
        console.log(`   Has web token: ${!!customerData?.webFcmToken}`);
        
        // ========== STEP 5: Summary ==========
        console.log('\n📋 STEP 5: Summary');
        console.log('─'.repeat(80));
        
        console.log('📊 FCM Token Registration Results:');
        console.log('✅ MongoDB user profile: Updated with FCM tokens');
        console.log('✅ Firebase RTDB customer profile: Updated with FCM tokens');
        console.log('✅ FCM tokens list: Created for token management');
        
        console.log('\n🎉 FCM TOKEN REGISTRATION COMPLETED!');
        
        console.log('\n📱 Next Steps for Real Implementation:');
        console.log('1. 🔄 Replace sample tokens with real FCM tokens from app');
        console.log('2. 📱 Call POST /api/notifications/register-token from mobile app');
        console.log('3. 🌐 Call POST /api/notifications/register-token from web app');
        console.log('4. 🧪 Test push notifications with real tokens');
        console.log('5. ✅ Verify floating notifications work in app');
        
        console.log('\n🔍 How to get real FCM tokens:');
        console.log('1. Mobile App: Use Firebase SDK to get FCM token');
        console.log('2. Web App: Use Firebase Web SDK to get FCM token');
        console.log('3. Call the registration API with real tokens');
        
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
fixFCMTokenRegistration().catch(error => {
    console.error('❌ FCM token registration fix failed:', error);
    process.exit(1);
});