import 'package:flutter/material.dart';
import 'pages/home_billing.dart';
import 'pages/items_billing.dart';
import 'pages/invoices_list_page.dart';
import 'pages/payments_received_page.dart';
import 'pages/customers_list_page.dart';

class BillingMainShell extends StatefulWidget {
  const BillingMainShell({Key? key}) : super(key: key);

  @override
  State<BillingMainShell> createState() => _BillingMainShellState();
}

class _BillingMainShellState extends State<BillingMainShell> {
  int _selectedIndex = 0;
  bool _isSidebarExpanded = true;
  
  // Track which sections are expanded
  final Map<String, bool> _expandedSections = {
    'accountant': false,
    'time_tracking': false,
    'purchases': false,
    'sales': false,
  };

  // Navigation items with hierarchical structure
  final List<NavigationItem> _mainMenuItems = [
    NavigationItem(
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
      label: 'Home',
      route: 'home',
    ),
    NavigationItem(
      icon: Icons.inventory_2_outlined,
      selectedIcon: Icons.inventory_2,
      label: 'Items',
      route: 'items',
    ),
    NavigationItem(
      icon: Icons.shopping_cart_outlined,
      selectedIcon: Icons.shopping_cart,
      label: 'Sales',
      route: 'sales',
      isExpandable: true,
      subItems: [
        SubNavigationItem(label: 'Customers', route: 'sales/customers'),
        SubNavigationItem(label: 'Quotes', route: 'sales/quotes'),
        SubNavigationItem(label: 'Sales Orders', route: 'sales/orders'),
        SubNavigationItem(label: 'Invoices', route: 'sales/invoices'),
        SubNavigationItem(label: 'Recurring Invoices', route: 'sales/recurring_invoices'),
        SubNavigationItem(label: 'Delivery Challans', route: 'sales/delivery_challans'),
        SubNavigationItem(label: 'Payments Received', route: 'sales/payments_received'),
      ],
    ),
    NavigationItem(
      icon: Icons.shopping_bag_outlined,
      selectedIcon: Icons.shopping_bag,
      label: 'Purchases',
      route: 'purchases',
      isExpandable: true,
      subItems: [
        SubNavigationItem(label: 'Vendors', route: 'purchases/vendors'),
        SubNavigationItem(label: 'Expenses', route: 'purchases/expenses'),
        SubNavigationItem(label: 'Recurring Expenses', route: 'purchases/recurring_expenses'),
        SubNavigationItem(label: 'Purchase Orders', route: 'purchases/orders'),
        SubNavigationItem(label: 'Bills', route: 'purchases/bills'),
        SubNavigationItem(label: 'Recurring Bills', route: 'purchases/recurring_bills'),
        SubNavigationItem(label: 'Payments Made', route: 'purchases/payments_made'),
        SubNavigationItem(label: 'Vendor Credits', route: 'purchases/vendor_credits'),
      ],
    ),
    NavigationItem(
      icon: Icons.access_time_outlined,
      selectedIcon: Icons.access_time,
      label: 'Time Tracking',
      route: 'time_tracking',
      isExpandable: true,
      subItems: [
        SubNavigationItem(label: 'Projects', route: 'time_tracking/projects'),
        SubNavigationItem(label: 'Timesheet', route: 'time_tracking/timesheet'),
      ],
    ),
    NavigationItem(
      icon: Icons.account_balance_outlined,
      selectedIcon: Icons.account_balance,
      label: 'Banking',
      route: 'banking',
    ),
    NavigationItem(
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
      label: 'Accountant',
      route: 'accountant',
      isExpandable: true,
      subItems: [
        SubNavigationItem(label: 'Manual Journals', route: 'accountant/manual_journals'),
        SubNavigationItem(label: 'Bulk Update', route: 'accountant/bulk_update'),
        SubNavigationItem(label: 'Currency Adjustments', route: 'accountant/currency_adjustments'),
        SubNavigationItem(label: 'Chart of Accounts', route: 'accountant/chart_of_accounts'),
        SubNavigationItem(label: 'Budgets', route: 'accountant/budgets'),
        SubNavigationItem(label: 'Transaction Locking', route: 'accountant/transaction_locking'),
      ],
    ),
    NavigationItem(
      icon: Icons.bar_chart_outlined,
      selectedIcon: Icons.bar_chart,
      label: 'Reports',
      route: 'reports',
    ),
    NavigationItem(
      icon: Icons.folder_outlined,
      selectedIcon: Icons.folder,
      label: 'Documents',
      route: 'documents',
    ),
  ];

  final List<NavigationItem> _appMenuItems = [
    NavigationItem(
      icon: Icons.payment_outlined,
      selectedIcon: Icons.payment,
      label: 'Abra Travels Payroll',
      route: 'payroll',
    ),
    NavigationItem(
      icon: Icons.credit_card_outlined,
      selectedIcon: Icons.credit_card,
      label: 'Abra Travels Payments',
      route: 'payments',
    ),
  ];

  Widget _getSelectedPage() {
    switch (_selectedIndex) {
      case 0:
        return const HomeBilling();
      case 1:
        return const ItemsBilling();
      case 2:
        return _buildPlaceholderPage('Sales');
      case 3:
        return _buildPlaceholderPage('Purchases');
      case 4:
        return _buildPlaceholderPage('Time Tracking');
      case 5:
        return _buildPlaceholderPage('Banking');
      case 6:
        return _buildPlaceholderPage('Accountant');
      case 7:
        return _buildPlaceholderPage('Reports');
      case 8:
        return _buildPlaceholderPage('Documents');
      default:
        return const HomeBilling();
    }
  }

  Widget _buildPlaceholderPage(String title) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.construction, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            '$title Page',
            style: TextStyle(fontSize: 24, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          Text(
            'Coming Soon',
            style: TextStyle(fontSize: 16, color: Colors.grey[500]),
          ),
          const SizedBox(height: 16),
          if (title == 'Sales' || title == 'Purchases' || title == 'Time Tracking' || title == 'Accountant') ...[
            Text(
              'Click on "$title" in the sidebar to expand and see sub-items',
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: _isSidebarExpanded ? 220 : 70,
            child: Container(
              color: const Color(0xFF2C3E50),
              child: Column(
                children: [
                  // Header with logo and collapse button
                  Container(
                    height: 60,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFF34495E), width: 1),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.book_outlined,
                          color: Colors.white,
                          size: 28,
                        ),
                        if (_isSidebarExpanded) ...[
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Books',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                        IconButton(
                          icon: Icon(
                            _isSidebarExpanded
                                ? Icons.chevron_left
                                : Icons.chevron_right,
                            color: Colors.white70,
                          ),
                          onPressed: () {
                            setState(() {
                              _isSidebarExpanded = !_isSidebarExpanded;
                            });
                          },
                          tooltip: _isSidebarExpanded ? 'Collapse' : 'Expand',
                        ),
                      ],
                    ),
                  ),

                  // Main Menu Items
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      children: [
                        // Main menu items with expandable sections
                        ..._buildExpandableMenuItems(),

                        // Apps section
                        if (_isSidebarExpanded) ...[
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                            child: Text(
                              'APPS',
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                        ] else ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Divider(
                              color: Colors.white24,
                              thickness: 1,
                              indent: 16,
                              endIndent: 16,
                            ),
                          ),
                        ],

                        // App menu items
                        ..._appMenuItems.map((item) {
                          return _buildSidebarItem(item, -1, false);
                        }),

                        // Configure Features
                        const SizedBox(height: 16),
                        if (_isSidebarExpanded)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: TextButton(
                              onPressed: () {
                                // Navigate to configure features
                              },
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.white70,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                alignment: Alignment.centerLeft,
                              ),
                              child: Row(
                                children: [
                                  const Text(
                                    'Configure Features',
                                    style: TextStyle(fontSize: 13),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(Icons.chevron_right, size: 16),
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
          ),

          // Main content area
          Expanded(
            child: Column(
              children: [
                // Top app bar
                Container(
                  height: 60,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2C3E50),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        offset: const Offset(0, 2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // ✅ Back button to return to admin dashboard
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                        tooltip: 'Back to Admin Dashboard',
                      ),
                      
                      // Search bar
                      Expanded(
                        child: Container(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF34495E),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: TextField(
                            decoration: InputDecoration(
                              hintText: 'Search in Customers ( / )',
                              hintStyle: TextStyle(
                                color: Colors.white38,
                                fontSize: 14,
                              ),
                              prefixIcon: Icon(
                                Icons.search,
                                color: Colors.white38,
                                size: 20,
                              ),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(
                                vertical: 8,
                              ),
                            ),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),

                      // Action buttons
                      IconButton(
                        icon: Icon(Icons.add, color: Colors.white),
                        onPressed: () {},
                        style: IconButton.styleFrom(
                          backgroundColor: const Color(0xFF3498DB),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Icon(Icons.person_outline, color: Colors.white70),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon:
                            Icon(Icons.notifications_outlined, color: Colors.white70),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: Icon(Icons.settings_outlined, color: Colors.white70),
                        onPressed: () {},
                      ),
                      const SizedBox(width: 8),
                      
                      // Profile
                      CircleAvatar(
                        backgroundColor: const Color(0xFF3498DB),
                        radius: 16,
                        child: Text(
                          'A',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Icon(Icons.apps, color: Colors.white70),
                        onPressed: () {},
                      ),
                      const SizedBox(width: 8),
                    ],
                  ),
                ),

                // Main content
                Expanded(
                  child: _getSelectedPage(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildExpandableMenuItems() {
    List<Widget> widgets = [];
    
    for (int index = 0; index < _mainMenuItems.length; index++) {
      final item = _mainMenuItems[index];
      
      // Add main item
      widgets.add(_buildSidebarItem(
        item,
        index,
        _selectedIndex == index,
      ));
      
      // Add sub-items if expandable and expanded
      if (item.isExpandable && 
          _expandedSections[item.route] == true && 
          _isSidebarExpanded) {
        for (final subItem in item.subItems ?? []) {
          widgets.add(_buildSubSidebarItem(subItem));
        }
      }
    }
    
    return widgets;
  }

  Widget _buildSubSidebarItem(SubNavigationItem subItem) {
    return InkWell(
      onTap: () {
        // Handle sub-item navigation
        print('Navigate to: ${subItem.route}');
        // Navigate to specific sub-pages based on route
        _navigateToSubPage(subItem.route, subItem.label);
      },
      child: Container(
        margin: const EdgeInsets.only(left: 20, right: 8, top: 1, bottom: 1),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white54,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  subItem.label,
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToSubPage(String route, String label) {
    // Handle specific routes
    switch (route) {
      case 'sales/customers':
        // Navigate to customers list page
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const CustomersListPage(),
          ),
        );
        break;
      case 'sales/invoices':
        // Navigate to invoices page
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const InvoicesListPage(),
          ),
        );
        break;
      case 'sales/payments_received':
        // Navigate to payments received page
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const PaymentsReceivedPage(),
          ),
        );
        break;
      default:
        // For other routes, show a snackbar with navigation info
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Navigating to $label - Coming Soon'),
            duration: Duration(seconds: 1),
            backgroundColor: const Color(0xFF2C3E50),
          ),
        );
    }
  }

  Widget _buildSidebarItem(NavigationItem item, int index, bool isSelected) {
    final isExpandable = item.isExpandable;
    final isExpanded = _expandedSections[item.route] ?? false;
    
    return InkWell(
      onTap: () {
        if (isExpandable) {
          // Toggle expansion
          setState(() {
            _expandedSections[item.route] = !isExpanded;
          });
        } else if (index >= 0) {
          // Navigate to page
          setState(() {
            _selectedIndex = index;
          });
        }
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF34495E) : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Icon(
                isSelected ? item.selectedIcon : item.icon,
                color: isSelected ? Colors.white : Colors.white70,
                size: 20,
              ),
              if (_isSidebarExpanded) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.label,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                    ),
                  ),
                ),
                if (isExpandable) ...[
                  Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: isSelected ? Colors.white : Colors.white70,
                    size: 20,
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String route;
  final bool isExpandable;
  final List<SubNavigationItem>? subItems;

  NavigationItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.route,
    this.isExpandable = false,
    this.subItems,
  });
}

class SubNavigationItem {
  final String label;
  final String route;

  SubNavigationItem({
    required this.label,
    required this.route,
  });
}
