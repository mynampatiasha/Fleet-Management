// check-rajesh-kumar-status.js
// Check the status of rajesh.kumar@abrafleet.com

const { MongoClient } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function checkRajeshKumarStatus() {
  console.log('\n🔍 ========== CHECKING RAJESH KUMAR STATUS ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const email = 'rajesh.kumar@abrafleet.com';
    
    // Step 1: Check in admin_users collection
    console.log('\n1️⃣ Checking admin_users collection:');
    
    const adminUser = await db.collection('admin_users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (adminUser) {
      console.log('✅ User found in admin_users:');
      console.log('   ID:', adminUser._id);
      console.log('   Name:', adminUser.name);
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   isActive:', adminUser.isActive);
      console.log('   status:', adminUser.status);
      console.log('   firebaseUid:', adminUser.firebaseUid);
      console.log('   createdAt:', adminUser.createdAt);
      console.log('   lastActive:', adminUser.lastActive);
      
      // Check why 403 is returned
      if (adminUser.isActive === false) {
        console.log('❌ REASON FOR 403: isActive is false');
      } else if (adminUser.isActive === undefined || adminUser.isActive === null) {
        console.log('⚠️  REASON FOR 403: isActive is undefined/null (treated as false)');
      } else {
        console.log('✅ isActive is true - should not return 403');
      }
    } else {
      console.log('❌ User NOT found in admin_users collection');
      console.log('   This would cause a 404, not 403');
    }
    
    // Step 2: Check in users collection (legacy)
    console.log('\n2️⃣ Checking users collection (legacy):');
    
    const regularUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (regularUser) {
      console.log('✅ User found in users collection:');
      console.log('   ID:', regularUser._id);
      console.log('   Name:', regularUser.name);
      console.log('   Email:', regularUser.email);
      console.log('   Role:', regularUser.role);
      console.log('   isActive:', regularUser.isActive);
      console.log('   firebaseUid:', regularUser.firebaseUid);
    } else {
      console.log('❌ User NOT found in users collection');
    }
    
    // Step 3: Search by partial email match
    console.log('\n3️⃣ Searching for similar emails:');
    
    const similarEmails = await db.collection('admin_users').find({
      email: { $regex: 'rajesh', $options: 'i' }
    }).toArray();
    
    console.log(`Found ${similarEmails.length} users with 'rajesh' in email:`);
    similarEmails.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - Active: ${user.isActive}`);
    });
    
    // Step 4: Check if user exists with different case
    console.log('\n4️⃣ Checking case variations:');
    
    const caseVariations = [
      'rajesh.kumar@abrafleet.com',
      'Rajesh.Kumar@abrafleet.com',
      'RAJESH.KUMAR@ABRAFLEET.COM',
      'rajesh.kumar@AbraFleet.com'
    ];
    
    for (const emailVariation of caseVariations) {
      const user = await db.collection('admin_users').findOne({ 
        email: emailVariation 
      });
      if (user) {
        console.log(`✅ Found with case variation: ${emailVariation}`);
        console.log(`   Stored as: ${user.email}`);
        console.log(`   Active: ${user.isActive}`);
      }
    }
    
    // Step 5: Recommendations
    console.log('\n5️⃣ Recommendations:');
    
    if (!adminUser) {
      console.log('🔧 User does not exist - need to create user account');
      console.log('   Options:');
      console.log('   1. Create user in admin_users collection');
      console.log('   2. Import user from another source');
      console.log('   3. User needs to register first');
    } else if (adminUser.isActive === false) {
      console.log('🔧 User exists but is inactive - need to activate account');
      console.log('   Run: db.admin_users.updateOne({email: "rajesh.kumar@abrafleet.com"}, {$set: {isActive: true}})');
    } else if (adminUser.isActive === undefined || adminUser.isActive === null) {
      console.log('🔧 User exists but isActive field is missing - need to set it');
      console.log('   Run: db.admin_users.updateOne({email: "rajesh.kumar@abrafleet.com"}, {$set: {isActive: true}})');
    }
    
  } catch (error) {
    console.error('\n❌ CHECK FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🔍 ========== CHECK COMPLETE ==========\n');
}

// Run the check
checkRajeshKumarStatus();