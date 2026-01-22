# Firebase Auth Removal - Batches 7-15 FINAL PUSH
## Date: January 16, 2026
## Status: 🚀 IN PROGRESS

---

## 📊 EXECUTION PLAN

Due to the large number of files (41 files) and token constraints, I'll process these files using a systematic approach:

### Strategy:
1. **Identify Pattern**: Most files are widget/screen files → Use Provider pattern
2. **Apply Changes**: Batch process with consistent replacements
3. **Verify**: Check compilation after each batch
4. **Document**: Track progress and issues

---

## 🎯 FILES IDENTIFIED FOR MIGRATION

### Files Found with Firebase Auth (from grep search):
1. client_reports_analytics.dart
2. client_reports_analytics_enhanced.dart  
3. driver_live_trip_screen.dart
4. raise_ticket.dart (TMS)
5. my_tickets.dart (TMS)
6. ⚠️ notifications_screen.dart (SKIP - uses Firebase Realtime DB)
7. hrm_notice_board_screen.dart
8. hrm_leave_requests_screen.dart
9. hrm_payroll_screen.dart
10. ex.dart (driver)
11. real_time_fleet_dashboard.dart
12. driver_dashboard_screen.dart
13. profile_driver_page.dart
14. driver_attendance_widget.dart
15. customer_profile_screen.dart
16. customer_dashboard.dart
17. ⚠️ client_sos_alerts.dart (SKIP - uses Firebase Realtime DB)
18. client_roster_management.dart
19. client_reports_analytics_working.dart
20. forgot_password_screen_backup.dart
21. forgot_password_screen.dart
22. client_profile_screen.dart
23. client_main_shell.dart
24. client_employee_management.dart
25. client_dashboard.dart
26. bulk_import_rosters.dart
27. api_vehicle_repository_impl.dart
28. start_new_trip.dart
29. trip_operation.dart
30. trip_operations_list_screen.dart
31. vehicle_master.dart
32. fleet_vehicles_list_screen.dart
33. enhanced_fleet_map_screen.dart
34. consecutive_trips_admin.dart
35. user_management_screen.dart
36. create_user_screen.dart
37. user_role_admin_access.dart
38. user_permissions_screen.dart
39. user_permission_dialog.dart
40. user_management_screen.dart
41. driver_admin_management_screen.dart
42. resolved_alerts_view.dart
43. admin_dashboard_screen.dart
44. driver_provider.dart
45. user.dart

**Files to Skip (Special Cases):**
- notifications_screen.dart (uses Firebase Realtime Database)
- client_sos_alerts.dart (uses Firebase Realtime Database)

---

## 🔄 MIGRATION PATTERN (Standard for All Files)

### For Widget/Screen Files (BuildContext Available):

```dart
// REMOVE
import 'package:firebase_auth/firebase_auth.dart';

// ADD
import 'package:provider/provider.dart';
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/features/auth/domain/entities/user_entity.dart';

// REPLACE Firebase Auth Usage
// OLD:
final user = FirebaseAuth.instance.currentUser;
if (user == null) return;
final userId = user.uid;
final email = user.email;
final token = await user.getIdToken();

// NEW:
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final user = authRepo.currentUser;
if (user == UserEntity.empty) return;
final userId = user.id;
final email = user.email;
final token = await authRepo.getAuthToken();
```

### For Service/Repository Files (No BuildContext):

```dart
// REMOVE
import 'package:firebase_auth/firebase_auth.dart';

// ADD
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

// ADD Helper Methods
Future<String?> _getAuthToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('jwt_token');
}
```

---

## ⚠️ RECOMMENDATION

Given the large number of files (41 files) and the complexity of some files, I recommend:

### Option A: Automated Batch Processing (Recommended)
- Process all files systematically
- Apply standard patterns
- Document any issues
- Estimated time: 30-40 minutes

### Option B: Manual Review Per File
- Read each file individually
- Apply custom changes
- More thorough but slower
- Estimated time: 2-3 hours

### Option C: Hybrid Approach (BEST)
- Auto-process simple widget files (30 files)
- Manual review for complex files (11 files)
- Balance speed and accuracy
- Estimated time: 45-60 minutes

---

## 🚀 PROCEEDING WITH OPTION C (HYBRID)

I'll start with the simpler files and flag complex ones for careful review.

---

**Document Created:** January 16, 2026
**Status:** 🚀 READY TO EXECUTE
