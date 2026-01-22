@echo off
echo ========================================
echo  Firebase to JWT Migration Quick Fixes
echo ========================================
echo.

echo Creating helper file with correct patterns...
mkdir abra_fleet\lib\core\utils 2>nul

echo // JWT Authentication Helper Patterns > abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo import 'dart:convert'; >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo import 'package:shared_preferences/shared_preferences.dart'; >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo import 'package:http/http.dart' as http; >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo. >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo // Get user data from SharedPreferences >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo Future^<Map^<String, dynamic^>?^> getUserData() async { >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo   final prefs = await SharedPreferences.getInstance(); >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo   final userDataString = prefs.getString('user_data'); >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo   if (userDataString != null) { >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo     return jsonDecode(userDataString) as Map^<String, dynamic^>; >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo   } >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo   return null; >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart
echo } >> abra_fleet\lib\core\utils\jwt_auth_helpers.dart

echo.
echo ✅ Helper file created!
echo.

echo ========================================
echo  MANUAL FIXES REQUIRED
echo ========================================
echo.
echo The following files need manual fixes:
echo.
echo 1. driver_dashboard_screen.dart
echo    - Remove duplicate "final prefs" declarations (lines ~334, ~420)
echo    - Replace user.uid with userData?['id']
echo    - Replace user.email with userData?['email']
echo.
echo 2. client_main_shell.dart
echo    - Remove duplicate declarations (line ~112)
echo    - Replace currentUser.uid with userId
echo.
echo 3. notifications_screen.dart
echo    - Add: import 'dart:convert';
echo    - Replace currentUser with userId variable
echo.
echo 4. profile_driver_page.dart
echo    - Fix MultipartFile.fromBytes (add filename parameter)
echo    - Fix MultipartFile.fromPath (add filename parameter)
echo.
echo 5. client_profile_screen.dart
echo    - Remove duplicate phoneNumber field (line ~403)
echo.
echo ========================================
echo  SEARCH AND REPLACE PATTERNS
echo ========================================
echo.
echo Find:    final prefs = await SharedPreferences.getInstance();
echo          final token = prefs.getString('jwt_token');
echo          final prefs = await SharedPreferences.getInstance();
echo          final token = prefs.getString('jwt_token');
echo.
echo Replace: final prefs = await SharedPreferences.getInstance();
echo          final token = prefs.getString('jwt_token');
echo          final userDataString = prefs.getString('user_data');
echo          final userData = userDataString != null ? jsonDecode(userDataString) : null;
echo.
echo ========================================
echo.
echo See FIREBASE_TO_JWT_ERROR_FIXES.md for detailed instructions
echo See QUICK_FIX_GUIDE.md for quick reference
echo.
pause
