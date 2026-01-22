// check-customer123-detailed-view.js
// Detailed view with proper location formatting for customer123@abrafleet.com

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'abra_fleet';

function formatLocation(location) {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    if (location.address) return location.address;
    if (location.name) return location.name;
    if (location.description) return location.description;
    if (location.lat && location.lng) return `${location.lat}, ${location.lng}`;
    return JSON.stringify(location);
  }
  return 'N/A';
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function checkCustomer123DetailedView() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    const customerEmail = 'customer123@abrafleet.com';
    const customerId = 'b5aoloVR7xYI6SICibCIWecBaf82';
    
    console.log('\n🔍 DETAILED VIEW FOR CUSTOMER123@ABRAFLEET.COM');
    console.log('='.repeat(70));
    
    // 1. Current Assigned Rosters
    console.log('\n📋 CURRENT ASSIGNED ROSTERS');
    console.log('-'.repeat(40));
    
    const assignedRosters = await db.collection('rosters').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customerInfo.email': customerEmail }
      ],
      status: { $in: ['assigned', 'ongoing', 'active', 'pending'] }
    }).sort({ createdAt: -1 }).toArray();
    
    if (assignedRosters.length > 0) {
      assignedRosters.forEach((roster, index) => {
        console.log(`\n🚗 Roster ${index + 1}:`);
        console.log(`   📍 Pickup: ${formatLocation(roster.pickupLocation)}`);
        console.log(`   🎯 Drop: ${formatLocation(roster.dropLocation)}`);
        console.log(`   👨‍✈️ Driver: ${roster.driverName || 'N/A'} (${roster.driverEmail || 'N/A'})`);
        console.log(`   🚙 Vehicle: ${roster.vehicleNumber || 'N/A'}`);
        console.log(`   ⏰ Pickup Time: ${roster.pickupTime || 'N/A'}`);
        console.log(`   🏁 Drop Time: ${roster.dropTime || 'N/A'}`);
        console.log(`   📊 Status: ${roster.status}`);
        console.log(`   📅 Created: ${formatDate(roster.createdAt)}`);
        console.log(`   🏢 Organization: ${roster.organization || 'N/A'}`);
        console.log(`   🆔 Roster ID: ${roster._id}`);
      });
    } else {
      console.log('   ℹ️  No assigned rosters found');
    }
    
    // 2. Recent Completed Trips (Last 10)
    console.log('\n🏁 RECENT COMPLETED TRIPS (Last 10)');
    console.log('-'.repeat(45));
    
    const completedTrips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customer.email': customerEmail },
        { 'customerInfo.email': customerEmail }
      ],
      status: 'completed'
    }).sort({ createdAt: -1 }).limit(10).toArray();
    
    if (completedTrips.length > 0) {
      completedTrips.forEach((trip, index) => {
        console.log(`\n✅ Trip ${index + 1}:`);
        console.log(`   📍 From: ${formatLocation(trip.pickupLocation || trip.startLocation)}`);
        console.log(`   🎯 To: ${formatLocation(trip.dropLocation || trip.endLocation)}`);
        console.log(`   👨‍✈️ Driver: ${trip.driverName || 'N/A'}`);
        console.log(`   🚙 Vehicle: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`   📏 Distance: ${trip.distance || 'N/A'} km`);
        console.log(`   ⏱️ Duration: ${trip.duration || 'N/A'}`);
        console.log(`   📅 Date: ${formatDate(trip.tripDate || trip.createdAt)}`);
        console.log(`   🆔 Trip ID: ${trip._id}`);
      });
    } else {
      console.log('   ℹ️  No completed trips found');
    }
    
    // 3. Ongoing Trips
    console.log('\n🚗 ONGOING TRIPS');
    console.log('-'.repeat(20));
    
    const ongoingTrips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customer.email': customerEmail },
        { 'customerInfo.email': customerEmail }
      ],
      status: 'ongoing'
    }).sort({ createdAt: -1 }).toArray();
    
    if (ongoingTrips.length > 0) {
      ongoingTrips.forEach((trip, index) => {
        console.log(`\n🔄 Ongoing Trip ${index + 1}:`);
        console.log(`   📍 From: ${formatLocation(trip.pickupLocation || trip.startLocation)}`);
        console.log(`   🎯 To: ${formatLocation(trip.dropLocation || trip.endLocation)}`);
        console.log(`   👨‍✈️ Driver: ${trip.driverName || 'N/A'}`);
        console.log(`   🚙 Vehicle: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`   📏 Distance: ${trip.distance || 'N/A'} km`);
        console.log(`   📅 Started: ${formatDate(trip.startTime || trip.createdAt)}`);
        console.log(`   🆔 Trip ID: ${trip._id}`);
      });
    } else {
      console.log('   ℹ️  No ongoing trips found');
    }
    
    // 4. Scheduled/Future Trips
    console.log('\n📅 SCHEDULED/FUTURE TRIPS (Next 5)');
    console.log('-'.repeat(40));
    
    const scheduledTrips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customer.email': customerEmail },
        { 'customerInfo.email': customerEmail }
      ],
      status: 'scheduled'
    }).sort({ tripDate: 1 }).limit(5).toArray();
    
    if (scheduledTrips.length > 0) {
      scheduledTrips.forEach((trip, index) => {
        console.log(`\n⏰ Scheduled Trip ${index + 1}:`);
        console.log(`   📍 From: ${formatLocation(trip.pickupLocation || trip.startLocation)}`);
        console.log(`   🎯 To: ${formatLocation(trip.dropLocation || trip.endLocation)}`);
        console.log(`   👨‍✈️ Driver: ${trip.driverName || 'N/A'}`);
        console.log(`   🚙 Vehicle: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`   📏 Distance: ${trip.distance || 'N/A'} km`);
        console.log(`   📅 Scheduled: ${formatDate(trip.tripDate)}`);
        console.log(`   🆔 Trip ID: ${trip._id}`);
      });
    } else {
      console.log('   ℹ️  No scheduled trips found');
    }
    
    // 5. Trip Statistics
    console.log('\n📊 TRIP STATISTICS');
    console.log('-'.repeat(25));
    
    const allTrips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerId },
        { 'customer.email': customerEmail },
        { 'customerInfo.email': customerEmail }
      ]
    }).toArray();
    
    const stats = {
      total: allTrips.length,
      completed: allTrips.filter(t => t.status === 'completed').length,
      ongoing: allTrips.filter(t => t.status === 'ongoing').length,
      scheduled: allTrips.filter(t => t.status === 'scheduled').length,
      cancelled: allTrips.filter(t => t.status === 'cancelled').length
    };
    
    const totalDistance = allTrips
      .filter(t => t.distance && !isNaN(parseFloat(t.distance)))
      .reduce((sum, t) => sum + parseFloat(t.distance), 0);
    
    console.log(`   🚗 Total Trips: ${stats.total}`);
    console.log(`   ✅ Completed: ${stats.completed}`);
    console.log(`   🔄 Ongoing: ${stats.ongoing}`);
    console.log(`   ⏰ Scheduled: ${stats.scheduled}`);
    console.log(`   ❌ Cancelled: ${stats.cancelled}`);
    console.log(`   📏 Total Distance: ${totalDistance.toFixed(1)} km`);
    
    // 6. Recent Notifications
    console.log('\n🔔 RECENT NOTIFICATIONS');
    console.log('-'.repeat(30));
    
    const notifications = await db.collection('notifications').find({
      $or: [
        { recipientEmail: customerEmail },
        { userId: customerId },
        { 'recipient.email': customerEmail }
      ]
    }).sort({ createdAt: -1 }).limit(5).toArray();
    
    if (notifications.length > 0) {
      notifications.forEach((notification, index) => {
        console.log(`\n📢 Notification ${index + 1}:`);
        console.log(`   📝 Title: ${notification.title || 'N/A'}`);
        console.log(`   💬 Message: ${notification.message || 'N/A'}`);
        console.log(`   🏷️ Type: ${notification.type || 'N/A'}`);
        console.log(`   👁️ Status: ${notification.read ? 'Read' : 'Unread'}`);
        console.log(`   📅 Date: ${formatDate(notification.createdAt)}`);
      });
    } else {
      console.log('   ℹ️  No notifications found');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DETAILED VIEW COMPLETE');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the detailed check
checkCustomer123DetailedView().catch(console.error);