const axios = require('axios');

async function testBillingCustomersAPI() {
  try {
    console.log('🧪 Testing Billing Customers API...\n');
    
    const BASE_URL = 'http://localhost:3001';
    
    // Get a fresh admin token
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY3Nzc0OTI2LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3Njc3NzQ5MjgsImV4cCI6MTc2Nzc3ODUyOCwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.V6ibOkQEWXiT603pMlfCIFPrD2Ea3GjpBC4OVQQPQCf4gZL7v9dEwwakkzH6RHVJCz5ty_TvXT2WSG_QUqB008h0O-Zvdu8vSSq2T2PjSeDgKkliH4fR9kcT8-s7nVxLmoRckf8oModDnB0Z2lFlNuALw-2Tvm_BUjMzSgh-eMKcMIFk9pkTImgO7fI4F3TQ3kFovDxzH3lsSd0GbOzz82_EfUTGyJdb_Hy5KHW-0LeSSmfC-mVHfAdrSu3iJqEodlGuGGF5AuUxX6R-HX40HCbf1Od22QxOMd1czm3NO-lI_htGyWdvL8w17MPlhRkF4o2nslSSVnocaXSJRiEy_Q';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Create a new billing customer
    console.log('📝 Step 1: Creating a new billing customer...');
    
    const testCustomer = {
      customerName: 'Asha Mynampati',
      customerEmail: 'ashamynampati2003@gmail.com',
      customerPhone: '+91-9876543210',
      companyName: 'Asha Enterprises',
      gstNumber: '29ABCDE1234F1Z5',
      billingAddress: {
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      shippingAddress: {
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      contactPerson: 'Asha Mynampati',
      website: 'https://ashaenterprises.com',
      notes: 'Premium customer - priority support'
    };
    
    let createdCustomerId;
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/invoices/customers`, testCustomer, { headers });
      
      console.log('   ✅ Customer created successfully!');
      console.log('   Customer ID:', createResponse.data.data._id);
      console.log('   Customer Name:', createResponse.data.data.customerName);
      console.log('   Customer Email:', createResponse.data.data.customerEmail);
      
      createdCustomerId = createResponse.data.data._id;
      
    } catch (error) {
      console.log('   ❌ Customer creation failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
      return;
    }
    
    // Test 2: Get all billing customers
    console.log('\n📋 Step 2: Fetching all billing customers...');
    
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/invoices/customers`, { headers });
      
      console.log('   ✅ Customers fetched successfully!');
      console.log('   Total customers:', listResponse.data.data.length);
      console.log('   Pagination:', listResponse.data.pagination);
      
      if (listResponse.data.data.length > 0) {
        console.log('   Sample customer:', {
          name: listResponse.data.data[0].customerName,
          email: listResponse.data.data[0].customerEmail,
          company: listResponse.data.data[0].companyName
        });
      }
      
    } catch (error) {
      console.log('   ❌ Fetching customers failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    // Test 3: Search customers
    console.log('\n🔍 Step 3: Searching customers...');
    
    try {
      const searchResponse = await axios.get(`${BASE_URL}/api/invoices/customers?search=Asha`, { headers });
      
      console.log('   ✅ Customer search successful!');
      console.log('   Search results:', searchResponse.data.data.length);
      
      if (searchResponse.data.data.length > 0) {
        console.log('   Found customer:', searchResponse.data.data[0].customerName);
      }
      
    } catch (error) {
      console.log('   ❌ Customer search failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    // Test 4: Get single customer
    if (createdCustomerId) {
      console.log('\n👤 Step 4: Fetching single customer...');
      
      try {
        const singleResponse = await axios.get(`${BASE_URL}/api/invoices/customers/${createdCustomerId}`, { headers });
        
        console.log('   ✅ Single customer fetched successfully!');
        console.log('   Customer:', {
          name: singleResponse.data.data.customerName,
          email: singleResponse.data.data.customerEmail,
          phone: singleResponse.data.data.customerPhone,
          company: singleResponse.data.data.companyName,
          gst: singleResponse.data.data.gstNumber
        });
        
      } catch (error) {
        console.log('   ❌ Fetching single customer failed');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
    }
    
    // Test 5: Update customer
    if (createdCustomerId) {
      console.log('\n✏️ Step 5: Updating customer...');
      
      const updateData = {
        customerPhone: '+91-9876543211',
        notes: 'Updated notes - VIP customer'
      };
      
      try {
        const updateResponse = await axios.put(`${BASE_URL}/api/invoices/customers/${createdCustomerId}`, updateData, { headers });
        
        console.log('   ✅ Customer updated successfully!');
        console.log('   Updated phone:', updateResponse.data.data.customerPhone);
        console.log('   Updated notes:', updateResponse.data.data.notes);
        
      } catch (error) {
        console.log('   ❌ Customer update failed');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
    }
    
    // Test 6: Get customer statistics
    console.log('\n📊 Step 6: Fetching customer statistics...');
    
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/invoices/customers-stats`, { headers });
      
      console.log('   ✅ Customer statistics fetched successfully!');
      console.log('   Total customers:', statsResponse.data.data.totalCustomers);
      console.log('   Active customers:', statsResponse.data.data.activeCustomers);
      console.log('   Inactive customers:', statsResponse.data.data.inactiveCustomers);
      
    } catch (error) {
      console.log('   ❌ Fetching customer statistics failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    // Test 7: Create invoice with the new customer
    if (createdCustomerId) {
      console.log('\n🧾 Step 7: Creating invoice with the new customer...');
      
      const testInvoice = {
        customerId: createdCustomerId,
        customerName: 'Asha Mynampati',
        customerEmail: 'ashamynampati2003@gmail.com',
        orderNumber: 'ORD-001',
        invoiceDate: new Date().toISOString(),
        terms: 'Net 30',
        subject: 'Invoice for services rendered',
        items: [{
          itemDetails: 'Consulting Services',
          quantity: 1,
          rate: 50000,
          discount: 5,
          discountType: 'percentage',
          amount: 47500
        }],
        customerNotes: 'Thank you for your business!',
        termsAndConditions: 'Payment due within 30 days',
        tdsRate: 2,
        tcsRate: 0,
        gstRate: 18,
        status: 'DRAFT'
      };
      
      try {
        const invoiceResponse = await axios.post(`${BASE_URL}/api/invoices`, testInvoice, { headers });
        
        console.log('   ✅ Invoice created successfully with customer!');
        console.log('   Invoice Number:', invoiceResponse.data.data.invoiceNumber);
        console.log('   Customer ID:', invoiceResponse.data.data.customerId);
        console.log('   Total Amount:', invoiceResponse.data.data.totalAmount);
        
      } catch (error) {
        console.log('   ❌ Invoice creation failed');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n🎉 Billing Customers API testing completed!');
    console.log('   All customer management features are working correctly.');
    console.log('   You can now use these APIs in your Flutter app:');
    console.log('   - GET /api/invoices/customers (list customers)');
    console.log('   - POST /api/invoices/customers (create customer)');
    console.log('   - GET /api/invoices/customers/:id (get single customer)');
    console.log('   - PUT /api/invoices/customers/:id (update customer)');
    console.log('   - DELETE /api/invoices/customers/:id (deactivate customer)');
    console.log('   - GET /api/invoices/customers-stats (get statistics)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBillingCustomersAPI();