# How to See Driver Phone and Login/Logout Times in Notifications

## Issue
The existing notifications in your database were created with the OLD code that didn't include driver phone numbers and login/logout times. The dialog is working correctly, but there's no data to display.

## Solution
You need to create a NEW notification to see the new fields.

## Steps to Test

### 1. Restart the Backend
The backend code has been updated, so restart it to load the changes:

```bash
cd abra_fleet_backend
# Stop the current backend (Ctrl+C if running)
node index.js
```

### 2. Create a New Roster Assignment

**Option A: From Admin Panel (Recommended)**
1. Login as admin
2. Go to "Pending Rosters" or "Customer Management"
3. Assign a roster to a vehicle with a driver
4. The customer will receive a NEW notification with all the data

**Option B: Use the Test Script**
```bash
cd abra_fleet_backend
node test-roster-assignment-notifications.js
```

### 3. Check the Notification

1. Login as the customer (e.g., asha123@cognizant.com)
2. Go to "My Notifications"
3. Tap on the NEW notification
4. You should now see:
   - **DRIVERPHONE**: +91-XXXXXXXXXX
   - **LOGINTIME**: 08:30 AM
   - **LOGOUTTIME**: 06:00 PM
   - **LOGINLOCATION**: Electronic City, Bangalore
   - **LOGOUTLOCATION**: Whitefield, Bangalore

## What Was Changed

### Backend Files Updated:
1. **`abra_fleet_backend/routes/roster_router.js`**
   - Line ~4172: Added driver phone and times to `roster_assigned` notifications
   - Line ~5014: Added driver phone and times to batch assignment notifications
   - Line ~5069: Added driver phone and times to notification data

2. **`abra_fleet_backend/routes/route_optimization_router.js`**
   - Line ~1210: Added driver phone and times to route optimization notifications

### Frontend Files (Already Working):
- `abra_fleet/lib/features/notifications/presentation/screens/customer_notifications_screen.dart`
- `abra_fleet/lib/features/notifications/presentation/screens/admin_notifications_screen.dart`
- `abra_fleet/lib/features/notifications/presentation/screens/driver_notifications_screen.dart`

All three screens have the `_showNotificationDetails()` dialog that displays ALL data fields.

## Why Old Notifications Don't Show This Data

The old notifications were created before we added these fields to the backend code. They look like this:

```json
{
  "driverName": "Vikyath M",
  "vehicleName": "KA01AB1234",
  "pickupSequence": 1,
  "totalStops": 1,
  "action": "route_assignment"
}
```

New notifications will look like this:

```json
{
  "rosterId": "693beb7c81c5874ddf5c8aac",
  "driverName": "Vikyath M",
  "driverPhone": "+91-9876543210",
  "vehicleName": "KA01AB1234",
  "pickupSequence": 1,
  "totalStops": 1,
  "loginTime": "08:30 AM",
  "logoutTime": "06:00 PM",
  "loginLocation": "Electronic City, Bangalore",
  "logoutLocation": "Whitefield, Bangalore",
  "action": "route_assignment"
}
```

## Quick Test Command

To verify the backend is sending the right data:

```bash
cd abra_fleet_backend
node check-notification-data.js
```

This will show you the structure of recent notifications. After creating a new assignment, run this again to see the new fields.

## Status

✅ Frontend: Dialog implementation complete
✅ Backend: Notification data updated
⏳ Testing: Need to create new roster assignment to see the data

## Next Steps

1. Restart backend
2. Assign a roster from admin panel
3. Check notification as customer
4. Verify all fields are displayed in the dialog
