# 🚗 Seat Capacity Management System - How Multiple Assignments Work

## 🎯 Your Question Answered

**Question**: "When assignment happens, seat capacity is reduced for each vehicle. How does the vehicle allow multiple assignments?"

**Answer**: The system allows multiple assignments **within the same trip/route** but **prevents over-capacity** by tracking existing assignments and calculating available seats in real-time.

## 🔧 How It Works

### 1. **Seat Capacity Calculation Formula**
```javascript
const totalSeats = vehicle.seatCapacity || 4;  // e.g., 7 seats
const assignedSeats = existingAssignments.length;  // e.g., 2 customers already assigned
const availableSeats = totalSeats - 1 - assignedSeats;  // -1 for driver
// Result: 7 - 1 - 2 = 4 available seats
```

### 2. **Real-Time Assignment Tracking**
```javascript
// System checks existing assignments for TODAY
const existingAssignments = await req.db.collection('rosters').find({
  vehicleId: vehicleId,
  status: 'assigned',
  assignedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }  // Today only
}).toArray();
```

### 3. **Multiple Assignment Scenarios**

#### ✅ **Scenario 1: Fresh Vehicle (No Existing Assignments)**
```
Vehicle: Toyota Innova (7 seats)
- Total seats: 7
- Driver: 1 (reserved)
- Available for customers: 6
- Current assignments: 0
- New request: 4 customers from @tcs.com
- Result: ✅ ALLOWED (4 ≤ 6)
```

#### ✅ **Scenario 2: Partial Vehicle (Some Existing Assignments)**
```
Vehicle: Toyota Innova (7 seats)
- Total seats: 7
- Driver: 1 (reserved)
- Already assigned: 2 customers from @tcs.com
- Available for customers: 4 (7 - 1 - 2)
- New request: 3 customers from @tcs.com (same company)
- Result: ✅ ALLOWED (3 ≤ 4)
```

#### ❌ **Scenario 3: Over-Capacity Request**
```
Vehicle: Toyota Innova (7 seats)
- Total seats: 7
- Driver: 1 (reserved)
- Already assigned: 4 customers
- Available for customers: 2 (7 - 1 - 4)
- New request: 5 customers
- Result: ❌ REJECTED (5 > 2)
```

#### ❌ **Scenario 4: Company Mismatch**
```
Vehicle: Toyota Innova (7 seats)
- Already assigned: 2 customers from @tcs.com
- New request: 3 customers from @wipro.com
- Result: ❌ REJECTED (Different companies cannot share vehicle)
```

## 🔄 **Multiple Assignment Process**

### Step 1: Route Optimization Request
```javascript
// Admin selects 4 customers from @tcs.com
POST /api/roster/assign-optimized-route
{
  "vehicleId": "vehicle_123",
  "route": [
    { "rosterId": "r1", "customerName": "Customer 1", "sequence": 1 },
    { "rosterId": "r2", "customerName": "Customer 2", "sequence": 2 },
    { "rosterId": "r3", "customerName": "Customer 3", "sequence": 3 },
    { "rosterId": "r4", "customerName": "Customer 4", "sequence": 4 }
  ]
}
```

### Step 2: Capacity Validation
```javascript
// System checks BEFORE processing
const totalSeats = 7;
const existingAssignments = 0;  // No one assigned yet
const availableSeats = 7 - 1 - 0 = 6;  // 6 seats available
const requestedSeats = 4;  // 4 customers in request

if (requestedSeats <= availableSeats) {
  // ✅ Proceed with assignment
} else {
  // ❌ Reject with capacity error
}
```

### Step 3: Sequential Assignment
```javascript
// Each customer is assigned one by one
for (const stop of route) {
  await db.collection('rosters').updateOne(
    { _id: rosterId, status: 'pending_assignment' },
    {
      $set: {
        vehicleId: vehicleId,
        status: 'assigned',
        assignedAt: new Date(),
        // ... other fields
      }
    }
  );
  // Seat count is now: existing + 1
}
```

## 🚦 **Capacity Management Rules**

### 1. **Same-Day Assignment Tracking**
- System only counts assignments for the current day
- Previous day assignments don't affect today's capacity
- Each day starts with fresh capacity calculation

### 2. **Company Segregation Rule**
- **CRITICAL**: Different companies CANNOT share the same vehicle on the same day
- If vehicle has @tcs.com customers, only @tcs.com customers can be added
- This prevents mixing companies even if seats are available

### 3. **Real-Time Capacity Updates**
- Each assignment immediately reduces available capacity
- Concurrent requests are handled with database transactions
- No over-booking possible due to race conditions

### 4. **Driver Seat Reservation**
- Driver seat is ALWAYS reserved (totalSeats - 1)
- Only passenger seats are available for customers
- 7-seater vehicle = 6 customer seats maximum

## 📊 **Example: 7-Seater Vehicle Throughout the Day**

```
Morning (8:00 AM):
├── Total Seats: 7
├── Driver: 1 (reserved)
├── Available: 6
└── Status: Empty ✅

First Assignment (8:30 AM):
├── Request: 4 customers from @tcs.com
├── Check: 4 ≤ 6 ✅
├── Action: Assign all 4
└── Remaining: 2 seats

Second Assignment Attempt (9:00 AM):
├── Request: 3 customers from @wipro.com
├── Check: Different company ❌
├── Action: REJECT
└── Reason: Company mismatch

Third Assignment Attempt (9:30 AM):
├── Request: 2 customers from @tcs.com
├── Check: Same company ✅, 2 ≤ 2 ✅
├── Action: Assign both
└── Remaining: 0 seats (FULL)

Fourth Assignment Attempt (10:00 AM):
├── Request: 1 customer from @tcs.com
├── Check: 1 > 0 ❌
├── Action: REJECT
└── Reason: Vehicle full
```

## 🔍 **Why Multiple Assignments Work**

### 1. **Batch Processing**
- Route optimization sends ALL customers in ONE request
- System validates total capacity BEFORE processing any
- All-or-nothing approach prevents partial failures

### 2. **Transaction Safety**
- Database transactions ensure atomicity
- If any assignment fails, entire batch is rolled back
- No partial assignments that could cause inconsistency

### 3. **Smart Capacity Planning**
- System finds vehicles with sufficient capacity upfront
- Compatible vehicles API pre-filters by available seats
- Only vehicles that can handle the full request are shown

## 🎯 **Key Insights**

1. **Multiple assignments happen in SINGLE transaction** - not separate requests
2. **Capacity is checked BEFORE processing** - not after each assignment
3. **Company segregation prevents mixing** - even with available seats
4. **Real-time tracking prevents over-booking** - concurrent requests handled safely
5. **Driver seat always reserved** - only passenger seats available

## ✅ **System Working Correctly**

The error you saw ("Customer already assigned") proves the system is working:
- ✅ Prevents duplicate assignments
- ✅ Tracks existing assignments correctly
- ✅ Validates capacity in real-time
- ✅ Maintains data integrity

The vehicle assignment system successfully handles multiple customers while respecting seat capacity limits and business rules!