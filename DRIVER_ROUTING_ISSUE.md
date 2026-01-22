# Driver Routing Issue 🔄

## Problem
User logs in with driver credentials (`drivertest@gmail.com` / `drivertest`) but is being routed to the **Customer Dashboard** instead of the **Driver Dashboard**.

## Verification Results

### Backend Configuration ✅
All backend data is correctly configured:

**Firebase Auth:**
- Email: drivertest@gmail.com
- UID: wvm5wdXaWNOAqVOXX5l8fWbfYFz2
- Custom Claims: `{ role: "driver", driverId: "DRV-852306" }`
- Role: **driver** ✅

**MongoDB `users` Collection:**
- Email: drivertest@gmail.com
- Role: **driver** ✅
- Driver ID: DRV-852306

**MongoDB `drivers` Collection:**
- Driver ID: DRV-852306
- Email: drivertest@gmail.com
- Status: active
- Record exists: **YES** ✅

### Root Cause
The issue is in the **frontend routing logic**. The app is not correctly reading the user's role from Firebase custom claims or the backend API and routing them to the appropriate dashboard.

## Expected Behavior
When a user with role `driver` logs in, they should be routed to:
- **Driver Dashboard** (`/driver/dashboard`)

## Current Behavior
User is being routed to:
- **Customer Dashboard** (incorrect)

## Solution Required

The frontend needs to check the user's role after login and route accordingly:

### 1. Check Role After Login
After successful Firebase authentication, the app should:
1. Get the user's Firebase ID token
2. Decode the custom claims to get the `role` field
3. OR make an API call to get user data from backend

### 2. Route Based on Role
```dart
if (role == 'driver') {
  // Navigate to Driver Dashboard
  Navigator.pushReplacementNamed(context, '/driver/dashboard');
} else if (role == 'customer') {
  // Navigate to Customer Dashboard
  Navigator.pushReplacementNamed(context, '/customer/dashboard');
} else if (role == 'admin') {
  // Navigate to Admin Dashboard
  Navigator.pushReplacementNamed(context, '/admin/dashboard');
} else if (role == 'client') {
  // Navigate to Client Dashboard
  Navigator.pushReplacementNamed(context, '/client/dashboard');
}
```

### 3. Files to Check

**Authentication Repository:**
- `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart`
  - Check how user role is retrieved after login
  - Ensure custom claims are being read

**Main App Routing:**
- `abra_fleet/lib/main.dart`
  - Check initial route logic
  - Ensure role-based routing is implemented

**Login Screen:**
- `abra_fleet/lib/features/auth/presentation/screens/login_screen.dart` (if exists)
  - Check navigation logic after successful login

## Temporary Workaround

Until the routing is fixed, the driver can:
1. Log in (even if routed to wrong dashboard)
2. Manually navigate to the driver dashboard URL
3. Or log out and log in again (sometimes helps)

## Testing After Fix

1. Log in with driver credentials:
   - Email: `drivertest@gmail.com`
   - Password: `drivertest`

2. Verify you land on **Driver Dashboard** with:
   - Driver name: Rajesh Kumar
   - Driver ID: DRV-852306
   - Assigned vehicle: VH143864
   - Route details visible
   - Trip management options

## Related Files
- `abra_fleet_backend/verify-drivertest-role.js` - Role verification script
- `DRIVER_TEST_LOGIN_CREDENTIALS.md` - Login credentials
- `abra_fleet/lib/features/auth/data/repositories/firebase_auth_repository_impl.dart` - Auth logic
- `abra_fleet/lib/main.dart` - App routing

## Notes
- Backend is 100% correct
- Issue is purely frontend routing
- All three roles (driver, customer, admin) need proper routing logic
- Firebase custom claims contain the role information
