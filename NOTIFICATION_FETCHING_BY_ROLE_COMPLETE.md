# 🔔 NOTIFICATION FETCHING BY ROLE - COMPLETE GUIDE

**Date:** January 20, 2026  
**Status:** ✅ FULLY IMPLEMENTED  
**User Isolation:** 🔒 GUARANTEED

---

## ✅ YOUR QUESTION ANSWERED

**Question:** "Previously for different roles having different notifications, is that notifications can be fetched?"

**Answer:** ✅ **YES! Notifications are fetched with role-based filtering and user isolation!**

---

## 🎯 HOW NOTIFICATION FETCHING WORKS

### 1. Backend API Endpoint

**Endpoint:** `GET /api/onesignal/my-notifications`

**Location:** `abra_fleet_backend/routes/one_signal_router.js`

**How it works:**
```javascript
router.get('/my-notifications', async (req, res) => {
  // 🔒 STEP 1: Get logged-in user's ID from JWT token
  const userId = req.user?.userId || req.user?.id;
  
  // 🔒 STEP 2: Query ONLY this user's notifications
  const query = { userId };  // User isolation!
  
  // Optional filters
  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === 'true';
  }
  if (req.query.type) {
    query.type = req.query.type;
  }
  
  // 🔒 STEP 3: Fetch from MongoDB with user filter
  const notifications = await db.collection('onesignal_notifications')
    .find(query)  // Only this user's notifications!
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  // Return notifications
  res.json({
    success: true,
    data: {
      notifications,
      unreadCount
    }
  });
});
```

**Key Points:**
- ✅ Uses JWT authentication to identify user
- ✅ Queries MongoDB with `userId` filter
- ✅ Returns ONLY notifications for logged-in user
- ✅ Supports pagination and filtering

---

### 2. Frontend Fetching (Flutter)

Each user role has its own notification screen that fetches notifications:

#### Customer Notifications
**File:** `abra_fleet/lib/features/notifications/presentation/screens/customer_notifications_screen.dart`

```dart
Future<void> _loadNotifications() async {
  // 🔒 STEP 1: Call backend API (JWT token sent automatically)
  final response = await _oneSignalService.getNotifications(
    page: 1,
    limit: 50,
  );
  
  // 🔒 STEP 2: Filter for customer-specific notification types
  _notifications = notifications
      .cast<Map<String, dynamic>>()
      .where((notification) {
        final type = notification['type']?.toString() ?? '';
        return _customerNotificationTypes.contains(type);
      })
      .toList();
}

// Customer notification types
static const List<String> _customerNotificationTypes = [
  'roster_assigned',
  'trip_started',
  'driver_arriving',
  'eta_update',
  'leave_approved',
  'address_change_approved',
  // ... more customer types
];
```

#### Driver Notifications
**File:** `abra_fleet/lib/features/notifications/presentation/screens/driver_notifications_screen.dart`

```dart
Future<void> _loadNotifications() async {
  // 🔒 STEP 1: Call backend API (JWT token sent automatically)
  final response = await _oneSignalService.getNotifications(
    page: 1,
    limit: 50,
  );
  
  // 🔒 STEP 2: Filter for driver-specific notification types
  _notifications = notifications
      .cast<Map<String, dynamic>>()
      .where((notification) {
        final type = notification['type']?.toString() ?? '';
        return _driverNotificationTypes.contains(type);
      })
      .toList();
}

// Driver notification types
static const List<String> _driverNotificationTypes = [
  'trip_assigned',
  'vehicle_assigned',
  'roster_assigned',
  'route_optimized',
  'trip_cancelled',
  // ... more driver types
];
```

#### Client Notifications
**File:** `abra_fleet/lib/features/notifications/presentation/screens/client_notifications_screen.dart`

```dart
// Client notification types
static const List<String> _clientNotificationTypes = [
  'roster_assigned',
  'leave_request',
  'sos_alert',
  'driver_performance_alert',
  'feedback_reply',
  // ... more client types
];
```

#### Admin Notifications
**File:** `abra_fleet/lib/features/notifications/presentation/screens/admin_notifications_screen.dart`

```dart
// Admin notification types
static const List<String> _adminNotificationTypes = [
  'sos_alert',
  'address_change_request',
  'maintenance_reminder',
  'trip_cancelled',
  'leave_request',
  // ... more admin types
];
```

---

## 🔒 USER ISOLATION IN FETCHING

### How User Isolation Works:

1. **JWT Authentication:**
   - User logs in → receives JWT token
   - JWT token contains `userId`
   - Every API request includes JWT token in header

2. **Backend Filtering:**
   ```javascript
   // Backend extracts userId from JWT
   const userId = req.user?.userId;
   
   // Query ONLY this user's notifications
   const query = { userId };
   
   // MongoDB returns ONLY matching notifications
   const notifications = await db.find(query);
   ```

3. **Frontend Role Filtering:**
   ```dart
   // Frontend filters by notification type
   _notifications = notifications.where((notification) {
     final type = notification['type'];
     return _roleSpecificTypes.contains(type);
   }).toList();
   ```

### Result:
✅ **Customer123** fetches notifications → Gets ONLY customer123's notifications  
✅ **Driver456** fetches notifications → Gets ONLY driver456's notifications  
✅ **Client789** fetches notifications → Gets ONLY client789's notifications  
✅ **Admin999** fetches notifications → Gets ONLY admin999's notifications  

**No cross-contamination possible!**

---

## 📊 NOTIFICATION TYPES BY ROLE

### Customer (8 types)
```dart
'roster_assigned',           // Roster assigned to customer
'roster_updated',            // Roster details changed
'trip_started',              // Driver started trip
'driver_arriving',           // Driver arriving soon
'eta_update',                // ETA changed
'leave_approved',            // Leave request approved
'leave_rejected',            // Leave request rejected
'address_change_approved',   // Address change approved
```

### Driver (10 types)
```dart
'trip_assigned',             // New trip assigned
'vehicle_assigned',          // Vehicle assigned
'roster_assigned',           // Roster assigned
'route_optimized',           // Route optimized
'trip_cancelled',            // Trip cancelled
'trip_updated',              // Trip details changed
'shift_reminder',            // Shift starting soon
'document_expiring_soon',    // Document expiring
'emergency_alert',           // Emergency alert
'feedback_reply',            // Admin replied to feedback
```

### Client (7 types)
```dart
'roster_assigned',           // Roster created
'roster_updated',            // Roster modified
'leave_request',             // Employee leave request
'sos_alert',                 // Emergency alert
'sos_resolved',              // SOS resolved
'driver_performance_alert',  // Driver performance issue
'feedback_reply',            // Admin replied to feedback
```

### Admin (8 types)
```dart
'sos_alert',                 // Emergency alert
'address_change_request',    // Customer address change
'maintenance_reminder',      // Vehicle maintenance due
'trip_cancelled',            // Trip cancelled
'leave_request',             // Leave request
'roster_assignment',         // Roster assigned
'driver_response',           // Driver accepted/declined
'feedback_received',         // New feedback received
```

---

## 🔄 REAL-TIME UPDATES

### WebSocket Streaming

Each notification screen also listens for real-time updates:

```dart
void _setupRealtimeListener() {
  _notificationSubscription = _oneSignalService.onNewNotification.listen(
    (notification) {
      // Check if it's relevant for this role
      final type = notification['type'];
      if (_roleSpecificTypes.contains(type)) {
        // Add to list
        setState(() {
          _notifications.insert(0, notification);
          _unreadCount++;
        });
      }
    },
  );
}
```

**How it works:**
1. User opens notification screen
2. Screen subscribes to OneSignal stream
3. New notification arrives via WebSocket
4. Screen checks if notification type matches role
5. If match → adds to list and updates UI
6. If no match → ignores notification

**Result:** Real-time notifications appear instantly!

---

## 📱 EXAMPLE FLOW

### Scenario: Customer123 Opens Notification Screen

**Step 1: User Opens Screen**
```dart
// Customer opens notification screen
Navigator.push(context, CustomerNotificationsScreen());
```

**Step 2: Screen Fetches Notifications**
```dart
// Screen calls backend API
final response = await _oneSignalService.getNotifications();
```

**Step 3: Backend Processes Request**
```javascript
// Backend extracts userId from JWT
const userId = 'customer123';  // From JWT token

// Backend queries MongoDB
const notifications = await db.find({ userId: 'customer123' });

// Returns: [
//   { userId: 'customer123', type: 'trip_started', ... },
//   { userId: 'customer123', type: 'driver_arriving', ... },
//   { userId: 'customer123', type: 'roster_assigned', ... }
// ]
```

**Step 4: Frontend Filters by Type**
```dart
// Filter for customer types only
_notifications = notifications.where((n) {
  return _customerNotificationTypes.contains(n['type']);
}).toList();

// Result: Shows only customer-relevant notifications
```

**Step 5: Display to User**
```dart
// UI shows filtered notifications
ListView.builder(
  itemCount: _notifications.length,
  itemBuilder: (context, index) {
    return NotificationCard(_notifications[index]);
  },
);
```

---

## 🧪 TESTING NOTIFICATION FETCHING

### Test 1: Fetch Customer Notifications
```bash
# Login as customer123
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer123@example.com","password":"password"}'

# Get JWT token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Fetch notifications
curl -X GET http://localhost:3001/api/onesignal/my-notifications \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "userId": "customer123",
        "type": "trip_started",
        "title": "Trip Started",
        "message": "Your driver has started the trip"
      },
      {
        "userId": "customer123",
        "type": "roster_assigned",
        "title": "Roster Assigned",
        "message": "You have been assigned to a new roster"
      }
    ],
    "unreadCount": 2
  }
}
```

### Test 2: Verify User Isolation
```bash
# Login as driver456
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"driver456@example.com","password":"password"}'

# Get JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Fetch notifications
curl -X GET http://localhost:3001/api/onesignal/my-notifications \
  -H "Authorization: Bearer $TOKEN"

# Response: ONLY driver456's notifications
{
  "success": true,
  "data": {
    "notifications": [
      {
        "userId": "driver456",  // ✅ Only driver456's notifications
        "type": "trip_assigned",
        "title": "New Trip Assigned"
      }
    ]
  }
}

# ✅ customer123's notifications are NOT returned!
```

---

## ✅ FEATURES IMPLEMENTED

### Backend Features ✅
- [x] JWT authentication for user identification
- [x] MongoDB query with userId filter
- [x] Pagination support (page, limit)
- [x] Filter by read/unread status
- [x] Filter by notification type
- [x] Unread count calculation
- [x] Mark as read endpoint
- [x] Mark all as read endpoint

### Frontend Features ✅
- [x] Role-specific notification screens (4 types)
- [x] Fetch notifications from backend
- [x] Filter by role-specific types
- [x] Real-time WebSocket updates
- [x] Pull-to-refresh
- [x] Mark as read functionality
- [x] Mark all as read functionality
- [x] Unread count badge
- [x] Notification details dialog
- [x] Priority-based styling
- [x] Time ago display

---

## 🎯 SUMMARY

### Your Question:
> "Previously for different roles having different notifications, is that notifications can be fetched?"

### Answer:
✅ **YES! Notifications are fetched with:**

1. **User Isolation:**
   - Backend uses JWT to identify user
   - MongoDB queries filter by userId
   - Each user gets ONLY their notifications

2. **Role-Based Filtering:**
   - Each role has specific notification types
   - Frontend filters by role-specific types
   - Customer sees customer notifications
   - Driver sees driver notifications
   - Client sees client notifications
   - Admin sees admin notifications

3. **Real-Time Updates:**
   - WebSocket streaming for instant updates
   - Role-based filtering on new notifications
   - Automatic UI updates

4. **Complete Features:**
   - Fetch notifications (paginated)
   - Filter by read/unread
   - Filter by type
   - Mark as read
   - Mark all as read
   - Unread count
   - Real-time updates

**Result:** Each user role can fetch their own notifications with complete isolation and role-based filtering!

---

**Generated:** January 20, 2026  
**System:** Abra Fleet Management  
**Status:** ✅ COMPLETE & VERIFIED
