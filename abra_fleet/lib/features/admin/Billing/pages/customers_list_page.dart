// ============================================================================
// CUSTOMERS LIST PAGE - COMPLETE IMPLEMENTATION
// ============================================================================
// File: lib/screens/billing/pages/customers_list_page.dart
// 
// Features:
// - All Customers dropdown with filters
// - New button (navigates to new_customer.dart)
// - 3-dot menu with Sort, Import, Export, Preferences, Refresh
// - Professional table with static data
// - Click on row to view/edit customer
// - Same color scheme as new_customer.dart (#2C3E50, #3498DB)
// ============================================================================

import 'package:flutter/material.dart';
import 'new_customer.dart'; // Import the new customer page

class CustomersListPage extends StatefulWidget {
  const CustomersListPage({Key? key}) : super(key: key);

  @override
  State<CustomersListPage> createState() => _CustomersListPageState();
}

class _CustomersListPageState extends State<CustomersListPage> {
  // Filter state
  String selectedFilter = 'All Customers';
  
  // Sort state
  String sortBy = 'Name';
  bool sortAscending = true;
  
  // Selection state
  Set<int> selectedRows = {};
  bool selectAll = false;
  
  // Filter options
  final List<String> filterOptions = [
    'All Customers',
    'Active',
    'Inactive',
    'Blocked',
    'Lead',
    'Closed',
    'Individual',
    'Organization',
    'Vendor',
    'Others',
    'Gold Tier',
    'Silver Tier',
    'Bronze Tier',
    'Platinum Tier',
  ];
  
  // Sort options
  final List<String> sortOptions = [
    'Name',
    'Company Name',
    'Email',
    'Phone',
    'Created Date',
    'Last Modified',
  ];
  
  // Static customer data (replace with backend data later)
  List<CustomerData> customers = [
    CustomerData(
      id: 'CUST-001',
      name: 'Asha',
      companyName: 'Asha Enterprises',
      email: 'asha@example.com',
      workPhone: '+91 98765 43210',
      status: 'Active',
      type: 'Individual',
      tier: 'Gold',
      createdDate: DateTime(2024, 1, 15),
    ),
    CustomerData(
      id: 'CUST-002',
      name: 'Rajesh Kumar',
      companyName: 'Tech Solutions Pvt Ltd',
      email: 'rajesh@techsolutions.com',
      workPhone: '+91 98765 43211',
      status: 'Active',
      type: 'Organization',
      tier: 'Platinum',
      createdDate: DateTime(2024, 2, 10),
    ),
    CustomerData(
      id: 'CUST-003',
      name: 'Priya Sharma',
      companyName: '',
      email: 'priya.sharma@gmail.com',
      workPhone: '+91 98765 43212',
      status: 'Inactive',
      type: 'Individual',
      tier: 'Silver',
      createdDate: DateTime(2024, 1, 20),
    ),
    CustomerData(
      id: 'CUST-004',
      name: 'Mumbai Logistics',
      companyName: 'Mumbai Logistics Services',
      email: 'contact@mumbailogistics.com',
      workPhone: '+91 98765 43213',
      status: 'Active',
      type: 'Vendor',
      tier: 'Gold',
      createdDate: DateTime(2024, 3, 5),
    ),
    CustomerData(
      id: 'CUST-005',
      name: 'Suresh Reddy',
      companyName: 'Reddy Transport Co',
      email: 'suresh@reddytransport.com',
      workPhone: '+91 98765 43214',
      status: 'Lead',
      type: 'Vendor',
      tier: 'Bronze',
      createdDate: DateTime(2024, 3, 12),
    ),
    CustomerData(
      id: 'CUST-006',
      name: 'Anita Desai',
      companyName: '',
      email: 'anita.desai@yahoo.com',
      workPhone: '+91 98765 43215',
      status: 'Active',
      type: 'Individual',
      tier: 'Silver',
      createdDate: DateTime(2024, 2, 28),
    ),
    CustomerData(
      id: 'CUST-007',
      name: 'Chennai Motors',
      companyName: 'Chennai Motors Pvt Ltd',
      email: 'info@chennaimotors.com',
      workPhone: '+91 98765 43216',
      status: 'Blocked',
      type: 'Organization',
      tier: 'Gold',
      createdDate: DateTime(2024, 1, 8),
    ),
    CustomerData(
      id: 'CUST-008',
      name: 'Vikram Singh',
      companyName: '',
      email: 'vikram.singh@outlook.com',
      workPhone: '+91 98765 43217',
      status: 'Active',
      type: 'Individual',
      tier: 'Platinum',
      createdDate: DateTime(2024, 3, 18),
    ),
  ];
  
  List<CustomerData> get filteredCustomers {
    if (selectedFilter == 'All Customers') {
      return customers;
    }
    
    return customers.where((customer) {
      switch (selectedFilter) {
        case 'Active':
        case 'Inactive':
        case 'Blocked':
        case 'Lead':
        case 'Closed':
          return customer.status == selectedFilter;
        case 'Individual':
        case 'Organization':
        case 'Vendor':
        case 'Others':
          return customer.type == selectedFilter;
        case 'Gold Tier':
          return customer.tier == 'Gold';
        case 'Silver Tier':
          return customer.tier == 'Silver';
        case 'Bronze Tier':
          return customer.tier == 'Bronze';
        case 'Platinum Tier':
          return customer.tier == 'Platinum';
        default:
          return true;
      }
    }).toList();
  }
  
  void _toggleSelectAll(bool? value) {
    setState(() {
      selectAll = value ?? false;
      if (selectAll) {
        selectedRows = Set.from(List.generate(filteredCustomers.length, (i) => i));
      } else {
        selectedRows.clear();
      }
    });
  }
  
  void _toggleRowSelection(int index) {
    setState(() {
      if (selectedRows.contains(index)) {
        selectedRows.remove(index);
        selectAll = false;
      } else {
        selectedRows.add(index);
        if (selectedRows.length == filteredCustomers.length) {
          selectAll = true;
        }
      }
    });
  }
  
  void _navigateToNewCustomer() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const NewCustomerPage(),
      ),
    );
    
    if (result == true) {
      // Refresh list after adding new customer
      setState(() {
        // TODO: Reload customers from backend
      });
    }
  }
  
  void _navigateToCustomerDetails(CustomerData customer) {
    // Navigate to customer details/edit page
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NewCustomerPage(customerId: customer.id),
      ),
    );
  }
  
  void _showSortDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sort By'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: sortOptions.map((option) {
            return RadioListTile<String>(
              title: Text(option),
              value: option,
              groupValue: sortBy,
              onChanged: (value) {
                setState(() {
                  sortBy = value!;
                });
                Navigator.pop(context);
              },
            );
          }).toList(),
        ),
      ),
    );
  }
  
  void _handleImport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Import functionality will be implemented'),
        backgroundColor: Color(0xFF3498DB),
      ),
    );
  }
  
  void _handleExport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export functionality will be implemented'),
        backgroundColor: Color(0xFF3498DB),
      ),
    );
  }
  
  void _handlePreferences() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Preferences functionality will be implemented'),
        backgroundColor: Color(0xFF3498DB),
      ),
    );
  }
  
  void _handleRefresh() {
    setState(() {
      // TODO: Reload customers from backend
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('List refreshed'),
        backgroundColor: Colors.green,
        duration: Duration(seconds: 1),
      ),
    );
  }
  
  Color _getStatusColor(String status) {
    switch (status) {
      case 'Active':
        return Colors.green;
      case 'Inactive':
        return Colors.grey;
      case 'Blocked':
        return Colors.red;
      case 'Lead':
        return Colors.blue;
      case 'Closed':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final displayedCustomers = filteredCustomers;
    
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Customers'),
        backgroundColor: const Color(0xFF2C3E50),
        foregroundColor: Colors.white,
        elevation: 1,
      ),
      body: Column(
        children: [
          // Top action bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                // All Customers Dropdown
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: DropdownButton<String>(
                    value: selectedFilter,
                    underline: const SizedBox(),
                    icon: const Icon(Icons.arrow_drop_down, size: 24),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF2C3E50),
                    ),
                    items: filterOptions.map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        selectedFilter = newValue!;
                        selectedRows.clear();
                        selectAll = false;
                      });
                    },
                  ),
                ),
                
                const Spacer(),
                
                // New Button
                ElevatedButton.icon(
                  onPressed: _navigateToNewCustomer,
                  icon: const Icon(Icons.add, size: 20),
                  label: const Text('New'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3498DB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                    elevation: 0,
                  ),
                ),
                
                const SizedBox(width: 12),
                
                // 3-dot menu
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: Color(0xFF2C3E50)),
                  offset: const Offset(0, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'sort',
                      child: Row(
                        children: [
                          Icon(
                            Icons.sort,
                            size: 20,
                            color: Colors.grey[700],
                          ),
                          const SizedBox(width: 12),
                          const Text('Sort by'),
                          const Spacer(),
                          Icon(
                            Icons.chevron_right,
                            size: 20,
                            color: Colors.grey[400],
                          ),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'import',
                      child: Row(
                        children: [
                          Icon(
                            Icons.upload_outlined,
                            size: 20,
                            color: Colors.grey[700],
                          ),
                          const SizedBox(width: 12),
                          const Text('Import'),
                          const Spacer(),
                          Icon(
                            Icons.chevron_right,
                            size: 20,
                            color: Colors.grey[400],
                          ),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'export',
                      child: Row(
                        children: [
                          Icon(
                            Icons.download_outlined,
                            size: 20,
                            color: Colors.grey[700],
                          ),
                          const SizedBox(width: 12),
                          const Text('Export'),
                          const Spacer(),
                          Icon(
                            Icons.chevron_right,
                            size: 20,
                            color: Colors.grey[400],
                          ),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'preferences',
                      child: Row(
                        children: [
                          Icon(
                            Icons.settings_outlined,
                            size: 20,
                            color: Colors.grey[700],
                          ),
                          const SizedBox(width: 12),
                          const Text('Preferences'),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'refresh',
                      child: Row(
                        children: [
                          Icon(
                            Icons.refresh,
                            size: 20,
                            color: Colors.grey[700],
                          ),
                          const SizedBox(width: 12),
                          const Text('Refresh List'),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    switch (value) {
                      case 'sort':
                        _showSortDialog();
                        break;
                      case 'import':
                        _handleImport();
                        break;
                      case 'export':
                        _handleExport();
                        break;
                      case 'preferences':
                        _handlePreferences();
                        break;
                      case 'refresh':
                        _handleRefresh();
                        break;
                    }
                  },
                ),
              ],
            ),
          ),
          
          // Table
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: displayedCustomers.isEmpty
                  ? _buildEmptyState()
                  : SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          headingRowHeight: 56,
                          dataRowHeight: 64,
                          columnSpacing: 40,
                          horizontalMargin: 24,
                          headingRowColor: MaterialStateProperty.all(
                            Colors.grey[50],
                          ),
                          columns: [
                            DataColumn(
                              label: Checkbox(
                                value: selectAll,
                                onChanged: _toggleSelectAll,
                                activeColor: const Color(0xFF3498DB),
                              ),
                            ),
                            DataColumn(
                              label: Row(
                                children: [
                                  const Text(
                                    'NAME',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                      color: Color(0xFF2C3E50),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(
                                    Icons.unfold_more,
                                    size: 16,
                                    color: Colors.grey[500],
                                  ),
                                ],
                              ),
                            ),
                            const DataColumn(
                              label: Text(
                                'COMPANY NAME',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                  color: Color(0xFF2C3E50),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const DataColumn(
                              label: Text(
                                'EMAIL',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                  color: Color(0xFF2C3E50),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const DataColumn(
                              label: Text(
                                'WORK PHONE',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                  color: Color(0xFF2C3E50),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const DataColumn(
                              label: Text(
                                'STATUS',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                  color: Color(0xFF2C3E50),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const DataColumn(
                              label: Text(
                                'TYPE',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                  color: Color(0xFF2C3E50),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                          rows: List.generate(
                            displayedCustomers.length,
                            (index) {
                              final customer = displayedCustomers[index];
                              final isSelected = selectedRows.contains(index);
                              
                              return DataRow(
                                selected: isSelected,
                                onSelectChanged: (selected) {
                                  _toggleRowSelection(index);
                                },
                                cells: [
                                  DataCell(
                                    Checkbox(
                                      value: isSelected,
                                      onChanged: (value) {
                                        _toggleRowSelection(index);
                                      },
                                      activeColor: const Color(0xFF3498DB),
                                    ),
                                  ),
                                  DataCell(
                                    InkWell(
                                      onTap: () => _navigateToCustomerDetails(customer),
                                      child: Text(
                                        customer.name,
                                        style: const TextStyle(
                                          color: Color(0xFF3498DB),
                                          fontWeight: FontWeight.w500,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    Text(
                                      customer.companyName.isEmpty
                                          ? '-'
                                          : customer.companyName,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[800],
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    Text(
                                      customer.email,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[800],
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    Text(
                                      customer.workPhone,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[800],
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(customer.status)
                                            .withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: _getStatusColor(customer.status)
                                              .withOpacity(0.3),
                                        ),
                                      ),
                                      child: Text(
                                        customer.status,
                                        style: TextStyle(
                                          color: _getStatusColor(customer.status),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2C3E50)
                                            .withOpacity(0.05),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        customer.type,
                                        style: const TextStyle(
                                          color: Color(0xFF2C3E50),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ),
                    ),
            ),
          ),
          
          // Footer with count
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                Text(
                  'Showing ${displayedCustomers.length} customer${displayedCustomers.length != 1 ? 's' : ''}',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
                if (selectedRows.isNotEmpty) ...[
                  const SizedBox(width: 16),
                  Text(
                    '(${selectedRows.length} selected)',
                    style: const TextStyle(
                      color: Color(0xFF3498DB),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people_outline,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            'No customers found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            selectedFilter == 'All Customers'
                ? 'Get started by adding your first customer'
                : 'No customers match the selected filter',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _navigateToNewCustomer,
            icon: const Icon(Icons.add, size: 20),
            label: const Text('Add Customer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3498DB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: 32,
                vertical: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// DATA MODEL
// ============================================================================

class CustomerData {
  final String id;
  final String name;
  final String companyName;
  final String email;
  final String workPhone;
  final String status;
  final String type;
  final String tier;
  final DateTime createdDate;
  
  CustomerData({
    required this.id,
    required this.name,
    required this.companyName,
    required this.email,
    required this.workPhone,
    required this.status,
    required this.type,
    required this.tier,
    required this.createdDate,
  });
}