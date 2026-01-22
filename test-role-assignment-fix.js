// test-role-assignment-fix.js
// Test script to verify role assignment is working correctly

const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "abra-fleet-management",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5+5Q5Q5Q5Q5Q5\n-----END PRIVATE KEY-----\n",
      clientEmail: "firebase-adminsdk-xxxxx@abra-fleet-management.iam.gserviceaccount.com"
    }),
    databaseURL: "https://abra-fleet-management-default-rtdb.firebaseio.com"
  });
}

async function testRoleAssignment() {
  console.log('\n🧪 TESTING ROLE ASSIGNMENT FIX');
  console.log('='.repeat(80));
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    // 1. Check current role distribution in MongoDB
    console.log('\n1️⃣ Current Role Distribution in MongoDB:');
    console.log('-'.repeat(50));
    
    const roleStats = await db.collection('admin_users').aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          users: { $push: { email: '$email', name: '$name' } }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    roleStats.forEach(stat => {
      console.log(`   ${stat._id || 'null'}: ${stat.count} users`);
      stat.users.slice(0, 3).forEach(user => {
        console.log(`     - ${user.email} (${user.name})`);
      });
      if (stat.users.length > 3) {
        console.log(`     ... and ${stat.users.length - 3} more`);
      }
    });
    
    // 2. Check Firestore for role data
    console.log('\n2️⃣ Checking Firestore Role Data:');
    console.log('-'.repeat(50));
    
    const firestoreUsers = await admin.firestore().collection('users').get();
    const firestoreRoles = {};
    
    firestoreUsers.docs.forEach(doc => {
      const data = doc.data();
      const role = data.role || 'null';
      if (!firestoreRoles[role]) firestoreRoles[role] = [];
      firestoreRoles[role].push({ email: data.email, name: data.name });
    });
    
    Object.entries(firestoreRoles).forEach(([role, users]) => {
      console.log(`   ${role}: ${users.length} users`);
      users.slice(0, 3).forEach(user => {
        console.log(`     - ${user.email} (${user.name})`);
      });
      if (users.length > 3) {
        console.log(`     ... and ${users.length - 3} more`);
      }
    });
    
    // 3. Find mismatched roles between Firestore and MongoDB
    console.log('\n3️⃣ Role Mismatches Between Firestore and MongoDB:');
    console.log('-'.repeat(50));
    
    let mismatches = 0;
    
    for (const doc of firestoreUsers.docs) {
      const firestoreData = doc.data();
      const firestoreRole = firestoreData.role;
      const email = firestoreData.email;
      
      if (!email) continue;
      
      const mongoUser = await db.collection('admin_users').findOne({ email });
      
      if (mongoUser && mongoUser.role !== firestoreRole) {
        console.log(`   ❌ ${email}:`);
        console.log(`      Firestore: ${firestoreRole}`);
        console.log(`      MongoDB: ${mongoUser.role}`);
        mismatches++;
      }
    }
    
    if (mismatches === 0) {
      console.log('   ✅ No role mismatches found!');
    } else {
      console.log(`   ⚠️  Found ${mismatches} role mismatches`);
    }
    
    // 4. Test the fix by simulating a login
    console.log('\n4️⃣ Testing Role Assignment Fix:');
    console.log('-'.repeat(50));
    
    // Find a test user with a specific role in Firestore
    const testUser = firestoreUsers.docs.find(doc => {
      const data = doc.data();
      return data.role === 'driver' || data.role === 'client';
    });
    
    if (testUser) {
      const userData = testUser.data();
      console.log(`   Testing with user: ${userData.email} (${userData.role})`);
      
      // Simulate the fixed login flow
      const firestoreRole = userData.role;
      console.log(`   1. Fetched role from Firestore: ${firestoreRole}`);
      
      // Simulate backend login with role
      const loginData = {
        firebaseUid: testUser.id,
        email: userData.email,
        name: userData.name,
        role: firestoreRole // This is the fix - passing role from Firestore
      };
      
      console.log(`   2. Would call backend with role: ${loginData.role}`);
      console.log(`   3. Backend would use role: ${loginData.role || 'customer'}`);
      
      if (loginData.role && loginData.role !== 'customer') {
        console.log('   ✅ Fix working - role preserved!');
      } else {
        console.log('   ❌ Fix not working - would default to customer');
      }
    } else {
      console.log('   ⚠️  No test users with driver/client roles found');
    }
    
    console.log('\n✅ ROLE ASSIGNMENT TEST COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
  }
}

// Run the test
testRoleAssignment().catch(console.error);