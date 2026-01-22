# Vehicle Document Expiry Notification System - Complete Implementation

## Overview
Implemented a comprehensive vehicle document expiry notification system using OneSignal (replacing Firebase) that automatically monitors vehicle documents and sends notifications to admins before expiry.

## ✅ What Was Implemented

### 1. Backend Service (`vehicle_document_expiry_service.js`)
Created a dedicated service that:
- **Monitors all vehicle documents** for expiry dates
- **Runs automatically** every 24 hours at midnight
- **Sends OneSignal notifications** to all admins based on urgency:
  - 🚨 **Expired documents** (urgent priority)
  - ⚠️ **Expiring within 7 days** (high priority)
  - 📋 **Expiring within 30 days** (normal priority)

### 2. Notification Types
The system sends three types of notifications:

#### Expired Documents
```javascript
{
  type: 'vehicle_document_expired',
  title: '🚨 Vehicle Document Expired',
  message: 'Insurance for vehicle KA01AB1234 expired 5 days ago',
  priority: 'urgent'
}
```

#### Urgent Expiry (Within 7 Days)
```javascript
{
  type: 'vehicle_document_expiring_urgent',
  title: '⚠️ Urgent: Vehicle Document Expiring Soon',
  message: 'RC for vehicle KA01AB1234 expires in 3 days',
  priority: 'high'
}
```

#### Expiring Soon (Within 30 Days)
```javascript
{
  type: 'vehicle_document_expiring_soon',
  title: '📋 Vehicle Document Expiring Soon',
  message: 'Fitness Certificate for vehicle KA01AB1234 expires in 15 days',
  priority: 'normal'
}
```

### 3. API Endpoints

#### Get All Expiring Documents
```
GET /api/admin/vehicles/documents/expiring
```
Returns all vehicles with documents expiring within 30 days.

#### Check Specific Vehicle
```
GET /api/admin/vehicles/:id/documents/check-expiry
```
Check document expiry for a specific vehicle.

#### Manual Trigger
```
POST /api/admin/vehicles/documents/trigger-check
```
Manually trigger document expiry check for all vehicles.

### 4. Integration with Backend
- Service automatically starts when backend server starts
- Integrated into `index.js` startup sequence
- Runs independently without blocking other operations

## 🔧 How It Works

### Automatic Monitoring
1. **Service starts** when backend server starts
2. **Runs immediately** on startup to check all documents
3. **Schedules next check** for midnight
4. **Repeats daily** at midnight automatically

### Notification Flow
```
Vehicle Documents
    ↓
Check Expiry Dates
    ↓
Compare with Current Date
    ↓
Categorize (Expired/Urgent/Soon)
    ↓
Send OneSignal Notification
    ↓
All Admins Receive Push Notification
```

### Document Categories
- **Expired**: Document expiry date < today
- **Urgent**: Document expires within 7 days
- **Expiring Soon**: Document expires within 30 days

## 📱 Frontend Integration (Already Working)

The vehicle master screen already displays expiring documents:
- Shows expiring documents count in vehicle list
- Highlights vehicles with expiring documents
- Displays document expiry status in vehicle details

## 🎯 Key Features

### 1. OneSignal Integration
- Uses existing OneSignal service
- Sends push notifications to all admin devices
- Works on web, iOS, and Android

### 2. Smart Scheduling
- Runs at midnight to avoid peak hours
- Checks all vehicles in one batch
- Efficient database queries

### 3. Detailed Notifications
Each notification includes:
- Vehicle registration number
- Document type
- Days until expiry (or days expired)
- Severity level

### 4. Admin Targeting
- Notifications sent only to admins
- Uses `sendNotificationToRole('admin', notification)`
- Ensures proper user isolation

## 🚀 Testing

### Manual Test
```bash
# Trigger manual check
curl -X POST http://localhost:3001/api/admin/vehicles/documents/trigger-check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Check Expiring Documents
```bash
# Get all expiring documents
curl http://localhost:3001/api/admin/vehicles/documents/expiring \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Check Specific Vehicle
```bash
# Check specific vehicle
curl http://localhost:3001/api/admin/vehicles/VH123456/documents/check-expiry \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📊 Monitoring

### Service Status
The service logs its activity:
```
🚀 Starting vehicle document expiry monitoring service...
✅ Vehicle document expiry monitoring started. Next check at midnight.
🔍 Checking vehicle documents for expiry...
📋 Found 50 vehicles with documents
✅ Document expiry check complete:
   - Expired: 2
   - Expiring this week: 5
   - Expiring within 30 days: 12
```

### Notification Logs
Each notification sent is logged:
```
🚨 Sent expired notification for KA01AB1234 - Insurance
⚠️ Sent urgent expiry notification for KA02CD5678 - RC (3 days)
📋 Sent expiring soon notification for KA03EF9012 - Fitness (15 days)
```

## 🔒 Security

- Only admins receive notifications
- Uses existing JWT authentication
- Respects user role permissions
- No sensitive data in notifications

## 🎨 Frontend Display

The vehicle master screen already shows:
- ✅ Expiring documents badge
- ✅ Document expiry status
- ✅ Days until expiry
- ✅ Color-coded urgency (red/orange/yellow)

## 📝 Configuration

### Environment Variables
No additional environment variables needed. Uses existing:
- `MONGODB_URI` - Database connection
- `ONESIGNAL_APP_ID` - OneSignal app ID
- `ONESIGNAL_REST_API_KEY` - OneSignal API key

### Customization
To change check frequency, modify in `vehicle_document_expiry_service.js`:
```javascript
// Current: Every 24 hours at midnight
// To change: Modify the interval in startMonitoring()
```

## ✅ Benefits

1. **Proactive Management**: Admins notified before documents expire
2. **Compliance**: Ensures vehicles have valid documents
3. **Automated**: No manual checking required
4. **Multi-level Alerts**: Different urgency levels
5. **OneSignal-based**: Works without Firebase
6. **Scalable**: Handles any number of vehicles
7. **Reliable**: Runs automatically every day

## 🔄 Migration from Firebase

This system completely replaces the old Firebase-based document expiry notifications:
- ✅ Uses OneSignal instead of Firebase Cloud Messaging
- ✅ Stores notifications in MongoDB instead of Firestore
- ✅ Uses backend service instead of Firebase Functions
- ✅ More reliable and maintainable

## 📞 Support

If notifications are not being received:
1. Check backend logs for service startup
2. Verify OneSignal configuration
3. Ensure admin users have OneSignal player IDs
4. Manually trigger check to test: `POST /api/admin/vehicles/documents/trigger-check`

## 🎉 Summary

The vehicle document expiry notification system is now fully operational using OneSignal. It automatically monitors all vehicle documents and sends timely notifications to admins, ensuring compliance and proactive document management.

**Status**: ✅ COMPLETE AND OPERATIONAL
