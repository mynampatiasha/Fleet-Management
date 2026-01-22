// Test frontend authentication by simulating the same request the Flutter app makes
const axios = require('axios');

async function testFrontendAuth() {
    console.log('🧪 TESTING FRONTEND AUTHENTICATION');
    console.log('==================================================');
    
    try {
        // Test without authentication first
        console.log('🔍 Testing without authentication...');
        
        try {
            const response = await axios.get('http://localhost:3001/api/roster/admin/pending');
            console.log('❌ Unexpected success without auth:', response.status);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Correctly rejected without auth (401)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status || error.message);
            }
        }
        
        // Test with invalid token
        console.log('\n🔍 Testing with invalid token...');
        
        try {
            const response = await axios.get('http://localhost:3001/api/roster/admin/pending', {
                headers: {
                    'Authorization': 'Bearer invalid-token'
                }
            });
            console.log('❌ Unexpected success with invalid token:', response.status);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Correctly rejected invalid token (401)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status || error.message);
            }
        }
        
        console.log('\n💡 SOLUTION:');
        console.log('The frontend needs to ensure it\'s sending a valid Firebase ID token.');
        console.log('The error in the browser shows 500, but the actual issue is authentication (401).');
        console.log('The Flutter app should check:');
        console.log('1. User is properly signed in to Firebase');
        console.log('2. Firebase ID token is being retrieved correctly');
        console.log('3. Token is being sent in Authorization header');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFrontendAuth();