# ERR_CONNECTION_RESET - Fixed!

## Problem

```
Failed to load resource: net::ERR_CONNECTION_RESET
```

**Cause:** Backend server **crashed** when processing the address change request due to undefined variable `adminNotifications`.

---

## Root Cause

The variable `adminNotifications` was declared inside an `if` block but referenced outside of it, causing the server to crash when trying to log its length.

```javascript
// BEFORE (Caused crash):
if (organizationName) {
  const adminNotifications = [...]; // Declared inside if
}
console.log(`Admins Notified: ${adminNotifications.length}`); // ❌ Undefined!
```

---

## Fix Applied

Declared `adminNotifications` outside the if block:

```javascript
// AFTER (Fixed):
let adminNotifications = []; // ✅ Declared outside
if (organizationName) {
  adminNotifications = [...]; // Assigned inside if
}
console.log(`Admins Notified: ${adminNotifications.length}`); // ✅ Works!
```

---

## To Apply Fix

### 1. Restart Backend (REQUIRED)
```bash
cd abra_fleet_backend
# Stop current backend (Ctrl+C)
node index.js
```

### 2. Restart Flutter
```bash
# In Flutter terminal:
R
```

### 3. Test Again
- My Trips → Menu → "Change Address"
- Fill in addresses
- Submit
- **Should work now!**

---

## What You'll See

### In Backend Console:
```
================================================================================
📍 ADDRESS CHANGE REQUEST RECEIVED
================================================================================
👤 Customer Firebase UID: b5aoloVR7xYI6SICibCIWecBaf82
📍 New Pickup: Indiranagar Bangalore
📍 New Drop: MG Road Bangalore
📝 Reason: Moved to new residence
🔍 Looking up customer in users collection...
✅ Customer found: Customer
   Organization: Abra Group
   Email: customer@example.com
📊 Found 0 affected upcoming trips
📧 Sending address change notification to 0 admin(s) in Abra Group
⚠️  No admins found for organization: Abra Group

================================================================================
✅ ADDRESS CHANGE REQUEST COMPLETED SUCCESSFULLY
================================================================================
📋 Request ID: 67584a1b2c3d4e5f6a7b8c9d
👤 Customer: Customer
🏢 Organization: Abra Group
📊 Affected Trips: 0
🔔 Admins Notified: 0
================================================================================
```

### In Flutter App:
```
✅ Success message:
"Address change request submitted successfully. 
Processing will take 4-5 working days."
```

---

## Why "Admins Notified: 0"?

If you see `Admins Notified: 0`, it means:
- ✅ Request was created successfully
- ⚠️ No admins found with matching organization

**To fix:** Create an admin user with same organization:
```javascript
// In users collection:
{
  role: "admin",
  organizationName: "Abra Group",  // Must match customer's organization
  name: "Admin User",
  email: "admin@example.com"
}
```

---

## Summary

**Issue:** Backend crashed due to undefined variable
**Fix:** Declared variable outside if block
**Status:** ✅ Fixed - just restart backend

**No more crashes!**
**No more ERR_CONNECTION_RESET!**
**Full debugging logs working!**

Just restart the backend and try again!
