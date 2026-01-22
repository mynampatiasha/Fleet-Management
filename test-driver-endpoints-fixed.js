const axios = require('axios');

async function testDriverEndpoints() {
    const baseURL = 'http://localhost:3001';
    
    // Driver credentials from previous analysis
    const driverFirebaseUid = 'aVIF9Ahluig993fCNyZRrIDC3KO2';
    const driverId = 'DRV-100001';
    
    console.log('🧪 TESTING DRIVER ENDPOINTS AFTER FIX');
    console.log('='.repeat(60));
    console.log('🆔 Firebase UID:', driverFirebaseUid);
    console.log('🚗 Driver ID:', driverId);
    console.log('');
    
    // Test endpoints that were previously failing
    const endpoints = [
        {
            name: 'Driver Profile',
            url: '/api/drivers/profile',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        },
        {
            name: 'Driver Reports - Performance Summary',
            url: '/api/driver/reports/performance-summary',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        },
        {
            name: 'Driver Reports - Daily Analytics',
            url: '/api/driver/reports/daily-analytics',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        },
        {
            name: 'Driver Reports - Trips',
            url: '/api/driver/reports/trips',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        },
        {
            name: 'Driver Dashboard Stats',
            url: '/api/driver/dashboard/stats',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        },
        {
            name: 'Driver Dashboard Vehicle Check',
            url: '/api/driver/dashboard/vehicle-check',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        },
        {
            name: 'Driver Route Today',
            url: '/api/driver/route/today',
            method: 'GET',
            headers: { 'x-test-firebase-uid': driverFirebaseUid }
        }
    ];
    
    console.log('📊 ENDPOINT TEST RESULTS');
    console.log('-'.repeat(60));
    
    let successCount = 0;
    let totalCount = endpoints.length;
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios({
                method: endpoint.method,
                url: `${baseURL}${endpoint.url}`,
                headers: endpoint.headers,
                timeout: 10000
            });
            
            console.log(`✅ ${endpoint.name}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
            console.log('');
            
            successCount++;
            
        } catch (error) {
            console.log(`❌ ${endpoint.name}`);
            console.log(`   Status: ${error.response?.status || 'No Response'}`);
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
            console.log('');
        }
    }
    
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}/${totalCount}`);
    console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
        console.log('🎉 ALL DRIVER ENDPOINTS ARE NOW WORKING!');
        console.log('✅ 403 Forbidden errors have been resolved');
    } else {
        console.log('⚠️  Some endpoints still need attention');
        console.log('💡 Check the failed endpoints above for specific issues');
    }
}

testDriverEndpoints().catch(console.error);