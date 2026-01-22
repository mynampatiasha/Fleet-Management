const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/abra_fleet_management';

async function debugRosterOwnership() {
  console.log('🔍 Debugging Roster Ownership Structure...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('abra_fleet_management');

    // Check the specific roster from the error
    const rosterId = '694ce9909ceaf59f79334344';
    
    console.log(`📋 Analyzing roster: ${rosterId}\n`);

    const roster = await db.collection('rosters').findOne({ 
      _id: new require('mongodb').ObjectId(rosterId)
    });

    if (!roster) {
      console.log('❌ Roster not found');
      return;
    }

    console.log('📄 ROSTER STRUCTURE:');
    console.log('==================');
    console.log('ID:', roster._id);
    console.log('Status:', roster.status);
    console.log('Created At:', roster.createdAt);
    console.log('Updated At:', roster.updatedAt);
    
    console.log('\n🔑 OWNERSHIP FIELDS:');
    console.log('===================');
    console.log('customerEmail:', roster.customerEmail);
    console.log('employeeDetails.email:', roster.employeeDetails?.email);
    console.log('employeeData.email:', roster.employeeData?.email);
    console.log('userId (deprecated):', roster.userId);
    
    console.log('\n👤 EMPLOYEE DETAILS:');
    console.log('===================');
    if (roster.employeeDetails) {
      console.log('Name:', roster.employeeDetails.name);
      console.log('Email:', roster.employeeDetails.email);
      console.log('Phone:', roster.employeeDetails.phone);
      console.log('Employee ID:', roster.employeeDetails.employeeId);
    } else {
      console.log('No employeeDetails found');
    }

    console.log('\n🏢 ORGANIZATION INFO:');
    console.log('====================');
    console.log('Organization:', roster.organization);
    console.log('Branch:', roster.branch);

    // Check if customer123 exists in admin_users
    console.log('\n👥 CHECKING USER IN ADMIN_USERS:');
    console.log('================================');
    
    const customer123 = await db.collection('admin_users').findOne({
      $or: [
        { email: 'customer123@example.com' },
        { customerEmail: 'customer123@example.com' },
        { emailAddress: 'customer123@example.com' }
      ]
    });

    if (customer123) {
      console.log('✅ customer123 found in admin_users:');
      console.log('   Email:', customer123.email);
      console.log('   Customer Email:', customer123.customerEmail);
      console.log('   Email Address:', customer123.emailAddress);
      console.log('   Firebase UID:', customer123.firebaseUid);
      console.log('   Role:', customer123.role);
    } else {
      console.log('❌ customer123 NOT found in admin_users');
    }

    // Check ownership match
    console.log('\n🔍 OWNERSHIP ANALYSIS:');
    console.log('=====================');
    
    const rosterOwnerEmail = roster.customerEmail || 
                            roster.employeeDetails?.email || 
                            roster.employeeData?.email;
    
    const userEmail = customer123?.email || customer123?.emailAddress || customer123?.customerEmail;
    
    console.log('Roster Owner Email:', rosterOwnerEmail);
    console.log('User Email:', userEmail);
    console.log('Match:', rosterOwnerEmail === userEmail ? '✅ YES' : '❌ NO');

    if (rosterOwnerEmail !== userEmail) {
      console.log('\n⚠️ OWNERSHIP MISMATCH DETECTED!');
      console.log('This explains the 403 Forbidden error.');
      
      // Suggest fix
      if (roster.customerEmail !== 'customer123@example.com') {
        console.log('\n🔧 SUGGESTED FIX:');
        console.log('Update roster customerEmail to: customer123@example.com');
      }
    }

    // Show recent rosters for comparison
    console.log('\n📊 RECENT ROSTERS SAMPLE:');
    console.log('========================');
    
    const recentRosters = await db.collection('rosters')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    recentRosters.forEach((r, index) => {
      console.log(`\nRoster ${index + 1}:`);
      console.log(`  ID: ${r._id}`);
      console.log(`  Customer Email: ${r.customerEmail}`);
      console.log(`  Employee Email: ${r.employeeDetails?.email}`);
      console.log(`  Status: ${r.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

debugRosterOwnership();