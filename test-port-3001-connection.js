// Quick test to verify all services are working on port 3001
const axios = require('axios');

async function testPort3001Connection() {
    console.log('🔍 Testing all services on port 3001...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: 'http://localhost:3001/health',
            method: 'GET'
        },
        {
            name: 'Database Test',
            url: 'http://localhost:3001/test-db',
            method: 'GET'
        },
        {
            name: 'Email Config Test',
            url: 'http://localhost:3001/api/test-email-config',
            method: 'GET'
        },
        {
            name: 'Billing Health',
            url: 'http://localhost:3001/api/billing/health',
            method: 'GET'
        }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        try {
            console.log(`📡 Testing ${test.name}...`);
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000
            });
            
            if (response.status >= 200 && response.status < 300) {
                console.log(`✅ ${test.name}: PASSED (${response.status})`);
                passedTests++;
            } else {
                console.log(`❌ ${test.name}: FAILED (${response.status})`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ ${test.name}: CONNECTION REFUSED - Backend not running on port 3001`);
            } else {
                console.log(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }
    
    console.log(`\n📊 RESULTS: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 All services are working correctly on port 3001!');
        console.log('✅ Frontend should now connect successfully');
    } else {
        console.log('⚠️  Some services failed. Make sure backend is running:');
        console.log('   cd abra_fleet_backend && npm start');
    }
    
    console.log('\n🔧 Configuration Summary:');
    console.log('   Backend Port: 3001');
    console.log('   Frontend API Config: Uses port 3001');
    console.log('   WebSocket: Uses port 3001');
    console.log('   All test files: Updated to use port 3001');
}

testPort3001Connection().catch(console.error);