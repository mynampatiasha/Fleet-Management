# Firebase to JWT Migration - Compilation Error Fixes

## Overview
After migrating from Firebase Authentication to JWT-based authentication, you're encountering compilation errors because the code still references Firebase-specific objects like `user`, `currentUser`, `token`, etc.

## Quick Fix (Automated)

Run the automated fix script:

```bash
fix-all-errors.bat
```

This will:
1. Apply all automated fixes
2. Clean the Flutter project
3. Get dependencies
4. Run Flutter analyze

## Common Error Patterns & Solutions

### 1. **Duplicate Variable Declarations**

**Error:**
```
'prefs' is already declared in this scope
'token' is already declared in this scope
```

**Cause:** Multiple `final prefs = await SharedPreferences.getInstance();` in the same method

**Fix:**
```dart
// ❌ WRONG
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final prefs = await SharedPreferences.getInstance();  // Duplicate!
final token = prefs.getString('jwt_token');           // Duplicate!

// ✅ CORRECT
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
```

### 2. **Missing `user`, `token`, `currentUser` Getters**

**Error:**
```
The getter 'user' isn't defined for the type '_SomeState'
The getter 'token' isn't defined for the type '_SomeState'
The getter 'currentUser' isn't defined for the type '_SomeState'
```

**Cause:** Code references Firebase auth objects that no longer exist

**Fix:** Add class-level variables and load from SharedPreferences

```dart
class _SomeState extends State<SomeWidget> {
  String? _token;
  String? _userId;
  String? _userEmail;
  
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
    });
  }
  
  // Now use _token, _userId, _userEmail instead of user.uid, user.email, etc.
}
```

### 3. **Missing `async` Keyword**

**Error:**
```
'await' can only be used in 'async' or 'async*' methods
```

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

### 4. **Missing `jsonDecode` Import**

**Error:**
```
The method 'jsonDecode' isn't defined for the type '_SomeState'
```

**Fix:** Add import at top of file
```dart
import 'dart:convert';
```

### 5. **MultipartFile Constructor Errors**

**Error:**
```
Too few positional arguments: 2 required, 1 given
```

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

### 6. **Try Block Without Catch**

**Error:**
```
A try block must be followed by an 'on', 'catch', or 'finally' clause
```

**Fix:**
```dart
// ❌ WRONG
try {
  final response = await request.send();
}

// ✅ CORRECT
try {
  final response = await request.send();
} catch (e) {
  debugPrint('Error: $e');
  rethrow;
}
```

### 7. **Firebase Error Object References**

**Error:**
```
The getter 'code' isn't defined for the type 'Object'
The getter 'message' isn't defined for the type 'Object'
```

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
}
```

## File-Specific Fixes

### driver_dashboard_screen.dart
- Remove duplicate `prefs`/`token` declarations in `_triggerSOS()`
- Make `_listenForSOSHistory()` async
- Replace `user.uid`, `user.email`, `user.displayName` with userData map access

### client_main_shell.dart
- Remove duplicate declarations
- Replace `currentUser.uid` with `userId` from SharedPreferences

### notifications_screen.dart
- Add `import 'dart:convert';`
- Replace all `currentUser` references with `userId` class variable
- Add `_loadUserId()` method in `initState()`

### client_dashboard.dart
- Replace `currentUser?.email` with `userEmail` class variable
- Replace `token` references with `_token` class variable
- Replace `user.getIdToken()` with `_token`

### client_employee_management.dart
- Fix duplicate declarations
- Replace `token`, `userId`, `currentUser` with class variables

### client_sos_alerts.dart
- Replace `emailParts` with `_emailParts` class variable
- Replace `token` with `_token` class variable

### client_profile_screen.dart
- Fix duplicate `phoneNumber:` in object literal
- Replace `token`, `userId` with class variables

### trip_notification_service.dart
- Add `_getToken()` helper method
- Replace direct `token` references with method call

### profile_driver_page.dart (Most Complex)
- Add `import 'dart:convert';`
- Fix MultipartFile constructors
- Add try-catch blocks
- Replace `token`, `prefs`, `response` with class variables

## Manual Verification Steps

After running the automated fixes:

1. **Check for remaining errors:**
   ```bash
   cd abra_fleet
   flutter analyze
   ```

2. **Look for these patterns:**
   - Any remaining `user.` references
   - Any remaining `currentUser.` references
   - Any `token` references without `_token` or `await _getToken()`
   - Any methods using `await` without `async`

3. **Test critical flows:**
   - Login/Logout
   - API calls with authentication
   - User profile access
   - SOS alerts
   - Notifications

## Common Replacement Patterns

| Old (Firebase) | New (JWT) |
|----------------|-----------|
| `user.uid` | `userData?['id']` |
| `user.email` | `userData?['email']` |
| `user.displayName` | `userData?['name']` |
| `user.getIdToken()` | `prefs.getString('jwt_token')` |
| `currentUser.uid` | `userId` (from SharedPreferences) |
| `FirebaseAuth.instance.currentUser` | Load from SharedPreferences |

## Helper Method Template

Add this to any class that needs user data:

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
    final token = prefs.getString('jwt_token');
    final userDataString = prefs.getString('user_data');
    
    setState(() {
      _token = token;
      _userData = userDataString != null ? jsonDecode(userDataString) : null;
    });
  }
  
  // Access user data like:
  // _userData?['id']
  // _userData?['email']
  // _userData?['name']
}
```

## Testing After Fixes

1. **Compile the app:**
   ```bash
   cd abra_fleet
   flutter run
   ```

2. **Test authentication:**
   - Login as different user types (admin, driver, client, customer)
   - Verify token is stored and retrieved correctly
   - Check API calls include Authorization header

3. **Test user-specific features:**
   - Profile screens
   - Notifications
   - SOS alerts
   - Dashboard data

## Troubleshooting

### If errors persist:

1. **Clean and rebuild:**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

2. **Check for typos:**
   - Ensure `_token` vs `token` consistency
   - Verify all `jsonDecode` calls have the import

3. **Verify SharedPreferences keys:**
   - `jwt_token` - for JWT token
   - `user_data` - for user information JSON

4. **Check backend compatibility:**
   - Ensure backend accepts JWT tokens
   - Verify token format in Authorization header: `Bearer <token>`

## Need Help?

If you encounter errors not covered here:

1. Copy the exact error message
2. Note the file and line number
3. Check if it's a pattern similar to those above
4. Apply the same fix pattern

## Summary

The main changes needed:
1. ✅ Remove duplicate variable declarations
2. ✅ Replace Firebase auth objects with SharedPreferences
3. ✅ Add `async` keywords where needed
4. ✅ Add missing imports (`dart:convert`)
5. ✅ Fix MultipartFile constructors
6. ✅ Add try-catch blocks
7. ✅ Replace direct property access with class variables

Run `fix-all-errors.bat` to apply all fixes automatically!
