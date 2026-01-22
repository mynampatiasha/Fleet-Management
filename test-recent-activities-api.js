// test-recent-activities-api.js
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testRecentActivitiesAPI() {
  console.log('🧪 Testing Recent Activities API...\n');

  try {
    // Test the recent activities endpoint
    console.log('📊 Testing GET /api/admin/recent-activities');
    
    const response = await axios.get(`${API_BASE_URL}/api/admin/recent-activities`, {
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you would need a valid Firebase token
        // 'Authorization': 'Bearer YOUR_FIREBASE_TOKEN'
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log(`\n📈 Found ${response.data.activities.length} recent activities`);
      
      // Display first few activities
      const activities = response.data.activities.slice(0, 5);
      console.log('\n🔍 Sample Activities:');
      activities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.title}`);
        console.log(`   ${activity.subtitle}`);
        console.log(`   Type: ${activity.type} | Time: ${activity.timeAgo}`);
        console.log(`   Priority: ${activity.priority} | Color: ${activity.color}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error testing Recent Activities API:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received. Is the backend running?');
      console.error('   Make sure to start the backend with: npm start');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
testRecentActivitiesAPI();