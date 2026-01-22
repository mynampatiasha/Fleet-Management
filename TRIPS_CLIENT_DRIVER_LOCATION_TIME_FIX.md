# Trips Client - Driver Info & Location/Time Details Fix

## Problem
The Trips page in Client Management (Admin module) was not showing:
- Driver name
- Driver phone number
- Pickup location
- Drop location
- Pickup time
- Drop time

## Root Cause
1. **Backend Issue**: The `/api/roster/admin/assigned-trips` endpoint was not fetching driver details from the `drivers` collection
2. **Data Structure**: Driver information is stored in a nested `personalInfo` object with fields like `personalInfo.firstName`, `personalInfo.lastName`, and `personalInfo.phone`
3. **Missing Fields**: The API response wasn't including pickup/drop locations and times

## Solution

### Backend Changes (`abra_fleet_backend/routes/roster_router.js`)

1. **Fetch Driver Details**: Added code to fetch driver information from the `drivers` collection using `driverId`
2. **Handle Nested Structure**: Updated to extract driver name and phone from the nested `personalInfo` object
3. **Include Location/Time Fields**: Added pickup/drop locations and times to the API response

```javascript
// Get unique driver IDs to fetch driver details
const driverIds = [...new Set(trips.map(t => t.driverId).filter(Boolean))];

// Fetch driver details from drivers collection
const driversMap = {};
if (driverIds.length > 0) {
  const drivers = await req.db.collection('drivers').find({
    driverId: { $in: driverIds }
  }).toArray();
  
  drivers.forEach(driver => {
    // Handle nested personalInfo structure
    const firstName = driver.personalInfo?.firstName || driver.firstName || '';
    const lastName = driver.personalInfo?.lastName || driver.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || driver.name || driver.driverName || '';
    const phone = driver.personalInfo?.phone || driver.phone || driver.phoneNumber || '';
    
    driversMap[driver.driverId] = {
      name: fullName,
      phone: phone
    };
  });
}

// In transformation:
const driverId = trip.driverId || '';
const driverInfo = driversMap[driverId] || {};
const driverName = driverInfo.name || trip.driverName || '';
const driverPhone = driverInfo.phone || trip.driverPhone || '';

// Extract pickup and drop locations
const pickupLocation = trip.pickupLocation || trip.homeLocation || '';
const dropLocation = trip.dropLocation || trip.dropoffLocation || trip.officeLocation || '';

// Extract pickup and drop times
const pickupTime = trip.pickupTime || trip.startTime || '';
const dropTime = trip.dropTime || trip.dropoffTime || trip.endTime || '';
```

### Frontend Changes (`abra_fleet/lib/features/admin/client_management/trips_client.dart`)

1. **Trip Card Display**: Updated to show driver phone, pickup/drop locations, and pickup/drop times
2. **Trip Details Dialog**: Enhanced to display all the new fields

```dart
final driverPhone = trip['driverPhone'] ?? 'N/A';
final pickupLocation = trip['pickupLocation'] ?? '';
final dropLocation = trip['dropLocation'] ?? '';
final pickupTime = trip['pickupTime'] ?? '';
final dropTime = trip['dropTime'] ?? '';

// Display driver phone
if (driverPhone.isNotEmpty && driverPhone != 'N/A') ...[
  _buildInfoRow(
    icon: Icons.phone,
    label: 'Driver Phone',
    value: driverPhone,
    color: const Color(0xFF10B981),
  ),
],

// Display pickup and drop locations
if (pickupLocation.isNotEmpty)
  _buildInfoRow(
    icon: Icons.location_on,
    label: 'Pickup',
    value: pickupLocation,
    color: const Color(0xFFEF4444),
  ),
if (dropLocation.isNotEmpty)
  _buildInfoRow(
    icon: Icons.location_on_outlined,
    label: 'Drop',
    value: dropLocation,
    color: const Color(0xFFEF4444),
  ),

// Display pickup and drop times
if (pickupTime.isNotEmpty)
  _buildInfoRow(
    icon: Icons.access_time,
    label: 'Pickup Time',
    value: pickupTime,
    color: const Color(0xFFF59E0B),
  ),
if (dropTime.isNotEmpty)
  _buildInfoRow(
    icon: Icons.access_time_filled,
    label: 'Drop Time',
    value: dropTime,
    color: const Color(0xFFF59E0B),
  ),
```

## Testing

Run the test script to verify:
```bash
cd abra_fleet_backend
node test-trips-client-api.js
```

Expected output:
```
Trip 1:
  Customer: Rajesh Kumar
  Status: assigned
  Vehicle: KA01AB1240
  Driver ID: DRV-852306
  Driver Name: Rajesh Kumar
  Driver Phone: 9123456789
  Pickup Location: Electronic City, Bangalore
  Drop Location: Infosys Campus, Electronic City
  Pickup Time: 08:00
  Drop Time: N/A
```

## How to Apply

1. **Restart Backend**:
   ```bash
   cd abra_fleet_backend
   # Stop the current backend (Ctrl+C)
   node index.js
   ```

2. **Hot Reload Flutter** (if running):
   - Press `r` in the terminal where Flutter is running
   - Or restart the app

3. **Test the Trips Page**:
   - Login as Admin or Client
   - Navigate to Client Management → Trips
   - Verify all fields are now showing:
     - ✅ Driver Name
     - ✅ Driver Phone
     - ✅ Pickup Location
     - ✅ Drop Location
     - ✅ Pickup Time
     - ✅ Drop Time (if available)

## Data Structure Reference

### Roster Document
```javascript
{
  customerName: "Rajesh Kumar",
  customerEmail: "rajesh.kumar@infosys.com",
  customerPhone: "+91 9876543210",
  vehicleNumber: "KA01AB1240",
  driverId: "DRV-852306",
  pickupLocation: "Electronic City, Bangalore",
  dropLocation: "Infosys Campus, Electronic City",
  pickupTime: "08:00",
  status: "assigned",
  tripType: "pickup"
}
```

### Driver Document
```javascript
{
  driverId: "DRV-852306",
  personalInfo: {
    firstName: "Rajesh",
    lastName: "Kumar",
    phone: "9123456789",
    email: "drivertest@gmail.com"
  },
  assignedVehicle: "KA01AB1240"
}
```

## Status
✅ **COMPLETE** - All essential roster details are now displayed in the Trips Client page including driver name, phone, pickup/drop locations, and times.
