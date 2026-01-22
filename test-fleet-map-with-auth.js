// Test Fleet Map API with authentication
const http = require('http');

const testFleetMapWithAuth = async () => {
  console.log('🧪 Testing Fleet Map API with Authentication...');
  
  // First, get a JWT token by logging in
  const loginData = JSON.stringify({
    email: 'admin@abrafleet.com',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  return new Promise((resolve, reject) => {
    console.log('🔐 Attempting login...');
    
    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginResponseData = '';
      
      loginRes.on('data', (chunk) => {
        loginResponseData += chunk;
      });
      
      loginRes.on('end', () => {
        console.log(`📡 Login Status: ${loginRes.statusCode}`);
        
        try {
          const loginResult = JSON.parse(loginResponseData);
          console.log('🔑 Login Response:', JSON.stringify(loginResult, null, 2));
          
          if (loginResult.success && loginResult.data && loginResult.data.token) {
            console.log('✅ Login successful, testing Fleet Map API...');
            
            // Now test the Fleet Map API with the token
            const fleetOptions = {
              hostname: 'localhost',
              port: 3001,
              path: '/api/admin/fleet/vehicles/live-status',
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.data.token}`
              }
            };

            const fleetReq = http.request(fleetOptions, (fleetRes) => {
              let fleetData = '';
              
              fleetRes.on('data', (chunk) => {
                fleetData += chunk;
              });
              
              fleetRes.on('end', () => {
                console.log(`📡 Fleet API Status: ${fleetRes.statusCode}`);
                
                try {
                  const fleetResult = JSON.parse(fleetData);
                  console.log('🚗 Fleet Data:', JSON.stringify(fleetResult, null, 2));
                  
                  if (fleetResult.success) {
                    console.log(`✅ Found ${fleetResult.data?.length || 0} vehicles`);
                  }
                  
                  resolve(fleetResult);
                } catch (e) {
                  console.log('📄 Raw Fleet Response:', fleetData);
                  resolve({ raw: fleetData });
                }
              });
            });

            fleetReq.on('error', (error) => {
              console.error('❌ Fleet API Error:', error.message);
              reject(error);
            });

            fleetReq.setTimeout(10000, () => {
              console.error('⏰ Fleet API Timeout');
              fleetReq.destroy();
              reject(new Error('Fleet API timeout'));
            });

            fleetReq.end();
            
          } else {
            console.error('❌ Login failed:', loginResult.message || 'Unknown error');
            reject(new Error('Login failed'));
          }
        } catch (e) {
          console.log('📄 Raw Login Response:', loginResponseData);
          reject(new Error('Invalid login response'));
        }
      });
    });

    loginReq.on('error', (error) => {
      console.error('❌ Login Error:', error.message);
      reject(error);
    });

    loginReq.setTimeout(10000, () => {
      console.error('⏰ Login Timeout');
      loginReq.destroy();
      reject(new Error('Login timeout'));
    });

    loginReq.write(loginData);
    loginReq.end();
  });
};

// Run the test
testFleetMapWithAuth()
  .then(() => {
    console.log('✅ Fleet Map API with auth test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fleet Map API with auth test failed:', error.message);
    process.exit(1);
  });