// Check drivers collection to find valid driver credentials
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'abra_fleet_management';

async function checkDriversCollection() {
  console.log('🔍 Checking drivers collection...');
  console.log('─'.repeat(80));
  
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Get all drivers
    const drivers = await db.collection('drivers').find({}).toArray();
    
    console.log(`📊 Found ${drivers.length} drivers in collection`);
    console.log('─'.repeat(80));
    
    if (drivers.length === 0) {
      console.log('❌ No drivers found in collection');
      return;
    }
    
    // Display first few drivers with their details
    drivers.slice(0, 5).forEach((driver, index) => {
      console.log(`\n🚗 Driver ${index + 1}:`);
      console.log(`   - ID: ${driver._id}`);
      console.log(`   - Driver ID: ${driver.driverId}`);
      console.log(`   - Name: ${driver.personalInfo?.firstName} ${driver.personalInfo?.lastName}`);
      console.log(`   - Email: ${driver.personalInfo?.email}`);
      console.log(`   - Phone: ${driver.personalInfo?.phone}`);
      console.log(`   - Status: ${driver.status}`);
      console.log(`   - Firebase UID: ${driver.firebaseUid || 'Not set'}`);
      console.log(`   - License: ${driver.license?.licenseNumber || 'Not set'}`);
      console.log(`   - Assigned Vehicle: ${driver.assignedVehicle || 'None'}`);
    });
    
    // Check if any drivers have passwords (they should be in admin_users now)
    console.log('\n🔐 Checking admin_users collection for driver login credentials...');
    const adminUsers = await db.collection('admin_users').find({ role: 'driver' }).toArray();
    
    console.log(`📊 Found ${adminUsers.length} driver accounts in admin_users`);
    
    if (adminUsers.length > 0) {
      console.log('\n👤 Driver Login Accounts:');
      adminUsers.slice(0, 3).forEach((user, index) => {
        console.log(`\n   Driver Account ${index + 1}:`);
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Driver ID: ${user.driverId}`);
        console.log(`   - Firebase UID: ${user.firebaseUid || 'Not set'}`);
        console.log(`   - Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log(`   - Status: ${user.status}`);
      });
      
      // Suggest a test account
      const testDriver = adminUsers.find(user => user.email && user.password);
      if (testDriver) {
        console.log('\n🎯 SUGGESTED TEST ACCOUNT:');
        console.log(`   Email: ${testDriver.email}`);
        console.log(`   Password: Use "password123" or check the user creation script`);
        console.log(`   Driver ID: ${testDriver.driverId}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkDriversCollection();