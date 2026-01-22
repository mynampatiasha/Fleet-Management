# Vehicle Seat Capacity Management Implementation Guide

## Overview
This guide explains the implementation of vehicle seat capacity management for roster assignments in the Abra Fleet Management system.

## Features Implemented

### 1. **Seat Capacity Tracking**
- Each vehicle has a `seatCapacity` field (e.g., 4 seats)
- Driver occupies 1 seat when assigned
- Remaining seats available for customers
- Real-time tracking of assigned customers

### 2. **Capacity Calculations**
- **Total Seats**: Vehicle's maximum capacity
- **Driver Seats**: 1 if driver assigned, 0 otherwise
- **Customer Seats**: Currently assigned customers
- **Available Seats**: Total - Driver - Customers
- **Occupied Seats**: Driver + Customers

### 3. **Visual Indicators**
- Seat icons showing occupied vs available
- Color-coded status (green=available, orange=occupied, red=full)
- Before/after assignment preview
- Compact and detailed view modes

### 4. **Assignment Validation**
- Prevents over-assignment
- Checks driver availability
- Validates vehicle status
- Shows clear error messages

## File Structure

```
lib/
├── features/
│   └── admin/
│       ├── vehicle_management/
│       │   ├── domain/
│       │   │   └── entities/
│       │   │       └── vehicle_entity.dart (✅ UPDATED)
│       │   └── presentation/
│       │       └── widgets/
│       │           └── seat_capacity_indicator.dart (✅ NEW)
│       └── customer_management/
│           └── widgets/
│               └── roster_assignment_dialog.dart (✅ NEW)
└── core/
    └── services/
        └── seat_capacity_service.dart (✅ NEW)
```

## Implementation Details

### 1. Vehicle Entity Updates

**File**: `lib/features/admin/vehicle_management/domain/entities/vehicle_entity.dart`

**New Fields**:
```dart
final int seatCapacity;        // Total seats (default: 4)
final int assignedCustomers;   // Currently assigned customers
```

**New Getters**:
```dart
int get availableSeats;        // Calculates available seats
int get occupiedSeats;         // Calculates occupied seats
bool get isFull;               // Checks if vehicle is full
bool canAccommodate(int count); // Validates capacity
```

**Example**:
```dart
// Vehicle with 4 seats, 1 driver, 2 customers
vehicle.seatCapacity = 4
vehicle.assignedDriver = "John Doe"
vehicle.assignedCustomers = 2

// Calculations
vehicle.occupiedSeats = 3  // 1 driver + 2 customers
vehicle.availableSeats = 1 // 4 - 3
vehicle.isFull = false
vehicle.canAccommodate(1) = true
vehicle.canAccommodate(2) = false
```

### 2. Seat Capacity Service

**File**: `lib/core/services/seat_capacity_service.dart`

**Key Methods**:

#### `calculateAvailableSeats(Vehicle vehicle)`
Returns the number of available seats considering driver and customers.

#### `canAccommodateCustomers(Vehicle vehicle, int customerCount)`
Checks if vehicle can fit the requested number of customers.

#### `getSeatCapacityInfo(Vehicle vehicle)`
Returns comprehensive capacity information:
```dart
{
  'totalSeats': 4,
  'driverSeats': 1,
  'customerSeats': 2,
  'occupiedSeats': 3,
  'availableSeats': 1,
  'isFull': false,
  'hasDriver': true,
}
```

#### `validateAssignment({required Vehicle vehicle, required int customerCount})`
Validates if assignment is possible:
```dart
{
  'valid': true/false,
  'message': 'Error or success message',
  'availableSeats': 1,
  'remainingSeats': 0,
}
```

**Validation Checks**:
1. ✅ Vehicle has assigned driver
2. ✅ Vehicle status is 'active'
3. ✅ Sufficient seats available

### 3. Seat Capacity Indicator Widget

**File**: `lib/features/admin/vehicle_management/presentation/widgets/seat_capacity_indicator.dart`

**Two Display Modes**:

#### Compact Mode
```dart
SeatCapacityIndicator(
  vehicle: vehicle,
  compact: true,
)
```
Shows: `🪑 1/4` (available/total)

#### Detailed Mode
```dart
SeatCapacityIndicator(
  vehicle: vehicle,
  showDetails: true,
)
```
Shows:
- Visual seat icons
- Capacity breakdown
- Driver info
- Customer count

**Visual Representation**:
- 🪑 (blue) = Driver seat
- 🪑 (orange) = Occupied customer seat
- 🪑 (green outline) = Available seat

### 4. Roster Assignment Dialog

**File**: `lib/features/admin/customer_management/widgets/roster_assignment_dialog.dart`

**Features**:
- Lists all available vehicles
- Shows seat capacity for each
- Visual before/after preview
- Prevents invalid assignments
- Confirmation dialog

**Usage**:
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

## Integration Steps

### Step 1: Update Backend API

Add seat capacity tracking to vehicle assignment endpoint:

```javascript
// routes/roster_router.js
router.post('/assign-vehicle', async (req, res) => {
  const { vehicleId, rosterIds } = req.body;
  
  // Get vehicle
  const vehicle = await db.collection('vehicles').findOne({
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
  await db.collection('vehicles').updateOne(
    { _id: new ObjectId(vehicleId) },
    { 
      $inc: { assignedCustomers: rosterIds.length },
      $set: { updatedAt: new Date() }
    }
  );
  
  // Update rosters
  await db.collection('rosters').updateMany(
    { _id: { $in: rosterIds.map(id => new ObjectId(id)) } },
    { 
      $set: { 
        vehicleId: vehicleId,
        assignedAt: new Date(),
        status: 'assigned'
      }
    }
  );
  
  res.json({ success: true });
});
```

### Step 2: Update Vehicle Service

```dart
// lib/core/services/vehicle_service.dart

Future<Map<String, dynamic>> assignRostersToVehicle({
  required String vehicleId,
  required List<String> rosterIds,
}) async {
  try {
    final response = await _apiService.post(
      '/api/roster/assign-vehicle',
      data: {
        'vehicleId': vehicleId,
        'rosterIds': rosterIds,
      },
    );
    
    return response.data;
  } catch (e) {
    return {
      'success': false,
      'message': 'Failed to assign rosters: $e',
    };
  }
}
```

### Step 3: Integrate into Pending Rosters Screen

```dart
// In pending_rosters_screen.dart

// Add to bulk action button
Widget _buildBulkActionButton() {
  return Positioned(
    bottom: 20,
    right: 20,
    child: FloatingActionButton.extended(
      onPressed: _showAssignmentDialog,
      icon: const Icon(Icons.directions_car),
      label: Text('Assign ${_selectedRosterIds.length} Rosters'),
      backgroundColor: _themeColor,
    ),
  );
}

Future<void> _showAssignmentDialog() async {
  // Load vehicles
  final vehiclesResponse = await _vehicleService.getVehicles();
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

Future<void> _handleAssignment(String vehicleId, List<String> rosterIds) async {
  // Show loading
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('Assigning rosters...')),
  );
  
  // Call API
  final result = await _vehicleService.assignRostersToVehicle(
    vehicleId: vehicleId,
    rosterIds: rosterIds,
  );
  
  if (result['success']) {
    // Clear selection
    setState(() => _selectedRosterIds.clear());
    
    // Reload data
    await _loadPendingRosters();
    
    // Show success
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Successfully assigned ${rosterIds.length} rosters'),
        backgroundColor: Colors.green,
      ),
    );
  } else {
    // Show error
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(result['message'] ?? 'Assignment failed'),
        backgroundColor: Colors.red,
      ),
    );
  }
}
```

## Usage Examples

### Example 1: Check Vehicle Capacity

```dart
final vehicle = Vehicle(
  id: 'v1',
  name: 'Toyota Innova',
  seatCapacity: 7,
  assignedDriver: 'John Doe',
  assignedCustomers: 4,
  // ... other fields
);

print(vehicle.availableSeats); // Output: 2 (7 - 1 driver - 4 customers)
print(vehicle.canAccommodate(2)); // Output: true
print(vehicle.canAccommodate(3)); // Output: false
```

### Example 2: Validate Assignment

```dart
final validation = SeatCapacityService.validateAssignment(
  vehicle: vehicle,
  customerCount: 3,
);

if (validation['valid']) {
  // Proceed with assignment
  assignCustomers();
} else {
  // Show error
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Cannot Assign'),
      content: Text(validation['message']),
    ),
  );
}
```

### Example 3: Display Capacity

```dart
// In vehicle list
ListTile(
  title: Text(vehicle.name),
  subtitle: Text(vehicle.licensePlate),
  trailing: SeatCapacityIndicator(
    vehicle: vehicle,
    compact: true,
  ),
)

// In vehicle details
Card(
  child: Padding(
    padding: const EdgeInsets.all(16),
    child: SeatCapacityIndicator(
      vehicle: vehicle,
      showDetails: true,
    ),
  ),
)
```

## Error Messages

The system provides clear error messages:

1. **No Driver**: "Vehicle must have an assigned driver before assigning customers."
2. **Inactive Vehicle**: "Vehicle is not active. Status: Maintenance"
3. **Insufficient Seats**: "Insufficient seats. Requested: 5, Available: 2"
4. **Over Capacity**: "Cannot assign 5 customer(s). Only 2 seat(s) available."

## Testing Checklist

- [ ] Vehicle with 4 seats, no driver → Cannot assign customers
- [ ] Vehicle with 4 seats, 1 driver → Can assign 3 customers
- [ ] Vehicle with 4 seats, 1 driver, 2 customers → Can assign 1 more
- [ ] Vehicle with 4 seats, 1 driver, 3 customers → Cannot assign more
- [ ] Attempt to assign 5 customers to 4-seat vehicle → Shows error popup
- [ ] Visual indicator shows correct seat count
- [ ] Before/after preview shows accurate changes
- [ ] Backend validates capacity on assignment
- [ ] assignedCustomers count updates correctly

## Database Schema

### Vehicles Collection

```javascript
{
  _id: ObjectId,
  vehicleId: "VEH-001",
  registrationNumber: "KA01AB1234",
  capacity: {
    passengers: 4,  // Total seat capacity
    luggage: 2
  },
  assignedDriver: "John Doe",
  assignedDriverId: "driver123",
  assignedCustomers: 2,  // NEW: Currently assigned customers
  status: "active",
  // ... other fields
}
```

### Rosters Collection

```javascript
{
  _id: ObjectId,
  customerId: "cust123",
  vehicleId: "vehicle123",  // Assigned vehicle
  assignedAt: ISODate,
  status: "assigned",
  // ... other fields
}
```

## Future Enhancements

1. **Dynamic Capacity**: Different vehicles with different capacities
2. **Seat Preferences**: Window, aisle, etc.
3. **Capacity History**: Track capacity usage over time
4. **Auto-Assignment**: Automatically assign to vehicles with available seats
5. **Capacity Alerts**: Notify when vehicles are near full
6. **Unassignment**: Remove customers and free up seats

## Support

For questions or issues, refer to:
- Vehicle Entity: `vehicle_entity.dart`
- Capacity Service: `seat_capacity_service.dart`
- UI Components: `seat_capacity_indicator.dart`
- Assignment Dialog: `roster_assignment_dialog.dart`
