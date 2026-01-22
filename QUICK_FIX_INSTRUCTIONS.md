# Quick Fix Instructions for JWT Compilation Errors

## Summary
All compilation errors are due to incomplete JWT migration. The system was migrated from Firebase Auth to JWT, but many files still reference Firebase Auth variables like `user`, `currentUser`, `token` (as getters) instead of retrieving them from SharedPreferences.

## What Was Fixed
✅ `customer_dashboard.dart` - Added `_userId` and `_userEmail` state variables, fixed `_loadUserData()` method

## What Still Needs Fixing

### Quick Pattern to Apply to ALL Files

**Before (Firebase Auth):**
```dart
if (token != null) {  // token as undefined getter
  final token = await user.getIdToken();  // user undefined
}
```

**After (JWT):**
```dart
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final userDataString = prefs.getString('user_data');
final userData = userDataString != null ? jsonDecode(userDataString) : null;
final userId = userData?['id'];
final userEmail = userData?['email'];

if (token != null && token.isNotEmpty) {
  // Use token
}
```

## Files to Fix (in order of priority)

1. **profile_driver_page.dart** (Most errors - 40+ errors)
   - Remove all Firebase Firestore references
   - Add JWT retrieval to all methods
   - Replace Firestore operations with backend API calls

2. **client_dashboard.dart, client_employee_management.dart, client_sos_alerts.dart, client_profile_screen.dart**
   - Add JWT retrieval
   - Replace `currentUser`, `user`, `token` getters with local variables

3. **driver_admin_management_screen.dart**
   - Already has some JWT code, just needs to ensure token is retrieved at method start

4. **Other admin screens** (resolved_alerts_view.dart, client_admin_dashboard_screen.dart, user_management_screen.dart)
   - Add JWT retrieval pattern

5. **Services** (trip_notification_service.dart)
   - Add JWT retrieval in methods

## Recommended Approach

Since there are 100+ errors across 13 files, the fastest approach is:

1. **Use Find & Replace in VS Code/IDE:**
   - Find: `if \(token`
   - Check each occurrence and add JWT retrieval before it

2. **For each file:**
   - Add imports if missing:
     ```dart
     import 'package:shared_preferences/shared_preferences.dart';
     import 'dart:convert';
     ```
   
   - At the start of each async method that uses `token`, `userId`, or `userEmail`, add:
     ```dart
     final prefs = await SharedPreferences.getInstance();
     final token = prefs.getString('jwt_token');
     final userDataString = prefs.getString('user_data');
     final userData = userDataString != null ? jsonDecode(userDataString) : null;
     final userId = userData?['id'];
     final userEmail = userData?['email'];
     ```

3. **Replace all occurrences:**
   - `user.uid` → `userId ?? ''`
   - `user.email` → `userEmail`
   - `currentUser.email` → `userEmail`
   - `currentUser.uid` → `userId`

4. **For profile_driver_page.dart specifically:**
   - This file needs major refactoring as it still uses Firestore directly
   - All Firestore operations should be replaced with backend API calls
   - Consider creating a separate `driver_profile_service.dart` to handle API calls

## Testing After Fixes

```bash
cd abra_fleet
flutter clean
flutter pub get
flutter analyze
```

If errors persist, run:
```bash
flutter pub run build_runner clean
flutter pub run build_runner build --delete-conflicting-outputs
```

## Alternative: Automated Fix

If manual fixing is too time-consuming, I can create individual strReplace commands for each file. However, given the volume (100+ errors), it would be more efficient to:

1. Fix 2-3 files manually to establish the pattern
2. Use IDE's find/replace with regex for the rest
3. Test compilation incrementally

Would you like me to:
A) Create individual strReplace commands for each file (will take many commands)
B) Provide a detailed file-by-file fix guide
C) Focus on fixing the most critical file (profile_driver_page.dart) first
