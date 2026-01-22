const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./abra_fleet_backend/serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://abra-fleet-default-rtdb.firebaseio.com'
    });
  } catch (error) {
    console.log('Firebase initialization error:', error.message);
    process.exit(1);
  }
}

async function checkFirebaseUser() {
  try {
    const email = 'deepak.joshi@abrafleet.com';
    console.log('🔍 Checking Firebase Auth for:', email);
    
    // Try to get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    console.log('\n✅ Found Firebase user:');
    console.log('UID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('Display Name:', userRecord.displayName);
    console.log('Email Verified:', userRecord.emailVerified);
    console.log('Disabled:', userRecord.disabled);
    console.log('Created:', new Date(userRecord.metadata.creationTime));
    console.log('Last Sign In:', userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : 'Never');
    
    // Check custom claims
    if (userRecord.customClaims) {
      console.log('Custom Claims:', userRecord.customClaims);
    }
    
    console.log('\n⚠️  NOTE: Firebase Auth does not store passwords in plain text.');
    console.log('The password was set when the account was created, but cannot be retrieved.');
    console.log('If you need to test login, you may need to:');
    console.log('1. Reset the password using Firebase Auth');
    console.log('2. Or create a new test password');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ No Firebase user found for deepak.joshi@abrafleet.com');
      console.log('\n🔧 This means the driver exists in MongoDB but not in Firebase Auth.');
      console.log('You need to create a Firebase Auth account for this driver.');
    } else {
      console.error('Error checking Firebase user:', error.message);
    }
  }
}

checkFirebaseUser();