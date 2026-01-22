# Driver Documents Complete Flow

## Overview
Documents uploaded for drivers now properly reflect in the Documents column of the driver management table.

## Fix Applied

### Changed in `driver_list_page.dart`
Added `fullDetails: true` parameter to `_fetchDrivers()` method:

```dart
final response = await widget.driverService.getDrivers(
  status: _selectedStatus.isNotEmpty ? _selectedStatus : null,
  search: _searchQuery.isNotEmpty ? _searchQuery : null,
  page: _pagination['page'] ?? 1,
  limit: _pagination['limit'] ?? 10,
  fullDetails: true, // ✅ Now fetches documents
);
```

## Complete Document Flow

### 1. Upload Document
**Path:** Driver Management → Click driver row → View Details → Add Document

**Steps:**
1. Click "View Details" (eye icon) for any driver
2. In the details dialog, click "Add Document" button
3. Fill in document details:
   - Document Type (License, Medical Certificate, etc.)
   - Document Name
   - Upload File (PDF, JPG, PNG, DOC, DOCX)
   - Expiry Date (optional)
4. Click "Add Document"
5. Document uploads to MongoDB
6. Success message appears

### 2. Documents Reflect in Table
**Path:** Driver Management → Documents Column

**Status Indicators:**
- 🔴 **Red Error Icon** - Has expired documents
- 🟠 **Orange Warning Icon** - Documents expiring within 30 days
- 🟢 **Green Check Icon** - All documents valid
- ⚪ **Gray Info Icon** - No documents uploaded

**Tooltip Messages:**
- "Has expired documents - Click to view"
- "Documents expiring soon - Click to view"
- "All documents valid - Click to view"
- "No documents uploaded"

### 3. View All Documents
**Path:** Click Documents Icon → Document Status Dialog

**Shows:**
- Driver information (name, ID)
- Documents categorized by status:
  - **Expired Documents** (red section)
  - **Expiring Soon** (orange section, within 30 days)
  - **Valid Documents** (green section)
  - **No Expiry Date** (gray section)

**Each Document Shows:**
- Document name and type
- Expiry date (if applicable)
- Status badge (Expired, Expiring Soon, Valid)
- Download button (if file uploaded)
- Delete button

### 4. Document Actions
**Available Actions:**
- 📥 **Download/View** - Opens document in browser
- 🗑️ **Delete** - Removes document (with confirmation)
- ➕ **Add Document** - Upload new document

## Backend API

### Get Drivers with Documents
```
GET /api/admin/drivers?fullDetails=true
```

**Response includes:**
```json
{
  "success": true,
  "data": [
    {
      "driverId": "EMP002",
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "documents": [
        {
          "id": "doc123",
          "documentType": "License",
          "documentName": "DL-2024-12345",
          "documentUrl": "/api/documents/...",
          "expiryDate": "2025-12-31T00:00:00.000Z",
          "uploadedAt": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

### Upload Document
```
POST /api/documents/drivers/:driverId/documents
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - Document file
- `documentType` - Type of document
- `documentName` - Document name
- `expiryDate` - Optional expiry date

### Delete Document
```
DELETE /api/documents/drivers/:driverId/documents/:documentId
```

## Document Status Logic

### Expired
```dart
expiryDate < DateTime.now()
```
- Shows red error icon
- Listed in "Expired Documents" section
- Urgent action required

### Expiring Soon
```dart
expiryDate > DateTime.now() && 
expiryDate < DateTime.now() + 30 days
```
- Shows orange warning icon
- Listed in "Expiring Soon" section
- Needs attention

### Valid
```dart
expiryDate > DateTime.now() + 30 days
```
- Shows green check icon
- Listed in "Valid Documents" section
- All good

### No Expiry
```dart
expiryDate == null
```
- Shows gray info icon
- Listed in "No Expiry Date" section
- Informational

## Real-Time Updates

### After Upload
1. Document uploads to MongoDB
2. Success message appears
3. Driver list refreshes automatically
4. Documents column updates with new status
5. Icon changes based on document status

### After Delete
1. Confirmation dialog appears
2. Document deleted from MongoDB
3. Success message appears
4. Driver list refreshes automatically
5. Documents column updates

## Testing the Flow

### Test 1: Upload Document
1. Open Driver Management
2. Click "View Details" for a driver
3. Click "Add Document"
4. Upload a document with expiry date
5. Check Documents column - should show appropriate icon
6. Click icon - should see uploaded document

### Test 2: Document Status
1. Upload document expiring in 15 days
2. Documents column should show orange warning icon
3. Click icon - document should be in "Expiring Soon" section

### Test 3: Expired Document
1. Upload document with past expiry date
2. Documents column should show red error icon
3. Click icon - document should be in "Expired Documents" section

### Test 4: Delete Document
1. Click Documents icon
2. Click delete button for a document
3. Confirm deletion
4. Document should disappear
5. Icon should update based on remaining documents

## Troubleshooting

### Documents Not Showing
**Check:**
1. ✅ `fullDetails: true` parameter in `_fetchDrivers()`
2. ✅ Backend returning documents in response
3. ✅ Documents array exists in driver object
4. ✅ Refresh driver list after upload

### Wrong Status Icon
**Check:**
1. Document expiry date format (ISO 8601)
2. Current date/time on server
3. Status calculation logic
4. Icon mapping in `_buildDocumentStatusIndicator()`

### Upload Fails
**Check:**
1. MongoDB connection
2. File size limits
3. Supported file types
4. Document router mounted in backend
5. CORS configuration

## Files Modified

1. ✅ `driver_list_page.dart` - Added `fullDetails: true`
2. ✅ Backend already supports `fullDetails` parameter
3. ✅ Document upload/delete already working
4. ✅ Status indicators already implemented

## Summary

✅ **Documents now reflect in the table** - Added `fullDetails: true` parameter
✅ **Status indicators work** - Shows correct icon based on document status
✅ **Click to view details** - Opens dialog with all documents
✅ **Upload/Delete works** - Real-time updates after actions
✅ **Expiry tracking** - Automatically categorizes by status

The complete document management flow is now working end-to-end!
