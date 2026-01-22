const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');
const axios = require('axios');

/**
 * Comprehensive test script for Firebase UID system
 */

// Test configuration
const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  testEmail: 'firebase-uid-test@example.com',
  testUser: {
    name: 'Firebase Test User',
    email: 'firebase-uid-test@example.com',
    password: 'TestPassword123!',
    role: 'driver'
  }
};

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./abra_fleet_backend/config/firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://abra-fleet-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    process.exit(1);
  }
}

class FirebaseUidTester {
  constructor() {
    this.client = null;
    this.db = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async setup() {
    try {
      // Connect to MongoDB
      console.log('🔌 Connecting to MongoDB...');
      this.client = new MongoClient(config.mongoUri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Connected to MongoDB');

      // Clean up any existing test data
      await this.cleanup();
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up test data...');
      
      // Remove test user from MongoDB collections
      const collections = ['drivers', 'employee_admins', 'admin_users', 'customers', 'users'];
      for (const collection of collections) {
        await this.db.collection(collection).deleteMany({ 
          email: config.testEmail 
        });
      }

      // Remove test user from Firebase Auth
      try {
        const user = await admin.auth().getUserByEmail(config.testEmail);
        await admin.auth().deleteUser(user.uid);
        console.log('✅ Test user removed from Firebase Auth');
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          console.warn('⚠️ Could not remove test user from Firebase:', error.message);
        }
      }

    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      await testFunction();
      this.testResults.passed++;
      this.testResults.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ Test passed: ${testName}`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      console.error(`❌ Test failed: ${testName} - ${error.message}`);
    }
  }

  async testDirectUserCreation() {
    // Test creating user directly in MongoDB and checking Firebase UID generation
    const testUser = {
      ...config.testUser,
      email: 'direct-test@example.com'
    };

    // Create user in MongoDB without Firebase UID
    await this.db.collection('drivers').insertOne(testUser);

    // Use Firebase UID Manager to ensure UID
    const FirebaseUidManager = require('./abra_fleet_backend/utils/firebase_uid_manager');
    const uidManager = new FirebaseUidManager(this.db);
    
    const result = await uidManager.ensureFirebaseUid(testUser.email, {
      displayName: testUser.name,
      role: testUser.role
    });

    if (!result.success) {
      throw new Error('Firebase UID generation failed');
    }

    // Verify user exists in Firebase
    const firebaseUser = await admin.auth().getUser(result.firebaseUid);
    if (firebaseUser.email !== testUser.email) {
      throw new Error('Firebase user email mismatch');
    }

    // Verify MongoDB record updated
    const dbUser = await this.db.collection('drivers').findOne({ email: testUser.email });
    if (dbUser.firebaseUid !== result.firebaseUid) {
      throw new Error('MongoDB Firebase UID not updated');
    }

    // Cleanup
    await this.db.collection('drivers').deleteOne({ email: testUser.email });
    await admin.auth().deleteUser(result.firebaseUid);
  }

  async testApiUserCreation() {
    // Test user creation via API endpoint
    try {
      const response = await axios.post(`${config.backendUrl}/api/admin/drivers`, {
        personalInfo: {
          firstName: 'API',
          lastName: 'Test',
          email: 'api-test@example.com',
          phone: '1234567890'
        },
        vehicleInfo: {
          vehicleNumber: 'TEST123',
          vehicleType: 'Car'
        }
      });

      if (!response.data.success) {
        throw new Error('API user creation failed');
      }

      if (!response.data.firebaseInfo || !response.data.firebaseInfo.firebaseUid) {
        throw new Error('Firebase UID not returned in API response');
      }

      // Verify Firebase user exists
      const firebaseUser = await admin.auth().getUser(response.data.firebaseInfo.firebaseUid);
      if (firebaseUser.email !== 'api-test@example.com') {
        throw new Error('Firebase user not created correctly');
      }

      // Cleanup
      await this.db.collection('drivers').deleteOne({ email: 'api-test@example.com' });
      await admin.auth().deleteUser(response.data.firebaseInfo.firebaseUid);

    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || error.response.data}`);
      }
      throw error;
    }
  }

  async testBulkImport() {
    // Test bulk import functionality
    const bulkUsers = [
      {
        name: 'Bulk User 1',
        email: 'bulk1@example.com',
        role: 'driver'
      },
      {
        name: 'Bulk User 2', 
        email: 'bulk2@example.com',
        role: 'driver'
      }
    ];

    try {
      const response = await axios.post(`${config.backendUrl}/api/admin/drivers/bulk-import`, {
        drivers: bulkUsers
      });

      if (!response.data.success) {
        throw new Error('Bulk import API failed');
      }

      if (!response.data.firebaseBulkResults) {
        throw new Error('Firebase bulk results not returned');
      }

      const results = response.data.firebaseBulkResults;
      if (results.success !== bulkUsers.length) {
        throw new Error(`Expected ${bulkUsers.length} successful Firebase creations, got ${results.success}`);
      }

      // Verify Firebase users exist
      for (const user of bulkUsers) {
        try {
          const firebaseUser = await admin.auth().getUserByEmail(user.email);
          console.log(`✅ Firebase user verified: ${user.email}`);
          
          // Cleanup
          await admin.auth().deleteUser(firebaseUser.uid);
        } catch (error) {
          throw new Error(`Firebase user not found: ${user.email}`);
        }
      }

      // Cleanup MongoDB
      await this.db.collection('drivers').deleteMany({
        email: { $in: bulkUsers.map(u => u.email) }
      });

    } catch (error) {
      if (error.response) {
        throw new Error(`Bulk Import API Error: ${error.response.status} - ${error.response.data.message || error.response.data}`);
      }
      throw error;
    }
  }

  async testExistingUserUpdate() {
    // Test updating existing user without Firebase UID
    const testUser = {
      name: 'Update Test User',
      email: 'update-test@example.com',
      role: 'employee'
    };

    // Create user in MongoDB without Firebase UID
    const insertResult = await this.db.collection('employee_admins').insertOne(testUser);
    const userId = insertResult.insertedId;

    try {
      // Update user via API
      const response = await axios.put(`${config.backendUrl}/api/admin/employees/${userId}`, {
        name: 'Updated Test User',
        email: testUser.email
      });

      if (!response.data.success) {
        throw new Error('User update API failed');
      }

      // Check if Firebase UID was generated during update
      const updatedUser = await this.db.collection('employee_admins').findOne({ _id: userId });
      
      if (updatedUser.firebaseUid) {
        // Verify Firebase user exists
        const firebaseUser = await admin.auth().getUser(updatedUser.firebaseUid);
        if (firebaseUser.email !== testUser.email) {
          throw new Error('Firebase user email mismatch after update');
        }
        
        // Cleanup Firebase
        await admin.auth().deleteUser(updatedUser.firebaseUid);
      }

      // Cleanup MongoDB
      await this.db.collection('employee_admins').deleteOne({ _id: userId });

    } catch (error) {
      // Cleanup on error
      await this.db.collection('employee_admins').deleteOne({ _id: userId });
      
      if (error.response) {
        throw new Error(`Update API Error: ${error.response.status} - ${error.response.data.message || error.response.data}`);
      }
      throw error;
    }
  }

  async testBackfillScript() {
    // Test the backfill script functionality
    const testUsers = [
      { name: 'Backfill User 1', email: 'backfill1@example.com', role: 'driver' },
      { name: 'Backfill User 2', email: 'backfill2@example.com', role: 'employee' }
    ];

    // Create users without Firebase UID
    await this.db.collection('drivers').insertOne(testUsers[0]);
    await this.db.collection('employee_admins').insertOne(testUsers[1]);

    // Run backfill
    const FirebaseUidManager = require('./abra_fleet_backend/utils/firebase_uid_manager');
    const uidManager = new FirebaseUidManager(this.db);

    const results1 = await uidManager.backfillMissingFirebaseUids('drivers', 10);
    const results2 = await uidManager.backfillMissingFirebaseUids('employee_admins', 10);

    if (results1.success < 1 || results2.success < 1) {
      throw new Error('Backfill script did not process users correctly');
    }

    // Verify Firebase users created
    for (const user of testUsers) {
      try {
        const firebaseUser = await admin.auth().getUserByEmail(user.email);
        console.log(`✅ Backfilled Firebase user verified: ${user.email}`);
        
        // Cleanup
        await admin.auth().deleteUser(firebaseUser.uid);
      } catch (error) {
        throw new Error(`Backfilled Firebase user not found: ${user.email}`);
      }
    }

    // Cleanup MongoDB
    await this.db.collection('drivers').deleteOne({ email: testUsers[0].email });
    await this.db.collection('employee_admins').deleteOne({ email: testUsers[1].email });
  }

  async runAllTests() {
    console.log('🚀 Starting Firebase UID System Tests...\n');

    await this.setup();

    // Run all tests
    await this.runTest('Direct User Creation', () => this.testDirectUserCreation());
    await this.runTest('API User Creation', () => this.testApiUserCreation());
    await this.runTest('Bulk Import', () => this.testBulkImport());
    await this.runTest('Existing User Update', () => this.testExistingUserUpdate());
    await this.runTest('Backfill Script', () => this.testBackfillScript());

    // Print results
    console.log('\n📊 ========== TEST RESULTS ==========');
    console.log(`Total tests: ${this.testResults.passed + this.testResults.failed}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    console.log('\n📋 Test Details:');
    this.testResults.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Firebase UID system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }

    await this.cleanup();
  }

  async teardown() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new FirebaseUidTester();
  
  tester.runAllTests()
    .then(() => {
      console.log('\n✅ Test suite completed!');
      process.exit(tester.testResults.failed === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      tester.teardown();
    });
}

module.exports = FirebaseUidTester;