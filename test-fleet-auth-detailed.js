// Detailed test to debug the 403 error
const axios = require('axios');

async function testWithRealUser() {
  console.log('\n🔍 TESTING FLEET VEHICLES WITH REAL USER SCENARIO');
  console.log('='.repeat(80));
  
  try {
    // First, let's check what users exist in the database
    console.log('\n1️⃣ Checking existing users in database...');
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    // Check admin_users collection
    const adminUsers = await db.collection('admin_users').find({}).limit(5).toArray();
    console.log('Admin users found:', adminUsers.length);
    if (adminUsers.length > 0) {
      console.log('Sample admin user:', {
        email: adminUsers[0].email,
        role: adminUsers[0].role,
        firebaseUid: adminUsers[0].firebaseUid,
        status: adminUsers[0].status
      });
    }
    
    // Check users collection
    const users = await db.collection('users').find({}).limit(5).toArray();
    console.log('Regular users found:', users.length);
    if (users.length > 0) {
      console.log('Sample user:', {
        email: users[0].email,
        role: users[0].role,
        firebaseUid: users[0].firebaseUid,
        status: users[0].status
      });
    }
    
    await client.close();
    
    // Test 2: Try with test mode using an existing user
    console.log('\n2️⃣ Testing with test mode using existing user...');
    
    let testUid = 'test-admin-uid';
    if (adminUsers.length > 0 && adminUsers[0].firebaseUid) {
      testUid = adminUsers[0].firebaseUid;
      console.log('Using real Firebase UID:', testUid);
    }
    
    try {
      const response = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status', {
        headers: {
          'x-test-firebase-uid': testUid,
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Success with test mode:', response.status);
      console.log('Response data:', response.data);
    } catch (error) {
      console.log('❌ Test mode failed:', error.response?.status);
      console.log('Error details:', error.response?.data);
      
      // If it's still failing, let's check the backend logs
      console.log('\n3️⃣ The issue might be in the route itself. Let me check...');
      
      // Let's try to create a proper admin user for testing
      console.log('\n4️⃣ Creating a test admin user...');
      
      const client2 = new MongoClient('mongodb://localhost:27017');
      await client2.connect();
      const db2 = client2.db('abra_fleet_management');
      
      const testAdmin = {
        email: 'test-admin@abrafleet.com',
        firebaseUid: 'test-admin-uid-123',
        role: 'admin',
        status: 'active',
        isActive: true,
        modules: ['fleet', 'drivers', 'routes', 'customers'],
        permissions: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert or update the test admin
      await db2.collection('admin_users').replaceOne(
        { email: testAdmin.email },
        testAdmin,
        { upsert: true }
      );
      
      console.log('✅ Test admin user created/updated');
      await client2.close();
      
      // Try again with the test admin
      console.log('\n5️⃣ Testing with created admin user...');
      try {
        const response2 = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status', {
          headers: {
            'x-test-firebase-uid': 'test-admin-uid-123',
            'Authorization': 'Bearer test-token'
          }
        });
        console.log('✅ Success with created admin:', response2.status);
        console.log('Response data:', response2.data);
      } catch (error2) {
        console.log('❌ Still failing:', error2.response?.status);
        console.log('Error details:', error2.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testWithRealUser();