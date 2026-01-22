# Document Expiry Notification System - OneSignal Integration Complete ✅

## Overview

The existing document expiry notification system has been successfully updated to work with **OneSignal** instead of Firebase. The system automatically monitors vehicle and driver documents and sends notifications to admin users when documents are expiring or have expired.

## What Was Changed

### 1. Updated `notification_router.js`

**File**: `abra_fleet_backend/routes/notification_router.js`

#### Changes Made:

1. **Replaced Firebase Auth with MongoDB** for fetching admin users:
   ```javascript
   // OLD: Used Firebase Auth to list users
   const listUsersResult = await admin.auth().listUsers();
   
   // NEW: Uses MongoDB to fetch admin users
   const adminUsers = await documentExpiryDb.collection('users').find({ 
     role: 'admin' 
   }).toArray();
   ```

2. **Integrated OneSignal Notification Service**:
   ```javascript
   // OLD: Used createNotification function (Firebase-based)
   await createNotification(documentExpiryDb, {
     userId: adminUser.uid,
     ...notificationData
   });
   
   // NEW: Uses OneSignal notification service
   const notificationService = require('../services/notification_service');
   await notificationService.sendRealTimeNotification('admin', adminUser.uid, {
     type: notificationData.type,
     title: notificationData.title,
     message: notificationData.message,
     data: notificationData.data,
     priority: notificationData.priority
   });
   ```

## How It Works

### Automatic Monitoring

1. **Scheduled Checks**: System runs every **6 hours** automatically
2. **Startup Check**: Runs 10 seconds after backend starts
3. **Manual Trigger**: Admins can trigger checks via API endpoint

### Document Scanning

The system checks:
- ✅ All vehicle documents (from `vehicles` collection)
- ✅ All driver documents (from `drivers` collection)
- ✅ Driver documents stored in vehicles (legacy support)

### Notification Triggers

| Condition | Notification Type | Priority | Icon |
|-----------|------------------|----------|------|
| Document expired | `document_expired` | `urgent` | ⚠️ |
| Expires within 10 days | `document_expiring_soon` | `high` | ⏰ |

### Notification Delivery

1. **OneSignal Push Notification** → Sent to admin devices
2. **WebSocket Real-time** → Sent to admin dashboard (if online)
3. **MongoDB Storage** → Stored in `notifications` collection
4. **MongoDB OneSignal Storage** → Stored in `onesignal_notifications` collection

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Document Expiry System                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Scheduled Check (Every 6 hours)                            │
│  - Runs at: Startup + 10s, then every 6 hours              │
│  - Function: checkDocumentExpiry()                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Scan Documents                                             │
│  1. Check all vehicles → documents[]                        │
│  2. Check all drivers → documents[]                         │
│  3. Check vehicle.driverDocuments[] (legacy)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Evaluate Each Document                                     │
│  - Parse expiryDate                                         │
│  - Calculate days until expiry                              │
│  - Determine notification type                              │
│  - Check if already notified today                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Get Admin Users (MongoDB)                                  │
│  - Query: { role: 'admin' }                                 │
│  - Returns: firebaseUid, email, name                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Send Notifications via OneSignal                           │
│  - notificationService.sendRealTimeNotification()           │
│  - Target: Each admin individually                          │
│  - Channels: OneSignal + WebSocket + MongoDB                │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Manual Trigger (Admin Only)

```http
POST /api/notifications/check-document-expiry
Authorization: Bearer <admin-token>
```

**Response**:
```json
{
  "success": true,
  "message": "Document expiry check started in background"
}
```

### Get Notifications

```http
GET /api/notifications?type=document_expired
GET /api/notifications?type=document_expiring_soon
Authorization: Bearer <admin-token>
```

## Notification Data Structure

```javascript
{
  type: 'document_expired' | 'document_expiring_soon',
  title: '⚠️ Vehicle Document Expired' | '⏰ Driver Document Expiring Soon',
  message: 'Insurance for KA-01-AB-1234 has expired!',
  data: {
    documentId: 'doc_123',
    documentName: 'Insurance',
    documentType: 'insurance',
    expiryDate: '2026-01-15T00:00:00.000Z',
    daysUntilExpiry: -5, // negative = expired
    entityType: 'vehicle' | 'driver',
    entityId: '507f1f77bcf86cd799439011',
    entityName: 'KA-01-AB-1234',
    vehicleId: 'VEH001',
    driverId: null,
    registrationNumber: 'KA-01-AB-1234'
  },
  priority: 'urgent' | 'high',
  category: 'document_management'
}
```

## Testing

### Run Test Script

```bash
node test-document-expiry-onesignal.js
```

### Test Steps

1. ✅ Login as admin
2. ✅ Check backend health
3. ✅ Trigger document expiry check manually
4. ✅ Wait for notifications to be processed
5. ✅ Verify notifications in MongoDB
6. ✅ Verify notifications in OneSignal

### Expected Output

```
🧪 TESTING DOCUMENT EXPIRY NOTIFICATION SYSTEM
================================================

✅ Admin login successful
✅ Backend is healthy
✅ Document expiry check triggered
✅ Found 3 document expiry notification(s)

📋 Recent document expiry notifications:
   1. ⚠️ Vehicle Document Expired
      Message: Insurance for KA-01-AB-1234 has expired!
      Type: document_expired
      Priority: urgent
      Document: Insurance
      Entity: KA-01-AB-1234 (vehicle)
      Days until expiry: -5
```

## Configuration

### Environment Variables

Ensure these are set in `abra_fleet_backend/.env`:

```env
# OneSignal Configuration
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_REST_API_KEY=your-rest-api-key
ONESIGNAL_USER_AUTH_KEY=your-user-auth-key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/abra_fleet
```

### Schedule Configuration

To change the check frequency, edit `notification_router.js`:

```javascript
// Current: Every 6 hours
setInterval(() => {
  checkDocumentExpiry();
}, 6 * 60 * 60 * 1000);

// Example: Every 24 hours (daily)
setInterval(() => {
  checkDocumentExpiry();
}, 24 * 60 * 60 * 1000);
```

## Frontend Integration

### Vehicle Master UI

The vehicle master screen (`vehicle_master.dart`) already displays documents with expiry dates:

```dart
// Documents are displayed in the UI
if (vehicle.documents != null && vehicle.documents!.isNotEmpty) {
  for (var doc in vehicle.documents!) {
    // Show document name, type, expiry date
    // Highlight expired or expiring documents
  }
}
```

### Admin Notifications Screen

Admins can view document expiry notifications in:
- `admin_notifications_screen.dart`
- Filter by type: `document_expired`, `document_expiring_soon`

## Monitoring

### Backend Logs

Watch for document expiry checks in backend logs:

```
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
DOCUMENT EXPIRY CHECK STARTED
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
Timestamp: 2026-01-20T10:30:00.000Z

🚗 Checking vehicle documents...
   Found 25 total vehicles
   📤 Sending expired notification for vehicle document: Insurance
      Entity: KA-01-AB-1234
      Days until expiry: -5
      Notifying 3 admin(s)
      ✅ Sent to admin: admin@abrafleet.com

👤 Checking driver documents...
   Found 15 total drivers
   📤 Sending expiring_soon notification for driver document: License
      Entity: John Doe
      Days until expiry: 7
      Notifying 3 admin(s)

✅ Document expiry check completed successfully
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
```

## Troubleshooting

### No Notifications Received

1. **Check admin users exist in MongoDB**:
   ```javascript
   db.users.find({ role: 'admin' })
   ```

2. **Verify OneSignal is configured**:
   ```bash
   curl http://localhost:3001/api/onesignal/health
   ```

3. **Check backend logs** for errors during document expiry check

4. **Verify documents have expiry dates**:
   ```javascript
   db.vehicles.find({ 'documents.expiryDate': { $exists: true } })
   ```

### Duplicate Notifications

The system prevents duplicate notifications by checking if a notification was already sent today for the same document:

```javascript
const alreadyNotified = await checkIfAlreadyNotified(doc.id, notificationType);
```

### OneSignal Not Sending

1. Check OneSignal credentials in `.env`
2. Verify admin users have registered OneSignal devices
3. Check OneSignal dashboard for delivery status

## Benefits of OneSignal Integration

✅ **No Firebase Dependency** - Works without Firebase Auth
✅ **Push Notifications** - Admins receive notifications on devices
✅ **Real-time Updates** - WebSocket for instant in-app notifications
✅ **Persistent Storage** - MongoDB stores notification history
✅ **User Isolation** - Each admin receives only their notifications
✅ **Priority Support** - Urgent notifications for expired documents
✅ **Automatic Scheduling** - Runs every 6 hours without manual intervention

## Files Modified

1. ✅ `abra_fleet_backend/routes/notification_router.js` - Updated to use OneSignal
2. ✅ `test-document-expiry-onesignal.js` - New test script
3. ✅ `DOCUMENT_EXPIRY_ONESIGNAL_COMPLETE.md` - This documentation

## Files NOT Modified (Already Working)

- ✅ `abra_fleet_backend/index.js` - Already calls `startDocumentExpiryChecks()`
- ✅ `abra_fleet_backend/services/notification_service.js` - Already has OneSignal integration
- ✅ `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart` - Already displays documents

## Summary

The document expiry notification system is now fully integrated with OneSignal and works as follows:

1. **Automatic monitoring** every 6 hours
2. **Scans all vehicles and drivers** for document expiry
3. **Sends notifications** to all admin users via OneSignal
4. **Stores notifications** in MongoDB for history
5. **Prevents duplicates** by checking if already notified today
6. **Supports manual triggers** via API endpoint

The system is production-ready and requires no additional changes. Admins will receive push notifications on their devices when documents are expiring or have expired.

---

**Status**: ✅ COMPLETE - Document expiry system now works with OneSignal
**Date**: January 20, 2026
**Migration**: Firebase → OneSignal ✅
