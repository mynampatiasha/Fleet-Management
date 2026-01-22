# 🔔 Notifications, Seat Capacity & Organization Segregation - Complete Guide

## 🎯 Your Questions Answered

### ✅ Question 1: Do customers and drivers get notifications?
**Answer: YES!** Both customers and drivers receive notifications when rosters are assigned.

### ✅ Question 2: Is seat capacity reduced when rosters are assigned?
**Answer: YES!** Vehicle seat capacity is tracked and reduced as customers are assigned.

### ✅ Question 3: Are customers from the same organization?
**Answer: YES!** The system ensures customers belong to the same organization and only compatible vehicles are used.

---

## 📱 1. NOTIFICATION SYSTEM

### When Notifications Are Sent

**Trigger:** When admin assigns rosters through Route Optimization

**File:** `abra_fleet_backend/routes/roster_router.js` (Line ~5000)

```javascript
// After assigning rosters to vehicle and driver
for (const stop of route) {
  // 1. Send notification to CUSTOMER
  await createNotification({
    userId: customer.firebaseUid,
    userRole: 'customer',
    type: 'roster_assigned',
    title: 'Trip Assigned',
    message: `Your trip has been assigned to ${driverName} in vehicle ${vehicleNumber}`,
    data: {
      rosterId: rosterId,
      driverName: driverName,
      vehicleNumber: vehicleNumber,
      pickupTime: pickupTime,
      dropTime: dropTime
    }
  });
}

// 2. Send notification to DRIVER
await createNotification({
  userId: driver.firebaseUid,
  userRole: 'driver',
  type: 'route_assigned',
  title: 'New Route Assigned',
  message: `You have been assigned ${route.length} customers`,
  data: {
    vehicleId: vehicleId,
    customerCount: route.length,
    routeDetails: route
  }
});
```

---

### Notification Flow Diagram

```
ROUTE OPTIMIZATION COMPLETE
         ↓
    ┌────────────────────────────────────┐
    │  Backend: Create Notifications    │
    └────────────────────────────────────┘
         ↓                    ↓
    ┌─────────┐          ┌─────────┐
    │ Customer│          │ Driver  │
    │   App   │          │   App   │
    └─────────┘          └─────────┘
         ↓                    ↓
    📱 Notification      📱 Notification
    "Trip Assigned"      "Route Assigned"
```

---

### Customer Notification Details

**What Customer Sees:**

```
🔔 Trip Assigned

Your trip has been assigned!

Driver: Rajesh Kumar
Vehicle: KA01AB1234 (SUV - 7 seats)
Pickup Time: 08:30 AM
Drop Time: 06:00 PM
Route: Koramangala → Whitefield Office

Tap to view details
```

**Database Entry:**

```javascript
{
  _id: ObjectId("..."),
  userId: "customer_firebase_uid",
  userRole: "customer",
  type: "roster_assigned",
  title: "Trip Assigned",
  message: "Your trip has been assigned to Rajesh Kumar in vehicle KA01AB1234",
  data: {
    rosterId: "67a1b2c3...",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 9876543210",
    vehicleNumber: "KA01AB1234",
    vehicleType: "SUV",
    pickupTime: "08:30",
    dropTime: "18:00",
    pickupLocation: "Koramangala",
    dropLocation: "Whitefield Office"
  },
  isRead: false,
  createdAt: ISODate("2025-12-15T11:00:00Z")
}
```

---

### Driver Notification Details

**What Driver Sees:**

```
🔔 New Route Assigned

You have been assigned 5 customers

Vehicle: KA01AB1234
Total Customers: 5
Route Start: 08:00 AM
Estimated Duration: 45 minutes

Customers:
1. Divya Reddy - Koramangala
2. Karan Mehta - Indiranagar
3. Priya Sharma - HSR Layout
4. Amit Patel - BTM Layout
5. Sneha Gupta - Jayanagar

Tap to view route details
```

**Database Entry:**

```javascript
{
  _id: ObjectId("..."),
  userId: "driver_firebase_uid",
  userRole: "driver",
  type: "route_assigned",
  title: "New Route Assigned",
  message: "You have been assigned 5 customers",
  data: {
    vehicleId: "67a1b2c3...",
    vehicleNumber: "KA01AB1234",
    customerCount: 5,
    routeDetails: [
      {
        sequence: 1,
        customerName: "Divya Reddy",
        pickupLocation: "Koramangala",
        pickupTime: "08:30"
      },
      // ... more customers
    ],
    totalDistance: 25.5,
    estimatedDuration: 45
  },
  isRead: false,
  createdAt: ISODate("2025-12-15T11:00:00Z")
}
```

---

## 💺 2. SEAT CAPACITY TRACKING

### How Seat Capacity Works

**Initial State (Before Assignment):**

```javascript
// Vehicle in database
{
  _id: ObjectId("..."),
  registrationNumber: "KA01AB1234",
  vehicleType: "SUV",
  seatCapacity: 7,           // ← Total seats
  availableSeats: 7,         // ← All seats available
  assignedCustomers: [],     // ← No customers yet
  status: "active"
}
```

**After Assigning 5 Customers:**

```javascript
// Vehicle updated in database
{
  _id: ObjectId("..."),
  registrationNumber: "KA01AB1234",
  vehicleType: "SUV",
  seatCapacity: 7,           // ← Total seats (unchanged)
  availableSeats: 2,         // ← 7 - 5 = 2 seats left
  assignedCustomers: [       // ← 5 customers assigned
    "roster_id_1",
    "roster_id_2",
    "roster_id_3",
    "roster_id_4",
    "roster_id_5"
  ],
  status: "active"
}
```

---

### Seat Capacity Calculation Code

**File:** `abra_fleet_backend/routes/roster_router.js` (Line ~4950)

```javascript
// Calculate available seats for vehicle
const assignedRostersCount = await req.db.collection('rosters').countDocuments({
  assignedVehicle: { $exists: true },
  'assignedVehicle.vehicleId': vehicle._id,
  status: { $in: ['assigned', 'in_progress', 'active'] }
});

const availableSeats = vehicle.seatCapacity - assignedRostersCount;

console.log(`Vehicle ${vehicle.registrationNumber}:`);
console.log(`  Total Capacity: ${vehicle.seatCapacity}`);
console.log(`  Assigned: ${assignedRostersCount}`);
console.log(`  Available: ${availableSeats}`);

// Check if vehicle has enough seats
if (availableSeats < customersToAssign.length) {
  throw new Error(`Vehicle only has ${availableSeats} seats available, but ${customersToAssign.length} customers need assignment`);
}
```

---

### Seat Capacity Visual Example

```
BEFORE ASSIGNMENT:
┌─────────────────────────────┐
│  Vehicle: KA01AB1234 (SUV)  │
│  Total Seats: 7             │
│  Available: 7 🪑🪑🪑🪑🪑🪑🪑  │
│  Assigned: 0                │
└─────────────────────────────┘

AFTER ASSIGNING 5 CUSTOMERS:
┌─────────────────────────────┐
│  Vehicle: KA01AB1234 (SUV)  │
│  Total Seats: 7             │
│  Available: 2 🪑🪑          │
│  Assigned: 5 👤👤👤👤👤      │
│                             │
│  Customers:                 │
│  1. Divya Reddy            │
│  2. Karan Mehta            │
│  3. Priya Sharma           │
│  4. Amit Patel             │
│  5. Sneha Gupta            │
└─────────────────────────────┘

VEHICLE IS NOW 71% FULL
(5 out of 7 seats occupied)
```

---

## 🏢 3. ORGANIZATION SEGREGATION

### ✅ YES - Customers Belong to Same Organization

**The system ensures:**
1. ✅ Only customers from the SAME organization are grouped together
2. ✅ Only vehicles assigned to that organization are used
3. ✅ Drivers see only customers from their assigned organization

---

### How Organization Filtering Works

**File:** `abra_fleet_backend/routes/roster_router.js` (Line ~4800)

```javascript
// Step 1: Get pending rosters for specific organization
const pendingRosters = await req.db.collection('rosters').find({
  status: 'pending_assignment',
  organizationName: 'TCS'  // ← Only TCS customers
}).toArray();

// Step 2: Get compatible vehicles for that organization
const compatibleVehicles = await req.db.collection('vehicles').find({
  status: 'active',
  $or: [
    { organizationName: 'TCS' },           // ← Vehicle assigned to TCS
    { emailDomain: 'tcs.com' },            // ← Or matches email domain
    { assignedOrganizations: { $in: ['TCS'] } }  // ← Or in assigned list
  ]
}).toArray();

// Step 3: Assign only TCS customers to TCS vehicles
for (const roster of pendingRosters) {
  // Verify customer belongs to TCS
  if (roster.organizationName === 'TCS' && 
      roster.customerEmail.endsWith('@tcs.com')) {
    // Assign to compatible vehicle
    await assignRosterToVehicle(roster, compatibleVehicle);
  }
}
```

---

### Organization Segregation Example

**Scenario: Two Organizations**

```
ORGANIZATION 1: TCS
├── Customers:
│   ├── divya.reddy@tcs.com
│   ├── karan.mehta@tcs.com
│   └── priya.sharma@tcs.com
├── Vehicles:
│   ├── KA01AB1234 (assigned to TCS)
│   └── KA01AB5678 (assigned to TCS)
└── Drivers:
    ├── Rajesh Kumar (TCS driver)
    └── Suresh Patel (TCS driver)

ORGANIZATION 2: Wipro
├── Customers:
│   ├── amit.singh@wipro.com
│   ├── sneha.gupta@wipro.com
│   └── rahul.verma@wipro.com
├── Vehicles:
│   ├── KA02CD1234 (assigned to Wipro)
│   └── KA02CD5678 (assigned to Wipro)
└── Drivers:
    ├── Mohan Das (Wipro driver)
    └── Ravi Kumar (Wipro driver)
```

**What Happens:**
- ✅ TCS customers → TCS vehicles → TCS drivers
- ✅ Wipro customers → Wipro vehicles → Wipro drivers
- ❌ TCS customers CANNOT be assigned to Wipro vehicles
- ❌ Wipro customers CANNOT be assigned to TCS vehicles

---

### Organization Check in Code

**File:** `abra_fleet_backend/routes/roster_router.js` (Line ~3500)

```javascript
// Check if vehicle is compatible with customer organization
function isVehicleCompatible(vehicle, customer) {
  const customerOrg = customer.organizationName;
  const customerDomain = customer.customerEmail.split('@')[1];
  
  // Check 1: Vehicle assigned to same organization
  if (vehicle.organizationName === customerOrg) {
    return true;
  }
  
  // Check 2: Vehicle email domain matches customer domain
  if (vehicle.emailDomain === customerDomain) {
    return true;
  }
  
  // Check 3: Vehicle has customer's organization in assigned list
  if (vehicle.assignedOrganizations && 
      vehicle.assignedOrganizations.includes(customerOrg)) {
    return true;
  }
  
  // Not compatible
  return false;
}

// Filter vehicles before assignment
const compatibleVehicles = allVehicles.filter(vehicle => 
  isVehicleCompatible(vehicle, customer)
);

console.log(`Found ${compatibleVehicles.length} compatible vehicles for ${customer.organizationName}`);
```

---

## 🔄 4. COMPLETE FLOW WITH ALL THREE FEATURES

### Step-by-Step Process

```
1. ADMIN SELECTS CUSTOMERS FOR ROUTE OPTIMIZATION
   ↓
   Filters: organizationName = "TCS"
   Result: 5 TCS customers selected

2. SYSTEM FINDS COMPATIBLE VEHICLES
   ↓
   Query: vehicles WHERE organizationName = "TCS"
   Result: 2 TCS vehicles found
   
3. SYSTEM CHECKS SEAT CAPACITY
   ↓
   Vehicle KA01AB1234: 7 seats, 2 assigned, 5 available ✅
   Vehicle KA01AB5678: 7 seats, 7 assigned, 0 available ❌
   Selected: KA01AB1234

4. SYSTEM ASSIGNS CUSTOMERS TO VEHICLE
   ↓
   Updates roster status: "pending_assignment" → "assigned"
   Updates vehicle: availableSeats: 5 → 0 (now full)
   
5. SYSTEM SENDS NOTIFICATIONS
   ↓
   Customer 1: "Trip assigned to Rajesh Kumar" 📱
   Customer 2: "Trip assigned to Rajesh Kumar" 📱
   Customer 3: "Trip assigned to Rajesh Kumar" 📱
   Customer 4: "Trip assigned to Rajesh Kumar" 📱
   Customer 5: "Trip assigned to Rajesh Kumar" 📱
   Driver: "5 customers assigned to you" 📱

6. CUSTOMERS & DRIVER RECEIVE NOTIFICATIONS
   ↓
   All users see notifications in their apps
   Vehicle is now at full capacity (7/7 seats)
```

---

## 📊 5. DATABASE TRACKING

### Rosters Collection (After Assignment)

```javascript
// Each roster tracks its assignment
{
  _id: ObjectId("roster1"),
  customerName: "Divya Reddy",
  customerEmail: "divya.reddy@tcs.com",
  organizationName: "TCS",           // ← Organization
  status: "assigned",
  assignedDriver: {
    driverId: ObjectId("driver1"),
    name: "Rajesh Kumar"
  },
  assignedVehicle: {
    vehicleId: ObjectId("vehicle1"),
    registrationNumber: "KA01AB1234",
    seatCapacity: 7
  }
}
```

### Vehicles Collection (Capacity Tracking)

```javascript
// Vehicle tracks all assigned rosters
{
  _id: ObjectId("vehicle1"),
  registrationNumber: "KA01AB1234",
  organizationName: "TCS",           // ← Organization
  seatCapacity: 7,
  assignedRosters: [                 // ← All assigned rosters
    ObjectId("roster1"),
    ObjectId("roster2"),
    ObjectId("roster3"),
    ObjectId("roster4"),
    ObjectId("roster5")
  ],
  availableSeats: 2                  // ← Calculated: 7 - 5 = 2
}
```

### Notifications Collection

```javascript
// Customer notification
{
  _id: ObjectId("notif1"),
  userId: "customer_uid",
  userRole: "customer",
  type: "roster_assigned",
  title: "Trip Assigned",
  message: "Your trip has been assigned",
  isRead: false,
  createdAt: ISODate("2025-12-15T11:00:00Z")
}

// Driver notification
{
  _id: ObjectId("notif2"),
  userId: "driver_uid",
  userRole: "driver",
  type: "route_assigned",
  title: "New Route Assigned",
  message: "You have been assigned 5 customers",
  isRead: false,
  createdAt: ISODate("2025-12-15T11:00:00Z")
}
```

---

## ✅ SUMMARY

### Your Questions - Final Answers:

| Question | Answer | Details |
|----------|--------|---------|
| **Do customers get notifications?** | ✅ YES | Each customer receives "Trip Assigned" notification with driver & vehicle details |
| **Do drivers get notifications?** | ✅ YES | Driver receives "Route Assigned" notification with all customer details |
| **Is seat capacity reduced?** | ✅ YES | Vehicle capacity is tracked and reduced as customers are assigned |
| **Are rosters filled before?** | ✅ YES | System checks existing assignments before adding new customers |
| **Same organization customers?** | ✅ YES | Only customers from the same organization are grouped together |
| **Organization-specific vehicles?** | ✅ YES | Only vehicles assigned to that organization are used |

---

## 🎯 Key Points:

1. **Notifications:** Both customers and drivers receive real-time notifications via Firebase
2. **Seat Capacity:** Automatically tracked and prevents overbooking
3. **Organization Segregation:** Strict separation between different organizations
4. **Data Integrity:** All information stored in MongoDB for tracking and reporting

🎉 **Everything works together to ensure safe, organized, and efficient fleet management!**
