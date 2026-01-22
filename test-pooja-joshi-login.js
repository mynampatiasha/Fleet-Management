const axios = require('axios');

async function testPoojaJoshiLogin() {
    console.log('🔐 Testing Pooja Joshi Login Credentials');
    console.log('Username: pooja.joshi@wipro.com');
    console.log('Password: pooja.joshi');
    console.log('=' .repeat(50));

    const credentials = {
        email: 'pooja.joshi@wipro.com',
        password: 'pooja.joshi'
    };

    try {
        // Test 1: Backend Authentication API
        console.log('📡 Testing Backend Authentication...');
        const backendUrl = 'http://localhost:3001/api/auth/login';
        
        const authResponse = await axios.post(backendUrl, credentials, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Backend Auth Success!');
        console.log('Status:', authResponse.status);
        console.log('Token:', authResponse.data.token ? 'Present' : 'Missing');
        console.log('User Role:', authResponse.data.user?.role || 'Not specified');
        console.log('User ID:', authResponse.data.user?.id || 'Not specified');

        // Test 2: Check if user exists in database
        console.log('\n📊 Checking User in Database...');
        const userCheckUrl = 'http://localhost:3001/api/users/check';
        
        const userCheckResponse = await axios.post(userCheckUrl, {
            email: credentials.email
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authResponse.data.token}`
            },
            timeout: 5000
        });

        console.log('✅ User Database Check Success!');
        console.log('User exists:', userCheckResponse.data.exists);
        console.log('User details:', JSON.stringify(userCheckResponse.data.user, null, 2));

        // Test 3: Test Billing System Access
        console.log('\n💰 Testing Billing System Access...');
        const billingUrl = 'http://localhost:3001/api/billing/dashboard';
        
        const billingResponse = await axios.get(billingUrl, {
            headers: {
                'Authorization': `Bearer ${authResponse.data.token}`
            },
            timeout: 5000
        });

        console.log('✅ Billing Access Success!');
        console.log('Billing data available:', billingResponse.data ? 'Yes' : 'No');

        // Test 4: Test Admin Permissions
        console.log('\n👑 Testing Admin Permissions...');
        const adminUrl = 'http://localhost:3001/api/admin/dashboard';
        
        try {
            const adminResponse = await axios.get(adminUrl, {
                headers: {
                    'Authorization': `Bearer ${authResponse.data.token}`
                },
                timeout: 5000
            });

            console.log('✅ Admin Access Success!');
            console.log('Admin permissions:', adminResponse.data ? 'Granted' : 'Limited');
        } catch (adminError) {
            console.log('⚠️  Admin Access Limited or Denied');
            console.log('Status:', adminError.response?.status || 'Connection Error');
        }

        console.log('\n🎉 LOGIN TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log('✅ Authentication: SUCCESS');
        console.log('✅ User exists in database: YES');
        console.log('✅ Token generated: YES');
        console.log('✅ Basic access: GRANTED');
        console.log('✅ Billing access: AVAILABLE');

    } catch (error) {
        console.error('❌ Login Test Failed!');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        } else if (error.request) {
            console.error('No response received - Backend might be down');
        }

        // Try alternative authentication methods
        console.log('\n🔄 Trying Alternative Authentication...');
        await tryAlternativeAuth(credentials);
    }
}

async function tryAlternativeAuth(credentials) {
    try {
        // Try Firebase Authentication
        console.log('🔥 Testing Firebase Auth...');
        const firebaseUrl = 'http://localhost:3001/api/auth/firebase-login';
        
        const firebaseResponse = await axios.post(firebaseUrl, credentials, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Firebase Auth Success!');
        console.log('Firebase UID:', firebaseResponse.data.uid);
        
    } catch (firebaseError) {
        console.log('⚠️  Firebase Auth not available or failed');
        
        // Try direct database check
        console.log('🗄️  Checking direct database...');
        await checkDirectDatabase(credentials);
    }
}

async function checkDirectDatabase(credentials) {
    try {
        const dbCheckUrl = 'http://localhost:3001/api/users/direct-check';
        
        const dbResponse = await axios.post(dbCheckUrl, {
            email: credentials.email,
            password: credentials.password
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        console.log('✅ Direct Database Check Success!');
        console.log('User found:', dbResponse.data.found);
        console.log('Password match:', dbResponse.data.passwordMatch);
        
    } catch (dbError) {
        console.log('❌ Direct database check failed');
        console.log('Suggestion: User might need to be created in the system');
    }
}

// Run the test
testPoojaJoshiLogin().catch(console.error);