const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testItemsAPI() {
  console.log('🧪 Testing Items API with Search and Date Filters\n');

  try {
    // Test 1: Get all items
    console.log('1️⃣ Testing: Get all items');
    const allItemsResponse = await axios.get(`${BASE_URL}/items`);
    console.log(`✅ Status: ${allItemsResponse.status}`);
    console.log(`📊 Total items: ${allItemsResponse.data.items?.length || 0}`);
    console.log(`🔍 Response structure:`, Object.keys(allItemsResponse.data));
    console.log('');

    // Test 2: Search items by name
    console.log('2️⃣ Testing: Search items by name');
    const searchResponse = await axios.get(`${BASE_URL}/items`, {
      params: { search: 'service' }
    });
    console.log(`✅ Status: ${searchResponse.status}`);
    console.log(`📊 Search results: ${searchResponse.data.items?.length || 0}`);
    if (searchResponse.data.items?.length > 0) {
      console.log(`📝 First result: ${searchResponse.data.items[0].name}`);
    }
    console.log('');

    // Test 3: Filter by type
    console.log('3️⃣ Testing: Filter by type (Service)');
    const typeResponse = await axios.get(`${BASE_URL}/items`, {
      params: { type: 'Service' }
    });
    console.log(`✅ Status: ${typeResponse.status}`);
    console.log(`📊 Service items: ${typeResponse.data.items?.length || 0}`);
    console.log('');

    // Test 4: Date range filter (last 30 days)
    console.log('4️⃣ Testing: Date range filter (last 30 days)');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    
    const dateResponse = await axios.get(`${BASE_URL}/items`, {
      params: { 
        startDate: thirtyDaysAgo.toISOString(),
        endDate: today.toISOString()
      }
    });
    console.log(`✅ Status: ${dateResponse.status}`);
    console.log(`📊 Items from last 30 days: ${dateResponse.data.items?.length || 0}`);
    console.log('');

    // Test 5: Combined filters
    console.log('5️⃣ Testing: Combined filters (search + type + date)');
    const combinedResponse = await axios.get(`${BASE_URL}/items`, {
      params: { 
        search: 'vehicle',
        type: 'Service',
        startDate: thirtyDaysAgo.toISOString(),
        endDate: today.toISOString()
      }
    });
    console.log(`✅ Status: ${combinedResponse.status}`);
    console.log(`📊 Combined filter results: ${combinedResponse.data.items?.length || 0}`);
    console.log('');

    // Test 6: Search endpoint
    console.log('6️⃣ Testing: Search endpoint');
    const searchEndpointResponse = await axios.get(`${BASE_URL}/items/search`, {
      params: { q: 'service' }
    });
    console.log(`✅ Status: ${searchEndpointResponse.status}`);
    console.log(`📊 Search endpoint results: ${searchEndpointResponse.data.items?.length || 0}`);
    console.log('');

    // Test 7: Pagination
    console.log('7️⃣ Testing: Pagination');
    const paginationResponse = await axios.get(`${BASE_URL}/items`, {
      params: { 
        page: 1,
        limit: 5
      }
    });
    console.log(`✅ Status: ${paginationResponse.status}`);
    console.log(`📊 Items per page: ${paginationResponse.data.items?.length || 0}`);
    console.log(`📄 Pagination info:`, paginationResponse.data.pagination);
    console.log('');

    // Test 8: Create a test item for filtering
    console.log('8️⃣ Testing: Create test item');
    const testItem = {
      name: 'Test Vehicle Service',
      type: 'Service',
      unit: 'hour',
      isSellable: true,
      isPurchasable: true,
      sellingPrice: 150.00,
      costPrice: 100.00,
      salesAccount: 'Service Revenue',
      purchaseAccount: 'Direct Expenses',
      salesDescription: 'Vehicle maintenance service',
      purchaseDescription: 'Cost for vehicle service'
    };

    const createResponse = await axios.post(`${BASE_URL}/items`, testItem);
    console.log(`✅ Status: ${createResponse.status}`);
    console.log(`📝 Created item: ${createResponse.data.item?.name}`);
    console.log(`🆔 Item ID: ${createResponse.data.item?._id}`);
    console.log('');

    // Test 9: Search for the newly created item
    console.log('9️⃣ Testing: Search for newly created item');
    const newSearchResponse = await axios.get(`${BASE_URL}/items`, {
      params: { search: 'Test Vehicle' }
    });
    console.log(`✅ Status: ${newSearchResponse.status}`);
    console.log(`📊 Found items: ${newSearchResponse.data.items?.length || 0}`);
    if (newSearchResponse.data.items?.length > 0) {
      console.log(`📝 Found: ${newSearchResponse.data.items[0].name}`);
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

// Run the tests
testItemsAPI();