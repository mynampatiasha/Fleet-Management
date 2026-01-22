const { MongoClient } = require('mongodb');

async function checkAdminCredentials() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n🔍 CHECKING ADMIN CREDENTIALS');
    console.log('='.repeat(80));
    
    // Check admin_users collection
    console.log('\n1️⃣ Checking admin_users collection...');
    const adminUsers = await db.collection('admin_users').find({}).toArray();
    console.log(`   Found ${adminUsers.length} admin users`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`\n   Admin ${index + 1}:`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Has Password: ${!!user.password}`);
        console.log(`      Firebase UID: ${user.firebaseUid || 'Not set'}`);
      });
    }
    
    // Check users collection
    console.log('\n2️⃣ Checking users collection for admin role...');
    const regularAdmins = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log(`   Found ${regularAdmins.length} users with admin role`);
    
    if (regularAdmins.length > 0) {
      regularAdmins.forEach((user, index) => {
        console.log(`\n   User ${index + 1}:`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Has Password: ${!!user.password}`);
      });
    }
    
    console.log('\n='.repeat(80));
    console.log('✅ Check complete\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkAdminCredentials();
