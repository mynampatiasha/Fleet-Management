// lib/features/admin/tms/presentation/screens/closed_tickets.dart

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:abra_fleet/app/config/api_config.dart';
import 'package:abra_fleet/core/services/safe_api_service.dart';

class ClosedTicketsScreen extends StatefulWidget {
  const ClosedTicketsScreen({super.key});

  @override
  State<ClosedTicketsScreen> createState() => _ClosedTicketsScreenState();
}

class _ClosedTicketsScreenState extends State<ClosedTicketsScreen> with SingleTickerProviderStateMixin {
  final SafeApiService _api = SafeApiService();
  
  // Data
  List<Map<String, dynamic>> _tickets = [];
  List<Map<String, dynamic>> _employees = [];
  Map<String, int> _stats = {
    'total': 0,
    'today': 0,
    'week': 0,
    'month': 0,
  };
  
  // State
  bool _isLoading = true;
  bool _isLoadingEmployees = true;
  String? _assignedToFilter;
  DateTime? _dateFrom;
  DateTime? _dateTo;
  
  // Animation
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _initAnimations();
    _fetchEmployees();
    _fetchClosedTickets();
    _fetchStats();
  }

  void _initAnimations() {
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    
    _animController.forward();
  }

  Future<void> _fetchEmployees() async {
    try {
      debugPrint('🔍 Closed Tickets: Fetching employees from /api/employee-management/employees');
      
      final response = await _api.safeGet(
        '/api/employee-management/employees',
        queryParams: {'limit': '100'}, // Get up to 100 admin users
        context: 'Fetch Employees',
        fallback: {'success': false, 'data': []},
      );
      
      debugPrint('📋 Closed Tickets: Employee API Response: ${response?.keys}');
      
      if (mounted) {
        setState(() {
          // Handle different response formats
          if (response != null && response.containsKey('data') && response['data'] != null) {
            final data = response['data'];
            if (data is List) {
              _employees = List<Map<String, dynamic>>.from(data);
              debugPrint('✅ Closed Tickets: Loaded ${_employees.length} employees');
            } else {
              _employees = [];
            }
          } else {
            _employees = [];
          }
          _isLoadingEmployees = false;
        });
      }
    } catch (e) {
      debugPrint('❌ Closed Tickets: Error fetching employees: $e');
      if (mounted) {
        setState(() {
          _employees = [];
          _isLoadingEmployees = false;
        });
      }
    }
  }

  Future<void> _fetchClosedTickets() async {
    setState(() => _isLoading = true);

    try {
      final params = <String, String>{
        // No need to specify status since /closed endpoint already filters
      };
      
      if (_assignedToFilter != null && _assignedToFilter != 'all') {
        params['assignedTo'] = _assignedToFilter!;
      }
      
      if (_dateFrom != null) {
        params['dateFrom'] = DateFormat('yyyy-MM-dd').format(_dateFrom!);
      }
      
      if (_dateTo != null) {
        params['dateTo'] = DateFormat('yyyy-MM-dd').format(_dateTo!);
      }

      debugPrint('🎫 Fetching closed tickets with params: $params');

      final response = await _api.safeGet(
        '/api/tickets/closed',
        queryParams: params,
        context: 'Closed Tickets',
        fallback: {'success': false, 'data': []},
      );

      debugPrint('📊 Closed tickets response: ${response?.keys}');

      if (mounted) {
        setState(() {
          if (response != null && response.containsKey('data') && response['data'] != null) {
            final data = response['data'];
            if (data is List) {
              _tickets = List<Map<String, dynamic>>.from(data);
              debugPrint('✅ Loaded ${_tickets.length} closed tickets');
              
              // Recalculate stats after fetching tickets
              _calculateStats();
            } else {
              _tickets = [];
            }
          } else {
            _tickets = [];
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('❌ Error fetching closed tickets: $e');
      if (mounted) {
        setState(() {
          _tickets = [];
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _fetchStats() async {
    try {
      debugPrint('📊 Fetching ticket stats...');
      
      final response = await _api.safeGet(
        '/api/tickets/stats',
        context: 'Ticket Stats',
        fallback: {'success': false, 'data': {}},
      );

      debugPrint('📈 Stats response: $response');

      if (mounted) {
        // Calculate stats from the current tickets data
        _calculateStats();
      }
    } catch (e) {
      debugPrint('❌ Failed to fetch stats: $e');
      if (mounted) {
        _calculateStats();
      }
    }
  }

  void _calculateStats() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final weekStart = today.subtract(Duration(days: now.weekday - 1));
    final monthStart = DateTime(now.year, now.month, 1);

    int totalCount = _tickets.length;
    int todayCount = 0;
    int weekCount = 0;
    int monthCount = 0;

    for (final ticket in _tickets) {
      try {
        final updatedAtStr = ticket['updatedAt'] ?? ticket['closedAt'] ?? ticket['createdAt'];
        if (updatedAtStr != null) {
          final updatedAt = DateTime.parse(updatedAtStr.toString());
          final ticketDate = DateTime(updatedAt.year, updatedAt.month, updatedAt.day);
          
          // Count for today
          if (ticketDate.isAtSameMomentAs(today)) {
            todayCount++;
          }
          
          // Count for this week
          if (ticketDate.isAfter(weekStart.subtract(const Duration(days: 1))) || 
              ticketDate.isAtSameMomentAs(weekStart)) {
            weekCount++;
          }
          
          // Count for this month
          if (ticketDate.isAfter(monthStart.subtract(const Duration(days: 1))) || 
              ticketDate.isAtSameMomentAs(monthStart)) {
            monthCount++;
          }
        }
      } catch (e) {
        debugPrint('⚠️ Error parsing date for ticket: $e');
      }
    }

    setState(() {
      _stats = {
        'total': totalCount,
        'today': todayCount,
        'week': weekCount,
        'month': monthCount,
      };
    });

    debugPrint('📊 Calculated stats: Total: $totalCount, Today: $todayCount, Week: $weekCount, Month: $monthCount');
  }

  Future<void> _reopenTicket(String ticketId, String ticketNumber) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.refresh, color: Colors.blue.shade700, size: 28),
            const SizedBox(width: 12),
            const Text('Reopen Ticket?'),
          ],
        ),
        content: Text(
          'Reopen ticket $ticketNumber? It will return to active status.',
          style: const TextStyle(fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue.shade700,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('REOPEN'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await _api.safePut(
        '/api/tickets/$ticketId/status',
        body: {'status': 'open', 'note': 'Ticket reopened from archive'},
        context: 'Reopen Ticket',
        fallback: {'success': false},
      );

      if (response['success'] != false && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 12),
                Text('✅ Ticket $ticketNumber reopened successfully'),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        
        _fetchClosedTickets();
        _fetchStats();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Failed to reopen: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _showTicketDetails(Map<String, dynamic> ticket) async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _TicketDetailsSheet(
        ticket: ticket,
        onReopen: () {
          Navigator.pop(context);
          _reopenTicket(ticket['_id'], ticket['ticketNumber']);
        },
      ),
    );
  }

  Future<void> _showFilterDialog() async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('🔍 Filter Closed Tickets'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Assigned To', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              if (_isLoadingEmployees)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: 12),
                      Text('Loading employees...'),
                    ],
                  ),
                )
              else
                InkWell(
                  onTap: () => _showEmployeeSearchDialog(),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search, color: Colors.purple.shade400),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _assignedToFilter == null || _assignedToFilter == 'all'
                              ? const Text(
                                  'Search and select employee (or leave empty for all)',
                                  style: TextStyle(color: Colors.grey),
                                )
                              : _buildSelectedEmployeeDisplay(),
                        ),
                        Icon(Icons.arrow_drop_down, color: Colors.grey.shade600),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              const Text('Date Range', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: _dateFrom ?? DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime.now(),
                        );
                        if (date != null) {
                          setState(() => _dateFrom = date);
                        }
                      },
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text(_dateFrom != null ? DateFormat('MMM dd').format(_dateFrom!) : 'From'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: _dateTo ?? DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime.now(),
                        );
                        if (date != null) {
                          setState(() => _dateTo = date);
                        }
                      },
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text(_dateTo != null ? DateFormat('MMM dd').format(_dateTo!) : 'To'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _assignedToFilter = null;
                _dateFrom = null;
                _dateTo = null;
              });
              Navigator.pop(context);
              _fetchClosedTickets();
            },
            child: const Text('CLEAR'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _fetchClosedTickets();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green.shade700,
            ),
            child: const Text('APPLY'),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedEmployeeDisplay() {
    final selectedEmployee = _employees.firstWhere(
      (emp) => emp['id'] == _assignedToFilter,
      orElse: () => {},
    );
    
    if (selectedEmployee.isEmpty) {
      return const Text('Employee not found', style: TextStyle(color: Colors.red));
    }

    return Row(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: Colors.purple.shade100,
          child: Text(
            (selectedEmployee['name_parson'] ?? selectedEmployee['name'] ?? 'U')[0].toUpperCase(),
            style: TextStyle(color: Colors.purple.shade700),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                selectedEmployee['name_parson'] ?? selectedEmployee['name'] ?? 'Unknown',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              if (selectedEmployee['email'] != null && selectedEmployee['email'].toString().isNotEmpty)
                Text(
                  selectedEmployee['email'].toString(),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  void _showEmployeeSearchDialog() {
    showDialog(
      context: context,
      builder: (context) => _EmployeeSearchDialog(
        employees: _employees,
        selectedEmployeeId: _assignedToFilter,
        onEmployeeSelected: (employeeId) {
          setState(() {
            _assignedToFilter = employeeId;
          });
        },
        onClearSelection: () {
          setState(() {
            _assignedToFilter = null;
          });
        },
      ),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.green.shade50, Colors.teal.shade50],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: Column(
                children: [
                  _buildHeader(),
                  _buildStatsCards(),
                  Expanded(
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : _tickets.isEmpty
                            ? _buildEmptyState()
                            : _buildTicketsList(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _fetchClosedTickets,
        backgroundColor: Colors.green.shade700,
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green.shade700, Colors.teal.shade700],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.green.shade300,
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.archive, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Closed Tickets',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Archive of resolved tickets',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          // Total tickets count
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.confirmation_number, color: Colors.white, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Total: ${_tickets.length}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _showFilterDialog,
            icon: const Icon(Icons.filter_list, color: Colors.white),
            tooltip: 'Filter',
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCards() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(child: _buildStatCard('Total', _stats['total']!, Icons.all_inclusive, Colors.green)),
          const SizedBox(width: 12),
          Expanded(child: _buildStatCard('Today', _stats['today']!, Icons.today, Colors.blue)),
          const SizedBox(width: 12),
          Expanded(child: _buildStatCard('Week', _stats['week']!, Icons.calendar_view_week, Colors.orange)),
          const SizedBox(width: 12),
          Expanded(child: _buildStatCard('Month', _stats['month']!, Icons.calendar_month, Colors.purple)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, int count, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade200,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            '$count',
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
              fontSize: 12,
              color: Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTicketsList() {
    return RefreshIndicator(
      onRefresh: () => _fetchClosedTickets(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _tickets.length,
        itemBuilder: (context, index) => _buildTicketCard(_tickets[index]),
      ),
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    final priority = ticket['priority'] ?? 'medium';
    
    Color priorityColor = Colors.green;
    if (priority == 'high') priorityColor = Colors.red;
    else if (priority == 'medium') priorityColor = Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: InkWell(
        onTap: () => _showTicketDetails(ticket),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      ticket['ticketNumber'] ?? 'N/A',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade900,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle, size: 12, color: Colors.green.shade700),
                        const SizedBox(width: 4),
                        Text(
                          'CLOSED',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  _buildBadge(priority.toUpperCase(), priorityColor),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                ticket['subject'] ?? 'No Subject',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                ticket['message'] ?? '',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.access_time, size: 14, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text(
                    'Closed ${_formatDate(ticket['updatedAt'])}',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: () => _reopenTicket(ticket['_id'], ticket['ticketNumber']),
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Reopen', style: TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade700,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      final dt = DateTime.parse(date.toString());
      final now = DateTime.now();
      final diff = now.difference(dt);
      
      if (diff.inMinutes < 1) return 'just now';
      if (diff.inHours < 1) return '${diff.inMinutes}m ago';
      if (diff.inDays < 1) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      
      return DateFormat('MMM dd, yyyy').format(dt);
    } catch (e) {
      return 'N/A';
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.archive_outlined, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text(
            'No Closed Tickets',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Archive is empty',
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// TICKET DETAILS BOTTOM SHEET
// ============================================================================

class _TicketDetailsSheet extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final VoidCallback onReopen;

  const _TicketDetailsSheet({
    required this.ticket,
    required this.onReopen,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.green.shade700, Colors.teal.shade700],
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                const Icon(Icons.archive, color: Colors.white, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ticket['ticketNumber'] ?? 'N/A',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        'Closed Ticket Details',
                        style: TextStyle(color: Colors.white70, fontSize: 14),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
          ),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow('Subject', ticket['subject']),
                  const Divider(height: 24),
                  _buildDetailRow('Message', ticket['message']),
                  const Divider(height: 24),
                  _buildDetailRow('Priority', ticket['priority']?.toString().toUpperCase()),
                  const Divider(height: 24),
                  _buildDetailRow('Created By', ticket['createdBy']?['name']),
                  const Divider(height: 24),
                  _buildDetailRow('Closed At', _formatFullDate(ticket['updatedAt'])),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onReopen,
                icon: const Icon(Icons.refresh),
                label: const Text('Reopen Ticket'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue.shade700,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String? value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value ?? 'N/A',
          style: const TextStyle(fontSize: 16),
        ),
      ],
    );
  }

  String _formatFullDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      final dt = DateTime.parse(date.toString());
      return DateFormat('MMM dd, yyyy hh:mm a').format(dt);
    } catch (e) {
      return 'N/A';
    }
  }
}

// ============================================================================
// 🔍 EMPLOYEE SEARCH DIALOG FOR FILTERS
// ============================================================================

class _EmployeeSearchDialog extends StatefulWidget {
  final List<Map<String, dynamic>> employees;
  final String? selectedEmployeeId;
  final Function(String?) onEmployeeSelected;
  final VoidCallback onClearSelection;

  const _EmployeeSearchDialog({
    required this.employees,
    required this.selectedEmployeeId,
    required this.onEmployeeSelected,
    required this.onClearSelection,
  });

  @override
  State<_EmployeeSearchDialog> createState() => _EmployeeSearchDialogState();
}

class _EmployeeSearchDialogState extends State<_EmployeeSearchDialog> {
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, dynamic>> _filteredEmployees = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _filteredEmployees = List.from(widget.employees);
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text.toLowerCase().trim();
      _filterEmployees();
    });
  }

  void _filterEmployees() {
    if (_searchQuery.isEmpty) {
      _filteredEmployees = List.from(widget.employees);
    } else {
      _filteredEmployees = widget.employees.where((employee) {
        final name = (employee['name_parson'] ?? employee['name'] ?? '').toString().toLowerCase();
        final email = (employee['email'] ?? '').toString().toLowerCase();
        final department = (employee['department'] ?? '').toString().toLowerCase();
        
        return name.contains(_searchQuery) || 
               email.contains(_searchQuery) || 
               department.contains(_searchQuery);
      }).toList();
    }
  }

  void _selectEmployee(String? employeeId) {
    widget.onEmployeeSelected(employeeId);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        constraints: const BoxConstraints(
          maxWidth: 500,
          maxHeight: 600,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green.shade600, Colors.teal.shade600],
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.filter_list, color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Filter by Employee',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            
            // Search Field
            Padding(
              padding: const EdgeInsets.all(20),
              child: TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Search by name, email, or department...',
                  prefixIcon: Icon(Icons.search, color: Colors.green.shade400),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: Colors.grey.shade50,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.green.shade400, width: 2),
                  ),
                ),
              ),
            ),
            
            // All Employees Option
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                tileColor: widget.selectedEmployeeId == null ? Colors.green.shade50 : null,
                leading: CircleAvatar(
                  radius: 20,
                  backgroundColor: widget.selectedEmployeeId == null 
                      ? Colors.green.shade200 
                      : Colors.grey.shade200,
                  child: Icon(
                    Icons.people,
                    color: widget.selectedEmployeeId == null 
                        ? Colors.green.shade700 
                        : Colors.grey.shade600,
                  ),
                ),
                title: Text(
                  'All Employees',
                  style: TextStyle(
                    fontWeight: widget.selectedEmployeeId == null ? FontWeight.bold : FontWeight.w600,
                    color: widget.selectedEmployeeId == null ? Colors.green.shade700 : null,
                  ),
                ),
                subtitle: const Text('Show tickets from all employees'),
                trailing: widget.selectedEmployeeId == null
                    ? Icon(Icons.check_circle, color: Colors.green.shade600)
                    : const Icon(Icons.radio_button_unchecked, color: Colors.grey),
                onTap: () => _selectEmployee(null),
              ),
            ),
            
            const Divider(height: 1),
            
            // Results Count
            if (_searchQuery.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: Colors.grey.shade600),
                    const SizedBox(width: 8),
                    Text(
                      '${_filteredEmployees.length} employee${_filteredEmployees.length != 1 ? 's' : ''} found',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            
            // Employee List
            Expanded(
              child: _filteredEmployees.isEmpty
                  ? _buildEmptyState()
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: _filteredEmployees.length,
                      separatorBuilder: (context, index) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final employee = _filteredEmployees[index];
                        final isSelected = employee['id'] == widget.selectedEmployeeId;
                        
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          tileColor: isSelected ? Colors.green.shade50 : null,
                          leading: CircleAvatar(
                            radius: 20,
                            backgroundColor: isSelected 
                                ? Colors.green.shade200 
                                : Colors.green.shade100,
                            child: Text(
                              (employee['name_parson'] ?? employee['name'] ?? 'U')[0].toUpperCase(),
                              style: TextStyle(
                                color: Colors.green.shade700,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            employee['name_parson'] ?? employee['name'] ?? 'Unknown',
                            style: TextStyle(
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                              color: isSelected ? Colors.green.shade700 : null,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (employee['email'] != null && employee['email'].toString().isNotEmpty)
                                Text(
                                  employee['email'].toString(),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              if (employee['department'] != null && employee['department'].toString().isNotEmpty)
                                Text(
                                  'Dept: ${employee['department']}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey.shade500,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                            ],
                          ),
                          trailing: isSelected
                              ? Icon(Icons.check_circle, color: Colors.green.shade600)
                              : const Icon(Icons.radio_button_unchecked, color: Colors.grey),
                          onTap: () => _selectEmployee(employee['id']),
                        );
                      },
                    ),
            ),
            
            // Footer
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total: ${widget.employees.length} employees',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                    ),
                  ),
                  Row(
                    children: [
                      TextButton(
                        onPressed: () {
                          widget.onClearSelection();
                          Navigator.pop(context);
                        },
                        child: const Text('Clear Filter'),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _searchQuery.isEmpty ? Icons.people_outline : Icons.search_off,
              size: 64,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isEmpty 
                  ? 'No employees available'
                  : 'No employees found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isEmpty
                  ? 'Contact your administrator to add employees'
                  : 'Try adjusting your search terms',
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            if (_searchQuery.isNotEmpty) ...[
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  _searchController.clear();
                },
                icon: const Icon(Icons.clear),
                label: const Text('Clear Search'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade100,
                  foregroundColor: Colors.green.shade700,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}