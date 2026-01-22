// Test company analytics endpoint
const http = require('http');

async function testCompanyAnalytics() {
  console.log('🔍 Testing Company Analytics Endpoint...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/analytics/company-analytics?filter=today',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📊 Company Analytics Response:');
          console.log('Status Code:', res.statusCode);
          console.log('Success:', response.success);
          
          if (response.success) {
            console.log('Total Companies:', response.mostActive?.length || 0);
            console.log('Analytics:', JSON.stringify(response.analytics, null, 2));
            
            if (response.mostActive && response.mostActive.length > 0) {
              console.log('\n🏢 Sample Company Data:');
              const sampleCompany = response.mostActive[0];
              console.log('Company Name:', sampleCompany.name);
              console.log('Total Employees:', sampleCompany.totalEmployees);
              console.log('Completed Trips:', sampleCompany.completedTrips);
              console.log('Revenue:', sampleCompany.revenue);
              
              if (sampleCompany.employeeBreakdown && sampleCompany.employeeBreakdown.length > 0) {
                console.log('\n👥 Employee Breakdown Available:');
                console.log('Number of Active Employees:', sampleCompany.employeeBreakdown.length);
                console.log('Sample Employee:', JSON.stringify(sampleCompany.employeeBreakdown[0], null, 2));
              } else {
                console.log('\n⚠️  No employee breakdown data available');
              }
            }
          } else {
            console.log('Error:', response.message || response.error);
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.end();
  });
}

// Test different time filters
async function testAllFilters() {
  const filters = ['today', 'week', 'month'];
  
  for (const filter of filters) {
    console.log(`\n🔍 Testing filter: ${filter}`);
    console.log('='.repeat(50));
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/admin/analytics/company-analytics?filter=${filter}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(error);
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
      
      console.log('Status:', response.success ? '✅ Success' : '❌ Failed');
      if (response.success) {
        console.log('Companies found:', response.mostActive?.length || 0);
        console.log('Total revenue:', response.analytics?.totalRevenue || 0);
      } else {
        console.log('Error:', response.message || response.error);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  try {
    await testCompanyAnalytics();
    await testAllFilters();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();