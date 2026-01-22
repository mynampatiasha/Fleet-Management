# 🚀 Quick Test Reference Card

## 📦 APK Info
- **File**: `abra_fleet\build\app\outputs\flutter-apk\app-release.apk`
- **Size**: 72.2 MB
- **Backend**: `https://abra-fleet-management.com/api`

---

## ⚡ 30-Second Test

1. **Install APK** → Open on phone
2. **Launch App** → Should see login screen
3. **Login** → Use your credentials
4. **Check Dashboard** → Should load data
5. **Navigate** → Try different screens

✅ If all work = SUCCESS!
❌ If any fail = See troubleshooting below

---

## 🔍 Quick Checks

### Before Installing
```bash
# Check backend is running
curl https://abra-fleet-management.com/api/health
# Should return: {"status":"ok"}
```

### After Installing
- [ ] App opens (no crash)
- [ ] Login works
- [ ] Data loads
- [ ] Can create/edit/delete
- [ ] Notifications work

---

## 🐛 Quick Fixes

**Network Error?**
→ Check internet + backend running

**Auth Failed?**
→ Verify credentials + Firebase

**No Data?**
→ Check backend logs + MongoDB

**App Crashes?**
→ Reinstall + check permissions

---

## 📞 Quick Commands

**Install APK:**
```bash
adb install abra_fleet\build\app\outputs\flutter-apk\app-release.apk
```

**View Logs:**
```bash
adb logcat | grep -i flutter
```

**Rebuild APK:**
```bash
cd abra_fleet
flutter clean && flutter build apk --release
```

---

## ✅ Success = All These Work

1. ✓ App launches
2. ✓ Login succeeds  
3. ✓ Dashboard loads
4. ✓ Data displays
5. ✓ CRUD operations work
6. ✓ Notifications arrive

---

## 📱 Test Credentials

Use your actual credentials:
- Admin: `admin@abrafleet.com`
- Driver: `driver@abrafleet.com`
- Customer: `customer@abrafleet.com`
- Client: `client@abrafleet.com`

---

## 🎯 What to Test

**Must Test:**
- Login/Logout
- View lists (drivers, vehicles, etc.)
- Create new record
- Edit record
- Delete record

**Should Test:**
- Notifications
- Real-time updates
- Location tracking
- File uploads
- Reports

**Nice to Test:**
- Search/Filter
- Sorting
- Pagination
- Offline mode

---

## 📊 Backend Health

**Quick Check:**
Open in browser: `https://abra-fleet-management.com/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🆘 Emergency Contacts

**APK Location**: `abra_fleet\build\app\outputs\flutter-apk\app-release.apk`
**Backend URL**: `https://abra-fleet-management.com/api`
**Firebase Project**: `abrafleet-cec94`

**Full Guide**: See `APK_INSTALLATION_AND_TESTING_GUIDE.md`

---

**Status**: ✅ READY TO TEST
**Date**: December 17, 2025
**Version**: 1.0.0+1
