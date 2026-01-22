const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function createCustomer123UserRecord() {
  let client;
  
  try {
    console.log('='.repeat(60));
    console.log('🔧 FIXING CUSTOMER123 USER RECORD');
    console.log('='.repeat(60));

    // Connect to MongoDB
    console.log('\n1. Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    console.log('✅ Connected to MongoDB');

    const customerUID = 'b5aoloVR7xYI6SICibCIWecBaf82';
    const customerEmail = 'customer123@abrafleet.com';

    // Check if user already exists
    console.log('\n2. Checking existing user record...');
    const existingUser = await db.collection('users').findOne({ firebaseUid: customerUID });
    
    if (existingUser) {
      console.log('✅ User record already exists:', existingUser.email);
      return;
    }

    // Create user record
    console.log('\n3. Creating user record for customer123...');
    const userRecord = {
      firebaseUid: customerUID,
      email: customerEmail,
      name: 'Customer 123',
      role: 'customer',
      status: 'active',
      organizationId: 'abrafleet',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        phone: '+91-9876543210',
        address: 'Bangalore, Karnataka',
        preferences: {
          notifications: true,
          emailUpdates: true
        }
      }
    };

    const result = await db.collection('users').insertOne(userRecord);
    console.log('✅ User record created with ID:', result.insertedId);

    // Verify the creation
    console.log('\n4. Verifying user record...');
    const createdUser = await db.collection('users').findOne({ firebaseUid: customerUID });
    
    if (createdUser) {
      console.log('✅ User record verified:');
      console.log(`  Email: ${createdUser.email}`);
      console.log(`  Name: ${createdUser.name}`);
      console.log(`  Role: ${createdUser.role}`);
      console.log(`  Status: ${createdUser.status}`);
      console.log(`  Firebase UID: ${createdUser.firebaseUid}`);
    } else {
      console.log('❌ Failed to verify user record creation');
    }

    // Check trip and roster counts
    console.log('\n5. Verifying data associations...');
    const tripCount = await db.collection('trips').countDocuments({ customerId: customerUID });
    const rosterCount = await db.collection('rosters').countDocuments({ userId: customerUID });
    
    console.log(`✅ Associated trips: ${tripCount}`);
    console.log(`✅ Associated rosters: ${rosterCount}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CUSTOMER123 USER RECORD FIXED!');
    console.log('='.repeat(60));
    console.log('✅ User record created in users collection');
    console.log('✅ Authentication should now work');
    console.log('✅ MyStats screen should display data');
    console.log('\n🔄 Next: Test the MyStats screen in the Flutter app');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error fixing user record:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createCustomer123UserRecord();