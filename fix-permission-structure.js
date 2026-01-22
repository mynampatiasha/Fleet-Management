// Fix Permission Structure
// ============================================================================
// This script fixes the permission structure to match AdminUser model expectations
// ============================================================================

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function fixPermissionStructure() {
  console.log('🔧 FIXING PERMISSION STRUCTURE');
  console.log('=' * 80);
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');

    // Fix admin@abrafleet.com permissions
    console.log('\n1️⃣ Fixing admin@abrafleet.com permissions...');
    
    const adminPermissions = {
      billing: { can_access: true, edit_delete: true },
      billing_items: { can_access: true, edit_delete: true },
      billing_invoices: { can_access: true, edit_delete: true },
      billing_customers: { can_access: true, edit_delete: true },
      fleet: { can_access: true, edit_delete: true },
      fleet_vehicles: { can_access: true, edit_delete: true },
      fleet_management: { can_access: true, edit_delete: true },
      drivers: { can_access: true, edit_delete: true },
      customers: { can_access: true, edit_delete: true },
      routes: { can_access: true, edit_delete: true },
      reports: { can_access: true, edit_delete: true },
      dashboard: { can_access: true, edit_delete: true }
    };

    await db.collection('admin_users').updateOne(
      { email: 'admin@abrafleet.com' },
      { 
        $set: { 
          permissions: adminPermissions,
          isActive: true,
          role: 'super_admin'
        } 
      }
    );
    console.log('✅ Admin permissions fixed');

    // Fix test@abrafleet.com permissions
    console.log('\n2️⃣ Fixing test@abrafleet.com permissions...');
    
    const testPermissions = {
      billing: { can_access: true, edit_delete: true },
      billing_items: { can_access: true, edit_delete: true },
      billing_invoices: { can_access: true, edit_delete: true },
      billing_customers: { can_access: true, edit_delete: true },
      dashboard: { can_access: true, edit_delete: false }
    };

    await db.collection('admin_users').updateOne(
      { email: 'test@abrafleet.com' },
      { 
        $set: { 
          permissions: testPermissions,
          isActive: true,
          role: 'admin'
        } 
      }
    );
    console.log('✅ Test user permissions fixed');

    // Verify the changes
    console.log('\n3️⃣ Verifying changes...');
    
    const updatedAdmin = await db.collection('admin_users').findOne({ email: 'admin@abrafleet.com' });
    console.log('Admin user permissions:');
    console.log('  Type:', typeof updatedAdmin.permissions);
    console.log('  Structure:', JSON.stringify(updatedAdmin.permissions, null, 2));
    
    const updatedTest = await db.collection('admin_users').findOne({ email: 'test@abrafleet.com' });
    console.log('Test user permissions:');
    console.log('  Type:', typeof updatedTest.permissions);
    console.log('  Structure:', JSON.stringify(updatedTest.permissions, null, 2));

    // Test permission checking logic
    console.log('\n4️⃣ Testing permission checking logic...');
    
    if (updatedAdmin.permissions) {
      const billingPerm = updatedAdmin.permissions.billing;
      console.log('Admin billing permission:', billingPerm);
      console.log('  can_access:', billingPerm?.can_access);
      console.log('  edit_delete:', billingPerm?.edit_delete);
    }

    console.log('\n✅ PERMISSION STRUCTURE FIXED!');

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
fixPermissionStructure().catch(console.error);