import 'package:flutter/material.dart';
import 'maintenance_reports.dart';
import 'schedule_maintenance.dart'; // <-- 1. ADD THIS IMPORT FOR THE SEPARATED SCREEN
import 'cost_analysis.dart';
import 'vendor_management.dart';
import '../../../../core/services/maintenance_service.dart';

const Color kPrimaryColor = Color(0xFF0D47A1);
const Color kTextPrimaryColor = Color(0xFF212121);
const Color kTextSecondaryColor = Color(0xFF757575);
const Color kWarningColor = Color(0xFFF57C00);
const Color kWarningBackgroundColor = Color(0xFFFFF8E1);
const Color kSuccessColor = Color(0xFF4CAF50);
const Color kErrorColor = Color(0xFFF44336);
const Color kInfoColor = Color(0xFF0288D1);

class MaintenanceManagementScreen extends StatefulWidget {
  const MaintenanceManagementScreen({super.key});

  @override
  State<MaintenanceManagementScreen> createState() =>
      _MaintenanceManagementScreenState();
}

class _MaintenanceManagementScreenState
    extends State<MaintenanceManagementScreen> {
  List<Widget> _overlayStack = [];
  final MaintenanceService _maintenanceService = MaintenanceService();
  List<Map<String, dynamic>> _scheduledMaintenances = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadScheduledMaintenances();
  }

  Future<void> _loadScheduledMaintenances() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await _maintenanceService.getMaintenanceSchedules(
        page: 1,
        limit: 20,
      );

      if (result['success'] == true) {
        setState(() {
          _scheduledMaintenances = List<Map<String, dynamic>>.from(result['data'] ?? []);
        });
      } else {
        _showSnackBar('Failed to load scheduled maintenances: ${result['message']}');
      }
    } catch (e) {
      print('Error loading scheduled maintenances: $e');
      _showSnackBar('Error loading scheduled maintenances');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _refreshMaintenances() async {
    await _loadScheduledMaintenances();
    _showSnackBar('Maintenance data refreshed');
  }

  void _pushOverlay(Widget overlay) {
    setState(() {
      _overlayStack.add(overlay);
    });
  }

  void _popOverlay() {
    if (_overlayStack.isNotEmpty) {
      setState(() {
        _overlayStack.removeLast();
      });
    }
  }

  void _clearAllOverlays() {
    setState(() {
      _overlayStack.clear();
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
        backgroundColor: kPrimaryColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showScheduleMaintenanceScreen() {
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Schedule Maintenance',
        child: ScheduleMaintenanceScreen(
          onBack: () {
            _popOverlay();
            _refreshMaintenances(); // Refresh data when coming back
          },
        ),
      ),
    );
  }

  void _showMaintenanceReportsScreen() {
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Maintenance Reports',
        child: MaintenanceReportsScreen(onBack: _popOverlay),
      ),
    );
  }

  void _showCostAnalysisScreen() {
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Cost Analysis',
        child: CostAnalysisScreen(onBack: _popOverlay),
      ),
    );
  }

  void _showVendorManagementScreen() {
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Vendor Management',
        child: const VendorManagementScreen(),
      ),
    );
  }

  Widget _buildOverlayWrapper({
    required String title,
    required Widget child,
  }) {
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.95,
          height: MediaQuery.of(context).size.height * 0.90,
          margin: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: _popOverlay,
                      icon: const Icon(Icons.arrow_back, color: Colors.black),
                      tooltip: 'Back',
                    ),
                    const SizedBox(width: 12),
                    Icon(
                      title == 'Schedule Maintenance'
                          ? Icons.calendar_today_rounded
                          : title == 'Maintenance Reports'
                              ? Icons.analytics_rounded
                              : title == 'Cost Analysis'
                                  ? Icons.monetization_on_rounded
                                  : Icons.store_mall_directory_rounded,
                      color: kPrimaryColor,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.black,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: _clearAllOverlays,
                      child: const Text(
                        'Close',
                        style: TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                  child: child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  elevation: 4.0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Maintenance Management',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: kPrimaryColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Route: /admin/vehicle-management/maintenance',
                          style: TextStyle(
                            fontSize: 14,
                            color: kTextSecondaryColor,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildActionButtons(),
                        const SizedBox(height: 32),
                        _buildScheduledMaintenanceSection(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        ..._overlayStack,
      ],
    );
  }

  Widget _buildActionButtons() {
    return Wrap(
      spacing: 12.0,
      runSpacing: 12.0,
      children: [
        _buildActionButton(
          icon: Icons.calendar_today_rounded,
          label: 'Schedule Maintenance',
          color: kPrimaryColor,
          onPressed: _showScheduleMaintenanceScreen,
        ),
        _buildActionButton(
          icon: Icons.analytics_rounded,
          label: 'Maintenance Reports',
          color: Colors.blue.shade700,
          onPressed: _showMaintenanceReportsScreen,
        ),
        _buildActionButton(
          icon: Icons.monetization_on_rounded,
          label: 'Cost Analysis',
          color: Colors.orange.shade800,
          onPressed: _showCostAnalysisScreen,
        ),
        _buildActionButton(
          icon: Icons.store_mall_directory_rounded,
          label: 'Vendor Management',
          color: Colors.grey.shade700,
          onPressed: _showVendorManagementScreen,
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      icon: Icon(icon, size: 18),
      label: Text(label),
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildScheduledMaintenanceSection() {
    return Card(
      elevation: 4.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Scheduled Maintenances',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: kPrimaryColor,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: _refreshMaintenances,
                      icon: const Icon(Icons.refresh, color: kPrimaryColor),
                      tooltip: 'Refresh',
                    ),
                    Text(
                      '${_scheduledMaintenances.length} items',
                      style: TextStyle(
                        fontSize: 14,
                        color: kTextSecondaryColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_scheduledMaintenances.isEmpty)
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'No Scheduled Maintenances',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Click "Schedule Maintenance" to add new maintenance schedules',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              Column(
                children: _scheduledMaintenances.take(5).map((maintenance) {
                  return _buildMaintenanceCard(maintenance);
                }).toList(),
              ),
            if (_scheduledMaintenances.length > 5)
              Padding(
                padding: const EdgeInsets.only(top: 12.0),
                child: Center(
                  child: TextButton(
                    onPressed: () {
                      // TODO: Show all maintenances in a dialog or new screen
                      _showSnackBar('Showing all ${_scheduledMaintenances.length} scheduled maintenances');
                    },
                    child: Text(
                      'View All ${_scheduledMaintenances.length} Scheduled Maintenances',
                      style: const TextStyle(
                        color: kPrimaryColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMaintenanceCard(Map<String, dynamic> maintenance) {
    final scheduledDate = DateTime.tryParse(maintenance['scheduledDate']?.toString() ?? '');
    final isOverdue = scheduledDate != null && scheduledDate.isBefore(DateTime.now());
    final isUpcoming = scheduledDate != null && 
        scheduledDate.isAfter(DateTime.now()) && 
        scheduledDate.isBefore(DateTime.now().add(const Duration(days: 7)));

    Color statusColor = kTextSecondaryColor;
    Color backgroundColor = Colors.white;
    String statusText = maintenance['status']?.toString().toUpperCase() ?? 'UNKNOWN';

    switch (maintenance['status']?.toString().toLowerCase()) {
      case 'scheduled':
        if (isOverdue) {
          statusColor = kErrorColor;
          backgroundColor = kErrorColor.withOpacity(0.05);
          statusText = 'OVERDUE';
        } else if (isUpcoming) {
          statusColor = kWarningColor;
          backgroundColor = kWarningBackgroundColor;
          statusText = 'UPCOMING';
        } else {
          statusColor = kInfoColor;
          backgroundColor = kInfoColor.withOpacity(0.05);
        }
        break;
      case 'completed':
        statusColor = kSuccessColor;
        backgroundColor = kSuccessColor.withOpacity(0.05);
        break;
      case 'cancelled':
        statusColor = kErrorColor;
        backgroundColor = kErrorColor.withOpacity(0.05);
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: statusColor.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      maintenance['vehicleNumber']?.toString() ?? 'Unknown Vehicle',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: kTextPrimaryColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${maintenance['vehicleMake'] ?? ''} ${maintenance['vehicleModel'] ?? ''}'.trim(),
                      style: TextStyle(
                        fontSize: 14,
                        color: kTextSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.build, size: 16, color: kTextSecondaryColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  maintenance['maintenanceType']?.toString() ?? 'Unknown Type',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: kTextPrimaryColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.calendar_today, size: 16, color: kTextSecondaryColor),
              const SizedBox(width: 8),
              Text(
                scheduledDate != null 
                    ? '${scheduledDate.day}/${scheduledDate.month}/${scheduledDate.year}'
                    : 'No date set',
                style: TextStyle(
                  fontSize: 14,
                  color: isOverdue ? kErrorColor : kTextSecondaryColor,
                  fontWeight: isOverdue ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
              const Spacer(),
              if (maintenance['estimatedCost'] != null && maintenance['estimatedCost'] > 0)
                Row(
                  children: [
                    Icon(Icons.currency_rupee, size: 16, color: kTextSecondaryColor),
                    const SizedBox(width: 4),
                    Text(
                      '${maintenance['estimatedCost']}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: kTextPrimaryColor,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.business, size: 16, color: kTextSecondaryColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  maintenance['vendorName']?.toString() ?? 'No vendor assigned',
                  style: const TextStyle(
                    fontSize: 14,
                    color: kTextPrimaryColor,
                  ),
                ),
              ),
              if (maintenance['priority']?.toString().toLowerCase() == 'high' ||
                  maintenance['priority']?.toString().toLowerCase() == 'urgent')
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: kWarningColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(3),
                    border: Border.all(color: kWarningColor.withOpacity(0.3)),
                  ),
                  child: Text(
                    maintenance['priority']?.toString().toUpperCase() ?? '',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: kWarningColor,
                    ),
                  ),
                ),
            ],
          ),
          if (maintenance['description'] != null && 
              maintenance['description'].toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                maintenance['description'].toString(),
                style: TextStyle(
                  fontSize: 13,
                  color: kTextSecondaryColor,
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
        ],
      ),
    );
  }
}

// ============ COST ANALYSIS SCREEN ============
class CostAnalysisScreen extends StatefulWidget {
  final VoidCallback onBack;
  const CostAnalysisScreen({required this.onBack, super.key});

  @override
  State<CostAnalysisScreen> createState() => _CostAnalysisScreenState();
}

class _CostAnalysisScreenState extends State<CostAnalysisScreen> {
  String _viewType = 'category'; // 'category' or 'vendor'

  final List<Map<String, dynamic>> _vendorCosts = [
    {
      'name': 'Premium Auto Service',
      'cost': '18,500',
      'jobs': 12,
      'avgCost': '1,541',
      'rating': 4.8,
    },
    {
      'name': 'Dubai Maintenance Hub',
      'cost': '16,200',
      'jobs': 15,
      'avgCost': '1,080',
      'rating': 4.5,
    },
    {
      'name': 'Gulf Auto Care',
      'cost': '10,300',
      'jobs': 8,
      'avgCost': '1,287',
      'rating': 4.7,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Monthly Maintenance Cost',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),

          // Total Cost Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kInfoColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kInfoColor.withOpacity(0.3)),
            ),
            child: const Column(
              children: [
                Text('₹45,000',
                    style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: kPrimaryColor)),
                SizedBox(height: 8),
                Text('Total Cost This Month',
                    style: TextStyle(color: kTextSecondaryColor)),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // View Toggle Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => setState(() => _viewType = 'category'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        _viewType == 'category' ? kPrimaryColor : Colors.grey.shade300,
                    foregroundColor:
                        _viewType == 'category' ? Colors.white : Colors.black,
                  ),
                  child: const Text('By Category'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => setState(() => _viewType = 'vendor'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        _viewType == 'vendor' ? kPrimaryColor : Colors.grey.shade300,
                    foregroundColor:
                        _viewType == 'vendor' ? Colors.white : Colors.black,
                  ),
                  child: const Text('By Vendor'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Display Based on View Type
          if (_viewType == 'category') ...[
            const Text('Cost Breakdown by Category',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildCostItem('Parts & Materials', '18,000', 0.40),
            const SizedBox(height: 12),
            _buildCostItem('Labor', '15,000', 0.33),
            const SizedBox(height: 12),
            _buildCostItem('Services', '12,000', 0.27),
          ] else ...[
            const Text('Cost Breakdown by Vendor',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ..._vendorCosts
                .map((vendor) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _buildVendorCostCard(vendor),
                    ))
                .toList(),
          ],
        ],
      ),
    );
  }

  Widget _buildCostItem(String label, String amount, double percentage) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w600)),
            Text('₹$amount',
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: kPrimaryColor)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: percentage,
            minHeight: 8,
            backgroundColor: Colors.grey.shade200,
            valueColor: const AlwaysStoppedAnimation<Color>(kPrimaryColor),
          ),
        ),
      ],
    );
  }

  Widget _buildVendorCostCard(Map<String, dynamic> vendor) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(vendor['name'],
                      style: const TextStyle(
                          fontSize: 14, fontWeight: FontWeight.bold)),
                ),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 14),
                    const SizedBox(width: 4),
                    Text(vendor['rating'].toString(),
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Cost',
                        style: const TextStyle(
                            fontSize: 11, color: kTextSecondaryColor)),
                    Text('₹${vendor['cost']}',
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: kPrimaryColor)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Jobs Completed',
                        style: const TextStyle(
                            fontSize: 11, color: kTextSecondaryColor)),
                    Text('${vendor['jobs']}',
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: kPrimaryColor)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Avg Cost/Job',
                        style: const TextStyle(
                            fontSize: 11, color: kTextSecondaryColor)),
                    Text('₹${vendor['avgCost']}',
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: kInfoColor)),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Note: VendorManagementScreen is imported from vendor_management.dart
// The duplicate class definition has been removed to use the full-featured version