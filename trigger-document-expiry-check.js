// Manually Trigger Document Expiry Check
// This script triggers the backend document expiry check immediately

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
          resolve({ status: res.statusCode, data: JSON.parse(body) });
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
    // Step 1: Login as admin
    console.log('📋 Step 1: Logging in as admin...');
    const loginResponse = await makeRequest({
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

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Trigger document expiry check
    console.log('📋 Step 2: Triggering document expiry check...');
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

    if (checkResponse.status === 200) {
      console.log('✅ Document expiry check triggered successfully');
      console.log('   Response:', checkResponse.data);
    } else {
      console.error('❌ Failed to trigger check:', checkResponse.data);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📋 NEXT STEPS:');
    console.log('='.repeat(80));
    console.log('');
    console.log('1. Wait a few seconds for the backend to process');
    console.log('');
    console.log('2. Check notifications in the app:');
    console.log('   - Admin Dashboard → Notifications (🔔 icon)');
    console.log('   - Driver Management → Document Expiry Alerts card');
    console.log('   - Wait for floating notification popup');
    console.log('');
    console.log('3. Verify in Vehicle Master:');
    console.log('   - Look for vehicles with red/orange indicators');
    console.log('   - Filter by "Expired Documents" or "Expiring Soon"');
    console.log('');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
triggerDocumentExpiryCheck().catch(console.error);
