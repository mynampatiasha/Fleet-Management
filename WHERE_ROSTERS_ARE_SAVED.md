# 📍 WHERE ROSTERS ARE SAVED - Complete Database Documentation

## 🎯 Quick Answer

**Rosters are saved in MongoDB database:**
- **Database:** `abra_fleet`
- **Collection:** `rosters`
- **Location:** `mongodb://localhost:27017/abra_fleet`

---

## 📊 Database Structure

### Collection: `rosters`

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6g7h8i9j0k1"),
  
  // Customer Information
  customerName: "Divya Reddy",
  customerEmail: "divya.reddy@tcs.com",
  customerId: "firebase_uid_here",
  customerFirebaseUid: "firebase_uid_here",
  
  // Location Information
  officeLocation: "Whitefield Office Bangalore",
  officeLocationCoordinates: {
    latitude: 12.9698,
    longitude: 77.7499
  },
  loginPickupLocation: {
    latitude: 12.9352,
    longitude: 77.6245
  },
  loginPickupAddress: "Koramangala, Bangalore",
  logoutDropLocation: {
    latitude: 12.9352,
    longitude: 77.6245
  },
  logoutDropAddress: "Koramangala, Bangalore",
  
  // Schedule Information
  rosterType: "both", // "login", "logout", or "both"
  weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  fromDate: ISODate("2025-12-16T00:00:00Z"),
  toDate: ISODate("2025-12-31T00:00:00Z"),
  fromTime: "08:30",
  toTime: "17:30",
  
  // Status & Assignment (CHANGES DURING LIFECYCLE)
  status: "pending_assignment", // Changes to "assigned" after route optimization
  assignedDriver: null,          // Populated after route optimization
  assignedVehicle: null,         // Populated after route optimization
  assignedAt: null,              // Populated after route optimization
  
  // Organization & Tracking
  organizationName: "TCS",
  createdBy: "admin_firebase_uid",
  createdByAdmin: "Admin Name",
  createdAt: ISODate("2025-12-15T10:30:00Z"),
  updatedAt: ISODate("2025-12-15T10:30:00Z"),
  
  // Employee Details
  employeeDetails: {
    name: "Divya Reddy",
    email: "divya.reddy@tcs.com",
    phone: "+91 9876543210",
    department: "IT",
    companyName: "TCS"
  },
  
  // Additional Fields
  notes: "Prefer window seat",
  requestType: "customer_roster"
}
```

---

## 🔄 Roster Lifecycle in Database

### **Phase 1: Bulk Import (Initial Save)**

**File:** `abra_fleet_backend/routes/roster_router.js`

**Endpoint:** `POST /api/roster/customer/bulk`

**Code Location:** Lines 200-550

```javascript
// 7️⃣ CREATE ROSTER
const newRoster = await Roster.createCustomerRoster(rosterData, userId);
```

**What Gets Saved:**
```javascript
{
  _id: ObjectId("NEW_ID_GENERATED"),
  customerName: "Divya Reddy",
  customerEmail: "divya.reddy@tcs.com",
  officeLocation: "Whitefield Office Bangalore",
  status: "pending_assignment",  // ← Initial status
  assignedDriver: null,           // ← Not assigned yet
  assignedVehicle: null,          // ← Not assigned yet
  createdAt: ISODate("2025-12-15T10:30:00Z"),
  // ... other fields
}
```

**Database Operation:**
```javascript
// In models/roster_model.js
db.collection('rosters').insertOne(rosterDocument)
```

**Result:** ✅ Roster is **SAVED** to database with status `"pending_assignment"`

---

### **Phase 2: Route Optimization (Update)**

**File:** `abra_fleet_backend/routes/roster_router.js`

**Endpoint:** `POST /api/roster/assign-optimized-route`

**Code Location:** Lines 4800-5100

```javascript
// Update roster with driver and vehicle assignment
await req.db.collection('rosters').updateOne(
  { _id: new ObjectId(rosterId) },
  {
    $set: {
      status: 'assigned',
      assignedDriver: driverInfo,
      assignedVehicle: vehicleInfo,
      assignedAt: new Date(),
      updatedAt: new Date()
    }
  }
);
```

**What Gets Updated:**
```javascript
{
  _id: ObjectId("SAME_ID_AS_BEFORE"),  // ← Same document
  customerName: "Divya Reddy",
  customerEmail: "divya.reddy@tcs.com",
  officeLocation: "Whitefield Office Bangalore",
  status: "assigned",              // ← CHANGED from "pending_assignment"
  assignedDriver: {                // ← ADDED
    driverId: ObjectId("..."),
    name: "Rajesh Kumar",
    phone: "+91 9876543210",
    firebaseUid: "driver_uid"
  },
  assignedVehicle: {               // ← ADDED
    vehicleId: ObjectId("..."),
    registrationNumber: "KA01AB1234",
    seatCapacity: 7,
    vehicleType: "SUV"
  },
  assignedAt: ISODate("2025-12-15T11:00:00Z"),  // ← ADDED
  createdAt: ISODate("2025-12-15T10:30:00Z"),   // ← Unchanged
  updatedAt: ISODate("2025-12-15T11:00:00Z")    // ← Updated
}
```

**Database Operation:**
```javascript
db.collection('rosters').updateOne(
  { _id: ObjectId("roster_id") },
  { $set: { status: "assigned", assignedDriver: {...}, assignedVehicle: {...} } }
)
```

**Result:** ✅ **SAME roster** is **UPDATED** with driver and vehicle info

---

## 📂 Code References

### 1. **Bulk Import Save Location**

**File:** `abra_fleet_backend/routes/roster_router.js`

**Function:** `POST /api/roster/customer/bulk`

**Line:** ~500

```javascript
// 7️⃣ CREATE ROSTER
const newRoster = await Roster.createCustomerRoster(rosterData, userId);

console.log(`   ✅ Row ${i + 1} imported successfully - ID: ${newRoster._id}`);
```

**Model File:** `abra_fleet_backend/models/roster_model.js`

```javascript
async createCustomerRoster(rosterData, userId) {
  const roster = {
    ...rosterData,
    requestType: 'customer_roster',
    status: 'pending_assignment',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId
  };
  
  const result = await this.db.collection('rosters').insertOne(roster);
  return { ...roster, _id: result.insertedId };
}
```

---

### 2. **Route Optimization Update Location**

**File:** `abra_fleet_backend/routes/roster_router.js`

**Function:** `POST /api/roster/assign-optimized-route`

**Line:** ~4900

```javascript
// Update each roster with assignment
for (const stop of route) {
  const rosterId = stop.rosterId;
  
  await req.db.collection('rosters').updateOne(
    { _id: new ObjectId(rosterId) },
    {
      $set: {
        status: 'assigned',
        assignedDriver: {
          driverId: driver._id,
          name: driver.name,
          phone: driver.phoneNumber,
          firebaseUid: driver.firebaseUid
        },
        assignedVehicle: {
          vehicleId: vehicle._id,
          registrationNumber: vehicle.registrationNumber,
          seatCapacity: vehicle.seatCapacity
        },
        assignedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
}
```

---

### 3. **Fetch Pending Rosters (From Database)**

**File:** `abra_fleet_backend/routes/roster_router.js`

**Function:** `GET /api/roster/admin/pending`

**Line:** ~3800

```javascript
router.get('/admin/pending', verifyToken, async (req, res) => {
  try {
    const query = { 
      requestType: 'customer_roster',
      status: 'pending_assignment'  // ← Fetches rosters from bulk import
    };
    
    const pendingRosters = await req.db.collection('rosters')
      .find(query)
      .toArray();
    
    res.json({
      success: true,
      data: pendingRosters
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

---

### 4. **Fetch Assigned Rosters (From Database)**

**File:** `abra_fleet_backend/routes/roster_router.js`

**Function:** `GET /api/roster/admin/approved`

**Line:** ~3893

```javascript
router.get('/admin/approved', verifyToken, async (req, res) => {
  try {
    const query = { 
      requestType: 'customer_roster',
      status: { $in: ['assigned', 'in_progress', 'completed'] }  // ← Fetches assigned rosters
    };
    
    const approvedRosters = await req.db.collection('rosters')
      .aggregate([
        { $match: query },
        // ... joins with drivers and vehicles collections
      ])
      .toArray();
    
    res.json({
      success: true,
      data: approvedRosters
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

---

## 🗄️ Database Connection

### Connection String

**File:** `abra_fleet_backend/index.js`

**Line:** ~20

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet';

// Connect to MongoDB
const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db(DB_NAME);
```

### Environment Variables

**File:** `abra_fleet_backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=abra_fleet
```

---

## 🔍 How to Verify Rosters Are Saved

### Method 1: MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `abra_fleet`
4. Open collection: `rosters`
5. You'll see all rosters with their status

**Filter Examples:**

```javascript
// See pending rosters (from bulk import)
{ status: "pending_assignment" }

// See assigned rosters (after route optimization)
{ status: "assigned" }

// See rosters for specific organization
{ organizationName: "TCS" }

// See rosters for specific customer
{ customerEmail: "divya.reddy@tcs.com" }
```

---

### Method 2: MongoDB Shell

```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/abra_fleet

# Count pending rosters
db.rosters.find({ status: "pending_assignment" }).count()

# Count assigned rosters
db.rosters.find({ status: "assigned" }).count()

# View a sample roster
db.rosters.findOne({ status: "pending_assignment" })

# View all statuses
db.rosters.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

### Method 3: Backend API

**Check Pending Rosters:**
```bash
curl -X GET http://localhost:5000/api/roster/admin/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check Assigned Rosters:**
```bash
curl -X GET http://localhost:5000/api/roster/admin/approved \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Statistics

### Typical Roster Counts

```javascript
// After bulk import of 100 employees
db.rosters.find({ status: "pending_assignment" }).count()
// Result: 100 rosters

// After assigning 20 rosters via route optimization
db.rosters.find({ status: "pending_assignment" }).count()
// Result: 80 rosters

db.rosters.find({ status: "assigned" }).count()
// Result: 20 rosters
```

---

## 🎯 Summary

### Where Rosters Are Saved:

| Component | Value |
|-----------|-------|
| **Database** | MongoDB |
| **Connection** | `mongodb://localhost:27017` |
| **Database Name** | `abra_fleet` |
| **Collection** | `rosters` |
| **Initial Status** | `"pending_assignment"` |
| **After Assignment** | `"assigned"` |

### Database Operations:

| Action | Operation | File | Line |
|--------|-----------|------|------|
| **Bulk Import** | `insertOne()` | `roster_router.js` | ~500 |
| **Route Optimization** | `updateOne()` | `roster_router.js` | ~4900 |
| **Fetch Pending** | `find()` | `roster_router.js` | ~3800 |
| **Fetch Assigned** | `aggregate()` | `roster_router.js` | ~3893 |

### Key Points:

✅ Rosters ARE saved during bulk import
✅ They are saved in MongoDB `abra_fleet.rosters` collection
✅ Initial status: `"pending_assignment"`
✅ After route optimization: status changes to `"assigned"`
✅ Same document, just updated - not re-saved
✅ All data persists in MongoDB, not in memory

---

## 🔧 Troubleshooting

### If you don't see rosters in database:

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Or check services
   services.msc
   ```

2. **Check backend is connected:**
   ```bash
   # Look for this in backend logs
   ✅ Connected to MongoDB: abra_fleet
   ```

3. **Check collection exists:**
   ```javascript
   // In MongoDB Compass or shell
   db.getCollectionNames()
   // Should include "rosters"
   ```

4. **Check bulk import succeeded:**
   ```bash
   # Look for this in backend logs after import
   ✅ Row 1 imported successfully - ID: 67a1b2c3d4e5f6g7h8i9j0k1
   ```

---

## 📝 Conclusion

**Rosters are saved in:**
- **Physical Location:** MongoDB database on your server
- **Database:** `abra_fleet`
- **Collection:** `rosters`
- **Connection:** `mongodb://localhost:27017`

**They are saved:**
- ✅ During bulk import (status: `"pending_assignment"`)
- ✅ Updated during route optimization (status: `"assigned"`)
- ✅ Persisted permanently in MongoDB
- ✅ Not stored in memory or temporary storage

**You can verify by:**
- Opening MongoDB Compass
- Connecting to `mongodb://localhost:27017`
- Viewing `abra_fleet.rosters` collection
- Filtering by status to see pending vs assigned rosters

🎉 **Your rosters are safely stored in the database!**
