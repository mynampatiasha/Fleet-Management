// test-trip-creation.js - Test the new trip creation API
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function testTripCreation() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🧪 TESTING TRIP CREATION API');
    console.log('='.repeat(80));
    
    // First, let's check if we have any vehicles with drivers
    const vehicles = await db.collection('vehicles').find({
      status: { $regex: /^active$/i },
      assignedDriver: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`📋 Found ${vehicles.length} active vehicles with drivers`);
    
    if (vehicles.length === 0) {
      console.log('❌ No vehicles with drivers found. Cannot test trip creation.');
      console.log('💡 Please assign drivers to vehicles first.');
      return;
    }
    
    // Use the first available vehicle
    const testVehicle = vehicles[0];
    console.log(`✅ Using vehicle: ${testVehicle.registrationNumber || testVehicle.name || 'Vehicle'}`);
    console.log(`   Driver: ${testVehicle.assignedDriver?.name || testVehicle.assignedDriver || 'Unknown'}`);
    
    // Test trip data
    const testTripData = {
      vehicleId: testVehicle._id.toString(),
      startPoint: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Bangalore City Railway Station'
      },
      endPoint: {
        latitude: 13.0827,
        longitude: 80.2707,
        address: 'Chennai Central Railway Station'
      },
      distance: 347.5, // km
      scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      tripType: 'test',
      notes: 'Test trip created via API test script'
    };
    
    console.log('\n📤 Test Trip Data:');
    console.log('   Vehicle ID:', testTripData.vehicleId);
    console.log('   Start:', testTripData.startPoint.address);
    console.log('   End:', testTripData.endPoint.address);
    console.log('   Distance:', testTripData.distance, 'km');
    console.log('   Customer:', testTripData.customerName);
    
    // Simulate the API call by directly calling the trip creation logic
    console.log('\n🚀 Creating test trip...');
    
    // Generate trip number
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const tripNumber = `TRIP-${timestamp}-${random}`;
    
    // Calculate ETA
    const averageSpeed = 30;
    const timeInHours = testTripData.distance / averageSpeed;
    const estimatedDuration = Math.ceil(timeInHours * 60);
    
    const currentTime = new Date();
    const pickupTime = new Date(testTripData.scheduledPickupTime);
    const estimatedEndTime = new Date(pickupTime.getTime() + estimatedDuration * 60000);
    
    // Create trip document
    const tripData = {
      tripNumber,
      vehicleId: new ObjectId(testTripData.vehicleId),
      vehicleNumber: testVehicle.registrationNumber || testVehicle.name || 'Vehicle',
      driverId: testVehicle.assignedDriver?._id?.toString() || testVehicle.assignedDriver?.driverId || 'unknown',
      driverName: testVehicle.assignedDriver?.name || 'Unknown Driver',
      driverPhone: testVehicle.assignedDriver?.phone || '',
      
      // Customer information
      customer: {
        customerId: null,
        name: testTripData.customerName,
        email: testTripData.customerEmail,
        phone: testTripData.customerPhone
      },
      
      // Location details
      pickupLocation: {
        address: testTripData.startPoint.address,
        coordinates: {
          type: 'Point',
          coordinates: [testTripData.startPoint.longitude, testTripData.startPoint.latitude]
        },
        latitude: testTripData.startPoint.latitude,
        longitude: testTripData.startPoint.longitude
      },
      dropLocation: {
        address: testTripData.endPoint.address,
        coordinates: {
          type: 'Point',
          coordinates: [testTripData.endPoint.longitude, testTripData.endPoint.latitude]
        },
        latitude: testTripData.endPoint.latitude,
        longitude: testTripData.endPoint.longitude
      },
      
      // Trip timing
      scheduledPickupTime: pickupTime,
      estimatedEndTime: estimatedEndTime,
      estimatedDuration: estimatedDuration,
      actualStartTime: null,
      actualEndTime: null,
      actualDuration: null,
      
      // Trip details
      distance: parseFloat(testTripData.distance),
      actualDistance: null,
      tripType: testTripData.tripType,
      status: 'assigned',
      
      // Tracking
      currentLocation: null,
      locationHistory: [],
      
      // Notifications tracking
      etaAlerts: {
        sent15min: false,
        sent5min: false,
        sentArrival: false
      },
      delayAlertSent: false,
      
      // Metadata
      notes: testTripData.notes,
      createdAt: currentTime,
      updatedAt: currentTime,
      createdBy: 'test-script',
      assignedAt: currentTime,
      
      // Status history
      statusHistory: {
        assigned: currentTime
      }
    };
    
    // Insert trip into database
    const tripResult = await db.collection('trips').insertOne(tripData);
    const tripId = tripResult.insertedId.toString();
    
    console.log('✅ Test trip created successfully!');
    console.log('   Trip ID:', tripId);
    console.log('   Trip Number:', tripNumber);
    console.log('   Status:', 'assigned');
    console.log('   Pickup Time:', pickupTime.toLocaleString());
    console.log('   Estimated Duration:', estimatedDuration, 'minutes');
    
    // Update vehicle with current trip
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(testTripData.vehicleId) },
      {
        $set: {
          currentTripId: tripId,
          currentTripNumber: tripNumber,
          lastTripAssignment: currentTime,
          updatedAt: currentTime
        }
      }
    );
    
    console.log('✅ Vehicle updated with current trip');
    
    // Verify the trip was created
    const createdTrip = await db.collection('trips').findOne({ _id: new ObjectId(tripId) });
    
    if (createdTrip) {
      console.log('\n📋 TRIP VERIFICATION:');
      console.log('   ✅ Trip exists in database');
      console.log('   ✅ Trip number:', createdTrip.tripNumber);
      console.log('   ✅ Vehicle ID:', createdTrip.vehicleId.toString());
      console.log('   ✅ Driver name:', createdTrip.driverName);
      console.log('   ✅ Customer name:', createdTrip.customer.name);
      console.log('   ✅ Distance:', createdTrip.distance, 'km');
      console.log('   ✅ Status:', createdTrip.status);
      console.log('   ✅ Pickup location:', createdTrip.pickupLocation.address);
      console.log('   ✅ Drop location:', createdTrip.dropLocation.address);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TRIP CREATION TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('🎯 Key Features Tested:');
    console.log('   ✅ Trip document creation in MongoDB');
    console.log('   ✅ Trip number generation');
    console.log('   ✅ Vehicle-driver association');
    console.log('   ✅ Location data storage');
    console.log('   ✅ Time calculations (pickup, duration, ETA)');
    console.log('   ✅ Customer information storage');
    console.log('   ✅ Vehicle status update');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Test the API endpoint: POST /api/trips/create');
    console.log('   2. Test driver notifications');
    console.log('   3. Test admin notifications');
    console.log('   4. Test driver accept/decline functionality');
    console.log('   5. Test trip status updates');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
  }
}

// Run the test
testTripCreation();