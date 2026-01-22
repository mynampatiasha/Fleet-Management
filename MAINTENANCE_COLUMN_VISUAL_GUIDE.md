# Maintenance Column - Visual Guide 🔧

## What Was Added

A new **"Maintenance"** column has been added to the Vehicle Master table that shows the count of scheduled maintenances for each vehicle.

## Visual Appearance

### When Maintenance Schedules Exist (Count > 0)
```
┌─────────────────────────────────┐
│  🔧  3  scheduled               │  ← Orange background
└─────────────────────────────────┘
   ↑   ↑      ↑
   │   │      └─ Label text
   │   └─ Count (bold)
   └─ Wrench icon
```
- **Background**: Light orange (`Colors.orange.shade50`)
- **Border**: Orange (`Colors.orange.shade300`)
- **Text Color**: Dark orange (`Colors.orange.shade700`)
- **Icon**: Build/wrench icon in orange

### When No Maintenance Schedules (Count = 0)
```
┌─────────────────────────────────┐
│  🔧  0  scheduled               │  ← Grey background
└─────────────────────────────────┘
```
- **Background**: Light grey (`Colors.grey.shade50`)
- **Border**: Grey (`Colors.grey.shade300`)
- **Text Color**: Grey (`Colors.grey.shade600`)
- **Icon**: Build/wrench icon in grey

## Interaction

### Click Behavior
1. **User clicks** on the maintenance cell
2. **Navigation** to Maintenance Management page
3. **Snackbar** appears: "Opening maintenance management for [Vehicle Number]"
4. **On return**, vehicle list automatically refreshes

### Hover Effect
- InkWell provides visual feedback
- Cursor changes to pointer
- Slight ripple effect on click

## Table Layout Example

```
┌──────────┬──────────────┬──────┬───────────┬──────┬──────────┬──────────────┬──────────────────┬─────────────────┬────────┬───────────┬──────────────────────┬─────────┐
│ Vehicle  │ Registration │ Type │   Model   │ Year │  Vendor  │     Seat     │       Seat       │    Assigned     │ Status │ Documents │     Maintenance      │ Actions │
│    ID    │              │      │           │      │          │   Capacity   │   Availability   │      Driver     │        │           │                      │         │
├──────────┼──────────────┼──────┼───────────┼──────┼──────────┼──────────────┼──────────────────┼─────────────────┼────────┼───────────┼──────────────────────┼─────────┤
│  V001    │  KA01AB1234  │ BUS  │ Tata 2020 │ 2020 │ Own Fleet│  🪑 40 seats │ 🪑 35/40 available│ 👤 John Doe    │ ACTIVE │     ✓     │ 🔧 3 scheduled      │ 👁️ ✏️ 🗑️ │
│          │              │      │           │      │          │              │                  │                 │        │           │ (Orange, Clickable)  │         │
├──────────┼──────────────┼──────┼───────────┼──────┼──────────┼──────────────┼──────────────────┼─────────────────┼────────┼───────────┼──────────────────────┼─────────┤
│  V002    │  KA02CD5678  │ CAR  │ Honda City│ 2021 │ Vendor A │  🪑 4 seats  │ 🪑 2/4 available │ 👤 Jane Smith  │ ACTIVE │     ⚠️    │ 🔧 0 scheduled      │ 👁️ ✏️ 🗑️ │
│          │              │      │           │      │          │              │                  │                 │        │           │ (Grey, Clickable)    │         │
└──────────┴──────────────┴──────┴───────────┴──────┴──────────┴──────────────┴──────────────────┴─────────────────┴────────┴───────────┴──────────────────────┴─────────┘
```

## Code Structure

### 1. Data Model
```dart
class _VehicleData {
  final int maintenanceScheduleCount;  // NEW FIELD
  
  const _VehicleData({
    // ... other fields
    this.maintenanceScheduleCount = 0,
  });
}
```

### 2. Table Column
```dart
DataColumn(
  label: Text('Maintenance', 
    style: TextStyle(fontWeight: FontWeight.bold)
  )
),
```

### 3. Table Cell
```dart
DataCell(
  InkWell(
    onTap: () => _navigateToMaintenanceManagement(
      vehicle.id, 
      vehicle.registration
    ),
    child: Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: vehicle.maintenanceScheduleCount > 0 
          ? Colors.orange.shade50 
          : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: vehicle.maintenanceScheduleCount > 0 
            ? Colors.orange.shade300 
            : Colors.grey.shade300,
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.build_circle, size: 18, color: ...),
          SizedBox(width: 6),
          Text('${vehicle.maintenanceScheduleCount}', ...),
          SizedBox(width: 4),
          Text('scheduled', ...),
        ],
      ),
    ),
  ),
),
```

### 4. Navigation Method
```dart
void _navigateToMaintenanceManagement(String vehicleId, String vehicleNumber) {
  Navigator.of(context).push(
    MaterialPageRoute(
      builder: (context) => const MaintenanceManagementScreen(),
    ),
  ).then((_) {
    _loadVehicles(); // Refresh on return
  });
  
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('Opening maintenance management for $vehicleNumber'),
      backgroundColor: Colors.orange.shade700,
    ),
  );
}
```

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Vehicle Master Table                        │
│                                                                  │
│  Vehicle: KA01AB1234                                            │
│  Maintenance: 🔧 3 scheduled  ← USER CLICKS HERE                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Snackbar: "Opening maintenance management for KA01AB1234"      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              Maintenance Management Screen                       │
│                                                                  │
│  • Schedule Maintenance                                         │
│  • Maintenance Reports                                          │
│  • Cost Analysis                                                │
│  • Vendor Management                                            │
│                                                                  │
│  Scheduled Maintenances:                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ KA01AB1234 - Oil Change - Jan 25, 2026                   │  │
│  │ KA01AB1234 - Tire Rotation - Jan 28, 2026                │  │
│  │ KA01AB1234 - Brake Inspection - Feb 1, 2026              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    USER PRESSES BACK
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              Vehicle Master Table (Refreshed)                    │
│                                                                  │
│  Vehicle: KA01AB1234                                            │
│  Maintenance: 🔧 3 scheduled  ← Updated count if changed        │
└─────────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Quick Overview**: See maintenance status at a glance
2. **Easy Access**: One click to view/manage maintenance
3. **Visual Feedback**: Color coding shows urgency
4. **Always Updated**: Auto-refresh ensures current data
5. **User Friendly**: Clear labels and intuitive design

## Testing

### Manual Test Steps
1. Open Vehicle Master page
2. Look for the "Maintenance" column (after "Documents")
3. Check if counts are displayed correctly
4. Click on a maintenance cell
5. Verify navigation to Maintenance Management page
6. Verify snackbar appears with vehicle number
7. Press back button
8. Verify vehicle list refreshes

### Expected Results
- ✅ Column appears in table
- ✅ Counts display correctly
- ✅ Orange color for count > 0
- ✅ Grey color for count = 0
- ✅ Navigation works
- ✅ Snackbar shows
- ✅ List refreshes on return

## Notes

- The maintenance count comes from the backend
- Backend must include `maintenanceScheduleCount` field in vehicle response
- Count only includes "scheduled" status maintenances (not completed/cancelled)
- The maintenance management page is already fully functional
- No changes needed to the maintenance management page itself

---

**Status**: ✅ Complete and ready to use!
