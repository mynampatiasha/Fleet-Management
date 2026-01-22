# Firebase to JWT Migration - Compilation Errors Summary

## 🎯 Quick Start

You have **compilation errors** after migrating from Firebase to JWT authentication. Here's how to fix them:

### Option 1: Automated Helper (Recommended)
```bash
apply-quick-fixes.bat
```

This creates helper files and shows you exactly what to fix.

### Option 2: Manual Fixes
Follow the patterns in this document.

---

## 📊 Error Statistics

- **Total Files with Errors:** 15
- **Total Error Count:** ~150+
- **Main Error Types:** 7

---

## 🔴 Critical Errors & Fixes

### Error 1: Duplicate Variable Declarations (Most Common)

**Count:** ~30 occurrences

**Error Message:**
```
'prefs' is already declared in this scope
'token' is already declared in this scope
```

**Files Affected:**
- driver_dashboard_screen.dart (lines 334, 420)
- client_main_shell.dart (line 112)
- client_employee_management.dart (line 82)
- user_management_screen.dart (multiple)

**Fix:**
```dart
// ❌ WRONG - Duplicate declarations
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final prefs = await SharedPreferences.getInstance();  // ERROR!
final token = prefs.getString('jwt_token');           // ERROR!

// ✅ CORRECT - Single declaration
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final userDataString = prefs.getString('user_data');
final userData = userDataString != null ? jsonDecode(userDataString) : null;
```

---

### Error 2: Missing Getters (user, token, currentUser)

**Count:** ~50 occurrences

**Error Message:**
```
The getter 'user' isn't defined for the type '_DriverDashboardScreenState'
The getter 'token' isn't defined for the type '_ClientDashboardState'
The getter 'currentUser' isn't defined for the type '_NotificationsScreenState'
```

**Files Affected:**
- driver_dashboard_screen.dart
- client_dashboard.dart
- client_employee_management.dart
- notifications_screen.dart
- All files referencing Firebase auth

**Fix - Add Class Variables:**
```dart
class _YourState extends State<YourWidget> {
  String? _token;
  String? _userId;
  String? _userEmail;
  Map<String, dynamic>? _userData;
  
  @override
  void initState() {
    super.initState();
    _loadUserData();
  }
  
  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final userDataString = prefs.getString('user_data');
    final userData = userDataString != null ? jsonDecode(userDataString) : null;
    
    setState(() {
      _token = token;
      _userId = userData?['id'];
      _userEmail = userData?['email'];
      _userData = userData;
    });
  }
}
```

**Replace References:**
```dart
// OLD → NEW
user.uid → _userId or userData?['id']
user.email → _userEmail or userData?['email']
user.displayName → userData?['name']
currentUser.uid → _userId
token → _token
```

---

### Error 3: Missing async Keyword

**Count:** ~10 occurrences

**Error Message:**
```
'await' can only be used in 'async' or 'async*' methods
```

**Files Affected:**
- driver_dashboard_screen.dart (_listenForSOSHistory)
- Multiple service files

**Fix:**
```dart
// ❌ WRONG
void _someMethod() {
  final prefs = await SharedPreferences.getInstance();
}

// ✅ CORRECT
Future<void> _someMethod() async {
  final prefs = await SharedPreferences.getInstance();
}
```

---

### Error 4: Missing jsonDecode Import

**Count:** ~8 occurrences

**Error Message:**
```
The method 'jsonDecode' isn't defined for the type '_NotificationsScreenState'
```

**Files Affected:**
- notifications_screen.dart
- profile_driver_page.dart
- Several other files

**Fix:**
Add at top of file:
```dart
import 'dart:convert';
```

---

### Error 5: MultipartFile Constructor Errors

**Count:** 4 occurrences

**Error Message:**
```
Too few positional arguments: 2 required, 1 given
```

**Files Affected:**
- profile_driver_page.dart (lines 2065, 2074)

**Fix:**
```dart
// ❌ WRONG
http.MultipartFile.fromBytes(
  'profileImage',
  imageBytes,
),

// ✅ CORRECT
http.MultipartFile.fromBytes(
  'profileImage',
  imageBytes,
  filename: 'profile.jpg',
),

// For fromPath:
await http.MultipartFile.fromPath(
  'profileImage',
  imagePath,
  filename: 'profile.jpg',
),
```

---

### Error 6: Try Block Without Catch

**Count:** 2 occurrences

**Error Message:**
```
A try block must be followed by an 'on', 'catch', or 'finally' clause
```

**Files Affected:**
- profile_driver_page.dart (line 2045)

**Fix:**
```dart
// ❌ WRONG
try {
  final response = await request.send();
}
// Missing catch!

// ✅ CORRECT
try {
  final response = await request.send();
} catch (e) {
  debugPrint('Error: $e');
  rethrow;
}
```

---

### Error 7: Firebase Error Object References

**Count:** 4 occurrences

**Error Message:**
```
The getter 'code' isn't defined for the type 'Object'
The getter 'message' isn't defined for the type 'Object'
```

**Files Affected:**
- client_admin_dashboard_screen.dart (line 1039)

**Fix:**
```dart
// ❌ WRONG
catch (e) {
  if (e.code == 'email-already-in-use') {
    // ...
  }
}

// ✅ CORRECT
catch (e) {
  if ((e as dynamic).code == 'email-already-in-use') {
    // ...
  }
  final message = (e as dynamic).message ?? 'Unknown error';
}
```

---

## 📁 File-by-File Fix Priority

### Priority 1 (Critical - Fix First)
1. **driver_dashboard_screen.dart** - 20+ errors
   - Duplicate declarations (lines 334, 420)
   - Missing user/token getters
   - Missing async on _listenForSOSHistory

2. **profile_driver_page.dart** - 30+ errors
   - Duplicate declarations
   - MultipartFile errors
   - Missing try-catch
   - Missing imports

3. **notifications_screen.dart** - 15+ errors
   - Missing jsonDecode import
   - Missing currentUser getter
   - Need to add _loadUserId method

### Priority 2 (Important)
4. **client_main_shell.dart** - 10+ errors
5. **client_dashboard.dart** - 8+ errors
6. **client_employee_management.dart** - 12+ errors
7. **client_sos_alerts.dart** - 6+ errors
8. **client_profile_screen.dart** - 8+ errors

### Priority 3 (Services)
9. **trip_notification_service.dart** - 4+ errors
10. **start_new_trip.dart** - 2+ errors
11. **driver_admin_management_screen.dart** - 12+ errors
12. **resolved_alerts_view.dart** - 4+ errors
13. **client_admin_dashboard_screen.dart** - 8+ errors
14. **user_management_screen.dart** - 8+ errors
15. **my_tickets.dart** - 2+ errors

---

## 🛠️ Step-by-Step Fix Process

### Step 1: Add Missing Imports
Run through each file and add:
```dart
import 'dart:convert';  // If using jsonDecode
import 'package:shared_preferences/shared_preferences.dart';  // If using SharedPreferences
```

### Step 2: Fix Duplicate Declarations
Search for: `final prefs = await SharedPreferences.getInstance();`
- If it appears twice in the same method, remove the second occurrence
- Keep only one declaration at the top of the method

### Step 3: Add Class-Level Variables
For each State class that needs user data:
```dart
class _YourState extends State<YourWidget> {
  String? _token;
  Map<String, dynamic>? _userData;
  
  @override
  void initState() {
    super.initState();
    _loadUserData();
  }
  
  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      _userData = userDataString != null ? jsonDecode(userDataString) : null;
    });
  }
}
```

### Step 4: Replace Firebase References
Use Find & Replace:
- `user.uid` → `_userData?['id']`
- `user.email` → `_userData?['email']`
- `user.displayName` → `_userData?['name']`
- `currentUser.uid` → `_userId`
- `token` → `_token` (where appropriate)

### Step 5: Add async Keywords
For any method using `await`, ensure it's marked `async`:
```dart
Future<void> methodName() async {
  // ...
}
```

### Step 6: Fix MultipartFile Calls
Add `filename` parameter to all MultipartFile constructors.

### Step 7: Add try-catch Blocks
Ensure all try blocks have corresponding catch blocks.

---

## ✅ Verification Checklist

After fixes:

- [ ] Run `flutter analyze` - should show 0 errors
- [ ] Run `flutter run` - app should compile
- [ ] Test login - should work with JWT
- [ ] Test API calls - should include Authorization header
- [ ] Test user profile - should load from SharedPreferences
- [ ] Test notifications - should work
- [ ] Test SOS alerts - should work

---

## 📚 Additional Resources

- **QUICK_FIX_GUIDE.md** - Fast reference guide
- **FIREBASE_TO_JWT_ERROR_FIXES.md** - Detailed explanations
- **jwt_auth_helpers.dart** - Helper functions (created by apply-quick-fixes.bat)

---

## 🆘 Still Stuck?

1. Run `apply-quick-fixes.bat` to create helper files
2. Check FIREBASE_TO_JWT_ERROR_FIXES.md for your specific error
3. Use the search patterns above to find and fix issues
4. Run `flutter analyze` after each fix to track progress

---

## 📈 Progress Tracking

Track your fixes:
```
Priority 1 Files (3):
[ ] driver_dashboard_screen.dart
[ ] profile_driver_page.dart
[ ] notifications_screen.dart

Priority 2 Files (5):
[ ] client_main_shell.dart
[ ] client_dashboard.dart
[ ] client_employee_management.dart
[ ] client_sos_alerts.dart
[ ] client_profile_screen.dart

Priority 3 Files (7):
[ ] trip_notification_service.dart
[ ] start_new_trip.dart
[ ] driver_admin_management_screen.dart
[ ] resolved_alerts_view.dart
[ ] client_admin_dashboard_screen.dart
[ ] user_management_screen.dart
[ ] my_tickets.dart
```

---

**Good luck! The errors look overwhelming but they're all variations of the same 7 patterns. Fix them systematically and you'll be done quickly!** 🚀
