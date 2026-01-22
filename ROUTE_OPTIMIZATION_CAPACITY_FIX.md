# Route Optimization Capacity Fix

## Problem
Route optimization was failing with error: "No suitable vehicle found with sufficient capacity"

### Root Causes
1. **Inconsistent capacity field names** in vehicle data:
   - Some vehicles use `capacity.passengers` (e.g., 3 seats)
   - Other vehicles use `capacity.seating` (e.g., 40 seats)
   - The code was only checking `capacity.passengers`, missing vehicles with `capacity.seating`

2. **No status filtering**:
   - Code was checking ALL vehicles including MAINTENANCE status
   - Should only consider ACTIVE vehicles

### Example from Your Data
```json
// Vehicle 1 - Was being checked
{
  "capacity": {"passengers": 3, "luggage": 0},
  "status": "ACTIVE"
}

// Vehicle 6 - Was being IGNORED (capacity.seating not checked)
{
  "capacity": {"seating": 40, "standing": 20},
  "status": "ACTIVE",
  "assignedDriver": {"name": "John Smith"}
}
```

## Solution Applied

### 1. Enhanced Capacity Parsing
**File**: `abra_fleet/lib/core/services/route_optimization_service.dart`

```dart
// OLD CODE - Only checked passengers
capacity = vehicle['capacity']['passengers'] ?? vehicle['capacity']['seating'] ?? 4;

// NEW CODE - Checks passengers, seating, AND standing
capacity = capacityMap['passengers'] ?? 
          capacityMap['seating'] ?? 
          capacityMap['standing'] ?? 
          4;
```

### 2. Added Status Filtering
```dart
// Skip non-active vehicles
final status = vehicle['status']?.toString().toUpperCase() ?? 'UNKNOWN';
if (status != 'ACTIVE') {
  debugPrint('🚗 Skipping vehicle: $vehicleName (Status: $status)');
  continue;
}
```

## Available Vehicles (After Fix)

From your database, these vehicles should now work:

| Vehicle | Seats | Driver | Status | Will Work? |
|---------|-------|--------|--------|------------|
| KA05GH9012 | 3 | John Doe | ACTIVE | ❌ (only 3 seats, need 4) |
| MH12EF5678 | 7 | None | MAINTENANCE | ❌ (maintenance) |
| KA02CD5678 | 12 | None | ACTIVE | ❌ (no driver) |
| KA01AB1234 | 40 | None | ACTIVE | ❌ (no driver) |
| **KA01AB1235** | **20** | **John Doe** | **ACTIVE** | **✅ YES!** |
| **KA01AB1240** | **40** | **John Smith** | **ACTIVE** | **✅ YES!** |
| KA10CD5678 | 15 | None | ACTIVE | ❌ (no driver) |

## Testing

### CRITICAL: You MUST fully restart the app!

**Hot reload will NOT work** for service class changes. You must:

1. **Stop the app completely** (click the red stop button in your IDE)
2. **Start the app again** (run/debug)
3. Wait for app to fully load
4. Go to Pending Rosters screen
5. Click "Route Optimization"
6. Enter "4" customers
7. Should now find Vehicle KA01AB1235 (20 seats) or KA01AB1240 (40 seats)

### How to verify the fix is loaded:
Look for these NEW debug messages in console:
```
🚗 Skipping vehicle: MH12EF5678 (Status: MAINTENANCE)
🚗 Checking vehicle: KA01AB1235
   Raw capacity data: {passengers: 20, luggage: 0}
   Parsed capacity: 20
   Has Driver: true
   Available seats: 19
```

If you DON'T see these messages, the old code is still running!

## Expected Output
```
🚗 STEP 2: LOADING AVAILABLE VEHICLES
✅ VEHICLES LOADED: 7 total

🎯 STEP 3: FINDING BEST VEHICLE
🚗 Skipping vehicle: MH12EF5678 (Status: MAINTENANCE)
🚗 Checking vehicle: KA01AB1235
   Parsed capacity: 20
   Has Driver: true
   Available seats: 19
   Need: 4 seats
   ✅ New best vehicle!

✅ BEST VEHICLE FOUND:
   - Name: KA01AB1235
   - Driver: John Doe
   - Seat Capacity: 20
```

## Next Steps

If it still fails:
1. Check if vehicles have `assignedDriver` populated
2. Verify vehicle status is "ACTIVE" (not "active" or "Active")
3. Run backend check: `node abra_fleet_backend/check-vehicles-for-optimization.js`
