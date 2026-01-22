# Seat Capacity Management - Quick Start Guide

## What Was Implemented

✅ **Vehicle Seat Capacity Tracking**
- Each vehicle tracks total seats, driver seat, and assigned customers
- Real-time calculation of available seats
- Example: 4-seat vehicle with driver = 3 customer seats available

✅ **Visual Seat Indicators**
- Compact view: `🪑 2/4` (available/total)
- Detailed view: Shows all seats with icons
- Color-coded: Blue (driver), Orange (occupied), Green (available)

✅ **Assignment Validation**
- Prevents over-assignment with popup message
- Checks: Driver assigned, Vehicle active, Sufficient seats
- Shows before/after preview

✅ **Assignment Dialog**
- Select vehicle from list
- See capacity for each vehicle
- Visual preview of seat changes
- Confirmation before assignment

## How It Works

### Scenario 1: Vehicle with 4 Seats
```
Total Seats: 4
Driver: 1 seat (John Doe)
Customers: 0
Available: 3 seats ✅
```

### Scenario 2: After Assigning 2 Customers
```
Total Seats: 4
Driver: 1 seat (John Doe)
Customers: 2 seats
Available: 1 seat ✅
```

### Scenario 3: Try to Assign 3 More (BLOCKED)
```
Requested: 3 customers
Available: 1 seat
Result: ❌ POPUP MESSAGE
"Cannot assign 3 customer(s). Only 1 seat(s) available."
```

## Key Files Created

1. **`vehicle_entity.dart`** (Updated)
   - Added `seatCapacity` and `assignedCustomers` fields
   - Added capacity calculation methods

2. **`seat_capacity_service.dart`** (New)
   - Validates assignments
   - Calculates available seats
   - Generates user-friendly messages

3. **`seat_capacity_indicator.dart`** (New)
   - Visual widget showing seat status
   - Compact and detailed modes
   - Before/after preview dialog

4. **`roster_assignment_dialog.dart`** (New)
   - Complete assignment UI
   - Vehicle selection with capacity check
   - Validation and confirmation

## How to Use

### 1. Display Seat Capacity (Compact)

```dart
// In vehicle list
SeatCapacityIndicator(
  vehicle: vehicle,
  compact: true,
)
```

### 2. Display Seat Capacity (Detailed)

```dart
// In vehicle details
SeatCapacityIndicator(
  vehicle: vehicle,
  showDetails: true,
)
```

### 3. Validate Before Assignment

```dart
final validation = SeatCapacityService.validateAssignment(
  vehicle: vehicle,
  customerCount: 3,
);

if (!validation['valid']) {
  // Show error popup
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Cannot Assign'),
      content: Text(validation['message']),
    ),
  );
}
```

### 4. Show Assignment Dialog

```dart
showDialog(
  context: context,
  builder: (context) => RosterAssignmentDialog(
    selectedRosters: selectedRosters,
    availableVehicles: vehicles,
    onAssign: (vehicleId, rosterIds) {
      // Handle assignment
      assignRostersToVehicle(vehicleId, rosterIds);
    },
  ),
);
```

## Integration with Pending Rosters Screen

Add this to your pending rosters screen:

```dart
// 1. Add bulk action button
Widget _buildBulkActionButton() {
  return Positioned(
    bottom: 20,
    right: 20,
    child: FloatingActionButton.extended(
      onPressed: _showAssignmentDialog,
      icon: const Icon(Icons.directions_car),
      label: Text('Assign ${_selectedRosterIds.length} Rosters'),
    ),
  );
}

// 2. Show assignment dialog
Future<void> _showAssignmentDialog() async {
  // Load vehicles
  final vehiclesResponse = await VehicleService().getVehicles();
  final vehicles = (vehiclesResponse['data'] as List)
      .map((v) => Vehicle.fromJson(v))
      .toList();
  
  // Get selected rosters
  final selectedRosters = _filteredRosters
      .where((r) => _selectedRosterIds.contains(r['id'] ?? r['_id']))
      .toList();
  
  // Show dialog
  showDialog(
    context: context,
    builder: (context) => RosterAssignmentDialog(
      selectedRosters: selectedRosters,
      availableVehicles: vehicles,
      onAssign: _handleAssignment,
    ),
  );
}

// 3. Handle assignment
Future<void> _handleAssignment(String vehicleId, List<String> rosterIds) async {
  final result = await VehicleService().assignRostersToVehicle(
    vehicleId: vehicleId,
    rosterIds: rosterIds,
  );
  
  if (result['success']) {
    setState(() => _selectedRosterIds.clear());
    await _loadPendingRosters();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Successfully assigned ${rosterIds.length} rosters'),
        backgroundColor: Colors.green,
      ),
    );
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(result['message'] ?? 'Assignment failed'),
        backgroundColor: Colors.red,
      ),
    );
  }
}
```

## Backend API Endpoint

Add this to your backend:

```javascript
// routes/roster_router.js
router.post('/assign-vehicle', verifyToken, async (req, res) => {
  const { vehicleId, rosterIds } = req.body;
  
  // Get vehicle
  const vehicle = await req.db.collection('vehicles').findOne({
    _id: new ObjectId(vehicleId)
  });
  
  // Validate capacity
  const currentCustomers = vehicle.assignedCustomers || 0;
  const seatCapacity = vehicle.capacity?.passengers || 4;
  const hasDriver = vehicle.assignedDriver ? 1 : 0;
  const available = seatCapacity - hasDriver - currentCustomers;
  
  if (rosterIds.length > available) {
    return res.status(400).json({
      success: false,
      message: `Insufficient seats. Available: ${available}, Requested: ${rosterIds.length}`
    });
  }
  
  // Update vehicle
  await req.db.collection('vehicles').updateOne(
    { _id: new ObjectId(vehicleId) },
    { $inc: { assignedCustomers: rosterIds.length } }
  );
  
  // Update rosters
  await req.db.collection('rosters').updateMany(
    { _id: { $in: rosterIds.map(id => new ObjectId(id)) } },
    { $set: { vehicleId: vehicleId, status: 'assigned' } }
  );
  
  res.json({ success: true });
});
```

## Testing

Test these scenarios:

1. ✅ Vehicle with no driver → Cannot assign (shows error)
2. ✅ Vehicle with 4 seats, 1 driver → Can assign 3 customers
3. ✅ Try to assign 5 to 4-seat vehicle → Shows popup error
4. ✅ Visual shows correct seat count before/after
5. ✅ Backend validates and rejects over-capacity

## Error Messages You'll See

- "Vehicle must have an assigned driver before assigning customers."
- "Vehicle is not active. Status: Maintenance"
- "Insufficient seats. Requested: 5, Available: 2"
- "Cannot assign 5 customer(s). Only 2 seat(s) available."

## Next Steps

1. Add the backend API endpoint
2. Integrate the assignment dialog into your pending rosters screen
3. Test with different vehicle capacities
4. Add unassignment functionality (optional)

## Need Help?

See the full guide: `SEAT_CAPACITY_IMPLEMENTATION_GUIDE.md`
