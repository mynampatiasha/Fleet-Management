// Complete Notification System Diagnostic
const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');

// Configuration
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

// Test user (driver from credentials)
const TEST_USER_ID = 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2';

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
    try {
        const serviceAccount = require('./abra_fleet_backend/abra-fleet-firebase-adminsdk-ey4oj-c4b8b8b8b8.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://abra-fleet-default-rtdb.asia-southeast1.firebasedatabase.app/'
        });
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.log('⚠️  Firebase Admin initialization failed:', error.message);
    }
}

async function runCompleteDiagnostic() {
    console.log('\n' + '🔍'.repeat(60));
    console.log('🏥 COMPLETE NOTIFICATION SYSTEM DIAGNOSTIC');
    console.log('🔍'.repeat(60));
    console.log('Test User ID:', TEST_USER_ID);
    console.log('Timestamp:', new Date().toISOString());
    console.log('🔍'.repeat(60) + '\n');

    const results = {
        mongodb: { status: 'unknown', data: null, error: null },
        firebaseRTDB: { status: 'unknown', data: null, error: null },
        userProfile: { status: 'unknown', data: null, error: null },
        notifications: { status: 'unknown', data: null, error: null },
        fcmTokens: { status: 'unknown', data: null, error: null },
        dataSync: { status: 'unknown', data: null, error: null }
    };

    let mongoClient = null;

    try {
        // ========== STEP 1: MongoDB Connection & Notifications ==========
        console.log('📋 STEP 1: MongoDB Analysis');
        console.log('─'.repeat(80));
        
        try {
            mongoClient = new MongoClient(MONGODB_URI);
            await mongoClient.connect();
            const db = mongoClient.db(DATABASE_NAME);
            
            console.log('✅ MongoDB connected successfully');
            
            // Check notifications collection
            const notifications = await db.collection('notifications')
                .find({ userId: TEST_USER_ID })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();
            
            const unreadCount = await db.collection('notifications')
                .countDocuments({ userId: TEST_USER_ID, isRead: false });
            
            const totalCount = await db.collection('notifications')
                .countDocuments({ userId: TEST_USER_ID });
            
            results.mongodb.status = 'success';
            results.mongodb.data = {
                connected: true,
                totalNotifications: totalCount,
                unreadNotifications: unreadCount,
                recentNotifications: notifications.length,
                latestNotification: notifications[0] || null
            };
            
            console.log('✅ MongoDB notifications found:');
            console.log(`   Total: ${totalCount}`);
            console.log(`   Unread: ${unreadCount}`);
            console.log(`   Recent: ${notifications.length}`);
            
            if (notifications.length > 0) {
                console.log('\n📋 Latest notifications:');
                notifications.slice(0, 3).forEach((notif, index) => {
                    console.log(`   ${index + 1}. ${notif.title} (${notif.type})`);
                    console.log(`      Created: ${notif.createdAt}`);
                    console.log(`      Read: ${notif.isRead}`);
                    console.log(`      User ID: ${notif.userId}`);
                });
            }
            
            // Check user document
            const user = await db.collection('users').findOne({ firebaseUid: TEST_USER_ID });
            
            results.userProfile.status = user ? 'success' : 'missing';
            results.userProfile.data = {
                exists: !!user,
                email: user?.email || null,
                name: user?.name || null,
                mobileFcmToken: !!user?.mobileFcmToken,
                webFcmToken: !!user?.webFcmToken,
                fcmTokensArray: user?.fcmTokens?.length || 0
            };
            
            console.log('\n👤 User Profile in MongoDB:');
            if (user) {
                console.log('✅ User document exists');
                console.log(`   Email: ${user.email || 'Not set'}`);
                console.log(`   Name: ${user.name || 'Not set'}`);
                console.log(`   Mobile FCM Token: ${user.mobileFcmToken ? 'Yes' : 'No'}`);
                console.log(`   Web FCM Token: ${user.webFcmToken ? 'Yes' : 'No'}`);
                console.log(`   FCM Tokens Array: ${user.fcmTokens?.length || 0} devices`);
            } else {
                console.log('❌ User document not found');
            }
            
        } catch (mongoError) {
            results.mongodb.status = 'error';
            results.mongodb.error = mongoError.message;
            console.log('❌ MongoDB error:', mongoError.message);
        }

        // ========== STEP 2: Firebase Realtime Database ==========
        console.log('\n📋 STEP 2: Firebase Realtime Database Analysis');
        console.log('─'.repeat(80));
        
        try {
            const firebaseDb = admin.database();
            
            // Check customer profile
            const customerRef = firebaseDb.ref(`customers/${TEST_USER_ID}`);
            const customerSnapshot = await customerRef.once('value');
            const customerData = customerSnapshot.val();
            
            // Check notifications in RTDB
            const notificationsRef = firebaseDb.ref(`notifications/${TEST_USER_ID}`);
            const notificationsSnapshot = await notificationsRef.once('value');
            const rtdbNotifications = notificationsSnapshot.val();
            
            results.firebaseRTDB.status = 'success';
            results.firebaseRTDB.data = {
                customerExists: !!customerData,
                customerEmail: customerData?.email || null,
                customerName: customerData?.name || null,
                mobileFcmToken: !!customerData?.fcmToken,
                webFcmToken: !!customerData?.webFcmToken,
                rtdbNotifications: rtdbNotifications ? Object.keys(rtdbNotifications).length : 0
            };
            
            console.log('🔥 Firebase Realtime Database:');
            if (customerData) {
                console.log('✅ Customer profile exists');
                console.log(`   Path: customers/${TEST_USER_ID}`);
                console.log(`   Email: ${customerData.email || 'Not set'}`);
                console.log(`   Name: ${customerData.name || 'Not set'}`);
                console.log(`   Mobile FCM Token: ${customerData.fcmToken ? 'Yes' : 'No'}`);
                console.log(`   Web FCM Token: ${customerData.webFcmToken ? 'Yes' : 'No'}`);
            } else {
                console.log('❌ Customer profile not found');
                console.log(`   Path checked: customers/${TEST_USER_ID}`);
            }
            
            if (rtdbNotifications) {
                console.log(`✅ RTDB notifications: ${Object.keys(rtdbNotifications).length} found`);
                console.log('   Path: notifications/' + TEST_USER_ID);
                
                // Show latest RTDB notifications
                const rtdbNotifArray = Object.entries(rtdbNotifications)
                    .map(([id, data]) => ({ id, ...data }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3);
                
                console.log('\n📋 Latest RTDB notifications:');
                rtdbNotifArray.forEach((notif, index) => {
                    console.log(`   ${index + 1}. ${notif.title} (${notif.type})`);
                    console.log(`      ID: ${notif.id}`);
                    console.log(`      Created: ${notif.createdAt}`);
                });
            } else {
                console.log('❌ No RTDB notifications found');
                console.log(`   Path checked: notifications/${TEST_USER_ID}`);
            }
            
        } catch (firebaseError) {
            results.firebaseRTDB.status = 'error';
            results.firebaseRTDB.error = firebaseError.message;
            console.log('❌ Firebase RTDB error:', firebaseError.message);
        }

        // ========== STEP 3: FCM Token Analysis ==========
        console.log('\n📋 STEP 3: FCM Token Analysis');
        console.log('─'.repeat(80));
        
        try {
            const tokens = {
                mongodb: { mobile: null, web: null },
                firebase: { mobile: null, web: null },
                valid: { mobile: false, web: false }
            };
            
            // Get tokens from MongoDB
            if (results.userProfile.data?.exists && mongoClient) {
                const db = mongoClient.db(DATABASE_NAME);
                const user = await db.collection('users').findOne({ firebaseUid: TEST_USER_ID });
                tokens.mongodb.mobile = user?.mobileFcmToken || user?.fcmToken || null;
                tokens.mongodb.web = user?.webFcmToken || null;
            }
            
            // Get tokens from Firebase
            if (results.firebaseRTDB.status === 'success') {
                const firebaseDb = admin.database();
                const customerSnapshot = await firebaseDb.ref(`customers/${TEST_USER_ID}`).once('value');
                const customerData = customerSnapshot.val();
                tokens.firebase.mobile = customerData?.fcmToken || null;
                tokens.firebase.web = customerData?.webFcmToken || null;
            }
            
            // Test token validity
            const testTokens = [
                { token: tokens.mongodb.mobile, platform: 'mobile', source: 'mongodb' },
                { token: tokens.mongodb.web, platform: 'web', source: 'mongodb' },
                { token: tokens.firebase.mobile, platform: 'mobile', source: 'firebase' },
                { token: tokens.firebase.web, platform: 'web', source: 'firebase' }
            ].filter(t => t.token);
            
            console.log('📱 FCM Tokens Found:');
            console.log(`   MongoDB Mobile: ${tokens.mongodb.mobile ? 'Yes' : 'No'}`);
            console.log(`   MongoDB Web: ${tokens.mongodb.web ? 'Yes' : 'No'}`);
            console.log(`   Firebase Mobile: ${tokens.firebase.mobile ? 'Yes' : 'No'}`);
            console.log(`   Firebase Web: ${tokens.firebase.web ? 'Yes' : 'No'}`);
            
            if (testTokens.length > 0) {
                console.log('\n🧪 Testing token validity...');
                for (const tokenInfo of testTokens) {
                    try {
                        await admin.messaging().send({
                            data: { test: 'true' },
                            token: tokenInfo.token
                        }, true); // dryRun = true
                        
                        tokens.valid[tokenInfo.platform] = true;
                        console.log(`✅ ${tokenInfo.platform} token (${tokenInfo.source}): Valid`);
                    } catch (testError) {
                        console.log(`❌ ${tokenInfo.platform} token (${tokenInfo.source}): Invalid (${testError.code})`);
                    }
                }
            } else {
                console.log('⚠️  No FCM tokens to test');
            }
            
            results.fcmTokens.status = testTokens.length > 0 ? 'found' : 'missing';
            results.fcmTokens.data = tokens;
            
        } catch (fcmError) {
            results.fcmTokens.status = 'error';
            results.fcmTokens.error = fcmError.message;
            console.log('❌ FCM token analysis error:', fcmError.message);
        }

        // ========== STEP 4: Data Synchronization Analysis ==========
        console.log('\n📋 STEP 4: Data Synchronization Analysis');
        console.log('─'.repeat(80));
        
        const syncIssues = [];
        
        // Check if MongoDB has notifications but RTDB doesn't
        const mongoNotifications = results.mongodb.data?.totalNotifications || 0;
        const rtdbNotifications = results.firebaseRTDB.data?.rtdbNotifications || 0;
        
        console.log('🔄 Data Sync Status:');
        console.log(`   MongoDB Notifications: ${mongoNotifications}`);
        console.log(`   RTDB Notifications: ${rtdbNotifications}`);
        
        if (mongoNotifications > 0 && rtdbNotifications === 0) {
            syncIssues.push('MongoDB has notifications but Firebase RTDB is empty');
            console.log('❌ SYNC ISSUE: MongoDB has notifications but RTDB is empty');
        } else if (mongoNotifications === rtdbNotifications) {
            console.log('✅ Notification counts match');
        } else {
            syncIssues.push(`Notification count mismatch: MongoDB(${mongoNotifications}) vs RTDB(${rtdbNotifications})`);
            console.log(`⚠️  Notification count mismatch: MongoDB(${mongoNotifications}) vs RTDB(${rtdbNotifications})`);
        }
        
        // Check user profile sync
        const mongoUser = results.userProfile.data;
        const firebaseUser = results.firebaseRTDB.data;
        
        if (mongoUser?.exists && !firebaseUser?.customerExists) {
            syncIssues.push('User exists in MongoDB but not in Firebase RTDB');
            console.log('❌ SYNC ISSUE: User in MongoDB but not in Firebase RTDB');
        } else if (!mongoUser?.exists && firebaseUser?.customerExists) {
            syncIssues.push('User exists in Firebase RTDB but not in MongoDB');
            console.log('❌ SYNC ISSUE: User in Firebase RTDB but not in MongoDB');
        } else if (mongoUser?.exists && firebaseUser?.customerExists) {
            console.log('✅ User profiles exist in both databases');
        } else {
            syncIssues.push('User profile missing in both databases');
            console.log('❌ SYNC ISSUE: User profile missing in both databases');
        }
        
        results.dataSync.status = syncIssues.length === 0 ? 'synced' : 'issues';
        results.dataSync.data = { issues: syncIssues };

        // ========== STEP 5: Root Cause Analysis ==========
        console.log('\n📋 STEP 5: Root Cause Analysis');
        console.log('─'.repeat(80));
        
        console.log('🔍 DIAGNOSIS:');
        
        if (mongoNotifications > 0 && rtdbNotifications === 0) {
            console.log('❌ PRIMARY ISSUE: Notifications exist in MongoDB but not in Firebase RTDB');
            console.log('   This explains why:');
            console.log('   - Backend API returns notifications (from MongoDB)');
            console.log('   - Notification screen shows empty (fetches from backend API)');
            console.log('   - Floating notifications don\'t work (listen to Firebase RTDB)');
            console.log('\n💡 SOLUTION: Sync existing MongoDB notifications to Firebase RTDB');
        } else if (mongoNotifications === 0) {
            console.log('❌ PRIMARY ISSUE: No notifications in MongoDB');
            console.log('   - Check notification creation process');
            console.log('   - Verify createNotification() is being called');
        } else if (results.fcmTokens.status === 'missing') {
            console.log('❌ PRIMARY ISSUE: No FCM tokens registered');
            console.log('   - User won\'t receive push notifications');
            console.log('   - App needs to call FCM token registration');
        } else {
            console.log('✅ System appears to be working correctly');
        }

        // ========== FINAL SUMMARY ==========
        console.log('\n' + '🔍'.repeat(60));
        console.log('📊 DIAGNOSTIC SUMMARY');
        console.log('🔍'.repeat(60));
        console.log('MongoDB:', results.mongodb.status);
        console.log('Firebase RTDB:', results.firebaseRTDB.status);
        console.log('User Profile:', results.userProfile.status);
        console.log('FCM Tokens:', results.fcmTokens.status);
        console.log('Data Sync:', results.dataSync.status);
        console.log('\n📝 ISSUES FOUND:', syncIssues.length);
        syncIssues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        console.log('🔍'.repeat(60) + '\n');

        return results;

    } catch (error) {
        console.error('💥 DIAGNOSTIC FATAL ERROR:', error);
        return null;
    } finally {
        if (mongoClient) {
            await mongoClient.close();
            console.log('🔌 MongoDB connection closed');
        }
    }
}

// Run the diagnostic
runCompleteDiagnostic().then(results => {
    if (results) {
        console.log('✅ Diagnostic completed successfully');
    } else {
        console.log('❌ Diagnostic failed');
    }
}).catch(error => {
    console.error('❌ Diagnostic error:', error);
});