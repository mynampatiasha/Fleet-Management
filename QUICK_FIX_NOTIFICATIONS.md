# ⚡ Quick Fix: Enable Notifications for Test Rosters

## 🎯 Problem
Route assignment shows "0 customers notified" because imported roster customers don't have user accounts.

## ✅ Solution (5 Minutes)

### Step 1: Create Test Users
```bash
cd abra_fleet_backend
node create-test-customers.js
```

**Expected Output:**
```
✅ Created: 3
   - Pooja Joshi (pooja.joshi@wipro.com)
   - Arjun Nair (arjun.nair@wipro.com)
   - Sneha Iyer (sneha.iyer@wipro.com)

🔑 Temporary Password: Welcome@123
```

### Step 2: Test Login (Optional)
Open Flutter app and log in with:
- Email: `pooja.joshi@wipro.com`
- Password: `Welcome@123`

FCM token will register automatically on login.

### Step 3: Re-Run Route Optimization
1. Go to Admin → Pending Rosters
2. Select the same 3 rosters
3. Click "Optimize Route"
4. Assign to vehicle
5. ✅ Notifications will work now!

---

## 🔍 Verify It Worked

### Check Users Created
```javascript
// MongoDB
db.users.find({ 
  email: { $in: [
    "pooja.joshi@wipro.com",
    "arjun.nair@wipro.com", 
    "sneha.iyer@wipro.com"
  ]}
})
```

### Check Notifications
```javascript
// Firestore
db.collection('notifications')
  .where('type', '==', 'route_assignment')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
```

---

## 📊 What the Script Does

1. **Creates Firebase Auth Users**
   - Email: From roster data
   - Password: Welcome@123 (temporary)
   - Display Name: From roster data

2. **Creates MongoDB User Documents**
   - Links to Firebase UID
   - Sets role: 'customer'
   - Sets organization from roster

3. **Links Rosters to Users**
   - Updates roster documents with user IDs
   - Enables notification delivery

4. **Generates Password Reset Links**
   - Users can reset password on first login
   - Links printed in console

---

## 🎯 Expected Results

**Before:**
```
📊 Results:
- Customers assigned: 3 ✅
- Customer notifications: 0 ❌
- Driver notifications: 0 ❌
```

**After:**
```
📊 Results:
- Customers assigned: 3 ✅
- Customer notifications: 3 ✅
- Driver notifications: 1 ✅
```

---

## 🚨 Troubleshooting

### Script Fails with "Firebase not initialized"
```bash
# Check if firebase-service-account.json exists
ls abra_fleet_backend/config/firebase-service-account.json

# If missing, download from Firebase Console:
# Project Settings → Service Accounts → Generate New Private Key
```

### Script Fails with "MongoDB connection error"
```bash
# Check if MongoDB is running
# Check .env file has correct MONGODB_URI
```

### Users Created but Notifications Still Show 0
```bash
# Restart backend to clear any cached data
# Re-run route optimization (don't use old assignments)
```

---

## 💡 Why This Happened

**Roster Import Flow:**
```
CSV Import → Create Rosters ✅
           → Create Users ❌ (missing!)
```

**Should Be:**
```
CSV Import → Create Rosters ✅
           → Create Users ✅
           → Send Welcome Emails ✅
```

**Long-term fix:** Implement auto-user-creation in roster import endpoint.

---

## 📝 Summary

**Root Cause:** Roster import doesn't create user accounts
**Quick Fix:** Run `create-test-customers.js` script
**Long-term Fix:** Update roster import to auto-create users
**Time to Fix:** 5 minutes
**Impact:** Notifications will work immediately ✅
