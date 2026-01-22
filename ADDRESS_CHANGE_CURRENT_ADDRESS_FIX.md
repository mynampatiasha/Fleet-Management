# Address Change - Current Address Loading Fix

## Problem
The address change request screen was showing "Not set" for current pickup and drop addresses instead of loading the customer's actual addresses.

## Root Cause
The screen was trying to call `/api/roster/customer/my-rosters` endpoint which:
1. Returns rosters created by the user (not rosters assigned to them)
2. Has a complex data structure that doesn't directly expose pickup/drop locations
3. Was designed for a different purpose (roster management, not address retrieval)

## Solution
Created a dedicated endpoint specifically for fetching customer's current addresses.

### Backend Changes

#### New Endpoint: GET `/api/address-change/customer/current-addresses`

**File**: `abra_fleet_backend/routes/address_change_router.js`

**Purpose**: Get customer's current pickup and drop addresses from their profile and latest roster

**Logic**:
1. Fetch customer record from `customers` collection
2. Fetch latest assigned roster from `rosters` collection
3. Return addresses with priority: roster addresses > customer profile addresses

**Response Format**:
```json
{
  "success": true,
  "data": {
    "pickupLocation": "123 Main Street, City",
    "dropLocation": "456 Office Park, City",
    "pickupLat": 12.9716,
    "pickupLng": 77.5946,
    "dropLat": 12.9352,
    "dropLng": 77.6245
  }
}
```

### Frontend Changes

#### Updated RosterService

**File**: `abra_fleet/lib/core/services/roster_service.dart`

**Changed Method**:
- Renamed: `getCustomerRosters()` → `getCurrentAddresses()`
- New endpoint: `/api/address-change/customer/current-addresses`
- Simpler response handling

**Before**:
```dart
Future<Map<String, dynamic>> getCustomerRosters() async {
  final response = await _apiService.get('/api/roster/customer/my-rosters');
  return response;
}
```

**After**:
```dart
Future<Map<String, dynamic>> getCurrentAddresses() async {
  final response = await _apiService.get('/api/address-change/customer/current-addresses');
  return response;
}
```

#### Updated Address Change Request Screen

**File**: `abra_fleet/lib/features/customer/dashboard/presentation/screens/address_change_request_screen.dart`

**Changed Method**: `_loadCurrentAddresses()`

**Before**:
```dart
final response = await _rosterService.getCustomerRosters();
if (response['success'] == true && response['data'] != null) {
  final rosters = response['data'] as List;
  if (rosters.isNotEmpty) {
    final latestRoster = rosters.first;
    setState(() {
      _currentPickupAddress = latestRoster['pickupLocation'] ?? '';
      _currentDropAddress = latestRoster['dropLocation'] ?? '';
    });
  }
}
```

**After**:
```dart
final response = await _rosterService.getCurrentAddresses();
if (response['success'] == true && response['data'] != null) {
  final data = response['data'];
  setState(() {
    _currentPickupAddress = data['pickupLocation'] ?? 'Not set';
    _currentDropAddress = data['dropLocation'] ?? 'Not set';
  });
}
```

**Improvements**:
1. Direct data access (no list iteration)
2. Clearer error handling
3. Default "Not set" values
4. Proper mounted checks

## Testing

### Manual Testing Steps

1. **Start Backend**:
   ```bash
   cd abra_fleet_backend
   node index.js
   ```

2. **Run Flutter App**:
   ```bash
   cd abra_fleet
   flutter run
   ```

3. **Test Flow**:
   - Login as a customer who has existing rosters
   - Navigate to "My Trips" → Menu → "Change Address"
   - Verify current addresses are displayed correctly
   - If no addresses exist, should show "Not set"

### API Testing

Use the test script:
```bash
cd abra_fleet_backend
node test-current-addresses.js
```

(Update the `CUSTOMER_TOKEN` in the script with a valid Firebase token)

## Data Flow

```
Customer Opens Screen
        ↓
_loadCurrentAddresses() called
        ↓
RosterService.getCurrentAddresses()
        ↓
GET /api/address-change/customer/current-addresses
        ↓
Backend queries:
  1. customers collection (by firebaseUid)
  2. rosters collection (latest assigned)
        ↓
Returns merged address data
        ↓
Screen displays current addresses
```

## Benefits

1. **Dedicated Endpoint**: Purpose-built for address retrieval
2. **Simpler Logic**: No complex data transformation needed
3. **Better Performance**: Direct queries, no unnecessary data
4. **Fallback Support**: Uses roster addresses if available, falls back to customer profile
5. **Clear Error Handling**: Proper error states and default values

## Files Modified

### Backend:
- ✅ `abra_fleet_backend/routes/address_change_router.js` - Added new endpoint

### Frontend:
- ✅ `abra_fleet/lib/core/services/roster_service.dart` - Updated method
- ✅ `abra_fleet/lib/features/customer/dashboard/presentation/screens/address_change_request_screen.dart` - Updated loading logic

### Testing:
- ✅ `abra_fleet_backend/test-current-addresses.js` - New test script

## Status
✅ **FIXED** - Current addresses now load correctly from customer profile and latest roster
