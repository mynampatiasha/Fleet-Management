// Test HRM Employees API after fixing compilation errors
const http = require('http');

const testHrmEmployeesAPI = () => {
  console.log('🚀 Testing HRM Employees API Integration...');
  console.log('📍 Endpoint: GET /api/hrm/employees');
  console.log('📍 Expected: JSON response with employees data');
  console.log('');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/hrm/employees',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Note: In production, you'll need a valid JWT token
      'Authorization': 'Bearer your-jwt-token-here'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log(`✅ Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Response Structure:');
        console.log('   - Success:', response.success);
        console.log('   - Data Type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        console.log('   - Data Length:', response.data?.length || 0);
        console.log('   - Message:', response.message);
        
        if (response.data && response.data.length > 0) {
          console.log('✅ Sample Employee Data:');
          console.log('   - Name:', response.data[0].name);
          console.log('   - Email:', response.data[0].email);
          console.log('   - Department:', response.data[0].department);
        }
      } catch (e) {
        console.log('⚠️  Raw Response (not JSON):');
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ API Request Error: ${e.message}`);
    console.log('💡 Make sure the backend server is running on port 3001');
    console.log('💡 Command: cd abra_fleet_backend && npm start');
  });

  req.setTimeout(5000, () => {
    console.error('❌ Request timeout after 5 seconds');
    req.destroy();
  });

  req.end();
};

// Test the API
testHrmEmployeesAPI();

// Also test health endpoint
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log('🏥 Testing Backend Health...');
  
  const healthOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
  };

  const healthReq = http.request(healthOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        console.log('✅ Backend Health:', health.status);
        console.log('✅ MongoDB:', health.mongodb);
        console.log('✅ Uptime:', Math.round(health.uptime), 'seconds');
      } catch (e) {
        console.log('⚠️  Health Response:', data);
      }
    });
  });

  healthReq.on('error', (e) => {
    console.error(`❌ Health Check Error: ${e.message}`);
  });

  healthReq.end();
}, 1000);