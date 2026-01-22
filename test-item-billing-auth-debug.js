// Test Item Billing Authentication Debug
// ============================================================================
// This script tests the authentication and permission issues for item billing
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testItemBillingAuth() {
  console.log('🔍 ITEM BILLING AUTHENTICATION DEBUG');
  console.log('=' * 80);
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1️⃣ Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }

    // Test 2: Try to access items endpoint without auth
    console.log('\n2️⃣ Testing items endpoint without authentication...');
    try {
      const noAuthResponse = await axios.get(`${BASE_URL}/api/items`);
      console.log('⚠️ Unexpected: Got response without auth:', noAuthResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Expected 401 Unauthorized without auth token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Try with test Firebase UID (development mode)
    console.log('\n3️⃣ Testing with admin user...');
    try {
      const testResponse = await axios.get(`${BASE_URL}/api/items`, {
        headers: {
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Admin user response:', testResponse.data);
    } catch (error) {
      console.log('❌ Admin user failed:', error.response?.status, error.response?.data);
    }

    // Test 4: Check test user with billing permissions
    console.log('\n4️⃣ Testing test user with billing permissions...');
    try {
      const adminResponse = await axios.get(`${BASE_URL}/api/items`, {
        headers: {
          'x-test-firebase-uid': 'test-user-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      console.log('✅ Test user response:', adminResponse.data);
    } catch (error) {
      console.log('❌ Test user failed:', error.response?.status, error.response?.data);
    }

    // Test 5: Create a test item
    console.log('\n5️⃣ Testing item creation...');
    const testItem = {
      name: 'Test Item',
      type: 'Goods',
      unit: 'pcs',
      isSellable: true,
      isPurchasable: true,
      sellingPrice: 3000,
      costPrice: 2500,
      salesAccount: 'Sales',
      purchaseAccount: 'Direct Expenses'
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/api/items`, testItem, {
        headers: {
          'Content-Type': 'application/json',
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      console.log('✅ Item created successfully:', createResponse.data);
    } catch (error) {
      console.log('❌ Item creation failed:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 401) {
        console.log('\n🔍 AUTHENTICATION ISSUE DETECTED');
        console.log('The user is not properly authenticated or lacks billing permissions');
        console.log('Possible solutions:');
        console.log('1. Check if user exists in admin_users or users collection');
        console.log('2. Verify user has billing permissions');
        console.log('3. Check Firebase authentication token');
      }
    }

    // Test 6: Check specific user permissions
    console.log('\n6️⃣ Testing user permission check...');
    try {
      const permissionResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      console.log('✅ User profile:', permissionResponse.data);
    } catch (error) {
      console.log('❌ Permission check failed:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testItemBillingAuth().catch(console.error);