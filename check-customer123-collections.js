const { MongoClient } = require('mongodb');

async function checkCustomer123() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    const email = 'customer123@abrafleet.com';
    const uid = 'b5aoloVR7xYI6SICibCIWecBaf82';
    
    console.log('🔍 Checking customer123@abrafleet.com in different collections...');
    console.log(`   Email: ${email}`);
    console.log(`   Firebase UID: ${uid}`);
    console.log('');
    
    const collections = ['customers', 'admin_users', 'users', 'clients', 'drivers'];
    
    for (const collectionName of collections) {
      try {
        const user = await db.collection(collectionName).findOne({
          $or: [
            { email: email },
            { firebaseUid: uid }
          ]
        });
        
        if (user) {
          console.log(`✅ Found in ${collectionName}:`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Firebase UID: ${user.firebaseUid}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Status: ${user.status || (user.isActive ? 'active' : 'inactive')}`);
          console.log(`   Name: ${user.name}`);
          console.log('');
        } else {
          console.log(`❌ Not found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${collectionName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkCustomer123().catch(console.error);