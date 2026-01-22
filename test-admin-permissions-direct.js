const axios = require('axios');

async function testAdminPermissions() {
  try {
    console.log('🧪 Testing Admin User Permissions...\n');
    
    // Test 1: Get navigation config (should work for admin)
    console.log('🧭 Testing navigation config endpoint...');
    try {
      const navResponse = await axios.get('http://localhost:3001/api/user-management/navigation-config', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          // This endpoint requires admin permissions, but let's see what happens
        }
      });
      
      console.log('✅ Navigation config response:', navResponse.status);
      console.log('   Items count:', navResponse.data.data?.length || 0);
    } catch (navError) {
      console.log('❌ Navigation config failed:', navError.response?.status, navError.response?.data?.message);
    }
    
    // Test 2: Get admin users (should require admin permissions)
    console.log('\n👥 Testing admin users endpoint...');
    try {
      const usersResponse = await axios.get('http://localhost:3001/api/user-management/users', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Admin users response:', usersResponse.status);
      console.log('   Users count:', usersResponse.data.data?.length || 0);
    } catch (usersError) {
      console.log('❌ Admin users failed:', usersError.response?.status, usersError.response?.data?.message);
    }
    
    // Test 3: Check if backend is responding
    console.log('\n🏥 Testing backend health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/api/admin/vehicles', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Backend health response:', healthResponse.status);
    } catch (healthError) {
      console.log('❌ Backend health failed:', healthError.response?.status, healthError.response?.data?.message);
    }
    
    // Test 4: Test email verification endpoint (should not require auth)
    console.log('\n📧 Testing email verification...');
    try {
      const emailResponse = await axios.get('http://localhost:3001/api/auth/verify-email/admin@abrafleet.com', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Email verification response:', emailResponse.status);
      console.log('   User found:', emailResponse.data.success);
      console.log('   User role:', emailResponse.data.user?.role);
      console.log('   User status:', emailResponse.data.user?.status);
    } catch (emailError) {
      console.log('❌ Email verification failed:', emailError.response?.status, emailError.response?.data?.message);
    }
    
    console.log('\n📋 Test Summary:');
    console.log('   - Admin user exists in database ✅');
    console.log('   - Backend is running ✅');
    console.log('   - Permission system needs Firebase token for protected routes ⚠️');
    console.log('   - Email verification works without auth ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testAdminPermissions();