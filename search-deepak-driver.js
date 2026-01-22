const { MongoClient } = require('mongodb');
const MONGO_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function findDriver() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🔍 Searching for driver with vehicle KA07JK1234 and driverId DRV-100012...\n');
    
    // Search in drivers collection
    const driver = await db.collection('drivers').findOne({
      $or: [
        { driverId: 'DRV-100012' },
        { 'personalInfo.email': { $regex: 'deepak', $options: 'i' } }
      ]
    });
    
    if (driver) {
      console.log('✅ Found driver in drivers collection:');
      console.log('Driver ID:', driver.driverId);
      console.log('Name:', driver.personalInfo?.firstName, driver.personalInfo?.lastName);
      console.log('Email:', driver.personalInfo?.email);
      console.log('Phone:', driver.personalInfo?.phone);
      console.log('Vehicle:', driver.assignedVehicle);
      console.log('Firebase UID:', driver.firebaseUid || driver.uid);
    }
    
    // Search in vehicles collection for KA07JK1234
    const vehicle = await db.collection('vehicles').findOne({
      registrationNumber: 'KA07JK1234'
    });
    
    if (vehicle) {
      console.log('\n✅ Found vehicle KA07JK1234:');
      console.log('Vehicle ID:', vehicle.vehicleId);
      console.log('Registration:', vehicle.registrationNumber);
      console.log('Assigned Driver:', vehicle.assignedDriver);
      console.log('Make/Model:', vehicle.make, vehicle.model);
    }
    
    // Search in admin_users collection
    const adminUser = await db.collection('admin_users').findOne({
      $or: [
        { driverId: 'DRV-100012' },
        { email: { $regex: 'deepak', $options: 'i' } }
      ]
    });
    
    if (adminUser) {
      console.log('\n✅ Found in admin_users collection:');
      console.log('Email:', adminUser.email);
      console.log('Name:', adminUser.name);
      console.log('Role:', adminUser.role);
      console.log('Driver ID:', adminUser.driverId);
      console.log('Firebase UID:', adminUser.firebaseUid);
    }
    
    if (!driver && !vehicle && !adminUser) {
      console.log('❌ No driver found with DRV-100012 or vehicle KA07JK1234');
      console.log('\n🔍 Let me search for any drivers with similar names...');
      
      const similarDrivers = await db.collection('drivers').find({
        $or: [
          { 'personalInfo.firstName': { $regex: 'deepak', $options: 'i' } },
          { 'personalInfo.lastName': { $regex: 'joshi', $options: 'i' } }
        ]
      }).toArray();
      
      if (similarDrivers.length > 0) {
        console.log('Found similar drivers:');
        similarDrivers.forEach(d => {
          console.log('- Name:', d.personalInfo?.firstName, d.personalInfo?.lastName);
          console.log('  Email:', d.personalInfo?.email);
          console.log('  Driver ID:', d.driverId);
          console.log('  Vehicle:', d.assignedVehicle);
        });
      }
      
      // Search all vehicles to see what's available
      console.log('\n🔍 Searching all vehicles with KA07 prefix...');
      const allVehicles = await db.collection('vehicles').find({
        registrationNumber: { $regex: 'KA07', $options: 'i' }
      }).toArray();
      
      if (allVehicles.length > 0) {
        console.log('Found vehicles with KA07:');
        allVehicles.forEach(v => {
          console.log('- Registration:', v.registrationNumber);
          console.log('  Vehicle ID:', v.vehicleId);
          console.log('  Assigned Driver:', v.assignedDriver);
          console.log('  Make/Model:', v.make, v.model);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

findDriver();