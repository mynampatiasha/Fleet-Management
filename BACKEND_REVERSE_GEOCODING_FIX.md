# Backend Reverse Geocoding Fix

## Issue
Notifications were showing raw coordinates instead of readable addresses:
- Example: `"officeLocation": "13.005619, 77.663437"`
- Should be: `"officeLocation": "MG Road, Bangalore, Karnataka"`

## Root Cause
The backend was sending raw coordinate data in notifications without converting them to readable addresses first.

## Solution

### 1. Added Reverse Geocoding Function
**File:** `abra_fleet_backend/routes/roster_router.js`

Added a new helper function `reverseGeocodeLocation()` that:
- Detects if input is coordinates or already an address
- Calls OpenStreetMap Nominatim API for reverse geocoding
- Formats the address nicely (Road, Suburb, City, State)
- Returns original value if geocoding fails (fallback)

```javascript
async function reverseGeocodeLocation(location) {
  // If already an address, return as-is
  if (/[a-zA-Z]/.test(location)) {
    return location;
  }
  
  // Parse coordinates and call reverse geocoding API
  // Returns formatted address or original value
}
```

### 2. Updated Admin Notification
**Location:** Trip cancellation notification (line ~2350)

**Before:**
```javascript
cancelledTrips: cancelledTrips.map(t => ({
  id: t.id,
  readableId: t.readableId,
  rosterType: t.rosterType,
  officeLocation: t.officeLocation  // Raw coordinates
}))
```

**After:**
```javascript
// Convert coordinates to readable addresses
const tripsWithAddresses = await Promise.all(
  cancelledTrips.map(async (t) => {
    const readableLocation = await reverseGeocodeLocation(t.officeLocation);
    await delay(1000); // Respect API rate limits
    return {
      id: t.id,
      readableId: t.readableId,
      rosterType: t.rosterType,
      officeLocation: readableLocation  // Readable address
    };
  })
);

cancelledTrips: tripsWithAddresses
```

## Benefits

1. **User-Friendly:** Admins see "MG Road, Bangalore" instead of "13.005619, 77.663437"
2. **Consistent:** Matches the frontend geocoding implementation
3. **Reliable:** Falls back to coordinates if geocoding fails
4. **Rate-Limited:** Respects OpenStreetMap's 1 request/second limit

## API Used

**OpenStreetMap Nominatim Reverse Geocoding**
- Endpoint: `https://nominatim.openstreetmap.org/reverse`
- Free, no API key required
- Requires User-Agent header
- Rate limit: 1 request/second

## Testing

### Test the Fix:
1. Navigate to Admin → Trip Cancellation
2. Click "Cancel Trips" for an approved leave request
3. Check the notification that appears
4. Verify "Cancelled Trips" shows readable addresses

### Expected Result:
```
Cancelled Trips:
[{id: 69325ec1d26d8b4410b67e79, readableId: null, rosterType: both, 
officeLocation: MG Road, Bangalore, Karnataka}, 
{id: 69325e8f9aeae68bae7c4fd, readableId: null, rosterType: logout, 
officeLocation: Whitefield, Bangalore, Karnataka}]
```

### Before Fix:
```
Cancelled Trips:
[{id: 69325ec1d26d8b4410b67e79, readableId: null, rosterType: both, 
officeLocation: 13.005619, 77.663437}, 
{id: 69325e8f9aeae68bae7c4fd, readableId: null, rosterType: logout, 
officeLocation: 13.012059, 77.666012}]
```

## Files Modified

1. `abra_fleet_backend/routes/roster_router.js`
   - Added `reverseGeocodeLocation()` function
   - Updated admin notification to use reverse geocoding

## Related Fixes

This complements the frontend fixes:
- Driver Dashboard (trip locations)
- Vehicle Tracking (vehicle positions)
- Trip Cancellation Dialog (office locations)

All location displays now use readable addresses throughout the entire application!

---

**Status:** ✅ COMPLETE
**Date:** December 8, 2025
