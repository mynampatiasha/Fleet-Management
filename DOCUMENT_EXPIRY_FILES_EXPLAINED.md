# Document Expiry Notification System - Files Explained

## 📁 Main Files Used

### 1. **Backend - Document Expiry Logic**
**File:** `abra_fleet_backend/routes/notification_router.js` (lines 1506-1850)

This is the **MAIN FILE** that handles document expiry checking and notifications.

**Key Functions:**
- `checkDocumentExpiry()` - Main function that runs the check
- `checkVehicleDocuments()` - Checks all vehicle documents
- `checkDriverDocuments()` - Checks all driver documents  
- `checkAndNotifyDocument()` - Checks individual document and decides if notification needed
- `sendExpiryNotification()` - Sends notification to admin users via OneSignal
- `getAdminUsers()` - Gets admin users from `admin_users` and `employee_admins` collections

**What it does:**
1. Runs every 6 hours automatically (or can be triggered manually)
2. Checks all vehicles and drivers in MongoDB
3. Looks for documents expiring within 10 days or already expired
4. Sends OneSignal notifications to all admin users
5. Prevents duplicate notifications (only sends once per day per document)

---

### 2. **Backend - Notification Service**
**File:** `abra_fleet_backend/services/notification_service.js`

This file contains the `sendRealTimeNotification()` function that:
- Sends notifications via OneSignal API
- Stores notifications in MongoDB `notifications` collection
- Handles different user types (admin, driver, customer, client)

**Used by:** `notification_router.js` calls this service to send notifications

---

### 3. **Backend - Database Connection**
**File:** `abra_fleet_backend/index.js`

This file:
- Connects to MongoDB
- Starts the document expiry check system
- Calls `startDocumentExpiryChecks(db)` to initialize the system

---

## 🗄️ Database Collections Used

### Collections Checked:
1. **`vehicles`** - Contains vehicle documents with expiry dates
2. **`drivers`** - Contains driver documents with expiry dates
3. **`admin_users`** - Contains admin users (checked for notification recipients)
4. **`employee_admins`** - Contains admin users (checked for notification recipients)

### Collections Written:
1. **`notifications`** - Stores all notifications sent to users

---

## 🔄 How It Works

### Step 1: Document Check Runs
```
Every 6 hours (or manual trigger)
↓
checkDocumentExpiry() function runs
↓
Checks all vehicles and drivers
```

### Step 2: Find Expiring Documents
```
For each document:
- Calculate days until expiry
- If expired OR expiring within 10 days → proceed
- If already notified today → skip
```

### Step 3: Get Admin Users
```
getAdminUsers() function:
- Checks admin_users collection for role: 'admin' or 'super_admin'
- Checks employee_admins collection for role: 'admin' or 'super_admin'
- Returns list of admin users with their Firebase UIDs
```

### Step 4: Send Notifications
```
For each admin user:
- Call notification_service.sendRealTimeNotification()
- Send via OneSignal API
- Store in MongoDB notifications collection
```

---

## 🎯 Current Status

### ✅ What's Working:
1. Backend code is correct and updated
2. `getAdminUsers()` checks both `admin_users` and `employee_admins` collections
3. Manual trigger endpoint accepts `admin` and `super_admin` roles
4. Test documents created successfully

### ❓ What Needs Verification:
1. **Backend console logs** - Need to check if admin users are being found
2. **Admin user location** - Confirmed in `employee_admins` collection with:
   - Email: admin@abrafleet.com
   - Role: super_admin
   - Firebase UID: qnwp8d0clDSSNuSm3ugmXYLSI3K2

---

## 🔍 How to Debug

### Check Backend Console Logs
Look for these messages in the terminal where backend is running:

```
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
DOCUMENT EXPIRY CHECK STARTED
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄

🚗 Checking vehicle documents...
   Found X total vehicles
   Found X admin user(s) (X in admin_users, X in employee_admins)
   📧 Admin: admin@abrafleet.com (UID: qnwp8d0clDSSNuSm3ugmXYLSI3K2)
   
   📤 Sending expiring_soon notification for vehicle document: Test Insurance
      Entity: KA02CD5678
      Days until expiry: 5
      Notifying 1 admin(s)
      ✅ Sent to admin: admin@abrafleet.com
```

### If No Admin Users Found:
```
🚗 Checking vehicle documents...
   Found X total vehicles
   Found 0 admin user(s) (0 in admin_users, 0 in employee_admins)
   ⚠️  No admin users found in either collection!
```

---

## 📝 Scripts to Run

### 1. Check Admin User Location
```bash
node check-admin-user-location.js
```
Shows which collection contains admin@abrafleet.com

### 2. Check Test Documents
```bash
node check-test-documents-status.js
```
Verifies test documents exist and should trigger notifications

### 3. Trigger Document Check Manually
```bash
node trigger-document-check-now.js
```
Manually triggers the document expiry check

### 4. Check Recent Notifications
```bash
node check-recent-notifications.js
```
Shows if notifications were created in database

---

## 🎯 Next Steps

1. **Check backend console logs** to see if:
   - Admin users are being found
   - Notifications are being sent
   - Any errors are occurring

2. **If admin users not found:**
   - Verify admin user has `role: 'super_admin'` or `role: 'admin'`
   - Check if admin user is in `employee_admins` collection

3. **If notifications already sent today:**
   - Either wait until tomorrow
   - Or delete today's notifications and trigger again

4. **Once notifications created:**
   - They will appear in admin app automatically
   - Check notification bell icon in admin dashboard
   - Check Driver Management → Document Expiry Alerts card
   - Wait for floating notification popup (checks every 60 seconds)

---

## 📊 Summary

**Main File:** `abra_fleet_backend/routes/notification_router.js`  
**Helper File:** `abra_fleet_backend/services/notification_service.js`  
**Collections:** `vehicles`, `drivers`, `admin_users`, `employee_admins`, `notifications`  
**Trigger:** Every 6 hours OR manual via `/api/notifications/check-document-expiry`  
**Status:** System configured correctly, waiting for backend logs verification

---

**Last Updated:** January 21, 2026  
**Status:** System ready, need to check backend console logs
