# Client SOS Alerts - Organization-Based Filtering

## Overview

The Client SOS Alerts feature allows client organizations to view and monitor SOS alerts raised by their employees. Each client can only see alerts from employees within their organization (based on email domain).

## Key Features

### 🎯 Organization-Based Filtering
- Clients see only SOS alerts from employees with matching email domains
- Example: `client@cognizant.com` sees alerts from `employee@cognizant.com`
- Automatic domain extraction from logged-in user's email

### 📊 Real-Time Dashboard
- **Live Updates**: Real-time synchronization with Firebase Realtime Database
- **Statistics Cards**:
  - Active Alerts (red)
  - In Progress (orange)
  - Resolved (green)
  - Today's Alerts (blue)

### 🔍 Advanced Filtering
- **Status Filter**: All, ACTIVE, Pending, In Progress, Resolved, Escalated
- **Time Filter**: All Time, Today, This Week, This Month
- **Search**: By employee name, email, or location

### 🎨 Beautiful UI Design
- Modern card-based layout
- Color-coded status badges
- Responsive design
- Clean and professional interface
- Real-time fleet management application style

## Implementation Details

### Frontend (Flutter)

**File**: `abra_fleet/lib/features/client/client_sos_alerts.dart`

**Key Components**:
1. **SOSAlert Model**: Data structure for SOS alerts
2. **Real-time Listener**: Firebase Realtime Database subscription
3. **Organization Filter**: Automatic domain-based filtering
4. **Stats Grid**: Visual statistics display
5. **Filter Section**: Status, time, and search filters
6. **Alert Cards**: Detailed alert information display

**Domain Filtering Logic**:
```dart
// Extract organization domain from logged-in user
final emailParts = currentUser.email!.split('@');
_clientOrganizationDomain = '@${emailParts[1]}';

// Filter alerts by domain
if (customerEmail.endsWith(_clientOrganizationDomain!)) {
  alerts.add(SOSAlert.fromMap(key, alertData));
}
```

### Backend (Node.js)

**File**: `abra_fleet_backend/routes/sos_router.js`

**Updates**:
1. Added `customerEmail` field to SOS event creation
2. Added organization domain filtering to GET endpoint
3. Store email in both MongoDB and Firebase

**API Endpoint**:
```javascript
GET /api/sos?organizationDomain=@cognizant.com&status=ACTIVE
```

### Integration

**File**: `abra_fleet/lib/features/client/client_main_shell.dart`

**Changes**:
1. Import `client_sos_alerts.dart`
2. Replace placeholder screen with `ClientSOSAlerts()`

## Data Structure

### SOS Alert Object
```json
{
  "id": "unique_id",
  "customerId": "cust001",
  "customerName": "John Doe",
  "customerEmail": "john.doe@cognizant.com",
  "address": "MG Road, Bangalore, Karnataka, India",
  "status": "ACTIVE",
  "timestamp": "2025-12-15T10:30:00.000Z",
  "gps": {
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

### Status Values
- **ACTIVE**: Alert just raised, needs immediate attention
- **Pending**: Alert acknowledged, waiting for action
- **In Progress**: Help is on the way
- **Resolved**: Alert successfully resolved
- **Escalated**: Alert escalated to higher authority

## Testing

### Test Script
**File**: `abra_fleet_backend/test-client-sos-alerts.js`

**Run Test**:
```bash
cd abra_fleet_backend
node test-client-sos-alerts.js
```

**Test Data Created**:
- 3 alerts for @cognizant.com
- 1 alert for @tcs.com
- 1 alert for @abrafleet.com

### Manual Testing Steps

1. **Create Test Alerts**:
   ```bash
   cd abra_fleet_backend
   node test-client-sos-alerts.js
   ```

2. **Login as Client**:
   - Use credentials: `client@cognizant.com`
   - Navigate to "SOS Alerts" section

3. **Verify Filtering**:
   - Should see only 3 alerts (from @cognizant.com employees)
   - Should NOT see alerts from @tcs.com or @abrafleet.com

4. **Test Filters**:
   - Status: Select "ACTIVE" - should filter to active alerts only
   - Time: Select "Today" - should show only today's alerts
   - Search: Type employee name - should filter results

5. **Test Real-time Updates**:
   - Create a new SOS alert via mobile app
   - Should appear immediately in the client dashboard

## UI Components

### Stats Grid
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Active      │ In Progress │ Resolved    │ Today       │
│ Alerts      │             │             │             │
│ 🔴 2        │ 🟠 1        │ 🟢 3        │ 🔵 4        │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Filter Section
```
┌─────────────────────────────────────────────────────────┐
│ Filters                                                 │
│                                                         │
│ [Search by employee name, email, or location...]       │
│                                                         │
│ Status: [All] [ACTIVE] [Pending] [In Progress]        │
│         [Resolved] [Escalated]                         │
│                                                         │
│ Time:   [All Time] [Today] [This Week] [This Month]   │
└─────────────────────────────────────────────────────────┘
```

### Alert Card
```
┌─────────────────────────────────────────────────────────┐
│ 🚨  John Doe                            [ACTIVE]       │
│     📧 john.doe@cognizant.com                          │
│     📍 MG Road, Bangalore, Karnataka, India            │
│     🕐 30m ago                                    →     │
└─────────────────────────────────────────────────────────┘
```

## Color Scheme

- **Active/Pending**: Red (#EF4444)
- **In Progress**: Orange (#F59E0B)
- **Resolved**: Green (#10B981)
- **Escalated**: Purple (#8B5CF6)
- **Primary**: Blue (#2563EB)
- **Background**: Light Gray (#F8FAFC)

## Security Considerations

1. **Domain Validation**: Email domain extracted from authenticated user
2. **Client-Side Filtering**: Additional security layer in Flutter
3. **Backend Filtering**: Optional API-level filtering available
4. **Real-time Rules**: Firebase security rules should restrict access

## Future Enhancements

1. **Map Integration**: View alert location on map
2. **Status Updates**: Allow clients to update alert status
3. **Notifications**: Push notifications for new alerts
4. **Export**: Export alerts to CSV/PDF
5. **Analytics**: Detailed analytics and reports
6. **Response Time**: Track average response time
7. **Escalation Rules**: Automatic escalation based on time
8. **Communication**: In-app chat with employee

## Troubleshooting

### No Alerts Showing
- Verify user is logged in with correct email domain
- Check Firebase Realtime Database for SOS events
- Verify `customerEmail` field exists in SOS events
- Check console logs for domain extraction

### Wrong Alerts Showing
- Verify domain filtering logic
- Check email format in SOS events
- Ensure case-insensitive comparison

### Real-time Updates Not Working
- Check Firebase Realtime Database connection
- Verify listener is properly set up
- Check for subscription cancellation

## API Reference

### Create SOS Alert
```http
POST /api/sos
Content-Type: application/json

{
  "customerId": "cust001",
  "customerName": "John Doe",
  "customerEmail": "john.doe@cognizant.com",
  "assignedDriverId": "drv001",
  "gps": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "timestamp": "2025-12-15T10:30:00.000Z"
}
```

### Get Organization Alerts
```http
GET /api/sos?organizationDomain=@cognizant.com&status=ACTIVE&limit=50&offset=0
```

### Update Alert Status
```http
PUT /api/sos/:id/status
Content-Type: application/json

{
  "status": "In Progress"
}
```

## Summary

The Client SOS Alerts feature provides a comprehensive, real-time monitoring solution for organizations to track and respond to employee emergencies. With organization-based filtering, beautiful UI design, and advanced filtering capabilities, it offers a professional fleet management experience.

**Key Benefits**:
- ✅ Organization-specific visibility
- ✅ Real-time updates
- ✅ Beautiful, modern UI
- ✅ Advanced filtering
- ✅ Easy to use
- ✅ Scalable architecture

**Status**: ✅ Implementation Complete
