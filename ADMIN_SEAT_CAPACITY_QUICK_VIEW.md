# Admin Seat Capacity - Quick View Guide

## 🎯 Where Admin Sees Seat Capacity

### 1️⃣ Vehicle Master Screen (Main List)

**Desktop View - Table**:
```
Vehicle ID  | Registration | Type  | Model        | Seat Capacity | Driver    | Status
------------|--------------|-------|--------------|---------------|-----------|--------
VEH-001     | KA01AB1234   | SEDAN | Toyota       | 🪑 4 seats    | John Doe  | ACTIVE
VEH-002     | KA02CD5678   | SUV   | Innova       | 🪑 7 seats    | Jane      | ACTIVE
VEH-003     | KA03EF9012   | VAN   | Tempo        | 🪑 12 seats   | Not Assgn | ACTIVE
```

**Mobile View - Cards**:
```
┌──────────────────────────┐
│ KA01AB1234      [ACTIVE] │
│ Vehicle ID: VEH-001      │
│ Model: Toyota Camry      │
│ Type: SEDAN              │
│ Seat Capacity: 4 seats ← │
│ Driver: John Doe         │
└──────────────────────────┘
```

---

### 2️⃣ Vehicle Details (Click "View")

```
┌─────────────────────────────────────┐
│ Vehicle: KA01AB1234                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🪑 Seating Capacity             │ │
│ │    4 seats total                │ │
│ │    3 seats for customers        │ │
│ │    (1 for driver)               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Driver: John Doe                    │
│ Status: ACTIVE                      │
└─────────────────────────────────────┘
```

---

### 3️⃣ Roster Assignment Dialog

**When assigning customers to vehicles**:

```
Select Vehicle:

┌─────────────────────────────────────┐
│ ○ Toyota Camry (4 seats)            │
│   Current:  🪑🪑○○                  │
│   After:    🪑🪑🪑🪑 (FULL)         │
│   ❌ Cannot accommodate 3 customers │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ● Innova (7 seats)                  │
│   Current:  🪑🪑○○○○○              │
│   After:    🪑🪑🪑🪑🪑○○           │
│   ✅ Can accommodate 3 customers    │
└─────────────────────────────────────┘
```

---

## 🔢 How Capacity is Calculated

### Formula:
```
Available Seats = Total Seats - Driver Seat - Assigned Customers
```

### Examples:

**Example 1: Empty Vehicle**
```
Total Seats:        4
Driver:            -1
Customers:         -0
─────────────────────
Available:          3 ✅
```

**Example 2: Partially Filled**
```
Total Seats:        7
Driver:            -1
Customers:         -3
─────────────────────
Available:          3 ✅
```

**Example 3: Full Vehicle**
```
Total Seats:        4
Driver:            -1
Customers:         -3
─────────────────────
Available:          0 ❌ FULL
```

---

## 🎨 Visual Indicators

### Seat Icons:
- 🪑 (Blue) = Driver seat
- 🪑 (Orange) = Occupied customer seat
- ○ (Green outline) = Available seat

### Status Colors:
- 🟢 Green = Available / Can accommodate
- 🟠 Orange = Partially filled
- 🔴 Red = Full / Cannot accommodate

---

## ✅ What Admin Can Do

### Check Capacity:
1. Open Vehicle Master
2. Look at "Seat Capacity" column
3. See total seats for each vehicle

### Assign Customers:
1. Select rosters in Pending Rosters
2. Click "Assign to Vehicle"
3. See which vehicles can accommodate
4. System prevents over-assignment

### View Details:
1. Click "View" on any vehicle
2. See highlighted capacity section
3. Shows breakdown: total, driver, customers

---

## 🚫 Validation & Errors

### Error Messages You'll See:

**No Driver**:
```
❌ Vehicle must have an assigned driver 
   before assigning customers.
```

**Insufficient Seats**:
```
❌ Cannot assign 5 customer(s). 
   Only 2 seat(s) available.
```

**Vehicle Inactive**:
```
❌ Vehicle is not active. 
   Status: Maintenance
```

---

## 📊 Quick Scenarios

### Scenario 1: Assign 3 Customers
```
Vehicle: Innova (7 seats)
Driver: Assigned ✅
Current: 2 customers
Available: 4 seats
Request: 3 customers
Result: ✅ SUCCESS (1 seat remaining)
```

### Scenario 2: Try to Assign 5 Customers
```
Vehicle: Sedan (4 seats)
Driver: Assigned ✅
Current: 0 customers
Available: 3 seats
Request: 5 customers
Result: ❌ BLOCKED (popup error)
```

### Scenario 3: No Driver Assigned
```
Vehicle: SUV (7 seats)
Driver: Not Assigned ❌
Request: 3 customers
Result: ❌ BLOCKED (must assign driver first)
```

---

## 🔍 Where to Look

| Need to... | Go to... | Look for... |
|------------|----------|-------------|
| See all vehicle capacities | Vehicle Master | "Seat Capacity" column |
| Check specific vehicle | Vehicle Details | Blue highlighted box |
| Assign customers | Pending Rosters → Assign | Visual seat preview |
| Verify assignment | Assignment Dialog | Before/after comparison |

---

## 💡 Pro Tips

1. **Quick Check**: Look at the table column for fast capacity overview
2. **Detailed View**: Click "View" for breakdown with driver calculation
3. **Assignment**: System automatically shows only valid vehicles
4. **Visual Preview**: See exactly how seats will be filled before confirming
5. **Error Prevention**: Can't over-assign - system blocks invalid attempts

---

## 📱 Responsive Design

**Desktop**: Full table with all columns including seat capacity
**Tablet**: Scrollable table or card view
**Mobile**: Card view with capacity shown in details

All views show seat capacity clearly! 🎉
