// fix-rajesh-kumar-active-status.js
// Fix the isActive status for rajesh.kumar@abrafleet.com

const { MongoClient } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function fixRajeshKumarActiveStatus() {
  console.log('\n🔧 ========== FIXING RAJESH KUMAR ACTIVE STATUS ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    const email = 'rajesh.kumar@abrafleet.com';
    
    // Step 1: Check current status
    console.log('\n1️⃣ Checking current status:');
    
    const currentUser = await db.collection('admin_users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!currentUser) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('📋 Current user data:');
    console.log('   Name:', currentUser.name);
    console.log('   Email:', currentUser.email);
    console.log('   Role:', currentUser.role);
    console.log('   isActive:', currentUser.isActive);
    console.log('   status:', currentUser.status);
    
    // Step 2: Update isActive field
    console.log('\n2️⃣ Updating isActive field:');
    
    const updateResult = await db.collection('admin_users').updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date(),
          lastActive: new Date()
        } 
      }
    );
    
    console.log('📊 Update result:');
    console.log('   Matched:', updateResult.matchedCount);
    console.log('   Modified:', updateResult.modifiedCount);
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ User successfully activated');
    } else {
      console.log('⚠️  No changes made (user might already be active)');
    }
    
    // Step 3: Verify the fix
    console.log('\n3️⃣ Verifying the fix:');
    
    const updatedUser = await db.collection('admin_users').findOne({ 
      email: email.toLowerCase() 
    });
    
    console.log('📋 Updated user data:');
    console.log('   Name:', updatedUser.name);
    console.log('   Email:', updatedUser.email);
    console.log('   Role:', updatedUser.role);
    console.log('   isActive:', updatedUser.isActive);
    console.log('   status:', updatedUser.status);
    console.log('   updatedAt:', updatedUser.updatedAt);
    
    // Step 4: Test the email verification endpoint logic
    console.log('\n4️⃣ Testing email verification logic:');
    
    if (!updatedUser.isActive) {
      console.log('❌ Would still return 403 - isActive is false');
    } else {
      console.log('✅ Would return 200 - user is active');
      console.log('📱 The Flutter app should now be able to verify this email');
    }
    
    // Step 5: Also fix the users collection if it exists
    console.log('\n5️⃣ Checking and fixing users collection:');
    
    const legacyUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (legacyUser) {
      console.log('📋 Found user in legacy users collection');
      console.log('   Current isActive:', legacyUser.isActive);
      
      if (legacyUser.isActive === undefined || legacyUser.isActive === null) {
        const legacyUpdateResult = await db.collection('users').updateOne(
          { email: email.toLowerCase() },
          { 
            $set: { 
              isActive: true,
              updatedAt: new Date()
            } 
          }
        );
        
        console.log('✅ Updated legacy users collection');
        console.log('   Modified:', legacyUpdateResult.modifiedCount);
      } else {
        console.log('✅ Legacy users collection already has correct isActive value');
      }
    } else {
      console.log('ℹ️  No user found in legacy users collection');
    }
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('📱 The user should now be able to login without 403 errors');
    
  } catch (error) {
    console.error('\n❌ FIX FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🔧 ========== FIX COMPLETE ==========\n');
}

// Run the fix
fixRajeshKumarActiveStatus();