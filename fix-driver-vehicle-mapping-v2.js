const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function fixDriverVehicleMappingV2() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('abra_fleet');
    const driversCollection = db.collection('drivers');
    const vehiclesCollection = db.collection('vehicles');
    
    console.log('🔧 === FIXING DRIVER-VEHICLE MAPPING (V2) ===\n');
    
    // Step 1: Remove Ramu from ALL vehicles (he's assigned to all 33!)
    console.log('Step 1: Removing Ramu from all vehicles...');
    const ramuId = '696e5018f9dc949dca499370';
    
    const removeRamuResult = await vehiclesCollection.updateMany(
      {},
      {
        $pull: {
          assignedDrivers: ramuId
        },
        $unset: {
          assignedDriver: '',
          driverId: '',
          driver: ''
        }
      }
    );
    console.log(`  ✅ Updated ${removeRamuResult.modifiedCount} vehicles\n`);
    
    // Also remove vehicle assignments from Ramu's driver record
    await driversCollection.updateOne(
      { _id: ramuId },
      {
        $unset: {
          assignedVehicle: '',
          vehicleNumber: '',
          vehicleId: '',
          vehicles: ''
        }
      }
    );
    console.log(`  ✅ Cleaned up Ramu's driver record\n`);
    
    // Step 2: Establish proper 1-to-1 relationships
    console.log('Step 2: Establishing proper driver-vehicle relationships...\n');
    
    const driverVehiclePairs = [
      { driverId: 'DRV-100001', vehicleNumber: 'KA02CD5678', driverName: 'Rajesh Kumar' },
      { driverId: 'DRV-100002', vehicleNumber: 'KA07JK1234', driverName: 'Amit Singh' },
      { driverId: 'DRV-100012', vehicleNumber: 'KA02MN3456', driverName: 'Deepak Joshi' },
      { driverId: 'DRV-100013', vehicleNumber: 'KA08LM5678', driverName: 'Naveen Menon' },
      { driverId: 'DRV-100014', vehicleNumber: 'KA09NO9012', driverName: 'Ravi Desai' },
      { driverId: 'DRV-100015', vehicleNumber: 'KA10PQ3456', driverName: 'Mahesh Bhat' },
      { driverId: 'DRV-100016', vehicleNumber: 'KA11RS7890', driverName: 'Ganesh Kulkarni' },
      { driverId: 'DRV-100017', vehicleNumber: 'KA12TU1234', driverName: 'Ashok Pillai' },
      { driverId: 'DRV-100018', vehicleNumber: 'KA13VW5678', driverName: 'Dinesh Shetty' },
      { driverId: 'DRV-100019', vehicleNumber: 'KA14XY9012', driverName: 'Yogesh Rathod' },
      { driverId: 'DRV-100020', vehicleNumber: 'KA15ZA3456', driverName: 'Mohan Kamath' }
    ];
    
    let relationshipsFixed = 0;
    
    for (const pair of driverVehiclePairs) {
      // Update driver record
      const driverUpdate = await driversCollection.updateOne(
        { driverId: pair.driverId },
        { 
          $set: { 
            assignedVehicle: pair.vehicleNumber,
            vehicleNumber: pair.vehicleNumber
          } 
        }
      );
      
      // Update vehicle record - find by vehicleNumber field
      const vehicleUpdate = await vehiclesCollection.updateOne(
        { vehicleNumber: pair.vehicleNumber },
        { 
          $set: { 
            assignedDriver: pair.driverId,
            driverId: pair.driverId,
            driverName: pair.driverName
          } 
        }
      );
      
      if (driverUpdate.modifiedCount > 0 && vehicleUpdate.modifiedCount > 0) {
        console.log(`  ✅ ${pair.driverName} ↔ ${pair.vehicleNumber}`);
        relationshipsFixed++;
      } else {
        console.log(`  ⚠️  ${pair.driverName} ↔ ${pair.vehicleNumber} (partial update)`);
      }
    }
    
    console.log(`\n  ✅ Established ${relationshipsFixed} driver-vehicle relationships\n`);
    
    // Step 3: Verify the fixes
    console.log('Step 3: Verifying fixes...\n');
    
    const driversWithVehicles = await driversCollection.countDocuments({
      $or: [
        { assignedVehicle: { $exists: true, $ne: null, $ne: '' } },
        { vehicleNumber: { $exists: true, $ne: null, $ne: '' } }
      ]
    });
    
    const vehiclesWithDrivers = await vehiclesCollection.countDocuments({
      $or: [
        { assignedDriver: { $exists: true, $ne: null, $ne: '' } },
        { driverId: { $exists: true, $ne: null, $ne: '' } }
      ]
    });
    
    console.log('📊 === VERIFICATION RESULTS ===\n');
    console.log(`✅ Drivers with assigned vehicles: ${driversWithVehicles}`);
    console.log(`✅ Vehicles with assigned drivers: ${vehiclesWithDrivers}`);
    
    // Show sample mappings
    console.log('\n📋 Sample Driver-Vehicle Mappings:\n');
    for (let i = 0; i < Math.min(5, driverVehiclePairs.length); i++) {
      const pair = driverVehiclePairs[i];
      const driver = await driversCollection.findOne({ driverId: pair.driverId });
      const vehicle = await vehiclesCollection.findOne({ vehicleNumber: pair.vehicleNumber });
      
      if (driver && vehicle) {
        console.log(`  ${driver.name || driver.driverName} (${pair.driverId})`);
        console.log(`    ↔ ${pair.vehicleNumber} (${vehicle.vehicleType || vehicle.type})`);
        console.log(`    Driver has: ${driver.assignedVehicle || 'none'}`);
        console.log(`    Vehicle has: ${vehicle.assignedDriver || 'none'}`);
        console.log(`    Status: ${driver.assignedVehicle === pair.vehicleNumber && vehicle.assignedDriver === pair.driverId ? '✅ Properly mapped' : '⚠️ Mismatch'}\n`);
      }
    }
    
    // Check if Ramu still has vehicles
    const ramuDriver = await driversCollection.findOne({ _id: ramuId });
    const ramuVehicles = await vehiclesCollection.countDocuments({
      $or: [
        { assignedDriver: ramuId },
        { driverId: ramuId },
        { driver: ramuId }
      ]
    });
    
    console.log('\n🔍 === RAMU STATUS CHECK ===\n');
    console.log(`Ramu's assigned vehicle: ${ramuDriver?.assignedVehicle || 'None'}`);
    console.log(`Vehicles still assigned to Ramu: ${ramuVehicles}`);
    
    console.log('\n✅ === CLEANUP COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

fixDriverVehicleMappingV2();
