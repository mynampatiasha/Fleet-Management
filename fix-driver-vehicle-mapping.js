const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function fixDriverVehicleMapping() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('abra_fleet');
    const driversCollection = db.collection('drivers');
    const vehiclesCollection = db.collection('vehicles');
    
    console.log('🔧 === FIXING DRIVER-VEHICLE MAPPING ===\n');
    
    // Step 1: Remove the problematic driver (Ramu) who is assigned to all vehicles
    console.log('Step 1: Fixing driver "Ramu" (696e5018f9dc949dca499370)...');
    const ramuId = '696e5018f9dc949dca499370';
    
    // Remove Ramu from all vehicle assignments
    const removeRamuResult = await vehiclesCollection.updateMany(
      {
        $or: [
          { assignedDriver: ramuId },
          { driverId: ramuId },
          { driver: ramuId }
        ]
      },
      {
        $unset: {
          assignedDriver: '',
          driverId: '',
          driver: ''
        }
      }
    );
    console.log(`  ✅ Removed Ramu from ${removeRamuResult.modifiedCount} vehicles\n`);
    
    // Step 2: Fix vehicle capacity data structure (convert [object Object] to proper numbers)
    console.log('Step 2: Fixing vehicle capacity data...');
    const vehicles = await vehiclesCollection.find().toArray();
    let capacityFixed = 0;
    
    for (const vehicle of vehicles) {
      if (vehicle.capacity && typeof vehicle.capacity === 'object' && !Array.isArray(vehicle.capacity)) {
        // Extract actual capacity value
        let actualCapacity = vehicle.capacity.capacity || vehicle.capacity.seatCapacity || 
                            vehicle.capacity.seats || vehicle.capacity.value || 4;
        
        await vehiclesCollection.updateOne(
          { _id: vehicle._id },
          { $set: { capacity: parseInt(actualCapacity) } }
        );
        capacityFixed++;
      }
    }
    console.log(`  ✅ Fixed capacity for ${capacityFixed} vehicles\n`);
    
    // Step 3: Establish proper 1-to-1 driver-vehicle relationships
    console.log('Step 3: Establishing proper driver-vehicle relationships...');
    
    // Get all drivers with their intended vehicles
    const driverVehiclePairs = [
      { driverId: 'DRV-100001', vehicleNumber: 'KA02CD5678' },
      { driverId: 'DRV-100002', vehicleNumber: 'KA07JK1234' },
      { driverId: 'DRV-100012', vehicleNumber: 'KA02MN3456' },
      { driverId: 'DRV-100013', vehicleNumber: 'KA08LM5678' },
      { driverId: 'DRV-100014', vehicleNumber: 'KA09NO9012' },
      { driverId: 'DRV-100015', vehicleNumber: 'KA10PQ3456' },
      { driverId: 'DRV-100016', vehicleNumber: 'KA11RS7890' },
      { driverId: 'DRV-100017', vehicleNumber: 'KA12TU1234' },
      { driverId: 'DRV-100018', vehicleNumber: 'KA13VW5678' },
      { driverId: 'DRV-100019', vehicleNumber: 'KA14XY9012' },
      { driverId: 'DRV-100020', vehicleNumber: 'KA15ZA3456' }
    ];
    
    let relationshipsFixed = 0;
    
    for (const pair of driverVehiclePairs) {
      // Update driver record
      await driversCollection.updateOne(
        { driverId: pair.driverId },
        { 
          $set: { 
            assignedVehicle: pair.vehicleNumber,
            vehicleNumber: pair.vehicleNumber
          } 
        }
      );
      
      // Update vehicle record
      await vehiclesCollection.updateOne(
        { vehicleNumber: pair.vehicleNumber },
        { 
          $set: { 
            assignedDriver: pair.driverId,
            driverId: pair.driverId
          } 
        }
      );
      
      relationshipsFixed++;
    }
    console.log(`  ✅ Established ${relationshipsFixed} driver-vehicle relationships\n`);
    
    // Step 4: Clean up drivers without vehicles
    console.log('Step 4: Cleaning up unassigned drivers...');
    const unassignedDrivers = await driversCollection.find({
      driverId: { 
        $nin: driverVehiclePairs.map(p => p.driverId)
      }
    }).toArray();
    
    for (const driver of unassignedDrivers) {
      await driversCollection.updateOne(
        { _id: driver._id },
        { 
          $unset: { 
            assignedVehicle: '',
            vehicleNumber: '',
            vehicleId: ''
          } 
        }
      );
    }
    console.log(`  ✅ Cleaned up ${unassignedDrivers.length} unassigned drivers\n`);
    
    // Step 5: Clean up vehicles without drivers
    console.log('Step 5: Cleaning up unassigned vehicles...');
    const assignedVehicleNumbers = driverVehiclePairs.map(p => p.vehicleNumber);
    const unassignedVehicles = await vehiclesCollection.find({
      vehicleNumber: { $nin: assignedVehicleNumbers }
    }).toArray();
    
    for (const vehicle of unassignedVehicles) {
      await vehiclesCollection.updateOne(
        { _id: vehicle._id },
        { 
          $unset: { 
            assignedDriver: '',
            driverId: '',
            driver: ''
          } 
        }
      );
    }
    console.log(`  ✅ Cleaned up ${unassignedVehicles.length} unassigned vehicles\n`);
    
    // Step 6: Verify the fixes
    console.log('Step 6: Verifying fixes...\n');
    
    const driversWithVehicles = await driversCollection.countDocuments({
      $or: [
        { assignedVehicle: { $exists: true, $ne: null } },
        { vehicleNumber: { $exists: true, $ne: null } }
      ]
    });
    
    const vehiclesWithDrivers = await vehiclesCollection.countDocuments({
      $or: [
        { assignedDriver: { $exists: true, $ne: null } },
        { driverId: { $exists: true, $ne: null } }
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
        console.log(`    Status: ✅ Properly mapped\n`);
      }
    }
    
    console.log('\n✅ === CLEANUP COMPLETE ===\n');
    console.log('Summary:');
    console.log(`  - Removed problematic driver from ${removeRamuResult.modifiedCount} vehicles`);
    console.log(`  - Fixed capacity data for ${capacityFixed} vehicles`);
    console.log(`  - Established ${relationshipsFixed} proper driver-vehicle relationships`);
    console.log(`  - Cleaned up ${unassignedDrivers.length} unassigned drivers`);
    console.log(`  - Cleaned up ${unassignedVehicles.length} unassigned vehicles`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

fixDriverVehicleMapping();
