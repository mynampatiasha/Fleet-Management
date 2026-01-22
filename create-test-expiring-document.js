// Create Test Document with Expiring Date
// This script adds a test document to verify the notification system works

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function createTestExpiringDocument() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 CREATING TEST DOCUMENT WITH EXPIRING DATE');
  console.log('='.repeat(80) + '\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Option 1: Add test document to a vehicle
    console.log('📋 OPTION 1: Add Test Document to Vehicle');
    console.log('-'.repeat(80));

    // Get first vehicle
    const vehicle = await db.collection('vehicles').findOne({});
    
    if (vehicle) {
      console.log(`✅ Found vehicle: ${vehicle.registrationNumber || vehicle.vehicleId}`);
      
      // Create test document expiring in 5 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 5); // 5 days from now
      
      const testDocument = {
        id: new ObjectId().toString(),
        documentName: 'Test Insurance (Will Expire Soon)',
        documentType: 'Insurance',
        documentNumber: 'TEST-INS-' + Date.now(),
        expiryDate: expiryDate.toISOString(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System Test',
        fileUrl: 'https://example.com/test-document.pdf',
        status: 'active'
      };
      
      // Add document to vehicle
      await db.collection('vehicles').updateOne(
        { _id: vehicle._id },
        { 
          $push: { documents: testDocument }
        }
      );
      
      console.log('✅ Test document added to vehicle');
      console.log(`   Document Name: ${testDocument.documentName}`);
      console.log(`   Document Type: ${testDocument.documentType}`);
      console.log(`   Expiry Date: ${expiryDate.toLocaleDateString()}`);
      console.log(`   Days Until Expiry: 5 days`);
      console.log('');
    } else {
      console.log('⚠️  No vehicles found in database');
      console.log('');
    }

    // Option 2: Add test document to a driver
    console.log('📋 OPTION 2: Add Test Document to Driver');
    console.log('-'.repeat(80));

    // Get first driver
    const driver = await db.collection('drivers').findOne({});
    
    if (driver) {
      const driverName = driver.personalInfo?.firstName 
        ? `${driver.personalInfo.firstName} ${driver.personalInfo.lastName || ''}`.trim()
        : driver.driverId;
      
      console.log(`✅ Found driver: ${driverName}`);
      
      // Create test document expiring in 3 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 3); // 3 days from now
      
      const testDocument = {
        id: new ObjectId().toString(),
        documentName: 'Test License (Will Expire Soon)',
        documentType: 'Driving License',
        documentNumber: 'TEST-LIC-' + Date.now(),
        expiryDate: expiryDate.toISOString(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System Test',
        fileUrl: 'https://example.com/test-license.pdf',
        status: 'active'
      };
      
      // Add document to driver
      await db.collection('drivers').updateOne(
        { _id: driver._id },
        { 
          $push: { documents: testDocument }
        }
      );
      
      console.log('✅ Test document added to driver');
      console.log(`   Document Name: ${testDocument.documentName}`);
      console.log(`   Document Type: ${testDocument.documentType}`);
      console.log(`   Expiry Date: ${expiryDate.toLocaleDateString()}`);
      console.log(`   Days Until Expiry: 3 days`);
      console.log('');
    } else {
      console.log('⚠️  No drivers found in database');
      console.log('');
    }

    // Option 3: Create an EXPIRED document
    console.log('📋 OPTION 3: Add EXPIRED Test Document to Vehicle');
    console.log('-'.repeat(80));

    if (vehicle) {
      // Create test document that expired yesterday
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - 1); // Yesterday
      
      const expiredDocument = {
        id: new ObjectId().toString(),
        documentName: 'Test PUC (EXPIRED)',
        documentType: 'PUC',
        documentNumber: 'TEST-PUC-' + Date.now(),
        expiryDate: expiryDate.toISOString(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System Test',
        fileUrl: 'https://example.com/test-puc.pdf',
        status: 'active'
      };
      
      // Add document to vehicle
      await db.collection('vehicles').updateOne(
        { _id: vehicle._id },
        { 
          $push: { documents: expiredDocument }
        }
      );
      
      console.log('✅ EXPIRED test document added to vehicle');
      console.log(`   Document Name: ${expiredDocument.documentName}`);
      console.log(`   Document Type: ${expiredDocument.documentType}`);
      console.log(`   Expiry Date: ${expiryDate.toLocaleDateString()}`);
      console.log(`   Status: ⚠️ EXPIRED (1 day ago)`);
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ TEST DOCUMENTS CREATED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. Wait for backend check (runs every 6 hours)');
    console.log('   OR manually trigger:');
    console.log('   POST http://localhost:3001/api/notifications/check-document-expiry');
    console.log('   (Requires admin authentication)');
    console.log('');
    console.log('2. Check admin notifications:');
    console.log('   - Admin Dashboard → Notifications icon (🔔)');
    console.log('   - Driver Management → Document Expiry Alerts card');
    console.log('   - Wait for floating notification popup');
    console.log('');
    console.log('3. Verify in Vehicle Master:');
    console.log('   - Admin Dashboard → Vehicle Management → Vehicle Master');
    console.log('   - Look for vehicles with red/orange indicators');
    console.log('   - Filter by "Expired Documents" or "Expiring Soon"');
    console.log('');
    console.log('4. Clean up test documents:');
    console.log('   - Go to vehicle/driver details');
    console.log('   - Delete test documents manually');
    console.log('   OR run: node cleanup-test-documents.js');
    console.log('');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error creating test documents:', error);
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed\n');
  }
}

// Run the script
createTestExpiringDocument().catch(console.error);
