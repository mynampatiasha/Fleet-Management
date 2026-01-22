// Test Document Expiry Notification System
// This script verifies that the document expiry system is working correctly

const { MongoClient } = require('mongodb');
const http = require('http');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function testDocumentExpirySystem() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTING DOCUMENT EXPIRY NOTIFICATION SYSTEM');
  console.log('='.repeat(70) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Test 1: Check for vehicles with documents
    console.log('📋 TEST 1: Checking Vehicle Documents');
    console.log('-'.repeat(70));
    const vehicles = await db.collection('vehicles').find({
      'documents.0': { $exists: true }
    }).limit(5).toArray();

    console.log(`Found ${vehicles.length} vehicles with documents\n`);

    if (vehicles.length > 0) {
      for (const vehicle of vehicles) {
        console.log(`🚗 Vehicle: ${vehicle.registrationNumber || vehicle.vehicleId}`);
        console.log(`   Documents: ${vehicle.documents.length}`);
        
        for (const doc of vehicle.documents) {
          const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
          const now = new Date();
          
          if (expiryDate) {
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            const status = daysUntilExpiry < 0 ? '🔴 EXPIRED' : 
                          daysUntilExpiry <= 10 ? '🟠 EXPIRING SOON' : 
                          '🟢 VALID';
            
            console.log(`   - ${doc.documentName || doc.documentType}: ${status} (${daysUntilExpiry} days)`);
          } else {
            console.log(`   - ${doc.documentName || doc.documentType}: ⚪ No expiry date`);
          }
        }
        console.log('');
      }
    } else {
      console.log('⚠️  No vehicles with documents found\n');
    }

    // Test 2: Check for drivers with documents
    console.log('📋 TEST 2: Checking Driver Documents');
    console.log('-'.repeat(70));
    const drivers = await db.collection('drivers').find({
      'documents.0': { $exists: true }
    }).limit(5).toArray();

    console.log(`Found ${drivers.length} drivers with documents\n`);

    if (drivers.length > 0) {
      for (const driver of drivers) {
        const driverName = driver.personalInfo?.firstName 
          ? `${driver.personalInfo.firstName} ${driver.personalInfo.lastName || ''}`.trim()
          : driver.driverId;
        
        console.log(`👤 Driver: ${driverName}`);
        console.log(`   Documents: ${driver.documents.length}`);
        
        for (const doc of driver.documents) {
          const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
          const now = new Date();
          
          if (expiryDate) {
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            const status = daysUntilExpiry < 0 ? '🔴 EXPIRED' : 
                          daysUntilExpiry <= 10 ? '🟠 EXPIRING SOON' : 
                          '🟢 VALID';
            
            console.log(`   - ${doc.documentName || doc.documentType}: ${status} (${daysUntilExpiry} days)`);
          } else {
            console.log(`   - ${doc.documentName || doc.documentType}: ⚪ No expiry date`);
          }
        }
        console.log('');
      }
    } else {
      console.log('⚠️  No drivers with documents found\n');
    }

    // Test 3: Check for document expiry notifications
    console.log('📋 TEST 3: Checking Document Expiry Notifications');
    console.log('-'.repeat(70));
    const notifications = await db.collection('notifications').find({
      type: { $in: ['document_expired', 'document_expiring_soon'] }
    }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`Found ${notifications.length} document expiry notifications (last 10)\n`);

    if (notifications.length > 0) {
      for (const notif of notifications) {
        const createdAt = new Date(notif.createdAt);
        const timeAgo = getTimeAgo(createdAt);
        const icon = notif.type === 'document_expired' ? '🔴' : '🟠';
        
        console.log(`${icon} ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Created: ${timeAgo}`);
        console.log(`   Entity: ${notif.data?.entityType} - ${notif.data?.entityName}`);
        console.log(`   Document: ${notif.data?.documentName}`);
        console.log('');
      }
    } else {
      console.log('⚠️  No document expiry notifications found\n');
      console.log('💡 This is normal if no documents are expiring or expired\n');
    }

    // Test 4: Check admin users
    console.log('📋 TEST 4: Checking Admin Users');
    console.log('-'.repeat(70));
    const adminUsers = await db.collection('users').find({
      role: 'admin'
    }).toArray();

    console.log(`Found ${adminUsers.length} admin users\n`);

    if (adminUsers.length > 0) {
      for (const admin of adminUsers) {
        console.log(`👤 ${admin.name || admin.email}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Firebase UID: ${admin.firebaseUid || 'Not set'}`);
        console.log(`   Role: ${admin.role}`);
        console.log('');
      }
    } else {
      console.log('⚠️  No admin users found - notifications will not be sent!\n');
    }

    // Test 5: Test backend endpoint
    console.log('📋 TEST 5: Testing Backend Health');
    console.log('-'.repeat(70));
    
    try {
      const response = await makeRequest(`${BACKEND_URL}/api/health`);
      console.log('✅ Backend is healthy');
      console.log(`   Status: ${response.status || 'OK'}`);
      console.log('');
    } catch (error) {
      console.log('❌ Backend is not responding');
      console.log(`   Error: ${error.message}`);
      console.log('');
    }

    // Summary
    console.log('='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Vehicles with documents: ${vehicles.length}`);
    console.log(`✅ Drivers with documents: ${drivers.length}`);
    console.log(`✅ Document expiry notifications: ${notifications.length}`);
    console.log(`✅ Admin users: ${adminUsers.length}`);
    console.log('');

    // Count expired and expiring documents
    let expiredCount = 0;
    let expiringSoonCount = 0;
    const now = new Date();

    for (const vehicle of vehicles) {
      for (const doc of vehicle.documents) {
        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry < 0) expiredCount++;
          else if (daysUntilExpiry <= 10) expiringSoonCount++;
        }
      }
    }

    for (const driver of drivers) {
      for (const doc of driver.documents) {
        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry < 0) expiredCount++;
          else if (daysUntilExpiry <= 10) expiringSoonCount++;
        }
      }
    }

    console.log('📈 Document Status:');
    console.log(`   🔴 Expired: ${expiredCount}`);
    console.log(`   🟠 Expiring Soon (within 10 days): ${expiringSoonCount}`);
    console.log('');

    if (expiredCount > 0 || expiringSoonCount > 0) {
      console.log('⚠️  ACTION REQUIRED:');
      console.log('   - Admins should receive notifications for these documents');
      console.log('   - Check admin notifications screen in the app');
      console.log('   - Renew expired documents immediately');
      console.log('');
    } else {
      console.log('✅ All documents are valid (no action required)');
      console.log('');
    }

    console.log('💡 To manually trigger document expiry check:');
    console.log('   POST http://localhost:3001/api/notifications/check-document-expiry');
    console.log('   (Requires admin authentication)');
    console.log('');

    console.log('='.repeat(70));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: 'OK' });
        }
      });
    }).on('error', reject);
  });
}

// Helper function to format time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Run the test
testDocumentExpirySystem().catch(console.error);
