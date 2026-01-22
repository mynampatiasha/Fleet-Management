// Simple test to check vehicle data structure without auth
const { MongoClient, ObjectId } = require('mongodb');

async function testVehicleData() {
  console.log('\n' + '🧪' * 80);
  console.log('🧪 TESTING VEHICLE DATA STRUCTURE (NO AUTH)');
  console.log('🧪' * 80);
  
  let client;
  
  try {
    // Connect to MongoDB directly
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n✅ Connected to MongoDB');
    
    // Check vehicles collection
    const vehicleCount = await db.collection('vehicles').countDocuments();
    console.log(`\n🚗 Total vehicles in database: ${vehicleCount}`);
    
    if (vehicleCount === 0) {
      console.log('❌ No vehicles found in database!');
      console.log('   This is why "No compatible vehicles found" appears');
      return;
    }
    
    // Get sample vehicles
    const sampleVehicles = await db.collection('vehicles').find({}).limit(3).toArray();
    
    console.log('\n📊 SAMPLE VEHICLES:');
    sampleVehicles.forEach((vehicle, index) => {
      console.log(`   ${index + 1}. ${vehicle.registrationNumber || vehicle._id}`);
      console.log(`      Status: ${vehicle.status || 'unknown'}`);
      console.log(`      Driver: ${vehicle.assignedDriver || vehicle.driverId || 'none'}`);
      console.log(`      Seats: ${vehicle.seatingCapacity || 'unknown'}`);
      console.log(`      Assigned Customers: ${(vehicle.assignedCustomers || []).length}`);
    });
    
    // Check active/idle vehicles
    const activeVehicles = await db.collection('vehicles').find({
      status: { $in: ['idle', 'active'] }
    }).toArray();
    
    console.log(`\n✅ Active/Idle vehicles: ${activeVehicles.length}`);
    
    if (activeVehicles.length === 0) {
      console.log('❌ No active/idle vehicles found!');
      console.log('   All vehicles might be "on_trip" or have other status');
      
      // Check all statuses
      const statusCounts = await db.collection('vehicles').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray();
      
      console.log('\n📊 Vehicle Status Distribution:');
      statusCounts.forEach(status => {
        console.log(`   ${status._id || 'null'}: ${status.count}`);
      });
      
      return;
    }
    
    // Check drivers
    const driverCount = await db.collection('drivers').countDocuments();
    console.log(`\n👨‍✈️ Total drivers in database: ${driverCount}`);
    
    if (driverCount === 0) {
      console.log('❌ No drivers found in database!');
      console.log('   Vehicles need assigned drivers to be compatible');
      return;
    }
    
    // Check vehicles with drivers
    const vehiclesWithDrivers = activeVehicles.filter(v => v.assignedDriver || v.driverId);
    console.log(`\n✅ Active vehicles with drivers: ${vehiclesWithDrivers.length}`);
    
    if (vehiclesWithDrivers.length === 0) {
      console.log('❌ No active vehicles have assigned drivers!');
      console.log('   This is likely why no vehicles are compatible');
      
      console.log('\n🔧 CHECKING DRIVER ASSIGNMENTS:');
      for (const vehicle of activeVehicles.slice(0, 3)) {
        console.log(`   Vehicle ${vehicle.registrationNumber}:`);
        console.log(`     assignedDriver: ${vehicle.assignedDriver || 'null'}`);
        console.log(`     driverId: ${vehicle.driverId || 'null'}`);
        
        if (vehicle.assignedDriver || vehicle.driverId) {
          const driverId = vehicle.assignedDriver || vehicle.driverId;
          const driver = await db.collection('drivers').findOne({ 
            $or: [
              { _id: driverId },
              { driverId: String(driverId) }
            ]
          });
          console.log(`     driver found: ${driver ? driver.name : 'NO'}`);
        }
      }
      
      return;
    }
    
    // Test the assignment algorithm with a sample roster
    console.log('\n🔍 Testing assignment algorithm...');
    
    const sampleRoster = await db.collection('rosters').findOne({
      status: { $in: ['pending_assignment', 'pending', 'created'] }
    });
    
    if (!sampleRoster) {
      console.log('❌ No pending rosters to test with');
      return;
    }
    
    console.log(`\n📋 Test Roster: ${sampleRoster.customerName}`);
    
    // Import and test the assignment algorithm
    const { findBestMatches } = require('./abra_fleet_backend/utils/assignment_algorithm');
    
    const matches = await findBestMatches([sampleRoster], db);
    
    console.log('\n📊 ASSIGNMENT RESULTS:');
    console.log(`   Total Checked: ${matches.totalChecked}`);
    console.log(`   Compatible: ${matches.compatibleCount}`);
    console.log(`   Best Match: ${matches.bestMatch ? 'Found' : 'None'}`);
    console.log(`   All Options: ${matches.allOptions?.length || 0}`);
    
    if (matches.allOptions && matches.allOptions.length > 0) {
      console.log('\n✅ SUCCESS: Vehicles are being found by algorithm');
      console.log('   The issue was in frontend data parsing, which is now fixed');
      
      console.log('\n🚗 TOP 3 MATCHES:');
      matches.allOptions.slice(0, 3).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.vehicleReg} - Score: ${match.totalScore}/100`);
        console.log(`      Driver: ${match.details?.driverName}`);
        console.log(`      Distance: ${match.details?.distanceKm?.toFixed(2)} km`);
      });
    } else {
      console.log('\n❌ ALGORITHM FOUND NO MATCHES');
      console.log('   Check the rejection reasons:');
      
      if (matches.rejected && matches.rejected.length > 0) {
        matches.rejected.slice(0, 5).forEach((rejected, index) => {
          console.log(`   ${index + 1}. ${rejected.vehicle?.registrationNumber}: ${rejected.reason}`);
        });
      }
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
  
  console.log('\n' + '🧪' * 80 + '\n');
}

testVehicleData();