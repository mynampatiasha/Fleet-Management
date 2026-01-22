// Debug Permission Structure
// ============================================================================
// This script checks the exact permission structure in the database
// ============================================================================

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function debugPermissionStructure() {
  console.log('🔍 DEBUGGING PERMISSION STRUCTURE');
  console.log('=' * 80);
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');

    // Check admin user structure
    console.log('\n1️⃣ Checking admin@abrafleet.com structure...');
    const adminUser = await db.collection('admin_users').findOne({ email: 'admin@abrafleet.com' });
    if (adminUser) {
      console.log('Admin user found:');
      console.log('  Email:', adminUser.email);
      console.log('  Role:', adminUser.role);
      console.log('  IsActive:', adminUser.isActive);
      console.log('  FirebaseUid:', adminUser.firebaseUid);
      console.log('  Permissions type:', typeof adminUser.permissions);
      console.log('  Permissions:', JSON.stringify(adminUser.permissions, null, 2));
      
      // Check if permissions is a Map
      if (adminUser.permissions instanceof Map) {
        console.log('  Permissions is a Map with keys:', Array.from(adminUser.permissions.keys()));
      } else if (typeof adminUser.permissions === 'object') {
        console.log('  Permissions is an object with keys:', Object.keys(adminUser.permissions));
      }
    } else {
      console.log('❌ Admin user not found');
    }

    // Check test user structure
    console.log('\n2️⃣ Checking test@abrafleet.com structure...');
    const testUser = await db.collection('admin_users').findOne({ email: 'test@abrafleet.com' });
    if (testUser) {
      console.log('Test user found:');
      console.log('  Email:', testUser.email);
      console.log('  Role:', testUser.role);
      console.log('  IsActive:', testUser.isActive);
      console.log('  FirebaseUid:', testUser.firebaseUid);
      console.log('  Permissions type:', typeof testUser.permissions);
      console.log('  Permissions:', JSON.stringify(testUser.permissions, null, 2));
    } else {
      console.log('❌ Test user not found');
    }

    // Check regular user structure
    console.log('\n3️⃣ Checking billing@abrafleet.com structure...');
    const billingUser = await db.collection('users').findOne({ email: 'billing@abrafleet.com' });
    if (billingUser) {
      console.log('Billing user found:');
      console.log('  Email:', billingUser.email);
      console.log('  Role:', billingUser.role);
      console.log('  IsActive:', billingUser.isActive);
      console.log('  FirebaseUid:', billingUser.firebaseUid);
      console.log('  StandardPermissions:', billingUser.standardPermissions);
    } else {
      console.log('❌ Billing user not found');
    }

    // Test permission checking logic
    console.log('\n4️⃣ Testing permission checking logic...');
    
    if (adminUser && adminUser.permissions) {
      const permissions = adminUser.permissions;
      
      // Test different ways to check billing permission
      console.log('Testing billing permission checks:');
      console.log('  permissions.billing:', permissions.billing);
      console.log('  permissions["billing"]:', permissions["billing"]);
      console.log('  Has billing key:', 'billing' in permissions);
      console.log('  Keys starting with billing:', Object.keys(permissions).filter(k => k.startsWith('billing')));
      
      // Check if it's a Map
      if (permissions instanceof Map) {
        console.log('  Map has billing:', permissions.has('billing'));
        console.log('  Map billing value:', permissions.get('billing'));
      }
    }

  } catch (error) {
    console.error('❌ Error debugging permissions:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 MongoDB connection closed');
    }
  }
}

// Run the debug
debugPermissionStructure().catch(console.error);