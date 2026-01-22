// 🧪 BILLING DASHBOARD API - AUTOMATED TEST SUITE
// Complete test coverage for all billing endpoints

const http = require('http');
const https = require('https');

// Test Configuration
const config = {
  baseUrl: 'http://localhost:3001',
  // You'll need to replace this with a valid JWT token from your system
  authToken: 'YOUR_JWT_TOKEN_HERE', // Replace with actual token
  timeout: 10000 // 10 seconds
};

// Test Results Tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`
      },
      timeout: config.timeout
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test runner function
async function runTest(testName, testFunction) {
  testResults.total++;
  
  try {
    console.log(`\n🧪 Testing: ${testName}...`);
    await testFunction();
    testResults.passed++;
    console.log(`✅ PASSED`);
    testResults.details.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    testResults.failed++;
    console.log(`❌ FAILED: ${error.message}`);
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Individual Test Functions
async function testHealthCheck() {
  const response = await makeRequest('GET', '/api/billing/health');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Health check should return success: true');
  }
  
  if (!response.body.message) {
    throw new Error('Health check should return a message');
  }
}

async function testSeedSampleData() {
  const response = await makeRequest('POST', '/api/billing/seed-data');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Seed data should return success: true');
  }
  
  if (!response.body.data) {
    throw new Error('Seed data should return data object');
  }
}

async function testDashboardSummary() {
  const response = await makeRequest('GET', '/api/billing/dashboard/summary');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Dashboard summary should return success: true');
  }
  
  const data = response.body.data;
  if (!data) {
    throw new Error('Dashboard summary should return data object');
  }
  
  // Check required widgets
  const requiredWidgets = ['receivables', 'payables', 'cashFlow', 'projects', 'bankAccounts', 'watchlist'];
  for (const widget of requiredWidgets) {
    if (!data[widget]) {
      throw new Error(`Dashboard summary missing ${widget} widget`);
    }
  }
  
  // Check receivables structure
  if (typeof data.receivables.total !== 'number') {
    throw new Error('Receivables total should be a number');
  }
  
  // Check payables structure
  if (typeof data.payables.total !== 'number') {
    throw new Error('Payables total should be a number');
  }
  
  // Check cash flow structure
  if (typeof data.cashFlow.netCashFlow !== 'number') {
    throw new Error('Cash flow netCashFlow should be a number');
  }
}

async function testReceivablesSummary() {
  const response = await makeRequest('GET', '/api/billing/receivables/summary');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Receivables summary should return success: true');
  }
  
  const data = response.body.data;
  if (typeof data.total !== 'number' || typeof data.count !== 'number') {
    throw new Error('Receivables summary should have total and count as numbers');
  }
}

async function testPayablesSummary() {
  const response = await makeRequest('GET', '/api/billing/payables/summary');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Payables summary should return success: true');
  }
  
  const data = response.body.data;
  if (typeof data.total !== 'number' || typeof data.count !== 'number') {
    throw new Error('Payables summary should have total and count as numbers');
  }
}

async function testCashFlowData() {
  const response = await makeRequest('GET', '/api/billing/cash-flow');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Cash flow should return success: true');
  }
  
  const data = response.body.data;
  if (typeof data.totalIncoming !== 'number' || typeof data.totalOutgoing !== 'number') {
    throw new Error('Cash flow should have totalIncoming and totalOutgoing as numbers');
  }
  
  if (!Array.isArray(data.chartData)) {
    throw new Error('Cash flow should have chartData as array');
  }
}

async function testProjectsList() {
  const response = await makeRequest('GET', '/api/billing/projects');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Projects should return success: true');
  }
  
  const data = response.body.data;
  if (!Array.isArray(data.projects)) {
    throw new Error('Projects should have projects as array');
  }
  
  if (typeof data.totalCount !== 'number') {
    throw new Error('Projects should have totalCount as number');
  }
}

async function testBankAccounts() {
  const response = await makeRequest('GET', '/api/billing/bank-accounts');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Bank accounts should return success: true');
  }
  
  const data = response.body.data;
  if (!Array.isArray(data.accounts)) {
    throw new Error('Bank accounts should have accounts as array');
  }
  
  if (typeof data.totalBalance !== 'number') {
    throw new Error('Bank accounts should have totalBalance as number');
  }
}

async function testAccountWatchlist() {
  const response = await makeRequest('GET', '/api/billing/account-watchlist');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Account watchlist should return success: true');
  }
  
  const data = response.body.data;
  if (!Array.isArray(data.accounts)) {
    throw new Error('Account watchlist should have accounts as array');
  }
  
  if (!data.basis) {
    throw new Error('Account watchlist should have basis field');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪'.repeat(40));
  console.log('🧪 BILLING DASHBOARD API TEST SUITE 🧪');
  console.log('🧪'.repeat(40));
  
  // Check if auth token is set
  if (config.authToken === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n⚠️  WARNING: Using placeholder auth token');
    console.log('   For full testing, replace config.authToken with a valid JWT token');
    console.log('   Tests will still run but may fail due to authentication\n');
  }
  
  // Run all tests
  await runTest('Health Check', testHealthCheck);
  await runTest('Seed Sample Data', testSeedSampleData);
  await runTest('Dashboard Summary', testDashboardSummary);
  await runTest('Receivables Summary', testReceivablesSummary);
  await runTest('Payables Summary', testPayablesSummary);
  await runTest('Cash Flow Data', testCashFlowData);
  await runTest('Projects List', testProjectsList);
  await runTest('Bank Accounts', testBankAccounts);
  await runTest('Account Watchlist', testAccountWatchlist);
  
  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
  
  if (testResults.passed === testResults.total) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ Billing Dashboard API is 100% functional!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('💡 Common issues:');
    console.log('   - Server not running (start with: node index.js)');
    console.log('   - Invalid auth token (update config.authToken)');
    console.log('   - MongoDB not connected');
    console.log('   - Missing environment variables');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. If tests passed: Your backend is ready for Flutter integration!');
  console.log('2. If tests failed: Fix the issues and run tests again');
  console.log('3. Update home_billing.dart to use real API endpoints');
  console.log('4. Test the complete Flutter + Backend integration');
  
  return testResults.passed === testResults.total;
}

// Handle command line execution
if (require.main === module) {
  // Check if custom auth token provided
  if (process.argv[2]) {
    config.authToken = process.argv[2];
    console.log('✅ Using provided auth token');
  }
  
  // Check if custom base URL provided
  if (process.argv[3]) {
    config.baseUrl = process.argv[3];
    console.log(`✅ Using custom base URL: ${config.baseUrl}`);
  }
  
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  config,
  testResults
};

// Usage Examples:
// node test_billing_api.js
// node test_billing_api.js YOUR_ACTUAL_JWT_TOKEN
// node test_billing_api.js YOUR_JWT_TOKEN http://localhost:3001