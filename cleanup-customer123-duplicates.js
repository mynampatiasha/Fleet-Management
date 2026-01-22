const { MongoClient } = require('mongodb');

async function cleanupCustomer123Duplicates() {
  const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🧹 CLEANING UP CUSTOMER123 DUPLICATE RECORDS');
    console.log('=' .repeat(50));
    
    const email = 'customer123@abrafleet.com';
    
    // Step 1: Verify we have a customers record
    const customersRecord = await db.collection('customers').findOne({ email: email });
    
    if (!customersRecord) {
      console.log('❌ No customers record found! Cannot proceed with cleanup.');
      console.log('   The customers collection should be the primary record.');
      return;
    }
    
    console.log('✅ Customers record exists - safe to cleanup duplicates');
    console.log(`   Firebase UID: ${customersRecord.firebaseUid}`);
    console.log(`   Role: ${customersRecord.role}`);
    console.log(`   Status: ${customersRecord.status || 'not set'}`);
    
    // Step 2: Remove from admin_users if it has customer role
    console.log('\n🗑️  Checking admin_users record...');
    const adminUsersRecord = await db.collection('admin_users').findOne({ email: email });
    
    if (adminUsersRecord) {
      if (adminUsersRecord.role === 'customer') {
        console.log('   Found admin_users record with customer role - removing...');
        await db.collection('admin_users').deleteOne({ email: email });
        console.log('   ✅ Removed from admin_users collection');
      } else {
        console.log(`   Found admin_users record with role: ${adminUsersRecord.role}`);
        console.log('   ⚠️  Keeping admin_users record (has admin role)');
        
        // But ensure it has the correct Firebase UID
        if (adminUsersRecord.firebaseUid !== customersRecord.firebaseUid) {
          await db.collection('admin_users').updateOne(
            { email: email },
            { 
              $set: { 
                firebaseUid: customersRecord.firebaseUid,
                updatedAt: new Date()
              } 
            }
          );
          console.log('   ✅ Updated Firebase UID in admin_users');
        }
      }
    } else {
      console.log('   No admin_users record found');
    }
    
    // Step 3: Remove from users collection
    console.log('\n🗑️  Checking users record...');
    const usersRecord = await db.collection('users').findOne({ email: email });
    
    if (usersRecord) {
      console.log('   Found users record - removing (customers collection exists)...');
      await db.collection('users').deleteOne({ email: email });
      console.log('   ✅ Removed from users collection');
    } else {
      console.log('   No users record found');
    }
    
    // Step 4: Ensure customers record is properly configured
    console.log('\n🔧 Ensuring customers record is properly configured...');
    
    let updateFields = {};
    let needsUpdate = false;
    
    if (!customersRecord.role || customersRecord.role !== 'customer') {
      updateFields.role = 'customer';
      needsUpdate = true;
    }
    
    if (customersRecord.isActive === false) {
      updateFields.isActive = true;
      needsUpdate = true;
    }
    
    if (!customersRecord.status || customersRecord.status !== 'active') {
      updateFields.status = 'active';
      needsUpdate = true;
    }
    
    if (!customersRecord.modules || customersRecord.modules.length === 0) {
      updateFields.modules = ['customer_dashboard', 'my_trips', 'tracking'];
      needsUpdate = true;
    }
    
    if (!customersRecord.permissions) {
      updateFields.permissions = {
        'view_own_trips': true,
        'view_own_stats': true,
        'track_own_trips': true
      };
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      updateFields.updatedAt = new Date();
      updateFields.lastActive = new Date();
      
      await db.collection('customers').updateOne(
        { email: email },
        { $set: updateFields }
      );
      console.log('   ✅ Updated customers record configuration');
    } else {
      console.log('   ✅ Customers record is already properly configured');
    }
    
    // Step 5: Final verification
    console.log('\n🧪 Final verification...');
    
    const finalCustomersRecord = await db.collection('customers').findOne({ email: email });
    const finalAdminUsersRecord = await db.collection('admin_users').findOne({ email: email });
    const finalUsersRecord = await db.collection('users').findOne({ email: email });
    
    console.log('\n📊 Final state:');
    console.log(`   customers: ${finalCustomersRecord ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   admin_users: ${finalAdminUsersRecord ? `⚠️  EXISTS (role: ${finalAdminUsersRecord.role})` : '✅ REMOVED'}`);
    console.log(`   users: ${finalUsersRecord ? '⚠️  EXISTS' : '✅ REMOVED'}`);
    
    if (finalCustomersRecord) {
      const isActive = finalCustomersRecord.isActive !== false && 
                       (!finalCustomersRecord.status || finalCustomersRecord.status === 'active');
      
      console.log('\n✅ Primary customers record:');
      console.log(`   📧 Email: ${finalCustomersRecord.email}`);
      console.log(`   🔑 Firebase UID: ${finalCustomersRecord.firebaseUid}`);
      console.log(`   👤 Role: ${finalCustomersRecord.role}`);
      console.log(`   🟢 isActive: ${finalCustomersRecord.isActive}`);
      console.log(`   📊 Status: ${finalCustomersRecord.status}`);
      console.log(`   🚦 Auth Check: ${isActive ? '✅ PASS' : '❌ FAIL'}`);
      
      if (isActive) {
        console.log('\n🎉 SUCCESS! Customer123 is now properly configured');
        console.log('\n📝 Customer should now be able to:');
        console.log('   ✅ Access customer dashboard');
        console.log('   ✅ View trip statistics');
        console.log('   ✅ Track trips');
        console.log('   ✅ View my trips');
        
        console.log('\n🔄 If still getting 403 errors:');
        console.log('   1. Customer should log out completely');
        console.log('   2. Clear browser cache/cookies');
        console.log('   3. Log back in');
        console.log('   4. This will generate a fresh Firebase token');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ CLEANUP COMPLETE');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

cleanupCustomer123Duplicates().catch(console.error);