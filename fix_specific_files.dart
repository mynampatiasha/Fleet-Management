import 'dart:io';

/// Comprehensive fix script for Firebase to JWT migration compilation errors
void main() async {
  print('🔧 Starting comprehensive compilation error fixes...\n');
  
  // Fix each file with specific patterns
  await fixDriverDashboardScreen();
  await fixClientMainShell();
  await fixNotificationsScreen();
  await fixClientDashboard();
  await fixClientEmployeeManagement();
  await fixClientSOSAlerts();
  await fixClientProfileScreen();
  await fixTripNotificationService();
  await fixStartNewTrip();
  await fixDriverAdminManagement();
  await fixResolvedAlertsView();
  await fixClientAdminDashboard();
  await fixUserManagementScreen();
  await fixMyTickets();
  await fixProfileDriverPage();
  
  print('\n✅ All fixes applied!');
  print('📝 Run "flutter analyze" to check for remaining errors');
}

/// Fix driver_dashboard_screen.dart
Future<void> fixDriverDashboardScreen() async {
  final file = File('abra_fleet/lib/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart');
  if (!await file.exists()) {
    print('⚠️  File not found: driver_dashboard_screen.dart');
    return;
  }
  
  print('📄 Fixing driver_dashboard_screen.dart...');
  var content = await file.readAsString();
  
  // Fix 1: Remove duplicate prefs/token declarations in _triggerSOS
  content = content.replaceAll(
    RegExp(r'final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);\s+final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);'),
    'final prefs = await SharedPreferences.getInstance();\n      final token = prefs.getString(\'jwt_token\');'
  );
  
  // Fix 2: Replace user.uid references with token-based approach
  content = content.replaceAll(
    RegExp(r'user\.uid'),
    'userData?[\'id\'] ?? \'\''
  );
  
  content = content.replaceAll(
    RegExp(r'user\.email'),
    'userData?[\'email\'] ?? \'\''
  );
  
  content = content.replaceAll(
    RegExp(r'user\.displayName'),
    'userData?[\'name\'] ?? \'\''
  );
  
  // Fix 3: Add userData extraction after token check
  final triggerSOSFix = '''
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null || token.isEmpty) throw Exception('User is not logged in.');
      
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
''';
  
  content = content.replaceAll(
    RegExp(r'final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);\s+if \(token == null \|\| token\.isEmpty\) throw Exception\(''User is not logged in\.''\);'),
    triggerSOSFix
  );
  
  // Fix 4: Make _listenForSOSHistory async
  content = content.replaceAll(
    'void _listenForSOSHistory() {',
    'void _listenForSOSHistory() async {'
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed driver_dashboard_screen.dart');
}

/// Fix client_main_shell.dart
Future<void> fixClientMainShell() async {
  final file = File('abra_fleet/lib/features/client/client_main_shell.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing client_main_shell.dart...');
  var content = await file.readAsString();
  
  // Fix duplicate declarations
  content = content.replaceAll(
    RegExp(r'final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);\s+final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);'),
    'final prefs = await SharedPreferences.getInstance();\n      final token = prefs.getString(\'jwt_token\');'
  );
  
  // Replace currentUser references
  content = content.replaceAll(
    RegExp(r'currentUser\.uid'),
    'userId'
  );
  
  // Add userId extraction
  content = content.replaceAll(
    RegExp(r'final token = prefs\.getString\(''jwt_token''\);'),
    '''final token = prefs.getString('jwt_token');
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      final userId = userData?['id'];'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed client_main_shell.dart');
}

/// Fix notifications_screen.dart
Future<void> fixNotificationsScreen() async {
  final file = File('abra_fleet/lib/features/notifications/presentation/screens/notifications_screen.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing notifications_screen.dart...');
  var content = await file.readAsString();
  
  // Add missing import
  if (!content.contains("import 'dart:convert';")) {
    content = "import 'dart:convert';\n" + content;
  }
  
  // Replace currentUser references
  content = content.replaceAll(
    RegExp(r'currentUser\.uid'),
    'userId'
  );
  
  content = content.replaceAll(
    RegExp(r'currentUser != null'),
    'userId != null'
  );
  
  content = content.replaceAll(
    RegExp(r'currentUser == null'),
    'userId == null'
  );
  
  // Add userId extraction at class level
  content = content.replaceAll(
    'class _NotificationsScreenState extends State<NotificationsScreen> {',
    '''class _NotificationsScreenState extends State<NotificationsScreen> {
  String? userId;
  
  @override
  void initState() {
    super.initState();
    _loadUserId();
  }
  
  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString('user_data');
    final userData = userDataString != null ? jsonDecode(userDataString) : null;
    setState(() {
      userId = userData?['id'];
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed notifications_screen.dart');
}

/// Fix client_dashboard.dart
Future<void> fixClientDashboard() async {
  final file = File('abra_fleet/lib/features/client/client_dashboard.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing client_dashboard.dart...');
  var content = await file.readAsString();
  
  // Replace currentUser references
  content = content.replaceAll(
    RegExp(r'currentUser\?\.email'),
    'userEmail'
  );
  
  content = content.replaceAll(
    RegExp(r'currentUser!\.email!'),
    'userEmail!'
  );
  
  // Replace token references
  content = content.replaceAll(
    RegExp(r'if \(token != null && token\.isNotEmpty\)'),
    'if (_token != null && _token!.isNotEmpty)'
  );
  
  // Replace user references
  content = content.replaceAll(
    RegExp(r'user\.getIdToken\(\)'),
    '_token'
  );
  
  // Add class-level variables
  content = content.replaceAll(
    'class _ClientDashboardState extends State<ClientDashboard> {',
    '''class _ClientDashboardState extends State<ClientDashboard> {
  String? _token;
  String? userEmail;
  
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
      userEmail = userData?['email'];
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed client_dashboard.dart');
}

/// Fix client_employee_management.dart
Future<void> fixClientEmployeeManagement() async {
  final file = File('abra_fleet/lib/features/client/client_employee_management.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing client_employee_management.dart...');
  var content = await file.readAsString();
  
  // Fix duplicate declarations
  content = content.replaceAll(
    RegExp(r'final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);\s+final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);'),
    'final prefs = await SharedPreferences.getInstance();\n      final token = prefs.getString(\'jwt_token\');'
  );
  
  // Replace token/userId/currentUser references
  content = content.replaceAll(
    RegExp(r'if \(token != null && token\.isNotEmpty\)'),
    'if (_token != null && _token!.isNotEmpty)'
  );
  
  content = content.replaceAll(
    RegExp(r'\.doc\(userId\)'),
    '.doc(_userId)'
  );
  
  content = content.replaceAll(
    RegExp(r'currentUser\.uid'),
    '_userId'
  );
  
  content = content.replaceAll(
    RegExp(r'currentUser\.email'),
    '_userEmail'
  );
  
  // Add class-level variables
  content = content.replaceAll(
    'class _ClientEmployeeManagementState extends State<ClientEmployeeManagement> {',
    '''class _ClientEmployeeManagementState extends State<ClientEmployeeManagement> {
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
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed client_employee_management.dart');
}

/// Fix client_sos_alerts.dart
Future<void> fixClientSOSAlerts() async {
  final file = File('abra_fleet/lib/features/client/client_sos_alerts.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing client_sos_alerts.dart...');
  var content = await file.readAsString();
  
  // Replace emailParts references
  content = content.replaceAll(
    RegExp(r'emailParts\.length'),
    '_emailParts.length'
  );
  
  content = content.replaceAll(
    RegExp(r'emailParts\[1\]'),
    '_emailParts[1]'
  );
  
  // Replace token references
  content = content.replaceAll(
    RegExp(r'if \(token == null\)'),
    'if (_token == null)'
  );
  
  content = content.replaceAll(
    RegExp(r'''Bearer \$token'''),
    'Bearer \$_token'
  );
  
  // Add class-level variables
  content = content.replaceAll(
    'class _ClientSOSAlertsState extends State<ClientSOSAlerts> {',
    '''class _ClientSOSAlertsState extends State<ClientSOSAlerts> {
  String? _token;
  List<String> _emailParts = [];
  
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
    final email = userData?['email'] as String?;
    setState(() {
      _token = token;
      if (email != null) {
        _emailParts = email.split('@');
      }
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed client_sos_alerts.dart');
}

/// Fix client_profile_screen.dart
Future<void> fixClientProfileScreen() async {
  final file = File('abra_fleet/lib/features/client/client_profile_screen.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing client_profile_screen.dart...');
  var content = await file.readAsString();
  
  // Fix syntax error - remove duplicate phoneNumber
  content = content.replaceAll(
    RegExp(r'phoneNumber: phone,\s+phoneNumber:'),
    'phoneNumber:'
  );
  
  // Replace token/userId references
  content = content.replaceAll(
    RegExp(r'if \(token == null \|\| token\.isEmpty\)'),
    'if (_token == null || _token!.isEmpty)'
  );
  
  content = content.replaceAll(
    RegExp(r'\.doc\(userId\)'),
    '.doc(_userId)'
  );
  
  content = content.replaceAll(
    RegExp(r'userId: userId'),
    'userId: _userId'
  );
  
  // Add class-level variables
  content = content.replaceAll(
    'class _ClientProfileScreenState extends State<ClientProfileScreen> {',
    '''class _ClientProfileScreenState extends State<ClientProfileScreen> {
  String? _token;
  String? _userId;
  
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
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed client_profile_screen.dart');
}

/// Fix trip_notification_service.dart
Future<void> fixTripNotificationService() async {
  final file = File('abra_fleet/lib/core/services/trip_notification_service.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing trip_notification_service.dart...');
  var content = await file.readAsString();
  
  // Replace token references with method call
  content = content.replaceAll(
    RegExp(r'if \(token == null \|\| token\.isEmpty\)'),
    'final token = await _getToken();\n    if (token == null || token.isEmpty)'
  );
  
  content = content.replaceAll(
    RegExp(r'''Bearer \$token'''),
    'Bearer \$token'
  );
  
  // Add helper method
  if (!content.contains('Future<String?> _getToken()')) {
    content = content.replaceAll(
      'class TripNotificationService {',
      '''class TripNotificationService {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
'''
    );
  }
  
  await file.writeAsString(content);
  print('  ✅ Fixed trip_notification_service.dart');
}

/// Fix start_new_trip.dart
Future<void> fixStartNewTrip() async {
  final file = File('abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/start_new_trip.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing start_new_trip.dart...');
  var content = await file.readAsString();
  
  // Replace user.email references
  content = content.replaceAll(
    RegExp(r'user\.email'),
    'userEmail'
  );
  
  // Add userEmail variable
  content = content.replaceAll(
    'class _StartNewTripPageState extends State<StartNewTripPage> {',
    '''class _StartNewTripPageState extends State<StartNewTripPage> {
  String? userEmail;
  
  @override
  void initState() {
    super.initState();
    _loadUserEmail();
  }
  
  Future<void> _loadUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString('user_data');
    final userData = userDataString != null ? jsonDecode(userDataString) : null;
    setState(() {
      userEmail = userData?['email'];
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed start_new_trip.dart');
}

/// Fix driver_admin_management_screen.dart
Future<void> fixDriverAdminManagement() async {
  final file = File('abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_screen.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing driver_admin_management_screen.dart...');
  var content = await file.readAsString();
  
  // Replace all token references
  content = content.replaceAll(
    RegExp(r'if \(token != null && token\.isNotEmpty\)'),
    'if (_token != null && _token!.isNotEmpty)'
  );
  
  content = content.replaceAll(
    RegExp(r'''Bearer \$token'''),
    'Bearer \$_token'
  );
  
  // Add class-level variable
  content = content.replaceAll(
    'class _DriverDashboardPageState extends State<DriverDashboardPage> {',
    '''class _DriverDashboardPageState extends State<DriverDashboardPage> {
  String? _token;
  
  @override
  void initState() {
    super.initState();
    _loadToken();
  }
  
  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    setState(() {
      _token = token;
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed driver_admin_management_screen.dart');
}

/// Fix resolved_alerts_view.dart
Future<void> fixResolvedAlertsView() async {
  final file = File('abra_fleet/lib/features/admin/dashboard/presentation/screens/resolved_alerts_view.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing resolved_alerts_view.dart...');
  var content = await file.readAsString();
  
  // Replace token references
  content = content.replaceAll(
    RegExp(r'if \(token == null \|\| token\.isEmpty\)'),
    'final token = await _getToken();\n    if (token == null || token.isEmpty)'
  );
  
  // Add helper method
  if (!content.contains('Future<String?> _getToken()')) {
    content = content.replaceAll(
      'class _ResolvedAlertsViewState extends State<ResolvedAlertsView> {',
      '''class _ResolvedAlertsViewState extends State<ResolvedAlertsView> {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
'''
    );
  }
  
  await file.writeAsString(content);
  print('  ✅ Fixed resolved_alerts_view.dart');
}

/// Fix client_admin_dashboard_screen.dart
Future<void> fixClientAdminDashboard() async {
  final file = File('abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing client_admin_dashboard_screen.dart...');
  var content = await file.readAsString();
  
  // Replace token references
  content = content.replaceAll(
    RegExp(r'if \(token == null \|\| token\.isEmpty\)'),
    'final token = await _getToken();\n    if (token == null || token.isEmpty)'
  );
  
  // Fix Firebase error handling
  content = content.replaceAll(
    RegExp(r'if \(e\.code =='),
    'if ((e as dynamic).code =='
  );
  
  content = content.replaceAll(
    RegExp(r'e\.message'),
    '(e as dynamic).message'
  );
  
  // Add helper method
  if (!content.contains('Future<String?> _getToken()')) {
    content = content.replaceAll(
      'class _ClientDashboardScreenState extends State<ClientDashboardScreen> {',
      '''class _ClientDashboardScreenState extends State<ClientDashboardScreen> {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
'''
    );
  }
  
  await file.writeAsString(content);
  print('  ✅ Fixed client_admin_dashboard_screen.dart');
}

/// Fix user_management_screen.dart
Future<void> fixUserManagementScreen() async {
  final file = File('abra_fleet/lib/features/admin/role_based_access/user_management_screen.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing user_management_screen.dart...');
  var content = await file.readAsString();
  
  // Replace token references in both classes
  content = content.replaceAll(
    RegExp(r'if \(token == null \|\| token\.isEmpty\)'),
    'final token = await _getToken();\n    if (token == null || token.isEmpty)'
  );
  
  // Add helper methods to both state classes
  if (!content.contains('Future<String?> _getToken()')) {
    content = content.replaceAll(
      'class _UserManagementScreenState extends State<UserManagementScreen> {',
      '''class _UserManagementScreenState extends State<UserManagementScreen> {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
'''
    );
    
    content = content.replaceAll(
      'class _AddUserDialogState extends State<AddUserDialog> {',
      '''class _AddUserDialogState extends State<AddUserDialog> {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
'''
    );
  }
  
  await file.writeAsString(content);
  print('  ✅ Fixed user_management_screen.dart');
}

/// Fix my_tickets.dart
Future<void> fixMyTickets() async {
  final file = File('abra_fleet/lib/features/TMS/my_tickets.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing my_tickets.dart...');
  var content = await file.readAsString();
  
  // Replace user references
  content = content.replaceAll(
    RegExp(r'user\.email'),
    'userEmail'
  );
  
  // Add userEmail variable
  content = content.replaceAll(
    'class _MyTicketsScreenState extends State<MyTicketsScreen> {',
    '''class _MyTicketsScreenState extends State<MyTicketsScreen> {
  String? userEmail;
  
  @override
  void initState() {
    super.initState();
    _loadUserEmail();
  }
  
  Future<void> _loadUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString('user_data');
    final userData = userDataString != null ? jsonDecode(userDataString) : null;
    setState(() {
      userEmail = userData?['email'];
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed my_tickets.dart');
}

/// Fix profile_driver_page.dart - Most complex file
Future<void> fixProfileDriverPage() async {
  final file = File('abra_fleet/lib/features/driver/dashboard/presentation/screens/profile_driver_page.dart');
  if (!await file.exists()) return;
  
  print('📄 Fixing profile_driver_page.dart...');
  var content = await file.readAsString();
  
  // Add missing import
  if (!content.contains("import 'dart:convert';")) {
    content = "import 'dart:convert';\n" + content;
  }
  
  // Replace token/prefs references
  content = content.replaceAll(
    RegExp(r'if \(token == null \|\| token\.isEmpty\)'),
    'if (_token == null || _token!.isEmpty)'
  );
  
  content = content.replaceAll(
    RegExp(r'prefs\.getString'),
    '_prefs.getString'
  );
  
  // Fix MultipartFile.fromBytes
  content = content.replaceAll(
    RegExp(r'http\.MultipartFile\.fromBytes\(\s+''profileImage'',\s+imageBytes,\s+\),'),
    'http.MultipartFile.fromBytes(\n            \'profileImage\',\n            imageBytes,\n            filename: \'profile.jpg\',\n          ),'
  );
  
  // Fix MultipartFile.fromPath
  content = content.replaceAll(
    RegExp(r'await http\.MultipartFile\.fromPath\(\s+''profileImage'',\s+imagePath,\s+\),'),
    'await http.MultipartFile.fromPath(\n            \'profileImage\',\n            imagePath,\n            filename: \'profile.jpg\',\n          ),'
  );
  
  // Fix try block without catch
  content = content.replaceAll(
    RegExp(r'try \{\s+request\.files\.add\('),
    'try {\n      request.files.add('
  );
  
  // Add catch block if missing
  if (content.contains('request.send();') && !content.contains('} catch (e) {', content.indexOf('request.send();'))) {
    content = content.replaceAll(
      'final response = await request.send();',
      '''final response = await request.send();
    } catch (e) {
      debugPrint('Error uploading document: \$e');
      rethrow;
    }'''
    );
  }
  
  // Replace response references
  content = content.replaceAll(
    RegExp(r'response\.stream'),
    '_response.stream'
  );
  
  content = content.replaceAll(
    RegExp(r'response\.statusCode'),
    '_response.statusCode'
  );
  
  // Add class-level variables
  content = content.replaceAll(
    'class _ProfileDriverPageState extends State<ProfileDriverPage> {',
    '''class _ProfileDriverPageState extends State<ProfileDriverPage> {
  String? _token;
  SharedPreferences? _prefs;
  http.StreamedResponse? _response;
  
  @override
  void initState() {
    super.initState();
    _loadUserData();
  }
  
  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    setState(() {
      _prefs = prefs;
      _token = token;
    });
  }
'''
  );
  
  await file.writeAsString(content);
  print('  ✅ Fixed profile_driver_page.dart');
}
