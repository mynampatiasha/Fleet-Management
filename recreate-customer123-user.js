// recreate-customer123-user.js
// Directly recreate customer123 in the customers collection

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://abrafleet:ZSW8vWzKJbEd7Pu@abrafleet.qhzgb.mongodb.net/abra_fleet_management?retryWrites=true&w=majority';

async function recreateCustomer123() {
  console.log('🔧 RECREATING CUSTOMER123 USER');
  console.log('='.repeat(50));
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    console.log('✅ Connected to MongoDB');
    
    // First, check if customer123 already exists anywhere
    console.log('\n1️⃣ Checking if customer123 already exists...');
    
    const collections = ['admin_users', 'users', 'customers', 'clients'];
    let existingUser = null;
    let existingCollection = null;
    
    for (const collectionName of collections) {
      try {
        const user = await db.collection(collectionName).findOne({ 
          email: 'customer123@abrafleet.com' 
        });
        if (user) {
          existingUser = user;
          existingCollection = collectionName;
          break;
        }
      } catch (error) {
        // Collection might not exist, continue
      }
    }
    
    if (existingUser) {
      console.log(`✅ Found existing user in ${existingCollection}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Firebase UID: ${existingUser.firebaseUid || 'MISSING'}`);
      console.log(`   Active: ${existingUser.isActive}`);
      
      // If user exists but missing Firebase UID, update it
      if (!existingUser.firebaseUid) {
        console.log('\n2️⃣ Updating Firebase UID...');
        await db.collection(existingCollection).updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              firebaseUid: 'customer123-firebase-uid',
              updatedAt: new Date(),
              lastActive: new Date()
            } 
          }
        );
        console.log('✅ Firebase UID updated');
      }
      
      // If user is inactive, activate them
      if (!existingUser.isActive) {
        console.log('\n3️⃣ Activating user...');
        await db.collection(existingCollection).updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              isActive: true,
              status: 'active',
              updatedAt: new Date()
            } 
          }
        );
        console.log('✅ User activated');
      }
      
    } else {
      console.log('❌ Customer123 not found anywhere');
      console.log('\n2️⃣ Creating new customer123 user...');
      
      const newUser = {
        name: 'Customer 123',
        email: 'customer123@abrafleet.com',
        phone: '+91-9876543210',
        role: 'customer',
        firebaseUid: 'customer123-firebase-uid',
        isActive: true,
        status: 'active',
        address: '123 Test Street, Bangalore, Karnataka',
        organizationId: null,
        modules: [],
        permissions: {},
        standardPermissions: {
          canViewOwnTrips: true,
          canViewOwnRosters: true,
          canViewOwnStats: true,
          canRequestAddressChange: true,
          canViewNotifications: true
        },
        fcmToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        lastLogin: new Date()
      };
      
      const result = await db.collection('customers').insertOne(newUser);
      console.log('✅ Customer123 created with ID:', result.insertedId);
    }
    
    // Test the user by querying again
    console.log('\n4️⃣ Verifying user creation...');
    const verifyUser = await db.collection('customers').findOne({ 
      email: 'customer123@abrafleet.com' 
    });
    
    if (verifyUser) {
      console.log('✅ Verification successful:');
      console.log(`   Name: ${verifyUser.name}`);
      console.log(`   Email: ${verifyUser.email}`);
      console.log(`   Role: ${verifyUser.role}`);
      console.log(`   Firebase UID: ${verifyUser.firebaseUid}`);
      console.log(`   Active: ${verifyUser.isActive}`);
      console.log(`   ID: ${verifyUser._id}`);
      
      console.log('\n🎉 CUSTOMER123 IS NOW READY!');
      console.log('   You can now test the customer stats API');
      console.log('   Use Firebase UID: customer123-firebase-uid');
      
    } else {
      console.log('❌ Verification failed - user not found after creation');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the recreation
recreateCustomer123().catch(console.error);