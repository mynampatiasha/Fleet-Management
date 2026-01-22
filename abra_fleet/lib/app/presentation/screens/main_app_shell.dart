// File: lib/app/presentation/screens/main_app_shell.dart
// This widget acts as a wrapper after login, directing to the correct role-based UI.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/features/auth/domain/entities/user_entity.dart';
import 'package:abra_fleet/features/auth/presentation/screens/welcome_screen.dart';

// Import Notification Provider and Screen
import 'package:abra_fleet/features/notifications/presentation/providers/notification_provider.dart';
import 'package:abra_fleet/features/notifications/presentation/screens/notifications_screen.dart';

// Import Admin Shell
import 'package:abra_fleet/features/admin/shell/admin_main_shell.dart';

// MODIFICATION: Import the new parent screen for the Driver UI
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/driver_main_parent_screen.dart';

// Import the PARENT screen for the customer UI
import 'package:abra_fleet/features/customer/dashboard/presentation/screens/customer_main_parent_screen.dart'; 

class MainAppShell extends StatefulWidget {
  const MainAppShell({super.key});
  static const String routeName = '/main_shell';
  @override
  State<MainAppShell> createState() => _MainAppShellState();
}

class _MainAppShellState extends State<MainAppShell> {
  // MODIFICATION: All driver-specific navigation state has been removed from this file.
  // It is now managed inside 'driver_main_parent_screen.dart'.

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotificationProvider>(context, listen: false).fetchUnreadNotificationCount();
    });
  }

  // This notification badge logic can be used by other roles if needed.
  Widget _buildNotificationBadge(BuildContext context) {
    return Consumer<NotificationProvider>(
      builder: (context, notificationProvider, child) {
        final unreadCount = notificationProvider.unreadCount;
        return Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              tooltip: 'Notifications',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                );
              },
            ),
            if (unreadCount > 0)
              Positioned(
                top: 8, right: 8,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(8)),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Text(
                    '$unreadCount',
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthRepository authRepository) {
    return IconButton(
      icon: const Icon(Icons.logout),
      tooltip: 'Logout',
      onPressed: () async {
        await authRepository.signOut();
        if (context.mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const WelcomeScreen()),
            (Route<dynamic> route) => false,
          );
        }
      },
    );
  }

@override
Widget build(BuildContext context) {
  final authRepository = Provider.of<AuthRepository>(context, listen: false);
  
  return StreamBuilder<UserEntity>(
    stream: authRepository.user,
    builder: (context, snapshot) {
      if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      }

      if (snapshot.hasError) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          authRepository.signOut();
        });
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      }

      final currentUser = snapshot.data;

      if (currentUser == null || currentUser == UserEntity.empty || !currentUser.isAuthenticated) {
        return const WelcomeScreen();
      }

      if (currentUser.role == null || currentUser.role!.trim().isEmpty) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Account Setup Required'),
            actions: [_buildLogoutButton(context, authRepository)],
          ),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.orange),
                const SizedBox(height: 16),
                const Text('No role assigned to your account'),
                const SizedBox(height: 8),
                const Text('Please contact support for assistance'),
                const SizedBox(height: 8),
                Text('User: ${currentUser.email}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => authRepository.signOut(),
                  child: const Text('Sign Out'),
                ),
              ],
            ),
          ),
        );
      }

      final userRole = currentUser.role!.toLowerCase().trim();
      
      // Debug logging for role routing
      print('🔄 [MainAppShell] Routing user with role: "$userRole"');

      switch (userRole) {
        case 'admin':
        case 'super_admin':
        case 'superadmin':
        case 'employee': 
        case 'org_admin':
        case 'hr_manager':
        case 'fleet_manager':
        case 'finance':
        case 'operations':
          print('✅ [MainAppShell] Routing to AdminMainShell');
          return AdminMainShell(authRepository: authRepository);

        case 'driver':
          print('✅ [MainAppShell] Routing to DriverMainShell');
          return const DriverMainShell(); 

        case 'customer':
          print('✅ [MainAppShell] Routing to CustomerMainScreen');
          return const CustomerMainScreen();

        default:
          return Scaffold(
            appBar: AppBar(
              title: const Text('Account Setup Required'),
              actions: [_buildLogoutButton(context, authRepository)],
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.orange),
                  const SizedBox(height: 16),
                  Text(
                    'Unknown Role: "$userRole"',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  const Text('Please contact support to assign a proper role'),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => authRepository.signOut(),
                    child: const Text('Sign Out'),
                  ),
                ],
              ),
            ),
          );
      }
    },
  );
}
}