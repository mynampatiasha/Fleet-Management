// Test script to debug driver notifications issue
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "abra-fleet-management",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5+5Q5Q5Q5Q5Q5\n-----END PRIVATE KEY-----\n",
        clientEmail: "firebase-adminsdk-xxxxx@abra-fleet-management.iam.gserviceaccount.com"
      }),
      databaseURL: "https://abra-fleet-management-default-rtdb.firebaseio.com"
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.log('⚠️ Firebase Admin already initialized or error:', error.message);
  }
}

async function testDriverNotifications() {
  console.log('\n🔔 TESTING DRIVER NOTIFICATIONS SYSTEM');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check if we can create a test driver user
    console.log('\n📋 TEST 1: Creating test driver user');
    console.log('-'.repeat(40));
    
    const testDriverEmail = 'drivertest@abrafleet.com';
    const testDriverPassword = 'Driver123!';
    
    let driverUser;
    try {
      // Try to get existing user first
      driverUser = await admin.auth().getUserByEmail(testDriverEmail);
      console.log('✅ Test driver user already exists:', driverUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        driverUser = await admin.auth().createUser({
          email: testDriverEmail,
          password: testDriverPassword,
          displayName: 'Test Driver',
          emailVerified: true
        });
        console.log('✅ Created new test driver user:', driverUser.uid);
      } else {
        throw error;
      }
    }
    
    // Set custom claims for driver role
    await admin.auth().setCustomUserClaims(driverUser.uid, {
      role: 'driver',
      organization: 'abrafleet'
    });
    console.log('✅ Set driver role claims');
    
    // Test 2: Create test notifications for driver
    console.log('\n📋 TEST 2: Creating test notifications for driver');
    console.log('-'.repeat(40));
    
    const testNotifications = [
      {
        type: 'route_assigned',
        title: '🚗 Route Assigned',
        body: 'You have been assigned to Route #123 for tomorrow morning',
        priority: 'high'
      },
      {
        type: 'roster_assigned', 
        title: '📋 Roster Updated',
        body: 'Your roster for this week has been updated. Please check your schedule.',
        priority: 'normal'
      },
      {
        type: 'trip_cancelled',
        title: '❌ Trip Cancelled',
        body: 'Trip #456 scheduled for 2:00 PM has been cancelled due to customer request',
        priority: 'high'
      },
      {
        type: 'shift_reminder',
        title: '⏰ Shift Reminder',
        body: 'Your shift starts in 30 minutes. Please prepare your vehicle.',
        priority: 'normal'
      },
      {
        type: 'document_expiring_soon',
        title: '⚠️ Document Expiring',
        body: 'Your driving license expires in 5 days. Please renew it soon.',
        priority: 'high'
      }
    ];
    
    // Save to Firebase Realtime Database
    const db = admin.database();
    const notificationsRef = db.ref(`notifications/${driverUser.uid}`);
    
    for (let i = 0; i < testNotifications.length; i++) {
      const notification = {
        ...testNotifications[i],
        id: `test_${Date.now()}_${i}`,
        userId: driverUser.uid,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: {
          testData: true,
          notificationIndex: i
        }
      };
      
      await notificationsRef.push(notification);
      console.log(`✅ Created notification: ${notification.title}`);
      
      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test 3: Check Firebase Realtime Database
    console.log('\n📋 TEST 3: Verifying notifications in Firebase RTDB');
    console.log('-'.repeat(40));
    
    const snapshot = await notificationsRef.once('value');
    const notifications = snapshot.val();
    
    if (notifications) {
      const notificationCount = Object.keys(notifications).length;
      console.log(`✅ Found ${notificationCount} notifications in Firebase RTDB`);
      
      // Show first few notifications
      const notificationList = Object.entries(notifications).slice(0, 3);
      notificationList.forEach(([key, notification]) => {
        console.log(`   - ${notification.title} (${notification.type})`);
      });
    } else {
      console.log('❌ No notifications found in Firebase RTDB');
    }
    
    // Test 4: Generate FCM token for testing
    console.log('\n📋 TEST 4: FCM Token Setup');
    console.log('-'.repeat(40));
    
    // Create a dummy FCM token for testing
    const dummyFcmToken = 'dummy_fcm_token_' + Date.now();
    
    // Save to customer profile
    const customerRef = db.ref(`customers/${driverUser.uid}`);
    await customerRef.update({
      fcmToken: dummyFcmToken,
      email: testDriverEmail,
      name: 'Test Driver',
      role: 'driver',
      fcmTokenUpdatedAt: new Date().toISOString()
    });
    
    console.log('✅ FCM token saved to customer profile');
    console.log(`   Token: ${dummyFcmToken}`);
    
    // Test 5: Summary and next steps
    console.log('\n📋 TEST 5: Summary and Next Steps');
    console.log('-'.repeat(40));
    
    console.log('✅ Test driver user created/verified');
    console.log('✅ Test notifications created in Firebase RTDB');
    console.log('✅ FCM token configured');
    console.log('\n🔧 NEXT STEPS FOR TESTING:');
    console.log('1. Login to the app with:');
    console.log(`   Email: ${testDriverEmail}`);
    console.log(`   Password: ${testDriverPassword}`);
    console.log('2. Navigate to Driver Notifications screen');
    console.log('3. Check if notifications appear');
    console.log('4. Check browser/app console for any errors');
    
    console.log('\n📱 DRIVER LOGIN CREDENTIALS:');
    console.log('='.repeat(40));
    console.log(`Email: ${testDriverEmail}`);
    console.log(`Password: ${testDriverPassword}`);
    console.log(`User ID: ${driverUser.uid}`);
    console.log('='.repeat(40));
    
  } catch (error) {
    console.error('❌ Error in driver notifications test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDriverNotifications().then(() => {
  console.log('\n✅ Driver notifications test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});