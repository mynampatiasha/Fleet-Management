# Driver Export Fix

## Problem
When exporting drivers to CSV, only the Driver ID and Status columns were populated. All other fields (First Name, Last Name, Email, Phone, etc.) were empty.

## Root Cause
The export function was requesting driver data from the backend's list endpoint, which returns a simplified view with only basic fields for performance. The full nested structure (personalInfo, address, license, employment, bankDetails) was not being returned.

## Solution Applied

### 1. Backend Changes (admin-drivers.js)

#### Added fullDetails Query Parameter
Modified the GET `/api/admin/drivers` endpoint to support a `fullDetails=true` query parameter that returns complete driver objects instead of the simplified view:

```javascript
const { status, page = 1, limit = 20, search, fullDetails } = req.query;

// If fullDetails is requested, return complete driver objects
if (fullDetails === 'true') {
  const driversWithVehicles = await Promise.all(
    drivers.map(async (driver) => {
      // Get assigned vehicle details if any
      let assignedVehicle = null;
      if (driver.assignedVehicle) {
        assignedVehicle = await req.db.collection('vehicles').findOne(
          { vehicleId: driver.assignedVehicle },
          { projection: { vehicleId: 1, registrationNumber: 1, make: 1, model: 1 } }
        );
      }
      
      return {
        ...driver,
        assignedVehicle
      };
    })
  );
  
  return res.json({
    success: true,
    data: driversWithVehicles,
    pagination: { ... }
  });
}
```

#### Added Employment and Bank Details Storage
Updated the POST endpoint to accept and store `employment` and `bankDetails` fields:

```javascript
const newDriver = {
  // ... existing fields ...
  employment: req.body.employment ? {
    joinDate: req.body.employment.joinDate,
    employmentType: req.body.employment.employmentType,
    salary: req.body.employment.salary,
    employeeId: req.body.employment.employeeId || driverId
  } : null,
  bankDetails: req.body.bankDetails ? {
    bankName: req.body.bankDetails.bankName,
    accountHolderName: req.body.bankDetails.accountHolder || req.body.bankDetails.accountHolderName,
    accountNumber: req.body.bankDetails.accountNumber,
    ifscCode: req.body.bankDetails.ifscCode
  } : null,
  // ...
};
```

#### Fixed Status Filter
Changed status filter to handle 'All' value:
```javascript
if (status && status !== 'All') filter.status = status;
```

### 2. Frontend Changes

#### Updated DriverService (driver_service.dart)
Added `fullDetails` parameter to the `getDrivers` method:

```dart
Future<Map<String, dynamic>> getDrivers({
  String? status,
  int page = 1,
  int limit = 20,
  String? search,
  bool fullDetails = false,  // NEW
}) async {
  try {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (status != null && status.isNotEmpty) 'status': status,
      if (search != null && search.isNotEmpty) 'search': search,
      if (fullDetails) 'fullDetails': 'true',  // NEW
    };
    // ...
  }
}
```

#### Updated Export Dialog (driver_admin_management_dialogs.dart)

1. **Request full details when exporting:**
```dart
final drivers = await widget.driverService.getDrivers(
  fullDetails: true,  // NEW
  status: _selectedStatus != 'All' ? _selectedStatus.toLowerCase() : null,
  limit: 10000,
);
```

2. **Fixed field name mapping:**
Changed from `employmentDetails` to `employment`:
```dart
if (_includeEmployment) {
  final employment = driver['employment'] ?? {};  // Was: employmentDetails
  row.addAll([
    employment['employeeId'] ?? driver['driverId'] ?? '',
    employment['joinDate'] ?? '',
    employment['employmentType'] ?? '',
    employment['salary'] ?? '',
  ]);
}
```

3. **Fixed bank details field name:**
```dart
if (_includeBankDetails) {
  final bank = driver['bankDetails'] ?? {};
  row.addAll([
    bank['bankName'] ?? '',
    bank['accountHolderName'] ?? bank['accountHolder'] ?? '',  // Handle both field names
    bank['accountNumber'] ?? '',
    bank['ifscCode'] ?? '',
  ]);
}
```

## Testing Steps

1. **Restart the backend server:**
   ```bash
   cd abra_fleet_backend
   node index.js
   ```

2. **Restart the Flutter app** to load the updated code

3. **Test Export:**
   - Go to Driver Management
   - Click Export button
   - Select CSV format
   - Check the export options (Personal Info, Address, License, etc.)
   - Click Export
   - Open the downloaded CSV file
   - Verify all fields are populated correctly

4. **Test Import:**
   - Use the fixed CSV template
   - Import drivers with all fields
   - Verify they're saved correctly
   - Export them again to confirm all data is preserved

## Files Modified

### Backend
- `abra_fleet_backend/routes/admin-drivers.js`
  - Added `fullDetails` query parameter support
  - Added `employment` and `bankDetails` storage
  - Fixed status filter to handle 'All'

### Frontend
- `abra_fleet/lib/core/services/driver_service.dart`
  - Added `fullDetails` parameter to `getDrivers` method

- `abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_dialogs.dart`
  - Updated export to request full details
  - Fixed field name mapping (employmentDetails → employment)
  - Fixed bank details field name handling

## Expected Result

When you export drivers now, the CSV will contain all selected fields:
- Driver ID ✓
- Status ✓
- First Name ✓
- Last Name ✓
- Email ✓
- Phone ✓
- DOB ✓
- Gender ✓
- Blood Group ✓
- Address fields ✓
- License details ✓
- Employment info ✓
- Bank details ✓

All fields will be properly populated with data from the database.
