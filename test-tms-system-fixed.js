// test-tms-system-fixed.js - Test TMS System After Fix
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test user credentials (update with your actual test user)
const TEST_USER = {
  email: 'admin@abrafleet.com',
  password: 'admin123'
};

let authToken = null;
let userId = null;

async function login() {
  console.log('\n🔐 ========== LOGIN TEST ==========');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
      console.log('✅ Login successful');
      console.log('   User ID:', userId);
      console.log('   User Email:', response.data.data.user.email);
      console.log('   User Role:', response.data.data.user.role);
      console.log('   Token:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ Login failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return false;
  }
}

async function testMyTickets() {
  console.log('\n📋 ========== TEST MY TICKETS ==========');
  try {
    const response = await axios.get(`${BASE_URL}/api/tickets/my`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ My Tickets API Response:');
    console.log('   Success:', response.data.success);
    console.log('   Total Tickets:', response.data.data?.length || 0);
    console.log('   Pagination:', response.data.pagination);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n   📝 Tickets:');
      response.data.data.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.ticketNumber}: ${ticket.subject}`);
        console.log(`      Status: ${ticket.status}, Priority: ${ticket.priority}`);
        console.log(`      Created By: ${ticket.createdBy?.email || 'N/A'}`);
      });
    } else {
      console.log('   ℹ️  No tickets found for this user');
    }
    
    return true;
  } catch (error) {
    console.log('❌ My Tickets error:', error.response?.data || error.message);
    console.log('   Status Code:', error.response?.status);
    return false;
  }
}

async function testTicketStats() {
  console.log('\n📊 ========== TEST TICKET STATS ==========');
  try {
    const response = await axios.get(`${BASE_URL}/api/tickets/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Ticket Stats API Response:');
    console.log('   Success:', response.data.success);
    console.log('   Stats:', response.data.data);
    
    return true;
  } catch (error) {
    console.log('❌ Ticket Stats error:', error.response?.data || error.message);
    console.log('   Status Code:', error.response?.status);
    return false;
  }
}

async function testCreateTicket() {
  console.log('\n🎫 ========== TEST CREATE TICKET ==========');
  try {
    const ticketData = {
      subject: 'Test Ticket - ' + new Date().toISOString(),
      message: 'This is a test ticket created to verify the TMS system is working correctly.',
      priority: 'medium',
      status: 'open'
    };
    
    const response = await axios.post(`${BASE_URL}/api/tickets`, ticketData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Create Ticket API Response:');
    console.log('   Success:', response.data.success);
    console.log('   Ticket Number:', response.data.data?.ticketNumber);
    console.log('   Ticket ID:', response.data.data?._id);
    
    return response.data.data?._id;
  } catch (error) {
    console.log('❌ Create Ticket error:', error.response?.data || error.message);
    console.log('   Status Code:', error.response?.status);
    return null;
  }
}

async function testAllTickets() {
  console.log('\n📋 ========== TEST ALL TICKETS (ADMIN) ==========');
  try {
    const response = await axios.get(`${BASE_URL}/api/tickets/all`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ All Tickets API Response:');
    console.log('   Success:', response.data.success);
    console.log('   Total Tickets:', response.data.data?.length || 0);
    console.log('   Pagination:', response.data.pagination);
    
    return true;
  } catch (error) {
    console.log('❌ All Tickets error:', error.response?.data || error.message);
    console.log('   Status Code:', error.response?.status);
    if (error.response?.status === 403) {
      console.log('   ℹ️  This is expected if user is not an admin');
    }
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('TMS SYSTEM TEST - POST FIREBASE REMOVAL');
  console.log('='.repeat(80));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without successful login');
    return;
  }
  
  // Step 2: Test My Tickets
  await testMyTickets();
  
  // Step 3: Test Ticket Stats
  await testTicketStats();
  
  // Step 4: Test Create Ticket
  const newTicketId = await testCreateTicket();
  
  // Step 5: Test All Tickets (admin only)
  await testAllTickets();
  
  // Step 6: Test My Tickets again (should show the new ticket)
  if (newTicketId) {
    console.log('\n🔄 Testing My Tickets again (should include new ticket)...');
    await testMyTickets();
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
  console.log('\nIf all tests passed, the TMS system is working correctly!');
  console.log('You can now test in the Flutter app.');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test suite error:', error.message);
  process.exit(1);
});
