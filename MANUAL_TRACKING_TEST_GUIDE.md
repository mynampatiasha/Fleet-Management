# 📋 Manual Testing Guide - Live Tracking Integration

## Prerequisites

✅ Backend is running on `http://localhost:3000`
✅ Flutter app is running (web or mobile)
✅ You have driver and customer test accounts

## Test Scenario 1: Driver Starts GPS Tracking

### Step 1: Login as Driver
1. Open the Flutter app
2. Login with driver credentials:
   - Email: `driver@test.com` (or your driver email)
   - Password: Your driver password

### Step 2: Navigate to Driver Dashboard
1. You should see the **Driver Dashboard**
2. Look for the **"Today's Route"** card

### Step 3: Check Today's Route
**Expected to see:**
- ✅ Vehicle information (registration number, model)
- ✅ Customer count
- ✅ Total distance
- ✅ List of customers with addresses
- ✅ Two buttons at the bottom:
  - **"Start GPS"** (green button)
  - **"Live View"** (blue button)

### Step 4: Start GPS Tracking
1. Click the **"Start GPS"** button
2. **Expected result:**
   - ✅ Green snackbar message: "GPS Tracking Started"
   - ✅ Backend console should show location updates every 30 seconds

**Backend logs to watch for:**
```
📍 Location update received
Driver: [driver_id]
Position: [lat], [lng]
Speed: [speed] m/s
```

### Step 5: Open Live Trip View
1. Click the **"Live View"** button
2. **Expected to see:**
   - ✅ Vehicle number at top
   - ✅ Progress: "0/X Completed • Y.Y km"
   - ✅ **"Start Trip"** button (green)
   - ✅ List of all customers with:
     - Sequence number (1, 2, 3...)
     - Customer name
     - Address
     - Phone number
     - Pickup time
     - Navigation button (🧭)
     - "Picked Up" button

### Step 6: Start the Trip
1. Click **"Start Trip"** button
2. **Expected result:**
   - ✅ Green snackbar: "Trip started! GPS tracking active"
   - ✅ Button changes to green badge: "Tracking Active"
   - ✅ Green dot appears in app bar (tracking indicator)

### Step 7: Navigate to Customer
1. Click the navigation icon (🧭) next to any customer
2. **Expected result:**
   - ✅ Opens Google Maps with directions to customer location

### Step 8: Mark Customer as Picked Up
1. Click **"Picked Up"** button for first customer
2. **Expected result:**
   - ✅ Customer card turns green
   - ✅ Checkmark icon appears
   - ✅ Progress updates: "1/X Completed"
   - ✅ Green snackbar: "Customer marked as picked up"

---

## Test Scenario 2: Customer Tracks Driver

### Step 1: Login as Customer
1. Open another browser/device
2. Login with customer credentials:
   - Email: `customer@test.com` (or your customer email)
   - Password: Your customer password

### Step 2: Navigate to Customer Dashboard
1. You should see the **Customer Dashboard**
2. Look for the **"Track My Vehicle"** card (blue gradient card)

### Step 3: Check Tracking Card
**Expected to see:**
- ✅ Blue location icon
- ✅ Title: "Track My Vehicle"
- ✅ Subtitle: "See live location of your driver"
- ✅ **"Track Now"** button (blue)

### Step 4: Open Tracking Screen
1. Click **"Track Now"** button
2. **Expected to see:**
   - ✅ Loading indicator initially
   - ✅ Then a map with:
     - Driver location (blue car icon)
     - Customer location (red pin)
     - Dotted line connecting them

### Step 5: Check Live Status
**Top status card should show:**
- ✅ Green background if driver is online
- ✅ "Driver is on the way" message
- ✅ Three info chips:
  - Distance: "X.X km away"
  - ETA: "Y mins"
  - Speed: "Z km/h"

### Step 6: Watch Real-Time Updates
**Every 30 seconds, you should see:**
- ✅ Driver car icon moves on map
- ✅ Distance updates
- ✅ ETA recalculates
- ✅ Speed updates

### Step 7: Check "Arriving Soon" Alert
**When driver is within 500m:**
- ✅ Orange alert appears: "🚗 Vehicle arriving soon! Get ready"
- ✅ Distance chip turns orange

### Step 8: Check Customer Details
**Bottom card should show:**
- ✅ "Your Pickup Details" title
- ✅ Customer name
- ✅ Pickup address
- ✅ Scheduled pickup time

---

## Test Scenario 3: Backend Verification

### Check Backend Logs

**When driver starts tracking, you should see:**
```
📥 INCOMING REQUEST
POST /api/tracking/start
✅ Tracking started for driver: [driver_id]
```

**Every 30 seconds, you should see:**
```
📥 INCOMING REQUEST
POST /api/tracking/location
📍 Location update received
Driver: [driver_id]
Position: [lat], [lng]
Speed: [speed] m/s
```

**When customer views tracking:**
```
📥 INCOMING REQUEST
GET /api/tracking/trip/[trip_id]
✅ Trip location retrieved
```

**When driver stops tracking:**
```
📥 INCOMING REQUEST
POST /api/tracking/stop
✅ Tracking stopped for driver: [driver_id]
```

---

## Troubleshooting

### ❌ "Start GPS" button does nothing
**Check:**
1. Is the driver logged in?
2. Does the driver have a route assigned for today?
3. Check browser console for errors
4. Check backend logs for errors

### ❌ Customer sees "Waiting for driver location..."
**Possible causes:**
1. Driver hasn't started GPS tracking yet
2. Trip ID is incorrect
3. Backend not receiving location updates
4. Check backend logs for location updates

### ❌ Map not showing
**Check:**
1. Internet connection (map tiles need to load)
2. Browser console for errors
3. flutter_map package is installed
4. Location permissions granted

### ❌ Distance/ETA not updating
**Check:**
1. Driver is sending location updates (check backend logs)
2. Customer is polling for updates
3. Network connection is stable

---

## Success Criteria

### ✅ Driver Side:
- [x] Can start GPS tracking from dashboard
- [x] Can view live trip with customer list
- [x] Can navigate to each customer
- [x] Can mark customers as picked up
- [x] Tracking indicator shows green when active
- [x] Location updates sent to backend every 30s

### ✅ Customer Side:
- [x] Can see "Track My Vehicle" card
- [x] Can open tracking screen
- [x] Can see driver location on map
- [x] Distance and ETA update in real-time
- [x] "Arriving soon" shows when driver is close
- [x] Can see own pickup details

### ✅ Backend:
- [x] `/api/tracking/start` endpoint works
- [x] `/api/tracking/location` endpoint receives updates
- [x] `/api/tracking/trip/:tripId` endpoint returns data
- [x] `/api/tracking/stop` endpoint works
- [x] Location data stored correctly
- [x] Real-time updates working

---

## Quick Test Commands

### Test Backend Health:
```bash
curl http://localhost:3000/health
```

### Test Tracking Start (with auth token):
```bash
curl -X POST http://localhost:3000/api/tracking/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"driverId":"driver123","vehicleId":"vehicle123"}'
```

### Test Get Trip Location:
```bash
curl http://localhost:3000/api/tracking/trip/TRIP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Expected Timeline

1. **Driver starts GPS** → Immediate
2. **First location update** → Within 30 seconds
3. **Customer sees driver** → Within 30 seconds of first update
4. **Location updates** → Every 30 seconds
5. **"Arriving soon" alert** → When within 500m

---

## Notes

- Location updates happen every **30 seconds** (configurable in `BackendLocationTrackingService`)
- "Arriving soon" threshold is **500 meters** (configurable)
- ETA calculation assumes average speed of **20 km/h** if driver is stationary
- Map uses OpenStreetMap tiles (requires internet)

---

## Next Steps After Testing

If all tests pass:
1. ✅ Integration is complete and working
2. Consider adding push notifications
3. Consider adding trip history
4. Consider adding admin live map view

If tests fail:
1. Check error messages in console
2. Check backend logs
3. Verify authentication tokens
4. Verify route data exists
5. Check network connectivity
