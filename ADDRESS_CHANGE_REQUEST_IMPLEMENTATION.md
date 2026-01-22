# Address Change Request Implementation Guide

## Overview
Complete implementation of the Address Change Request workflow that allows customers to request address changes, admins to process them, drivers to receive assignments, and customers to get confirmation - all within a 4-5 working day processing timeline.

## Complete Workflow

### Step 1: Customer Submits Address Change Request (Mobile App)
1. Customer opens "My Trips" screen
2. Taps menu → "Change Address"
3. System loads current pickup and drop addresses
4. Customer selects new pickup location on map
5. Customer selects new drop location on map
6. Customer optionally adds reason for change
7. System shows affected upcoming trips count
8. Customer submits request
9. System shows success message: "Processing will take 4-5 working days"
10. Request status shows as "Under Review"

### Step 2: Admin Receives and Reviews Request (Web App - 4-5 Working Days)
1. Admin receives immediate notification
2. Admin opens "Address Change Requests" section
3. Admin views request details:
   - Customer information
   - Current vs new addresses (with map visualization)
   - Reason for change
   - Affected upcoming trips count
4. Admin validates new address is within service area
5. Admin checks route feasibility
6. Admin can either:
   - **Process**: Assign driver and vehicle with new addresses
   - **Reject**: Provide rejection reason

### Step 3: Admin Processes and Assigns (Web App)
1. Admin clicks "Process Request"
2. Admin selects:
   - Driver from available list
   - Vehicle from available list
   - Pickup time
   - Start date
   - Service days (Mon-Fri default)
3. Admin adds optional notes
4. System updates customer's default addresses
5. System creates new roster with new addresses
6. System marks request as "Completed"
7. System sends notifications to driver and customer

### Step 4: Driver Receives Assignment (Mobile App)
1. Driver receives notification: "New Roster Assigned - [Customer Name]"
2. Driver opens notification to view complete details:
   - Customer Name
   - Customer Email
   - Customer Phone
   - **Pickup Location** (new address with map pin)
   - **Drop Location** (new address with map pin)
   - Pickup Time
   - Start Date
   - Service Days
3. Driver can:
   - View route on map
   - Navigate to location
   - Contact customer
   - Acknowledge assignment

### Step 5: Customer Gets Confirmation (Mobile App)
1. Customer receives notification: "Your Transportation is Ready!"
2. Customer views complete details:
   - Service Start Date
   - Vehicle Number, Type, Model
   - Driver Name and Contact
   - Confirmed Pickup Location
   - Confirmed Drop Location
   - Pickup Time
   - Service Days
3. Customer can:
   - View in "My Trips"
   - Contact driver
   - Track vehicle on trip day

## Files Created/Modified

### Backend Files

#### New Files:
1. **`abra_fleet_backend/routes/address_change_router.js`**
   - POST `/api/address-change/customer/request` - Submit address change request
   - GET `/api/address-change/customer/requests` - Get customer's requests
   - GET `/api/address-change/admin/requests` - Get all requests (admin)
   - GET `/api/address-change/admin/request/:id` - Get specific request details
   - PUT `/api/address-change/admin/request/:id/process` - Process and assign roster
   - PUT `/api/address-change/admin/request/:id/reject` - Reject request

#### Modified Files:
2. **`abra_fleet_backend/index.js`**
   - Added address change router import
   - Registered `/api/address-change` routes

### Frontend Mobile App Files

#### New Files:
3. **`abra_fleet/lib/features/customer/dashboard/presentation/screens/address_change_request_screen.dart`**
   - Customer screen to submit address change request
   - Map-based location picker for new addresses
   - Shows current addresses
   - Displays affected trips count
   - Form validation and submission

4. **`abra_fleet/lib/features/customer/dashboard/presentation/screens/my_address_requests_screen.dart`**
   - Customer screen to view all address change requests
   - Status filtering (All, Under Review, Processing, Completed, Rejected)
   - Color-coded status indicators
   - Detailed request information
   - Shows completion details when processed

#### Modified Files:
5. **`abra_fleet/lib/features/customer/dashboard/presentation/screens/my_trips_screen.dart`**
   - Added "Change Address" menu option
   - Added "My Address Requests" menu option
   - Navigation to address change screens

6. **`abra_fleet/lib/features/customer/dashboard/data/repositories/roster_repository.dart`**
   - Added `submitAddressChangeRequest()` method
   - Added `getAddressChangeRequests()` method
   - Added status helper methods (display text, colors, icons)

7. **`abra_fleet/lib/core/services/roster_service.dart`**
   - Added `submitAddressChangeRequest()` method
   - Added `getAddressChangeRequests()` method
   - Added `getCustomerRosters()` method

### Frontend Web App Files (Admin)

#### To Be Created:
8. **`abra_fleet/lib/features/admin/address_change_management.dart`**
   - Admin screen to manage address change requests
   - List view with filtering
   - Detailed request view with maps
   - Process request dialog with driver/vehicle selection
   - Reject request dialog with reason input

## Database Schema

### Collection: `address_change_requests`
```javascript
{
  _id: ObjectId,
  customerId: String,              // Firebase UID
  customerName: String,            // Customer display name
  customerEmail: String,           // Customer email
  customerPhone: String,           // Customer phone
  organizationName: String,        // Customer's organization
  
  // Current addresses
  currentPickupAddress: String,
  currentDropAddress: String,
  
  // New addresses
  newPickupAddress: String,
  newPickupLat: Number,
  newPickupLng: Number,
  newDropAddress: String,
  newDropLat: Number,
  newDropLng: Number,
  
  reason: String,                  // Optional reason for change
  status: String,                  // under_review, processing, completed, rejected
  
  affectedTripIds: [ObjectId],     // Array of affected roster IDs
  affectedTripsCount: Number,      // Count of affected trips
  
  // Processing details (when completed)
  processedBy: String,             // Admin who processed
  processedAt: Date,               // Processing timestamp
  assignedRosterId: ObjectId,      // New roster ID
  driverId: String,                // Assigned driver
  driverName: String,              // Driver name
  vehicleId: String,               // Assigned vehicle
  vehicleNumber: String,           // Vehicle number
  vehicleType: String,             // Vehicle type
  vehicleModel: String,            // Vehicle model
  adminNotes: String,              // Admin notes
  
  // Rejection details (when rejected)
  rejectedBy: String,              // Admin who rejected
  rejectedAt: Date,                // Rejection timestamp
  rejectionReason: String,         // Reason for rejection
  
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Collection: `customers`
```javascript
{
  // ... existing fields ...
  pickupLocation: String,          // Updated with new address
  pickupLat: Number,               // Updated with new coordinates
  pickupLng: Number,               // Updated with new coordinates
  dropLocation: String,            // Updated with new address
  dropLat: Number,                 // Updated with new coordinates
  dropLng: Number,                 // Updated with new coordinates
  updatedAt: Date
}
```

### New Collection Entry: `rosters`
```javascript
{
  // ... standard roster fields ...
  addressChangeRequestId: ObjectId, // Reference to address change request
  pickupLocation: String,           // New pickup address
  pickupLat: Number,                // New pickup coordinates
  pickupLng: Number,
  dropLocation: String,             // New drop address
  dropLat: Number,                  // New drop coordinates
  dropLng: Number,
  status: 'assigned',
  createdAt: Date,
  updatedAt: Date
}
```

## Status Flow

### Address Change Request Statuses:
1. **under_review** (Orange) - Initial status when customer submits
2. **processing** (Blue) - Admin is working on it (optional intermediate status)
3. **completed** (Green) - Admin has processed and assigned driver/vehicle
4. **rejected** (Red) - Admin rejected the request

### Status Transitions:
- `under_review` → `completed` (Admin processes successfully)
- `under_review` → `rejected` (Admin rejects)
- `under_review` → `processing` → `completed` (Optional intermediate step)

## Notification Flow

### 1. Customer Submits Request
**Notification to Admin:**
- Title: "New Address Change Request"
- Message: "[Customer Name] has requested an address change"
- Type: `address_change_request`
- Data: requestId, customerId, customerName, affectedTripsCount

### 2. Admin Processes Request
**Notification to Driver:**
- Title: "New Roster Assigned"
- Message: "New roster assigned for [Customer Name]"
- Type: `roster_assignment`
- Data: rosterId, customerName, pickupLocation, dropLocation, pickupTime, startDate

**Notification to Customer:**
- Title: "Your Transportation is Ready!"
- Message: "Good news! Your address change has been processed. Your vehicle is ready from [Date] onwards."
- Type: `address_change_completed`
- Data: requestId, rosterId, vehicleNumber, vehicleType, driverName, addresses, timing

### 3. Admin Rejects Request
**Notification to Customer:**
- Title: "Address Change Request Rejected"
- Message: "Your address change request has been rejected. Reason: [Rejection Reason]"
- Type: `address_change_rejected`
- Data: requestId, rejectionReason

## API Endpoints

### Customer Endpoints

#### POST `/api/address-change/customer/request`
Submit a new address change request.

**Request Body:**
```json
{
  "currentPickupAddress": "123 Old Street",
  "newPickupAddress": "456 New Street",
  "newPickupLat": 12.9716,
  "newPickupLng": 77.5946,
  "currentDropAddress": "789 Old Office",
  "newDropAddress": "321 New Office",
  "newDropLat": 12.9352,
  "newDropLng": 77.6245,
  "reason": "Moved to a new house"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address change request submitted successfully. Processing will take 4-5 working days.",
  "data": {
    "requestId": "507f1f77bcf86cd799439011",
    "affectedTripsCount": 15,
    "estimatedProcessingDays": "4-5 working days"
  }
}
```

#### GET `/api/address-change/customer/requests?status=all`
Get customer's address change requests with optional status filter.

**Query Parameters:**
- `status` (optional): all, under_review, processing, completed, rejected

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerId": "firebase_uid_123",
      "customerName": "John Doe",
      "currentPickupAddress": "123 Old Street",
      "newPickupAddress": "456 New Street",
      "currentDropAddress": "789 Old Office",
      "newDropAddress": "321 New Office",
      "reason": "Moved to a new house",
      "status": "under_review",
      "affectedTripsCount": 15,
      "createdAt": "2024-12-09T10:00:00.000Z"
    }
  ]
}
```

### Admin Endpoints

#### GET `/api/address-change/admin/requests?status=all`
Get all address change requests with optional status filter.

**Query Parameters:**
- `status` (optional): all, under_review, processing, completed, rejected

**Response:** Same as customer endpoint but includes all customers' requests

#### GET `/api/address-change/admin/request/:id`
Get detailed information about a specific address change request.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "customerId": "firebase_uid_123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+91 9876543210",
    "currentPickupAddress": "123 Old Street",
    "newPickupAddress": "456 New Street",
    "newPickupLat": 12.9716,
    "newPickupLng": 77.5946,
    "currentDropAddress": "789 Old Office",
    "newDropAddress": "321 New Office",
    "newDropLat": 12.9352,
    "newDropLng": 77.6245,
    "reason": "Moved to a new house",
    "status": "under_review",
    "affectedTripsCount": 15,
    "affectedTrips": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "tripDate": "2024-12-10T00:00:00.000Z",
        "pickupTime": "09:00 AM",
        "status": "pending"
      }
    ],
    "createdAt": "2024-12-09T10:00:00.000Z"
  }
}
```

#### PUT `/api/address-change/admin/request/:id/process`
Process an address change request and assign driver/vehicle.

**Request Body:**
```json
{
  "driverId": "driver_firebase_uid",
  "driverName": "Driver Name",
  "vehicleId": "vehicle_id_123",
  "vehicleNumber": "KA-01-AB-1234",
  "vehicleType": "Sedan",
  "vehicleModel": "Toyota Innova",
  "pickupTime": "09:00 AM",
  "startDate": "2024-12-15T00:00:00.000Z",
  "serviceDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "adminNotes": "Verified new address, route feasible"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address change request processed and roster assigned successfully",
  "data": {
    "requestId": "507f1f77bcf86cd799439011",
    "rosterId": "507f1f77bcf86cd799439013",
    "customerNotified": true,
    "driverNotified": true
  }
}
```

#### PUT `/api/address-change/admin/request/:id/reject`
Reject an address change request.

**Request Body:**
```json
{
  "rejectionReason": "New address is outside our service area"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address change request rejected",
  "data": {
    "requestId": "507f1f77bcf86cd799439011",
    "customerNotified": true
  }
}
```

## Testing

### Backend Testing
Create test file: `abra_fleet_backend/test-address-change-flow.js`

```javascript
// Test customer submission
// Test admin retrieval
// Test admin processing
// Test admin rejection
// Test notifications
```

### Frontend Testing
1. **Customer Flow:**
   - Submit address change request
   - View request status
   - Receive completion notification
   - View assigned vehicle details

2. **Admin Flow:**
   - View pending requests
   - Process request with driver/vehicle assignment
   - Reject request with reason
   - Verify notifications sent

3. **Driver Flow:**
   - Receive roster assignment notification
   - View complete customer and address details
   - Acknowledge assignment

## Next Steps

1. ✅ Backend API routes created
2. ✅ Customer mobile screens created
3. ✅ Repository and service methods added
4. ✅ My Trips screen updated with navigation
5. ⏳ Create admin web screen for processing requests
6. ⏳ Test complete workflow end-to-end
7. ⏳ Create testing scripts

## Key Features

### For Customers:
- Easy address change submission with map picker
- Real-time status tracking
- Clear visibility of affected trips
- Automatic notification when processed
- Complete vehicle and driver details upon completion

### For Admins:
- Centralized request management
- Detailed customer and address information
- Map visualization of old vs new addresses
- Streamlined driver/vehicle assignment
- Rejection workflow with reason tracking

### For Drivers:
- Immediate notification of new assignments
- Complete customer contact information
- Clear pickup and drop locations with maps
- Easy navigation and communication

## Benefits

1. **Simplified Process**: Direct to admin, no organization approval needed
2. **Clear Timeline**: 4-5 working days communicated upfront
3. **Complete Information**: All parties get full details they need
4. **Automated Notifications**: Everyone stays informed automatically
5. **Audit Trail**: Complete history of requests and processing
6. **Map Integration**: Visual confirmation of address changes
7. **Flexible Assignment**: Admin can choose best driver/vehicle combination

## Implementation Status

- ✅ Backend API complete
- ✅ Customer mobile screens complete
- ✅ Service layer complete
- ⏳ Admin web screen (next step)
- ⏳ Testing and validation
- ⏳ Documentation and deployment
