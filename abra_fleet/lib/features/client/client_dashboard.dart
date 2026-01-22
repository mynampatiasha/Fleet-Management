// File: lib/features/client/presentation/screens/client_dashboard.dart
// Modern Client Dashboard with Interactive Charts and Real API Integration

import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:abra_fleet/core/services/api_service.dart';
import 'package:abra_fleet/core/services/customer_service.dart';
import 'package:abra_fleet/core/services/roster_service.dart';

class ClientDashboard extends StatefulWidget {
  const ClientDashboard({Key? key}) : super(key: key);

  @override
  State<ClientDashboard> createState() => _ClientDashboardState();
}

class _ClientDashboardState extends State<ClientDashboard> with TickerProviderStateMixin {
  Timer? _refreshTimer;
  bool _isLoading = true;
  String? _clientOrganizationDomain;
  String? _userName;
  String? _userEmail;
  
  // Services
  final ApiService _apiService = ApiService();
  final CustomerService _customerService = CustomerService();
  late final RosterService _rosterService;
  
  // Dashboard Data
  int _totalEmployees = 0;
  int _activeEmployees = 0;
  int _inactiveEmployees = 0;
  
  int _activeSOSAlerts = 0;
  int _resolvedSOSAlerts = 0;
  int _totalSOSAlerts = 0;
  
  int _assignedTrips = 0;
  int _ongoingTrips = 0;
  int _completedTrips = 0;
  int _cancelledTrips = 0;
  
  int _activeRosters = 0;
  int _scheduledRosters = 0;
  int _archivedRosters = 0;
  
  AnimationController? _fadeController;
  Animation<double>? _fadeAnimation;
  
  @override
  void initState() {
    super.initState();
    
    _rosterService = RosterService(apiService: _apiService);
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController!,
      curve: Curves.easeInOut,
    );
    
    _initializeClientData();
    _fadeController?.forward();
    
    // Auto-refresh every 30 seconds
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (timer) => _loadDashboardData(),
    );
  }

  Future<void> _initializeClientData() async {
    setState(() => _isLoading = true);
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      final userData = userDataString != null ? jsonDecode(userDataString) : null;
      
      if (userData != null) {
        _userName = userData['name'] ?? userData['email']?.split('@')[0] ?? 'User';
        _userEmail = userData['email'];
        
        if (_userEmail != null) {
          final emailParts = _userEmail!.split('@');
          if (emailParts.length == 2) {
            _clientOrganizationDomain = '@${emailParts[1]}';
          }
        }
      }
      
      await _loadDashboardData();
    } catch (e) {
      debugPrint('❌ Error initializing client data: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadDashboardData() async {
    try {
      await Future.wait([
        _fetchEmployeeStats(),
        _fetchSOSStats(),
        _fetchTripStats(),
        _fetchRosterStats(),
      ]);
    } catch (e) {
      debugPrint('❌ Error loading dashboard data: $e');
    }
  }

  Future<void> _fetchEmployeeStats() async {
    try {
      if (_clientOrganizationDomain == null) return;
      
      final customers = await _customerService.getCustomersByDomain(_clientOrganizationDomain!);
      
      if (mounted) {
        setState(() {
          _totalEmployees = customers.length;
          _activeEmployees = customers.where((c) => c.status.toLowerCase() == 'active').length;
          _inactiveEmployees = customers.where((c) => c.status.toLowerCase() == 'inactive').length;
        });
      }
    } catch (e) {
      debugPrint('❌ Error fetching employee stats: $e');
    }
  }

  Future<void> _fetchSOSStats() async {
    try {
      if (_clientOrganizationDomain == null) return;
      
      // Fetch active SOS alerts
      final activeResponse = await _apiService.get('/api/sos', queryParams: {
        'status': 'ACTIVE',
        'limit': '100'
      });
      
      final List<dynamic>? activeData = activeResponse['data'] as List<dynamic>?;
      final activeAlerts = activeData?.where((alert) {
        final email = alert['customerEmail']?.toString() ?? '';
        return email.endsWith(_clientOrganizationDomain!);
      }).toList() ?? [];
      
      // Fetch resolved SOS alerts
      final resolvedResponse = await _apiService.get('/api/sos', queryParams: {
        'status': 'Resolved',
        'limit': '100'
      });
      
      final List<dynamic>? resolvedData = resolvedResponse['data'] as List<dynamic>?;
      final resolvedAlerts = resolvedData?.where((alert) {
        final email = alert['customerEmail']?.toString() ?? '';
        return email.endsWith(_clientOrganizationDomain!);
      }).toList() ?? [];
      
      if (mounted) {
        setState(() {
          _activeSOSAlerts = activeAlerts.length;
          _resolvedSOSAlerts = resolvedAlerts.length;
          _totalSOSAlerts = _activeSOSAlerts + _resolvedSOSAlerts;
        });
      }
    } catch (e) {
      debugPrint('❌ Error fetching SOS stats: $e');
    }
  }

  Future<void> _fetchTripStats() async {
    try {
      if (_clientOrganizationDomain == null) return;
      
      final response = await _rosterService.getAssignedTrips();
      
      if (response['success'] == true) {
        final allTrips = List<Map<String, dynamic>>.from(response['data'] ?? []);
        
        final organizationTrips = allTrips.where((trip) {
          final email = trip['customerEmail']?.toString() ?? '';
          return email.endsWith(_clientOrganizationDomain!);
        }).toList();
        
        if (mounted) {
          setState(() {
            _assignedTrips = organizationTrips.where((t) => t['status']?.toString().toLowerCase() == 'assigned').length;
            _ongoingTrips = organizationTrips.where((t) => t['status']?.toString().toLowerCase() == 'ongoing').length;
            _completedTrips = organizationTrips.where((t) => t['status']?.toString().toLowerCase() == 'completed').length;
            _cancelledTrips = organizationTrips.where((t) => t['status']?.toString().toLowerCase() == 'cancelled').length;
          });
        }
      }
    } catch (e) {
      debugPrint('❌ Error fetching trip stats: $e');
    }
  }

  Future<void> _fetchRosterStats() async {
    try {
      if (_clientOrganizationDomain == null) return;
      
      final response = await _rosterService.getAssignedTrips();
      
      if (response['success'] == true) {
        final allTrips = List<Map<String, dynamic>>.from(response['data'] ?? []);
        
        final organizationTrips = allTrips.where((trip) {
          final email = trip['customerEmail']?.toString() ?? '';
          return email.endsWith(_clientOrganizationDomain!);
        }).toList();
        
        // Calculate roster stats from trips
        final activeTrips = organizationTrips.where((t) {
          final status = t['status']?.toString().toLowerCase() ?? '';
          return status == 'assigned' || status == 'ongoing';
        }).toList();
        
        final now = DateTime.now();
        final scheduledTrips = organizationTrips.where((trip) {
          final status = trip['status']?.toString().toLowerCase() ?? '';
          final tripDate = trip['tripDate'] != null 
              ? DateTime.tryParse(trip['tripDate'].toString()) 
              : null;
          
          return status == 'assigned' && 
                 tripDate != null && 
                 tripDate.isAfter(now.add(const Duration(days: 1)));
        }).toList();
        
        final archivedTrips = organizationTrips.where((trip) {
          final status = trip['status']?.toString().toLowerCase() ?? '';
          return status == 'completed' || status == 'cancelled';
        }).toList();
        
        // Group by vehicle to get roster counts
        final activeVehicles = activeTrips.map((t) => t['vehicleNumber']).toSet().length;
        final scheduledVehicles = scheduledTrips.map((t) => t['vehicleNumber']).toSet().length;
        final archivedVehicles = archivedTrips.map((t) => t['vehicleNumber']).toSet().length;
        
        if (mounted) {
          setState(() {
            _activeRosters = activeVehicles;
            _scheduledRosters = scheduledVehicles;
            _archivedRosters = archivedVehicles;
          });
        }
      }
    } catch (e) {
      debugPrint('❌ Error fetching roster stats: $e');
      // Set default values if API fails
      if (mounted) {
        setState(() {
          _activeRosters = 0;
          _scheduledRosters = 0;
          _archivedRosters = 0;
        });
      }
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _fadeController?.dispose();
    super.dispose();
  }

  void _refreshDashboard() async {
    await _loadDashboardData();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 18),
              SizedBox(width: 10),
              Text('Dashboard refreshed'),
            ],
          ),
          backgroundColor: Color(0xFF10B981),
          duration: Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
              ),
              SizedBox(height: 16),
              Text(
                'Loading dashboard...',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        color: const Color(0xFF6366F1),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: FadeTransition(
            opacity: _fadeAnimation ?? const AlwaysStoppedAnimation(1.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildGreetingCard(),
                const SizedBox(height: 32),
                _buildQuickStats(),
                const SizedBox(height: 32),
                _buildChartsSection(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Dashboard',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            if (_clientOrganizationDomain != null) ...[
              const SizedBox(height: 4),
              Text(
                _clientOrganizationDomain!,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ],
        ),
        ElevatedButton.icon(
          onPressed: _refreshDashboard,
          icon: const Icon(Icons.refresh, size: 18),
          label: const Text('Refresh'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6366F1),
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGreetingCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF6366F1),
            Color(0xFF8B5CF6),
            Color(0xFFA855F7),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_getGreeting()}, $_userName!',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Welcome to your fleet management dashboard',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  DateFormat('EEEE, MMMM dd, yyyy').format(DateTime.now()),
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.8),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.dashboard_rounded,
              color: Colors.white,
              size: 40,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Overview',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final isSmallScreen = constraints.maxWidth < 600;
            
            if (isSmallScreen) {
              // Single column for mobile
              return Column(
                children: [
                  _buildStatCard(
                    title: 'Total Employees',
                    value: _totalEmployees.toString(),
                    icon: Icons.people,
                    color: const Color(0xFF6366F1),
                    onTap: _navigateToEmployees,
                  ),
                  const SizedBox(height: 12),
                  _buildStatCard(
                    title: 'Active SOS Alerts',
                    value: _activeSOSAlerts.toString(),
                    icon: Icons.warning_amber_rounded,
                    color: const Color(0xFFEF4444),
                    onTap: _navigateToSOSAlerts,
                  ),
                  const SizedBox(height: 12),
                  _buildStatCard(
                    title: 'Ongoing Trips',
                    value: _ongoingTrips.toString(),
                    icon: Icons.directions_car,
                    color: const Color(0xFFF59E0B),
                    onTap: _navigateToTrips,
                  ),
                  const SizedBox(height: 12),
                  _buildStatCard(
                    title: 'Active Rosters',
                    value: _activeRosters.toString(),
                    icon: Icons.calendar_today,
                    color: const Color(0xFF10B981),
                    onTap: _navigateToRosters,
                  ),
                ],
              );
            } else {
              // Grid for larger screens
              return GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.5,
                children: [
                  _buildStatCard(
                    title: 'Total Employees',
                    value: _totalEmployees.toString(),
                    icon: Icons.people,
                    color: const Color(0xFF6366F1),
                    onTap: _navigateToEmployees,
                  ),
                  _buildStatCard(
                    title: 'Active SOS Alerts',
                    value: _activeSOSAlerts.toString(),
                    icon: Icons.warning_amber_rounded,
                    color: const Color(0xFFEF4444),
                    onTap: _navigateToSOSAlerts,
                  ),
                  _buildStatCard(
                    title: 'Ongoing Trips',
                    value: _ongoingTrips.toString(),
                    icon: Icons.directions_car,
                    color: const Color(0xFFF59E0B),
                    onTap: _navigateToTrips,
                  ),
                  _buildStatCard(
                    title: 'Active Rosters',
                    value: _activeRosters.toString(),
                    icon: Icons.calendar_today,
                    color: const Color(0xFF10B981),
                    onTap: _navigateToRosters,
                  ),
                ],
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: const Color(0xFF94A3B8),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChartsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Analytics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final isSmallScreen = constraints.maxWidth < 600;
            
            if (isSmallScreen) {
              // Single column for mobile
              return Column(
                children: [
                  _buildEmployeeChart(),
                  const SizedBox(height: 16),
                  _buildSOSChart(),
                  const SizedBox(height: 16),
                  _buildTripChart(),
                  const SizedBox(height: 16),
                  _buildRosterChart(),
                ],
              );
            } else {
              // Grid for larger screens
              return GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.0,
                children: [
                  _buildEmployeeChart(),
                  _buildSOSChart(),
                  _buildTripChart(),
                  _buildRosterChart(),
                ],
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildEmployeeChart() {
    final total = _totalEmployees > 0 ? _totalEmployees : 1;
    
    return InkWell(
      onTap: _navigateToEmployees,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Employees',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: const Color(0xFF94A3B8),
                ),
              ],
            ),
            Expanded(
              child: Center(
                child: _totalEmployees == 0 
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.people_outline,
                            size: 48,
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No employees yet',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      )
                    : PieChart(
                        PieChartData(
                          sectionsSpace: 2,
                          centerSpaceRadius: 40,
                          sections: [
                            PieChartSectionData(
                              value: _activeEmployees.toDouble(),
                              title: '$_activeEmployees',
                              color: const Color(0xFF10B981),
                              radius: 50,
                              titleStyle: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            PieChartSectionData(
                              value: _inactiveEmployees.toDouble(),
                              title: '$_inactiveEmployees',
                              color: const Color(0xFF94A3B8),
                              radius: 50,
                              titleStyle: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegendItem('Active', const Color(0xFF10B981)),
                _buildLegendItem('Inactive', const Color(0xFF94A3B8)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSOSChart() {
    return InkWell(
      onTap: _navigateToSOSAlerts,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'SOS Alerts',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: const Color(0xFF94A3B8),
                ),
              ],
            ),
            Expanded(
              child: Center(
                child: _totalSOSAlerts == 0
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.shield_outlined,
                            size: 48,
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No SOS alerts',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      )
                    : PieChart(
                        PieChartData(
                          sectionsSpace: 2,
                          centerSpaceRadius: 40,
                          sections: [
                            PieChartSectionData(
                              value: _activeSOSAlerts.toDouble() > 0 ? _activeSOSAlerts.toDouble() : 0.1,
                              title: _activeSOSAlerts > 0 ? '$_activeSOSAlerts' : '0',
                              color: const Color(0xFFEF4444),
                              radius: 50,
                              titleStyle: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            PieChartSectionData(
                              value: _resolvedSOSAlerts.toDouble() > 0 ? _resolvedSOSAlerts.toDouble() : 0.1,
                              title: _resolvedSOSAlerts > 0 ? '$_resolvedSOSAlerts' : '0',
                              color: const Color(0xFF10B981),
                              radius: 50,
                              titleStyle: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegendItem('Active', const Color(0xFFEF4444)),
                _buildLegendItem('Resolved', const Color(0xFF10B981)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTripChart() {
    final totalTrips = _assignedTrips + _ongoingTrips + _completedTrips + _cancelledTrips;
    
    return InkWell(
      onTap: _navigateToTrips,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Trips',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: const Color(0xFF94A3B8),
                ),
              ],
            ),
            Expanded(
              child: totalTrips == 0
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.directions_car_outlined,
                            size: 48,
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No trips yet',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                    )
                  : BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: [_assignedTrips, _ongoingTrips, _completedTrips, _cancelledTrips]
                            .reduce((a, b) => a > b ? a : b)
                            .toDouble() + 5,
                        barTouchData: BarTouchData(enabled: false),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                switch (value.toInt()) {
                                  case 0: return const Text('A', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600));
                                  case 1: return const Text('O', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600));
                                  case 2: return const Text('C', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600));
                                  case 3: return const Text('X', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600));
                                  default: return const Text('');
                                }
                              },
                            ),
                          ),
                          leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        ),
                        gridData: const FlGridData(show: false),
                        borderData: FlBorderData(show: false),
                        barGroups: [
                          BarChartGroupData(
                            x: 0, 
                            barRods: [
                              BarChartRodData(
                                toY: _assignedTrips.toDouble() > 0 ? _assignedTrips.toDouble() : 0.5, 
                                color: const Color(0xFF6366F1), 
                                width: 16,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(4),
                                  topRight: Radius.circular(4),
                                ),
                              )
                            ]
                          ),
                          BarChartGroupData(
                            x: 1, 
                            barRods: [
                              BarChartRodData(
                                toY: _ongoingTrips.toDouble() > 0 ? _ongoingTrips.toDouble() : 0.5, 
                                color: const Color(0xFFF59E0B), 
                                width: 16,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(4),
                                  topRight: Radius.circular(4),
                                ),
                              )
                            ]
                          ),
                          BarChartGroupData(
                            x: 2, 
                            barRods: [
                              BarChartRodData(
                                toY: _completedTrips.toDouble() > 0 ? _completedTrips.toDouble() : 0.5, 
                                color: const Color(0xFF10B981), 
                                width: 16,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(4),
                                  topRight: Radius.circular(4),
                                ),
                              )
                            ]
                          ),
                          BarChartGroupData(
                            x: 3, 
                            barRods: [
                              BarChartRodData(
                                toY: _cancelledTrips.toDouble() > 0 ? _cancelledTrips.toDouble() : 0.5, 
                                color: const Color(0xFFEF4444), 
                                width: 16,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(4),
                                  topRight: Radius.circular(4),
                                ),
                              )
                            ]
                          ),
                        ],
                      ),
                    ),
            ),
            const SizedBox(height: 8),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text('Assigned', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                Text('Ongoing', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                Text('Done', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                Text('Cancel', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRosterChart() {
    final totalRosters = _activeRosters + _scheduledRosters + _archivedRosters;
    
    return InkWell(
      onTap: _navigateToRosters,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Rosters',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: const Color(0xFF94A3B8),
                ),
              ],
            ),
            Expanded(
              child: Center(
                child: totalRosters == 0
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 48,
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No rosters yet',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      )
                    : PieChart(
                        PieChartData(
                          sectionsSpace: 2,
                          centerSpaceRadius: 40,
                          sections: [
                            if (_activeRosters > 0)
                              PieChartSectionData(
                                value: _activeRosters.toDouble(),
                                title: '$_activeRosters',
                                color: const Color(0xFF10B981),
                                radius: 50,
                                titleStyle: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            if (_scheduledRosters > 0)
                              PieChartSectionData(
                                value: _scheduledRosters.toDouble(),
                                title: '$_scheduledRosters',
                                color: const Color(0xFF6366F1),
                                radius: 50,
                                titleStyle: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            if (_archivedRosters > 0)
                              PieChartSectionData(
                                value: _archivedRosters.toDouble(),
                                title: '$_archivedRosters',
                                color: const Color(0xFF94A3B8),
                                radius: 50,
                                titleStyle: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            // Show placeholder if all are 0
                            if (_activeRosters == 0 && _scheduledRosters == 0 && _archivedRosters == 0)
                              PieChartSectionData(
                                value: 1,
                                title: '0',
                                color: const Color(0xFF94A3B8),
                                radius: 50,
                                titleStyle: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                          ],
                        ),
                      ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegendItem('Active', const Color(0xFF10B981)),
                _buildLegendItem('Scheduled', const Color(0xFF6366F1)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Color(0xFF64748B),
          ),
        ),
      ],
    );
  }

  // Navigation methods - these should match your app's routing
  void _navigateToEmployees() {
    // Navigate to the index where client_employee_management is located
    // Assuming you're using a TabBarView or similar navigation structure
    // You'll need to adjust this based on your actual navigation setup
    DefaultTabController.of(context)?.animateTo(1); // Index 1 for employees
  }

  void _navigateToSOSAlerts() {
    // Navigate to the index where client_sos_alerts is located
    DefaultTabController.of(context)?.animateTo(2); // Index 2 for SOS
  }

  void _navigateToTrips() {
    // Navigate to the index where trips are shown
    DefaultTabController.of(context)?.animateTo(3); // Index 3 for trips
  }

  void _navigateToRosters() {
    // Navigate to the index where client_roster_management is located
    DefaultTabController.of(context)?.animateTo(4); // Index 4 for rosters
  }
}