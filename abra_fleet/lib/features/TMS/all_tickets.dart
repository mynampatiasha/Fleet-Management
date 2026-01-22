// lib/features/admin/tms/presentation/screens/all_tickets.dart

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:abra_fleet/app/config/api_config.dart';
import 'package:abra_fleet/core/services/safe_api_service.dart';

class AllTicketsScreen extends StatefulWidget {
  const AllTicketsScreen({super.key});

  @override
  State<AllTicketsScreen> createState() => _AllTicketsScreenState();
}

class _AllTicketsScreenState extends State<AllTicketsScreen> with SingleTickerProviderStateMixin {
  final SafeApiService _api = SafeApiService();
  
  // Data
  List<Map<String, dynamic>> _tickets = [];
  List<Map<String, dynamic>> _employees = [];
  Map<String, int> _stats = {
    'total': 0,
    'open': 0,
    'inProgress': 0,
    'closed': 0,
    'highPriority': 0,
    'unassigned': 0,
  };
  
  // State
  bool _isLoading = true;
  bool _isLoadingEmployees = true;
  String _statusFilter = 'active';
  String? _priorityFilter;
  String? _assignedToFilter;
  
  // Animation
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  
  // Auto-refresh
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _initAnimations();
    _fetchEmployees();
    _fetchTickets();
    _startAutoRefresh();
  }

  void _initAnimations() {
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    
    _animController.forward();
  }

  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _fetchTickets(silent: true);
    });
  }

  Future<void> _fetchEmployees() async {
    try {
      final response = await _api.safeGet(
        '/api/users',
        queryParams: {'limit': '100'}, // Get up to 100 admin users
        context: 'Fetch Employees',
        fallback: {'success': false, 'data': []},
      );
      
      if (response['success'] == true && mounted) {
        setState(() {
          _employees = List<Map<String, dynamic>>.from(response['data'] ?? []);
          _isLoadingEmployees = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingEmployees = false);
      }
    }
  }

  Future<void> _fetchTickets({bool silent = false}) async {
    if (!silent) {
      setState(() => _isLoading = true);
    }

    try {
      final params = <String, String>{
        'status': _statusFilter,
      };
      
      if (_priorityFilter != null && _priorityFilter != 'all') {
        params['priority'] = _priorityFilter!;
      }
      
      if (_assignedToFilter != null && _assignedToFilter != 'all') {
        params['assignedTo'] = _assignedToFilter!;
      }

      final response = await _api.safeGet(
        '/api/tickets/all',
        queryParams: params,
        context: 'All Tickets',
        fallback: {'success': false, 'data': []},
      );

      if (response['success'] == true && mounted) {
        setState(() {
          _tickets = List<Map<String, dynamic>>.from(response['data'] ?? []);
          _calculateStats();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted && !silent) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _calculateStats() {
    _stats = {
      'total': _tickets.length,
      'open': _tickets.where((t) => t['status'] == 'open').length,
      'inProgress': _tickets.where((t) => t['status'] == 'in_progress').length,
      'closed': _tickets.where((t) => t['status'] == 'closed').length,
      'highPriority': _tickets.where((t) => t['priority'] == 'high').length,
      'unassigned': _tickets.where((t) => t['assignedTo'] == null).length,
    };
  }

  Future<void> _reassignTicket(String ticketId, String? newAssignee) async {
    try {
      final response = await _api.safePut(
        '/api/tickets/$ticketId/assign',
        body: {'assignedTo': newAssignee},
        context: 'Reassign Ticket',
        fallback: {'success': false},
      );

      if (response['success'] != false && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Ticket reassigned successfully'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
        
        _fetchTickets();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Failed to reassign: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _deleteTicket(String ticketId, String ticketNumber) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('⚠️ Confirm Delete'),
        content: Text('Delete ticket $ticketNumber? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('DELETE'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await _api.safeDelete(
        '/api/tickets/$ticketId',
        context: 'Delete Ticket',
        fallback: {'success': false},
      );

      if (response['success'] != false && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Ticket deleted successfully'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
        
        _fetchTickets();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Failed to delete: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _showReassignDialog(String ticketId, String ticketNumber, String? currentAssignee) async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Reassign $ticketNumber'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Select new assignee:'),
            const SizedBox(height: 16),
            if (_isLoadingEmployees)
              const CircularProgressIndicator()
            else
              DropdownButtonFormField<String>(
                value: currentAssignee,
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                items: [
                  const DropdownMenuItem(
                    value: null,
                    child: Text('Unassigned'),
                  ),
                  ..._employees.map((emp) => DropdownMenuItem(
                    value: emp['_id'],
                    child: Text(emp['name']),
                  )),
                ],
                onChanged: (value) {
                  Navigator.pop(context);
                  _reassignTicket(ticketId, value);
                },
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
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
            colors: [Colors.teal.shade50, Colors.cyan.shade50],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              children: [
                _buildHeader(),
                _buildStatsGrid(),
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
      floatingActionButton: FloatingActionButton(
        onPressed: _fetchTickets,
        backgroundColor: Colors.teal.shade700,
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
          colors: [Colors.teal.shade700, Colors.cyan.shade700],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.teal.shade300,
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
            child: const Icon(Icons.admin_panel_settings, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'All Tickets',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Admin Management Dashboard',
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
            onPressed: () => _showFilterDialog(),
            icon: const Icon(Icons.filter_list, color: Colors.white),
            tooltip: 'Filter',
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.count(
        shrinkWrap: true,
        crossAxisCount: 3,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.2,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          _buildStatCard('Total', _stats['total']!, Colors.blue, Icons.confirmation_number),
          _buildStatCard('Open', _stats['open']!, Colors.red, Icons.error_outline),
          _buildStatCard('In Progress', _stats['inProgress']!, Colors.orange, Icons.hourglass_empty),
          _buildStatCard('Closed', _stats['closed']!, Colors.green, Icons.check_circle),
          _buildStatCard('High Priority', _stats['highPriority']!, Colors.purple, Icons.priority_high),
          _buildStatCard('Unassigned', _stats['unassigned']!, Colors.grey, Icons.person_off),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, int count, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
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
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            '$count',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildTicketsList() {
    return RefreshIndicator(
      onRefresh: () => _fetchTickets(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _tickets.length,
        itemBuilder: (context, index) => _buildTicketCard(_tickets[index]),
      ),
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    final priority = ticket['priority'] ?? 'medium';
    final status = ticket['status'] ?? 'open';
    final assignedToName = ticket['assignedToName'] ?? 'Unassigned';
    
    Color priorityColor = Colors.green;
    if (priority == 'high') priorityColor = Colors.red;
    else if (priority == 'medium') priorityColor = Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
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
                    color: Colors.teal.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    ticket['ticketNumber'] ?? 'N/A',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal.shade900,
                    ),
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
                Icon(Icons.person, size: 16, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    assignedToName,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                  ),
                ),
                Icon(Icons.access_time, size: 14, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text(
                  _formatDate(ticket['createdAt']),
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showReassignDialog(
                      ticket['_id'],
                      ticket['ticketNumber'],
                      ticket['assignedTo'],
                    ),
                    icon: const Icon(Icons.swap_horiz, size: 16),
                    label: const Text('Reassign', style: TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _deleteTicket(ticket['_id'], ticket['ticketNumber']),
                    icon: const Icon(Icons.delete, size: 16),
                    label: const Text('Delete', style: TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ],
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
      
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inHours < 1) return '${diff.inMinutes}m ago';
      if (diff.inDays < 1) return '${diff.inHours}h ago';
      
      return DateFormat('MMM dd').format(dt);
    } catch (e) {
      return 'N/A';
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text(
            'No Tickets Found',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'No tickets match your current filters',
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Future<void> _showFilterDialog() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('🔍 Filter Tickets'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Status', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  _buildFilterChip('Active', 'active'),
                  _buildFilterChip('Open', 'open'),
                  _buildFilterChip('In Progress', 'in_progress'),
                  _buildFilterChip('Closed', 'closed'),
                  _buildFilterChip('All', 'all'),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _statusFilter = 'active';
                _priorityFilter = null;
                _assignedToFilter = null;
              });
              Navigator.pop(context);
              _fetchTickets();
            },
            child: const Text('CLEAR'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _fetchTickets();
            },
            child: const Text('APPLY'),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _statusFilter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) => setState(() => _statusFilter = value),
      selectedColor: Colors.teal.shade100,
      checkmarkColor: Colors.teal.shade700,
    );
  }
}