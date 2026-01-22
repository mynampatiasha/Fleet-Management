const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function checkDriversInDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    console.log('\n' + '='.repeat(80));
    console.log('🚗 DRIVER DATABASE CHECK');
    console.log('='.repeat(80));
    
    // 1. Count total drivers
    const totalDrivers = await db.collection('drivers').countDocuments();
    console.log(`\n📊 TOTAL DRIVERS: ${totalDrivers}`);
    
    if (totalDrivers === 0) {
      console.log('❌ NO DRIVERS FOUND IN DATABASE!');
      return;
    }
    
    // 2. Check driver structure and fields
    console.log('\n📋 DRIVER STRUCTURE ANALYSIS:');
    const sampleDriver = await db.collection('drivers').findOne();
    
    if (sampleDriver) {
      console.log('✅ Sample driver found:');
      console.log(`   _id: ${sampleDriver._id}`);
      console.log(`   driverId: ${sampleDriver.driverId || 'NOT SET'}`);
      console.log(`   name: ${sampleDriver.name || 'NOT SET'}`);
      console.log(`   email: ${sampleDriver.email || 'NOT SET'}`);
      console.log(`   phone: ${sampleDriver.phone || 'NOT SET'}`);
      console.log(`   firebaseUid: ${sampleDriver.firebaseUid || 'NOT SET'}`);
      
      // Check if personalInfo structure exists
      if (sampleDriver.personalInfo) {
        console.log('   personalInfo structure:');
        console.log(`     firstName: ${sampleDriver.personalInfo.firstName || 'NOT SET'}`);
        console.log(`     lastName: ${sampleDriver.personalInfo.lastName || 'NOT SET'}`);
        console.log(`     phone: ${sampleDriver.personalInfo.phone || 'NOT SET'}`);
      }
    }
    
    // 3. Check drivers with different field combinations
    console.log('\n🔍 FIELD ANALYSIS:');
    
    const withDriverId = await db.collection('drivers').countDocuments({ driverId: { $exists: true, $ne: null, $ne: '' } });
    const withName = await db.collection('drivers').countDocuments({ name: { $exists: true, $ne: null, $ne: '' } });
    const withEmail = await db.collection('drivers').countDocuments({ email: { $exists: true, $ne: null, $ne: '' } });
    const withPhone = await db.collection('drivers').countDocuments({ phone: { $exists: true, $ne: null, $ne: '' } });
    const withFirebaseUid = await db.collection('drivers').countDocuments({ firebaseUid: { $exists: true, $ne: null, $ne: '' } });
    const withPersonalInfo = await db.collection('drivers').countDocuments({ personalInfo: { $exists: true } });
    
    console.log(`   With driverId: ${withDriverId}/${totalDrivers}`);
    console.log(`   With name: ${withName}/${totalDrivers}`);
    console.log(`   With email: ${withEmail}/${totalDrivers}`);
    console.log(`   With phone: ${withPhone}/${totalDrivers}`);
    console.log(`   With firebaseUid: ${withFirebaseUid}/${totalDrivers}`);
    console.log(`   With personalInfo: ${withPersonalInfo}/${totalDrivers}`);
    
    // 4. List all drivers with key info
    console.log('\n👥 ALL DRIVERS LIST:');
    const allDrivers = await db.collection('drivers').find({}).toArray();
    
    allDrivers.forEach((driver, index) => {
      console.log(`\n${index + 1}. Driver:`);
      console.log(`   _id: ${driver._id}`);
      console.log(`   driverId: ${driver.driverId || 'NOT SET'}`);
      
      // Get name from different possible fields
      let driverName = 'NOT SET';
      if (driver.name) {
        driverName = driver.name;
      } else if (driver.personalInfo && (driver.personalInfo.firstName || driver.personalInfo.lastName)) {
        const firstName = driver.personalInfo.firstName || '';
        const lastName = driver.personalInfo.lastName || '';
        driverName = `${firstName} ${lastName}`.trim();
      }
      console.log(`   name: ${driverName}`);
      
      // Get phone from different possible fields
      let driverPhone = 'NOT SET';
      if (driver.phone) {
        driverPhone = driver.phone;
      } else if (driver.personalInfo && driver.personalInfo.phone) {
        driverPhone = driver.personalInfo.phone;
      }
      console.log(`   phone: ${driverPhone}`);
      
      console.log(`   email: ${driver.email || 'NOT SET'}`);
      console.log(`   firebaseUid: ${driver.firebaseUid || 'NOT SET'}`);
      console.log(`   status: ${driver.status || 'NOT SET'}`);
      console.log(`   createdAt: ${driver.createdAt || 'NOT SET'}`);
    });
    
    // 5. Check for specific driver IDs or names (you can modify this)
    console.log('\n🔎 SPECIFIC DRIVER SEARCH:');
    
    // Search for common driver IDs or names
    const searchTerms = ['DRV-', 'driver', 'test', 'suresh', 'patel'];
    
    for (const term of searchTerms) {
      const foundDrivers = await db.collection('drivers').find({
        $or: [
          { driverId: { $regex: term, $options: 'i' } },
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { 'personalInfo.firstName': { $regex: term, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: term, $options: 'i' } }
        ]
      }).toArray();
      
      if (foundDrivers.length > 0) {
        console.log(`\n   Found ${foundDrivers.length} driver(s) matching "${term}":`);
        foundDrivers.forEach(driver => {
          const name = driver.name || `${driver.personalInfo?.firstName || ''} ${driver.personalInfo?.lastName || ''}`.trim() || 'Unknown';
          console.log(`     - ${driver.driverId || driver._id}: ${name}`);
        });
      }
    }
    
    // 6. Check drivers assigned to vehicles
    console.log('\n🚗 VEHICLE-DRIVER ASSIGNMENTS:');
    const vehiclesWithDrivers = await db.collection('vehicles').find({
      $or: [
        { driverId: { $exists: true, $ne: null, $ne: '' } },
        { assignedDriver: { $exists: true, $ne: null } }
      ]
    }).toArray();
    
    console.log(`   Vehicles with assigned drivers: ${vehiclesWithDrivers.length}`);
    
    for (const vehicle of vehiclesWithDrivers) {
      console.log(`\n   Vehicle: ${vehicle.registrationNumber || vehicle.vehicleNumber || vehicle._id}`);
      
      let driverId = null;
      if (vehicle.driverId) {
        driverId = vehicle.driverId;
      } else if (vehicle.assignedDriver) {
        if (typeof vehicle.assignedDriver === 'string') {
          driverId = vehicle.assignedDriver;
        } else if (vehicle.assignedDriver.driverId) {
          driverId = vehicle.assignedDriver.driverId;
        }
      }
      
      if (driverId) {
        // Check if this driver exists in drivers collection
        const driverExists = await db.collection('drivers').findOne({ driverId: driverId });
        if (driverExists) {
          const name = driverExists.name || `${driverExists.personalInfo?.firstName || ''} ${driverExists.personalInfo?.lastName || ''}`.trim() || 'Unknown';
          console.log(`     ✅ Driver exists: ${driverId} (${name})`);
        } else {
          console.log(`     ❌ Driver NOT found: ${driverId}`);
        }
      }
    }
    
    // 7. Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Total drivers in database: ${totalDrivers}`);
    console.log(`Drivers with driverId: ${withDriverId}`);
    console.log(`Drivers with name: ${withName}`);
    console.log(`Drivers with phone: ${withPhone}`);
    console.log(`Vehicles with assigned drivers: ${vehiclesWithDrivers.length}`);
    
    if (totalDrivers > 0) {
      console.log('\n✅ DRIVERS EXIST IN DATABASE');
    } else {
      console.log('\n❌ NO DRIVERS FOUND - DATABASE IS EMPTY');
    }
    
  } catch (error) {
    console.error('❌ Error checking drivers:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkDriversInDatabase();