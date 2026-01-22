// Test driver notifications with authentication
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

async function testDriverNotifications(token) {
    console.log('🔍 Testing driver notifications API with auth...');
    
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
                
                try {
                    const response = JSON.parse(data);
                    console.log(`📡 Response:`, JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Driver notifications API is working');
                        
                        if (response.data && response.data.notifications) {
                            const notifications = response.data.notifications;
                            console.log(`📬 Found ${notifications.length} total notifications`);
                            
                            // Filter for driver-specific notifications
                            const driverNotificationTypes = [
                                'route_assigned',
                                'roster_assigned', 
                                'trip_cancelled',
                                'trip_updated',
                                'shift_reminder',
                                'document_expiring_soon',
                                'document_expired',
                                'vehicle_assigned',
                                'emergency_alert'
                            ];
                            
                            const driverNotifications = notifications.filter(n => 
                                driverNotificationTypes.includes(n.type)
                            );
                            
                            console.log(`🚗 Driver-specific notifications: ${driverNotifications.length}`);
                            
                            if (driverNotifications.length > 0) {
                                console.log('\n📋 Driver Notifications:');
                                driverNotifications.forEach((notif, index) => {
                                    console.log(`   ${index + 1}. ${notif.title || 'No title'}`);
                                    console.log(`      Type: ${notif.type}`);
                                    console.log(`      Read: ${notif.isRead || notif.read || false}`);
                                    console.log(`      Created: ${notif.createdAt}`);
                                    console.log('');
                                });
                            } else {
                                console.log('📭 No driver-specific notifications found');
                                
                                // Show all notification types for debugging
                                if (notifications.length > 0) {
                                    console.log('\n🔍 All notification types found:');
                                    const types = [...new Set(notifications.map(n => n.type))];
                                    types.forEach(type => {
                                        const count = notifications.filter(n => n.type === type).length;
                                        console.log(`   - ${type}: ${count}`);
                                    });
                                }
                            }
                            
                            // Check pagination
                            if (response.data.pagination) {
                                const pagination = response.data.pagination;
                                console.log(`\n📄 Pagination:`);
                                console.log(`   Current page: ${pagination.currentPage || 1}`);
                                console.log(`   Total pages: ${pagination.totalPages || 1}`);
                                console.log(`   Total items: ${pagination.totalItems || 0}`);
                            }
                        } else {
                            console.log('📭 No notifications data in response');
                        }
                    } else {
                        console.log(`❌ API returned error: ${res.statusCode}`);
                        if (response.message) {
                            console.log(`   Error: ${response.message}`);
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

// Main test function
async function runTest() {
    try {
        console.log('🚗 Testing Driver Notifications API');
        console.log('=====================================\n');
        
        // Get Firebase token
        const token = await getFirebaseToken();
        
        // Test notifications API
        await testDriverNotifications(token);
        
        console.log('\n✅ Test completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTest();