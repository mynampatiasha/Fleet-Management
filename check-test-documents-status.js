// Check Test Documents Status
// This script checks if test documents were created and their expiry status

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkTestDocuments() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING TEST DOCUMENTS STATUS');
  console.log('='.repeat(80) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const now = new Date();
    const tenDaysFromNow = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));

    // Check vehicles with test documents
    console.log('📋 CHECKING VEHICLE DOCUMENTS');
    console.log('-'.repeat(80));

    const vehicles = await db.collection('vehicles').find({
      'documents.documentName': /Test/i
    }).toArray();

    console.log(`Found ${vehicles.length} vehicle(s) with test documents\n`);

    for (const vehicle of vehicles) {
      console.log(`Vehicle: ${vehicle.registrationNumber || vehicle.vehicleId}`);
      
      const testDocs = vehicle.documents.filter(doc => 
        doc.documentName && doc.documentName.includes('Test')
      );

      for (const doc of testDocs) {
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        const isExpired = expiryDate < now;
        const isExpiringSoon = expiryDate <= tenDaysFromNow && !isExpired;

        console.log(`  📄 ${doc.documentName}`);
        console.log(`     Type: ${doc.documentType}`);
        console.log(`     Expiry Date: ${expiryDate.toLocaleDateString()}`);
        console.log(`     Days Until Expiry: ${daysUntilExpiry}`);
        console.log(`     Status: ${isExpired ? '🔴 EXPIRED' : isExpiringSoon ? '🟠 EXPIRING SOON' : '🟢 VALID'}`);
        console.log(`     Should Notify: ${isExpired || isExpiringSoon ? 'YES ✅' : 'NO'}`);
        console.log('');
      }
    }

    // Check drivers with test documents
    console.log('📋 CHECKING DRIVER DOCUMENTS');
    console.log('-'.repeat(80));

    const drivers = await db.collection('drivers').find({
      'documents.documentName': /Test/i
    }).toArray();

    console.log(`Found ${drivers.length} driver(s) with test documents\n`);

    for (const driver of drivers) {
      const driverName = driver.personalInfo?.firstName 
        ? `${driver.personalInfo.firstName} ${driver.personalInfo.lastName || ''}`.trim()
        : driver.driverId;
      
      console.log(`Driver: ${driverName}`);
      
      const testDocs = driver.documents.filter(doc => 
        doc.documentName && doc.documentName.includes('Test')
      );

      for (const doc of testDocs) {
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        const isExpired = expiryDate < now;
        const isExpiringSoon = expiryDate <= tenDaysFromNow && !isExpired;

        console.log(`  📄 ${doc.documentName}`);
        console.log(`     Type: ${doc.documentType}`);
        console.log(`     Expiry Date: ${expiryDate.toLocaleDateString()}`);
        console.log(`     Days Until Expiry: ${daysUntilExpiry}`);
        console.log(`     Status: ${isExpired ? '🔴 EXPIRED' : isExpiringSoon ? '🟠 EXPIRING SOON' : '🟢 VALID'}`);
        console.log(`     Should Notify: ${isExpired || isExpiringSoon ? 'YES ✅' : 'NO'}`);
        console.log('');
      }
    }

    // Check notifications
    console.log('📋 CHECKING NOTIFICATIONS');
    console.log('-'.repeat(80));

    const notifications = await db.collection('notifications').find({
      $or: [
        { type: 'document_expired' },
        { type: 'document_expiring_soon' }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`Found ${notifications.length} document expiry notification(s)\n`);

    if (notifications.length > 0) {
      for (const notif of notifications) {
        console.log(`📬 ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   User: ${notif.userId}`);
        console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
        console.log('');
      }
    } else {
      console.log('⚠️  No document expiry notifications found in database');
      console.log('');
    }

    // Check admin users
    console.log('📋 CHECKING ADMIN USERS');
    console.log('-'.repeat(80));

    const adminUsers = await db.collection('users').find({
      role: 'admin'
    }).toArray();

    console.log(`Found ${adminUsers.length} admin user(s)\n`);

    for (const admin of adminUsers) {
      console.log(`👤 ${admin.email}`);
      console.log(`   Name: ${admin.name || 'N/A'}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Firebase UID: ${admin.firebaseUid || 'N/A'}`);
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Vehicles with test documents: ${vehicles.length}`);
    console.log(`Drivers with test documents: ${drivers.length}`);
    console.log(`Document expiry notifications: ${notifications.length}`);
    console.log(`Admin users: ${adminUsers.length}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error checking test documents:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

// Run the script
checkTestDocuments().catch(console.error);
