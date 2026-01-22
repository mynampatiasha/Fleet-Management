# SOS Proof Upload Fix - Complete ✅

## Problem
When admins tried to upload proof images to resolve SOS alerts, the backend returned a 500 error:
```
Cannot destructure property 'sosId' of 'req.body' as it is undefined.
```

## Root Cause
The frontend was sending the data as **multipart/form-data** (required for file uploads), but the backend's `POST /api/sos/resolve` endpoint was trying to read from `req.body` directly without using a multipart parser.

## Solution Applied

### 1. Backend Changes (`abra_fleet_backend/routes/sos_router.js`)

#### Added Multer Configuration
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/sos_proofs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sos_proof_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
```

#### Updated POST /resolve Endpoint
- Added `upload.single('photo')` middleware to handle file upload
- Changed to read from `req.body` (form fields) and `req.file` (uploaded file)
- Generates photo URL: `/uploads/sos_proofs/{filename}`
- Saves photo metadata to MongoDB and Firebase

### 2. Backend Main File (`abra_fleet_backend/index.js`)

Added static file serving:
```javascript
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

This allows uploaded images to be accessed via:
```
http://localhost:3000/uploads/sos_proofs/sos_proof_1234567890.jpg
```

## How It Works Now

### Frontend Flow
1. Admin selects photo from device
2. Captures current GPS location
3. Sends multipart request with:
   - **Form fields**: `sosId`, `resolutionNotes`, `resolvedBy`, `latitude`, `longitude`
   - **File**: `photo` (image file)

### Backend Flow
1. Multer middleware intercepts the request
2. Saves photo to `uploads/sos_proofs/` directory
3. Extracts form fields from `req.body`
4. Extracts file info from `req.file`
5. Updates MongoDB with resolution data including photo URL
6. Updates Firebase for real-time sync
7. Returns success response with photo URL

## Data Structure

### MongoDB Document (sos_events collection)
```javascript
{
  _id: ObjectId("..."),
  status: "Resolved",
  resolution: {
    photoUrl: "/uploads/sos_proofs/sos_proof_1734567890123.jpg",
    photoFilename: "sos_proof_1734567890123.jpg",
    notes: "Issue resolved, customer safe",
    timestamp: ISODate("2025-12-18T10:30:00Z"),
    resolvedBy: "Admin",
    latitude: 12.9716,
    longitude: 77.5946
  },
  resolvedAt: ISODate("2025-12-18T10:30:00Z"),
  updatedAt: ISODate("2025-12-18T10:30:00Z")
}
```

## Testing

### Restart Backend
```bash
cd abra_fleet_backend
npm start
```

### Test Flow
1. Login as admin
2. Wait for SOS alert or create test SOS
3. Click on SOS alert card
4. Click "Resolve with Proof"
5. Select photo from device
6. Enter resolution notes
7. Click "Submit Resolution"
8. ✅ Should see success message
9. ✅ Photo should be uploaded to backend
10. ✅ SOS status should change to "Resolved"

## File Locations

### Uploaded Photos
- **Directory**: `abra_fleet_backend/uploads/sos_proofs/`
- **URL Pattern**: `http://localhost:3000/uploads/sos_proofs/{filename}`
- **Naming**: `sos_proof_{timestamp}-{random}.jpg`

### Modified Files
1. `abra_fleet_backend/routes/sos_router.js` - Added multer config and updated endpoint
2. `abra_fleet_backend/index.js` - Added static file serving

## Security Notes

✅ **File Type Validation**: Only allows jpeg, jpg, png, gif
✅ **File Size Limit**: 10MB maximum
✅ **Unique Filenames**: Timestamp + random number prevents collisions
✅ **Directory Creation**: Auto-creates upload directory if missing

## Next Steps

After restarting the backend, the SOS proof upload feature will work correctly!
