// Quick script to check driver profile in Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./abra_fleet_backend/serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkDriverProfile() {
  try {
    console.log('🔍 Checking driver profiles in Firestore...');
    
    // Get all users with role 'driver'
    const driversQuery = await db.collection('users')
      .where('role', '==', 'driver')
      .get();
    
    console.log(`📊 Found ${driversQuery.size} drivers in Firestore`);
    
    if (driversQuery.empty) {
      console.log('❌ No drivers found in Firestore users collection');
      
      // Check if there are any users at all
      const allUsersQuery = await db.collection('users').limit(5).get();
      console.log(`📊 Total users in collection: ${allUsersQuery.size}`);
      
      allUsersQuery.forEach(doc => {
        const data = doc.data();
        console.log(`👤 User: ${data.email} - Role: ${data.role}`);
      });
      
      return;
    }
    
    // Show driver details
    driversQuery.forEach(doc => {
      const data = doc.data();
      console.log(`\n👤 Driver Found:`);
      console.log(`   - Document ID: ${doc.id}`);
      console.log(`   - Email: ${data.email}`);
      console.log(`   - Name: ${data.name || 'N/A'}`);
      console.log(`   - Role: ${data.role}`);
      console.log(`   - Phone: ${data.phoneNumber || 'N/A'}`);
      console.log(`   - Status: ${data.status || 'N/A'}`);
      console.log(`   - License: ${data.licenseNumber || 'N/A'}`);
      console.log(`   - Created: ${data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : 'N/A'}`);
      console.log(`   - Firebase UID: ${data.firebaseUid || 'N/A'}`);
    });
    
    // Test Firebase Auth users
    console.log('\n🔍 Checking Firebase Auth users...');
    const listUsersResult = await admin.auth().listUsers(10);
    
    const driverAuthUsers = listUsersResult.users.filter(user => 
      user.email && user.email.includes('driver') || user.email.includes('test')
    );
    
    console.log(`📊 Found ${driverAuthUsers.length} potential driver auth users`);
    
    driverAuthUsers.forEach(user => {
      console.log(`\n🔐 Auth User:`);
      console.log(`   - UID: ${user.uid}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Display Name: ${user.displayName || 'N/A'}`);
      console.log(`   - Email Verified: ${user.emailVerified}`);
      console.log(`   - Created: ${user.metadata.creationTime}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking driver profile:', error);
  }
}

// Run the check
checkDriverProfile().then(() => {
  console.log('\n✅ Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});