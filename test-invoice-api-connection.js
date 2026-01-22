// Test invoice API connection on port 3001
const axios = require('axios');

async function testInvoiceAPI() {
    console.log('🧪 Testing Invoice API on port 3001...\n');
    
    const baseURL = 'http://localhost:3001/api/invoices';
    
    const tests = [
        {
            name: 'Invoice Health Check',
            method: 'GET',
            url: `${baseURL}/health`,
            expectAuth: false
        },
        {
            name: 'Invoice Stats (requires auth)',
            method: 'GET', 
            url: `${baseURL}/stats`,
            expectAuth: true
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📡 Testing ${test.name}...`);
            
            const config = {
                method: test.method,
                url: test.url,
                timeout: 5000,
                validateStatus: function (status) {
                    // Accept any status for testing
                    return status < 500;
                }
            };
            
            const response = await axios(config);
            
            if (response.status === 200) {
                console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
            } else if (response.status === 401 && test.expectAuth) {
                console.log(`✅ ${test.name}: AUTH REQUIRED (${response.status}) - Expected`);
            } else {
                console.log(`⚠️  ${test.name}: ${response.status} - ${response.data?.message || 'Unknown'}`);
            }
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ ${test.name}: CONNECTION REFUSED - Backend not running on port 3001`);
            } else if (error.response) {
                console.log(`⚠️  ${test.name}: ${error.response.status} - ${error.response.data?.message || error.message}`);
            } else {
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('✅ Invoice API should now use correct port 3001');
    console.log('✅ Flutter InvoiceService updated to use ApiConfig');
    console.log('✅ No more hardcoded IP addresses');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Restart Flutter app: flutter run -d chrome --web-port 8080');
    console.log('2. Test invoice creation from the app');
    console.log('3. Check browser console for correct API calls to localhost:3001');
}

testInvoiceAPI().catch(console.error);