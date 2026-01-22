const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet';

async function checkExistingDrivers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Check admin_users collection for drivers
    console.log('🔍 Checking admin_users collection for drivers...\n');
    const adminDrivers = await db.collection('admin_users').find({ 
      role: 'driver' 
    }).toArray();
    
    console.log(`Found ${adminDrivers.length} drivers in admin_users:\n`);
    adminDrivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name || 'No name'}`);
      console.log(`   Email: ${driver.email}`);
      console.log(`   Status: ${driver.status || 'N/A'}`);
      console.log(`   Has Password: ${driver.password ? 'Yes' : 'No'}`);
      console.log(`   Firebase UID: ${driver.firebaseUID || 'N/A'}`);
      console.log('');
    });
    
    // Check drivers collection
    console.log('\n🔍 Checking drivers collection...\n');
    const drivers = await db.collection('drivers').find({}).limit(5).toArray();
    
    console.log(`Found ${drivers.length} drivers in drivers collection:\n`);
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.personalInfo?.firstName} ${driver.personalInfo?.lastName}`);
      console.log(`   Email: ${driver.personalInfo?.email}`);
      console.log(`   Driver ID: ${driver.driverId}`);
      console.log(`   Status: ${driver.status || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkExistingDrivers();
