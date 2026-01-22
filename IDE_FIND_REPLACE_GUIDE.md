# IDE Find & Replace Guide - JWT Compilation Errors

## ✅ Already Fixed (3/13 files)
- customer_dashboard.dart
- client_dashboard.dart
- client_employee_management.dart

## 🔧 Files to Fix (10 remaining)

Use your IDE's Find & Replace feature (Ctrl+H in VS Code) with **Regex enabled**.

---

## STEP 1: Add Missing Imports

**Find in:** All 10 remaining files  
**Find:** `^import 'package:flutter/material.dart';$`  
**Replace with:**
```dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
```
**Regex:** ✅ Enabled  
**Files:** client_sos_alerts.dart, client_profile_screen.dart, trip_notification_service.dart, start_new_trip.dart, resolved_alerts_view.dart, client_admin_dashboard_screen.dart, user_management_screen.dart, my_tickets.dart

---

## STEP 2: Fix Simple Variable References

### 2.1 Fix `user.uid` references
**Find:** `user\.uid`  
**Replace:** `userId ?? ''`  
**Regex:** ✅ Enabled

### 2.2 Fix `user.email` references
**Find:** `user\.email`  
**Replace:** `userEmail`  
**Regex:** ✅ Enabled

### 2.3 Fix `currentUser.email` references
**Find:** `currentUser\.email`  
**Replace:** `userEmail`  
**Regex:** ✅ Enabled

### 2.4 Fix `currentUser.uid` references
**Find:** `currentUser\.uid`  
**Replace:** `userId`  
**Regex:** ✅ Enabled

### 2.5 Fix `currentUser!.email!` references
**Find:** `currentUser!\.email!`  
**Replace:** `userEmail`  
**Regex:** ✅ Enabled

---

## STEP 3: File-Specific Fixes

### FILE: client_sos_alerts.dart

**Fix 1 - Add JWT retrieval at method start**  
**Find:**
```
if \(emailParts\.length == 2\) \{
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userEmail = userData?['email'];
      
      if (userEmail != null) {
        final emailParts = userEmail.split('@');
        if (emailParts.length == 2) {
```

**Fix 2 - Close the new if block**  
**Find:**
```
_clientOrganizationDomain = '@\$\{emailParts\[1\]\}';
```
**Replace:**
```dart
_clientOrganizationDomain = '@${emailParts[1]}';
        }
      }
```

**Fix 3 - Add token retrieval**  
**Find:**
```
if \(token == null \|\| token\.isEmpty\) \{
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
```

---

### FILE: client_profile_screen.dart

**Fix 1 - Remove duplicate phoneNumber**  
**Find:**
```
phoneNumber: phone,\s*phoneNumber:
```
**Replace:**
```dart
phoneNumber: phone,
```
**Regex:** ✅ Enabled

**Fix 2 - Add JWT retrieval before token check**  
**Find:**
```
if \(token == null \|\| token\.isEmpty\) throw Exception\('No user logged in'\);
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userId = userData?['id'];
      
      if (token == null || token.isEmpty) throw Exception('No user logged in');
```

**Fix 3 - Fix .doc(userId) references**  
**Find:**
```
\.doc\(userId\)\s*//\s*(?:Get userId from JWT|Replace with actual user ID from JWT)
```
**Replace:**
```dart
.doc(userId ?? '')
```
**Regex:** ✅ Enabled

---

### FILE: trip_notification_service.dart

**Find:**
```
if \(token == null \|\| token\.isEmpty\) return 0;
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    if (token == null || token.isEmpty) return 0;
```

---

### FILE: start_new_trip.dart

**Find:**
```
print\('✅ User authenticated: \$\{user\.email\}'\);
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userEmail = userData?['email'];
      print('✅ User authenticated: $userEmail');
```
**Regex:** ✅ Enabled

---

### FILE: driver_admin_management_screen.dart

**Note:** This file already has JWT code but needs cleanup.

**Find all occurrences of:**
```
if \(token != null && token\.isNotEmpty\) 'Authorization': 'Bearer \$token',
```

**Replace with:**
```dart
if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
```

---

### FILE: resolved_alerts_view.dart

**Find:**
```
if \(token == null \|\| token\.isEmpty\) \{
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
```

---

### FILE: client_admin_dashboard_screen.dart

**Fix 1 - Add JWT retrieval**  
**Find:**
```
if \(token == null \|\| token\.isEmpty\) \{
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
```

**Fix 2 - Fix Firebase error handling**  
**Find:**
```
catch \(e\) \{\s*if \(e\.code
```
**Replace:**
```dart
catch (e) {
      if (e is FirebaseAuthException) {
        if (e.code
```
**Regex:** ✅ Enabled

**Fix 3 - Fix error message**  
**Find:**
```
e\.message \?\? errorMessage
```
**Replace:**
```dart
(e as FirebaseAuthException).message ?? errorMessage
```
**Regex:** ✅ Enabled

**Fix 4 - Add import**  
Add at top: `import 'package:firebase_auth/firebase_auth.dart';`

---

### FILE: user_management_screen.dart

**Find (appears twice - in two different classes):**
```
if \(token == null \|\| token\.isEmpty\) \{
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
```

---

### FILE: my_tickets.dart

**Find:**
```
debugPrint\('✅ My Tickets: User logged in: \$\{user\.email\}'\);
```
**Replace:**
```dart
final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userEmail = userData?['email'];
      debugPrint('✅ My Tickets: User logged in: $userEmail');
```
**Regex:** ✅ Enabled

---

### FILE: profile_driver_page.dart (MOST COMPLEX)

This file needs major refactoring. **Recommended approach:**

1. **Add imports at top:**
```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:abra_fleet/app/config/api_config.dart';
```

2. **Remove all Firestore references:**
   - Find: `FirebaseFirestore\.instance` → Delete or comment out
   - Find: `FieldValue\.serverTimestamp\(\)` → Replace with `DateTime.now().toIso8601String()`
   - Find: `DocumentSnapshot` → Replace with `Map<String, dynamic>`

3. **Add JWT retrieval pattern to ALL methods that need auth:**
```dart
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final userDataString = prefs.getString('user_data');
final userData = userDataString != null ? jsonDecode(userDataString) : null;
final userId = userData?['id'];

if (token == null || token.isEmpty) {
  // Handle no auth
  return;
}
```

4. **Replace all Firestore operations with backend API calls:**
   - Instead of `FirebaseFirestore.instance.collection('users').doc(userId).update({...})`
   - Use: `http.put(Uri.parse('${ApiConfig.baseUrl}/api/users/$userId'), ...)`

---

## STEP 4: Verify & Test

After all replacements:

1. **Run Flutter analyze:**
```bash
cd abra_fleet
flutter analyze
```

2. **Check for remaining errors:**
```bash
flutter pub get
flutter clean
flutter pub get
```

3. **If errors persist, check:**
   - Missing imports
   - Unclosed brackets
   - Variable scope issues

---

## QUICK REFERENCE: Common Patterns

### Pattern A: Add JWT at method start
```dart
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');
final userDataString = prefs.getString('user_data');
final userData = userDataString != null ? jsonDecode(userDataString) : null;
final userId = userData?['id'];
final userEmail = userData?['email'];
```

### Pattern B: Simple token check
```dart
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('jwt_token');

if (token == null || token.isEmpty) {
  // Handle
}
```

### Pattern C: Replace Firebase user references
- `user.uid` → `userId ?? ''`
- `user.email` → `userEmail`
- `currentUser.email` → `userEmail`

---

## ESTIMATED TIME

- Simple files (4-11): **5-10 minutes**
- profile_driver_page.dart: **15-20 minutes** (needs manual refactoring)
- **Total: 20-30 minutes**

---

## TIPS

1. **Work file by file** - Don't do all at once
2. **Test after each file** - Run `flutter analyze`
3. **Use VS Code's "Replace All"** carefully - Review each replacement
4. **Keep a backup** - Git commit before starting
5. **For profile_driver_page.dart** - Consider creating a new `driver_profile_service.dart` to handle API calls

---

## NEED HELP?

If you get stuck on any file, let me know which one and I'll provide specific strReplace commands for that file.

Good luck! 🚀
