// Direct test of My Tickets functionality
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function testMyTicketsDirect() {
  console.log('🎫 TESTING MY TICKETS LOGIC DIRECTLY');
  console.log('='.repeat(50));

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();

    console.log('✅ Connected to MongoDB');

    // Simulate the getUserMongoId function from TMS routes
    async function getUserMongoId(firebaseUid) {
      console.log(`\n🔍 Looking up user with Firebase UID: ${firebaseUid}`);
      
      // First try to use as ObjectId directly (for backward compatibility)
      if (ObjectId.isValid(firebaseUid)) {
        console.log('   Trying as ObjectId...');
        // Check users collection first
        let user = await db.collection('users').findOne({ _id: new ObjectId(firebaseUid) });
        if (user) {
          console.log(`   ✅ Found in users collection by ObjectId: ${user._id}`);
          return user._id;
        }
        
        // Check admin_users collection
        user = await db.collection('admin_users').findOne({ _id: new ObjectId(firebaseUid) });
        if (user) {
          console.log(`   ✅ Found in admin_users collection by ObjectId: ${user._id}`);
          return user._id;
        }
      }
      
      // Try to find by Firebase UID in users collection
      console.log('   Trying by Firebase UID in users collection...');
      let user = await db.collection('users').findOne({ firebaseUid });
      if (user) {
        console.log(`   ✅ Found in users collection by Firebase UID: ${user._id}`);
        return user._id;
      }
      
      // Try to find by Firebase UID in admin_users collection
      console.log('   Trying by Firebase UID in admin_users collection...');
      user = await db.collection('admin_users').findOne({ firebaseUid });
      if (user) {
        console.log(`   ✅ Found in admin_users collection by Firebase UID: ${user._id}`);
        return user._id;
      }
      
      throw new Error('User not found in database');
    }

    // Test with admin@abrafleet.com Firebase UID
    const adminFirebaseUid = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';
    
    console.log('\n1️⃣ Testing getUserMongoId function...');
    let userId;
    try {
      userId = await getUserMongoId(adminFirebaseUid);
      console.log(`✅ getUserMongoId returned: ${userId}`);
    } catch (error) {
      console.error('❌ getUserMongoId failed:', error.message);
      return;
    }

    // Test the My Tickets query
    console.log('\n2️⃣ Testing My Tickets query...');
    const query = { assignedTo: userId };
    query.status = { $ne: 'closed' }; // Default: exclude closed tickets
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const tickets = await db.collection('tickets')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`✅ Found ${tickets.length} tickets`);
    
    tickets.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.ticketNumber} - ${ticket.subject} (${ticket.status})`);
      console.log(`      Assigned to: ${ticket.assignedTo}`);
      console.log(`      Created by: ${ticket.createdBy?.email}`);
    });

    // Test with all statuses
    console.log('\n3️⃣ Testing with all statuses...');
    const allQuery = { assignedTo: userId };
    
    const allTickets = await db.collection('tickets')
      .find(allQuery)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`✅ Found ${allTickets.length} tickets (including closed)`);
    
    allTickets.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.ticketNumber} - ${ticket.subject} (${ticket.status})`);
    });

    // Check which collection the function prefers
    console.log('\n4️⃣ Analysis:');
    const usersCollectionUser = await db.collection('users').findOne({ firebaseUid: adminFirebaseUid });
    const adminUsersCollectionUser = await db.collection('admin_users').findOne({ firebaseUid: adminFirebaseUid });
    
    console.log(`   Users collection ID: ${usersCollectionUser?._id}`);
    console.log(`   Admin_users collection ID: ${adminUsersCollectionUser?._id}`);
    console.log(`   Function returned: ${userId}`);
    
    if (usersCollectionUser && userId.toString() === usersCollectionUser._id.toString()) {
      console.log('   ✅ Function correctly chose users collection');
    } else if (adminUsersCollectionUser && userId.toString() === adminUsersCollectionUser._id.toString()) {
      console.log('   ✅ Function correctly chose admin_users collection');
    } else {
      console.log('   ⚠️ Function returned unexpected ID');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testMyTicketsDirect();