// check-customer123-database-status.js
// Check where customer123 is located after the migration

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://abrafleet:ZSW8vWzKJbEd7Pu@abrafleet.qhzgb.mongodb.net/abra_fleet_management?retryWrites=true&w=majority';

async function checkCustomer123Status() {
  console.log('🔍 CHECKING CUSTOMER123 DATABASE STATUS AFTER MIGRATION');
  console.log('='.repeat(70));
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    console.log('✅ Connected to MongoDB');
    
    // Check all possible collections where customer123 might be
    const collections = [
      'admin_users',
      'users', 
      'customers',
      'clients',
      'employee_admins',
      'drivers'
    ];
    
    console.log('\n📋 SEARCHING FOR customer123@abrafleet.com IN ALL COLLECTIONS:');
    console.log('-'.repeat(70));
    
    let foundUser = null;
    let foundIn = null;
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const user = await collection.findOne({ 
          email: 'customer123@abrafleet.com' 
        });
        
        if (user) {
          foundUser = user;
          foundIn = collectionName;
          console.log(`✅ FOUND in ${collectionName}:`);
          console.log(`   Name: ${user.name || 'N/A'}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role || 'N/A'}`);
          console.log(`   Firebase UID: ${user.firebaseUid || 'N/A'}`);
          console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
          console.log(`   Created: ${user.createdAt || 'N/A'}`);
          console.log(`   ID: ${user._id}`);
        } else {
          console.log(`❌ NOT FOUND in ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️  Error checking ${collectionName}:`, error.message);
      }
    }
    
    if (!foundUser) {
      console.log('\n❌ CUSTOMER123 NOT FOUND IN ANY COLLECTION!');
      console.log('   This explains why the 403 errors are happening.');
      console.log('   The user needs to be recreated or restored.');
      
      // Check if there are any users with similar emails
      console.log('\n🔍 Checking for similar email patterns...');
      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);
          const similarUsers = await collection.find({ 
            email: { $regex: /customer123/i }
          }).toArray();
          
          if (similarUsers.length > 0) {
            console.log(`   Found ${similarUsers.length} similar users in ${collectionName}:`);
            similarUsers.forEach(user => {
              console.log(`     - ${user.email} (${user.role || 'no role'})`);
            });
          }
        } catch (error) {
          // Ignore errors for non-existent collections
        }
      }
    } else {
      console.log(`\n✅ CUSTOMER123 FOUND IN: ${foundIn}`);
      
      // Check if Firebase UID is set correctly
      if (!foundUser.firebaseUid) {
        console.log('\n⚠️  ISSUE: Firebase UID is missing!');
        console.log('   This will cause authentication issues.');
        console.log('   Recommended action: Set firebaseUid to a test value');
      } else {
        console.log(`\n✅ Firebase UID is set: ${foundUser.firebaseUid}`);
      }
      
      // Check if user is active
      if (!foundUser.isActive) {
        console.log('\n⚠️  ISSUE: User is inactive!');
        console.log('   This will cause 403 errors.');
        console.log('   Recommended action: Set isActive to true');
      } else {
        console.log('\n✅ User is active');
      }
    }
    
    // Also check for any trips or rosters associated with customer123
    console.log('\n📊 CHECKING FOR CUSTOMER123 DATA:');
    console.log('-'.repeat(70));
    
    try {
      const tripsCount = await db.collection('trips').countDocuments({
        $or: [
          { customerId: 'customer123-firebase-uid' },
          { customerId: 'customer123-test-uid' },
          { customerEmail: 'customer123@abrafleet.com' }
        ]
      });
      console.log(`   Trips: ${tripsCount}`);
      
      const rostersCount = await db.collection('rosters').countDocuments({
        $or: [
          { userId: 'customer123-firebase-uid' },
          { userId: 'customer123-test-uid' },
          { userEmail: 'customer123@abrafleet.com' }
        ]
      });
      console.log(`   Rosters: ${rostersCount}`);
      
    } catch (error) {
      console.log('   Error checking data:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the check
checkCustomer123Status().catch(console.error);