# Quick Answer: Where is Vehicle and Driver Data?

## The Answer
**The vehicle and driver data is showing "⏳ Pending" because the rosters haven't been assigned through Route Optimization yet.**

This is **NOT a bug** - it's the expected workflow!

## Why This Happens

### Step 1: Roster Creation
When you import rosters (bulk import or manual creation):
- ✅ Customer data is saved
- ✅ Trip details are saved
- ✅ Status is set to "ASSIGNED"
- ❌ Vehicle is NOT assigned yet
- ❌ Driver is NOT assigned yet

### Step 2: Route Optimization (Required!)
To assign vehicle and driver, you must:
1. Go to **Admin Dashboard** → **Customer Management** → **Pending Rosters**
2. Select the rosters you want to assign
3. Click **"Route Optimization"** button
4. System will suggest optimal vehicle based on:
   - Seat capacity
   - Organization match
   - Time-based availability
   - Vehicle status
5. Click **"Confirm Assignment"**
6. ✅ Vehicle and driver are NOW assigned!

### Step 3: View in Trips
After route optimization:
- Go to **Client Management** → **Trips**
- You'll now see actual vehicle numbers and driver names
- Data shows in color (blue for vehicle, green for driver)

## What You'll See Now

### Before Route Optimization:
```
Vehicle: ⏳ Pending (grey, italic)
Driver:  ⏳ Pending (grey, italic)
```

### After Route Optimization:
```
Vehicle: KA01AB1234 (blue, bold)
Driver:  Ravi Kumar (green, bold)
```

## Info Banner
When you have trips with pending assignments, you'll see this banner:

```
⚠️ Pending Route Assignment

Some trips are awaiting vehicle and driver assignment.
Go to Pending Rosters → Route Optimization to assign them.
```

## Quick Steps to Fix

1. **Go to Pending Rosters**
   - Admin Dashboard → Customer Management → Pending Rosters

2. **Select Rosters**
   - Check the boxes for rosters you want to assign
   - Or use "Select All" for bulk assignment

3. **Click Route Optimization**
   - Button at the top of the screen
   - System will analyze and suggest best vehicle

4. **Confirm Assignment**
   - Review the suggested vehicle
   - Click "Confirm Assignment"
   - Wait for success message

5. **Check Trips Screen**
   - Go to Client Management → Trips
   - Vehicle and driver data now visible!

## Database Structure

### Roster Document (Before Assignment):
```json
{
  "_id": "675a1b2c...",
  "customerName": "Asha Sharma",
  "customerEmail": "asha.sharma@wipro.com",
  "status": "assigned",
  "officeLocation": "Wipro Campus",
  "vehicleId": null,        // ← Empty
  "vehicleNumber": null,    // ← Empty
  "driverId": null,         // ← Empty
  "driverName": null        // ← Empty
}
```

### Roster Document (After Assignment):
```json
{
  "_id": "675a1b2c...",
  "customerName": "Asha Sharma",
  "customerEmail": "asha.sharma@wipro.com",
  "status": "assigned",
  "officeLocation": "Wipro Campus",
  "vehicleId": "675a1234...",     // ✅ Assigned
  "vehicleNumber": "KA01AB1234",  // ✅ Assigned
  "driverId": "675a5678...",      // ✅ Assigned
  "driverName": "Ravi Kumar",     // ✅ Assigned
  "assignedAt": "2025-12-12T10:30:00Z"
}
```

## Common Questions

### Q: Why don't rosters auto-assign vehicles?
**A:** Route optimization considers multiple factors:
- Seat capacity vs number of customers
- Organization segregation
- Time-based vehicle sharing
- Driver availability
- Optimal routing

Auto-assignment could create conflicts or inefficient routes.

### Q: Can I manually assign a vehicle?
**A:** Yes! In the Route Optimization dialog:
1. System suggests optimal vehicle
2. You can choose a different vehicle from the list
3. Click "Confirm Assignment"

### Q: What if I have 100 rosters to assign?
**A:** Use bulk assignment:
1. Select all rosters (checkbox at top)
2. Click "Route Optimization"
3. System will group them intelligently
4. Assign to multiple vehicles if needed

### Q: Can I see which trips are pending?
**A:** Yes! The UI now shows:
- "⏳ Pending" in grey italic for unassigned
- Actual data in color for assigned
- Info banner when pending assignments exist
- Filter by status to see only assigned/ongoing/completed

## Technical Details

### Backend Endpoint:
```javascript
GET /api/roster/admin/assigned-trips
```

Returns all trips with status:
- `assigned`, `scheduled`
- `ongoing`, `in_progress`, `started`
- `completed`, `done`
- `cancelled`

### Frontend Service:
```dart
// In roster_service.dart
Future<Map<String, dynamic>> getAssignedTrips() async {
  final response = await _apiService.get('/api/roster/admin/assigned-trips');
  return response;
}
```

### UI Logic:
```dart
// Check if assigned
final hasVehicle = trip['vehicleNumber'] != null && 
                   trip['vehicleNumber'].toString().isNotEmpty;
final hasDriver = trip['driverName'] != null && 
                  trip['driverName'].toString().isNotEmpty;

// Display accordingly
final vehicleNumber = hasVehicle ? trip['vehicleNumber'] : '⏳ Pending';
final driverName = hasDriver ? trip['driverName'] : '⏳ Pending';
```

## Summary

✅ **Working as designed** - Rosters need route optimization to get vehicle/driver data
✅ **Clear indicators** - "⏳ Pending" shows what needs action
✅ **Helpful guidance** - Info banner directs you to route optimization
✅ **Visual feedback** - Grey/italic for pending, color/bold for assigned

**Next Step:** Go to Pending Rosters → Route Optimization to assign vehicles and drivers!
