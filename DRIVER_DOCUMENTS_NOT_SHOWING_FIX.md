# Driver Documents Not Showing After Upload - FIX

## Problem
- Daily verification photo uploads successfully (green message appears)
- BUT the UI doesn't update to show the uploaded status
- License, medical certificate, and profile photo have the same issue
- Documents are uploading but not fetching/displaying

## Root Cause
The issue is that after upload, the frontend is not properly refreshing the document status from the backend.

## Solution Applied

### 1. Added Debug Logging
Added extensive logging to track the data flow:
- Upload process logging
- Status fetch logging
- Document card rendering logging

### 2. Fixed Refresh Logic
- Added 500ms delay after upload before refreshing status
- Added explicit status refresh call after successful upload
- Improved error handling and user feedback

### 3. Enhanced UI Feedback
- Better success messages with 2-second duration
- Error messages with 3-second duration
- Loading indicators during upload and refresh

## Testing Steps

### Backend Test
```bash
node test-driver-documents-debug.js
```

This will:
1. Login as driver
2. Get initial document status
3. Upload a daily photo
4. Get status after upload
5. Verify if the photo shows as uploaded

### Frontend Test
1. Open Flutter app
2. Login as driver (drivertest@abrafleet.com / Driver@123)
3. Go to Profile → My Documents
4. Open browser DevTools console
5. Upload daily verification photo
6. Watch the console logs:
   - Should see "📤 Starting upload"
   - Should see "✅ Upload successful"
   - Should see "🔄 Refreshing document status"
   - Should see "✅ Status refreshed"
   - Should see "🎨 Building card" with updated status

## What to Check

### If Backend Test Passes
✅ Backend is working correctly
❌ Issue is in Flutter app
→ Check Flutter console logs
→ Verify API calls in Network tab
→ Check if setState is being called

### If Backend Test Fails
❌ Backend is not storing/returning data correctly
→ Check MongoDB for driver document
→ Check backend logs
→ Verify findDriver function is working

## Expected Behavior

### After Daily Photo Upload:
```
Status should show:
{
  dailyVerificationPhoto: {
    uploaded: true,  ← Should be true
    dailyPhotoUrl: "data:image/jpeg;base64,..." ← Should have data
    expiryDate: "2026-01-20T..." ← 24 hours from now
  }
}
```

### After License Upload:
```
Status should show:
{
  license: {
    uploaded: true,  ← Should be true
    expiryDate: "2027-01-19..." ← Date you selected
  }
}
```

## Debug Commands

### Check MongoDB Directly
```javascript
// In MongoDB shell or Compass
db.drivers.findOne(
  { "personalInfo.email": "drivertest@abrafleet.com" },
  {
    profilePhoto: 1,
    lastDailyPhotoUpload: 1,
    "documents.license": 1,
    "documents.medicalCertificate": 1
  }
)
```

Should show:
- `profilePhoto`: base64 string (if uploaded)
- `lastDailyPhotoUpload`: timestamp (if uploaded)
- `documents.license`: object with documentUrl (if uploaded)
- `documents.medicalCertificate`: object with documentUrl (if uploaded)

### Check Backend Logs
Look for these messages:
```
Getting status for driver: [driverId]
Found driver: [driverId] [name]
```

If you see "Driver not found", the findDriver function is failing.

## Common Issues

### Issue 1: Driver Not Found
**Symptom**: Backend returns 404
**Cause**: findDriver function can't locate driver
**Fix**: Check if driver exists in admin_users or drivers collection

### Issue 2: Status Returns Empty
**Symptom**: Status returns but all fields are false
**Cause**: Documents not being saved to MongoDB
**Fix**: Check upload endpoints are calling updateDriver correctly

### Issue 3: Frontend Not Refreshing
**Symptom**: Backend returns correct data but UI doesn't update
**Cause**: setState not being called or state not updating
**Fix**: Check Flutter console logs, verify _loadDocumentStatus is being called

### Issue 4: Image Not Displaying
**Symptom**: Status shows uploaded but image doesn't display
**Cause**: base64 decoding error or wrong format
**Fix**: Check dailyPhotoUrl format, should be "data:image/jpeg;base64,..."

## Quick Fix Checklist

- [ ] Run backend test script
- [ ] Check if backend returns correct data
- [ ] Check MongoDB has the documents
- [ ] Check Flutter console logs
- [ ] Verify API calls in Network tab
- [ ] Check if setState is being called
- [ ] Verify image format is correct
- [ ] Test with real device (not just emulator)

## Files Modified

1. `driver_documents_screen.dart`:
   - Added debug logging
   - Fixed refresh logic
   - Enhanced error handling

2. `test-driver-documents-debug.js`:
   - NEW test script to verify backend

## Next Steps

1. Run the test script: `node test-driver-documents-debug.js`
2. Check the output
3. If backend test passes, issue is in Flutter
4. If backend test fails, issue is in backend
5. Check the specific logs to identify exact problem

## Expected Console Output (Success)

```
🚀 Starting Driver Documents Debug Test
============================================================

🔐 Logging in as driver...
✅ Login successful
   - Driver ID: abc123
   - Token: eyJhbGciOiJIUzI1NiIsInR5cCI6...

📋 BEFORE UPLOAD:
✅ Status retrieved successfully
📊 Document Status Summary:
   Daily Photo: ✗ Not Uploaded
   License: ✗ Not Uploaded
   Medical: ✗ Not Uploaded

📸 Uploading daily photo...
✅ Daily photo uploaded

⏳ Waiting 1 second for backend to process...

📋 AFTER UPLOAD:
✅ Status retrieved successfully
📊 Document Status Summary:
   Daily Photo: ✓ Uploaded  ← Should show uploaded
   License: ✗ Not Uploaded
   Medical: ✗ Not Uploaded
   Daily Photo URL: data:image/jpeg;base64,iVBORw0KGgo...

============================================================
✅ SUCCESS: Daily photo is showing as uploaded!
   The backend is working correctly.
   If the frontend is not showing it, the issue is in the Flutter app.
```

## Contact Points

If issue persists:
1. Check backend logs in `abra_fleet_backend/logs/`
2. Check MongoDB data directly
3. Check Flutter console for errors
4. Verify network requests in browser DevTools
5. Test with different driver account

---

**Status**: Fix applied, ready for testing
**Priority**: HIGH
**Impact**: Critical - drivers cannot verify documents
