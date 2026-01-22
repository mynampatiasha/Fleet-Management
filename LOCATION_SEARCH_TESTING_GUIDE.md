# Location Search Testing Guide

## Quick Test Checklist

### 1. Search Functionality Tests

#### Test 1: Company Search
```
✓ Open customer roster creation screen
✓ Click on "Select Pickup Location"
✓ Type: "Infosys"
✓ Expected: See multiple Infosys locations with full addresses
✓ Verify: Each result shows building name, area, and city
```

#### Test 2: Area Search
```
✓ Type: "Electronic City"
✓ Expected: See Electronic City locations and nearby landmarks
✓ Verify: Results include phase numbers and specific areas
```

#### Test 3: Landmark Search
```
✓ Type: "Lalbagh"
✓ Expected: See Lalbagh Botanical Garden
✓ Verify: Full address with area and pincode
```

#### Test 4: Partial Search (Autocomplete)
```
✓ Type: "Inf" (partial)
✓ Expected: See suggestions starting with "Inf"
✓ Type: "os" (continue typing)
✓ Expected: Results update to show "Infos" matches
✓ Verify: Suggestions appear within 300ms of stopping typing
```

### 2. Map Interaction Tests

#### Test 5: Tap on Map
```
✓ Open location picker
✓ Tap anywhere on the map
✓ Expected: See "Loading address..." message
✓ Expected: Address appears within 2-3 seconds
✓ Verify: Address is formatted (not just coordinates)
```

#### Test 6: Move Map and Tap
```
✓ Drag map to different location
✓ Tap on new location
✓ Expected: New address loads
✓ Verify: Previous selection is replaced
```

### 3. Selection Tests

#### Test 7: Select from Search Results
```
✓ Search for "Koramangala"
✓ Tap first result
✓ Expected: Map moves to that location
✓ Expected: Marker appears on map
✓ Expected: Address shown in search bar
✓ Verify: "Confirm Location" button is enabled
```

#### Test 8: Confirm Location
```
✓ Select any location
✓ Tap "Confirm Location"
✓ Expected: Return to roster screen
✓ Expected: Selected address appears in pickup/drop field
✓ Verify: Coordinates are saved (check by editing roster)
```

### 4. Edge Cases

#### Test 9: No Internet Connection
```
✓ Turn off internet
✓ Try to search
✓ Expected: Error message appears
✓ Verify: App doesn't crash
```

#### Test 10: Very Long Address
```
✓ Search for detailed address with multiple commas
✓ Expected: Address is truncated nicely in UI
✓ Verify: Full address is still saved
```

#### Test 11: Special Characters
```
✓ Type: "M.G. Road"
✓ Expected: Results for MG Road
✓ Verify: Special characters handled correctly
```

#### Test 12: Empty Search
```
✓ Focus on search bar without typing
✓ Expected: See recent searches or popular places
✓ Verify: Helpful suggestions shown
```

### 5. Performance Tests

#### Test 13: Fast Typing
```
✓ Type quickly: "InfosysElectronicCity"
✓ Expected: Only one search triggered (after 300ms pause)
✓ Verify: No lag or stuttering
```

#### Test 14: Multiple Searches
```
✓ Search for "Infosys"
✓ Clear and search for "Wipro"
✓ Clear and search for "TCS"
✓ Expected: Each search completes quickly
✓ Verify: Results are cached (second search for same term is instant)
```

### 6. Visual Feedback Tests

#### Test 15: Loading States
```
✓ Start typing
✓ Expected: Loading indicator appears in search bar
✓ Expected: Loading indicator disappears when results load
✓ Verify: Smooth transitions
```

#### Test 16: Icons and Colors
```
✓ Search for different types of locations
✓ Expected: Business locations have business icon
✓ Expected: Landmarks have landmark icon
✓ Expected: Addresses have location icon
✓ Verify: Icons are color-coded
```

## Expected Results Summary

### Search Results Should Show:
- ✅ **Title**: Main location name (e.g., "Infosys Limited")
- ✅ **Subtitle**: Full address (e.g., "Electronic City Phase 1, Bangalore, Karnataka 560100")
- ✅ **Icon**: Type-specific icon (business, landmark, address)
- ✅ **Coordinates**: Valid lat/lng when tapped

### Address Format Should Be:
```
Building/Company Name
Road/Street Name, Area/Suburb
City, State Pincode
```

Example:
```
Infosys Limited
Electronic City Phase 1, Hosur Road
Bangalore, Karnataka 560100
```

### NOT Like This (Old Format):
```
12.9716, 77.5946
```

## Common Test Locations (Bangalore)

Use these for consistent testing:

1. **Infosys Electronic City** - Should return multiple campuses
2. **Wipro Sarjapur Road** - Should return Wipro offices
3. **Manyata Tech Park** - Should return tech park location
4. **Koramangala 5th Block** - Should return area with landmarks
5. **Indiranagar Metro Station** - Should return transport location
6. **Lalbagh Botanical Garden** - Should return landmark
7. **Bangalore Palace** - Should return tourist attraction
8. **Kempegowda International Airport** - Should return airport

## Success Criteria

### ✅ Search is successful if:
1. Results appear within 1-2 seconds
2. Results are relevant to query
3. Full addresses are shown (not coordinates)
4. Tapping result moves map to correct location
5. Confirming location saves full address

### ✅ Map interaction is successful if:
1. Tapping map shows loading indicator
2. Address loads within 2-3 seconds
3. Address is formatted and readable
4. Multiple taps work correctly

### ✅ Overall UX is successful if:
1. No crashes or errors
2. Smooth typing experience
3. Clear visual feedback
4. Easy to understand results
5. Feels like Google Maps

## Debugging Tips

### If search returns no results:
1. Check internet connection
2. Try adding "Bangalore" to query
3. Check console for API errors
4. Verify OpenStreetMap API is accessible

### If addresses show as coordinates:
1. Check reverse geocoding is working
2. Verify API response format
3. Check address formatting logic
4. Look for parsing errors in console

### If search is slow:
1. Check network speed
2. Verify rate limiting isn't too aggressive
3. Check if caching is working
4. Look for unnecessary API calls

## Reporting Issues

When reporting issues, include:
1. **Query used**: What you searched for
2. **Expected result**: What you expected to see
3. **Actual result**: What actually happened
4. **Screenshots**: Visual proof of issue
5. **Console logs**: Any error messages
6. **Device**: Android/iOS, version
7. **Network**: WiFi/Mobile data

## Quick Commands for Testing

### Test Search Directly (Debug Mode)
```dart
// In location_picker_screen.dart, tap debug button
// Or use this in console:
await _locationService.testSearch('Infosys Bangalore');
```

### Clear Cache
```dart
// To test without cache:
_enhancedSearch.clearCache();
```

### Check Current Location
```dart
// Verify location services:
final location = await _locationService.getCurrentLocation();
print('Current: ${location?.latitude}, ${location?.longitude}');
```

## Test Coverage

- [x] Basic search functionality
- [x] Autocomplete/real-time search
- [x] Map tap interaction
- [x] Result selection
- [x] Address formatting
- [x] Caching
- [x] Rate limiting
- [x] Error handling
- [x] Visual feedback
- [x] Performance

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Document any issues found
3. ✅ Test with real users
4. ✅ Gather feedback
5. ✅ Iterate on improvements

---

**Remember**: The goal is to make location selection as easy and accurate as Google Maps. Users should never see raw coordinates - always full, readable addresses!
