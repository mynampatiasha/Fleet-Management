// Test script to check driver's Firestore access
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up your service account)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Or use service account key file
  });
}

const db = admin.firestore();

async function testDriverAccess() {
  try {
    console.log('🔍 Testing driver Firestore access...');
    
    // Get all users with role 'driver'
    const driversSnapshot = await db.collection('users')
      .where('role', '==', 'driver')
      .get();
    
    console.log(`📊 Found ${driversSnapshot.size} drivers in Firestore`);
    
    driversSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 Driver: ${data.email} (UID: ${doc.id})`);
      console.log(`   - Name: ${data.name || 'N/A'}`);
      console.log(`   - Role: ${data.role}`);
      console.log(`   - Status: ${data.status || 'N/A'}`);
      console.log(`   - Created: ${data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : 'N/A'}`);
      console.log('---');
    });
    
    // Test specific driver email if provided
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log(`🔍 Testing specific driver: ${testEmail}`);
      
      const userSnapshot = await db.collection('users')
        .where('email', '==', testEmail)
        .get();
      
      if (userSnapshot.empty) {
        console.log(`❌ No user found with email: ${testEmail}`);
      } else {
        userSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`✅ Found user: ${data.email}`);
          console.log(`   - UID: ${doc.id}`);
          console.log(`   - Role: ${data.role}`);
          console.log(`   - Data:`, JSON.stringify(data, null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing driver access:', error);
  }
}

// Run the test
testDriverAccess().then(() => {
  console.log('✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});