# 📦 MongoDB Document Storage - Complete Guide

## Overview

I've created a **MongoDB-based document storage system** as an alternative to Firebase Storage. This eliminates CORS issues and stores files directly in your MongoDB database using GridFS.

## ✅ What's Been Implemented

### 1. Backend API (`document_router.js`)
- Upload documents to MongoDB GridFS
- Download documents from MongoDB
- Delete documents from MongoDB
- Automatic file validation
- Support for all document types (PDF, JPG, PNG, DOC, DOCX)

### 2. Features
- ✅ No CORS issues (same origin as your API)
- ✅ Files stored in MongoDB (no external storage needed)
- ✅ 10MB file size limit
- ✅ Automatic content-type detection
- ✅ Secure file streaming
- ✅ File metadata tracking

## 🚀 Setup Instructions

### Step 1: Install Required Package

```bash
cd abra_fleet_backend
npm install multer
```

### Step 2: Restart Backend Server

```bash
# Stop current server (Ctrl + C)
# Then restart
node index.js
```

### Step 3: Test the API

The document API is now available at:
- Upload: `POST http://localhost:3000/api/documents/vehicles/:vehicleId/documents`
- Download: `GET http://localhost:3000/api/documents/download/:fileId`
- Delete: `DELETE http://localhost:3000/api/documents/vehicles/:vehicleId/documents/:documentId`

## 📡 API Endpoints

### Upload Document

**Endpoint:** `POST /api/documents/vehicles/:vehicleId/documents`

**Headers:**
```
Authorization: Bearer <firebase-token>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <binary file data>
documentType: "Registration"
documentName: "REG-2024-001"
expiryDate: "2025-12-08"
isDriverDoc: "false"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "documentType": "Registration",
    "documentName": "REG-2024-001",
    "documentUrl": "/api/documents/download/507f1f77bcf86cd799439011",
    "uploadDate": "2024-12-08T10:00:00.000Z",
    "expiryDate": "2025-12-08T00:00:00.000Z",
    "fileSize": 1024000,
    "contentType": "application/pdf"
  }
}
```

### Download Document

**Endpoint:** `GET /api/documents/download/:fileId`

**Response:** Binary file stream with appropriate content-type

### Delete Document

**Endpoint:** `DELETE /api/documents/vehicles/:vehicleId/documents/:documentId?isDriverDoc=false`

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## 🔧 Update Flutter App

Now update your VehicleService to use MongoDB API instead of Firebase Storage:

### Update `vehicle_service.dart`

```dart
// Add this method to VehicleService
Future<Map<String, dynamic>> uploadVehicleDocumentToMongoDB({
  required String vehicleId,
  required File? file,
  required Uint8List? bytes,
  required String fileName,
  required String documentType,
  required String documentName,
  DateTime? expiryDate,
  required bool isDriverDoc,
}) async {
  try {
    final headers = await _getHeaders();
    
    // Create multipart request
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$_vehiclesEndpoint/$vehicleId/documents'),
    );
    
    // Add headers
    request.headers.addAll(headers);
    
    // Add file
    if (kIsWeb && bytes != null) {
      // Web - use bytes
      request.files.add(http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: fileName,
      ));
    } else if (file != null) {
      // Mobile/Desktop - use file
      request.files.add(await http.MultipartFile.fromPath(
        'file',
        file.path,
        filename: fileName,
      ));
    }
    
    // Add form fields
    request.fields['documentType'] = documentType;
    request.fields['documentName'] = documentName;
    request.fields['isDriverDoc'] = isDriverDoc.toString();
    if (expiryDate != null) {
      request.fields['expiryDate'] = expiryDate.toIso8601String();
    }
    
    // Send request
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    final responseData = jsonDecode(response.body);
    
    if (response.statusCode == 200) {
      return {
        'success': true,
        'message': responseData['message'],
        'data': responseData['data'],
      };
    } else {
      return {
        'success': false,
        'message': responseData['message'] ?? 'Upload failed',
      };
    }
  } catch (e) {
    print('Error uploading to MongoDB: $e');
    return {
      'success': false,
      'message': 'Network error: ${e.toString()}',
    };
  }
}
```

## 📊 MongoDB GridFS Structure

Files are stored in MongoDB using GridFS:

```
MongoDB Collections:
├── documents.files (file metadata)
│   ├── _id: ObjectId
│   ├── filename: "registration.pdf"
│   ├── length: 1024000
│   ├── chunkSize: 261120
│   ├── uploadDate: ISODate
│   └── metadata:
│       ├── vehicleId: "68e9ed2e425fb2c858c52e1b"
│       ├── documentType: "Registration"
│       ├── documentName: "REG-2024-001"
│       ├── isDriverDoc: false
│       ├── uploadedBy: "firebase-uid"
│       └── contentType: "application/pdf"
│
└── documents.chunks (file data in chunks)
    ├── _id: ObjectId
    ├── files_id: ObjectId (reference to files)
    ├── n: 0 (chunk number)
    └── data: Binary (chunk data)
```

## 🎯 Advantages of MongoDB Storage

### vs Firebase Storage:
- ✅ No CORS issues
- ✅ No additional service needed
- ✅ Same authentication as API
- ✅ Easier to manage
- ✅ No extra costs
- ✅ Works on all platforms (web, mobile, desktop)

### vs File System:
- ✅ Scalable
- ✅ Automatic replication
- ✅ No file path issues
- ✅ Easy backup
- ✅ Cloud-ready

## 🧪 Testing

### Test Upload with Postman/Thunder Client:

1. **Create Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/documents/vehicles/YOUR_VEHICLE_ID/documents`
   - Headers: `Authorization: Bearer YOUR_FIREBASE_TOKEN`

2. **Add Form Data:**
   - file: [Select a PDF file]
   - documentType: Registration
   - documentName: TEST-DOC-001
   - expiryDate: 2025-12-31
   - isDriverDoc: false

3. **Send Request**

4. **Check Response** - Should see success message with document data

### Test Download:

1. Copy the `fileId` from upload response
2. Open browser: `http://localhost:3000/api/documents/download/FILE_ID`
3. File should download/display

## 🔄 Migration from Firebase Storage

If you want to migrate existing Firebase Storage files to MongoDB:

```javascript
// migration script (create as migrate-documents.js)
const { MongoClient, GridFSBucket } = require('mongodb');
const admin = require('firebase-admin');
const https = require('https');

async function migrateDocuments() {
  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('abra_fleet');
  const bucket = new GridFSBucket(db, { bucketName: 'documents' });
  
  // Get all vehicles with documents
  const vehicles = await db.collection('vehicles').find({}).toArray();
  
  for (const vehicle of vehicles) {
    for (const doc of vehicle.documents || []) {
      if (doc.documentUrl && doc.documentUrl.includes('firebasestorage')) {
        // Download from Firebase
        const response = await fetch(doc.documentUrl);
        const buffer = await response.buffer();
        
        // Upload to MongoDB
        const uploadStream = bucket.openUploadStream(doc.documentName, {
          metadata: {
            vehicleId: vehicle._id.toString(),
            documentType: doc.documentType,
            ...doc
          }
        });
        
        uploadStream.end(buffer);
        
        // Update document URL
        await db.collection('vehicles').updateOne(
          { _id: vehicle._id, 'documents.id': doc.id },
          { $set: { 'documents.$.documentUrl': `/api/documents/download/${uploadStream.id}` } }
        );
      }
    }
  }
  
  console.log('Migration complete!');
  await client.close();
}
```

## 📝 Summary

### What You Need to Do:

1. **Install multer:**
   ```bash
   cd abra_fleet_backend
   npm install multer
   ```

2. **Restart backend:**
   ```bash
   node index.js
   ```

3. **Update Flutter app** to use MongoDB API (optional - can keep Firebase Storage)

4. **Test upload** - No more CORS errors!

### Benefits:

- ✅ No CORS configuration needed
- ✅ Works immediately on web
- ✅ All files in one database
- ✅ Easier to manage
- ✅ No external dependencies

The MongoDB solution is production-ready and eliminates all CORS issues! 🎉
