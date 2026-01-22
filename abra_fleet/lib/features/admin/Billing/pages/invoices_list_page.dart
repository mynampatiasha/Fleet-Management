// ============================================================================
// INVOICES LIST PAGE - Complete Implementation
// ============================================================================
// File: lib/screens/billing/invoices_list_page.dart
// Matches Zoho Books design exactly
// Full backend integration with InvoiceService
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/services/invoice_service.dart';
import 'new_invoice.dart';

class InvoicesListPage extends StatefulWidget {
  const InvoicesListPage({Key? key}) : super(key: key);

  @override
  State<InvoicesListPage> createState() => _InvoicesListPageState();
}

class _InvoicesListPageState extends State<InvoicesListPage> {
  // Data
  List<Invoice> _invoices = [];
  InvoiceStats? _stats;
  bool _isLoading = true;
  String? _errorMessage;
  
  // Filters
  String _selectedStatus = 'All';
  final List<String> _statusFilters = [
    'All',
    'DRAFT',
    'SENT',
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'CANCELLED',
  ];
  
  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalInvoices = 0;
  final int _itemsPerPage = 20;
  
  // Selection
  final Set<String> _selectedInvoices = {};
  bool _selectAll = false;
  
  // Search
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadInvoices();
    _loadStats();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Load invoices from backend
  Future<void> _loadInvoices() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await InvoiceService.getInvoices(
        status: _selectedStatus == 'All' ? null : _selectedStatus,
        page: _currentPage,
        limit: _itemsPerPage,
      );

      setState(() {
        _invoices = response.invoices;
        _totalPages = response.pagination.pages;
        _totalInvoices = response.pagination.total;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  // Load statistics
  Future<void> _loadStats() async {
    try {
      final stats = await InvoiceService.getStats();
      setState(() {
        _stats = stats;
      });
    } catch (e) {
      print('Error loading stats: $e');
    }
  }

  // Refresh data
  Future<void> _refreshData() async {
    await Future.wait([
      _loadInvoices(),
      _loadStats(),
    ]);
  }

  // Filter by status
  void _filterByStatus(String status) {
    setState(() {
      _selectedStatus = status;
      _currentPage = 1;
    });
    _loadInvoices();
  }

  // Toggle selection
  void _toggleSelection(String invoiceId) {
    setState(() {
      if (_selectedInvoices.contains(invoiceId)) {
        _selectedInvoices.remove(invoiceId);
      } else {
        _selectedInvoices.add(invoiceId);
      }
      _selectAll = _selectedInvoices.length == _invoices.length;
    });
  }

  // Toggle select all
  void _toggleSelectAll(bool? value) {
    setState(() {
      _selectAll = value ?? false;
      if (_selectAll) {
        _selectedInvoices.addAll(_invoices.map((inv) => inv.id));
      } else {
        _selectedInvoices.clear();
      }
    });
  }

  // Navigate to new invoice
  void _openNewInvoice() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const NewInvoiceScreen(),
      ),
    );

    if (result == true) {
      _refreshData();
    }
  }

  // Navigate to edit invoice
  void _openEditInvoice(String invoiceId) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NewInvoiceScreen(invoiceId: invoiceId),
      ),
    );

    if (result == true) {
      _refreshData();
    }
  }

  // Delete invoice
  Future<void> _deleteInvoice(Invoice invoice) async {
    if (invoice.status != 'DRAFT') {
      _showErrorSnackbar('Only draft invoices can be deleted');
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Invoice'),
        content: Text('Are you sure you want to delete invoice ${invoice.invoiceNumber}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await InvoiceService.deleteInvoice(invoice.id);
        _showSuccessSnackbar('Invoice deleted successfully');
        _refreshData();
      } catch (e) {
        _showErrorSnackbar('Failed to delete invoice: $e');
      }
    }
  }

  // Send invoice
  Future<void> _sendInvoice(Invoice invoice) async {
    try {
      await InvoiceService.sendInvoice(invoice.id);
      _showSuccessSnackbar('Invoice sent to ${invoice.customerEmail}');
      _refreshData();
    } catch (e) {
      _showErrorSnackbar('Failed to send invoice: $e');
    }
  }

  // Download PDF
  Future<void> _downloadPDF(Invoice invoice) async {
    try {
      _showSuccessSnackbar('Preparing PDF download...');
      
      await InvoiceService.downloadPDF(invoice.id);
      
      _showSuccessSnackbar(kIsWeb 
        ? '✅ PDF downloaded! Check your Downloads folder.' 
        : '✅ PDF saved and opened successfully');
    } catch (e) {
      _showErrorSnackbar('Failed to download PDF: $e');
    }
  }

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: Column(
        children: [
          _buildTopBar(),
          if (_stats != null) _buildStatsCards(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? _buildErrorState()
                    : _invoices.isEmpty
                        ? _buildEmptyState()
                        : _buildInvoiceTable(),
          ),
          if (!_isLoading && _invoices.isNotEmpty) _buildPagination(),
        ],
      ),
    );
  }

  // Top Bar
  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Row(
        children: [
          // Back Arrow
          IconButton(
            icon: const Icon(Icons.arrow_back, size: 24),
            onPressed: () {
              Navigator.pop(context);
            },
            tooltip: 'Back',
          ),
          const SizedBox(width: 8),
          
          // Status Filter Dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButton<String>(
              value: _selectedStatus,
              underline: const SizedBox(),
              icon: const Icon(Icons.arrow_drop_down),
              items: _statusFilters.map((status) {
                return DropdownMenuItem(
                  value: status,
                  child: Text(
                    status == 'All' ? 'All Invoices' : status.replaceAll('_', ' '),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) _filterByStatus(value);
              },
            ),
          ),

          const Spacer(),

          // Search
          SizedBox(
            width: 300,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search invoices...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value.toLowerCase();
                });
              },
            ),
          ),

          const SizedBox(width: 16),

          // New Button with Dropdown
          PopupMenuButton<String>(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF3498DB),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: const [
                  Icon(Icons.add, color: Colors.white, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'New',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_drop_down, color: Colors.white, size: 20),
                ],
              ),
            ),
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'invoice',
                child: ListTile(
                  leading: Icon(Icons.description, size: 20),
                  title: Text('New Invoice'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'recurring',
                child: ListTile(
                  leading: Icon(Icons.repeat, size: 20),
                  title: Text('New Recurring Invoice'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'credit',
                child: ListTile(
                  leading: Icon(Icons.receipt_long, size: 20),
                  title: Text('New Credit Note'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'retail',
                child: ListTile(
                  leading: Icon(Icons.store, size: 20),
                  title: Text('Create Retail Invoice'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'debit',
                child: ListTile(
                  leading: Icon(Icons.note, size: 20),
                  title: Text('New Debit Note'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
            onSelected: (value) {
              if (value == 'invoice') {
                _openNewInvoice();
              } else {
                _showErrorSnackbar('Coming Soon!');
              }
            },
          ),

          const SizedBox(width: 12),

          // More Options
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              // Show more options menu
            },
          ),
        ],
      ),
    );
  }

  // Stats Cards
  Widget _buildStatsCards() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Row(
        children: [
          _buildStatCard(
            'Total Revenue',
            '₹${_stats!.totalRevenue.toStringAsFixed(2)}',
            Icons.attach_money,
            Colors.blue,
          ),
          const SizedBox(width: 16),
          _buildStatCard(
            'Total Paid',
            '₹${_stats!.totalPaid.toStringAsFixed(2)}',
            Icons.check_circle,
            Colors.green,
          ),
          const SizedBox(width: 16),
          _buildStatCard(
            'Total Due',
            '₹${_stats!.totalDue.toStringAsFixed(2)}',
            Icons.pending,
            Colors.orange,
          ),
          const SizedBox(width: 16),
          _buildStatCard(
            'Total Invoices',
            _stats!.totalInvoices.toString(),
            Icons.description,
            Colors.purple,
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 40, color: color),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Invoice Table
  Widget _buildInvoiceTable() {
    // Filter by search
    final filteredInvoices = _searchQuery.isEmpty
        ? _invoices
        : _invoices.where((invoice) {
            return invoice.invoiceNumber.toLowerCase().contains(_searchQuery) ||
                   invoice.customerName.toLowerCase().contains(_searchQuery) ||
                   (invoice.orderNumber?.toLowerCase().contains(_searchQuery) ?? false);
          }).toList();

    return Container(
      margin: const EdgeInsets.all(20),
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
      child: Column(
        children: [
          // Table Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF34495E),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(8),
                topRight: Radius.circular(8),
              ),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 40,
                  child: Checkbox(
                    value: _selectAll,
                    onChanged: _toggleSelectAll,
                    fillColor: MaterialStateProperty.all(Colors.white),
                    checkColor: const Color(0xFF34495E),
                  ),
                ),
                _buildHeaderCell('DATE', flex: 2),
                _buildHeaderCell('INVOICE#', flex: 2),
                _buildHeaderCell('ORDER NUMBER', flex: 2),
                _buildHeaderCell('CUSTOMER NAME', flex: 3),
                _buildHeaderCell('STATUS', flex: 2),
                _buildHeaderCell('DUE DATE', flex: 2),
                _buildHeaderCell('AMOUNT', flex: 2),
                _buildHeaderCell('BALANCE', flex: 2),
                const SizedBox(width: 60), // Actions column
              ],
            ),
          ),

          // Table Rows
          Expanded(
            child: ListView.separated(
              itemCount: filteredInvoices.length,
              separatorBuilder: (context, index) => Divider(
                height: 1,
                color: Colors.grey[200],
              ),
              itemBuilder: (context, index) {
                return _buildInvoiceRow(filteredInvoices[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCell(String text, {int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildInvoiceRow(Invoice invoice) {
    final isSelected = _selectedInvoices.contains(invoice.id);

    return InkWell(
      onTap: () => _openEditInvoice(invoice.id),
      child: Container(
        padding: const EdgeInsets.all(16),
        color: isSelected ? Colors.blue[50] : null,
        child: Row(
          children: [
            // Checkbox
            SizedBox(
              width: 40,
              child: Checkbox(
                value: isSelected,
                onChanged: (value) => _toggleSelection(invoice.id),
              ),
            ),

            // Date
            Expanded(
              flex: 2,
              child: Text(
                DateFormat('dd/MM/yyyy').format(invoice.invoiceDate),
                style: const TextStyle(fontSize: 14),
              ),
            ),

            // Invoice Number
            Expanded(
              flex: 2,
              child: InkWell(
                onTap: () => _openEditInvoice(invoice.id),
                child: Text(
                  invoice.invoiceNumber,
                  style: const TextStyle(
                    color: Color(0xFF3498DB),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),

            // Order Number
            Expanded(
              flex: 2,
              child: Text(
                invoice.orderNumber ?? '-',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ),

            // Customer Name
            Expanded(
              flex: 3,
              child: Text(
                invoice.customerName,
                style: const TextStyle(fontSize: 14),
              ),
            ),

            // Status Badge
            Expanded(
              flex: 2,
              child: _buildStatusBadge(invoice.status),
            ),

            // Due Date
            Expanded(
              flex: 2,
              child: Text(
                DateFormat('dd/MM/yyyy').format(invoice.dueDate),
                style: const TextStyle(fontSize: 14),
              ),
            ),

            // Amount
            Expanded(
              flex: 2,
              child: Text(
                '₹${invoice.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.right,
              ),
            ),

            // Balance
            Expanded(
              flex: 2,
              child: Text(
                '₹${invoice.amountDue.toStringAsFixed(2)}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: invoice.amountDue > 0 ? Colors.red[700] : Colors.green[700],
                ),
                textAlign: TextAlign.right,
              ),
            ),

            // Actions
            SizedBox(
              width: 60,
              child: PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20),
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: ListTile(
                      leading: Icon(Icons.edit, size: 18),
                      title: Text('Edit'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'send',
                    child: ListTile(
                      leading: Icon(Icons.send, size: 18),
                      title: Text('Send'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'download',
                    child: ListTile(
                      leading: Icon(Icons.download, size: 18),
                      title: Text('Download PDF'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  if (invoice.status == 'DRAFT')
                    const PopupMenuItem(
                      value: 'delete',
                      child: ListTile(
                        leading: Icon(Icons.delete, size: 18, color: Colors.red),
                        title: Text('Delete', style: TextStyle(color: Colors.red)),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                ],
                onSelected: (value) async {
                  switch (value) {
                    case 'edit':
                      _openEditInvoice(invoice.id);
                      break;
                    case 'send':
                      _sendInvoice(invoice);
                      break;
                    case 'download':
                      await _downloadPDF(invoice);
                      break;
                    case 'delete':
                      _deleteInvoice(invoice);
                      break;
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color backgroundColor;
    Color textColor;

    switch (status) {
      case 'PAID':
        backgroundColor = Colors.green[100]!;
        textColor = Colors.green[800]!;
        break;
      case 'DRAFT':
        backgroundColor = Colors.grey[200]!;
        textColor = Colors.grey[800]!;
        break;
      case 'SENT':
      case 'UNPAID':
        backgroundColor = Colors.orange[100]!;
        textColor = Colors.orange[800]!;
        break;
      case 'PARTIALLY_PAID':
        backgroundColor = Colors.yellow[100]!;
        textColor = Colors.yellow[900]!;
        break;
      case 'OVERDUE':
        backgroundColor = Colors.red[100]!;
        textColor = Colors.red[800]!;
        break;
      case 'CANCELLED':
        backgroundColor = Colors.grey[300]!;
        textColor = Colors.grey[700]!;
        break;
      default:
        backgroundColor = Colors.blue[100]!;
        textColor = Colors.blue[800]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  // Pagination
  Widget _buildPagination() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Showing ${(_currentPage - 1) * _itemsPerPage + 1} - ${(_currentPage * _itemsPerPage).clamp(0, _totalInvoices)} of $_totalInvoices',
            style: TextStyle(color: Colors.grey[700]),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: _currentPage > 1
                    ? () {
                        setState(() {
                          _currentPage--;
                        });
                        _loadInvoices();
                      }
                    : null,
              ),
              ...List.generate(
                _totalPages.clamp(0, 5),
                (index) {
                  final pageNum = index + 1;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _currentPage = pageNum;
                        });
                        _loadInvoices();
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _currentPage == pageNum
                              ? const Color(0xFF3498DB)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          pageNum.toString(),
                          style: TextStyle(
                            color: _currentPage == pageNum
                                ? Colors.white
                                : Colors.grey[700],
                            fontWeight: _currentPage == pageNum
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: _currentPage < _totalPages
                    ? () {
                        setState(() {
                          _currentPage++;
                        });
                        _loadInvoices();
                      }
                    : null,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Empty State
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.description_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No invoices found',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first invoice to get started',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _openNewInvoice,
            icon: const Icon(Icons.add),
            label: const Text('Create Invoice'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3498DB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            ),
          ),
        ],
      ),
    );
  }

  // Error State
  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 80, color: Colors.red[400]),
          const SizedBox(height: 16),
          Text(
            'Error Loading Invoices',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _errorMessage ?? 'Unknown error',
            style: TextStyle(color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _refreshData,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3498DB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            ),
          ),
        ],
      ),
    );
  }
}
