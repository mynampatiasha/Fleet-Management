// Trigger Document Expiry Check - Fixed Version
// This script properly authenticates and triggers the backend document expiry check

const http = require('http');

// Admin credentials
const ADMIN_EMAIL = 'admin@abrafleet.com';
const ADMIN_PASSWORD = 'admin123';

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function triggerDocumentExpiryCheck() {
  console.log('\n' + '='.repeat(80));
  console.log('🔔 TRIGGERING DOCUMENT EXPIRY CHECK');
  console.log('='.repeat(80) + '\n');

  try {
    // Step 1: Login as admin using JWT
    console.log('📋 Step 1: Logging in as admin...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/jwt/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      console.log('\n💡 Trying alternative login endpoint...\n');
      
      // Try alternative login endpoint
      const altLoginResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (altLoginResponse.status !== 200) {
        console.error('❌ Alternative login also failed:', altLoginResponse.data);
        return;
      }

      // Extract token from nested structure
      const tokenData = altLoginResponse.data.data || altLoginResponse.data;
      if (!tokenData || !tokenData.token) {
        console.error('❌ No token received from alternative login');
        console.error('   Response:', altLoginResponse.data);
        return;
      }

      var token = tokenData.token;
      console.log('✅ Logged in successfully (alternative endpoint)\n');
    } else {
      // Extract token from nested structure
      const tokenData = loginResponse.data.data || loginResponse.data;
      if (!tokenData || !tokenData.token) {
        console.error('❌ No token received from login');
        console.error('   Response:', loginResponse.data);
        return;
      }
      
      var token = tokenData.token;
      console.log('✅ Logged in successfully\n');
    }

    // Step 2: Trigger document expiry check
    console.log('📋 Step 2: Triggering document expiry check...');
    console.log('   Using token:', token.substring(0, 20) + '...\n');
    
    const checkResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/notifications/check-document-expiry',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('   Response status:', checkResponse.status);
    console.log('   Response data:', JSON.stringify(checkResponse.data, null, 2));
    console.log('');

    if (checkResponse.status === 200) {
      console.log('✅ Document expiry check triggered successfully!');
      console.log('   The backend is now processing all documents...\n');
    } else {
      console.error('❌ Failed to trigger check');
      console.error('   Status:', checkResponse.status);
      console.error('   Response:', checkResponse.data);
      return;
    }

    // Step 3: Wait a moment for processing
    console.log('⏳ Waiting 5 seconds for backend to process...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 4: Check for new notifications
    console.log('📋 Step 3: Checking for new notifications...');
    const notificationsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/onesignal/my-notifications?page=1&limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (notificationsResponse.status === 200) {
      const notifications = notificationsResponse.data.notifications || [];
      const documentNotifications = notifications.filter(n => 
        n.type === 'document_expired' || n.type === 'document_expiring_soon'
      );

      console.log(`✅ Found ${notifications.length} total notifications`);
      console.log(`   Document expiry notifications: ${documentNotifications.length}\n`);

      if (documentNotifications.length > 0) {
        console.log('📬 Document Expiry Notifications:');
        console.log('-'.repeat(80));
        documentNotifications.forEach((notif, index) => {
          console.log(`\n${index + 1}. ${notif.title}`);
          console.log(`   Message: ${notif.message}`);
          console.log(`   Type: ${notif.type}`);
          console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
        });
        console.log('');
      }
    }

    console.log('='.repeat(80));
    console.log('✅ DOCUMENT EXPIRY CHECK COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. Check notifications in the app:');
    console.log('   - Admin Dashboard → Notifications (🔔 icon)');
    console.log('   - Driver Management → Document Expiry Alerts card');
    console.log('   - Wait for floating notification popup (checks every 60 seconds)');
    console.log('');
    console.log('2. Verify in Vehicle Master:');
    console.log('   - Admin Dashboard → Vehicle Management → Vehicle Master');
    console.log('   - Look for vehicles with red/orange indicators');
    console.log('   - Filter by "Expired Documents" or "Expiring Soon"');
    console.log('');
    console.log('3. Check backend logs:');
    console.log('   - Look for "📄 DOCUMENT EXPIRY CHECK STARTED"');
    console.log('   - Check for "📤 Sending notification" messages');
    console.log('   - Verify "✅ Notification sent successfully"');
    console.log('');
    console.log('4. Clean up test documents when done:');
    console.log('   - Run: node cleanup-test-documents.js');
    console.log('');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the script
triggerDocumentExpiryCheck().catch(console.error);
