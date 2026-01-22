// Check if customer123 user exists in database
const { MongoClient } = require('mongodb');

async function checkUserInDB() {
  let client;
  
  try {
    console.log('🔍 Checking if customer123 user exists in database...\n');

    // Connect to MongoDB using the same connection as the backend
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('✅ Connected to MongoDB');

    const targetUID = 'b5aoloVR7xYI6SICibCIWecBaf82';
    const targetEmail = 'customer123@abrafleet.com';

    // 1. Check users collection
    console.log('\n📋 Checking users collection...');
    const userInUsers = await db.collection('users').findOne({ 
      $or: [
        { firebaseUid: targetUID },
        { email: targetEmail }
      ]
    });
    
    if (userInUsers) {
      console.log('✅ Found in users collection:');
      console.log('   Name:', userInUsers.name);
      console.log('   Email:', userInUsers.email);
      console.log('   Firebase UID:', userInUsers.firebaseUid);
      console.log('   Role:', userInUsers.role);
    } else {
      console.log('❌ Not found in users collection');
    }

    // 2. Check admin_users collection
    console.log('\n📋 Checking admin_users collection...');
    const userInAdminUsers = await db.collection('admin_users').findOne({ 
      $or: [
        { firebaseUid: targetUID },
        { email: targetEmail },
        { emailAddress: targetEmail }
      ]
    });
    
    if (userInAdminUsers) {
      console.log('✅ Found in admin_users collection:');
      console.log('   Name:', userInAdminUsers.name);
      console.log('   Email:', userInAdminUsers.email || userInAdminUsers.emailAddress);
      console.log('   Firebase UID:', userInAdminUsers.firebaseUid);
      console.log('   Role:', userInAdminUsers.role);
    } else {
      console.log('❌ Not found in admin_users collection');
    }

    // 3. Check what collections exist
    console.log('\n📋 Available collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log('   -', col.name);
    });

    // 4. Check if there are any users with similar UIDs or emails
    console.log('\n🔍 Looking for similar users...');
    const similarUsers = await db.collection('users').find({
      $or: [
        { email: { $regex: 'customer123', $options: 'i' } },
        { firebaseUid: { $regex: 'b5aoloVR7x', $options: 'i' } }
      ]
    }).toArray();

    if (similarUsers.length > 0) {
      console.log(`✅ Found ${similarUsers.length} similar users in users collection:`);
      similarUsers.forEach(user => {
        console.log(`   - ${user.email} (UID: ${user.firebaseUid})`);
      });
    }

    const similarAdminUsers = await db.collection('admin_users').find({
      $or: [
        { email: { $regex: 'customer123', $options: 'i' } },
        { emailAddress: { $regex: 'customer123', $options: 'i' } },
        { firebaseUid: { $regex: 'b5aoloVR7x', $options: 'i' } }
      ]
    }).toArray();

    if (similarAdminUsers.length > 0) {
      console.log(`✅ Found ${similarAdminUsers.length} similar users in admin_users collection:`);
      similarAdminUsers.forEach(user => {
        console.log(`   - ${user.email || user.emailAddress} (UID: ${user.firebaseUid})`);
      });
    }

    // 5. Check rosters to see what customer emails exist
    console.log('\n📋 Checking rosters for customer emails...');
    const rosterEmails = await db.collection('rosters').distinct('customerEmail');
    console.log(`Found ${rosterEmails.length} unique customer emails in rosters:`);
    rosterEmails.slice(0, 10).forEach(email => {
      console.log(`   - ${email}`);
    });
    if (rosterEmails.length > 10) {
      console.log(`   ... and ${rosterEmails.length - 10} more`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

checkUserInDB();