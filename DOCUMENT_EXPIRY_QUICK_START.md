# Document Expiry System - Quick Start Guide 🚀

## What It Does

Automatically sends notifications to admins when vehicle or driver documents are:
- ⚠️ **Expired** (urgent priority)
- ⏰ **Expiring within 10 days** (high priority)

## How It Works

```
Every 6 hours → Check all documents → Send OneSignal notifications to admins
```

## Already Working ✅

The system is **already running** in your backend! It:
- ✅ Runs automatically every 6 hours
- ✅ Checks all vehicle documents
- ✅ Checks all driver documents
- ✅ Sends notifications via OneSignal
- ✅ Stores notifications in MongoDB
- ✅ Prevents duplicate notifications

## Test It Now

```bash
# Run the test script
node test-document-expiry-onesignal.js
```

## Manual Trigger (Admin Only)

```bash
# Login as admin and trigger check
curl -X POST http://localhost:3001/api/notifications/check-document-expiry \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## View Notifications

### In Backend API
```bash
# Get document expiry notifications
curl http://localhost:3001/api/notifications?type=document_expired \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### In Flutter App
- Open **Admin Dashboard**
- Go to **Notifications**
- Filter by: `Document Management`

## Add Documents to Test

### Via Vehicle Master UI
1. Open **Vehicle Master**
2. Select a vehicle
3. Click **Add Document**
4. Set expiry date within 10 days
5. Wait for next check (or trigger manually)

### Via API
```javascript
// Add document with expiry date
await db.collection('vehicles').updateOne(
  { vehicleId: 'VEH001' },
  {
    $push: {
      documents: {
        id: 'doc_' + Date.now(),
        documentType: 'insurance',
        documentName: 'Vehicle Insurance',
        expiryDate: new Date('2026-01-25'), // 5 days from now
        documentUrl: 'https://...'
      }
    }
  }
);
```

## Check Backend Logs

```bash
# Watch for document expiry checks
tail -f backend.log | grep "DOCUMENT EXPIRY"
```

You'll see:
```
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
DOCUMENT EXPIRY CHECK STARTED
📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄📄
🚗 Checking vehicle documents...
   Found 25 total vehicles
   📤 Sending expiring_soon notification...
✅ Document expiry check completed successfully
```

## Configuration

### Change Check Frequency

Edit `abra_fleet_backend/routes/notification_router.js`:

```javascript
// Line ~1820
setInterval(() => {
  checkDocumentExpiry();
}, 6 * 60 * 60 * 1000); // Change this value
```

Examples:
- Every 1 hour: `1 * 60 * 60 * 1000`
- Every 12 hours: `12 * 60 * 60 * 1000`
- Every 24 hours: `24 * 60 * 60 * 1000`

### Change Expiry Warning Period

Edit `abra_fleet_backend/routes/notification_router.js`:

```javascript
// Line ~1530
const tenDaysFromNow = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));
// Change 10 to your desired number of days
```

## Notification Types

| Type | Priority | When Sent |
|------|----------|-----------|
| `document_expired` | urgent | Document has expired |
| `document_expiring_soon` | high | Expires within 10 days |

## Troubleshooting

### Not Receiving Notifications?

1. **Check admin users exist**:
   ```javascript
   db.users.find({ role: 'admin' })
   ```

2. **Verify OneSignal is working**:
   ```bash
   curl http://localhost:3001/api/onesignal/health
   ```

3. **Check documents have expiry dates**:
   ```javascript
   db.vehicles.find({ 'documents.expiryDate': { $exists: true } })
   ```

4. **Trigger manual check**:
   ```bash
   curl -X POST http://localhost:3001/api/notifications/check-document-expiry \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

### Getting Duplicate Notifications?

The system automatically prevents duplicates by checking if a notification was already sent today for the same document. If you're still getting duplicates, check backend logs for errors.

## What Changed

✅ **Before**: Used Firebase Auth to get admin users
✅ **Now**: Uses MongoDB to get admin users
✅ **Before**: Used Firebase notifications
✅ **Now**: Uses OneSignal notifications

## Files Modified

- `abra_fleet_backend/routes/notification_router.js` - Updated to use OneSignal

## Files NOT Modified (Already Working)

- `abra_fleet_backend/index.js` - Already starts the system
- `abra_fleet_backend/services/notification_service.js` - Already has OneSignal
- `vehicle_master.dart` - Already displays documents

## Summary

The document expiry system is **already working** with OneSignal. No additional setup needed!

Just ensure:
1. ✅ Backend is running
2. ✅ OneSignal is configured
3. ✅ Admin users exist in MongoDB
4. ✅ Documents have expiry dates

That's it! The system will automatically notify admins when documents are expiring.

---

**Need Help?** Check `DOCUMENT_EXPIRY_ONESIGNAL_COMPLETE.md` for detailed documentation.
