// test-tms-my-tickets-final.js
// Final test to verify TMS "My Tickets" functionality

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function testTMSMyTicketsFinal() {
  console.log('\n🧪 ========== TESTING TMS MY TICKETS (FINAL) ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const adminEmail = 'admin@abrafleet.com';
    const firebaseUid = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';
    
    // Step 1: Verify user exists in both collections
    console.log('\n1️⃣ Verifying user data:');
    
    const adminUser = await db.collection('admin_users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    const regularUser = await db.collection('users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    
    console.log('   admin_users:', adminUser ? `✅ ${adminUser._id}` : '❌ Not found');
    console.log('   users:', regularUser ? `✅ ${regularUser._id}` : '❌ Not found');
    
    // Step 2: Test the getUserMongoId function (simulating TMS backend)
    console.log('\n2️⃣ Testing getUserMongoId function:');
    
    async function getUserMongoId(db, firebaseUid) {
      try {
        // First try to use as ObjectId directly (for backward compatibility)
        if (ObjectId.isValid(firebaseUid)) {
          // Check users collection first
          let user = await db.collection('users').findOne({ _id: new ObjectId(firebaseUid) });
          if (user) return { id: user._id, collection: 'users' };
          
          // Check admin_users collection
          user = await db.collection('admin_users').findOne({ _id: new ObjectId(firebaseUid) });
          if (user) return { id: user._id, collection: 'admin_users' };
        }
        
        // Try to find by Firebase UID in users collection
        let user = await db.collection('users').findOne({ firebaseUid });
        if (user) return { id: user._id, collection: 'users' };
        
        // Try to find by Firebase UID in admin_users collection
        user = await db.collection('admin_users').findOne({ firebaseUid });
        if (user) return { id: user._id, collection: 'admin_users' };
        
        throw new Error('User not found in database');
      } catch (error) {
        console.error('❌ Error getting user MongoDB ID:', error.message);
        throw error;
      }
    }
    
    const userResult = await getUserMongoId(db, firebaseUid);
    console.log(`   ✅ Found user: ${userResult.id} in ${userResult.collection} collection`);
    
    // Step 3: Check tickets assigned to this user
    console.log('\n3️⃣ Checking tickets assigned to user:');
    
    const assignedTickets = await db.collection('tickets').find({
      assignedTo: userResult.id
    }).toArray();
    
    console.log(`   📋 Tickets assigned to user: ${assignedTickets.length}`);
    
    if (assignedTickets.length > 0) {
      console.log('   📝 Ticket details:');
      assignedTickets.forEach((ticket, index) => {
        console.log(`     ${index + 1}. ${ticket.ticketNumber}`);
        console.log(`        Subject: ${ticket.subject}`);
        console.log(`        Status: ${ticket.status}`);
        console.log(`        Priority: ${ticket.priority}`);
        console.log(`        Created: ${ticket.createdAt.toISOString()}`);
      });
    } else {
      console.log('   ⚠️ No tickets found assigned to this user');
      
      // Check if there are tickets created by this user
      const createdTickets = await db.collection('tickets').find({
        'createdBy.email': adminEmail
      }).toArray();
      
      console.log(`   📋 Tickets created by user: ${createdTickets.length}`);
      if (createdTickets.length > 0) {
        console.log('   💡 These tickets exist but are not assigned to the user');
        createdTickets.forEach((ticket, index) => {
          console.log(`     ${index + 1}. ${ticket.ticketNumber} - Assigned to: ${ticket.assignedTo || 'Unassigned'}`);
        });
      }
    }
    
    // Step 4: Simulate the "My Tickets" API call
    console.log('\n4️⃣ Simulating "My Tickets" API call:');
    
    // This simulates what the TMS backend does in the /my route
    const query = { assignedTo: userResult.id };
    
    // Apply default filter (exclude closed tickets)
    query.status = { $ne: 'closed' };
    
    console.log('   🔍 Query:', JSON.stringify(query, null, 2));
    
    const myTickets = await db.collection('tickets')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`   📋 "My Tickets" result: ${myTickets.length} tickets`);
    
    if (myTickets.length > 0) {
      console.log('   ✅ SUCCESS! Tickets found:');
      myTickets.forEach((ticket, index) => {
        console.log(`     ${index + 1}. ${ticket.ticketNumber}: ${ticket.subject}`);
        console.log(`        Status: ${ticket.status}`);
        console.log(`        Priority: ${ticket.priority}`);
      });
    } else {
      console.log('   ❌ No tickets found in "My Tickets" query');
    }
    
    // Step 5: Test creating a new ticket
    console.log('\n5️⃣ Testing new ticket creation:');
    
    // Simulate ticket creation with dual collection support
    const mockCreatedBy = {
      uid: firebaseUid,
      email: adminEmail,
      name: 'Admin User'
    };
    
    // This simulates the new dual collection logic
    let createdByObjectId = null;
    try {
      createdByObjectId = new ObjectId(mockCreatedBy.uid);
    } catch (error) {
      // Try to find user by Firebase UID in both collections
      let createdByUser = await db.collection('users').findOne({ firebaseUid: mockCreatedBy.uid });
      if (!createdByUser) {
        createdByUser = await db.collection('admin_users').findOne({ firebaseUid: mockCreatedBy.uid });
      }
      
      if (createdByUser) {
        createdByObjectId = createdByUser._id;
        console.log(`   ✅ Found createdBy user: ${createdByObjectId} in database`);
      } else {
        console.log('   ⚠️ CreatedBy user not found, using Firebase UID as string');
        createdByObjectId = mockCreatedBy.uid;
      }
    }
    
    // For self-assignment, use the same user
    const assignedToObjectId = createdByObjectId;
    
    console.log(`   📝 New ticket would be:`);
    console.log(`     createdBy.id: ${createdByObjectId}`);
    console.log(`     assignedTo: ${assignedToObjectId}`);
    console.log(`     This should appear in "My Tickets" for ${adminEmail}`);
    
    // Step 6: Final verification
    console.log('\n6️⃣ Final verification:');
    
    const totalTickets = await db.collection('tickets').countDocuments();
    const userAssignedTickets = await db.collection('tickets').countDocuments({
      assignedTo: userResult.id
    });
    const userCreatedTickets = await db.collection('tickets').countDocuments({
      'createdBy.email': adminEmail
    });
    
    console.log(`   📊 Statistics:`);
    console.log(`     Total tickets in system: ${totalTickets}`);
    console.log(`     Tickets assigned to ${adminEmail}: ${userAssignedTickets}`);
    console.log(`     Tickets created by ${adminEmail}: ${userCreatedTickets}`);
    
    if (userAssignedTickets > 0) {
      console.log('\n🎉 SUCCESS! The TMS "My Tickets" functionality should now work!');
      console.log('✅ User can see their assigned tickets');
      console.log('📱 Try refreshing the "My Tickets" page in the app');
    } else {
      console.log('\n⚠️ No tickets assigned to user. This might be expected if tickets are unassigned.');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🧪 ========== TEST COMPLETE ==========\n');
}

// Run the test
testTMSMyTicketsFinal();