// Debug notifications backend
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
                        resolve(response.idToken);
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

async function debugNotificationsAPI(token) {
    console.log('\n🔍 Making request to notifications API...');
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/notifications?page=1&limit=20',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

// Main debug function
async function runDebug() {
    try {
        console.log('🐛 Debugging Driver Notifications Backend');
        console.log('==========================================\n');
        
        // Get Firebase token
        const token = await getFirebaseToken();
        
        // Test notifications API
        await debugNotificationsAPI(token);
        
        console.log('\n✅ Debug completed');
        process.exit(0);
        
    } catch (error) {
        console.log('\n❌ Debug failed:', error.message);
        process.exit(1);
    }
}

runDebug();