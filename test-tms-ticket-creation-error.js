// test-tms-ticket-creation-error.js
// Debug the 500 error when creating a new ticket

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function testTMSTicketCreationError() {
  console.log('\n🐛 ========== DEBUGGING TMS TICKET CREATION ERROR ==========');
  
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
    
    // Step 1: Simulate ticket creation data
    console.log('\n1️⃣ Simulating ticket creation:');
    
    const ticketData = {
      subject: 'Test ticket creation',
      message: 'Testing ticket creation from debug script',
      priority: 'medium',
      assignedTo: null, // Self-assignment will be handled later
      status: 'open'
    };
    
    const createdBy = {
      uid: firebaseUid,
      email: adminEmail,
      name: 'Admin User',
      role: 'admin'
    };
    
    console.log('📝 Ticket data:', ticketData);
    console.log('👤 Created by:', createdBy);
    
    // Step 2: Test generateTicketNumber function
    console.log('\n2️⃣ Testing ticket number generation:');
    
    async function generateTicketNumber(db) {
      const year = new Date().getFullYear();
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const dateKey = `${year}-${month}-${day}`;
      const datePrefix = `TKT-${year}-${month}${day}`;
      
      // Use MongoDB's findOneAndUpdate with upsert for atomic counter
      const counterDoc = await db.collection('ticket_counters').findOneAndUpdate(
        { _id: dateKey },
        { $inc: { sequence: 1 } },
        { 
          upsert: true, 
          returnDocument: 'after'
        }
      );
      
      const sequence = counterDoc.sequence;
      const ticketNumber = `${datePrefix}-${String(sequence).padStart(3, '0')}`;
      
      // Additional safety check (though should not be needed with atomic counter)
      const existingTicket = await db.collection('tickets').findOne({ ticketNumber });
      if (existingTicket) {
        // If somehow still duplicate, add timestamp suffix
        const timestamp = Date.now().toString().slice(-4);
        return `${datePrefix}-${String(sequence).padStart(3, '0')}-${timestamp}`;
      }
      
      return ticketNumber;
    }
    
    let ticketNumber;
    try {
      ticketNumber = await generateTicketNumber(db);
      console.log('🎫 Generated ticket number:', ticketNumber);
    } catch (error) {
      console.log('❌ Error generating ticket number:', error.message);
      return;
    }
    
    // Step 3: Test getUserMongoId function for assignedTo
    console.log('\n3️⃣ Testing user lookup for assignment:');
    
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
    
    // For self-assignment, use the same user
    let assignedToObjectId = null;
    let createdByObjectId = null;
    
    try {
      // Get MongoDB user ID for createdBy using dual collection lookup
      try {
        // First try to use as ObjectId directly
        createdByObjectId = new ObjectId(createdBy.uid);
      } catch (error) {
        // If not valid ObjectId, try to find user by Firebase UID in both collections
        let createdByUser = await db.collection('users').findOne({ firebaseUid: createdBy.uid });
        if (!createdByUser) {
          createdByUser = await db.collection('admin_users').findOne({ firebaseUid: createdBy.uid });
        }
        
        if (createdByUser) {
          createdByObjectId = createdByUser._id;
        } else {
          console.log('⚠️ Created by user not found in either collection:', createdBy.uid);
          // For backward compatibility, store Firebase UID as string
          createdByObjectId = createdBy.uid;
        }
      }
      
      // For self-assignment
      assignedToObjectId = createdByObjectId;
      
      console.log('👤 Created by ObjectId:', createdByObjectId);
      console.log('👤 Assigned to ObjectId:', assignedToObjectId);
      
    } catch (error) {
      console.log('❌ Error getting user IDs:', error.message);
      return;
    }
    
    // Step 4: Prepare ticket document
    console.log('\n4️⃣ Preparing ticket document:');
    
    const newTicket = {
      ticketNumber,
      subject: ticketData.subject,
      message: ticketData.message,
      priority: ticketData.priority.toLowerCase(), // low, medium, high
      status: ticketData.status || 'open', // open, in_progress, closed
      assignedTo: assignedToObjectId,
      createdBy: {
        id: createdByObjectId,
        firebaseUid: createdBy.uid, // Store Firebase UID for reference
        name: createdBy.name,
        email: createdBy.email
      },
      attachment: null, // No file upload in this test
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [{
        action: 'created',
        by: createdBy.email,
        timestamp: new Date(),
        note: 'Ticket created'
      }]
    };
    
    console.log('📄 New ticket document:');
    console.log(JSON.stringify(newTicket, null, 2));
    
    // Step 5: Test ticket insertion
    console.log('\n5️⃣ Testing ticket insertion:');
    
    try {
      const result = await db.collection('tickets').insertOne(newTicket);
      newTicket._id = result.insertedId;
      
      console.log('✅ Ticket inserted successfully');
      console.log('🆔 Inserted ID:', result.insertedId);
      console.log('🎫 Ticket number:', newTicket.ticketNumber);
      
    } catch (insertError) {
      console.log('❌ Ticket insertion failed:', insertError.message);
      console.log('📋 Error details:', insertError);
      return;
    }
    
    // Step 6: Verify the insertion
    console.log('\n6️⃣ Verifying ticket insertion:');
    
    const insertedTicket = await db.collection('tickets').findOne({ 
      ticketNumber: newTicket.ticketNumber 
    });
    
    if (insertedTicket) {
      console.log('✅ Ticket verification successful');
      console.log('📝 Subject:', insertedTicket.subject);
      console.log('📊 Status:', insertedTicket.status);
      console.log('⚡ Priority:', insertedTicket.priority);
      console.log('👤 Assigned to:', insertedTicket.assignedTo);
      console.log('👤 Created by:', insertedTicket.createdBy?.email);
    } else {
      console.log('❌ Ticket verification failed - not found');
    }
    
    // Step 7: Test notification sending (simulate)
    console.log('\n7️⃣ Testing notification logic:');
    
    console.log('📢 Would send notifications to:');
    if (assignedToObjectId) {
      console.log(`   - Assigned user: ${assignedToObjectId}`);
    }
    
    // Simulate finding admins for notification
    const admins = await db.collection('users')
      .find({ role: 'super_admin' })
      .toArray();
    
    console.log(`   - ${admins.length} super admins found`);
    
    console.log('✅ Ticket creation simulation completed successfully!');
    
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
testTMSTicketCreationError();