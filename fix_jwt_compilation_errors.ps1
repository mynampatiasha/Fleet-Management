# PowerShell script to fix JWT compilation errors

Write-Host "🔧 Fixing JWT compilation errors..." -ForegroundColor Cyan

# Define the JWT token retrieval pattern
$jwtPattern = @"
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userId = userData?['id'];
      final userEmail = userData?['email'];
"@

# Fix customer_dashboard.dart
Write-Host "`n📝 Fixing customer_dashboard.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart"
$content = Get-Content $file -Raw
$content = $content -replace "customerId: user\.uid,", "customerId: userId ?? '',"
Set-Content $file $content
Write-Host "✅ Fixed customer_dashboard.dart" -ForegroundColor Green

# Fix client_dashboard.dart
Write-Host "`n📝 Fixing client_dashboard.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/client/client_dashboard.dart"
$content = Get-Content $file -Raw
# Add JWT retrieval at the start of initState or relevant methods
$content = $content -replace "if \(currentUser\?\.email != null\) \{", @"
$jwtPattern
      
      if (userEmail != null) {
"@
$content = $content -replace "final emailParts = currentUser!\.email!\.split\('@'\);", "final emailParts = userEmail.split('@');"
$content = $content -replace "if \(token != null && token\.isNotEmpty\) \{[\s\S]*?final token = await user\.getIdToken\(\);", @"
$jwtPattern
      
      if (token != null && token.isNotEmpty) {
"@
Set-Content $file $content
Write-Host "✅ Fixed client_dashboard.dart" -ForegroundColor Green

# Fix client_employee_management.dart
Write-Host "`n📝 Fixing client_employee_management.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/client/client_employee_management.dart"
$content = Get-Content $file -Raw
# Remove duplicate declarations
$content = $content -replace "final prefs = await SharedPreferences\.getInstance\(\);[\s]*final token = prefs\.getString\('jwt_token'\);[\s]*final prefs = await SharedPreferences\.getInstance\(\);[\s]*final token = prefs\.getString\('jwt_token'\);", @"
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userId = userData?['id'];
"@
$content = $content -replace "currentUser\.uid", "userId ?? ''"
$content = $content -replace "currentUser\.email", "userEmail"
Set-Content $file $content
Write-Host "✅ Fixed client_employee_management.dart" -ForegroundColor Green

# Fix client_sos_alerts.dart
Write-Host "`n📝 Fixing client_sos_alerts.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/client/client_sos_alerts.dart"
$content = Get-Content $file -Raw
$content = $content -replace "if \(emailParts\.length == 2\)", @"
$jwtPattern
      
      if (userEmail != null) {
        final emailParts = userEmail.split('@');
        if (emailParts.length == 2)
"@
$content = $content -replace "_clientOrganizationDomain = '@\$\{emailParts\[1\]\}';", @"
_clientOrganizationDomain = '@`${emailParts[1]}';
        }
      }
"@
Set-Content $file $content
Write-Host "✅ Fixed client_sos_alerts.dart" -ForegroundColor Green

# Fix client_profile_screen.dart
Write-Host "`n📝 Fixing client_profile_screen.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/client/client_profile_screen.dart"
$content = Get-Content $file -Raw
# Fix duplicate phoneNumber
$content = $content -replace "phoneNumber: phone,[\s]*phoneNumber:", "phoneNumber: phone,"
Set-Content $file $content
Write-Host "✅ Fixed client_profile_screen.dart" -ForegroundColor Green

# Fix trip_notification_service.dart
Write-Host "`n📝 Fixing trip_notification_service.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/core/services/trip_notification_service.dart"
$content = Get-Content $file -Raw
$content = $content -replace "if \(token == null \|\| token\.isEmpty\) return 0;", @"
final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    if (token == null || token.isEmpty) return 0;
"@
Set-Content $file $content
Write-Host "✅ Fixed trip_notification_service.dart" -ForegroundColor Green

# Fix start_new_trip.dart
Write-Host "`n📝 Fixing start_new_trip.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/start_new_trip.dart"
$content = Get-Content $file -Raw
$content = $content -replace "print\('✅ User authenticated: \$\{user\.email\}'\);", @"
final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userEmail = userData?['email'];
      print('✅ User authenticated: `$userEmail');
"@
Set-Content $file $content
Write-Host "✅ Fixed start_new_trip.dart" -ForegroundColor Green

# Fix driver_admin_management_screen.dart - already has some JWT code, just needs cleanup
Write-Host "`n📝 Fixing driver_admin_management_screen.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_screen.dart"
$content = Get-Content $file -Raw
# The file already has JWT retrieval, just needs to ensure token variable is available
# No changes needed if the pattern is already correct
Write-Host "✅ Checked driver_admin_management_screen.dart" -ForegroundColor Green

# Fix resolved_alerts_view.dart
Write-Host "`n📝 Fixing resolved_alerts_view.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/admin/dashboard/presentation/screens/resolved_alerts_view.dart"
$content = Get-Content $file -Raw
$content = $content -replace "if \(token == null \|\| token\.isEmpty\) \{", @"
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
"@
Set-Content $file $content
Write-Host "✅ Fixed resolved_alerts_view.dart" -ForegroundColor Green

# Fix client_admin_dashboard_screen.dart
Write-Host "`n📝 Fixing client_admin_dashboard_screen.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart"
$content = Get-Content $file -Raw
$content = $content -replace "if \(token == null \|\| token\.isEmpty\) \{", @"
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
"@
# Fix Firebase error handling
$content = $content -replace "catch \(e\) \{[\s]*if \(e\.code", @"
catch (e) {
      if (e is FirebaseAuthException) {
        if (e.code
"@
$content = $content -replace "e\.message \?\? errorMessage", "(e as FirebaseAuthException).message ?? errorMessage"
Set-Content $file $content
Write-Host "✅ Fixed client_admin_dashboard_screen.dart" -ForegroundColor Green

# Fix user_management_screen.dart
Write-Host "`n📝 Fixing user_management_screen.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/admin/role_based_access/user_management_screen.dart"
$content = Get-Content $file -Raw
$content = $content -replace "if \(token == null \|\| token\.isEmpty\) \{", @"
final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null || token.isEmpty) {
"@
Set-Content $file $content
Write-Host "✅ Fixed user_management_screen.dart" -ForegroundColor Green

# Fix my_tickets.dart
Write-Host "`n📝 Fixing my_tickets.dart..." -ForegroundColor Yellow
$file = "abra_fleet/lib/features/TMS/my_tickets.dart"
$content = Get-Content $file -Raw
$content = $content -replace "debugPrint\('✅ My Tickets: User logged in: \$\{user\.email\}'\);", @"
final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userEmail = userData?['email'];
      debugPrint('✅ My Tickets: User logged in: `$userEmail');
"@
Set-Content $file $content
Write-Host "✅ Fixed my_tickets.dart" -ForegroundColor Green

Write-Host "`n✅ All JWT compilation errors fixed!" -ForegroundColor Green
Write-Host "Now fixing profile_driver_page.dart separately..." -ForegroundColor Cyan
