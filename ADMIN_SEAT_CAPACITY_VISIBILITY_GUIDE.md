# Admin Seat Capacity Visibility Guide

## Where Admin Can See Vehicle Seat Capacity

### 1. **Vehicle Master Screen - Table View** ✅

**Location**: Admin Dashboard → Vehicle Management → Vehicle Master

**Display**: Data table with dedicated "Seat Capacity" column

```
┌─────────────┬──────────────┬────────┬─────────────┬───────────────┬─────────────┐
│ Vehicle ID  │ Registration │ Type   │ Model       │ Seat Capacity │ Driver      │
├─────────────┼──────────────┼────────┼─────────────┼───────────────┼─────────────┤
│ VEH-001     │ KA01AB1234   │ SEDAN  │ Toyota      │ 🪑 4 seats    │ John Doe    │
│ VEH-002     │ KA02CD5678   │ SUV    │ Innova      │ 🪑 7 seats    │ Jane Smith  │
│ VEH-003     │ KA03EF9012   │ VAN    │ Tempo       │ 🪑 12 seats   │ Not Assigned│
└─────────────┴──────────────┴────────┴─────────────┴───────────────┴─────────────┘
```

**Features**:
- Icon indicator (🪑) for visual recognition
- Shows total seat count
- Color-coded (blue) for easy identification
- Sortable column

---

### 2. **Vehicle Master Screen - Card View** ✅

**Location**: Same screen, mobile/responsive view

**Display**: Card layout with seat capacity info

```
┌────────────────────────────────────────┐
│  KA01AB1234                    [ACTIVE]│
├────────────────────────────────────────┤
│  Vehicle ID:      VEH-001              │
│  Model:           Toyota Camry         │
│  Type:            SEDAN                │
│  Seat Capacity:   4 seats          ← ✅│
│  Assigned Driver: John Doe             │
├────────────────────────────────────────┤
│  [View]  [Edit]  [Delete]              │
└────────────────────────────────────────┘
```

---

### 3. **Vehicle Details View** ✅

**Location**: Click "View" on any vehicle

**Display**: Highlighted capacity section with breakdown

```
┌─────────────────────────────────────────────────────┐
│  Vehicle Details: KA01AB1234                        │
├─────────────────────────────────────────────────────┤
│  Vehicle ID:      VEH-001                           │
│  Type:            SEDAN                             │
│  Model:           Toyota Camry                      │
│  Year:            2022                              │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🪑  Seating Capacity                          │ │
│  │     4 seats total                             │ │
│  │     3 seats for customers (1 for driver)      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Status:          ACTIVE                            │
│  Assigned Driver: John Doe                          │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Highlighted blue box for prominence
- Shows total seats
- Calculates customer seats (total - driver)
- Visual icon

---

### 4. **Roster Assignment Dialog** ✅

**Location**: Pending Rosters → Select rosters → Assign to Vehicle

**Display**: Shows available seats for each vehicle

```
┌─────────────────────────────────────────────────────┐
│  Assign Rosters to Vehicle                          │
├─────────────────────────────────────────────────────┤
│  ℹ️  3 customer(s) selected                         │
│                                                     │
│  Select Vehicle:                                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ○ Toyota Camry (KA01AB1234)                 │   │
│  │   ┌─────────────────────────────────────┐   │   │
│  │   │ Current:  🪑🪑🪑○                    │   │   │
│  │   │    ↓                                 │   │   │
│  │   │ After:    🪑🪑🪑🪑                   │   │   │
│  │   │                                      │   │   │
│  │   │ Available: 1 seat                    │   │   │
│  │   │ Requested: 3 seats                   │   │   │
│  │   └─────────────────────────────────────┘   │   │
│  │   ❌ Not Available                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ● Innova (KA02CD5678)                       │   │
│  │   ┌─────────────────────────────────────┐   │   │
│  │   │ Current:  🪑🪑○○○○○                 │   │   │
│  │   │    ↓                                 │   │   │
│  │   │ After:    🪑🪑🪑🪑🪑○○              │   │   │
│  │   │                                      │   │   │
│  │   │ Available: 5 seats                   │   │   │
│  │   │ Requested: 3 seats                   │   │   │
│  │   └─────────────────────────────────────┘   │   │
│  │   ✅ Can Accommodate                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Cancel]                    [Assign] ✅            │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Visual before/after preview
- Shows occupied seats (🪑) vs available (○)
- Clear validation messages
- Prevents invalid assignments

---

### 5. **Seat Capacity Indicator Widget** ✅

**Location**: Can be used anywhere in the app

**Compact Mode**:
```
🪑 3/7  (3 available out of 7 total)
```

**Detailed Mode**:
```
┌─────────────────────────────┐
│ 🪑 Seat Capacity            │
├─────────────────────────────┤
│ 🪑 🪑 🪑 🪑 ○ ○ ○          │
│                             │
│ Total Seats:      7         │
│ Driver:           1         │
│ Customers:        3         │
│ Available:        3         │
└─────────────────────────────┘
```

**Legend**:
- 🪑 (blue) = Driver seat
- 🪑 (orange) = Occupied customer seat
- ○ (green) = Available seat

---

## How Admin Uses This Information

### Scenario 1: Checking Vehicle Availability

**Admin wants to know**: "Which vehicles can accommodate 5 customers?"

**Steps**:
1. Go to Vehicle Master screen
2. Look at "Seat Capacity" column
3. Filter vehicles with ≥6 seats (5 customers + 1 driver)
4. Check "Assigned Driver" column to ensure driver is available

**Example**:
```
Vehicle: Innova (7 seats)
Driver: Assigned ✅
Calculation: 7 - 1 (driver) = 6 customer seats
Can accommodate 5? YES ✅
```

---

### Scenario 2: Assigning Rosters

**Admin wants to**: Assign 3 customers to a vehicle

**Steps**:
1. Go to Pending Rosters
2. Select 3 customer rosters
3. Click "Assign to Vehicle"
4. Dialog shows:
   - Vehicles with sufficient capacity (green)
   - Vehicles without capacity (red, blocked)
5. Select appropriate vehicle
6. See before/after preview
7. Confirm assignment

**Visual Feedback**:
- ✅ Green = Can accommodate
- ❌ Red = Cannot accommodate
- Clear error: "Cannot assign 3 customer(s). Only 1 seat(s) available."

---

### Scenario 3: Planning Fleet Capacity

**Admin wants to**: Plan for a large group (20 customers)

**Steps**:
1. Open Vehicle Master
2. Review seat capacities:
   - 3 × Sedans (4 seats each) = 9 customer seats
   - 2 × SUVs (7 seats each) = 12 customer seats
   - 1 × Van (12 seats) = 11 customer seats
   - **Total**: 32 customer seats available
3. Can accommodate 20 customers? YES ✅

---

## Quick Reference

### Where to Find Seat Capacity

| Location | View Type | Shows |
|----------|-----------|-------|
| Vehicle Master Table | Desktop | Column with icon + count |
| Vehicle Master Cards | Mobile | Row in card details |
| Vehicle Details | Modal | Highlighted box with breakdown |
| Assignment Dialog | Modal | Visual seats + validation |
| Capacity Widget | Anywhere | Compact or detailed view |

### Color Coding

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Seat capacity info / Driver seat |
| 🟠 Orange | Occupied customer seat |
| 🟢 Green | Available seat / Can accommodate |
| 🔴 Red | Full / Cannot accommodate |
| ⚪ Gray | Empty seat (outline) |

### Icons Used

| Icon | Meaning |
|------|---------|
| 🪑 `airline_seat_recline_normal` | Occupied seat |
| 🪑 `airline_seat_recline_extra` | Driver seat |
| ○ `event_seat_outlined` | Available seat |
| 👤 `person` | Driver assigned |

---

## Implementation Files

1. **Vehicle Master Screen**: `vehicle_master.dart`
   - Table view with capacity column
   - Card view with capacity row
   - Details view with highlighted section

2. **Seat Capacity Widget**: `seat_capacity_indicator.dart`
   - Compact mode for lists
   - Detailed mode for details
   - Reusable component

3. **Assignment Dialog**: `roster_assignment_dialog.dart`
   - Vehicle selection with capacity
   - Visual preview
   - Validation

4. **Capacity Service**: `seat_capacity_service.dart`
   - Calculations
   - Validation logic
   - Helper methods

---

## Testing Checklist

- [ ] Seat capacity shows in vehicle table
- [ ] Seat capacity shows in vehicle cards
- [ ] Seat capacity highlighted in details view
- [ ] Capacity shows correctly in assignment dialog
- [ ] Visual seats display correctly
- [ ] Validation prevents over-assignment
- [ ] Error messages are clear
- [ ] Calculations are accurate (total - driver - customers)

---

## Future Enhancements

1. **Dashboard Widget**: Show total fleet capacity
2. **Capacity Alerts**: Notify when vehicles are near full
3. **Capacity Reports**: Analytics on seat utilization
4. **Capacity Filters**: Filter vehicles by available seats
5. **Real-time Updates**: Live capacity tracking during assignments
