# Vehicle Seat Capacity Display Fix

## Problem Identified

The vehicle KA01AB1234 was showing incorrect seat capacity:
- **Vehicle List**: Shows "40 seats" ✅ (Correct)
- **Assigned Customers Dialog**: Shows "4/0 seats" ❌ (Wrong - should be "4/40 seats")

### Root Cause

The backend was reading seat capacity from the wrong field. Vehicles in the database have capacity stored in different fields:
- `vehicle.capacity.passengers` = 40 (the correct field)
- `vehicle.seatingCapacity` = undefined or 0
- `vehicle.seatCapacity` = undefined or 0

The backend was checking fields in the wrong order, prioritizing `seatingCapacity` first, which returned 0.

## Solution Applied

### Backend Changes

Updated 4 locations in the backend to prioritize the correct field order:

#### 1. `/api/admin/vehicles/:id/assigned-customers` endpoint
**File**: `abra_fleet_backend/routes/admin-vehicles.js` (line ~1031)

```javascript
// OLD CODE:
const totalSeats = vehicle.seatingCapacity || 0;

// NEW CODE:
const totalSeats = vehicle.capacity?.passengers || 
                   vehicle.seatCapacity || 
                   vehicle.seatingCapacity || 
                   0;
```

#### 2. Vehicle List Normalization
**File**: `abra_fleet_backend/routes/admin-vehicles.js` (line ~344)

```javascript
// OLD CODE:
populatedVehicle.seatCapacity = vehicle.seatCapacity || 
                               vehicle.seatingCapacity || 
                               4;

// NEW CODE:
populatedVehicle.seatCapacity = vehicle.capacity?.passengers || 
                               vehicle.seatCapacity || 
                               vehicle.seatingCapacity || 
                               4;
```

#### 3. Route Optimization - Capacity Check 1
**File**: `abra_fleet_backend/routes/route_optimization_router.js` (line ~504)

```javascript
// OLD CODE:
const totalSeats = vehicle.seatCapacity || vehicle.seatingCapacity || 4;

// NEW CODE:
const totalSeats = vehicle.capacity?.passengers || 
                   vehicle.seatCapacity || 
                   vehicle.seatingCapacity || 
                   4;
```

#### 4. Route Optimization - Capacity Check 2
**File**: `abra_fleet_backend/routes/route_optimization_router.js` (line ~977)

```javascript
// OLD CODE:
const totalSeats = vehicle.seatCapacity || vehicle.seatingCapacity || 4;

// NEW CODE:
const totalSeats = vehicle.capacity?.passengers || 
                   vehicle.seatCapacity || 
                   vehicle.seatingCapacity || 
                   4;
```

## How It Works Now

### Correct Seat Calculation

For a vehicle with 40 total seats:
1. **Total Seats**: 40 (from `capacity.passengers`)
2. **Driver Seat**: 1 (if driver is assigned)
3. **Assigned Customers**: 3 (Divya Reddy, Karan Mehta, Anjali Desai)
4. **Occupied Seats**: 4 (1 driver + 3 customers)
5. **Available Seats**: 36 (40 - 4)

### Display Format

The dialog will now show:
- **"4/40 seats"** (4 occupied out of 40 total) ✅
- **Capacity breakdown**:
  - Driver: 1 seat
  - Customers: 3 seats
  - Available: 36 seats

## Testing

### 1. Restart Backend
```bash
# Stop the backend if running
# Then restart it
cd abra_fleet_backend
node index.js
```

### 2. Test in UI
1. Go to **Vehicle Master**
2. Find vehicle **KA01AB1234**
3. Click on the **"40 seats"** link or customer count
4. Verify the dialog shows **"4/40 seats"** (not "4/0 seats")
5. Verify the capacity breakdown shows:
   - Driver: 1
   - Customers: 3
   - Available: 36

### 3. Test with Other Vehicles
Repeat the same test with other vehicles to ensure they all show correct capacity.

## Benefits

1. **Accurate Capacity Display**: Shows real-time seat availability
2. **Better Decision Making**: Admins can see exactly how many seats are available
3. **Prevents Overbooking**: System correctly calculates available seats
4. **Consistent Data**: All endpoints now use the same field priority

## Real-Time Application

When a vehicle has 40 seats and only 4 are filled (1 driver + 3 customers):
- **36 seats remain available** for assignment
- These seats can be assigned to other customers
- The system will prevent assigning more than 36 additional customers
- Route optimization will correctly consider the 36 available seats

## Next Steps

1. ✅ Backend code updated
2. ⏳ Restart backend server
3. ⏳ Test in UI
4. ⏳ Verify with multiple vehicles
5. ⏳ Test route optimization with correct capacity

## Notes

- The frontend code is already correct - it displays whatever the backend sends
- No frontend changes needed
- The fix is backward compatible - works with all field variations
- Default fallback is 4 seats if no capacity field is found
