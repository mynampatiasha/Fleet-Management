# Testing Vehicle Document Expiry Notification System

## Quick Test

### 1. Run the Test Script
```bash
cd abra_fleet_backend
node test-vehicle-document-expiry.js
```

This will:
- ✅ Check all vehicles with documents
- ✅ Analyze expiry status
- ✅ Show documents requiring attention
- ✅ Trigger manual notification check
- ✅ Display recent notifications
- ✅ Show service status

### 2. Manual API Test

#### Get All Expiring Documents
```bash
curl http://localhost:3001/api/admin/vehicles/documents/expiring \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Trigger Manual Check
```bash
curl -X POST http://localhost:3001/api/admin/vehicles/documents/trigger-check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Check Specific Vehicle
```bash
curl http://localhost:3001/api/admin/vehicles/VH123456/documents/check-expiry \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Expected Output

### Test Script Output
```
🧪 Testing Vehicle Document Expiry Notification System

================================================================================

📋 STEP 1: Checking vehicles with documents...

✅ Found 15 vehicles with documents

📊 STEP 2: Analyzing document expiry status...

📈 Document Expiry Summary:
   🚨 Expired: 2
   ⚠️  Urgent (< 7 days): 3
   📋 Expiring Soon (< 30 days): 5
   ✅ Valid (> 30 days): 25
   📊 Total Documents: 35

⚠️  STEP 3: Documents Requiring Attention:

────────────────────────────────────────────────────────────────────────────────
Vehicle        Document Type            Expiry Date    Days      Status
────────────────────────────────────────────────────────────────────────────────
KA01AB1234     Insurance                2025-01-15     5 ago     EXPIRED
KA02CD5678     RC                       2025-01-18     2 ago     EXPIRED
KA03EF9012     Fitness Certificate      2025-01-25     in 5      URGENT (< 7 days)
────────────────────────────────────────────────────────────────────────────────

🔔 STEP 4: Testing notification service...

   Triggering manual document expiry check...
🔍 Checking vehicle documents for expiry...
📋 Found 15 vehicles with documents
🚨 Sent expired notification for KA01AB1234 - Insurance
🚨 Sent expired notification for KA02CD5678 - RC
⚠️ Sent urgent expiry notification for KA03EF9012 - Fitness Certificate (5 days)
✅ Document expiry check complete:
   - Expired: 2
   - Expiring this week: 3
   - Expiring within 30 days: 5

✅ Manual check completed. Check logs above for notification details.

📬 STEP 5: Checking recent notifications...

✅ Found 5 recent vehicle document notifications:

1. 🚨 Vehicle Document Expired
   Message: Insurance for vehicle KA01AB1234 expired 5 days ago
   Type: vehicle_document_expired
   Priority: urgent
   Created: 2025-01-20T10:30:00.000Z
   User Role: admin

🔧 STEP 6: Service Status

   Service Running: ✅ YES
   Next Check: Midnight (00:00)
   Check Frequency: Every 24 hours

================================================================================
📊 TEST SUMMARY

✅ Vehicles with documents: 15
✅ Total documents checked: 35
⚠️  Documents requiring attention: 10
🔔 Recent notifications: 5
🔧 Service status: RUNNING
================================================================================

✅ Test completed successfully!
```

## Verification Checklist

### Backend
- [ ] Service starts automatically with backend
- [ ] Logs show "Vehicle document expiry monitoring started"
- [ ] Manual trigger works via API
- [ ] Notifications are created in MongoDB
- [ ] Service runs at midnight automatically

### Notifications
- [ ] Expired documents send urgent notifications
- [ ] Documents expiring within 7 days send high priority notifications
- [ ] Documents expiring within 30 days send normal notifications
- [ ] Notifications include vehicle registration number
- [ ] Notifications include document type
- [ ] Notifications include days until expiry

### OneSignal
- [ ] Notifications appear in OneSignal dashboard
- [ ] Admins receive push notifications
- [ ] Notifications work on web
- [ ] Notifications work on mobile (if applicable)

### Frontend (Vehicle Master)
- [ ] Expiring documents badge shows on vehicles
- [ ] Document expiry status displays correctly
- [ ] Color coding works (red/orange/yellow)
- [ ] Days until expiry shows correctly

## Troubleshooting

### Service Not Starting
**Check**: Backend logs for errors
```bash
# Look for this in backend logs:
✅ Vehicle document expiry monitoring started. Next check at midnight.
```

**Solution**: Ensure MongoDB connection is working

### No Notifications Received
**Check**: OneSignal configuration
```bash
# Verify environment variables:
ONESIGNAL_APP_ID=your_app_id
ONESIGNAL_REST_API_KEY=your_api_key
ONESIGNAL_USER_AUTH_KEY=your_user_auth_key
```

**Solution**: Verify admin users have OneSignal player IDs

### Notifications Not in Database
**Check**: MongoDB notifications collection
```javascript
db.onesignal_notifications.find({
  type: { $in: ['vehicle_document_expired', 'vehicle_document_expiring_urgent', 'vehicle_document_expiring_soon'] }
}).sort({ createdAt: -1 }).limit(10)
```

**Solution**: Check notification service logs for errors

### Manual Trigger Not Working
**Check**: API endpoint response
```bash
curl -X POST http://localhost:3001/api/admin/vehicles/documents/trigger-check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

**Solution**: Verify JWT token is valid and user is admin

## Adding Test Data

To test the system, add documents with expiry dates to vehicles:

```javascript
// Add test document to vehicle
db.vehicles.updateOne(
  { vehicleId: 'VH123456' },
  {
    $push: {
      documents: {
        type: 'Insurance',
        expiryDate: new Date('2025-01-25'), // 5 days from now
        documentUrl: 'https://example.com/insurance.pdf',
        uploadedAt: new Date()
      }
    }
  }
);
```

## Monitoring

### Check Service Status
```bash
# In backend logs, look for:
🚀 Starting vehicle document expiry monitoring service...
✅ Vehicle document expiry monitoring started. Next check at midnight.
```

### Check Daily Runs
```bash
# At midnight, logs should show:
🔍 Checking vehicle documents for expiry...
📋 Found X vehicles with documents
✅ Document expiry check complete:
   - Expired: X
   - Expiring this week: X
   - Expiring within 30 days: X
```

### Check Notifications Sent
```bash
# For each notification sent:
🚨 Sent expired notification for KA01AB1234 - Insurance
⚠️ Sent urgent expiry notification for KA02CD5678 - RC (3 days)
📋 Sent expiring soon notification for KA03EF9012 - Fitness (15 days)
```

## Success Criteria

✅ Service starts automatically with backend
✅ Runs daily at midnight
✅ Sends notifications for expired documents
✅ Sends notifications for documents expiring within 7 days
✅ Sends notifications for documents expiring within 30 days
✅ Notifications reach all admins
✅ Notifications stored in MongoDB
✅ Manual trigger works via API
✅ Frontend displays expiring documents correctly

## Next Steps

1. **Monitor for 24 hours** to ensure automatic midnight run works
2. **Verify notifications** are received by admins
3. **Check MongoDB** for notification records
4. **Test on production** with real vehicle documents
5. **Set up alerts** for service failures (optional)

## Support

If you encounter issues:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Confirm OneSignal configuration
4. Test with manual trigger first
5. Check notification service logs

**Status**: ✅ READY FOR TESTING
