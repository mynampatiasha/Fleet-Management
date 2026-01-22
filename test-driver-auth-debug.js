const admin = require('firebase-admin');
const axios = require('axios');

async function testDriverAuth() {
    try {
        console.log('🔍 Testing Driver Authentication Flow...');
        
        // Initialize Firebase Admin if not already done
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: 'abrafleet-cec94'
            });
        }
        
        // Step 1: Get the driver's Firebase user
        const driverEmail = 'rajesh.kumar@abrafleet.com';
        console.log('📧 Looking up Firebase user:', driverEmail);
        
        let firebaseUser;
        try {
            firebaseUser = await admin.auth().getUserByEmail(driverEmail);
            console.log('✅ Firebase user found:', firebaseUser.uid);
        } catch (error) {
            console.log('❌ Firebase user not found, creating...');
            firebaseUser = await admin.auth().createUser({
                email: driverEmail,
                password: 'tempPassword123',
                displayName: 'Rajesh Kumar'
            });
            console.log('✅ Firebase user created:', firebaseUser.uid);
        }
        
        // Step 2: Create a custom token and exchange for ID token
        console.log('\n🎫 Creating custom token...');
        const customToken = await admin.auth().createCustomToken(firebaseUser.uid, {
            role: 'driver',
            email: driverEmail
        });
        console.log('✅ Custom token created');
        
        // Step 3: Exchange custom token for ID token (simulate client-side)
        console.log('\n🔄 Exchanging for ID token...');
        const exchangeResponse = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyBvOkuAiJXjMhsx-_FbYbCvK_2-mxA0Qv4`,
            {
                token: customToken,
                returnSecureToken: true
            }
        );
        
        const idToken = exchangeResponse.data.idToken;
        console.log('✅ ID token obtained');
        console.log('   Token length:', idToken.length);
        
        // Step 4: Test each driver endpoint
        const endpoints = [
            '/api/drivers/profile',
            '/api/driver/reports/performance-summary',
            '/api/driver/dashboard/vehicle-check',
            '/api/driver/reports/daily-analytics',
            '/api/driver/reports/trips',
            '/api/driver/route/today'
        ];
        
        console.log('\n🧪 Testing driver endpoints...');
        
        for (const endpoint of endpoints) {
            try {
                console.log(`\n📡 Testing: ${endpoint}`);
                const response = await axios.get(`http://localhost:3001${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log(`✅ ${endpoint}: ${response.status} - ${response.statusText}`);
                if (response.data) {
                    console.log(`   Response keys: ${Object.keys(response.data).join(', ')}`);
                }
                
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.response?.status || 'ERROR'} - ${error.response?.statusText || error.message}`);
                if (error.response?.data) {
                    console.log(`   Error details:`, JSON.stringify(error.response.data, null, 2));
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testDriverAuth();