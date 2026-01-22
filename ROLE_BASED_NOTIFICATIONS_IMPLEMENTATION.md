# Role-Based Notifications Implementation

## Overview
Implemented separate notification screens for each user role to provide role-specific notification filtering and better user experience.

## File Structure

```
abra_fleet/lib/features/notifications/presentation/screens/
├── admin_notifications_screen.dart          ✅ NEW - Admin notifications
├── customer_notifications_screen.dart       ✅ NEW - Customer notifications  
├── driver_notifications_screen.dart         ✅ NEW - Driver notifications
├── client_notifications_screen.dart         ✅ EXISTS - Client notifications
└── notifications_screen.dart                ⚠️  OLD - Generic (to be deprecated)
```

## Notification Types by Role

### 1. Admin Notifications (`admin_notifications_screen.dart`)
**Route:** `/admin/notifications`

**Notification Types:**
- `trip_cancelled` - Trip cancellations requiring attention
- `sos_alert` - Emergency SOS alerts from drivers/customers
- `driver_report` - Driver incident reports
- `vehicle_maintenance` - Vehicle maintenance alerts
- `roster_pending` - Pending roster assignments
- `customer_registration` - New customer registrations
- `document_expired` - Expired documents (driver/vehicle)
- `document_expiring_soon` - Documents expiring soon
- `leave_request_pending` - Leave requests awaiting approval
- `address_change_request` - Address change requests

**Icons:**
- 🚨 SOS Alert (red)
- ❌ Trip Cancelled (orange)
- 🔧 Vehicle Maintenance (blue)
- 📄 Document Issues (amber/red)
- ➕ Customer Registration (green)
- ⏳ Pending Actions (purple)

---

### 2. Customer Notifications (`customer_notifications_screen.dart`)
**Route:** `/customer/notifications`

**Notification Types:**
- `route_assigned` - Route/trip assigned to customer
- `roster_assigned` - Roster assigned
- `roster_assignment_updated` - Roster details updated
- `leave_approved` - Leave request approved
- `leave_rejected` - Leave request rejected
- `trip_updated` - Trip details changed
- `trip_cancelled` - Trip cancelled
- `pickup_reminder` - Pickup time reminder
- `address_change_approved` - Address change approved
- `address_change_rejected` - Address change rejected

**Icons:**
- 🚗 Route/Roster Assigned (green)
- 🔄 Updates (blue/orange)
- ✅ Approved (green)
- ❌ Rejected/Cancelled (red)
- ⏰ Reminders (purple)
- 📍 Address Changes (green/red)

---

### 3. Driver Notifications (`driver_notifications_screen.dart`)
**Route:** `/driver/notifications`

**Notification Types:**
- `route_assigned` - New route assigned
- `roster_assigned` - Roster/shift assigned
- `trip_cancelled` - Trip cancelled
- `trip_updated` - Trip details updated
- `shift_reminder` - Shift start reminder
- `document_expiring_soon` - License/documents expiring
- `document_expired` - Documents expired
- `vehicle_assigned` - Vehicle assigned
- `emergency_alert` - Emergency situations

**Icons:**
- 🛣️ Route Assigned (green)
- ❌ Cancelled (red)
- 🔄 Updated (orange)
- ⏰ Shift Reminder (blue)
- ⚠️ Document Expiring (amber)
- 🚨 Emergency (red)
- 🚗 Vehicle Assigned (teal)

---

### 4. Client Notifications (`client_notifications_screen.dart`)
**Route:** `/client/notifications` (already exists)

**Notification Types:**
- Organization-level notifications
- Billing alerts
- Contract updates
- Roster summaries
- Leave request summaries
- Customer registration notifications

---

## Implementation Details

### Common Features (All Screens)

1. **Real-time Updates**
   - Firebase Realtime Database listener
   - Automatic UI updates on new notifications

2. **Unread Badge**
   - Red badge showing unread count
   - Updates in real-time

3. **Mark as Read**
   - Individual notification tap
   - "Mark all as read" button

4. **Pull to Refresh**
   - Swipe down to reload notifications

5. **Empty State**
   - Friendly message when no notifications
   - Role-specific guidance text

6. **Error Handling**
   - Retry button on errors
   - Clear error messages

### Filtering Logic

Each screen filters notifications by checking the `type` field:

```dart
// Example from customer_notifications_screen.dart
static const List<String> _customerNotificationTypes = [
  'route_assigned',
  'roster_assigned',
  'roster_assignment_updated',
  // ... more types
];

_notifications = notifications
    .where((notification) {
      final type = notification['type']?.toString() ?? '';
      return _customerNotificationTypes.contains(type);
    })
    .toList();
```

---

## Integration Guide

### Step 1: Update Navigation Routes

Add routes to your navigation configuration:

```dart
// For Customer
GoRoute(
  path: '/customer/notifications',
  builder: (context, state) => const CustomerNotificationsScreen(),
),

// For Driver
GoRoute(
  path: '/driver/notifications',
  builder: (context, state) => const DriverNotificationsScreen(),
),

// For Admin
GoRoute(
  path: '/admin/notifications',
  builder: (context, state) => const AdminNotificationsScreen(),
),
```

### Step 2: Update Shell Navigation

Update each role's main shell to use the correct notification screen:

**Customer Shell:**
```dart
IconButton(
  icon: const Icon(Icons.notifications),
  onPressed: () => context.push('/customer/notifications'),
)
```

**Driver Shell:**
```dart
IconButton(
  icon: const Icon(Icons.notifications),
  onPressed: () => context.push('/driver/notifications'),
)
```

**Admin Shell:**
```dart
IconButton(
  icon: const Icon(Icons.notifications),
  onPressed: () => context.push('/admin/notifications'),
)
```

### Step 3: Update Notification Badge

Each shell should show unread count for that role's notifications:

```dart
// Example for customer
StreamBuilder<int>(
  stream: _notificationService.getUnreadCountStream(
    types: CustomerNotificationsScreen._customerNotificationTypes,
  ),
  builder: (context, snapshot) {
    final count = snapshot.data ?? 0;
    return Badge(
      label: Text('$count'),
      isLabelVisible: count > 0,
      child: const Icon(Icons.notifications),
    );
  },
)
```

---

## Testing Checklist

### For Each Role:

- [ ] Navigate to notifications screen
- [ ] Verify only role-specific notifications appear
- [ ] Check unread badge count is accurate
- [ ] Tap notification to mark as read
- [ ] Use "Mark all as read" button
- [ ] Pull to refresh
- [ ] Verify real-time updates work
- [ ] Check empty state displays correctly
- [ ] Test error handling (disconnect backend)
- [ ] Verify icons and colors are appropriate

---

## Backend Requirements

Ensure your backend sends notifications with correct `type` field:

```javascript
// Example: Sending customer notification
await createNotification({
  userId: customerId,
  type: 'route_assigned',  // Must match screen filter
  title: '🚗 Your Ride is Confirmed!',
  body: 'Driver: John Doe\nVehicle: KA01AB1234',
  priority: 'high',
  category: 'roster',
});
```

---

## Migration from Old Screen

The old `notifications_screen.dart` was filtering for admin types but being used by all roles. 

**Action Items:**
1. ✅ Create role-specific screens (DONE)
2. ⏳ Update navigation to use new screens
3. ⏳ Update shell navigation buttons
4. ⏳ Test each role thoroughly
5. ⏳ Remove/deprecate old `notifications_screen.dart`

---

## Benefits

✅ **Better UX** - Users see only relevant notifications  
✅ **Cleaner Code** - No complex conditional logic  
✅ **Easier Maintenance** - Changes to one role don't affect others  
✅ **Better Performance** - Fetch only relevant data  
✅ **Clear Separation** - Security and role boundaries enforced  

---

## Next Steps

1. Update your navigation configuration to use the new screens
2. Update each role's shell to navigate to their specific screen
3. Test thoroughly with each role
4. Remove debug logs once confirmed working
5. Deprecate the old generic `notifications_screen.dart`

---

## Quick Reference

| Role     | Screen File                          | Route                    |
|----------|--------------------------------------|--------------------------|
| Admin    | `admin_notifications_screen.dart`    | `/admin/notifications`   |
| Customer | `customer_notifications_screen.dart` | `/customer/notifications`|
| Driver   | `driver_notifications_screen.dart`   | `/driver/notifications`  |
| Client   | `client_notifications_screen.dart`   | `/client/notifications`  |

---

**Created:** December 12, 2025  
**Status:** ✅ Screens Created - Integration Pending
