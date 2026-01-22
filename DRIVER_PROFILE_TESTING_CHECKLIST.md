# Driver Profile - Complete Testing Checklist

## 🎯 Pre-Testing Setup

### Backend
- [ ] MongoDB is running
- [ ] Backend server is running (`npm start` in abra_fleet_backend)
- [ ] Backend is accessible at http://localhost:3001
- [ ] Test driver exists in database (drivertest@abrafleet.com)

### Frontend
- [ ] Flutter app is compiled
- [ ] App is installed on device/emulator
- [ ] App can connect to backend
- [ ] Camera permissions granted
- [ ] Gallery permissions granted

## 📱 Testing Steps

### 1. Login
- [ ] Open app
- [ ] Enter email: drivertest@abrafleet.com
- [ ] Enter password: Driver@123
- [ ] Select role: Driver
- [ ] Click Login
- [ ] ✅ Login successful
- [ ] ✅ Redirected to driver dashboard

### 2. Navigate to Profile
- [ ] Click on Profile tab/button
- [ ] ✅ Profile screen loads
- [ ] ✅ Profile header displays
- [ ] ✅ Name displays correctly
- [ ] ✅ Email displays correctly
- [ ] ✅ Phone displays correctly
- [ ] ✅ Status badge shows "Active"

### 3. Test Edit Basic Details

#### Open Edit Screen
- [ ] Click "Edit My Details" button
- [ ] ✅ Edit screen opens
- [ ] ✅ Name field shows current name
- [ ] ✅ Phone field shows current phone
- [ ] ✅ Email field is read-only
- [ ] ✅ License fields are read-only

#### Update Name
- [ ] Clear name field
- [ ] Enter new name: "Test Driver Updated"
- [ ] ✅ Name field accepts input
- [ ] ✅ No validation errors

#### Update Phone
- [ ] Clear phone field
- [ ] Enter new phone: "+9876543210"
- [ ] ✅ Phone field accepts input
- [ ] ✅ No validation errors

#### Save Changes
- [ ] Click "Save Changes" button
- [ ] ✅ Loading indicator appears
- [ ] ✅ Success message appears: "Profile updated successfully!"
- [ ] ✅ Returns to profile screen
- [ ] ✅ Profile screen shows updated name
- [ ] ✅ Profile screen shows updated phone

#### Verify Persistence
- [ ] Close app completely
- [ ] Reopen app
- [ ] Login again
- [ ] Go to profile
- [ ] ✅ Updated name still shows
- [ ] ✅ Updated phone still shows

### 4. Test Documents Screen

#### Open Documents Screen
- [ ] Click "My Documents" button
- [ ] ✅ Documents screen opens
- [ ] ✅ Screen title shows "My Documents"
- [ ] ✅ 4 document cards display:
  - Daily Verification Photo
  - Profile Photo
  - Driving License
  - Medical Certificate

#### Check Initial Status
- [ ] ✅ Each card shows status indicator
- [ ] ✅ Red X for not uploaded documents
- [ ] ✅ Green ✓ for uploaded documents
- [ ] ✅ Upload buttons are visible

### 5. Test Daily Verification Photo

#### Upload Photo
- [ ] Click "Upload" on Daily Verification Photo card
- [ ] ✅ Camera opens
- [ ] Take a photo
- [ ] ✅ Photo preview appears (if applicable)
- [ ] Confirm photo
- [ ] ✅ Loading indicator appears
- [ ] ✅ Success message: "Daily Verification Photo uploaded successfully!"
- [ ] ✅ Card updates with green ✓
- [ ] ✅ "Uploaded" status chip appears
- [ ] ✅ Expiry date displays (24 hours from now)
- [ ] ✅ Photo preview shows in card

#### Verify Display
- [ ] Pull down to refresh
- [ ] ✅ Photo still displays
- [ ] ✅ Status still shows uploaded
- [ ] ✅ Expiry date still shows

#### Test Update
- [ ] Click "Update" button
- [ ] ✅ Camera opens again
- [ ] Take new photo
- [ ] ✅ New photo uploads successfully
- [ ] ✅ Card updates with new photo
- [ ] ✅ New expiry date shows

### 6. Test Profile Photo

#### Upload Photo
- [ ] Click "Upload" on Profile Photo card
- [ ] ✅ Gallery opens
- [ ] Select a photo
- [ ] ✅ Loading indicator appears
- [ ] ✅ Success message: "Profile Photo uploaded successfully!"
- [ ] ✅ Card updates with green ✓
- [ ] ✅ "Uploaded" status chip appears

#### Verify in Header
- [ ] Go back to profile screen
- [ ] ✅ Profile header shows new photo
- [ ] ✅ Photo is clear and properly sized

### 7. Test License Document

#### Open Upload Dialog
- [ ] Click "Upload" on Driving License card
- [ ] ✅ Dialog appears: "License Details"
- [ ] ✅ License Number field shows
- [ ] ✅ Expiry Date selector shows

#### Enter Details
- [ ] Enter license number: "DL123456789"
- [ ] ✅ License number field accepts input
- [ ] Click "Select Expiry Date"
- [ ] ✅ Date picker opens
- [ ] Select date: 1 year from now
- [ ] ✅ Selected date displays
- [ ] Click "Continue"
- [ ] ✅ Gallery opens

#### Upload Document
- [ ] Select license image
- [ ] ✅ Loading indicator appears
- [ ] ✅ Success message: "License uploaded successfully!"
- [ ] ✅ Card updates with green ✓
- [ ] ✅ "Uploaded" status chip appears
- [ ] ✅ License number displays: "DL123456789"
- [ ] ✅ Expiry date displays correctly

### 8. Test Medical Certificate

#### Open Upload Dialog
- [ ] Click "Upload" on Medical Certificate card
- [ ] ✅ Dialog appears: "Medical Certificate Details"
- [ ] ✅ Certificate Number field shows (optional)
- [ ] ✅ Expiry Date selector shows

#### Enter Details
- [ ] Enter certificate number: "MC987654321"
- [ ] ✅ Certificate number field accepts input
- [ ] Click "Select Expiry Date"
- [ ] ✅ Date picker opens
- [ ] Select date: 1 year from now
- [ ] ✅ Selected date displays
- [ ] Click "Continue"
- [ ] ✅ Gallery opens

#### Upload Document
- [ ] Select certificate image
- [ ] ✅ Loading indicator appears
- [ ] ✅ Success message: "Medical Certificate uploaded successfully!"
- [ ] ✅ Card updates with green ✓
- [ ] ✅ "Uploaded" status chip appears
- [ ] ✅ Expiry date displays correctly

### 9. Test Refresh Functionality

#### Pull to Refresh
- [ ] Pull down on documents screen
- [ ] ✅ Refresh indicator appears
- [ ] ✅ Screen refreshes
- [ ] ✅ All documents still show
- [ ] ✅ All statuses still correct

#### Refresh Button
- [ ] Click refresh button in app bar
- [ ] ✅ Loading indicator appears
- [ ] ✅ Screen refreshes
- [ ] ✅ All documents still show

### 10. Test Error Handling

#### Invalid File Type
- [ ] Try to upload a PDF or text file
- [ ] ✅ Error message appears
- [ ] ✅ Upload is rejected

#### Network Error
- [ ] Turn off backend server
- [ ] Try to upload a document
- [ ] ✅ Error message appears
- [ ] ✅ Clear error description

#### Large File
- [ ] Try to upload file > 5MB
- [ ] ✅ Error message appears
- [ ] ✅ File size limit mentioned

### 11. Test Navigation

#### Back Navigation
- [ ] From documents screen, press back
- [ ] ✅ Returns to profile screen
- [ ] From edit screen, press back
- [ ] ✅ Returns to profile screen

#### Tab Navigation
- [ ] Switch to different tab
- [ ] Switch back to profile tab
- [ ] ✅ Profile screen still shows correctly
- [ ] ✅ No data loss

### 12. Test Persistence

#### Close and Reopen
- [ ] Close app completely
- [ ] Reopen app
- [ ] Login
- [ ] Go to profile
- [ ] Go to documents
- [ ] ✅ All documents still show
- [ ] ✅ All statuses still correct
- [ ] ✅ All expiry dates still show

### 13. Test Edge Cases

#### Empty Fields
- [ ] Try to save profile with empty name
- [ ] ✅ Validation error appears
- [ ] Try to save profile with empty phone
- [ ] ✅ Validation error appears

#### Special Characters
- [ ] Enter name with special characters
- [ ] ✅ Accepts or shows appropriate error
- [ ] Enter phone with letters
- [ ] ✅ Shows validation error

#### Long Text
- [ ] Enter very long name (100+ characters)
- [ ] ✅ Handles appropriately
- [ ] Enter very long phone number
- [ ] ✅ Handles appropriately

### 14. Test UI/UX

#### Visual Design
- [ ] ✅ All colors are consistent
- [ ] ✅ Icons are appropriate
- [ ] ✅ Text is readable
- [ ] ✅ Spacing is good
- [ ] ✅ Cards are well-designed

#### Responsiveness
- [ ] ✅ Buttons respond immediately
- [ ] ✅ Loading states are clear
- [ ] ✅ Transitions are smooth
- [ ] ✅ No lag or freezing

#### Feedback
- [ ] ✅ Success messages are clear
- [ ] ✅ Error messages are helpful
- [ ] ✅ Loading indicators show
- [ ] ✅ Status updates immediately

## 🔍 Backend Verification

### Check Database
```javascript
// In MongoDB
db.drivers.findOne({ 
  "personalInfo.email": "drivertest@abrafleet.com" 
})
```

#### Verify Data
- [ ] ✅ personalInfo.firstName updated
- [ ] ✅ personalInfo.lastName updated
- [ ] ✅ personalInfo.phone updated
- [ ] ✅ profilePhoto exists (base64 string)
- [ ] ✅ lastDailyPhotoUpload exists (timestamp)
- [ ] ✅ documents.license exists
- [ ] ✅ documents.license.licenseNumber correct
- [ ] ✅ documents.license.expiryDate correct
- [ ] ✅ documents.medicalCertificate exists
- [ ] ✅ documents.medicalCertificate.expiryDate correct

### Check Backend Logs
- [ ] ✅ No error messages
- [ ] ✅ Successful upload logs
- [ ] ✅ Successful update logs
- [ ] ✅ JWT authentication working

## 🧪 Automated Testing

### Run Test Script
```bash
node test-driver-profile-complete.js
```

#### Verify Results
- [ ] ✅ Login test passes
- [ ] ✅ Get profile test passes
- [ ] ✅ Update profile test passes
- [ ] ✅ Upload daily photo test passes
- [ ] ✅ Upload license test passes
- [ ] ✅ Upload medical certificate test passes
- [ ] ✅ Get document status test passes
- [ ] ✅ Get all documents test passes

## ✅ Final Verification

### All Features Working
- [ ] ✅ Basic details update
- [ ] ✅ Daily verification photo
- [ ] ✅ Profile photo
- [ ] ✅ License document
- [ ] ✅ Medical certificate
- [ ] ✅ Document display
- [ ] ✅ Expiry tracking
- [ ] ✅ Status indicators
- [ ] ✅ Success messages
- [ ] ✅ Error handling
- [ ] ✅ Refresh functionality
- [ ] ✅ Navigation
- [ ] ✅ Persistence

### User Experience
- [ ] ✅ UI is intuitive
- [ ] ✅ Feedback is clear
- [ ] ✅ Performance is good
- [ ] ✅ No crashes
- [ ] ✅ No bugs found

## 📊 Test Results Summary

### Pass/Fail Count
- Total Tests: ___
- Passed: ___
- Failed: ___
- Pass Rate: ___%

### Issues Found
1. _______________
2. _______________
3. _______________

### Notes
_______________________________________________
_______________________________________________
_______________________________________________

## ✅ Sign-Off

- [ ] All critical features tested
- [ ] All tests passed
- [ ] No blocking issues
- [ ] Ready for production

**Tested By**: _______________
**Date**: _______________
**Signature**: _______________

---

## 🎉 Success Criteria

✅ Driver can edit name and phone
✅ Changes save and persist
✅ Daily photo uploads and displays
✅ Daily photo expires after 24 hours
✅ Profile photo uploads and displays
✅ License uploads with details
✅ Medical certificate uploads with details
✅ All documents show correct status
✅ Expiry dates display correctly
✅ UI is smooth and responsive
✅ Error handling works properly
✅ No crashes or major bugs

**If all checkboxes are checked, the driver profile is ready for production!** 🚀
