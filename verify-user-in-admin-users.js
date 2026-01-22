// Verify user exists in admin_users collection with exact UID
const { MongoClient } = require('mongodb');

async function verifyUserInAdminUsers() {
  let client;
  
  try {
    console.log('🔍 Verifying user in admin_users collection...\n');

    const mongoUri = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('✅ Connected to MongoDB');

    const targetUID = 'b5aoloVR7xYI6SICibCIWecBaf82';
    const targetEmail = 'customer123@abrafleet.com';

    console.log(`🔍 Looking for user with UID: ${targetUID}`);
    console.log(`🔍 Looking for user with email: ${targetEmail}`);

    // Test the exact query that the my-rosters endpoint uses
    const user = await db.collection('admin_users').findOne({ 
      $or: [
        { firebaseUid: targetUID },
        { email: targetEmail }
      ]
    });
    
    if (user) {
      console.log('\n✅ User found in admin_users collection:');
      console.log('   _id:', user._id);
      console.log('   name:', user.name);
      console.log('   email:', user.email);
      console.log('   emailAddress:', user.emailAddress);
      console.log('   firebaseUid:', user.firebaseUid);
      console.log('   role:', user.role);
      console.log('   status:', user.status);
      console.log('   isActive:', user.isActive);
      
      // Test the email extraction logic
      const userEmail = user.email || user.emailAddress || user.customerEmail;
      console.log('\n📧 Email extraction result:', userEmail);
      
      if (userEmail) {
        // Test the roster query
        console.log('\n🔍 Testing roster query...');
        const rosterQuery = {
          $or: [
            { customerEmail: userEmail },
            { 'employeeDetails.email': userEmail },
            { 'employeeData.email': userEmail }
          ]
        };
        
        console.log('   Query:', JSON.stringify(rosterQuery, null, 2));
        
        const rosters = await db.collection('rosters').find(rosterQuery).toArray();
        console.log(`   Found ${rosters.length} rosters for this user`);
        
        if (rosters.length > 0) {
          console.log('   Sample roster:');
          console.log('     ID:', rosters[0]._id);
          console.log('     Customer Email:', rosters[0].customerEmail);
          console.log('     Office:', rosters[0].officeLocation);
          console.log('     Status:', rosters[0].status);
        }
      }
    } else {
      console.log('\n❌ User NOT found in admin_users collection');
      
      // Let's see what users are actually in the collection
      console.log('\n🔍 All users in admin_users collection:');
      const allUsers = await db.collection('admin_users').find({}).toArray();
      allUsers.forEach((u, index) => {
        console.log(`   ${index + 1}. ${u.email || u.emailAddress} (UID: ${u.firebaseUid})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

verifyUserInAdminUsers();