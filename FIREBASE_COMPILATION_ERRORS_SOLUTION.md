# Firebase Compilation Errors - Complete Solution

## Status: ✅ IN PROGRESS - Fixing All Remaining Files

## Files Fixed:
1. ✅ `driver_provider.dart` - Replaced Firestore with HTTP API
2. ✅ `roster_service.dart` - Replaced Firebase RTDB with HTTP polling
3. ✅ `notifications_screen.dart` - Removed Firebase RTDB, using HTTP API
4. ✅ `admin_pending_customers.dart` - Replaced Firestore batch operations with HTTP API

## Files Still Need Fixing:

### 1. `ex.dart` (Driver Profile Screen) - 2030 lines
**Firebase References:**
- `FirebaseFirestore.instance.collection('users')` - Lines 115, 124, 442, 474, 1365, 1525, 1699
- `FieldValue.serverTimestamp()` - Lines 444, 476, 1372, 1530, 1703

**Fix Strategy:**
```dart
// Replace Firestore queries with HTTP API
final response = await ApiService().get('/api/drivers/$driverId');

// Replace updates with HTTP PUT
await ApiService().put('/api/drivers/$driverId', body: {
  'phoneNumber': phoneNumber,
  'updatedAt': DateTime.now().toIso8601String(),
});

// Replace notification preferences update
await ApiService().put('/api/drivers/$driverId/preferences', body: {
  'notificationPreferences': {...},
  'updatedAt': DateTime.now().toIso8601String(),
});

// Replace support issue creation
await ApiService().post('/api/support-issues', body: {
  'driverId': driverId,
  'email': email,
  'issue': issue,
  'createdAt': DateTime.now().toIso8601String(),
  'status': 'open',
});
```

### 2. `customer_dashboard_temp.dart` (Customer Dashboard) - 2401 lines
**Firebase References:**
- `FirebaseDatabase.instance.ref('sos_events')` - Lines 630, 666

**Fix Strategy:**
```dart
// Replace Firebase RTDB with HTTP polling for SOS events
Timer.periodic(Duration(seconds: 10), (_) async {
  final response = await ApiService().get('/api/sos-events', queryParams: {
    'customerId': _userId,
  });
  // Process SOS events
});

// Replace SOS status listener with HTTP polling
Timer.periodic(Duration(seconds: 5), (_) async {
  if (_activeSOSId != null) {
    final response = await ApiService().get('/api/sos-events/$_activeSOSId');
    // Check status and show dialog if needed
  }
});
```

### 3. `user_management_screen.dart`
**Firebase References:**
- `_firestore.collection('users')` - Lines 32, 95

**Fix Strategy:**
```dart
// Replace Firestore query with HTTP API
Future<void> _loadUsers() async {
  setState(() => _isLoading = true);
  
  try {
    final response = await ApiService().get('/api/users', queryParams: {
      if (_selectedFilter != 'all') 'role': _selectedFilter,
    });
    
    setState(() {
      _users = List<Map<String, dynamic>>.from(response['users'] ?? response['data'] ?? []);
      _users.sort((a, b) {
        final aTime = a['createdAt'] as String?;
        final bTime = b['createdAt'] as String?;
        if (aTime == null && bTime == null) return 0;
        if (aTime == null) return 1;
        if (bTime == null) return -1;
        return DateTime.parse(bTime).compareTo(DateTime.parse(aTime));
      });
      _isLoading = false;
    });
  } catch (e) {
    setState(() => _isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading users: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

// Replace delete with HTTP API
Future<void> _deleteUser(String userId, String email) async {
  final confirmed = await showDialog<bool>(...);

  if (confirmed == true) {
    try {
      await ApiService().delete('/api/users/$userId');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('User deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadUsers();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting user: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
```

### 4. `firebase_auth_repository_impl.dart`
**Firebase References:**
- `FirebaseFirestore.instance.collection('users')` - Line 215

**Fix Strategy:**
```dart
// The Firestore fallback is already minimal - just remove it
// The file already uses MongoDB as primary source via UserVerificationService
// Remove the Firestore fallback section entirely since MongoDB is the source of truth
```

### 5. `location_tracking_service.dart`
**Firebase References:**
- `FirebaseFirestore _firestore` - Line 8
- Multiple Firestore operations for live locations
- `FieldValue.serverTimestamp()` - Lines 70, 97, 99, 121, 183

**Fix Strategy:**
```dart
// Replace with HTTP API for location updates
class LocationTrackingService {
  final ApiService _apiService = ApiService();
  StreamSubscription<Position>? _positionStream;
  Timer? _heartbeatTimer;
  
  String? _currentDriverId;
  String? _currentTripId;
  bool _isTracking = false;

  // Update location via HTTP API
  Future<void> _updateLocation(Position position) async {
    if (_currentDriverId == null || _currentTripId == null) return;

    try {
      await _apiService.post('/api/live-locations', body: {
        'driverId': _currentDriverId,
        'tripId': _currentTripId,
        'lat': position.latitude,
        'lng': position.longitude,
        'speed': position.speed,
        'heading': position.heading,
        'accuracy': position.accuracy,
        'timestamp': DateTime.now().toIso8601String(),
        'isOnline': true,
        'lastSeen': DateTime.now().toIso8601String(),
      });

      debugPrint('📍 Location updated via HTTP API');
      await _checkGeofences(position);
      
    } catch (e) {
      debugPrint('❌ Failed to update location: $e');
    }
  }

  // Send heartbeat via HTTP API
  Future<void> _sendHeartbeat() async {
    if (_currentDriverId == null) return;

    try {
      await _apiService.put('/api/live-locations/$_currentDriverId', body: {
        'lastSeen': DateTime.now().toIso8601String(),
        'isOnline': true,
      });
    } catch (e) {
      debugPrint('❌ Heartbeat failed: $e');
    }
  }

  // Send notification via HTTP API
  Future<void> _sendArrivingSoonNotification(String customerId, double distance) async {
    try {
      final eta = _calculateETA(distance);
      
      await _apiService.post('/api/notifications', body: {
        'userId': customerId,
        'title': '🚗 Vehicle Arriving Soon',
        'body': 'Your vehicle is ${distance.round()} meters away (ETA: $eta mins)',
        'type': 'arriving_soon',
        'tripId': _currentTripId,
        'timestamp': DateTime.now().toIso8601String(),
        'isRead': false,
      });

      debugPrint('📢 Sent arriving notification via HTTP API');
    } catch (e) {
      debugPrint('❌ Failed to send notification: $e');
    }
  }

  // Stream driver location via HTTP polling
  Stream<Map<String, dynamic>?> streamDriverLocation(String driverId) {
    return Stream.periodic(Duration(seconds: 5), (_) async {
      try {
        final response = await _apiService.get('/api/live-locations/$driverId');
        return response['location'] as Map<String, dynamic>?;
      } catch (e) {
        debugPrint('Error fetching driver location: $e');
        return null;
      }
    }).asyncMap((future) => future);
  }

  // Stream all active drivers via HTTP polling
  Stream<List<Map<String, dynamic>>> streamAllActiveDrivers() {
    return Stream.periodic(Duration(seconds: 10), (_) async {
      try {
        final response = await _apiService.get('/api/live-locations', queryParams: {
          'isOnline': 'true',
        });
        return List<Map<String, dynamic>>.from(response['locations'] ?? []);
      } catch (e) {
        debugPrint('Error fetching active drivers: $e');
        return <Map<String, dynamic>>[];
      }
    }).asyncMap((future) => future);
  }
}
```

## Summary of Changes:

### Pattern Replacements:
1. `FirebaseFirestore.instance.collection('users')` → `ApiService().get('/api/users')`
2. `FirebaseDatabase.instance.ref('path')` → `ApiService().get('/api/path')` with polling
3. `FieldValue.serverTimestamp()` → `DateTime.now().toIso8601String()`
4. `Timestamp` → `DateTime` or `String` (ISO 8601)
5. `.update()` → `ApiService().put()`
6. `.add()` → `ApiService().post()`
7. `.delete()` → `ApiService().delete()`
8. `.snapshots()` → HTTP polling with `Timer.periodic()` or `Stream.periodic()`

### Backend API Endpoints Needed:
- ✅ `/api/drivers` - GET, POST, PUT, DELETE
- ✅ `/api/customers` - GET, POST, PUT, DELETE
- ✅ `/api/users` - GET, POST, PUT, DELETE
- ✅ `/api/notifications` - GET, POST
- ✅ `/api/rosters` - GET, POST, PUT, DELETE
- ⚠️ `/api/live-locations` - GET, POST, PUT (needs implementation)
- ⚠️ `/api/sos-events` - GET, POST, PUT (needs implementation)
- ⚠️ `/api/support-issues` - POST (needs implementation)
- ⚠️ `/api/drivers/:id/preferences` - PUT (needs implementation)

## Next Steps:
1. ✅ Fix `admin_pending_customers.dart` - DONE
2. ⏳ Fix `ex.dart` (driver profile) - IN PROGRESS
3. ⏳ Fix `customer_dashboard_temp.dart` - IN PROGRESS
4. ⏳ Fix `user_management_screen.dart` - IN PROGRESS
5. ⏳ Fix `firebase_auth_repository_impl.dart` - IN PROGRESS
6. ⏳ Fix `location_tracking_service.dart` - IN PROGRESS
7. ⏳ Remove `forgot_password_screen_backup.dart` (backup file, not used)

## Testing After Fixes:
```bash
# Run Flutter analyze
cd abra_fleet
flutter analyze

# Check for remaining Firebase references
grep -r "FirebaseFirestore" lib/
grep -r "FirebaseDatabase" lib/
grep -r "FieldValue\." lib/
```

## Estimated Time:
- Remaining fixes: ~15-20 minutes
- Testing: ~5 minutes
- Total: ~25 minutes

All files will use HTTP API exclusively with JWT authentication.
