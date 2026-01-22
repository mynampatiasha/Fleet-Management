const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkDriversVehiclesMapping() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet');
    const driversCollection = db.collection('drivers');
    const vehiclesCollection = db.collection('vehicles');
    const tripsCollection = db.collection('trips');
    
    // Get all drivers
    console.log('\n🚗 === DRIVERS AND THEIR VEHICLES ===\n');
    const drivers = await driversCollection.find().toArray();
    console.log(`Total Drivers: ${drivers.length}\n`);
    
    for (const driver of drivers) {
      console.log(`\n--- Driver: ${driver.name || driver.driverName} ---`);
      console.log(`Driver ID: ${driver.driverId || driver._id}`);
      console.log(`Phone: ${driver.phone || driver.phoneNumber || 'N/A'}`);
      console.log(`Email: ${driver.email || 'N/A'}`);
      console.log(`Status: ${driver.status || driver.isActive ? 'Active' : 'Inactive'}`);
      
      // Check assigned vehicle in driver record
      if (driver.assignedVehicle || driver.vehicleId || driver.vehicleNumber) {
        console.log(`Assigned Vehicle (from driver): ${driver.assignedVehicle || driver.vehicleId || driver.vehicleNumber}`);
      } else {
        console.log(`Assigned Vehicle: None`);
      }
      
      // Check vehicles assigned to this driver
      const assignedVehicles = await vehiclesCollection.find({
        $or: [
          { assignedDriver: driver.driverId },
          { driverId: driver.driverId },
          { driver: driver.driverId }
        ]
      }).toArray();
      
      if (assignedVehicles.length > 0) {
        console.log(`\nVehicles assigned to this driver:`);
        assignedVehicles.forEach(vehicle => {
          console.log(`  - ${vehicle.vehicleNumber || vehicle.registrationNumber} (${vehicle.vehicleType || vehicle.type || 'N/A'})`);
          console.log(`    Capacity: ${vehicle.capacity || vehicle.seatCapacity || 'N/A'}`);
          console.log(`    Status: ${vehicle.status || 'N/A'}`);
        });
      }
      
      // Check recent trips
      const recentTrips = await tripsCollection
        .find({ driverId: driver.driverId })
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
      
      if (recentTrips.length > 0) {
        console.log(`\nRecent Trips (last 3):`);
        recentTrips.forEach(trip => {
          console.log(`  - ${trip.tripId || trip._id}`);
          console.log(`    Vehicle: ${trip.vehicleNumber || trip.vehicleId || 'N/A'}`);
          console.log(`    Status: ${trip.status}`);
          console.log(`    Date: ${trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}`);
        });
      }
    }
    
    // Get all vehicles
    console.log('\n\n🚙 === VEHICLES AND THEIR DRIVERS ===\n');
    const vehicles = await vehiclesCollection.find().toArray();
    console.log(`Total Vehicles: ${vehicles.length}\n`);
    
    for (const vehicle of vehicles) {
      console.log(`\n--- Vehicle: ${vehicle.vehicleNumber || vehicle.registrationNumber} ---`);
      console.log(`Vehicle ID: ${vehicle.vehicleId || vehicle._id}`);
      console.log(`Type: ${vehicle.vehicleType || vehicle.type || 'N/A'}`);
      console.log(`Capacity: ${vehicle.capacity || vehicle.seatCapacity || 'N/A'}`);
      console.log(`Status: ${vehicle.status || 'N/A'}`);
      
      // Check assigned driver in vehicle record
      const assignedDriverId = vehicle.assignedDriver || vehicle.driverId || vehicle.driver;
      if (assignedDriverId) {
        console.log(`Assigned Driver ID: ${assignedDriverId}`);
        
        // Get driver details
        const driver = await driversCollection.findOne({
          $or: [
            { driverId: assignedDriverId },
            { _id: assignedDriverId }
          ]
        });
        
        if (driver) {
          console.log(`Driver Name: ${driver.name || driver.driverName}`);
          console.log(`Driver Phone: ${driver.phone || driver.phoneNumber || 'N/A'}`);
        } else {
          console.log(`Driver Name: Not found in database`);
        }
      } else {
        console.log(`Assigned Driver: None`);
      }
      
      // Check recent trips with this vehicle
      const vehicleTrips = await tripsCollection
        .find({
          $or: [
            { vehicleNumber: vehicle.vehicleNumber },
            { vehicleId: vehicle.vehicleId || vehicle._id }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
      
      if (vehicleTrips.length > 0) {
        console.log(`\nRecent Trips (last 3):`);
        vehicleTrips.forEach(trip => {
          console.log(`  - ${trip.tripId || trip._id}`);
          console.log(`    Driver: ${trip.driverName || trip.driverId || 'N/A'}`);
          console.log(`    Status: ${trip.status}`);
          console.log(`    Date: ${trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}`);
        });
      }
    }
    
    // Summary
    console.log('\n\n📊 === SUMMARY ===\n');
    
    const driversWithVehicles = await driversCollection.countDocuments({
      $or: [
        { assignedVehicle: { $exists: true, $ne: null } },
        { vehicleId: { $exists: true, $ne: null } },
        { vehicleNumber: { $exists: true, $ne: null } }
      ]
    });
    
    const vehiclesWithDrivers = await vehiclesCollection.countDocuments({
      $or: [
        { assignedDriver: { $exists: true, $ne: null } },
        { driverId: { $exists: true, $ne: null } },
        { driver: { $exists: true, $ne: null } }
      ]
    });
    
    console.log(`Total Drivers: ${drivers.length}`);
    console.log(`Drivers with assigned vehicles: ${driversWithVehicles}`);
    console.log(`\nTotal Vehicles: ${vehicles.length}`);
    console.log(`Vehicles with assigned drivers: ${vehiclesWithDrivers}`);
    
    // Check for mismatches
    console.log('\n\n⚠️  === POTENTIAL ISSUES ===\n');
    
    for (const driver of drivers) {
      const driverVehicle = driver.assignedVehicle || driver.vehicleId || driver.vehicleNumber;
      if (driverVehicle) {
        const vehicle = await vehiclesCollection.findOne({
          $or: [
            { vehicleNumber: driverVehicle },
            { vehicleId: driverVehicle },
            { _id: driverVehicle }
          ]
        });
        
        if (!vehicle) {
          console.log(`❌ Driver ${driver.name || driver.driverName} (${driver.driverId}) has vehicle ${driverVehicle} but vehicle not found`);
        } else {
          const vehicleDriver = vehicle.assignedDriver || vehicle.driverId || vehicle.driver;
          if (vehicleDriver !== driver.driverId) {
            console.log(`⚠️  Mismatch: Driver ${driver.name} assigned to ${driverVehicle}, but vehicle shows driver as ${vehicleDriver}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkDriversVehiclesMapping();
