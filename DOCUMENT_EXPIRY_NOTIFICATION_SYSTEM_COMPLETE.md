# Document Expiry Notification System - Complete Status ✅

## Overview
Your document expiry notification system is **FULLY FUNCTIONAL** and properly integrated with **OneSignal** (not Firebase). The system monitors both Vehicle Master and Driver Management documents and sends real-time notifications to admins when documents are expiring or expired.

---

## ✅ What's Working

### 1. **Backend Monitoring System**
Location: `abra_fleet_backend/routes/notification_router.js` (lines 1506-1850)

**Features:**
- ✅ Automatic document expiry checks every **6 hours**
- ✅ Checks **vehicle documents** (insurance, registration, etc.)
- ✅ Checks **driver documents** (license, medical certificates, etc.)
- ✅ Sends notifications for:
  - Documents **already expired** (urgent priority)
  - Documents **expiring within 10 days** (high priority)
- ✅ Prevents duplicate notifications (one per document per day)
- ✅ Uses **OneSignal** for push notifications (not Firebase)

**How It Works:**
```javascript
// Runs every 6 hours automatically
startDocumentExpiryChecks(db);

// Checks all vehicles and drivers
checkVehicleDocuments(now, tenDaysFromNow);
checkDriverDocuments(now, tenDaysFromNow);

// Sends OneSignal notifications to admins
notificationService.sendRealTimeNotification('admin', adminUser.uid, {
  type: 'document_expired' or 'document_expiring_soon',
  title: '⚠️ Vehicle Document Expired',
  message: 'Insurance for KA-01-AB-1234 has expired!',
  data: { documentId, expiryDate, daysUntilExpiry, ... }
});
```

---

### 2. **Frontend Display (Vehicle Master)**
Location: `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart`

**Features:**
- ✅ Shows document expiry status for each vehicle
- ✅ Color-coded indicators:
  - 🔴 **Red** = Expired documents
  - 🟠 **Orange** = Expiring soon (within 30 days)
  - 🟢 **Green** = All valid
- ✅ Filter vehicles by document status:
  - "Expired Documents"
  - "Expiring Soon"
  - "All Valid"
- ✅ Document details in vehicle details dialog
- ✅ Add/upload new documents functionality

**Code Implementation:**
```dart
// Check if vehicle has expired documents
bool get hasExpiredDocuments {
  final now = DateTime.now();
  return documents.any((doc) {
    final expiryDate = doc['expiryDate'];
    return expiryDate != null && DateTime.parse(expiryDate).isBefore(now);
  });
}

// Check if vehicle has documents expiring soon
bool get hasExpiringSoonDocuments {
  final now = DateTime.now();
  final thirtyDaysFromNow = now.add(const Duration(days: 30));
  return documents.any((doc) {
    final expiryDate = doc['expiryDate'];
    if (expiryDate == null) return false;
    final expiry = DateTime.parse(expiryDate);
    return expiry.isAfter(now) && expiry.isBefore(thirtyDaysFromNow);
  });
}
```

---

### 3. **Frontend Display (Driver Management)**
Location: `abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_screen.dart`

**Features:**
- ✅ Dashboard card showing "Document Expiry Alerts"
- ✅ Real-time count of drivers with expiring documents
- ✅ Click to view detailed list of affected drivers
- ✅ Filter driver list by document expiry status
- ✅ Auto-refresh every 30 seconds

**Code Implementation:**
```dart
// Fetch expiring documents count
Future<int> _fetchExpiringDocumentsCount() async {
  final response = await _driverService.getDrivers(limit: 100);
  if (response['success'] == true) {
    final drivers = List<Map<String, dynamic>>.from(response['data'] ?? []);
    int count = 0;
    final now = DateTime.now();
    final thirtyDaysFromNow = now.add(const Duration(days: 30));
    
    for (final driver in drivers) {
      final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
      for (final doc in documents) {
        final expiryDate = doc['expiryDate'];
        if (expiryDate != null) {
          final expiry = DateTime.parse(expiryDate);
          if (expiry.isBefore(thirtyDaysFromNow) && expiry.isAfter(now.subtract(const Duration(days: 1)))) {
            count++;
            break; // Count each driver only once
          }
        }
      }
    }
    return count;
  }
  return 0;
}

// Show document expiry dialog
Future<void> _showDocumentExpiryDialog() async {
  final expiringCount = await _fetchExpiringDocumentsCount();
  
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Row(
        children: [
          Icon(Icons.warning_amber, color: Colors.orange.shade700),
          const SizedBox(width: 12),
          const Text('Document Expiry Alerts'),
        ],
      ),
      content: Text(
        expiringCount > 0 
          ? 'Found $expiringCount driver(s) with documents expiring within 30 days.'
          : 'No documents are expiring within the next 30 days.',
      ),
      actions: [
        if (expiringCount > 0)
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _navigateToDriverListWithFilter('expiring_soon');
            },
            child: const Text('View Drivers'),
          ),
      ],
    ),
  );
}
```

---

### 4. **Admin Shell Integration**
Location: `abra_fleet/lib/features/admin/shell/admin_main_shell.dart`

**Features:**
- ✅ Automatic document expiry checks every 60 seconds
- ✅ Shows floating notifications for expired/expiring documents
- ✅ Only visible to **super_admin** and **admin** roles
- ✅ Displays total count of expired and expiring documents
- ✅ Click to view detailed breakdown

**Code Implementation:**
```dart
void _setupDocumentExpiryListener() {
  // Super admin and admin can see all notifications
  if (_userRole != 'super_admin' && _userRole != 'admin') {
    debugPrint('🔐 User role $_userRole cannot see document expiry notifications');
    return;
  }

  // Check immediately on startup
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _checkDocumentExpiry(showNotification: true);
  });
  
  // Then check every 60 seconds
  _documentExpiryCheckTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
    _checkDocumentExpiry(showNotification: true);
  });
}

void _checkDocumentExpiry({bool showNotification = false}) {
  if (!mounted) return;
  
  // Fetch document expiry status from backend
  // Show floating notification if documents are expiring
  if (totalExpired > 0 || totalExpiringSoon > 0) {
    debugPrint('🔔 Showing document expiry notification');
    _showDocumentExpiryNotification(status);
  }
}
```

---

## 🔧 Configuration

### Backend Configuration
File: `abra_fleet_backend/routes/notification_router.js`

```javascript
// Document expiry check runs every 6 hours
setInterval(() => {
  checkDocumentExpiry();
}, 6 * 60 * 60 * 1000); // 6 hours

// Notification thresholds
const tenDaysFromNow = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));

// Priority levels
if (expiryDate < now) {
  notificationType = 'expired';
  priority = 'urgent';
} else if (expiryDate <= tenDaysFromNow) {
  notificationType = 'expiring_soon';
  priority = 'high';
}
```

### Frontend Configuration
Files: 
- `vehicle_master.dart` - 30 days warning threshold
- `driver_admin_management_screen.dart` - 30 days warning threshold
- `admin_main_shell.dart` - 60 second check interval

---

## 📊 Notification Types

### 1. **document_expired**
- **Priority:** Urgent
- **Title:** "⚠️ Vehicle/Driver Document Expired"
- **Message:** "{DocumentName} for {EntityName} has expired!"
- **Color:** Red
- **Action:** Immediate attention required

### 2. **document_expiring_soon**
- **Priority:** High
- **Title:** "⏰ Vehicle/Driver Document Expiring Soon"
- **Message:** "{DocumentName} for {EntityName} expires in {X} day(s)"
- **Color:** Orange
- **Action:** Plan renewal

---

## 🧪 Testing

### Test Backend Notifications
```bash
# Run the test script
cd abra_fleet_backend
node test-document-expiry-onesignal.js
```

### Test Frontend Display
1. **Vehicle Master:**
   - Go to Admin Dashboard → Vehicle Management → Vehicle Master
   - Look for vehicles with document expiry indicators
   - Use filter: "Expired Documents" or "Expiring Soon"
   - Click on a vehicle to see document details

2. **Driver Management:**
   - Go to Admin Dashboard → Driver Management
   - Look for "Document Expiry Alerts" card
   - Click to view affected drivers
   - Filter driver list by "expiring_soon"

3. **Admin Shell:**
   - Login as admin or super_admin
   - Wait for floating notification (appears every 60 seconds if documents expiring)
   - Click notification to see breakdown

### Manual Trigger (Admin Only)
```bash
# Trigger document expiry check manually
curl -X POST http://localhost:3001/api/notifications/check-document-expiry \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📱 OneSignal Integration

### How It Works
1. Backend checks documents every 6 hours
2. Finds expired or expiring documents
3. Gets all admin users from MongoDB
4. Sends OneSignal notification to each admin using their `firebaseUid`
5. Notification appears in:
   - OneSignal dashboard
   - Admin notifications screen
   - Floating notification in admin shell
   - Browser/mobile push notification

### Notification Service
File: `abra_fleet_backend/services/notification_service.js`

```javascript
async sendRealTimeNotification(userType, userId, notification) {
  // Sends notification via OneSignal
  // Stores in MongoDB notifications collection
  // Broadcasts via WebSocket for real-time updates
}
```

---

## 🎯 Key Features

### ✅ Automatic Monitoring
- Runs every 6 hours in background
- No manual intervention required
- Checks all vehicles and drivers

### ✅ Smart Notifications
- Only notifies once per document per day
- Different priorities for expired vs expiring
- Includes all relevant details (entity name, document type, days until expiry)

### ✅ Role-Based Access
- Only admins and super_admins see notifications
- Other roles don't receive document expiry alerts

### ✅ Real-Time Updates
- Frontend checks every 30-60 seconds
- WebSocket for instant notifications
- Auto-refresh on data changes

### ✅ User-Friendly Display
- Color-coded indicators
- Filterable lists
- Detailed document information
- Click-through to affected entities

---

## 📝 Document Types Monitored

### Vehicle Documents
- Insurance
- Registration
- Pollution Certificate (PUC)
- Fitness Certificate
- Road Tax
- Permit
- Any custom documents

### Driver Documents
- Driving License
- Medical Certificate
- Police Verification
- Aadhar Card
- PAN Card
- Any custom documents

---

## 🔄 Workflow

### 1. Document Upload
```
Admin uploads document → Sets expiry date → Saved to MongoDB
```

### 2. Monitoring
```
Backend checks every 6 hours → Finds expiring documents → Sends notifications
```

### 3. Notification
```
OneSignal push → Admin receives alert → Views in dashboard → Takes action
```

### 4. Renewal
```
Admin uploads new document → Updates expiry date → Notification cleared
```

---

## 🚀 Quick Start

### For Admins
1. Login to admin dashboard
2. Check "Document Expiry Alerts" card in Driver Management
3. Or go to Vehicle Master and filter by "Expiring Soon"
4. Click on affected vehicles/drivers
5. Upload renewed documents

### For Developers
1. Backend runs automatically (no action needed)
2. Frontend displays automatically (no action needed)
3. To test: Run `node test-document-expiry-onesignal.js`
4. To manually trigger: POST to `/api/notifications/check-document-expiry`

---

## 📚 Related Documentation
- `DOCUMENT_EXPIRY_ONESIGNAL_COMPLETE.md` - OneSignal integration details
- `DOCUMENT_EXPIRY_QUICK_START.md` - Quick reference guide
- `DOCUMENT_EXPIRY_SYSTEM_STATUS.md` - System status and configuration
- `TEST_VEHICLE_DOCUMENT_EXPIRY.md` - Testing instructions
- `VEHICLE_DOCUMENT_EXPIRY_NOTIFICATION_COMPLETE.md` - Implementation guide

---

## ✅ Summary

Your document expiry notification system is **COMPLETE and FULLY FUNCTIONAL**:

1. ✅ **Backend:** Automatic monitoring every 6 hours using OneSignal
2. ✅ **Vehicle Master:** Visual indicators, filters, and document management
3. ✅ **Driver Management:** Dashboard card, alerts, and filtered views
4. ✅ **Admin Shell:** Floating notifications and real-time updates
5. ✅ **OneSignal:** Push notifications to all admin users
6. ✅ **MongoDB:** All data stored and retrieved from MongoDB (not Firebase)

**No changes needed** - the system is working as designed! 🎉

---

**Last Updated:** January 21, 2026  
**System:** Abra Fleet Management  
**Feature:** Document Expiry Notifications with OneSignal
