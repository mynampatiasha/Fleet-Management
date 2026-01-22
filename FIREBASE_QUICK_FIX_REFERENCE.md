# Firebase Quick Fix Reference

## Immediate Actions

### 1. Remove Firebase from pubspec.yaml

Open `abra_fleet/pubspec.yaml` and **delete** these lines:

```yaml
firebase_core: ^2.24.2
firebase_auth: ^4.16.0  
firebase_database: ^10.4.0
firebase_storage: ^11.6.0
cloud_firestore: ^4.14.0
firebase_messaging: ^14.7.10
```

### 2. Delete firebase_options.dart

```bash
del abra_fleet\lib\firebase_options.dart
```

### 3. Clean and rebuild

```bash
cd abra_fleet
flutter clean
flutter pub get
```

---

## Critical File Fixes

### Fix 1: notifications_screen.dart

**File:** `lib/features/notifications/presentation/screens/notifications_screen.dart`

**Remove line 9:**
```dart
import 'package:firebase_database/firebase_database.dart';
```

**Remove lines 547-548:**
```dart
final notificationsRef = FirebaseDatabase.instance.ref('notifications/$_userId');
```

**Remove line 627:**
```dart
await FirebaseDatabase.instance.ref('notifications/$_userId').remove();
```

**Add at top:**
```dart
import 'package:abra_fleet/core/services/notification_service.dart';
```

---

### Fix 2: client_sos_alerts.dart

**File:** `lib/features/client/client_sos_alerts.dart`

**Remove line 6:**
```dart
import 'package:firebase_database/firebase_database.dart';
```

**Remove line 87:**
```dart
final sosRef = FirebaseDatabase.instance.ref('sos_events');
```

---

### Fix 3: client_profile_screen.dart

**File:** `lib/features/client/client_profile_screen.dart`

**Remove lines 101-103:**
```dart
final firestoreDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get();
```

**Replace with:**
```dart
final response = await ApiService().get('/api/users/$userId');
final userData = response['data'];
```

**Remove lines 308-313:**
```dart
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
await ApiService().put('/api/users/$userId', {
  'name': name,
  'updatedAt': DateTime.now().toIso8601String(),
});
```

---

### Fix 4: customer_profile_screen.dart

**File:** `lib/features/customer/dashboard/presentation/screens/customer_profile_screen.dart`

Same fixes as client_profile_screen.dart above.

---

### Fix 5: client_admin_dashboard_screen.dart

**File:** `lib/features/admin/client_management/client_admin_dashboard_screen.dart`

**Remove line 5:**
```dart
import 'package:firebase_database/firebase_database.dart';
```

**Remove line 9:**
```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
```

**Remove all FirebaseDatabase and FirebaseFirestore calls**

Replace with HTTP API calls using `ApiService()`.

---

### Fix 6: admin_pending_customers.dart

**File:** `lib/features/admin/customer_management/admin_pending_customers.dart`

**Remove line 16:**
```dart
final FirebaseFirestore _firestore = FirebaseFirestore.instance;
```

**Replace all `FieldValue.serverTimestamp()` with:**
```dart
DateTime.now().toIso8601String()
```

**Replace `StreamBuilder<QuerySnapshot>` with `FutureBuilder<List<Map<String, dynamic>>>`**

---

### Fix 7: document_storage_service.dart

**File:** `lib/core/services/document_storage_service.dart`

**Delete the entire file** and create a new one:

```dart
// lib/core/services/document_upload_service.dart
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'dart:convert';
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

### Fix 8: roster_service.dart

**File:** `lib/core/services/roster_service.dart`

**Remove line 6:**
```dart
import 'package:firebase_database/firebase_database.dart';
```

**Remove line 10:**
```dart
final DatabaseReference _firebaseDb = FirebaseDatabase.instance.ref();
```

---

### Fix 9: driver_provider.dart

**File:** `lib/features/admin/driver_management/presentation/providers/driver_provider.dart`

**Remove line 16:**
```dart
final FirebaseFirestore _firestore = FirebaseFirestore.instance;
```

**Replace all Firestore calls with DriverService HTTP calls**

---

### Fix 10: approved_rosters_screen.dart

**File:** `lib/features/admin/customer_management/notification/approved_rosters_screen.dart`

**Remove line 9:**
```dart
import 'package:firebase_database/firebase_database.dart';
```

**Remove lines 33-34:**
```dart
DatabaseReference? _rostersRef;
StreamSubscription<DatabaseEvent>? _rostersSubscription;
```

**Replace with polling:**
```dart
Timer? _refreshTimer;

@override
void initState() {
  super.initState();
  _loadRosters();
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

## Quick Replacements

| Replace This | With This |
|-------------|-----------|
| `FirebaseFirestore.instance` | `ApiService().get/post/put/delete()` |
| `FirebaseDatabase.instance` | `ApiService()` or `WebSocketService()` |
| `FirebaseStorage.instance` | `DocumentUploadService()` |
| `FieldValue.serverTimestamp()` | `DateTime.now().toIso8601String()` |
| `Timestamp` | `DateTime` |
| `DataSnapshot` | `Map<String, dynamic>` |
| `QuerySnapshot` | `List<Map<String, dynamic>>` |
| `StreamBuilder<QuerySnapshot>` | `FutureBuilder<List<Map>>` |

---

## After Fixes

```bash
cd abra_fleet
flutter clean
flutter pub get
flutter run
```

---

## Files to Fix (Priority Order)

1. ✅ pubspec.yaml - Remove packages
2. ✅ firebase_options.dart - Delete file
3. ⚠️ notifications_screen.dart
4. ⚠️ client_sos_alerts.dart
5. ⚠️ client_profile_screen.dart
6. ⚠️ customer_profile_screen.dart
7. ⚠️ client_admin_dashboard_screen.dart
8. ⚠️ admin_pending_customers.dart
9. ⚠️ document_storage_service.dart
10. ⚠️ roster_service.dart
11. ⚠️ driver_provider.dart
12. ⚠️ approved_rosters_screen.dart

---

For complete details, see: **FIREBASE_COMPLETE_REMOVAL_GUIDE_FINAL.md**
