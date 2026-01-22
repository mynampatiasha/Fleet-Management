const axios = require('axios');

async function testSingleEndpoint() {
    const baseURL = 'http://localhost:3001';
    const driverFirebaseUid = 'aVIF9Ahluig993fCNyZRrIDC3KO2';
    
    console.log('🧪 Testing single driver endpoint...');
    console.log('🆔 Firebase UID:', driverFirebaseUid);
    
    try {
        const response = await axios({
            method: 'GET',
            url: `${baseURL}/api/driver/dashboard/stats`,
            headers: { 'x-test-firebase-uid': driverFirebaseUid },
            timeout: 15000
        });
        
        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ FAILED');
        console.log('Status:', error.response?.status || 'No Response');
        console.log('Error:', error.response?.data || error.message);
        console.log('Full error:', error.code, error.errno);
    }
}

testSingleEndpoint();