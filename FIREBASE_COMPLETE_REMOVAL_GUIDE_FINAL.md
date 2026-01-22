# Complete Firebase Removal Guide

## Overview
This guide will help you remove ALL Firebase dependencies from your Flutter app and replace them with HTTP/WebSocket calls to your MongoDB backend.

## Quick Start

### Option 1: Automated Script (Recommended)
```powershell
.\remove_firebase_complete.ps1
```

### Option 2: Manual Steps
Follow the sections below.

---

## Step 1: Remove Firebase Packages

Edit `abra_fleet/pubspec.yaml` and remove these lines:
```yaml
firebase_core: ^2.24.2
firebase_auth: ^4.16.0
firebase_database: ^10.4.0
firebase_storage: ^11.6.0
cloud_firestore: ^4.14.0
firebase_messaging: ^14.7.10
```

Then run:
```bash
cd abra_fleet
flutter clean
flutter pub get
```

---

## Step 2: Delete Firebase Configuration

Delete this file:
```
abra_fleet/lib/firebase_options.dart
```

---

## Step 3: Replace Firebase Classes

### Replacement Map

| Firebase Class | Replace With |
|---------------|--------------|
| `FirebaseFirestore.instance` | HTTP API calls to MongoDB |
| `FirebaseDatabase.instance` | WebSocket or HTTP API |
| `FirebaseStorage.instance` | Backend file upload API |
| `FieldValue.serverTimestamp()` | `DateTime.now().toIso8601String()` |
| `Timestamp` | `DateTime` |
| `DataSnapshot` | `Map<String, dynamic>` |
| `QuerySnapshot` | `List<Map<String, dynamic>>` |
| `QueryDocumentSnapshot` | `Map<String, dynamic>` |
| `DatabaseReference` | Remove (use HTTP endpoints) |
| `DatabaseEvent` | Remove (use WebSocket) |
| `UploadTask` | Remove (use HTTP multipart) |
| `SettableMetadata` | Remove (send in HTTP request) |

---

## Step 4: Fix Each File

### 1. notifications_screen.dart

**Remove:**
```dart
import 'package:firebase_database/firebase_database.dart';

final notificationsRef = FirebaseDatabase.instance.ref('notifications/$_userId');
await FirebaseDatabase.instance.ref('notifications/$_userId').remove();
```

**Replace with:**
```dart
import 'package:abra_fleet/core/services/notification_service.dart';

// Use NotificationService methods
final notifications = await NotificationService().getNotifications();
await NotificationService().deleteNotification(notificationId);
```

---

### 2. client_sos_alerts.dart

**Remove:**
```dart
import 'package:firebase_database/firebase_database.dart';

final sosRef = FirebaseDatabase.instance.ref('sos_events');
```

**Replace with:**
```dart
import 'package:abra_fleet/core/services/api_service.dart';

// Use HTTP API
final response = await ApiService().get('/api/sos-alerts');
```

---

### 3. client_profile_screen.dart & customer_profile_screen.dart

**Remove:**
```dart
final firestoreDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get();

await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .update({
      'name': name,
      'updatedAt': FieldValue.serverTimestamp(),
    });
```

**Replace with:**
```dart
import 'package:abra_fleet/core/services/api_service.dart';

// Get profile
final response = await ApiService().get('/api/users/$userId');
final userData = response['data'];

// Update profile
await ApiService().put('/api/users/$userId', {
  'name': name,
  'updatedAt': DateTime.now().toIso8601String(),
});
```

---

### 4. client_admin_dashboard_screen.dart

**Remove:**
```dart
final ref = FirebaseDatabase.instance.ref('clients');
await FirebaseDatabase.instance.ref('clients/$clientId').remove();
await FirebaseFirestore.instance.collection('clients').doc(clientId).delete();
```

**Replace with:**
```dart
// Use HTTP API
final response = await ApiService().get('/api/admin/clients');
await ApiService().delete('/api/admin/clients/$clientId');
```

---

### 5. admin_pending_customers.dart

**Remove:**
```dart
final FirebaseFirestore _firestore = FirebaseFirestore.instance;

await _firestore.collection('customers').doc(customerId).update({
  'status': 'approved',
  'approvedAt': FieldValue.serverTimestamp(),
  'updatedAt': FieldValue.serverTimestamp(),
});

body: StreamBuilder<QuerySnapshot>(
  stream: _firestore.collection('customers').snapshots(),
  builder: (context, AsyncSnapshot<QuerySnapshot> snapshot) {
    // ...
  },
)
```

**Replace with:**
```dart
import 'package:abra_fleet/core/services/customer_management_service.dart';

// Approve customer
await CustomerManagementService().approveCustomer(customerId);

// Get customers list
final customers = await CustomerManagementService().getPendingCustomers();

// Use FutureBuilder instead of StreamBuilder
body: FutureBuilder<List<Map<String, dynamic>>>(
  future: CustomerManagementService().getPendingCustomers(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return CircularProgressIndicator();
    final customers = snapshot.data!;
    // Build UI
  },
)
```

---

### 6. document_storage_service.dart

**Remove entire file** and replace with HTTP upload:

```dart
// lib/core/services/document_upload_service.dart
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:abra_fleet/core/services/api_service.dart';

class DocumentUploadService {
  final ApiService _apiService = ApiService();

  Future<String> uploadVehicleDocument({
    required String vehicleId,
    required String documentType,
    File? file,
    Uint8List? bytes,
    required String fileName,
  }) async {
    final uri = Uri.parse('${_apiService.baseUrl}/api/vehicles/$vehicleId/documents');
    
    var request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer ${await _apiService.getToken()}';
    request.fields['documentType'] = documentType;
    
    if (bytes != null) {
      request.files.add(http.MultipartFile.fromBytes(
        'document',
        bytes,
        filename: fileName,
        contentType: MediaType('application', 'octet-stream'),
      ));
    } else if (file != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'document',
        file.path,
        filename: fileName,
      ));
    }
    
    final response = await request.send();
    final responseBody = await response.stream.bytesToString();
    
    if (response.statusCode == 200) {
      final data = json.decode(responseBody);
      return data['url'];
    } else {
      throw Exception('Upload failed: $responseBody');
    }
  }

  Future<String> uploadDriverDocument({
    required String driverId,
    required String documentType,
    File? file,
    Uint8List? bytes,
    required String fileName,
  }) async {
    final uri = Uri.parse('${_apiService.baseUrl}/api/drivers/$driverId/documents');
    
    var request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer ${await _apiService.getToken()}';
    request.fields['documentType'] = documentType;
    
    if (bytes != null) {
      request.files.add(http.MultipartFile.fromBytes(
        'document',
        bytes,
        filename: fileName,
        contentType: MediaType('application', 'octet-stream'),
      ));
    } else if (file != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'document',
        file.path,
        filename: fileName,
      ));
    }
    
    final response = await request.send();
    final responseBody = await response.stream.bytesToString();
    
    if (response.statusCode == 200) {
      final data = json.decode(responseBody);
      return data['url'];
    } else {
      throw Exception('Upload failed: $responseBody');
    }
  }
}
```

---

### 7. roster_service.dart

**Remove:**
```dart
final DatabaseReference _firebaseDb = FirebaseDatabase.instance.ref();
```

**Replace with:**
```dart
// Already using ApiService - just remove the Firebase reference
// The file already has HTTP methods, just remove the unused Firebase variable
```

---

### 8. driver_provider.dart

**Remove:**
```dart
final FirebaseFirestore _firestore = FirebaseFirestore.instance;

await _firestore.collection('users').doc(driverId).set({
  'createdAt': Timestamp.fromDate(now),
  'updatedAt': FieldValue.serverTimestamp(),
});
```

**Replace with:**
```dart
import 'package:abra_fleet/core/services/driver_service.dart';

// Use DriverService which already has HTTP methods
await DriverService().createDriver(driver);
await DriverService().updateDriver(driver);
```

---

### 9. approved_rosters_screen.dart

**Remove:**
```dart
DatabaseReference? _rostersRef;
StreamSubscription<DatabaseEvent>? _rostersSubscription;

_rostersRef = FirebaseDatabase.instance.ref('roster_requests');
```

**Replace with:**
```dart
Timer? _refreshTimer;

@override
void initState() {
  super.initState();
  _loadRosters();
  // Poll every 30 seconds
  _refreshTimer = Timer.periodic(Duration(seconds: 30), (_) => _loadRosters());
}

@override
void dispose() {
  _refreshTimer?.cancel();
  super.dispose();
}

Future<void> _loadRosters() async {
  final response = await ApiService().get('/api/rosters/approved');
  setState(() {
    _rosters = response['data'];
  });
}
```

---

### 10. sos_alert.dart (Model)

**Remove:**
```dart
factory SOSAlert.fromSnapshot(DataSnapshot snapshot) {
  // ...
}
```

**Replace with:**
```dart
factory SOSAlert.fromJson(Map<String, dynamic> json) {
  return SOSAlert(
    id: json['_id'] ?? json['id'],
    customerId: json['customerId'],
    location: json['location'],
    timestamp: DateTime.parse(json['timestamp']),
    status: json['status'],
    // ... other fields
  );
}
```

---

### 11. roster_model.dart

**Remove:**
```dart
factory RosterNotification.fromSnapshot(DataSnapshot snapshot) {
  // ...
}
```

**Replace with:**
```dart
factory RosterNotification.fromJson(Map<String, dynamic> json) {
  return RosterNotification(
    id: json['_id'] ?? json['id'],
    // ... map other fields
  );
}
```

---

## Step 5: Update main.dart

**Remove:**
```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

**Replace with:**
```dart
// Just remove Firebase initialization
// Your app now uses HTTP/WebSocket only
```

---

## Step 6: Clean and Rebuild

```bash
cd abra_fleet
flutter clean
flutter pub get
flutter run
```

---

## Testing Checklist

After removal, test these features:

- [ ] Login/Logout
- [ ] User profile updates
- [ ] Notifications
- [ ] SOS alerts
- [ ] Roster management
- [ ] Document uploads
- [ ] Real-time updates (via WebSocket)
- [ ] Customer dashboard
- [ ] Driver dashboard
- [ ] Admin dashboard

---

## Common Issues

### Issue: "Undefined name 'FirebaseFirestore'"
**Solution:** Remove the import and replace with HTTP API calls

### Issue: "The getter 'FirebaseDatabase' isn't defined"
**Solution:** Remove Firebase Database usage, use WebSocket or HTTP polling

### Issue: "FieldValue isn't defined"
**Solution:** Replace `FieldValue.serverTimestamp()` with `DateTime.now().toIso8601String()`

### Issue: "Timestamp isn't a type"
**Solution:** Replace `Timestamp` with `DateTime`

---

## Backend Endpoints Reference

Your backend already has these endpoints ready:

- `POST /api/auth/login` - Login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/notifications` - Get notifications
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/sos-alerts` - Get SOS alerts
- `POST /api/sos-alerts` - Create SOS alert
- `GET /api/rosters` - Get rosters
- `POST /api/rosters` - Create roster
- `POST /api/vehicles/:id/documents` - Upload vehicle document
- `POST /api/drivers/:id/documents` - Upload driver document

---

## Summary

1. Remove Firebase packages from pubspec.yaml
2. Delete firebase_options.dart
3. Remove all Firebase imports
4. Replace Firebase calls with HTTP/WebSocket
5. Use existing services (ApiService, NotificationService, etc.)
6. Test thoroughly

Your backend is already set up for all these operations. You just need to use HTTP calls instead of Firebase.
