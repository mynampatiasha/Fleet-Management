const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function quickDriverCheck() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 QUICK DRIVER CHECK\n');
    
    // 1. Total count
    const total = await db.collection('drivers').countDocuments();
    console.log(`📊 Total drivers: ${total}`);
    
    if (total === 0) {
      console.log('❌ NO DRIVERS FOUND!');
      return;
    }
    
    // 2. List first 10 drivers
    console.log('\n👥 First 10 drivers:');
    const drivers = await db.collection('drivers').find({}).limit(10).toArray();
    
    drivers.forEach((driver, i) => {
      const name = driver.name || 
                   (driver.personalInfo ? `${driver.personalInfo.firstName || ''} ${driver.personalInfo.lastName || ''}`.trim() : '') || 
                   'Unknown';
      const phone = driver.phone || driver.personalInfo?.phone || 'No phone';
      
      console.log(`${i + 1}. ${driver.driverId || driver._id} - ${name} (${phone})`);
    });
    
    // 3. Check if any drivers are assigned to vehicles
    const assignedDrivers = await db.collection('vehicles').find({
      $or: [
        { driverId: { $exists: true, $ne: null, $ne: '' } },
        { assignedDriver: { $exists: true, $ne: null } }
      ]
    }).countDocuments();
    
    console.log(`\n🚗 Vehicles with assigned drivers: ${assignedDrivers}`);
    
    console.log('\n✅ Driver check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

quickDriverCheck();