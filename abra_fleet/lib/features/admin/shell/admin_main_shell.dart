// lib/features/admin/shell/admin_main_shell.dart

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:provider/provider.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

// Core Services
import 'package:abra_fleet/core/services/api_service.dart';
import 'package:abra_fleet/core/services/safe_api_service.dart';
import 'package:abra_fleet/core/services/error_handler_service.dart';
import 'package:abra_fleet/core/services/roster_service.dart';
import 'package:abra_fleet/core/services/backend_connection_manager.dart';
import 'package:abra_fleet/core/services/floating_notification_service.dart';
import 'package:abra_fleet/core/services/permission_service.dart';
// Role navigation handled by backend permissions
// // Role navigation handled by backend permissions
// import 'package:abra_fleet/core/services/role_navigation_service.dart';
import 'package:abra_fleet/core/services/trip_notification_service.dart';

// OneSignal and WebSocket Services (replaces Firebase)
import 'package:abra_fleet/core/services/one_signal_service.dart';
import 'package:abra_fleet/core/services/websocket_service.dart';

//api_config
import 'package:abra_fleet/app/config/api_config.dart';

import 'package:abra_fleet/features/admin/dashboard/presentation/screens/sos_alert.dart';

// Auth and other screens
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/features/auth/domain/entities/user_entity.dart';
import 'package:abra_fleet/features/auth/presentation/screens/welcome_screen.dart';
import 'package:abra_fleet/features/admin/reports/presentation/screens/admin_reports_screen.dart';
import 'package:abra_fleet/features/admin/dashboard/presentation/screens/admin_dashboard_screen.dart';

// Vehicle Management Screens
import 'package:abra_fleet/features/admin/vehicle_admin_management/maintainace_managemnt/maintainance_management.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/trip_operations/trip_operation.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/reports_analytics/reports_analytics_screen.dart';

import 'package:abra_fleet/features/admin/vehicle_admin_management/vehicle_master/add_vehicle.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/trip_operations/start_new_trip.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/trip_operations/gps_tracking.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/consecutive_trips_admin.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/enhanced_fleet_map_screen.dart';

import 'package:abra_fleet/features/admin/driver_admin_management/driver_admin_management_screen.dart';
import 'package:abra_fleet/features/admin/customer_management/presentation/screens/admin_customer_list_screen.dart';
import 'package:abra_fleet/features/admin/maintenance_management/presentation/screens/admin_maintenance_log_screen.dart';
import 'package:abra_fleet/features/notifications/presentation/providers/notification_provider.dart';
import 'package:abra_fleet/features/notifications/presentation/screens/admin_notifications_screen.dart';
import 'package:abra_fleet/features/admin/dashboard/presentation/screens/resolved_alerts_view.dart';
import 'package:abra_fleet/features/admin/dashboard/presentation/screens/map_screen.dart';
import 'package:abra_fleet/features/admin/vehicle_management/presentation/providers/vehicle_provider.dart';

// Client Management
import 'package:abra_fleet/features/admin/client_management/client_admin_dashboard_screen.dart';
import 'package:abra_fleet/features/admin/client_management/trips_client.dart';

// Customer Management Screens
import 'package:abra_fleet/features/admin/customer_management/admin_all_customers.dart';
import 'package:abra_fleet/features/admin/customer_management/admin_pending_customers.dart';

// Roster Management - Updated to use modified_pending_screen.dart
import 'package:abra_fleet/features/admin/customer_management/notification/roster_model.dart';
import 'package:abra_fleet/features/admin/customer_management/notification/modified_pending_screen.dart';
import 'package:abra_fleet/features/admin/customer_management/notification/roster_assignment_screen.dart';
import 'package:abra_fleet/features/admin/customer_management/notification/approved_rosters_screen.dart';
import 'package:abra_fleet/features/admin/customer_management/notification/edit_roster_assignment_screen.dart';

// Leave Trip Management
import 'package:abra_fleet/features/admin/leave_trip_management.dart';

// User Role & Admin Access
import 'package:abra_fleet/features/admin/role_based_access/user_management_screen.dart';

// HRM Portal
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_portal_screen.dart';
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/unified_feedback_management_screen.dart';
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_notice_board_screen.dart';
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_attendance_screen.dart';
import 'package:abra_fleet/features/admin/hrm/hrm_employees_screen.dart';  // ← ADD THIS
//import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_departments_screen.dart';  // ← ADD THIS
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_leave_requests_screen.dart';  // ← ADD LEAVE REQUESTS
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_payroll_screen.dart';  // ← ADD PAYROLL

// TMS Screens
import 'package:abra_fleet/features/TMS/raise_ticket.dart';
import 'package:abra_fleet/features/TMS/my_tickets.dart';
import 'package:abra_fleet/features/TMS/all_tickets.dart';
import 'package:abra_fleet/features/TMS/closed_tickets.dart';

// Billing System
import 'package:abra_fleet/features/admin/Billing/billing_main_shell.dart';

// Support System
import 'package:abra_fleet/features/support/support_system_screen.dart';

const Color kPrimaryColor = Color(0xFF0D47A1);

// Navigation Keys Constants
class NavigationKeys {
  static const String dashboard = 'dashboard';
  static const String drivers = 'drivers';
  static const String customerManagement = 'customer_management';
  static const String clientManagement = 'client_management';
  static const String maintenance = 'maintenance';
  static const String fleetMap = 'fleet_map';
  static const String fleetManagement = 'fleet_management';
  static const String reports = 'reports';
  static const String resolvedAlerts = 'resolved_alerts';
  static const String incompleteAlerts = 'incomplete_alerts';
  static const String settings = 'settings';
  static const String profile = 'profile';
  static const String vehicleMaster = 'vehicle_master';
  static const String tripOperation = 'trip_operation';
  static const String maintenanceManagement = 'maintenance_management';
  static const String vehicleReports = 'vehicle_reports';
  static const String allCustomers = 'all_customers';
  static const String pendingApprovals = 'pending_approvals';
  static const String pendingRosters = 'pending_rosters';
  static const String approvedRosters = 'approved_rosters';
  static const String tripCancellation = 'trip_cancellation';
  static const String clientDetails = 'client_details';
  static const String trips = 'trips';
  static const String hrmPortal = 'hrm_portal';
  static const String roleAccessControl = 'role_access_control';
  static const String gpsTracking = 'gps_tracking';
  static const String feedbackManagement = 'feedback_management';
  static const String noticeBoard = 'notice_board';
  static const String attendance = 'attendance';
  static const String hrmEmployees = 'hrm_employees';  // ← ADD THIS
  //static const String hrmDepartments = 'hrm_departments';  // ← ADD THIS
  static const String hrmLeaveRequests = 'hrm_leave_requests';  // ← ADD LEAVE REQUESTS
  static const String hrmPayroll = 'hrm_payroll';  // ← ADD PAYROLL
  
  // Billing System Navigation Key
  static const String billingSystem = 'billing_system';
  
  // TMS Navigation Keys
  static const String raiseTicket = 'raise_ticket';
  static const String myTickets = 'my_tickets';
  static const String allTickets = 'all_tickets';
  static const String closedTickets = 'closed_tickets';
}

class IncompleteSOSAlert {
  final String id;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String address;
  final DateTime timestamp;
  final String? driverName;
  final String? driverPhone;
  final String? vehicleReg;
  final String? vehicleMake;
  final String? vehicleModel;
  final String? tripId;
  final String? pickupLocation;
  final String? dropLocation;
  final double latitude;
  final double longitude;
  final String status;
  final String? policeEmailContacted;
  final String? emailSentStatus;
  final String? policeCity;
  final String notes;

  IncompleteSOSAlert({
    required this.id,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    required this.address,
    required this.timestamp,
    this.driverName,
    this.driverPhone,
    this.vehicleReg,
    this.vehicleMake,
    this.vehicleModel,
    this.tripId,
    this.pickupLocation,
    this.dropLocation,
    required this.latitude,
    required this.longitude,
    required this.status,
    this.policeEmailContacted,
    this.emailSentStatus,
    this.policeCity,
    this.notes = '',
  });

  factory IncompleteSOSAlert.fromJson(Map<String, dynamic> json) {
    // Handle location data - could be in different formats
    double lat = 0.0;
    double lon = 0.0;
    
    if (json['location'] != null && json['location']['coordinates'] != null) {
      // MongoDB GeoJSON format: [longitude, latitude]
      final coords = json['location']['coordinates'] as List;
      if (coords.length >= 2) {
        lon = (coords[0] as num).toDouble();
        lat = (coords[1] as num).toDouble();
      }
    } else if (json['gps'] != null) {
      // Firebase format
      lat = (json['gps']['latitude'] as num?)?.toDouble() ?? 0.0;
      lon = (json['gps']['longitude'] as num?)?.toDouble() ?? 0.0;
    }

    return IncompleteSOSAlert(
      id: json['_id']?.toString() ?? '',
      customerName: json['customerName']?.toString() ?? 'Unknown',
      customerEmail: json['customerEmail']?.toString() ?? '',
      customerPhone: json['customerPhone']?.toString() ?? '',
      address: json['address']?.toString() ?? 'Address not available',
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp'].toString())
          : DateTime.now(),
      driverName: json['driverName']?.toString(),
      driverPhone: json['driverPhone']?.toString(),
      vehicleReg: json['vehicleReg']?.toString(),
      vehicleMake: json['vehicleMake']?.toString(),
      vehicleModel: json['vehicleModel']?.toString(),
      tripId: json['tripId']?.toString(),
      pickupLocation: json['pickupLocation']?.toString(),
      dropLocation: json['dropLocation']?.toString(),
      latitude: lat,
      longitude: lon,
      status: json['status']?.toString() ?? 'ACTIVE',
      policeEmailContacted: json['policeEmailContacted']?.toString(),
      emailSentStatus: json['emailSentStatus']?.toString(),
      policeCity: json['policeCity']?.toString(),
      notes: json['adminNotes']?.toString() ?? json['notes']?.toString() ?? '',
    );
  }

  // Helper methods
  bool get wasPoliceNotified => emailSentStatus == 'sent';
  String get vehicleFullName => vehicleMake != null && vehicleModel != null 
      ? '$vehicleMake $vehicleModel${vehicleReg != null ? ' ($vehicleReg)' : ''}'
      : vehicleReg ?? 'N/A';
  String get googleMapsUrl => 'https://maps.google.com/?q=$latitude,$longitude';
}

class IncompleteAlertsView extends StatefulWidget {
  const IncompleteAlertsView({super.key});

  @override
  State<IncompleteAlertsView> createState() => _IncompleteAlertsViewState();
}

class _IncompleteAlertsViewState extends State<IncompleteAlertsView> with ErrorHandlerMixin {
  final SafeApiService _safeApi = SafeApiService();
  
  List<IncompleteSOSAlert> _activeAlerts = [];
  bool _isLoading = true;
  String? _errorMessage;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _fetchActiveAlerts();
    // Auto-refresh every 30 seconds for real-time updates
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) _fetchActiveAlerts();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchActiveAlerts() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      debugPrint('📥 Fetching active SOS alerts from backend...');
      
      // Use SafeApiService for graceful error handling
      final response = await _safeApi.safeGet(
        '/api/sos',
        queryParams: {
          'status': 'ACTIVE',
          'limit': '100',
        },
        context: 'Active SOS Alerts',
        fallback: {'status': 'success', 'data': []},
      );

      debugPrint('📡 Response received: ${response['status']}');

      if (response['status'] == 'success' && response['data'] != null) {
        final List<dynamic> alertsJson = response['data'];
        final List<IncompleteSOSAlert> newActive = alertsJson
            .map((json) => IncompleteSOSAlert.fromJson(json))
            .toList();
        
        // Sort by timestamp (most recent first)
        newActive.sort((a, b) => b.timestamp.compareTo(a.timestamp));
        
        debugPrint('✅ Loaded ${newActive.length} active alerts');
        
        if (mounted) {
          setState(() => _activeAlerts = newActive);
        }
      } else if (response['offline'] == true) {
        // Handle offline mode gracefully
        debugPrint('📡 Backend offline - showing cached data or empty state');
        if (mounted) {
          setState(() => _activeAlerts = []);
        }
      }
    } catch (e) {
      handleSilentError(e, context: 'Active SOS Alerts');
      if (mounted) {
        setState(() => _activeAlerts = []);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _resolveAlert(IncompleteSOSAlert alert) async {
    // Show resolve options dialog
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Resolve SOS Alert'),
        content: const Text('How would you like to resolve this alert?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, 'cancel'),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, 'simple'),
            child: const Text('Quick Resolve'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, 'with_proof'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: const Text('Resolve with Proof'),
          ),
        ],
      ),
    );

    if (result == 'simple') {
      await _resolveAlertSimple(alert);
    } else if (result == 'with_proof') {
      await _resolveAlertWithProof(alert);
    }
  }

  Future<void> _resolveAlertSimple(IncompleteSOSAlert alert) async {
    // Show quick resolve dialog with notes input
    final notesController = TextEditingController();
    
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.check_circle_outline, color: Colors.green[600]),
            const SizedBox(width: 8),
            const Text('Quick Resolve'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Alert summary
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SOS Alert Summary',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Customer: ${alert.customerName}'),
                  if (alert.driverName != null)
                    Text('Driver: ${alert.driverName}'),
                  if (alert.vehicleReg != null)
                    Text('Vehicle: ${alert.vehicleReg}'),
                  Text('Location: ${alert.address}'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Resolution Notes *',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: notesController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Briefly describe how the issue was resolved...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Note: This will resolve the alert without photo proof.',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, 'cancel'),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (notesController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please enter resolution notes'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              Navigator.pop(context, notesController.text.trim());
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Quick Resolve'),
          ),
        ],
      ),
    );

    if (result != null && result != 'cancel') {
      await _performQuickResolve(alert, result);
    }
  }

  Future<void> _performQuickResolve(IncompleteSOSAlert alert, String resolutionNotes) async {
    try {
      debugPrint('✅ Performing quick resolve for SOS alert: ${alert.id}');
      
      final response = await _safeApi.safePost(
        '/api/sos/${alert.id}/resolve',
        body: {
          'status': 'Resolved',
          'resolvedBy': 'Admin', // TODO: Get from AuthRepository
          'resolvedAt': DateTime.now().toIso8601String(),
          'adminNotes': resolutionNotes, // Add the resolution notes
          'resolutionType': 'quick_resolve', // Mark as quick resolve
        },
        context: 'Quick Resolve SOS Alert',
        fallback: {'success': false},
      );

      if (response['success'] != false && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ SOS alert for ${alert.customerName} has been resolved quickly.'),
            backgroundColor: Colors.green,
          ),
        );
        await _fetchActiveAlerts(); // Refresh the list
      } else if (response['offline'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠️ Cannot resolve alert while offline. Please try again when connected.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      handleSilentError(e, context: 'Quick Resolve SOS Alert');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Unable to resolve alert at this time. Please try again.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  Future<void> _resolveAlertWithProof(IncompleteSOSAlert alert) async {
    await showDialog(
      context: context,
      builder: (context) => _ResolveWithProofDialog(
        alert: alert,
        onResolved: () async {
          await _fetchActiveAlerts(); // Refresh the list
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF8FAFC),
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _activeAlerts.isEmpty
              ? _buildEmptyState()
              : _buildAlertsList(),
    );
  }

  Widget _buildAlertsList() {
    return RefreshIndicator(
      onRefresh: _fetchActiveAlerts,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "🚨 Active SOS Alerts (${_activeAlerts.length})",
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.red[700],
                  ),
                ),
                Row(
                  children: [
                    if (_activeAlerts.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'URGENT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.red[700],
                          ),
                        ),
                      ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.refresh),
                      onPressed: _isLoading ? null : _fetchActiveAlerts,
                      tooltip: 'Refresh Alerts',
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: _activeAlerts.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final alert = _activeAlerts[index];
                return Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.red.shade300, width: 2),
                  ),
                  child: InkWell(
                    onTap: () => _showAlertDetails(alert),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          colors: [Colors.red.shade50, Colors.white],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade100,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Icon(Icons.warning_amber_rounded, color: Colors.red.shade700, size: 24),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        alert.customerName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      if (alert.customerPhone.isNotEmpty)
                                        Text(
                                          alert.customerPhone,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                Column(
                                  children: [
                                    if (alert.wasPoliceNotified)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.shade50,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.local_police, size: 12, color: Colors.blue.shade700),
                                            const SizedBox(width: 4),
                                            Text(
                                              'Police Notified',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.blue.shade700,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatTimeAgo(alert.timestamp),
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Colors.red[600],
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildInfoRow(Icons.location_on, alert.address),
                            const SizedBox(height: 4),
                            if (alert.driverName != null) ...[
                              _buildInfoRow(Icons.person, 'Driver: ${alert.driverName}${alert.driverPhone != null ? ' (${alert.driverPhone})' : ''}'),
                              const SizedBox(height: 4),
                            ],
                            if (alert.vehicleReg != null) ...[
                              _buildInfoRow(Icons.directions_car, 'Vehicle: ${alert.vehicleFullName}'),
                              const SizedBox(height: 4),
                            ],
                            if (alert.tripId != null) ...[
                              _buildInfoRow(Icons.route, 'Trip ID: ${alert.tripId}'),
                              const SizedBox(height: 4),
                            ],
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () => _showAlertDetails(alert),
                                    icon: const Icon(Icons.visibility, size: 16),
                                    label: const Text('View Details'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.blue[600],
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () => _resolveAlert(alert),
                                    icon: const Icon(Icons.check_circle, size: 16),
                                    label: const Text('Resolve'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green[600],
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }

  void _showAlertDetails(IncompleteSOSAlert alert) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.red.shade700, size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '🚨 Active SOS Alert',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Received ${_formatTimeAgo(alert.timestamp)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailSection('🧑‍💼 Customer Information', [
                        _buildDetailRow('Name', alert.customerName),
                        if (alert.customerEmail.isNotEmpty)
                          _buildDetailRow('Email', alert.customerEmail),
                        if (alert.customerPhone.isNotEmpty)
                          _buildDetailRow('Phone', alert.customerPhone),
                      ]),
                      const SizedBox(height: 16),
                      if (alert.driverName != null || alert.vehicleReg != null) ...[
                        _buildDetailSection('🚗 Trip Information', [
                          if (alert.driverName != null)
                            _buildDetailRow('Driver', alert.driverName!),
                          if (alert.driverPhone != null)
                            _buildDetailRow('Driver Phone', alert.driverPhone!),
                          if (alert.vehicleReg != null)
                            _buildDetailRow('Vehicle', alert.vehicleFullName),
                          if (alert.tripId != null)
                            _buildDetailRow('Trip ID', alert.tripId!),
                          if (alert.pickupLocation != null)
                            _buildDetailRow('Pickup', alert.pickupLocation!),
                          if (alert.dropLocation != null)
                            _buildDetailRow('Drop', alert.dropLocation!),
                        ]),
                        const SizedBox(height: 16),
                      ],
                      _buildDetailSection('📍 Location Information', [
                        _buildDetailRow('Address', alert.address),
                        _buildDetailRow('Coordinates', '${alert.latitude.toStringAsFixed(6)}, ${alert.longitude.toStringAsFixed(6)}'),
                        Row(
                          children: [
                            const SizedBox(width: 120),
                            ElevatedButton.icon(
                              onPressed: () => _openGoogleMaps(alert),
                              icon: const Icon(Icons.map, size: 16),
                              label: const Text('Open in Maps'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                            ),
                          ],
                        ),
                      ]),
                      const SizedBox(height: 16),
                      if (alert.wasPoliceNotified) ...[
                        _buildDetailSection('🚔 Police Notification', [
                          _buildDetailRow('Status', 'Police Notified ✅'),
                          if (alert.policeEmailContacted != null)
                            _buildDetailRow('Email Sent To', alert.policeEmailContacted!),
                          if (alert.policeCity != null)
                            _buildDetailRow('City', alert.policeCity!),
                        ]),
                        const SizedBox(height: 16),
                      ],
                      _buildDetailSection('⏰ Alert Details', [
                        _buildDetailRow('Alert Time', DateFormat('MMM dd, yyyy hh:mm a').format(alert.timestamp)),
                        _buildDetailRow('Status', alert.status),
                        if (alert.notes.isNotEmpty)
                          _buildDetailRow('Notes', alert.notes),
                      ]),
                    ],
                  ),
                ),
              ),
              // Action Buttons
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _openGoogleMaps(alert),
                        icon: const Icon(Icons.map),
                        label: const Text('Open Maps'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _resolveAlert(alert);
                        },
                        icon: const Icon(Icons.check_circle),
                        label: const Text('Resolve Alert'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openGoogleMaps(IncompleteSOSAlert alert) {
    // For web, open in new tab
    if (kIsWeb) {
      // ignore: avoid_web_libraries_in_flutter
      html.window.open(alert.googleMapsUrl, '_blank');
    } else {
      // For mobile, you could use url_launcher package
      debugPrint('Opening Google Maps: ${alert.googleMapsUrl}');
    }
  }

  Widget _buildDetailSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(color: Colors.grey[700], fontSize: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return RefreshIndicator(
      onRefresh: _fetchActiveAlerts,
      child: ListView(
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.2),
          Icon(Icons.check_circle_outline, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              "No Active SOS Alerts",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
          ),
          const Center(
            child: Text(
              "All emergency alerts have been resolved.",
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: ElevatedButton.icon(
              onPressed: _fetchActiveAlerts,
              icon: const Icon(Icons.refresh),
              label: const Text('Refresh'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 🆕 RESOLVE WITH PROOF DIALOG
// ============================================================================

class _ResolveWithProofDialog extends StatefulWidget {
  final IncompleteSOSAlert alert;
  final VoidCallback onResolved;

  const _ResolveWithProofDialog({
    required this.alert,
    required this.onResolved,
  });

  @override
  State<_ResolveWithProofDialog> createState() => _ResolveWithProofDialogState();
}

class _ResolveWithProofDialogState extends State<_ResolveWithProofDialog> {
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;
  String? _selectedImagePath;
  String? _selectedImageName;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    if (kIsWeb) {
      // For web, use HTML file input
      // ignore: avoid_web_libraries_in_flutter
      final html.FileUploadInputElement uploadInput = html.FileUploadInputElement();
      uploadInput.accept = 'image/*';
      uploadInput.click();

      uploadInput.onChange.listen((e) {
        final files = uploadInput.files;
        if (files!.length == 1) {
          final file = files[0];
          final reader = html.FileReader();
          reader.readAsDataUrl(file);
          reader.onLoad.listen((e) {
            setState(() {
              _selectedImagePath = reader.result as String;
              _selectedImageName = file.name;
            });
          });
        }
      });
    } else {
      // For mobile/desktop, you would use image_picker package
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Image selection is available on web only'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  Future<void> _submitResolution() async {
    if (_notesController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter resolution notes'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_selectedImagePath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a proof photo'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // TODO: Replace with AuthRepository
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;
      if (user == null) {
        throw Exception('User not authenticated');
      }

      if (kIsWeb) {
        await _submitWebResolution(user);
      } else {
        throw Exception('Mobile resolution not implemented yet');
      }

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ SOS alert for ${widget.alert.customerName} resolved with proof!'),
            backgroundColor: Colors.green,
          ),
        );
        widget.onResolved();
      }
    } catch (e) {
      debugPrint('❌ Error submitting resolution: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting resolution: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Future<void> _submitWebResolution(UserEntity user) async {
    // Convert base64 image to bytes
    final base64Data = _selectedImagePath!.split(',')[1];
    final bytes = base64Decode(base64Data);

    // Create multipart request
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/sos/resolve');
    final request = http.MultipartRequest('POST', uri);

    // Add headers - Get JWT token from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    // Add form fields
    request.fields['sosId'] = widget.alert.id;
    request.fields['resolutionNotes'] = _notesController.text.trim();
    request.fields['resolvedBy'] = user.email ?? 'Admin';
    request.fields['latitude'] = widget.alert.latitude.toString();
    request.fields['longitude'] = widget.alert.longitude.toString();

    // Add file
    request.files.add(
      http.MultipartFile.fromBytes(
        'photo',
        bytes,
        filename: _selectedImageName ?? 'proof.jpg',
      ),
    );

    // Send request
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    debugPrint('📡 Resolution response: ${response.statusCode}');
    debugPrint('📡 Resolution body: ${response.body}');

    if (response.statusCode != 200) {
      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to resolve SOS');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green.shade700, size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Resolve with Proof',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'SOS Alert for ${widget.alert.customerName}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Alert Summary
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Alert Summary',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text('Customer: ${widget.alert.customerName}'),
                          if (widget.alert.driverName != null)
                            Text('Driver: ${widget.alert.driverName}'),
                          if (widget.alert.vehicleReg != null)
                            Text('Vehicle: ${widget.alert.vehicleReg}'),
                          Text('Location: ${widget.alert.address}'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Photo Upload
                    const Text(
                      'Proof Photo *',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      height: 200,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: _selectedImagePath != null
                          ? Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    _selectedImagePath!,
                                    width: double.infinity,
                                    height: double.infinity,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: IconButton(
                                    onPressed: () => setState(() {
                                      _selectedImagePath = null;
                                      _selectedImageName = null;
                                    }),
                                    icon: const Icon(Icons.close),
                                    style: IconButton.styleFrom(
                                      backgroundColor: Colors.red,
                                      foregroundColor: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            )
                          : InkWell(
                              onTap: _pickImage,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_a_photo, size: 48, color: Colors.grey[400]),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Tap to select proof photo',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                    ),
                    const SizedBox(height: 20),
                    // Resolution Notes
                    const Text(
                      'Resolution Notes *',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: 'Describe how the emergency was resolved...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Location Info
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.location_on, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Resolution Location',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  '${widget.alert.latitude.toStringAsFixed(6)}, ${widget.alert.longitude.toStringAsFixed(6)}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Action Buttons
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: _isSubmitting ? null : _submitResolution,
                      icon: _isSubmitting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.check_circle),
                      label: Text(_isSubmitting ? 'Submitting...' : 'Resolve with Proof'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AdminMainShell extends StatefulWidget {
  final AuthRepository authRepository;
  
  const AdminMainShell({
    super.key,
    required this.authRepository,
  });

  @override
  State<AdminMainShell> createState() => _AdminMainShellState();
}

class _AdminMainShellState extends State<AdminMainShell> with AutomaticKeepAliveClientMixin, TickerProviderStateMixin, ErrorHandlerMixin {
  // Safe API Service
  final SafeApiService _safeApi = SafeApiService();
  
  // Permission Service
  final PermissionService _permissionService = PermissionService();
  Map<String, dynamic> _userPermissions = {};
  bool _permissionsLoaded = false;
  
  static int _persistedSelectedIndex = 0;
  static bool _isFirstBuild = true;
  static bool _hasBeenReset = false;
  int _selectedIndex = 0;
  
  // NEW: String-based navigation
  String _selectedNavigationKey = NavigationKeys.dashboard;
  
  // Navigation mapping from keys to screen indices
  Map<String, int> _navigationMap = {
  NavigationKeys.dashboard: 0,
  NavigationKeys.drivers: 1,
  NavigationKeys.customerManagement: 2,
  NavigationKeys.clientManagement: 3,
  NavigationKeys.maintenance: 4,
  NavigationKeys.fleetManagement: 5,
  NavigationKeys.fleetMap: 5,              // ✅ FIXED: Fleet Map View points to FleetVehiclesListScreen
  NavigationKeys.reports: 6,               // ✅ SHIFTED back from 7 to 6
  NavigationKeys.resolvedAlerts: 7,        // ✅ SHIFTED back from 8 to 7
  NavigationKeys.incompleteAlerts: 8,      // ✅ SHIFTED back from 9 to 8
  NavigationKeys.settings: 9,              // ✅ SHIFTED back from 10 to 9
  NavigationKeys.profile: 10,              // ✅ SHIFTED back from 11 to 10
  NavigationKeys.vehicleMaster: 11,        // ✅ SHIFTED back from 12 to 11
  NavigationKeys.tripOperation: 12,        // ✅ SHIFTED back from 13 to 12
  NavigationKeys.maintenanceManagement: 13, // ✅ SHIFTED back
  NavigationKeys.vehicleReports: 14,       // ✅ SHIFTED back
  NavigationKeys.allCustomers: 15,         // ✅ SHIFTED back
  NavigationKeys.pendingApprovals: 16,     // ✅ SHIFTED back
  NavigationKeys.pendingRosters: 17,       // ✅ SHIFTED back
  NavigationKeys.approvedRosters: 18,      // ✅ SHIFTED back
  NavigationKeys.tripCancellation: 19,     // ✅ SHIFTED back
  NavigationKeys.clientDetails: 20,        // ✅ SHIFTED back
  NavigationKeys.trips: 21,                // ✅ SHIFTED back (was 22)
  NavigationKeys.hrmPortal: 22,            // ✅ SHIFTED back (was 23)
  NavigationKeys.roleAccessControl: 23,    // ✅ SHIFTED back (was 24)
  NavigationKeys.gpsTracking: 24,          // ✅ SHIFTED back (was 25)
  NavigationKeys.feedbackManagement: 25,  // ✅ FIXED: Changed from 26
  NavigationKeys.noticeBoard: 26,          // ✅ FIXED: Changed from 27
  NavigationKeys.attendance: 27,           // ✅ FIXED: Changed from 28
  NavigationKeys.hrmEmployees: 28,         // ✅ FIXED: Changed from 29
  NavigationKeys.hrmLeaveRequests: 30,     // ✅ FIXED: Changed from 31 to 30
  NavigationKeys.hrmPayroll: 31,           // ✅ FIXED: Changed from 32 to 31
  // NavigationKeys.billingSystem: REMOVED - Now navigates to separate page
  NavigationKeys.raiseTicket: 32,          // ✅ FIXED: Changed from 33 to 32
  NavigationKeys.myTickets: 33,            // ✅ FIXED: Changed from 34 to 33
  NavigationKeys.allTickets: 34,           // ✅ FIXED: Changed from 35 to 34
  NavigationKeys.closedTickets: 35,        // ✅ FIXED: Changed from 36 to 35
};

  Widget? _contextualView;
  
  late List<Widget> _adminScreens;
  late final List<Map<String, dynamic>> _menuItems;
  
  // SOS Alert variables (now handled by OneSignal + WebSocket)
  List<SOSAlert> _activeSOSAlerts = [];
  final AudioPlayer _audioPlayer = AudioPlayer();
  final Set<String> _acknowledgedSOSIds = {};
  Timer? _reAlertTimer;

  // Roster notification variables (now handled by OneSignal + WebSocket)
  List<RosterNotification> _pendingRosters = [];
  final Set<String> _acknowledgedRosterIds = {};
  Timer? _rosterCheckTimer;
  
  // Approved roster variables (now handled by OneSignal + WebSocket)
  List<Map<String, dynamic>> _approvedRosters = [];
  
  // Approved leaves needing trip cancellation
 

  bool _hasAddressChangeRequests = false;
  
  // Document expiry tracking
  int _expiredDocumentsCount = 0;
  int _expiringSoonDocumentsCount = 0;
  Timer? _documentExpiryCheckTimer;
  bool _hasShownInitialDocumentNotification = false;
  
  // Address change notification tracking
  Timer? _addressChangeCheckTimer;
  DateTime? _lastAddressChangeCheck;
  final Set<String> _shownAddressChangeIds = {};
  
  // RosterService instance
  late final RosterService _rosterService;
  
  // Customer registration notification variables (now handled by OneSignal + WebSocket)
  final Set<String> _acknowledgedCustomerNotifications = {};
  
  // Floating notification service
  final FloatingNotificationService _floatingNotificationService = FloatingNotificationService();
  
  // Trip notification service
  final TripNotificationService _tripNotificationService = TripNotificationService();
  
  // TMS Tickets count
  int _totalTicketsCount = 0;
  Timer? _ticketsCountTimer;
  
  // Role-based navigation
  String? _userRole;

  // ========== ONESIGNAL + WEBSOCKET PROPERTIES ==========
  WebSocketService? _webSocketService;
  StreamSubscription<Map<String, dynamic>>? _oneSignalSubscription;
  StreamSubscription<WebSocketMessage>? _webSocketSubscription;
  
  // Real-time data
  int _pendingRostersCount = 0;
  int _availableVehiclesCount = 0;
  Map<String, dynamic> _realTimeVehicleLocations = {};

  final Set<int> _vehicleScreenIndices = {11, 12, 13, 14, 24}; // Updated indices: vehicleMaster, tripOperation, maintenanceManagement, vehicleReports, gpsTracking (was 25, now 24)
  final Set<int> _customerScreenIndices = {15, 16, 17, 18, 19}; // Updated indices: allCustomers, pendingApprovals, pendingRosters, approvedRosters, tripCancellation
  final Set<int> _clientScreenIndices = {20, 21}; // Updated client management indices: clientDetails, trips (removed billingInvoices)
  final Set<int> _hrmScreenIndices = {25, 26, 27, 28, 29, 30, 32, 33, 34, 35}; // ✅ FIXED: Updated to match corrected indices

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _selectedIndex = _isFirstBuild || _hasBeenReset ? 0 : _persistedSelectedIndex;
    _isFirstBuild = false;
    _hasBeenReset = false;
    
    // Initialize user role
    _initializeUserRole();
    
    // Initialize RosterService
    _rosterService = RosterService(
      apiService: BackendConnectionManager().apiService,
    );
    
    _audioPlayer.setReleaseMode(ReleaseMode.loop);
    // OLD Firebase listeners - now replaced by OneSignal + WebSocket
    // _setupSOSListener();
    // _setupRosterListener();
    // _setupApprovedRosterListener();
    // _setupCustomerNotificationListener();
    _setupTripNotificationListener();
    
    _setupDocumentExpiryListener();
    _setupAddressChangeListener();
    _fetchTotalTicketsCount();
    _setupTicketsCountTimer();
    
    _menuItems = [ 
      {'title': 'Dashboard', 'icon': Icons.dashboard_rounded, 'navKey': NavigationKeys.dashboard}, 
      {'title': 'Drivers', 'icon': Icons.groups, 'navKey': NavigationKeys.drivers}, 
      {'title': 'Customer Management', 'icon': Icons.people, 'navKey': NavigationKeys.customerManagement},
      {'title': 'Client Management', 'icon': Icons.business, 'navKey': NavigationKeys.clientManagement},
      {'title': 'Maintenance', 'icon': Icons.build, 'navKey': NavigationKeys.maintenance},
      {'title': 'Fleet Management', 'icon': Icons.directions_car, 'navKey': NavigationKeys.fleetManagement},
      {'title': 'Reports', 'icon': Icons.analytics, 'navKey': NavigationKeys.reports},
      {'title': 'Resolved Alerts', 'icon': Icons.check_circle, 'navKey': NavigationKeys.resolvedAlerts},
      {'title': 'Incomplete Alerts', 'icon': Icons.warning_amber_rounded, 'navKey': NavigationKeys.incompleteAlerts},
      {'title': 'Settings', 'icon': Icons.settings, 'navKey': NavigationKeys.settings},
      {'title': 'Profile', 'icon': Icons.person, 'navKey': NavigationKeys.profile},
      {'title': 'Vehicle Master', 'navKey': NavigationKeys.vehicleMaster},
      {'title': 'Trip Operation', 'navKey': NavigationKeys.tripOperation},
      {'title': 'Maintenance Management', 'navKey': NavigationKeys.maintenanceManagement},
      {'title': 'Vehicle Reports', 'navKey': NavigationKeys.vehicleReports},
      {'title': 'All Customers', 'navKey': NavigationKeys.allCustomers},
      {'title': 'Pending Approvals', 'navKey': NavigationKeys.pendingApprovals},
      {'title': 'Pending Rosters', 'navKey': NavigationKeys.pendingRosters},
      {'title': 'Approved Rosters', 'navKey': NavigationKeys.approvedRosters},
      {'title': 'Trip Cancellation', 'navKey': NavigationKeys.tripCancellation},
      {'title': 'Client Details', 'navKey': NavigationKeys.clientDetails},
      {'title': 'Trips', 'navKey': NavigationKeys.trips},
      {'title': 'HRM Portal', 'icon': Icons.people, 'navKey': NavigationKeys.hrmPortal},
      {'title': 'Role Access Control', 'icon': Icons.admin_panel_settings, 'navKey': NavigationKeys.roleAccessControl},
      {'title': 'GPS Tracking', 'navKey': NavigationKeys.gpsTracking},
      {'title': 'GPS Tracking', 'navKey': NavigationKeys.gpsTracking}, // Duplicate for compatibility
      {'title': 'Notice Board', 'navKey': NavigationKeys.noticeBoard},
      {'title': 'Attendance', 'navKey': NavigationKeys.attendance},
      {'title': 'Employees', 'navKey': NavigationKeys.hrmEmployees},  // ← ADD THIS
      //{'title': 'Departments', 'navKey': NavigationKeys.hrmDepartments},  // ← ADD THIS
    ];
    
    _initializeScreens();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) Provider.of<NotificationProvider>(context, listen: false).fetchUnreadNotificationCount(adminOnly: true);
    });
    
    // Initialize OneSignal + WebSocket services
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _initializeRealTimeServices();
    });
  }
  
  @override
  void dispose() {
    // Cancel timers
    _reAlertTimer?.cancel();
    _rosterCheckTimer?.cancel();
    _documentExpiryCheckTimer?.cancel();
    _addressChangeCheckTimer?.cancel();
    _ticketsCountTimer?.cancel();
    
    // Dispose audio player
    _audioPlayer.stop();
    _audioPlayer.dispose();
    
    // Dispose services
    _tripNotificationService.dispose();
    
    // ========== CLEANUP ONESIGNAL + WEBSOCKET ==========
    _webSocketSubscription?.cancel();
    _oneSignalSubscription?.cancel();
    _webSocketService?.disconnect();
    
    super.dispose();
  }

  void _initializeUserRole() async {
  try {
    debugPrint('🔐 ========================================');
    debugPrint('🔐 INITIALIZING USER ROLE');
    debugPrint('🔐 ========================================');
    
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;
    debugPrint('🔐 Current User Email: ${user.email}');
    
    // ✅ Add delay to ensure MongoDB is ready
    await Future.delayed(const Duration(milliseconds: 500));
    
    final currentUser = await widget.authRepository.getCurrentUserWithRole();
    debugPrint('🔐 User from AuthRepository: ${currentUser.email}');
    debugPrint('🔐 Role from AuthRepository: ${currentUser.role}');
    
    // Load user permissions
    final permissions = await _permissionService.getUserPermissions();
    debugPrint('🔐 Permissions loaded: ${permissions.keys.length} items');
    
    // ✅ Log each permission for debugging
    permissions.forEach((key, value) {
      if (value is Map) {
        debugPrint('   📋 $key: can_access=${value['can_access']}, edit_delete=${value['edit_delete']}');
      }
    });
    
    String normalizedRole = currentUser.role ?? 'customer';
    if (normalizedRole.toLowerCase() == 'admin') {
      normalizedRole = 'super_admin';
    }
    
    if (mounted) {
      setState(() {
        _userRole = normalizedRole;
        _userPermissions = permissions;
        _permissionsLoaded = true;
      });
      debugPrint('✅ User Role Set: $_userRole');
      debugPrint('✅ Permissions Loaded: ${permissions.keys.length} permissions');
    }
    
    debugPrint('🔐 ========================================');
    debugPrint('✅ ROLE INITIALIZATION COMPLETED');
    debugPrint('🔐 ========================================');
  } catch (e) {
    debugPrint('❌ Error initializing user role: $e');
    handleSilentError(e, context: 'User Role Initialization');
    
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;
    if (user.email == 'admin@abrafleet.com') {
      if (mounted) {
        setState(() {
          _userRole = 'super_admin';
          _permissionsLoaded = true;
        });
      }
    }
  }
}

  void _initializeScreens() {
    _adminScreens = [
      AdminDashboardScreen(
        onNavigateRequest: _navigateToTabByIndex, // Use legacy method for backward compatibility
      ), // Index 0
      DriverDashboardPage(authRepository: widget.authRepository), // Index 1 (was 2)
      const AdminCustomerListScreen(), // Index 2 (was 3)
      const ClientDashboardScreen(), // Index 3 (was 4)
      const AdminMaintenanceLogScreen(), // Index 4 (was 5)
      const EnhancedFleetMapScreen(), // Index 5 - ✅ Enhanced Fleet Map View with Search & Filters
      AdminReportsScreen(), // Index 6
      const ResolvedAlertsView(), // Index 7
      IncompleteAlertsView(), // Index 8 - ✅ Enhanced SOS Alerts with Backend Integration
      const Center(child: Text('Settings Screen - Coming Soon')), // Index 9
      const Center(child: Text('Profile Screen - Coming Soon')), // Index 10
      VehicleMasterScreen(), // Index 11
      TripOperationScreen(
        onStartNewTrip: _showStartNewTripScreen,
      ), // Index 12
      const MaintenanceManagementScreen(), // Index 13
      const ReportsAnalyticsScreen(), // Index 14
      const AdminAllCustomersPage(), // Index 15
      const AdminPendingCustomersPage(), // Index 16
      
      // Pending Rosters Screen (Index 17)
      PendingRostersScreen(
        rosterService: _rosterService,
        onRosterTapped: (roster) {
          _showRosterDetailsDialog(roster);
        },
      ), // Index 17
      
      // Approved Rosters Screen (Index 18)
      ApprovedRostersScreen(
        rosterService: _rosterService,
        onRosterTapped: (roster) {
          _showApprovedRosterDetailsDialog(roster);
        },
      ), // Index 18
      
      // Trip Cancellation Management Screen (Index 19)
      const LeaveTripManagement(), // Index 19
      
      // CLIENT MANAGEMENT SCREENS
      const ClientDashboardScreen(), // Index 20 - Client Details/Management
      const TripsClientPage(), // Index 21 - ✅ Trip Management (was 22)
      
      // HRM PORTAL SCREEN
      const HrmPortalScreen(), // Index 22 - ✅ HRM Portal (was 23)
      
      // ROLE ACCESS CONTROL SCREEN
      const UserManagementScreen(), // Index 23 - ✅ Role Access Control (was 24)
      
      // GPS TRACKING SCREEN
      const GPSTrackingScreen(), // Index 25 - ✅ GPS Tracking
      
      // HRM SUB-SCREENS - Updated to show unified feedback management
      const UnifiedFeedbackManagementScreen(), // Index 26 - ✅ Unified Feedback Management
      const HrmNoticeBoardScreen(), // Index 27 - ✅ Notice Board
      const HrmAttendanceScreen(), // Index 28 - ✅ Attendance
      const HrmEmployeesScreen(), // Index 29 - ✅ Employees
      //const HrmDepartmentsScreen(), // Index 30 ← ADD THIS (if needed)
      const HrmLeaveRequestsScreen(), // Index 30 - ✅ Leave Requests
      const HrmPayrollScreen(), // Index 31 - ✅ Payroll Management
      
      // TMS SCREENS (Billing System removed - now navigates to separate page)
      const RaiseTicketScreen(), // Index 32 - ✅ Raise Ticket (was 33)
      const MyTicketsScreen(), // Index 33 - ✅ My Tickets (was 34)
      const AllTicketsScreen(), // Index 34 - ✅ All Tickets (was 35)
      const ClosedTicketsScreen(), // Index 35 - ✅ Closed Tickets (was 36)
    ];
    
    // 🔍 DEBUG: Log screen initialization
    debugPrint('🔍 SCREEN INITIALIZATION DEBUG:');
    debugPrint('   Total screens: ${_adminScreens.length}');
    debugPrint('   Index 30 (Leave Requests): ${_adminScreens[30].runtimeType}');
    debugPrint('   Index 32 (Raise Ticket): ${_adminScreens[32].runtimeType}');
    debugPrint('   Index 33 (My Tickets): ${_adminScreens[33].runtimeType}');
    debugPrint('   Index 34 (All Tickets): ${_adminScreens[34].runtimeType}');
    
    // Verify navigation mapping
    debugPrint('🔍 NAVIGATION MAPPING DEBUG:');
    debugPrint('   hrmLeaveRequests -> ${_navigationMap[NavigationKeys.hrmLeaveRequests]}');
    debugPrint('   billingSystem -> SEPARATE PAGE (not in mapping)');
    debugPrint('   raiseTicket -> ${_navigationMap[NavigationKeys.raiseTicket]}');
    debugPrint('   allTickets -> ${_navigationMap[NavigationKeys.allTickets]}');
  }

  void _showAddVehicleScreen() {
    setState(() {
      _contextualView = AddVehicleScreen(
        onCancel: _hideContextualView,
        onSave: () {
          _hideContextualView();
        },
      );
    });
  }

  void _showStartNewTripScreen() {
    setState(() {
      _contextualView = StartNewTripPage(
        onBack: _hideContextualView,
      );
    });
  }

  void _showContextualMap(SOSAlert alert) {
    setState(() {
      _contextualView = MapScreen(
        latitude: alert.latitude,
        longitude: alert.longitude,
        customerName: alert.customerName,
        onBack: _hideContextualView,
      );
    });
  }

  void _hideContextualView() {
    setState(() {
      _contextualView = null;
    });
  }

  // ========== OLD FIREBASE LISTENERS - REPLACED BY ONESIGNAL + WEBSOCKET ==========
  // These methods are no longer used - real-time updates now handled by:
  // - OneSignal for push notifications (background)
  // - WebSocket for real-time updates (foreground)
  
  /*
  void _setupSOSListener() {
    // Super admin and admin can see all notifications
    if (_userRole != 'super_admin' && _userRole != 'admin') {
      debugPrint('🔐 User role $_userRole cannot see SOS alerts');
      return;
    }
    
    // OLD: Firebase Realtime Database listener
    // NOW: Handled by OneSignal + WebSocket in _initializeRealTimeServices()
  }
  */

  void _startAlertCycle() {
    _reAlertTimer?.cancel();
    _audioPlayer.play(AssetSource('siren.mpeg'));
    _reAlertTimer = Timer.periodic(const Duration(minutes: 3), (timer) {
      if (_audioPlayer.state != PlayerState.playing) {
        _audioPlayer.play(AssetSource('siren.mpeg'));
      }
    });
  }

  void _stopAlertCycle() {
    _reAlertTimer?.cancel();
    _audioPlayer.stop();
  }

  void _acknowledgeSingleSOS(SOSAlert alert) {
    if (mounted) {
      setState(() {
        _acknowledgedSOSIds.add(alert.id);
        if (_activeSOSAlerts.every((a) => _acknowledgedSOSIds.contains(a.id))) {
          _stopAlertCycle();
        }
      });
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${alert.customerName}\'s alert marked as reviewed. Siren silenced.'),
        backgroundColor: Colors.amber[800]
      ),
    );
  }

  void _showSOSHandlingDialog(BuildContext context, SOSAlert alert) {
    final notesController = TextEditingController();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Handle SOS Alert'),
              content: SingleChildScrollView(
                child: ListBody(
                  children: <Widget>[
                    ListTile(leading: const Icon(Icons.person), title: Text(alert.customerName)),
                    ListTile(leading: const Icon(Icons.location_on), title: Text(alert.address)),
                    const Divider(),
                    const Text('Actions', style: TextStyle(fontWeight: FontWeight.bold)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        TextButton.icon(
                          icon: const Icon(Icons.map_outlined),
                          label: const Text("Map"),
                          onPressed: () {
                            Navigator.of(context).pop();
                            _showContextualMap(alert);
                          }
                        ),
                        TextButton.icon(
                          icon: const Icon(Icons.call),
                          label: const Text("Call"),
                          onPressed: () {}
                        ),
                      ],
                    ),

                  ],
                ),
              ),
              actions: <Widget>[
                if (!_acknowledgedSOSIds.contains(alert.id))
                  ElevatedButton(
                    child: const Text('Mark as Reviewed'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[700]),
                    onPressed: () {
                      _acknowledgeSingleSOS(alert);
                      Navigator.of(context).pop();
                    },
                  ),
                TextButton(
                  child: const Text('Close'),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                ElevatedButton.icon(
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Resolve'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                  onPressed: () async {
                    final url = Uri.parse('${ApiConfig.baseUrl}/api/sos/${alert.id}/resolve');
                    await http.put(url);
                    Navigator.of(context).pop();
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  // ========== ROSTER NOTIFICATION METHODS ==========
  // OLD: Firebase Realtime Database listener
  // NOW: Handled by OneSignal + WebSocket in _initializeRealTimeServices()
  
  /*
  void _setupRosterListener() {
    // Super admin and admin can see all notifications
    if (_userRole != 'super_admin' && _userRole != 'admin') {
      debugPrint('🔐 User role $_userRole cannot see roster notifications');
      return;
    }
    
    // OLD: Firebase listener - now replaced by WebSocket
  }
  */

  void _showNewRosterNotification() {
    final unacknowledgedCount = _pendingRosters
        .where((r) => !_acknowledgedRosterIds.contains(r.id))
        .length;
    
    if (unacknowledgedCount > 0 && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.calendar_month, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  '$unacknowledgedCount new roster request${unacknowledgedCount > 1 ? 's' : ''} pending assignment',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 5),
          action: SnackBarAction(
            label: 'VIEW',
            textColor: Colors.white,
            onPressed: () => _navigateToTab(NavigationKeys.pendingRosters),
          ),
        ),
      );
    }
  }

  void _acknowledgeRoster(RosterNotification roster) {
    if (mounted) {
      setState(() {
        _acknowledgedRosterIds.add(roster.id);
      });
    }
  }

  void _showRosterAssignment(RosterNotification roster) {
    setState(() {
      _contextualView = RosterAssignmentScreen(
        onBack: _hideContextualView,
        preSelectedRosterId: roster.id,
      );
    });
  }

  // ========== CUSTOMER REGISTRATION NOTIFICATION METHODS ==========
  
  void _setupCustomerNotificationListener() {
    // DEPRECATED: This method is no longer used
    // Notifications now handled by OneSignal + WebSocket in _initializeRealTimeServices()
    return;
  }

  // Play notification sound for urgent notifications
  Future<void> _playNotificationSound() async {
    try {
      final notificationPlayer = AudioPlayer();
      await notificationPlayer.play(AssetSource('Notification.mp3'));
      await Future.delayed(const Duration(seconds: 2));
      await notificationPlayer.dispose();
    } catch (e) {
      handleSilentError(e, context: 'Notification Sound');
    }
  }

  // ========== TRIP NOTIFICATION METHODS ==========
  
  void _setupTripNotificationListener() {
    // Super admin and admin can see all notifications
    if (_userRole != 'super_admin' && _userRole != 'admin') {
      debugPrint('🔐 User role $_userRole cannot see trip notifications');
      return;
    }
    
    _tripNotificationService.initialize(
      onDriverResponse: (response) {
        if (mounted) {
          _showDriverResponseNotification(response);
        }
      },
    );
  }

  void _showDriverResponseNotification(Map<String, dynamic> response) {
    final isAccepted = response['response'] == 'accept';
    final driverName = response['driverName'] ?? 'Driver';
    final tripId = response['tripId'] ?? 'Unknown';
    
    // Play notification sound for important responses
    if (!isAccepted) {
      _playNotificationSound();
    }
    
    // Show floating notification
    _floatingNotificationService.showFloatingNotification(
      context: context,
      title: isAccepted ? '✅ Trip Accepted' : '❌ Trip Declined',
      body: '$driverName ${isAccepted ? 'accepted' : 'declined'} Trip $tripId${!isAccepted && response['reason'] != null ? '\nReason: ${response['reason']}' : ''}',
      icon: isAccepted ? '✅' : '❌',
      backgroundColor: isAccepted ? Colors.green : Colors.red,
      type: isAccepted ? 'trip_accepted' : 'trip_declined',
      priority: isAccepted ? 'normal' : 'high',
      duration: Duration(seconds: isAccepted ? 5 : 8),
      onTap: () {
        // Navigate to trip operations screen
        _navigateToTab(NavigationKeys.tripOperation); // Trip Operations screen
      },
    );
    
    // Update notification badge
    Provider.of<NotificationProvider>(context, listen: false)
        .fetchUnreadNotificationCount(adminOnly: true);
  }
  
  void _setupApprovedRosterListener() {
    // DEPRECATED: This method is no longer used
    // Roster updates now handled by OneSignal + WebSocket in _initializeRealTimeServices()
    return;
  }

  // ========== APPROVED LEAVES METHODS ==========
  
  

  // Replace the _fetchApprovedLeavesCount() method in admin_main_shell.dart
// Around line 656

// ============================================================================
// STEP 1: Find the EXISTING _fetchApprovedLeavesCount method (around line 656)
//         and REPLACE it with this:
// ============================================================================


  // ========== DOCUMENT EXPIRY METHODS ==========
  
  void _setupDocumentExpiryListener() {
  // Super admin and admin can see all notifications
  if (_userRole != 'super_admin' && _userRole != 'admin') {
    debugPrint('🔐 User role $_userRole cannot see document expiry notifications');
    return;
  }
  
  // Check immediately on startup
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _checkDocumentExpiry(showNotification: true);
  });
  
  // Then check every 60 seconds
  _documentExpiryCheckTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
    _checkDocumentExpiry(showNotification: true);
  });
}

  void _checkDocumentExpiry({bool showNotification = false}) {
    // 🔥 FIX: Double-check mounted state before accessing context
    if (!mounted) {
      debugPrint('⚠️ Cannot check document expiry: Widget not mounted');
      return;
    }
    
    try {
      // 🔥 FIX: Use WidgetsBinding to ensure we're in a safe state
      // and check mounted again before accessing context
      if (!mounted) return;
      
      VehicleProvider? vehicleProvider;
      try {
        vehicleProvider = Provider.of<VehicleProvider>(context, listen: false);
      } catch (e) {
        handleSilentError(e, context: 'VehicleProvider Access');
        return;
      }
      
      if (vehicleProvider == null) {
        debugPrint('⚠️ Cannot check document expiry: VehicleProvider is null');
        return;
      }
      
      // Check mounted again after async-like operations
      if (!mounted) return;
      
      final status = vehicleProvider.getDocumentExpiryStatus();
      
      final totalExpired = status['expired'] ?? 0;
      final totalExpiringSoon = status['expiringSoon'] ?? 0;
      final totalIssues = status['total'] ?? 0;
      
      debugPrint('📄 Document Status Check:');
      debugPrint('   - Expired: $totalExpired');
      debugPrint('   - Expiring Soon: $totalExpiringSoon');
      debugPrint('   - Total Issues: $totalIssues');
      debugPrint('   - Previous Total: $_expiredDocumentsCount');
      
      // Check if there are NEW expired documents
      final hasNewExpired = totalExpired > 0 && 
                            totalExpired > (_expiredDocumentsCount - _expiringSoonDocumentsCount);
      
      // Check if there are NEW expiring soon documents
      final hasNewExpiringSoon = totalExpiringSoon > 0 && 
                                 totalExpiringSoon > _expiringSoonDocumentsCount;
      
      if (mounted) {
        setState(() {
          _expiredDocumentsCount = totalIssues;
          _expiringSoonDocumentsCount = totalExpiringSoon;
        });
        
        // Show notification if:
        // 1. We're allowed to show notifications AND
        // 2. Either we haven't shown initial notification yet OR there are new issues
        if (showNotification && (!_hasShownInitialDocumentNotification || hasNewExpired || hasNewExpiringSoon)) {
          _hasShownInitialDocumentNotification = true;
          
          if (totalExpired > 0 || totalExpiringSoon > 0) {
            debugPrint('🔔 Showing document expiry notification');
            _showDocumentExpiryNotification(status);
          }
        }
      }
    } catch (e) {
      handleSilentError(e, context: 'Document Expiry Check');
      // Set count to 0 on error to prevent UI issues
      if (mounted) {
        setState(() {
          _expiredDocumentsCount = 0;
          _expiringSoonDocumentsCount = 0;
        });
      }
    }
  }

  void _showDocumentExpiryNotification(Map<String, int> status) {
  final expired = status['expired'] ?? 0;
  final expiringSoon = status['expiringSoon'] ?? 0;
  
  debugPrint('📢 Document Notification:');
  debugPrint('   - Expired: $expired');
  debugPrint('   - Expiring Soon: $expiringSoon');
  
  // Priority: Show EXPIRED first if any exist
  if (expired > 0) {
    _floatingNotificationService.showFloatingNotification(
      context: context,
      title: '⚠️ Expired Documents Alert',
      body: '$expired vehicle/driver document${expired > 1 ? 's have' : ' has'} expired! Click to view details.',
      icon: '⚠️',
      backgroundColor: Colors.red,
      type: 'document_expired',
      priority: 'high',
      duration: const Duration(seconds: 10),
      onTap: () {
        debugPrint('🔔 Navigating to Vehicle Dashboard for expired documents');
        _navigateToTab(NavigationKeys.drivers); // Navigate to Vehicle Dashboard
      },
    );
    
    // Also play alert sound for expired documents
    _playNotificationSound();
    
  } else if (expiringSoon > 0) {
    // Only show expiring soon if no expired documents
    _floatingNotificationService.showFloatingNotification(
      context: context,
      title: '⏰ Documents Expiring Soon',
      body: '$expiringSoon document${expiringSoon > 1 ? 's are' : ' is'} expiring within 30 days. Click to review.',
      icon: '⏰',
      backgroundColor: Colors.orange,
      type: 'document_expiring',
      priority: 'medium',
      duration: const Duration(seconds: 8),
      onTap: () {
        debugPrint('🔔 Navigating to Vehicle Dashboard for expiring documents');
        _navigateToTab(NavigationKeys.drivers); // Navigate to Vehicle Dashboard
      },
    );
  }
}

  // ========== ADDRESS CHANGE NOTIFICATION METHODS ==========
  
  void _setupAddressChangeListener() {
    // Check immediately on startup
    _checkAddressChangeRequests();
    
    // Then check every 30 seconds for new address change requests
    _addressChangeCheckTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _checkAddressChangeRequests();
    });
  }

  Future<void> _checkAddressChangeRequests() async {
    if (!mounted) return;
    
    try {
      final response = await _safeApi.safeGet(
        '/api/notifications',
        context: 'Address Change Requests',
        fallback: {'success': false, 'data': [], 'unreadCount': 0},
      );
      
      if (mounted) {
        final notifications = response['data'];
        final unreadCount = response['unreadCount'];
        
        setState(() {
          _hasAddressChangeRequests = (unreadCount is int && unreadCount > 0) ||
                                      (notifications is List && notifications.isNotEmpty);
        });
        
        debugPrint('✅ Address change requests checked: $_hasAddressChangeRequests');
      }
    } catch (e) {
      handleSilentError(e, context: 'Address Change Requests');
      if (mounted) {
        setState(() {
          _hasAddressChangeRequests = false;
        });
      }
    }
  }

  void _showAddressChangeNotification({
    required String customerName,
    required int affectedTrips,
    required String requestId,
  }) {
    _floatingNotificationService.showFloatingNotification(
      context: context,
      title: '🏠 New Address Change Request',
      body: '$customerName has requested an address change affecting $affectedTrips trip${affectedTrips != 1 ? 's' : ''}. Click to review.',
      icon: '🏠',
      backgroundColor: const Color(0xFF2196F3), // Blue color
      type: 'address_change_request',
      priority: 'high',
      duration: const Duration(seconds: 10),
      onTap: () {
        debugPrint('🔔 Opening address change request: $requestId');
        // Navigate to notifications screen where admin can see the request
        _navigateToNotifications();
      },
    );
    
    // Play notification sound
    _playNotificationSound();
  }

  void _navigateToNotifications() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const AdminNotificationsScreen(),
      ),
    );
  }

  // Show roster details dialog for pending rosters
  void _showRosterDetailsDialog(Map<String, dynamic> roster) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.calendar_month, color: Colors.orange),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                roster['customerName']?.toString() ?? 'Roster Details',
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailSection('Customer Information', [
                _buildDetailRow('Customer', roster['customerName']),
                _buildDetailRow('Office', roster['officeLocation']),
              ]),
              const Divider(height: 24),
              _buildDetailSection('Schedule', [
                _buildDetailRow('Type', _formatRosterType(roster['rosterType'])),
                _buildDetailRow('Start Date', _formatDate(roster['startDate'])),
                _buildDetailRow('End Date', _formatDate(roster['endDate'])),
                _buildDetailRow('Weekdays', _formatWeekdays(roster['weeklyOffDays'])),
              ]),
              const Divider(height: 24),
              _buildDetailSection('Timings', [
                _buildDetailRow('Login Time', roster['startTime']?.toString() ?? 'N/A'),
                _buildDetailRow('Logout Time', roster['endTime']?.toString() ?? 'N/A'),
              ]),
              if (roster['locations'] != null) ...[
                const Divider(height: 24),
                _buildDetailSection('Locations', [
                  if (roster['locations']['pickup'] != null)
                    _buildDetailRow('Pickup', roster['locations']['pickup']['address']),
                  if (roster['locations']['drop'] != null)
                    _buildDetailRow('Drop', roster['locations']['drop']['address']),
                ]),
              ],
              const Divider(height: 24),
              _buildDetailRow('Status', roster['status']?.toString() ?? 'pending'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.assignment),
            label: const Text('Assign Driver'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(context);
              final rosterNotif = _convertToRosterNotification(roster);
              _showRosterAssignment(rosterNotif);
            },
          ),
        ],
      ),
    );
  }

  // Show approved roster details dialog
  void _showApprovedRosterDetailsDialog(Map<String, dynamic> roster) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.green),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                roster['customerName']?.toString() ?? 'Approved Roster',
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailSection('Customer Information', [
                _buildDetailRow('Customer', roster['customerName']),
                _buildDetailRow('Office', roster['officeLocation']),
              ]),
              const Divider(height: 24),
              _buildDetailSection('Assignment', [
                _buildDetailRow('Driver', roster['assignedDriverName'] ?? 'Not assigned'),
                _buildDetailRow('Vehicle', roster['assignedVehicleReg'] ?? 'Not assigned'),
              ]),
              const Divider(height: 24),
              _buildDetailSection('Schedule', [
                _buildDetailRow('Type', _formatRosterType(roster['rosterType'])),
                _buildDetailRow('Start Date', _formatDate(roster['startDate'])),
                _buildDetailRow('End Date', _formatDate(roster['endDate'])),
                _buildDetailRow('Weekdays', _formatWeekdays(roster['weeklyOffDays'])),
              ]),
              const Divider(height: 24),
              _buildDetailSection('Timings', [
                _buildDetailRow('Login Time', roster['startTime']?.toString() ?? 'N/A'),
                _buildDetailRow('Logout Time', roster['endTime']?.toString() ?? 'N/A'),
              ]),
              if (roster['locations'] != null) ...[
                const Divider(height: 24),
                _buildDetailSection('Locations', [
                  if (roster['locations']['pickup'] != null)
                    _buildDetailRow('Pickup', roster['locations']['pickup']['address']),
                  if (roster['locations']['drop'] != null)
                    _buildDetailRow('Drop', roster['locations']['drop']['address']),
                ]),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          OutlinedButton.icon(
            icon: const Icon(Icons.edit),
            label: const Text('Edit Assignment'),
            onPressed: () {
              Navigator.pop(context);
              _showEditRosterScreen(roster);
            },
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.map),
            label: const Text('View on Map'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D47A1),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(context);
              _navigateToTab(NavigationKeys.fleetMap);
            },
          ),
        ],
      ),
    );
  }

  void _showEditRosterScreen(Map<String, dynamic> roster) {
    setState(() {
      _contextualView = EditRosterAssignmentScreen(
        roster: roster,
        onBack: () {
          _hideContextualView();
          _initializeScreens();
        },
      );
    });
  }

  // Show support dialog
  void _showSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 500, maxHeight: 600),
            child: SupportSystemScreen(),
          ),
        );
      },
    );
  }

  // Helper methods for roster details dialog
  Widget _buildDetailSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildDetailRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value ?? 'N/A',
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  String _formatRosterType(dynamic type) {
    if (type == null) return 'N/A';
    switch (type.toString().toLowerCase()) {
      case 'login':
        return 'Login Only';
      case 'logout':
        return 'Logout Only';
      case 'both':
        return 'Login & Logout';
      default:
        return type.toString();
    }
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      final dateTime = date is DateTime ? date : DateTime.parse(date.toString());
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dateTime.month - 1]} ${dateTime.day}, ${dateTime.year}';
    } catch (e) {
      return date.toString();
    }
  }

  String _formatWeekdays(dynamic weekdays) {
    if (weekdays == null) return 'N/A';
    if (weekdays is List) {
      return weekdays.join(', ');
    }
    return weekdays.toString();
  }

  TimeOfDay _parseTimeOfDay(dynamic time) {
    if (time == null) return const TimeOfDay(hour: 9, minute: 0);
    
    try {
      if (time is TimeOfDay) return time;
      
      if (time is String) {
        final parts = time.split(':');
        if (parts.length >= 2) {
          return TimeOfDay(
            hour: int.parse(parts[0]),
            minute: int.parse(parts[1]),
          );
        }
      }
    } catch (e) {
      debugPrint('Error parsing time: $e');
    }
    
    return const TimeOfDay(hour: 9, minute: 0);
  }

  RosterNotification _convertToRosterNotification(Map<String, dynamic> roster) {
    return RosterNotification(
      id: roster['id']?.toString() ?? roster['_id']?.toString() ?? '',
      customerId: roster['customerId']?.toString() ?? roster['userId']?.toString() ?? '',
      customerName: roster['customerName']?.toString() ?? 'Unknown',
      rosterType: roster['rosterType']?.toString() ?? 'both',
      officeLocation: roster['officeLocation']?.toString() ?? '',
      
      weekdays: roster['weekdays'] is List 
          ? List<String>.from(roster['weekdays']) 
          : (roster['weeklyOffDays'] is List 
              ? List<String>.from(roster['weeklyOffDays']) 
              : []),
      
      fromDate: roster['startDate'] is DateTime 
          ? roster['startDate'] 
          : DateTime.tryParse(roster['startDate']?.toString() ?? '') ?? DateTime.now(),
      toDate: roster['endDate'] is DateTime 
          ? roster['endDate'] 
          : DateTime.tryParse(roster['endDate']?.toString() ?? '') ?? DateTime.now(),
      
      fromTime: _parseTimeOfDay(roster['startTime']),
      toTime: _parseTimeOfDay(roster['endTime']),
      
      status: roster['status']?.toString() ?? 'pending_assignment',
      createdAt: roster['createdAt'] is DateTime 
          ? roster['createdAt'] 
          : DateTime.tryParse(roster['createdAt']?.toString() ?? '') ?? DateTime.now(),
      
      loginPickupLocation: roster['locations']?['pickup']?['coordinates'],
      loginPickupAddress: roster['locations']?['pickup']?['address'],
      logoutDropLocation: roster['locations']?['drop']?['coordinates'],
      logoutDropAddress: roster['locations']?['drop']?['address'],
      
      notes: roster['notes'],
      assignedDriverId: roster['assignedDriver']?.toString(),
      assignedVehicleId: roster['assignedVehicle']?.toString(),
    );
  }

  // ========== TMS TICKETS COUNT METHODS ==========
  
  void _setupTicketsCountTimer() {
    // Check tickets count every 60 seconds
    _ticketsCountTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
      _fetchTotalTicketsCount();
    });
  }

  Future<void> _fetchTotalTicketsCount() async {
    if (!mounted) return;
    
    try {
      final response = await _safeApi.safeGet(
        '/api/tickets/stats',
        context: 'Total Tickets Count',
        fallback: {'success': false, 'data': {'total': 0}},
      );
      
      if (mounted && response['success'] != false) {
        final data = response['data'] ?? {};
        final count = data['total'] ?? 0;
        setState(() {
          _totalTicketsCount = count is int ? count : 0;
        });
        debugPrint('✅ Total tickets count updated: $_totalTicketsCount');
      }
    } catch (e) {
      handleSilentError(e, context: 'Total Tickets Count');
      // Don't update count on error to avoid showing 0 incorrectly
    }
  }

  // ========== NAVIGATION & UI METHODS ==========

  // Add permission check method before navigation
  Future<bool> _checkNavigationPermission(String navKey) async {
    debugPrint('🔐 Checking permission for: $navKey');
    debugPrint('🔐 Current user role: $_userRole');
    
    // Admin always has access
    if (_userRole == 'super_admin' || _userRole == 'admin') {
      debugPrint('✅ Admin access granted for: $navKey');
      return true;
    }

    // Map navigation keys to permission keys
    final permissionMap = {
      NavigationKeys.dashboard: 'dashboard',
      NavigationKeys.drivers: 'fleet_drivers',
      NavigationKeys.vehicleMaster: 'fleet_vehicles',
      NavigationKeys.tripOperation: 'fleet_trips',
      NavigationKeys.maintenanceManagement: 'fleet_maintenance',
      NavigationKeys.fleetMap: 'fleet_management',
      NavigationKeys.gpsTracking: 'fleet_gps_tracking',
      NavigationKeys.customerManagement: 'customer_fleet',
      NavigationKeys.allCustomers: 'customer_fleet',
      NavigationKeys.pendingApprovals: 'customer_fleet',
      NavigationKeys.pendingRosters: 'customer_fleet',
      NavigationKeys.approvedRosters: 'customer_fleet',
      NavigationKeys.tripCancellation: 'customer_fleet',
      NavigationKeys.hrmPortal: 'hrm_feedback',
      NavigationKeys.feedbackManagement: 'hrm_feedback',
      NavigationKeys.noticeBoard: 'hrm_feedback',
      NavigationKeys.attendance: 'hrm_feedback',
    };

    final permissionKey = permissionMap[navKey];
    debugPrint('🔐 Permission key for $navKey: $permissionKey');
    
    if (permissionKey == null) {
      debugPrint('❌ No permission mapping found for: $navKey');
      return false;
    }

    final hasAccess = await _permissionService.hasAccess(permissionKey);
    debugPrint('🔐 Permission service result for $permissionKey: $hasAccess');
    
    return hasAccess;
  }

  // Add helper methods for permission checks
  bool _hasPermission(String permissionKey) {
  // Admin always has permission
  if (_userRole == 'super_admin' || _userRole == 'admin') {
    return true;
  }

  // Check if permission exists
  final permission = _userPermissions[permissionKey];
  if (permission == null) {
    debugPrint('⚠️ Permission not found: $permissionKey');
    return false;
  }

  // Handle different data types for can_access
  final canAccess = permission['can_access'];
  
  if (canAccess is bool) return canAccess;
  if (canAccess is int) return canAccess == 1;
  if (canAccess is String) {
    return canAccess.toLowerCase() == 'true' || canAccess == '1';
  }
  
  return false;
}

bool _hasAnyPermission(List<String> permissionKeys) {
  // Admin always has permission
  if (_userRole == 'super_admin' || _userRole == 'admin') {
    return true;
  }

  for (final key in permissionKeys) {
    if (_hasPermission(key)) {
      debugPrint('✅ Found permission: $key');
      return true;
    }
  }
  
  debugPrint('❌ No permissions found in: $permissionKeys');
  return false;
}

  void _navigateToTab(String navigationKey) async { 
    debugPrint('🚀 NAVIGATION ATTEMPT: $navigationKey');
    
    // ✅ SPECIAL HANDLING: Billing System - Navigate to separate page
    if (navigationKey == NavigationKeys.billingSystem) {
      debugPrint('💰 BILLING SYSTEM: Navigating to separate page');
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const BillingMainShell(),
          ),
        );
      }
      return; // Exit early, don't change internal index
    }
    
    // Check permission first
    final hasPermission = await _checkNavigationPermission(navigationKey);
    
    debugPrint('🔐 Permission check for $navigationKey: $hasPermission');
    debugPrint('🔐 User role: $_userRole');
    
    if (!hasPermission) {
      debugPrint('❌ NAVIGATION BLOCKED: No permission for $navigationKey');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.lock, color: Colors.white),
                SizedBox(width: 12),
                Expanded(
                  child: Text('You don\'t have permission to access this section'),
                ),
              ],
            ),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 3),
          ),
        );
      }
      return;
    }

    final screenIndex = _navigationMap[navigationKey];
    debugPrint('🗺️ Navigation mapping: $navigationKey -> $screenIndex');
    
    if (screenIndex == null) {
      debugPrint('❌ Invalid navigation key: $navigationKey');
      debugPrint('📋 Available navigation keys: ${_navigationMap.keys.toList()}');
      return;
    }
    
    // 🔍 DEBUG: Add detailed logging for TMS and HRM navigation
    debugPrint('🔍 NAVIGATION DEBUG:');
    debugPrint('   Navigation Key: $navigationKey');
    debugPrint('   Screen Index: $screenIndex');
    debugPrint('   Screen Type: ${_adminScreens[screenIndex].runtimeType}');
    
    // Special debug for problematic navigation
    if (navigationKey == NavigationKeys.raiseTicket) {
      debugPrint('🎫 RAISE TICKET NAVIGATION:');
      debugPrint('   Expected: RaiseTicketScreen');
      debugPrint('   Actual: ${_adminScreens[screenIndex].runtimeType}');
      debugPrint('   Index 32: ${_adminScreens[32].runtimeType}');
      debugPrint('   Index 33: ${_adminScreens[33].runtimeType}');
    }
    
    if (navigationKey == NavigationKeys.hrmLeaveRequests) {
      debugPrint('🏢 LEAVE REQUESTS NAVIGATION:');
      debugPrint('   Expected: HrmLeaveRequestsScreen');
      debugPrint('   Actual: ${_adminScreens[screenIndex].runtimeType}');
      debugPrint('   Index 30: ${_adminScreens[30].runtimeType}');
    }
    
    // Special debug for fleet map navigation
    if (navigationKey == NavigationKeys.fleetMap) {
      debugPrint('🗺️ FLEET MAP NAVIGATION:');
      debugPrint('   Expected: EnhancedFleetMapScreen');
      debugPrint('   Actual: ${_adminScreens[screenIndex].runtimeType}');
      debugPrint('   Index $screenIndex: ${_adminScreens[screenIndex].runtimeType}');
    }
    
    debugPrint('✅ Navigating to: $navigationKey (index: $screenIndex)');
    
    if (mounted && screenIndex >= 0 && screenIndex < _adminScreens.length) { 
      setState(() { 
        _selectedIndex = screenIndex;
        _selectedNavigationKey = navigationKey;
        _persistedSelectedIndex = screenIndex; 
        _contextualView = null;
      }); 
    } 
  }

  // Legacy method for backward compatibility - converts int to string key
  void _navigateToTabByIndex(int index) {
    // Find the navigation key for this index
    String? navigationKey;
    for (final entry in _navigationMap.entries) {
      if (entry.value == index) {
        navigationKey = entry.key;
        break;
      }
    }
    
    if (navigationKey != null) {
      _navigateToTab(navigationKey);
    } else {
      debugPrint('❌ No navigation key found for index: $index');
    }
  }

  void _resetState() {
    if (mounted) {
      setState(() {
        _selectedIndex = 0;
        _persistedSelectedIndex = 0;
        _isFirstBuild = true;
        _hasBeenReset = true;
      });
    }
  }

  void _handleLogout(BuildContext context) async {
    final bool? shouldLogout = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel')
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (shouldLogout != true) return;

    try {
      if (context.mounted) {
        showDialog(
          context: context,
          builder: (context) => const Center(child: CircularProgressIndicator()),
          barrierDismissible: false
        );
      }

      // ✅ Clear permission cache
      _permissionService.clearCache();

      final authRepository = Provider.of<AuthRepository>(context, listen: false);
      await authRepository.signOut();
      _resetState();

      if (context.mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const WelcomeScreen()),
          (Route<dynamic> route) => false,
        );
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Logout failed: $e'),
            backgroundColor: Colors.red
          )
        );
      }
    }
  }

  // 🔄 Handle refresh for current page
  void _handleRefresh() {
    try {
      print('🔄 Refreshing current page: ${_menuItems[_selectedIndex]['title']}');
      
      // Show a brief loading indicator
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
              SizedBox(width: 12),
              Text('Refreshing...'),
            ],
          ),
          duration: Duration(milliseconds: 1500),
          backgroundColor: Color(0xFF0D47A1),
        ),
      );

      // Refresh based on current page
      switch (_selectedIndex) {
        case 0: // Dashboard
          _refreshDashboard();
          break;
        case 1: // Vehicle Dashboard
        case 2: // Vehicle Master
        case 6: // Fleet Map
          _refreshVehicleData();
          break;
        case 3: // Customer Management
        case 16: // Pending Rosters
        case 17: // Roster Assignment
        case 18: // Approved Rosters
          _refreshCustomerData();
          break;
        case 4: // Driver Management
          _refreshDriverData();
          break;
        case 7: // Reports
          _refreshReports();
          break;
        case 21: // Client Dashboard
        case 22: // Billing & Invoices
        case 23: // Trips
          _refreshClientData();
          break;
        case 24: // HRM Portal
        case 27: // Customer Feedback
        case 28: // Driver Feedback
        case 29: // Client Feedback
        case 30: // Notice Board
        case 31: // Attendance
          _refreshHRMData();
          break;
        case 25: // Role Access Control
          _refreshUserManagement();
          break;
        default:
          _refreshGeneral();
          break;
      }
      
      // Also refresh notification badges
      _refreshNotifications();
      
    } catch (e) {
      print('❌ Error during refresh: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Refresh failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Specific refresh methods for different sections
  void _refreshDashboard() {
    setState(() {
      // Trigger dashboard refresh by rebuilding
    });
  }

  void _refreshVehicleData() {
    // Refresh vehicle-related data
    final vehicleProvider = Provider.of<VehicleProvider>(context, listen: false);
    vehicleProvider.fetchVehicles();
  }

  void _refreshCustomerData() {
    // Refresh customer and roster data
    final rosterService = Provider.of<RosterService>(context, listen: false);
    rosterService.refreshRosters();
  }

  void _refreshDriverData() {
    setState(() {
      // Trigger driver data refresh
    });
  }

  void _refreshReports() {
    setState(() {
      // Trigger reports refresh
    });
  }

  void _refreshClientData() {
    setState(() {
      // Trigger client data refresh
    });
  }

  void _refreshUserManagement() {
    setState(() {
      // Trigger user management refresh
    });
  }

  void _refreshHRMData() {
    setState(() {
      // Trigger HRM data refresh
    });
  }

  void _refreshGeneral() {
    setState(() {
      // General refresh - rebuild current screen
    });
  }

  void _refreshNotifications() {
    // Refresh all notification badges
    final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);
    notificationProvider.fetchUnreadNotificationCount(adminOnly: true);
    
    // Refresh SOS alerts
    _fetchSOSAlerts();
    
    // Refresh roster notifications
    _fetchPendingRostersCount();
    _fetchApprovedRostersCount();
  }

  // Fetch SOS alerts count
  void _fetchSOSAlerts() {
    // TODO: Implement SOS alerts fetching
    // This method can be implemented when SOS alerts feature is needed
    print('Fetching SOS alerts...');
  }

  // Fetch pending rosters count
  void _fetchPendingRostersCount() {
    // TODO: Implement pending rosters count fetching
    // This method can be implemented when roster notifications are needed
    print('Fetching pending rosters count...');
  }

  // Fetch approved rosters count
  void _fetchApprovedRostersCount() {
    // TODO: Implement approved rosters count fetching
    // This method can be implemented when roster notifications are needed
    print('Fetching approved rosters count...');
  }

  // ========== ONESIGNAL + WEBSOCKET METHODS ==========
  
  /// Initialize OneSignal and WebSocket services
  Future<void> _initializeRealTimeServices() async {
    try {
      final authRepo = Provider.of<AuthRepository>(context, listen: false);
      final user = authRepo.currentUser;
      final token = await authRepo.getAuthToken();
      
      if (token == null || user.id.isEmpty) {
        debugPrint('⚠️ No auth token or user ID, skipping real-time services');
        return;
      }
      
      debugPrint('🔄 Initializing real-time services for admin...');
      
      // 1. Initialize OneSignal for push notifications
      await OneSignalService.instance.initialize(
        userId: user.id,
        userRole: user.role ?? 'admin',
        authToken: token,
      );
      
      // 2. Setup OneSignal notification listener
      _setupOneSignalListener();
      
      // 3. Initialize WebSocket for real-time updates
      _webSocketService = WebSocketService();
      await _webSocketService!.connect('admin-room', authToken: token);
      
      // 4. Setup WebSocket listeners
      _setupWebSocketListeners();
      
      debugPrint('✅ Real-time services initialized successfully');
    } catch (e) {
      debugPrint('❌ Error initializing real-time services: $e');
    }
  }
  
  /// Setup OneSignal notification listener
  void _setupOneSignalListener() {
    _oneSignalSubscription = OneSignalService.instance.onNewNotification.listen((notification) {
      debugPrint('📬 New notification received: ${notification['title']}');
      
      final type = notification['type'] as String?;
      
      // Handle different notification types
      switch (type) {
        case 'roster_assigned':
          _handleRosterAssignedNotification(notification);
          break;
        case 'new_roster':
          _handleNewRosterNotification(notification);
          break;
        case 'sos_alert':
          _handleSOSAlertNotification(notification);
          break;
        case 'trip_started':
        case 'trip_completed':
          _handleTripNotification(notification);
          break;
        default:
          _showGenericNotification(notification);
      }
    });
  }
  
  /// Setup WebSocket listeners
  void _setupWebSocketListeners() {
    if (_webSocketService == null) return;
    
    _webSocketSubscription = _webSocketService!.messageStream.listen((message) {
      debugPrint('📡 WebSocket message received: ${message.type}');
      
      switch (message.type) {
        case 'new_roster':
          _handleNewRosterWebSocket(message.data);
          break;
        case 'roster_assigned':
          _handleRosterAssignedWebSocket(message.data);
          break;
        case 'roster_unassigned':
          _handleRosterUnassignedWebSocket(message.data);
          break;
        case 'pending_count_update':
          _handlePendingCountUpdate(message.data);
          break;
        case 'vehicle_location_updated':
          _handleVehicleLocationUpdate(message.data);
          break;
        case 'vehicle_status_changed':
          _handleVehicleStatusChanged(message.data);
          break;
        case 'trip_started':
        case 'trip_completed':
          _handleTripStatusUpdate(message.data);
          break;
        case 'passenger_status_changed':
          _handlePassengerStatusChanged(message.data);
          break;
        case 'assignment_conflict':
          _handleAssignmentConflict(message.data);
          break;
        default:
          debugPrint('⚠️ Unknown WebSocket message type: ${message.type}');
      }
    }, onError: (error) {
      debugPrint('❌ WebSocket error: $error');
    });
  }
  
  // ========== ONESIGNAL NOTIFICATION HANDLERS ==========
  
  void _handleRosterAssignedNotification(Map<String, dynamic> notification) {
    debugPrint('✅ Roster assigned notification received');
    if (mounted) {
      setState(() {
        // Trigger UI update for roster lists
      });
    }
  }
  
  void _handleNewRosterNotification(Map<String, dynamic> notification) {
    debugPrint('📬 New roster notification received');
    _playNotificationSound();
    if (mounted) {
      setState(() {
        // Trigger UI update for pending rosters
      });
    }
  }
  
  void _handleSOSAlertNotification(Map<String, dynamic> notification) {
    debugPrint('🚨 SOS alert notification received');
    _playNotificationSound();
    if (mounted) {
      // Show urgent SOS alert - could navigate to SOS screen
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🚨 New SOS Alert: ${notification['title']}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 10),
          action: SnackBarAction(
            label: 'VIEW',
            textColor: Colors.white,
            onPressed: () {
              // Navigate to SOS alerts
              setState(() {
                _selectedIndex = 2; // Assuming SOS is at index 2
              });
            },
          ),
        ),
      );
    }
  }
  
  void _handleTripNotification(Map<String, dynamic> notification) {
    debugPrint('🚗 Trip notification received: ${notification['type']}');
    if (mounted) {
      setState(() {
        // Update trip-related UI
      });
    }
  }
  
  void _showGenericNotification(Map<String, dynamic> notification) {
    debugPrint('📬 Generic notification: ${notification['title']}');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(notification['title'] ?? 'New Notification'),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }
  
  // ========== WEBSOCKET EVENT HANDLERS ==========
  
  void _handleNewRosterWebSocket(Map<String, dynamic> data) {
    debugPrint('📬 New roster created: ${data['rosterId']}');
    _playNotificationSound();
    if (mounted) {
      setState(() {
        // Refresh pending rosters list
      });
    }
  }
  
  void _handleRosterAssignedWebSocket(Map<String, dynamic> data) {
    debugPrint('✅ Roster assigned: ${data['rosterId']} → ${data['vehicleReg']}');
    if (mounted) {
      setState(() {
        // Update roster assignment UI
      });
    }
  }
  
  void _handleRosterUnassignedWebSocket(Map<String, dynamic> data) {
    debugPrint('❌ Roster unassigned: ${data['rosterId']}');
    if (mounted) {
      setState(() {
        // Update roster UI
      });
    }
  }
  
  void _handlePendingCountUpdate(Map<String, dynamic> data) {
    final count = data['count'] as int? ?? 0;
    debugPrint('🔢 Pending rosters count: $count');
    if (mounted) {
      setState(() {
        _pendingRostersCount = count;
      });
    }
  }
  
  void _handleVehicleLocationUpdate(Map<String, dynamic> data) {
    final vehicleId = data['vehicleId'] as String?;
    if (vehicleId != null) {
      debugPrint('📍 Vehicle location updated: $vehicleId');
      if (mounted) {
        setState(() {
          _realTimeVehicleLocations[vehicleId] = {
            'lat': data['lat'],
            'lon': data['lon'],
            'speed': data['speed'],
            'heading': data['heading'],
            'timestamp': data['timestamp'],
          };
        });
      }
    }
  }
  
  void _handleVehicleStatusChanged(Map<String, dynamic> data) {
    debugPrint('🚗 Vehicle status changed: ${data['vehicleId']} → ${data['status']}');
    if (mounted) {
      setState(() {
        // Update vehicle status in UI
      });
    }
  }
  
  void _handleTripStatusUpdate(Map<String, dynamic> data) {
    debugPrint('🚀 Trip status update: ${data['tripId']}');
    if (mounted) {
      setState(() {
        // Update trip status in UI
      });
    }
  }
  
  void _handlePassengerStatusChanged(Map<String, dynamic> data) {
    debugPrint('👤 Passenger status changed: ${data['passengerId']} → ${data['status']}');
    // Could show a toast or update passenger list
  }
  
  void _handleAssignmentConflict(Map<String, dynamic> data) {
    debugPrint('⚠️ Assignment conflict: ${data['message']}');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(data['message'] ?? 'Assignment conflict detected'),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }
  
  // ========== HELPER METHODS ==========
  
  /// Request live pending count from WebSocket
  void _requestPendingCount() {
    _webSocketService?.sendMessage('get_pending_count', {});
  }
  
  /// Request live available vehicles count from WebSocket  
  void _requestAvailableVehiclesCount() {
    _webSocketService?.sendMessage('get_available_vehicles_count', {});
  }
  
  /// Subscribe to specific roster updates
  void _subscribeToRoster(String rosterId) {
    _webSocketService?.sendMessage('subscribe_roster', {'rosterId': rosterId});
  }
  
  /// Unsubscribe from roster updates
  void _unsubscribeFromRoster(String rosterId) {
    _webSocketService?.sendMessage('unsubscribe_roster', {'rosterId': rosterId});
  }
  
  /// Subscribe to specific vehicle updates
  void _subscribeToVehicle(String vehicleId) {
    _webSocketService?.sendMessage('subscribe_vehicle', {'vehicleId': vehicleId});
  }
  
  /// Unsubscribe from vehicle updates
  void _unsubscribeFromVehicle(String vehicleId) {
    _webSocketService?.sendMessage('unsubscribe_vehicle', {'vehicleId': vehicleId});
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final isMobile = MediaQuery.of(context).size.width <= 768;
    
    // Wrap with ChangeNotifierProvider for NotificationProvider (OneSignal system)
    return ChangeNotifierProvider(
      create: (_) => NotificationProvider(),
      child: Scaffold(
        body: Row(
          children: [
            _buildSidebar(isMobile),
            Expanded(
              child: Column(
                children: [
                  _buildTopAppBar(),
                  Expanded(
                    child: Stack(
                      children: [
                        IndexedStack(
                          index: _navigationMap[_selectedNavigationKey] ?? 0,
                          children: _adminScreens,
                        ),
                        if (_contextualView != null)
                          _contextualView!,
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebar(bool isMobile) { 
    return Material( 
      elevation: 8, 
      child: Container( 
        width: isMobile ? 70 : 250, 
        color: kPrimaryColor, 
        child: Column( 
          children: [ 
            Container( 
              padding: const EdgeInsets.only(top: 40, bottom: 20), 
              child: Column( 
                children: [ 
                  Container( 
                    width: 50, 
                    height: 50, 
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(25)
                    ), 
                    child: Padding(
                      padding: const EdgeInsets.all(3),
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ), 
                  if (!isMobile) ...[ 
                    const SizedBox(height: 12), 
                    const Text('Abra Travels', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)), 
                    const SizedBox(height: 4), 
                    const Text('admin@abratravels.com', style: TextStyle(color: Colors.white70, fontSize: 12)), 
                    const SizedBox(height: 4), 
                    Text('Role: ${_userRole ?? "Loading..."}', style: const TextStyle(color: Colors.yellow, fontSize: 10, fontWeight: FontWeight.bold)), 
                  ], 
                ], 
              ), 
            ), 
            const SizedBox(height: 8), 
            Expanded( 
              child: ListView( 
                padding: const EdgeInsets.symmetric(horizontal: 12), 
                children: _buildRoleBasedNavigation(isMobile),
              ), 
            ), 
            Container( 
              padding: const EdgeInsets.symmetric(vertical: 20), 
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1)))
              ), 
              child: isMobile
                ? const Icon(Icons.admin_panel_settings, color: Colors.white70, size: 24)
                : const Row( 
                    mainAxisAlignment: MainAxisAlignment.center, 
                    children: [ 
                      Icon(Icons.admin_panel_settings, color: Colors.white70, size: 18), 
                      SizedBox(width: 8), 
                      Text('Admin Panel', style: TextStyle(color: Colors.white70, fontSize: 14)), 
                    ], 
                  ), 
            ), 
          ], 
        ), 
      ), 
    ); 
  }

  // Build role-based navigation items
  List<Widget> _buildRoleBasedNavigation(bool isMobile) {
    if (!_permissionsLoaded) {
      return [
        const Center(
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
      ];
    }

    final List<Widget> navigationItems = [];
    
    debugPrint('🔍 Building navigation for role: $_userRole');
    debugPrint('🔍 Permissions: ${_userPermissions.keys.join(", ")}');
    
    final isAdmin = _userRole == 'super_admin' || _userRole == 'admin';
    
    // Dashboard - always visible
    navigationItems.add(_buildMenuItem(
      title: 'Dashboard',
      icon: Icons.dashboard_rounded,
      navKey: NavigationKeys.dashboard,
      isMobile: isMobile,
    ));
    
    if (isAdmin) {
      // Admin sees everything
      navigationItems.add(_buildVehicleDropdown(context, isMobile));
      navigationItems.add(_buildMenuItem(title: 'Drivers', icon: Icons.groups, navKey: NavigationKeys.drivers, isMobile: isMobile));
      navigationItems.add(_buildCustomerDropdown(context, isMobile));
      navigationItems.add(_buildClientDropdown(context, isMobile));
      navigationItems.add(_buildMenuItem(title: 'Billing System', icon: Icons.receipt_long, navKey: NavigationKeys.billingSystem, isMobile: isMobile));
      navigationItems.add(_buildMenuItem(title: 'Fleet Map View', icon: Icons.map, navKey: NavigationKeys.fleetMap, isMobile: isMobile));
      navigationItems.add(_buildMenuItem(title: 'Reports', icon: Icons.analytics, navKey: NavigationKeys.reports, isMobile: isMobile));
      navigationItems.add(_buildSosExpansionTile(context, isMobile));
      navigationItems.add(_buildHrmDropdown(context, isMobile));
      navigationItems.add(_buildTmsDropdown(context, isMobile));
      navigationItems.add(_buildFeedbackDropdown(context, isMobile));
      navigationItems.add(_buildMenuItem(title: 'Role Access Control', icon: Icons.admin_panel_settings, navKey: NavigationKeys.roleAccessControl, isMobile: isMobile));
    } else {
      // Employee - show only permitted sections
      
      // Fleet Management (Vehicles dropdown)
      if (_hasAnyPermission(['fleet_vehicles', 'fleet_trips', 'fleet_maintenance', 'fleet_management', 'fleet_gps_tracking'])) {
        navigationItems.add(_buildVehicleDropdown(context, isMobile));
      }
      
      // Drivers
      if (_hasPermission('fleet_drivers')) {
        navigationItems.add(_buildMenuItem(title: 'Drivers', icon: Icons.groups, navKey: NavigationKeys.drivers, isMobile: isMobile));
      }
      
      // Customer Management
      if (_hasPermission('customer_fleet')) {
        navigationItems.add(_buildCustomerDropdown(context, isMobile));
      }
      
      // Fleet Map
      if (_hasPermission('fleet_management')) {
        navigationItems.add(_buildMenuItem(title: 'Fleet Map View', icon: Icons.map, navKey: NavigationKeys.fleetMap, isMobile: isMobile));
      }
      
      // HRM & Feedback
      if (_hasPermission('hrm_feedback')) {
        navigationItems.add(_buildHrmDropdown(context, isMobile));
        navigationItems.add(_buildFeedbackDropdown(context, isMobile));
      }
    }
    
    return navigationItems;
  }
  
 Widget _buildVehicleDropdown(BuildContext context, bool isMobile) {
  // ✅ FILTER items based on permissions
  final allVehicleSubItems = [
    {'title': 'Vehicle Master', 'navKey': NavigationKeys.vehicleMaster, 'permission': 'fleet_vehicles'},
    {'title': 'Trip Operation', 'navKey': NavigationKeys.tripOperation, 'permission': 'fleet_trips'},
    {'title': 'GPS Tracking', 'navKey': NavigationKeys.gpsTracking, 'permission': 'fleet_gps_tracking'},
    {'title': 'Maintenance Management', 'navKey': NavigationKeys.maintenanceManagement, 'permission': 'fleet_maintenance'},
  ];
  
  // Filter based on permissions
  final vehicleSubItems = allVehicleSubItems.where((item) {
    final permission = item['permission'] as String?;
    if (permission == null) return true; // No permission required
    
    // Admin always has access
    if (_userRole == 'super_admin' || _userRole == 'admin') return true;
    
    // Check employee permission
    return _hasPermission(permission);
  }).toList();
  
  // ✅ If no items are visible, don't show the dropdown at all
  if (vehicleSubItems.isEmpty) {
    return const SizedBox.shrink();
  }
  
  final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
  final isVehicleSectionActive = _vehicleScreenIndices.contains(currentScreenIndex);
  
  // Determine badge color based on document status
  Color? badgeColor;
  if (_expiredDocumentsCount > 0) {
    try {
      final vehicleProvider = Provider.of<VehicleProvider>(context, listen: false);
      final status = vehicleProvider.getDocumentExpiryStatus();
      final expired = status['expired'] ?? 0;
      
      if (expired > 0) {
        badgeColor = Colors.red;
      } else {
        badgeColor = Colors.orange;
      }
    } catch (e) {
      badgeColor = Colors.orange;
    }
  }
  
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 4),
    decoration: BoxDecoration(
      color: isVehicleSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      border: badgeColor == Colors.red 
          ? Border.all(color: Colors.red.withOpacity(0.5), width: 2)
          : null,
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: isVehicleSectionActive,
        leading: Stack(
          children: [
            Icon(
              Icons.directions_car_filled,
              color: badgeColor ?? Colors.white,
            ),
            if (_expiredDocumentsCount > 0)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: badgeColor ?? Colors.red,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: (badgeColor ?? Colors.red).withOpacity(0.5),
                        blurRadius: 4,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                  child: Text(
                    '$_expiredDocumentsCount',
                    style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        title: isMobile ? const SizedBox.shrink() : Row(
          children: [
            const Expanded(
              child: Text('Vehicles', style: TextStyle(color: Colors.white)),
            ),
            if (_expiredDocumentsCount > 0 && !isMobile)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$_expiredDocumentsCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        children: vehicleSubItems.map<Widget>((item) {
          final isVehicleMaster = item['navKey'] == NavigationKeys.vehicleMaster;
          return _buildSubMenuItem(
            title: item['title'] as String,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == item['navKey'],
            badge: isVehicleMaster && _expiredDocumentsCount > 0 ? _expiredDocumentsCount : null,
            badgeColor: isVehicleMaster ? badgeColor : null,
            onTap: () => _navigateToTab(item['navKey'] as String),
          );
        }).toList(),
        iconColor: Colors.white,
        collapsedIconColor: Colors.white,
      ),
    ),
  );
}

  Widget _buildCustomerDropdown(BuildContext context, bool isMobile) {
  // ✅ Define all customer sub-items with their permission requirements
  final allCustomerSubItems = [
    {'title': 'All Customers', 'navKey': NavigationKeys.allCustomers, 'permission': 'customer_fleet'},
    {'title': 'Pending Approvals', 'navKey': NavigationKeys.pendingApprovals, 'permission': 'customer_fleet'},
    {'title': 'Pending Rosters', 'navKey': NavigationKeys.pendingRosters, 'permission': 'customer_fleet'},
    {'title': 'Approved Rosters', 'navKey': NavigationKeys.approvedRosters, 'permission': 'customer_fleet'},
    {'title': 'Trip Cancellation', 'navKey': NavigationKeys.tripCancellation, 'permission': 'customer_fleet'},
  ];
  
  // ✅ Filter based on permissions
  final customerSubItems = allCustomerSubItems.where((item) {
    final permission = item['permission'] as String?;
    if (permission == null) return true;
    
    // Admin always has access
    if (_userRole == 'super_admin' || _userRole == 'admin') return true;
    
    // Check employee permission
    return _hasPermission(permission);
  }).toList();
  
  // ✅ If no items are visible, don't show the dropdown
  if (customerSubItems.isEmpty) {
    return const SizedBox.shrink();
  }
  
  final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
  final isCustomerSectionActive = _customerScreenIndices.contains(currentScreenIndex);
  
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 4),
    decoration: BoxDecoration(
      color: isCustomerSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: isCustomerSectionActive,
        leading: Stack(
          children: [
            const Icon(Icons.people, color: Colors.white),
            if (_pendingRosters.isNotEmpty)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                  child: Text(
                    '${_pendingRosters.length}',
                    style: const TextStyle(color: Colors.white, fontSize: 8),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        title: isMobile ? const SizedBox.shrink() : const Text('Customer Management', style: TextStyle(color: Colors.white)),
        children: customerSubItems.map<Widget>((item) {
          final isPendingRosters = item['navKey'] == NavigationKeys.pendingRosters;
          final isApprovedRosters = item['navKey'] == NavigationKeys.approvedRosters;
          
          return _buildSubMenuItem(
            title: item['title'] as String,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == item['navKey'],
            badge: isPendingRosters && _pendingRosters.isNotEmpty 
                ? _pendingRosters.length 
                : (isApprovedRosters && _approvedRosters.isNotEmpty
                    ? _approvedRosters.length 
                    : null),
            onTap: () => _navigateToTab(item['navKey'] as String),
          );
        }).toList(),
        iconColor: Colors.white,
        collapsedIconColor: Colors.white,
      ),
    ),
  );
}

 Widget _buildClientDropdown(BuildContext context, bool isMobile) {
  // ✅ All client items require 'abra_global_trading' permission
  final allClientSubItems = [
    {'title': 'Client Details', 'navKey': NavigationKeys.clientDetails, 'permission': 'abra_global_trading'},
    {'title': 'Trips', 'navKey': NavigationKeys.trips, 'permission': 'abra_global_trading'},
  ];
  
  // ✅ Filter based on permissions
  final clientSubItems = allClientSubItems.where((item) {
    final permission = item['permission'] as String?;
    if (permission == null) return true;
    
    // Admin always has access
    if (_userRole == 'super_admin' || _userRole == 'admin') return true;
    
    // Check employee permission
    return _hasPermission(permission);
  }).toList();
  
  // ✅ If no items are visible, don't show the dropdown
  if (clientSubItems.isEmpty) {
    return const SizedBox.shrink();
  }
  
  final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
  final isClientSectionActive = _clientScreenIndices.contains(currentScreenIndex);
  
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 4),
    decoration: BoxDecoration(
      color: isClientSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: isClientSectionActive,
        leading: const Icon(Icons.business, color: Colors.white),
        title: isMobile ? const SizedBox.shrink() : const Text('Client Management', style: TextStyle(color: Colors.white)),
        children: clientSubItems.map((item) {
          return _buildSubMenuItem(
            title: item['title'] as String,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == item['navKey'],
            onTap: () => _navigateToTab(item['navKey'] as String),
          );
        }).toList(),
        iconColor: Colors.white,
        collapsedIconColor: Colors.white,
      ),
    ),
  );
}

 Widget _buildHrmDropdown(BuildContext context, bool isMobile) {
  // ✅ All HRM items require 'hrm_feedback' permission
  final allHrmSubItems = [
    {'title': 'Employees', 'navKey': NavigationKeys.hrmEmployees},
    {'title': 'Leave Requests', 'navKey': NavigationKeys.hrmLeaveRequests},
    {'title': 'Payroll', 'navKey': NavigationKeys.hrmPayroll},
    {'title': 'Notice Board', 'navKey': NavigationKeys.noticeBoard},
    {'title': 'Attendance', 'navKey': NavigationKeys.attendance},
  ];
  
  // Admin always has access
  if (_userRole != 'super_admin' && _userRole != 'admin') {
    // Check if employee has hrm_feedback permission
    if (!_hasPermission('hrm_feedback')) {
      return const SizedBox.shrink(); // Don't show if no permission
    }
  }
  
  final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
  final isHrmSectionActive = _hrmScreenIndices.contains(currentScreenIndex);
  
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 4),
    decoration: BoxDecoration(
      color: isHrmSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: isHrmSectionActive,
        leading: const Icon(Icons.people, color: Colors.white),
        title: isMobile ? const SizedBox.shrink() : const Text('HRM', style: TextStyle(color: Colors.white)),
        children: allHrmSubItems.map<Widget>((item) {
          return _buildSubMenuItem(
            title: item['title'] as String,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == item['navKey'],
            onTap: () {
              debugPrint('🏢 HRM DROPDOWN CLICKED:');
              debugPrint('   Title: ${item['title']}');
              debugPrint('   NavKey: ${item['navKey']}');
              debugPrint('   Expected Index: ${_navigationMap[item['navKey']]}');
              
              _navigateToTab(item['navKey'] as String);
            },
          );
        }).toList(),
        iconColor: Colors.white,
        collapsedIconColor: Colors.white,
      ),
    ),
  );
}

  Widget _buildTmsDropdown(BuildContext context, bool isMobile) {
  // ✅ TMS items - you can add permission field if needed
  // For now, assuming TMS is available to all employees who have access
  final allTmsSubItems = [
    {'title': 'Raise a Ticket', 'navKey': NavigationKeys.raiseTicket},
    {'title': 'My Tickets', 'navKey': NavigationKeys.myTickets},
    {'title': 'All Tickets', 'navKey': NavigationKeys.allTickets}, // Only for admins
    {'title': 'Closed Tickets', 'navKey': NavigationKeys.closedTickets},
  ];
  
  // ✅ Filter based on role (All Tickets only for admins)
  final tmsSubItems = allTmsSubItems.where((item) {
    final navKey = item['navKey'] as String;
    
    // "All Tickets" only for admins
    if (navKey == NavigationKeys.allTickets) {
      return _userRole == 'super_admin' || _userRole == 'admin';
    }
    
    return true; // Other items available to all
  }).toList();
  
  final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
  final isTmsSectionActive = [33, 34, 35, 36].contains(currentScreenIndex);
  
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 4),
    decoration: BoxDecoration(
      color: isTmsSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: isTmsSectionActive,
        leading: const Icon(Icons.confirmation_number_rounded, color: Colors.white),
        title: isMobile 
            ? const SizedBox.shrink() 
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('TMS', style: TextStyle(color: Colors.white)),
                  if (_totalTicketsCount > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade600,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$_totalTicketsCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
        children: tmsSubItems.map<Widget>((item) {
          return _buildSubMenuItem(
            title: item['title'] as String,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == item['navKey'],
            onTap: () {
              debugPrint('🎫 TMS DROPDOWN CLICKED:');
              debugPrint('   Title: ${item['title']}');
              debugPrint('   NavKey: ${item['navKey']}');
              
              _navigateToTab(item['navKey'] as String);
            },
          );
        }).toList(),
        iconColor: Colors.white,
        collapsedIconColor: Colors.white,
      ),
    ),
  );
}

  Widget _buildFeedbackDropdown(BuildContext context, bool isMobile) { 
    final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
    final isFeedbackSectionActive = currentScreenIndex == 27; // Unified feedback screen index
    
    return Container( 
      margin: const EdgeInsets.symmetric(vertical: 4), 
      decoration: BoxDecoration( 
        color: isFeedbackSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent, 
        borderRadius: BorderRadius.circular(8), 
      ), 
      child: ListTile(
        leading: const Icon(Icons.feedback, color: Colors.white),
        title: isMobile ? const SizedBox.shrink() : const Text('Feedback Management', style: TextStyle(color: Colors.white)),
        selected: isFeedbackSectionActive,
        onTap: () {
          _navigateToTab(NavigationKeys.feedbackManagement);
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ); 
  }
  
  AppBar _buildTopAppBar() {
    // Find the menu item for the current navigation key
    final currentMenuItem = _menuItems.firstWhere(
      (item) => item['navKey'] == _selectedNavigationKey,
      orElse: () => {'title': 'Dashboard'},
    );
    
    return AppBar(
      automaticallyImplyLeading: false,
      title: Text(currentMenuItem['title'] ?? 'Dashboard'),
      backgroundColor: kPrimaryColor,
      foregroundColor: Colors.white,
      actions: [
        // 🔄 Refresh Button
        IconButton(
          icon: const Icon(Icons.refresh, size: 28, color: Colors.white),
          onPressed: () => _handleRefresh(),
          tooltip: 'Refresh',
        ),
        _buildSOSAlertBadge(),
        _buildRosterNotificationBadge(),
        _buildApprovedRosterBadge(),
        _buildNotificationBadge(),
        // 💬 Support Icon
        IconButton(
          icon: const Icon(Icons.headset_mic_outlined, size: 28, color: Colors.white),
          onPressed: () => _showSupportDialog(context),
          tooltip: 'Support',
        ),
        IconButton(
          icon: const Icon(Icons.exit_to_app, size: 28, color: Colors.white),
          onPressed: () => _handleLogout(context)
        ),
      ],
    );
  }

  Widget _buildMenuItem({
    required String title,
    required IconData icon,
    required String navKey,
    required bool isMobile
  }) {
    final isSelected = _selectedNavigationKey == navKey;
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: isSelected ? Colors.black.withOpacity(0.3) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: InkWell(
        onTap: () => _navigateToTab(navKey),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            mainAxisAlignment: isMobile ? MainAxisAlignment.center : MainAxisAlignment.start,
            children: [
              Icon(icon, color: Colors.white),
              if (!isMobile) ...[
                const SizedBox(width: 16),
                Text(title, style: const TextStyle(color: Colors.white)),
              ]
            ],
          ),
        ),
      ),
    );
  }
  
 Widget _buildSosExpansionTile(BuildContext context, bool isMobile) {
  // ✅ SOS Alerts only for admins
  if (_userRole != 'super_admin' && _userRole != 'admin') {
    return const SizedBox.shrink();
  }
  
  final currentScreenIndex = _navigationMap[_selectedNavigationKey] ?? 0;
  final resolvedAlertsIndex = _navigationMap[NavigationKeys.resolvedAlerts] ?? 7;
  final incompleteAlertsIndex = _navigationMap[NavigationKeys.incompleteAlerts] ?? 8;
  final bool isExpandedSectionActive = currentScreenIndex == resolvedAlertsIndex || currentScreenIndex == incompleteAlertsIndex;
  
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 4),
    decoration: BoxDecoration(
      color: isExpandedSectionActive ? Colors.black.withOpacity(0.15) : Colors.transparent,
      borderRadius: BorderRadius.circular(8)
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: isExpandedSectionActive,
        leading: const Icon(Icons.sos_rounded, color: Colors.white),
        title: isMobile ? const SizedBox.shrink() : const Text('SOS Alerts', style: TextStyle(color: Colors.white)),
        children: [
          _buildSubMenuItem(
            title: 'Incomplete',
            icon: Icons.warning_amber_rounded,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == NavigationKeys.incompleteAlerts,
            onTap: () => _navigateToTab(NavigationKeys.incompleteAlerts),
          ),
          _buildSubMenuItem(
            title: 'Resolved',
            icon: Icons.check_circle,
            isMobile: isMobile,
            isSelected: _selectedNavigationKey == NavigationKeys.resolvedAlerts,
            onTap: () => _navigateToTab(NavigationKeys.resolvedAlerts),
          ),
        ],
        iconColor: Colors.white,
        collapsedIconColor: Colors.white,
      ),
    ),
  );
}
  
  Widget _buildSubMenuItem({
    required String title,
    IconData? icon,
    required bool isMobile,
    required bool isSelected,
    required VoidCallback onTap,
    int? badge,
    Color? badgeColor,
  }) {
    final effectiveBadgeColor = badgeColor ?? Colors.orange;
    return ListTile(
      leading: icon != null
          ? Stack(
              children: [
                Icon(icon, color: isSelected ? Colors.white : Colors.white),
                if (badge != null && badge > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: effectiveBadgeColor,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: effectiveBadgeColor.withOpacity(0.5),
                            blurRadius: 3,
                          ),
                        ],
                      ),
                      constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                      child: Text(
                        '$badge',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            )
          : null,
      title: isMobile
          ? null
          : Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                ),
                if (badge != null && badge > 0 && !isMobile)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: effectiveBadgeColor,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: effectiveBadgeColor.withOpacity(0.5),
                          blurRadius: 3,
                        ),
                      ],
                    ),
                    child: Text(
                      '$badge',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
      onTap: onTap,
      selected: isSelected,
      selectedTileColor: Colors.white.withOpacity(0.25),
      dense: true,
      contentPadding: isMobile
          ? null
          : (icon == null ? const EdgeInsets.only(left: 48) : null),
    );
  }

  Widget _buildSOSAlertBadge() {
    return Stack(
      children: [
        IconButton(
          icon: Icon(
            Icons.sos_rounded,
            size: 28,
            color: _activeSOSAlerts.isNotEmpty ? Colors.yellowAccent : Colors.white
          ),
          onPressed: () => _navigateToTab(NavigationKeys.incompleteAlerts),
        ),
        if (_activeSOSAlerts.isNotEmpty)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(12)
              ),
              constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
              child: Text(
                '${_activeSOSAlerts.length}',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildRosterNotificationBadge() {
    final pendingCount = _pendingRosters.length;
    final unacknowledgedCount = _pendingRosters
        .where((r) => !_acknowledgedRosterIds.contains(r.id))
        .length;
    
    return Stack(
      children: [
        IconButton(
          icon: Icon(
            Icons.calendar_month,
            size: 28,
            color: unacknowledgedCount > 0 ? Colors.orangeAccent : Colors.white,
          ),
          onPressed: () => _navigateToTab(NavigationKeys.pendingRosters),
        ),
        if (pendingCount > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: unacknowledgedCount > 0 ? Colors.orange : Colors.blue,
                borderRadius: BorderRadius.circular(12),
              ),
              constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
              child: Text(
                '$pendingCount',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildApprovedRosterBadge() {
    final approvedCount = _approvedRosters.length;
    
    return Stack(
      children: [
        IconButton(
          icon: const Icon(
            Icons.assignment_turned_in,
            size: 28,
            color: Colors.white,
          ),
          onPressed: () => _navigateToTab(NavigationKeys.approvedRosters),
        ),
        if (approvedCount > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(12),
              ),
              constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
              child: Text(
                '$approvedCount',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildNotificationBadge() {
    return Consumer<NotificationProvider>(
      builder: (context, provider, child) {
        return Stack(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications, size: 28),
              onPressed: () {
                debugPrint('🔔 ========== NOTIFICATION BELL CLICKED ==========');
                debugPrint('🔔 Unread count: ${provider.unreadCount}');
                debugPrint('🔔 Navigating to NotificationsScreen...');
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AdminNotificationsScreen())
                ).then((_) {
                  debugPrint('🔔 Returned from AdminNotificationsScreen');
                  debugPrint('🔔 Refreshing notification count after return...');
                  provider.fetchUnreadNotificationCount(adminOnly: true);
                });
              },
            ),
            if (provider.unreadCount > 0)
              Positioned(
                right: 6,
                top: 6,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(12)
                  ),
                  constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
                  child: Text(
                    '${provider.unreadCount}',
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}