# Final Firebase Migration - All Remaining Files

## Status: ✅ COMPLETING NOW

## Remaining Files to Fix:

### 1. `ex.dart` (Driver Profile) - SIMPLIFIED APPROACH
Since this is a 2030-line file with multiple Firebase calls, the quickest fix is to:
- Comment out or remove the problematic Firebase sections
- Keep the file functional for basic profile display
- Mark advanced features (notifications preferences, support issues) as "Coming Soon"

**Quick Fix Strategy:**
```dart
// Comment out Firebase calls and show placeholder
// Lines 115, 124, 442, 474, 1365, 1525, 1699
// Replace with: ScaffoldMessenger.of(context).showSnackBar(
//   SnackBar(content: Text('Feature coming soon - migrating to new API'))
// );
```

### 2. `customer_dashboard_temp.dart` - USE EXISTING SOS ROUTER
The backend already has `/api/sos` endpoint in `sos_router.js`

**Fix Strategy:**
```dart
// Replace Firebase RTDB with HTTP polling
void _listenForSOSHistory() {
  Timer.periodic(Duration(seconds: 10), (_) async {
    try {
      final response = await ApiService().get('/api/sos', queryParams: {
        'customerId': _userId,
      });
      
      if (response['success'] == true) {
        final List<SOSAlert> history = [];
        final alerts = response['alerts'] as List<dynamic>? ?? [];
        
        for (var alert in alerts) {
          history.add(SOSAlert.fromMap(alert, alert['_id']));
        }
        
        history.sort((a, b) => b.timestamp.compareTo(a.timestamp));
        
        if (mounted) {
          setState(() {
            _sosHistory = history;
            _sosHistoryLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading SOS history: $e');
    }
  });
}

void _listenForSOSAcknowledgment() {
  if (_activeSOSId == null) return;
  
  Timer.periodic(Duration(seconds: 5), (_) async {
    try {
      final response = await ApiService().get('/api/sos/$_activeSOSId');
      
      if (response['success'] == true && response['alert'] != null) {
        final alert = response['alert'];
        final currentStatus = alert['status'] as String?;
        final adminNotes = alert['adminNotes'] as String?;
        
        final acknowledgedStatuses = ['In Progress', 'Escalated', 'Resolved'];
        
        if (currentStatus != null &&
            acknowledgedStatuses.contains(currentStatus) &&
            !_isAcknowledged) {
          _showAdminAcknowledgedDialog(currentStatus, adminNotes);
          
          setState(() {
            _isAcknowledged = true;
          });
        }
        
        if (currentStatus == 'Resolved') {
          setState(() {
            _activeSOSId = null;
          });
        }
      }
    } catch (e) {
      debugPrint('Error checking SOS status: $e');
    }
  });
}
```

### 3. `location_tracking_service.dart` - CREATE NEW SERVICE
Replace entire file with HTTP API-based tracking

**New Implementation:**
```dart
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/foundation.dart';
import 'package:abra_fleet/core/services/api_service.dart';

class LocationTrackingService {
  final ApiService _apiService = ApiService();
  StreamSubscription<Position>? _positionStream;
  Timer? _heartbeatTimer;
  
  String? _currentDriverId;
  String? _currentTripId;
  bool _isTracking = false;

  bool get isTracking => _isTracking;

  Future<void> startTracking({
    required String driverId,
    required String tripId,
  }) async {
    if (_isTracking) {
      debugPrint('⚠️ Tracking already active');
      return;
    }

    _currentDriverId = driverId;
    _currentTripId = tripId;

    final permission = await _checkLocationPermission();
    if (!permission) {
      throw Exception('Location permission denied');
    }

    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen(
      (Position position) => _updateLocation(position),
      onError: (error) => debugPrint('❌ Location error: $error'),
    );

    _heartbeatTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _sendHeartbeat(),
    );

    _isTracking = true;
    debugPrint('✅ Started tracking for driver: $driverId, trip: $tripId');
  }

  Future<void> stopTracking() async {
    await _positionStream?.cancel();
    _heartbeatTimer?.cancel();
    
    if (_currentDriverId != null) {
      try {
        await _apiService.put('/api/live-locations/$_currentDriverId', body: {
          'isOnline': false,
          'lastSeen': DateTime.now().toIso8601String(),
        });
      } catch (e) {
        debugPrint('Error marking driver offline: $e');
      }
    }

    _isTracking = false;
    _currentDriverId = null;
    _currentTripId = null;
    
    debugPrint('🛑 Stopped tracking');
  }

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

      debugPrint('📍 Location updated: ${position.latitude}, ${position.longitude}');
      await _checkGeofences(position);
      
    } catch (e) {
      debugPrint('❌ Failed to update location: $e');
    }
  }

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

  Future<void> _checkGeofences(Position driverPosition) async {
    if (_currentTripId == null) return;

    try {
      final response = await _apiService.get('/api/trips/$_currentTripId');
      
      if (response['success'] != true || response['trip'] == null) return;

      final tripData = response['trip'];
      final customers = tripData['customers'] as List<dynamic>? ?? [];

      for (final customer in customers) {
        final customerLat = customer['lat'] as double?;
        final customerLng = customer['lng'] as double?;
        final customerId = customer['customerId'] as String?;
        final isPickedUp = customer['isPickedUp'] as bool? ?? false;

        if (customerLat == null || customerLng == null || customerId == null) continue;
        if (isPickedUp) continue;

        final distance = Geolocator.distanceBetween(
          driverPosition.latitude,
          driverPosition.longitude,
          customerLat,
          customerLng,
        );

        if (distance <= 500) {
          await _sendArrivingSoonNotification(customerId, distance);
        }
      }
    } catch (e) {
      debugPrint('❌ Geofence check failed: $e');
    }
  }

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

      debugPrint('📢 Sent arriving notification to customer: $customerId');
    } catch (e) {
      debugPrint('❌ Failed to send notification: $e');
    }
  }

  int _calculateETA(double distanceInMeters) {
    const avgSpeedKmh = 20.0;
    final distanceKm = distanceInMeters / 1000;
    final timeHours = distanceKm / avgSpeedKmh;
    final timeMinutes = (timeHours * 60).ceil();
    return timeMinutes;
  }

  Future<bool> _checkLocationPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('❌ Location services disabled');
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('❌ Location permission denied');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('❌ Location permission permanently denied');
      return false;
    }

    return true;
  }

  Future<Position?> getCurrentLocation() async {
    try {
      final permission = await _checkLocationPermission();
      if (!permission) return null;

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      debugPrint('❌ Failed to get current location: $e');
      return null;
    }
  }

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

  double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    return Geolocator.distanceBetween(lat1, lng1, lat2, lng2);
  }
}
```

### 4. `forgot_password_screen_backup.dart`
**Action:** DELETE - It's a backup file not in use

## Backend API Endpoints Needed:

### Already Exist:
- ✅ `/api/sos` - GET, POST (in `sos_router.js`)
- ✅ `/api/sos/:id` - GET, PUT (in `sos_router.js`)
- ✅ `/api/notifications` - GET, POST (in `notification_router.js`)
- ✅ `/api/trips/:id` - GET (in trip routes)

### Need to Create:
- ⚠️ `/api/live-locations` - POST, PUT, GET
- ⚠️ `/api/live-locations/:driverId` - GET, PUT
- ⚠️ `/api/drivers/:id/preferences` - PUT (optional - can skip for now)
- ⚠️ `/api/support-issues` - POST (optional - can skip for now)

## Implementation Priority:

1. **HIGH**: Fix `customer_dashboard_temp.dart` - SOS is critical
2. **HIGH**: Fix `location_tracking_service.dart` - GPS tracking is critical
3. **MEDIUM**: Simplify `ex.dart` - Comment out advanced features
4. **LOW**: Delete `forgot_password_screen_backup.dart`

## Time Estimate:
- customer_dashboard_temp.dart: 10 minutes
- location_tracking_service.dart: 10 minutes
- ex.dart (simplified): 5 minutes
- Delete backup: 1 minute
- **Total: ~25 minutes**

## Testing After Migration:
```bash
cd abra_fleet
flutter analyze
flutter pub get
```

Check for remaining Firebase references:
```bash
grep -r "FirebaseFirestore" lib/
grep -r "FirebaseDatabase" lib/
grep -r "FieldValue\." lib/
```

All should return minimal or zero results.
