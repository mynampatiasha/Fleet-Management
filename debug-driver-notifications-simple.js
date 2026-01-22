// Simple Driver Notifications Debug - MongoDB Only
const { MongoClient } = require('mongodb');

async function debugDriverNotifications() {
  console.log('🔍 SIMPLE DRIVER NOTIFICATIONS DEBUG');
  console.log('===================================\n');

  try {
    // Connect to MongoDB
    console.log('1️⃣ CONNECTING TO MONGODB...');
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet');
    
    // Check all notifications
    console.log('\n2️⃣ CHECKING ALL NOTIFICATIONS...');
    const allNotifications = await db.collection('notifications')
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    console.log(`📊 Total notifications in database: ${allNotifications.length}`);
    
    if (allNotifications.length > 0) {
      console.log('\n📋 ALL NOTIFICATIONS:');
      allNotifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.title}`);
        console.log(`      Type: ${notification.type}`);
        console.log(`      User ID: ${notification.userId}`);
        console.log(`      Read: ${notification.isRead}`);
        console.log(`      Date: ${notification.createdAt}`);
        console.log('      ---');
      });
    }
    
    // Check for driver-specific notifications
    console.log('\n3️⃣ CHECKING DRIVER-SPECIFIC NOTIFICATIONS...');
    
    // Common driver Firebase UIDs to check
    const driverUIDs = [
      'wvm5wdXaWNOAqVOXX5l8fWbfYFz2', // drivertest@gmail.com
      'rajesh-kumar-uid',
      'driver-uid'
    ];
    
    for (const uid of driverUIDs) {
      const driverNotifications = await db.collection('notifications')
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`📬 Notifications for UID ${uid}: ${driverNotifications.length}`);
      
      if (driverNotifications.length > 0) {
        driverNotifications.forEach((notification, index) => {
          console.log(`   ${index + 1}. ${notification.title} (${notification.type})`);
        });
      }
    }
    
    // Check notification types
    console.log('\n4️⃣ CHECKING NOTIFICATION TYPES...');
    const typeAggregation = await db.collection('notifications')
      .aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
      .toArray();
    
    console.log('📊 Notification types:');
    typeAggregation.forEach(type => {
      console.log(`   ${type._id}: ${type.count}`);
    });
    
    // Check users collection for driver info
    console.log('\n5️⃣ CHECKING USERS COLLECTION...');
    const drivers = await db.collection('users')
      .find({ role: 'driver' })
      .limit(5)
      .toArray();
    
    console.log(`👥 Drivers found: ${drivers.length}`);
    drivers.forEach((driver, index) => {
      console.log(`   ${index + 1}. ${driver.email} (UID: ${driver.firebaseUID || 'NOT SET'})`);
    });
    
    await client.close();
    console.log('\n✅ MongoDB connection closed');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n🏁 DEBUG COMPLETE');
}

// Run the debug
debugDriverNotifications().catch(console.error);