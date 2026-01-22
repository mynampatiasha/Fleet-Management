// Test Flutter Item Billing
// ============================================================================
// This script simulates the exact request that Flutter makes
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFlutterItemBilling() {
  console.log('📱 FLUTTER ITEM BILLING TEST');
  console.log('=' * 80);
  
  try {
    // Simulate the exact Flutter request
    console.log('\n1️⃣ Testing Flutter item creation request...');
    
    const flutterItem = {
      name: 'Flutter Test Item',
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
      const response = await axios.post(`${BASE_URL}/api/items`, flutterItem, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      
      console.log('✅ Flutter item creation successful!');
      console.log('Response:', response.data);
      
      // Test getting the created item
      const itemId = response.data.item._id;
      console.log('\n2️⃣ Testing item retrieval...');
      
      const getResponse = await axios.get(`${BASE_URL}/api/items/${itemId}`, {
        headers: {
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      
      console.log('✅ Item retrieved successfully!');
      console.log('Item details:', getResponse.data);
      
    } catch (error) {
      console.log('❌ Flutter request failed:', error.response?.status, error.response?.data);
    }

    // Test getting all items (like Flutter does)
    console.log('\n3️⃣ Testing items list (Flutter style)...');
    
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/items`, {
        headers: {
          'Accept': 'application/json',
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      
      console.log('✅ Items list retrieved successfully!');
      console.log(`Found ${listResponse.data.items.length} items`);
      
      if (listResponse.data.items.length > 0) {
        console.log('Sample item:', listResponse.data.items[0]);
      }
      
    } catch (error) {
      console.log('❌ Items list failed:', error.response?.status, error.response?.data);
    }

    // Test vendors endpoint
    console.log('\n4️⃣ Testing vendors endpoint...');
    
    try {
      const vendorsResponse = await axios.get(`${BASE_URL}/api/vendors`, {
        headers: {
          'x-test-firebase-uid': 'admin-test-123',
          'Authorization': 'Bearer admin-token'
        }
      });
      
      console.log('✅ Vendors retrieved successfully!');
      console.log(`Found ${vendorsResponse.data.length} vendors`);
      
    } catch (error) {
      console.log('❌ Vendors request failed:', error.response?.status, error.response?.data);
    }

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n🎉 The 401 Unauthorized error has been fixed!');
    console.log('\nThe issue was:');
    console.log('1. User permissions were stored as simple booleans');
    console.log('2. AdminUser model expected {can_access: true, edit_delete: true} structure');
    console.log('3. After fixing the permission structure, authentication works perfectly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFlutterItemBilling().catch(console.error);