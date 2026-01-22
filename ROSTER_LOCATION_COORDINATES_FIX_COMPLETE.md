# Roster Location Coordinates Fix - Complete Solution

## Problem Identified

When creating a roster, the response shows:
```json
{
  "officeLocation":"Vijayanagara, Devarayapattana, Karnataka, 573201",  // ❌ WRONG LOCATION!
  "locations":{
    "pickup":{"coordinates":{},"address":"2nd Main Road, Kasturi Nagar..."},  // ❌ EMPTY!
    "drop":{"coordinates":{},"address":"Chikka Banaswadi Road, Kasturi Nagar..."}  // ❌ EMPTY!
  }
}
```

**Three Issues:**
1. **Office location geocoded to wrong place** (Vijayanagara instead of Kasturi Nagar)
2. **Pickup coordinates are empty** `{}`
3. **Drop coordinates are empty** `{}`

## Root Cause

The Flutter app is sending coordinates correctly as arrays:
```dart
'loginPickupLocation': [latitude, longitude],  // ✅ Correct format
'logoutDropLocation': [latitude, longitude],   // ✅ Correct format
```

But the backend's `roster_model.js` is not properly converting these arrays into the `locations` object structure.

## Solution

### Fix 1: Update Backend Roster Model

**File:** `abra_fleet_backend/models/roster_model.js`

Find the `createCustomerRoster` method and update the locations processing:

```javascript
// ❌ OLD CODE (around line 150-200):
locations: {
  office: officeLocationCoordinates ? {
    coordinates: officeLocationCoordinates,
    address: officeLocation
  } : null,
  pickup: loginPickupLocation ? {
    coordinates: loginPickupLocation,  // ❌ This stores array, not object!
    address: loginPickupAddress
  } : null,
  drop: logoutDropLocation ? {
    coordinates: logoutDropLocation,   // ❌ This stores array, not object!
    address: logoutDropAddress
  } : null
}

// ✅ NEW CODE:
locations: {
  office: officeLocationCoordinates ? {
    coordinates: {
      latitude: officeLocationCoordinates.latitude || officeLocationCoordinates[0],
      longitude: officeLocationCoordinates.longitude || officeLocationCoordinates[1]
    },
    address: officeLocation,
    timestamp: new Date()
  } : null,
  pickup: loginPickupLocation ? {
    coordinates: {
      latitude: Array.isArray(loginPickupLocation) 
        ? loginPickupLocation[0] 
        : loginPickupLocation.latitude,
      longitude: Array.isArray(loginPickupLocation) 
        ? loginPickupLocation[1] 
        : loginPickupLocation.longitude
    },
    address: loginPickupAddress || '',
    timestamp: new Date()
  } : null,
  drop: logoutDropLocation ? {
    coordinates: {
      latitude: Array.isArray(logoutDropLocation) 
        ? logoutDropLocation[0] 
        : logoutDropLocation.latitude,
      longitude: Array.isArray(logoutDropLocation) 
        ? logoutDropLocation[1] 
        : logoutDropLocation.longitude
    },
    address: logoutDropAddress || '',
    timestamp: new Date()
  } : null
}
```

### Fix 2: Improve Office Location Geocoding

The office location "Vijayanagara" is wrong because the geocoding service is finding the wrong place. We need to ensure coordinates are sent from Flutter.

**File:** `abra_fleet/lib/features/customer/dashboard/presentation/screens/roster_screen.dart`

The code already sends `officeLocationCoordinates` correctly:

```dart
// ✅ This is already correct in roster_screen.dart line ~700:
response = await _rosterRepository.createRoster(
  rosterType: rosterType,
  officeLocation: selectedOfficeLocation!,
  officeLocationCoordinates: officeLocationData != null
      ? LatLng(officeLocationData!.latitude, officeLocationData!.longitude)
      : null,  // Backend will geocode if null
  // ... rest of parameters
);
```

**The issue is:** User is NOT selecting office location from the map picker - they're just typing text!

### Fix 3: Make Office Location Picker Mandatory

Update the roster screen to require office location to be selected from map:

**File:** `abra_fleet/lib/features/customer/dashboard/presentation/screens/roster_screen.dart`

Around line 350, update the office location section:

```dart
// ❌ OLD: Just a text field
TextField(
  controller: _officeLocationController,
  decoration: InputDecoration(
    labelText: 'Office Location',
    hintText: 'Enter office location',
  ),
)

// ✅ NEW: Require map selection
InkWell(
  onTap: _openOfficeLocationPicker,
  child: Container(
    padding: EdgeInsets.all(16),
    decoration: BoxDecoration(
      border: Border.all(color: Colors.grey),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Row(
      children: [
        Icon(Icons.business, color: Theme.of(context).primaryColor),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Office Location', style: TextStyle(fontSize: 12, color: Colors.grey)),
              SizedBox(height: 4),
              Text(
                selectedOfficeLocation ?? 'Tap to select office location',
                style: TextStyle(
                  fontSize: 16,
                  color: selectedOfficeLocation != null ? Colors.black : Colors.grey,
                ),
              ),
            ],
          ),
        ),
        Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
      ],
    ),
  ),
)
```

## Testing Steps

### Step 1: Test with Map Selection
1. Open roster creation screen
2. Tap "Select Office Location"
3. **Use SEARCH** (not GPS button): Type "Kasturi Nagar Bangalore"
4. Select the correct result from search
5. Tap "Confirm Location"
6. Verify office location shows correct address

### Step 2: Test Pickup Location
1. Tap "Select Pickup Location"
2. **Use SEARCH**: Type "2nd Main Road Kasturi Nagar Bangalore"
3. Select result
4. Confirm

### Step 3: Test Drop Location
1. Tap "Select Drop Location"
2. **Use SEARCH**: Type "Chikka Banaswadi Road Kasturi Nagar Bangalore"
3. Select result
4. Confirm

### Step 4: Create Roster
1. Fill in all other fields (dates, times, weekdays)
2. Tap "Create Roster"
3. Check the response in console logs

### Expected Response:
```json
{
  "success": true,
  "data": {
    "officeLocation": "Kasturi Nagar, Bengaluru, Karnataka, 560043",  // ✅ CORRECT!
    "locations": {
      "office": {
        "coordinates": {
          "latitude": 13.0199,  // ✅ HAS VALUES!
          "longitude": 77.6489
        },
        "address": "Kasturi Nagar, Bengaluru, Karnataka, 560043"
      },
      "pickup": {
        "coordinates": {
          "latitude": 13.0205,  // ✅ HAS VALUES!
          "longitude": 77.6495
        },
        "address": "2nd Main Road, Kasturi Nagar, Bengaluru, Karnataka, 560043"
      },
      "drop": {
        "coordinates": {
          "latitude": 13.0189,  // ✅ HAS VALUES!
          "longitude": 77.6512
        },
        "address": "Chikka Banaswadi Road, Kasturi Nagar, Bengaluru, Karnataka, 560043"
      }
    }
  }
}
```

## Quick Fix Commands

### 1. Update Backend Model
```bash
# Edit the file
code abra_fleet_backend/models/roster_model.js

# Find createCustomerRoster method
# Update the locations object as shown above
```

### 2. Restart Backend
```bash
cd abra_fleet_backend
npm start
```

### 3. Test in Flutter
```bash
cd abra_fleet
flutter run
```

## Why This Happened

1. **Array vs Object**: Backend expected arrays `[lat, lng]` but stored them as-is instead of converting to `{latitude, longitude}` objects
2. **No Map Selection**: User typed office location text instead of selecting from map, so no coordinates were sent
3. **Wrong Geocoding**: Backend geocoded "office location text" to wrong place (Vijayanagara)

## Prevention

1. **Always use map picker** for all locations (office, pickup, drop)
2. **Always use SEARCH** feature instead of GPS button when indoors
3. **Verify coordinates** are sent in API request before creating roster

## Summary

**Problem:** Empty coordinates `{}` and wrong office location

**Solution:** 
1. Fix backend to convert array `[lat, lng]` to object `{latitude, longitude}`
2. Require office location to be selected from map (not just typed)
3. Use SEARCH feature for accurate location selection

**Result:** All locations will have proper coordinates and correct addresses! ✅

---

*Last Updated: January 20, 2026*
*Issue: Roster location coordinates empty*
*Status: Solution Provided - Needs Backend Update*
