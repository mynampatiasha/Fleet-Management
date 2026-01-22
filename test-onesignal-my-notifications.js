// test-onesignal-my-notifications.js
// Quick test for the /api/onesignal/my-notifications endpoint

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMyNotifications() {
  try {
    console.log('🧪 Testing OneSignal My Notifications Endpoint\n');

    // Step 1: Login to get token
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log('   Token:', token.substring(0, 50) + '...\n');

    // Step 2: Test the my-notifications endpoint
    console.log('📝 Step 2: Fetching my notifications...');
    console.log('   URL:', `${BASE_URL}/api/onesignal/my-notifications?page=1&limit=50`);
    console.log('   Authorization: Bearer', token.substring(0, 20) + '...\n');
    
    const notificationsResponse = await axios.get(
      `${BASE_URL}/api/onesignal/my-notifications?page=1&limit=50`,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Notifications fetched successfully!');
    console.log('   Total notifications:', notificationsResponse.data.data.pagination.total);
    console.log('   Unread count:', notificationsResponse.data.data.unreadCount);
    console.log('   Notifications:', notificationsResponse.data.data.notifications.length);

    if (notificationsResponse.data.data.notifications.length > 0) {
      console.log('\n📬 Sample notification:');
      const sample = notificationsResponse.data.data.notifications[0];
      console.log('   Title:', sample.title);
      console.log('   Message:', sample.message);
      console.log('   Type:', sample.type);
      console.log('   Read:', sample.isRead);
    }

    console.log('\n🎉 TEST PASSED! The endpoint is working correctly.');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.statusText);
      console.error('   Error:', error.response.data?.error);
      console.error('   Full response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testMyNotifications();
