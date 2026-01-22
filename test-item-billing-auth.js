// Test script to verify item billing authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testItemBillingAuth() {
  console.log('🧪 Testing Item Billing Authentication');
  console.log('=' .repeat(50));

  try {
    // Test 1: Try to access items without authentication (should fail with 401)
    console.log('\n1. Testing without authentication (should fail)...');
    try {
      const response = await axios.get(`${BASE_URL}/api/items`);
      console.log('❌ UNEXPECTED: Request succeeded without auth');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ EXPECTED: 401 Unauthorized without auth token');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.status, error.message);
      }
    }

    // Test 2: Try with test mode header (should work in development)
    console.log('\n2. Testing with test mode header...');
    try {
      const response = await axios.get(`${BASE_URL}/api/items`, {
        headers: {
          'x-test-firebase-uid': 'test-user-123'
        }
      });
      console.log('✅ SUCCESS: Request worked with test header');
      console.log('Items found:', response.data.items?.length || 0);
    } catch (error) {
      console.log('❌ FAILED with test header:', error.response?.status, error.response?.data);
    }

    // Test 3: Check health endpoint (should work without auth)
    console.log('\n3. Testing health endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Health check passed:', response.data.message);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test 4: Test item creation with test header
    console.log('\n4. Testing item creation with test header...');
    try {
      const itemData = {
        name: 'Test Item',
        type: 'Goods',
        isSellable: true,
        isPurchasable: true,
        sellingPrice: 100,
        costPrice: 80,
        salesAccount: 'Sales',
        purchaseAccount: 'Cost of Goods Sold'
      };

      const response = await axios.post(`${BASE_URL}/api/items`, itemData, {
        headers: {
          'x-test-firebase-uid': 'test-user-123',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ SUCCESS: Item created successfully');
      console.log('Response:', response.data.message);
    } catch (error) {
      console.log('❌ FAILED to create item:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testItemBillingAuth().catch(console.error);