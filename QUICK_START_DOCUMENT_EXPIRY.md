# Vehicle Document Expiry - Quick Start Guide

## 🚀 Start Using (3 Steps)

### 1. Restart Backend
```bash
cd abra_fleet_backend
npm start
```

Look for this in logs:
```
✅ Vehicle document expiry monitoring started. Next check at midnight.
```

### 2. Test It Works
```bash
node test-vehicle-document-expiry.js
```

### 3. Trigger Manual Check (Optional)
```bash
curl -X POST http://localhost:3001/api/admin/vehicles/documents/trigger-check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📋 What It Does

- ✅ Checks ALL vehicle documents every day at midnight
- ✅ Sends OneSignal notifications to admins
- ✅ Three urgency levels: Expired, Urgent (< 7 days), Soon (< 30 days)
- ✅ Works automatically - no manual intervention needed

## 🔔 Notification Examples

### Expired (🚨 Urgent)
```
"Insurance for vehicle KA01AB1234 expired 5 days ago"
```

### Expiring Soon (⚠️ High)
```
"RC for vehicle KA01AB1234 expires in 3 days"
```

### Expiring Within 30 Days (📋 Normal)
```
"Fitness Certificate for vehicle KA01AB1234 expires in 15 days"
```

## 🎯 API Endpoints

```bash
# Get all expiring documents
GET /api/admin/vehicles/documents/expiring

# Check specific vehicle
GET /api/admin/vehicles/:id/documents/check-expiry

# Trigger manual check
POST /api/admin/vehicles/documents/trigger-check
```

## ✅ Verify It's Working

### Check Backend Logs
```
✅ Vehicle document expiry monitoring started. Next check at midnight.
```

### Check MongoDB
```javascript
db.onesignal_notifications.find({
  type: { $in: ['vehicle_document_expired', 'vehicle_document_expiring_urgent', 'vehicle_document_expiring_soon'] }
}).sort({ createdAt: -1 }).limit(5)
```

### Check Frontend
- Open Vehicle Master screen
- Look for expiring documents badge on vehicles
- Click vehicle to see document expiry details

## 🔧 Troubleshooting

### Service Not Starting?
**Check**: Backend logs for errors
**Fix**: Ensure MongoDB connection works

### No Notifications?
**Check**: OneSignal configuration in .env
**Fix**: Verify ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY

### Manual Trigger Not Working?
**Check**: JWT token is valid
**Fix**: Get fresh admin token

## 📊 Monitor Daily

At midnight, logs should show:
```
🔍 Checking vehicle documents for expiry...
📋 Found X vehicles with documents
✅ Document expiry check complete:
   - Expired: X
   - Expiring this week: X
   - Expiring within 30 days: X
```

## 🎉 That's It!

The system is now monitoring your vehicle documents 24/7 and will notify admins automatically when documents are expiring.

**Status**: ✅ OPERATIONAL
