// test-ticket-creation-fix.js
// Test ticket creation with proper ObjectId handling

const axios = require('axios');

const BASE_URL = 'http://localhost:3001'; // Main backend
const TMS_URL = 'http://localhost:3001';  // TMS backend

async function testTicketCreation() {
  console.log('\n🎫 ========== TESTING TICKET CREATION FIX ==========');
  
  try {
    // First, get a valid admin token from main backend
    console.log('🔐 Getting admin token from main backend...');
    
    // Try to get a Firebase token first (this is what the Flutter app would do)
    // For testing, we'll simulate the login process
    const loginData = {
      firebaseUid: 'test-admin-uid-123',
      email: 'admin@abrafleet.com',
      name: 'Test Admin',
      role: 'super_admin'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData, {
      headers: {
        'Authorization': 'Bearer test-token', // This would be a real Firebase token
        'Content-Type': 'application/json'
      }
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Failed to login: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('   User ID:', user.uid || user._id);
    console.log('   User Role:', user.role);
    console.log('   User Email:', user.email);
    
    // Test ticket creation on TMS backend
    console.log('\n🎫 Creating test ticket on TMS backend...');
    const ticketData = {
      subject: 'Test Ticket - ObjectId Fix',
      message: 'This is a test ticket to verify the ObjectId fix is working properly.',
      priority: 'medium',
      status: 'open'
      // Note: Not assigning to anyone to test the null case
    };
    
    const createResponse = await axios.post(`${TMS_URL}/api/tickets`, ticketData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📥 CREATE RESPONSE:');
    console.log('   Success:', createResponse.data.success);
    console.log('   Message:', createResponse.data.message);
    
    if (createResponse.data.success) {
      const ticket = createResponse.data.data;
      console.log('✅ TICKET CREATED SUCCESSFULLY!');
      console.log('   Ticket Number:', ticket.ticketNumber);
      console.log('   Ticket ID:', ticket._id);
      console.log('   Subject:', ticket.subject);
      console.log('   Priority:', ticket.priority);
      console.log('   Status:', ticket.status);
      console.log('   Created By:', ticket.createdBy);
      console.log('   Assigned To:', ticket.assignedTo || 'Unassigned');
      
      // Test getting the ticket back
      console.log('\n📄 Testing ticket retrieval...');
      const getResponse = await axios.get(`${TMS_URL}/api/tickets/${ticket._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (getResponse.data.success) {
        console.log('✅ TICKET RETRIEVAL SUCCESSFUL!');
        console.log('   Retrieved Ticket:', getResponse.data.data.ticketNumber);
      } else {
        console.log('❌ Failed to retrieve ticket:', getResponse.data.message);
      }
      
    } else {
      console.log('❌ TICKET CREATION FAILED!');
      console.log('   Error:', createResponse.data.error);
      console.log('   Message:', createResponse.data.message);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.error || 'Unknown error');
      console.error('   Message:', error.response.data?.message || error.message);
    } else {
      console.error('   Error:', error.message);
    }
  }
  
  console.log('\n🎫 ========== TEST COMPLETE ==========\n');
}

// Run the test
testTicketCreation();