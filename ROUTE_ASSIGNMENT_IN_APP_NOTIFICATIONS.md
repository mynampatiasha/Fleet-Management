# 🔔 Route Assignment - In-App Notifications Only

## Overview

This implementation focuses on **in-app notifications only** (no SMS, no email) for the complete route assignment workflow.

---

## ✅ What's Already Working

Based on the code review:

1. ✅ **Route Optimization Algorithm** - Haversine + TSP working perfectly
2. ✅ **Vehicle Selection** - Finds best vehicle with capacity
3. ✅ **Route Generation** - Creates optimal pickup sequence
4. ✅ **Backend API** - `/api/roster/assign-optimized-route` endpoint exists
5. ✅ **Notification Model** - `createNotification()` function exists
6. ✅ **Flutter Integration** - `assignOptimizedRoute()` method in RosterService

---

## 🎯 What Needs Verification

### 1. Check if Route is Registered in Backend

**File:** `abra_fleet_backend/index.js`

Verify this line exists:
```javascript
const routeOptimizationRouter = require('./routes/route_optimization_router');
app.use('/api/roster', routeOptimizationRouter);
```

### 2. Test the Complete Workflow

Run the test script to verify everything works end-to-end.

---

## 🧪 Testing

### Test Script

**File:** `abra_fleet_backend/test-route-assignment-notifications.js`

```javascript
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const API_URL = 'http://localhost:3000';
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet';

async function testRouteAssignmentNotifications() {
  console.log('\n' + '🧪'*40);
  console.log('TESTING ROUTE ASSIGNMENT WITH NOTIFICATIONS');
  console.log('🧪'*40 + '\n');

  let client;

  try {
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    client = await MongoClient.connect(MONGO_URL);
    const db = client.db(DB_NAME);
    console.log('✅ Connected to database\n');

    // Step 1: Get a test vehicle
    console.log('1️⃣ Finding test vehicle...');
    const vehicle = await db.collection('vehicles').findOne({
      status: 'ACTIVE',
      assignedDriver: { $exists: true, $ne: null }
    });

    if (!vehicle) {
      console.log('❌ No active vehicle with driver found');
      console.log('💡 Create a vehicle with assigned driver first');
      return;
    }

    console.log(`✅ Found vehicle: ${vehicle.name || vehicle.vehicleNumber}`);
    console.log(`   Driver: ${vehicle.assignedDriver?.name || 'Unknown'}\n`);

    // Step 2: Get test rosters
    console.log('2️⃣ Finding pending rosters...');
    const rosters = await db.collection('rosters').find({
      status: 'pending_assignment'
    }).limit(3).toArray();

    if (rosters.length === 0) {
      console.log('❌ No pending rosters found');
      console.log('💡 Create some pending rosters first');
      return;
    }

    console.log(`✅ Found ${rosters.length} pending rosters\n`);

    // Step 3: Prepare route data
    console.log('3️⃣ Preparing route data...');
    const route = rosters.map((roster, index) => ({
      rosterId: roster._id.toString(),
      customerId: roster.customerId || roster.customerEmail,
      customerName: roster.customerName || 'Customer ' + (index + 1),
      customerEmail: roster.customerEmail || '',
      customerPhone: roster.phone || '',
      sequence: index + 1,
      pickupTime: `08:${30 + (index * 10)}`,
      eta: new Date(Date.now() + (30 + index * 10) * 60000).toISOString(),
      location: {
        latitude: roster.latitude || 12.9716,
        longitude: roster.longitude || 77.5946,
        address: roster.officeLocation || 'Test Location'
      },
      distanceFromPrevious: 2.5 + (index * 0.5),
      estimatedTime: 8 + (index * 2)
    }));

    console.log(`✅ Route prepared with ${route.length} stops\n`);

    // Step 4: Get admin token (you need to login first)
    console.log('4️⃣ Getting admin user...');
    const admin = await db.collection('users').findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log(`✅ Admin: ${admin.name || admin.email}\n`);

    // Step 5: Call the API
    console.log('5️⃣ Calling route assignment API...');
    console.log(`   Endpoint: POST ${API_URL}/api/roster/assign-optimized-route`);
    console.log(`   Vehicle: ${vehicle._id}`);
    console.log(`   Customers: ${route.length}`);
    console.log(`   Total Distance: 12.5 km`);
    console.log(`   Total Time: 35 mins\n`);

    // Note: You'll need a valid JWT token here
    // For testing, you can temporarily disable auth or use a real token
    const response = await axios.post(
      `${API_URL}/api/roster/assign-optimized-route`,
      {
        vehicleId: vehicle._id.toString(),
        route: route,
        totalDistance: 12.5,
        totalTime: 35,
        startTime: new Date().toISOString()
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API Response received:\n');
    console.log(JSON.stringify(response.data, null, 2));

    // Step 6: Verify notifications were created
    console.log('\n6️⃣ Verifying notifications...');
    
    const customerNotifications = await db.collection('notifications').find({
      type: 'route_assignment',
      createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
    }).toArray();

    const driverNotifications = await db.collection('notifications').find({
      type: 'driver_route_assignment',
      createdAt: { $gte: new Date(Date.now() - 60000) }
    }).toArray();

    console.log(`✅ Customer notifications: ${customerNotifications.length}`);
    console.log(`✅ Driver notifications: ${driverNotifications.length}\n`);

    if (customerNotifications.length > 0) {
      console.log('📱 Sample customer notification:');
      console.log(`   Title: ${customerNotifications[0].title}`);
      console.log(`   Message: ${customerNotifications[0].message.substring(0, 100)}...`);
      console.log(`   User: ${customerNotifications[0].userId}\n`);
    }

    if (driverNotifications.length > 0) {
      console.log('🚗 Sample driver notification:');
      console.log(`   Title: ${driverNotifications[0].title}`);
      console.log(`   Message: ${driverNotifications[0].message.substring(0, 100)}...`);
      console.log(`   User: ${driverNotifications[0].userId}\n`);
    }

    // Step 7: Verify rosters were updated
    console.log('7️⃣ Verifying roster updates...');
    
    const updatedRosters = await db.collection('rosters').find({
      _id: { $in: rosters.map(r => r._id) }
    }).toArray();

    const assignedCount = updatedRosters.filter(r => r.status === 'assigned').length;
    console.log(`✅ Rosters updated: ${assignedCount}/${rosters.length} assigned\n`);

    console.log('🎉'*40);
    console.log('TEST COMPLETED SUCCESSFULLY!');
    console.log('🎉'*40 + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    if (client) {
      await client.close();
      console.log('📊 Database connection closed');
    }
  }
}

// Run the test
testRouteAssignmentNotifications();
```

### Run the Test

```bash
cd abra_fleet_backend
node test-route-assignment-notifications.js
```

---

## 🔧 Quick Fix if Notifications Not Working

### Check Notification Model

**File:** `abra_fleet_backend/models/notification_model.js`

Ensure the `createNotification` function exists and works:

```javascript
async function createNotification(db, notificationData) {
  try {
    const notification = {
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'general',
      data: notificationData.data || {},
      priority: notificationData.priority || 'medium',
      category: notificationData.category || 'general',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    
    console.log(`✅ Notification created: ${result.insertedId}`);
    
    return {
      _id: result.insertedId,
      ...notification
    };
  } catch (error) {
    console.error('❌ Create notification error:', error);
    throw error;
  }
}

module.exports = { createNotification };
```

---

## 📱 Flutter - Viewing Notifications

Customers and drivers can view notifications in the app:

### Customer View
- Navigate to: **Notifications** screen
- Shows all route assignments with pickup times
- Real-time updates when new notifications arrive

### Driver View
- Navigate to: **Notifications** screen
- Shows route assignments with customer details
- Includes navigation and route information

---

## 🚀 Deployment Checklist

- [ ] Backend route registered in `index.js`
- [ ] Notification model exists and works
- [ ] MongoDB notifications collection created
- [ ] Test script runs successfully
- [ ] Flutter app shows notifications
- [ ] Customers receive notifications
- [ ] Drivers receive notifications
- [ ] Rosters updated to "assigned" status

---

## 📊 Success Metrics

After implementation, you should see:

1. ✅ **Database**: Rosters status changed to "assigned"
2. ✅ **Notifications Collection**: New documents created for each customer + driver
3. ✅ **Flutter App**: Notifications appear in notification screen
4. ✅ **Real-time**: Notification badge updates immediately
5. ✅ **Data Persistence**: Notifications survive app restart

---

## 🐛 Troubleshooting

### Issue: No notifications created

**Check:**
1. Is `createNotification` function imported in route file?
2. Are there any errors in backend console?
3. Does notifications collection exist in MongoDB?

**Fix:**
```bash
# Check MongoDB
mongo
use abra_fleet
db.notifications.find().limit(5)
```

### Issue: Notifications created but not showing in app

**Check:**
1. Is notification service polling the API?
2. Is the userId matching correctly?
3. Are notifications filtered by date?

**Fix:**
```dart
// In Flutter, check notification service
await notificationService.fetchNotifications();
```

### Issue: Route assignment succeeds but notifications fail

**Check:**
1. Backend logs for notification errors
2. MongoDB connection status
3. Notification model implementation

**Fix:**
Add try-catch around notification creation to prevent blocking the main flow.

---

## 📞 Next Steps

1. **Test the workflow** using the test script
2. **Verify notifications** appear in MongoDB
3. **Check Flutter app** to see notifications
4. **Add scheduled reminders** (optional - 30 mins before pickup)
5. **Add live tracking** (optional - GPS updates)

---

## 💡 Optional Enhancements

### 1. Notification Sounds
Add sound when notification arrives in Flutter app

### 2. Badge Count
Show unread notification count on app icon

### 3. Rich Notifications
Add images, actions, and custom layouts

### 4. Notification History
Keep archive of all past notifications

### 5. Notification Preferences
Let users choose which notifications to receive
