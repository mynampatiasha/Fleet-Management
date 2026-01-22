// Quick test to verify the connection is working on port 3001
const axios = require('axios');

async function testConnection() {
    console.log('🔍 Testing backend connection on port 3001...');
    
    try {
        // Test health endpoint
        const healthResponse = await axios.get('http://localhost:3001/health');
        console.log('✅ Health check successful:', healthResponse.data);
        
        // Test a few key endpoints
        const endpoints = [
            '/api/admin/analytics/company-stats',
            '/api/admin/fleet/vehicle/fleet-overview/consecutive-trips',
            '/api/admin/dashboard/recent-activities'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`http://localhost:3001${endpoint}`, {
                    timeout: 5000,
                    headers: {
                        'Authorization': 'Bearer test-token'
                    }
                });
                console.log(`✅ ${endpoint}: Status ${response.status}`);
            } catch (error) {
                if (error.response) {
                    console.log(`⚠️  ${endpoint}: Status ${error.response.status} (${error.response.statusText})`);
                } else {
                    console.log(`❌ ${endpoint}: ${error.message}`);
                }
            }
        }
        
        console.log('\n🎉 Backend is accessible on port 3001!');
        console.log('📱 Flutter app should now connect successfully.');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();