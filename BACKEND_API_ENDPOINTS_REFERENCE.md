# Backend API Endpoints Reference

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### Login
```dart
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123",
  "userType": "admin" // or "driver", "customer", "client"
}
Response: {
  "token": "jwt_token_here",
  "user": { ...userData }
}
```

---

## User Management

### Get User Profile
```dart
GET /api/users/:userId
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...userData } }
```

### Update User Profile
```dart
PUT /api/users/:userId
Headers: { "Authorization": "Bearer token" }
Body: {
  "name": "New Name",
  "phone": "1234567890",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get All Users
```dart
GET /api/users
Headers: { "Authorization": "Bearer token" }
Response: { "data": [...users] }
```

---

## Notifications

### Get Notifications
```dart
GET /api/notifications
Headers: { "Authorization": "Bearer token" }
Query: ?userId=xxx
Response: { "data": [...notifications] }
```

### Mark Notification as Read
```dart
PUT /api/notifications/:notificationId/read
Headers: { "Authorization": "Bearer token" }
```

### Delete Notification
```dart
DELETE /api/notifications/:notificationId
Headers: { "Authorization": "Bearer token" }
```

### Create Notification
```dart
POST /api/notifications
Headers: { "Authorization": "Bearer token" }
Body: {
  "userId": "user_id",
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info"
}
```

---

## Rosters

### Get Rosters
```dart
GET /api/rosters
Headers: { "Authorization": "Bearer token" }
Query: ?status=pending&organizationId=xxx
Response: { "data": [...rosters] }
```

### Get Pending Rosters
```dart
GET /api/rosters/pending
Headers: { "Authorization": "Bearer token" }
Response: { "data": [...pendingRosters] }
```

### Get Approved Rosters
```dart
GET /api/rosters/approved
Headers: { "Authorization": "Bearer token" }
Response: { "data": [...approvedRosters] }
```

### Create Roster
```dart
POST /api/rosters
Headers: { "Authorization": "Bearer token" }
Body: {
  "employeeId": "emp_id",
  "pickupLocation": {...},
  "dropLocation": {...},
  "shiftTime": "09:00",
  "organizationId": "org_id"
}
```

### Update Roster
```dart
PUT /api/rosters/:rosterId
Headers: { "Authorization": "Bearer token" }
Body: { ...rosterData }
```

### Delete Roster
```dart
DELETE /api/rosters/:rosterId
Headers: { "Authorization": "Bearer token" }
```

---

## SOS Alerts

### Get SOS Alerts
```dart
GET /api/sos-alerts
Headers: { "Authorization": "Bearer token" }
Query: ?status=active&organizationId=xxx
Response: { "data": [...sosAlerts] }
```

### Create SOS Alert
```dart
POST /api/sos-alerts
Headers: { "Authorization": "Bearer token" }
Body: {
  "customerId": "customer_id",
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Resolve SOS Alert
```dart
PUT /api/sos-alerts/:alertId/resolve
Headers: { "Authorization": "Bearer token" }
Body: {
  "notes": "Resolved notes",
  "resolvedBy": "admin_id"
}
```

---

## Drivers

### Get All Drivers
```dart
GET /api/drivers
Headers: { "Authorization": "Bearer token" }
Query: ?organizationId=xxx&status=active
Response: { "data": [...drivers] }
```

### Get Driver by ID
```dart
GET /api/drivers/:driverId
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...driverData } }
```

### Create Driver
```dart
POST /api/drivers
Headers: { "Authorization": "Bearer token" }
Body: {
  "name": "Driver Name",
  "email": "driver@example.com",
  "phone": "1234567890",
  "licenseNumber": "DL123456",
  "organizationId": "org_id"
}
```

### Update Driver
```dart
PUT /api/drivers/:driverId
Headers: { "Authorization": "Bearer token" }
Body: { ...driverData }
```

### Get Driver Route
```dart
GET /api/drivers/:driverId/route
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...routeData } }
```

### Get Driver Reports
```dart
GET /api/drivers/:driverId/reports
Headers: { "Authorization": "Bearer token" }
Query: ?startDate=2024-01-01&endDate=2024-01-31
Response: { "data": { ...reportData } }
```

---

## Vehicles

### Get All Vehicles
```dart
GET /api/vehicles
Headers: { "Authorization": "Bearer token" }
Query: ?organizationId=xxx&status=available
Response: { "data": [...vehicles] }
```

### Get Vehicle by ID
```dart
GET /api/vehicles/:vehicleId
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...vehicleData } }
```

### Create Vehicle
```dart
POST /api/vehicles
Headers: { "Authorization": "Bearer token" }
Body: {
  "registrationNumber": "KA01AB1234",
  "model": "Toyota Innova",
  "capacity": 7,
  "organizationId": "org_id"
}
```

### Update Vehicle
```dart
PUT /api/vehicles/:vehicleId
Headers: { "Authorization": "Bearer token" }
Body: { ...vehicleData }
```

---

## Trips

### Get Trips
```dart
GET /api/trips
Headers: { "Authorization": "Bearer token" }
Query: ?status=active&driverId=xxx
Response: { "data": [...trips] }
```

### Get Active Trip
```dart
GET /api/trips/active
Headers: { "Authorization": "Bearer token" }
Query: ?customerId=xxx
Response: { "data": { ...tripData } }
```

### Create Trip
```dart
POST /api/trips
Headers: { "Authorization": "Bearer token" }
Body: {
  "driverId": "driver_id",
  "vehicleId": "vehicle_id",
  "customerId": "customer_id",
  "pickupLocation": {...},
  "dropLocation": {...}
}
```

### Update Trip Status
```dart
PUT /api/trips/:tripId/status
Headers: { "Authorization": "Bearer token" }
Body: {
  "status": "completed",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Customers

### Get All Customers
```dart
GET /api/customers
Headers: { "Authorization": "Bearer token" }
Query: ?organizationId=xxx&status=active
Response: { "data": [...customers] }
```

### Get Customer Stats
```dart
GET /api/customers/:customerId/stats
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...statsData } }
```

### Get Customer Trips
```dart
GET /api/customers/:customerId/trips
Headers: { "Authorization": "Bearer token" }
Query: ?startDate=2024-01-01&endDate=2024-01-31
Response: { "data": [...trips] }
```

---

## Clients

### Get All Clients
```dart
GET /api/clients
Headers: { "Authorization": "Bearer token" }
Response: { "data": [...clients] }
```

### Get Client Dashboard Data
```dart
GET /api/clients/:clientId/dashboard
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...dashboardData } }
```

---

## Analytics

### Get Admin Analytics
```dart
GET /api/analytics/admin
Headers: { "Authorization": "Bearer token" }
Query: ?startDate=2024-01-01&endDate=2024-01-31
Response: { "data": { ...analyticsData } }
```

### Get Company Analytics
```dart
GET /api/analytics/company
Headers: { "Authorization": "Bearer token" }
Query: ?organizationId=xxx
Response: { "data": { ...companyAnalytics } }
```

---

## Document Upload

### Upload Vehicle Document
```dart
POST /api/vehicles/:vehicleId/documents
Headers: { 
  "Authorization": "Bearer token",
  "Content-Type": "multipart/form-data"
}
Body: FormData {
  "document": File,
  "documentType": "insurance" // or "registration", "permit"
}
Response: { "url": "document_url" }
```

### Upload Driver Document
```dart
POST /api/drivers/:driverId/documents
Headers: { 
  "Authorization": "Bearer token",
  "Content-Type": "multipart/form-data"
}
Body: FormData {
  "document": File,
  "documentType": "license" // or "aadhar", "pan"
}
Response: { "url": "document_url" }
```

---

## Billing

### Get Invoices
```dart
GET /api/billing/invoices
Headers: { "Authorization": "Bearer token" }
Query: ?customerId=xxx&status=pending
Response: { "data": [...invoices] }
```

### Create Invoice
```dart
POST /api/billing/invoices
Headers: { "Authorization": "Bearer token" }
Body: {
  "customerId": "customer_id",
  "amount": 1000,
  "items": [...]
}
```

### Get Billing Customers
```dart
GET /api/billing/customers
Headers: { "Authorization": "Bearer token" }
Response: { "data": [...customers] }
```

---

## Real-Time Fleet

### Get Real-Time Fleet Data
```dart
GET /api/real-time-fleet
Headers: { "Authorization": "Bearer token" }
Query: ?organizationId=xxx
Response: { "data": [...fleetData] }
```

---

## Maintenance

### Get Maintenance Records
```dart
GET /api/maintenance
Headers: { "Authorization": "Bearer token" }
Query: ?vehicleId=xxx
Response: { "data": [...maintenanceRecords] }
```

### Schedule Maintenance
```dart
POST /api/maintenance
Headers: { "Authorization": "Bearer token" }
Body: {
  "vehicleId": "vehicle_id",
  "type": "service",
  "scheduledDate": "2024-01-01"
}
```

---

## HRM

### Get Employees
```dart
GET /api/hrm/employees
Headers: { "Authorization": "Bearer token" }
Query: ?organizationId=xxx
Response: { "data": [...employees] }
```

### Get Departments
```dart
GET /api/hrm/departments
Headers: { "Authorization": "Bearer token" }
Response: { "data": [...departments] }
```

### Get Leave Requests
```dart
GET /api/hrm/leaves
Headers: { "Authorization": "Bearer token" }
Query: ?status=pending
Response: { "data": [...leaveRequests] }
```

### Get Attendance
```dart
GET /api/hrm/attendance
Headers: { "Authorization": "Bearer token" }
Query: ?employeeId=xxx&date=2024-01-01
Response: { "data": [...attendanceRecords] }
```

---

## TMS (Ticket Management)

### Get Tickets
```dart
GET /api/tms/tickets
Headers: { "Authorization": "Bearer token" }
Query: ?status=open&assignedTo=xxx
Response: { "data": [...tickets] }
```

### Create Ticket
```dart
POST /api/tms/tickets
Headers: { "Authorization": "Bearer token" }
Body: {
  "title": "Ticket Title",
  "description": "Description",
  "priority": "high",
  "assignedTo": "user_id"
}
```

### Update Ticket
```dart
PUT /api/tms/tickets/:ticketId
Headers: { "Authorization": "Bearer token" }
Body: { ...ticketData }
```

---

## Assignment

### Assign Rosters to Vehicle
```dart
POST /api/assignment/assign-batch
Headers: { "Authorization": "Bearer token" }
Body: {
  "rosterIds": ["roster1", "roster2"],
  "vehicleId": "vehicle_id",
  "driverId": "driver_id"
}
```

### Get Assignment Status
```dart
GET /api/assignment/status/:rosterId
Headers: { "Authorization": "Bearer token" }
Response: { "data": { ...assignmentStatus } }
```

---

## Route Optimization

### Optimize Route
```dart
POST /api/route-optimization/optimize
Headers: { "Authorization": "Bearer token" }
Body: {
  "locations": [...],
  "vehicleCapacity": 7,
  "startLocation": {...}
}
Response: { "data": { ...optimizedRoute } }
```

---

## Usage Example in Flutter

```dart
import 'package:abra_fleet/core/services/api_service.dart';

// Get notifications
final response = await ApiService().get('/api/notifications');
final notifications = response['data'];

// Create roster
await ApiService().post('/api/rosters', {
  'employeeId': 'emp123',
  'pickupLocation': {'lat': 12.9716, 'lng': 77.5946},
  'shiftTime': '09:00',
});

// Update user profile
await ApiService().put('/api/users/$userId', {
  'name': 'New Name',
  'updatedAt': DateTime.now().toIso8601String(),
});

// Delete notification
await ApiService().delete('/api/notifications/$notificationId');
```

---

## Common Patterns

### Replace FieldValue.serverTimestamp()
```dart
// OLD (Firebase)
'updatedAt': FieldValue.serverTimestamp()

// NEW (HTTP)
'updatedAt': DateTime.now().toIso8601String()
```

### Replace Firestore Get
```dart
// OLD (Firebase)
final doc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get();
final data = doc.data();

// NEW (HTTP)
final response = await ApiService().get('/api/users/$userId');
final data = response['data'];
```

### Replace Firestore Update
```dart
// OLD (Firebase)
await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .update({'name': 'New Name'});

// NEW (HTTP)
await ApiService().put('/api/users/$userId', {'name': 'New Name'});
```

### Replace Realtime Database
```dart
// OLD (Firebase)
final ref = FirebaseDatabase.instance.ref('notifications/$userId');
ref.onValue.listen((event) { ... });

// NEW (WebSocket or Polling)
// Option 1: WebSocket
WebSocketService().connect();
WebSocketService().listen('notifications', (data) { ... });

// Option 2: Polling
Timer.periodic(Duration(seconds: 30), (_) async {
  final response = await ApiService().get('/api/notifications');
  setState(() { notifications = response['data']; });
});
```

---

## Error Handling

All endpoints return errors in this format:
```dart
{
  "error": "Error message",
  "statusCode": 400
}
```

Handle errors like this:
```dart
try {
  final response = await ApiService().get('/api/users/$userId');
  // Success
} catch (e) {
  print('Error: $e');
  // Show error to user
}
```

---

## Notes

1. All endpoints require JWT authentication (except `/api/auth/login`)
2. Include the token in the `Authorization` header: `Bearer your_token_here`
3. All timestamps should be in ISO 8601 format: `DateTime.now().toIso8601String()`
4. The backend is running on `http://localhost:3000`
5. For production, update the base URL in `api_config.dart`
