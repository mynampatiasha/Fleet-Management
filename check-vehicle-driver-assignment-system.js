// Check how vehicle-driver assignment system works
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkVehicleDriverSystem() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 CHECKING VEHICLE-DRIVER ASSIGNMENT SYSTEM');
    console.log('='.repeat(80));
    
    // STEP 1: Check current vehicle structure
    console.log('\n📋 STEP 1: Analyzing vehicle data structure...');
    const sampleVehicle = await db.collection('vehicles').findOne({});
    
    if (sampleVehicle) {
      console.log('\n🚗 Sample Vehicle Structure:');
      console.log('   _id:', sampleVehicle._id);
      console.log('   registrationNumber:', sampleVehicle.registrationNumber);
      console.log('   assignedDriver:', JSON.stringify(sampleVehicle.assignedDriver, null, 2));
      console.log('   driverId:', sampleVehicle.driverId);
      console.log('   status:', sampleVehicle.status);
      
      // Check all fields related to driver
      const driverFields = {};
      Object.keys(sampleVehicle).forEach(key => {
        if (key.toLowerCase().includes('driver')) {
          driverFields[key] = sampleVehicle[key];
        }
      });
      
      console.log('\n👨‍✈️ All driver-related fields:');
      console.log(JSON.stringify(driverFields, null, 2));
    } else {
      console.log('❌ No vehicles found in database');
    }
    
    // STEP 2: Check available drivers
    console.log('\n👥 STEP 2: Checking available drivers...');
    
    // Check drivers collection
    const driversCount = await db.collection('drivers').countDocuments();
    console.log(`   Drivers collection: ${driversCount} documents`);
    
    if (driversCount > 0) {
      const sampleDriver = await db.collection('drivers').findOne({});
      console.log('\n👨‍✈️ Sample Driver Structure:');
      console.log('   _id:', sampleDriver._id);
      console.log('   driverId:', sampleDriver.driverId);
      console.log('   name:', sampleDriver.name);
      console.log('   personalInfo:', JSON.stringify(sampleDriver.personalInfo, null, 2));
      console.log('   status:', sampleDriver.status);
    }
    
    // Check users collection for drivers
    const driverUsersCount = await db.collection('users').countDocuments({ role: 'driver' });
    console.log(`   Users with driver role: ${driverUsersCount} documents`);
    
    if (driverUsersCount > 0) {
      const sampleDriverUser = await db.collection('users').findOne({ role: 'driver' });
      console.log('\n👨‍✈️ Sample Driver User Structure:');
      console.log('   _id:', sampleDriverUser._id);
      console.log('   name:', sampleDriverUser.name);
      console.log('   email:', sampleDriverUser.email);
      console.log('   role:', sampleDriverUser.role);
      console.log('   status:', sampleDriverUser.status);
    }
    
    // STEP 3: Check if there's a vehicle-driver assignment API
    console.log('\n🔧 STEP 3: Checking for vehicle-driver assignment patterns...');
    
    // Look for vehicles with assigned drivers
    const vehiclesWithDrivers = await db.collection('vehicles').find({
      $or: [
        { assignedDriver: { $ne: null, $exists: true } },
        { driverId: { $ne: null, $exists: true } }
      ]
    }).toArray();
    
    console.log(`   Vehicles with assigned drivers: ${vehiclesWithDrivers.length}`);
    
    if (vehiclesWithDrivers.length > 0) {
      console.log('\n✅ Found vehicles with drivers:');
      vehiclesWithDrivers.forEach((vehicle, index) => {
        console.log(`   ${index + 1}. ${vehicle.registrationNumber || vehicle.name}`);
        console.log(`      assignedDriver: ${JSON.stringify(vehicle.assignedDriver)}`);
        console.log(`      driverId: ${vehicle.driverId}`);
      });
    }
    
    // STEP 4: Check the backend API endpoints
    console.log('\n🌐 STEP 4: Checking backend API structure...');
    
    // This would require checking the actual backend files, but let's see what we can infer
    const vehiclesWithoutDrivers = await db.collection('vehicles').find({
      $and: [
        { $or: [{ assignedDriver: null }, { assignedDriver: { $exists: false } }] },
        { $or: [{ driverId: null }, { driverId: { $exists: false } }] }
      ]
    }).toArray();
    
    console.log(`   Vehicles without drivers: ${vehiclesWithoutDrivers.length}`);
    
    // STEP 5: Provide solution recommendations
    console.log('\n💡 STEP 5: Solution recommendations...');
    
    if (vehiclesWithoutDrivers.length > 0) {
      console.log('\n❌ PROBLEM IDENTIFIED:');
      console.log(`   ${vehiclesWithoutDrivers.length} vehicles have no assigned drivers`);
      console.log('   This is why route assignment is failing!');
      
      console.log('\n🔧 SOLUTIONS:');
      console.log('   1. IMMEDIATE FIX: Manually assign drivers to vehicles in database');
      console.log('   2. UI FIX: Add driver assignment functionality to Vehicle Master screen');
      console.log('   3. API FIX: Create/update vehicle-driver assignment endpoints');
      
      console.log('\n📋 IMMEDIATE ACTION NEEDED:');
      console.log('   Run the fix-vehicle-driver-assignments.js script to assign drivers');
      console.log('   This will allow route assignment to work immediately');
    } else {
      console.log('✅ All vehicles have assigned drivers');
    }
    
    // STEP 6: Show the exact structure needed
    console.log('\n📝 STEP 6: Required vehicle structure for route assignment...');
    console.log('   Each vehicle document should have:');
    console.log('   {');
    console.log('     "_id": ObjectId("..."),');
    console.log('     "registrationNumber": "KA01AB1234",');
    console.log('     "assignedDriver": {');
    console.log('       "_id": ObjectId("..."),');
    console.log('       "driverId": "DRV001",');
    console.log('       "name": "Driver Name",');
    console.log('       "email": "driver@example.com",');
    console.log('       "phone": "9876543210"');
    console.log('     },');
    console.log('     "status": "active",');
    console.log('     "capacity": { "passengers": 8 }');
    console.log('   }');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkVehicleDriverSystem().catch(console.error);