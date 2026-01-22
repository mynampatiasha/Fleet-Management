// Fix vehicle driver assignments
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function fixVehicleDriverAssignments() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n' + '='.repeat(80));
    console.log('🔧 FIXING VEHICLE DRIVER ASSIGNMENTS');
    console.log('='.repeat(80));
    
    // STEP 1: Get available drivers
    console.log('\n👨‍✈️ STEP 1: Finding available drivers...');
    
    // Check drivers collection
    const driversFromDriversCollection = await db.collection('drivers').find({
      status: { $ne: 'inactive' }
    }).toArray();
    
    console.log(`Found ${driversFromDriversCollection.length} drivers in 'drivers' collection`);
    
    // Check users collection for driver role
    const driversFromUsersCollection = await db.collection('users').find({
      role: 'driver',
      status: { $ne: 'inactive' }
    }).toArray();
    
    console.log(`Found ${driversFromUsersCollection.length} drivers in 'users' collection`);
    
    // Combine and format drivers
    const allDrivers = [];
    
    // Add drivers from drivers collection
    driversFromDriversCollection.forEach(driver => {
      const firstName = driver.personalInfo?.firstName || driver.firstName || '';
      const lastName = driver.personalInfo?.lastName || driver.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || driver.name || 'Unknown Driver';
      
      allDrivers.push({
        _id: driver._id,
        driverId: driver.driverId || driver._id.toString(),
        name: fullName,
        email: driver.personalInfo?.email || driver.email || '',
        phone: driver.personalInfo?.phone || driver.phone || driver.phoneNumber || '',
        source: 'drivers'
      });
    });
    
    // Add drivers from users collection
    driversFromUsersCollection.forEach(driver => {
      // Check if already added from drivers collection
      const existingDriver = allDrivers.find(d => 
        d._id.toString() === driver._id.toString() || 
        d.email === driver.email
      );
      
      if (!existingDriver) {
        allDrivers.push({
          _id: driver._id,
          driverId: driver.driverId || driver._id.toString(),
          name: driver.name || driver.displayName || 'Unknown Driver',
          email: driver.email || '',
          phone: driver.phone || driver.phoneNumber || '',
          source: 'users'
        });
      }
    });
    
    console.log(`\n📊 Total unique drivers found: ${allDrivers.length}`);
    
    if (allDrivers.length === 0) {
      console.log('❌ No drivers found. Creating sample drivers...');
      
      // Create sample drivers
      const sampleDrivers = [
        {
          driverId: 'DRV001',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@abrafleet.com',
          phone: '9876543210',
          personalInfo: {
            firstName: 'Rajesh',
            lastName: 'Kumar',
            email: 'rajesh.kumar@abrafleet.com',
            phone: '9876543210'
          },
          status: 'active',
          licenseNumber: 'KA1234567890',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          driverId: 'DRV002',
          name: 'Suresh Reddy',
          email: 'suresh.reddy@abrafleet.com',
          phone: '9876543211',
          personalInfo: {
            firstName: 'Suresh',
            lastName: 'Reddy',
            email: 'suresh.reddy@abrafleet.com',
            phone: '9876543211'
          },
          status: 'active',
          licenseNumber: 'KA1234567891',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          driverId: 'DRV003',
          name: 'Venkat Sharma',
          email: 'venkat.sharma@abrafleet.com',
          phone: '9876543212',
          personalInfo: {
            firstName: 'Venkat',
            lastName: 'Sharma',
            email: 'venkat.sharma@abrafleet.com',
            phone: '9876543212'
          },
          status: 'active',
          licenseNumber: 'KA1234567892',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const insertResult = await db.collection('drivers').insertMany(sampleDrivers);
      console.log(`✅ Created ${insertResult.insertedCount} sample drivers`);
      
      // Add to allDrivers array
      sampleDrivers.forEach((driver, index) => {
        allDrivers.push({
          _id: insertResult.insertedIds[index],
          driverId: driver.driverId,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          source: 'drivers'
        });
      });
    }
    
    // Display available drivers
    console.log('\n👥 Available drivers:');
    allDrivers.forEach((driver, index) => {
      console.log(`   ${index + 1}. ${driver.name} (${driver.driverId}) - ${driver.email} - ${driver.source}`);
    });
    
    // STEP 2: Get vehicles without drivers
    console.log('\n🚗 STEP 2: Finding vehicles without drivers...');
    
    const vehiclesWithoutDrivers = await db.collection('vehicles').find({
      status: { $regex: /^active$/i },
      $or: [
        { assignedDriver: null },
        { assignedDriver: { $exists: false } },
        { assignedDriver: '' }
      ]
    }).toArray();
    
    console.log(`Found ${vehiclesWithoutDrivers.length} vehicles without drivers`);
    
    if (vehiclesWithoutDrivers.length === 0) {
      console.log('✅ All vehicles already have drivers assigned');
      return;
    }
    
    // STEP 3: Assign drivers to vehicles
    console.log('\n🔧 STEP 3: Assigning drivers to vehicles...');
    
    const assignments = [];
    
    for (let i = 0; i < Math.min(vehiclesWithoutDrivers.length, allDrivers.length); i++) {
      const vehicle = vehiclesWithoutDrivers[i];
      const driver = allDrivers[i];
      
      console.log(`\n   Assigning ${driver.name} to ${vehicle.registrationNumber || vehicle.name || 'Vehicle'}`);
      
      const updateResult = await db.collection('vehicles').updateOne(
        { _id: vehicle._id },
        {
          $set: {
            assignedDriver: {
              _id: driver._id,
              driverId: driver.driverId,
              name: driver.name,
              email: driver.email,
              phone: driver.phone
            },
            driverId: driver.driverId,
            driverName: driver.name,
            updatedAt: new Date()
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`   ✅ Successfully assigned ${driver.name} to vehicle ${vehicle.registrationNumber || vehicle.name}`);
        assignments.push({
          vehicleId: vehicle._id,
          vehicleName: vehicle.registrationNumber || vehicle.name,
          driverId: driver.driverId,
          driverName: driver.name
        });
      } else {
        console.log(`   ❌ Failed to assign ${driver.name} to vehicle ${vehicle.registrationNumber || vehicle.name}`);
      }
    }
    
    // STEP 4: Verify assignments
    console.log('\n🔍 STEP 4: Verifying assignments...');
    
    const vehiclesWithDrivers = await db.collection('vehicles').find({
      status: { $regex: /^active$/i },
      assignedDriver: { $ne: null, $exists: true }
    }).toArray();
    
    console.log(`\n📊 Verification Results:`);
    console.log(`   - Vehicles with drivers: ${vehiclesWithDrivers.length}`);
    console.log(`   - New assignments made: ${assignments.length}`);
    
    console.log('\n✅ Updated vehicles:');
    vehiclesWithDrivers.forEach((vehicle, index) => {
      const driver = vehicle.assignedDriver;
      console.log(`   ${index + 1}. ${vehicle.registrationNumber || vehicle.name} → ${driver.name} (${driver.driverId})`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ VEHICLE DRIVER ASSIGNMENT COMPLETED');
    console.log('='.repeat(80));
    console.log(`📊 Summary:`);
    console.log(`   - Total drivers available: ${allDrivers.length}`);
    console.log(`   - Vehicles needing drivers: ${vehiclesWithoutDrivers.length}`);
    console.log(`   - Assignments made: ${assignments.length}`);
    console.log(`   - Vehicles now with drivers: ${vehiclesWithDrivers.length}`);
    console.log('='.repeat(80));
    
    if (vehiclesWithDrivers.length > 0) {
      console.log('\n🎉 SUCCESS! Vehicles now have drivers assigned.');
      console.log('💡 You can now test the route assignment feature again.');
      console.log('\nNext steps:');
      console.log('1. Go to Admin Dashboard → Customer Management');
      console.log('2. Select pending customers');
      console.log('3. Click "Smart Grouping"');
      console.log('4. Choose a vehicle (should now show assigned driver)');
      console.log('5. Generate optimized route');
      console.log('6. Confirm assignment');
    }
    
  } catch (error) {
    console.error('❌ Error fixing vehicle driver assignments:', error);
  } finally {
    await client.close();
  }
}

fixVehicleDriverAssignments().catch(console.error);