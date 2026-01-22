// test-rajesh-kumar-data-simple.js
// Simple test to check Rajesh Kumar's data without Firebase dependencies

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'abra_fleet';

async function testRajeshKumarDataSimple() {
    console.log('\n🔍 ========== TESTING RAJESH KUMAR DATA (SIMPLE) ==========\n');
    
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
            console.log(`   - Name: ${driver.name}`);
            console.log(`   - Status: ${driver.status}`);
        } else {
            console.log('❌ Driver not found');
            return;
        }
        
        // 2. Check trips data with different query approaches
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
        
        // Find which field actually has data
        let workingTrips = [];
        let workingField = '';
        
        if (tripsByDriverId.length > 0) {
            workingTrips = tripsByDriverId;
            workingField = 'driverId';
        } else if (tripsByFirebaseUid.length > 0) {
            workingTrips = tripsByFirebaseUid;
            workingField = 'driverId (with Firebase UID)';
        } else if (tripsByDriverFirebaseUid.length > 0) {
            workingTrips = tripsByDriverFirebaseUid;
            workingField = 'driverFirebaseUid';
        }
        
        if (workingTrips.length > 0) {
            console.log(`\n✅ Found ${workingTrips.length} trips using field: ${workingField}`);
            
            const completedTrips = workingTrips.filter(t => t.status === 'completed');
            console.log(`   - Completed trips: ${completedTrips.length}`);
            console.log(`   - Cancelled trips: ${workingTrips.filter(t => t.status === 'cancelled').length}`);
            console.log(`   - In progress trips: ${workingTrips.filter(t => t.status === 'in_progress').length}`);
            
            // Sample trip data
            const sampleTrip = workingTrips[0];
            console.log('\n📊 Sample trip data:');
            console.log(`   - Trip ID: ${sampleTrip.tripId || sampleTrip._id}`);
            console.log(`   - Trip Number: ${sampleTrip.tripNumber}`);
            console.log(`   - Driver ID: ${sampleTrip.driverId}`);
            console.log(`   - Driver Firebase UID: ${sampleTrip.driverFirebaseUid}`);
            console.log(`   - Status: ${sampleTrip.status}`);
            console.log(`   - Distance: ${sampleTrip.distance} km`);
            console.log(`   - Rating: ${sampleTrip.rating}`);
            console.log(`   - Customer: ${sampleTrip.customerName}`);
            console.log(`   - Start Time: ${sampleTrip.startTime}`);
            
            // Calculate performance metrics
            if (completedTrips.length > 0) {
                const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
                const tripsWithRating = completedTrips.filter(t => t.rating && t.rating > 0);
                const avgRating = tripsWithRating.length > 0
                    ? tripsWithRating.reduce((sum, t) => sum + t.rating, 0) / tripsWithRating.length
                    : 0;
                
                console.log('\n📈 Performance Metrics:');
                console.log(`   - Total Distance: ${totalDistance.toFixed(1)} km`);
                console.log(`   - Average Rating: ${avgRating.toFixed(1)}/5.0`);
                console.log(`   - Completion Rate: ${((completedTrips.length / workingTrips.length) * 100).toFixed(1)}%`);
            }
        } else {
            console.log('❌ No trips found with any field combination');
        }
        
        // 3. Check what the API should query
        console.log('\n🔧 3. API Query Recommendations:');
        
        if (tripsByDriverId.length > 0) {
            console.log('✅ API should query: { driverId: "DRV-100001" }');
        } else if (tripsByFirebaseUid.length > 0) {
            console.log('✅ API should query: { driverId: driver.firebaseUid }');
        } else if (tripsByDriverFirebaseUid.length > 0) {
            console.log('✅ API should query: { driverFirebaseUid: driver.firebaseUid }');
        } else {
            console.log('❌ No working query found - data may be missing');
        }
        
        // 4. Check admin_users collection
        console.log('\n👤 4. Checking admin_users collection...');
        const adminUser = await db.collection('admin_users').findOne({ email: driverEmail });
        
        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log(`   - Email: ${adminUser.email}`);
            console.log(`   - Role: ${adminUser.role}`);
            console.log(`   - Firebase UID: ${adminUser.firebaseUid}`);
            console.log(`   - Driver ID: ${adminUser.driverId}`);
            console.log(`   - Status: ${adminUser.status}`);
        } else {
            console.log('❌ Admin user not found');
        }
        
        // 5. Summary and recommendations
        console.log('\n🎯 5. Summary and Recommendations:');
        
        if (driver && workingTrips.length > 0 && adminUser) {
            console.log('✅ All data is present and accessible');
            console.log('✅ Driver profile: EXISTS');
            console.log(`✅ Trip data: ${workingTrips.length} trips`);
            console.log('✅ Admin user: EXISTS');
            console.log('\n🔧 Next steps:');
            console.log('1. Ensure backend server is running');
            console.log('2. Check API authentication');
            console.log('3. Verify API endpoints are using correct field names');
            console.log(`4. API should query trips using: ${workingField}`);
        } else {
            console.log('❌ Some data is missing:');
            if (!driver) console.log('   - Driver profile: MISSING');
            if (workingTrips.length === 0) console.log('   - Trip data: MISSING');
            if (!adminUser) console.log('   - Admin user: MISSING');
        }
        
    } catch (error) {
        console.error('\n❌ ========== TEST FAILED ==========');
        console.error('Error:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB connection closed');
    }
}

// Run the test
if (require.main === module) {
    testRajeshKumarDataSimple()
        .then(() => {
            console.log('✅ Test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testRajeshKumarDataSimple };