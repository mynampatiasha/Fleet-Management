// Check Admin User Location
// This script finds where admin@abrafleet.com is stored and checks Firebase UID

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkAdminUserLocation() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING ADMIN USER LOCATION');
  console.log('='.repeat(80) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Check users collection
    console.log('📋 Checking "users" collection...');
    const userInUsers = await db.collection('users').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    if (userInUsers) {
      console.log('✅ Found in "users" collection');
      console.log(`   Email: ${userInUsers.email}`);
      console.log(`   Name: ${userInUsers.name || 'N/A'}`);
      console.log(`   Role: ${userInUsers.role}`);
      console.log(`   Firebase UID: ${userInUsers.firebaseUid || '❌ NOT SET'}`);
      console.log(`   User ID: ${userInUsers._id}`);
    } else {
      console.log('❌ NOT found in "users" collection');
    }
    console.log('');

    // Check employee_admins collection
    console.log('📋 Checking "employee_admins" collection...');
    const userInEmployeeAdmins = await db.collection('employee_admins').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    if (userInEmployeeAdmins) {
      console.log('✅ Found in "employee_admins" collection');
      console.log(`   Email: ${userInEmployeeAdmins.email}`);
      console.log(`   Name: ${userInEmployeeAdmins.name || 'N/A'}`);
      console.log(`   Role: ${userInEmployeeAdmins.role}`);
      console.log(`   Firebase UID: ${userInEmployeeAdmins.firebaseUid || '❌ NOT SET'}`);
      console.log(`   User ID: ${userInEmployeeAdmins._id}`);
    } else {
      console.log('❌ NOT found in "employee_admins" collection');
    }
    console.log('');

    // Check admin_users collection
    console.log('📋 Checking "admin_users" collection...');
    const userInAdminUsers = await db.collection('admin_users').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    if (userInAdminUsers) {
      console.log('✅ Found in "admin_users" collection');
      console.log(`   Email: ${userInAdminUsers.email}`);
      console.log(`   Name: ${userInAdminUsers.name || 'N/A'}`);
      console.log(`   Role: ${userInAdminUsers.role}`);
      console.log(`   Firebase UID: ${userInAdminUsers.firebaseUid || '❌ NOT SET'}`);
      console.log(`   User ID: ${userInAdminUsers._id}`);
    } else {
      console.log('❌ NOT found in "admin_users" collection');
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Found in "users": ${userInUsers ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Found in "employee_admins": ${userInEmployeeAdmins ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Found in "admin_users": ${userInAdminUsers ? 'YES ✅' : 'NO ❌'}`);
    console.log('');

    if (userInUsers || userInEmployeeAdmins || userInAdminUsers) {
      const user = userInUsers || userInEmployeeAdmins || userInAdminUsers;
      const collection = userInUsers ? 'users' : userInEmployeeAdmins ? 'employee_admins' : 'admin_users';
      
      console.log('💡 RECOMMENDATION:');
      console.log(`   Update getAdminUsers() function to check "${collection}" collection`);
      
      if (!user.firebaseUid) {
        console.log('');
        console.log('⚠️  WARNING: Firebase UID is not set!');
        console.log('   OneSignal notifications require a Firebase UID');
        console.log('   Run: node add-firebase-uid-to-admin.js');
      }
    } else {
      console.log('❌ ERROR: Admin user not found in any collection!');
    }
    
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error checking admin user location:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

// Run the script
checkAdminUserLocation().catch(console.error);
