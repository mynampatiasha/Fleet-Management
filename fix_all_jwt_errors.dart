import 'dart:io';

void main() async {
  print('🔧 Fixing all JWT migration errors...\n');
  
  // Files with errors
  final filesToFix = [
    'abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart',
    'abra_fleet/lib/features/client/client_dashboard.dart',
    'abra_fleet/lib/features/client/client_employee_management.dart',
    'abra_fleet/lib/features/client/client_sos_alerts.dart',
    'abra_fleet/lib/features/client/client_profile_screen.dart',
    'abra_fleet/lib/core/services/trip_notification_service.dart',
    'abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/start_new_trip.dart',
    'abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_screen.dart',
    'abra_fleet/lib/features/admin/dashboard/presentation/screens/resolved_alerts_view.dart',
    'abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart',
    'abra_fleet/lib/features/admin/role_based_access/user_management_screen.dart',
    'abra_fleet/lib/features/TMS/my_tickets.dart',
    'abra_fleet/lib/features/driver/dashboard/presentation/screens/profile_driver_page.dart',
  ];
  
  for (final filePath in filesToFix) {
    await fixFile(filePath);
  }
  
  print('\n✅ All files fixed!');
}

Future<void> fixFile(String filePath) async {
  final file = File(filePath);
  if (!await file.exists()) {
    print('⚠️  File not found: $filePath');
    return;
  }
  
  print('📝 Fixing: $filePath');
  String content = await file.readAsString();
  
  // Fix 1: Replace undefined 'user' with JWT token retrieval
  content = content.replaceAllMapped(
    RegExp(r'customerId:\s*user\.uid', multiLine: true),
    (match) => 'customerId: userId ?? \'\'',
  );
  
  // Fix 2: Replace currentUser references
  content = content.replaceAllMapped(
    RegExp(r'if\s*\(currentUser\?\.email\s*!=\s*null\)\s*\{[^}]*final\s+emailParts\s*=\s*currentUser!\.email!\.split\(\'@\'\);', multiLine: true, dotAll: true),
    (match) {
      return '''if (userEmail != null) {
        final emailParts = userEmail.split('@');''';
    },
  );
  
  // Fix 3: Replace standalone token checks with proper JWT retrieval
  content = content.replaceAllMapped(
    RegExp(r'if\s*\(token\s*!=\s*null\s*&&\s*token\.isNotEmpty\)\s*\{[^}]*final\s+token\s*=\s*await\s+user\.getIdToken\(\);', multiLine: true, dotAll: true),
    (match) {
      return '''final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userId = userData?['id'];
      final userEmail = userData?['email'];
      
      if (token != null && token.isNotEmpty) {''';
    },
  );
  
  // Fix 4: Add missing JWT retrieval at method start
  content = content.replaceAllMapped(
    RegExp(r'(Future<[^>]+>\s+\w+\([^)]*\)\s+async\s+\{)\s*if\s*\(token\s*==\s*null', multiLine: true),
    (match) {
      return '''${match.group(1)}
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userId = userData?['id'];
      
      if (token == null''';
    },
  );
  
  // Fix 5: Remove duplicate prefs/token declarations
  content = content.replaceAllMapped(
    RegExp(r'final\s+prefs\s*=\s*await\s+SharedPreferences\.getInstance\(\);\s*final\s+token\s*=\s*prefs\.getString\(\'jwt_token\'\);\s*final\s+prefs\s*=\s*await\s+SharedPreferences\.getInstance\(\);\s*final\s+token\s*=\s*prefs\.getString\(\'jwt_token\'\);', multiLine: true),
    (match) => 'final prefs = await SharedPreferences.getInstance();\n      final token = prefs.getString(\'jwt_token\');',
  );
  
  // Fix 6: Replace user.email references
  content = content.replaceAll(
    RegExp(r'user\.email'),
    'userEmail',
  );
  
  // Fix 7: Replace userId references that are undefined
  content = content.replaceAllMapped(
    RegExp(r'\.doc\(userId\)\s*//\s*(?:Replace with actual user ID from JWT|Get userId from JWT)'),
    (match) => '.doc(userId ?? \'\')',
  );
  
  // Fix 8: Fix phoneNumber syntax error in client_profile_screen
  if (filePath.contains('client_profile_screen')) {
    content = content.replaceAll(
      RegExp(r'phoneNumber:\s*phone,\s*phoneNumber:', multiLine: true),
      'phoneNumber: phone,',
    );
  }
  
  // Fix 9: Replace emailParts undefined references
  content = content.replaceAllMapped(
    RegExp(r'if\s*\(emailParts\.length\s*==\s*2\)\s*\{[^}]*_clientOrganizationDomain\s*=\s*\'@\$\{emailParts\[1\]\}\';', multiLine: true, dotAll: true),
    (match) {
      return '''final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userEmail = userData?['email'];
      
      if (userEmail != null) {
        final emailParts = userEmail.split('@');
        if (emailParts.length == 2) {
          _clientOrganizationDomain = '@\${emailParts[1]}';''';
    },
  );
  
  // Fix 10: Fix Firebase error handling (e.code, e.message)
  content = content.replaceAll(
    RegExp(r'catch\s*\(e\)\s*\{([^}]*if\s*\(e\.code)', multiLine: true, dotAll: true),
    'catch (e) {\n      if (e is FirebaseAuthException) {\n        if (e.code',
  );
  
  content = content.replaceAll(
    RegExp(r'e\.message\s*\?\?\s*errorMessage'),
    '(e as FirebaseAuthException).message ?? errorMessage',
  );
  
  // Fix 11: Add missing imports
  if (!content.contains('import \'package:shared_preferences/shared_preferences.dart\';')) {
    content = content.replaceFirst(
      RegExp(r'import\s+\'package:flutter/material\.dart\';'),
      'import \'package:flutter/material.dart\';\nimport \'package:shared_preferences/shared_preferences.dart\';\nimport \'dart:convert\';',
    );
  }
  
  if (filePath.contains('client_admin_dashboard_screen') && !content.contains('import \'package:firebase_auth/firebase_auth.dart\';')) {
    content = content.replaceFirst(
      RegExp(r'import\s+\'package:flutter/material\.dart\';'),
      'import \'package:flutter/material.dart\';\nimport \'package:firebase_auth/firebase_auth.dart\';',
    );
  }
  
  await file.writeAsString(content);
  print('✅ Fixed: $filePath');
}
