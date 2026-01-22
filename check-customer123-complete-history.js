// check-customer123-complete-history.js
// Comprehensive check for customer123@abrafleet.com rosters and trip history

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'abra_fleet';

async function checkCustomer123History() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    const customerEmail = 'customer123@abrafleet.com';
    const customerId = 'b5aoloVR7xYI6SICibCIWecBaf82';
    
    console.log('\n🔍 COMPREHENSIVE HISTORY CHECK FOR CUSTOMER123');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${customerEmail}`);
    console.log(`🆔 Customer ID: ${customerId}`);
    console.log('='.repeat(60));
    
    // 1. Check user profile
    console.log('\n1️⃣ USER PROFILE CHECK');
    console.log('-'.repeat(30));
    
    const userProfile = await db.collection('users').findOne({
      $or: [
        { email: customerEmail },
        { uid: customerId },
        { _id: customerId }
      ]
    });
    
    if (userProfile) {
      console.log('✅ User profile found:');
      console.log(`   Name: ${userProfile.name || userProfile.displayName || 'N/A'}`);
      console.log(`   Email: ${userProfile.email || 'N/A'}`);
      console.log(`   Phone: ${userProfile.phone || userProfile.phoneNumber || 'N/A'}`);
      console.log(`   Organization: ${userProfile.organization || userProfile.companyName || 'N/A'}`);
      console.log(`   Role: ${userProfile.role || 'N/A'}`);
      console.log(`   Status: ${userProfile.status || userProfile.isActive || 'N/A'}`);
    } else {
      console.log('❌ User profile not found');
    }
    
    // 2. Check assigned rosters (current/active)
    console.log('\n2️⃣ ASSIGNED ROSTERS (CURRENT/ACTIVE)');
    console.log('-'.repeat(40));
    
    const assignedRosters = await db.collection('rosters').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customerInfo.email': customerEmail }
      ],
      status: { $in: ['assigned', 'ongoing', 'active', 'pending'] }
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`📋 Found ${assignedRosters.length} assigned/active rosters`);
    
    if (assignedRosters.length > 0) {
      assignedRosters.forEach((roster, index) => {
        console.log(`\n   Roster ${index + 1}:`);
        console.log(`   ├── ID: ${roster._id}`);
        console.log(`   ├── Status: ${roster.status}`);
        console.log(`   ├── Route: ${roster.pickupLocation || 'N/A'} → ${roster.dropLocation || 'N/A'}`);
        console.log(`   ├── Driver: ${roster.driverName || 'N/A'} (${roster.driverEmail || 'N/A'})`);
        console.log(`   ├── Vehicle: ${roster.vehicleNumber || 'N/A'}`);
        console.log(`   ├── Pickup Time: ${roster.pickupTime || 'N/A'}`);
        console.log(`   ├── Drop Time: ${roster.dropTime || 'N/A'}`);
        console.log(`   ├── Created: ${roster.createdAt || roster.assignedAt || 'N/A'}`);
        console.log(`   └── Organization: ${roster.organization || 'N/A'}`);
      });
    } else {
      console.log('   ℹ️  No assigned/active rosters found');
    }
    
    // 3. Check completed rosters (history)
    console.log('\n3️⃣ COMPLETED ROSTERS (HISTORY)');
    console.log('-'.repeat(35));
    
    const completedRosters = await db.collection('rosters').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customerInfo.email': customerEmail }
      ],
      status: { $in: ['completed', 'finished', 'done'] }
    }).sort({ completedAt: -1, createdAt: -1 }).toArray();
    
    console.log(`📚 Found ${completedRosters.length} completed rosters`);
    
    if (completedRosters.length > 0) {
      completedRosters.slice(0, 10).forEach((roster, index) => {
        console.log(`\n   Completed Roster ${index + 1}:`);
        console.log(`   ├── ID: ${roster._id}`);
        console.log(`   ├── Status: ${roster.status}`);
        console.log(`   ├── Route: ${roster.pickupLocation || 'N/A'} → ${roster.dropLocation || 'N/A'}`);
        console.log(`   ├── Driver: ${roster.driverName || 'N/A'}`);
        console.log(`   ├── Vehicle: ${roster.vehicleNumber || 'N/A'}`);
        console.log(`   ├── Completed: ${roster.completedAt || roster.endTime || 'N/A'}`);
        console.log(`   └── Duration: ${roster.duration || 'N/A'}`);
      });
      
      if (completedRosters.length > 10) {
        console.log(`   ... and ${completedRosters.length - 10} more completed rosters`);
      }
    } else {
      console.log('   ℹ️  No completed rosters found');
    }
    
    // 4. Check trips (all statuses)
    console.log('\n4️⃣ TRIP HISTORY (ALL STATUSES)');
    console.log('-'.repeat(35));
    
    const allTrips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customer.email': customerEmail },
        { 'customerInfo.email': customerEmail }
      ]
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`🚗 Found ${allTrips.length} total trips`);
    
    // Group trips by status
    const tripsByStatus = {};
    allTrips.forEach(trip => {
      const status = trip.status || 'unknown';
      if (!tripsByStatus[status]) {
        tripsByStatus[status] = [];
      }
      tripsByStatus[status].push(trip);
    });
    
    Object.keys(tripsByStatus).forEach(status => {
      const trips = tripsByStatus[status];
      console.log(`\n   📊 ${status.toUpperCase()} TRIPS: ${trips.length}`);
      
      trips.slice(0, 5).forEach((trip, index) => {
        console.log(`   ├── Trip ${index + 1}: ${trip._id}`);
        console.log(`   │   ├── Route: ${trip.pickupLocation || trip.startLocation || 'N/A'} → ${trip.dropLocation || trip.endLocation || 'N/A'}`);
        console.log(`   │   ├── Driver: ${trip.driverName || 'N/A'}`);
        console.log(`   │   ├── Vehicle: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`   │   ├── Date: ${trip.tripDate || trip.createdAt || 'N/A'}`);
        console.log(`   │   └── Distance: ${trip.distance || 'N/A'} km`);
      });
      
      if (trips.length > 5) {
        console.log(`   └── ... and ${trips.length - 5} more ${status} trips`);
      }
    });
    
    // 5. Check notifications
    console.log('\n5️⃣ NOTIFICATIONS');
    console.log('-'.repeat(20));
    
    const notifications = await db.collection('notifications').find({
      $or: [
        { recipientEmail: customerEmail },
        { userId: customerId },
        { 'recipient.email': customerEmail }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();
    
    console.log(`🔔 Found ${notifications.length} recent notifications`);
    
    if (notifications.length > 0) {
      notifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.title || notification.message || 'N/A'}`);
        console.log(`      ├── Type: ${notification.type || 'N/A'}`);
        console.log(`      ├── Status: ${notification.status || notification.read ? 'Read' : 'Unread'}`);
        console.log(`      └── Date: ${notification.createdAt || 'N/A'}`);
      });
    }
    
    // 6. Summary statistics
    console.log('\n6️⃣ SUMMARY STATISTICS');
    console.log('-'.repeat(25));
    
    const totalRosters = assignedRosters.length + completedRosters.length;
    const activeRosters = assignedRosters.filter(r => ['assigned', 'ongoing', 'active'].includes(r.status)).length;
    const pendingRosters = assignedRosters.filter(r => r.status === 'pending').length;
    
    console.log(`📊 Total Rosters: ${totalRosters}`);
    console.log(`   ├── Active: ${activeRosters}`);
    console.log(`   ├── Pending: ${pendingRosters}`);
    console.log(`   └── Completed: ${completedRosters.length}`);
    console.log(`🚗 Total Trips: ${allTrips.length}`);
    
    Object.keys(tripsByStatus).forEach(status => {
      console.log(`   ├── ${status}: ${tripsByStatus[status].length}`);
    });
    
    console.log(`🔔 Recent Notifications: ${notifications.length}`);
    
    // 7. Check for any issues
    console.log('\n7️⃣ POTENTIAL ISSUES');
    console.log('-'.repeat(25));
    
    let issuesFound = false;
    
    if (!userProfile) {
      console.log('⚠️  User profile not found in database');
      issuesFound = true;
    }
    
    if (assignedRosters.length === 0 && completedRosters.length === 0) {
      console.log('⚠️  No rosters found (assigned or completed)');
      issuesFound = true;
    }
    
    if (allTrips.length === 0) {
      console.log('⚠️  No trips found');
      issuesFound = true;
    }
    
    // Check for orphaned data
    const rostersWithoutTrips = [];
    for (const roster of [...assignedRosters, ...completedRosters]) {
      const relatedTrips = allTrips.filter(trip => 
        trip.rosterId === roster._id.toString() || 
        trip.rosterReference === roster._id.toString()
      );
      if (relatedTrips.length === 0) {
        rostersWithoutTrips.push(roster);
      }
    }
    
    if (rostersWithoutTrips.length > 0) {
      console.log(`⚠️  ${rostersWithoutTrips.length} rosters found without corresponding trips`);
      issuesFound = true;
    }
    
    if (!issuesFound) {
      console.log('✅ No issues detected');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CUSTOMER123 HISTORY CHECK COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error checking customer123 history:', error);
  } finally {
    await client.close();
  }
}

// Run the check
checkCustomer123History().catch(console.error);