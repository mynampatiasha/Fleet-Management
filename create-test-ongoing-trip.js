// create-test-ongoing-trip.js
// Creates a test ongoing trip for the customer to test tracking functionality

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet_management';

// Customer ID from the data you provided
const CUSTOMER_ID = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';

async function createTestOngoingTrip() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // First, check if there are any existing ongoing trips for this customer
    const existingTrip = await db.collection('rosters').findOne({
      userId: CUSTOMER_ID,
      status: { $in: ['ongoing', 'in_progress', 'started'] }
    });
    
    if (existingTrip) {
      console.log('✅ Customer already has an ongoing trip:');
      console.log(`   Trip ID: ${existingTrip._id}`);
      console.log(`   Status: ${existingTrip.status}`);
      console.log(`   Vehicle: ${existingTrip.vehicleNumber || 'Not assigned'}`);
      return;
    }
    
    // Create a test ongoing trip
    const ongoingTrip = {
      _id: new ObjectId(),
      userId: CUSTOMER_ID,
      customerId: CUSTOMER_ID,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      rosterType: "both",
      officeLocation: "Test Office Location",
      weeklyOffDays: ["Saturday", "Sunday"],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      startTime: "09:00",
      endTime: "18:00",
      locations: {
        loginPickup: {
          address: "Test Pickup Location",
          coordinates: { latitude: 12.9716, longitude: 77.5946 }
        },
        logoutDrop: {
          address: "Test Drop Location", 
          coordinates: { latitude: 12.9716, longitude: 77.5946 }
        }
      },
      status: "ongoing", // This is the key - making it ongoing so tracking works
      requestType: "customer_roster",
      assignedDriver: "Test Driver",
      assignedVehicle: "KA01AB1234",
      vehicleNumber: "KA01AB1234",
      driverName: "Test Driver",
      driverPhone: "+91 9876543210",
      assignmentDate: new Date(),
      assignedBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: CUSTOMER_ID,
      notes: "Test ongoing trip for tracking functionality",
      priority: "normal",
      isRecurring: false,
      readableId: `TR${Date.now()}`,
      tripId: new ObjectId().toString(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        timestamp: new Date()
      }
    };
    
    const result = await db.collection('rosters').insertOne(ongoingTrip);
    
    console.log('✅ Created test ongoing trip:');
    console.log(`   Trip ID: ${result.insertedId}`);
    console.log(`   Readable ID: ${ongoingTrip.readableId}`);
    console.log(`   Status: ${ongoingTrip.status}`);
    console.log(`   Vehicle: ${ongoingTrip.vehicleNumber}`);
    console.log(`   Driver: ${ongoingTrip.driverName}`);
    console.log('');
    console.log('🎉 Now the customer should be able to track their trip!');
    console.log('📱 Try clicking "Track Now" in the customer dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Also create a function to clean up test data
async function cleanupTestTrip() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const result = await db.collection('rosters').deleteMany({
      userId: CUSTOMER_ID,
      notes: "Test ongoing trip for tracking functionality"
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} test trips`);
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await client.close();
  }
}

// Run based on command line argument
const action = process.argv[2];

if (action === 'cleanup') {
  cleanupTestTrip();
} else {
  createTestOngoingTrip();
}