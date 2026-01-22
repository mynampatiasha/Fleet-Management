const axios = require('axios');

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================
const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'your_admin_email@example.com';  // Update this
const ADMIN_PASSWORD = 'your_admin_password';         // Update this

// ============================================================================
// TEST SCRIPT
// ============================================================================

async function testOneSignalComplete() {
  console.log('🧪 ========================================');
  console.log('🧪 ONESIGNAL COMPLETE TEST');
  console.log('🧪 ========================================\n');

  try {
    // Step 1: Login as Admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      userType: 'admin'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Test Health Check
    console.log('📝 Step 2: Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/onesignal/health`);
    console.log('✅ Health check passed!');
    console.log(`   App ID: ${healthResponse.data.config.appId}`);
    console.log(`   REST API Key: ${healthResponse.data.config.restApiKey}`);
    console.log(`   Database: ${healthResponse.data.config.database}\n`);

    // Step 3: Register Device
    console.log('📝 Step 3: Registering test device...');
    const registerResponse = await axios.post(
      `${BASE_URL}/api/onesignal/register-device`,
      {
        playerId: 'test-player-id-' + Date.now(),
        deviceType: 'web',
        deviceModel: 'Test Browser',
        tags: { userRole: 'admin', test: true }
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Device registered successfully!\n');

    // Step 4: Send Test Notification
    console.log('📝 Step 4: Sending test notification...');
    const notifyResponse = await axios.post(
      `${BASE_URL}/api/onesignal/send`,
      {
        targetRole: 'admin',
        title: '🎉 OneSignal Test Notification',
        message: 'If you see this, OneSignal is working perfectly!',
        type: 'test',
        category: 'system',
        priority: 'high',
        data: { testData: 'Hello from OneSignal!' }
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Test notification sent successfully!');
    console.log(`   OneSignal ID: ${notifyResponse.data.data.oneSignalId}`);
    console.log(`   Recipients: ${notifyResponse.data.data.recipients}\n`);

    // Step 5: Get Notifications
    console.log('📝 Step 5: Fetching notifications...');
    const notificationsResponse = await axios.get(
      `${BASE_URL}/api/onesignal/my-notifications`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Notifications fetched successfully!');
    console.log(`   Total: ${notificationsResponse.data.data.pagination.total}`);
    console.log(`   Unread: ${notificationsResponse.data.data.unreadCount}\n`);

    // Step 6: Get Statistics
    console.log('📝 Step 6: Getting notification statistics...');
    const statsResponse = await axios.get(
      `${BASE_URL}/api/onesignal/stats`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Statistics retrieved successfully!');
    console.log(`   Total: ${statsResponse.data.data.total}`);
    console.log(`   Unread: ${statsResponse.data.data.unread}`);
    console.log(`   Read: ${statsResponse.data.data.read}\n`);

    // Success Summary
    console.log('🎉 ========================================');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('🎉 ========================================');
    console.log('✅ OneSignal is configured correctly');
    console.log('✅ Backend is connected to OneSignal');
    console.log('✅ Device registration works');
    console.log('✅ Notification sending works');
    console.log('✅ Notification retrieval works');
    console.log('✅ Statistics tracking works');
    console.log('\n🚀 OneSignal is ready for production use!');

  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ TEST FAILED');
    console.error('❌ ========================================');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.message}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(`Error: ${error.message}`);
    }
    
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check that backend is running (http://localhost:3001)');
    console.error('2. Verify ONESIGNAL_APP_ID in .env file');
    console.error('3. Verify ONESIGNAL_REST_API_KEY in .env file');
    console.error('4. Check that MongoDB is connected');
    console.error('5. Verify admin credentials are correct');
  }
}

// Run the test
testOneSignalComplete();
