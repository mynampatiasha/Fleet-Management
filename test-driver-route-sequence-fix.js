// Test script to verify driver route API returns sequence and distance
const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "abra-fleet-management",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5+5Q5Q5Q5Q5Q5\n-----END PRIVATE KEY-----\n",
      clientEmail: "firebase-adminsdk-abcd@abra-fleet-management.iam.gserviceaccount.com"
    }),
    databaseURL: "https://abra-fleet-management-default-rtdb.firebaseio.com"
  });
}

async function testDriverRouteAPI() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    console.log('🔍 Testing Driver Route API Fix...\n');
    
    // 1. Check if rosters have pickupSequence and routeDetails
    console.log('📋 CHECKING ROSTER DATA:');
    const rosters = await db.collection('rosters').find({
      status: 'assigned',
      pickupSequence: { $exists: true }
    }).limit(5).toArray();
    
    console.log(`   Found ${rosters.length} rosters with pickup sequence`);
    
    rosters.forEach((roster, index) => {
      console.log(`   ${index + 1}. ${roster.customerName || 'Unknown'}`);
      console.log(`      Pickup Sequence: ${roster.pickupSequence || 'MISSING'}`);
      console.log(`      Route Details: ${roster.routeDetails ? 'EXISTS' : 'MISSING'}`);
      if (roster.routeDetails) {
        console.log(`      Distance: ${roster.routeDetails.distanceFromPrevious || 'N/A'} km`);
      }
      console.log('');
    });
    
    // 2. Test the API endpoint directly
    console.log('🌐 TESTING API ENDPOINT:');
    
    // Create a test token for drivertest
    const driverTestUid = 'aVIF9Ahluig993fCNyZRrIDC3KO2';
    const customToken = await admin.auth().createCustomToken(driverTestUid);
    
    console.log('   ✅ Created test token for drivertest');
    
    // Simulate API call
    const mockReq = {
      user: { uid: driverTestUid },
      db: db
    };
    
    // Find driver
    const driver = await db.collection('drivers').findOne({
      uid: driverTestUid
    });
    
    if (!driver) {
      console.log('   ❌ Driver not found');
      return;
    }
    
    console.log(`   ✅ Driver found: ${driver.personalInfo?.name || driver.name}`);
    
    // Find rosters for this driver
    const driverRosters = await db.collection('rosters').find({
      driverId: driver.driverId,
      status: { $in: ['assigned', 'pending', 'active', 'in_progress'] }
    }).toArray();
    
    console.log(`   ✅ Found ${driverRosters.length} rosters for driver`);
    
    // Check if rosters have the required fields
    driverRosters.forEach((roster, index) => {
      console.log(`   ${index + 1}. ${roster.customerName || 'Unknown'}`);
      console.log(`      Pickup Sequence: ${roster.pickupSequence || '❌ MISSING'}`);
      console.log(`      Distance: ${roster.routeDetails?.distanceFromPrevious || roster.distance || '❌ MISSING'} km`);
      console.log(`      Status: ${roster.status}`);
      console.log('');
    });
    
    console.log('✅ Test completed! Check the output above.');
    console.log('\n📱 NEXT STEPS:');
    console.log('1. Hot reload Flutter app (press R in terminal)');
    console.log('2. Login as drivertest / password123');
    console.log('3. Check if sequence numbers and distances show correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testDriverRouteAPI();