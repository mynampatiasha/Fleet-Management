# Notification System - Complete Guide

## Overview
Complete documentation for the entire notification system in Abra Fleet, covering admin, client, and customer notifications including implementation, fixes, testing, and troubleshooting.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Admin Notifications](#admin-notifications)
3. [Client Notifications](#client-notifications)
4. [Customer Notifications](#customer-notifications)
5. [Technical Implementation](#technical-implementation)
6. [Fixes & Improvements](#fixes--improvements)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

---

## System Architecture

### Dual Database System
The notification system uses two databases for reliability and real-time updates:

1. **MongoDB** (via Backend API)
   - Primary storage
   - Long-term persistence
   - Complex queries
   - Historical data

2. **Firebase Realtime Database**
   - Real-time sync
   - Offline support
   - Cross-device sync
   - Instant updates

### Notification Flow
```
Event Occurs (Leave Request, Customer Registration, etc.)
    ↓
Backend Creates Notification
    ↓
Saves to MongoDB ✅
    ↓
Pushes to Firebase RTDB ✅
    ↓
Firebase Listener Detects New Notification
    ↓
Plays Sound 🔊
    ↓
Shows Floating Notification 📱
    ↓
Updates Badge Count 🔔
    ↓
Adds to Notification List 📋
```

### Notification Types by Role

**Admin**:
- `leave_approved_admin` - Leave approved, needs trip cancellation
- `trip_cancelled` - Trip cancellation confirmation
- `customer_registration` - New customer needs approval
- `sos_alert` - Emergency SOS alert
- `driver_report` - Driver incident report
- `vehicle_maintenance` - Vehicle maintenance alert

**Client**:
- `leave_request` - Customer submitted leave request
- `customer_registration` - New customer in organization
- `roster_assigned` - Roster assigned to customer

**Customer**:
- `leave_approved` - Leave request approved
- `leave_rejected` - Leave request rejected
- `roster_assigned` - Roster assigned
- `trip_cancelled` - Trip cancelled
- `account_approved` - Account approved by admin

---

## Admin Notifications

### Leave Approval Notifications

#### Flow
```
Customer Submits Leave Request
    ↓
Client Approves Leave Request
    ↓
Backend Sends Notification to ALL Admins
    ↓
Admin Receives Notification (3 ways):
    1. Notification Bell (red badge)
    2. Notifications Screen (urgent priority)
    3. Trip Cancellation Menu (badge)
    ↓
Admin Cancels Affected Trips
    ↓
Drivers Notified
```

#### Where Admin Sees Notifications

**1. Notification Bell Icon**
- Location: Top right corner of admin dashboard
- Features: Red badge with unread count, updates in real-time
- Click to open notifications screen

**2. Customer Management Menu**
- Location: Admin Sidebar → Customer Management
- Shows: "Trip Cancellation" with badge showing approved leaves count
- Updates every 30 seconds

**3. Trip Cancellation Management Screen**
- Location: Customer Management → Trip Cancellation
- Shows: All approved leave requests needing action
- Features: Employee details, leave period, affected trips, "Cancel Trips" button

#### Backend Implementation
```javascript
// Send to ALL admin users
const adminUsers = await req.db.collection('users').find({ 
  role: 'admin' 
}).toArray();

for (const admin of adminUsers) {
  await createNotification(req.db, {
    userId: admin.firebaseUid,
    type: 'leave_approved_admin',
    title: 'Leave Request Approved - Action Required',
    body: `Leave request approved for ${customerName}. Please cancel trips.`,
    priority: 'urgent',
    category: 'leave_management',
    data: {
      leaveRequestId,
      customerId,
      customerName,
      startDate,
      endDate,
      affectedTripsCount,
      approvedBy
    }
  });
}
```

### Trip Cancellation Notifications

#### Flow
```
Admin Clicks "Cancel Trips"
    ↓
Confirmation Dialog Shows Trip Details
    ↓
Admin Confirms Cancellation
    ↓
Backend Cancels All Affected Trips
    ↓
Backend Sends Notifications:
    - To Admin (confirmation)
    - To Each Driver (trip cancelled)
    ↓
Admin Receives:
    - Floating notification with sound
    - Notification in list
    - Badge update
```

#### Features
- **Floating Notification**: Slides in from top, auto-dismisses after 5 seconds
- **Custom Sound**: Plays `Notification.mp3`
- **High Priority**: Orange color, urgent badge
- **Trip Details**: Customer name, number of trips cancelled

#### Cancel Trips Dialog (Fixed)
- ✅ No more overflow errors
- ✅ Proper scrolling for trips list
- ✅ Flexible height with maxHeight constraint
- ✅ Empty state handling
- Shows: Leave request details, all trips to cancel, optional admin notes

### Customer Registration Notifications

#### Flow
```
Customer Registers
    ↓
Backend Sends Notification to ALL Admins
    ↓
Admin Reviews Customer Details
    ↓
Admin Approves/Rejects Customer
    ↓
Notification AUTOMATICALLY DELETED from ALL Admins ✅
```

#### Automatic Cleanup (Fixed)

**Problem**: Notifications stayed in list after customer was approved/rejected, causing confusion.

**Solution**: When admin approves/rejects customer:
1. Customer status updated
2. Welcome/rejection email sent
3. **All related notifications deleted from ALL admins**
4. Deleted from both Firebase RTDB and MongoDB
5. Badge count updated

**Benefits**:
- ✅ No obsolete notifications
- ✅ Clean notification list
- ✅ Accurate badge count
- ✅ No admin confusion

---

## Client Notifications

### Leave Request Notifications

#### Flow
```
Customer Submits Leave Request
    ↓
Backend Matches Customer to Client by Email Domain
    ↓
Backend Sends Notification to ALL Matching Clients
    ↓
Client Receives Notification (3 ways):
    1. Notification Bell (red badge)
    2. Notifications Screen (high priority)
    3. Floating Notification (with sound)
    ↓
Client Reviews Leave Request
    ↓
Client Approves/Rejects Leave Request
    ↓
Customer Notified
    ↓
Admin Notified (if approved)
```

### Email Domain Matching (Fixed)

**Problem**: Organization name inconsistency caused missed notifications
- Customer: "Cognizant"
- Client: "cognizant" or "COGNIZANT Ltd"
- Result: No match, no notification ❌

**Solution**: Match by email domain instead of organization name

**Example**:
```
Customer: asha123@cognizant.com → domain: cognizant.com
Client 1: client@cognizant.com → domain: cognizant.com ✅ Match!
Client 2: client123@cognizant.com → domain: cognizant.com ✅ Match!
```

**Benefits**:
- ✅ Works with any organization name variation
- ✅ Case-insensitive
- ✅ All clients with same domain receive notifications

#### Backend Implementation
```javascript
// Extract customer email domain
const customerDomain = customerEmail.split('@')[1]; // e.g., "cognizant.com"

// Find all client users
const clientUsersFromDB = await req.db.collection('users').find({
  role: 'client'
}).toArray();

// Filter by matching email domain
clientUsersFromDB.forEach(user => {
  if (user.firebaseUid && user.email) {
    const clientDomain = user.email.split('@')[1];
    if (clientDomain.toLowerCase() === customerDomain.toLowerCase()) {
      clientUIDs.push(user.firebaseUid);
    }
  }
});

// Send notification to each matching client
for (const clientUID of clientUIDs) {
  await createNotification(req.db, {
    userId: clientUID,
    type: 'leave_request',
    title: 'New Leave Request - Approval Required',
    body: `${customerName} has requested leave from ${startDate} to ${endDate}. ${affectedTripsCount} trip(s) will be affected.`,
    priority: 'high',
    category: 'leave_management',
    data: { leaveRequestId, customerId, customerName, startDate, endDate, affectedTripsCount }
  });
}
```

### Fallback Notification System (Fixed)

**Problem**: Some users exist in Firebase Auth but not in MongoDB, causing silent notification failures.

**Solution**: Dual notification approach
1. **Try MongoDB-based notification** (via `createNotification()`)
2. **If fails, send directly to Firebase RTDB** (fallback)

```javascript
try {
  await createNotification(req.db, { userId: clientUID, ... });
} catch (error) {
  console.log('⚠️ MongoDB notification failed, using Firebase RTDB fallback');
  
  const notificationRef = admin.database().ref(`notifications/${clientUID}`).push();
  await notificationRef.set({
    id: notificationRef.key,
    userId: clientUID,
    type: 'leave_request',
    title: 'New Leave Request',
    body: '...',
    createdAt: new Date().toISOString()
  });
}
```

**Benefits**:
- ✅ Notifications always delivered
- ✅ Works even if user not in MongoDB
- ✅ No silent failures

---

## Customer Notifications

### Leave Approval/Rejection Notifications

**Flow**:
```
Customer Submits Leave Request
    ↓
Client Approves/Rejects
    ↓
Backend Sends Notification to Customer
    ↓
Customer Receives Notification
```

**Types**:
- `leave_approved` - Leave request approved
- `leave_rejected` - Leave request rejected

### Account Approval Notifications

**Flow**:
```
Customer Registers
    ↓
Admin Approves Account
    ↓
Backend Sends Notification to Customer
    ↓
Customer Receives Welcome Notification
```

---

## Technical Implementation

### Database Structures

#### MongoDB
```javascript
{
  _id: ObjectId("..."),
  userId: "user_firebase_uid",
  type: "leave_approved_admin",
  title: "Leave Request Approved - Action Required",
  body: "Leave request approved for Asha...",
  priority: "urgent",
  category: "leave_management",
  isRead: false,
  data: {
    leaveRequestId: "...",
    customerId: "...",
    customerName: "Asha",
    startDate: "2025-12-08T18:30:00.000Z",
    endDate: "2025-12-10T18:30:00.000Z",
    affectedTripsCount: 3
  },
  createdAt: ISODate("2025-12-05T10:20:53.000Z"),
  deliveryStatus: {
    mongodb: "success",
    firebaseRTDB: "success"
  }
}
```

#### Firebase RTDB
```json
{
  "notifications": {
    "user_firebase_uid": {
      "notification_id": {
        "id": "notification_id",
        "userId": "user_firebase_uid",
        "type": "leave_approved_admin",
        "title": "Leave Request Approved",
        "body": "Leave request approved...",
        "priority": "urgent",
        "isRead": false,
        "read": false,
        "createdAt": "2025-12-05T10:20:53.000Z",
        "data": { ... }
      }
    }
  }
}
```

### Frontend Implementation

#### Notification Badge (Dynamic Count)
```dart
Widget _buildNotificationBadge() {
  return Consumer<NotificationProvider>(
    builder: (context, provider, child) {
      return Stack(
        children: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () => Navigator.push(context, 
              MaterialPageRoute(builder: (_) => const NotificationsScreen())
            ),
          ),
          if (provider.unreadCount > 0)
            Positioned(
              right: 8, top: 8,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10)
                ),
                child: Text('${provider.unreadCount}'),
              ),
            ),
        ],
      );
    },
  );
}
```

#### Real-Time Listener
```dart
void _startRealtimeListener() {
  final currentUser = FirebaseAuth.instance.currentUser;
  if (currentUser == null) return;
  
  _notificationsRef = FirebaseDatabase.instance
      .ref('notifications/${currentUser.uid}');
  
  _notificationsSubscription = _notificationsRef!.onValue.listen((event) {
    if (event.snapshot.value != null) {
      final data = event.snapshot.value as Map<dynamic, dynamic>;
      
      setState(() {
        _notifications = data.entries.map((entry) {
          final notification = Map<String, dynamic>.from(entry.value as Map);
          notification['id'] = entry.key;
          return notification;
        }).toList();
        
        _notifications.sort((a, b) {
          final aTime = DateTime.parse(a['createdAt'] ?? '');
          final bTime = DateTime.parse(b['createdAt'] ?? '');
          return bTime.compareTo(aTime);
        });
        
        _updateUnreadCount();
      });
    }
  });
}
```

#### Mark as Read (Both Databases) - FIXED
```dart
Future<void> _markAsRead(String notificationId, int index) async {
  try {
    // Update MongoDB via backend API
    if (!notificationId.startsWith('-')) {
      await _notificationService.markAsRead(notificationId);
    }
    
    // ALSO update Firebase RTDB
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      final notifRef = FirebaseDatabase.instance
          .ref('notifications/${currentUser.uid}/$notificationId');
      await notifRef.update({'isRead': true, 'read': true});
    }
    
    setState(() {
      _notifications[index]['read'] = true;
      _notifications[index]['isRead'] = true;
      _unreadCount--;
    });
  } catch (e) {
    debugPrint('❌ Error marking notification as read: $e');
  }
}
```

#### Floating Notification
```dart
void _showFloatingNotification(Map<String, dynamic> notification) {
  final overlay = Overlay.of(context);
  final overlayEntry = OverlayEntry(
    builder: (context) => Positioned(
      top: 50, right: 20,
      child: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 350,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.orange, width: 2),
          ),
          child: Row(
            children: [
              Icon(Icons.notifications_active, color: Colors.orange),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(notification['title'] ?? 'Notification',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(notification['body'] ?? '',
                      maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.close),
                onPressed: () => overlayEntry.remove(),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  
  overlay.insert(overlayEntry);
  Future.delayed(const Duration(seconds: 5), () => overlayEntry.remove());
}
```

### Notification UI Features

#### Priority Colors
- **Urgent**: Red (#EF4444)
- **High**: Orange (#F59E0B)
- **Normal**: Blue (#2563EB)
- **Low**: Grey (#6B7280)

#### Notification Types & Icons
| Type | Icon | Color |
|------|------|-------|
| `leave_approved_admin` | 🚨 warning | Orange |
| `trip_cancelled` | 🚫 cancel_schedule_send | Red |
| `customer_registration` | 👤 person_add | Blue |
| `leave_request` | 🏖️ beach_access | Orange |
| `leave_approved` | ✅ check_circle | Green |
| `leave_rejected` | ❌ cancel | Red |
| `roster_assigned` | 📅 calendar_month | Blue |
| `sos_alert` | 🚨 emergency | Red |

#### Screen Features
- Real-time updates via Firebase RTDB
- Card-based UI with priority colors
- Unread indicator (blue background, dot)
- Time ago display (e.g., "5m ago", "2h ago")
- Filter dropdown (All/Unread/Read)
- "Mark as Read" button (shows when unread count > 0)
- "Mark All as Read" button
- Refresh button with sound
- Empty state messages
- Detailed notification dialog

---

## Fixes & Improvements

### Fix 1: Read Status Persistence ✅

**Problem**: Notifications reappeared as unread after logout/login

**Root Cause**: Only MongoDB was updated when marking as read, Firebase RTDB was not updated

**Solution**: Update BOTH databases when marking as read

**Before**:
```dart
// Only updated MongoDB
await _notificationService.markAsRead(notificationId);
```

**After**:
```dart
// Updates BOTH MongoDB AND Firebase RTDB
await _notificationService.markAsRead(notificationId);

await FirebaseDatabase.instance
    .ref('notifications/${currentUser.uid}/$notificationId')
    .update({'isRead': true, 'read': true});
```

**Result**: Notifications stay marked as read across sessions ✅

### Fix 2: Email Domain Matching ✅

**Problem**: Organization name inconsistency caused missed notifications

**Solution**: Match by email domain instead of organization name

**Result**: All clients with same email domain receive notifications ✅

### Fix 3: Customer Registration Cleanup ✅

**Problem**: Obsolete notifications stayed in list after customer approval

**Solution**: Automatically delete notifications from ALL admins when customer is approved/rejected

**Result**: Clean notification list, no confusion ✅

### Fix 4: Cancel Trip Dialog Layout ✅

**Problem**: Dialog had overflow errors and layout problems

**Solution**: 
- Changed to flexible height with `maxHeight` constraint
- Used `Expanded` widget for trips list
- Added empty state handling

**Result**: Dialog displays correctly without errors ✅

### Fix 5: Fallback Notification System ✅

**Problem**: Silent failures when user not in MongoDB

**Solution**: Try MongoDB first, fallback to Firebase RTDB if fails

**Result**: Notifications always delivered ✅

### Fix 6: Dynamic Badge Count ✅

**Problem**: Badge showing static count (was already working, false alarm)

**Verification**: Badge uses `Consumer<NotificationProvider>` and shows dynamic count from backend

**Result**: Badge updates in real-time ✅

---

## Testing Guide

### Test Scenarios

#### Test 1: Admin Leave Approval Notification
1. Login as customer, submit leave request
2. Login as client, approve leave request
3. Login as admin
4. **Expected**:
   - ✅ Notification bell shows badge
   - ✅ Notification appears in list with urgent priority
   - ✅ "Trip Cancellation" menu shows badge
   - ✅ Sound plays (if app is open)
   - ✅ Floating notification appears

#### Test 2: Admin Trip Cancellation Notification
1. Login as admin
2. Go to Trip Cancellation Management
3. Click "Cancel Trips" on a leave request
4. Confirm cancellation
5. **Expected**:
   - ✅ Success snackbar appears
   - ✅ Sound plays
   - ✅ Floating notification appears
   - ✅ Notification appears in list
   - ✅ Badge count updates

#### Test 3: Client Leave Request Notification
1. Login as customer (e.g., `asha123@cognizant.com`)
2. Submit leave request
3. Login as client (e.g., `client123@cognizant.com`)
4. **Expected**:
   - ✅ Notification bell shows badge
   - ✅ Notification appears in list
   - ✅ Sound plays (if app is open)
   - ✅ Floating notification appears

#### Test 4: Email Domain Matching
1. Register customers with different org names but same email domain
2. Have both submit leave requests
3. Login as client with same email domain
4. **Expected**:
   - ✅ Client receives notifications from BOTH customers

#### Test 5: Customer Registration Cleanup
1. Register a new customer
2. Verify admin receives notification
3. Approve the customer
4. **Expected**:
   - ✅ Notification disappears from admin's list
   - ✅ Badge count decreases
   - ✅ Notification deleted from all admins

#### Test 6: Read Status Persistence
1. Mark notification as read
2. Logout and login again
3. **Expected**:
   - ✅ Notification still marked as read
   - ✅ Badge count correct

#### Test 7: Real-Time Updates
1. Keep dashboard open
2. Have someone send a notification
3. **Expected**:
   - ✅ Badge updates immediately
   - ✅ Sound plays
   - ✅ Floating notification appears
   - ✅ No page refresh needed

### Test Scripts

```bash
cd abra_fleet_backend

# Admin notifications
node test-admin-leave-notification.js
node test-trip-cancellation-notification.js
node send-test-admin-notification.js
node check-admin-notifications.js

# Client notifications
node test-customer-leave-notification.js
node send-notification-to-specific-user.js
node test-approve-leave-notification.js
node check-client-users.js

# General
node check-firebase-notifications.js
node check-notification-userid.js
node check-user-roles.js
```

---

## Troubleshooting

### Issue: Admin not receiving notifications

**Check**:
1. Admin user has `role: 'admin'` in MongoDB
2. Admin has valid `firebaseUid`
3. Backend server is running
4. Check MongoDB for notification documents
5. Check Firebase RTDB for notification data

**Fix**:
```bash
node check-user-roles.js
node fix-admin-role.js  # If role is missing
```

### Issue: Client not receiving notifications

**Check**:
1. Customer and client have same email domain
2. Client user exists in database
3. Backend server is running
4. Check Firebase RTDB for notification data

**Debug**:
```bash
node check-customer-organization.js
node check-client-users.js
node send-notification-to-specific-user.js
```

### Issue: Notifications reappearing as unread

**Check**:
1. Both MongoDB and Firebase RTDB are being updated
2. Check console logs for Firebase update errors
3. Verify Firebase RTDB permissions

**Fix**: Ensure `_markAsRead()` updates both databases (already fixed)

### Issue: Badge not showing count

**Check**:
1. NotificationProvider is properly initialized
2. `fetchUnreadNotificationCount()` is being called
3. Check browser console for errors
4. Verify user is logged in

### Issue: Sound not playing

**Check**:
1. Notification settings (custom sound enabled)
2. Asset exists: `assets/Notification.mp3`
3. `pubspec.yaml` includes asset
4. Browser permissions for autoplay

### Issue: Floating notification not appearing

**Check**:
1. App is in foreground
2. Notification priority is high/urgent
3. Overlay is properly initialized
4. No errors in console

### Issue: Organization name mismatch

**Solution**: Email domain matching (already implemented)
- Matches by email domain instead of organization name
- Case-insensitive
- Works with any organization name variation

---

## API Reference

### Get Notifications
```
GET /api/notifications
Authorization: Bearer <firebase-token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 50)
- isRead: boolean (optional)
- type: string (optional)

Response:
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10
  }
}
```

### Mark as Read
```
PUT /api/notifications/:id/read
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All as Read
```
PUT /api/notifications/read-all
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Get Unread Count
```
GET /api/notifications/unread-count
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### Delete Notification
```
DELETE /api/notifications/:id
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Summary

### Key Features
✅ Real-time notifications via Firebase RTDB
✅ Dual-database synchronization (MongoDB + Firebase RTDB)
✅ Dynamic notification badge with unread count
✅ Email domain matching for organization notifications
✅ Fallback notification system
✅ Automatic cleanup of obsolete notifications
✅ Read status persistence across sessions
✅ Floating notifications with sound
✅ Priority-based styling
✅ Filter by read/unread status
✅ Mark as read (single and bulk)
✅ Cross-device sync

### Files Modified

**Backend**:
- `abra_fleet_backend/routes/roster_router.js`
- `abra_fleet_backend/routes/customer_approval_router.js`

**Frontend**:
- `abra_fleet/lib/features/admin/shell/admin_main_shell.dart`
- `abra_fleet/lib/features/client/client_main_shell.dart`
- `abra_fleet/lib/features/notifications/presentation/screens/notifications_screen.dart`
- `abra_fleet/lib/features/notifications/presentation/screens/client_notifications_screen.dart`
- `abra_fleet/lib/features/admin/leave_trip_management.dart`
- `abra_fleet/lib/core/services/client_notification_service.dart`
- `abra_fleet/lib/features/notifications/data/repositories/api_notification_repository_impl.dart`

### Test Scripts Created
- `test-admin-leave-notification.js`
- `test-trip-cancellation-notification.js`
- `send-test-admin-notification.js`
- `test-customer-leave-notification.js`
- `send-notification-to-specific-user.js`
- `test-approve-leave-notification.js`
- `check-firebase-notifications.js`
- `check-admin-notifications.js`
- `check-client-users.js`
- `check-customer-organization.js`
- `check-notification-userid.js`
- `check-user-roles.js`
- `fix-admin-role.js`

---

**Last Updated**: December 8, 2025
**Status**: ✅ Complete and Tested
**Version**: 2.0 (Consolidated)

