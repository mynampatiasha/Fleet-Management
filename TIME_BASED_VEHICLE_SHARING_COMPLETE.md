# ✅ Time-Based Vehicle Sharing Implementation

## 🎯 New Business Rule

**OLD RULE (Too Strict):**
- Vehicle assigned to Company A → Can ONLY carry Company A employees forever
- Even after trip ends, vehicle stays "locked" to Company A

**NEW RULE (Time-Based Sharing):**
- **Morning Shift:** Vehicle carries Company A employees (login 8:30 AM)
  - Picks up at 7:30 AM → Drops at office by 8:10 AM → **Trip ends, vehicle FREE**
- **After 8:30 AM:** Vehicle is FREE → Can be assigned to Company B, C, D, etc.
- **Evening Shift:** Vehicle picks up Company A again (logout 5:30 PM)
  - Picks up at 5:20 PM → Drops customers → **Trip ends, vehicle FREE**
- **After evening trip:** Vehicle is FREE again → Can serve other companies

## 📋 Business Logic

**A vehicle can carry different companies IF:**
1. ✅ Different time slots (no overlap)
2. ✅ Previous trip has completed
3. ✅ Same email domain employees travel together in SAME trip
4. ❌ Cannot mix companies in SAME trip

## 🔧 Implementation

### 1. Frontend: `route_optimization_service.dart`

**Added Time-Based Compatibility Check:**
```dart
// Check if same organization
if (vehicleOrg.toString().trim() == newCustomerOrg.trim()) {
  debugPrint('✅ Same organization');
} else {
  // Different organizations - check if time slots conflict
  final timeConflict = _checkTimeConflict(
    vehicleTripTime?.toString() ?? '',
    vehicleTripType?.toString() ?? '',
    newTripTime,
    newTripType,
  );
  
  if (timeConflict) {
    // REJECT: Same time slot, different companies
  } else {
    // ALLOW: Different time slots, can share vehicle
  }
}
```

**Added `_checkTimeConflict()` Method:**
- Compares trip times and types
- LOGIN trips: Morning (6:00 AM - 11:00 AM)
- LOGOUT trips: Evening (4:00 PM - 10:00 PM)
- Allows 2-hour buffer between same-type trips
- LOGIN + LOGOUT = No conflict (different parts of day)

### 2. Backend: `route_optimization_router.js`

**Added Time-Based Tracking Fields:**
```javascript
$set: {
  // Time-based vehicle sharing fields
  assignedCustomerOrganization: vehicleOrganization,
  assignedTripTime: vehicleLoginTime || vehicleLogoutTime,
  assignedTripType: vehicleRosterType, // 'login' or 'logout'
  
  // Legacy fields (backward compatibility)
  currentOrganization: vehicleOrganization,
  currentLoginTime: vehicleLoginTime,
  currentLogoutTime: vehicleLogoutTime,
  currentRosterType: vehicleRosterType,
}
```

## 📊 Example Scenarios

### Scenario 1: Same Company, Same Time
```
Vehicle: KA01AB1234
Current: Infosys @ 8:30 AM (LOGIN)
New Request: Infosys @ 8:30 AM (LOGIN)
Result: ✅ ALLOWED (same company)
```

### Scenario 2: Different Company, Same Time
```
Vehicle: KA01AB1234
Current: Infosys @ 8:30 AM (LOGIN)
New Request: Wipro @ 8:45 AM (LOGIN)
Result: ❌ REJECTED (time conflict: 15 min apart, need 2 hour buffer)
```

### Scenario 3: Different Company, Different Time
```
Vehicle: KA01AB1234
Current: Infosys @ 8:30 AM (LOGIN)
New Request: Wipro @ 2:00 PM (LOGOUT)
Result: ✅ ALLOWED (different time slots: morning vs evening)
```

### Scenario 4: Different Company, Well-Separated Times
```
Vehicle: KA01AB1234
Current: Infosys @ 8:30 AM (LOGIN)
New Request: TCS @ 11:00 AM (LOGIN)
Result: ✅ ALLOWED (2.5 hours apart, no conflict)
```

## 🕐 Time Conflict Rules

### LOGIN Trips (Morning)
- Typical time: 6:00 AM - 11:00 AM
- Buffer: 2 hours between different companies
- Example: If Infosys at 8:30 AM, Wipro can use vehicle after 10:30 AM

### LOGOUT Trips (Evening)
- Typical time: 4:00 PM - 10:00 PM
- Buffer: 2 hours between different companies
- Example: If Infosys at 5:30 PM, TCS can use vehicle after 7:30 PM

### LOGIN + LOGOUT (No Conflict)
- Morning LOGIN and Evening LOGOUT never conflict
- Vehicle can serve Company A (morning) and Company B (evening) same day

## 📝 Files Modified

1. ✅ `abra_fleet/lib/core/services/route_optimization_service.dart`
   - Updated organization compatibility check
   - Added `_checkTimeConflict()` method
   - Added time-based sharing logic

2. ✅ `abra_fleet_backend/routes/route_optimization_router.js`
   - Added `assignedCustomerOrganization` field
   - Added `assignedTripTime` field
   - Added `assignedTripType` field

## 🎯 Benefits

1. **Better Vehicle Utilization**
   - Same vehicle serves multiple companies per day
   - Reduces idle time between shifts
   - Maximizes fleet efficiency

2. **Cost Savings**
   - Fewer vehicles needed overall
   - Better ROI on vehicle fleet
   - Reduced operational costs

3. **Flexibility**
   - Companies can share vehicles at different times
   - No artificial restrictions
   - Still maintains organization segregation during trips

## ⚠️ Important Notes

### What's Still Enforced:
- ✅ Same trip = same company ONLY
- ✅ Cannot mix employees from different companies in same trip
- ✅ Email domain segregation within trips

### What's Now Flexible:
- ✅ Different time slots = different companies OK
- ✅ Morning and evening can be different companies
- ✅ Vehicle can serve multiple companies per day

## 🧪 Testing

To test time-based sharing:

1. **Morning Trip (Company A)**
   - Assign Infosys employees at 8:30 AM LOGIN
   - Vehicle gets marked: `assignedTripTime: "08:30"`, `assignedTripType: "login"`

2. **Try Same Time (Company B)**
   - Try to assign Wipro employees at 8:45 AM LOGIN
   - Should be REJECTED (time conflict: only 15 min apart)

3. **Try Different Time (Company B)**
   - Try to assign Wipro employees at 2:00 PM LOGOUT
   - Should be ALLOWED (different time slot: morning vs evening)

4. **Try Well-Separated Time (Company C)**
   - Try to assign TCS employees at 11:00 AM LOGIN
   - Should be ALLOWED (2.5 hours apart, no conflict)

## ✅ Status

Implementation complete! Time-based vehicle sharing is now active.

**Remember:** 
- Same trip = same company only
- Different times = different companies OK
- 2-hour buffer for same trip type (LOGIN or LOGOUT)
