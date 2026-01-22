// ============================================================================
// PAYMENTS RECEIVED PAGE - LIST VIEW ONLY
// ============================================================================
// File: lib/screens/billing/payments_received_page.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/services/billing_api_service.dart';
import '../../../../core/services/payment_service.dart';
import '../../../../core/services/invoice_service.dart';
import 'new_payment_page.dart'; // Import the new payment page

class PaymentsReceivedPage extends StatefulWidget {
  const PaymentsReceivedPage({Key? key}) : super(key: key);

  @override
  State<PaymentsReceivedPage> createState() => _PaymentsReceivedPageState();
}

class _PaymentsReceivedPageState extends State<PaymentsReceivedPage> {
  String selectedFilter = 'All Payments';
  List<String> filterOptions = ['All Payments', 'Draft', 'Paid', 'Void'];
  List<Map<String, dynamic>> payments = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPayments();
  }

  Future<void> _loadPayments() async {
    setState(() => isLoading = true);
    try {
      final result = await PaymentService.getPaymentsReceived(
        filter: selectedFilter == 'All Payments' ? null : selectedFilter,
      );
      setState(() {
        payments = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading payments: $e')),
      );
    }
  }

  void _showThreeDotsMenu() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildMenuOption(
              icon: Icons.sort,
              title: 'Sort by',
              onTap: () => _showSortOptions(),
            ),
            _buildMenuOption(
              icon: Icons.download,
              title: 'Import',
              onTap: () => _handleImport(),
            ),
            _buildMenuOption(
              icon: Icons.upload,
              title: 'Export Payments',
              onTap: () => _handleExport(),
            ),
            _buildMenuOption(
              icon: Icons.settings,
              title: 'Manage Custom Fields',
              onTap: () => _handleCustomFields(),
            ),
            _buildMenuOption(
              icon: Icons.payment,
              title: 'Online Payments',
              onTap: () => _handleOnlinePayments(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF3498DB)),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: () {
        Navigator.pop(context);
        onTap();
      },
    );
  }

  void _showSortOptions() {
    // Implement sort options
  }

  void _handleImport() {
    // Implement import functionality
  }

  Future<void> _handleExport() async {
    try {
      final url = await PaymentService.exportPaymentsCSV(
        filter: selectedFilter == 'All Payments' ? null : selectedFilter,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Export initiated: $url')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Export failed: $e')),
      );
    }
  }

  void _handleCustomFields() {
    // Implement custom fields management
  }

  void _handleOnlinePayments() {
    // Implement online payments
  }

  void _viewPaymentDetails(Map<String, dynamic> payment) {
    showDialog(
      context: context,
      builder: (context) => PaymentDetailsDialog(payment: payment),
    );
  }

  Future<void> _viewPaymentProofs(Map<String, dynamic> payment) async {
    try {
      final proofs = await PaymentService.getPaymentProofs(payment['id']);
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Payment Proofs - #${payment['paymentNumber']}'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: proofs.length,
              itemBuilder: (context, index) {
                final proof = proofs[index];
                return ListTile(
                  leading: Icon(
                    proof.fileType.contains('pdf') 
                        ? Icons.picture_as_pdf 
                        : Icons.image,
                    color: const Color(0xFF3498DB),
                    size: 32,
                  ),
                  title: Text(proof.filename),
                  subtitle: Text(
                    '${(proof.fileSize / 1024).toStringAsFixed(1)} KB',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.download, color: Color(0xFF3498DB)),
                    onPressed: () async {
                      final url = await PaymentService.downloadPaymentProof(
                        payment['id'],
                        index.toString(),
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Download: $url')),
                      );
                    },
                  ),
                );
              },
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
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load proofs: $e')),
      );
    }
  }

  Future<void> _deletePayment(Map<String, dynamic> payment) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Payment'),
        content: Text(
          'Are you sure you want to delete payment #${payment['paymentNumber']}?'
        ),
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
        await PaymentService.deletePayment(payment['id']);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadPayments();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: Column(
        children: [
          _buildTopBar(),
          _buildStatsCards(),
          // Payments Table
          Expanded(
            child: Container(
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
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _buildPaymentsTable(),
            ),
          ),
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
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Back',
          ),
          const SizedBox(width: 8),
          // Title
          const Text(
            'Payments Received',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(width: 16),
          // Filter Dropdown (moved here from stats section)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButton<String>(
              value: selectedFilter,
              underline: const SizedBox(),
              icon: const Icon(Icons.arrow_drop_down),
              items: filterOptions.map((filter) {
                return DropdownMenuItem(
                  value: filter,
                  child: Row(
                    children: [
                      Text(
                        filter,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(Icons.star_border, size: 16, color: Colors.grey[400]),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => selectedFilter = value);
                  _loadPayments();
                }
              },
            ),
          ),
          const Spacer(),
          ElevatedButton.icon(
            onPressed: () => _navigateToNewPayment(),
            icon: const Icon(Icons.add, color: Colors.white, size: 20),
            label: const Text(
              'New',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3498DB),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
          const SizedBox(width: 12),
          IconButton(
            onPressed: _showThreeDotsMenu,
            icon: const Icon(Icons.more_vert),
          ),
        ],
      ),
    );
  }

  // Stats Cards
  Widget _buildStatsCards() {
    // Calculate stats from payments
    double totalReceived = 0;
    double thisMonth = 0;
    int totalPayments = payments.length;
    
    final now = DateTime.now();
    final currentMonth = now.month;
    final currentYear = now.year;
    
    for (var payment in payments) {
      final amount = payment['amount'] ?? 0.0;
      totalReceived += amount;
      
      // Parse date and check if it's this month
      try {
        final dateParts = (payment['date'] ?? '').split('/');
        if (dateParts.length == 3) {
          final month = int.parse(dateParts[1]);
          final year = int.parse(dateParts[2]);
          if (month == currentMonth && year == currentYear) {
            thisMonth += amount;
          }
        }
      } catch (e) {
        // Skip if date parsing fails
      }
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      color: Colors.white,
      child: Row(
        children: [
          _buildStatCard(
            'Total Received',
            '₹${totalReceived.toStringAsFixed(2)}',
            Icons.attach_money,
            Colors.green,
          ),
          const SizedBox(width: 16),
          _buildStatCard(
            'This Month',
            '₹${thisMonth.toStringAsFixed(2)}',
            Icons.calendar_today,
            Colors.blue,
          ),
          const SizedBox(width: 16),
          _buildStatCard(
            'Total Payments',
            totalPayments.toString(),
            Icons.receipt_long,
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

  Widget _buildPaymentsTable() {
    if (payments.isEmpty) {
      return const Center(
        child: Text(
          'No payments found',
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      );
    }

    return Column(
      children: [
        // Table Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            color: Color(0xFF34495E),
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
          ),
          child: Row(
            children: [
              _buildHeaderCell('DATE', flex: 2),
              _buildHeaderCell('PAYMENT #', flex: 2),
              _buildHeaderCell('REFERENCE', flex: 2),
              _buildHeaderCell('CUSTOMER', flex: 3),
              _buildHeaderCell('INVOICE#', flex: 2),
              _buildHeaderCell('MODE', flex: 2),
              _buildHeaderCell('AMOUNT', flex: 2),
              _buildHeaderCell('PROOFS', flex: 2),
              const SizedBox(width: 60), // Actions
            ],
          ),
        ),
        // Table Body
        Expanded(
          child: ListView.separated(
            itemCount: payments.length,
            separatorBuilder: (context, index) => Divider(
              height: 1,
              color: Colors.grey[200],
            ),
            itemBuilder: (context, index) {
              return _buildPaymentRow(payments[index]);
            },
          ),
        ),
      ],
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

  Widget _buildPaymentRow(Map<String, dynamic> payment) {
    return InkWell(
      onTap: () => _viewPaymentDetails(payment),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Date
            Expanded(
              flex: 2,
              child: Text(
                payment['date'] ?? '',
                style: const TextStyle(fontSize: 14),
              ),
            ),
            // Payment Number
            Expanded(
              flex: 2,
              child: InkWell(
                onTap: () => _viewPaymentDetails(payment),
                child: Text(
                  payment['paymentNumber']?.toString() ?? '',
                  style: const TextStyle(
                    color: Color(0xFF3498DB),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ),
            // Reference
            Expanded(
              flex: 2,
              child: Text(
                payment['referenceNumber'] ?? '-',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ),
            // Customer
            Expanded(
              flex: 3,
              child: Text(
                payment['customerName'] ?? '',
                style: const TextStyle(fontSize: 14),
              ),
            ),
            // Invoice
            Expanded(
              flex: 2,
              child: Text(
                payment['invoiceNumber'] ?? '-',
                style: const TextStyle(
                  color: Color(0xFF3498DB),
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ),
            // Mode
            Expanded(
              flex: 2,
              child: Text(
                payment['mode'] ?? '',
                style: const TextStyle(fontSize: 14),
              ),
            ),
            // Amount
            Expanded(
              flex: 2,
              child: Text(
                '₹${payment['amount']?.toStringAsFixed(2) ?? '0.00'}',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
            // Proofs
            Expanded(
              flex: 2,
              child: payment['hasProofs'] == true
                  ? InkWell(
                      onTap: () => _viewPaymentProofs(payment),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.green[200]!),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.attach_file,
                              size: 16,
                              color: Color(0xFF27AE60),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${payment['proofsCount'] ?? 0}',
                              style: const TextStyle(
                                color: Color(0xFF27AE60),
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : Text(
                      '-',
                      style: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 14,
                      ),
                    ),
            ),
            // Actions
            SizedBox(
              width: 60,
              child: PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20),
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'view',
                    child: ListTile(
                      leading: Icon(Icons.visibility, size: 18),
                      title: Text('View Details'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'edit',
                    child: ListTile(
                      leading: Icon(Icons.edit, size: 18),
                      title: Text('Edit'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  if (payment['hasProofs'] == true)
                    const PopupMenuItem(
                      value: 'proofs',
                      child: ListTile(
                        leading: Icon(
                          Icons.attach_file,
                          size: 18,
                          color: Colors.green,
                        ),
                        title: Text('View Proofs'),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: ListTile(
                      leading: Icon(
                        Icons.delete,
                        size: 18,
                        color: Colors.red,
                      ),
                      title: Text(
                        'Delete',
                        style: TextStyle(color: Colors.red),
                      ),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ],
                onSelected: (value) {
                  switch (value) {
                    case 'view':
                      _viewPaymentDetails(payment);
                      break;
                    case 'edit':
                      // TODO: Implement edit
                      break;
                    case 'proofs':
                      _viewPaymentProofs(payment);
                      break;
                    case 'delete':
                      _deletePayment(payment);
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

  // Remove old DataTable code - now using custom Row-based table

  void _navigateToNewPayment() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const NewPaymentPage(),
      ),
    ).then((_) => _loadPayments());
  }
}

// ============================================================================
// PAYMENT DETAILS DIALOG
// ============================================================================

class PaymentDetailsDialog extends StatelessWidget {
  final Map<String, dynamic> payment;

  const PaymentDetailsDialog({
    Key? key,
    required this.payment,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Payment #${payment['paymentNumber']}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Customer', payment['customerName'] ?? ''),
            _buildDetailRow(
              'Amount',
              '₹${payment['amount']?.toStringAsFixed(2) ?? '0.00'}',
            ),
            _buildDetailRow('Date', payment['date'] ?? ''),
            _buildDetailRow('Mode', payment['mode'] ?? ''),
            _buildDetailRow(
              'Reference',
              payment['referenceNumber'] ?? '-',
            ),
            _buildDetailRow('Invoice', payment['invoiceNumber'] ?? '-'),
            if (payment['hasProofs'] == true)
              _buildDetailRow(
                'Proofs',
                '${payment['proofsCount']} file(s) attached',
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
