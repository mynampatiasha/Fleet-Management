# 📱 APK Installation & Testing Guide

## ✅ APK Build Status
- **Status**: Successfully Built
- **Location**: `abra_fleet/build/app/outputs/flutter-apk/app-release.apk`
- **Size**: 72.2MB
- **Backend URL**: `https://abra-fleet-management.com/api`
- **WebSocket URL**: `wss://abra-fleet-management.com`

---

## 🔧 Pre-Installation Checklist

### 1. Verify Backend is Running
Before installing the APK, make sure your backend is accessible:

**Test in Browser:**
```
https://abra-fleet-management.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

If this doesn't work, your backend may not be running or accessible.

### 2. Check SSL Certificate
Make sure your domain has a valid SSL certificate (HTTPS). The app is configured to use HTTPS.

---

## 📲 Installation Steps

### Method 1: Direct Transfer (Recommended)
1. Connect your phone to computer via USB
2. Copy `app-release.apk` to your phone's Downloads folder
3. On your phone, open File Manager → Downloads
4. Tap on `app-release.apk`
5. If prompted, enable "Install from Unknown Sources"
6. Tap "Install"
7. Wait for installation to complete
8. Tap "Open" or find "ABRA Fleet" in your app drawer

### Method 2: Using ADB
```bash
adb install abra_fleet/build/app/outputs/flutter-apk/app-release.apk
```

### Method 3: Cloud Transfer
1. Upload APK to Google Drive, Dropbox, or email it to yourself
2. Download on your phone
3. Open and install

---

## 🧪 Testing Checklist

### Phase 1: Basic Connectivity ✓

#### Test 1: App Launches
- [ ] App opens without crashing
- [ ] Login screen appears
- [ ] No immediate error messages

#### Test 2: Backend Connection
- [ ] Try to login with valid credentials
- [ ] Check if you see "Connecting..." or loading indicator
- [ ] Verify no "Connection refused" or "Network error" messages

**Test Credentials** (use your actual credentials):
```
Email: admin@abrafleet.com
Password: [your password]
```

---

### Phase 2: Authentication Testing ✓

#### Test 3: Login Flow
- [ ] Enter valid credentials
- [ ] Tap "Login"
- [ ] App successfully authenticates
- [ ] Redirects to appropriate dashboard (Admin/Driver/Customer/Client)

#### Test 4: Firebase Authentication
- [ ] Firebase Auth token is generated
- [ ] Token is sent to backend
- [ ] Backend validates token
- [ ] User data is retrieved

**Check for Errors:**
- "Invalid credentials"
- "User not found"
- "Network error"
- "Token expired"

---

### Phase 3: Data Loading ✓

#### Test 5: Dashboard Data
- [ ] Dashboard loads successfully
- [ ] Statistics/counts display correctly
- [ ] No "Failed to load data" errors

#### Test 6: API Calls
Test these features to verify backend connectivity:

**For Admin:**
- [ ] View Drivers list
- [ ] View Vehicles list
- [ ] View Customers list
- [ ] View Trips/Rosters

**For Driver:**
- [ ] View assigned trips
- [ ] View route details
- [ ] Update location (if applicable)

**For Customer:**
- [ ] View trip history
- [ ] View upcoming trips
- [ ] View profile

---

### Phase 4: Real-Time Features ✓

#### Test 7: WebSocket Connection
- [ ] Real-time notifications work
- [ ] Live location updates (if applicable)
- [ ] No "WebSocket connection failed" errors

#### Test 8: Notifications
- [ ] Push notifications are received
- [ ] In-app notifications display
- [ ] Notification badge updates

---

### Phase 5: CRUD Operations ✓

#### Test 9: Create Operations
- [ ] Create new driver/vehicle/customer (Admin)
- [ ] Data saves successfully
- [ ] New item appears in list

#### Test 10: Update Operations
- [ ] Edit existing records
- [ ] Changes save successfully
- [ ] Updated data reflects immediately

#### Test 11: Delete Operations
- [ ] Delete records
- [ ] Confirmation dialog appears
- [ ] Item removed from list

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" or "Connection Refused"
**Cause**: Backend not accessible
**Solution**:
1. Check if backend is running: `https://abra-fleet-management.com/api/health`
2. Verify SSL certificate is valid
3. Check if phone has internet connection
4. Try accessing the URL in phone's browser

### Issue 2: "Authentication Failed"
**Cause**: Firebase or backend auth issue
**Solution**:
1. Verify Firebase project is configured correctly
2. Check if user exists in Firebase Auth
3. Verify backend can validate Firebase tokens
4. Check backend logs for auth errors

### Issue 3: "Failed to Load Data"
**Cause**: API endpoint not responding
**Solution**:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Test API endpoints manually
4. Check if user has proper permissions

### Issue 4: App Crashes on Launch
**Cause**: Missing dependencies or configuration
**Solution**:
1. Rebuild APK: `flutter clean && flutter build apk --release`
2. Check if all Firebase services are configured
3. Verify .env file is included in build

### Issue 5: "SSL Handshake Failed"
**Cause**: Invalid or self-signed SSL certificate
**Solution**:
1. Ensure domain has valid SSL certificate
2. Use Let's Encrypt or cPanel AutoSSL
3. Test HTTPS in browser first

---

## 📊 Backend Health Check

### Quick Backend Test
Run these commands to verify backend is working:

```bash
# Test health endpoint
curl https://abra-fleet-management.com/api/health

# Test auth endpoint (should return 401 without token)
curl https://abra-fleet-management.com/api/admin/drivers

# Test with authentication (replace TOKEN)
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
     https://abra-fleet-management.com/api/admin/drivers
```

---

## 🔍 Debugging Tips

### Enable Debug Mode
If you need more detailed logs, rebuild with debug mode:
```bash
flutter build apk --debug
```

### View App Logs
Connect phone via USB and run:
```bash
adb logcat | grep -i flutter
```

### Check Network Traffic
Use Chrome DevTools or Charles Proxy to inspect API calls.

---

## ✅ Success Criteria

Your app is working correctly if:

1. ✓ App launches without crashes
2. ✓ Login succeeds with valid credentials
3. ✓ Dashboard loads with data
4. ✓ Can navigate between screens
5. ✓ Can perform CRUD operations
6. ✓ Real-time features work (notifications, location)
7. ✓ No persistent error messages
8. ✓ Data syncs with backend

---

## 📝 Testing Report Template

After testing, fill this out:

```
Date: _______________
Tester: _______________
Device: _______________
Android Version: _______________

✓ = Working | ✗ = Not Working | ~ = Partially Working

[ ] App Installation
[ ] App Launch
[ ] Login/Authentication
[ ] Dashboard Loading
[ ] Data Display
[ ] Create Operations
[ ] Update Operations
[ ] Delete Operations
[ ] Real-time Features
[ ] Notifications
[ ] Location Services

Issues Found:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Notes:
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Backend Logs**: Look for errors in your server logs
2. **Check App Logs**: Use `adb logcat` to see Flutter logs
3. **Test API Manually**: Use Postman or curl to test endpoints
4. **Verify Configuration**: Double-check .env file and Firebase config
5. **Rebuild APK**: Sometimes a clean rebuild fixes issues

---

## 🎯 Next Steps After Successful Testing

Once everything works:

1. **Distribute APK**: Share with your team/users
2. **Monitor Backend**: Watch for errors in production
3. **Collect Feedback**: Get user feedback on performance
4. **Plan Updates**: Note any features that need improvement
5. **Consider Play Store**: Prepare for Google Play Store release

---

## 📞 Quick Reference

**APK Location**: `abra_fleet/build/app/outputs/flutter-apk/app-release.apk`
**Backend URL**: `https://abra-fleet-management.com/api`
**Health Check**: `https://abra-fleet-management.com/api/health`
**Firebase Project**: `abrafleet-cec94`

**Rebuild Command**:
```bash
cd abra_fleet
flutter clean
flutter pub get
flutter build apk --release
```

---

Good luck with testing! 🚀
