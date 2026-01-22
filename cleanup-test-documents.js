// Cleanup Test Documents
// This script removes test documents created for testing the notification system

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function cleanupTestDocuments() {
  console.log('\n' + '='.repeat(80));
  console.log('🧹 CLEANING UP TEST DOCUMENTS');
  console.log('='.repeat(80) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Remove test documents from vehicles
    console.log('📋 Removing test documents from vehicles...');
    const vehicleResult = await db.collection('vehicles').updateMany(
      {},
      {
        $pull: {
          documents: {
            documentName: { $regex: /^Test/, $options: 'i' }
          }
        }
      }
    );
    console.log(`✅ Removed test documents from ${vehicleResult.modifiedCount} vehicle(s)\n`);

    // Remove test documents from drivers
    console.log('📋 Removing test documents from drivers...');
    const driverResult = await db.collection('drivers').updateMany(
      {},
      {
        $pull: {
          documents: {
            documentName: { $regex: /^Test/, $options: 'i' }
          }
        }
      }
    );
    console.log(`✅ Removed test documents from ${driverResult.modifiedCount} driver(s)\n`);

    // Remove test notifications
    console.log('📋 Removing test notifications...');
    const notificationResult = await db.collection('notifications').deleteMany({
      'data.documentName': { $regex: /^Test/, $options: 'i' }
    });
    console.log(`✅ Removed ${notificationResult.deletedCount} test notification(s)\n`);

    console.log('='.repeat(80));
    console.log('✅ CLEANUP COMPLETE');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

// Run the cleanup
cleanupTestDocuments().catch(console.error);
