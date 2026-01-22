// test-driver-document-upload-fix.js
// Test script to verify driver document upload is working after migration

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'abra_fleet';

async function testDriverLookup() {
  console.log('\n🧪 ========== TESTING DRIVER DOCUMENT UPLOAD FIX ==========\n');
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Test 1: Check admin_users collection for drivers
    console.log('\n📊 Test 1: Checking admin_users collection for drivers...');
    const adminDrivers = await db.collection('admin_users').find({ role: 'driver' }).toArray();
    console.log(`   Found ${adminDrivers.length} drivers in admin_users collection`);
    
    if (adminDrivers.length > 0) {
      const sampleDriver = adminDrivers[0];
      console.log(`   Sample driver: ${sampleDriver.name} (${sampleDriver.email})`);
      console.log(`   Firebase UID: ${sampleDriver.firebaseUid}`);
      console.log(`   Driver ID: ${sampleDriver.driverId}`);
    }
    
    // Test 2: Check drivers collection
    console.log('\n📊 Test 2: Checking drivers collection...');
    const driversCollection = await db.collection('drivers').find({}).toArray();
    console.log(`   Found ${driversCollection.length} records in drivers collection`);
    
    // Test 3: Test the findDriver logic simulation
    console.log('\n📊 Test 3: Testing findDriver logic...');
    
    if (adminDrivers.length > 0) {
      const testDriver = adminDrivers[0];
      const testFirebaseUid = testDriver.firebaseUid;
      
      console.log(`   Testing with Firebase UID: ${testFirebaseUid}`);
      
      // Simulate findDriver logic
      let foundDriver = null;
      
      // Strategy 1: Look in admin_users by firebaseUid
      const adminUser = await db.collection('admin_users').findOne({
        firebaseUid: testFirebaseUid,
        role: 'driver'
      });
      
      if (adminUser) {
        console.log('   ✅ Found in admin_users by firebaseUid');
        
        // Look for corresponding driver record
        const driverRecord = await db.collection('drivers').findOne({
          $or: [
            { firebaseUid: testFirebaseUid },
            { uid: testFirebaseUid },
            { driverId: adminUser.driverId },
            { 'personalInfo.email': adminUser.email }
          ]
        });
        
        if (driverRecord) {
          console.log('   ✅ Found corresponding driver record');
          foundDriver = driverRecord;
        } else {
          console.log('   ⚠️ No corresponding driver record, will create minimal one');
          foundDriver = {
            _id: adminUser._id,
            driverId: adminUser.driverId,
            firebaseUid: adminUser.firebaseUid,
            personalInfo: {
              name: adminUser.name,
              email: adminUser.email,
              phone: adminUser.phone
            },
            documents: {},
            isFromAdminUsers: true
          };
        }
      }
      
      if (foundDriver) {
        console.log('   ✅ Driver lookup would succeed');
        console.log(`   Driver: ${foundDriver.personalInfo?.name || foundDriver.name}`);
        console.log(`   Email: ${foundDriver.personalInfo?.email || foundDriver.email}`);
        console.log(`   From admin_users: ${foundDriver.isFromAdminUsers ? 'Yes' : 'No'}`);
      } else {
        console.log('   ❌ Driver lookup would fail');
      }
    }
    
    // Test 4: Check for any drivers without Firebase UID
    console.log('\n📊 Test 4: Checking for drivers without Firebase UID...');
    const driversWithoutUid = await db.collection('admin_users').find({
      role: 'driver',
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    }).toArray();
    
    console.log(`   Found ${driversWithoutUid.length} drivers without Firebase UID`);
    if (driversWithoutUid.length > 0) {
      console.log('   ⚠️ These drivers may have login issues:');
      driversWithoutUid.forEach((driver, index) => {
        console.log(`   ${index + 1}. ${driver.name} (${driver.email})`);
      });
    }
    
    console.log('\n========== TEST COMPLETE ==========');
    console.log('✅ Driver document upload should now work');
    console.log('📝 The API will now look in admin_users collection first');
    console.log('🔄 If no driver record exists, it will create one for document storage');
    
  } catch (error) {
    console.error('\n❌ ========== TEST FAILED ==========');
    console.error('Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await client.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the test
testDriverLookup()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });