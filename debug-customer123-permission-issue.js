const { MongoClient } = require('mongodb');

async function debugCustomer123PermissionIssue() {
  const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🔍 DEBUGGING CUSTOMER123 PERMISSION ISSUE');
    console.log('=' .repeat(60));
    
    const email = 'customer123@abrafleet.com';
    const collections = ['users', 'admin_users', 'employee_admins', 'drivers', 'customers', 'clients'];
    
    console.log(`\n📧 Searching for: ${email}`);
    console.log('─'.repeat(60));
    
    let foundRecords = [];
    
    // Check each collection
    for (const collectionName of collections) {
      try {
        const user = await db.collection(collectionName).findOne({ 
          $or: [
            { email: email },
            { firebaseUid: { $exists: true } }
          ]
        });
        
        if (user && user.email === email) {
          foundRecords.push({
            collection: collectionName,
            user: user
          });
          
          console.log(`\n✅ FOUND in ${collectionName.toUpperCase()}:`);
          console.log(`   📧 Email: ${user.email}`);
          console.log(`   🔑 Firebase UID: ${user.firebaseUid || 'NOT SET'}`);
          console.log(`   👤 Role: ${user.role || 'NOT SET'}`);
          console.log(`   🟢 isActive: ${user.isActive !== undefined ? user.isActive : 'NOT SET'}`);
          console.log(`   📊 Status: ${user.status || 'NOT SET'}`);
          console.log(`   🏢 Organization: ${user.organizationId || 'NOT SET'}`);
          
          // Check specific permission fields
          if (user.permissions) {
            console.log(`   🔐 Permissions: ${typeof user.permissions === 'object' ? 'SET' : user.permissions}`);
          }
          if (user.modules) {
            console.log(`   📦 Modules: ${Array.isArray(user.modules) ? user.modules.join(', ') : user.modules}`);
          }
          
          // Determine if this record would cause 403
          const isActive = user.isActive !== false && (!user.status || user.status === 'active');
          console.log(`   🚦 Would Pass Auth: ${isActive ? '✅ YES' : '❌ NO (403 ERROR)'}`);
          
          if (!isActive) {
            console.log(`   ⚠️  PROBLEM: This record would cause 403 error!`);
            if (user.isActive === false) {
              console.log(`      - isActive is false`);
            }
            if (user.status && user.status !== 'active') {
              console.log(`      - status is '${user.status}' (should be 'active')`);
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${collectionName}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    
    if (foundRecords.length === 0) {
      console.log('❌ NO RECORDS FOUND - User does not exist in any collection!');
      console.log('   Solution: Create customer record in customers collection');
    } else {
      console.log(`✅ Found ${foundRecords.length} record(s)`);
      
      // Determine which record would be used (first in search order)
      const usedRecord = foundRecords[0];
      console.log(`\n🎯 RECORD THAT WOULD BE USED: ${usedRecord.collection.toUpperCase()}`);
      
      const isActive = usedRecord.user.isActive !== false && 
                       (!usedRecord.user.status || usedRecord.user.status === 'active');
      
      if (isActive) {
        console.log('✅ This record would ALLOW access');
        console.log('   The 403 error might be due to:');
        console.log('   - Expired Firebase token (user needs to re-login)');
        console.log('   - Network/connection issues');
        console.log('   - Backend server issues');
      } else {
        console.log('❌ This record would DENY access (403 error)');
        console.log('\n🔧 FIXES NEEDED:');
        
        if (usedRecord.user.isActive === false) {
          console.log(`   1. Set isActive to true in ${usedRecord.collection}`);
        }
        if (usedRecord.user.status && usedRecord.user.status !== 'active') {
          console.log(`   2. Set status to 'active' in ${usedRecord.collection}`);
        }
      }
      
      // Check for duplicate records
      if (foundRecords.length > 1) {
        console.log('\n⚠️  WARNING: Multiple records found!');
        console.log('   This can cause confusion. Consider:');
        foundRecords.forEach((record, index) => {
          if (index > 0) {
            console.log(`   - Remove duplicate from ${record.collection}`);
          }
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🛠️  RECOMMENDED ACTIONS');
    console.log('='.repeat(60));
    
    if (foundRecords.length > 0) {
      const usedRecord = foundRecords[0];
      const isActive = usedRecord.user.isActive !== false && 
                       (!usedRecord.user.status || usedRecord.user.status === 'active');
      
      if (!isActive) {
        console.log('1. Fix the permission issue:');
        console.log(`   node fix-customer123-permissions.js`);
        console.log('\n2. Test the fix:');
        console.log(`   node test-customer123-stats-with-auth.js`);
      } else {
        console.log('1. User permissions look correct. Check:');
        console.log('   - Firebase token expiration (user re-login)');
        console.log('   - Backend server status');
        console.log('   - Network connectivity');
        console.log('\n2. Test authentication:');
        console.log(`   node test-customer123-stats-with-auth.js`);
      }
    } else {
      console.log('1. Create customer record:');
      console.log(`   node create-customer123-demo-data.js`);
      console.log('\n2. Test the new record:');
      console.log(`   node test-customer123-stats-with-auth.js`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugCustomer123PermissionIssue().catch(console.error);