// debug-tms-my-tickets-issue.js
// Debug why tickets are not showing in "My Tickets" for admin@abrafleet.com

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function debugTMSMyTicketsIssue() {
  console.log('\n🔍 ========== DEBUGGING TMS MY TICKETS ISSUE ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const adminEmail = 'admin@abrafleet.com';
    
    // Step 1: Check if admin user exists in different collections
    console.log('\n1️⃣ Checking admin user in different collections:');
    
    // Check in admin_users collection
    const adminUser = await db.collection('admin_users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    console.log('   admin_users collection:');
    if (adminUser) {
      console.log('     ✅ Found user:');
      console.log('       - _id:', adminUser._id);
      console.log('       - firebaseUid:', adminUser.firebaseUid);
      console.log('       - email:', adminUser.email);
      console.log('       - role:', adminUser.role);
    } else {
      console.log('     ❌ User not found');
    }
    
    // Check in users collection
    const regularUser = await db.collection('users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    console.log('   users collection:');
    if (regularUser) {
      console.log('     ✅ Found user:');
      console.log('       - _id:', regularUser._id);
      console.log('       - firebaseUid:', regularUser.firebaseUid);
      console.log('       - email:', regularUser.email);
      console.log('       - role:', regularUser.role);
    } else {
      console.log('     ❌ User not found');
    }
    
    // Step 2: Check all tickets in the system
    console.log('\n2️⃣ Checking all tickets in the system:');
    const allTickets = await db.collection('tickets').find({}).toArray();
    console.log(`   Total tickets in database: ${allTickets.length}`);
    
    if (allTickets.length > 0) {
      console.log('   Ticket details:');
      allTickets.forEach((ticket, index) => {
        console.log(`     ${index + 1}. ${ticket.ticketNumber}`);
        console.log(`        - Subject: ${ticket.subject}`);
        console.log(`        - Status: ${ticket.status}`);
        console.log(`        - Created By: ${JSON.stringify(ticket.createdBy)}`);
        console.log(`        - Assigned To: ${ticket.assignedTo || 'Unassigned'}`);
        console.log(`        - Created At: ${ticket.createdAt}`);
      });
    }
    
    // Step 3: Check tickets created by admin@abrafleet.com
    console.log('\n3️⃣ Checking tickets created by admin@abrafleet.com:');
    const ticketsByEmail = await db.collection('tickets').find({
      'createdBy.email': adminEmail
    }).toArray();
    console.log(`   Tickets created by email: ${ticketsByEmail.length}`);
    
    const ticketsByFirebaseUid = await db.collection('tickets').find({
      'createdBy.firebaseUid': { $exists: true }
    }).toArray();
    console.log(`   Tickets with firebaseUid: ${ticketsByFirebaseUid.length}`);
    
    // Step 4: Check tickets assigned to admin@abrafleet.com
    console.log('\n4️⃣ Checking tickets assigned to admin@abrafleet.com:');
    
    // Check by MongoDB ObjectId (if admin user exists)
    if (adminUser) {
      const ticketsAssignedById = await db.collection('tickets').find({
        assignedTo: adminUser._id
      }).toArray();
      console.log(`   Tickets assigned by MongoDB ID: ${ticketsAssignedById.length}`);
    }
    
    if (regularUser) {
      const ticketsAssignedById = await db.collection('tickets').find({
        assignedTo: regularUser._id
      }).toArray();
      console.log(`   Tickets assigned by regular user ID: ${ticketsAssignedById.length}`);
    }
    
    // Check by Firebase UID (if exists)
    if (adminUser && adminUser.firebaseUid) {
      const ticketsByFirebaseUid = await db.collection('tickets').find({
        assignedTo: adminUser.firebaseUid
      }).toArray();
      console.log(`   Tickets assigned by Firebase UID: ${ticketsByFirebaseUid.length}`);
    }
    
    // Step 5: Simulate the "My Tickets" query logic
    console.log('\n5️⃣ Simulating "My Tickets" query logic:');
    
    // This is what the TMS backend does
    async function getUserMongoId(db, firebaseUid) {
      try {
        // First try to use as ObjectId directly (for backward compatibility)
        if (ObjectId.isValid(firebaseUid)) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(firebaseUid) });
          if (user) return user._id;
        }
        
        // Try to find by Firebase UID
        const user = await db.collection('users').findOne({ firebaseUid });
        if (!user) {
          throw new Error('User not found in database');
        }
        return user._id;
      } catch (error) {
        console.error('❌ Error getting user MongoDB ID:', error.message);
        throw error;
      }
    }
    
    // Test with different Firebase UIDs
    const testFirebaseUids = [
      adminUser?.firebaseUid,
      regularUser?.firebaseUid,
      'admin-firebase-uid', // Common test UID
      'test-admin-uid-123', // Another test UID
    ].filter(Boolean);
    
    for (const firebaseUid of testFirebaseUids) {
      console.log(`   Testing Firebase UID: ${firebaseUid}`);
      try {
        const userId = await getUserMongoId(db, firebaseUid);
        console.log(`     ✅ Found MongoDB ID: ${userId}`);
        
        // Query tickets assigned to this user
        const userTickets = await db.collection('tickets').find({
          assignedTo: userId
        }).toArray();
        console.log(`     📋 Tickets assigned: ${userTickets.length}`);
        
      } catch (error) {
        console.log(`     ❌ Error: ${error.message}`);
        
        // Try fallback query by Firebase UID in createdBy field
        const fallbackTickets = await db.collection('tickets').find({
          'createdBy.firebaseUid': firebaseUid
        }).toArray();
        console.log(`     📋 Fallback tickets (created by): ${fallbackTickets.length}`);
      }
    }
    
    // Step 6: Check what the frontend might be sending
    console.log('\n6️⃣ Recommendations for fixing the issue:');
    
    if (allTickets.length === 0) {
      console.log('   🎯 ISSUE: No tickets exist in the database');
      console.log('   💡 SOLUTION: Create a test ticket first');
    } else if (!adminUser && !regularUser) {
      console.log('   🎯 ISSUE: admin@abrafleet.com user not found in any collection');
      console.log('   💡 SOLUTION: Create the admin user in admin_users collection');
    } else {
      console.log('   🎯 ISSUE: User exists but tickets are not properly assigned');
      console.log('   💡 SOLUTION: Check the assignment logic in ticket creation');
      
      // Show what the correct assignment should be
      if (adminUser) {
        console.log(`   📝 Correct assignedTo value should be: ${adminUser._id}`);
        console.log(`   📝 Correct firebaseUid should be: ${adminUser.firebaseUid}`);
      }
    }
    
    console.log('\n✅ DEBUGGING COMPLETE!');
    
  } catch (error) {
    console.error('\n❌ DEBUG FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🔍 ========== DEBUG COMPLETE ==========\n');
}

// Run the debug
debugTMSMyTicketsIssue();