const axios = require('axios');

async function testEndpoint() {
  console.log('🧪 Testing /api/admin/customers/unified endpoint...\n');
  
  try {
    // Test without auth (should get 401)
    const response = await axios.get('http://localhost:3001/api/admin/customers/unified');
    console.log('❌ Unexpected success:', response.status);
  } catch (error) {
    if (error.response) {
      console.log(`✅ Endpoint exists! Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Auth required'}`);
      
      if (error.response.status === 401) {
        console.log('\n✅ Route is properly mounted and requires authentication');
      } else if (error.response.status === 404) {
        console.log('\n❌ Route NOT FOUND - Backend issue!');
      }
    } else {
      console.log('❌ Cannot connect to backend:', error.message);
    }
  }
}

testEndpoint();
