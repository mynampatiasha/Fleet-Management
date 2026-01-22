# Document Management Implementation

## Overview
Implemented comprehensive document management system for vehicles and drivers with expiry tracking and admin dashboard alerts.

## Features Implemented

### 1. Vehicle Master (vehicle_master.dart)

#### Filters Added ✓
- **Status Filter**: All, Active, Maintenance, Inactive
- **Onboarding Filter**: All, Onboarded, Not Onboarded
- **Document Filter**: All, Expired Documents, Expiring Soon, All Valid

#### Document Management Features
- **View Documents**: Vehicle details screen now shows:
  - Vehicle documents (Registration, Insurance, Permit, Fitness, Pollution Certificate)
  - Driver documents (License, Medical Certificate, Background Check, Training Certificate)
  
- **Add Documents**: 
  - Add vehicle documents with type, name, and expiry date
  - Add driver documents with type, name, and expiry date
  - Document types are predefined in dropdown menus
  
- **Delete Documents**: Remove documents with confirmation dialog

- **Document Status Indicators**:
  - Red error icon: Has expired documents
  - Orange warning icon: Documents expiring soon (within 30 days)
  - Green check icon: All documents valid
  - Grey info icon: No documents uploaded

#### Visual Enhancements
- Document tiles show:
  - Document name and type
  - Expiry date with color coding
  - Status chip (Valid/Expiring Soon/Expired)
  - Delete button
- Color-coded borders based on document status

### 2. Admin Dashboard (admin_dashboard_screen.dart)

#### Document Expiry Alerts ✓ (Already Implemented)
- Shows expired documents count
- Shows expiring soon documents count
- Lists up to 5 expired documents with details
- Lists up to 5 expiring soon documents with details
- "View all" buttons when more than 5 documents
- Real-time alerts with vehicle/driver names
- Clickable to navigate to vehicle master

### 3. Driver Management (driver_admin_management_screen.dart)

#### Document Tracking
- Dashboard card shows "DOCUMENTS EXPIRING" count
- Placeholder for document expiry dialog
- Ready for document management UI (similar to vehicle master)

### 4. Backend Services

#### VehicleService (vehicle_service.dart)
Added methods:
```dart
- addVehicleDocument(vehicleId, documentType, documentName, documentUrl, expiryDate, isDriverDoc)
- deleteVehicleDocument(vehicleId, documentId, isDriverDoc)
```

#### DriverService (driver_service.dart)
Added methods:
```dart
- addDriverDocument(driverId, documentType, documentName, documentUrl, expiryDate)
- deleteDriverDocument(driverId, documentId)
```

### 5. Data Model (vehicle_entity.dart)

#### Document Classes ✓ (Already Implemented)
- **VehicleDocument**: id, documentType, documentName, documentUrl, uploadDate, expiryDate, uploadedBy
- **DriverDocument**: id, documentType, documentName, documentUrl, uploadDate, expiryDate, uploadedBy

#### Helper Properties
- `isExpired`: Checks if document is expired
- `isExpiringSoon`: Checks if document expires within 30 days
- `hasExpiredDocuments`: Vehicle has any expired documents
- `hasExpiringSoonDocuments`: Vehicle has documents expiring soon
- `expiredVehicleDocuments`: List of expired vehicle documents
- `expiringSoonVehicleDocuments`: List of expiring vehicle documents
- `expiredDriverDocuments`: List of expired driver documents
- `expiringSoonDriverDocuments`: List of expiring driver documents

## Document Types

### Vehicle Documents
1. Registration
2. Insurance
3. Permit
4. Fitness Certificate
5. Pollution Certificate
6. Other

### Driver Documents
1. License
2. Medical Certificate
3. Background Check
4. Training Certificate
5. Other

## User Workflow

### Adding a Document
1. Navigate to Vehicle Master
2. Click on a vehicle to view details
3. Click "Add Document" button (blue for vehicle docs, green for driver docs)
4. Select document type from dropdown
5. Enter document name
6. Optionally set expiry date using date picker
7. Click "Add Document"
8. Document is saved and list refreshes

### Viewing Document Status
1. In Vehicle Master table/list view:
   - See document status icon in "Documents" column
   - Red = expired, Orange = expiring soon, Green = valid, Grey = none
2. In Vehicle Details:
   - See all documents with full details
   - Color-coded status chips
   - Expiry dates highlighted

### Admin Dashboard Alerts
1. Dashboard automatically shows:
   - Count of expired documents
   - Count of expiring soon documents
2. Click on document entries to navigate to vehicle master
3. "View all" button shows complete list when >5 documents

## Database Storage

Documents are stored in the vehicle/driver records with the following structure:
```json
{
  "id": "unique-document-id",
  "documentType": "License",
  "documentName": "DL-2024-12345",
  "documentUrl": "https://storage.url/document.pdf",
  "uploadDate": "2024-12-08T10:00:00Z",
  "expiryDate": "2025-12-08T00:00:00Z",
  "uploadedBy": "admin-user-id"
}
```

## Backend API Endpoints Required

### Vehicle Documents
- `POST /api/admin/vehicles/:vehicleId/documents` - Add document
- `DELETE /api/admin/vehicles/:vehicleId/documents/:documentId` - Delete document

### Driver Documents
- `POST /api/admin/drivers/:driverId/documents` - Add document
- `DELETE /api/admin/drivers/:driverId/documents/:documentId` - Delete document

## Future Enhancements

1. **File Upload**: Integrate with document storage service for actual file uploads
2. **Document Preview**: View documents inline or download
3. **Bulk Document Upload**: Upload multiple documents at once
4. **Document Renewal Reminders**: Email/SMS notifications before expiry
5. **Document History**: Track document versions and changes
6. **Document Verification**: Admin approval workflow for documents
7. **OCR Integration**: Auto-extract document details from images
8. **Compliance Reports**: Generate reports on document compliance

## Testing Checklist

- [ ] Add vehicle document with expiry date
- [ ] Add driver document with expiry date
- [ ] Delete vehicle document
- [ ] Delete driver document
- [ ] Filter vehicles by document status
- [ ] View expired documents in admin dashboard
- [ ] View expiring soon documents in admin dashboard
- [ ] Navigate from dashboard alert to vehicle master
- [ ] Test with documents expiring in <30 days
- [ ] Test with expired documents
- [ ] Test with no documents
- [ ] Test filter combinations (status + onboarding + documents)

## Notes

- Document URLs are currently placeholders ("https://placeholder.com/document.pdf")
- Actual file upload functionality needs to be integrated with a storage service
- Backend API endpoints need to be implemented to support these operations
- The system uses 30 days as the threshold for "expiring soon" warnings
- All dates are stored in ISO 8601 format
- Document management is fully integrated with existing vehicle and driver data structures
