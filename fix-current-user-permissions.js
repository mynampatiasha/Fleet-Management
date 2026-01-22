// Fix current user permissions for fleet access
const { MongoClient } = require('mongodb');

async function fixCurrentUserPermissions() {
  console.log('\n🔧 FIXING CURRENT USER PERMISSIONS');
  console.log('='.repeat(80));
  
  try {
    // Connect to MongoDB Atlas
    const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Check all user collections to see what users exist
    const collections = ['users', 'admin_users', 'employee_admins', 'drivers', 'customers', 'clients'];
    
    for (const collectionName of collections) {
      console.log(`\n📋 Checking ${collectionName} collection...`);
      const users = await db.collection(collectionName).find({}).limit(10).toArray();
      console.log(`   Found ${users.length} users`);
      
      if (users.length > 0) {
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email || 'No email'} - Role: ${user.role || 'No role'} - Status: ${user.status || user.isActive ? 'active' : 'inactive'}`);
        });
      }
    }
    
    // Create/update a super admin user that can access fleet management
    console.log('\n🔧 Creating/updating super admin user...');
    
    const superAdmin = {
      email: 'admin@abrafleet.com',
      firebaseUid: 'super-admin-uid',
      role: 'super_admin',
      status: 'active',
      isActive: true,
      modules: ['fleet', 'drivers', 'routes', 'customers', 'billing', 'users', 'system', 'tracking', 'reports'],
      permissions: {
        fleet: ['read', 'write', 'delete'],
        drivers: ['read', 'write', 'delete'],
        routes: ['read', 'write', 'delete'],
        customers: ['read', 'write', 'delete'],
        billing: ['read', 'write', 'delete'],
        users: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
        tracking: ['read', 'write', 'delete'],
        reports: ['read', 'write', 'delete']
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };
    
    // Insert into admin_users collection
    await db.collection('admin_users').replaceOne(
      { email: superAdmin.email },
      superAdmin,
      { upsert: true }
    );
    
    console.log('✅ Super admin user created/updated in admin_users collection');
    
    // Also create a test admin user for development
    const testAdmin = {
      email: 'test@abrafleet.com',
      firebaseUid: 'test-admin-uid-123',
      role: 'admin',
      status: 'active',
      isActive: true,
      modules: ['fleet', 'drivers', 'routes', 'customers'],
      permissions: {
        fleet: ['read', 'write'],
        drivers: ['read', 'write'],
        routes: ['read', 'write'],
        customers: ['read', 'write']
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };
    
    await db.collection('admin_users').replaceOne(
      { email: testAdmin.email },
      testAdmin,
      { upsert: true }
    );
    
    console.log('✅ Test admin user created/updated in admin_users collection');
    
    // Check if there are any users that might be the current Flutter user
    console.log('\n🔍 Looking for potential Flutter app users...');
    
    // Look for users with recent activity or specific patterns
    const recentUsers = await db.collection('admin_users').find({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).toArray();
    
    console.log(`Found ${recentUsers.length} recently active admin users`);
    
    // Update all admin users to ensure they have fleet access
    console.log('\n🔧 Ensuring all admin users have fleet access...');
    
    const adminUsers = await db.collection('admin_users').find({ role: { $in: ['admin', 'super_admin'] } }).toArray();
    
    for (const user of adminUsers) {
      const updatedModules = [...new Set([...(user.modules || []), 'fleet', 'drivers', 'routes'])];
      const updatedPermissions = {
        ...user.permissions,
        fleet: ['read', 'write'],
        drivers: ['read', 'write'],
        routes: ['read', 'write']
      };
      
      await db.collection('admin_users').updateOne(
        { _id: user._id },
        {
          $set: {
            modules: updatedModules,
            permissions: updatedPermissions,
            status: 'active',
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Updated permissions for ${user.email}`);
    }
    
    await client.close();
    
    console.log('\n✅ USER PERMISSIONS FIXED');
    console.log('='.repeat(80));
    console.log('\n📱 NEXT STEPS:');
    console.log('1. Restart the Flutter app');
    console.log('2. Make sure you\'re logged in as admin@abrafleet.com or test@abrafleet.com');
    console.log('3. Try accessing the fleet vehicles screen again');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.message);
  }
}

fixCurrentUserPermissions();