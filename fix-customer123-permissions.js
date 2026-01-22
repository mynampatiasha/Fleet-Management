const { MongoClient } = require('mongodb');

async function fixCustomer123Permissions() {
  const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🔧 FIXING CUSTOMER123 PERMISSIONS');
    console.log('=' .repeat(50));
    
    const email = 'customer123@abrafleet.com';
    const collections = ['users', 'admin_users', 'employee_admins', 'drivers', 'customers', 'clients'];
    
    let fixedRecords = 0;
    let removedRecords = 0;
    
    // Step 1: Find all records for this email
    console.log(`\n🔍 Finding all records for: ${email}`);
    let foundRecords = [];
    
    for (const collectionName of collections) {
      try {
        const user = await db.collection(collectionName).findOne({ email: email });
        if (user) {
          foundRecords.push({
            collection: collectionName,
            user: user
          });
          console.log(`   ✅ Found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${collectionName}: ${error.message}`);
      }
    }
    
    if (foundRecords.length === 0) {
      console.log('❌ No records found! Creating new customer record...');
      
      // Create new customer record
      const newCustomer = {
        email: email,
        name: 'Customer 123',
        role: 'customer',
        isActive: true,
        status: 'active',
        organizationId: 'default',
        modules: ['customer_dashboard', 'my_trips', 'tracking'],
        permissions: {
          'view_own_trips': true,
          'view_own_stats': true,
          'track_own_trips': true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('customers').insertOne(newCustomer);
      console.log('✅ Created new customer record in customers collection');
      fixedRecords++;
      
    } else {
      console.log(`\n📋 Found ${foundRecords.length} record(s). Processing...`);
      
      // Step 2: Determine the correct collection for customer
      let customerRecord = foundRecords.find(r => r.collection === 'customers');
      let primaryRecord = foundRecords[0]; // First record found (used by auth middleware)
      
      if (!customerRecord) {
        console.log('\n🔄 No record in customers collection. Creating one...');
        
        // Use data from primary record to create customer record
        const customerData = {
          email: email,
          name: primaryRecord.user.name || primaryRecord.user.name_parson || 'Customer 123',
          role: 'customer',
          isActive: true,
          status: 'active',
          organizationId: primaryRecord.user.organizationId || 'default',
          firebaseUid: primaryRecord.user.firebaseUid,
          modules: ['customer_dashboard', 'my_trips', 'tracking'],
          permissions: {
            'view_own_trips': true,
            'view_own_stats': true,
            'track_own_trips': true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('customers').insertOne(customerData);
        console.log('✅ Created customer record in customers collection');
        fixedRecords++;
        
        customerRecord = { collection: 'customers', user: customerData };
        foundRecords.push(customerRecord);
      }
      
      // Step 3: Fix all records to ensure they're active
      for (const record of foundRecords) {
        const { collection, user } = record;
        
        console.log(`\n🔧 Checking ${collection} record...`);
        
        let needsUpdate = false;
        let updateFields = {};
        
        // Check isActive
        if (user.isActive === false) {
          console.log(`   ⚠️  isActive is false, setting to true`);
          updateFields.isActive = true;
          needsUpdate = true;
        }
        
        // Check status
        if (user.status && user.status !== 'active') {
          console.log(`   ⚠️  status is '${user.status}', setting to 'active'`);
          updateFields.status = 'active';
          needsUpdate = true;
        }
        
        // Ensure role is set for customers
        if (collection === 'customers' && (!user.role || user.role !== 'customer')) {
          console.log(`   ⚠️  role is '${user.role}', setting to 'customer'`);
          updateFields.role = 'customer';
          needsUpdate = true;
        }
        
        // Update lastActive
        updateFields.lastActive = new Date();
        updateFields.updatedAt = new Date();
        needsUpdate = true;
        
        if (needsUpdate) {
          await db.collection(collection).updateOne(
            { _id: user._id },
            { $set: updateFields }
          );
          console.log(`   ✅ Updated ${collection} record`);
          fixedRecords++;
        } else {
          console.log(`   ✅ ${collection} record is already correct`);
        }
      }
      
      // Step 4: Remove duplicate records (keep customers collection as primary)
      if (foundRecords.length > 1) {
        console.log('\n🧹 Removing duplicate records...');
        
        for (const record of foundRecords) {
          if (record.collection !== 'customers') {
            // Only remove if it's not an admin user with admin role
            if (record.collection === 'admin_users' && 
                record.user.role && 
                ['super_admin', 'admin', 'manager'].includes(record.user.role)) {
              console.log(`   ⚠️  Keeping admin_users record (has admin role: ${record.user.role})`);
              
              // But ensure it's active
              await db.collection('admin_users').updateOne(
                { _id: record.user._id },
                { 
                  $set: { 
                    isActive: true, 
                    status: 'active',
                    lastActive: new Date(),
                    updatedAt: new Date()
                  } 
                }
              );
              console.log(`   ✅ Fixed admin_users record permissions`);
              
            } else {
              console.log(`   🗑️  Removing duplicate from ${record.collection}`);
              await db.collection(record.collection).deleteOne({ _id: record.user._id });
              removedRecords++;
            }
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ PERMISSION FIX COMPLETE');
    console.log('='.repeat(50));
    console.log(`📊 Records fixed: ${fixedRecords}`);
    console.log(`🗑️  Records removed: ${removedRecords}`);
    
    console.log('\n🧪 Testing the fix...');
    
    // Test the fix
    const testUser = await db.collection('customers').findOne({ email: email });
    if (testUser) {
      const isActive = testUser.isActive !== false && (!testUser.status || testUser.status === 'active');
      console.log(`✅ Customer record found in customers collection`);
      console.log(`   📧 Email: ${testUser.email}`);
      console.log(`   👤 Role: ${testUser.role}`);
      console.log(`   🟢 isActive: ${testUser.isActive}`);
      console.log(`   📊 Status: ${testUser.status}`);
      console.log(`   🚦 Auth Check: ${isActive ? '✅ PASS' : '❌ FAIL'}`);
      
      if (isActive) {
        console.log('\n🎉 SUCCESS! Customer should now be able to access dashboard');
        console.log('\n📝 Next steps:');
        console.log('   1. Ask customer to refresh the app or re-login');
        console.log('   2. Test with: node test-customer123-stats-with-auth.js');
      } else {
        console.log('\n❌ Still has permission issues. Manual intervention needed.');
      }
    } else {
      console.log('❌ Customer record not found after fix. Something went wrong.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixCustomer123Permissions().catch(console.error);