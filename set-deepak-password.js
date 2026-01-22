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

async function setDeepakPassword() {
  try {
    const email = 'deepak.joshi@abrafleet.com';
    const newPassword = 'Deepak123!';
    
    console.log('🔍 Setting password for:', email);
    
    // Check if user exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('✅ Found existing Firebase user:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ User not found. Creating new Firebase user...');
        
        // Create new Firebase user
        userRecord = await admin.auth().createUser({
          email: email,
          emailVerified: true,
          password: newPassword,
          displayName: 'Deepak Joshi',
          disabled: false
        });
        
        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: 'driver',
          driverId: 'DRV-100012'
        });
        
        console.log('✅ Created new Firebase user:', userRecord.uid);
        console.log('✅ Password set to:', newPassword);
        return;
      } else {
        throw error;
      }
    }
    
    // Update existing user's password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
      emailVerified: true
    });
    
    // Ensure custom claims are set
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'driver',
      driverId: 'DRV-100012'
    });
    
    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS FOR DEEPAK JOSHI:');
    console.log('=====================================');
    console.log('Email:', email);
    console.log('Password:', newPassword);
    console.log('Driver ID: DRV-100012');
    console.log('Vehicle: KA07JK1234');
    console.log('Firebase UID:', userRecord.uid);
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Error setting password:', error.message);
  }
}

setDeepakPassword();