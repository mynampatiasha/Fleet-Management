// Debug script for My Tickets issue
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function debugMyTicketsIssue() {
  console.log('🔍 DEBUGGING MY TICKETS ISSUE');
  console.log('='.repeat(60));

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();

    console.log('✅ Connected to MongoDB');

    // Step 1: Check if tickets collection exists and has data
    console.log('\n1️⃣ Checking tickets collection...');
    const ticketsCount = await db.collection('tickets').countDocuments();
    console.log(`   Total tickets in database: ${ticketsCount}`);

    if (ticketsCount === 0) {
      console.log('❌ No tickets found in database!');
      return;
    }

    // Step 2: Show all tickets
    console.log('\n2️⃣ All tickets in database:');
    const allTickets = await db.collection('tickets').find({}).toArray();
    allTickets.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.ticketNumber} - ${ticket.subject}`);
      console.log(`      Status: ${ticket.status}`);
      console.log(`      Created by: ${ticket.createdBy?.email || 'Unknown'}`);
      console.log(`      Assigned to: ${ticket.assignedTo || 'Unassigned'}`);
      console.log(`      Created by ID: ${ticket.createdBy?.id || 'None'}`);
      console.log(`      Created by Firebase UID: ${ticket.createdBy?.firebaseUid || 'None'}`);
      console.log('');
    });

    // Step 3: Check admin@abrafleet.com user in both collections
    console.log('\n3️⃣ Checking admin@abrafleet.com user...');
    
    // Check in users collection
    const userInUsers = await db.collection('users').findOne({ email: 'admin@abrafleet.com' });
    if (userInUsers) {
      console.log('   ✅ Found in users collection:');
      console.log(`      _id: ${userInUsers._id}`);
      console.log(`      firebaseUid: ${userInUsers.firebaseUid || 'None'}`);
      console.log(`      role: ${userInUsers.role}`);
    } else {
      console.log('   ❌ Not found in users collection');
    }

    // Check in admin_users collection
    const userInAdminUsers = await db.collection('admin_users').findOne({ email: 'admin@abrafleet.com' });
    if (userInAdminUsers) {
      console.log('   ✅ Found in admin_users collection:');
      console.log(`      _id: ${userInAdminUsers._id}`);
      console.log(`      firebaseUid: ${userInAdminUsers.firebaseUid || 'None'}`);
      console.log(`      role: ${userInAdminUsers.role}`);
    } else {
      console.log('   ❌ Not found in admin_users collection');
    }

    // Step 4: Check which tickets should be returned for admin@abrafleet.com
    console.log('\n4️⃣ Checking ticket assignments for admin@abrafleet.com...');
    
    const adminUser = userInUsers || userInAdminUsers;
    if (!adminUser) {
      console.log('❌ admin@abrafleet.com not found in any collection!');
      return;
    }

    console.log(`   Using admin user ID: ${adminUser._id}`);
    console.log(`   Using admin Firebase UID: ${adminUser.firebaseUid || 'None'}`);

    // Check tickets assigned to this user by MongoDB _id
    const ticketsByMongoId = await db.collection('tickets').find({ 
      assignedTo: adminUser._id 
    }).toArray();
    console.log(`   Tickets assigned by MongoDB _id: ${ticketsByMongoId.length}`);

    // Check tickets assigned to this user by Firebase UID (if exists)
    if (adminUser.firebaseUid) {
      const ticketsByFirebaseUid = await db.collection('tickets').find({ 
        assignedTo: adminUser.firebaseUid 
      }).toArray();
      console.log(`   Tickets assigned by Firebase UID: ${ticketsByFirebaseUid.length}`);
    }

    // Check tickets created by this user
    const ticketsCreatedBy = await db.collection('tickets').find({ 
      'createdBy.email': 'admin@abrafleet.com' 
    }).toArray();
    console.log(`   Tickets created by admin@abrafleet.com: ${ticketsCreatedBy.length}`);

    // Step 5: Simulate the My Tickets API query
    console.log('\n5️⃣ Simulating My Tickets API query...');
    
    // This is what the backend does in /api/tickets/my
    const query = { assignedTo: adminUser._id };
    query.status = { $ne: 'closed' }; // Default: exclude closed tickets
    
    console.log('   Query:', JSON.stringify(query, null, 2));
    
    const myTicketsResult = await db.collection('tickets').find(query).toArray();
    console.log(`   My Tickets result: ${myTicketsResult.length} tickets`);
    
    myTicketsResult.forEach((ticket, index) => {
      console.log(`      ${index + 1}. ${ticket.ticketNumber} - ${ticket.subject} (${ticket.status})`);
    });

    // Step 6: Check if there are any tickets that should be assigned to admin
    console.log('\n6️⃣ Recommendations:');
    
    if (myTicketsResult.length === 0) {
      console.log('   ❌ No tickets found for admin@abrafleet.com');
      console.log('   💡 Possible solutions:');
      console.log('      1. Create test tickets assigned to admin@abrafleet.com');
      console.log('      2. Check if tickets are assigned to wrong user ID');
      console.log('      3. Verify the assignedTo field format in existing tickets');
      
      // Check if there are unassigned tickets
      const unassignedTickets = await db.collection('tickets').find({ 
        assignedTo: null 
      }).toArray();
      console.log(`   📋 Unassigned tickets available: ${unassignedTickets.length}`);
      
      if (unassignedTickets.length > 0) {
        console.log('   💡 You can assign these tickets to admin@abrafleet.com');
      }
    } else {
      console.log('   ✅ Tickets found! The issue might be in the frontend or API call');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

debugMyTicketsIssue();