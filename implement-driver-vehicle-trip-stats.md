# Implementation: Driver & Vehicle Trip Statistics

## Summary
Add trip status information (ongoing, scheduled, completed) to both Driver List and Vehicle Master pages.

## Backend Changes

### 1. Enhance GET /api/admin/drivers Endpoint

**File**: `abra_fleet_backend/routes/admin-drivers.js`

**Add trip statistics helper function**:
```javascript
// Helper function to get trip statistics for a driver
async function getDriverTripStats(db, driverId) {
  const stats = await db.collection('trips').aggregate([
    {
      $match: { driverId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray();
  
  return {
    ongoing: stats.find(s => s._id === 'in_progress')?.count || 0,
    scheduled: stats.find(s => s._id === 'scheduled')?.count || 0,
    completed: stats.find(s => s._id === 'completed')?.count || 0,
    cancelled: stats.find(s => s._id === 'cancelled')?.count || 0,
    total: stats.reduce((sum, s) => sum + s.count, 0)
  };
}

// Helper function to get current trip for a driver
async function getDriverCurrentTrip(db, driverId) {
  return await db.collection('trips').findOne({
    driverId,
    status: 'in_progress'
  }, {
    projection: {
      tripId: 1,
      status: 1,
      startTime: 1,
      'customer.name': 1,
      'customer.customerId': 1,
      pickupLocation: 1,
      dropLocation: 1
    }
  });
}
```

**Modify the driver list response**:
```javascript
const driversWithStats = await Promise.all(
  drivers.map(async (driver) => {
    // ... existing code ...
    
    // ✅ NEW: Get trip statistics
    const tripStats = await getDriverTripStats(req.db, driver.driverId);
    
    // ✅ NEW: Get current trip if any
    const currentTrip = await getDriverCurrentTrip(req.db, driver.driverId);
    
    return {
      driverId: driver.driverId,
      name: `${driver.personalInfo?.firstName || ''} ${driver.personalInfo?.lastName || ''}`.trim() || 'N/A',
      phone: driver.personalInfo?.phone || 'N/A',
      email: driver.personalInfo?.email || 'N/A',
      status: driver.status,
      assignedVehicle,
      documents,
      tripStats, // ✅ NEW
      currentTrip, // ✅ NEW
      licenseNumber: driver.license?.licenseNumber,
      licenseExpiry: driver.license?.expiryDate,
      joinedDate: driver.joinedDate || driver.createdAt
    };
  })
);
```

### 2. Create GET /api/admin/drivers/:id/trips Endpoint

**File**: `abra_fleet_backend/routes/admin-drivers.js`

```javascript
// GET /api/admin/drivers/:id/trips - Get driver's trips with filtering
router.get('/:id/trips', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = { driverId: req.params.id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }
    
    // Get trips
    const trips = await req.db.collection('trips')
      .find(filter)
      .sort({ scheduledDate: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const totalCount = await req.db.collection('trips').countDocuments(filter);
    
    res.json({
      success: true,
      data: trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver trips',
      error: error.message
    });
  }
});
```

### 3. Enhance GET /api/admin/vehicles Endpoint

**File**: Create `abra_fleet_backend/routes/admin-vehicles.js` or modify existing vehicle routes

```javascript
// Helper function to get trip statistics for a vehicle
async function getVehicleTripStats(db, vehicleId) {
  const stats = await db.collection('trips').aggregate([
    {
      $match: { vehicleId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray();
  
  return {
    ongoing: stats.find(s => s._id === 'in_progress')?.count || 0,
    scheduled: stats.find(s => s._id === 'scheduled')?.count || 0,
    completed: stats.find(s => s._id === 'completed')?.count || 0,
    cancelled: stats.find(s => s._id === 'cancelled')?.count || 0,
    total: stats.reduce((sum, s) => sum + s.count, 0)
  };
}

// Helper function to get current trip for a vehicle
async function getVehicleCurrentTrip(db, vehicleId) {
  return await db.collection('trips').findOne({
    vehicleId,
    status: 'in_progress'
  }, {
    projection: {
      tripId: 1,
      status: 1,
      driverId: 1,
      startTime: 1,
      'customer.name': 1
    }
  });
}
```

## Frontend Changes

### 1. Update Driver Service

**File**: `abra_fleet/lib/core/services/driver_service.dart`

```dart
// Get driver trips
Future<Map<String, dynamic>> getDriverTrips(
  String driverId, {
  String? status,
  int page = 1,
  int limit = 20,
}) async {
  try {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (status != null && status != 'all') 'status': status,
    };
    
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/trips')
        .replace(queryParameters: queryParams);
    
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${await _getAuthToken()}',
      },
    ).timeout(const Duration(seconds: 30));
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    
    throw Exception('Failed to fetch driver trips');
  } catch (e) {
    print('❌ Error fetching driver trips: $e');
    rethrow;
  }
}
```

### 2. Update Driver List Page UI

**File**: `abra_fleet/lib/features/admin/driver_admin_management/driver_list_page.dart`

**Add trip status badges**:
```dart
Widget _buildTripStatusBadges(Map<String, dynamic> driver) {
  final tripStats = driver['tripStats'];
  if (tripStats == null) return const SizedBox.shrink();
  
  return Wrap(
    spacing: 4,
    runSpacing: 4,
    children: [
      if (tripStats['ongoing'] > 0)
        _buildTripBadge(
          '🟢 ${tripStats['ongoing']}',
          Colors.green,
          'Ongoing',
        ),
      if (tripStats['scheduled'] > 0)
        _buildTripBadge(
          '🔵 ${tripStats['scheduled']}',
          Colors.blue,
          'Scheduled',
        ),
      _buildTripBadge(
        '⚪ ${tripStats['completed']}',
        Colors.grey,
        'Completed',
      ),
    ],
  );
}

Widget _buildTripBadge(String label, Color color, String tooltip) {
  return Tooltip(
    message: tooltip,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color.shade700,
        ),
      ),
    ),
  );
}
```

**Add current trip indicator**:
```dart
Widget _buildCurrentTripIndicator(Map<String, dynamic>? currentTrip) {
  if (currentTrip == null) return const SizedBox.shrink();
  
  return Container(
    margin: const EdgeInsets.only(top: 4),
    padding: const EdgeInsets.all(8),
    decoration: BoxDecoration(
      color: Colors.green.shade50,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: Colors.green.shade200),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.local_shipping, size: 16, color: Colors.green.shade700),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            'On Trip: ${currentTrip['tripId']}',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Colors.green.shade700,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    ),
  );
}
```

**Add "View Trips" button**:
```dart
IconButton(
  icon: const Icon(Icons.list_alt, size: 20),
  tooltip: 'View Trips',
  onPressed: () => _showDriverTripsDialog(driver['driverId']),
)
```

### 3. Create Driver Trips Dialog

**File**: `abra_fleet/lib/features/admin/driver_admin_management/widgets/driver_trips_dialog.dart`

```dart
import 'package:flutter/material.dart';

class DriverTripsDialog extends StatefulWidget {
  final String driverId;
  final String driverName;
  
  const DriverTripsDialog({
    Key? key,
    required this.driverId,
    required this.driverName,
  }) : super(key: key);
  
  @override
  State<DriverTripsDialog> createState() => _DriverTripsDialogState();
}

class _DriverTripsDialogState extends State<DriverTripsDialog> 
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }
  
  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: 800,
        height: 600,
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade700,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.list_alt, color: Colors.white),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Trips - ${widget.driverName}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            
            // Tabs
            TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'All'),
                Tab(text: 'Ongoing'),
                Tab(text: 'Scheduled'),
                Tab(text: 'Completed'),
              ],
            ),
            
            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTripList('all'),
                  _buildTripList('in_progress'),
                  _buildTripList('scheduled'),
                  _buildTripList('completed'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTripList(String status) {
    // Implement trip list with pagination
    return Center(child: Text('Trips with status: $status'));
  }
}
```

## Testing Checklist

- [ ] Run `node test-driver-vehicle-trip-stats.js` to verify data
- [ ] Test driver list shows trip badges
- [ ] Test current trip indicator appears for active drivers
- [ ] Test "View Trips" dialog opens and shows trips
- [ ] Test vehicle master shows trip statistics
- [ ] Test trip filtering by status
- [ ] Test pagination in trip lists
- [ ] Verify performance with large datasets

## Performance Optimization

1. **Add indexes** (already done in trip_model.js):
   - `{ driverId: 1, status: 1 }`
   - `{ vehicleId: 1, status: 1 }`

2. **Cache trip statistics** for 5 minutes using Redis

3. **Lazy load** trip details only when dialog is opened

4. **Pagination** for trip lists (20 items per page)

## Next Steps

1. ✅ Create test script
2. ✅ Document implementation
3. ⏳ Implement backend changes
4. ⏳ Implement frontend changes
5. ⏳ Test and verify
6. ⏳ Deploy to production
