// debug-customer123-roster-issue.js
// Debug the customer123 roster issue step by step

const axios = require('axios');
const { MongoClient } = require('mongodb');

const BACKEND_URL = 'http://localhost:3001';
const MONGODB_URI = 'mongodb://localhost:27017/abra_fleet';

async function debugCustomer123Issue() {
  console.log('🔍 DEBUGGING CUSTOMER123 ROSTER ISSUE');
  console.log('='.repeat(60));
  
  let client;
  
  try {
    // Connect to MongoDB directly
    console.log('\n1️⃣ Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    console.log('✅ Connected to MongoDB');
    
    // From the Flutter logs, we know:
    const firebaseUid = 'b5aoloVR7xYI6SICibCIWecBaf82';
    const email = 'customer123@abrafleet.com';
    
    console.log('\n2️⃣ Checking user in all collections...');
    const collections = ['users', 'admin_users', 'customers', 'clients', 'drivers'];
    
    for (const collectionName of collections) {
      const user = await db.collection(collectionName).findOne({
        $or: [
          { firebaseUid: firebaseUid },
          { email: email }
        ]
      });
      
      if (user) {
        console.log(`✅ Found user in ${collectionName}:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Firebase UID: ${user.firebaseUid}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.createdAt}`);
      } else {
        console.log(`❌ No user found in ${collectionName}`);
      }
    }
    
    console.log('\n3️⃣ Checking rosters for customer123...');
    
    // Check rosters by email
    const rostersByEmail = await db.collection('rosters').find({
      $or: [
        { customerEmail: email },
        { 'employeeDetails.email': email },
        { 'employeeData.email': email }
      ]
    }).toArray();
    
    console.log(`📋 Found ${rostersByEmail.length} rosters by email`);
    
    if (rostersByEmail.length > 0) {
      console.log('\n   Sample roster:');
      const sample = rostersByEmail[0];
      console.log(`   ID: ${sample._id}`);
      console.log(`   Customer Email: ${sample.customerEmail}`);
      console.log(`   Customer Name: ${sample.customerName}`);
      console.log(`   Customer ID: ${sample.customerId}`);
      console.log(`   Customer Firebase UID: ${sample.customerFirebaseUid}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Office Location: ${sample.officeLocation}`);
      console.log(`   Roster Type: ${sample.rosterType}`);
      console.log(`   Created: ${sample.createdAt}`);
    }
    
    // Check rosters by Firebase UID
    const rostersByUid = await db.collection('rosters').find({
      $or: [
        { customerId: firebaseUid },
        { customerFirebaseUid: firebaseUid }
      ]
    }).toArray();
    
    console.log(`📋 Found ${rostersByUid.length} rosters by Firebase UID`);
    
    console.log('\n4️⃣ Testing API with real token...');
    
    // Test the my-rosters endpoint with the actual Firebase UID
    try {
      const response = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 10000
      });
      
      console.log('✅ API Response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${response.data.success}`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Count: ${response.data.count}`);
      console.log(`   Data length: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n   First roster from API:');
        const first = response.data.data[0];
        console.log(`   ID: ${first.id}`);
        console.log(`   Type: ${first.rosterType}`);
        console.log(`   Status: ${first.status}`);
        console.log(`   Office: ${first.officeLocation}`);
      }
      
    } catch (apiError) {
      console.log('❌ API Error:');
      console.log(`   Status: ${apiError.response?.status}`);
      console.log(`   Message: ${apiError.response?.data?.message}`);
      console.log(`   Error: ${apiError.message}`);
    }
    
    console.log('\n5️⃣ Checking if user needs to be created/updated...');
    
    // Check if we need to create or update the user
    const existingUser = await db.collection('customers').findOne({
      $or: [
        { firebaseUid: firebaseUid },
        { email: email }
      ]
    });
    
    if (!existingUser) {
      console.log('❌ User not found in customers collection');
      console.log('   Creating user...');
      
      const newUser = {
        firebaseUid: firebaseUid,
        email: email,
        name: 'Customer 123',
        role: 'customer',
        status: 'active',
        isActive: true,
        companyName: 'Abra Travels Demo Org',
        organizationName: 'Abra Travels Demo Org',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdVia: 'debug_script'
      };
      
      const result = await db.collection('customers').insertOne(newUser);
      console.log(`✅ User created with ID: ${result.insertedId}`);
    } else {
      console.log('✅ User exists in customers collection');
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Firebase UID: ${existingUser.firebaseUid}`);
      
      // Update Firebase UID if missing
      if (!existingUser.firebaseUid) {
        await db.collection('customers').updateOne(
          { _id: existingUser._id },
          { $set: { firebaseUid: firebaseUid, updatedAt: new Date() } }
        );
        console.log('✅ Updated user with Firebase UID');
      }
    }
    
    console.log('\n6️⃣ Creating test rosters if none exist...');
    
    if (rostersByEmail.length === 0) {
      console.log('❌ No rosters found - creating test rosters...');
      
      const testRosters = [
        {
          rosterType: 'both',
          officeLocation: 'Koramangala Office, Bangalore',
          officeLocationCoordinates: {
            latitude: 12.9352,
            longitude: 77.6245
          },
          weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          fromDate: new Date('2025-01-01'),
          toDate: new Date('2025-12-31'),
          fromTime: '09:00',
          toTime: '18:00',
          customerName: 'Customer 123',
          customerEmail: email,
          customerId: firebaseUid,
          customerFirebaseUid: firebaseUid,
          status: 'pending_assignment',
          organizationName: 'Abra Travels Demo Org',
          loginPickupAddress: 'HSR Layout, Bangalore',
          loginPickupLocation: {
            latitude: 12.9116,
            longitude: 77.6412
          },
          logoutDropAddress: 'HSR Layout, Bangalore',
          logoutDropLocation: {
            latitude: 12.9116,
            longitude: 77.6412
          },
          notes: 'Test roster created by debug script',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'debug_script'
        },
        {
          rosterType: 'login',
          officeLocation: 'Electronic City Office, Bangalore',
          officeLocationCoordinates: {
            latitude: 12.8456,
            longitude: 77.6603
          },
          weekdays: ['Monday', 'Wednesday', 'Friday'],
          fromDate: new Date('2025-01-15'),
          toDate: new Date('2025-06-30'),
          fromTime: '08:30',
          toTime: '17:30',
          customerName: 'Customer 123',
          customerEmail: email,
          customerId: firebaseUid,
          customerFirebaseUid: firebaseUid,
          status: 'assigned',
          organizationName: 'Abra Travels Demo Org',
          loginPickupAddress: 'Whitefield, Bangalore',
          loginPickupLocation: {
            latitude: 12.9698,
            longitude: 77.7500
          },
          vehicleNumber: 'KA-01-AB-1234',
          driverName: 'Rajesh Kumar',
          driverPhone: '+91-9876543210',
          notes: 'Morning pickup roster',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'debug_script'
        },
        {
          rosterType: 'logout',
          officeLocation: 'Koramangala Office, Bangalore',
          officeLocationCoordinates: {
            latitude: 12.9352,
            longitude: 77.6245
          },
          weekdays: ['Tuesday', 'Thursday'],
          fromDate: new Date('2025-02-01'),
          toDate: new Date('2025-08-31'),
          fromTime: '18:00',
          toTime: '19:00',
          customerName: 'Customer 123',
          customerEmail: email,
          customerId: firebaseUid,
          customerFirebaseUid: firebaseUid,
          status: 'completed',
          organizationName: 'Abra Travels Demo Org',
          logoutDropAddress: 'Indiranagar, Bangalore',
          logoutDropLocation: {
            latitude: 12.9719,
            longitude: 77.6412
          },
          vehicleNumber: 'KA-01-CD-5678',
          driverName: 'Deepak Singh',
          driverPhone: '+91-9876543211',
          notes: 'Evening drop roster',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'debug_script'
        }
      ];
      
      const insertResult = await db.collection('rosters').insertMany(testRosters);
      console.log(`✅ Created ${insertResult.insertedCount} test rosters`);
      
      // Test API again
      console.log('\n7️⃣ Testing API after creating rosters...');
      
      try {
        const response = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
          headers: {
            'x-test-firebase-uid': firebaseUid
          },
          timeout: 10000
        });
        
        console.log('✅ API Response after creating rosters:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${response.data.success}`);
        console.log(`   Message: ${response.data.message}`);
        console.log(`   Count: ${response.data.count}`);
        
        if (response.data.data && response.data.data.length > 0) {
          console.log('\n   Rosters returned:');
          response.data.data.forEach((roster, index) => {
            console.log(`   ${index + 1}. ${roster.rosterType} - ${roster.officeLocation} (${roster.status})`);
          });
        }
        
      } catch (apiError) {
        console.log('❌ API still failing:');
        console.log(`   Status: ${apiError.response?.status}`);
        console.log(`   Message: ${apiError.response?.data?.message}`);
      }
    } else {
      console.log('✅ Rosters already exist - no need to create test data');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Firebase UID: ${firebaseUid}`);
    console.log(`Email: ${email}`);
    console.log(`Rosters by email: ${rostersByEmail.length}`);
    console.log(`Rosters by UID: ${rostersByUid.length}`);
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Ensure user exists in customers collection with correct Firebase UID');
    console.log('2. Ensure rosters have correct customerEmail and customerFirebaseUid');
    console.log('3. Test Flutter app again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

// Run the debug
debugCustomer123Issue().catch(console.error);