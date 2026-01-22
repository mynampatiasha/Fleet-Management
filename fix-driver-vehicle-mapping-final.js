const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function fixDriverVehicleMappingFinal() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('abra_fleet');
    const driversCollection = db.collection('drivers');
    const vehiclesCollection = db.collection('vehicles');
    
    console.log('🔧 === FIXING DRIVER-VEHICLE MAPPING (FINAL) ===\n');
    
    // Step 1: Remove Ramu from ALL vehicles
    console.log('Step 1: Removing Ramu from all vehicles...');
    const ramuId = '696e5018f9dc949dca499370';
    
    // Clear all driver assignments from vehicles where Ramu is assigned
    const removeRamuResult = await vehiclesCollection.updateMany(
      {
        $or: [
          { assignedDriverId: ramuId },
          { driverId: ramuId },
          { driver: ramuId },
          { assignedDriver: ramuId }
        ]
      },
      {
        $unset: {
          assignedDriver: '',
          assignedDriverId: '',
          driverId: '',
          driver: '',
          assignedDriverName: '',
          assignedDriverEmail: '',
          driverName: ''
        }
      }
    );
    console.log(`  ✅ Cleaned ${removeRamuResult.modifiedCount} vehicles\n`);
    
    // Step 2: Establish proper 1-to-1 relationships using registrationNumber
    console.log('Step 2: Establishing proper driver-vehicle relationships...\n');
    
    const driverVehiclePairs = [
      { driverId: 'DRV-100001', registrationNumber: 'KA02CD5678', driverName: 'Rajesh Kumar', email: 'rajesh.kumar@abrafleet.com' },
      { driverId: 'DRV-100002', registrationNumber: 'KA07JK1234', driverName: 'Amit Singh', email: 'amit.singh@abrafleet.com' },
      { driverId: 'DRV-100012', registrationNumber: 'KA02MN3456', driverName: 'Deepak Joshi', email: 'deepak.joshi@abrafleet.com' },
      { driverId: 'DRV-100013', registrationNumber: 'KA08LM5678', driverName: 'Naveen Menon', email: 'naveen.menon@abrafleet.com' },
      { driverId: 'DRV-100014', registrationNumber: 'KA09NO9012', driverName: 'Ravi Desai', email: 'ravi.desai@abrafleet.com' },
      { driverId: 'DRV-100015', registrationNumber: 'KA10PQ3456', driverName: 'Mahesh Bhat', email: 'mahesh.bhat@abrafleet.com' },
      { driverId: 'DRV-100016', registrationNumber: 'KA11RS7890', driverName: 'Ganesh Kulkarni', email: 'ganesh.kulkarni@abrafleet.com' },
      { driverId: 'DRV-100017', registrationNumber: 'KA12TU1234', driverName: 'Ashok Pillai', email: 'ashok.pillai@abrafleet.com' },
      { driverId: 'DRV-100018', registrationNumber: 'KA13VW5678', driverName: 'Dinesh Shetty', email: 'dinesh.shetty@abrafleet.com' },
      { driverId: 'DRV-100019', registrationNumber: 'KA14XY9012', driverName: 'Yogesh Rathod', email: 'yogesh.rathod@abrafleet.com' },
      { driverId: 'DRV-100020', registrationNumber: 'KA15ZA3456', driverName: 'Mohan Kamath', email: 'mohan.kamath@abrafleet.com' }
    ];
    
    let relationshipsFixed = 0;
    
    for (const pair of driverVehiclePairs) {
      // Update driver record - set assignedVehicle and vehicleNumber
      const driverUpdate = await driversCollection.updateOne(
        { driverId: pair.driverId },
        { 
          $set: { 
            assignedVehicle: pair.registrationNumber,
            vehicleNumber: pair.registrationNumber
          } 
        }
      );
      
      // Update vehicle record - use registrationNumber to find it
      const vehicleUpdate = await vehiclesCollection.updateOne(
        { registrationNumber: pair.registrationNumber },
        { 
          $set: { 
            assignedDriver: pair.driverId,
            assignedDriverId: pair.driverId,
            driverId: pair.driverId,
            assignedDriverName: pair.driverName,
            assignedDriverEmail: pair.email,
            driverName: pair.driverName
          } 
        }
      );
      
      if (driverUpdate.matchedCount > 0 && vehicleUpdate.matchedCount > 0) {
        console.log(`  ✅ ${pair.driverName} ↔ ${pair.registrationNumber}`);
        relationshipsFixed++;
      } else if (driverUpdate.matchedCount === 0) {
        console.log(`  ❌ Driver not found: ${pair.driverName} (${pair.driverId})`);
      } else if (vehicleUpdate.matchedCount === 0) {
        console.log(`  ❌ Vehicle not found: ${pair.registrationNumber}`);
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
        { assignedDriverId: { $exists: true, $ne: null, $ne: '' } },
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
      const vehicle = await vehiclesCollection.findOne({ registrationNumber: pair.registrationNumber });
      
      if (driver && vehicle) {
        const driverName = driver.name || driver.personalInfo?.name || driver.driverName;
        console.log(`  ${driverName} (${pair.driverId})`);
        console.log(`    ↔ ${pair.registrationNumber} (${vehicle.type})`);
        console.log(`    Driver has: ${driver.assignedVehicle || 'none'}`);
        console.log(`    Vehicle has: ${vehicle.assignedDriver || vehicle.assignedDriverId || 'none'}`);
        const isMatched = (driver.assignedVehicle === pair.registrationNumber || driver.vehicleNumber === pair.registrationNumber) && 
                         (vehicle.assignedDriver === pair.driverId || vehicle.assignedDriverId === pair.driverId);
        console.log(`    Status: ${isMatched ? '✅ Properly mapped' : '⚠️ Mismatch'}\n`);
      }
    }
    
    // Check if Ramu still has vehicles
    const ramuVehicles = await vehiclesCollection.countDocuments({
      $or: [
        { assignedDriver: ramuId },
        { assignedDriverId: ramuId },
        { driverId: ramuId },
        { driver: ramuId }
      ]
    });
    
    console.log('\n🔍 === RAMU STATUS CHECK ===\n');
    console.log(`Vehicles still assigned to Ramu: ${ramuVehicles}`);
    
    console.log('\n✅ === CLEANUP COMPLETE ===\n');
    console.log('Summary:');
    console.log(`  - Removed Ramu from ${removeRamuResult.modifiedCount} vehicles`);
    console.log(`  - Established ${relationshipsFixed} proper driver-vehicle relationships`);
    console.log(`  - Total drivers with vehicles: ${driversWithVehicles}`);
    console.log(`  - Total vehicles with drivers: ${vehiclesWithDrivers}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

fixDriverVehicleMappingFinal();
