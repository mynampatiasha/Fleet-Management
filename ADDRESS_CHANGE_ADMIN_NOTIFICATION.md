# Address Change Admin Notification - Complete Guide

## ✅ YES! Admin Gets Notified When Customer Submits Address Change

---

## How It Works

### When Customer Submits Address Change Request:

1. **Customer submits** via mobile app
2. **System creates** address change request in database
3. **System finds** all admins in customer's organization
4. **System sends** notification to each admin
5. **Admin receives** notification in their app

---

## Notification Flow (Step by Step)

### Step 1: Customer Submits Request
```
Customer → My Trips → Change Address → Submit
```

### Step 2: Backend Creates Request
```javascript
// Creates address_change_request document
{
  customerId: "customer_firebase_uid",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  organizationName: "Abra Group",
  currentPickupAddress: "123 Old Street",
  newPickupAddress: "456 New Street",
  status: "under_review",
  affectedTripsCount: 5,
  createdAt: new Date()
}
```

### Step 3: Backend Finds Admins
```javascript
// Finds all admins in same organization
db.users.find({
  role: { $in: ['admin', 'client'] },
  $or: [
    { companyName: "Abra Group" },
    { organizationName: "Abra Group" }
  ]
})
```

### Step 4: Backend Creates Notifications
```javascript
// Creates notification for EACH admin
{
  userId: "admin_firebase_uid",
  userRole: "admin",
  title: "New Address Change Request",
  message: "John Doe has requested an address change",
  type: "address_change_request",
  data: {
    requestId: "request_id",
    customerId: "customer_firebase_uid",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    affectedTripsCount: 5,
    organizationName: "Abra Group"
  },
  read: false,
  createdAt: new Date()
}
```

### Step 5: Admin Sees Notification
```
Admin opens app → Notifications → Sees:
"New Address Change Request"
"John Doe has requested an address change"
```

---

## Code Implementation

### Backend (Already Implemented)

**File:** `abra_fleet_backend/routes/address_change_router.js`

```javascript
// After creating address change request...

// Find all admins in customer's organization
const organizationName = customer.organizationName || customer.companyName;

if (organizationName) {
  const admins = await db.collection('users').find({
    role: { $in: ['admin', 'client'] },
    $or: [
      { companyName: organizationName },
      { organizationName: organizationName }
    ]
  }).toArray();

  console.log(`📧 Sending notification to ${admins.length} admin(s)`);

  // Create notification for each admin
  const adminNotifications = admins.map(admin => ({
    userId: admin.firebaseUid,
    userRole: admin.role,
    title: 'New Address Change Request',
    message: `${customer.name} has requested an address change`,
    type: 'address_change_request',
    data: {
      requestId: result.insertedId.toString(),
      customerId: req.user.uid,
      customerName: customer.name,
      customerEmail: customer.email,
      affectedTripsCount: affectedTrips.length,
      organizationName: organizationName
    },
    read: false,
    createdAt: new Date()
  }));

  // Insert all notifications
  if (adminNotifications.length > 0) {
    await db.collection('notifications').insertMany(adminNotifications);
    console.log(`✅ Sent ${adminNotifications.length} notification(s)`);
  }
}
```

---

## Requirements for Notification to Work

### ✅ Customer Must Have Organization

**In users collection:**
```javascript
{
  firebaseUid: "customer_uid",
  role: "customer",
  name: "John Doe",
  email: "john@example.com",
  organizationName: "Abra Group",  // ← REQUIRED
  // OR
  companyName: "Abra Group"        // ← ALTERNATIVE
}
```

### ✅ Admin Must Have Same Organization

**In users collection:**
```javascript
{
  firebaseUid: "admin_uid",
  role: "admin",  // or "client"
  name: "Admin User",
  email: "admin@example.com",
  organizationName: "Abra Group",  // ← MUST MATCH CUSTOMER
  // OR
  companyName: "Abra Group"        // ← ALTERNATIVE
}
```

---

## Testing the Notification

### Option 1: Use Test Script

```bash
cd abra_fleet_backend
node test-address-change-notification-v2.js
```

This will:
1. Find a customer with organization
2. Find admins in same organization
3. Create test address change request
4. Send notifications to admins
5. Verify notifications were created

### Option 2: Test via API

1. **Customer submits request:**
```bash
POST http://localhost:3000/api/address-change/customer/request
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "currentPickupAddress": "123 Old Street",
  "newPickupAddress": "456 New Street",
  "newPickupLat": 12.9716,
  "newPickupLng": 77.5946,
  "currentDropAddress": "789 Old Office",
  "newDropAddress": "321 New Office",
  "newDropLat": 12.9352,
  "newDropLng": 77.6245,
  "reason": "Moved to new residence"
}
```

2. **Check backend logs:**
```
📧 Sending notification to 2 admin(s) in Abra Group
✅ Sent 2 notification(s) to admins
```

3. **Admin checks notifications:**
```bash
GET http://localhost:3000/api/notifications
Authorization: Bearer <admin_token>
```

Should see:
```json
{
  "success": true,
  "data": [
    {
      "title": "New Address Change Request",
      "message": "John Doe has requested an address change",
      "type": "address_change_request",
      "read": false,
      "data": {
        "requestId": "...",
        "customerName": "John Doe",
        "affectedTripsCount": 5
      }
    }
  ]
}
```

---

## What Admin Sees in App

### Notification Badge
- Red dot on notifications icon
- Shows unread count

### Notification List
```
🔔 New Address Change Request
   John Doe has requested an address change
   5 trips affected
   2 minutes ago
```

### Notification Details (When Tapped)
```
Address Change Request

Customer: John Doe
Email: john@example.com
Phone: +91 98765 43210

Current Pickup: 123 Old Street
New Pickup: 456 New Street

Current Drop: 789 Old Office
New Drop: 321 New Office

Reason: Moved to new residence
Affected Trips: 5
Status: Under Review

[View Request] [Dismiss]
```

---

## Troubleshooting

### ❌ Admin Not Receiving Notification

**Check 1: Customer has organization?**
```javascript
db.users.findOne({ 
  firebaseUid: "customer_uid",
  role: "customer"
})
// Should have organizationName or companyName
```

**Check 2: Admin has same organization?**
```javascript
db.users.find({ 
  role: { $in: ['admin', 'client'] },
  $or: [
    { organizationName: "Abra Group" },
    { companyName: "Abra Group" }
  ]
})
// Should return admin users
```

**Check 3: Notification was created?**
```javascript
db.notifications.find({
  userId: "admin_firebase_uid",
  type: "address_change_request"
}).sort({ createdAt: -1 })
// Should show recent notifications
```

**Check 4: Backend logs show notification sent?**
```
Look for:
📧 Sending notification to X admin(s) in [Organization]
✅ Sent X notification(s) to admins
```

---

## Summary

### ✅ Notification IS Implemented

**When customer submits address change:**
1. ✅ Request is created in database
2. ✅ System finds all admins in customer's organization
3. ✅ Notification is sent to EACH admin
4. ✅ Admin sees notification in their app

**Requirements:**
- ✅ Customer must have `organizationName` or `companyName`
- ✅ Admin must have matching `organizationName` or `companyName`
- ✅ Admin must have role `admin` or `client`

**What admin sees:**
- ✅ Title: "New Address Change Request"
- ✅ Message: "[Customer Name] has requested an address change"
- ✅ Type: `address_change_request`
- ✅ Data: Request ID, customer details, affected trips count

**Next steps:**
1. Ensure customers have organization field
2. Ensure admins have matching organization field
3. Test with real customer submission
4. Admin should see notification immediately

---

## Edit Option for Assigned Trips

### ❌ Correct - No Edit Option for Assigned Trips

**Why?**
- Driver already notified
- Route may be planned
- Vehicle allocated
- Passengers informed

**Solution:**
- Use "Change Address" request instead
- Admin reviews and approves
- System updates future trips automatically
- Maintains data integrity

**This is by design and is the correct behavior!**
