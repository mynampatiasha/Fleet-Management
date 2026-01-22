# Driver & Vehicle Trip Status Feature

## Requirement
Display trip status information for drivers and vehicles showing:
- **Ongoing Trips**: Currently in progress
- **Assigned/Scheduled Trips**: Future trips
- **Completed Trips**: Past trips

## Implementation Plan

### Backend API Endpoints

#### 1. Enhanced Driver List Endpoint
**Endpoint**: `GET /api/admin/drivers`
**Enhancement**: Add trip statistics to each driver

```javascript
{
  driverId: "DRV001",
  name: "John Doe",
  assignedVehicle: {...},
  tripStats: {
    ongoing: 2,        // Trips with status 'in_progress'
    scheduled: 5,      // Trips with status 'scheduled'
    completed: 150     // Trips with status 'completed'
  },
  currentTrip: {       // If driver has ongoing trip
    tripId: "TRIP123",
    status: "in_progress",
    startTime: "2026-01-21T08:00:00Z",
    customers: ["Customer A", "Customer B"]
  }
}
```

#### 2. Enhanced Vehicle List Endpoint
**Endpoint**: `GET /api/admin/vehicles`
**Enhancement**: Add trip statistics to each vehicle

```javascript
{
  vehicleId: "VEH001",
  registrationNumber: "KA01AB1234",
  assignedDriver: {...},
  tripStats: {
    ongoing: 1,        // Trips with status 'in_progress'
    scheduled: 3,      // Trips with status 'scheduled'
    completed: 200     // Trips with status 'completed'
  },
  currentTrip: {       // If vehicle has ongoing trip
    tripId: "TRIP123",
    driverId: "DRV001",
    status: "in_progress",
    startTime: "2026-01-21T08:00:00Z"
  }
}
```

#### 3. New Trip Details Endpoint
**Endpoint**: `GET /api/admin/drivers/:driverId/trips`
**Purpose**: Get detailed trip list for a specific driver

**Query Parameters**:
- `status`: Filter by trip status (ongoing, scheduled, completed)
- `page`: Pagination
- `limit`: Items per page

#### 4. New Vehicle Trip Details Endpoint
**Endpoint**: `GET /api/admin/vehicles/:vehicleId/trips`
**Purpose**: Get detailed trip list for a specific vehicle

### Frontend UI Components

#### Driver List Page Enhancements

**1. Trip Status Badges**
```dart
Row(
  children: [
    _buildTripBadge('Ongoing', driver['tripStats']['ongoing'], Colors.green),
    _buildTripBadge('Scheduled', driver['tripStats']['scheduled'], Colors.blue),
    _buildTripBadge('Completed', driver['tripStats']['completed'], Colors.grey),
  ],
)
```

**2. Current Trip Indicator**
```dart
if (driver['currentTrip'] != null)
  Container(
    padding: EdgeInsets.all(8),
    decoration: BoxDecoration(
      color: Colors.green.shade50,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Row(
      children: [
        Icon(Icons.local_shipping, color: Colors.green),
        Text('On Trip: ${driver['currentTrip']['tripId']}'),
      ],
    ),
  )
```

**3. Trip Details Dialog**
```dart
void _showDriverTrips(String driverId) {
  // Show dialog with tabs:
  // - Ongoing Trips
  // - Scheduled Trips
  // - Completed Trips
}
```

#### Vehicle Master Page Enhancements

**1. Trip Status Column**
Add new column showing trip statistics

**2. Active Trip Indicator**
Visual indicator when vehicle is currently on a trip

**3. Trip History Button**
Button to view all trips for a vehicle

### Database Queries

#### Get Driver Trip Statistics
```javascript
const tripStats = await db.collection('trips').aggregate([
  {
    $match: { driverId: driver.driverId }
  },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]).toArray();

// Transform to:
{
  ongoing: tripStats.find(s => s._id === 'in_progress')?.count || 0,
  scheduled: tripStats.find(s => s._id === 'scheduled')?.count || 0,
  completed: tripStats.find(s => s._id === 'completed')?.count || 0
}
```

#### Get Current Trip
```javascript
const currentTrip = await db.collection('trips').findOne({
  driverId: driver.driverId,
  status: 'in_progress'
});
```

### Trip Status Definitions

| Status | Description | Color |
|--------|-------------|-------|
| `scheduled` | Trip is scheduled for future | Blue |
| `in_progress` | Trip is currently ongoing | Green |
| `completed` | Trip has been completed | Grey |
| `cancelled` | Trip was cancelled | Red |

### UI Mockup

#### Driver List Page
```
┌─────────────────────────────────────────────────────────────┐
│ Driver ID │ Name      │ Vehicle    │ Trip Status            │
├─────────────────────────────────────────────────────────────┤
│ DRV001    │ John Doe  │ KA01AB1234 │ 🟢 Ongoing: 1          │
│           │           │            │ 🔵 Scheduled: 5        │
│           │           │            │ ⚪ Completed: 150      │
│           │           │            │ [View Trips]           │
├─────────────────────────────────────────────────────────────┤
│ DRV002    │ Jane Smith│ KA02CD5678 │ 🔵 Scheduled: 3        │
│           │           │            │ ⚪ Completed: 200      │
│           │           │            │ [View Trips]           │
└─────────────────────────────────────────────────────────────┘
```

#### Vehicle Master Page
```
┌─────────────────────────────────────────────────────────────┐
│ Vehicle ID │ Reg No     │ Driver     │ Trip Status          │
├─────────────────────────────────────────────────────────────┤
│ VEH001     │ KA01AB1234 │ John Doe   │ 🟢 Active Trip       │
│            │            │            │ Scheduled: 5         │
│            │            │            │ Completed: 200       │
│            │            │            │ [View Trips]         │
└─────────────────────────────────────────────────────────────┘
```

### Performance Considerations

1. **Caching**: Cache trip statistics for 5 minutes
2. **Pagination**: Load trips in pages of 20
3. **Lazy Loading**: Load trip details only when requested
4. **Indexing**: Add indexes on `driverId`, `vehicleId`, and `status` fields

### Files to Create/Modify

#### Backend
1. ✅ `abra_fleet_backend/routes/admin-drivers.js` - Add trip stats
2. ✅ `abra_fleet_backend/routes/admin-vehicles.js` - Add trip stats
3. ✅ `abra_fleet_backend/routes/driver-trips.js` - New endpoint
4. ✅ `abra_fleet_backend/routes/vehicle-trips.js` - New endpoint

#### Frontend
1. ✅ `abra_fleet/lib/features/admin/driver_admin_management/driver_list_page.dart`
2. ✅ `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart`
3. ✅ `abra_fleet/lib/core/services/driver_service.dart`
4. ✅ `abra_fleet/lib/core/services/vehicle_service.dart`
5. ✅ `abra_fleet/lib/features/admin/driver_admin_management/widgets/driver_trips_dialog.dart` - New
6. ✅ `abra_fleet/lib/features/admin/vehicle_admin_management/widgets/vehicle_trips_dialog.dart` - New

## Implementation Steps

### Step 1: Backend - Add Trip Statistics to Driver Endpoint
### Step 2: Backend - Add Trip Statistics to Vehicle Endpoint
### Step 3: Backend - Create Driver Trips Detail Endpoint
### Step 4: Backend - Create Vehicle Trips Detail Endpoint
### Step 5: Frontend - Update Driver List UI
### Step 6: Frontend - Update Vehicle Master UI
### Step 7: Frontend - Create Trip Details Dialogs
### Step 8: Testing

## Benefits

1. **Real-time Visibility**: See which drivers/vehicles are currently active
2. **Resource Planning**: Know which drivers/vehicles are available
3. **Performance Tracking**: View completed trip counts
4. **Scheduling**: See future trip assignments
5. **Quick Access**: Click to view detailed trip information
