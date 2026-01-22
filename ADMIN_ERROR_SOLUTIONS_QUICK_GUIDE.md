# Admin Error Solutions - Quick Guide

## When Vehicle Assignment Fails, What Should Admin Do?

### ⏰ Error: "Vehicle Cannot Reach Next Shift On Time"

**What it means**: The vehicle is already assigned to another shift and doesn't have enough time to travel to the next location.

**What to do**:
1. ✅ **Click "Try Another Vehicle"** - System will automatically find an alternative
2. ✅ **Adjust shift timing** - Give more buffer time between shifts
3. ✅ **Use a different vehicle** - Pick one that's available earlier
4. ✅ **Use a free vehicle** - Assign to a vehicle without prior commitments

**Example**:
- Vehicle A finishes at 6:00 PM in Location X
- Next shift starts at 6:15 PM in Location Y
- Travel time: 30 minutes
- ❌ Vehicle cannot reach on time (needs to leave at 5:45 PM but finishes at 6:00 PM)

---

### 💺 Error: "Vehicle is Full" / "Insufficient Capacity"

**What it means**: The vehicle doesn't have enough empty seats for all customers.

**What to do**:
1. ✅ **Click "Try Another Vehicle"** - System will find one with more seats
2. ✅ **Reduce customer count** - Assign fewer customers to this route
3. ✅ **Use larger vehicle** - Pick a vehicle with more seat capacity
4. ✅ **Split into multiple routes** - Create 2 routes instead of 1

**Example**:
- Vehicle has 7 total seats
- 1 seat for driver
- 3 seats already assigned
- Available: 3 seats
- Trying to assign: 5 customers
- ❌ Not enough seats (need 5, have 3)

**Note**: Full vehicles are automatically filtered out in AUTO MODE, so you shouldn't see them!

---

### 🏢 Error: "Vehicle Already Assigned to Different Company"

**What it means**: The vehicle is already serving customers from a different company. Vehicles cannot mix companies.

**What to do**:
1. ✅ **Click "Try Another Vehicle"** - System will find one for your company
2. ✅ **Use a free vehicle** - Pick one with no assignments
3. ✅ **Use same-company vehicle** - Pick one already serving this company

**Example**:
- Vehicle A is assigned to Infosys customers (email: @infosys.com)
- Trying to assign Wipro customers (email: @wipro.com)
- ❌ Cannot mix companies in same vehicle

**Business Rule**: Company is identified by email domain (e.g., @infosys.com → Infosys)

---

### 🚗 Error: "No Compatible Vehicles Available"

**What it means**: No vehicles match all requirements (driver, capacity, company, timing).

**What to do**:
1. ✅ **Assign drivers to vehicles** - Go to Vehicle Management
2. ✅ **Check company match** - Ensure vehicle email domain matches customers
3. ✅ **Use larger vehicles** - Pick vehicles with more capacity
4. ✅ **Split into multiple routes** - Reduce customers per route

---

### 👤 Error: "No Drivers Assigned"

**What it means**: Vehicles don't have drivers assigned to them.

**What to do**:
1. ✅ **Go to Vehicle Management**
2. ✅ **Assign active drivers to vehicles**
3. ✅ **Ensure drivers are available** (not on leave, active status)

---

## How "Try Another Vehicle" Works

When you click "Try Another Vehicle":

1. System calls backend `/api/roster/compatible-vehicles`
2. Backend filters vehicles by:
   - ✅ Has assigned driver
   - ✅ Sufficient seat capacity
   - ✅ Same company (email domain)
   - ✅ Not full
3. System shows you the next best vehicle
4. You can accept or cancel

**Backend does all the filtering automatically!**

---

## Why Full Vehicles Are Never Shown in AUTO MODE

The system has **smart filtering**:

1. Admin clicks AUTO MODE
2. System calls `getCompatibleVehicles(rosterIds)`
3. Backend checks each vehicle:
   ```javascript
   const totalSeats = vehicle.seatCapacity;
   const assignedSeats = existingAssignments.length;
   const availableSeats = totalSeats - 1 - assignedSeats; // -1 for driver
   
   if (availableSeats < customersNeeded) {
     // ❌ Mark as incompatible - don't show to admin
     incompatibleVehicles.push(vehicle);
   } else {
     // ✅ Show to admin
     compatibleVehicles.push(vehicle);
   }
   ```
4. Only compatible vehicles are shown

**If you see a full vehicle, it's a bug!**

---

## Error Message Format

All error messages now show:

```
┌─────────────────────────────────────┐
│ ⏰ Vehicle Cannot Reach Next Shift │
│                                     │
│ Vehicle cannot reach next shift on  │
│ time                                │
│                                     │
│ What to do:                         │
│ • Click "Try Another Vehicle"       │
│ • Adjust shift timing               │
│ • Use a different vehicle           │
│ • Assign to vehicle without prior   │
│   commitments                       │
│                                     │
│ [Try Another Vehicle] [Cancel]      │
└─────────────────────────────────────┘
```

**You always see**:
- ✅ Clear error title
- ✅ Actual backend error message
- ✅ Step-by-step solutions
- ✅ "Try Another Vehicle" button (when applicable)

---

## Quick Decision Tree

```
Vehicle assignment failed?
│
├─ "Cannot reach next shift"
│  └─ Click "Try Another Vehicle" OR adjust timing
│
├─ "Vehicle is full"
│  └─ Click "Try Another Vehicle" OR reduce customers
│
├─ "Different company"
│  └─ Click "Try Another Vehicle" OR use free vehicle
│
├─ "No compatible vehicles"
│  └─ Assign drivers OR split into multiple routes
│
└─ "No drivers assigned"
   └─ Go to Vehicle Management → Assign drivers
```

---

## Status: COMPLETE ✅

All error messages now show:
- ✅ Real backend error (not generic "Network error")
- ✅ Clear explanation of what went wrong
- ✅ Step-by-step solutions
- ✅ "Try Another Vehicle" button for automatic alternatives
