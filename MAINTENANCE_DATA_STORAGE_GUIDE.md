# 📋 Maintenance Management Data Storage Guide

## Overview
This document explains where and how the Schedule Maintenance data is stored in your Fleet Management system.

---

## 🗄️ Database Storage Location

### **MongoDB Database**
- **Database Name**: Your MongoDB database (configured in backend)
- **Collection Name**: `maintenance_schedules`

### **Collection Structure**

```javascript
{
  _id: ObjectId("..."),                    // MongoDB auto-generated ID
  vehicleId: ObjectId("..."),              // Reference to vehicles collection
  vehicleNumber: "KA-01-AB-1234",          // Vehicle registration number
  vehicleMake: "Toyota",                   // Vehicle make
  vehicleModel: "Innova",                  // Vehicle model
  maintenanceType: "Oil Change",           // Type of maintenance
  scheduledDate: ISODate("2026-02-15"),    // When maintenance is scheduled
  vendorEmail: "vendor@example.com",       // Vendor email address
  vendorName: "ABC Auto Services",         // Vendor name
  vendorPhone: "+91 9876543210",           // Vendor phone (optional)
  description: "Regular oil change...",    // Maintenance description
  estimatedCost: 5000,                     // Estimated cost in rupees
  priority: "medium",                      // Priority: low, medium, high, urgent
  status: "scheduled",                     // Status: scheduled, completed, cancelled
  emailSent: true,                         // Whether email was sent to vendor
  emailSentAt: ISODate("2026-01-22"),      // When email was sent
  emailMessageId: "msg-123...",            // Email service message ID
  createdAt: ISODate("2026-01-22"),        // Record creation timestamp
  updatedAt: ISODate("2026-01-22"),        // Last update timestamp
  createdBy: {                             // Who created the record
    uid: "admin123",
    email: "admin@example.com",
    name: "Admin User"
  }
}
```

---

## 📂 Related Collections

### 1. **maintenance_reports** Collection
Stores completed maintenance records:
```javascript
{
  _id: ObjectId("..."),
  vehicleId: ObjectId("..."),
  vehicleNumber: "KA-01-AB-1234",
  maintenanceType: "Oil Change",
  completedDate: ISODate("2026-02-15"),
  vendorName: "ABC Auto Services",
  actualCost: 4800,
  description: "Oil change completed...",
  status: "completed",
  partsReplaced: ["Oil Filter", "Engine Oil"],
  nextMaintenanceDue: ISODate("2026-08-15"),
  warrantyInfo: "6 months warranty",
  invoiceNumber: "INV-2026-001",
  createdAt: ISODate("2026-02-15"),
  updatedAt: ISODate("2026-02-15")
}
```

### 2. **vehicles** Collection
Vehicle maintenance dates are updated here:
```javascript
{
  _id: ObjectId("..."),
  registrationNumber: "KA-01-AB-1234",
  maintenance: {
    lastServiceDate: ISODate("2026-02-15"),
    nextServiceDue: ISODate("2026-08-15")
  }
}
```

---

## 🔌 Backend API Endpoints

### **Schedule Maintenance**
- **Endpoint**: `POST /api/maintenance/schedule`
- **File**: `Fleet_Management/abra_fleet_backend/routes/maintenance_router.js`
- **Line**: 45-354

**What it does:**
1. Validates the maintenance data
2. Finds the vehicle in the database
3. Creates a record in `maintenance_schedules` collection
4. Sends an email notification to the vendor
5. Updates the email status in the database

### **Get Maintenance Schedules**
- **Endpoint**: `GET /api/maintenance/schedules`
- **File**: `Fleet_Management/abra_fleet_backend/routes/maintenance_router.js`
- **Line**: 356-395

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (scheduled, completed, cancelled)
- `vehicleId`: Filter by specific vehicle

---

## 📱 Frontend Implementation

### **Flutter Service**
- **File**: `Fleet_Management/abra_fleet/lib/core/services/maintenance_service.dart`
- **Method**: `scheduleMaintenanceWithEmail()`

### **Schedule Maintenance Screen**
- **File**: `Fleet_Management/abra_fleet/lib/features/admin/vehicle_admin_management/maintainace_managemnt/schedule_maintenance.dart`
- **Class**: `ScheduleMaintenanceScreen`

### **Main Management Screen**
- **File**: `Fleet_Management/abra_fleet/lib/features/admin/vehicle_admin_management/maintainace_managemnt/maintainance_management.dart`
- **Method**: `_loadScheduledMaintenances()` - Loads data from backend
- **Variable**: `_scheduledMaintenances` - Stores the list in memory

---

## 🔄 Data Flow

```
1. User fills Schedule Maintenance form
   ↓
2. Flutter app calls maintenance_service.scheduleMaintenanceWithEmail()
   ↓
3. API request sent to: POST /api/maintenance/schedule
   ↓
4. Backend validates data and finds vehicle
   ↓
5. Record inserted into MongoDB 'maintenance_schedules' collection
   ↓
6. Email sent to vendor using email_service
   ↓
7. Email status updated in database
   ↓
8. Response sent back to Flutter app
   ↓
9. Success message shown to user
   ↓
10. List refreshed to show new schedule
```

---

## 📊 How to View the Data

### **Option 1: Through the App**
1. Open Admin Dashboard
2. Navigate to Vehicle Management → Maintenance Management
3. View "Scheduled Maintenances" section
4. Shows up to 5 recent schedules

### **Option 2: Direct Database Query**
```javascript
// Connect to MongoDB
use your_database_name;

// View all scheduled maintenances
db.maintenance_schedules.find().pretty();

// View schedules for a specific vehicle
db.maintenance_schedules.find({
  vehicleNumber: "KA-01-AB-1234"
}).pretty();

// View schedules by status
db.maintenance_schedules.find({
  status: "scheduled"
}).pretty();

// View schedules by date range
db.maintenance_schedules.find({
  scheduledDate: {
    $gte: ISODate("2026-01-01"),
    $lte: ISODate("2026-12-31")
  }
}).pretty();
```

### **Option 3: Using Backend API**
```bash
# Get all schedules
curl http://localhost:3001/api/maintenance/schedules

# Get schedules with pagination
curl http://localhost:3001/api/maintenance/schedules?page=1&limit=20

# Get schedules by status
curl http://localhost:3001/api/maintenance/schedules?status=scheduled
```

---

## 📧 Email Notification

When a maintenance is scheduled:
- **Email sent to**: Vendor email address
- **Email service**: `Fleet_Management/abra_fleet_backend/services/email_service.js`
- **Email contains**:
  - Vehicle details (number, make, model)
  - Maintenance type and description
  - Scheduled date
  - Priority level
  - Estimated cost
  - Contact information

---

## 🔍 Key Files Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Backend Route | `abra_fleet_backend/routes/maintenance_router.js` | API endpoints |
| Frontend Service | `abra_fleet/lib/core/services/maintenance_service.dart` | API calls |
| Schedule Screen | `abra_fleet/lib/features/admin/vehicle_admin_management/maintainace_managemnt/schedule_maintenance.dart` | UI for scheduling |
| Management Screen | `abra_fleet/lib/features/admin/vehicle_admin_management/maintainace_managemnt/maintainance_management.dart` | Main management UI |
| Email Service | `abra_fleet_backend/services/email_service.js` | Email sending |

---

## 💡 Quick Summary

**Where is the data stored?**
- **MongoDB Collection**: `maintenance_schedules`
- **Backend File**: `routes/maintenance_router.js` (line 159)
- **Frontend Display**: `maintainance_management.dart` (variable: `_scheduledMaintenances`)

**How to access it?**
1. Through the app's Maintenance Management screen
2. Direct MongoDB query
3. Backend API endpoint: `/api/maintenance/schedules`

---

## 📝 Notes

- Each scheduled maintenance gets a unique `_id` from MongoDB
- Email notifications are sent automatically when scheduling
- The `emailSent` field tracks whether the vendor was notified
- Vehicle maintenance dates are updated when maintenance is completed
- All actions are logged with `createdBy` information for audit trail

---

**Last Updated**: January 22, 2026
