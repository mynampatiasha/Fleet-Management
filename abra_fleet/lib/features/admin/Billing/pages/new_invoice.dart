// ============================================================================
// NEW INVOICE SCREEN - Complete Flutter UI
// ============================================================================
// File: lib/screens/billing/new_invoice.dart
// Matches Zoho Books functionality exactly
// Complete Step 1-9 flow implementation
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../../../core/services/invoice_service.dart';

class NewInvoiceScreen extends StatefulWidget {
  final String? invoiceId; // For edit mode

  const NewInvoiceScreen({Key? key, this.invoiceId}) : super(key: key);

  @override
  State<NewInvoiceScreen> createState() => _NewInvoiceScreenState();
}

class _NewInvoiceScreenState extends State<NewInvoiceScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isSaving = false;

  // Controllers
  final _orderNumberController = TextEditingController();
  final _subjectController = TextEditingController();
  final _customerNotesController = TextEditingController();
  final _termsConditionsController = TextEditingController();

  // Form Data
  String? _selectedCustomerId;
  String? _selectedCustomerName;
  String? _selectedCustomerEmail;
  DateTime _invoiceDate = DateTime.now();
  String _selectedTerms = 'Net 30';
  DateTime? _dueDate;
  String? _salesperson;
  
  // Tax Settings
  double _tdsRate = 0;
  double _tcsRate = 0;
  double _gstRate = 18;
  bool _enableTDS = false;
  bool _enableTCS = false;
  bool _enableGST = true;

  // Items List
  List<InvoiceItem> _items = [];

  // Calculations
  double _subTotal = 0;
  double _tdsAmount = 0;
  double _tcsAmount = 0;
  double _gstAmount = 0;
  double _totalAmount = 0;
  int _totalQuantity = 0;

  // Dropdown options
  final List<String> _termsOptions = [
    'Due on Receipt',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60'
  ];

  @override
  void initState() {
    super.initState();
    _calculateDueDate();
    _addNewItem(); // Add first empty item
    
    if (widget.invoiceId != null) {
      _loadInvoiceData();
    }
  }

  @override
  void dispose() {
    _orderNumberController.dispose();
    _subjectController.dispose();
    _customerNotesController.dispose();
    _termsConditionsController.dispose();
    super.dispose();
  }

  // Calculate due date based on terms
  void _calculateDueDate() {
    switch (_selectedTerms) {
      case 'Due on Receipt':
        _dueDate = _invoiceDate;
        break;
      case 'Net 15':
        _dueDate = _invoiceDate.add(const Duration(days: 15));
        break;
      case 'Net 30':
        _dueDate = _invoiceDate.add(const Duration(days: 30));
        break;
      case 'Net 45':
        _dueDate = _invoiceDate.add(const Duration(days: 45));
        break;
      case 'Net 60':
        _dueDate = _invoiceDate.add(const Duration(days: 60));
        break;
    }
  }

  // Calculate all amounts
  void _calculateAmounts() {
    setState(() {
      // Calculate subtotal and quantity
      _subTotal = 0;
      _totalQuantity = 0;
      
      for (var item in _items) {
        if (item.quantity > 0 && item.rate > 0) {
          double itemAmount = item.quantity * item.rate;
          
          // Apply discount
          if (item.discount > 0) {
            if (item.discountType == 'percentage') {
              itemAmount = itemAmount - (itemAmount * item.discount / 100);
            } else {
              itemAmount = itemAmount - item.discount;
            }
          }
          
          item.amount = itemAmount;
          _subTotal += itemAmount;
          _totalQuantity += item.quantity.toInt();
        }
      }
      
      // Calculate TDS (reduces total)
      _tdsAmount = _enableTDS ? (_subTotal * _tdsRate / 100) : 0;
      
      // Calculate TCS (increases total)
      _tcsAmount = _enableTCS ? (_subTotal * _tcsRate / 100) : 0;
      
      // Calculate GST on adjusted base
      double gstBase = _subTotal - _tdsAmount + _tcsAmount;
      _gstAmount = _enableGST ? (gstBase * _gstRate / 100) : 0;
      
      // Calculate total
      _totalAmount = _subTotal - _tdsAmount + _tcsAmount + _gstAmount;
    });
  }

  // Add new item row
  void _addNewItem() {
    setState(() {
      _items.add(InvoiceItem());
    });
  }

  // Remove item
  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
      _calculateAmounts();
    });
  }

  // Load invoice data for editing
  Future<void> _loadInvoiceData() async {
    setState(() => _isLoading = true);
    
    try {
      final invoice = await InvoiceService.getInvoice(widget.invoiceId!);
      
      setState(() {
        _selectedCustomerId = invoice.customerId;
        _selectedCustomerName = invoice.customerName;
        _selectedCustomerEmail = invoice.customerEmail;
        _orderNumberController.text = invoice.orderNumber ?? '';
        _invoiceDate = invoice.invoiceDate;
        _selectedTerms = invoice.terms;
        _dueDate = invoice.dueDate;
        _salesperson = invoice.salesperson;
        _subjectController.text = invoice.subject ?? '';
        _customerNotesController.text = invoice.customerNotes ?? '';
        _termsConditionsController.text = invoice.termsAndConditions ?? '';
        
        // Load tax settings
        _tdsRate = invoice.tdsRate;
        _tcsRate = invoice.tcsRate;
        _gstRate = invoice.gstRate;
        _enableTDS = invoice.tdsRate > 0;
        _enableTCS = invoice.tcsRate > 0;
        _enableGST = invoice.gstRate > 0;
        
        // Load items
        _items = invoice.items.map((item) => InvoiceItem(
          itemDetails: item.itemDetails,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          discountType: item.discountType,
          amount: item.amount,
        )).toList();
        
        _calculateAmounts();
      });
      
    } catch (e) {
      _showErrorSnackbar('Failed to load invoice: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveAsDraft() async {
  if (!_formKey.currentState!.validate()) return;
  
  if (_selectedCustomerId == null) {
    _showErrorSnackbar('Please select a customer');
    return;
  }
  
  // ✅ NEW: Validate items before saving
  if (!_validateItems()) {
    return;
  }
  
  setState(() => _isSaving = true);
  
  try {
    final invoiceData = _buildInvoiceData('DRAFT');
    
    Invoice invoice;
    if (widget.invoiceId != null) {
      invoice = await InvoiceService.updateInvoice(widget.invoiceId!, invoiceData);
    } else {
      invoice = await InvoiceService.createInvoice(invoiceData);
    }
    
    _showSuccessSnackbar('Invoice saved as draft');
    Navigator.pop(context, true);
    
  } catch (e) {
    // ✅ IMPROVED: Better error message extraction
    String errorMessage = 'Failed to save invoice';
    
    if (e.toString().contains('validation failed')) {
      // Extract the specific validation error
      final match = RegExp(r'Path `(\w+)` is required').firstMatch(e.toString());
      if (match != null) {
        errorMessage = 'Please fill in required field: ${match.group(1)}';
      } else {
        errorMessage = 'Please check all required fields';
      }
    } else if (e.toString().contains('Invoice validation failed')) {
      errorMessage = e.toString().split('error":"')[1].split('"')[0];
    } else {
      errorMessage = e.toString();
    }
    
    _showErrorSnackbar(errorMessage);
  } finally {
    setState(() => _isSaving = false);
  }
}

  // Save and send
  Future<void> _saveAndSend() async {
  if (!_formKey.currentState!.validate()) return;
  
  if (_selectedCustomerId == null) {
    _showErrorSnackbar('Please select a customer');
    return;
  }
  
  if (_selectedCustomerEmail == null || _selectedCustomerEmail!.isEmpty) {
    _showErrorSnackbar('Customer email is required to send invoice');
    return;
  }
  
  // ✅ NEW: Validate items before saving
  if (!_validateItems()) {
    return;
  }
  
  setState(() => _isSaving = true);
  
  try {
    final invoiceData = _buildInvoiceData('SENT');
    
    Invoice invoice;
    if (widget.invoiceId != null) {
      invoice = await InvoiceService.updateInvoice(widget.invoiceId!, invoiceData);
    } else {
      invoice = await InvoiceService.createInvoice(invoiceData);
    }
    
    // Send the invoice
    await InvoiceService.sendInvoice(invoice.id);
    
    _showSuccessSnackbar('Invoice sent to $_selectedCustomerEmail');
    Navigator.pop(context, true);
    
  } catch (e) {
    // ✅ IMPROVED: Better error message extraction
    String errorMessage = 'Failed to send invoice';
    
    if (e.toString().contains('validation failed')) {
      final match = RegExp(r'Path `(\w+)` is required').firstMatch(e.toString());
      if (match != null) {
        errorMessage = 'Please fill in required field: ${match.group(1)}';
      } else {
        errorMessage = 'Please check all required fields';
      }
    } else if (e.toString().contains('Invoice validation failed')) {
      errorMessage = e.toString().split('error":"')[1].split('"')[0];
    } else {
      errorMessage = e.toString();
    }
    
    _showErrorSnackbar(errorMessage);
  } finally {
    setState(() => _isSaving = false);
  }
}

  // Mark as paid immediately
  Future<void> _markAsPaid() async {
  if (!_formKey.currentState!.validate()) return;
  
  if (_selectedCustomerId == null) {
    _showErrorSnackbar('Please select a customer');
    return;
  }
  
  // ✅ NEW: Validate items before saving
  if (!_validateItems()) {
    return;
  }
  
  setState(() => _isSaving = true);
  
  try {
    final invoiceData = _buildInvoiceData('PAID');
    
    Invoice invoice;
    if (widget.invoiceId != null) {
      invoice = await InvoiceService.updateInvoice(widget.invoiceId!, invoiceData);
    } else {
      invoice = await InvoiceService.createInvoice(invoiceData);
    }
    
    // Record payment immediately
    final paymentData = {
      'amount': _totalAmount,
      'paymentDate': DateTime.now().toIso8601String(),
      'paymentMethod': 'Cash',
      'notes': 'Payment received at time of invoice creation',
    };
    
    await InvoiceService.recordPayment(invoice.id, paymentData);
    
    _showSuccessSnackbar('Invoice created and marked as paid');
    Navigator.pop(context, true);
    
  } catch (e) {
    // ✅ IMPROVED: Better error message extraction
    String errorMessage = 'Failed to create paid invoice';
    
    if (e.toString().contains('validation failed')) {
      final match = RegExp(r'Path `(\w+)` is required').firstMatch(e.toString());
      if (match != null) {
        errorMessage = 'Please fill in required field: ${match.group(1)}';
      } else {
        errorMessage = 'Please check all required fields';
      }
    } else if (e.toString().contains('Invoice validation failed')) {
      errorMessage = e.toString().split('error":"')[1].split('"')[0];
    } else {
      errorMessage = e.toString();
    }
    
    _showErrorSnackbar(errorMessage);
  } finally {
    setState(() => _isSaving = false);
  }
}

  // Build invoice data object
Map<String, dynamic> _buildInvoiceData(String status) {
  // ✅ FIX 1: Filter out empty items
  final validItems = _items
      .where((item) => item.itemDetails.trim().isNotEmpty)
      .toList();
  
  // ✅ FIX 2: Validate at least one item exists
  if (validItems.isEmpty) {
    throw Exception('Please add at least one item with details');
  }
  
  // ✅ FIX 3: Validate items have quantity and rate
  for (var item in validItems) {
    if (item.quantity <= 0) {
      throw Exception('All items must have quantity greater than 0');
    }
    if (item.rate <= 0) {
      throw Exception('All items must have rate greater than 0');
    }
  }
  
  return {
    'customerId': _selectedCustomerId,
    'customerName': _selectedCustomerName,
    'customerEmail': _selectedCustomerEmail,
    'orderNumber': _orderNumberController.text.trim(),
    'invoiceDate': _invoiceDate.toIso8601String(),
    'terms': _selectedTerms,
    'dueDate': _dueDate?.toIso8601String(),
    'salesperson': _salesperson,
    'subject': _subjectController.text.trim(),
    'items': validItems.map((item) => item.toJson()).toList(),  // ✅ Use filtered items
    'customerNotes': _customerNotesController.text.trim(),
    'termsAndConditions': _termsConditionsController.text.trim(),
    'tdsRate': _enableTDS ? _tdsRate : 0,
    'tcsRate': _enableTCS ? _tcsRate : 0,
    'gstRate': _enableGST ? _gstRate : 0,
    'status': status,
  };
}

// FIX 2: Add validation check before building invoice data
// ============================================================================
// Add this method to validate items before saving
bool _validateItems() {
  // Check if there's at least one non-empty item
  final nonEmptyItems = _items.where((item) => item.itemDetails.trim().isNotEmpty).toList();
  
  if (nonEmptyItems.isEmpty) {
    _showErrorSnackbar('Please add at least one item with details');
    return false;
  }
  
  // Validate each non-empty item has quantity and rate
  for (var item in nonEmptyItems) {
    if (item.quantity <= 0) {
      _showErrorSnackbar('All items must have quantity greater than 0');
      return false;
    }
    if (item.rate <= 0) {
      _showErrorSnackbar('All items must have rate greater than 0');
      return false;
    }
  }
  
  return true;
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

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(widget.invoiceId != null ? 'Edit Invoice' : 'New Invoice'),
        backgroundColor: const Color(0xFF2C3E50),
        foregroundColor: Colors.white,
        actions: [
          // Save as Draft button
          TextButton.icon(
            onPressed: _isSaving ? null : _saveAsDraft,
            icon: const Icon(Icons.save_outlined, color: Colors.white70),
            label: const Text(
              'Save as Draft',
              style: TextStyle(color: Colors.white70),
            ),
          ),
          const SizedBox(width: 8),
          // Mark as Paid button
          TextButton.icon(
            onPressed: _isSaving ? null : _markAsPaid,
            icon: const Icon(Icons.payment, color: Colors.white70),
            label: const Text(
              'Mark as Paid',
              style: TextStyle(color: Colors.white70),
            ),
          ),
          const SizedBox(width: 8),
          // Save & Send button
          ElevatedButton.icon(
            onPressed: _isSaving ? null : _saveAndSend,
            icon: const Icon(Icons.send, size: 18),
            label: const Text('Save & Send'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3498DB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main content area
                  Expanded(
                    flex: 3,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildCustomerSection(),
                          const SizedBox(height: 24),
                          _buildInvoiceDetailsSection(),
                          const SizedBox(height: 24),
                          _buildItemsSection(),
                          const SizedBox(height: 24),
                          _buildNotesSection(),
                          const SizedBox(height: 24),
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
                          _buildTaxSettingsSection(),
                          const Divider(height: 32),
                          _buildSummarySection(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  // Customer Section
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
          const Text(
            'Customer Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 16),
          
          // Customer Selector
          InkWell(
            onTap: () => _showCustomerSelector(),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.person_outline, color: Color(0xFF3498DB)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _selectedCustomerName ?? 'Select Customer *',
                      style: TextStyle(
                        fontSize: 16,
                        color: _selectedCustomerName != null
                            ? const Color(0xFF2C3E50)
                            : Colors.grey[600],
                        fontWeight: _selectedCustomerName != null
                            ? FontWeight.w500
                            : FontWeight.normal,
                      ),
                    ),
                  ),
                  const Icon(Icons.arrow_drop_down, color: Colors.grey),
                ],
              ),
            ),
          ),
          
          if (_selectedCustomerEmail != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.email_outlined, size: 18, color: Colors.grey),
                const SizedBox(width: 8),
                Text(
                  _selectedCustomerEmail!,
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // Invoice Details Section
  Widget _buildInvoiceDetailsSection() {
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
            'Invoice Details',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              // Order Number
              Expanded(
                child: TextFormField(
                  controller: _orderNumberController,
                  decoration: InputDecoration(
                    labelText: 'Order Number',
                    hintText: 'Optional',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.numbers),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              
              // Invoice Date
              Expanded(
                child: InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: _invoiceDate,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                    );
                    if (date != null) {
                      setState(() {
                        _invoiceDate = date;
                        _calculateDueDate();
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: 'Invoice Date *',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      prefixIcon: const Icon(Icons.calendar_today),
                    ),
                    child: Text(
                      DateFormat('dd MMM yyyy').format(_invoiceDate),
                    ),
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          Row(
            children: [
              // Payment Terms
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedTerms,
                  decoration: InputDecoration(
                    labelText: 'Payment Terms *',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.payment),
                  ),
                  items: _termsOptions.map((term) {
                    return DropdownMenuItem(value: term, child: Text(term));
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedTerms = value!;
                      _calculateDueDate();
                    });
                  },
                ),
              ),
              const SizedBox(width: 16),
              
              // Due Date (auto-calculated)
              Expanded(
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Due Date',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.event),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  child: Text(
                    _dueDate != null
                        ? DateFormat('dd MMM yyyy').format(_dueDate!)
                        : '-',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Subject
          TextFormField(
            controller: _subjectController,
            decoration: InputDecoration(
              labelText: 'Subject',
              hintText: 'Optional',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              prefixIcon: const Icon(Icons.subject),
            ),
            maxLines: 2,
          ),
        ],
      ),
    );
  }

  // Items Section
  Widget _buildItemsSection() {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Items',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C3E50),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _addNewItem,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Item'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3498DB),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Items Table Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF34495E),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: const [
                Expanded(
                  flex: 3,
                  child: Text(
                    'ITEM DETAILS',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                SizedBox(width: 8),
                SizedBox(
                  width: 80,
                  child: Text(
                    'QTY',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(width: 8),
                SizedBox(
                  width: 100,
                  child: Text(
                    'RATE (₹)',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ),
                SizedBox(width: 8),
                SizedBox(
                  width: 100,
                  child: Text(
                    'DISCOUNT',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ),
                SizedBox(width: 8),
                SizedBox(
                  width: 120,
                  child: Text(
                    'AMOUNT (₹)',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ),
                SizedBox(width: 50),
              ],
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Items List
          if (_items.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No items added yet',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _items.length,
              separatorBuilder: (context, index) => const Divider(height: 16),
              itemBuilder: (context, index) {
                return _buildItemRow(index);
              },
            ),
        ],
      ),
    );
  }

  // Single Item Row
  Widget _buildItemRow(int index) {
    final item = _items[index];
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Item Details
        Expanded(
          flex: 3,
          child: TextFormField(
            initialValue: item.itemDetails,
            decoration: InputDecoration(
              hintText: 'Enter item description',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            maxLines: 2,
            onChanged: (value) {
              item.itemDetails = value;
            },
          ),
        ),
        
        const SizedBox(width: 8),
        
        // Quantity
        SizedBox(
          width: 80,
          child: TextFormField(
            initialValue: item.quantity > 0 ? item.quantity.toString() : '',
            decoration: InputDecoration(
              hintText: '0',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onChanged: (value) {
              item.quantity = double.tryParse(value) ?? 0;
              _calculateAmounts();
            },
          ),
        ),
        
        const SizedBox(width: 8),
        
        // Rate
        SizedBox(
          width: 100,
          child: TextFormField(
            initialValue: item.rate > 0 ? item.rate.toStringAsFixed(2) : '',
            decoration: InputDecoration(
              hintText: '0.00',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            textAlign: TextAlign.right,
            onChanged: (value) {
              item.rate = double.tryParse(value) ?? 0;
              _calculateAmounts();
            },
          ),
        ),
        
        const SizedBox(width: 8),
        
        // Discount
        SizedBox(
          width: 100,
          child: Row(
            children: [
              Expanded(
                child: TextFormField(
                  initialValue: item.discount > 0 ? item.discount.toString() : '',
                  decoration: InputDecoration(
                    hintText: '0',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 12,
                    ),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  textAlign: TextAlign.right,
                  onChanged: (value) {
                    item.discount = double.tryParse(value) ?? 0;
                    _calculateAmounts();
                  },
                ),
              ),
              PopupMenuButton<String>(
                initialValue: item.discountType,
                icon: const Icon(Icons.arrow_drop_down, size: 20),
                onSelected: (value) {
                  setState(() {
                    item.discountType = value;
                    _calculateAmounts();
                  });
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'percentage', child: Text('%')),
                  const PopupMenuItem(value: 'amount', child: Text('₹')),
                ],
              ),
            ],
          ),
        ),
        
        const SizedBox(width: 8),
        
        // Amount (calculated)
        Container(
          width: 120,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: Text(
            item.amount.toStringAsFixed(2),
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
            textAlign: TextAlign.right,
          ),
        ),
        
        const SizedBox(width: 8),
        
        // Delete button
        IconButton(
          icon: const Icon(Icons.delete_outline, color: Colors.red),
          onPressed: () => _removeItem(index),
          tooltip: 'Remove item',
        ),
      ],
    );
  }

  // Notes Section
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
            'Additional Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 16),
          
          // Customer Notes
          TextFormField(
            controller: _customerNotesController,
            decoration: InputDecoration(
              labelText: 'Customer Notes',
              hintText: 'Notes visible on invoice',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              alignLabelWithHint: true,
            ),
            maxLines: 3,
          ),
          
          const SizedBox(height: 16),
          
          // Terms & Conditions
          TextFormField(
            controller: _termsConditionsController,
            decoration: InputDecoration(
              labelText: 'Terms & Conditions',
              hintText: 'Payment terms, policies, etc.',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              alignLabelWithHint: true,
            ),
            maxLines: 3,
          ),
        ],
      ),
    );
  }

  // Tax Settings Section (Right Sidebar)
  Widget _buildTaxSettingsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tax Settings',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2C3E50),
          ),
        ),
        const SizedBox(height: 16),
        
        // GST Toggle
        SwitchListTile(
          title: const Text('Enable GST'),
          value: _enableGST,
          activeColor: const Color(0xFF3498DB),
          contentPadding: EdgeInsets.zero,
          onChanged: (value) {
            setState(() {
              _enableGST = value;
              _calculateAmounts();
            });
          },
        ),
        
        if (_enableGST) ...[
          const SizedBox(height: 8),
          TextFormField(
            initialValue: _gstRate.toString(),
            decoration: InputDecoration(
              labelText: 'GST Rate (%)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              suffixText: '%',
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (value) {
              setState(() {
                _gstRate = double.tryParse(value) ?? 18;
                _calculateAmounts();
              });
            },
          ),
        ],
        
        const SizedBox(height: 16),
        
        // TDS Toggle
        SwitchListTile(
          title: const Text('Enable TDS'),
          subtitle: const Text('Tax Deducted at Source', style: TextStyle(fontSize: 12)),
          value: _enableTDS,
          activeColor: const Color(0xFF3498DB),
          contentPadding: EdgeInsets.zero,
          onChanged: (value) {
            setState(() {
              _enableTDS = value;
              _calculateAmounts();
            });
          },
        ),
        
        if (_enableTDS) ...[
          const SizedBox(height: 8),
          TextFormField(
            initialValue: _tdsRate.toString(),
            decoration: InputDecoration(
              labelText: 'TDS Rate (%)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              suffixText: '%',
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (value) {
              setState(() {
                _tdsRate = double.tryParse(value) ?? 0;
                _calculateAmounts();
              });
            },
          ),
        ],
        
        const SizedBox(height: 16),
        
        // TCS Toggle
        SwitchListTile(
          title: const Text('Enable TCS'),
          subtitle: const Text('Tax Collected at Source', style: TextStyle(fontSize: 12)),
          value: _enableTCS,
          activeColor: const Color(0xFF3498DB),
          contentPadding: EdgeInsets.zero,
          onChanged: (value) {
            setState(() {
              _enableTCS = value;
              _calculateAmounts();
            });
          },
        ),
        
        if (_enableTCS) ...[
          const SizedBox(height: 8),
          TextFormField(
            initialValue: _tcsRate.toString(),
            decoration: InputDecoration(
              labelText: 'TCS Rate (%)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              suffixText: '%',
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (value) {
              setState(() {
                _tcsRate = double.tryParse(value) ?? 0;
                _calculateAmounts();
              });
            },
          ),
        ],
      ],
    );
  }

  // Summary Section (Right Sidebar)
  Widget _buildSummarySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Invoice Summary',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2C3E50),
          ),
        ),
        const SizedBox(height: 16),
        
        // Sub Total
        _buildSummaryRow('Sub Total:', _subTotal, isBold: false),
        
        const SizedBox(height: 8),
        
        // TDS (if enabled)
        if (_enableTDS && _tdsAmount > 0) ...[
          _buildSummaryRow(
            'TDS (${_tdsRate.toStringAsFixed(1)}%):',
            -_tdsAmount,
            color: Colors.red[700],
            isBold: false,
          ),
          const SizedBox(height: 8),
        ],
        
        // TCS (if enabled)
        if (_enableTCS && _tcsAmount > 0) ...[
          _buildSummaryRow(
            'TCS (${_tcsRate.toStringAsFixed(1)}%):',
            _tcsAmount,
            isBold: false,
          ),
          const SizedBox(height: 8),
        ],
        
        // GST (if enabled)
        if (_enableGST && _gstAmount > 0) ...[
          _buildSummaryRow(
            'CGST (${(_gstRate / 2).toStringAsFixed(1)}%):',
            _gstAmount / 2,
            isBold: false,
          ),
          const SizedBox(height: 8),
          _buildSummaryRow(
            'SGST (${(_gstRate / 2).toStringAsFixed(1)}%):',
            _gstAmount / 2,
            isBold: false,
          ),
          const SizedBox(height: 8),
        ],
        
        const Divider(thickness: 2),
        const SizedBox(height: 8),
        
        // Total
        _buildSummaryRow('Total Amount:', _totalAmount, isBold: true, isTotal: true),
        
        const SizedBox(height: 16),
        
        // Additional info
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Quantity:',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF34495E),
                    ),
                  ),
                  Text(
                    _totalQuantity.toString(),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF34495E),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Items:',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF34495E),
                    ),
                  ),
                  Text(
                    _items.where((item) => item.itemDetails.isNotEmpty).length.toString(),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF34495E),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Action buttons (full width)
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _isSaving ? null : _saveAndSend,
            icon: _isSaving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.send),
            label: Text(_isSaving ? 'Sending...' : 'Save & Send Invoice'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF27AE60),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        
        const SizedBox(height: 12),
        
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _isSaving ? null : _saveAsDraft,
            icon: const Icon(Icons.save_outlined),
            label: const Text('Save as Draft'),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF3498DB),
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: const BorderSide(color: Color(0xFF3498DB)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        
        const SizedBox(height: 12),
        
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _isSaving ? null : _markAsPaid,
            icon: const Icon(Icons.payment),
            label: const Text('Mark as Paid'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF27AE60),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(
    String label,
    double amount, {
    Color? color,
    bool isBold = false,
    bool isTotal = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isBold || isTotal ? FontWeight.bold : FontWeight.normal,
            color: color ?? (isTotal ? const Color(0xFF2C3E50) : const Color(0xFF7F8C8D)),
          ),
        ),
        Text(
          '${amount < 0 ? '-' : ''}₹${amount.abs().toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isBold || isTotal ? FontWeight.bold : FontWeight.w500,
            color: color ?? (isTotal ? const Color(0xFF27AE60) : const Color(0xFF2C3E50)),
          ),
        ),
      ],
    );
  }

  // Show customer selector dialog
  Future<void> _showCustomerSelector() async {
    final TextEditingController searchController = TextEditingController();
    List<BillingCustomer> customers = [];
    List<BillingCustomer> filteredCustomers = [];
    bool isLoading = true;
    String? errorMessage;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          
          // Load customers when dialog opens
          if (isLoading && customers.isEmpty) {
            InvoiceService.getBillingCustomers().then((response) {
              setDialogState(() {
                customers = response.customers;
                filteredCustomers = customers;
                isLoading = false;
              });
            }).catchError((error) {
              setDialogState(() {
                errorMessage = error.toString();
                isLoading = false;
              });
            });
          }
          
          return AlertDialog(
            title: const Text('Select Customer'),
            content: SizedBox(
              width: 500,
              height: 400,
              child: Column(
                children: [
                  // Search bar
                  TextField(
                    controller: searchController,
                    decoration: InputDecoration(
                      hintText: 'Search customers...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    onChanged: (value) {
                      setDialogState(() {
                        if (value.isEmpty) {
                          filteredCustomers = customers;
                        } else {
                          filteredCustomers = customers.where((customer) {
                            return customer.customerName.toLowerCase().contains(value.toLowerCase()) ||
                                   customer.customerEmail.toLowerCase().contains(value.toLowerCase()) ||
                                   (customer.companyName?.toLowerCase().contains(value.toLowerCase()) ?? false);
                          }).toList();
                        }
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Customer list
                  Expanded(
                    child: isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : errorMessage != null
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.error_outline, size: 48, color: Colors.red[400]),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Error loading customers',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.red[700],
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      errorMessage!,
                                      style: TextStyle(color: Colors.grey[600]),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 16),
                                    ElevatedButton(
                                      onPressed: () {
                                        setDialogState(() {
                                          isLoading = true;
                                          errorMessage = null;
                                        });
                                      },
                                      child: const Text('Retry'),
                                    ),
                                  ],
                                ),
                              )
                            : filteredCustomers.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No customers found',
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: filteredCustomers.length,
                                    itemBuilder: (context, index) {
                                      final customer = filteredCustomers[index];
                                      return ListTile(
                                        leading: CircleAvatar(
                                          backgroundColor: const Color(0xFF3498DB),
                                          child: Text(
                                            customer.customerName[0].toUpperCase(),
                                            style: const TextStyle(color: Colors.white),
                                          ),
                                        ),
                                        title: Text(customer.customerName),
                                        subtitle: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(customer.customerEmail),
                                            if (customer.companyName != null)
                                              Text(
                                                customer.companyName!,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                  fontStyle: FontStyle.italic,
                                                ),
                                              ),
                                            Text(
                                              customer.customerPhone,
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                          ],
                                        ),
                                        onTap: () {
                                          setState(() {
                                            _selectedCustomerId = customer.id;
                                            _selectedCustomerName = customer.customerName;
                                            _selectedCustomerEmail = customer.customerEmail;
                                          });
                                          Navigator.pop(context);
                                        },
                                      );
                                    },
                                  ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Add new customer button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _showAddCustomerDialog();
                      },
                      icon: const Icon(Icons.add),
                      label: const Text('Add New Customer'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF3498DB),
                        side: const BorderSide(color: Color(0xFF3498DB)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
            ],
          );
        },
      ),
    );
  }

  // Show add customer dialog
  Future<void> _showAddCustomerDialog() async {
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    final companyController = TextEditingController();
    final gstController = TextEditingController();
    final streetController = TextEditingController();
    final cityController = TextEditingController();
    final stateController = TextEditingController();
    final pincodeController = TextEditingController();
    final notesController = TextEditingController();
    
    bool isCreating = false;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Add New Customer'),
            content: SizedBox(
              width: 500,
              height: 600,
              child: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Basic Information
                      const Text(
                        'Basic Information',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2C3E50),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: nameController,
                        decoration: InputDecoration(
                          labelText: 'Customer Name *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.person),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Customer name is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: emailController,
                        decoration: InputDecoration(
                          labelText: 'Email Address *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.email),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Email address is required';
                          }
                          if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                            return 'Please enter a valid email address';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: phoneController,
                        decoration: InputDecoration(
                          labelText: 'Phone Number *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.phone),
                        ),
                        keyboardType: TextInputType.phone,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Phone number is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: companyController,
                        decoration: InputDecoration(
                          labelText: 'Company Name',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.business),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: gstController,
                        decoration: InputDecoration(
                          labelText: 'GST Number',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.receipt_long),
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Address Information
                      const Text(
                        'Billing Address',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2C3E50),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: streetController,
                        decoration: InputDecoration(
                          labelText: 'Street Address',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.location_on),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 12),
                      
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: cityController,
                              decoration: InputDecoration(
                                labelText: 'City',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: stateController,
                              decoration: InputDecoration(
                                labelText: 'State',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: pincodeController,
                        decoration: InputDecoration(
                          labelText: 'Pincode',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Notes
                      const Text(
                        'Additional Information',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2C3E50),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      TextFormField(
                        controller: notesController,
                        decoration: InputDecoration(
                          labelText: 'Notes',
                          hintText: 'Any additional information about the customer',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.note),
                        ),
                        maxLines: 3,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: isCreating ? null : () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: isCreating ? null : () async {
                  if (!formKey.currentState!.validate()) {
                    return;
                  }
                  
                  setDialogState(() {
                    isCreating = true;
                  });
                  
                  try {
                    // Prepare customer data
                    final customerData = {
                      'customerName': nameController.text.trim(),
                      'customerEmail': emailController.text.trim(),
                      'customerPhone': phoneController.text.trim(),
                      if (companyController.text.trim().isNotEmpty)
                        'companyName': companyController.text.trim(),
                      if (gstController.text.trim().isNotEmpty)
                        'gstNumber': gstController.text.trim().toUpperCase(),
                      if (streetController.text.trim().isNotEmpty ||
                          cityController.text.trim().isNotEmpty ||
                          stateController.text.trim().isNotEmpty ||
                          pincodeController.text.trim().isNotEmpty)
                        'billingAddress': {
                          if (streetController.text.trim().isNotEmpty)
                            'street': streetController.text.trim(),
                          if (cityController.text.trim().isNotEmpty)
                            'city': cityController.text.trim(),
                          if (stateController.text.trim().isNotEmpty)
                            'state': stateController.text.trim(),
                          if (pincodeController.text.trim().isNotEmpty)
                            'pincode': pincodeController.text.trim(),
                          'country': 'India',
                        },
                      if (notesController.text.trim().isNotEmpty)
                        'notes': notesController.text.trim(),
                    };
                    
                    // Create customer via API
                    final customer = await InvoiceService.createBillingCustomer(customerData);
                    
                    // Update selected customer in invoice form
                    setState(() {
                      _selectedCustomerId = customer.id;
                      _selectedCustomerName = customer.customerName;
                      _selectedCustomerEmail = customer.customerEmail;
                    });
                    
                    Navigator.pop(context);
                    _showSuccessSnackbar('Customer "${customer.customerName}" added successfully');
                    
                  } catch (e) {
                    setDialogState(() {
                      isCreating = false;
                    });
                    
                    _showErrorSnackbar('Failed to create customer: ${e.toString()}');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3498DB),
                  foregroundColor: Colors.white,
                ),
                child: isCreating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('Add Customer'),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ============================================================================
// INVOICE ITEM MODEL
// ============================================================================

class InvoiceItem {
  String itemDetails;
  double quantity;
  double rate;
  double discount;
  String discountType; // 'percentage' or 'amount'
  double amount;

  InvoiceItem({
    this.itemDetails = '',
    this.quantity = 0,
    this.rate = 0,
    this.discount = 0,
    this.discountType = 'percentage',
    this.amount = 0,
  });

  Map<String, dynamic> toJson() {
    return {
      'itemDetails': itemDetails,
      'quantity': quantity,
      'rate': rate,
      'discount': discount,
      'discountType': discountType,
      'amount': amount,
    };
  }

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    return InvoiceItem(
      itemDetails: json['itemDetails'] ?? '',
      quantity: (json['quantity'] ?? 0).toDouble(),
      rate: (json['rate'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      discountType: json['discountType'] ?? 'percentage',
      amount: (json['amount'] ?? 0).toDouble(),
    );
  }
}
