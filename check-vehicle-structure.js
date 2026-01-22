const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkVehicleStructure() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('abra_fleet');
    const vehiclesCollection = db.collection('vehicles');
    const driversCollection = db.collection('drivers');
    
    // Get a few sample vehicles to see their structure
    console.log('🚙 === SAMPLE VEHICLE RECORDS ===\n');
    const sampleVehicles = await vehiclesCollection.find().limit(3).toArray();
    
    sampleVehicles.forEach((vehicle, index) => {
      console.log(`\n--- Vehicle ${index + 1} ---`);
      console.log(JSON.stringify(vehicle, null, 2));
    });
    
    // Check specific vehicles we're trying to assign
    console.log('\n\n🔍 === CHECKING TARGET VEHICLES ===\n');
    const targetVehicles = ['KA02CD5678', 'KA07JK1234', 'KA02MN3456'];
    
    for (const vehicleNum of targetVehicles) {
      const vehicle = await vehiclesCollection.findOne({ vehicleNumber: vehicleNum });
      if (vehicle) {
        console.log(`\n✅ Found ${vehicleNum}:`);
        console.log(`   _id: ${vehicle._id}`);
        console.log(`   vehicleNumber: ${vehicle.vehicleNumber}`);
        console.log(`   assignedDriver: ${vehicle.assignedDriver || 'none'}`);
        console.log(`   driverId: ${vehicle.driverId || 'none'}`);
      } else {
        console.log(`\n❌ NOT FOUND: ${vehicleNum}`);
      }
    }
    
    // Check sample drivers
    console.log('\n\n👤 === SAMPLE DRIVER RECORDS ===\n');
    const sampleDrivers = await driversCollection.find({ driverId: { $in: ['DRV-100001', 'DRV-100002'] } }).toArray();
    
    sampleDrivers.forEach((driver) => {
      console.log(`\n--- ${driver.name || driver.driverName} ---`);
      console.log(JSON.stringify(driver, null, 2));
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkVehicleStructure();
