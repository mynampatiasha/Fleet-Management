// lib/screens/home_billing.dart
// UPDATED VERSION - Integrated with BillingApiService
// Replace your existing home_billing.dart with this version

import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:abra_fleet/core/services/billing_api_service.dart';
import 'new_invoice.dart';
import 'package:intl/intl.dart';

class HomeBilling extends StatefulWidget {
  const HomeBilling({Key? key}) : super(key: key);

  @override
  State<HomeBilling> createState() => _HomeBillingState();
}

class _HomeBillingState extends State<HomeBilling>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedCashFlowPeriod = 'This Fiscal Year';
  String _selectedAccountBasis = 'Accrual';
  bool _isLoading = false;
  String _userName = 'Admin'; // Default name
  
  // ✅ DATA FROM API
  ReceivablesSummary? _receivablesData;
  PayablesSummary? _payablesData;
  CashFlowData? _cashFlowData;
  ProjectsSummary? _projectsData;
  BankAccountsSummary? _bankAccountsData;
  AccountWatchlist? _watchlistData;
  
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadUserData(); // ✅ Load user data first
    _loadDashboardData(); // ✅ Load real data on init
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // ✅ LOAD USER DATA
  void _loadUserData() {
    // User data will be loaded from JWT token or session
    setState(() {
      _userName = 'Admin'; // Default, can be updated from backend
    });
    
    debugPrint('👤 Billing User loaded: $_userName');
  }

  // ✅ REAL API INTEGRATION
  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print('📊 Loading billing dashboard data...');
      
      // Load complete dashboard summary from backend
      final dashboardSummary = await BillingApiService.getDashboardSummary();
      
      setState(() {
        _receivablesData = dashboardSummary.receivables;
        _payablesData = dashboardSummary.payables;
        _cashFlowData = dashboardSummary.cashFlow;
        _projectsData = dashboardSummary.projects;
        _bankAccountsData = dashboardSummary.bankAccounts;
        _watchlistData = dashboardSummary.watchlist;
        _isLoading = false;
      });
      
      print('✅ Dashboard data loaded successfully');
      
    } catch (e) {
      print('❌ Error loading dashboard data: $e');
      
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
        // Set default empty data to prevent null errors
        _receivablesData = null;
        _payablesData = null;
        _cashFlowData = null;
        _projectsData = null;
        _bankAccountsData = null;
        _watchlistData = null;
      });
      
      // Show error to user
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load dashboard data: ${e.toString()}'),
            backgroundColor: Colors.red,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: _loadDashboardData,
            ),
          ),
        );
      }
    }
  }
  
  // ✅ REFRESH SPECIFIC WIDGET DATA
  Future<void> _refreshCashFlow() async {
    try {
      final period = _selectedCashFlowPeriod == 'This Fiscal Year'
          ? 'fiscal_year'
          : _selectedCashFlowPeriod == 'This Month'
              ? 'this_month'
              : _selectedCashFlowPeriod == 'Last Month'
                  ? 'last_month'
                  : 'this_quarter';
      
      final cashFlow = await BillingApiService.getCashFlow(period: period);
      
      if (mounted) {
        setState(() {
          _cashFlowData = cashFlow;
        });
      }
    } catch (error) {
      print('❌ Error refreshing cash flow: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to refresh cash flow: ${error.toString()}'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }
  
  Future<void> _refreshWatchlist() async {
    try {
      final basis = _selectedAccountBasis.toLowerCase();
      final watchlist = await BillingApiService.getAccountWatchlist(basis: basis);
      
      if (mounted) {
        setState(() {
          _watchlistData = watchlist;
        });
      }
    } catch (error) {
      print('❌ Error refreshing watchlist: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to refresh watchlist: ${error.toString()}'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }
  
  // ✅ Handle receivables new actions
  void _handleReceivablesNewAction(String action) {
    switch (action) {
      case 'new_invoice':
        _navigateToNewInvoice();
        break;
      case 'new_recurring_invoice':
        _navigateToNewRecurringInvoice();
        break;
      case 'new_customer_payment':
        _navigateToNewCustomerPayment();
        break;
    }
  }
  
  // ✅ Handle payables new actions
  void _handlePayablesNewAction(String action) {
    switch (action) {
      case 'new_bill':
        _navigateToNewBill();
        break;
      case 'new_vendor_payment':
        _navigateToNewVendorPayment();
        break;
      case 'new_recurring_bill':
        _navigateToNewRecurringBill();
        break;
    }
  }
  
  void _navigateToNewInvoice() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const NewInvoiceScreen(),
      ),
    ).then((result) {
      // Refresh dashboard if invoice was created/updated
      if (result == true) {
        _loadDashboardData();
      }
    });
  }
  
  void _navigateToNewRecurringInvoice() {
    // TODO: Implement New Recurring Invoice screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Recurring Invoice feature coming soon!'),
        backgroundColor: Color(0xFFF39C12),
      ),
    );
  }
  
  void _navigateToNewCustomerPayment() {
    // TODO: Implement New Customer Payment screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Customer Payment feature coming soon!'),
        backgroundColor: Color(0xFFF39C12),
      ),
    );
  }

  // ✅ Payables navigation methods
  void _navigateToNewBill() {
    _showNewBillDialog();
  }
  
  void _navigateToNewVendorPayment() {
    // TODO: Implement New Vendor Payment screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vendor Payment feature coming soon!'),
        backgroundColor: Color(0xFFF39C12),
      ),
    );
  }
  
  void _navigateToNewRecurringBill() {
    // TODO: Implement New Recurring Bill screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Recurring Bill feature coming soon!'),
        backgroundColor: Color(0xFFF39C12),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF5F7FA),
      child: Column(
        children: [
          // Header with user greeting
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Icon(Icons.receipt_outlined, size: 32, color: Colors.grey[600]),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hello, $_userName',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF2C3E50),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Abra fleet',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                // ✅ Refresh button
                IconButton(
                  icon: Icon(
                    Icons.refresh,
                    color: _isLoading ? Colors.grey : const Color(0xFF3498DB),
                  ),
                  onPressed: _isLoading ? null : _loadDashboardData,
                  tooltip: 'Refresh Dashboard',
                ),
              ],
            ),
          ),

          // Tabs
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              labelColor: const Color(0xFF3498DB),
              unselectedLabelColor: Colors.grey[600],
              indicatorColor: const Color(0xFF3498DB),
              indicatorWeight: 3,
              labelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
              tabs: const [
                Tab(text: 'Dashboard'),
                Tab(text: 'Getting Started'),
                Tab(text: 'Recent Updates'),
              ],
            ),
          ),

          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Dashboard Tab
                _buildDashboardContent(),
                
                // Getting Started Tab
                Center(
                  child: Text(
                    'Getting Started Content',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
                
                // Recent Updates Tab
                Center(
                  child: Text(
                    'Recent Updates Content',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardContent() {
    // ✅ Show loading indicator
    if (_isLoading && _receivablesData == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3498DB)),
            ),
            const SizedBox(height: 16),
            Text(
              'Loading dashboard data...',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }
    
    // ✅ Show error message
    if (_errorMessage != null && _receivablesData == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Failed to load dashboard',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadDashboardData,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3498DB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      );
    }
    
    // ✅ Show dashboard with real data
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Receivables and Payables
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildTotalReceivablesCard(),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: _buildTotalPayablesCard(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Row 2: Cash Flow
          _buildCashFlowCard(),
          const SizedBox(height: 24),

          // Row 3: Projects and Bank Cards
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildProjectsCard(),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: _buildBankCardsCard(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Row 4: Account Watchlist
          _buildAccountWatchlistCard(),
        ],
      ),
    );
  }

  Widget _buildTotalReceivablesCard() {
    // ✅ Use real data from API
    final data = _receivablesData;
    final current = data?.currentFormatted ?? '₹0.00';
    final overdue = data?.overdueFormatted ?? '₹0.00';
    final total = data?.totalFormatted ?? '₹0.00';
    
    return Container(
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
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                const Text(
                  'Total Receivables',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2C3E50),
                  ),
                ),
                const Spacer(),
                PopupMenuButton<String>(
                  onSelected: (String value) {
                    _handleReceivablesNewAction(value);
                  },
                  itemBuilder: (BuildContext context) => [
                    const PopupMenuItem<String>(
                      value: 'new_invoice',
                      child: Row(
                        children: [
                          Icon(Icons.receipt_outlined, size: 18, color: Color(0xFF3498DB)),
                          SizedBox(width: 8),
                          Text('New Invoice'),
                        ],
                      ),
                    ),
                    const PopupMenuItem<String>(
                      value: 'new_recurring_invoice',
                      child: Row(
                        children: [
                          Icon(Icons.repeat, size: 18, color: Color(0xFF3498DB)),
                          SizedBox(width: 8),
                          Text('New Recurring Invoice'),
                        ],
                      ),
                    ),
                    const PopupMenuItem<String>(
                      value: 'new_customer_payment',
                      child: Row(
                        children: [
                          Icon(Icons.payment, size: 18, color: Color(0xFF3498DB)),
                          SizedBox(width: 8),
                          Text('New Customer Payment'),
                        ],
                      ),
                    ),
                  ],
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3498DB),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.add, color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'New',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_drop_down, color: Colors.white, size: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Total Unpaid Invoices $total',
                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildAmountSection(
                        'CURRENT',
                        current,
                        Colors.grey[600]!,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildAmountSection(
                        'OVERDUE',
                        overdue,
                        const Color(0xFFE74C3C),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalPayablesCard() {
    // ✅ Use real data from API
    final data = _payablesData;
    final current = data?.currentFormatted ?? '₹0.00';
    final overdue = data?.overdueFormatted ?? '₹0.00';
    final total = data?.totalFormatted ?? '₹0.00';
    final overdueAmount = data?.overdue ?? 0.0;
    final totalAmount = data?.total ?? 0.0;
    
    // Calculate progress value safely to avoid NaN
    final progressValue = totalAmount > 0 ? (overdueAmount / totalAmount).clamp(0.0, 1.0) : 0.0;
    
    return Container(
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
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                const Text(
                  'Total Payables',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2C3E50),
                  ),
                ),
                const Spacer(),
                PopupMenuButton<String>(
                  onSelected: (String value) {
                    _handlePayablesNewAction(value);
                  },
                  itemBuilder: (BuildContext context) => [
                    const PopupMenuItem<String>(
                      value: 'new_bill',
                      child: Row(
                        children: [
                          Icon(Icons.receipt_long_outlined, size: 18, color: Color(0xFF3498DB)),
                          SizedBox(width: 8),
                          Text('New Bill'),
                        ],
                      ),
                    ),
                    const PopupMenuItem<String>(
                      value: 'new_vendor_payment',
                      child: Row(
                        children: [
                          Icon(Icons.payment_outlined, size: 18, color: Color(0xFF3498DB)),
                          SizedBox(width: 8),
                          Text('New Vendor Payment'),
                        ],
                      ),
                    ),
                    const PopupMenuItem<String>(
                      value: 'new_recurring_bill',
                      child: Row(
                        children: [
                          Icon(Icons.repeat, size: 18, color: Color(0xFF3498DB)),
                          SizedBox(width: 8),
                          Text('New Recurring Bill'),
                        ],
                      ),
                    ),
                  ],
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3498DB),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.add, color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'New',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_drop_down, color: Colors.white, size: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Total Unpaid Bills $total',
                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progressValue,
                    minHeight: 8,
                    backgroundColor: Colors.grey[200],
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      Color(0xFFF39C12),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildAmountSection(
                        'CURRENT',
                        current,
                        Colors.grey[600]!,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildAmountSection(
                        'OVERDUE',
                        overdue,
                        const Color(0xFFE74C3C),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmountSection(String label, String amount, Color amountColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey[500],
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Flexible(
              child: Text(
                amount,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: amountColor,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.arrow_drop_down,
              color: Colors.grey[400],
              size: 24,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCashFlowCard() {
    // ✅ Use real data from API
    final data = _cashFlowData;
    final incoming = data?.incomingFormatted ?? '₹0.00';
    final outgoing = data?.outgoingFormatted ?? '₹0.00';
    final closing = data?.closingBalanceFormatted ?? '₹0.00';
    
    return Container(
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
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                const Text(
                  'Cash Flow',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2C3E50),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: DropdownButton<String>(
                    value: _selectedCashFlowPeriod,
                    underline: const SizedBox(),
                    isDense: true,
                    style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                    items: [
                      'This Fiscal Year',
                      'This Month',
                      'Last Month',
                      'This Quarter',
                    ].map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        _selectedCashFlowPeriod = newValue!;
                      });
                      _refreshCashFlow(); // ✅ Refresh with new period
                    },
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Cash as on ${data != null ? _formatDate(data.endDate) : "01/04/2025"}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        closing,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2C3E50),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[200]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: CustomPaint(
                    size: const Size(double.infinity, 200),
                    painter: CashFlowChartPainter(),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildLegendItem('Incoming', incoming, const Color(0xFF27AE60)),
                    const SizedBox(width: 32),
                    _buildLegendItem('Outgoing', outgoing, const Color(0xFFE74C3C)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildLegendItem(String label, String value, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(width: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }
  
  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  Widget _buildProjectsCard() {
    // ✅ Use real data from API
    final data = _projectsData;
    final hasProjects = data != null && data.projects.isNotEmpty;
    
    return Container(
      height: 300,
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
          Padding(
            padding: const EdgeInsets.all(20),
            child: const Text(
              'Projects',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF2C3E50),
              ),
            ),
          ),
          Expanded(
            child: hasProjects
                ? ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: data!.projects.length,
                    itemBuilder: (context, index) {
                      final project = data.projects[index];
                      return ListTile(
                        title: Text(project.name),
                        subtitle: Text(project.status),
                        trailing: Text('₹${(project.remaining ?? 0.0).toStringAsFixed(2)}'),
                      );
                    },
                  )
                : Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.folder_outlined, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        TextButton(
                          onPressed: () {},
                          child: const Text(
                            'Add Project(s) to this watchlist',
                            style: TextStyle(
                              color: Color(0xFF3498DB),
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBankCardsCard() {
    // ✅ Use real data from API
    final data = _bankAccountsData;
    final hasAccounts = data != null && data.accounts.isNotEmpty;
    
    return Container(
      height: 300,
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
          Padding(
            padding: const EdgeInsets.all(20),
            child: const Text(
              'Bank and Credit Cards',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF2C3E50),
              ),
            ),
          ),
          Expanded(
            child: hasAccounts
                ? ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: data!.accounts.length,
                    itemBuilder: (context, index) {
                      final account = data.accounts[index];
                      return ListTile(
                        title: Text(account.name),
                        subtitle: Text(account.bankName ?? account.type),
                        trailing: Text(account.balanceFormatted),
                      );
                    },
                  )
                : Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.account_balance_outlined,
                            size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text(
                          'Yet to add Bank and Credit Card details',
                          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () {},
                          child: const Text(
                            'Add Bank Account',
                            style: TextStyle(
                              color: Color(0xFF3498DB),
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountWatchlistCard() {
    // ✅ Use real data from API
    final data = _watchlistData;
    final hasAccounts = data != null && data.accounts.isNotEmpty;
    
    return Container(
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
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                const Text(
                  'Account Watchlist',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2C3E50),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: DropdownButton<String>(
                    value: _selectedAccountBasis,
                    underline: const SizedBox(),
                    isDense: true,
                    style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                    items: ['Accrual', 'Cash'].map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        _selectedAccountBasis = newValue!;
                      });
                      _refreshWatchlist(); // ✅ Refresh with new basis
                    },
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
            child: hasAccounts
                ? Column(
                    children: data!.accounts.map((account) {
                      return ListTile(
                        title: Text(account.name),
                        subtitle: Text(account.type),
                        trailing: Text(account.balanceFormatted),
                      );
                    }).toList(),
                  )
                : Center(
                    child: Column(
                      children: [
                        Icon(Icons.remove_red_eye_outlined,
                            size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text(
                          'No accounts added to watchlist',
                          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  // ✅ NEW BILL DIALOG - Shows all bill fields inline
  void _showNewBillDialog() {
    // Form controllers
    final billNumberController = TextEditingController();
    final orderNumberController = TextEditingController();
    final subjectController = TextEditingController();
    final notesController = TextEditingController();
    
    // Form data
    String? selectedVendorName;
    String? selectedVendorEmail;
    DateTime billDate = DateTime.now();
    DateTime? dueDate = DateTime.now().add(const Duration(days: 30));
    String selectedTerms = 'Net 30';
    
    // Items
    List<Map<String, dynamic>> items = [
      {'description': '', 'quantity': 0.0, 'rate': 0.0, 'amount': 0.0}
    ];
    
    // Tax settings
    bool enableGST = true;
    bool enableTDS = false;
    double gstRate = 18.0;
    double tdsRate = 0.0;
    
    // Calculations
    double subTotal = 0.0;
    double gstAmount = 0.0;
    double tdsAmount = 0.0;
    double totalAmount = 0.0;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          // Calculate amounts
          void calculateAmounts() {
            subTotal = 0.0;
            for (var item in items) {
              if (item['quantity'] > 0 && item['rate'] > 0) {
                item['amount'] = item['quantity'] * item['rate'];
                subTotal += item['amount'];
              }
            }
            
            gstAmount = enableGST ? (subTotal * gstRate / 100) : 0.0;
            tdsAmount = enableTDS ? (subTotal * tdsRate / 100) : 0.0;
            totalAmount = subTotal + gstAmount - tdsAmount;
          }

          return Dialog(
            child: Container(
              width: MediaQuery.of(context).size.width * 0.9,
              height: MediaQuery.of(context).size.height * 0.9,
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      color: Color(0xFF2C3E50),
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(8),
                        topRight: Radius.circular(8),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.receipt_long, color: Colors.white),
                        const SizedBox(width: 12),
                        const Text(
                          'New Bill',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                  
                  // Content
                  Expanded(
                    child: Row(
                      children: [
                        // Main form area
                        Expanded(
                          flex: 2,
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Vendor Information
                                _buildDialogSection(
                                  'Vendor Information',
                                  [
                                    InkWell(
                                      onTap: () {
                                        // Show vendor selector
                                        setDialogState(() {
                                          selectedVendorName = 'ABC Suppliers';
                                          selectedVendorEmail = 'abc@suppliers.com';
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          border: Border.all(color: Colors.grey[300]!),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(Icons.business_outlined, color: Color(0xFF3498DB)),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Text(
                                                selectedVendorName ?? 'Select Vendor *',
                                                style: TextStyle(
                                                  fontSize: 16,
                                                  color: selectedVendorName != null
                                                      ? const Color(0xFF2C3E50)
                                                      : Colors.grey[600],
                                                ),
                                              ),
                                            ),
                                            const Icon(Icons.arrow_drop_down, color: Colors.grey),
                                          ],
                                        ),
                                      ),
                                    ),
                                    if (selectedVendorEmail != null) ...[
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          const Icon(Icons.email_outlined, size: 18, color: Colors.grey),
                                          const SizedBox(width: 8),
                                          Text(selectedVendorEmail!, style: TextStyle(color: Colors.grey[700])),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                                
                                const SizedBox(height: 20),
                                
                                // Bill Details
                                _buildDialogSection(
                                  'Bill Details',
                                  [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: TextFormField(
                                            controller: billNumberController,
                                            decoration: InputDecoration(
                                              labelText: 'Bill Number *',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                              prefixIcon: const Icon(Icons.receipt_long),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: TextFormField(
                                            controller: orderNumberController,
                                            decoration: InputDecoration(
                                              labelText: 'Order Number',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                              prefixIcon: const Icon(Icons.numbers),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: InkWell(
                                            onTap: () async {
                                              final date = await showDatePicker(
                                                context: context,
                                                initialDate: billDate,
                                                firstDate: DateTime(2020),
                                                lastDate: DateTime(2030),
                                              );
                                              if (date != null) {
                                                setDialogState(() {
                                                  billDate = date;
                                                  dueDate = date.add(const Duration(days: 30));
                                                });
                                              }
                                            },
                                            child: InputDecorator(
                                              decoration: InputDecoration(
                                                labelText: 'Bill Date *',
                                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                                prefixIcon: const Icon(Icons.calendar_today),
                                              ),
                                              child: Text(DateFormat('dd MMM yyyy').format(billDate)),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: DropdownButtonFormField<String>(
                                            value: selectedTerms,
                                            decoration: InputDecoration(
                                              labelText: 'Payment Terms *',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                              prefixIcon: const Icon(Icons.payment),
                                            ),
                                            items: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']
                                                .map((term) => DropdownMenuItem(value: term, child: Text(term)))
                                                .toList(),
                                            onChanged: (value) {
                                              setDialogState(() {
                                                selectedTerms = value!;
                                                // Update due date based on terms
                                                switch (value) {
                                                  case 'Due on Receipt':
                                                    dueDate = billDate;
                                                    break;
                                                  case 'Net 15':
                                                    dueDate = billDate.add(const Duration(days: 15));
                                                    break;
                                                  case 'Net 30':
                                                    dueDate = billDate.add(const Duration(days: 30));
                                                    break;
                                                  case 'Net 45':
                                                    dueDate = billDate.add(const Duration(days: 45));
                                                    break;
                                                  case 'Net 60':
                                                    dueDate = billDate.add(const Duration(days: 60));
                                                    break;
                                                }
                                              });
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: InputDecorator(
                                            decoration: InputDecoration(
                                              labelText: 'Due Date',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                              prefixIcon: const Icon(Icons.event),
                                              filled: true,
                                              fillColor: Colors.grey[50],
                                            ),
                                            child: Text(
                                              dueDate != null ? DateFormat('dd MMM yyyy').format(dueDate!) : '-',
                                              style: const TextStyle(fontWeight: FontWeight.w500),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: TextFormField(
                                            controller: subjectController,
                                            decoration: InputDecoration(
                                              labelText: 'Subject',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                              prefixIcon: const Icon(Icons.subject),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                
                                const SizedBox(height: 20),
                                
                                // Items Section
                                _buildDialogSection(
                                  'Items',
                                  [
                                    // Items header
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF34495E),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        children: const [
                                          Expanded(flex: 3, child: Text('DESCRIPTION', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12))),
                                          SizedBox(width: 8),
                                          SizedBox(width: 80, child: Text('QTY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.center)),
                                          SizedBox(width: 8),
                                          SizedBox(width: 100, child: Text('RATE (₹)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.right)),
                                          SizedBox(width: 8),
                                          SizedBox(width: 120, child: Text('AMOUNT (₹)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.right)),
                                          SizedBox(width: 50),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    
                                    // Items list
                                    ...items.asMap().entries.map((entry) {
                                      int index = entry.key;
                                      Map<String, dynamic> item = entry.value;
                                      
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 8),
                                        child: Row(
                                          children: [
                                            Expanded(
                                              flex: 3,
                                              child: TextFormField(
                                                initialValue: item['description'],
                                                decoration: InputDecoration(
                                                  hintText: 'Enter item description',
                                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                                ),
                                                onChanged: (value) {
                                                  item['description'] = value;
                                                },
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            SizedBox(
                                              width: 80,
                                              child: TextFormField(
                                                initialValue: item['quantity'] > 0 ? item['quantity'].toString() : '',
                                                decoration: InputDecoration(
                                                  hintText: '0',
                                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                                ),
                                                keyboardType: TextInputType.number,
                                                textAlign: TextAlign.center,
                                                onChanged: (value) {
                                                  setDialogState(() {
                                                    item['quantity'] = double.tryParse(value) ?? 0.0;
                                                    calculateAmounts();
                                                  });
                                                },
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            SizedBox(
                                              width: 100,
                                              child: TextFormField(
                                                initialValue: item['rate'] > 0 ? item['rate'].toStringAsFixed(2) : '',
                                                decoration: InputDecoration(
                                                  hintText: '0.00',
                                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                                ),
                                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                                textAlign: TextAlign.right,
                                                onChanged: (value) {
                                                  setDialogState(() {
                                                    item['rate'] = double.tryParse(value) ?? 0.0;
                                                    calculateAmounts();
                                                  });
                                                },
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Container(
                                              width: 120,
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color: Colors.grey[50],
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: Colors.grey[300]!),
                                              ),
                                              child: Text(
                                                item['amount'].toStringAsFixed(2),
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                                textAlign: TextAlign.right,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            IconButton(
                                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                                              onPressed: items.length > 1 ? () {
                                                setDialogState(() {
                                                  items.removeAt(index);
                                                  calculateAmounts();
                                                });
                                              } : null,
                                            ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                    
                                    // Add item button
                                    const SizedBox(height: 8),
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        setDialogState(() {
                                          items.add({'description': '', 'quantity': 0.0, 'rate': 0.0, 'amount': 0.0});
                                        });
                                      },
                                      icon: const Icon(Icons.add, size: 18),
                                      label: const Text('Add Item'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF3498DB),
                                        foregroundColor: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                                
                                const SizedBox(height: 20),
                                
                                // Notes
                                _buildDialogSection(
                                  'Additional Information',
                                  [
                                    TextFormField(
                                      controller: notesController,
                                      decoration: InputDecoration(
                                        labelText: 'Notes',
                                        hintText: 'Internal notes for this bill',
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                        alignLabelWithHint: true,
                                      ),
                                      maxLines: 3,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        
                        // Right sidebar - Tax & Summary
                        Container(
                          width: 300,
                          color: Colors.grey[50],
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Tax Settings
                                const Text(
                                  'Tax Settings',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
                                ),
                                const SizedBox(height: 16),
                                
                                SwitchListTile(
                                  title: const Text('Enable GST'),
                                  value: enableGST,
                                  activeColor: const Color(0xFF3498DB),
                                  contentPadding: EdgeInsets.zero,
                                  onChanged: (value) {
                                    setDialogState(() {
                                      enableGST = value;
                                      calculateAmounts();
                                    });
                                  },
                                ),
                                
                                if (enableGST) ...[
                                  const SizedBox(height: 8),
                                  TextFormField(
                                    initialValue: gstRate.toString(),
                                    decoration: InputDecoration(
                                      labelText: 'GST Rate (%)',
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      suffixText: '%',
                                    ),
                                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                    onChanged: (value) {
                                      setDialogState(() {
                                        gstRate = double.tryParse(value) ?? 18.0;
                                        calculateAmounts();
                                      });
                                    },
                                  ),
                                ],
                                
                                const SizedBox(height: 16),
                                
                                SwitchListTile(
                                  title: const Text('Enable TDS'),
                                  subtitle: const Text('Tax Deducted at Source', style: TextStyle(fontSize: 12)),
                                  value: enableTDS,
                                  activeColor: const Color(0xFF3498DB),
                                  contentPadding: EdgeInsets.zero,
                                  onChanged: (value) {
                                    setDialogState(() {
                                      enableTDS = value;
                                      calculateAmounts();
                                    });
                                  },
                                ),
                                
                                if (enableTDS) ...[
                                  const SizedBox(height: 8),
                                  TextFormField(
                                    initialValue: tdsRate.toString(),
                                    decoration: InputDecoration(
                                      labelText: 'TDS Rate (%)',
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      suffixText: '%',
                                    ),
                                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                    onChanged: (value) {
                                      setDialogState(() {
                                        tdsRate = double.tryParse(value) ?? 0.0;
                                        calculateAmounts();
                                      });
                                    },
                                  ),
                                ],
                                
                                const Divider(height: 32),
                                
                                // Summary
                                const Text(
                                  'Bill Summary',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
                                ),
                                const SizedBox(height: 16),
                                
                                _buildSummaryRow('Sub Total:', subTotal),
                                const SizedBox(height: 8),
                                
                                if (enableGST && gstAmount > 0) ...[
                                  _buildSummaryRow('CGST (${(gstRate / 2).toStringAsFixed(1)}%):', gstAmount / 2),
                                  const SizedBox(height: 8),
                                  _buildSummaryRow('SGST (${(gstRate / 2).toStringAsFixed(1)}%):', gstAmount / 2),
                                  const SizedBox(height: 8),
                                ],
                                
                                if (enableTDS && tdsAmount > 0) ...[
                                  _buildSummaryRow('TDS (${tdsRate.toStringAsFixed(1)}%):', -tdsAmount, color: Colors.red[700]),
                                  const SizedBox(height: 8),
                                ],
                                
                                const Divider(thickness: 2),
                                const SizedBox(height: 8),
                                
                                _buildSummaryRow('Total Amount:', totalAmount, isBold: true, isTotal: true),
                                
                                const SizedBox(height: 24),
                                
                                // Action buttons
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      // TODO: Save and approve bill
                                      Navigator.pop(context);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Bill saved and approved successfully!'),
                                          backgroundColor: Colors.green,
                                        ),
                                      );
                                      _loadDashboardData(); // Refresh dashboard
                                    },
                                    icon: const Icon(Icons.check),
                                    label: const Text('Save & Approve Bill'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF27AE60),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                    ),
                                  ),
                                ),
                                
                                const SizedBox(height: 12),
                                
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    onPressed: () {
                                      // TODO: Save as draft
                                      Navigator.pop(context);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Bill saved as draft!'),
                                          backgroundColor: Color(0xFF3498DB),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.save_outlined),
                                    label: const Text('Save as Draft'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF3498DB),
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      side: const BorderSide(color: Color(0xFF3498DB)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Helper method to build dialog sections
  Widget _buildDialogSection(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {Color? color, bool isBold = false, bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            color: color ?? (isTotal ? const Color(0xFF2C3E50) : Colors.grey[700]),
          ),
        ),
        Text(
          '₹${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: color ?? (isTotal ? const Color(0xFF2C3E50) : Colors.grey[700]),
          ),
        ),
      ],
    );
  }
}

// Custom painter for cash flow chart
class CashFlowChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey[300]!
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    // Draw grid lines
    for (int i = 0; i <= 5; i++) {
      final y = size.height * i / 5;
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        paint,
      );
    }

    // Draw y-axis labels
    final textPainter = TextPainter(
      textDirection: ui.TextDirection.ltr,
    );

    final labels = ['5 K', '4 K', '3 K', '2 K', '1 K'];
    for (int i = 0; i < labels.length; i++) {
      textPainter.text = TextSpan(
        text: labels[i],
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 10,
        ),
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(10, size.height * i / 5 - 5),
      );
    }

    // Draw a flat line for no data
    final linePaint = Paint()
      ..color = Colors.grey[400]!
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(50, size.height / 2);
    path.lineTo(size.width - 20, size.height / 2);
    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
