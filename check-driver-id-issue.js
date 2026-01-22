// check-driver-id-issue.js
// Check what driver ID is being used and if it exists

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet_db';

async function checkDriverId() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    const driverId = '695e5018f9dc949dca499370';
    
    console.log('\n🔍 Checking driver ID:', driverId);
    
    // Check in drivers collection
    console.log('\n1. Checking drivers collection...');
    const driver = await db.collection('drivers').findOne({
      $or: [
        { _id: driverId },
        { driverId: driverId },
        { firebaseUid: driverId }
      ]
    });
    console.log('   Result:', driver ? 'Found' : 'Not found');
    if (driver) {
      console.log('   Driver:', driver.driverId, driver.personalInfo?.name);
    }
    
    // Check in admin_users collection
    console.log('\n2. Checking admin_users collection...');
    const adminUser = await db.collection('admin_users').findOne({
      $or: [
        { _id: driverId },
        { firebaseUid: driverId },
        { driverId: driverId }
      ],
      role: 'driver'
    });
    console.log('   Result:', adminUser ? 'Found' : 'Not found');
    if (adminUser) {
      console.log('   Admin User:', adminUser.driverId, adminUser.name);
    }
    
    // Check in users collection
    console.log('\n3. Checking users collection...');
    const user = await db.collection('users').findOne({
      $or: [
        { _id: driverId },
        { firebaseUid: driverId }
      ],
      role: 'driver'
    });
    console.log('   Result:', user ? 'Found' : 'Not found');
    if (user) {
      console.log('   User:', user.name, user.email);
    }
    
    // Find the test driver
    console.log('\n4. Finding drivertest@abrafleet.com...');
    const testDriver = await db.collection('admin_users').findOne({
      email: 'drivertest@abrafleet.com',
      role: 'driver'
    });
    if (testDriver) {
      console.log('   ✅ Found test driver!');
      console.log('   - _id:', testDriver._id);
      console.log('   - driverId:', testDriver.driverId);
      console.log('   - firebaseUid:', testDriver.firebaseUid);
      console.log('   - name:', testDriver.name);
      console.log('   - email:', testDriver.email);
    } else {
      console.log('   ❌ Test driver not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkDriverId();
