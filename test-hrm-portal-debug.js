// Test HRM Portal Debug - Check if employees module is working
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testHRMPortalDebug() {
    console.log('🔍 Testing HRM Portal Debug...\n');
    
    try {
        // Test 1: Check if backend is running
        console.log('1️⃣ Testing backend connection...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Backend is running:', healthResponse.data);
        
        // Test 2: Check if HRM employees route exists
        console.log('\n2️⃣ Testing HRM employees route...');
        try {
            const employeesResponse = await axios.get(`${API_BASE}/api/hrm/employees`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ HRM employees route exists');
            console.log('📊 Response:', employeesResponse.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ HRM employees route exists (auth required)');
            } else {
                console.log('❌ HRM employees route error:', error.message);
            }
        }
        
        // Test 3: Check route mounting
        console.log('\n3️⃣ Checking route mounting...');
        const routes = [
            '/api/hrm/employees',
            '/api/hrm/employees/test'
        ];
        
        for (const route of routes) {
            try {
                await axios.get(`${API_BASE}${route}`);
                console.log(`✅ Route ${route} is accessible`);
            } catch (error) {
                if (error.response?.status === 401) {
                    console.log(`✅ Route ${route} exists (auth required)`);
                } else if (error.response?.status === 404) {
                    console.log(`❌ Route ${route} not found`);
                } else {
                    console.log(`⚠️ Route ${route} error:`, error.response?.status || error.message);
                }
            }
        }
        
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        console.log('💡 Make sure backend is running on port 3001');
    }
}

// Run the test
testHRMPortalDebug().catch(console.error);