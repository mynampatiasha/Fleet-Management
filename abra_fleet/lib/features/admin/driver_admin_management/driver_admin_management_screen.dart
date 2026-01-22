// lib/features/admin/driver_admin_management/driver_admin_management_screen.dart

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/core/services/driver_service.dart';
import 'package:abra_fleet/app/config/api_config.dart';
import 'package:abra_fleet/features/admin/driver_admin_management/driver_admin_management_dialogs.dart';
import 'package:abra_fleet/features/admin/driver_admin_management/driver_list_page.dart';
import 'package:abra_fleet/core/services/vehicle_service.dart';

class DriverDashboardPage extends StatefulWidget {
  final AuthRepository authRepository;

  const DriverDashboardPage({
    Key? key,
    required this.authRepository,
  }) : super(key: key);

  @override
  State<DriverDashboardPage> createState() => _DriverDashboardPageState();
}

class _DriverDashboardPageState extends State<DriverDashboardPage> {
  late DriverService _driverService;
  late VehicleService _vehicleService;
  
  Map<String, dynamic> _summary = {
    'total': 0,
    'active': 0,
    'onLeave': 0,
    'inactive': 0,
  };

  int _expiringDocumentsCount = 0;
  bool _isLoading = false;

  // Real-time data variables
  Map<String, dynamic> _tripsData = {
    'totalTrips': 0,
    'completedTrips': 0,
    'ongoingTrips': 0,
    'cancelledTrips': 0,
  };

  Map<String, dynamic> _onTripData = {
    'driversOnTrip': 0,
    'activeTrips': [],
  };

  // Real-time update timer
  Timer? _realTimeUpdateTimer;


  @override
  void initState() {
    super.initState();
    _driverService = DriverService();
    
    _vehicleService = VehicleService();
    
    print('[DriverDashboard] 🚀 Initializing driver dashboard...');
    _fetchSummary();
    
    // Setup real-time updates every 30 seconds
    _realTimeUpdateTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (mounted) {
        _fetchSummary();
      }
    });
  }

  @override
  void dispose() {
    _realTimeUpdateTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchSummary() async {
    if (!mounted) return;
    
    setState(() => _isLoading = true);

    try {
      // Ensure authentication is ready before making API calls
      print('[DriverDashboard] 🔐 Verifying authentication...');
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token') ?? await widget.authRepository.getAuthToken();
      
      if (token == null || token.isEmpty) {
        print('[DriverDashboard] ⚠️ No auth token available, waiting...');
        // Wait a bit for authentication to complete
        await Future.delayed(const Duration(milliseconds: 500));
      }

      // Fetch all data in parallel
      await Future.wait([
        _fetchDriverSummary(),
        _fetchTripsData(),
        _fetchOnTripData(),
        _fetchExpiringDocuments(),
      ]);
    } catch (e) {
      print('[DriverDashboard] ❌ Error fetching summary: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _fetchDriverSummary() async {
    try {
      final response = await _driverService.getDrivers();
      
      if (response['success'] == true) {
        if (response['summary'] != null) {
          if (mounted) {
            setState(() {
              _summary = response['summary'];
            });
          }
        } else {
          final drivers = List<Map<String, dynamic>>.from(response['data'] ?? []);
          final activeDrivers = drivers.where((d) => d['status']?.toString().toLowerCase() == 'active').length;
          final onLeaveDrivers = drivers.where((d) => d['status']?.toString().toLowerCase() == 'on_leave').length;
          final inactiveDrivers = drivers.where((d) => d['status']?.toString().toLowerCase() == 'inactive').length;
          
          if (mounted) {
            setState(() {
              _summary = {
                'total': drivers.length,
                'active': activeDrivers,
                'onLeave': onLeaveDrivers,
                'inactive': inactiveDrivers,
              };
            });
          }
        }
      }
    } catch (e) {
      print('[DriverDashboard] ❌ Error fetching driver summary: $e');
    }
  }

  Future<void> _fetchTripsData() async {
    try {
      // Get JWT auth token from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/admin/analytics/trips/completed-today'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && mounted) {
          setState(() {
            _tripsData = {
              'totalTrips': data['count'] ?? 0,
              'completedTrips': data['count'] ?? 0,
              'ongoingTrips': 0,
              'cancelledTrips': 0,
            };
          });
        }
      }
    } catch (e) {
      print('[DriverDashboard] ⚠️ Error fetching trips data: $e');
    }
  }

  Future<void> _fetchOnTripData() async {
    try {
      // Get JWT auth token from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/admin/analytics/trips/active'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && mounted) {
          final activeTrips = List<Map<String, dynamic>>.from(data['trips'] ?? []);
          final uniqueDrivers = <String>{};
          
          for (final trip in activeTrips) {
            if (trip['driverId'] != null) {
              uniqueDrivers.add(trip['driverId'].toString());
            }
          }
          
          setState(() {
            _onTripData = {
              'driversOnTrip': uniqueDrivers.length,
              'activeTrips': activeTrips,
            };
          });
        }
      }
    } catch (e) {
      print('[DriverDashboard] ⚠️ Error fetching on-trip data: $e');
    }
  }

  Future<void> _fetchExpiringDocuments() async {
    try {
      final expiringCount = await _fetchExpiringDocumentsCount();
      if (mounted) {
        setState(() {
          _expiringDocumentsCount = expiringCount;
        });
      }
    } catch (e) {
      print('[DriverDashboard] ⚠️ Error fetching expiring documents: $e');
    }
  }

  // Show On Trip Details Dialog
  Future<void> _showOnTripDetailsDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(Icons.directions_car, color: Colors.orange[700]),
              const SizedBox(width: 12),
              const Text('Drivers On Trip'),
            ],
          ),
          content: Container(
            width: double.maxFinite,
            constraints: const BoxConstraints(maxHeight: 500),
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _fetchActiveTripsDetails(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                if (snapshot.hasError) {
                  return Center(
                    child: Text('Error: ${snapshot.error}'),
                  );
                }
                
                final activeTrips = snapshot.data ?? [];
                
                if (activeTrips.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.info_outline, size: 48, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No drivers currently on trip'),
                      ],
                    ),
                  );
                }
                
                return SingleChildScrollView(
                  child: Column(
                    children: activeTrips.map((trip) => _buildTripCard(trip)).toList(),
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  // Show Total Trips Details Dialog
  Future<void> _showTotalTripsDetailsDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(Icons.bar_chart, color: Colors.blue[700]),
              const SizedBox(width: 12),
              const Text('Trip Statistics'),
            ],
          ),
          content: Container(
            width: double.maxFinite,
            constraints: const BoxConstraints(maxHeight: 400),
            child: FutureBuilder<Map<String, dynamic>>(
              future: _fetchTripStatistics(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                if (snapshot.hasError) {
                  return Center(
                    child: Text('Error: ${snapshot.error}'),
                  );
                }
                
                final stats = snapshot.data ?? {};
                
                return SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTripStatsOverview(stats),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),
                      _buildTripBreakdown(stats),
                    ],
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  // Fetch active trips details
  Future<List<Map<String, dynamic>>> _fetchActiveTripsDetails() async {
    try {
      // Get JWT auth token from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/admin/analytics/trips/active'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['trips'] ?? []);
        }
      }
      return [];
    } catch (e) {
      print('Error fetching active trips: $e');
      return [];
    }
  }

  // Fetch trip statistics
  Future<Map<String, dynamic>> _fetchTripStatistics() async {
    try {
      // Get JWT auth token from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      final responses = await Future.wait([
        http.get(
          Uri.parse('${ApiConfig.baseUrl}/api/admin/analytics/trips/completed-today'),
          headers: {
            'Content-Type': 'application/json',
            if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ),
        http.get(
          Uri.parse('${ApiConfig.baseUrl}/api/admin/analytics/trips/active'),
          headers: {
            'Content-Type': 'application/json',
            if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ),
        http.get(
          Uri.parse('${ApiConfig.baseUrl}/api/admin/analytics/trips/cancelled-today'),
          headers: {
            'Content-Type': 'application/json',
            if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ),
      ]);

      final completedData = json.decode(responses[0].body);
      final activeData = json.decode(responses[1].body);
      final cancelledData = json.decode(responses[2].body);

      return {
        'completedToday': completedData['count'] ?? 0,
        'activeTrips': activeData['count'] ?? 0,
        'cancelledToday': cancelledData['count'] ?? 0,
        'totalToday': (completedData['count'] ?? 0) + (activeData['count'] ?? 0) + (cancelledData['count'] ?? 0),
      };
    } catch (e) {
      print('Error fetching trip statistics: $e');
      return {};
    }
  }

  // Build trip card widget
  Widget _buildTripCard(Map<String, dynamic> trip) {
    final tripId = trip['tripId'] ?? trip['_id'] ?? 'Unknown';
    final driverName = trip['driverName'] ?? 'Unknown Driver';
    final customerName = trip['customerName'] ?? 'Unknown Customer';
    final vehicleNumber = trip['vehicleNumber'] ?? 'Unknown Vehicle';
    final status = trip['status'] ?? 'unknown';
    
    Color statusColor;
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'ongoing':
        statusColor = Colors.blue;
        break;
      case 'scheduled':
        statusColor = Colors.orange;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Trip: $tripId',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    status.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Driver: $driverName'),
            Text('Customer: $customerName'),
            Text('Vehicle: $vehicleNumber'),
          ],
        ),
      ),
    );
  }

  // Build trip stats overview
  Widget _buildTripStatsOverview(Map<String, dynamic> stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Today\'s Trip Overview',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Total Today',
                stats['totalToday']?.toString() ?? '0',
                Icons.route,
                Colors.blue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Completed',
                stats['completedToday']?.toString() ?? '0',
                Icons.check_circle,
                Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Active',
                stats['activeTrips']?.toString() ?? '0',
                Icons.directions_car,
                Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Cancelled',
                stats['cancelledToday']?.toString() ?? '0',
                Icons.cancel,
                Colors.red,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Build trip breakdown
  Widget _buildTripBreakdown(Map<String, dynamic> stats) {
    final total = stats['totalToday'] ?? 0;
    final completed = stats['completedToday'] ?? 0;
    final active = stats['activeTrips'] ?? 0;
    final cancelled = stats['cancelledToday'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Performance Breakdown',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (total > 0) ...[
          _buildProgressBar('Completed', completed, total, Colors.green),
          _buildProgressBar('Active', active, total, Colors.orange),
          _buildProgressBar('Cancelled', cancelled, total, Colors.red),
        ] else
          const Text('No trips recorded today'),
      ],
    );
  }

  // Build stat card
  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // Build progress bar
  Widget _buildProgressBar(String label, int value, int total, Color color) {
    final percentage = total > 0 ? (value / total) : 0.0;
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(label, style: const TextStyle(fontSize: 12)),
          ),
          Expanded(
            child: LinearProgressIndicator(
              value: percentage,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '$value (${(percentage * 100).toStringAsFixed(0)}%)',
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  Future<int> _fetchExpiringDocumentsCount() async {
    try {
      final response = await _driverService.getDrivers(limit: 100);
      if (response['success'] == true) {
        final drivers = List<Map<String, dynamic>>.from(response['data'] ?? []);
        int count = 0;
        final now = DateTime.now();
        final thirtyDaysFromNow = now.add(const Duration(days: 30));
        
        for (final driver in drivers) {
          final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
          for (final doc in documents) {
            final expiryDate = doc['expiryDate'];
            if (expiryDate != null) {
              try {
                final expiry = DateTime.parse(expiryDate);
                if (expiry.isBefore(thirtyDaysFromNow) && expiry.isAfter(now.subtract(const Duration(days: 1)))) {
                  count++;
                  break; // Count each driver only once
                }
              } catch (e) {
                // Invalid date format, skip
              }
            }
          }
        }
        return count;
      }
    } catch (e) {
      print('[DriverDashboard] Error fetching expiring documents: $e');
    }
    return 0;
  }

  Future<void> _showDocumentExpiryDialog() async {
    // Show loading dialog first
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    // Fetch actual expiring documents count
    final expiringCount = await _fetchExpiringDocumentsCount();
    
    // Close loading dialog
    if (mounted) Navigator.pop(context);

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.warning_amber, color: Colors.orange.shade700),
            const SizedBox(width: 12),
            const Text('Document Expiry Alerts'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              expiringCount > 0 
                ? 'Found $expiringCount driver(s) with documents expiring within 30 days.'
                : 'No documents are expiring within the next 30 days.',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text('This feature tracks:'),
            const SizedBox(height: 8),
            const Text('• Expired driver licenses'),
            const Text('• Expiring medical certificates'),
            const Text('• Other critical documents'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          if (expiringCount > 0)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _navigateToDriverListWithFilter('expiring_soon');
              },
              child: const Text('View Drivers'),
            ),
        ],
      ),
    );
  }

  void _showDriverListOverlay() async {
    await Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        pageBuilder: (context, animation, secondaryAnimation) => Material(
          color: Colors.black54,
          child: Center(
            child: Container(
              width: MediaQuery.of(context).size.width * 0.95,
              height: MediaQuery.of(context).size.height * 0.9,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(12),
                        topRight: Radius.circular(12),
                      ),
                      border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.people, color: Colors.grey),
                        const SizedBox(width: 12),
                        const Text(
                          'Driver List',
                          style: TextStyle(
                            color: Colors.black87,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.close, color: Colors.grey),
                          tooltip: 'Close',
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: DriverListPage(
                      authRepository: widget.authRepository,
                      driverService: _driverService,
                      vehicleService: _vehicleService,
                      isEmbedded: true,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    // Refresh summary when returning from driver list
    print('[DriverDashboard] 🔄 Returned from driver list overlay, refreshing summary...');
    await _fetchSummary();
  }

  void _navigateToDriverListWithFilter(String documentFilter) async {
    await Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        pageBuilder: (context, animation, secondaryAnimation) => DriverListPage(
          authRepository: widget.authRepository,
          driverService: _driverService,
          vehicleService: _vehicleService,
          initialDocumentFilter: documentFilter,
        ),
      ),
    );
    // ✅ FIX: Force refresh summary when returning from driver list
    print('[DriverDashboard] 🔄 Returned from driver list (filtered), refreshing summary...');
    await _fetchSummary();
  }

  // Show Bulk Import Dialog
  Future<void> _showBulkImportDialog() async {
    final result = await showDialog(
      context: context,
      builder: (context) => BulkImportDriversDialog(driverService: _driverService),
    );
    
    if (result == true) {
      // Refresh summary after bulk import
      _fetchSummary();
    }
  }

  // Show Export Dialog
  Future<void> _showExportDialog() async {
    await showDialog(
      context: context,
      builder: (context) => ExportDriversDialog(driverService: _driverService),
    );
  }

  // Show Import Dialog
  Future<void> _showImportDialog() async {
    final result = await showDialog(
      context: context,
      builder: (context) => ImportDriversDialog(driverService: _driverService),
    );
    
    if (result == true) {
      // Refresh summary after import
      _fetchSummary();
    }
  }

  // Show Add Driver Dialog
  Future<void> _showAddDriverDialog() async {
    final result = await showDialog(
      context: context,
      builder: (context) => AddDriverDialog(driverService: _driverService),
    );
    
    if (result == true) {
      // Refresh summary after adding driver
      _fetchSummary();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          // Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1565C0),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.people, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 16),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Advanced Driver Management',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    Text(
                      'Complete driver lifecycle management with analytics',
                      style: TextStyle(
                        fontSize: 14,
                        color: Color(0xFF666666),
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                OutlinedButton.icon(
                  onPressed: () async {
                    await _fetchSummary();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Dashboard refreshed'),
                          duration: Duration(seconds: 1),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1565C0),
                    side: const BorderSide(color: Color(0xFF1565C0)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: _showExportDialog,
                  icon: const Icon(Icons.file_download),
                  label: const Text('Export'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1565C0),
                    side: const BorderSide(color: Color(0xFF1565C0)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: _showImportDialog,
                  icon: const Icon(Icons.file_upload),
                  label: const Text('Import'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1565C0),
                    side: const BorderSide(color: Color(0xFF1565C0)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _showAddDriverDialog,
                  icon: const Icon(Icons.add),
                  label: const Text('Add Driver'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1565C0),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      'A',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Dashboard Cards
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        // Single Row - All 6 Cards
                        Row(
                          children: [
                            Expanded(
                              child: DashboardCard(
                                title: 'TOTAL DRIVERS',
                                value: _summary['total']?.toString() ?? '0',
                                subtitle: 'Click to view all drivers',
                                subtitleColor: const Color(0xFF666666),
                                icon: Icons.people,
                                iconBgColor: const Color(0xFF1565C0),
                                borderColor: const Color(0xFF1565C0),
                                onTap: _showDriverListOverlay,
                                isCompact: true,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DashboardCard(
                                title: 'BULK IMPORT',
                                value: '6',
                                subtitle: 'Sample drivers ready to import',
                                subtitleColor: const Color(0xFF10B981),
                                icon: Icons.upload_file,
                                iconBgColor: const Color(0xFFD1FAE5),
                                iconColor: const Color(0xFF10B981),
                                borderColor: const Color(0xFF10B981),
                                onTap: _showBulkImportDialog,
                                isCompact: true,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DashboardCard(
                                title: 'ACTIVE NOW',
                                value: _summary['active']?.toString() ?? '0',
                                subtitle: 'Currently on duty',
                                subtitleColor: const Color(0xFF10B981),
                                icon: Icons.check,
                                iconBgColor: const Color(0xFFD1FAE5),
                                iconColor: const Color(0xFF10B981),
                                borderColor: const Color(0xFF10B981),
                                isCompact: true,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DashboardCard(
                                title: 'ON TRIP',
                                value: _onTripData['driversOnTrip']?.toString() ?? '0',
                                subtitle: 'Live tracking enabled',
                                subtitleColor: const Color(0xFF10B981),
                                icon: Icons.directions_car,
                                iconBgColor: const Color(0xFFFEF3C7),
                                iconColor: const Color(0xFFF59E0B),
                                borderColor: const Color(0xFFF59E0B),
                                onTap: _showOnTripDetailsDialog,
                                isCompact: true,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DashboardCard(
                                title: 'TOTAL TRIPS',
                                value: _tripsData['totalTrips']?.toString() ?? '0',
                                subtitle: 'Completed successfully',
                                subtitleColor: const Color(0xFF10B981),
                                icon: Icons.bar_chart,
                                iconBgColor: const Color(0xFFDCEDFF),
                                iconColor: const Color(0xFF1565C0),
                                borderColor: const Color(0xFF1565C0),
                                onTap: _showTotalTripsDetailsDialog,
                                isCompact: true,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class DashboardCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final Color subtitleColor;
  final IconData icon;
  final Color iconBgColor;
  final Color iconColor;
  final Color borderColor;
  final VoidCallback? onTap;
  final bool isCompact;

  const DashboardCard({
    Key? key,
    required this.title,
    required this.value,
    required this.subtitle,
    required this.subtitleColor,
    required this.icon,
    required this.iconBgColor,
    this.iconColor = Colors.white,
    required this.borderColor,
    this.onTap,
    this.isCompact = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border(
            left: BorderSide(color: borderColor, width: 4),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: EdgeInsets.all(isCompact ? 16 : 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: isCompact ? 10 : 12,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF666666),
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Container(
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: iconColor, size: isCompact ? 18 : 24),
                ),
              ],
            ),
            SizedBox(height: isCompact ? 8 : 12),
            Text(
              value,
              style: TextStyle(
                fontSize: isCompact ? 24 : 32,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1A1A1A),
              ),
            ),
            SizedBox(height: isCompact ? 4 : 8),
            Row(
              children: [
                if (subtitle.contains('+') || subtitle.contains('%'))
                  Icon(
                    Icons.arrow_upward,
                    size: isCompact ? 12 : 14,
                    color: subtitleColor,
                  ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: isCompact ? 11 : 13,
                      color: subtitleColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}