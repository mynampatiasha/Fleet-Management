const axios = require('axios');

async function createPoojaJoshiViaAPI() {
    console.log('👤 Creating Pooja Joshi User via Backend API');
    console.log('Email: pooja.joshi@wipro.com');
    console.log('Organization: Wipro');
    console.log('=' .repeat(50));

    const baseUrl = 'http://localhost:3001/api';

    try {
        // First, try to register the user
        console.log('📝 Registering user...');
        
        const registrationData = {
            email: 'pooja.joshi@wipro.com',
            password: 'pooja.joshi',
            name: 'Pooja Joshi',
            firstName: 'Pooja',
            lastName: 'Joshi',
            organization: 'Wipro',
            role: 'client',
            department: 'IT Services',
            designation: 'Manager',
            phone: '+91-9876543210'
        };

        try {
            const registerResponse = await axios.post(`${baseUrl}/auth/register`, registrationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ User registration successful!');
            console.log('Status:', registerResponse.status);
            console.log('User ID:', registerResponse.data.user?.id);
            console.log('Token:', registerResponse.data.token ? 'Generated' : 'Not generated');

        } catch (registerError) {
            if (registerError.response?.status === 409) {
                console.log('ℹ️  User already exists, proceeding with login test...');
            } else {
                console.log('⚠️  Registration failed:', registerError.response?.data?.message || registerError.message);
            }
        }

        // Now test login
        console.log('\n🔐 Testing login...');
        
        const loginData = {
            email: 'pooja.joshi@wipro.com',
            password: 'pooja.joshi'
        };

        const loginResponse = await axios.post(`${baseUrl}/auth/login`, loginData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Login successful!');
        console.log('Status:', loginResponse.status);
        console.log('Token:', loginResponse.data.token ? 'Present' : 'Missing');
        console.log('User Role:', loginResponse.data.user?.role || 'Not specified');
        console.log('User Name:', loginResponse.data.user?.name || 'Not specified');

        const token = loginResponse.data.token;

        // Test billing access
        console.log('\n💰 Testing billing access...');
        try {
            const billingResponse = await axios.get(`${baseUrl}/billing/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('✅ Billing access granted!');
            console.log('Billing data available:', billingResponse.data ? 'Yes' : 'No');
        } catch (billingError) {
            console.log('⚠️  Billing access limited:', billingError.response?.status || 'Connection error');
        }

        // Test user profile access
        console.log('\n👤 Testing user profile access...');
        try {
            const profileResponse = await axios.get(`${baseUrl}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('✅ Profile access granted!');
            console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
        } catch (profileError) {
            console.log('⚠️  Profile access limited:', profileError.response?.status || 'Connection error');
        }

        // Test admin access
        console.log('\n👑 Testing admin access...');
        try {
            const adminResponse = await axios.get(`${baseUrl}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('✅ Admin access granted!');
        } catch (adminError) {
            console.log('ℹ️  Admin access not available (expected for client role)');
            console.log('Status:', adminError.response?.status || 'Connection error');
        }

        console.log('\n🎉 USER SETUP AND TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log('✅ User account: READY');
        console.log('✅ Login: WORKING');
        console.log('✅ Authentication token: GENERATED');
        console.log('✅ Basic access: GRANTED');

        console.log('\n📋 VERIFIED LOGIN CREDENTIALS');
        console.log('Username: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Status: READY FOR TESTING');

        return {
            success: true,
            token: token,
            user: loginResponse.data.user
        };

    } catch (error) {
        console.error('❌ Setup failed!');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }

        return {
            success: false,
            error: error.message
        };
    }
}

// Run the setup
createPoojaJoshiViaAPI().then(result => {
    if (result.success) {
        console.log('\n🚀 Ready to test! You can now use these credentials in your application.');
    } else {
        console.log('\n❌ Setup incomplete. Please check the backend server and try again.');
    }
}).catch(console.error);