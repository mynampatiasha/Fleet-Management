// test-tms-with-real-auth.js
// Test TMS API with proper authentication using test mode

const axios = require('axios');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

const BASE_URL = 'http://localhost:3001';

async function testTMSWithRealAuth() {
  console.log('\n🧪 ========== TESTING TMS WITH REAL AUTH ==========');
  
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
    
    // Step 2: Use test mode authentication
    console.log('\n2️⃣ Using test mode authentication:');
    
    const testFirebaseUid = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';
    
    const headers = {
      'x-test-firebase-uid': testFirebaseUid,
      'Content-Type': 'application/json'
    };
    
    console.log('🔑 Test Firebase UID:', testFirebaseUid);
    
    // Step 3: Test authentication endpoint first
    console.log('\n3️⃣ Testing authentication:');
    
    try {
      const authResponse = await axios.get(
        `${BASE_URL}/api/test-auth`,
        { headers }
      );
      
      console.log('✅ Authentication successful!');
      console.log('👤 User info:', authResponse.data.user);
      
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.response?.status, authError.response?.data || authError.message);
      return;
    }
    
    // Step 4: Test ticket creation
    console.log('\n4️⃣ Testing ticket creation:');
    
    const ticketData = {
      subject: 'Test Ticket with Real Auth',
      message: 'Testing ticket creation with proper authentication',
      priority: 'high',
      status: 'open'
    };
    
    console.log('📝 Ticket data:', ticketData);
    
    try {
      const createResponse = await axios.post(
        `${BASE_URL}/api/tickets`,
        ticketData,
        {
          headers,
          timeout: 15000
        }
      );
      
      console.log('✅ Ticket creation successful!');
      console.log('📊 Response status:', createResponse.status);
      console.log('🎫 Created ticket:', createResponse.data.data?.ticketNumber);
      console.log('📄 Full response:', createResponse.data);
      
      const createdTicket = createResponse.data.data;
      
      // Step 5: Test "My Tickets" endpoint
      console.log('\n5️⃣ Testing "My Tickets" endpoint:');
      
      try {
        const myTicketsResponse = await axios.get(
          `${BASE_URL}/api/tickets/my`,
          { headers }
        );
        
        console.log('✅ My Tickets retrieval successful!');
        console.log('📊 Found tickets:', myTicketsResponse.data.data.length);
        
        if (myTicketsResponse.data.data.length > 0) {
          console.log('📋 Tickets:');
          myTicketsResponse.data.data.forEach((ticket, index) => {
            console.log(`   ${index + 1}. ${ticket.ticketNumber}: ${ticket.subject}`);
            console.log(`      Status: ${ticket.status}, Priority: ${ticket.priority}`);
          });
        }
        
      } catch (myTicketsError) {
        console.log('❌ My Tickets failed:', myTicketsError.response?.status, myTicketsError.response?.data || myTicketsError.message);
      }
      
      // Step 6: Test status update
      if (createdTicket && createdTicket._id) {
        console.log('\n6️⃣ Testing status update:');
        
        try {
          const updateResponse = await axios.put(
            `${BASE_URL}/api/tickets/${createdTicket._id}/status`,
            {
              status: 'in_progress',
              note: 'Testing status update with real auth'
            },
            { headers }
          );
          
          console.log('✅ Status update successful!');
          console.log('📊 Response:', updateResponse.data);
          
        } catch (updateError) {
          console.log('❌ Status update failed:', updateError.response?.status, updateError.response?.data || updateError.message);
        }
      }
      
      // Step 7: Test ticket retrieval
      if (createdTicket && createdTicket._id) {
        console.log('\n7️⃣ Testing ticket retrieval:');
        
        try {
          const getResponse = await axios.get(
            `${BASE_URL}/api/tickets/${createdTicket._id}`,
            { headers }
          );
          
          console.log('✅ Ticket retrieval successful!');
          console.log('📄 Retrieved ticket:', getResponse.data.data.ticketNumber);
          console.log('📊 Current status:', getResponse.data.data.status);
          
        } catch (getError) {
          console.log('❌ Ticket retrieval failed:', getError.response?.status, getError.response?.data || getError.message);
        }
      }
      
      // Step 8: Test all tickets endpoint (admin)
      console.log('\n8️⃣ Testing all tickets endpoint:');
      
      try {
        const allTicketsResponse = await axios.get(
          `${BASE_URL}/api/tickets/all`,
          { headers }
        );
        
        console.log('✅ All tickets retrieval successful!');
        console.log('📊 Total tickets:', allTicketsResponse.data.data.length);
        
      } catch (allTicketsError) {
        console.log('❌ All tickets failed:', allTicketsError.response?.status, allTicketsError.response?.data || allTicketsError.message);
      }
      
      // Step 9: Test ticket stats
      console.log('\n9️⃣ Testing ticket stats:');
      
      try {
        const statsResponse = await axios.get(
          `${BASE_URL}/api/tickets/stats`,
          { headers }
        );
        
        console.log('✅ Ticket stats successful!');
        console.log('📊 Stats:', statsResponse.data.data);
        
      } catch (statsError) {
        console.log('❌ Ticket stats failed:', statsError.response?.status, statsError.response?.data || statsError.message);
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
testTMSWithRealAuth();