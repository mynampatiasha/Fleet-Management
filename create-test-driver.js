// Script to create a test driver for testing the profile page
const admin = require('firebase-admin');
const serviceAccount = require('./abra_fleet_backend/serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function createTestDriver() {
  try {
    const testDriverEmail = 'drivertest@abrafleet.com';
    const testDriverPassword = 'driver123';
    
    console.log('🔍 Creating test driver...');
    
    // Check if driver already exists in Firebase Auth
    let driverUser;
    try {
      driverUser = await admin.auth().getUserByEmail(testDriverEmail);
      console.log(`✅ Driver already exists in Firebase Auth: ${driverUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 Creating driver in Firebase Auth...');
        driverUser = await admin.auth().createUser({
          email: testDriverEmail,
          password: testDriverPassword,
          displayName: 'Test Driver',
          emailVerified: true,
        });
        console.log(`✅ Driver created in Firebase Auth: ${driverUser.uid}`);
      } else {
        throw error;
      }
    }
    
    // Check if driver exists in Firestore
    const driverDoc = await db.collection('users').doc(driverUser.uid).get();
    
    if (driverDoc.exists) {
      console.log('✅ Driver already exists in Firestore');
      const data = driverDoc.data();
      console.log(`   - Email: ${data.email}`);
      console.log(`   - Role: ${data.role}`);
      console.log(`   - Name: ${data.name}`);
    } else {
      console.log('📝 Creating driver in Firestore...');
      
      const driverData = {
        email: testDriverEmail,
        name: 'Test Driver',
        role: 'driver',
        phoneNumber: '+1234567890',
        licenseNumber: 'DL123456789',
        status: 'Active',
        firebaseUid: driverUser.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        authProvider: 'email_password',
        address: '123 Test Street, Test City',
      };
      
      await db.collection('users').doc(driverUser.uid).set(driverData);
      console.log('✅ Driver created in Firestore');
    }
    
    // Also check if driver exists in MongoDB via backend
    console.log('\n🔍 Checking MongoDB backend...');
    
    // You can add backend API call here if needed
    console.log('ℹ️  Please ensure the driver also exists in MongoDB backend');
    console.log(`   - Email: ${testDriverEmail}`);
    console.log(`   - Password: ${testDriverPassword}`);
    console.log(`   - Firebase UID: ${driverUser.uid}`);
    
    console.log('\n✅ Test driver setup completed!');
    console.log('\n📋 Login Credentials:');
    console.log(`   - Email: ${testDriverEmail}`);
    console.log(`   - Password: ${testDriverPassword}`);
    
  } catch (error) {
    console.error('❌ Error creating test driver:', error);
  }
}

// Run the creation
createTestDriver().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});