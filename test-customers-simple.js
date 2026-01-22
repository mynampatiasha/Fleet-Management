const axios = require('axios');

async function testCustomersAPI() {
  try {
    console.log('🧪 Testing Billing Customers API (Simple)...\n');
    
    const BASE_URL = 'http://localhost:3001';
    
    // Use a token from existing test files
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY3Nzc0OTI2LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3Njc3NzQ5MjgsImV4cCI6MTc2Nzc3ODUyOCwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.V6ibOkQEWXiT603pMlfCIFPrD2Ea3GjpBC4OVQQPQCf4gZL7v9dEwwakkzH6RHVJCz5ty_TvXT2WSG_QUqB008h0O-Zvdu8vSSq2T2PjSeDgKkliH4fR9kcT8-s7nVxLmoRckf8oModDnB0Z2lFlNuALw-2Tvm_BUjMzSgh-eMKcMIFk9pkTImgO7fI4F3TQ3kFovDxzH3lsSd0GbOzz82_EfUTGyJdb_Hy5KHW-0LeSSmfC-mVHfAdrSu3iJqEodlGuGGF5AuUxX6R-HX40HCbf1Od22QxOMd1czm3NO-lI_htGyWdvL8w17MPlhRkF4o2nslSSVnocaXSJRiEy_Q';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📋 Step 1: Testing customer routes with auth...');
    
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/invoices/customers`, { headers });
      console.log('   ✅ Customers route works!');
      console.log('   Total customers:', listResponse.data.data.length);
      console.log('   Pagination:', listResponse.data.pagination);
    } catch (error) {
      console.log('   ❌ Customers route failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n📊 Step 2: Testing customer stats route...');
    
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/invoices/customers-stats`, { headers });
      console.log('   ✅ Customer stats route works!');
      console.log('   Stats:', statsResponse.data.data);
    } catch (error) {
      console.log('   ❌ Customer stats route failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n📝 Step 3: Testing customer creation...');
    
    const testCustomer = {
      customerName: 'Test Customer ' + Date.now(),
      customerEmail: `test${Date.now()}@example.com`,
      customerPhone: '+91-9876543210',
      companyName: 'Test Company',
      gstNumber: '29ABCDE1234F1Z5',
      billingAddress: {
        street: '123 Test Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      notes: 'Test customer for API validation'
    };
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/invoices/customers`, testCustomer, { headers });
      console.log('   ✅ Customer creation works!');
      console.log('   Customer ID:', createResponse.data.data._id);
      console.log('   Customer Name:', createResponse.data.data.customerName);
      console.log('   Customer Email:', createResponse.data.data.customerEmail);
      
      // Test getting the created customer
      console.log('\n👤 Step 4: Testing single customer fetch...');
      const customerId = createResponse.data.data._id;
      
      try {
        const singleResponse = await axios.get(`${BASE_URL}/api/invoices/customers/${customerId}`, { headers });
        console.log('   ✅ Single customer fetch works!');
        console.log('   Customer:', singleResponse.data.data.customerName);
      } catch (error) {
        console.log('   ❌ Single customer fetch failed');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
      
    } catch (error) {
      console.log('   ❌ Customer creation failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n🎉 Customer API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCustomersAPI();