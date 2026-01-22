const axios = require('axios');

async function testInvoiceAuth() {
  try {
    console.log('🧪 Testing Invoice API Authentication...\n');
    
    const BASE_URL = 'http://localhost:3001';
    
    // The token from the error log
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY3Nzc0OTI2LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3Njc3NzQ5MjgsImV4cCI6MTc2Nzc3ODUyOCwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.V6ibOkQEWXiT603pMlfCIFPrD2Ea3GjpBC4OVQQPQCf4gZL7v9dEwwakkzH6RHVJCz5ty_TvXT2WSG_QUqB008h0O-Zvdu8vSSq2T2PjSeDgKkliH4fR9kcT8-s7nVxLmoRckf8oModDnB0Z2lFlNuALw-2Tvm_BUjMzSgh-eMKcMIFk9pkTImgO7fI4F3TQ3kFovDxzH3lsSd0GbOzz82_EfUTGyJdb_Hy5KHW-0LeSSmfC-mVHfAdrSu3iJqEodlGuGGF5AuUxX6R-HX40HCbf1Od22QxOMd1czm3NO-lI_htGyWdvL8w17MPlhRkF4o2nslSSVnocaXSJRiEy_Q';
    
    // Test invoice data from the error
    const testInvoice = {
      "customerId": "new_customer_1767775133099",
      "customerName": "Asha",
      "customerEmail": "ashamynampati2003@gmail.com",
      "orderNumber": "INV0001",
      "invoiceDate": "2026-01-07T00:00:00.000",
      "terms": "Due on Receipt",
      "dueDate": "2026-01-07T00:00:00.000",
      "salesperson": null,
      "subject": "pay the due amount",
      "items": [{
        "itemDetails": "Testing",
        "quantity": 10,
        "rate": 20000,
        "discount": 10,
        "discountType": "percentage",
        "amount": 180000
      }],
      "customerNotes": "",
      "termsAndConditions": "",
      "tdsRate": 1,
      "tcsRate": 1,
      "gstRate": 1,
      "status": "SENT"
    };
    
    console.log('📋 Test Data:');
    console.log('   Customer:', testInvoice.customerName);
    console.log('   Email:', testInvoice.customerEmail);
    console.log('   Amount:', testInvoice.items[0].amount);
    
    console.log('\n🔐 Token Info:');
    console.log('   Length:', token.length);
    console.log('   Starts with:', token.substring(0, 50) + '...');
    
    // Test 1: Check backend health
    console.log('\n🏥 Step 1: Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('   ✅ Backend is running');
      console.log('   Status:', healthResponse.status);
    } catch (error) {
      console.log('   ❌ Backend health check failed:', error.message);
      return;
    }
    
    // Test 2: Test invoice creation with auth
    console.log('\n📝 Step 2: Testing invoice creation with auth...');
    try {
      const response = await axios.post(`${BASE_URL}/api/invoices`, testInvoice, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Invoice created successfully');
      console.log('   Status:', response.status);
      console.log('   Invoice Number:', response.data.data?.invoiceNumber);
      
    } catch (error) {
      console.log('   ❌ Invoice creation failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
      console.log('   Message:', error.response?.data?.message);
      
      // If it's a permission error, let's check what the backend logs show
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('\n🔍 This appears to be a permission issue.');
        console.log('   The user has a valid Firebase token but lacks database permissions.');
        console.log('   Check the backend logs for permission check details.');
      }
    }
    
    // Test 3: Test without auth to see the difference
    console.log('\n🚫 Step 3: Testing without auth (should fail)...');
    try {
      const response = await axios.post(`${BASE_URL}/api/invoices`, testInvoice);
      console.log('   ⚠️  Unexpected success without auth');
    } catch (error) {
      console.log('   ✅ Correctly rejected without auth');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInvoiceAuth();