import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:abra_fleet/app/config/api_config.dart';
import 'package:abra_fleet/core/services/backend_connection_manager.dart';
import 'package:abra_fleet/core/services/roster_service.dart';
import 'package:abra_fleet/core/services/api_service.dart';
import 'package:abra_fleet/core/services/safe_api_service.dart';
import 'package:abra_fleet/core/services/error_handler_service.dart';
import 'package:abra_fleet/core/services/recent_activities_service.dart';
import 'package:abra_fleet/core/services/permission_service.dart';
// Import the specific services
import 'package:abra_fleet/core/services/vehicle_service.dart';
import 'package:abra_fleet/core/services/client_service.dart';
import 'package:abra_fleet/core/services/customer_service.dart';

import 'package:abra_fleet/features/auth/domain/entities/user_entity.dart';
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardSummaryItem {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  final Color backgroundColor;
  final String? subtitle;
  final VoidCallback? onTap;

  const DashboardSummaryItem({
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
    required this.backgroundColor,
    this.subtitle,
    this.onTap,
  });
}

class AdminDashboardScreen extends StatefulWidget {
  final Function(int tabIndex)? onNavigateRequest;

  const AdminDashboardScreen({
    super.key,
    this.onNavigateRequest,
  });

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with ErrorHandlerMixin {
  // Services
  final SafeApiService _safeApi = SafeApiService();
  final PermissionService _permissionService = PermissionService();
  final VehicleService _vehicleService = VehicleService();
  final ClientService _clientService = ClientService();
  final CustomerService _customerService = CustomerService();

  // Manpower & General Stats
  Map<String, int> _manpowerStats = {
    'totalCustomers': 0,
    'totalDrivers': 0,
    'totalClients': 0,
    'pendingRosters': 0,
    'ongoingRosters': 0,
    'activeTrips': 0,
    'completedTripsToday': 0,
    'cancelledTripsToday': 0,
  };

  // Business Analytics Data
  bool _isLoadingAnalytics = false;
  List<Map<String, dynamic>> _topClientAnalytics = [];

  // Company-Employee Chart Data (NEW)
  bool _isLoadingChartData = false;
  List<Map<String, dynamic>> _companyEmployeeData = [];

  // Fleet Overview Data
  bool _isLoadingFleet = false;
  Map<String, int> _fleetCounts = {
    'available': 0,
    'inUse': 0,
    'maintenance': 0,
    'outOfService': 0,
  };

  // Roster Variables
  RosterService? _rosterService;
  RosterStats _rosterStats = RosterStats.empty();
  bool _isLoadingRosterStats = false;

  // Recent Activities
  List<RecentActivity> _recentActivities = [];
  bool _isLoadingActivities = false;

  // Connection Status
  bool _isOnline = true;
  Timer? _realTimeUpdateTimer;

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (_rosterService == null) {
      try {
        final connectionManager = context.read<BackendConnectionManager>();
        _rosterService = RosterService(apiService: connectionManager.apiService);
      } catch (e) {
        final connectionManager = BackendConnectionManager();
        _rosterService = RosterService(apiService: connectionManager.apiService);
      }

      _refreshDashboard();

      _realTimeUpdateTimer = Timer.periodic(const Duration(seconds: 45), (timer) {
        if (mounted) _refreshDashboard();
      });
    }
  }

  @override
  void dispose() {
    _realTimeUpdateTimer?.cancel();
    super.dispose();
  }

  Future<void> _refreshDashboard() async {
    if (!mounted) return;
    if (!canMakeRequest) return;

    _checkConnectionStatus();
    _loadRosterStats();
    _loadManpowerStats();
    _loadBusinessAnalytics();
    _loadCompanyEmployeeData(); // NEW: Load company-employee chart data
    _loadFleetOverview();
    _loadRecentActivities();
  }

  Future<void> _checkConnectionStatus() async {
    try {
      final isOnline = await _safeApi.isOnline();
      if (mounted && _isOnline != isOnline) {
        setState(() => _isOnline = isOnline);
      }
    } catch (e) {
      // Silent fail
    }
  }

  // 1. Manpower Stats (Keep existing logic but streamlined)
  Future<void> _loadManpowerStats() async {
    if (!mounted) return;
    try {
      final response = await _safeApi.safeGet(
        '/api/admin/analytics/manpower-stats',
        context: 'Manpower Stats',
        fallback: {'success': false, 'stats': {}},
      );
      if (response['success'] == true && mounted) {
        setState(() {
          _manpowerStats = Map<String, int>.from(response['stats'] ?? {});
        });
      }
    } catch (e) {
      handleSilentError(e, context: 'Manpower Stats');
    }
  }

  // 2. Business Analytics (Client vs Customer Count)
  Future<void> _loadBusinessAnalytics() async {
    if (!mounted) return;
    setState(() => _isLoadingAnalytics = true);

    try {
      // Fetch Clients
      final clients = await _clientService.getAllClients();
      
      List<Map<String, dynamic>> analyticsData = [];

      // Calculate customer base for each client based on domain
      for (var client in clients) {
        String domain = '';
        if (client.email.contains('@')) {
          domain = client.email.split('@').last;
        }

        // Count customers for this domain
        int count = 0;
        if (domain.isNotEmpty) {
           count = await _customerService.countCustomersByDomain(domain);
        }

        // Estimate Revenue (Mock logic: Assuming approx ₹450 per customer/trip average for visualization)
        // In a real scenario, this would come from a 'totalRevenue' field in the Client API
        double estimatedRevenue = count * 450.0; 

        analyticsData.add({
          'name': client.companyName.isNotEmpty ? client.companyName : client.name,
          'customerCount': count,
          'revenue': estimatedRevenue,
          'domain': domain,
        });
      }

      // Sort by Customer Count Descending
      analyticsData.sort((a, b) => (b['customerCount'] as int).compareTo(a['customerCount'] as int));

      // Take top 5 for the chart
      if (mounted) {
        setState(() {
          _topClientAnalytics = analyticsData.take(5).toList();
          _isLoadingAnalytics = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading analytics: $e');
      if (mounted) setState(() => _isLoadingAnalytics = false);
    }
  }

  // NEW: Company-Employee Bar Chart Data Loader
  Future<void> _loadCompanyEmployeeData() async {
    if (!mounted) return;
    
    setState(() => _isLoadingChartData = true);
    
    try {
      debugPrint('📊 Loading company-employee data from services...');
      
      // 1. Fetch all clients from ClientService
      final clients = await _clientService.getAllClients(limit: 100);
      debugPrint('✅ Fetched ${clients.length} clients');
      
      // 2. For each client, count their employees by email domain
      List<Map<String, dynamic>> companyData = [];
      
      for (var client in clients) {
        try {
          // Extract domain from client email
          String domain = '';
          if (client.email != null && client.email.contains('@')) {
            domain = '@${client.email.split('@')[1]}';
          } else if (client.organizationName != null) {
            // Fallback: try to construct domain from organization name
            domain = '@${client.organizationName.toLowerCase().replaceAll(' ', '')}.com';
          }
          
          // Count employees for this company by domain
          int employeeCount = 0;
          if (domain.isNotEmpty) {
            employeeCount = await _customerService.countCustomersByDomain(domain);
          }
          
          debugPrint('   ${client.name}: $employeeCount employees (domain: $domain)');
          
          // Only add companies with at least 1 employee
          if (employeeCount > 0) {
            companyData.add({
              'name': client.companyName ?? client.name,
              'totalEmployees': employeeCount,
              'organization': client.organizationName ?? client.name,
              'email': client.email,
              'phone': client.phone,
              'contactPerson': client.contactPerson,
              'address': client.address,
              'status': client.status,
            });
          }
        } catch (e) {
          debugPrint('❌ Error processing client ${client.name}: $e');
          continue; // Skip this client and continue with others
        }
      }
      
      // 3. Sort by employee count (descending) and take top 10
      companyData.sort((a, b) => 
        (b['totalEmployees'] as int).compareTo(a['totalEmployees'] as int)
      );
      
      // Take only top 10 companies
      final top10Companies = companyData.take(10).toList();
      
      if (mounted) {
        setState(() {
          _companyEmployeeData = top10Companies;
          _isLoadingChartData = false;
        });
        
        debugPrint('✅ Successfully loaded ${top10Companies.length} companies for chart');
        if (top10Companies.isNotEmpty) {
          debugPrint('   Top company: ${top10Companies[0]['name']} with ${top10Companies[0]['totalEmployees']} employees');
        }
      }
    } catch (e) {
      debugPrint('❌ Error loading company-employee data: $e');
      if (mounted) {
        setState(() {
          _companyEmployeeData = [];
          _isLoadingChartData = false;
        });
        
        // Show error message to user
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load company data: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  // Helper method to get max employee count
  double _getMaxEmployeeCount() {
    if (_companyEmployeeData.isEmpty) return 100;
    
    final maxCount = _companyEmployeeData
        .map((c) => (c['totalEmployees'] ?? 0) as int)
        .reduce((a, b) => a > b ? a : b);
    
    return maxCount.toDouble();
  }

  // Helper method to calculate grid interval
  double _getGridInterval() {
    final maxCount = _getMaxEmployeeCount();
    if (maxCount <= 10) return 2;
    if (maxCount <= 50) return 10;
    if (maxCount <= 100) return 20;
    if (maxCount <= 500) return 50;
    return 100;
  }

  // Helper method to get gradient colors based on ranking
  List<Color> _getBarGradientColors(int index) {
    // Top 3 get special medal colors
    if (index == 0) {
      return [const Color(0xFFFFD700), const Color(0xFFFFA500)]; // Gold
    } else if (index == 1) {
      return [const Color(0xFFC0C0C0), const Color(0xFF808080)]; // Silver
    } else if (index == 2) {
      return [const Color(0xFFCD7F32), const Color(0xFF8B4513)]; // Bronze
    } else {
      // Other companies get blue gradient
      return [const Color(0xFF4A90E2), const Color(0xFF357ABD)];
    }
  }

  // 3. Fleet Overview (From Vehicle Service)
  Future<void> _loadFleetOverview() async {
    if (!mounted) return;
    setState(() => _isLoadingFleet = true);

    try {
      final result = await _vehicleService.getVehicles(limit: 1000); // Get all to calc stats
      
      if (result['success'] == true) {
        List vehicles = result['data'] ?? [];
        
        int available = 0;
        int inUse = 0;
        int maintenance = 0;
        int outOfService = 0;

        for (var v in vehicles) {
          String status = (v['status'] ?? '').toString().toLowerCase();
          // Logic based on status strings used in backend
          if (status == 'maintenance') {
            maintenance++;
          } else if (status == 'out_of_service' || status == 'inactive') {
            outOfService++;
          } else if (status == 'active') {
             // Check if assigned/in-trip logic exists, otherwise assume active = available
             // For more accuracy, we could check 'currentTripId' if it exists
             if (v['currentTripId'] != null || (v['isAvailable'] == false)) {
               inUse++;
             } else {
               available++;
             }
          }
        }

        if (mounted) {
          setState(() {
            _fleetCounts = {
              'available': available,
              'inUse': inUse,
              'maintenance': maintenance,
              'outOfService': outOfService,
            };
            _isLoadingFleet = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading fleet: $e');
      if (mounted) setState(() => _isLoadingFleet = false);
    }
  }

  Future<void> _loadRosterStats() async {
    if (_rosterService == null) return;
    if (_rosterStats.total == 0) setState(() => _isLoadingRosterStats = true);
    try {
      final stats = await _rosterService!.getRosterStats();
      if (mounted) setState(() { _rosterStats = stats; _isLoadingRosterStats = false; });
    } catch (e) {
      if (mounted) setState(() => _isLoadingRosterStats = false);
    }
  }

  Future<void> _loadRecentActivities() async {
    if (!mounted) return;
    setState(() => _isLoadingActivities = true);
    try {
      final activities = await RecentActivitiesService.fetchRecentActivities();
      if (mounted) setState(() { _recentActivities = activities; _isLoadingActivities = false; });
    } catch (e) {
      if (mounted) setState(() => _isLoadingActivities = false);
    }
  }

  // --- UI BUILDERS ---

  @override
  Widget build(BuildContext context) {
    final authRepository = Provider.of<AuthRepository>(context, listen: false);
    final currentUser = authRepository.currentUser;
    final screenSize = MediaQuery.of(context).size;
    final isDesktop = screenSize.width > 1200;
    final isMobile = screenSize.width <= 800;

    // Define Cards (Removed Ratings & Specific Revenue buttons as requested)
    final summaryItems = [
      DashboardSummaryItem(
        title: 'Total Clients',
        value: _manpowerStats['totalClients']?.toString() ?? '0',
        icon: Icons.business,
        iconColor: Colors.white,
        backgroundColor: const Color(0xFF8B5CF6),
        subtitle: 'Partner Companies',
        onTap: () => widget.onNavigateRequest?.call(20),
      ),
      DashboardSummaryItem(
        title: 'Total Customers',
        value: _manpowerStats['totalCustomers']?.toString() ?? '0',
        icon: Icons.groups,
        iconColor: Colors.white,
        backgroundColor: const Color(0xFFF59E0B),
        subtitle: 'Employees Registered',
        onTap: () => widget.onNavigateRequest?.call(15),
      ),
      DashboardSummaryItem(
        title: 'Ongoing Trips',
        value: _manpowerStats['ongoingRosters']?.toString() ?? '0',
        icon: Icons.directions_car,
        iconColor: Colors.white,
        backgroundColor: const Color(0xFF10B981),
        subtitle: 'Live Action',
        onTap: () => widget.onNavigateRequest?.call(22),
      ),
       DashboardSummaryItem(
        title: 'Pending Rosters',
        value: _rosterStats.pending.toString(),
        icon: Icons.calendar_today,
        iconColor: Colors.white,
        backgroundColor: _rosterStats.pending > 0 ? const Color(0xFFF97316) : Colors.grey,
        subtitle: 'Action Required',
        onTap: () => widget.onNavigateRequest?.call(17),
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _refreshDashboard,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(isDesktop ? 32.0 : 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context, currentUser, isDesktop),
              const SizedBox(height: 32),
              
              // 1. Summary Cards
              _buildStatsGrid(context, summaryItems, isDesktop),
              const SizedBox(height: 32),

              // 2. Business Analytics (Chart)
              _buildBusinessAnalyticsSection(context, isDesktop),
              const SizedBox(height: 32),

              // 3. NEW: Company-Employee Bar Chart
              _buildCompanyEmployeeBarChart(context, isDesktop),
              const SizedBox(height: 32),

              // 4. Layout for Activities & Fleet Overview
              if (isDesktop)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 3, child: _buildRecentActivity(context)),
                    const SizedBox(width: 32),
                    Expanded(flex: 2, child: _buildFleetOverviewCard(context)),
                  ],
                )
              else
                Column(
                  children: [
                    _buildFleetOverviewCard(context),
                    const SizedBox(height: 32),
                    _buildRecentActivity(context),
                  ],
                ),
                
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // --- BUSINESS ANALYTICS CHART WIDGET ---
  Widget _buildBusinessAnalyticsSection(BuildContext context, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Business Analytics',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Top Clients by Employee Base',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _loadBusinessAnalytics,
                tooltip: 'Refresh Analytics',
              ),
            ],
          ),
          const SizedBox(height: 32),
          if (_isLoadingAnalytics)
            const SizedBox(height: 300, child: Center(child: CircularProgressIndicator()))
          else if (_topClientAnalytics.isEmpty)
             const SizedBox(height: 300, child: Center(child: Text("No client data available")))
          else
            SizedBox(
              height: 350,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: _topClientAnalytics.isNotEmpty 
                      ? (_topClientAnalytics.first['customerCount'] as int).toDouble() * 1.2 
                      : 100,
                  titlesData: FlTitlesData(
                    show: true,
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() >= 0 && value.toInt() < _topClientAnalytics.length) {
                            String name = _topClientAnalytics[value.toInt()]['name'];
                            return Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: SizedBox(
                                width: 60,
                                child: Text(
                                  name,
                                  style: TextStyle(fontSize: 10, color: Colors.grey[700]),
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            );
                          }
                          return const Text('');
                        },
                        reservedSize: 40,
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: FlGridData(show: true, drawVerticalLine: false),
                  barGroups: _topClientAnalytics.asMap().entries.map((entry) {
                    final index = entry.key;
                    final data = entry.value;
                    return BarChartGroupData(
                      x: index,
                      barRods: [
                        BarChartRodData(
                          toY: (data['customerCount'] as int).toDouble(),
                          color: index == 0 ? const Color(0xFF0D47A1) : Colors.blue.withOpacity(0.7),
                          width: 30,
                          borderRadius: const BorderRadius.only(topLeft: Radius.circular(6), topRight: Radius.circular(6)),
                          backDrawRodData: BackgroundBarChartRodData(show: true, color: Colors.grey[100]),
                        ),
                      ],
                      showingTooltipIndicators: [0],
                    );
                  }).toList(),
                  barTouchData: BarTouchData(
                    enabled: true,
                    touchTooltipData: BarTouchTooltipData(
                      tooltipBgColor: Colors.blueGrey,
                      tooltipPadding: const EdgeInsets.all(8),
                      tooltipMargin: 8,
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        final data = _topClientAnalytics[groupIndex];
                        return BarTooltipItem(
                          '${data['name']}\n',
                          const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          children: [
                            TextSpan(
                              text: '${data['customerCount']} Employees',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // NEW: Build the modern company-employee bar chart widget
  Widget _buildCompanyEmployeeBarChart(BuildContext context, bool isDesktop) {
    if (_isLoadingChartData) {
      return Container(
        height: 450,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              spreadRadius: 0,
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4A90E2)),
              ),
              const SizedBox(height: 16),
              Text(
                'Loading company data...',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_companyEmployeeData.isEmpty) {
      return Container(
        height: 450,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              spreadRadius: 0,
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.business_outlined,
                  size: 64,
                  color: Colors.grey[400],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'No Company Data Available',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Add companies and employees to see statistics',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            spreadRadius: 0,
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF4A90E2), Color(0xFF357ABD)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.bar_chart_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Top Companies by Employee Count',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[800],
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Showing top ${_companyEmployeeData.length} companies ranked by workforce size',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF4A90E2).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: const Icon(Icons.refresh_rounded, size: 22),
                  onPressed: _loadCompanyEmployeeData,
                  tooltip: 'Refresh Data',
                  color: const Color(0xFF4A90E2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 40),
          
          // Chart Section
          SizedBox(
            height: 380,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: _getMaxEmployeeCount() * 1.15,
                minY: 0,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    tooltipBgColor: Colors.grey[900]!.withOpacity(0.95),
                    tooltipPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    tooltipMargin: 12,
                    tooltipRoundedRadius: 12,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      final company = _companyEmployeeData[groupIndex];
                      return BarTooltipItem(
                        '${company['name']}\n',
                        const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                        children: [
                          TextSpan(
                            text: '${company['totalEmployees']} employees',
                            style: const TextStyle(
                              color: Color(0xFF4A90E2),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  touchCallback: (FlTouchEvent event, barTouchResponse) {
                    if (event is FlTapUpEvent && 
                        barTouchResponse != null && 
                        barTouchResponse.spot != null) {
                      final index = barTouchResponse.spot!.touchedBarGroupIndex;
                      if (index >= 0 && index < _companyEmployeeData.length) {
                        _showCompanyDetailDialog(_companyEmployeeData[index]);
                      }
                    }
                  },
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index >= 0 && index < _companyEmployeeData.length) {
                          final companyName = _companyEmployeeData[index]['name'] ?? 'N/A';
                          final displayName = companyName.length > 15
                              ? '${companyName.substring(0, 15)}...'
                              : companyName;
                          return Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: Text(
                              displayName,
                              style: TextStyle(
                                color: Colors.grey[700],
                                fontWeight: FontWeight.w600,
                                fontSize: 11,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }
                        return const Text('');
                      },
                      reservedSize: 60,
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 50,
                      interval: _getGridInterval(),
                      getTitlesWidget: (value, meta) {
                        return Text(
                          value.toInt().toString(),
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                          ),
                        );
                      },
                    ),
                    axisNameWidget: Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(
                        'Employee Count',
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: _getGridInterval(),
                  getDrawingHorizontalLine: (value) {
                    return FlLine(
                      color: Colors.grey[200],
                      strokeWidth: 1,
                    );
                  },
                ),
                borderData: FlBorderData(
                  show: true,
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[300]!, width: 1.5),
                    left: BorderSide(color: Colors.grey[300]!, width: 1.5),
                  ),
                ),
                barGroups: _companyEmployeeData.asMap().entries.map((entry) {
                  final index = entry.key;
                  final company = entry.value;
                  final employeeCount = (company['totalEmployees'] ?? 0).toDouble();
                  final colors = _getBarGradientColors(index);
                  
                  return BarChartGroupData(
                    x: index,
                    barRods: [
                      BarChartRodData(
                        toY: employeeCount,
                        gradient: LinearGradient(
                          colors: colors,
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                        width: isDesktop ? 32 : 24,
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(8),
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildChartLegend(),
        ],
      ),
    );
  }

  // Build legend for the chart
  Widget _buildChartLegend() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildLegendItem('🥇 1st Place', const Color(0xFFFFD700)),
          const SizedBox(width: 24),
          _buildLegendItem('🥈 2nd Place', const Color(0xFFC0C0C0)),
          const SizedBox(width: 24),
          _buildLegendItem('🥉 3rd Place', const Color(0xFFCD7F32)),
          const SizedBox(width: 24),
          _buildLegendItem('Others', const Color(0xFF4A90E2)),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }

  // Show company detail dialog when clicking on a bar
  void _showCompanyDetailDialog(Map<String, dynamic> company) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF4A90E2).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.business, color: Color(0xFF4A90E2)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                company['name'] ?? 'Company Details',
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
              _buildDetailRow(
                'Total Employees', 
                '${company['totalEmployees'] ?? 0}', 
                Icons.people
              ),
              if (company['organization'] != null) ...[
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Organization', 
                  company['organization'], 
                  Icons.business
                ),
              ],
              if (company['contactPerson'] != null) ...[
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Contact Person', 
                  company['contactPerson'], 
                  Icons.person
                ),
              ],
              if (company['phone'] != null) ...[
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Phone', 
                  company['phone'], 
                  Icons.phone
                ),
              ],
              if (company['email'] != null) ...[
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Email', 
                  company['email'], 
                  Icons.email
                ),
              ],
              if (company['address'] != null) ...[
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Address', 
                  company['address'], 
                  Icons.location_on
                ),
              ],
              if (company['status'] != null) ...[
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Status', 
                  company['status'].toString().toUpperCase(), 
                  Icons.info
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // --- FLEET OVERVIEW WIDGET (Matching the Image) ---
  Widget _buildFleetOverviewCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Fleet Overview',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              TextButton.icon(
                onPressed: () => widget.onNavigateRequest?.call(11), // Vehicle Master
                icon: const Icon(Icons.arrow_forward, size: 16),
                label: const Text('View Fleet'),
                style: TextButton.styleFrom(foregroundColor: const Color(0xFF0D47A1)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          if (_isLoadingFleet)
             const Padding(padding: EdgeInsets.all(20), child: Center(child: CircularProgressIndicator()))
          else
            Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildFleetStatusBox(
                        count: _fleetCounts['available']!,
                        label: 'Available',
                        color: const Color(0xFF4CAF50), // Green
                        icon: Icons.check_circle,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildFleetStatusBox(
                        count: _fleetCounts['inUse']!,
                        label: 'In Use',
                        color: const Color(0xFF2196F3), // Blue
                        icon: Icons.directions_car,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildFleetStatusBox(
                        count: _fleetCounts['maintenance']!,
                        label: 'Maintenance',
                        color: const Color(0xFFFF9800), // Orange
                        icon: Icons.build,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildFleetStatusBox(
                        count: _fleetCounts['outOfService']!,
                        label: 'Out of Service',
                        color: const Color(0xFFF44336), // Red
                        icon: Icons.warning,
                      ),
                    ),
                  ],
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildFleetStatusBox({required int count, required String label, required Color color, required IconData icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1), // Very light background
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            count.toString(),
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  // --- RECENT ACTIVITY ---
  Widget _buildRecentActivity(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Activity',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                Row(
                  children: [
                    if (_isLoadingActivities)
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    const SizedBox(width: 8),
                    TextButton.icon(
                      onPressed: () => widget.onNavigateRequest?.call(6), // Navigate to reports
                      icon: const Icon(Icons.arrow_forward, size: 16),
                      label: const Text('View All'),
                      style: TextButton.styleFrom(
                        foregroundColor: const Color(0xFF0D47A1),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          _isLoadingActivities
              ? const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: CircularProgressIndicator()),
                )
              : _recentActivities.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(
                              Icons.history,
                              size: 48,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No recent activities',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[600],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Activities will appear here as they happen',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _recentActivities.length > 8 ? 8 : _recentActivities.length,
                      separatorBuilder: (context, index) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final activity = _recentActivities[index];
                        return _buildActivityListTile(activity);
                      },
                    ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildActivityListTile(RecentActivity activity) {
    // Map activity types to Flutter icons
    IconData getActivityIcon(String iconName) {
      switch (iconName) {
        case 'person_add':
          return Icons.person_add;
        case 'directions_car':
          return Icons.directions_car;
        case 'check_circle':
          return Icons.check_circle;
        case 'assignment':
          return Icons.assignment;
        case 'build':
          return Icons.build;
        case 'business':
          return Icons.business;
        case 'route':
          return Icons.route;
        default:
          return Icons.info_outline;
      }
    }

    // Map color names to Flutter colors
    Color getActivityColor(String colorName) {
      switch (colorName) {
        case 'green':
          return Colors.green;
        case 'blue':
          return Colors.blue;
        case 'purple':
          return Colors.purple;
        case 'orange':
          return Colors.orange;
        case 'red':
          return Colors.red;
        case 'indigo':
          return Colors.indigo;
        default:
          return Colors.grey;
      }
    }

    final activityColor = getActivityColor(activity.color);
    final activityIcon = getActivityIcon(activity.icon);

    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: activityColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          activityIcon,
          color: activityColor,
          size: 20,
        ),
      ),
      title: Text(
        activity.title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        activity.subtitle,
        style: TextStyle(
          fontSize: 12,
          color: Colors.grey[600],
        ),
      ),
      trailing: Text(
        activity.timeAgo,
        style: TextStyle(
          fontSize: 11,
          color: Colors.grey[500],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(BuildContext context, List<DashboardSummaryItem> items, bool isDesktop) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: isDesktop ? 4 : 2,
        crossAxisSpacing: 16.0,
        mainAxisSpacing: 16.0,
        childAspectRatio: 1.4,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) => _buildSummaryCard(items[index]),
    );
  }

  Widget _buildSummaryCard(DashboardSummaryItem item) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: item.onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: item.backgroundColor.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border(left: BorderSide(color: item.backgroundColor, width: 4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(item.icon, color: item.backgroundColor, size: 28),
                  Text(
                    item.value,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                  if (item.subtitle != null)
                    Text(
                      item.subtitle!,
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, UserEntity currentUser, bool isDesktop) {
    return Container(
      padding: EdgeInsets.all(isDesktop ? 32 : 24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0D47A1), Color(0xFF1976D2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D47A1).withOpacity(0.3),
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
                  'Welcome Back, ${currentUser.name ?? 'Admin'}!',
                  style: TextStyle(
                    fontSize: isDesktop ? 28 : 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Fleet Business Analytics Dashboard',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
          if (_isOnline)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.greenAccent),
              ),
              child: const Row(
                children: [
                  Icon(Icons.wifi, color: Colors.white, size: 16),
                  SizedBox(width: 8),
                  Text('Online', style: TextStyle(color: Colors.white)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}