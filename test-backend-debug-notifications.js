// Test backend with debug logging for notifications
const http = require('http');
const https = require('https');

// Driver test credentials
const DRIVER_EMAIL = 'drivertest@gmail.com';
const DRIVER_PASSWORD = 'drivertest';

async function getFirebaseToken() {
    console.log('🔐 Getting Firebase token for driver...');
    
    const postData = JSON.stringify({
        email: DRIVER_EMAIL,
        password: DRIVER_PASSWORD,
        returnSecureToken: true
    });

    const options = {
        hostname: 'identitytoolkit.googleapis.com',
        port: 443,
        path: '/v1/accounts:signInWithPassword?key=AIzaSyBQ5F_6J_8VDMbf7b4U_wIk_Z0HdYDRaDo',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.idToken) {
                        console.log('✅ Firebase token obtained');
                        console.log('   User UID:', response.localId);
                        resolve({
                            token: response.idToken,
                            uid: response.localId
                        });
                    } else {
                        console.log('❌ No token in response:', response);
                        reject(new Error('No token received'));
                    }
                } catch (e) {
                    console.log('❌ Error parsing Firebase response:', e.message);
                    reject(e);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Firebase request error:', err.message);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}

async function testNotificationsWithDebug(authData) {
    console.log('\n🔍 Testing notifications API with debug headers...');
    console.log('   User UID:', authData.uid);
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/notifications?page=1&limit=20',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.token}`,
            'X-Debug': 'true',
            'X-Test-Firebase-UID': authData.uid  // Add test header
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
                        const notifications = response.data?.notifications || [];
                        console.log(`\n📊 Analysis:`);
                        console.log(`   Total notifications: ${notifications.length}`);
                        console.log(`   Expected user ID: ${authData.uid}`);
                        
                        if (notifications.length === 0) {
                            console.log('\n❌ No notifications found. Possible issues:');
                            console.log('   1. Database connection issue');
                            console.log('   2. User ID mismatch');
                            console.log('   3. Wrong database/collection');
                            console.log('   4. Query filter issue');
                        } else {
                            console.log('\n✅ Notifications found:');
                            notifications.forEach((notif, index) => {
                                console.log(`   ${index + 1}. ${notif.title} (${notif.type})`);
                            });
                        }
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

// Test health endpoint first
async function testHealthEndpoint() {
    console.log('🏥 Testing backend health endpoint...');
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET'
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📡 Health Status: ${res.statusCode}`);
                try {
                    const response = JSON.parse(data);
                    console.log(`📡 Health Response:`, response);
                    resolve(response);
                } catch (e) {
                    console.log('📄 Health Raw response:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Health check error:', err.message);
            reject(err);
        });

        req.end();
    });
}

// Main test function
async function runDebugTest() {
    try {
        console.log('🐛 Backend Debug Test for Driver Notifications');
        console.log('='.repeat(50));
        
        // Test health endpoint
        await testHealthEndpoint();
        
        // Get Firebase token
        const authData = await getFirebaseToken();
        
        // Test notifications API
        await testNotificationsWithDebug(authData);
        
        console.log('\n✅ Debug test completed');
        process.exit(0);
        
    } catch (error) {
        console.log('\n❌ Debug test failed:', error.message);
        process.exit(1);
    }
}

runDebugTest();