// Create a test user with billing permissions
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function createTestBillingUser() {
  console.log('🔧 Creating test user with billing permissions...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Create test user in admin_users collection with billing permissions
    const testUser = {
      firebaseUid: 'test-user-123',
      email: 'test@abrafleet.com',
      name: 'Test User',
      role: 'admin',
      isActive: true,
      status: 'active',
      permissions: {
        billing: true,
        billing_items: true,
        billing_invoices: true,
        billing_customers: true,
        fleet: true,
        drivers: true,
        customers: true,
        reports: true
      },
      modules: ['billing', 'fleet', 'drivers', 'customers', 'reports'],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };
    
    // Remove existing test user if any
    await db.collection('admin_users').deleteMany({ 
      $or: [
        { firebaseUid: 'test-user-123' },
        { email: 'test@abrafleet.com' }
      ]
    });
    
    // Insert new test user
    const result = await db.collection('admin_users').insertOne(testUser);
    console.log('✅ Test user created with ID:', result.insertedId);
    
    // Also create in users collection as fallback
    await db.collection('users').deleteMany({ 
      $or: [
        { firebaseUid: 'test-user-123' },
        { email: 'test@abrafleet.com' }
      ]
    });
    
    const regularUser = {
      firebaseUid: 'test-user-123',
      email: 'test@abrafleet.com',
      name: 'Test User',
      role: 'admin',
      isActive: true,
      status: 'active',
      standardPermissions: {
        billing: true,
        fleet: true,
        drivers: true,
        customers: true,
        reports: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };
    
    const result2 = await db.collection('users').insertOne(regularUser);
    console.log('✅ Fallback user created with ID:', result2.insertedId);
    
    console.log('\n📋 Test user details:');
    console.log('   Firebase UID: test-user-123');
    console.log('   Email: test@abrafleet.com');
    console.log('   Role: admin');
    console.log('   Billing permissions: ✅ Enabled');
    console.log('\n🧪 You can now test with header: x-test-firebase-uid: test-user-123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await client.close();
  }
}

createTestBillingUser().catch(console.error);