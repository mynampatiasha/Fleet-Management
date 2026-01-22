// Check Firebase Realtime Database for SOS alerts
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://abrafleet-cec94-default-rtdb.firebaseio.com/'
  });
}

async function checkSOSAlerts() {
  try {
    console.log('🔍 Checking Firebase Realtime Database for SOS alerts...\n');
    
    const db = admin.database();
    const sosRef = db.ref('sos_events');
    
    const snapshot = await sosRef.once('value');
    const data = snapshot.val();
    
    if (!data) {
      console.log('❌ No SOS alerts found in Firebase Realtime Database');
      console.log('📝 Creating a test SOS alert...\n');
      
      // Create a test SOS alert
      const testAlert = {
        customerId: 'test-customer-123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+91-9876543210',
        address: 'Test Location, Bangalore, Karnataka, India',
        
        // Driver fields
        driverId: 'test-driver-123',
        driverName: 'Test Driver',
        driverPhone: '+91-9876543211',
        
        // Vehicle fields
        vehicleReg: 'KA01AB1234',
        vehicleMake: 'Maruti',
        vehicleModel: 'Swift',
        
        // Trip fields
        tripId: 'test-trip-123',
        pickupLocation: 'Pickup Location',
        dropLocation: 'Drop Location',
        
        // Location
        gps: {
          latitude: 12.9716,
          longitude: 77.5946
        },
        
        // Status
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        
        // Police notification
        policeEmailContacted: null,
        emailSentStatus: 'not_sent',
        policeCity: 'Bangalore'
      };
      
      const newRef = sosRef.push();
      await newRef.set(testAlert);
      
      console.log('✅ Test SOS alert created successfully!');
      console.log(`📍 Alert ID: ${newRef.key}`);
      console.log(`👤 Customer: ${testAlert.customerName}`);
      console.log(`🚗 Driver: ${testAlert.driverName}`);
      console.log(`🚙 Vehicle: ${testAlert.vehicleReg}`);
      console.log(`📍 Location: ${testAlert.address}`);
      
    } else {
      console.log(`✅ Found ${Object.keys(data).length} SOS alert(s) in Firebase:`);
      console.log('');
      
      Object.entries(data).forEach(([id, alert]) => {
        console.log(`📍 Alert ID: ${id}`);
        console.log(`   Customer: ${alert.customerName || 'N/A'}`);
        console.log(`   Status: ${alert.status || 'N/A'}`);
        console.log(`   Address: ${alert.address || 'N/A'}`);
        console.log(`   Timestamp: ${alert.timestamp || 'N/A'}`);
        console.log('   ---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking SOS alerts:', error);
  }
}

checkSOSAlerts();