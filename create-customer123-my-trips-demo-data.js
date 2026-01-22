const { MongoClient } = require('mongodb');

// Try to import Firebase Admin - handle gracefully if not available
let admin, db;
try {
  admin = require('firebase-admin');
  
  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "abra-fleet-management",
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: "https://abra-fleet-management-default-rtdb.firebaseio.com"
    });
  }
  
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.log('⚠️  Firebase Admin not available, will skip Firestore operations:', error.message);
  admin = null;
  db = null;
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function createCustomer123MyTripsData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('abra_fleet');
    const tripsCollection = database.collection('trips');
    const rostersCollection = database.collection('rosters');
    
    // Customer123 details
    const customerEmail = 'customer123@abrafleet.com';
    const customerId = 'customer123';
    
    // Generate data that matches mystats_screen.dart expectations
    const trips = [];
    const rosters = [];
    const today = new Date();
    
    // Trip statuses exactly as expected by mystats_screen
    const tripStatuses = ['completed', 'completed', 'completed', 'completed', 'ongoing', 'cancelled'];
    
    // Vehicles matching mystats_screen recentTrip expectations
    const vehicles = [
      { 
        id: 'VH001', 
        name: 'Maruti Swift Dzire', 
        number: 'KA-01-AB-1234',
        capacity: 4, 
        driver: 'Rajesh Kumar', 
        phone: '+91-9876543210'
      },
      { 
        id: 'VH002', 
        name: 'Toyota Innova Crysta', 
        number: 'KA-02-CD-5678',
        capacity: 7, 
        driver: 'Suresh Patel', 
        phone: '+91-9876543211'
      },
      { 
        id: 'VH003', 
        name: 'Mahindra Scorpio', 
        number: 'KA-03-EF-9012',
        capacity: 8, 
        driver: 'Amit Singh', 
        phone: '+91-9876543212'
      },
      { 
        id: 'VH004', 
        name: 'Hyundai Creta', 
        number: 'KA-04-GH-3456',
        capacity: 5, 
        driver: 'Vikram Sharma', 
        phone: '+91-9876543213'
      }
    ];
    
    // Bangalore locations for realistic trips
    const locations = [
      { name: 'Electronic City', address: 'Electronic City Phase 1, Bangalore', lat: 12.8456, lng: 77.6603 },
      { name: 'Whitefield', address: 'Whitefield Main Road, Bangalore', lat: 12.9698, lng: 77.7500 },
      { name: 'Koramangala', address: 'Koramangala 4th Block, Bangalore', lat: 12.9352, lng: 77.6245 },
      { name: 'Indiranagar', address: '100 Feet Road, Indiranagar, Bangalore', lat: 12.9716, lng: 77.6412 },
      { name: 'JP Nagar', address: 'JP Nagar 7th Phase, Bangalore', lat: 12.9081, lng: 77.5831 },
      { name: 'HSR Layout', address: 'HSR Layout Sector 1, Bangalore', lat: 12.9116, lng: 77.6370 },
      { name: 'Marathahalli', address: 'Marathahalli Bridge, Bangalore', lat: 12.9591, lng: 77.6974 },
      { name: 'Banashankari', address: 'Banashankari 3rd Stage, Bangalore', lat: 12.9250, lng: 77.5667 },
      { name: 'Jayanagar', address: 'Jayanagar 4th Block, Bangalore', lat: 12.9279, lng: 77.5937 },
      { name: 'MG Road', address: 'MG Road Metro Station, Bangalore', lat: 12.9759, lng: 77.6061 }
    ];

    // Generate 25 trips over the last 30 days to match mystats_screen expectations
    for (let i = 0; i < 25; i++) {
      const tripDate = new Date(today);
      tripDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      const pickupLocation = locations[Math.floor(Math.random() * locations.length)];
      let dropLocation = locations[Math.floor(Math.random() * locations.length)];
      
      // Ensure pickup and drop are different
      while (dropLocation.name === pickupLocation.name) {
        dropLocation = locations[Math.floor(Math.random() * locations.length)];
      }
      
      const status = tripStatuses[Math.floor(Math.random() * tripStatuses.length)];
      
      // Calculate realistic trip times
      const startTime = new Date(tripDate);
      startTime.setHours(Math.floor(Math.random() * 12) + 7); // 7 AM to 7 PM
      startTime.setMinutes(Math.floor(Math.random() * 60));
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + Math.floor(Math.random() * 60) + 15); // 15-75 minutes trip
      
      // Calculate distance (rough estimate based on coordinates)
      const distance = Math.sqrt(
        Math.pow(pickupLocation.lat - dropLocation.lat, 2) + 
        Math.pow(pickupLocation.lng - dropLocation.lng, 2)
      ) * 111; // Convert to approximate km
      const roundedDistance = Math.max(2, Math.round(distance * 10) / 10); // Minimum 2km
      
      // Calculate fare (₹12 per km + base fare ₹50)
      const baseFare = 50;
      const perKmRate = 12;
      const totalFare = baseFare + (roundedDistance * perKmRate);
      
      // Generate trip ID
      const tripId = `TRIP${String(Date.now() + i).slice(-8)}`;
      const rosterId = `ROSTER${String(Date.now() + i).slice(-6)}`;
      
      // Create trip data matching mystats_screen expectations
      const trip = {
        tripId: tripId,
        rosterId: rosterId,
        customerId: customerId,
        customerEmail: customerEmail,
        customerName: 'Customer 123',
        customerPhone: '+91-9876543200',
        
        // Vehicle and driver details (for mystats_screen recentTrip)
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleNumber: vehicle.number,
        vehicleCapacity: vehicle.capacity,
        driverName: vehicle.driver,
        driverPhone: vehicle.phone,
        
        // Trip details
        tripType: Math.random() > 0.5 ? 'pickup' : 'round_trip',
        status: status,
        
        // Locations
        pickupLocation: {
          name: pickupLocation.name,
          address: pickupLocation.address,
          coordinates: {
            latitude: pickupLocation.lat,
            longitude: pickupLocation.lng
          }
        },
        dropLocation: {
          name: dropLocation.name,
          address: dropLocation.address,
          coordinates: {
            latitude: dropLocation.lat,
            longitude: dropLocation.lng
          }
        },
        
        // Timing
        scheduledPickupTime: startTime,
        actualPickupTime: status === 'completed' ? new Date(startTime.getTime() + Math.random() * 10 * 60000) : null,
        scheduledDropTime: endTime,
        actualDropTime: status === 'completed' ? new Date(endTime.getTime() + Math.random() * 15 * 60000) : null,
        
        // Trip metrics (for mystats_screen calculations)
        distance: roundedDistance,
        duration: Math.floor((endTime - startTime) / 60000), // in minutes
        fare: {
          baseFare: baseFare,
          distanceFare: roundedDistance * perKmRate,
          totalFare: totalFare,
          currency: 'INR'
        },
        
        // Additional details
        passengerCount: Math.floor(Math.random() * vehicle.capacity) + 1,
        rating: status === 'completed' ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
        feedback: status === 'completed' && Math.random() > 0.7 ? 'Good service, on time!' : null,
        
        // Organization details
        organizationId: 'abrafleet_main',
        organizationName: 'ABRA Fleet Management',
        
        // Timestamps
        createdAt: new Date(tripDate.getTime() - 2 * 60 * 60 * 1000), // Created 2 hours before trip
        updatedAt: status === 'completed' ? endTime : startTime,
        
        // Monthly tracking (for mystats_screen monthlyDistance)
        month: tripDate.getMonth() + 1,
        year: tripDate.getFullYear(),
        monthYear: `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`,
        
        // On-time delivery tracking (for mystats_screen onTimeDelivery)
        isOnTime: status === 'completed' ? Math.random() > 0.2 : null, // 80% on-time rate
        
        // Cancellation details (if cancelled)
        ...(status === 'cancelled' && {
          cancellationReason: 'Customer request',
          cancelledAt: new Date(startTime.getTime() - 30 * 60000), // Cancelled 30 min before
          cancelledBy: 'customer'
        })
      };
      
      trips.push(trip);
      
      // Create corresponding roster entry for my_trips_screen
      const roster = {
        rosterId: rosterId,
        tripId: tripId,
        customerId: customerId,
        customerEmail: customerEmail,
        customerName: 'Customer 123',
        
        // Roster details
        rosterType: Math.random() > 0.5 ? 'daily' : 'weekly',
        status: status === 'completed' ? 'completed' : status === 'ongoing' ? 'assigned' : 'pending_assignment',
        
        // Date range
        dateRange: {
          from: tripDate.toISOString().split('T')[0],
          to: tripDate.toISOString().split('T')[0]
        },
        startDate: tripDate,
        endDate: tripDate,
        
        // Time range
        timeRange: {
          from: startTime.toTimeString().slice(0, 5),
          to: endTime.toTimeString().slice(0, 5)
        },
        
        // Location details
        officeLocation: pickupLocation.address,
        homeLocation: dropLocation.address,
        
        locations: {
          loginPickup: {
            address: pickupLocation.address,
            coordinates: {
              latitude: pickupLocation.lat,
              longitude: pickupLocation.lng
            }
          },
          logoutDrop: {
            address: dropLocation.address,
            coordinates: {
              latitude: dropLocation.lat,
              longitude: dropLocation.lng
            }
          }
        },
        
        // Working days
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        
        // Vehicle assignment
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.number,
        vehicleName: vehicle.name,
        driverName: vehicle.driver,
        driverPhone: vehicle.phone,
        
        // Organization
        organizationId: 'abrafleet_main',
        organizationName: 'ABRA Fleet Management',
        
        // Timestamps
        createdAt: new Date(tripDate.getTime() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      
      rosters.push(roster);
    }
    
    // Sort by date (newest first)
    trips.sort((a, b) => new Date(b.scheduledPickupTime) - new Date(a.scheduledPickupTime));
    rosters.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    // Insert trips into MongoDB
    console.log(`\n🚀 Inserting ${trips.length} trips for customer123@abrafleet.com...`);
    const tripResult = await tripsCollection.insertMany(trips);
    console.log(`✅ Successfully inserted ${tripResult.insertedCount} trips`);
    
    // Insert rosters into MongoDB
    console.log(`\n📋 Inserting ${rosters.length} rosters for customer123@abrafleet.com...`);
    const rosterResult = await rostersCollection.insertMany(rosters);
    console.log(`✅ Successfully inserted ${rosterResult.insertedCount} rosters`);
    
    // Create recent trips in Firestore for real-time features (if available)
    if (db && admin) {
      console.log('\n🔥 Creating recent trips in Firestore...');
      const recentTrips = trips.slice(0, 5); // Last 5 trips
      
      for (const trip of recentTrips) {
        try {
          await db.collection('trips').doc(trip.tripId).set({
            ...trip,
            // Convert dates to Firestore timestamps
            scheduledPickupTime: admin.firestore.Timestamp.fromDate(trip.scheduledPickupTime),
            actualPickupTime: trip.actualPickupTime ? admin.firestore.Timestamp.fromDate(trip.actualPickupTime) : null,
            scheduledDropTime: admin.firestore.Timestamp.fromDate(trip.scheduledDropTime),
            actualDropTime: trip.actualDropTime ? admin.firestore.Timestamp.fromDate(trip.actualDropTime) : null,
            createdAt: admin.firestore.Timestamp.fromDate(trip.createdAt),
            updatedAt: admin.firestore.Timestamp.fromDate(trip.updatedAt),
            ...(trip.cancelledAt && {
              cancelledAt: admin.firestore.Timestamp.fromDate(trip.cancelledAt)
            })
          });
        } catch (firestoreError) {
          console.log(`⚠️  Failed to create trip ${trip.tripId} in Firestore:`, firestoreError.message);
        }
      }
      
      console.log(`✅ Successfully created ${recentTrips.length} trips in Firestore`);
    } else {
      console.log('⚠️  Skipping Firestore operations - Firebase Admin not available');
    }
    
    // Calculate stats exactly as mystats_screen expects
    const completedTrips = trips.filter(t => t.status === 'completed');
    const ongoingTrips = trips.filter(t => t.status === 'ongoing');
    const cancelledTrips = trips.filter(t => t.status === 'cancelled');
    
    const totalDistance = completedTrips.reduce((sum, t) => sum + t.distance, 0);
    const totalFare = completedTrips.reduce((sum, t) => sum + t.fare.totalFare, 0);
    const avgRating = completedTrips.filter(t => t.rating).reduce((sum, t) => sum + t.rating, 0) / completedTrips.filter(t => t.rating).length;
    const onTimeTrips = completedTrips.filter(t => t.isOnTime).length;
    const delayedTrips = completedTrips.filter(t => !t.isOnTime).length;
    
    // Monthly distance breakdown for mystats_screen
    const monthlyDistance = {};
    completedTrips.forEach(trip => {
      const monthKey = trip.monthYear;
      if (!monthlyDistance[monthKey]) {
        monthlyDistance[monthKey] = { distance: 0, trips: 0 };
      }
      monthlyDistance[monthKey].distance += trip.distance;
      monthlyDistance[monthKey].trips += 1;
    });
    
    // Get most recent trip for mystats_screen recentTrip
    const mostRecentTrip = trips[0];
    
    console.log('\n📊 CUSTOMER123 TRIP DATA FOR MYSTATS_SCREEN:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📈 totalTrips: { completed: ${completedTrips.length}, ongoing: ${ongoingTrips.length}, cancelled: ${cancelledTrips.length} }`);
    console.log(`🛣️  totalDistance: ${totalDistance.toFixed(1)} km`);
    console.log(`⏰ onTimeDelivery: { onTime: ${onTimeTrips}, delayed: ${delayedTrips} }`);
    console.log(`💰 Total Fare: ₹${totalFare.toFixed(2)}`);
    console.log(`⭐ Average Rating: ${avgRating.toFixed(1)}/5`);
    console.log(`\n🚗 recentTrip data:`);
    if (mostRecentTrip) {
      console.log(`   vehicleNumber: ${mostRecentTrip.vehicleNumber}`);
      console.log(`   driverName: ${mostRecentTrip.driverName}`);
      console.log(`   driverPhone: ${mostRecentTrip.driverPhone}`);
      console.log(`   distance: ${mostRecentTrip.distance} km`);
    }
    console.log(`\n📅 monthlyDistance array:`);
    Object.entries(monthlyDistance)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, data]) => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short' });
        console.log(`   { month: '${monthName}', distance: ${data.distance.toFixed(1)} }`);
      });
    
    console.log(`\n🎯 DEMO READY FOR MANAGER PRESENTATION!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔑 Login: customer123@abrafleet.com`);
    console.log(`📊 MyStats Screen: Will show animated counters and charts`);
    console.log(`🚗 MyTrips Screen: Will show ${rosters.length} roster entries`);
    console.log(`📱 Data structure matches mystats_screen.dart expectations`);
    console.log(`⚡ Both MongoDB and Firestore integration complete`);
    
  } catch (error) {
    console.error('❌ Error creating customer123 trip data:', error);
  } finally {
    await client.close();
  }
}

// Run the script
createCustomer123MyTripsData();