// ============================================================================
// NEW PAYMENT PAGE - RECORD PAYMENT FORM
// ============================================================================
// File: lib/screens/billing/new_payment_page.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/services/billing_api_service.dart';
import '../../../../core/services/payment_service.dart';
import '../../../../core/services/invoice_service.dart';

class NewPaymentPage extends StatefulWidget {
  final String? invoiceId;
  final String? prefilledCustomerName;
  final double? prefilledAmount;

  const NewPaymentPage({
    Key? key,
    this.invoiceId,
    this.prefilledCustomerName,
    this.prefilledAmount,
  }) : super(key: key);

  @override
  State<NewPaymentPage> createState() => _NewPaymentPageState();
}

class _NewPaymentPageState extends State<NewPaymentPage> {
  final _formKey = GlobalKey<FormState>();
  
  // Controllers
  final _amountController = TextEditingController();
  final _bankChargesController = TextEditingController();
  final _paymentDateController = TextEditingController();
  final _paymentNumberController = TextEditingController();
  final _referenceController = TextEditingController();
  final _notesController = TextEditingController();
  
  // Dropdown values
  String? selectedCustomerId;
  String selectedCustomerName = '';
  String selectedPaymentMode = 'Cash';
  String selectedDepositTo = 'Petty Cash';
  String selectedTaxDeduction = 'No Tax deducted';
  bool sendThankYouNote = false;
  
  // Data
  List<BillingCustomer> customers = [];
  List<Invoice> unpaidInvoices = [];
  Map<String, double> invoicePayments = {}; // invoiceId -> payment amount
  bool isLoading = true;
  bool isLoadingInvoices = false;
  
  // Payment proof files
  List<PlatformFile> paymentProofFiles = [];
  
  // Dropdown options
  final List<String> paymentModes = [
    'Cash',
    'Bank Transfer',
    'Cheque',
    'UPI',
    'Card',
    'Online',
  ];
  
  final List<String> depositOptions = [
    'Petty Cash',
    'Bank Account - HDFC',
    'Bank Account - SBI',
    'Bank Account - ICICI',
    'Undeposited Funds',
  ];

  @override
  void initState() {
    super.initState();
    _paymentDateController.text = _formatDate(DateTime.now());
    _loadInitialData();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _bankChargesController.dispose();
    _paymentDateController.dispose();
    _paymentNumberController.dispose();
    _referenceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() => isLoading = true);
    
    try {
      // Load customers
      final customerResponse = await InvoiceService.getBillingCustomers(
        activeOnly: true,
        limit: 100,
      );
      
      setState(() {
        customers = customerResponse.customers;
        isLoading = false;
      });
      
      // Generate payment number
      await _generatePaymentNumber();
      
      // Prefill if coming from invoice
      if (widget.prefilledCustomerName != null) {
        _selectCustomerByName(widget.prefilledCustomerName!);
      }
      
      if (widget.prefilledAmount != null) {
        _amountController.text = widget.prefilledAmount!.toStringAsFixed(2);
      }
      
    } catch (e) {
      setState(() => isLoading = false);
      _showError('Failed to load data: $e');
    }
  }

  void _selectCustomerByName(String customerName) {
    final customer = customers.firstWhere(
      (c) => c.customerName == customerName,
      orElse: () => customers.first,
    );
    
    setState(() {
      selectedCustomerId = customer.id;
      selectedCustomerName = customer.customerName;
    });
    
    _loadUnpaidInvoices();
  }

  Future<void> _generatePaymentNumber() async {
    try {
      final nextNumber = await PaymentService.getNextPaymentNumber();
      setState(() {
        _paymentNumberController.text = nextNumber;
      });
    } catch (e) {
      print('Failed to generate payment number: $e');
      _paymentNumberController.text = '1';
    }
  }

  Future<void> _loadUnpaidInvoices() async {
    if (selectedCustomerId == null) return;
    
    setState(() => isLoadingInvoices = true);
    
    try {
      final response = await PaymentService.getUnpaidInvoices(selectedCustomerId!);
      
      setState(() {
        unpaidInvoices = response;
        isLoadingInvoices = false;
      });
    } catch (e) {
      setState(() => isLoadingInvoices = false);
      print('Failed to load unpaid invoices: $e');
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    
    if (date != null) {
      setState(() {
        _paymentDateController.text = _formatDate(date);
      });
    }
  }

  Future<void> _pickPaymentProofs() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
      );
      
      if (result != null) {
        // Check file count
        if (paymentProofFiles.length + result.files.length > 5) {
          _showError('Maximum 5 files allowed');
          return;
        }
        
        // Check file sizes
        for (var file in result.files) {
          if (file.size > 5 * 1024 * 1024) { // 5MB
            _showError('File ${file.name} exceeds 5MB limit');
            return;
          }
        }
        
        setState(() {
          paymentProofFiles.addAll(result.files);
        });
      }
    } catch (e) {
      _showError('Failed to pick files: $e');
    }
  }

  void _removePaymentProof(int index) {
    setState(() {
      paymentProofFiles.removeAt(index);
    });
  }

  double _calculateTotal() {
    double total = 0;
    for (var amount in invoicePayments.values) {
      total += amount;
    }
    return total;
  }

  double _calculateAmountReceived() {
    return double.tryParse(_amountController.text) ?? 0.0;
  }

  double _calculateBankCharges() {
    return double.tryParse(_bankChargesController.text) ?? 0.0;
  }

  double _calculateAmountInExcess() {
    final received = _calculateAmountReceived();
    final used = _calculateTotal();
    final charges = _calculateBankCharges();
    return received - used - charges;
  }

  Future<void> _savePayment() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    
    if (selectedCustomerId == null) {
      _showError('Please select a customer');
      return;
    }
    
    if (paymentProofFiles.isEmpty) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('No Payment Proof'),
          content: const Text(
            'No payment proof uploaded. It is recommended to upload payment proof for record keeping. Continue anyway?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3498DB),
              ),
              child: const Text('Continue'),
            ),
          ],
        ),
      );
      
      if (confirm != true) return;
    }
    
    try {
      // Show loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );
      
      // Prepare payment data
      final paymentData = {
        'customerId': selectedCustomerId,
        'customerName': selectedCustomerName,
        'amountReceived': _calculateAmountReceived(),
        'bankCharges': _calculateBankCharges(),
        'paymentDate': _paymentDateController.text,
        'paymentNumber': _paymentNumberController.text,
        'paymentMode': selectedPaymentMode,
        'depositTo': selectedDepositTo,
        'reference': _referenceController.text,
        'taxDeduction': selectedTaxDeduction,
        'notes': _notesController.text,
        'sendThankYouNote': sendThankYouNote,
        'invoicePayments': invoicePayments,
      };
      
      // Create payment with proofs
      await PaymentService.createPayment(
        paymentData,
        paymentProofFiles,
      );
      
      // Close loading
      Navigator.pop(context);
      
      // Show success
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payment recorded successfully'),
          backgroundColor: Colors.green,
        ),
      );
      
      // Go back
      Navigator.pop(context, true);
      
    } catch (e) {
      // Close loading
      Navigator.pop(context);
      _showError('Failed to save payment: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Record Payment'),
        backgroundColor: const Color(0xFF2C3E50),
        foregroundColor: Colors.white,
        elevation: 1,
        actions: [
          ElevatedButton.icon(
            onPressed: _savePayment,
            icon: const Icon(Icons.save, size: 18),
            label: const Text('Save Payment'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3498DB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main content area (left side)
                  Expanded(
                    flex: 3,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildCustomerSection(),
                          const SizedBox(height: 24),
                          _buildPaymentDetailsSection(),
                          const SizedBox(height: 24),
                          _buildUnpaidInvoicesSection(),
                          const SizedBox(height: 24),
                          _buildNotesSection(),
                          const SizedBox(height: 24),
                          _buildPaymentProofSection(),
                        ],
                      ),
                    ),
                  ),
                  
                  // Right sidebar - Summary
                  Container(
                    width: 350,
                    color: Colors.white,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Payment Summary',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2C3E50),
                            ),
                          ),
                          const SizedBox(height: 20),
                          _buildAmountCalculationsSection(),
                          const Divider(height: 32),
                          _buildAdditionalOptionsSection(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildCustomerSection() {
    return Container(
      padding: const EdgeInsets.all(20),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Customer Name',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                  color: Colors.black87,
                ),
              ),
              const Text(
                ' *',
                style: TextStyle(color: Colors.red, fontSize: 15),
              ),
              const Spacer(),
              if (selectedCustomerName.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF34495E),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    "$selectedCustomerName's Details",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: selectedCustomerId,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            hint: const Text('Select Customer'),
            items: customers.map((customer) => DropdownMenuItem(
              value: customer.id,
              child: Text(customer.customerName),
            )).toList(),
            onChanged: (value) {
              if (value != null) {
                final customer = customers.firstWhere((c) => c.id == value);
                setState(() {
                  selectedCustomerId = value;
                  selectedCustomerName = customer.customerName;
                });
                _loadUnpaidInvoices();
              }
            },
            validator: (value) => 
                value == null ? 'Please select a customer' : null,
          ),
          const SizedBox(height: 16),
          InkWell(
            onTap: () {
              // TODO: Add PAN functionality
            },
            child: const Text(
              'PAN: Add PAN',
              style: TextStyle(
                color: Color(0xFF3498DB),
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentDetailsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Amount Received
          _buildRequiredField(
            label: 'Amount Received',
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(4),
                      bottomLeft: Radius.circular(4),
                    ),
                  ),
                  child: const Text(
                    'INR',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
                Expanded(
                  child: TextFormField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: const BorderRadius.only(
                          topRight: Radius.circular(4),
                          bottomRight: Radius.circular(4),
                        ),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                    ),
                    validator: (value) {
                      if (value?.isEmpty == true) return 'Required';
                      if (double.tryParse(value!) == null) {
                        return 'Invalid amount';
                      }
                      return null;
                    },
                    onChanged: (value) => setState(() {}),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          
          // Bank Charges
          _buildOptionalField(
            label: 'Bank Charges (if any)',
            child: TextFormField(
              controller: _bankChargesController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 14,
                ),
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),
          const SizedBox(height: 20),
          
          // Payment Date
          _buildRequiredField(
            label: 'Payment Date',
            child: TextFormField(
              controller: _paymentDateController,
              readOnly: true,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 14,
                ),
                suffixIcon: const Icon(Icons.calendar_today, size: 20),
              ),
              onTap: _selectDate,
              validator: (value) => 
                  value?.isEmpty == true ? 'Required' : null,
            ),
          ),
          const SizedBox(height: 20),
          
          // Payment Number
          _buildRequiredField(
            label: 'Payment #',
            child: Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _paymentNumberController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                    ),
                    validator: (value) => 
                        value?.isEmpty == true ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () {
                    // Settings icon - could configure auto-generation
                  },
                  icon: const Icon(
                    Icons.settings,
                    color: Color(0xFF3498DB),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          
          // Payment Mode
          _buildOptionalField(
            label: 'Payment Mode',
            child: DropdownButtonFormField<String>(
              value: selectedPaymentMode,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              items: paymentModes.map((mode) => DropdownMenuItem(
                value: mode,
                child: Text(mode),
              )).toList(),
              onChanged: (value) => 
                  setState(() => selectedPaymentMode = value!),
            ),
          ),
          const SizedBox(height: 20),
          
          // Deposit To
          _buildRequiredField(
            label: 'Deposit To',
            child: DropdownButtonFormField<String>(
              value: selectedDepositTo,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              items: depositOptions.map((option) => DropdownMenuItem(
                value: option,
                child: Text(option),
              )).toList(),
              onChanged: (value) => 
                  setState(() => selectedDepositTo = value!),
              validator: (value) => 
                  value?.isEmpty == true ? 'Required' : null,
            ),
          ),
          const SizedBox(height: 20),
          
          // Reference
          _buildOptionalField(
            label: 'Reference#',
            child: TextFormField(
              controller: _referenceController,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 14,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          
          // Tax Deduction
          _buildOptionalField(
            label: 'Tax deducted?',
            child: Column(
              children: [
                RadioListTile<String>(
                  title: const Text('No Tax deducted'),
                  value: 'No Tax deducted',
                  groupValue: selectedTaxDeduction,
                  onChanged: (value) => 
                      setState(() => selectedTaxDeduction = value!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  title: const Text('Yes, TDS (Income Tax)'),
                  value: 'Yes, TDS (Income Tax)',
                  groupValue: selectedTaxDeduction,
                  onChanged: (value) => 
                      setState(() => selectedTaxDeduction = value!),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnpaidInvoicesSection() {
    return Container(
      padding: const EdgeInsets.all(20),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Unpaid Invoices',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              const Spacer(),
              OutlinedButton.icon(
                onPressed: () {
                  // TODO: Implement date range filter
                },
                icon: const Icon(Icons.date_range, size: 16),
                label: const Text('Filter by Date Range'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey[700],
                  side: BorderSide(color: Colors.grey[300]!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          if (isLoadingInvoices)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(),
              ),
            )
          else if (unpaidInvoices.isEmpty)
            Center(
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  Icon(
                    Icons.receipt_long,
                    size: 48,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'There are no unpaid invoices associated with this customer.',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '**List contains only SENT invoices',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columnSpacing: 20,
                headingRowColor: MaterialStateProperty.all(
                  Colors.grey[100],
                ),
                columns: const [
                  DataColumn(
                    label: Text(
                      'DATE',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'INVOICE NUMBER',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'INVOICE AMOUNT',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'AMOUNT DUE',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'PAYMENT',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
                rows: unpaidInvoices.map((invoice) {
                  final paymentAmount = 
                      invoicePayments[invoice.id] ?? 0.0;
                  return DataRow(
                    cells: [
                      DataCell(
                        Text(
                          DateFormat('dd/MM/yyyy').format(
                            invoice.invoiceDate,
                          ),
                        ),
                      ),
                      DataCell(
                        Text(
                          invoice.invoiceNumber,
                          style: const TextStyle(
                            color: Color(0xFF3498DB),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      DataCell(
                        Text(
                          '₹${invoice.totalAmount.toStringAsFixed(2)}',
                        ),
                      ),
                      DataCell(
                        Text(
                          '₹${invoice.amountDue.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      DataCell(
                        SizedBox(
                          width: 120,
                          child: TextFormField(
                            initialValue: paymentAmount > 0 
                                ? paymentAmount.toStringAsFixed(2) 
                                : '',
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 8,
                              ),
                              hintText: '0.00',
                            ),
                            onChanged: (value) {
                              final amount = double.tryParse(value) ?? 0.0;
                              setState(() {
                                if (amount > 0) {
                                  invoicePayments[invoice.id] = amount;
                                } else {
                                  invoicePayments.remove(invoice.id);
                                }
                              });
                            },
                          ),
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

  Widget _buildAmountCalculationsSection() {
    final total = _calculateTotal();
    final amountReceived = _calculateAmountReceived();
    final bankCharges = _calculateBankCharges();
    final amountInExcess = _calculateAmountInExcess();
    
    return Column(
      children: [
        _buildAmountRow('Total', total.toStringAsFixed(2)),
        _buildAmountRow(
          'Amount Received :',
          amountReceived.toStringAsFixed(2),
        ),
        _buildAmountRow(
          'Bank Charges :',
          bankCharges.toStringAsFixed(2),
        ),
        _buildAmountRow(
          'Amount used for Payments :',
          total.toStringAsFixed(2),
        ),
        _buildAmountRow('Amount Refunded :', '0.00'),
        const Divider(height: 32),
        _buildAmountRow(
          'Amount in Excess:',
          '₹  ${amountInExcess.toStringAsFixed(2)}',
          isTotal: true,
          isNegative: amountInExcess < 0,
        ),
      ],
    );
  }

  Widget _buildAmountRow(
    String label,
    String amount, {
    bool isTotal = false,
    bool isNegative = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.w600 : FontWeight.normal,
              fontSize: isTotal ? 16 : 14,
              color: Colors.black87,
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.w600 : FontWeight.w500,
              fontSize: isTotal ? 16 : 14,
              color: isTotal
                  ? (isNegative ? Colors.red : const Color(0xFF27AE60))
                  : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesSection() {
    return Container(
      padding: const EdgeInsets.all(20),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Notes (Internal use. Not visible to customer)',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _notesController,
            maxLines: 4,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              contentPadding: const EdgeInsets.all(12),
              hintText: 'Add internal notes about this payment...',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentProofSection() {
    return Container(
      padding: const EdgeInsets.all(20),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Payment Proof Attachments',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'You can upload a maximum of 5 files, 5MB each (JPG, PNG, PDF)',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),
          
          // Upload button
          OutlinedButton.icon(
            onPressed: _pickPaymentProofs,
            icon: const Icon(Icons.attach_file),
            label: const Text('Choose Files'),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF3498DB),
              side: const BorderSide(color: Color(0xFF3498DB)),
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
          ),
          
          // Display selected files
          if (paymentProofFiles.isNotEmpty) ...[
            const SizedBox(height: 16),
            ...paymentProofFiles.asMap().entries.map((entry) {
              final index = entry.key;
              final file = entry.value;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Row(
                  children: [
                    Icon(
                      file.extension == 'pdf' 
                          ? Icons.picture_as_pdf 
                          : Icons.image,
                      color: const Color(0xFF3498DB),
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            file.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${(file.size / 1024).toStringAsFixed(1)} KB',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => _removePaymentProof(index),
                      icon: const Icon(Icons.close, size: 20),
                      color: Colors.red,
                    ),
                  ],
                ),
              );
            }).toList(),
          ],
        ],
      ),
    );
  }

  Widget _buildAdditionalOptionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Additional Options',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2C3E50),
          ),
        ),
        const SizedBox(height: 16),
        CheckboxListTile(
          title: const Text(
            'Send a "Thank you" note for this payment',
            style: TextStyle(fontSize: 14),
          ),
          value: sendThankYouNote,
          onChanged: (value) => 
              setState(() => sendThankYouNote = value!),
          contentPadding: EdgeInsets.zero,
          controlAffinity: ListTileControlAffinity.leading,
        ),
        const SizedBox(height: 16),
        Text(
          'Additional Fields: Start adding custom fields for your payments received by going to Settings → Sales → Payments Received.',
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildRequiredField({
    required String label,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: Colors.black87,
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(color: Colors.red, fontSize: 14),
            ),
          ],
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }

  Widget _buildOptionalField({
    required String label,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}
