// File: lib/main.dart - FIXED VERSION WITH DIAGNOSTICS + CTRL+A SUPPORT
// Abra Travels Management - Main Application Entry Point
// ✅ UPDATED: Now uses JWT authentication with diagnostic logging
// ✅ ADDED: Global Ctrl+A keyboard shortcut support

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show debugPrint, kDebugMode, kIsWeb;
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

// Auth - JWT based
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/features/auth/data/repositories/jwt_auth_repository_impl.dart';
import 'package:abra_fleet/features/auth/domain/entities/user_entity.dart';

// Core
import 'package:abra_fleet/core/services/backend_connection_manager.dart';

// Screens
import 'package:abra_fleet/features/auth/presentation/screens/login_screen.dart';
import 'package:abra_fleet/features/auth/presentation/screens/welcome_screen.dart';
import 'package:abra_fleet/app/presentation/screens/main_app_shell.dart';
import 'package:abra_fleet/features/auth/presentation/screens/splash_screen.dart';

// Vehicle
import 'package:abra_fleet/features/admin/vehicle_management/domain/repositories/vehicle_repository.dart';
import 'package:abra_fleet/features/admin/vehicle_management/data/repositories/api_vehicle_repository_impl.dart';
import 'package:abra_fleet/features/admin/vehicle_management/presentation/providers/vehicle_provider.dart';

// Driver
import 'package:abra_fleet/features/admin/driver_management/domain/repositories/driver_repository.dart';
import 'package:abra_fleet/features/admin/driver_management/data/repositories/mock_driver_repository_impl.dart';
import 'package:abra_fleet/features/admin/driver_management/presentation/providers/driver_provider.dart';

// Customer
import 'package:abra_fleet/features/admin/customer_management/presentation/providers/customer_provider.dart';

// Services
import 'package:abra_fleet/core/services/roster_service.dart';
import 'package:abra_fleet/core/services/api_service.dart';

// Notifications
import 'package:abra_fleet/features/notifications/presentation/providers/notification_provider.dart';

// Import the custom AppTheme
import 'package:abra_fleet/app/config/theme/app_theme.dart';

// Import dashboard screens
import 'package:abra_fleet/features/customer/dashboard/presentation/screens/customer_dashboard.dart';
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart';
import 'package:abra_fleet/features/client/client_main_shell.dart';

// Global navigator key for navigation
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

// ===================================================================
// MAIN FUNCTION - JWT AUTHENTICATION WITH DIAGNOSTICS
// ===================================================================
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize environment variables
  try {
    // For web, .env file loading might fail - use fallback values
    if (kIsWeb) {
      debugPrint("🌐 Running on Web - Using default configuration");
      // Set default values for web
      dotenv.testLoad(fileInput: '''
API_BASE_URL=http://localhost:3001
WEBSOCKET_URL=ws://localhost:3001
FIREBASE_PROJECT_ID=abrafleet-cec94
''');
    } else {
      await dotenv.load(fileName: ".env");
    }
    debugPrint("✅ Environment variables loaded");
    debugPrint("═══════════════════════════════════════════════");
    debugPrint("🔍 ENVIRONMENT CONFIGURATION CHECK");
    debugPrint("═══════════════════════════════════════════════");
    debugPrint("📍 API_BASE_URL: ${dotenv.env['API_BASE_URL']}");
    debugPrint("📍 WEBSOCKET_URL: ${dotenv.env['WEBSOCKET_URL']}");
    debugPrint("═══════════════════════════════════════════════");
  } catch (e) {
    debugPrint("⚠️ Warning: Could not load .env file: $e");
    debugPrint("Using fallback configuration...");
    // Fallback configuration
    dotenv.testLoad(fileInput: '''
API_BASE_URL=http://localhost:3001
WEBSOCKET_URL=ws://localhost:3001
FIREBASE_PROJECT_ID=abrafleet-cec94
''');
  }

  // Initialize Backend Connection Manager
  final connectionManager = BackendConnectionManager();
  try {
    await connectionManager.initialize();
    print("✅ Backend Connection Manager initialized");
  } catch (e) {
    print("❌ Backend Connection Manager initialization failed: $e");
  }

  if (kDebugMode) {
    debugPrint("🔍 Debug mode is enabled");
  }

  // ✅ CREATE JWT AUTH REPOSITORY INSTANCE WITH DIAGNOSTICS
  final jwtAuthRepo = JwtAuthRepositoryImpl();
  
  debugPrint('\n' + '🔍' * 80);
  debugPrint('🔍 AUTH REPOSITORY CREATION');
  debugPrint('🔍' * 80);
  debugPrint('Created Type: ${jwtAuthRepo.runtimeType}');
  debugPrint('Is JwtAuthRepositoryImpl: ${jwtAuthRepo is JwtAuthRepositoryImpl}');
  debugPrint('Is AuthRepository: ${jwtAuthRepo is AuthRepository}');
  debugPrint('Instance: $jwtAuthRepo');
  debugPrint('🔍' * 80 + '\n');

  runApp(
    MultiProvider(
      providers: [
        // ✅ JWT Authentication Repository - Using .value to provide existing instance
        Provider<AuthRepository>.value(value: jwtAuthRepo),
        
        // ✅ Also provide as concrete type for debugging
        Provider<JwtAuthRepositoryImpl>.value(value: jwtAuthRepo),

        // Backend Connection Manager
        Provider<BackendConnectionManager>(
          create: (_) => connectionManager,
        ),

        // API Service
        Provider<ApiService>(
          create: (_) => ApiService(),
        ),

        // Roster Service
        Provider<RosterService>(
          create: (context) => RosterService(
            apiService: context.read<ApiService>(),
          ),
        ),

        // Customer Provider
        ChangeNotifierProvider<CustomerProvider>(
          create: (_) => CustomerProvider()..initialize(),
        ),

        // Driver Provider
        ChangeNotifierProvider<DriverProvider>(
          create: (_) => DriverProvider(),
        ),

        // Vehicle Provider
        ChangeNotifierProvider<VehicleProvider>(
          create: (_) => VehicleProvider(),
        ),

        // Notification Provider
        ChangeNotifierProvider<NotificationProvider>(
          create: (_) => NotificationProvider(),
        ),

        // Add other providers as needed
        // Note: Removed Firebase-dependent providers
      ],
      child: const AbraFleetApp(),
    ),
  );
}

// ===================================================================
// MAIN APP WITH CTRL+A SUPPORT
// ===================================================================
class AbraFleetApp extends StatelessWidget {
  const AbraFleetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Shortcuts(
      shortcuts: <LogicalKeySet, Intent>{
        // For Windows/Linux - Ctrl+A
        LogicalKeySet(LogicalKeyboardKey.control, LogicalKeyboardKey.keyA): 
          const SelectAllIntent(),
        // For Mac - Cmd+A
        LogicalKeySet(LogicalKeyboardKey.meta, LogicalKeyboardKey.keyA): 
          const SelectAllIntent(),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          SelectAllIntent: CallbackAction<SelectAllIntent>(
            onInvoke: (SelectAllIntent intent) {
              // This enables Ctrl+A for focused TextField widgets
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: MaterialApp(
            title: 'Abra Travels Management',
            theme: AppTheme.lightTheme,
            navigatorKey: navigatorKey,
            home: const AuthWrapper(),
            debugShowCheckedModeBanner: false,
          ),
        ),
      ),
    );
  }
}

// ===================================================================
// JWT-BASED AUTH WRAPPER
// ===================================================================
class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  UserEntity? _lastKnownUser;
  bool _isInitializing = true;
  bool _hasInitializedSession = false;

  @override
  void initState() {
    super.initState();
    
    // ✅ ADD DIAGNOSTIC ON INIT
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final authRepo = Provider.of<AuthRepository>(context, listen: false);
        debugPrint('\n' + '🔍' * 80);
        debugPrint('🔍 AUTH WRAPPER - REPOSITORY CHECK');
        debugPrint('🔍' * 80);
        debugPrint('Retrieved Type: ${authRepo.runtimeType}');
        debugPrint('Is JwtAuthRepositoryImpl: ${authRepo is JwtAuthRepositoryImpl}');
        debugPrint('Instance: $authRepo');
        debugPrint('🔍' * 80 + '\n');
      }
    });
    
    _initializeAuthState();
  }

  /// Initialize JWT authentication state on app start
  Future<void> _initializeAuthState() async {
    try {
      final authRepo = Provider.of<AuthRepository>(context, listen: false);
      
      // Check if there's a stored JWT token
      final token = await authRepo.getAuthToken();
      
      if (token != null && token.isNotEmpty) {
        // Get current user with role
        final currentUser = await authRepo.getCurrentUserWithRole();
        
        if (currentUser != UserEntity.empty && currentUser.isAuthenticated) {
          debugPrint('✅ AuthWrapper: Found existing JWT authenticated user: ${currentUser.email}');
          setState(() {
            _lastKnownUser = currentUser;
            _isInitializing = false;
          });
          
          // Initialize session
          _initializeSession(context);
          return;
        }
      }
      
      debugPrint('ℹ️ AuthWrapper: No authenticated user found');
      setState(() {
        _isInitializing = false;
      });
    } catch (e) {
      debugPrint('❌ AuthWrapper: Error initializing auth state: $e');
      setState(() {
        _isInitializing = false;
      });
    }
  }

  /// Initialize session with JWT token
  Future<void> _initializeSession(BuildContext context) async {
    if (_hasInitializedSession) return;
    
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final connectionManager = Provider.of<BackendConnectionManager>(context, listen: false);

    try {
      debugPrint("🔄 AuthWrapper: Starting JWT session initialization...");
      
      final token = await authRepo.getAuthToken();
      
      if (token != null && token.isNotEmpty) {
        connectionManager.apiService.setAuthToken(token);
        debugPrint("✅ AuthWrapper: JWT session initialized. Token set in ApiService.");
        _hasInitializedSession = true;
      } else {
        debugPrint("⚠️ AuthWrapper: No JWT token found.");
        await authRepo.signOut();
      }
    } catch (e) {
      debugPrint("❌ AuthWrapper: Error in JWT session initialization: $e");
    }
  }

  /// Build main app with session initialization
  Widget _buildMainAppWithSession(BuildContext context, UserEntity user) {
    // Initialize session if not already done
    if (!_hasInitializedSession) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted && !_hasInitializedSession) {
          _initializeSession(context).catchError((error) {
            debugPrint("❌ AuthWrapper: Error initializing session: $error");
          });
        }
      });
    }

    // Show the dashboard based on role
    final role = user.role.toString().toLowerCase().trim();
    debugPrint('✅ AuthWrapper - Role: "$role", Loading Dashboard...');

    if (role == 'customer' || role == 'driver' || role == 'admin' || role == 'super_admin' || role == 'superadmin') {
      return const MainAppShell();
    } else if (role == 'client') {
      return const ClientMainShell();
    } else {
      debugPrint('⚠️ AuthWrapper: Unknown role: $role');
      return const ContactSupportScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthRepository>(context);

    return StreamBuilder<UserEntity>(
      stream: auth.user,
      builder: (_, AsyncSnapshot<UserEntity> snapshot) {
        // Show splash screen during initial app load
        if (_isInitializing) {
          return const SplashScreen();
        }

        final UserEntity? user = snapshot.data;

        // Handle connection states
        if (snapshot.connectionState == ConnectionState.waiting) {
          // If we have a last known authenticated user, show their dashboard while waiting
          if (_lastKnownUser != null && _lastKnownUser!.isAuthenticated) {
            debugPrint('🔄 AuthWrapper: Using cached user while waiting for auth stream: ${_lastKnownUser!.email}');
            return _buildMainAppWithSession(context, _lastKnownUser!);
          }
          return const SplashScreen();
        }

        // Handle errors gracefully
        if (snapshot.hasError) {
          debugPrint('❌ AuthWrapper: Auth stream error: ${snapshot.error}');
          if (_lastKnownUser != null && _lastKnownUser!.isAuthenticated) {
            debugPrint('🔄 AuthWrapper: Using cached user despite auth stream error');
            return _buildMainAppWithSession(context, _lastKnownUser!);
          }
          return const WelcomeScreen();
        }

        // Update last known user if we have valid data
        if (user != null && user != UserEntity.empty && user.isAuthenticated) {
          _lastKnownUser = user;
        }

        // If user is null or empty, check cached user
        if (user == null || user == UserEntity.empty) {
          if (_lastKnownUser != null && _lastKnownUser!.isAuthenticated) {
            debugPrint('🔄 AuthWrapper: Auth stream returned null, but using cached authenticated user');
            return _buildMainAppWithSession(context, _lastKnownUser!);
          }
          
          // Clear cached user and show welcome screen
          _lastKnownUser = null;
          _hasInitializedSession = false;
          return const WelcomeScreen();
        }

        // If user exists but has no role, show contact support
        if (user.role == null || user.role.toString().trim().isEmpty) {
          debugPrint('AuthWrapper: User has no role');
          return const ContactSupportScreen();
        }

        // User has valid role, proceed with session initialization
        return _buildMainAppWithSession(context, user);
      },
    );
  }
}

// ===================================================================
// ADMIN DASHBOARD
// ===================================================================
class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            onPressed: () {
              Provider.of<AuthRepository>(context, listen: false).signOut();
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Welcome Admin!'),
            ElevatedButton(
              onPressed: () {
                Provider.of<AuthRepository>(context, listen: false).signOut();
              },
              child: const Text('Sign Out'),
            ),
          ],
        ),
      ),
    );
  }
}

// ===================================================================
// CONTACT SUPPORT SCREEN
// ===================================================================
class ContactSupportScreen extends StatelessWidget {
  const ContactSupportScreen({super.key});

  Future<void> _signOut(BuildContext context) async {
    try {
      final authRepo = Provider.of<AuthRepository>(context, listen: false);
      await authRepo.signOut();

      if (!context.mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const WelcomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error signing out: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Contact Support'),
        actions: [
          IconButton(
            onPressed: () => _signOut(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.support_agent, size: 64, color: Colors.orange),
            const SizedBox(height: 16),
            Text(
              'Role Unclear',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            const Text('Please contact support team for assistance'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _signOut(context),
              child: const Text('Sign Out'),
            ),
          ],
        ),
      ),
    );
  }
}

// ===================================================================
// SELECT ALL INTENT - FOR CTRL+A SUPPORT
// ===================================================================
class SelectAllIntent extends Intent {
  const SelectAllIntent();
}