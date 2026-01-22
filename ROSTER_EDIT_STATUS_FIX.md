# Roster Edit Status Fix

## Problem
When trying to update a roster, you received this error:
```
❌ PUT Error: ApiException: Cannot update roster that is already assigned or in progress (Status: 400)
```

## Root Cause
The **backend** only allows editing rosters with these statuses:
- `pending_assignment`
- `pending`
- `created`

But the **frontend** was allowing users to click "Edit" on rosters with status `assigned`, which the backend rejects.

## Solution Applied

### 1. Fixed Frontend Status Check
**File:** `abra_fleet/lib/features/customer/dashboard/presentation/screens/my_trips_screen.dart`

**Changed:**
```dart
// OLD - Incorrectly allowed editing 'assigned' rosters
bool _canEditTrip(String status) {
  final editableStatuses = ['pending_assignment', 'assigned', 'pending'];
  return editableStatuses.contains(status.toLowerCase());
}
```

**To:**
```dart
// NEW - Only allows editing rosters that backend accepts
bool _canEditTrip(String status) {
  final editableStatuses = ['pending_assignment', 'pending', 'created'];
  return editableStatuses.contains(status.toLowerCase());
}
```

### 2. Added User-Friendly Error Message
Added validation in `_handleUpdateRoster()` to show a helpful message if someone tries to edit a non-editable roster:

```dart
if (!editableStatuses.contains(status.toLowerCase())) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(
        'Cannot edit roster that is already ${status.replaceAll('_', ' ')}. '
        'Please contact admin if changes are needed.',
      ),
      backgroundColor: Colors.orange,
    ),
  );
  return;
}
```

## What This Means

### Rosters You CAN Edit:
- ✅ **Pending Assignment** - Not yet assigned to a driver
- ✅ **Pending** - Awaiting approval
- ✅ **Created** - Just created

### Rosters You CANNOT Edit:
- ❌ **Assigned** - Already assigned to a driver
- ❌ **In Progress** - Trip is currently happening
- ❌ **Completed** - Trip is finished

### Why This Restriction?
Once a roster is assigned to a driver, they may have already planned their route, notified passengers, or started the trip. Allowing edits at that point could cause confusion and operational issues.

## Testing
1. Restart your Flutter app
2. Go to "My Trips"
3. Try to edit a roster:
   - **Pending rosters** → Edit button should work
   - **Assigned rosters** → Edit button should be hidden/disabled
   - If you somehow trigger edit on assigned roster → You'll see the friendly error message

## If You Need to Edit Assigned Rosters
Contact your admin. They may be able to:
1. Unassign the roster
2. Make the changes
3. Reassign it

Or create a new roster with the correct details.
