// Simple debug script to check user collections
const { MongoClient } = require('mongodb');

async function debugUserCollections() {
  let client;
  
  try {
    console.log('🔍 Debugging user collections...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/abrafleet';
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('abrafleet');
    
    console.log('✅ Connected to MongoDB');

    // 1. Check users collection
    console.log('\n📋 Users collection:');
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('❌ No users found in users collection!');
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'No email'} - ${user.name || 'No name'} (${user.role || 'No role'})`);
        console.log(`      Firebase UID: ${user.firebaseUid || 'No UID'}`);
        console.log('');
      });
    }

    // 2. Check admin_users collection
    console.log('\n📋 Admin_users collection:');
    const adminUsers = await db.collection('admin_users').find({}).toArray();
    
    if (adminUsers.length === 0) {
      console.log('❌ No users found in admin_users collection!');
    } else {
      console.log(`Found ${adminUsers.length} admin users:`);
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || user.emailAddress || 'No email'} - ${user.name || 'No name'} (${user.role || 'No role'})`);
        console.log(`      Firebase UID: ${user.firebaseUid || 'No UID'}`);
        console.log('');
      });
    }

    // 3. Check rosters collection
    console.log('\n📋 Rosters collection sample:');
    const rosters = await db.collection('rosters').find({}).limit(5).toArray();
    
    if (rosters.length === 0) {
      console.log('❌ No rosters found!');
    } else {
      console.log(`Found ${rosters.length} sample rosters:`);
      rosters.forEach((roster, index) => {
        console.log(`   ${index + 1}. Customer: ${roster.customerEmail || roster.employeeDetails?.email || 'No email'}`);
        console.log(`      Office: ${roster.officeLocation || 'No office'}`);
        console.log(`      Status: ${roster.status || 'No status'}`);
        console.log(`      Type: ${roster.rosterType || 'No type'}`);
        console.log('');
      });
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

debugUserCollections();