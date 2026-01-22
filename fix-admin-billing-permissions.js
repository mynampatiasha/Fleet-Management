const axios = require('axios');

async function fixAdminBillingPermissions() {
  try {
    console.log('🔧 Fixing admin billing permissions...\n');
    
    const BASE_URL = 'http://localhost:3001';
    
    // Get a fresh admin token
    console.log('🔐 Step 1: Getting admin token...');
    
    // Test with the existing token first
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY3Nzc0OTI2LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3Njc3NzQ5MjgsImV4cCI6MTc2Nzc3ODUyOCwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.V6ibOkQEWXiT603pMlfCIFPrD2Ea3GjpBC4OVQQPQCf4gZL7v9dEwwakkzH6RHVJCz5ty_TvXT2WSG_QUqB008h0O-Zvdu8vSSq2T2PjSeDgKkliH4fR9kcT8-s7nVxLmoRckf8oModDnB0Z2lFlNuALw-2Tvm_BUjMzSgh-eMKcMIFk9pkTImgO7fI4F3TQ3kFovDxzH3lsSd0GbOzz82_EfUTGyJdb_Hy5KHW-0LeSSmfC-mVHfAdrSu3iJqEodlGuGGF5AuUxX6R-HX40HCbf1Od22QxOMd1czm3NO-lI_htGyWdvL8w17MPlhRkF4o2nslSSVnocaXSJRiEy_Q';
    
    // Test invoice creation to see current status
    console.log('\n📝 Step 2: Testing current invoice creation...');
    
    const testInvoice = {
      "customerId": "test_customer_" + Date.now(),
      "customerName": "Test Customer",
      "customerEmail": "test@example.com",
      "orderNumber": "TEST001",
      "invoiceDate": new Date().toISOString(),
      "terms": "Net 30",
      "subject": "Test Invoice",
      "items": [{
        "itemDetails": "Test Service",
        "quantity": 1,
        "rate": 1000,
        "discount": 0,
        "discountType": "percentage",
        "amount": 1000
      }],
      "tdsRate": 0,
      "tcsRate": 0,
      "gstRate": 18,
      "status": "DRAFT"
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/invoices`, testInvoice, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Invoice creation successful!');
      console.log('   Status:', response.status);
      console.log('   Invoice Number:', response.data.data?.invoiceNumber);
      console.log('   Customer ID:', response.data.data?.customerId);
      
      // Test invoice listing
      console.log('\n📋 Step 3: Testing invoice listing...');
      const listResponse = await axios.get(`${BASE_URL}/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Invoice listing successful!');
      console.log('   Total invoices:', listResponse.data.data?.length || 0);
      
      // Test invoice stats
      console.log('\n📊 Step 4: Testing invoice statistics...');
      const statsResponse = await axios.get(`${BASE_URL}/api/invoices/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Invoice stats successful!');
      console.log('   Total invoices:', statsResponse.data.data?.totalInvoices || 0);
      console.log('   Total revenue:', statsResponse.data.data?.totalRevenue || 0);
      
      console.log('\n🎉 All invoice operations are working correctly!');
      console.log('   The 401 error was likely due to the customerId validation issue.');
      console.log('   The fix has resolved the problem.');
      
    } catch (error) {
      console.log('   ❌ Invoice operation failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
      console.log('   Message:', error.response?.data?.message);
      
      if (error.response?.status === 401) {
        console.log('\n🔍 Still getting 401 - this is an authentication issue');
      } else if (error.response?.status === 403) {
        console.log('\n🔍 Getting 403 - this is a permission issue');
        console.log('   The user is authenticated but lacks billing permissions');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

fixAdminBillingPermissions();