// fix-existing-ticket-assignments.js
// Fix existing ticket assignments to use the correct user ID

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function fixExistingTicketAssignments() {
  console.log('\n🔧 ========== FIXING EXISTING TICKET ASSIGNMENTS ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const adminEmail = 'admin@abrafleet.com';
    
    // Get the user from users collection (this is what the TMS backend will find)
    const regularUser = await db.collection('users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    
    if (!regularUser) {
      console.log('❌ User not found in users collection');
      return;
    }
    
    console.log(`✅ Found user in users collection: ${regularUser._id}`);
    console.log(`   Firebase UID: ${regularUser.firebaseUid}`);
    console.log(`   Email: ${regularUser.email}`);
    
    // Find all tickets assigned to admin@abrafleet.com (by email in createdBy)
    const adminTickets = await db.collection('tickets').find({
      'createdBy.email': adminEmail
    }).toArray();
    
    console.log(`\n📋 Found ${adminTickets.length} tickets created by ${adminEmail}:`);
    
    for (const ticket of adminTickets) {
      console.log(`\n🎫 Processing ticket: ${ticket.ticketNumber}`);
      console.log(`   Subject: ${ticket.subject}`);
      console.log(`   Current assignedTo: ${ticket.assignedTo}`);
      console.log(`   Should be assignedTo: ${regularUser._id}`);
      
      // Check if the ticket is assigned to the admin user (either collection)
      const isAssignedToAdmin = ticket.assignedTo && (
        ticket.assignedTo.toString() === regularUser._id.toString() ||
        // Check if it's assigned to the admin_users collection ID
        await db.collection('admin_users').findOne({ 
          _id: ticket.assignedTo,
          email: adminEmail.toLowerCase()
        })
      );
      
      if (isAssignedToAdmin && ticket.assignedTo.toString() !== regularUser._id.toString()) {
        console.log('   🔧 Updating assignment to correct user ID...');
        
        await db.collection('tickets').updateOne(
          { _id: ticket._id },
          { 
            $set: { 
              assignedTo: regularUser._id,
              updatedAt: new Date()
            },
            $push: {
              history: {
                action: 'assignment_fixed',
                by: 'system',
                timestamp: new Date(),
                note: 'Fixed assignment to use correct user collection ID'
              }
            }
          }
        );
        
        console.log('   ✅ Assignment updated successfully');
      } else if (ticket.assignedTo && ticket.assignedTo.toString() === regularUser._id.toString()) {
        console.log('   ✅ Assignment is already correct');
      } else if (!ticket.assignedTo) {
        console.log('   ℹ️ Ticket is unassigned');
      } else {
        console.log('   ⚠️ Ticket is assigned to someone else');
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix:');
    const fixedTickets = await db.collection('tickets').find({
      assignedTo: regularUser._id
    }).toArray();
    
    console.log(`✅ Tickets now assigned to ${adminEmail}: ${fixedTickets.length}`);
    fixedTickets.forEach(ticket => {
      console.log(`   - ${ticket.ticketNumber}: ${ticket.subject}`);
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. The TMS backend has been updated to check both collections');
    console.log('2. Existing tickets have been reassigned to the correct user ID');
    console.log('3. Try refreshing the "My Tickets" page in the app');
    console.log('4. The tickets should now appear in your "My Tickets" section');
    
    console.log('\n✅ EXISTING TICKET ASSIGNMENTS FIXED!');
    
  } catch (error) {
    console.error('\n❌ FIX FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🔧 ========== FIX COMPLETE ==========\n');
}

// Run the fix
fixExistingTicketAssignments();