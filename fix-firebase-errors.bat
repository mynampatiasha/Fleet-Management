@echo off
echo ========================================
echo FIXING FIREBASE ERRORS - STEP BY STEP
echo ========================================
echo.

echo STEP 1: Edit pubspec.yaml
echo ----------------------------------------
echo Open abra_fleet/pubspec.yaml in your editor
echo.
echo Find and DELETE these lines:
echo   firebase_core: any version
echo   firebase_auth: any version
echo   firebase_database: any version
echo   firebase_storage: any version
echo   cloud_firestore: any version
echo   firebase_messaging: any version
echo.
echo Press any key after you've deleted them...
pause > nul

echo.
echo STEP 2: Clean Flutter
echo ----------------------------------------
cd abra_fleet
call flutter clean
call flutter pub get
cd ..
echo ✓ Done
echo.

echo STEP 3: Now fix the imports
echo ----------------------------------------
echo.
echo I'll create a summary of files to fix...
echo.

echo Files with Firebase imports (fix these):
echo.
echo 1. lib/features/notifications/presentation/screens/notifications_screen.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 2. lib/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 3. lib/features/client/client_main_shell.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 4. lib/features/client/client_employee_management.dart
echo    - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo 5. lib/features/client/client_sos_alerts.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 6. lib/features/client/client_profile_screen.dart
echo    - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo 7. lib/core/services/roster_service.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo    - Remove: final DatabaseReference _firebaseDb = FirebaseDatabase.instance.ref();
echo.
echo 8. lib/features/admin/dashboard/presentation/screens/sos_alert.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 9. lib/features/admin/client_management/client_admin_dashboard_screen.dart
echo    - Remove: import 'package:firebase_database/firebase_database.dart';
echo    - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo    - Remove: import 'package:firebase_core/firebase_core.dart';
echo.
echo 10. lib/features/admin/customer_management/admin_pending_customers.dart
echo     - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo 11. lib/features/admin/customer_management/notification/roster_model.dart
echo     - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 12. lib/features/admin/customer_management/notification/approved_rosters_screen.dart
echo     - Remove: import 'package:firebase_database/firebase_database.dart';
echo.
echo 13. lib/features/customer/dashboard/presentation/screens/customer_profile_screen.dart
echo     - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo 14. lib/core/services/document_storage_service.dart
echo     - Remove: import 'package:firebase_storage/firebase_storage.dart';
echo.
echo 15. lib/features/admin/driver_management/presentation/providers/driver_provider.dart
echo     - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo 16. lib/features/admin/driver_management/domain/entities/driver_entity.dart
echo     - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo 17. lib/features/admin/customer_management/domain/entities/customer_entity.dart
echo     - Remove: import 'package:cloud_firestore/cloud_firestore.dart';
echo.
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Remove the Firebase imports from each file above
echo 2. Comment out any Firebase code (FirebaseDatabase, FirebaseFirestore, etc.)
echo 3. Run: cd abra_fleet
echo 4. Run: flutter run
echo.
echo See FIREBASE_QUICK_FIX_REFERENCE.md for detailed fixes
echo.
pause
