// Test Company Employee Stats API
const http = require('http');

// Test the new company employee stats endpoint
const testCompanyEmployeeStats = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/analytics/company-employee-stats',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-test-firebase-uid': 'test-admin-uid' // Use test mode
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Company Employee Stats API Response:');
      console.log('Status Code:', res.statusCode);
      
      try {
        const response = JSON.parse(data);
        console.log('Success:', response.success);
        console.log('Message:', response.message);
        console.log('Error:', response.error);
        console.log('Full Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.companies && response.companies.length > 0) {
          console.log('\nCompanies with Employee Data:');
          response.companies.forEach((company, index) => {
            console.log(`${index + 1}. ${company.name}: ${company.totalEmployees} employees`);
            console.log(`   - Active Trips: ${company.activeTrips}`);
            console.log(`   - Completed Trips: ${company.completedTrips}`);
            console.log(`   - Revenue: ₹${company.totalRevenue.toFixed(2)}`);
            console.log('');
          });
        } else {
          console.log('No company data found or API failed');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.end();
};

console.log('🧪 Testing Company Employee Stats API...');
testCompanyEmployeeStats();