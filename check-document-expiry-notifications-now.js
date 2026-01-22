// Check if admins are receiving document expiry notifications
// This script verifies the complete notification flow

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkDocumentExpiryNotifications() {
  console.log('\n' + '='.repeat(80));
  console.log('🔔 CHECKING DOCUMENT EXPIRY NOTIFICATIONS FOR ADMINS');
  console.log('='.repeat(80) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const now = new Date();
    const tenDaysFromNow = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));

    // Step 1: Check for expiring/expired documents
    console.log('📋 STEP 1: Checking for Expiring/Expired Documents');
    console.log('-'.repeat(80));

    // Check vehicles
    const vehicles = await db.collection('vehicles').find({
      'documents.0': { $exists: true }
    }).toArray();

    let expiredVehicleDocs = [];
    let expiringSoonVehicleDocs = [];

    for (const vehicle of vehicles) {
      for (const doc of vehicle.documents || []) {
        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

          if (expiryDate < now) {
            expiredVehicleDocs.push({
              vehicleId: vehicle.vehicleId || vehicle.registrationNumber,
              documentName: doc.documentName || doc.documentType,
              expiryDate: doc.expiryDate,
              daysOverdue: Math.abs(daysUntilExpiry)
            });
          } else if (expiryDate <= tenDaysFromNow) {
            expiringSoonVehicleDocs.push({
              vehicleId: vehicle.vehicleId || vehicle.registrationNumber,
              documentName: doc.documentName || doc.documentType,
              expiryDate: doc.expiryDate,
              daysUntilExpiry
            });
          }
        }
      }
    }

    // Check drivers
    const drivers = await db.collection('drivers').find({
      'documents.0': { $exists: true }
    }).toArray();

    let expiredDriverDocs = [];
    let expiringSoonDriverDocs = [];

    for (const driver of drivers) {
      for (const doc of driver.documents || []) {
        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

          const driverName = driver.personalInfo?.firstName 
            ? `${driver.personalInfo.firstName} ${driver.personalInfo.lastName || ''}`.trim()
            : driver.driverId;

          if (expiryDate < now) {
            expiredDriverDocs.push({
              driverName,
              documentName: doc.documentName || doc.documentType,
              expiryDate: doc.expiryDate,
              daysOverdue: Math.abs(daysUntilExpiry)
            });
          } else if (expiryDate <= tenDaysFromNow) {
            expiringSoonDriverDocs.push({
              driverName,
              documentName: doc.documentName || doc.documentType,
              expiryDate: doc.expiryDate,
              daysUntilExpiry
            });
          }
        }
      }
    }

    console.log(`\n📊 Document Status Summary:`);
    console.log(`   🔴 Expired Vehicle Documents: ${expiredVehicleDocs.length}`);
    console.log(`   🟠 Expiring Soon Vehicle Documents: ${expiringSoonVehicleDocs.length}`);
    console.log(`   🔴 Expired Driver Documents: ${expiredDriverDocs.length}`);
    console.log(`   🟠 Expiring Soon Driver Documents: ${expiringSoonDriverDocs.length}`);
    console.log('');

    // Show details
    if (expiredVehicleDocs.length > 0) {
      console.log('🔴 EXPIRED VEHICLE DOCUMENTS:');
      expiredVehicleDocs.forEach(doc => {
        console.log(`   - ${doc.vehicleId}: ${doc.documentName} (${doc.daysOverdue} days overdue)`);
      });
      console.log('');
    }

    if (expiringSoonVehicleDocs.length > 0) {
      console.log('🟠 EXPIRING SOON VEHICLE DOCUMENTS:');
      expiringSoonVehicleDocs.forEach(doc => {
        console.log(`   - ${doc.vehicleId}: ${doc.documentName} (expires in ${doc.daysUntilExpiry} days)`);
      });
      console.log('');
    }

    if (expiredDriverDocs.length > 0) {
      console.log('🔴 EXPIRED DRIVER DOCUMENTS:');
      expiredDriverDocs.forEach(doc => {
        console.log(`   - ${doc.driverName}: ${doc.documentName} (${doc.daysOverdue} days overdue)`);
      });
      console.log('');
    }

    if (expiringSoonDriverDocs.length > 0) {
      console.log('🟠 EXPIRING SOON DRIVER DOCUMENTS:');
      expiringSoonDriverDocs.forEach(doc => {
        console.log(`   - ${doc.driverName}: ${doc.documentName} (expires in ${doc.daysUntilExpiry} days)`);
      });
      console.log('');
    }

    const totalIssues = expiredVehicleDocs.length + expiringSoonVehicleDocs.length + 
                        expiredDriverDocs.length + expiringSoonDriverDocs.length;

    if (totalIssues === 0) {
      console.log('✅ No documents are expired or expiring soon!\n');
      console.log('='.repeat(80));
      console.log('✅ ALL DOCUMENTS ARE VALID - NO NOTIFICATIONS NEEDED');
      console.log('='.repeat(80) + '\n');
      return;
    }

    // Step 2: Check for notifications in database
    console.log('📋 STEP 2: Checking Notification Database');
    console.log('-'.repeat(80));

    const notifications = await db.collection('notifications').find({
      type: { $in: ['document_expired', 'document_expiring_soon'] }
    }).sort({ createdAt: -1 }).limit(20).toArray();

    console.log(`\n📬 Found ${notifications.length} document expiry notifications (last 20)\n`);

    if (notifications.length > 0) {
      console.log('Recent Notifications:');
      notifications.slice(0, 5).forEach((notif, index) => {
        const createdAt = new Date(notif.createdAt);
        const timeAgo = getTimeAgo(createdAt);
        const icon = notif.type === 'document_expired' ? '🔴' : '🟠';
        
        console.log(`\n${index + 1}. ${icon} ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Created: ${timeAgo}`);
        console.log(`   Recipient: ${notif.recipientRole} - ${notif.recipientId}`);
        console.log(`   Entity: ${notif.data?.entityType} - ${notif.data?.entityName}`);
      });
      console.log('');
    } else {
      console.log('⚠️  NO NOTIFICATIONS FOUND IN DATABASE!\n');
      console.log('   This means the backend notification system has NOT run yet.\n');
    }

    // Step 3: Check admin users
    console.log('📋 STEP 3: Checking Admin Users');
    console.log('-'.repeat(80));

    const adminUsers = await db.collection('users').find({
      role: 'admin'
    }).toArray();

    console.log(`\n👥 Found ${adminUsers.length} admin user(s)\n`);

    if (adminUsers.length === 0) {
      console.log('❌ NO ADMIN USERS FOUND!');
      console.log('   Notifications cannot be sent without admin users.\n');
    } else {
      console.log('Admin Users:');
      adminUsers.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.name || admin.email}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Firebase UID: ${admin.firebaseUid || 'NOT SET'}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.firebaseUid ? '✅ Ready for notifications' : '⚠️  Missing Firebase UID'}`);
      });
      console.log('');
    }

    // Step 4: Check when last notification check ran
    console.log('📋 STEP 4: Checking Last Notification Run');
    console.log('-'.repeat(80));

    const lastNotification = await db.collection('notifications').findOne({
      type: { $in: ['document_expired', 'document_expiring_soon'] }
    }, { sort: { createdAt: -1 } });

    if (lastNotification) {
      const lastRun = new Date(lastNotification.createdAt);
      const timeSinceLastRun = getTimeAgo(lastRun);
      console.log(`\n⏰ Last notification sent: ${timeSinceLastRun}`);
      console.log(`   Date: ${lastRun.toLocaleString()}`);
      console.log('');
    } else {
      console.log('\n⚠️  No notifications have been sent yet!\n');
    }

    // Step 5: Final verdict
    console.log('='.repeat(80));
    console.log('📊 FINAL VERDICT');
    console.log('='.repeat(80));
    console.log('');

    if (totalIssues > 0 && notifications.length === 0) {
      console.log('❌ PROBLEM DETECTED:');
      console.log('   - Documents ARE expiring/expired');
      console.log('   - But NO notifications have been sent!');
      console.log('');
      console.log('🔧 SOLUTION:');
      console.log('   1. Check if backend is running: http://localhost:3001/api/health');
      console.log('   2. Check backend logs for "📄 DOCUMENT EXPIRY CHECK"');
      console.log('   3. Manually trigger check:');
      console.log('      POST http://localhost:3001/api/notifications/check-document-expiry');
      console.log('      (Requires admin authentication)');
      console.log('');
      console.log('   The backend should automatically check every 6 hours.');
      console.log('   If it hasn\'t run yet, wait or trigger manually.');
      console.log('');
    } else if (totalIssues > 0 && notifications.length > 0) {
      console.log('✅ NOTIFICATIONS ARE WORKING:');
      console.log(`   - ${totalIssues} document(s) need attention`);
      console.log(`   - ${notifications.length} notification(s) have been sent`);
      console.log('');
      console.log('📱 Admins should see notifications in:');
      console.log('   1. Admin Dashboard → Notifications icon (top right)');
      console.log('   2. Floating notification popup (every 60 seconds)');
      console.log('   3. Driver Management → Document Expiry Alerts card');
      console.log('   4. Vehicle Master → Document status indicators');
      console.log('');
      
      if (adminUsers.some(admin => !admin.firebaseUid)) {
        console.log('⚠️  WARNING: Some admins are missing Firebase UID');
        console.log('   They may not receive OneSignal push notifications.');
        console.log('');
      }
    } else {
      console.log('✅ ALL DOCUMENTS ARE VALID');
      console.log('   No notifications needed at this time.');
      console.log('');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Run the check
checkDocumentExpiryNotifications().catch(console.error);
