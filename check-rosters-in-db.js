const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function checkRostersInDB() {
  let client;
  
  try {
    console.log('🔍 Checking Rosters in Database\n');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    console.log('\n1️⃣ Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI}`);
    
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    // Check rosters collection
    console.log('\n2️⃣ Checking rosters collection...');
    const rostersCollection = db.collection('rosters');
    
    const totalCount = await rostersCollection.countDocuments();
    console.log(`   Total rosters in DB: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('\n⚠️  No rosters found in database!');
      console.log('   This means rosters are not being saved to the database.');
      console.log('   Check the roster creation endpoint.');
      return;
    }
    
    // Get recent rosters
    console.log('\n3️⃣ Fetching recent rosters...');
    const recentRosters = await rostersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log(`\n📋 Found ${recentRosters.length} recent rosters:\n`);
    
    recentRosters.forEach((roster, index) => {
      console.log(`--- Roster ${index + 1} ---`);
      console.log(`   ID: ${roster._id}`);
      console.log(`   Status: ${roster.status}`);
      console.log(`   Customer Email: ${roster.customerEmail || 'N/A'}`);
      console.log(`   Customer Name: ${roster.customerName || 'N/A'}`);
      console.log(`   Office Location: ${roster.officeLocation || 'N/A'}`);
      console.log(`   Roster Type: ${roster.rosterType || 'N/A'}`);
      console.log(`   Created At: ${roster.createdAt || 'N/A'}`);
      console.log(`   Date Range: ${JSON.stringify(roster.dateRange || {})}`);
      console.log(`   Time Range: ${JSON.stringify(roster.timeRange || {})}`);
      console.log(`   Locations: ${roster.locations ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check for rosters with different status
    console.log('\n4️⃣ Checking rosters by status...');
    const statuses = ['pending_assignment', 'assigned', 'in_progress', 'completed', 'cancelled'];
    
    for (const status of statuses) {
      const count = await rostersCollection.countDocuments({ status });
      if (count > 0) {
        console.log(`   ${status}: ${count} rosters`);
      }
    }
    
    // Check for rosters without customerEmail
    console.log('\n5️⃣ Checking data quality...');
    const noEmailCount = await rostersCollection.countDocuments({ 
      $or: [
        { customerEmail: { $exists: false } },
        { customerEmail: null },
        { customerEmail: '' }
      ]
    });
    
    if (noEmailCount > 0) {
      console.log(`   ⚠️  ${noEmailCount} rosters without customer email`);
      console.log('   These rosters won\'t show up in My Trips!');
      
      // Show sample
      const sampleNoEmail = await rostersCollection
        .findOne({ 
          $or: [
            { customerEmail: { $exists: false } },
            { customerEmail: null },
            { customerEmail: '' }
          ]
        });
      
      if (sampleNoEmail) {
        console.log('\n   Sample roster without email:');
        console.log(`   ID: ${sampleNoEmail._id}`);
        console.log(`   Customer Name: ${sampleNoEmail.customerName || 'N/A'}`);
        console.log(`   All fields: ${Object.keys(sampleNoEmail).join(', ')}`);
      }
    } else {
      console.log('   ✅ All rosters have customer email');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

checkRostersInDB();
