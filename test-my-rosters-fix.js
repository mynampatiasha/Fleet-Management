// Test script to verify the my-rosters endpoint fix
const axios = require('axios');

async function testMyRostersFix() {
  try {
    console.log('🧪 Testing my-rosters endpoint fix...\n');

    // Test with a sample token (you'll need to replace this with a real token)
    const testToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4YzQwYWY5NzQ5YzQwNzM4NzM5NzM5NzM5NzM5NzM5NzM5NzM5NzMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXVkIjoiYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXV0aF90aW1lIjoxNzM1ODA0NzE4LCJ1c2VyX2lkIjoiY3VzdG9tZXIxMjMiLCJzdWIiOiJjdXN0b21lcjEyMyIsImlhdCI6MTczNTgwNDcxOCwiZXhwIjoxNzM1ODA4MzE4LCJlbWFpbCI6ImN1c3RvbWVyMTIzQGFicmFmbGVldC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiY3VzdG9tZXIxMjNAYWJyYWZsZWV0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.example';

    console.log('🔍 Testing /api/roster/customer/my-rosters endpoint...');
    
    try {
      const response = await axios.get('http://localhost:3001/api/roster/customer/my-rosters', {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Request successful!');
      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.message);
      
      if (response.data.data) {
        console.log('   Rosters found:', response.data.data.length);
      }

    } catch (apiError) {
      if (apiError.response) {
        console.log('❌ API Error:');
        console.log('   Status:', apiError.response.status);
        console.log('   Message:', apiError.response.data?.message || 'No message');
        console.log('   Success:', apiError.response.data?.success);
        
        if (apiError.response.status === 404 && apiError.response.data?.message === 'User not found') {
          console.log('\n💡 This means the user lookup is still failing.');
          console.log('💡 The fix should now check both users and admin_users collections.');
        }
        
        if (apiError.response.status === 401) {
          console.log('\n💡 This is expected - we need a valid Firebase token.');
          console.log('💡 The important thing is that we get past the "User not found" error.');
        }
      } else {
        console.log('❌ Network Error:', apiError.message);
      }
    }

    // Test without token to see the auth error
    console.log('\n🔍 Testing without token (should get auth error, not user not found)...');
    
    try {
      const response = await axios.get('http://localhost:3001/api/roster/customer/my-rosters', {
        timeout: 5000
      });
      console.log('❌ Unexpected success without token');
    } catch (noTokenError) {
      if (noTokenError.response) {
        console.log('✅ Expected auth error:');
        console.log('   Status:', noTokenError.response.status);
        console.log('   Message:', noTokenError.response.data?.message || 'No message');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('🚀 Testing my-rosters endpoint fix...');
console.log('📝 Note: This test uses a sample token - you may need a real token for full testing');
console.log('');

testMyRostersFix();