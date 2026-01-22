# Document Expiry System - Quick Reference Guide 🚀

## 🎯 Quick Status Check

Your document expiry notification system is **FULLY OPERATIONAL** with OneSignal integration!

---

## 📍 Where to Find It

### 1. **Vehicle Master** (Admin Dashboard)
```
Admin Dashboard → Vehicle Management → Vehicle Master
```
- See document expiry indicators on each vehicle
- Filter by: "Expired Documents" | "Expiring Soon" | "All Valid"
- Click vehicle → View document details
- Upload new documents with expiry dates

### 2. **Driver Management** (Admin Dashboard)
```
Admin Dashboard → Driver Management
```
- Dashboard card: "Document Expiry Alerts"
- Shows count of drivers with expiring documents
- Click card → View affected drivers
- Filter driver list by "expiring_soon"

### 3. **Admin Notifications** (Admin Shell)
```
Admin Dashboard → Notifications Icon (Top Right)
```
- Floating notifications appear every 60 seconds
- Shows total expired + expiring documents
- Click to see detailed breakdown
- Only visible to admins and super_admins

---

## 🔧 How It Works

### Backend (Automatic)
```
Every 6 hours → Check all documents → Send OneSignal notifications to admins
```

### Frontend (Real-time)
```
Every 30-60 seconds → Fetch document status → Update UI indicators
```

### Notification Thresholds
- **🔴 Expired:** Document expiry date has passed
- **🟠 Expiring Soon:** Document expires within 10 days (backend) or 30 days (frontend)
- **🟢 Valid:** Document is valid for more than 30 days

---

## 🧪 Testing

### Quick Test (Backend)
```bash
cd abra_fleet_backend
node test-document-expiry-system.js
```

### Manual Trigger (Admin Only)
```bash
curl -X POST http://localhost:3001/api/notifications/check-document-expiry \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Frontend Test
1. Login as admin
2. Go to Vehicle Master or Driver Management
3. Look for document expiry indicators
4. Check notifications icon (top right)

---

## 📊 Document Types Monitored

### Vehicles
- Insurance
- Registration
- Pollution Certificate (PUC)
- Fitness Certificate
- Road Tax
- Permit

### Drivers
- Driving License
- Medical Certificate
- Police Verification
- Aadhar Card
- PAN Card

---

## 🔔 Notification Types

### `document_expired` (Urgent)
```
Title: ⚠️ Vehicle/Driver Document Expired
Message: Insurance for KA-01-AB-1234 has expired!
Priority: Urgent
Color: Red
```

### `document_expiring_soon` (High)
```
Title: ⏰ Vehicle/Driver Document Expiring Soon
Message: License for John Doe expires in 5 day(s)
Priority: High
Color: Orange
```

---

## 🎨 UI Indicators

### Vehicle Master
```dart
// Color-coded status badges
🔴 Red Badge = Has expired documents
🟠 Orange Badge = Has documents expiring soon
🟢 Green Badge = All documents valid
```

### Driver Management
```dart
// Dashboard card
📊 Document Expiry Alerts
   Count: X drivers with expiring documents
   Click to view details
```

### Admin Shell
```dart
// Floating notification
🔔 Document Expiry Alert
   Expired: X | Expiring Soon: Y
   Click for details
```

---

## 🔑 Key Files

### Backend
```
abra_fleet_backend/routes/notification_router.js (lines 1506-1850)
abra_fleet_backend/services/notification_service.js
```

### Frontend
```
abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart
abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_screen.dart
abra_fleet/lib/features/admin/shell/admin_main_shell.dart
```

---

## ⚙️ Configuration

### Backend Settings
```javascript
// Check interval: Every 6 hours
setInterval(() => checkDocumentExpiry(), 6 * 60 * 60 * 1000);

// Warning threshold: 10 days
const tenDaysFromNow = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));
```

### Frontend Settings
```dart
// Vehicle Master: 30 days warning
final thirtyDaysFromNow = now.add(const Duration(days: 30));

// Driver Management: 30 days warning
final thirtyDaysFromNow = now.add(const Duration(days: 30));

// Admin Shell: Check every 60 seconds
Timer.periodic(const Duration(seconds: 60), ...);
```

---

## 🚀 Quick Actions

### For Admins
1. **Check Status:** Go to Driver Management dashboard
2. **View Details:** Click "Document Expiry Alerts" card
3. **Filter Vehicles:** Use "Expired Documents" filter in Vehicle Master
4. **Upload New Document:** Click vehicle/driver → Add Document → Set expiry date

### For Developers
1. **Test System:** Run `node test-document-expiry-system.js`
2. **Manual Trigger:** POST to `/api/notifications/check-document-expiry`
3. **Check Logs:** Look for "📄 DOCUMENT EXPIRY CHECK" in backend logs
4. **Verify OneSignal:** Check OneSignal dashboard for sent notifications

---

## 🐛 Troubleshooting

### No Notifications Appearing?
1. Check if documents are actually expiring (within 10 days)
2. Verify admin users exist in MongoDB with `role: 'admin'`
3. Check backend logs for "📄 DOCUMENT EXPIRY CHECK"
4. Ensure OneSignal is configured correctly

### Frontend Not Showing Indicators?
1. Check if documents have `expiryDate` field
2. Verify date format is valid ISO 8601
3. Refresh the page (Ctrl+R)
4. Check browser console for errors

### Backend Not Running Checks?
1. Verify backend is running: `http://localhost:3001/api/health`
2. Check MongoDB connection
3. Look for "🕐 Starting scheduled document expiry checks" in logs
4. Manually trigger: POST to `/api/notifications/check-document-expiry`

---

## 📚 Related Documentation

- `DOCUMENT_EXPIRY_NOTIFICATION_SYSTEM_COMPLETE.md` - Complete system overview
- `DOCUMENT_EXPIRY_ONESIGNAL_COMPLETE.md` - OneSignal integration details
- `DOCUMENT_EXPIRY_SYSTEM_STATUS.md` - System status and configuration
- `TEST_VEHICLE_DOCUMENT_EXPIRY.md` - Detailed testing guide

---

## ✅ Checklist

- [x] Backend monitoring (every 6 hours)
- [x] OneSignal notifications to admins
- [x] Vehicle Master UI indicators
- [x] Driver Management dashboard card
- [x] Admin Shell floating notifications
- [x] Document upload with expiry dates
- [x] Filter by expiry status
- [x] Real-time updates (30-60 seconds)
- [x] Role-based access (admin only)
- [x] MongoDB integration (not Firebase)

---

**System Status:** ✅ FULLY OPERATIONAL  
**Last Updated:** January 21, 2026  
**Integration:** OneSignal (not Firebase)
