// Simple test to check what's happening with the authentication
const axios = require('axios');

async function testCurrentAuthFlow() {
  console.log('\n🔍 DEBUGGING CURRENT AUTH FLOW');
  console.log('='.repeat(80));
  
  // The Flutter app is getting 403, which means:
  // 1. The request is reaching the server
  // 2. The token is being processed (not 401)
  // 3. But something in the auth middleware is rejecting it (403)
  
  console.log('\n📱 FLUTTER APP ERROR ANALYSIS:');
  console.log('   Status: 403 Forbidden');
  console.log('   URL: http://localhost:3001/api/admin/fleet/vehicles/live-status');
  console.log('   This means: Token processed but access denied');
  
  console.log('\n🔍 POSSIBLE CAUSES:');
  console.log('   1. User exists but has wrong role');
  console.log('   2. User exists but is inactive');
  console.log('   3. User not found in database');
  console.log('   4. Additional middleware checking admin permissions');
  
  // Let's check if there's additional middleware by testing the route structure
  console.log('\n🧪 TESTING ROUTE ACCESSIBILITY:');
  
  try {
    // Test 1: Check if the route exists at all
    console.log('\n1️⃣ Testing route existence...');
    const response = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Route exists, requires auth (401)');
    } else if (error.response?.status === 404) {
      console.log('❌ Route not found (404)');
    } else {
      console.log('🤔 Unexpected response:', error.response?.status);
    }
  }
  
  // Test 2: Check what happens with a super admin email
  console.log('\n2️⃣ Testing with super admin email simulation...');
  
  // Create a test that simulates what the Flutter app is doing
  console.log('\n3️⃣ SOLUTION APPROACH:');
  console.log('   The Flutter app is authenticated (not 401)');
  console.log('   But getting 403 (forbidden)');
  console.log('   This suggests the user exists but lacks permissions');
  
  console.log('\n💡 RECOMMENDED FIXES:');
  console.log('   1. Check if the current user has admin role');
  console.log('   2. Check if the user account is active');
  console.log('   3. Ensure the user is in the correct collection (admin_users)');
  console.log('   4. Verify the route doesn\'t have additional role middleware');
  
  console.log('\n🔧 IMMEDIATE ACTION:');
  console.log('   Let me check the backend logs when the Flutter app makes the request...');
  
  console.log('\n='.repeat(80));
}

testCurrentAuthFlow();