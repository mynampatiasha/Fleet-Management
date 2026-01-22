# 🧪 How to Test Driver Dashboard - Quick Guide

## ✅ Backend Status
Backend is already running on port 3000 (Process ID: 20088)
- All latest changes are active
- Distance calculation completed
- Route API updated

## 🔐 Login Credentials
- **Email**: `drivertest@gmail.com`
- **Password**: `drivertest`
- **Driver ID**: DRV-852306
- **Vehicle**: KA01AB1240 (Tata Starbus Urban)

## 📋 What to Check

### 1. Today's Route Section
**Expected**:
- ✅ Vehicle card showing "KA01AB1240"
- ✅ Model: "Starbus Urban"
- ✅ Route summary: 3 Customers, 27.6 KM total
- ✅ 3 customer cards with sequence badges

### 2. Customer Cards
**Expected for each customer**:
```
#1 Rajesh Kumar
   📍 Electronic City, Bangalore → Infosys Campus
   🕐 08:00  📏 0 KM
   [Mark Picked] [📞]

#2 Priya Sharma
   📍 Whitefield, Bangalore → Infosys Campus
   🕐 08:00  📏 16.9 KM
   [Mark Picked] [📞]

#3 Amit Patel
   📍 Koramangala, Bangalore → Infosys Campus
   🕐 08:00  📏 10.7 KM
   [Mark Picked] [📞]
```

### 3. Vehicle Status & Check Section
**Expected**:
- ✅ Shows "ASSIGNED VEHICLE"
- ✅ Registration: "KA01AB1240"
- ✅ Status badge: "ACTIVE"
- ✅ Model: "Tata Starbus Urban"
- ✅ Capacity: 40

### 4. Debug Logs (Flutter DevTools Console)
**Expected logs**:
```
🏗️ [Dashboard Build] State:
   _todayRoute: true
   _todayRoute.hasRoute: true
   _todayRoute.vehicle: KA01AB1240
   _todayRoute.customers: 3
   _vehicleCheckData: false (or true)
   _vehicleCheckData.vehicleAssigned: false (or true)
```

## 🎯 Test Steps

### Step 1: Open Flutter App
```bash
# If not already running
cd abra_fleet
flutter run -d chrome
```

### Step 2: Login
1. Enter email: `drivertest@gmail.com`
2. Enter password: `drivertest`
3. Click "Login"
4. Should navigate to Driver Dashboard

### Step 3: Verify Dashboard
1. **Check "Today's Route" card**:
   - Should see vehicle KA01AB1240
   - Should see 3 customers with #1, #2, #3 badges
   - Should see distances: 0 KM, 16.9 KM, 10.7 KM

2. **Check "Vehicle Status & Check" card**:
   - Should show same vehicle (KA01AB1240)
   - Should show vehicle details

3. **Check Debug Logs**:
   - Open Flutter DevTools (F12 or Ctrl+Shift+I)
   - Go to Console tab
   - Look for "🏗️ [Dashboard Build]" logs
   - Verify all values are correct

### Step 4: Test Interactions
1. **Call Customer**: Click phone icon on any customer card
2. **Mark Picked**: Click "Mark Picked" button
3. **Refresh**: Pull down to refresh or click refresh icon

## 🐛 If Something Doesn't Work

### Issue: Vehicle not showing
**Check**:
1. Debug logs show `_todayRoute.vehicle: null`?
2. Backend logs show vehicle found?
3. Try refreshing the dashboard

### Issue: Distance still shows 0 KM
**Check**:
1. Was `calculate-roster-distances.js` run successfully?
2. Check backend logs for distance calculation
3. Verify rosters have `pickupLatitude/pickupLongitude` fields

### Issue: No sequence numbers
**Check**:
1. Are customer cards showing at all?
2. Check Flutter console for errors
3. Try hot reload (press 'r' in terminal)

## 📊 Expected Results Summary

| Feature | Status | Expected Value |
|---------|--------|----------------|
| Vehicle Display | ✅ | KA01AB1240 |
| Customer Count | ✅ | 3 |
| Sequence Numbers | ✅ | #1, #2, #3 |
| Distances | ✅ | 0, 16.9, 10.7 KM |
| Total Distance | ✅ | 27.6 KM |
| Vehicle in Both Sections | ✅ | Yes |

## 🎉 Success Criteria

All of these should be true:
- [ ] Vehicle KA01AB1240 displays in "Today's Route"
- [ ] Vehicle KA01AB1240 displays in "Vehicle Status & Check"
- [ ] 3 customers show with #1, #2, #3 badges
- [ ] Distances show: 0 KM, 16.9 KM, 10.7 KM
- [ ] Total distance shows 27.6 KM
- [ ] No errors in console
- [ ] Can interact with customer cards (call, mark picked)

---

**Status**: Ready to test
**Backend**: Running on port 3000
**Frontend**: Ready to run
**Data**: 3 rosters with calculated distances
