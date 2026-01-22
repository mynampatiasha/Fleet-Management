// fix-tms-dual-collection-support.js
// Fix TMS to support both admin_users and users collections

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function fixTMSDualCollectionSupport() {
  console.log('\n🔧 ========== FIXING TMS DUAL COLLECTION SUPPORT ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const adminEmail = 'admin@abrafleet.com';
    
    // Step 1: Get user data from both collections
    console.log('\n1️⃣ Getting user data from both collections:');
    
    const adminUser = await db.collection('admin_users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    const regularUser = await db.collection('users').findOne({ 
      email: adminEmail.toLowerCase() 
    });
    
    console.log('   admin_users:', adminUser ? `${adminUser._id} (${adminUser.firebaseUid})` : 'Not found');
    console.log('   users:', regularUser ? `${regularUser._id} (${regularUser.firebaseUid})` : 'Not found');
    
    if (!adminUser && !regularUser) {
      console.log('❌ No user found in either collection. Cannot proceed.');
      return;
    }
    
    // Step 2: Check current tickets
    console.log('\n2️⃣ Checking current tickets:');
    const allTickets = await db.collection('tickets').find({}).toArray();
    console.log(`   Total tickets: ${allTickets.length}`);
    
    // Step 3: Fix ticket assignments
    console.log('\n3️⃣ Fixing ticket assignments:');
    
    for (const ticket of allTickets) {
      console.log(`   Processing ticket: ${ticket.ticketNumber}`);
      
      let needsUpdate = false;
      const updates = {};
      
      // Check if assignedTo needs fixing
      if (ticket.assignedTo) {
        const assignedToId = ticket.assignedTo.toString();
        console.log(`     Current assignedTo: ${assignedToId}`);
        
        // Check if this ID exists in either collection
        const assignedUserInAdmin = await db.collection('admin_users').findOne({ _id: ticket.assignedTo });
        const assignedUserInRegular = await db.collection('users').findOne({ _id: ticket.assignedTo });
        
        if (!assignedUserInAdmin && !assignedUserInRegular) {
          console.log('     ⚠️ Assigned user not found in either collection');
          
          // Try to fix by finding user with same email as createdBy
          if (ticket.createdBy && ticket.createdBy.email) {
            const email = ticket.createdBy.email.toLowerCase();
            
            // First try admin_users
            const fixUser = await db.collection('admin_users').findOne({ email }) ||
                           await db.collection('users').findOne({ email });
            
            if (fixUser) {
              console.log(`     ✅ Found user to reassign: ${fixUser._id}`);
              updates.assignedTo = fixUser._id;
              needsUpdate = true;
            }
          }
        } else {
          console.log('     ✅ Assignment is valid');
        }
      }
      
      // Check if createdBy needs fixing
      if (ticket.createdBy && ticket.createdBy.id) {
        const createdById = ticket.createdBy.id.toString();
        console.log(`     Current createdBy.id: ${createdById}`);
        
        // If it's not a valid ObjectId, it might be a Firebase UID
        if (!ObjectId.isValid(createdById)) {
          console.log('     ⚠️ createdBy.id is not a valid ObjectId (might be Firebase UID)');
          
          // Try to find user by Firebase UID
          const firebaseUid = createdById;
          const createdByUser = await db.collection('admin_users').findOne({ firebaseUid }) ||
                               await db.collection('users').findOne({ firebaseUid });
          
          if (createdByUser) {
            console.log(`     ✅ Found user by Firebase UID: ${createdByUser._id}`);
            updates['createdBy.id'] = createdByUser._id;
            needsUpdate = true;
          }
        }
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        console.log(`     🔧 Updating ticket with:`, updates);
        await db.collection('tickets').updateOne(
          { _id: ticket._id },
          { $set: updates }
        );
        console.log('     ✅ Ticket updated');
      } else {
        console.log('     ℹ️ No updates needed');
      }
    }
    
    // Step 4: Test the dual collection lookup
    console.log('\n4️⃣ Testing dual collection lookup:');
    
    // Simulate the getUserMongoId function
    async function testGetUserMongoId(db, firebaseUid) {
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
    
    // Test with the admin user's Firebase UID
    const testFirebaseUid = adminUser?.firebaseUid || regularUser?.firebaseUid;
    if (testFirebaseUid) {
      console.log(`   Testing with Firebase UID: ${testFirebaseUid}`);
      try {
        const result = await testGetUserMongoId(db, testFirebaseUid);
        console.log(`   ✅ Found user: ${result.id} in ${result.collection} collection`);
        
        // Test querying tickets for this user
        const userTickets = await db.collection('tickets').find({
          assignedTo: result.id
        }).toArray();
        console.log(`   📋 Tickets assigned to this user: ${userTickets.length}`);
        
        if (userTickets.length > 0) {
          console.log('   📝 Ticket numbers:');
          userTickets.forEach(ticket => {
            console.log(`     - ${ticket.ticketNumber}: ${ticket.subject}`);
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Step 5: Summary
    console.log('\n5️⃣ Summary:');
    const finalTickets = await db.collection('tickets').find({}).toArray();
    console.log(`   Total tickets: ${finalTickets.length}`);
    
    const assignedTickets = finalTickets.filter(t => t.assignedTo);
    console.log(`   Assigned tickets: ${assignedTickets.length}`);
    
    const unassignedTickets = finalTickets.filter(t => !t.assignedTo);
    console.log(`   Unassigned tickets: ${unassignedTickets.length}`);
    
    // Check if admin user can see their tickets now
    if (adminUser) {
      const adminTickets = await db.collection('tickets').find({
        assignedTo: adminUser._id
      }).toArray();
      console.log(`   Tickets assigned to admin user (admin_users): ${adminTickets.length}`);
    }
    
    if (regularUser) {
      const regularTickets = await db.collection('tickets').find({
        assignedTo: regularUser._id
      }).toArray();
      console.log(`   Tickets assigned to admin user (users): ${regularTickets.length}`);
    }
    
    console.log('\n✅ TMS DUAL COLLECTION SUPPORT FIX COMPLETED!');
    console.log('🎯 Now the system should work for both admin_users and users collections');
    console.log('📝 Try refreshing the "My Tickets" page in the app');
    
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
fixTMSDualCollectionSupport();