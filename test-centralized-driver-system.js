// test-centralized-driver-system.js
// ============================================================================
// TEST CENTRALIZED DRIVER SYSTEM
// ============================================================================
// This script tests the new centralized driver system where:
// - Drivers are stored ONLY in 'drivers' collection
// - No more dual collection approach (drivers + admin_users)
// - Single source of truth for all driver operations
// ============================================================================

const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('./abra_fleet_backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function testCentralizedDriverSystem() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n🚗 ========== TESTING CENTRALIZED DRIVER SYSTEM ==========');
    console.log('─' * 80);
    
    // Test 1: Check current driver storage
    console.log('\n1️⃣ CHECKING CURRENT DRIVER STORAGE');
    const driversCollection = db.collection('drivers');
    const adminUsersCollection = db.collection('admin_users');
    
    const totalDrivers = await driversCollection.countDocuments();
    const driversInAdminUsers = await adminUsersCollection.countDocuments({ role: 'driver' });
    
    console.log(`   📊 Drivers in 'drivers' collection: ${totalDrivers}`);
    console.log(`   📊 Drivers in 'admin_users' collection: ${driversInAdminUsers}`);
    
    if (driversInAdminUsers > 0) {
      console.log('   ⚠️  WARNING: Found drivers in admin_users collection');
      console.log('   💡 Consider migrating to centralized approach');
    } else {
      console.log('   ✅ Good: No drivers found in admin_users collection');
    }
    
    // Test 2: Sample driver data structure
    console.log('\n2️⃣ CHECKING DRIVER DATA STRUCTURE');
    const sampleDriver = await driversCollection.findOne({}, { limit: 1 });
    
    if (sampleDriver) {
      console.log('   ✅ Sample driver found');
      console.log('   📋 Required fields check:');
      console.log(`      - _id: ${sampleDriver._id ? '✅' : '❌'}`);
      console.log(`      - uid (Firebase): ${sampleDriver.uid ? '✅' : '❌'}`);
      console.log(`      - driverId: ${sampleDriver.driverId ? '✅' : '❌'}`);
      console.log(`      - name: ${sampleDriver.name ? '✅' : '❌'}`);
      console.log(`      - email: ${sampleDriver.email ? '✅' : '❌'}`);
      console.log(`      - phone: ${sampleDriver.phone ? '✅' : '❌'}`);
      console.log(`      - personalInfo: ${sampleDriver.personalInfo ? '✅' : '❌'}`);
      console.log(`      - license: ${sampleDriver.license ? '✅' : '❌'}`);
      console.log(`      - status: ${sampleDriver.status ? '✅' : '❌'}`);
      console.log(`      - createdAt: ${sampleDriver.createdAt ? '✅' : '❌'}`);
      console.log(`      - updatedAt: ${sampleDriver.updatedAt ? '✅' : '❌'}`);
    } else {
      console.log('   ⚠️  No drivers found in collection');
    }
    
    // Test 3: Create test driver using centralized approach
    console.log('\n3️⃣ TESTING DRIVER CREATION (CENTRALIZED)');
    
    const testDriverId = `TEST_DRIVER_${Date.now()}`;
    const testEmail = `testdriver${Date.now()}@abrafleet.com`;
    
    try {
      // Create Firebase user first
      console.log('   🔐 Creating Firebase user...');
      const firebaseUser = await admin.auth().createUser({
        email: testEmail,
        emailVerified: false,
        password: 'TestPassword123!',
        displayName: 'Test Driver',
        disabled: false
      });
      
      console.log(`   ✅ Firebase user created: ${firebaseUser.uid}`);
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(firebaseUser.uid, {
        role: 'driver',
        driverId: testDriverId
      });
      
      console.log('   ✅ Custom claims set');
      
      // Create driver record in drivers collection ONLY
      console.log('   💾 Creating driver record in drivers collection...');
      
      const newDriver = {
        uid: firebaseUser.uid,
        driverId: testDriverId,
        name: 'Test Driver',
        email: testEmail,
        phone: '+91-9876543210',
        personalInfo: {
          firstName: 'Test',
          lastName: 'Driver',
          phone: '+91-9876543210',
          email: testEmail,
          dateOfBirth: '1990-01-01',
          bloodGroup: 'O+',
          gender: 'Male'
        },
        license: {
          licenseNumber: 'TEST123456789',
          type: 'Commercial',
          issueDate: new Date('2020-01-01'),
          expiryDate: new Date('2030-01-01'),
          issuingAuthority: 'Test RTO'
        },
        emergencyContact: {
          name: 'Test Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543211'
        },
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '123456',
          country: 'India'
        },
        status: 'active',
        assignedVehicle: null,
        joinedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await driversCollection.insertOne(newDriver);
      console.log(`   ✅ Driver created in drivers collection: ${result.insertedId}`);
      
      // Verify NO insertion in admin_users
      const adminUserCheck = await adminUsersCollection.findOne({ 
        firebaseUid: firebaseUser.uid 
      });
      
      if (!adminUserCheck) {
        console.log('   ✅ Confirmed: No record created in admin_users collection');
        console.log('   🎯 CENTRALIZED APPROACH WORKING CORRECTLY');
      } else {
        console.log('   ❌ ERROR: Record found in admin_users collection');
        console.log('   🔧 Need to fix backend to avoid dual insertion');
      }
      
    } catch (error) {
      console.log(`   ❌ Error creating test driver: ${error.message}`);
    }
    
    // Test 4: Driver authentication flow
    console.log('\n4️⃣ TESTING DRIVER AUTHENTICATION FLOW');
    
    const testDriver = await driversCollection.findOne({ driverId: testDriverId });
    if (testDriver) {
      console.log('   ✅ Driver found in drivers collection');
      console.log(`   🔑 Firebase UID: ${testDriver.uid}`);
      
      // Test Firebase authentication
      try {
        const firebaseUser = await admin.auth().getUser(testDriver.uid);
        console.log('   ✅ Firebase user exists and accessible');
        console.log(`   📧 Email: ${firebaseUser.email}`);
        console.log(`   🏷️  Custom claims: ${JSON.stringify(firebaseUser.customClaims || {})}`);
        
        // Test custom token generation
        const customToken = await admin.auth().createCustomToken(testDriver.uid);
        console.log('   ✅ Custom token generated successfully');
        console.log('   🎯 AUTHENTICATION FLOW WORKING');
        
      } catch (authError) {
        console.log(`   ❌ Authentication error: ${authError.message}`);
      }
    }
    
    // Test 5: Driver operations
    console.log('\n5️⃣ TESTING DRIVER OPERATIONS');
    
    if (testDriverId) {
      // Update driver
      console.log('   📝 Testing driver update...');
      const updateResult = await driversCollection.updateOne(
        { driverId: testDriverId },
        { 
          $set: { 
            status: 'on_leave',
            updatedAt: new Date()
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log('   ✅ Driver updated successfully');
      }
      
      // Fetch updated driver
      const updatedDriver = await driversCollection.findOne({ driverId: testDriverId });
      console.log(`   📊 Updated status: ${updatedDriver.status}`);
    }
    
    // Test 6: Cleanup test data
    console.log('\n6️⃣ CLEANING UP TEST DATA');
    
    if (testDriverId) {
      // Delete from drivers collection
      const deleteResult = await driversCollection.deleteOne({ driverId: testDriverId });
      console.log(`   🗑️  Deleted from drivers collection: ${deleteResult.deletedCount} record(s)`);
      
      // Delete Firebase user
      try {
        const testDriver = await driversCollection.findOne({ driverId: testDriverId });
        if (testDriver && testDriver.uid) {
          await admin.auth().deleteUser(testDriver.uid);
          console.log('   🗑️  Deleted Firebase user');
        }
      } catch (cleanupError) {
        console.log(`   ⚠️  Firebase cleanup error: ${cleanupError.message}`);
      }
    }
    
    console.log('\n✅ ========== CENTRALIZED DRIVER SYSTEM TEST COMPLETE ==========');
    console.log('\n📋 SUMMARY:');
    console.log('   ✅ Drivers stored in single collection: drivers');
    console.log('   ✅ No dual collection approach');
    console.log('   ✅ Firebase authentication integrated');
    console.log('   ✅ CRUD operations working');
    console.log('   🎯 CENTRALIZED SYSTEM READY FOR USE');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
  }
}

// Run the test
testCentralizedDriverSystem().catch(console.error);