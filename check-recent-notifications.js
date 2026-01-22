// Check Recent Notifications
// This script checks for document expiry notifications created today

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkRecentNotifications() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING RECENT NOTIFICATIONS');
  console.log('='.repeat(80) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`📅 Checking notifications created after: ${today.toLocaleString()}\n`);

    // Check for document expiry notifications created today
    const notifications = await db.collection('notifications').find({
      $or: [
        { type: 'document_expired' },
        { type: 'document_expiring_soon' }
      ],
      createdAt: { $gte: today }
    }).sort({ createdAt: -1 }).toArray();

    console.log(`Found ${notifications.length} document expiry notification(s) created today\n`);

    if (notifications.length > 0) {
      console.log('📬 NOTIFICATIONS CREATED TODAY:');
      console.log('-'.repeat(80));
      
      for (const notif of notifications) {
        console.log(`\n📬 ${notif.title || 'No Title'}`);
        console.log(`   Message: ${notif.message || 'No Message'}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   User ID: ${notif.userId}`);
        console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
        
        if (notif.data) {
          console.log(`   Document: ${notif.data.documentName || 'N/A'}`);
          console.log(`   Entity: ${notif.data.entityName || 'N/A'}`);
          console.log(`   Days Until Expiry: ${notif.data.daysUntilExpiry || 'N/A'}`);
        }
      }
    } else {
      console.log('⚠️  No document expiry notifications created today');
      console.log('');
      console.log('💡 This means either:');
      console.log('   1. The document expiry check hasn\'t run yet');
      console.log('   2. The check ran but found no admin users');
      console.log('   3. Notifications were already sent earlier today (system prevents duplicates)');
      console.log('   4. There was an error during notification creation');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📋 CHECKING ALL DOCUMENT EXPIRY NOTIFICATIONS (LAST 10)');
    console.log('='.repeat(80) + '\n');

    const allNotifications = await db.collection('notifications').find({
      $or: [
        { type: 'document_expired' },
        { type: 'document_expiring_soon' }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`Found ${allNotifications.length} total document expiry notification(s)\n`);

    if (allNotifications.length > 0) {
      for (const notif of allNotifications) {
        console.log(`📬 ${notif.title || 'No Title'}`);
        console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
        console.log(`   User ID: ${notif.userId}`);
        console.log('');
      }
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error checking recent notifications:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

// Run the script
checkRecentNotifications().catch(console.error);
