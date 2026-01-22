// Test script to check driver notifications API directly
const axios = require('axios');
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

const API_BASE_URL = 'http://localhost:3001/api';

async function testDriverNotificationsAPI() {
  console.log('\n🔔 TESTING DRIVER NOTIFICATIONS API');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create/get test driver user
    console.log('\n📋 TEST 1: Setting up test driver user');
    console.log('-'.repeat(40));
    
    const testDriverEmail = 'drivertest@abrafleet.com';
    let driverUser;
    
    try {
      driverUser = await admin.auth().getUserByEmail(testDriverEmail);
      console.log('✅ Test driver user found:', driverUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        driverUser = await admin.auth().createUser({
          email: testDriverEmail,
          password: 'Driver123!',
          displayName: 'Test Driver',
          emailVerified: true
        });
        console.log('✅ Created test driver user:', driverUser.uid);
      } else {
        throw error;
      }
    }
    
    // Set driver role
    await admin.auth().setCustomUserClaims(driverUser.uid, {
      role: 'driver',
      organization: 'abrafleet'
    });
    
    // Test 2: Get Firebase ID token for API calls
    console.log('\n📋 TEST 2: Getting Firebase ID token');
    console.log('-'.repeat(40));
    
    const customToken = await admin.auth().createCustomToken(driverUser.uid);
    console.log('✅ Custom token created');
    
    // Test 3: Check backend connection
    console.log('\n📋 TEST 3: Testing backend connection');
    console.log('-'.repeat(40));
    
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/notifications/health`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend health check passed');
      console.log('   Status:', healthResponse.data.data?.status);
      console.log('   MongoDB:', healthResponse.data.data?.mongodb);
    } catch (error) {
      console.log('❌ Backend health check failed');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
    }
    
    // Test 4: Create test notifications in MongoDB
    console.log('\n📋 TEST 4: Creating test notifications in MongoDB');
    console.log('-'.repeat(40));
    
    const testNotifications = [
      {
        userId: driverUser.uid,
        type: 'route_assigned',
        title: '🚗 Route Assigned',
        body: 'You have been assigned to Route #123 for tomorrow morning',
        priority: 'high',
        isRead: false,
        createdAt: new Date(),
        data: {
          routeId: '123',
          scheduleDate: new Date().toISOString()
        }
      },
      {
        userId: driverUser.uid,
        type: 'roster_assigned',
        title: '📋 Roster Updated', 
        body: 'Your roster for this week has been updated',
        priority: 'normal',
        isRead: false,
        createdAt: new Date(),
        data: {
          rosterId: '456',
          weekStart: new Date().toISOString()
        }
      },
      {
        userId: driverUser.uid,
        type: 'trip_cancelled',
        title: '❌ Trip Cancelled',
        body: 'Trip #789 has been cancelled due to customer request',
        priority: 'high',
        isRead: false,
        createdAt: new Date(),
        data: {
          tripId: '789',
          reason: 'customer_request'
        }
      }
    ];
    
    // We'll use the test endpoint to create notifications
    try {
      const testNotificationResponse = await axios.post(`${API_BASE_URL}/notifications/test`, {}, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Test notification created via API');
      console.log('   Notification ID:', testNotificationResponse.data.data?._id);
    } catch (error) {
      console.log('❌ Failed to create test notification via API');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    
    // Test 5: Fetch notifications via API
    console.log('\n📋 TEST 5: Fetching notifications via API');
    console.log('-'.repeat(40));
    
    try {
      const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 50
        }
      });
      
      const notifications = notificationsResponse.data.data?.notifications || [];
      console.log(`✅ Fetched ${notifications.length} notifications from API`);
      
      if (notifications.length > 0) {
        console.log('   Recent notifications:');
        notifications.slice(0, 3).forEach((notification, index) => {
          console.log(`   ${index + 1}. ${notification.title} (${notification.type})`);
          console.log(`      Read: ${notification.isRead ? 'Yes' : 'No'}`);
          console.log(`      Created: ${notification.createdAt}`);
        });
      } else {
        console.log('   ⚠️ No notifications found');
      }
      
      // Test driver-specific filtering
      const driverNotificationTypes = [
        'route_assigned', 'roster_assigned', 'trip_cancelled', 'trip_updated',
        'shift_reminder', 'document_expiring_soon', 'document_expired',
        'vehicle_assigned', 'emergency_alert'
      ];
      
      const driverNotifications = notifications.filter(n => 
        driverNotificationTypes.includes(n.type)
      );
      
      console.log(`   Driver-relevant notifications: ${driverNotifications.length}`);
      
    } catch (error) {
      console.log('❌ Failed to fetch notifications via API');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.log('   🔑 Authentication issue - check token');
      }
    }
    
    // Test 6: Check unread count
    console.log('\n📋 TEST 6: Checking unread count');
    console.log('-'.repeat(40));
    
    try {
      const unreadResponse = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const unreadCount = unreadResponse.data.data?.unreadCount || 0;
      console.log(`✅ Unread notifications count: ${unreadCount}`);
    } catch (error) {
      console.log('❌ Failed to get unread count');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    
    // Test 7: Run diagnostics
    console.log('\n📋 TEST 7: Running notification diagnostics');
    console.log('-'.repeat(40));
    
    try {
      const diagnosticsResponse = await axios.get(`${API_BASE_URL}/notifications/diagnose`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const results = diagnosticsResponse.data.data;
      console.log('✅ Diagnostics completed');
      console.log(`   Passed: ${results.summary.passed}`);
      console.log(`   Failed: ${results.summary.failed}`);
      console.log(`   Warnings: ${results.summary.warnings}`);
      
      if (results.recommendations.length > 0) {
        console.log('   Recommendations:');
        results.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }
    } catch (error) {
      console.log('❌ Diagnostics failed');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    
    // Summary
    console.log('\n📋 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Test completed');
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check if backend is running on port 3001');
    console.log('2. Verify MongoDB connection');
    console.log('3. Check Firebase Admin SDK configuration');
    console.log('4. Ensure notification routes are properly registered');
    console.log('5. Check authentication middleware');
    
    console.log('\n📱 TEST DRIVER CREDENTIALS:');
    console.log('='.repeat(40));
    console.log(`Email: ${testDriverEmail}`);
    console.log(`Password: Driver123!`);
    console.log(`User ID: ${driverUser.uid}`);
    console.log('='.repeat(40));
    
  } catch (error) {
    console.error('❌ Error in API test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDriverNotificationsAPI().then(() => {
  console.log('\n✅ Driver notifications API test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ API test failed:', error);
  process.exit(1);
});