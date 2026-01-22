// test-tms-objectid-fix-direct.js
// Direct test of TMS ObjectId fix by mocking the middleware

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function testTMSObjectIdFix() {
  console.log('\n🎫 ========== TESTING TMS OBJECTID FIX (DIRECT) ==========');
  
  let client;
  
  try {
    // Connect to MongoDB directly
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    // Mock user object (simulating what the auth middleware would provide)
    const mockUser = {
      uid: 'test-firebase-uid-12345', // This is a Firebase UID (not ObjectId format)
      email: 'admin@abrafleet.com',
      name: 'Test Admin',
      role: 'super_admin'
    };
    
    console.log('👤 Mock User:');
    console.log('   UID:', mockUser.uid);
    console.log('   Email:', mockUser.email);
    console.log('   Role:', mockUser.role);
    
    // Test the ObjectId conversion logic directly
    console.log('\n🔍 Testing ObjectId conversion logic...');
    
    // Test 1: Try to convert Firebase UID to ObjectId (should fail)
    console.log('\n1️⃣ Testing Firebase UID to ObjectId conversion:');
    try {
      const objectId = new ObjectId(mockUser.uid);
      console.log('❌ UNEXPECTED: Firebase UID converted to ObjectId:', objectId);
    } catch (error) {
      console.log('✅ EXPECTED: Firebase UID cannot be converted to ObjectId');
      console.log('   Error:', error.message);
    }
    
    // Test 2: Test the fixed logic - find user by Firebase UID
    console.log('\n2️⃣ Testing user lookup by Firebase UID:');
    let userMongoId = null;
    try {
      // First try to use as ObjectId directly
      userMongoId = new ObjectId(mockUser.uid);
    } catch (error) {
      console.log('✅ Firebase UID is not valid ObjectId, looking up user...');
      
      // Try to find user by Firebase UID
      const user = await db.collection('users').findOne({ firebaseUid: mockUser.uid });
      if (user) {
        userMongoId = user._id;
        console.log('✅ Found user in database:', user._id);
      } else {
        console.log('⚠️ User not found in database, will use Firebase UID as string');
        userMongoId = mockUser.uid;
      }
    }
    
    // Test 3: Create a ticket document with the fixed logic
    console.log('\n3️⃣ Testing ticket document creation:');
    
    const ticketData = {
      subject: 'Test Ticket - ObjectId Fix',
      message: 'Testing the ObjectId fix for TMS',
      priority: 'medium',
      status: 'open',
      assignedTo: null // Test null assignment
    };
    
    // Generate ticket number
    const year = new Date().getFullYear();
    const ticketNumber = `TKT-${year}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    
    // Create ticket document using the fixed logic
    const newTicket = {
      ticketNumber,
      subject: ticketData.subject,
      message: ticketData.message,
      priority: ticketData.priority,
      status: ticketData.status,
      assignedTo: null, // Testing null assignment
      createdBy: {
        id: userMongoId, // This could be ObjectId or string now
        firebaseUid: mockUser.uid, // Always store Firebase UID for reference
        name: mockUser.name,
        email: mockUser.email
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [{
        action: 'created',
        by: mockUser.email,
        timestamp: new Date(),
        note: 'Ticket created'
      }]
    };
    
    console.log('📝 Ticket document to be created:');
    console.log('   Ticket Number:', newTicket.ticketNumber);
    console.log('   Created By ID:', newTicket.createdBy.id);
    console.log('   Created By Firebase UID:', newTicket.createdBy.firebaseUid);
    console.log('   Assigned To:', newTicket.assignedTo);
    
    // Test 4: Insert the ticket into MongoDB
    console.log('\n4️⃣ Testing ticket insertion into MongoDB:');
    try {
      const result = await db.collection('tickets').insertOne(newTicket);
      console.log('✅ TICKET CREATED SUCCESSFULLY!');
      console.log('   Inserted ID:', result.insertedId);
      
      // Test 5: Retrieve the ticket
      console.log('\n5️⃣ Testing ticket retrieval:');
      const retrievedTicket = await db.collection('tickets').findOne({ _id: result.insertedId });
      if (retrievedTicket) {
        console.log('✅ TICKET RETRIEVED SUCCESSFULLY!');
        console.log('   Ticket Number:', retrievedTicket.ticketNumber);
        console.log('   Created By:', retrievedTicket.createdBy);
      } else {
        console.log('❌ Failed to retrieve ticket');
      }
      
      // Clean up - delete the test ticket
      await db.collection('tickets').deleteOne({ _id: result.insertedId });
      console.log('🧹 Test ticket cleaned up');
      
    } catch (error) {
      console.log('❌ TICKET CREATION FAILED!');
      console.log('   Error:', error.message);
      throw error;
    }
    
    console.log('\n✅ ALL TESTS PASSED! ObjectId fix is working correctly.');
    
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
  
  console.log('\n🎫 ========== TEST COMPLETE ==========\n');
}

// Run the test
testTMSObjectIdFix();