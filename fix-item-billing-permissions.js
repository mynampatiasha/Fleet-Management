// Fix Item Billing Permissions
// ============================================================================
// This script creates/updates users with proper billing permissions
// ============================================================================

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function fixItemBillingPermissions() {
  console.log('🔧 FIXING ITEM BILLING PERMISSIONS');
  console.log('=' * 80);
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');

    // Check current admin users
    console.log('\n1️⃣ Checking existing admin users...');
    const adminUsers = await db.collection('admin_users').find({}).toArray();
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Active: ${user.isActive}`);
      if (user.permissions) {
        const perms = user.permissions instanceof Map ? 
          Array.from(user.permissions.keys()) : 
          Object.keys(user.permissions);
        console.log(`    Permissions: ${perms.join(', ')}`);
      }
    });

    // Check current regular users
    console.log('\n2️⃣ Checking existing regular users...');
    const regularUsers = await db.collection('users').find({}).toArray();
    console.log(`Found ${regularUsers.length} regular users:`);
    regularUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Active: ${user.isActive}`);
      if (user.standardPermissions) {
        console.log(`    Modules: ${user.standardPermissions.join(', ')}`);
      }
    });

    // Create/Update admin user with billing permissions
    console.log('\n3️⃣ Creating/updating admin user with billing permissions...');
    
    const adminUserData = {
      email: 'admin@abrafleet.com',
      name: 'Admin User',
      role: 'super_admin',
      firebaseUid: 'admin-test-123',
      isActive: true,
      permissions: {
        billing: true,
        billing_items: true,
        billing_invoices: true,
        billing_customers: true,
        fleet: true,
        fleet_vehicles: true,
        drivers: true,
        customers: true,
        routes: true,
        reports: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('admin_users').updateOne(
      { email: 'admin@abrafleet.com' },
      { $set: adminUserData },
      { upsert: true }
    );
    console.log('✅ Admin user created/updated with billing permissions');

    // Create test user with billing permissions
    console.log('\n4️⃣ Creating test user with billing permissions...');
    
    const testUserData = {
      email: 'test@abrafleet.com',
      name: 'Test User',
      role: 'admin',
      firebaseUid: 'test-user-123',
      isActive: true,
      permissions: {
        billing: true,
        billing_items: true,
        billing_invoices: true,
        billing_customers: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('admin_users').updateOne(
      { email: 'test@abrafleet.com' },
      { $set: testUserData },
      { upsert: true }
    );
    console.log('✅ Test user created/updated with billing permissions');

    // Create regular user with billing module access
    console.log('\n5️⃣ Creating regular user with billing module access...');
    
    const regularUserData = {
      email: 'billing@abrafleet.com',
      name: 'Billing User',
      role: 'employee',
      firebaseUid: 'billing-user-123',
      isActive: true,
      standardPermissions: ['billing', 'reports'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').updateOne(
      { email: 'billing@abrafleet.com' },
      { $set: regularUserData },
      { upsert: true }
    );
    console.log('✅ Regular user created/updated with billing module access');

    // Verify the changes
    console.log('\n6️⃣ Verifying changes...');
    
    const updatedAdminUsers = await db.collection('admin_users').find({
      email: { $in: ['admin@abrafleet.com', 'test@abrafleet.com'] }
    }).toArray();
    
    console.log('Updated admin users:');
    updatedAdminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
      const perms = user.permissions ? Object.keys(user.permissions) : [];
      console.log(`    Permissions: ${perms.join(', ')}`);
    });

    const updatedRegularUsers = await db.collection('users').find({
      email: 'billing@abrafleet.com'
    }).toArray();
    
    console.log('Updated regular users:');
    updatedRegularUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
      console.log(`    Modules: ${user.standardPermissions?.join(', ') || 'none'}`);
    });

    console.log('\n✅ PERMISSIONS FIXED SUCCESSFULLY!');
    console.log('\nYou can now test with these credentials:');
    console.log('1. Admin: admin@abrafleet.com (Firebase UID: admin-test-123)');
    console.log('2. Test User: test@abrafleet.com (Firebase UID: test-user-123)');
    console.log('3. Billing User: billing@abrafleet.com (Firebase UID: billing-user-123)');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 MongoDB connection closed');
    }
  }
}

// Run the fix
fixItemBillingPermissions().catch(console.error);