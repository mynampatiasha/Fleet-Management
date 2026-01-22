// test-tms-api-direct.js
// Test TMS API endpoints directly to debug 500 errors

const axios = require('axios');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

const BASE_URL = 'http://localhost:3001';

async function testTMSAPIDirect() {
  console.log('\n🧪 ========== TESTING TMS API DIRECTLY ==========');
  
  try {
    // Step 1: Test backend health
    console.log('\n1️⃣ Testing backend health:');
    
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend health:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }
    
    // Step 2: Create a mock Firebase token (for testing)
    console.log('\n2️⃣ Preparing test data:');
    
    const mockUser = {
      uid: 'qnwp8d0clDSSNuSm3ugmXYLSI3K2',
      email: 'admin@abrafleet.com',
      name: 'Admin User',
      role: 'admin'
    };
    
    // Create a simple JWT token for testing (not secure, just for debugging)
    const testToken = Buffer.from(JSON.stringify(mockUser)).toString('base64');
    
    console.log('👤 Mock user:', mockUser);
    console.log('🔑 Test token created');
    
    // Step 3: Test ticket creation
    console.log('\n3️⃣ Testing ticket creation API:');
    
    const ticketData = {
      subject: 'API Test Ticket',
      message: 'Testing ticket creation via API',
      priority: 'medium',
      status: 'open'
    };
    
    console.log('📝 Ticket data:', ticketData);
    
    try {
      const createResponse = await axios.post(
        `${BASE_URL}/api/tickets`,
        ticketData,
        {
          headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('✅ Ticket creation successful!');
      console.log('📊 Response status:', createResponse.status);
      console.log('📄 Response data:', createResponse.data);
      
      const createdTicket = createResponse.data.data;
      
      // Step 4: Test getting the created ticket
      if (createdTicket && createdTicket._id) {
        console.log('\n4️⃣ Testing ticket retrieval:');
        
        try {
          const getResponse = await axios.get(
            `${BASE_URL}/api/tickets/${createdTicket._id}`,
            {
              headers: {
                'Authorization': `Bearer ${testToken}`
              }
            }
          );
          
          console.log('✅ Ticket retrieval successful!');
          console.log('📄 Retrieved ticket:', getResponse.data.data.ticketNumber);
          
        } catch (getError) {
          console.log('❌ Ticket retrieval failed:', getError.response?.status, getError.response?.data || getError.message);
        }
      }
      
      // Step 5: Test status update
      if (createdTicket && createdTicket._id) {
        console.log('\n5️⃣ Testing status update:');
        
        try {
          const updateResponse = await axios.put(
            `${BASE_URL}/api/tickets/${createdTicket._id}/status`,
            {
              status: 'in_progress',
              note: 'Testing status update via API'
            },
            {
              headers: {
                'Authorization': `Bearer ${testToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('✅ Status update successful!');
          console.log('📊 Response:', updateResponse.data);
          
        } catch (updateError) {
          console.log('❌ Status update failed:', updateError.response?.status, updateError.response?.data || updateError.message);
        }
      }
      
      // Step 6: Test "My Tickets" endpoint
      console.log('\n6️⃣ Testing "My Tickets" endpoint:');
      
      try {
        const myTicketsResponse = await axios.get(
          `${BASE_URL}/api/tickets/my`,
          {
            headers: {
              'Authorization': `Bearer ${testToken}`
            }
          }
        );
        
        console.log('✅ My Tickets retrieval successful!');
        console.log('📊 Found tickets:', myTicketsResponse.data.data.length);
        
        if (myTicketsResponse.data.data.length > 0) {
          console.log('📋 First ticket:', myTicketsResponse.data.data[0].ticketNumber);
        }
        
      } catch (myTicketsError) {
        console.log('❌ My Tickets failed:', myTicketsError.response?.status, myTicketsError.response?.data || myTicketsError.message);
      }
      
    } catch (createError) {
      console.log('❌ Ticket creation failed!');
      console.log('📊 Status:', createError.response?.status);
      console.log('📄 Error data:', createError.response?.data);
      console.log('📋 Full error:', createError.message);
      
      // Log more details about the error
      if (createError.response) {
        console.log('🔍 Response headers:', createError.response.headers);
        console.log('🔍 Request config:', {
          url: createError.config?.url,
          method: createError.config?.method,
          headers: createError.config?.headers,
          data: createError.config?.data
        });
      }
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  console.log('\n🧪 ========== API TEST COMPLETE ==========\n');
}

// Run the test
testTMSAPIDirect();