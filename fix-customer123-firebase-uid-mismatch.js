const { MongoClient } = require('mongodb');

async function fixCustomer123FirebaseUidMismatch() {
  const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🔧 FIXING CUSTOMER123 FIREBASE UID MISMATCH');
    console.log('=' .repeat(60));
    
    const email = 'customer123@abrafleet.com';
    
    // Step 1: Find all records
    console.log(`\n🔍 Finding all records for: ${email}`);
    
    const usersRecord = await db.collection('users').findOne({ email: email });
    const adminUsersRecord = await db.collection('admin_users').findOne({ email: email });
    const customersRecord = await db.collection('customers').findOne({ email: email });
    
    console.log('\n📋 Current Firebase UIDs:');
    if (usersRecord) {
      console.log(`   users: ${usersRecord.firebaseUid || 'NOT SET'}`);
    }
    if (adminUsersRecord) {
      console.log(`   admin_users: ${adminUsersRecord.firebaseUid || 'NOT SET'}`);
    }
    if (customersRecord) {
      console.log(`   customers: ${customersRecord.firebaseUid || 'NOT SET'}`);
    }
    
    // Step 2: Determine the correct Firebase UID
    console.log('\n🎯 Determining correct Firebase UID...');
    
    // Priority: customers > users > admin_users (for customer accounts)
    let correctFirebaseUid = null;
    let primaryCollection = null;
    
    if (customersRecord && customersRecord.firebaseUid) {
      correctFirebaseUid = customersRecord.firebaseUid;
      primaryCollection = 'customers';
    } else if (usersRecord && usersRecord.firebaseUid) {
      correctFirebaseUid = usersRecord.firebaseUid;
      primaryCollection = 'users';
    } else if (adminUsersRecord && adminUsersRecord.firebaseUid) {
      correctFirebaseUid = adminUsersRecord.firebaseUid;
      primaryCollection = 'admin_users';
    }
    
    if (!correctFirebaseUid) {
      console.log('❌ No Firebase UID found in any collection!');
      console.log('💡 Customer needs to log in again to generate Firebase UID');
      return;
    }
    
    console.log(`✅ Using Firebase UID from ${primaryCollection}: ${correctFirebaseUid}`);
    
    // Step 3: Update all records to use the same Firebase UID
    console.log('\n🔄 Updating all records with correct Firebase UID...');
    
    let updatedRecords = 0;
    
    if (usersRecord && usersRecord.firebaseUid !== correctFirebaseUid) {
      await db.collection('users').updateOne(
        { _id: usersRecord._id },
        { 
          $set: { 
            firebaseUid: correctFirebaseUid,
            updatedAt: new Date(),
            lastActive: new Date()
          } 
        }
      );
      console.log(`   ✅ Updated users collection`);
      updatedRecords++;
    }
    
    if (adminUsersRecord && adminUsersRecord.firebaseUid !== correctFirebaseUid) {
      await db.collection('admin_users').updateOne(
        { _id: adminUsersRecord._id },
        { 
          $set: { 
            firebaseUid: correctFirebaseUid,
            updatedAt: new Date(),
            lastActive: new Date()
          } 
        }
      );
      console.log(`   ✅ Updated admin_users collection`);
      updatedRecords++;
    }
    
    if (customersRecord && customersRecord.firebaseUid !== correctFirebaseUid) {
      await db.collection('customers').updateOne(
        { _id: customersRecord._id },
        { 
          $set: { 
            firebaseUid: correctFirebaseUid,
            updatedAt: new Date(),
            lastActive: new Date()
          } 
        }
      );
      console.log(`   ✅ Updated customers collection`);
      updatedRecords++;
    }
    
    // Step 4: Ensure proper permissions and status
    console.log('\n🔐 Ensuring proper permissions and status...');
    
    const collections = ['users', 'admin_users', 'customers'];
    for (const collectionName of collections) {
      const record = await db.collection(collectionName).findOne({ email: email });
      if (record) {
        let updateFields = {};
        let needsUpdate = false;
        
        // Ensure active status
        if (record.isActive === false) {
          updateFields.isActive = true;
          needsUpdate = true;
        }
        
        if (record.status && record.status !== 'active') {
          updateFields.status = 'active';
          needsUpdate = true;
        }
        
        // Ensure customer role
        if (collectionName === 'customers' && record.role !== 'customer') {
          updateFields.role = 'customer';
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          updateFields.updatedAt = new Date();
          await db.collection(collectionName).updateOne(
            { _id: record._id },
            { $set: updateFields }
          );
          console.log(`   ✅ Fixed permissions in ${collectionName}`);
        }
      }
    }
    
    // Step 5: Clean up duplicate records (optional)
    console.log('\n🧹 Checking for duplicate cleanup...');
    
    const allRecords = [];
    if (usersRecord) allRecords.push({ collection: 'users', record: usersRecord });
    if (adminUsersRecord) allRecords.push({ collection: 'admin_users', record: adminUsersRecord });
    if (customersRecord) allRecords.push({ collection: 'customers', record: customersRecord });
    
    if (allRecords.length > 1) {
      console.log(`   Found ${allRecords.length} records for same user`);
      console.log('   Recommendation: Keep customers collection as primary');
      
      // If customer record exists, we can remove others (unless admin_users has admin role)
      if (customersRecord) {
        if (adminUsersRecord && adminUsersRecord.role === 'customer') {
          console.log('   💡 Consider removing admin_users record (has customer role)');
          console.log('   💡 Run: db.admin_users.deleteOne({email: "customer123@abrafleet.com"})');
        }
        if (usersRecord) {
          console.log('   💡 Consider removing users record (customers collection exists)');
          console.log('   💡 Run: db.users.deleteOne({email: "customer123@abrafleet.com"})');
        }
      }
    }
    
    // Step 6: Test the fix
    console.log('\n🧪 Testing the fix...');
    
    // Check which record would be used by auth middleware
    const collections_search_order = ['users', 'admin_users', 'employee_admins', 'drivers', 'customers', 'clients'];
    let foundRecord = null;
    let foundCollection = null;
    
    for (const collectionName of collections_search_order) {
      const record = await db.collection(collectionName).findOne({ 
        $or: [
          { firebaseUid: correctFirebaseUid },
          { email: email }
        ]
      });
      
      if (record && record.email === email) {
        foundRecord = record;
        foundCollection = collectionName;
        break;
      }
    }
    
    if (foundRecord) {
      const isActive = foundRecord.isActive !== false && 
                       (!foundRecord.status || foundRecord.status === 'active');
      
      console.log(`✅ Auth middleware would use: ${foundCollection}`);
      console.log(`   📧 Email: ${foundRecord.email}`);
      console.log(`   🔑 Firebase UID: ${foundRecord.firebaseUid}`);
      console.log(`   👤 Role: ${foundRecord.role}`);
      console.log(`   🟢 isActive: ${foundRecord.isActive}`);
      console.log(`   📊 Status: ${foundRecord.status || 'not set'}`);
      console.log(`   🚦 Auth Check: ${isActive ? '✅ PASS' : '❌ FAIL'}`);
      
      if (isActive) {
        console.log('\n🎉 SUCCESS! Customer should now be able to access dashboard');
        console.log('\n📝 Next steps:');
        console.log('   1. Customer should refresh the app or re-login');
        console.log('   2. Clear browser cache if needed');
        console.log('   3. Test with the customer dashboard');
      } else {
        console.log('\n❌ Still has permission issues');
        console.log('   Check isActive and status fields manually');
      }
    } else {
      console.log('❌ No record found after fix - something went wrong');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ FIREBASE UID MISMATCH FIX COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Records updated: ${updatedRecords}`);
    console.log(`🔑 Unified Firebase UID: ${correctFirebaseUid}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixCustomer123FirebaseUidMismatch().catch(console.error);