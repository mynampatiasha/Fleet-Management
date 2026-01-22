// fix-customer-tracking-test.js
// Convert a pending roster to ongoing status for testing customer tracking

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet_management';

// Customer ID from the data you provided
const CUSTOMER_ID = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';

async function fixCustomerTracking() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Find a pending roster for this customer
    const pendingRoster = await db.collection('rosters').findOne({
      userId: CUSTOMER_ID,
      status: 'pending_assignment'
    });
    
    if (!pendingRoster) {
      console.log('❌ No pending rosters found for this customer');
      return;
    }
    
    console.log('📋 Found pending roster:');
    console.log(`   ID: ${pendingRoster._id}`);
    console.log(`   Customer: ${pendingRoster.customerName}`);
    console.log(`   Type: ${pendingRoster.rosterType}`);
    console.log(`   Office: ${pendingRoster.officeLocation}`);
    
    // Update the roster to make it trackable
    const updateResult = await db.collection('rosters').updateOne(
      { _id: pendingRoster._id },
      {
        $set: {
          status: 'ongoing',
          assignedDriver: 'Test Driver',
          assignedVehicle: 'KA01AB1234',
          vehicleNumber: 'KA01AB1234',
          driverName: 'Test Driver',
          driverPhone: '+91 9876543210',
          assignmentDate: new Date(),
          assignedBy: 'admin_test',
          updatedAt: new Date(),
          currentLocation: {
            latitude: 12.9716,
            longitude: 77.5946,
            timestamp: new Date()
          },
          tripId: pendingRoster._id.toString(),
          readableId: `TR${Date.now()}`
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Successfully updated roster to ongoing status!');
      console.log('');
      console.log('🎉 Customer tracking should now work:');
      console.log(`   Trip ID: ${pendingRoster._id}`);
      console.log('   Status: ongoing');
      console.log('   Vehicle: KA01AB1234');
      console.log('   Driver: Test Driver');
      console.log('');
      console.log('📱 Try clicking "Track Now" in the customer dashboard now!');
    } else {
      console.log('❌ Failed to update roster');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Function to revert back to pending status
async function revertTopending() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const result = await db.collection('rosters').updateMany(
      { 
        userId: CUSTOMER_ID,
        assignedBy: 'admin_test'
      },
      {
        $set: {
          status: 'pending_assignment',
          updatedAt: new Date()
        },
        $unset: {
          assignedDriver: '',
          assignedVehicle: '',
          vehicleNumber: '',
          driverName: '',
          driverPhone: '',
          assignmentDate: '',
          assignedBy: '',
          currentLocation: '',
          tripId: '',
          readableId: ''
        }
      }
    );
    
    console.log(`🔄 Reverted ${result.modifiedCount} rosters back to pending status`);
    
  } catch (error) {
    console.error('❌ Revert error:', error);
  } finally {
    await client.close();
  }
}

// Run based on command line argument
const action = process.argv[2];

if (action === 'revert') {
  revertToending();
} else {
  fixCustomerTracking();
}