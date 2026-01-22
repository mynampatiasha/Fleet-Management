// Test admin login functionality
const BASE_URL = 'http://localhost:3001';

// Test MongoDB connection and admin user
async function testAdminInMongoDB() {
  const { MongoClient } = require('mongodb');
  require('dotenv').config({ path: './abra_fleet_backend/.env' });
  
  try {
    console.log('\n🔍 Checking admin user in MongoDB...');
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'abra_fleet');
    
    // Check admin_users collection
    const adminUser = await db.collection('admin_users').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    console.log('📋 Admin user in admin_users collection:');
    if (adminUser) {
      console.log('   ✅ Found');
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Firebase UID:', adminUser.firebaseUid);
    } else {
      console.log('   ❌ Not found');
    }
    
    // Check users collection
    const user = await db.collection('users').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    console.log('\n📋 Admin user in users collection:');
    if (user) {
      console.log('   ✅ Found');
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Firebase UID:', user.firebaseUid);
    } else {
      console.log('   ❌ Not found');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testAdminInMongoDB();
}

runTests();