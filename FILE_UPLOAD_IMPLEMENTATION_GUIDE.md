# File Upload Implementation Guide

## Overview
Implemented file upload functionality for vehicle and driver documents in the Vehicle Master screen. Users can now upload actual document files (PDF, images, Word docs) which are stored in Firebase Storage.

## Features Implemented

### 1. File Upload Dialog
When adding a document, users can now:
- Select document type from dropdown
- Enter document name
- **Upload a file** by clicking "Choose File" button
- Set expiry date (optional)
- See selected file name with option to remove and choose another

### 2. Supported File Types
- **PDF**: .pdf
- **Images**: .jpg, .jpeg, .png
- **Documents**: .doc, .docx

### 3. File Storage Structure

#### Vehicle Documents
```
Firebase Storage Path:
vehicles/{vehicleId}/documents/{documentType}/{timestamp}_{filename}

Example:
vehicles/V-001/documents/Registration/1702123456789_registration.pdf
```

#### Driver Documents
```
Firebase Storage Path:
drivers/{driverId}/documents/{documentType}/{timestamp}_{filename}

Example:
drivers/D-001/documents/License/1702123456789_license.pdf
```

### 4. Upload Process Flow

1. **User selects file** → File picker opens with allowed extensions
2. **File validation** → Checks file type and size
3. **Upload to Firebase Storage** → Shows progress indicator
4. **Get download URL** → Firebase returns permanent URL
5. **Save to database** → Document record with URL saved
6. **Refresh list** → Vehicle list reloads with new document

### 5. Document Viewing

Documents with uploaded files show:
- ✓ Download/View button (blue icon)
- Clicking opens document in browser/external app
- Documents without files show "No file uploaded" text

## Code Changes

### Files Modified

1. **vehicle_master.dart**
   - Added `DocumentStorageService` instance
   - Added `file_picker` and `url_launcher` imports
   - Updated `_showAddDocumentDialog()` with file picker UI
   - Created `_addDocumentWithFile()` method for upload handling
   - Updated `_buildDocumentTile()` to show download button
   - Added `_viewDocument()` method to open documents

2. **document_storage_service.dart** (Already existed)
   - `uploadVehicleDocument()` - Uploads vehicle documents
   - `uploadDriverDocument()` - Uploads driver documents
   - `deleteDocument()` - Removes files from storage

### Dependencies Used

```yaml
dependencies:
  file_picker: ^8.0.0        # File selection
  firebase_storage: ^12.3.2  # Cloud storage
  url_launcher: ^6.2.0       # Open documents
```

## User Interface

### Add Document Dialog

```
┌─────────────────────────────────────┐
│ Add Vehicle Document                │
├─────────────────────────────────────┤
│ Document Type *                     │
│ [Dropdown: Registration ▼]          │
│                                     │
│ Document Name *                     │
│ [Input: e.g., DL-2024-12345]       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Upload Document File         │ │
│ │                                 │ │
│ │ ✓ registration.pdf              │ │
│ │   [Remove ×]                    │ │
│ │                                 │ │
│ │ Supported: PDF, JPG, PNG, DOC   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Expiry Date (Optional)              │
│ 2025-12-08          [📅]           │
│                                     │
│ [Cancel]              [Add Document]│
└─────────────────────────────────────┘
```

### Document List View

```
┌─────────────────────────────────────────────────────┐
│ 📄 Vehicle Registration - REG-2024-001              │
│    Type: Registration                               │
│    Expires: 2025-12-08                              │
│                                                     │
│    [✓ Valid]  [⬇ Download]  [🗑 Delete]           │
└─────────────────────────────────────────────────────┘
```

## Usage Instructions

### For Admins: Adding Documents with Files

1. **Navigate to Vehicle Master**
   - Click on Vehicles → Vehicle Master

2. **Open Vehicle Details**
   - Click on any vehicle to view details

3. **Add Document**
   - Click "Add Document" button (blue for vehicle, green for driver)

4. **Fill Document Information**
   - Select document type (e.g., Registration)
   - Enter document name (e.g., REG-2024-001)

5. **Upload File**
   - Click "Choose File" button
   - Select PDF, image, or document file
   - File name appears with checkmark
   - (Optional) Click × to remove and choose different file

6. **Set Expiry Date** (Optional)
   - Click calendar icon
   - Select expiry date

7. **Save Document**
   - Click "Add Document" button
   - Wait for upload progress
   - Success message appears
   - Document appears in list

### Viewing/Downloading Documents

1. **In Vehicle Details**
   - Documents with files show download icon (⬇)
   - Click download icon to open document
   - Document opens in browser or default app

2. **Documents Without Files**
   - Show "No file uploaded" text
   - No download button available
   - Can still track expiry dates

## Error Handling

### File Selection Errors
- **No file selected**: Dialog remains open
- **Invalid file type**: Error message shown
- **File too large**: Firebase handles size limits

### Upload Errors
- **Network failure**: Error message with retry option
- **Storage permission**: Check Firebase rules
- **Invalid path**: Check vehicle/driver ID

### Download Errors
- **Invalid URL**: "Cannot open document" message
- **File deleted**: URL may be broken
- **No app to open**: System handles file type

## Firebase Storage Rules

Ensure your Firebase Storage rules allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Vehicle documents
    match /vehicles/{vehicleId}/documents/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
    
    // Driver documents
    match /drivers/{driverId}/documents/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
  }
}
```

## Backend API Integration

The backend should handle document records:

### Add Document Endpoint
```
POST /api/admin/vehicles/:vehicleId/documents

Body:
{
  "documentType": "Registration",
  "documentName": "REG-2024-001",
  "documentUrl": "https://firebasestorage.googleapis.com/...",
  "expiryDate": "2025-12-08T00:00:00Z",
  "isDriverDoc": false
}
```

### Delete Document Endpoint
```
DELETE /api/admin/vehicles/:vehicleId/documents/:documentId?isDriverDoc=false
```

## Testing Checklist

- [ ] Upload PDF document
- [ ] Upload JPG/PNG image
- [ ] Upload DOC/DOCX file
- [ ] Try uploading invalid file type (should fail)
- [ ] Remove selected file and choose another
- [ ] Upload without selecting file (uses placeholder)
- [ ] View/download uploaded document
- [ ] Delete document with uploaded file
- [ ] Check Firebase Storage for uploaded files
- [ ] Verify file naming convention (timestamp_filename)
- [ ] Test with vehicle documents
- [ ] Test with driver documents
- [ ] Test expiry date tracking with uploaded files

## File Size Considerations

### Current Limits
- Firebase Storage: 5GB per file (default)
- Recommended: Keep documents under 10MB
- Large files may take longer to upload

### Future Enhancements
1. **File size validation** before upload
2. **Upload progress bar** for large files
3. **Image compression** for photos
4. **PDF optimization** for large PDFs
5. **Thumbnail generation** for images
6. **Batch upload** multiple documents at once
7. **Drag and drop** file upload
8. **Document preview** inline viewer
9. **Version history** track document changes
10. **OCR extraction** auto-fill from scanned docs

## Troubleshooting

### Upload Fails
1. Check internet connection
2. Verify Firebase Storage is enabled
3. Check storage rules allow writes
4. Ensure file size is reasonable
5. Try different file format

### Cannot View Document
1. Check if URL is valid
2. Verify file exists in Firebase Storage
3. Check browser popup blocker
4. Try different browser
5. Check file permissions

### File Not Appearing
1. Refresh vehicle list
2. Check if upload completed
3. Verify document was saved to database
4. Check browser console for errors

## Security Notes

1. **Authentication Required**: Only authenticated admins can upload
2. **File Type Validation**: Only allowed extensions accepted
3. **Secure URLs**: Firebase provides secure download URLs
4. **Access Control**: Storage rules enforce permissions
5. **Audit Trail**: Upload metadata includes uploader ID and timestamp

## Performance Optimization

1. **Lazy Loading**: Documents load only when viewing details
2. **Caching**: Firebase caches downloaded files
3. **Compression**: Consider compressing large files
4. **CDN**: Firebase Storage uses global CDN
5. **Thumbnails**: Generate thumbnails for images (future)

## Cost Considerations

### Firebase Storage Pricing
- **Storage**: $0.026/GB/month
- **Download**: $0.12/GB
- **Upload**: Free

### Estimated Costs (Example)
- 100 vehicles × 5 documents × 2MB = 1GB storage = $0.026/month
- 1000 document views × 2MB = 2GB download = $0.24/month
- **Total**: ~$0.27/month for small fleet

## Summary

The file upload implementation provides:
- ✅ Easy file selection with file picker
- ✅ Upload to Firebase Storage
- ✅ Secure document storage
- ✅ Download/view functionality
- ✅ Visual feedback during upload
- ✅ Support for multiple file types
- ✅ Integration with existing document management
- ✅ Expiry tracking for uploaded documents

Users can now upload actual document files instead of just creating records, making the document management system fully functional.
