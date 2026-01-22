// File: lib/features/admin/customer_management/presentation/screens/admin_all_customers.dart
// COMPLETE FIXED VERSION - All Issues Resolved

import 'dart:async'; 

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:abra_fleet/features/admin/customer_management/domain/entities/customer_entity.dart';
import 'package:abra_fleet/features/admin/customer_management/presentation/providers/customer_provider.dart';
import 'package:abra_fleet/features/admin/customer_management/presentation/screens/admin_customer_details_screen.dart';
import 'package:abra_fleet/features/admin/customer_management/customer_form_overlay.dart';
import 'package:abra_fleet/features/admin/customer_management/bulk_import_overlay.dart';
import 'package:abra_fleet/features/client/bulk_import_rosters.dart';

class AdminAllCustomersPage extends StatefulWidget {
  const AdminAllCustomersPage({Key? key}) : super(key: key);

  @override
  State<AdminAllCustomersPage> createState() => _AdminAllCustomersPageState();
}

class _AdminAllCustomersPageState extends State<AdminAllCustomersPage> {
  Timer? _autoRefreshTimer;
  String? selectedOrganization = 'All Organizations';
  String? selectedStatus = 'All';
  String? selectedDepartment = 'All Departments';
  final TextEditingController searchController = TextEditingController();
  bool _showAddCustomerOverlay = false;
  bool _showBulkImportOverlay = false;
  bool _showBulkImportRostersOverlay = false;
  CustomerEntity? _editingCustomer;

  final List<String> _departments = [
    'All Departments',
    'Engineering',
    'Human Resources',
    'Finance',
    'Sales',
    'Marketing',
    'Operations',
    'IT Support',
    'Customer Service',
    'Product Management',
    'Legal',
    'Administration',
    'Research & Development',
  ];

  @override
void initState() {
  super.initState();
  
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _initializeData();
  });
  
  // ✅ OPTIONAL: Auto-refresh every 30 seconds while screen is visible
  // TEMPORARILY DISABLED FOR DEBUGGING - Uncomment to re-enable
  /*
  _autoRefreshTimer = Timer.periodic(
    const Duration(seconds: 30),
    (timer) {
      if (mounted && !_showAddCustomerOverlay && !_showBulkImportOverlay) {
        print('⏰ Auto-refreshing customers (periodic check)...');
        _refreshCustomers().catchError((e) {
          // Silently catch errors if widget is disposed
          if (mounted) {
            debugPrint('❌ Error in auto-refresh: $e');
          }
        });
      }
    },
  );
  */
}

@override
void dispose() {
  // Cancel timer FIRST before disposing anything else
  _autoRefreshTimer?.cancel();
  _autoRefreshTimer = null;
  searchController.dispose();
  super.dispose();
}

  // Initialize data with proper error handling and loading states
  Future<void> _initializeData() async {
    if (!mounted) return;
    
    try {
      print('\n🟢 INITIALIZING CUSTOMER DATA WITH CUSTOMER SERVICE');
      print('─' * 80);
      
      final provider = Provider.of<CustomerProvider>(context, listen: false);
      
      // Initialize provider first
      await provider.initialize();
      
      // Check mounted after first async operation
      if (!mounted) return;
      
      // Fetch customers with proper parameters
      await provider.fetchCustomers(
        status: 'active', // Default to active customers
        search: '', // Empty string for no search term
        organization: selectedOrganization == 'All Organizations' ? null : selectedOrganization,
        department: selectedDepartment == 'All Departments' ? null : selectedDepartment,
      );
      
      // Check mounted after second async operation
      if (!mounted) return;
      
      print('✅ Customer data initialized successfully');
    } catch (e) {
      print('❌ Error initializing customer data: $e');
      
      // ✅ Check mounted before showing SnackBar
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading data: ${e.toString()}'),
          backgroundColor: Colors.orange,
          action: SnackBarAction(
            label: 'Retry',
            textColor: Colors.white,
            onPressed: () => _initializeData(),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          Consumer<CustomerProvider>(
            builder: (context, customerProvider, child) {
              if (customerProvider.isLoading && customerProvider.customers.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }

              if (customerProvider.errorMessage != null && customerProvider.customers.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(customerProvider.errorMessage!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => _initializeData(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                );
              }

              final filteredCustomers = _getFilteredCustomers(customerProvider.customers);

              return RefreshIndicator(
                onRefresh: () => _refreshCustomers(),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStatsGrid(customerProvider.customers),
                      const SizedBox(height: 24),
                      _buildFilterSection(customerProvider), // Pass provider
                      const SizedBox(height: 24),
                      _buildCustomerDirectory(filteredCustomers),
                    ],
                  ),
                ),
              );
            },
          ),
          
          // Add/Edit Customer Overlay
          if (_showAddCustomerOverlay)
            _buildCustomerFormOverlay(),
          
          // Bulk Import Overlay
          if (_showBulkImportOverlay)
            _buildBulkImportOverlay(),
          
          // Bulk Import Rosters Overlay
          if (_showBulkImportRostersOverlay)
            BulkImportRostersScreen(
              onCancel: () {
                if (mounted) {
                  setState(() {
                    _showBulkImportRostersOverlay = false;
                  });
                }
              },
              onImportComplete: () {
                if (mounted) {
                  setState(() {
                    _showBulkImportRostersOverlay = false;
                  });
                  _refreshCustomers();
                }
              },
            ),
        ],
      ),
    );
  }

  List<CustomerEntity> _getFilteredCustomers(List<CustomerEntity> allCustomers) {
    List<CustomerEntity> filtered = allCustomers;

    if (selectedOrganization != null && selectedOrganization != 'All Organizations') {
      filtered = filtered.where((c) => 
        c.companyName?.toLowerCase() == selectedOrganization!.toLowerCase()
      ).toList();
    }

    if (selectedStatus != null && selectedStatus != 'All') {
      filtered = filtered.where((c) => 
        c.status.toLowerCase() == selectedStatus!.toLowerCase()
      ).toList();
    }

    if (selectedDepartment != null && selectedDepartment != 'All Departments') {
      filtered = filtered.where((c) => 
        c.department?.toLowerCase() == selectedDepartment!.toLowerCase()
      ).toList();
    }

    if (searchController.text.isNotEmpty) {
      final searchTerm = searchController.text.toLowerCase();
      filtered = filtered.where((c) =>
        c.name.toLowerCase().contains(searchTerm) ||
        c.email.toLowerCase().contains(searchTerm) ||
        (c.employeeId?.toLowerCase().contains(searchTerm) ?? false) ||
        (c.companyName?.toLowerCase().contains(searchTerm) ?? false)
      ).toList();
    }

    return filtered;
  }

  Widget _buildStatsGrid(List<CustomerEntity> customers) {
    final activeCustomers = customers.where((c) => c.status.toLowerCase() == 'active').length;
    final inactiveCustomers = customers.where((c) => c.status.toLowerCase() == 'inactive').length;
    final pendingCustomers = customers.where((c) => c.status.toLowerCase() == 'pending').length;

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            label: 'Total Customers',
            value: customers.length.toString(),
            subtitle: 'All registered',
            color: const Color(0xFF2563EB),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            label: 'Active Customers',
            value: activeCustomers.toString(),
            subtitle: customers.isEmpty 
              ? '0%' 
              : '${((activeCustomers / customers.length) * 100).toStringAsFixed(0)}% active',
            color: const Color(0xFF10B981),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            label: 'Inactive',
            value: inactiveCustomers.toString(),
            subtitle: 'Need attention',
            color: const Color(0xFFF59E0B),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            label: 'Pending Approval',
            value: pendingCustomers.toString(),
            subtitle: 'Awaiting verification',
            color: const Color(0xFFEF4444),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border(
          left: BorderSide(color: color, width: 4),
        ),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  // FIXED: Accept CustomerProvider parameter
  Widget _buildFilterSection(CustomerProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.filter_list, size: 18),
              SizedBox(width: 8),
              Text(
                'Filter Customers',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _buildOrganizationDropdown(provider)), // Pass provider
              const SizedBox(width: 16),
              Expanded(child: _buildStatusDropdown()),
              const SizedBox(width: 16),
              Expanded(child: _buildDepartmentDropdown()),
              const SizedBox(width: 16),
              Expanded(flex: 2, child: _buildSearchField()),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {});
                },
                icon: const Icon(Icons.search, size: 18),
                label: const Text('Search'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() {
                    selectedOrganization = 'All Organizations';
                    selectedStatus = 'All';
                    selectedDepartment = 'All Departments';
                    searchController.clear();
                  });
                },
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Reset'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF64748B),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // FIXED: Organization Dropdown with persistent companies
  Widget _buildOrganizationDropdown(CustomerProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Organization',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE2E8F0)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: selectedOrganization,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    border: InputBorder.none,
                  ),
                  items: provider.companies.map((org) { // Use provider.companies
                    return DropdownMenuItem(
                      value: org,
                      child: Text(
                        org,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() => selectedOrganization = value);
                  },
                ),
              ),
              Container(
                height: 40,
                width: 1,
                color: const Color(0xFFE2E8F0),
              ),
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => _showAddCompanyDialog(provider), // Pass provider
                  borderRadius: const BorderRadius.only(
                    topRight: Radius.circular(8),
                    bottomRight: Radius.circular(8),
                  ),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: const Icon(
                      Icons.add_business,
                      size: 20,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // FIXED: Add company with persistence via provider
  void _showAddCompanyDialog(CustomerProvider provider) {
    final TextEditingController companyController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.business, color: Color(0xFF2563EB)),
              SizedBox(width: 8),
              Text('Add New Company'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter the company name to add to the list',
                style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: companyController,
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'Company Name',
                  hintText: 'e.g., Acme Corporation',
                  prefixIcon: const Icon(Icons.business_center),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                      color: Color(0xFF2563EB),
                      width: 2,
                    ),
                  ),
                ),
                textCapitalization: TextCapitalization.words,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton.icon(
              onPressed: () async {
                final companyName = companyController.text.trim();
                if (companyName.isNotEmpty) {
                  final success = await provider.addCompany(companyName);
                  
                  if (mounted) {
                    Navigator.pop(dialogContext);
                    
                    if (success) {
                      setState(() {
                        selectedOrganization = companyName;
                      });
                      
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Company "$companyName" added successfully'),
                          backgroundColor: Colors.green,
                          action: SnackBarAction(
                            label: 'Undo',
                            textColor: Colors.white,
                            onPressed: () async {
                              await provider.removeCompany(companyName);
                              setState(() {
                                selectedOrganization = 'All Organizations';
                              });
                            },
                          ),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Company already exists in the list'),
                          backgroundColor: Colors.orange,
                        ),
                      );
                    }
                  }
                }
              },
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Add Company'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatusDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Status',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedStatus,
          isExpanded: true,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
          ),
          items: const [
            DropdownMenuItem(
              value: 'All',
              child: Text('All', style: TextStyle(fontSize: 13)),
            ),
            DropdownMenuItem(
              value: 'Active',
              child: Text('Active', style: TextStyle(fontSize: 13)),
            ),
            DropdownMenuItem(
              value: 'Inactive',
              child: Text('Inactive', style: TextStyle(fontSize: 13)),
            ),
            DropdownMenuItem(
              value: 'Pending',
              child: Text('Pending', style: TextStyle(fontSize: 13)),
            ),
          ],
          onChanged: (value) {
            setState(() => selectedStatus = value);
          },
        ),
      ],
    );
  }

  Widget _buildDepartmentDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Department',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedDepartment,
          isExpanded: true,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
          ),
          items: _departments.map((dept) {
            return DropdownMenuItem(
              value: dept,
              child: Text(
                dept,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13),
              ),
            );
          }).toList(),
          onChanged: (value) {
            setState(() => selectedDepartment = value);
          },
        ),
      ],
    );
  }

  Widget _buildSearchField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Search',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: searchController,
          decoration: InputDecoration(
            hintText: 'Name, Email, ID...',
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            suffixIcon: searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() => searchController.clear());
                  },
                )
              : null,
          ),
          onChanged: (value) => setState(() {}),
        ),
      ],
    );
  }

  Widget _buildCustomerDirectory(List<CustomerEntity> customers) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFFF3F4F6)),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Customer Directory (${customers.length})',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _editingCustomer = null;
                          _showAddCustomerOverlay = true;
                        });
                      },
                      icon: const Icon(Icons.person_add, size: 16),
                      label: const Text('Add Customer'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _showBulkImportOverlay = true;
                        });
                      },
                      icon: const Icon(Icons.upload_file, size: 16),
                      label: const Text('Bulk Import'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _showBulkImportRostersOverlay = true;
                        });
                      },
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: const Text('Bulk Import Rosters'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEC4899),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _refreshCustomers(),
                      icon: const Icon(Icons.refresh, size: 16),
                      label: const Text('Refresh'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          customers.isEmpty
            ? Padding(
                padding: const EdgeInsets.all(48.0),
                child: Column(
                  children: [
                    const Icon(Icons.people_outline, size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    Text(
                      searchController.text.isNotEmpty
                        ? 'No customers match your search'
                        : 'No customers found\nClick "Add Customer" to create one',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              )
            : SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columnSpacing: 24,
                  horizontalMargin: 24,
                  headingRowColor: MaterialStateProperty.all(
                    const Color(0xFFF8FAFC),
                  ),
                  columns: const [
                    DataColumn(label: Text('EMPLOYEE ID')),
                    DataColumn(label: Text('NAME')),
                    DataColumn(label: Text('EMAIL')),
                    DataColumn(label: Text('PHONE')),
                    DataColumn(label: Text('COMPANY')),
                    DataColumn(label: Text('DEPARTMENT')),
                    DataColumn(label: Text('STATUS')),
                    DataColumn(label: Text('ACTIONS')),
                  ],
                  rows: customers.map((customer) {
                    return DataRow(
                      cells: [
                        DataCell(
                          Text(
                            customer.employeeId ?? 'N/A',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        DataCell(Text(customer.name)),
                        DataCell(
                          Text(
                            customer.email,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                        DataCell(Text(customer.phoneNumber ?? 'N/A')),
                        DataCell(Text(customer.companyName ?? 'N/A')),
                        DataCell(Text(customer.department ?? 'N/A')),
                        DataCell(_buildStatusBadge(customer.status)),
                        DataCell(
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                onPressed: () => _navigateToDetails(customer),
                                icon: const Icon(Icons.visibility, size: 18),
                                color: const Color(0xFF2563EB),
                                tooltip: 'View Details',
                                padding: const EdgeInsets.all(8),
                                constraints: const BoxConstraints(),
                              ),
                              const SizedBox(width: 4),
                              IconButton(
                                onPressed: () {
                                  setState(() {
                                    _editingCustomer = customer;
                                    _showAddCustomerOverlay = true;
                                  });
                                },
                                icon: const Icon(Icons.edit, size: 18),
                                color: const Color(0xFFF59E0B),
                                tooltip: 'Edit',
                                padding: const EdgeInsets.all(8),
                                constraints: const BoxConstraints(),
                              ),
                              const SizedBox(width: 4),
                              IconButton(
                                onPressed: () => _deleteCustomer(customer),
                                icon: const Icon(Icons.delete, size: 18),
                                color: const Color(0xFFEF4444),
                                tooltip: 'Delete',
                                padding: const EdgeInsets.all(8),
                                constraints: const BoxConstraints(),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color backgroundColor;
    Color textColor;
    String text = status;

    switch (status.toLowerCase()) {
      case 'active':
        backgroundColor = const Color(0xFF10B981).withOpacity(0.1);
        textColor = const Color(0xFF10B981);
        break;
      case 'inactive':
        backgroundColor = const Color(0xFFF59E0B).withOpacity(0.1);
        textColor = const Color(0xFFF59E0B);
        break;
      case 'pending':
        backgroundColor = const Color(0xFFEF4444).withOpacity(0.1);
        textColor = const Color(0xFFEF4444);
        break;
      default:
        backgroundColor = const Color(0xFF64748B).withOpacity(0.1);
        textColor = const Color(0xFF64748B);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildCustomerFormOverlay() {
    return CustomerFormOverlay(
      customer: _editingCustomer,
      onClose: () {
        if (mounted) {
          print('🟢 CustomerFormOverlay onClose called');
          setState(() {
            _showAddCustomerOverlay = false;
            _editingCustomer = null;
          });
        }
      },
      onSaved: () async {
        print('🟢 CustomerFormOverlay onSaved called - starting');
        if (mounted) {
          print('🟢 Widget is mounted');
          setState(() {
            _showAddCustomerOverlay = false;
            _editingCustomer = null;
          });
          
          print('🟢 Fetching customers after save...');
          await _refreshCustomers();
        }
      },
    );
  }

  // 2️⃣ ENHANCE: _refreshCustomers method
// Replace your existing method with this enhanced version
// Replace your _refreshCustomers() method in _AdminAllCustomersPageState with this:

Future<void> _refreshCustomers() async {
  // ✅ FIX: Check if widget is still mounted BEFORE accessing context
  if (!mounted) {
    return;
  }
  
  try {
    print('\n🔄 REFRESHING CUSTOMERS WITH FILTERS');
    print('─' * 80);
    print('🔍 Organization: $selectedOrganization');
    print('🔍 Status: $selectedStatus');
    print('🔍 Department: $selectedDepartment');
    print('🔍 Search: ${searchController.text}');
    
    // ✅ FIX: Get provider reference once and store it
    final provider = Provider.of<CustomerProvider>(context, listen: false);
    
    // Step 1: Reload companies (in case new companies were added)
    await provider.initialize();
    
    // ✅ FIX: Check mounted again after async operation
    if (!mounted) {
      return;
    }
    
    // Step 2: Fetch latest customers from database with current filters
    await provider.fetchCustomers(
      status: selectedStatus != 'All' ? selectedStatus?.toLowerCase() : null,
      search: searchController.text.isNotEmpty ? searchController.text : null,
      organization: selectedOrganization != 'All Organizations' ? selectedOrganization : null,
      department: selectedDepartment != 'All Departments' ? selectedDepartment : null,
    );
    
    // ✅ FIX: Check mounted again before showing SnackBar
    if (!mounted) {
      return;
    }
    
    print('✅ Customers refreshed successfully');
  } catch (e) {
    print('❌ Error refreshing customers: $e');
    
    // ✅ FIX: Check mounted before showing error SnackBar
    if (!mounted) {
      return;
    }
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text('Failed to refresh: ${e.toString()}'),
            ),
          ],
        ),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'Retry',
          textColor: Colors.white,
          onPressed: () => _refreshCustomers(),
        ),
      ),
    );
  }
}


Widget _buildBulkImportOverlay() {
  return BulkImportOverlay(
    onClose: () {
      if (mounted) {
        debugPrint('🔴 Bulk import overlay closed');
        setState(() {
          _showBulkImportOverlay = false;
        });
        
        // ✅ FIX: Always refresh after closing, even if user cancels
        // Add longer delay to ensure Firestore writes complete
        Future.delayed(const Duration(milliseconds: 800), () {
          if (mounted) {
            debugPrint('🔄 Auto-refreshing customers after import overlay closed...');
            _refreshCustomers();
          }
        });
      }
    },
    onImported: () async {
      if (mounted) {
        debugPrint('✅ Bulk import completed successfully');
        setState(() {
          _showBulkImportOverlay = false;
        });
        
        // ✅ FIX: Add delay before refresh to ensure Firestore writes are complete
        debugPrint('⏳ Waiting for Firestore writes to complete...');
        await Future.delayed(const Duration(milliseconds: 1500));
        
        if (!mounted) return;
        
        // ✅ FIX: Force refresh to show newly imported employees
        debugPrint('🔄 Refreshing customer list after import...');
        await _refreshCustomers();
        
        if (mounted) {
          final customerProvider = Provider.of<CustomerProvider>(context, listen: false);
          debugPrint('📊 Total customers after import: ${customerProvider.customers.length}');
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Import complete! ${customerProvider.customers.length} total customers',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 4),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              action: SnackBarAction(
                label: 'View All',
                textColor: Colors.white,
                onPressed: () {
                  // Reset filters to show all customers
                  setState(() {
                    searchController.clear();
                    selectedOrganization = 'All Organizations';
                    selectedStatus = 'All';
                    selectedDepartment = 'All Departments';
                  });
                },
              ),
            ),
          );
        }
      }
    },
  );
}

  void _navigateToDetails(CustomerEntity customer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AdminCustomerDetailsScreen(
          customerId: customer.id,
        ),
      ),
    ).then((_) {
      _refreshCustomers();
    });
  }

  
// ✅ ALSO FIX: _deleteCustomer method
Future<void> _deleteCustomer(CustomerEntity customer) async {
  // ✅ Check mounted before showing dialog
  if (!mounted) return;
  
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (BuildContext dialogContext) {
      return AlertDialog(
        title: const Text('Delete Customer'),
        content: Text(
          'Are you sure you want to delete ${customer.name}?\n\nThis action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      );
    },
  );

  // ✅ Check mounted after dialog closes
  if (!mounted) return;

  if (confirmed == true) {
    try {
      // ✅ Get provider reference once
      final provider = Provider.of<CustomerProvider>(context, listen: false);
      final success = await provider.deleteCustomer(customer.id);

      // ✅ Check mounted after async operation
      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${customer.name} deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        await _refreshCustomers();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to delete customer'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // ✅ Check mounted before showing error
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error deleting customer: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

}