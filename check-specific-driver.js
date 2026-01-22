const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function checkSpecificDriver(searchTerm) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    console.log('\n' + '='.repeat(60));
    console.log(`🔍 SEARCHING FOR DRIVER: "${searchTerm}"`);
    console.log('='.repeat(60));
    
    // Search in multiple fields
    const drivers = await db.collection('drivers').find({
      $or: [
        { driverId: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { 'personalInfo.firstName': { $regex: searchTerm, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: searchTerm, $options: 'i' } },
        { 'personalInfo.phone': { $regex: searchTerm, $options: 'i' } }
      ]
    }).toArray();
    
    if (drivers.length === 0) {
      console.log(`❌ NO DRIVERS FOUND matching "${searchTerm}"`);
      
      // Show total count for reference
      const totalDrivers = await db.collection('drivers').countDocuments();
      console.log(`\n📊 Total drivers in database: ${totalDrivers}`);
      
      if (totalDrivers > 0) {
        console.log('\n💡 Try searching for:');
        const sampleDrivers = await db.collection('drivers').find({}).limit(3).toArray();
        sampleDrivers.forEach(driver => {
          const name = driver.name || `${driver.personalInfo?.firstName || ''} ${driver.personalInfo?.lastName || ''}`.trim() || 'Unknown';
          console.log(`   - "${driver.driverId || 'No ID'}" or "${name}"`);
        });
      }
      
      return;
    }
    
    console.log(`✅ FOUND ${drivers.length} DRIVER(S):`);
    
    drivers.forEach((driver, index) => {
      console.log(`\n${index + 1}. Driver Details:`);
      console.log(`   _id: ${driver._id}`);
      console.log(`   driverId: ${driver.driverId || 'NOT SET'}`);
      
      // Get name
      let driverName = 'NOT SET';
      if (driver.name) {
        driverName = driver.name;
      } else if (driver.personalInfo && (driver.personalInfo.firstName || driver.personalInfo.lastName)) {
        const firstName = driver.personalInfo.firstName || '';
        const lastName = driver.personalInfo.lastName || '';
        driverName = `${firstName} ${lastName}`.trim();
      }
      console.log(`   name: ${driverName}`);
      
      // Get phone
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
      
      // Check if this driver is assigned to any vehicle
      console.log(`   🚗 Vehicle assignments:`);
    });
    
    // Check vehicle assignments for found drivers
    for (const driver of drivers) {
      const assignedVehicles = await db.collection('vehicles').find({
        $or: [
          { driverId: driver.driverId },
          { 'assignedDriver.driverId': driver.driverId },
          { assignedDriver: driver.driverId }
        ]
      }).toArray();
      
      if (assignedVehicles.length > 0) {
        console.log(`\n   🚗 ${driver.driverId || driver._id} is assigned to ${assignedVehicles.length} vehicle(s):`);
        assignedVehicles.forEach(vehicle => {
          console.log(`     - ${vehicle.registrationNumber || vehicle.vehicleNumber || vehicle._id}`);
        });
      } else {
        console.log(`\n   ⚠️  ${driver.driverId || driver._id} is NOT assigned to any vehicle`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking driver:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Get search term from command line argument
const searchTerm = process.argv[2];

if (!searchTerm) {
  console.log('❌ Please provide a search term');
  console.log('Usage: node check-specific-driver.js "search_term"');
  console.log('Examples:');
  console.log('  node check-specific-driver.js "DRV-123"');
  console.log('  node check-specific-driver.js "suresh"');
  console.log('  node check-specific-driver.js "9876543211"');
  process.exit(1);
}

// Run the check
checkSpecificDriver(searchTerm);