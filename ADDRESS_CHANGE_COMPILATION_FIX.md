# Address Change Request - Compilation Errors Fixed

## Issues Fixed

### 1. RosterService Initialization Error
**Problem:** `RosterService` requires `apiService` parameter but was being instantiated without it.

**Files Fixed:**
- `address_change_request_screen.dart`
- `my_address_requests_screen.dart`

**Solution:**
```dart
// Before
final _rosterService = RosterService();

// After
late final RosterService _rosterService;

@override
void initState() {
  super.initState();
  _rosterService = RosterService(apiService: ApiService());
  // ... rest of init
}
```

### 2. Google Maps Flutter Dependency Removed
**Problem:** `address_change_request_screen.dart` was importing `google_maps_flutter` which is not in the project dependencies.

**Solution:** Replaced with `latlong2` package which is already used throughout the project:
```dart
// Before
import 'package:google_maps_flutter/google_maps_flutter.dart';
LatLng? _newPickupLatLng; // from google_maps_flutter

// After
import 'package:latlong2/latlong.dart';
LatLng? _newPickupLatLng; // from latlong2
```

### 3. LocationPickerScreen Parameter Mismatch
**Problem:** Passing separate latitude/longitude values instead of `LatLng` object.

**Solution:**
```dart
// Before
LocationPickerScreen(
  initialLatitude: _newPickupLat,
  initialLongitude: _newPickupLng,
)

// After
LocationPickerScreen(
  initialLocation: _newPickupLatLng,
)
```

## Verification

All files now compile without errors:
- ✅ `roster_service.dart` - No diagnostics
- ✅ `address_change_request_screen.dart` - No diagnostics  
- ✅ `my_address_requests_screen.dart` - No diagnostics

## Dependencies Used

The fix uses existing project dependencies:
- `latlong2` - For coordinate handling (already in pubspec.yaml)
- `flutter_map` - For map display (already in pubspec.yaml)
- No new dependencies required

## Hot Reload Ready

The app should now hot reload successfully without compilation errors.
