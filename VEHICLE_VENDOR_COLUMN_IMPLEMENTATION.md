# Vehicle Vendor Column Implementation

## Overview
Added a "Vendor" column to the Vehicle Master screen to track which vendor each vehicle is sourced from. This allows the fleet manager to distinguish between owned vehicles and vehicles sourced from external vendors.

## Changes Made

### 1. Frontend - Flutter App

#### Vehicle Entity (`vehicle_entity.dart`)
- Added `vendor` field to the `Vehicle` class
- Updated `fromJson`, `toJson`, and `copyWith` methods to handle vendor field
- Vendor is optional (nullable String)

#### Vehicle Master UI (`vehicle_master.dart`)
- Added `vendor` field to `_VehicleData` class
- Updated `fromBackend` factory to parse vendor from API response
- Added "Vendor" column to the DataTable (positioned after Model column)
- Vendor column displays:
  - Purple business icon + vendor name if vendor is specified
  - Blue home icon + "Own Fleet" if no vendor specified
- Added vendor to vehicle details view
- Added vendor to card list view
- Updated export data to include vendor column

#### Add/Edit Vehicle Form (`add_vehicle.dart`)
- Added `_vendorController` TextEditingController
- Added vendor input field in the Basic Information section
- Field is optional with placeholder "e.g., ABC Transport Services"
- Updated form submission to include vendor in create/update requests
- Vendor field properly initialized when editing existing vehicles

#### Vehicle Service (`vehicle_service.dart`)
- Added optional `vendor` parameter to `createVehicle` method
- Vendor is included in API request body when provided

### 2. Backend - Node.js API

#### Vehicle Routes (`admin-vehicles.js`)
- Added `vendor` field to vehicle creation schema
- Vendor is stored as nullable field in MongoDB
- Default value is `null` for vehicles without vendor
- Vendor field is preserved during vehicle updates

## Database Schema

```javascript
{
  vehicleId: "VH123456",
  registrationNumber: "KA01AB1234",
  make: "Tata",
  model: "Starbus",
  vendor: "ABC Transport Services", // NEW FIELD - nullable
  // ... other fields
}
```

## UI Display

### DataTable View
```
| Vehicle ID | Registration | Type | Model | Vendor | Seat Capacity | ... |
|------------|--------------|------|-------|--------|---------------|-----|
| VH123456   | KA01AB1234   | BUS  | Tata  | 🏢 ABC | 40 seats      | ... |
| VH123457   | KA02CD5678   | VAN  | Force | 🏠 Own | 12 seats      | ... |
```

### Vehicle Details View
- Vendor field displayed after Year field
- Shows "Own Fleet" if no vendor specified

### Add/Edit Vehicle Form
- Vendor field in Basic Information section
- Optional text input
- Placeholder: "e.g., ABC Transport Services"

## Features

1. **Visual Distinction**: 
   - External vendor vehicles: Purple business icon
   - Own fleet vehicles: Blue home icon

2. **Export Support**: 
   - Vendor column included in CSV/Excel exports
   - Shows "Own Fleet" for vehicles without vendor

3. **Backward Compatibility**: 
   - Existing vehicles without vendor field display as "Own Fleet"
   - No migration required for existing data

4. **Filtering Ready**: 
   - Vendor field can be used for future filtering features
   - Easy to add vendor-based reports

## Testing Checklist

- [x] Add new vehicle with vendor
- [x] Add new vehicle without vendor (shows "Own Fleet")
- [x] Edit existing vehicle to add vendor
- [x] Edit existing vehicle to remove vendor
- [x] View vehicle details with vendor
- [x] Export vehicles data includes vendor column
- [x] DataTable displays vendor correctly
- [x] Card view displays vendor correctly

## Usage

### Adding a Vehicle with Vendor
1. Go to Vehicle Master
2. Click "Add New Vehicle"
3. Fill in required fields
4. Enter vendor name in "Vendor (Optional)" field
5. Save vehicle

### Viewing Vendor Information
- **Table View**: Vendor column shows vendor name or "Own Fleet"
- **Details View**: Vendor field in basic information section
- **Export**: Vendor column included in exported data

## Future Enhancements

1. **Vendor Management**: Create a separate vendor master for standardized vendor names
2. **Vendor Dropdown**: Replace text input with dropdown of registered vendors
3. **Vendor Filtering**: Add filter chip to show vehicles by vendor
4. **Vendor Analytics**: Dashboard showing vehicle distribution by vendor
5. **Vendor Contracts**: Link vendor information to contract management
6. **Cost Tracking**: Track rental/lease costs per vendor

## Notes

- Vendor field is completely optional
- No validation on vendor name format
- Vendor information is for tracking purposes only
- Does not affect vehicle operations or assignments
