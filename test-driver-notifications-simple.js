// Simple test for driver notifications API
const http = require('http');

async function testDriverNotifications() {
    console.log('🔍 Testing driver notifications API...');
    
    // Test without authentication first
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/notifications',
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
                console.log(`📡 Response Status: ${res.statusCode}`);
                console.log(`📡 Response Headers:`, res.headers);
                
                try {
                    const response = JSON.parse(data);
                    console.log(`📡 Response Body:`, JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Notifications API is working');
                        if (response.data && response.data.notifications) {
                            console.log(`📬 Found ${response.data.notifications.length} notifications`);
                        }
                    } else if (res.statusCode === 401) {
                        console.log('🔐 Authentication required (expected)');
                    } else {
                        console.log(`❌ Unexpected status code: ${res.statusCode}`);
                    }
                    
                    resolve(response);
                } catch (e) {
                    console.log('❌ Error parsing response:', e.message);
                    console.log('📄 Raw response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Request error:', err.message);
            reject(err);
        });

        req.end();
    });
}

// Test the API
testDriverNotifications()
    .then(() => {
        console.log('✅ Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.log('❌ Test failed:', error.message);
        process.exit(1);
    });