import 'package:flutter/material.dart';
import 'dart:async'; 

// ✅ IMPORT NOTIFICATION SERVICE & SCREEN
import 'package:abra_fleet/core/services/notification_service.dart';
import 'package:abra_fleet/features/notifications/presentation/screens/driver_notifications_screen.dart';

// Import your feature pages
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart';
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/trips_driver_page.dart';
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/customer_driver_page.dart';
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/reports_driver_page.dart';
import 'package:abra_fleet/features/driver/dashboard/presentation/screens/profile_driver_page.dart';

// ✅ IMPORT REAL-TIME FLEET MANAGEMENT
// DISABLED: Live Fleet feature is currently not needed
// import 'package:abra_fleet/features/driver/dashboard/presentation/screens/real_time_fleet_dashboard.dart';

const Color kPrimaryColor = Color(0xFF0D47A1);

class DriverMainShell extends StatefulWidget {
  const DriverMainShell({super.key});

  @override
  State<DriverMainShell> createState() => _DriverMainShellState();
}

class _DriverMainShellState extends State<DriverMainShell> {
  int _selectedIndex = 0;
  
  // ✅ Notification Variables
  final NotificationService _notificationService = NotificationService();
  StreamSubscription<Map<String, dynamic>>? _notificationSubscription;
  bool _notificationsInitialized = false;

  late final List<Widget> _widgetOptions;

  @override
  void initState() {
    super.initState();
    
    // ✅ Initialize Notifications
    _initializeNotifications();
    
    _widgetOptions = <Widget>[
      // Index 0: Dashboard (Live Fleet feature disabled)
      DriverDashboardScreen(
        onNavigateToReportTab: () => _onItemTapped(3), // Navigate to Reports tab
        onNavigateToNotifications: _navigateToNotifications, // Navigate to Notif Screen
      ),
      // Index 1: Trips
      const TripsDriverPage(),
      // Index 2: Customers
      const CustomerDriverPage(),
      // Index 3: Reports
      const ReportsDriverPage(),
      // Index 4: Profile
      const ProfileDriverPage(),
    ];
  }

  // ✅ Navigation Logic
  void _navigateToNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const DriverNotificationsScreen()),
    );
  }

  // ✅ Initialize Service & Listeners
  Future<void> _initializeNotifications() async {
    try {
      await _notificationService.initialize();
      
      // Listen for incoming notifications
      _notificationSubscription = _notificationService.onNewNotification.listen((notification) {
        if (mounted) {
          // Check for specific Vehicle Assignment event
          if (notification['type'] == 'vehicle_assigned') {
            _showVehicleAssignedDialog(notification);
          }
        }
      });

      if (mounted) {
        setState(() {
          _notificationsInitialized = true;
        });
      }
    } catch (e) {
      debugPrint('Error initializing notifications: $e');
    }
  }

  @override
  void dispose() {
    _notificationSubscription?.cancel();
    _notificationService.dispose();
    super.dispose();
  }

  // ✅ Special Dialog for Vehicle Assignment
  void _showVehicleAssignedDialog(Map<String, dynamic> notification) {
    final data = notification['data'] ?? {};
    final vehicleName = data['vehicleName'] ?? 'a vehicle';
    final regNumber = data['registrationNumber'] ?? '';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.directions_car, color: kPrimaryColor, size: 28),
            SizedBox(width: 10),
            Text('Vehicle Assigned'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(notification['body'] ?? 'You have been assigned a new vehicle.'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Vehicle: $vehicleName', style: const TextStyle(fontWeight: FontWeight.bold)),
                  if (regNumber.isNotEmpty)
                    Text('Registration: $regNumber', style: TextStyle(color: Colors.grey[800])),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: kPrimaryColor),
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Acknowledge'),
          ),
        ],
      ),
    );
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          IndexedStack(
            index: _selectedIndex,
            children: _widgetOptions,
          ),
          // Connection Indicator (Optional)
          if (!_notificationsInitialized)
             Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                    SizedBox(width: 8),
                    Text('Connecting...', style: TextStyle(color: Colors.white, fontSize: 10)),
                  ],
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: _buildCustomBottomNavBar(),
    );
  }

  Widget _buildCustomBottomNavBar() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            // Live Fleet navigation item removed - feature disabled
            _buildNavItem(icon: Icons.dashboard_rounded, label: 'Dashboard', index: 0),
            _buildNavItemWithBadge(icon: Icons.drive_eta_rounded, label: 'Trips', index: 1, badgeCount: 0),
            _buildNavItem(icon: Icons.people_alt_rounded, label: 'Customers', index: 2),
            _buildNavItem(icon: Icons.bar_chart_rounded, label: 'Reports', index: 3),
            _buildNavItem(icon: Icons.person_rounded, label: 'Profile', index: 4),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({required IconData icon, required String label, required int index}) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => _onItemTapped(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        width: 60,
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 6),
        decoration: BoxDecoration(
          color: isSelected ? kPrimaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 24, color: isSelected ? Colors.white : Colors.grey[700]),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.grey[600]), overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItemWithBadge({required IconData icon, required String label, required int index, required int badgeCount}) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        _buildNavItem(icon: icon, label: label, index: index),
        if (badgeCount > 0)
          Positioned(
            top: -4, right: 4,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: Colors.red, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 1.5)),
              constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
              child: Text('$badgeCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            ),
          ),
      ],
    );
  }
}