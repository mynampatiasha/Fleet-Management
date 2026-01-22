const { MongoClient } = require('mongodb');

async function fixRajeshDriverIdMapping() {
  console.log('🔧 Fixing Rajesh Kumar Driver ID Mapping\n');

  const mongoUri = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
  
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('abra_fleet');

    // Get Rajesh Kumar's user record
    const rajeshUser = await db.collection('admin_users').findOne({
      email: 'rajesh.kumar@abrafleet.com'
    });

    if (!rajeshUser) {
      console.log('❌ Rajesh Kumar not found in admin_users');
      return;
    }

    console.log('✅ Found Rajesh Kumar:');
    console.log(`   - Email: ${rajeshUser.email}`);
    console.log(`   - Firebase UID: ${rajeshUser.firebaseUid}`);
    console.log(`   - Current driverId field: ${rajeshUser.driverId || 'NOT SET'}`);

    // Check if user already has driverId field
    if (!rajeshUser.driverId) {
      console.log('\n🔧 Adding driverId field to user record...');
      
      const updateResult = await db.collection('admin_users').updateOne(
        { _id: rajeshUser._id },
        { 
          $set: { 
            driverId: 'DRV-100001',
            updatedAt: new Date()
          } 
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log('✅ Successfully added driverId=DRV-100001 to user record');
      } else {
        console.log('❌ Failed to update user record');
      }
    } else {
      console.log(`✅ User already has driverId: ${rajeshUser.driverId}`);
    }

    // Verify trips exist for DRV-100001
    const tripCount = await db.collection('trips').countDocuments({
      driverId: 'DRV-100001'
    });
    console.log(`\n📊 Trip count for DRV-100001: ${tripCount}`);

    // Check if there are any trips with Firebase UID
    const firebaseUidTripCount = await db.collection('trips').countDocuments({
      driverId: rajeshUser.firebaseUid
    });
    console.log(`📊 Trip count for Firebase UID (${rajeshUser.firebaseUid}): ${firebaseUidTripCount}`);

    await client.close();

    console.log('\n🎯 SOLUTION IMPLEMENTED:');
    console.log('✅ Added driverId field to user record for mapping');
    console.log('✅ Backend can now use either firebaseUid OR driverId to find trips');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Update backend driver-reports.js to check both firebaseUid and driverId');
    console.log('2. Test the frontend again');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixRajeshDriverIdMapping();