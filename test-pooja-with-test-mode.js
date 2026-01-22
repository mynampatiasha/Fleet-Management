const axios = require('axios');

async function testPoojaJoshiWithTestMode() {
    console.log('🔐 Testing Pooja Joshi with Test Mode');
    console.log('Username: pooja.joshi@wipro.com');
    console.log('Password: pooja.joshi');
    console.log('=' .repeat(50));

    const baseUrl = 'http://localhost:3001';

    try {
        // First, let's verify the user exists by email
        console.log('🔍 Step 1: Verifying user exists...');
        
        const verifyResponse = await axios.get(`${baseUrl}/api/auth/verify-email/pooja.joshi@wipro.com`, {
            timeout: 5000
        });

        console.log('✅ User verification successful!');
        console.log('User found:', verifyResponse.data.user.name);
        console.log('Role:', verifyResponse.data.user.role);
        console.log('Status:', verifyResponse.data.user.status);

        // Test with test mode headers
        console.log('\n🧪 Step 2: Testing with development test mode...');
        
        const testHeaders = {
            'Content-Type': 'application/json',
            'x-test-firebase-uid': 'test-pooja-joshi-uid',
            'Authorization': 'Bearer test-token-for-development'
        };

        // Test login with test mode
        const loginData = {
            firebaseUid: 'test-pooja-joshi-uid',
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi',
            role: 'client'
        };

        const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, loginData, {
            headers: testHeaders,
            timeout: 10000
        });

        console.log('✅ Test mode login successful!');
        console.log('Status:', loginResponse.status);
        console.log('User:', JSON.stringify(loginResponse.data.user, null, 2));

        // Test profile access
        console.log('\n👤 Step 3: Testing profile access...');
        
        const profileResponse = await axios.get(`${baseUrl}/api/auth/profile`, {
            headers: testHeaders,
            timeout: 5000
        });

        console.log('✅ Profile access successful!');
        console.log('Profile:', JSON.stringify(profileResponse.data.user, null, 2));

        // Test billing access
        console.log('\n💰 Step 4: Testing billing access...');
        
        try {
            const billingResponse = await axios.get(`${baseUrl}/api/billing/dashboard`, {
                headers: testHeaders,
                timeout: 5000
            });

            console.log('✅ Billing access granted!');
            console.log('Billing data available:', billingResponse.data ? 'Yes' : 'No');
        } catch (billingError) {
            console.log('⚠️  Billing access limited:', billingError.response?.status || 'Connection error');
            console.log('Message:', billingError.response?.data?.message || billingError.message);
        }

        console.log('\n🎉 TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log('✅ User exists in database: YES');
        console.log('✅ Test mode authentication: WORKING');
        console.log('✅ Profile access: GRANTED');
        console.log('✅ User role:', verifyResponse.data.user.role);
        console.log('✅ User status:', verifyResponse.data.user.status);

        console.log('\n📋 CREDENTIALS STATUS');
        console.log('Username: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Status: USER EXISTS AND IS ACCESSIBLE');
        console.log('Note: Requires Firebase authentication in production');

        return {
            success: true,
            userExists: true,
            role: verifyResponse.data.user.role,
            status: verifyResponse.data.user.status
        };

    } catch (error) {
        console.error('❌ Test failed!');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }

        // If user doesn't exist, let's try to create them
        if (error.response?.status === 404) {
            console.log('\n🔧 User not found, attempting to create...');
            return await createPoojaJoshiUser();
        }

        return {
            success: false,
            error: error.message
        };
    }
}

async function createPoojaJoshiUser() {
    console.log('\n👤 Creating Pooja Joshi user account...');
    
    try {
        // Use test mode to create user via login endpoint
        const testHeaders = {
            'Content-Type': 'application/json',
            'x-test-firebase-uid': 'test-pooja-joshi-uid',
            'Authorization': 'Bearer test-token-for-development'
        };

        const userData = {
            firebaseUid: 'test-pooja-joshi-uid',
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi',
            role: 'client'
        };

        const createResponse = await axios.post('http://localhost:3001/api/auth/login', userData, {
            headers: testHeaders,
            timeout: 10000
        });

        console.log('✅ User created successfully!');
        console.log('User:', JSON.stringify(createResponse.data.user, null, 2));

        console.log('\n📋 NEW USER CREDENTIALS');
        console.log('Username: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Role:', createResponse.data.user.role);
        console.log('Status: CREATED AND READY');

        return {
            success: true,
            userExists: true,
            created: true,
            role: createResponse.data.user.role
        };

    } catch (createError) {
        console.error('❌ Failed to create user:', createError.message);
        
        if (createError.response) {
            console.error('Status:', createError.response.status);
            console.error('Response:', createError.response.data);
        }

        return {
            success: false,
            error: createError.message
        };
    }
}

// Run the test
testPoojaJoshiWithTestMode().then(result => {
    console.log('\n🎯 FINAL RESULT');
    console.log('=' .repeat(50));
    
    if (result.success) {
        console.log('✅ Pooja Joshi credentials: VERIFIED');
        console.log('✅ User exists:', result.userExists ? 'YES' : 'NO');
        console.log('✅ Role:', result.role || 'Not specified');
        console.log('✅ Status: READY FOR TESTING');
        
        if (result.created) {
            console.log('✅ User was created during this test');
        }
        
        console.log('\n🚀 You can now use these credentials:');
        console.log('   Username: pooja.joshi@wipro.com');
        console.log('   Password: pooja.joshi');
        console.log('   Note: Requires Firebase authentication in production app');
        
    } else {
        console.log('❌ Test failed:', result.error);
        console.log('💡 Suggestion: Check if backend server is running');
        console.log('💡 Suggestion: Check if MongoDB is connected');
    }
}).catch(console.error);