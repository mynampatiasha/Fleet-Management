# Roster Creation to My Trips Display Flow - Complete Fix

## Issue Analysis
When customers create rosters using `roster_screen.dart`, they don't appear in `my_trips_screen.dart` due to backend filtering and data structure issues.

## Root Causes Identified

### 1. Backend Filtering Issues
The `/api/roster/customer/my-rosters` endpoint has overly strict filtering:
- Filters out rosters without associated trips
- Requires complete data validation
- Field name mismatches between creation and retrieval

### 2. Data Structure Inconsistencies
- Creation uses different field names than retrieval expects
- Missing roster-to-trip relationship creation
- Incomplete location data mapping

### 3. Frontend Refresh Issues
- No automatic refresh after roster creation
- Navigation doesn't trigger data reload

## Complete Solution

### Step 1: Fix Backend Roster Retrieval Endpoint

The backend endpoint should return ALL user rosters, not just those with trips:

```javascript
// In abra_fleet_backend/routes/roster_router.js
// Update the /customer/my-rosters endpoint

router.get('/customer/my-rosters', verifyToken, async (req, res) => {
  try {
    const { status, rosterType, startDate, endDate } = req.query;
    const db = req.db;

    console.log(`🔍 Looking for user with Firebase UID: ${req.user.uid}`);

    // Find user in admin_users collection
    const user = await db.collection('admin_users').findOne({ 
      $or: [
        { firebaseUid: req.user.uid },
        { email: req.user.email }
      ]
    });

    if (!user) {
      console.log('❌ User not found in admin_users collection');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userEmail = user.email || user.emailAddress || user.customerEmail;
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // ✅ SIMPLIFIED QUERY - Return ALL user rosters
    const query = {
      $or: [
        { customerEmail: userEmail },
        { 'employeeDetails.email': userEmail },
        { 'employeeData.email': userEmail }
      ]
    };

    // Add optional filters
    if (status) query.status = status;
    if (rosterType) query.rosterType = rosterType;
    if (startDate) query.fromDate = { $gte: startDate };
    if (endDate) query.toDate = { $lte: endDate };

    // Fetch ALL rosters for the user
    const rosters = await db.collection('rosters').find(query).toArray();

    console.log(`📋 Found ${rosters.length} rosters for ${userEmail}`);

    // ✅ ENHANCED MAPPING - Handle all possible field variations
    const mappedRosters = rosters.map(roster => ({
      id: roster._id,
      _id: roster._id,
      rosterId: roster.rosterId || roster._id.toString(),
      rosterType: roster.rosterType || roster.tripType || 'both',
      officeLocation: roster.officeLocation || roster.dropLocation || 'Office',
      status: roster.status || 'pending_assignment',
      
      // Vehicle and driver info
      vehicleNumber: roster.vehicleNumber || 'To be assigned',
      driverName: roster.driverName || 'To be assigned',
      driverPhone: roster.driverPhone || 'N/A',
      
      // ✅ FLEXIBLE DATE MAPPING
      dateRange: {
        from: roster.dateRange?.from || roster.startDate || roster.fromDate || roster.tripDate,
        to: roster.dateRange?.to || roster.endDate || roster.toDate || roster.tripDate
      },
      
      // ✅ FLEXIBLE TIME MAPPING
      timeRange: {
        from: roster.timeRange?.from || roster.startTime || roster.fromTime || roster.pickupTime || '09:00',
        to: roster.timeRange?.to || roster.endTime || roster.toTime || roster.dropTime || '18:00'
      },
      
      // ✅ WORKING DAYS MAPPING
      weekdays: roster.weekdays || roster.weeklyOffDays || roster.workingDays || [],
      weeklyOffDays: roster.weekdays || roster.weeklyOffDays || roster.workingDays || [],
      
      // ✅ ENHANCED LOCATION MAPPING
      locations: roster.locations || {
        office: {
          coordinates: roster.officeCoordinates || {
            latitude: roster.officeLatitude || 0,
            longitude: roster.officeLongitude || 0
          },
          address: roster.officeLocation || roster.officeAddress || ''
        },
        loginPickup: {
          coordinates: roster.locations?.loginPickup?.coordinates || {
            latitude: roster.pickupLatitude || roster.loginPickupLatitude || 0,
            longitude: roster.pickupLongitude || roster.loginPickupLongitude || 0
          },
          address: roster.locations?.loginPickup?.address || roster.loginPickupAddress || roster.pickupLocation || ''
        },
        logoutDrop: {
          coordinates: roster.locations?.logoutDrop?.coordinates || {
            latitude: roster.dropLatitude || roster.logoutDropLatitude || 0,
            longitude: roster.dropLongitude || roster.logoutDropLongitude || 0
          },
          address: roster.locations?.logoutDrop?.address || roster.logoutDropAddress || roster.dropLocation || ''
        }
      },
      
      // Additional fields
      loginPickupAddress: roster.loginPickupAddress || roster.pickupLocation || '',
      logoutDropAddress: roster.logoutDropAddress || roster.dropLocation || '',
      notes: roster.notes || '',
      createdAt: roster.createdAt || roster.timestamp || new Date(),
      updatedAt: roster.updatedAt || roster.lastModified || new Date()
    }));

    console.log(`✅ Returning ${mappedRosters.length} rosters to client`);

    res.json({
      success: true,
      message: 'Rosters retrieved successfully',
      data: mappedRosters
    });

  } catch (error) {
    console.error('❌ Error fetching user rosters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rosters',
      error: error.message
    });
  }
});
```

### Step 2: Fix Frontend Navigation and Refresh

Update the roster creation success flow to properly navigate and refresh:

```dart
// In roster_screen.dart - Update _saveRoster method

Future<void> _saveRoster() async {
  if (!_isFormValid()) {
    _showValidationError();
    return;
  }

  if (!mounted) return;
  
  setState(() {
    isLoading = true;
  });

  try {
    // ... existing roster creation code ...

    // Check if the response indicates success
    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Roster operation failed');
    }

    debugPrint('✅ Roster operation completed successfully');
    if (!mounted) return;
    
    // Show success message
    _showSuccessMessage(isEditing);
    
    // Wait for success message to show
    await Future.delayed(const Duration(milliseconds: 1500));
    
    if (!mounted) return;
    
    // ✅ IMPROVED NAVIGATION - Always return success result
    if (isEditing) {
      // For editing, return to trips screen with refresh signal
      Navigator.of(context).pop(true);
    } else {
      // For new roster, navigate to My Trips screen directly
      Navigator.of(context).pushReplacementNamed('/my-trips');
      // Alternative: Pop all and push My Trips
      // Navigator.of(context).popUntil((route) => route.isFirst);
      // Navigator.of(context).pushNamed('/my-trips');
    }
    
  } catch (e) {
    debugPrint('❌ Error in _saveRoster: $e');
    if (!mounted) return;
    _showErrorMessage('Failed to ${isEditing ? 'update' : 'create'} roster: ${e.toString()}');
  } finally {
    if (mounted) {
      setState(() {
        isLoading = false;
      });
    }
  }
}
```

### Step 3: Ensure My Trips Screen Refreshes Properly

Update the My Trips screen to refresh when returning from roster creation:

```dart
// In my_trips_screen.dart - Update initState and add refresh handling

class _MyTripsScreenState extends State<MyTripsScreen> {
  // ... existing code ...

  @override
  void initState() {
    super.initState();
    _rosterRepository = RosterRepository(
      apiService: BackendConnectionManager().apiService,
    );
    _fetchMyRosters();
  }

  // ✅ ADD: Handle route returns and refresh data
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Check if we're returning from another screen
    final route = ModalRoute.of(context);
    if (route != null && route.isCurrent) {
      // Refresh data when screen becomes active
      _fetchMyRosters();
    }
  }

  // ✅ IMPROVED: Add manual refresh method
  Future<void> _refreshData() async {
    debugPrint('🔄 Manual refresh triggered');
    _fetchMyRosters();
  }

  // Helper to fetch rosters, used for initial load and refresh
  void _fetchMyRosters() {
    if (mounted) {
      setState(() {
        _myRostersFuture = _rosterRepository.getMyRosters().then((rosters) {
          debugPrint('📋 Fetched ${rosters.length} rosters from repository');
          _allRosters = rosters;
          _applyFilter();
          return rosters;
        }).catchError((error) {
          debugPrint('❌ Error fetching rosters: $error');
          throw error;
        });
      });
    }
  }

  // ... rest of existing code ...

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('My Trips'),
            // ... existing filter badge code ...
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
            tooltip: 'Filter Trips',
          ),
          // ✅ ADD: Manual refresh button
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
            tooltip: 'Refresh',
          ),
          // ... existing popup menu ...
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: _myRostersFuture == null 
          ? const Center(child: CircularProgressIndicator())
          : FutureBuilder<List<Map<String, dynamic>>>(
              future: _myRostersFuture!,
              builder: (context, snapshot) {
                // ... existing builder code ...
              },
            ),
      ),
    );
  }
}
```

### Step 4: Add Navigation Route (if needed)

Ensure the My Trips route is properly defined in your app:

```dart
// In main.dart or your route configuration
routes: {
  '/my-trips': (context) => const MyTripsScreen(),
  // ... other routes
}
```

### Step 5: Test the Complete Flow

Create a test script to verify the flow:

```javascript
// test-roster-to-trips-flow.js
const axios = require('axios');

async function testRosterToTripsFlow() {
  try {
    console.log('🧪 Testing complete roster creation to My Trips flow\n');

    // Step 1: Create a roster
    console.log('📝 Step 1: Creating a test roster...');
    
    const rosterData = {
      rosterType: 'both',
      officeLocation: 'Test Office Location',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      fromDate: new Date().toISOString(),
      toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      fromTime: '09:00',
      toTime: '18:00',
      loginPickupAddress: 'Test Pickup Address',
      logoutDropAddress: 'Test Drop Address'
    };

    // You'll need a valid customer token here
    const customerToken = 'YOUR_CUSTOMER_TOKEN';
    
    const createResponse = await axios.post(
      'http://localhost:3001/api/roster/customer',
      rosterData,
      {
        headers: {
          'Authorization': `Bearer ${customerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Roster created:', createResponse.data);

    // Step 2: Fetch My Rosters
    console.log('\n📋 Step 2: Fetching My Rosters...');
    
    const fetchResponse = await axios.get(
      'http://localhost:3001/api/roster/customer/my-rosters',
      {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      }
    );

    console.log('✅ My Rosters fetched:', fetchResponse.data);
    console.log(`📊 Total rosters: ${fetchResponse.data.data?.length || 0}`);

    // Step 3: Verify the created roster appears
    const createdRosterId = createResponse.data.data?.rosterId || createResponse.data.data?._id;
    const foundRoster = fetchResponse.data.data?.find(r => 
      r.rosterId === createdRosterId || r._id === createdRosterId
    );

    if (foundRoster) {
      console.log('✅ SUCCESS: Created roster appears in My Trips!');
      console.log('📋 Roster details:', {
        id: foundRoster.id,
        rosterType: foundRoster.rosterType,
        status: foundRoster.status,
        officeLocation: foundRoster.officeLocation
      });
    } else {
      console.log('❌ ISSUE: Created roster does NOT appear in My Trips');
      console.log('🔍 Available roster IDs:', fetchResponse.data.data?.map(r => r.rosterId || r._id));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRosterToTripsFlow();
```

## Summary

The complete fix involves:

1. **Backend**: Simplify the `/customer/my-rosters` endpoint to return ALL user rosters with flexible field mapping
2. **Frontend**: Improve navigation flow and add proper refresh mechanisms
3. **Data Consistency**: Ensure field names are consistently mapped between creation and retrieval
4. **User Experience**: Add manual refresh options and proper loading states

After implementing these changes, rosters created in `roster_screen.dart` will immediately appear in `my_trips_screen.dart` when the user navigates back or refreshes the screen.