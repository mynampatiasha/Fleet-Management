# Leave Request Workflow Implementation

## Overview
This implementation adds a complete leave request workflow to the Abra Fleet Management system, allowing customers to submit leave requests through the mobile application and notify their organization about periods when they won't need transportation.

## Features Implemented

### 1. Customer Leave Request Endpoints (Step 1)

#### POST `/api/roster/customer/leave-request`
- **Purpose**: Submit a new leave request
- **Authentication**: Required (Customer)
- **Features**: Validates dates, finds affected trips, creates leave request, sends notifications

#### GET `/api/roster/customer/leave-requests`
- **Purpose**: Get customer's leave requests
- **Authentication**: Required (Customer)
- **Features**: Status filtering, detailed leave request information

#### DELETE `/api/roster/customer/leave-request/:id`
- **Purpose**: Cancel a pending leave request
- **Authentication**: Required (Customer)
- **Features**: Only allows cancellation of pending requests, removes trip references

### 2. Organization/Client Management Endpoints (Step 2)

#### GET `/api/roster/admin/leave-requests`
- **Purpose**: Get all leave requests for organization review
- **Authentication**: Required (Admin/Organization)
- **Features**: 
  - Status filtering (all, pending_approval, approved, rejected, cancelled)
  - Organization filtering
  - Includes affected trip details
  - Sorted by creation date (newest first)

#### PUT `/api/roster/admin/leave-request/:id/approve`
- **Purpose**: Approve a leave request
- **Authentication**: Required (Admin/Organization)
- **Features**:
  - Only allows approval of pending requests
  - Records approver details and timestamp
  - Optional approval note
  - Updates affected trips to "waiting_cancellation" status
  - Sends notifications to customer and fleet administrator

#### PUT `/api/roster/admin/leave-request/:id/reject`
- **Purpose**: Reject a leave request
- **Authentication**: Required (Admin/Organization)
- **Features**:
  - Requires rejection reason
  - Only allows rejection of pending requests
  - Records rejector details and timestamp
  - Removes leave request references from trips (trips remain active)
  - Sends notification to customer

#### GET `/api/roster/admin/leave-request/:id`
- **Purpose**: Get detailed leave request information
- **Authentication**: Required (Admin/Organization)
- **Features**:
  - Complete leave request details
  - Customer information
  - Affected trip details
  - Approval/rejection history

### 3. Backend API Endpoints

#### POST `/api/roster/customer/leave-request`
- **Purpose**: Submit a new leave request
- **Authentication**: Required (Customer)
- **Request Body**:
  ```json
  {
    "startDate": "2024-12-10T00:00:00.000Z",
    "endDate": "2024-12-15T00:00:00.000Z",
    "reason": "Going on vacation"
  }
  ```
- **Response**: Leave request details with affected trips
- **Features**:
  - Validates date range (end date must be after start date)
  - Automatically finds all affected trips during the leave period
  - Creates leave request record in MongoDB
  - Links affected trips to the leave request
  - Sends notification to organization
  - Returns list of affected trips

#### GET `/api/roster/customer/leave-requests`
- **Purpose**: Get customer's leave requests
- **Authentication**: Required (Customer)
- **Query Parameters**: `status` (optional filter)
- **Response**: List of leave requests with status and details

#### DELETE `/api/roster/customer/leave-request/:id`
- **Purpose**: Cancel a pending leave request
- **Authentication**: Required (Customer)
- **Features**:
  - Only allows cancellation of pending requests
  - Removes leave request reference from affected trips
  - Updates leave request status to 'cancelled'

### 4. Frontend Mobile Screens (Customer - Step 1)

#### Leave Request Screen (`leave_request_screen.dart`)
- **Features**:
  - Date picker for start and end dates
  - Optional reason text field
  - Real-time display of affected trips
  - Form validation
  - Loading states during submission
  - Success/error feedback

#### My Leave Requests Screen (`my_leave_requests_screen.dart`)
- **Features**:
  - List of all leave requests with status
  - Status filtering (All, Pending, Approved, Rejected, Cancelled)
  - Color-coded status indicators
  - Detailed information for each request
  - Cancel functionality for pending requests
  - Refresh capability

#### Updated My Trips Screen (`my_trips_screen.dart`)
- **New Features**:
  - Quick action buttons for leave requests
  - "Request Leave" button prominently displayed
  - "My Leave Requests" navigation
  - Integration with existing trip management

### 5. Frontend Web Application (Organization - Step 2)

#### Leave Request Management Screen (`leave_request_management.dart`)
- **Features**:
  - Comprehensive leave request dashboard for organizations
  - Status filtering (All, Pending, Approved, Rejected, Cancelled)
  - Real-time refresh capability
  - Detailed leave request cards with employee information
  - Quick approval/rejection actions
  - Detailed view modal with complete information
  - Affected trips visualization
  - Approval/rejection workflow with confirmation dialogs
  - Responsive design for web application

#### Updated Client Main Shell (`client_main_shell.dart`)
- **New Features**:
  - Added "Leave Requests" navigation item
  - Quick access button in top bar
  - Notification badge for pending requests
  - Integrated with existing client dashboard

#### Updated Client Dashboard (`client_dashboard.dart`)
- **New Features**:
  - Quick action button for leave requests
  - Integration with main navigation

### 6. Repository Methods (`roster_repository.dart`)

#### New Methods Added:
- `submitLeaveRequest()` - Submit leave request to backend
- `getLeaveRequests()` - Fetch customer's leave requests
- `cancelLeaveRequest()` - Cancel pending leave request
- `getLeaveRequestStatusOptions()` - Get available status options
- `getLeaveRequestStatusDisplayText()` - Human-readable status text
- `getLeaveRequestStatusColor()` - Status color coding
- `getLeaveRequestStatusIcon()` - Status icons

### 7. Database Schema

#### Leave Requests Collection (`leave_requests`)
```javascript
{
  _id: ObjectId,
  customerId: String,           // Firebase UID
  customerName: String,         // Customer display name
  customerEmail: String,        // Customer email
  organizationName: String,     // Customer's organization
  startDate: Date,             // Leave start date
  endDate: Date,               // Leave end date
  reason: String,              // Optional reason
  status: String,              // pending_approval, approved, rejected, cancelled
  affectedTripIds: [ObjectId], // Array of affected roster IDs
  affectedTripsCount: Number,  // Count of affected trips
  createdAt: Date,
  updatedAt: Date,
  approvedBy: String,          // Admin who approved (optional)
  approvedAt: Date,            // Approval timestamp (optional)
  rejectedBy: String,          // Admin who rejected (optional)
  rejectedAt: Date,            // Rejection timestamp (optional)
  rejectionReason: String      // Reason for rejection (optional)
}
```

#### Updated Rosters Collection
```javascript
{
  // ... existing fields ...
  leaveRequestId: ObjectId,        // Reference to leave request (optional)
  leaveRequestStatus: String       // Status of associated leave request (optional)
}
```

## User Experience Flow

### Step 1: Customer Submits Leave Request (Mobile App)
1. Customer opens "My Trips" screen
2. Taps "Request Leave" button
3. Selects start and end dates using date pickers
4. System automatically shows affected trips
5. Customer optionally adds reason
6. Customer reviews and submits request
7. System shows success message and returns to trips screen

### Step 2: System Processing
1. Backend validates date range
2. Finds all scheduled trips during leave period
3. Creates leave request record
4. Links affected trips to leave request
5. Sends notification to organization
6. Updates trip statuses to reflect pending leave approval

### Step 2: Organization Reviews Leave Request (Web App)
1. Organization receives immediate notification of new leave request
2. HR manager or supervisor opens the web application
3. Navigates to "Leave Requests" section
4. Views list of all pending requests with filtering options
5. Clicks on specific request to view complete details
6. Reviews employee information, leave period, reason, and affected trips
7. Makes decision to approve or reject

#### If Approving:
1. Clicks "Approve" button
2. System shows confirmation dialog with affected trips count
3. Can optionally add approval note
4. Confirms approval
5. System updates leave request status to "approved"
6. System marks affected trips as "waiting_cancellation"
7. System sends notifications to customer and fleet administrator

#### If Rejecting:
1. Clicks "Reject" button
2. System requires rejection reason
3. Enters reason (e.g., "No leave approved in our records")
4. Confirms rejection
5. System updates leave request status to "rejected"
6. System removes leave request references from trips (trips remain active)
7. System sends notification to customer with rejection reason

### Step 3: Admin Cancels the Trips (Web App)
1. Administrator receives notification of approved leave request
2. Opens "Trip Cancellation Management" section in admin panel
3. Views list of approved leave requests requiring trip cancellation
4. Reviews affected trips with complete details:
   - Trip reference numbers and readable IDs
   - Customer information
   - Scheduled dates and times
   - Assigned drivers and vehicles
   - Pickup and drop locations
5. Clicks "Cancel Trips" for the leave request
6. System shows confirmation dialog with warning about driver notifications
7. Administrator can add internal notes for record keeping
8. Confirms cancellation action

#### System Processing:
- Updates all affected trips status to "cancelled"
- Records cancellation reason as "Customer is on leave"
- Logs administrator details and timestamp
- Sends immediate notifications to all assigned drivers
- Creates history log entry for audit trail
- Marks leave request as "processed"
- Makes driver schedules available for reassignment

### Step 4: Driver Gets Notified (Mobile App)
1. Driver receives push notification: "Trip Cancelled - [Customer Name] - [Date] [Time]"
2. Opens driver mobile application
3. Navigates to "Cancelled Trips" section
4. Views cancelled trips with clear indicators:
   - Red "CANCELLED" badge
   - Strike-through or crossed-out appearance
   - Cancellation reason prominently displayed
   - Complete trip details still visible
5. Reviews cancellation details:
   - Original trip information
   - Cancellation reason and timestamp
   - Administrator who cancelled
   - Any admin notes
6. Acknowledges receipt of cancellation notification
7. Sees freed time slots in schedule for potential reassignment

#### Driver Experience Features:
- Clear visual distinction for cancelled trips
- Detailed cancellation information
- Easy acknowledgment process
- Historical record of cancelled trips
- Integration with schedule management

### Step 5: Tracking and Management
1. Customer can view all leave requests in "My Leave Requests"
2. Status is clearly displayed with color coding
3. Customer can cancel pending requests
4. System provides detailed information about each request
5. Admin can view trip cancellation history and audit trails
6. Drivers can access cancelled trips history and acknowledgment status

## Status Management

### Leave Request Statuses:
- **pending_approval**: Waiting for organization review
- **approved**: Organization approved the leave
- **rejected**: Organization rejected the leave
- **cancelled**: Customer cancelled the request

### Status Colors:
- **Pending**: Orange (#F59E0B)
- **Approved**: Green (#10B981)
- **Rejected**: Red (#EF4444)
- **Cancelled**: Gray (#64748B)

## Integration Points

### Notifications
- Uses existing notification system (`notification_model.js`)
- Sends real-time notifications to organization
- Includes leave request details and affected trip count

### Trip Management
- Integrates seamlessly with existing roster system
- Affected trips are automatically identified
- Trip statuses reflect leave request status

### User Authentication
- Uses existing Firebase authentication
- Respects user permissions and data isolation
- Maintains security for customer data

## Testing

### Backend Testing
- Created `test-leave-request.js` for customer API validation
- Created `test-organization-leave-requests.js` for organization API validation
- Created `test-admin-trip-cancellation.js` for admin trip cancellation and driver notification workflow
- Tests database operations and data integrity
- Verifies notification system integration
- Tests approval and rejection workflows
- Validates affected trip status updates
- Tests trip cancellation and driver notification processes
- Validates acknowledgment workflows

### Frontend Testing
- All screens include error handling
- Loading states for better UX
- Form validation prevents invalid submissions
- Success/error feedback for user actions

## Mobile App Integration

### Navigation
- Accessible from main "My Trips" screen
- Clear navigation between related screens
- Consistent with existing app design patterns

### UI/UX
- Material Design components
- Consistent color scheme and typography
- Responsive layout for different screen sizes
- Intuitive user flow with clear call-to-actions

## Future Enhancements

### Admin Panel Integration
- Admin screens for reviewing leave requests
- Approval/rejection workflow
- Bulk operations for multiple requests
- Analytics and reporting

### Advanced Features
- Recurring leave patterns
- Integration with company calendar systems
- Automatic trip rescheduling
- Email notifications to managers

### Mobile Enhancements
- Push notifications for status updates
- Offline support for viewing requests
- Calendar integration
- Photo attachments for leave documentation

## Files Modified/Created

### Backend Files:
- `abra_fleet_backend/routes/roster_router.js` - Added customer, organization, admin, and driver leave request endpoints
- `abra_fleet_backend/test-leave-request.js` - Customer API testing utilities
- `abra_fleet_backend/test-organization-leave-requests.js` - Organization API testing utilities
- `abra_fleet_backend/test-admin-trip-cancellation.js` - Admin trip cancellation and driver notification testing

### Frontend Files:

#### Customer Mobile App:
- `abra_fleet/lib/features/customer/dashboard/data/repositories/roster_repository.dart` - Added leave request methods
- `abra_fleet/lib/features/customer/dashboard/presentation/screens/leave_request_screen.dart` - New customer leave request screen
- `abra_fleet/lib/features/customer/dashboard/presentation/screens/my_leave_requests_screen.dart` - New customer leave requests list screen
- `abra_fleet/lib/features/customer/dashboard/presentation/screens/my_trips_screen.dart` - Updated with leave request integration

#### Organization Web App:
- `abra_fleet/lib/features/client/leave_request_management.dart` - New organization leave request management screen
- `abra_fleet/lib/features/client/client_main_shell.dart` - Updated with leave request navigation
- `abra_fleet/lib/features/client/client_dashboard.dart` - Updated with leave request quick actions

#### Admin Web App:
- `abra_fleet/lib/features/admin/leave_trip_management.dart` - New admin trip cancellation management screen

#### Driver Mobile App:
- `abra_fleet/lib/features/driver/cancelled_trips_screen.dart` - New driver cancelled trips screen

## Conclusion

This implementation provides a complete, production-ready leave request workflow that covers all four steps:
1. **Customer Submission** (Mobile App) - Easy leave request submission with affected trip preview
2. **Organization Review/Approval** (Web App) - Comprehensive review and approval/rejection workflow  
3. **Admin Trip Cancellation** (Web App) - Streamlined trip cancellation with driver notifications
4. **Driver Notification** (Mobile App) - Clear cancelled trip visibility and acknowledgment

The solution integrates seamlessly with the existing Abra Fleet Management system, follows established code patterns, maintains data consistency, and provides intuitive user experiences across all user types while ensuring proper oversight and communication throughout the transportation management process.

## Key Benefits

### For Customers:
- Easy leave request submission through mobile app
- Real-time status tracking
- Clear visibility of affected trips
- Ability to cancel pending requests

### For Organizations:
- Centralized leave request management
- Detailed employee and trip information
- Streamlined approval/rejection workflow
- Automatic notification system
- Integration with existing fleet management

### For Fleet Administrators:
- Automatic notifications when leave is approved
- Clear identification of trips requiring cancellation
- Streamlined bulk trip cancellation process
- Comprehensive audit trail and history logging
- Maintained data integrity throughout the process

### For Drivers:
- Immediate notifications of trip cancellations
- Clear visual indicators for cancelled trips
- Detailed cancellation information and reasoning
- Easy acknowledgment process
- Historical access to cancelled trips
- Automatic schedule availability for reassignment