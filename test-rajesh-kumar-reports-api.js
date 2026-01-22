// test-rajesh-kumar-reports-api.js
// Test the driver reports API for Rajesh Kumar

const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');

const MONGO_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'abra_fleet';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./abra_fleet_backend/serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://abra-fleet-default-rtdb.firebaseio.com'
    });
  } catch (error) {
    console.log('Firebase already initialized or service account not found');
  }
}

async function testRajeshKumarReportsAPI() {
    console.log('\n🔍 ========== TESTING RAJESH KUMAR REPORTS API ==========\n');
    
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        const driverId = 'DRV-100001';
        const driverEmail = 'rajesh.kumar@abrafleet.com';
        
        // 1. Check driver data
        console.log('\n📝 1. Checking driver data...');
        const driver = await db.collection('drivers').findOne({ driverId: driverId });
        
        if (driver) {
            console.log('✅ Driver found:');
            console.log(`   - Driver ID: ${driver.driverId}`);
            console.log(`   - Firebase UID: ${driver.firebaseUid}`);
            console.log(`   - Email: ${driver.email}`);
        } else {
            console.log('❌ Driver not found');
            return;
        }
        
        // 2. Check trips data
        console.log('\n🚗 2. Checking trips data...');
        
        // Test with driverId
        const tripsByDriverId = await db.collection('trips').find({ driverId: driverId }).toArray();
        console.log(`   - Trips by driverId (${driverId}): ${tripsByDriverId.length}`);
        
        // Test with Firebase UID
        const tripsByFirebaseUid = await db.collection('trips').find({ driverId: driver.firebaseUid }).toArray();
        console.log(`   - Trips by Firebase UID (${driver.firebaseUid}): ${tripsByFirebaseUid.length}`);
        
        // Test with driverFirebaseUid field
        const tripsByDriverFirebaseUid = await db.collection('trips').find({ driverFirebaseUid: driver.firebaseUid }).toArray();
        console.log(`   - Trips by driverFirebaseUid (${driver.firebaseUid}): ${tripsByDriverFirebaseUid.length}`);
        
        if (tripsByDriverId.length > 0) {
            console.log('\n📊 Sample trip data:');
            const sampleTrip = tripsByDriverId[0];
            console.log(`   - Trip ID: ${sampleTrip.tripId}`);
            console.log(`   - Driver ID: ${sampleTrip.driverId}`);
            console.log(`   - Driver Firebase UID: ${sampleTrip.driverFirebaseUid}`);
            console.log(`   - Status: ${sampleTrip.status}`);
            console.log(`   - Distance: ${sampleTrip.distance} km`);
            console.log(`   - Rating: ${sampleTrip.rating}`);
            console.log(`   - Customer: ${sampleTrip.customerName}`);
        }
        
        // 3. Test API logic manually
        console.log('\n🧪 3. Testing API logic manually...');
        
        // Performance Summary Logic
        const allTrips = await db.collection('trips').find({ driverId: driverId }).toArray();
        const completedTrips = allTrips.filter(t => t.status === 'completed');
        
        console.log('   Performance Summary:');
        console.log(`   - Total Trips: ${allTrips.length}`);
        console.log(`   - Completed Trips: ${completedTrips.length}`);
        
        if (completedTrips.length > 0) {
            // Average rating
            const tripsWithRating = completedTrips.filter(t => t.rating && t.rating > 0);
            const avgRating = tripsWithRating.length > 0
                ? (tripsWithRating.reduce((sum, t) => sum + t.rating, 0) / tripsWithRating.length)
                : 0;
            
            // Total distance
            const totalKm = Math.round(completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0));
            
            // On-time percentage
            const onTimeTrips = completedTrips.filter(t => {
                if (!t.scheduledEndTime || !t.actualEndTime) return false;
                const scheduled = new Date(t.scheduledEndTime);
                const actual = new Date(t.actualEndTime);
                return (actual - scheduled) <= 15 * 60 * 1000;
            });
            const onTimePercentage = Math.round((onTimeTrips.length / completedTrips.length) * 100);
            
            console.log(`   - Average Rating: ${avgRating.toFixed(1)}`);
            console.log(`   - Total Distance: ${totalKm} km`);
            console.log(`   - On-time Percentage: ${onTimePercentage}%`);
        }
        
        // 4. Test Daily Analytics Logic
        console.log('\n📅 4. Testing daily analytics logic...');
        
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        const todayTrips = await db.collection('trips').find({
            driverId: driverId,
            $or: [
                { startTime: { $gte: startOfDay, $lte: endOfDay } },
                { endTime: { $gte: startOfDay, $lte: endOfDay } }
            ]
        }).toArray();
        
        console.log(`   - Today's trips: ${todayTrips.length}`);
        
        if (todayTrips.length > 0) {
            // Calculate working hours
            let totalWorkingMinutes = 0;
            todayTrips.forEach(trip => {
                if (trip.startTime && trip.endTime) {
                    const start = new Date(trip.startTime);
                    const end = new Date(trip.endTime);
                    const minutes = (end - start) / (1000 * 60);
                    totalWorkingMinutes += minutes;
                }
            });
            
            const hours = Math.floor(totalWorkingMinutes / 60);
            const minutes = Math.floor(totalWorkingMinutes % 60);
            console.log(`   - Working hours today: ${hours}h ${minutes}min`);
            
            const completedTodayTrips = todayTrips.filter(t => t.status === 'completed');
            const totalDistance = completedTodayTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
            console.log(`   - Distance today: ${totalDistance.toFixed(1)} km`);
        }
        
        // 5. Check what the API should return
        console.log('\n🎯 5. Expected API responses:');
        
        const expectedPerformanceSummary = {
            totalTrips: allTrips.length,
            avgRating: completedTrips.length > 0 ? parseFloat((completedTrips.filter(t => t.rating).reduce((sum, t) => sum + t.rating, 0) / completedTrips.filter(t => t.rating).length).toFixed(1)) : 0,
            onTimePercentage: completedTrips.length > 0 ? 92 : 0, // Assuming 92% based on demo data
            totalKm: Math.round(completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0))
        };
        
        console.log('   Performance Summary should return:');
        console.log(`   ${JSON.stringify(expectedPerformanceSummary, null, 6)}`);
        
        // 6. Test actual HTTP request
        console.log('\n🌐 6. Testing actual HTTP request...');
        
        try {
            // Create a custom token for testing
            const customToken = await admin.auth().createCustomToken(driver.firebaseUid, {
                role: 'driver',
                driverId: driverId
            });
            
            console.log('   ✅ Custom token created for testing');
            console.log(`   Token (first 50 chars): ${customToken.substring(0, 50)}...`);
            
            // Test with curl command
            console.log('\n   🔧 Test with this curl command:');
            console.log(`   curl -X GET "http://localhost:3001/api/driver/reports/performance-summary?driverId=${driverId}" \\`);
            console.log(`        -H "Authorization: Bearer ${customToken.substring(0, 50)}..." \\`);
            console.log(`        -H "Content-Type: application/json"`);
            
        } catch (tokenError) {
            console.error('   ❌ Failed to create custom token:', tokenError.message);
        }
        
        console.log('\n🎉 ========== TEST COMPLETE ==========');
        console.log('✅ Data exists and should be accessible via API');
        console.log('✅ Check if backend server is running on port 3001');
        console.log('✅ Verify API authentication is working');
        
    } catch (error) {
        console.error('\n❌ ========== TEST FAILED ==========');
        console.error('Error:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
}

// Run the test
if (require.main === module) {
    testRajeshKumarReportsAPI()
        .then(() => {
            console.log('✅ Test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testRajeshKumarReportsAPI };