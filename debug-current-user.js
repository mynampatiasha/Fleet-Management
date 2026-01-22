// Debug script to check current user authentication issue
const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require('./abra_fleet_backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function debugCurrentUser() {
  let client;
  
  try {
    console.log('🔍 Debugging current user authentication issue...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/abrafleet';
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('abrafleet');
    
    console.log('✅ Connected to MongoDB');

    // 1. Check all users in the database
    console.log('\n📋 All users in MongoDB users collection:');
    const allUsers = await db.collection('users').find({}).toArray();
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in the database!');
    } else {
      console.log(`Found ${allUsers.length} users:`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'No email'} - ${user.name || 'No name'} (${user.role || 'No role'})`);
        console.log(`      Firebase UID: ${user.firebaseUid || 'No UID'}`);
        console.log(`      Status: ${user.status || user.isActive || 'Unknown'}`);
        console.log('');
      });
    }

    // 2. Check Firebase Auth users
    console.log('\n🔐 Firebase Auth users:');
    try {
      const listUsersResult = await admin.auth().listUsers(10);
      console.log(`Found ${listUsersResult.users.length} Firebase users:`);
      
      listUsersResult.users.forEach((userRecord, index) => {
        console.log(`   ${index + 1}. ${userRecord.email || 'No email'} - ${userRecord.displayName || 'No name'}`);
        console.log(`      UID: ${userRecord.uid}`);
        console.log(`      Email verified: ${userRecord.emailVerified}`);
        console.log('');
      });
    } catch (fbError) {
      console.error('❌ Error listing Firebase users:', fbError.message);
    }

    // 3. Try to find a customer user to test with
    console.log('\n🔍 Looking for customer users...');
    const customerUsers = await db.collection('users').find({ role: 'customer' }).toArray();
    
    if (customerUsers.length > 0) {
      console.log(`Found ${customerUsers.length} customer users:`);
      customerUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.name}`);
        console.log(`      Firebase UID: ${user.firebaseUid}`);
      });
      
      // Test with the first customer user
      const testUser = customerUsers[0];
      console.log(`\n🧪 Testing with user: ${testUser.email}`);
      
      // Check if this user has any rosters
      const rosterCount = await db.collection('rosters').countDocuments({
        customerEmail: testUser.email
      });
      console.log(`   Rosters found: ${rosterCount}`);
      
      if (rosterCount > 0) {
        const sampleRoster = await db.collection('rosters').findOne({
          customerEmail: testUser.email
        });
        console.log('   Sample roster:');
        console.log(`     ID: ${sampleRoster._id}`);
        console.log(`     Type: ${sampleRoster.rosterType}`);
        console.log(`     Status: ${sampleRoster.status}`);
        console.log(`     Office: ${sampleRoster.officeLocation}`);
      }
    } else {
      console.log('❌ No customer users found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

debugCurrentUser();