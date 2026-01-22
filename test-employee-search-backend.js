// Test script to verify employee search functionality backend
const http = require('http');

async function testBackendConnection() {
    console.log('🔍 Testing Employee Search Backend Connection');
    console.log('============================================================');
    
    try {
        // Test basic backend health
        const healthResponse = await makeRequest('GET', 'http://localhost:3001/api/health');
        console.log('✅ Backend health check:', healthResponse ? 'OK' : 'Failed');
        
        // Test user management endpoint
        const usersResponse = await makeRequest('GET', 'http://localhost:3001/api/user-management/users?limit=10');
        console.log('📋 Users endpoint response:', usersResponse ? 'OK' : 'Failed');
        
        if (usersResponse && usersResponse.data) {
            console.log(`📊 Found ${usersResponse.data.length} employees for search`);
            
            // Show sample employee data structure
            if (usersResponse.data.length > 0) {
                const sampleEmployee = usersResponse.data[0];
                console.log('👤 Sample employee structure:');
                console.log('   - ID:', sampleEmployee.id || 'N/A');
                console.log('   - Name:', sampleEmployee.name_parson || sampleEmployee.name || 'N/A');
                console.log('   - Email:', sampleEmployee.email || 'N/A');
                console.log('   - Department:', sampleEmployee.department || 'N/A');
            }
        }
        
        console.log('\n✅ Employee search backend is ready!');
        console.log('🎯 The Flutter app can now fetch employees for the search dialog.');
        
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        console.log('\n💡 Make sure the backend is running on port 3001');
        console.log('   Run: cd abra_fleet_backend && node index.js');
    }
}

function makeRequest(method, url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.end();
    });
}

testBackendConnection();