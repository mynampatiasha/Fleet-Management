const { MongoClient } = require('mongodb');

async function checkRajeshAuthStatus() {
  console.log('🔍 Checking Rajesh Kumar Authentication Status\n');

  const mongoUri = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
  
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('abra_fleet');

    // Check admin_users collection for rajesh.kumar@abrafleet.com
    console.log('1️⃣ Checking admin_users collection...');
    const adminUser = await db.collection('admin_users').findOne({
      email: 'rajesh.kumar@abrafleet.com'
    });

    if (adminUser) {
      console.log('✅ Found Rajesh Kumar in admin_users:');
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Firebase UID: ${adminUser.firebaseUid || 'NOT SET'}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Status: ${adminUser.status}`);
      console.log(`   - isActive: ${adminUser.isActive}`);
      console.log(`   - Created: ${adminUser.createdAt}`);
      console.log(`   - Last Active: ${adminUser.lastActive || 'Never'}`);
    } else {
      console.log('❌ Rajesh Kumar NOT found in admin_users collection');
    }

    // Check if there's a user with DRV-100001 as firebaseUid
    console.log('\n2️⃣ Checking for user with firebaseUid=DRV-100001...');
    const driverUser = await db.collection('admin_users').findOne({
      firebaseUid: 'DRV-100001'
    });

    if (driverUser) {
      console.log('✅ Found user with firebaseUid=DRV-100001:');
      console.log(`   - Email: ${driverUser.email}`);
      console.log(`   - Name: ${driverUser.name}`);
      console.log(`   - Role: ${driverUser.role}`);
      console.log(`   - Status: ${driverUser.status}`);
    } else {
      console.log('❌ No user found with firebaseUid=DRV-100001');
    }

    // Check trips collection for DRV-100001
    console.log('\n3️⃣ Checking trips for driverId=DRV-100001...');
    const tripCount = await db.collection('trips').countDocuments({
      driverId: 'DRV-100001'
    });
    console.log(`✅ Found ${tripCount} trips for DRV-100001`);

    // Check if there are any users with rajesh in email
    console.log('\n4️⃣ Searching for any users with "rajesh" in email...');
    const rajeshUsers = await db.collection('admin_users').find({
      email: { $regex: /rajesh/i }
    }).toArray();

    if (rajeshUsers.length > 0) {
      console.log(`✅ Found ${rajeshUsers.length} users with "rajesh" in email:`);
      rajeshUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (UID: ${user.firebaseUid || 'NOT SET'}, Role: ${user.role})`);
      });
    } else {
      console.log('❌ No users found with "rajesh" in email');
    }

    await client.close();

    console.log('\n🎯 SUMMARY:');
    if (!adminUser) {
      console.log('❌ PROBLEM: rajesh.kumar@abrafleet.com is NOT in admin_users collection');
      console.log('💡 SOLUTION: Create the user account in admin_users with proper firebaseUid');
    } else if (!adminUser.firebaseUid) {
      console.log('❌ PROBLEM: rajesh.kumar@abrafleet.com exists but has no firebaseUid');
      console.log('💡 SOLUTION: Update the user with firebaseUid=DRV-100001');
    } else {
      console.log('✅ User exists with proper firebaseUid');
      console.log('❌ PROBLEM: Frontend authentication issue');
      console.log('💡 SOLUTION: Check Firebase Auth and frontend login flow');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRajeshAuthStatus();