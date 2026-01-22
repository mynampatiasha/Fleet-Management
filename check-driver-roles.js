// check-driver-roles.js - Check driver roles in database
const { MongoClient } = require('mongodb');

async function checkDriverRoles() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet');
    
    // Check admin_users collection for drivers
    console.log('\n🔍 Checking admin_users collection for drivers...');
    const adminDrivers = await db.collection('admin_users').find({ role: 'driver' }).toArray();
    console.log(`Found ${adminDrivers.length} drivers in admin_users:`);
    adminDrivers.forEach(driver => {
      console.log(`  - ${driver.email} | Role: ${driver.role} | Status: ${driver.status} | Firebase UID: ${driver.firebaseUid}`);
    });
    
    // Check drivers collection
    console.log('\n🔍 Checking drivers collection...');
    const driversCollection = await db.collection('drivers').find({}).toArray();
    console.log(`Found ${driversCollection.length} drivers in drivers collection:`);
    driversCollection.forEach(driver => {
      console.log(`  - ${driver.email} | Name: ${driver.name} | Phone: ${driver.phone} | Firebase UID: ${driver.firebaseUid}`);
    });
    
    // Check for any users with driver-related roles
    console.log('\n🔍 Checking for any driver-related roles...');
    const driverRoles = await db.collection('admin_users').find({ 
      role: { $regex: /driver/i } 
    }).toArray();
    console.log(`Found ${driverRoles.length} users with driver-related roles:`);
    driverRoles.forEach(user => {
      console.log(`  - ${user.email} | Role: ${user.role} | Status: ${user.status}`);
    });
    
    // Check all roles in admin_users
    console.log('\n🔍 All roles in admin_users collection:');
    const allRoles = await db.collection('admin_users').distinct('role');
    console.log('Roles found:', allRoles);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkDriverRoles();