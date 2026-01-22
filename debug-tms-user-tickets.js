// debug-tms-user-tickets.js - Debug why tickets aren't showing for user
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet';
const BASE_URL = 'http://localhost:3001';

// Update with your test user credentials
const TEST_USER = {
  email: 'admin@abrafleet.com',
  password: 'admin123'
};

async function debugTickets() {
  console.log('\n' + '='.repeat(80));
  console.log('TMS USER TICKETS DEBUG');
  console.log('='.repeat(80));
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Step 1: Login and get JWT token
    console.log('\n📝 STEP 1: Login');
    console.log('─'.repeat(80));
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Token:', token.substring(0, 30) + '...');
    
    // Step 2: Check tickets in database
    console.log('\n📊 STEP 2: Check Tickets in Database');
    console.log('─'.repeat(80));
    
    const allTickets = await db.collection('tickets').find({}).toArray();
    console.log(`Total tickets in database: ${allTickets.length}`);
    
    if (allTickets.length === 0) {
      console.log('\n⚠️  NO TICKETS IN DATABASE!');
      console.log('   This is why you\'re not seeing any tickets.');
      console.log('   You need to create some tickets first.');
      return;
    }
    
    // Show all tickets
    console.log('\n📋 All Tickets:');
    allTickets.forEach((ticket, index) => {
      console.log(`\n${index + 1}. ${ticket.ticketNumber}: ${ticket.subject}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Priority: ${ticket.priority}`);
      console.log(`   Assigned To: ${ticket.assignedTo || 'Unassigned'}`);
      console.log(`   Created By:`);
      console.log(`     - userId: ${ticket.createdBy?.userId}`);
      console.log(`     - email: ${ticket.createdBy?.email}`);
      console.log(`     - name: ${ticket.createdBy?.name}`);
    });
    
    // Step 3: Check which tickets match the current user
    console.log('\n🔍 STEP 3: Check Tickets Matching Current User');
    console.log('─'.repeat(80));
    
    const userObjectId = new ObjectId(user.id);
    console.log('User ID as ObjectId:', userObjectId);
    console.log('User ID as String:', user.id);
    
    // Check tickets assigned to user
    const assignedTickets = await db.collection('tickets').find({
      assignedTo: userObjectId
    }).toArray();
    
    console.log(`\n✅ Tickets assigned to user: ${assignedTickets.length}`);
    assignedTickets.forEach(ticket => {
      console.log(`   - ${ticket.ticketNumber}: ${ticket.subject}`);
    });
    
    // Check tickets created by user (string comparison)
    const createdTicketsString = await db.collection('tickets').find({
      'createdBy.userId': user.id
    }).toArray();
    
    console.log(`\n✅ Tickets created by user (string match): ${createdTicketsString.length}`);
    createdTicketsString.forEach(ticket => {
      console.log(`   - ${ticket.ticketNumber}: ${ticket.subject}`);
    });
    
    // Check tickets created by user (ObjectId comparison)
    const createdTicketsObjectId = await db.collection('tickets').find({
      'createdBy.userId': userObjectId
    }).toArray();
    
    console.log(`\n✅ Tickets created by user (ObjectId match): ${createdTicketsObjectId.length}`);
    createdTicketsObjectId.forEach(ticket => {
      console.log(`   - ${ticket.ticketNumber}: ${ticket.subject}`);
    });
    
    // Combined query (what the API uses)
    const combinedQuery = {
      $or: [
        { assignedTo: userObjectId },
        { 'createdBy.userId': user.id },
        { 'createdBy.userId': userObjectId }
      ]
    };
    
    const matchingTickets = await db.collection('tickets').find(combinedQuery).toArray();
    
    console.log(`\n✅ Total tickets matching user (combined query): ${matchingTickets.length}`);
    matchingTickets.forEach(ticket => {
      console.log(`   - ${ticket.ticketNumber}: ${ticket.subject}`);
    });
    
    // Step 4: Test the API endpoint
    console.log('\n🌐 STEP 4: Test API Endpoint');
    console.log('─'.repeat(80));
    
    try {
      const apiResponse = await axios.get(`${BASE_URL}/api/tickets/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ API Response:');
      console.log('   Success:', apiResponse.data.success);
      console.log('   Tickets returned:', apiResponse.data.data?.length || 0);
      
      if (apiResponse.data.data && apiResponse.data.data.length > 0) {
        console.log('\n   Tickets from API:');
        apiResponse.data.data.forEach((ticket, index) => {
          console.log(`   ${index + 1}. ${ticket.ticketNumber}: ${ticket.subject}`);
        });
      }
    } catch (error) {
      console.log('❌ API Error:', error.response?.data || error.message);
    }
    
    // Step 5: Diagnosis
    console.log('\n🔬 STEP 5: Diagnosis');
    console.log('─'.repeat(80));
    
    if (allTickets.length === 0) {
      console.log('❌ PROBLEM: No tickets in database');
      console.log('   SOLUTION: Create some tickets first');
    } else if (matchingTickets.length === 0) {
      console.log('❌ PROBLEM: No tickets match the current user');
      console.log('   REASONS:');
      console.log('   1. Tickets were created by a different user');
      console.log('   2. Tickets are not assigned to this user');
      console.log('   3. User ID format mismatch in database');
      console.log('\n   SOLUTIONS:');
      console.log('   1. Create a ticket with this user');
      console.log('   2. Assign existing tickets to this user');
      console.log('   3. Check createdBy.userId format in existing tickets');
    } else {
      console.log('✅ Tickets found in database that match user');
      console.log('   If API still returns empty, check:');
      console.log('   1. Backend is using the fixed TMS routes');
      console.log('   2. JWT token is valid and contains correct user ID');
      console.log('   3. Backend logs for any errors');
    }
    
    // Step 6: Show fix commands
    console.log('\n🔧 STEP 6: Quick Fixes');
    console.log('─'.repeat(80));
    
    console.log('\n1. Apply the TMS fix:');
    console.log('   fix-tms-system.bat');
    
    console.log('\n2. Create a test ticket:');
    console.log('   node test-tms-system-fixed.js');
    
    console.log('\n3. Check backend logs:');
    console.log('   Look for "GET MY TICKETS" in backend console');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await client.close();
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('DEBUG COMPLETE');
  console.log('='.repeat(80) + '\n');
}

// Run the debug
debugTickets().catch(console.error);
