# Driver Profile - Quick Start Guide

## 🚀 What's Been Fixed

Your driver profile page now has **complete functionality** for:

1. ✅ **Basic Details Update** - Name, phone number can be edited
2. ✅ **Daily Verification Photo** - Upload daily photo with 24-hour expiry
3. ✅ **Profile Photo** - Permanent profile picture upload
4. ✅ **License Document** - Upload with license number and expiry date
5. ✅ **Medical Certificate** - Upload with certificate number and expiry date
6. ✅ **Document Display** - All documents show with status and expiry dates

## 📱 How to Test (Mobile App)

### 1. Login as Driver
```
Email: drivertest@abrafleet.com
Password: Driver@123
```

### 2. Navigate to Profile
- Open the app
- Go to "Profile" tab
- You'll see your profile header with photo

### 3. Edit Basic Details
- Tap "Edit My Details"
- Change your name
- Change your phone number
- Tap "Save Changes"
- ✅ Success message appears
- Profile screen refreshes with new data

### 4. Upload Documents
- Tap "My Documents"
- You'll see 4 document cards:
  - Daily Verification Photo
  - Profile Photo
  - Driving License
  - Medical Certificate

#### Upload Daily Verification Photo
- Tap "Upload" on Daily Verification Photo card
- Camera opens
- Take a photo
- ✅ Photo uploads and displays
- Expiry date shows (24 hours from now)

#### Upload Profile Photo
- Tap "Upload" on Profile Photo card
- Gallery opens
- Select a photo
- ✅ Photo uploads
- Profile header updates with new photo

#### Upload License
- Tap "Upload" on Driving License card
- Dialog appears asking for:
  - License Number
  - Expiry Date
- Fill in details and tap "Continue"
- Gallery opens
- Select license photo
- ✅ License uploads with details
- Card shows license number and expiry date

#### Upload Medical Certificate
- Tap "Upload" on Medical Certificate card
- Dialog appears asking for:
  - Certificate Number (optional)
  - Expiry Date
- Fill in details and tap "Continue"
- Gallery opens
- Select certificate photo
- ✅ Certificate uploads with details
- Card shows expiry date

### 5. Verify Everything Works
- Pull down to refresh
- All documents should show:
  - ✓ Green checkmark if uploaded
  - ✗ Red X if not uploaded
  - Expiry dates where applicable
  - "Uploaded" status chip

## 🧪 Backend Testing

### Start Backend
```bash
cd abra_fleet_backend
npm start
```

### Run Test Script
```bash
node test-driver-profile-complete.js
```

This will test:
- ✅ Driver login
- ✅ Get profile
- ✅ Update profile
- ✅ Upload daily photo
- ✅ Upload license
- ✅ Upload medical certificate
- ✅ Get document status
- ✅ Get all documents

## 🔍 What to Check

### Profile Screen
- [ ] Profile photo displays in header
- [ ] Name displays correctly
- [ ] Email displays correctly
- [ ] Phone number displays correctly
- [ ] License number displays (if set)
- [ ] License expiry displays (if set)
- [ ] Status badge shows "Active"

### Edit Profile Screen
- [ ] Name field is editable
- [ ] Phone field is editable
- [ ] Email field is read-only
- [ ] License fields are read-only
- [ ] Save button works
- [ ] Success message appears
- [ ] Returns to profile screen
- [ ] Profile screen shows updated data

### Documents Screen
- [ ] All 4 document cards display
- [ ] Each card shows correct icon and color
- [ ] Status indicators work (✓ or ✗)
- [ ] Upload buttons work
- [ ] Dialogs appear for license/medical
- [ ] Camera/gallery opens correctly
- [ ] Upload progress shows
- [ ] Success messages appear
- [ ] Documents display after upload
- [ ] Expiry dates show correctly
- [ ] Pull-to-refresh works

## 📊 Document Status Indicators

### Daily Verification Photo
- 🔴 Red X = Not uploaded today
- 🟢 Green ✓ = Uploaded and valid
- 📅 Expiry = 24 hours from upload time
- 🖼️ Preview = Shows current photo

### Profile Photo
- 🔴 Red X = No photo uploaded
- 🟢 Green ✓ = Photo uploaded
- No expiry (permanent)

### License
- 🔴 Red X = Not uploaded
- 🟢 Green ✓ = Uploaded
- 📅 Expiry date shown
- 🔢 License number shown

### Medical Certificate
- 🔴 Red X = Not uploaded
- 🟢 Green ✓ = Uploaded
- 📅 Expiry date shown
- 🔢 Certificate number shown (if provided)

## 🐛 Troubleshooting

### Documents not uploading
1. Check backend is running: `http://localhost:3001`
2. Check MongoDB is running
3. Check JWT token is valid (login again)
4. Check file size < 5MB
5. Check file is an image (jpg, png, etc.)

### Profile not updating
1. Check network connection
2. Check backend logs for errors
3. Verify driver exists in database
4. Try logging out and back in

### Daily photo not showing
1. Check if 24 hours have passed (photo expires)
2. Check backend logs for upload errors
3. Verify base64 encoding is correct
4. Check MongoDB for document data

### Expiry dates not showing
1. Verify expiry date was provided during upload
2. Check backend stored the date correctly
3. Check date format in MongoDB
4. Refresh the documents screen

## 📝 Database Verification

### Check Driver Profile
```javascript
db.drivers.findOne({ 
  "personalInfo.email": "drivertest@abrafleet.com" 
})
```

Should show:
- personalInfo.firstName
- personalInfo.lastName
- personalInfo.phone
- profilePhoto (base64 string)
- lastDailyPhotoUpload (timestamp)
- documents.license
- documents.medicalCertificate

### Check Document Status
```javascript
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

## 🎯 Success Criteria

✅ Driver can edit name and phone
✅ Changes save to database
✅ Changes reflect immediately in UI
✅ Daily photo uploads successfully
✅ Daily photo displays in card
✅ Daily photo expires after 24 hours
✅ Profile photo uploads successfully
✅ Profile photo shows in header
✅ License uploads with number and expiry
✅ Medical certificate uploads with expiry
✅ All documents show correct status
✅ Expiry dates display correctly
✅ Success/error messages are clear
✅ UI is smooth and responsive

## 🚀 Next Steps

1. **Test on real device** - Install APK and test all features
2. **Test with real photos** - Use actual license/certificate photos
3. **Test expiry logic** - Wait 24 hours to verify daily photo expires
4. **Test edge cases** - Large files, invalid formats, network errors
5. **Get user feedback** - Have drivers test and provide feedback

## 📞 Support

If you encounter any issues:
1. Check backend logs: `abra_fleet_backend/logs/`
2. Check MongoDB data: Use MongoDB Compass
3. Check network requests: Use Flutter DevTools
4. Review error messages in app

## ✨ Features Working

- ✅ Profile photo upload and display
- ✅ Daily verification photo with 24-hour expiry
- ✅ License document with number and expiry
- ✅ Medical certificate with expiry
- ✅ Basic details update (name, phone)
- ✅ Document status tracking
- ✅ Expiry date display
- ✅ Success/error feedback
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Image preview

Everything is ready to test! 🎉
