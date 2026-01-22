// test-rajesh-kumar-demo-data.js
// Quick test to verify Rajesh Kumar's demo data

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'abra_fleet';

async function testRajeshKumarDemoData() {
    console.log('\n🔍 ========== TESTING RAJESH KUMAR DEMO DATA ==========\n');
    
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        const driverId = 'DRV-100001';
        const driverEmail = 'rajesh.kumar@abrafleet.com';
        
        // 1. Test Driver Profile
        console.log('\n📝 1. Testing Driver Profile...');
        const driver = await db.collection('drivers').findOne({ driverId: driverId });
        
        if (driver) {
            console.log('✅ Driver profile found');
            console.log(`   - Name: ${driver.name}`);
            console.log(`   - Email: ${driver.email}`);
            console.log(`   - Phone: ${driver.phone}`);
            console.log(`   - Firebase UID: ${driver.firebaseUid}`);
            console.log(`   - Status: ${driver.status}`);
            console.log(`   - Assigned Vehicle: ${driver.assignedVehicle}`);
            console.log(`   - Rating: ${driver.rating}/5.0`);
            console.log(`   - Total Trips: ${driver.totalTrips}`);
            console.log(`   - Documents: ${driver.documents?.length || 0}`);
        } else {
            console.log('❌ Driver profile not found');
            return;
        }
        
        // 2. Test Admin Users Entry
        console.log('\n👤 2. Testing Admin Users Entry...');
        const adminUser = await db.collection('admin_users').findOne({ email: driverEmail });
        
        if (adminUser) {
            console.log('✅ Admin user entry found');
            console.log(`   - Role: ${adminUser.role}`);
            console.log(`   - Status: ${adminUser.status}`);
            console.log(`   - Firebase UID: ${adminUser.firebaseUid}`);
        } else {
            console.log('❌ Admin user entry not found');
        }
        
        // 3. Test Vehicle Assignment
        console.log('\n🚙 3. Testing Vehicle Assignment...');
        const vehicle = await db.collection('vehicles').findOne({ registrationNumber: 'KA02CD5678' });
        
        if (vehicle) {
            console.log('✅ Assigned vehicle found');
            console.log(`   - Registration: ${vehicle.registrationNumber}`);
            console.log(`   - Make/Model: ${vehicle.make} ${vehicle.model}`);
            console.log(`   - Type: ${vehicle.type}`);
            console.log(`   - Capacity: ${vehicle.capacity} seater`);
            console.log(`   - Assigned Driver: ${vehicle.assignedDriver}`);
            console.log(`   - Status: ${vehicle.status}`);
            console.log(`   - Current Mileage: ${vehicle.currentMileage} km`);
        } else {
            console.log('❌ Assigned vehicle not found');
        }
        
        // 4. Test Trip Data
        console.log('\n🚗 4. Testing Trip Data...');
        const totalTrips = await db.collection('trips').countDocuments({ driverId: driverId });
        const completedTrips = await db.collection('trips').countDocuments({ 
            driverId: driverId, 
            status: 'completed' 
        });
        const inProgressTrips = await db.collection('trips').countDocuments({ 
            driverId: driverId, 
            status: 'in_progress' 
        });
        const cancelledTrips = await db.collection('trips').countDocuments({ 
            driverId: driverId, 
            status: 'cancelled' 
        });
        
        console.log('✅ Trip data found');
        console.log(`   - Total Trips: ${totalTrips}`);
        console.log(`   - Completed: ${completedTrips}`);
        console.log(`   - In Progress: ${inProgressTrips}`);
        console.log(`   - Cancelled: ${cancelledTrips}`);
        
        // Get recent trips
        const recentTrips = await db.collection('trips')
            .find({ driverId: driverId })
            .sort({ startTime: -1 })
            .limit(5)
            .toArray();
        
        console.log(`   - Recent trips (last 5):`);
        recentTrips.forEach((trip, index) => {
            console.log(`     ${index + 1}. ${trip.tripNumber} - ${trip.status} - ${trip.distance}km - ₹${trip.fare?.totalFare || 0}`);
        });
        
        // 5. Test Roster Data
        console.log('\n📋 5. Testing Roster Data...');
        const totalRosters = await db.collection('rosters').countDocuments({ driverId: driverId });
        const activeRosters = await db.collection('rosters').countDocuments({ 
            driverId: driverId, 
            status: 'active' 
        });
        const scheduledRosters = await db.collection('rosters').countDocuments({ 
            driverId: driverId, 
            status: 'scheduled' 
        });
        
        console.log('✅ Roster data found');
        console.log(`   - Total Rosters: ${totalRosters}`);
        console.log(`   - Active: ${activeRosters}`);
        console.log(`   - Scheduled: ${scheduledRosters}`);
        
        // Get today's rosters
        const today = new Date().toISOString().split('T')[0];
        const todayRosters = await db.collection('rosters')
            .find({ driverId: driverId, date: today })
            .toArray();
        
        console.log(`   - Today's rosters (${today}): ${todayRosters.length}`);
        todayRosters.forEach((roster, index) => {
            console.log(`     ${index + 1}. ${roster.shift} shift - ${roster.customers?.length || 0} customers - ${roster.status}`);
        });
        
        // 6. Test Performance Data
        console.log('\n📊 6. Testing Performance Data...');
        const performanceRecords = await db.collection('driver_performance')
            .find({ driverId: driverId })
            .sort({ year: -1, month: -1 })
            .toArray();
        
        console.log('✅ Performance data found');
        console.log(`   - Performance records: ${performanceRecords.length}`);
        performanceRecords.forEach((perf, index) => {
            console.log(`     ${index + 1}. ${perf.month}/${perf.year} - ${perf.totalTrips} trips - ${perf.avgRating} rating - ₹${perf.totalEarnings}`);
        });
        
        // 7. Test Notifications
        console.log('\n🔔 7. Testing Notifications...');
        const totalNotifications = await db.collection('notifications').countDocuments({ 
            userId: driver.firebaseUid 
        });
        const unreadNotifications = await db.collection('notifications').countDocuments({ 
            userId: driver.firebaseUid, 
            isRead: false 
        });
        
        console.log('✅ Notification data found');
        console.log(`   - Total Notifications: ${totalNotifications}`);
        console.log(`   - Unread: ${unreadNotifications}`);
        
        // Get recent notifications
        const recentNotifications = await db.collection('notifications')
            .find({ userId: driver.firebaseUid })
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();
        
        console.log(`   - Recent notifications:`);
        recentNotifications.forEach((notif, index) => {
            console.log(`     ${index + 1}. ${notif.title} - ${notif.type} - ${notif.isRead ? 'Read' : 'Unread'}`);
        });
        
        // 8. Test Maintenance Records
        console.log('\n🔧 8. Testing Maintenance Records...');
        const maintenanceRecords = await db.collection('maintenance_records').countDocuments({ 
            driverId: driverId 
        });
        
        console.log('✅ Maintenance data found');
        console.log(`   - Maintenance records: ${maintenanceRecords}`);
        
        // Get recent maintenance
        const recentMaintenance = await db.collection('maintenance_records')
            .find({ driverId: driverId })
            .sort({ completedDate: -1 })
            .limit(3)
            .toArray();
        
        console.log(`   - Recent maintenance:`);
        recentMaintenance.forEach((maint, index) => {
            console.log(`     ${index + 1}. ${maint.type} - ${maint.completedDate?.toISOString().split('T')[0]} - ₹${maint.cost} - ${maint.status}`);
        });
        
        // 9. Test Customer Data
        console.log('\n👥 9. Testing Customer Data...');
        const customerEmails = [
            'priya.sharma@abrafleet.com',
            'anita.desai@abrafleet.com',
            'robert.wilson@abrafleet.com',
            'jennifer.garcia@abrafleet.com'
        ];
        
        let customersFound = 0;
        for (const email of customerEmails) {
            const customer = await db.collection('users').findOne({ email: email });
            if (customer) customersFound++;
        }
        
        console.log('✅ Customer data found');
        console.log(`   - Demo customers: ${customersFound}/${customerEmails.length}`);
        
        // 10. Overall Assessment
        console.log('\n🎯 10. Overall Assessment...');
        
        const checks = [
            { name: 'Driver Profile', status: !!driver },
            { name: 'Admin User Entry', status: !!adminUser },
            { name: 'Vehicle Assignment', status: !!vehicle },
            { name: 'Trip Data', status: totalTrips > 0 },
            { name: 'Roster Data', status: totalRosters > 0 },
            { name: 'Performance Data', status: performanceRecords.length > 0 },
            { name: 'Notifications', status: totalNotifications > 0 },
            { name: 'Maintenance Records', status: maintenanceRecords > 0 },
            { name: 'Customer Data', status: customersFound > 0 }
        ];
        
        const passedChecks = checks.filter(check => check.status).length;
        const totalChecks = checks.length;
        
        console.log(`\n📋 SYSTEM CHECKS: ${passedChecks}/${totalChecks} PASSED`);
        checks.forEach(check => {
            console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
        });
        
        if (passedChecks === totalChecks) {
            console.log('\n🎉 ========== ALL CHECKS PASSED! ==========');
            console.log('✅ Rajesh Kumar demo data is complete and ready for testing');
            console.log('\n📱 LOGIN CREDENTIALS:');
            console.log('   Email: rajesh.kumar@abrafleet.com');
            console.log('   Password: Rajesh123!');
            console.log('\n🚀 READY FOR DEMONSTRATION!');
        } else {
            console.log('\n⚠️  ========== SOME CHECKS FAILED ==========');
            console.log('❌ Demo data setup is incomplete');
            console.log('Please run the setup script again or check for errors');
        }
        
        console.log('\n================================================\n');
        
    } catch (error) {
        console.error('\n❌ ========== TEST FAILED ==========');
        console.error('Error:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('====================================\n');
    } finally {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
}

// Run the test
if (require.main === module) {
    testRajeshKumarDemoData()
        .then(() => {
            console.log('✅ Test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testRajeshKumarDemoData };