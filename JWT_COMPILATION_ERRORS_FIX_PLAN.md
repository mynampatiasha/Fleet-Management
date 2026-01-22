# JWT Compilation Errors - Comprehensive Fix Plan

## Overview
The compilation errors are due to incomplete JWT migration where Firebase Auth references haven't been properly replaced with JWT token retrieval from SharedPreferences.

## Common Pattern for JWT Token Retrieval

```dart
// At the start of any async method that needs authentication:
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final userDataString = prefs.getString('user_data');
final userData = userDataString != null ? jsonDecode(userDataString) : null;
final userId = userData?['id'];
final userEmail = userData?['email'];
final userName = userData?['name'];

if (token == null || token.isEmpty) {
  // Handle no authentication
  return;
}
```

## Files Requiring Fixes

### 1. ✅ customer_dashboard.dart - FIXED
- Added `_userId` and `_userEmail` state variables
- Fixed `_loadUserData()` method to use JWT
- Fixed `customerId: user.uid` → `customerId: _userId ?? ''`

### 2. client_dashboard.dart
**Errors:**
- `currentUser` getter not defined
- `token` getter not defined
- `user` getter not defined

**Fix:** Add JWT retrieval in initState and relevant methods

### 3. client_employee_management.dart
**Errors:**
- Duplicate `prefs` and `token` declarations
- `userId` getter not defined
- `currentUser` getter not defined

**Fix:** Remove duplicates, add proper JWT retrieval

### 4. client_sos_alerts.dart
**Errors:**
- `emailParts` getter not defined
- `token` getter not defined

**Fix:** Add JWT retrieval to get userEmail, then split to get emailParts

### 5. client_profile_screen.dart
**Errors:**
- Duplicate `phoneNumber:` field
- `token` and `userId` getters not defined

**Fix:** Remove duplicate, add JWT retrieval

### 6. trip_notification_service.dart
**Errors:**
- `token` getter not defined in class

**Fix:** Add JWT retrieval in methods that need it

### 7. start_new_trip.dart
**Errors:**
- `user` getter not defined

**Fix:** Replace `user.email` with JWT-retrieved userEmail

### 8. driver_admin_management_screen.dart
**Errors:**
- `token` getter not defined (multiple occurrences)

**Fix:** Ensure JWT retrieval is at method start, not inline

### 9. resolved_alerts_view.dart
**Errors:**
- `token` getter not defined

**Fix:** Add JWT retrieval

### 10. client_admin_dashboard_screen.dart
**Errors:**
- `token` getter not defined
- Firebase error handling (`e.code`, `e.message`)

**Fix:** Add JWT retrieval and proper Firebase exception handling

### 11. user_management_screen.dart
**Errors:**
- `token` getter not defined in two classes

**Fix:** Add JWT retrieval in both state classes

### 12. my_tickets.dart
**Errors:**
- `user` getter not defined

**Fix:** Replace `user.email` with JWT-retrieved userEmail

### 13. profile_driver_page.dart (MOST ERRORS)
**Errors:**
- `DocumentSnapshot` type not imported
- `token`, `prefs`, `FirebaseFirestore`, `FieldValue` getters not defined
- Multiple methods need JWT retrieval

**Fix:** 
- Add proper imports
- Add state variables for token, prefs
- Replace all Firestore operations with backend API calls
- Add JWT retrieval in all methods

## Implementation Strategy

1. **Phase 1:** Fix simple getter errors (add JWT retrieval)
2. **Phase 2:** Fix duplicate declarations
3. **Phase 3:** Fix Firebase-specific errors (DocumentSnapshot, FieldValue, etc.)
4. **Phase 4:** Test compilation

## Next Steps

Run fixes file by file, starting with the simplest ones and moving to complex ones like profile_driver_page.dart.
