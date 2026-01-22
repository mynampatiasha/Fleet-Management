const axios = require('axios');

async function testPoojaJoshiSimpleAuth() {
    console.log('🔐 Testing Pooja Joshi Authentication');
    console.log('Username: pooja.joshi@wipro.com');
    console.log('Password: pooja.joshi');
    console.log('=' .repeat(50));

    const baseUrl = 'http://localhost:3001';

    // Test different possible authentication endpoints
    const authEndpoints = [
        '/api/auth/login',
        '/api/login',
        '/auth/login',
        '/login',
        '/api/users/login',
        '/api/auth/signin'
    ];

    const credentials = {
        email: 'pooja.joshi@wipro.com',
        password: 'pooja.joshi'
    };

    console.log('🔍 Testing available authentication endpoints...');

    for (const endpoint of authEndpoints) {
        try {
            console.log(`\n📡 Testing: ${baseUrl}${endpoint}`);
            
            const response = await axios.post(`${baseUrl}${endpoint}`, credentials, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('✅ SUCCESS!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            
            // If we get a token, test it
            if (response.data.token) {
                console.log('\n🎫 Testing token...');
                await testTokenAccess(response.data.token);
            }

            return {
                success: true,
                endpoint: endpoint,
                token: response.data.token,
                user: response.data.user
            };

        } catch (error) {
            console.log('❌ Failed');
            console.log('Status:', error.response?.status || 'No response');
            console.log('Error:', error.response?.data?.message || error.message);
        }
    }

    // If no standard auth endpoints work, try to check what endpoints are available
    console.log('\n🔍 Checking available endpoints...');
    await checkAvailableEndpoints();

    return { success: false };
}

async function testTokenAccess(token) {
    const testEndpoints = [
        '/api/users/profile',
        '/api/user/profile',
        '/api/profile',
        '/api/dashboard',
        '/api/billing/dashboard',
        '/api/admin/dashboard'
    ];

    for (const endpoint of testEndpoints) {
        try {
            const response = await axios.get(`http://localhost:3001${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 3000
            });

            console.log(`✅ ${endpoint}: Accessible`);
            
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.response?.status || 'Error'}`);
        }
    }
}

async function checkAvailableEndpoints() {
    try {
        // Try to get API documentation or health check
        const healthEndpoints = [
            '/',
            '/health',
            '/api',
            '/api/health',
            '/status'
        ];

        for (const endpoint of healthEndpoints) {
            try {
                const response = await axios.get(`http://localhost:3001${endpoint}`, {
                    timeout: 3000
                });

                console.log(`✅ ${endpoint}: Available`);
                console.log('Response:', JSON.stringify(response.data, null, 2));
                
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.response?.status || 'Error'}`);
            }
        }

    } catch (error) {
        console.log('Error checking endpoints:', error.message);
    }
}

// Run the test
testPoojaJoshiSimpleAuth().then(result => {
    console.log('\n🎯 FINAL RESULT');
    console.log('=' .repeat(50));
    
    if (result.success) {
        console.log('✅ Authentication: WORKING');
        console.log('✅ Endpoint:', result.endpoint);
        console.log('✅ Credentials: VALID');
        console.log('\n📋 LOGIN CREDENTIALS VERIFIED');
        console.log('Username: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Status: READY FOR USE');
    } else {
        console.log('❌ Authentication: FAILED');
        console.log('❌ User may not exist in the system');
        console.log('💡 Suggestion: Create user account first');
    }
}).catch(console.error);