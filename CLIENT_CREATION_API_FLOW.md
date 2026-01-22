# Client Creation API Flow - Complete Documentation

## Overview
When clients are added through the **Client Details** page in `admin_main_shell.dart`, they are stored in the **clients collection** using a unified API endpoint.

---

## Frontend Implementation

### Location
**File:** `abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart`

### Navigation Path
1. Admin Main Shell → Client Management → **Client Details** (Index 20)
2. Click "Add New Client" button
3. Fill in the client form
4. Submit to create client

### Frontend Method: `_createClient()`

**Location:** Lines ~789+ in `client_admin_dashboard_screen.dart`

```dart
Future<void> _createClient({
  required String name,
  required String email,
  required String password,
  required String phone,
  required String address,
  required String contactPerson,
  String? branch,
  String? gstNumber,
  String? panNumber,
}) async {
  // Get JWT token from SharedPreferences
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt_token');
  
  if (token == null || token.isEmpty) {
    throw Exception('Admin must be logged in');
  }

  // Create client via backend API
  final response = await http.post(
    Uri.parse('${ApiConfig.baseUrl}/api/admin-clients-unified/clients'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: json.encode({
      'name': name,
      'email': email,
      'password': password,
      'phone': phone,
      'address': address,
      'contactPerson': contactPerson,
      'branch': branch,
      'gstNumber': gstNumber,
      'panNumber': panNumber,
      'role': 'client',
      'status': 'active',
    }),
  );

  if (response.statusCode == 201 || response.statusCode == 200) {
    final data = json.decode(response.body);
    debugPrint('✅ Client created successfully: ${data['message']}');
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message'] ?? 'Failed to create client');
  }
}
```

---

## Backend API Endpoint

### API Route
**POST** `/api/admin-clients-unified/clients`

**File:** `abra_fleet_backend/routes/admin-clients-unified.js`

### Request Headers
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "name": "Client Company Name",
  "email": "client@example.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "address": "123 Business Street",
  "contactPerson": "John Doe",
  "branch": "Main Branch",
  "gstNumber": "GST123456",
  "panNumber": "PAN123456",
  "role": "client",
  "status": "active"
}
```

### Backend Processing Flow

#### 1. **Validation**
```javascript
// Validate required fields
if (!name || !email) {
  return res.status(400).json({
    success: false,
    error: 'Missing required fields',
    message: 'Name and email are required'
  });
}
```

#### 2. **Check for Existing Client**
```javascript
// Check if client already exists
const existingClient = await req.db.collection('clients').findOne({
  email: email.toLowerCase()
});

if (existingClient) {
  return res.status(409).json({
    success: false,
    error: 'Client already exists',
    message: 'A client with this email already exists'
  });
}
```

#### 3. **Create Firebase Auth User**
```javascript
// Create Firebase Auth user
const firebaseUser = await admin.auth().createUser({
  email: email.toLowerCase(),
  emailVerified: false,
  password: tempPassword,
  displayName: name,
  disabled: false
});

firebaseUid = firebaseUser.uid;

// Set custom claims for client role
await admin.auth().setCustomUserClaims(firebaseUid, {
  role: 'client'
});
```

#### 4. **Insert into MongoDB Clients Collection**
```javascript
const newClient = {
  clientId: `CLIENT${Date.now()}`,
  name: name.trim(),
  email: email.toLowerCase().trim(),
  phone: phone?.trim() || '',
  companyName: companyName?.trim() || organizationName?.trim() || '',
  organizationName: organizationName?.trim() || companyName?.trim() || '',
  status: status.toLowerCase(),
  role: 'client',
  firebaseUid,
  totalCustomers: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: req.user?.uid || 'system'
};

const result = await req.db.collection('clients').insertOne(newClient);
```

#### 5. **Sync to Firestore**
```javascript
await admin.firestore().collection('users').doc(firebaseUid).set({
  name,
  email: email.toLowerCase(),
  phone: phone || '',
  companyName: companyName || organizationName || '',
  organizationName: organizationName || companyName || '',
  role: 'client',
  status: status.toLowerCase(),
  clientId: result.insertedId.toString(),
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});
```

#### 6. **Sync to Firebase Realtime Database**
```javascript
const clientRef = admin.database().ref('clients').push();
await clientRef.set({
  email: email.toLowerCase(),
  name: name,
  organizationName: organizationName || companyName || '',
  companyName: companyName || organizationName || '',
  phoneNumber: phone || '',
  totalCustomers: 0,
  createdAt: new Date().toISOString()
});
```

### Response
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "clientId": "CLIENT1234567890",
    "firebaseUid": "firebase-uid-here",
    "name": "Client Company Name",
    "email": "client@example.com",
    "phone": "1234567890",
    "companyName": "Client Company Name",
    "organizationName": "Client Company Name",
    "status": "active",
    "role": "client",
    "totalCustomers": 0,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

---

## Database Storage Locations

### 1. **MongoDB - Primary Storage**
- **Collection:** `clients`
- **Database:** Main MongoDB database
- **Purpose:** Primary source of truth for client data

### 2. **Firestore**
- **Collection:** `users`
- **Document ID:** Firebase UID
- **Purpose:** Compatibility with existing Firebase-based features

### 3. **Firebase Realtime Database**
- **Path:** `/clients/{pushId}`
- **Purpose:** Legacy compatibility

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Main Shell → Client Details Page                     │
│  (admin_main_shell.dart → client_admin_dashboard_screen)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Click "Add New Client"
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Client Form Dialog                                          │
│  - Company Name, Email, Password                             │
│  - Phone, Address, Contact Person                            │
│  - Branch, GST, PAN (optional)                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Submit Form
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: _createClient() Method                            │
│  POST /api/admin-clients-unified/clients                     │
│  Headers: Authorization: Bearer <JWT_TOKEN>                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Request
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: admin-clients-unified.js                           │
│  Route: POST /api/admin/clients/unified                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─► 1. Validate required fields
                     │
                     ├─► 2. Check for existing client
                     │
                     ├─► 3. Create Firebase Auth user
                     │      - Email/Password authentication
                     │      - Set custom claims (role: client)
                     │
                     ├─► 4. Insert into MongoDB 'clients' collection ✅
                     │      - Primary storage location
                     │      - Auto-generated clientId
                     │
                     ├─► 5. Sync to Firestore 'users' collection
                     │      - For compatibility
                     │
                     └─► 6. Sync to Firebase Realtime Database
                            - Legacy compatibility
```

---

## Key Points

1. **Primary API Endpoint:** `POST /api/admin-clients-unified/clients`
2. **Primary Storage:** MongoDB `clients` collection
3. **Authentication:** JWT token required (admin must be logged in)
4. **Multi-Database Sync:** Data is synced to MongoDB, Firestore, and Firebase Realtime DB
5. **Firebase Auth:** Client user account is created for login purposes
6. **Auto-Generated Fields:**
   - `clientId`: `CLIENT{timestamp}`
   - `firebaseUid`: From Firebase Auth
   - `createdAt`, `updatedAt`: Timestamps

---

## Related Files

### Frontend
- `abra_fleet/lib/features/admin/shell/admin_main_shell.dart` - Main navigation
- `abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart` - Client management UI

### Backend
- `abra_fleet_backend/routes/admin-clients-unified.js` - Client API routes
- `abra_fleet_backend/index.js` - Route registration

### Configuration
- `abra_fleet/lib/app/config/api_config.dart` - API base URL configuration

---

## Testing

To test client creation:

1. **Login as Admin** in the Flutter app
2. Navigate to **Client Management → Client Details**
3. Click **"Add New Client"** button
4. Fill in the form with required details
5. Submit the form
6. Check MongoDB `clients` collection for the new record

### Backend Test Script
```javascript
// test-client-creation.js
const axios = require('axios');

async function testClientCreation() {
  const response = await axios.post(
    'http://localhost:3001/api/admin-clients-unified/clients',
    {
      name: 'Test Client Company',
      email: 'testclient@example.com',
      password: 'TestPass123!',
      phone: '9876543210',
      address: '123 Test Street',
      contactPerson: 'Test Person',
      role: 'client',
      status: 'active'
    },
    {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('✅ Client created:', response.data);
}

testClientCreation();
```

---

## Summary

**When clients are added in the Client Details page of admin_main_shell.dart:**

✅ **API Used:** `POST /api/admin-clients-unified/clients`  
✅ **Storage:** MongoDB `clients` collection (primary)  
✅ **Sync:** Firestore `users` collection + Firebase Realtime Database  
✅ **Authentication:** Firebase Auth user created with custom claims  
✅ **Frontend File:** `client_admin_dashboard_screen.dart`  
✅ **Backend File:** `admin-clients-unified.js`
