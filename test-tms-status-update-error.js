// test-tms-status-update-error.js
// Debug the 500 error when updating ticket status

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function testTMSStatusUpdateError() {
  console.log('\n🐛 ========== DEBUGGING TMS STATUS UPDATE ERROR ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const ticketId = '69574b902eaee5d65d66c498';
    const adminEmail = 'admin@abrafleet.com';
    const firebaseUid = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';
    
    // Step 1: Check if the ticket exists
    console.log('\n1️⃣ Checking if ticket exists:');
    console.log(`   Ticket ID: ${ticketId}`);
    
    let ticket;
    try {
      ticket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });
      if (ticket) {
        console.log('   ✅ Ticket found:', ticket.ticketNumber);
        console.log('   📝 Current status:', ticket.status);
        console.log('   👤 Assigned to:', ticket.assignedTo);
        console.log('   👤 Created by:', ticket.createdBy?.email);
      } else {
        console.log('   ❌ Ticket not found');
        return;
      }
    } catch (error) {
      console.log('   ❌ Error finding ticket:', error.message);
      return;
    }
    
    // Step 2: Test getUserMongoId function (from TMS backend)
    console.log('\n2️⃣ Testing getUserMongoId function:');
    
    async function getUserMongoId(db, firebaseUid) {
      try {
        // First try to use as ObjectId directly (for backward compatibility)
        if (ObjectId.isValid(firebaseUid)) {
          // Check users collection first
          let user = await db.collection('users').findOne({ _id: new ObjectId(firebaseUid) });
          if (user) return user._id;
          
          // Check admin_users collection
          user = await db.collection('admin_users').findOne({ _id: new ObjectId(firebaseUid) });
          if (user) return user._id;
        }
        
        // Try to find by Firebase UID in users collection
        let user = await db.collection('users').findOne({ firebaseUid });
        if (user) return user._id;
        
        // Try to find by Firebase UID in admin_users collection
        user = await db.collection('admin_users').findOne({ firebaseUid });
        if (user) return user._id;
        
        throw new Error('User not found in database');
      } catch (error) {
        console.error('❌ Error getting user MongoDB ID:', error.message);
        throw error;
      }
    }
    
    let userMongoId;
    try {
      userMongoId = await getUserMongoId(db, firebaseUid);
      console.log(`   ✅ User MongoDB ID: ${userMongoId}`);
    } catch (error) {
      console.log(`   ❌ Error getting user MongoDB ID: ${error.message}`);
      return;
    }
    
    // Step 3: Check permission (simulate TMS backend logic)
    console.log('\n3️⃣ Checking permissions:');
    
    const userRole = 'admin'; // Simulating admin role
    const adminRoles = [
      'super_admin', 'superadmin', 'super', 'admin', 'employee',
      'org_admin', 'organization_admin',
      'fleet_manager', 'operations_manager', 'operations',
      'hr_manager', 'finance_admin', 'finance'
    ];
    
    const normalizedRole = userRole?.toLowerCase()?.trim()?.replace(' ', '_');
    const isAdmin = adminRoles.includes(normalizedRole);
    console.log(`   👤 User role: ${userRole}`);
    console.log(`   🔐 Is admin: ${isAdmin}`);
    
    // Check if user is assigned to this ticket
    let isAssigned = false;
    if (ticket.assignedTo) {
      isAssigned = ticket.assignedTo.toString() === userMongoId.toString();
      console.log(`   📋 Is assigned: ${isAssigned}`);
      console.log(`   📋 Ticket assignedTo: ${ticket.assignedTo}`);
      console.log(`   📋 User MongoDB ID: ${userMongoId}`);
    } else {
      console.log(`   📋 Ticket is unassigned`);
    }
    
    if (!isAdmin && !isAssigned) {
      console.log('   ❌ Permission denied - user is not admin and not assigned to ticket');
      return;
    } else {
      console.log('   ✅ Permission granted');
    }
    
    // Step 4: Test the update operation
    console.log('\n4️⃣ Testing status update:');
    
    const newStatus = 'in_progress';
    const note = 'Testing status update';
    const userEmail = adminEmail;
    
    console.log(`   📝 New status: ${newStatus}`);
    console.log(`   📝 Note: ${note}`);
    console.log(`   👤 Updated by: ${userEmail}`);
    
    // Validate status
    const validStatuses = ['open', 'in_progress', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      console.log(`   ❌ Invalid status: ${newStatus}`);
      return;
    }
    
    // Prepare update data (simulate TMS backend logic)
    const updateData = {
      status: newStatus,
      updatedAt: new Date(),
      $push: {
        history: {
          action: `status_changed_to_${newStatus}`,
          by: userEmail,
          timestamp: new Date(),
          note: note || `Status updated to ${newStatus}`
        }
      }
    };
    
    console.log('   🔄 Update data:', JSON.stringify(updateData, null, 2));
    
    // Perform the update
    try {
      const result = await db.collection('tickets').updateOne(
        { _id: new ObjectId(ticketId) },
        updateData
      );
      
      console.log('   📊 Update result:', result);
      
      if (result.modifiedCount === 0) {
        console.log('   ⚠️ No documents were modified');
      } else {
        console.log('   ✅ Ticket status updated successfully');
      }
      
    } catch (updateError) {
      console.log('   ❌ Update failed:', updateError.message);
      console.log('   📋 Error details:', updateError);
    }
    
    // Step 5: Verify the update
    console.log('\n5️⃣ Verifying the update:');
    
    const updatedTicket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });
    if (updatedTicket) {
      console.log('   ✅ Updated ticket found');
      console.log('   📝 New status:', updatedTicket.status);
      console.log('   📅 Updated at:', updatedTicket.updatedAt);
      console.log('   📜 History entries:', updatedTicket.history?.length || 0);
      
      if (updatedTicket.history && updatedTicket.history.length > 0) {
        const lastEntry = updatedTicket.history[updatedTicket.history.length - 1];
        console.log('   📜 Last history entry:', lastEntry);
      }
    } else {
      console.log('   ❌ Could not find updated ticket');
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
  
  console.log('\n🐛 ========== DEBUG TEST COMPLETE ==========\n');
}

// Run the test
testTMSStatusUpdateError();