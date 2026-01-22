// Check if admin user exists in database
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check admin_users collection
    const adminUser = await db.collection('admin_users').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    console.log('\n📋 Admin User Check:');
    console.log('==================');
    
    if (adminUser) {
      console.log('✅ User found in admin_users collection');
      console.log('   Email:', adminUser.email);
      console.log('   Name:', adminUser.name);
      console.log('   Role:', adminUser.role);
      console.log('   Password set:', adminUser.password ? 'YES' : 'NO');
      console.log('   Password type:', adminUser.password?.startsWith('$2') ? 'Hashed' : 'Plain text');
      console.log('   Active:', adminUser.isActive !== false);
    } else {
      console.log('❌ User NOT found in admin_users collection');
      console.log('\n🔍 Searching in other collections...');
      
      // Check other collections
      const collections = ['drivers', 'customers', 'clients', 'employee_admins', 'users'];
      
      for (const collName of collections) {
        const user = await db.collection(collName).findOne({ 
          email: 'admin@abrafleet.com' 
        });
        
        if (user) {
          console.log(`✅ Found in ${collName} collection`);
          console.log('   Email:', user.email);
          console.log('   Name:', user.name);
          console.log('   Role:', user.role);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkAdminUser();
