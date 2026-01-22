# Firebase Migration - Final Steps

## Status: 2 Files Remaining + 1 Backup to Delete

### File 1: customer_dashboard_temp.dart (HIGH PRIORITY - SOS Critical)

**Location:** `abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard_temp.dart`

**Lines to Replace:**

#### Replace Line 627-660 (_listenForSOSHistory method):
```dart
// OLD CODE (Firebase RTDB):
void _listenForSOSHistory() {
  if (token == null || token!.isEmpty || _userId == null) return;

  final sosEventsRef = FirebaseDat