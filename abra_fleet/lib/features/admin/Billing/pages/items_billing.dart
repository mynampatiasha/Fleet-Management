// ===========================================================================
// ITEMS BILLING SCREEN - COMPLETE UPDATED VERSION
// ===========================================================================
// Replace your existing items_billing.dart with this complete version
// All export options now working including PDF
// ===========================================================================

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';
import 'new_item_billing.dart';
import '../../../../core/services/item_billing_service.dart';

class ItemsBilling extends StatefulWidget {
  const ItemsBilling({Key? key}) : super(key: key);

  @override
  State<ItemsBilling> createState() => _ItemsBillingState();
}

class _ItemsBillingState extends State<ItemsBilling> {
  final ItemBillingService _itemService = ItemBillingService();
  
  // State variables
  List<Map<String, dynamic>> _items = [];
  bool _isLoading = false;
  String? _error;
  
  // Filter and search variables
  String _selectedFilter = 'All Items';
  final TextEditingController _searchController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  
  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalItems = 0;
  final int _itemsPerPage = 20;
  
  final List<String> _filterOptions = [
    'All Items',
    'Active Items',
    'Inactive Items',
    'Services',
    'Inventory Items',
  ];

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadItems({bool showLoading = true}) async {
    if (showLoading) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }

    try {
      String? type;
      bool? isSellable;
      bool? isPurchasable;
      
      switch (_selectedFilter) {
        case 'Services':
          type = 'Service';
          break;
        case 'Inventory Items':
          type = 'Goods';
          break;
        case 'Active Items':
          break;
        case 'Inactive Items':
          break;
      }

      final items = await _itemService.fetchAllItems(
        type: type,
        isSellable: isSellable,
        isPurchasable: isPurchasable,
        search: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
        startDate: _startDate,
        endDate: _endDate,
        page: _currentPage,
        limit: _itemsPerPage,
      );

      setState(() {
        _items = items;
        _isLoading = false;
        _error = null;
        _totalItems = items.length;
        _totalPages = (_totalItems / _itemsPerPage).ceil();
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  void _onSearchChanged() {
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        _currentPage = 1;
        _loadItems();
      }
    });
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _startDate = null;
      _endDate = null;
      _selectedFilter = 'All Items';
      _currentPage = 1;
    });
    _loadItems();
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF4285F4),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
        _currentPage = 1;
      });
      _loadItems();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: Column(
        children: [
          // Top bar with filter and new button
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Colors.grey[200]!, width: 1),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: DropdownButton<String>(
                    value: _selectedFilter,
                    underline: const SizedBox(),
                    icon: Icon(Icons.arrow_drop_down, color: Colors.grey[600]),
                    style: TextStyle(
                      color: Colors.grey[800],
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    items: _filterOptions.map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      if (newValue != null) {
                        setState(() {
                          _selectedFilter = newValue;
                          _currentPage = 1;
                        });
                        _loadItems();
                      }
                    },
                  ),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: _showNewItemDialog,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('New'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4285F4),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _showMoreOptions,
                  icon: Icon(Icons.more_vert, color: Colors.grey[600]),
                  tooltip: 'More options',
                ),
              ],
            ),
          ),
          
          // Search and filter bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Colors.grey[200]!, width: 1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search items by name or description...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.clear, color: Colors.grey[600]),
                              onPressed: () {
                                _searchController.clear();
                                _onSearchChanged();
                              },
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF4285F4)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onChanged: (value) => _onSearchChanged(),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: _selectDateRange,
                  icon: Icon(
                    Icons.date_range,
                    size: 18,
                    color: _startDate != null ? const Color(0xFF4285F4) : Colors.grey[600],
                  ),
                  label: Text(
                    _startDate != null && _endDate != null
                        ? '${DateFormat('MMM dd').format(_startDate!)} - ${DateFormat('MMM dd').format(_endDate!)}'
                        : 'Date Range',
                    style: TextStyle(
                      color: _startDate != null ? const Color(0xFF4285F4) : Colors.grey[700],
                      fontSize: 14,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color: _startDate != null ? const Color(0xFF4285F4) : Colors.grey[300]!,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
                const SizedBox(width: 8),
                if (_searchController.text.isNotEmpty || _startDate != null || _selectedFilter != 'All Items')
                  TextButton.icon(
                    onPressed: _clearFilters,
                    icon: const Icon(Icons.clear_all, size: 18),
                    label: const Text('Clear'),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.grey[600],
                    ),
                  ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () => _loadItems(),
                  icon: Icon(Icons.refresh, color: Colors.grey[600]),
                  tooltip: 'Refresh',
                ),
              ],
            ),
          ),
          
          // Main content
          Expanded(
            child: _buildMainContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildMainContent() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Items',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _isLoading 
                        ? 'Loading items...'
                        : 'Manage your products and services • ${_items.length} items',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const Spacer(),
              if (_error != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.red[200]!),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.error_outline, size: 16, color: Colors.red[700]),
                      const SizedBox(width: 6),
                      Text(
                        'Error loading items',
                        style: TextStyle(
                          color: Colors.red[700],
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: _buildItemsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildItemsList() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4285F4)),
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Error Loading Items',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => _loadItems(),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4285F4),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    if (_items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              _searchController.text.isNotEmpty || _startDate != null
                  ? 'No items found'
                  : 'No items yet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _searchController.text.isNotEmpty || _startDate != null
                  ? 'Try adjusting your search or filters'
                  : 'Create your first item to get started',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _searchController.text.isNotEmpty || _startDate != null
                  ? _clearFilters
                  : _showNewItemDialog,
              icon: Icon(_searchController.text.isNotEmpty || _startDate != null
                  ? Icons.clear_all
                  : Icons.add),
              label: Text(_searchController.text.isNotEmpty || _startDate != null
                  ? 'Clear Filters'
                  : 'Create Item'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4285F4),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

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
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(8),
                topRight: Radius.circular(8),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text(
                    'Item Name',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Type',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Selling Price',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Cost Price',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Created',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Text(
                    'Actions',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _items.length,
              itemBuilder: (context, index) {
                return _buildItemRow(_items[index], index);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemRow(Map<String, dynamic> item, int index) {
    final createdAt = item['createdAt'] != null 
        ? DateTime.parse(item['createdAt'])
        : DateTime.now();
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[200]!, width: 1),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'] ?? 'Unknown Item',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[800],
                  ),
                ),
                if (item['unit'] != null)
                  Text(
                    'Unit: ${item['unit']}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: item['type'] == 'Service' 
                    ? Colors.blue[50] 
                    : Colors.green[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                item['type'] ?? 'Unknown',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: item['type'] == 'Service' 
                      ? Colors.blue[700] 
                      : Colors.green[700],
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              item['sellingPrice'] != null 
                  ? '₹${item['sellingPrice'].toStringAsFixed(2)}'
                  : '-',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              item['costPrice'] != null 
                  ? '₹${item['costPrice'].toStringAsFixed(2)}'
                  : '-',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              DateFormat('MMM dd, yyyy').format(createdAt),
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ),
          Expanded(
            flex: 1,
            child: PopupMenuButton<String>(
              icon: Icon(Icons.more_vert, color: Colors.grey[600], size: 18),
              onSelected: (value) => _handleItemAction(value, item),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, size: 16),
                      SizedBox(width: 8),
                      Text('Edit'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, size: 16, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Delete', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleItemAction(String action, Map<String, dynamic> item) {
    switch (action) {
      case 'edit':
        _editItem(item);
        break;
      case 'delete':
        _deleteItem(item);
        break;
    }
  }

  void _editItem(Map<String, dynamic> item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NewItemBilling(itemToEdit: item),
      ),
    ).then((result) {
      if (result == true) {
        _loadItems(showLoading: false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Item updated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }

  void _deleteItem(Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Item'),
        content: Text('Are you sure you want to delete "${item['name']}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await _itemService.deleteItem(item['_id']);
                _loadItems(showLoading: false);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Item deleted successfully!'),
                    backgroundColor: Colors.green,
                  ),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Error deleting item: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showNewItemDialog() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const NewItemBilling(),
      ),
    ).then((result) {
      if (result == true) {
        _loadItems(showLoading: false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Item created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }

  void _showMoreOptions() {
    showMenu<String>(
      context: context,
      position: RelativeRect.fromLTRB(
        MediaQuery.of(context).size.width - 200,
        60,
        20,
        0,
      ),
      items: [
        PopupMenuItem<String>(
          value: 'sort',
          child: Row(
            children: [
              const Icon(Icons.sort, color: Color(0xFF4285F4), size: 20),
              const SizedBox(width: 12),
              const Text('Sort by', style: TextStyle(fontSize: 14)),
              const Spacer(),
              Icon(Icons.chevron_right, color: Colors.grey[600], size: 16),
            ],
          ),
        ),
        const PopupMenuItem<String>(
          value: 'import',
          child: Row(
            children: [
              Icon(Icons.download, color: Color(0xFF4285F4), size: 20),
              SizedBox(width: 12),
              Text('Import Items', style: TextStyle(fontSize: 14)),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'export',
          child: Row(
            children: [
              const Icon(Icons.upload, color: Color(0xFF4285F4), size: 20),
              const SizedBox(width: 12),
              const Text('Export', style: TextStyle(fontSize: 14)),
              const Spacer(),
              Icon(Icons.chevron_right, color: Colors.grey[600], size: 16),
            ],
          ),
        ),
      ],
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ).then((String? result) {
      if (result != null) {
        _handleMenuAction(result);
      }
    });
  }

  void _handleMenuAction(String action) {
    switch (action) {
      case 'sort':
        _showSortOptions();
        break;
      case 'import':
        _showImportDialog();
        break;
      case 'export':
        _showExportDialog();
        break;
    }
  }

  // ========== IMPORT FUNCTIONALITY ==========
  
  Future<void> _showImportDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.download, color: Color(0xFF4285F4)),
              SizedBox(width: 8),
              Text('Import Items'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Choose how you want to import items:'),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.file_upload, color: Color(0xFF4285F4)),
                title: const Text('Upload CSV File'),
                subtitle: const Text('Import items from a CSV file'),
                onTap: () {
                  Navigator.of(context).pop();
                  _handleCSVUpload();
                },
              ),
              ListTile(
                leading: const Icon(Icons.cloud_download, color: Color(0xFF4285F4)),
                title: const Text('Download Template'),
                subtitle: const Text('Get the CSV template file with sample data'),
                onTap: () {
                  Navigator.of(context).pop();
                  _downloadTemplate();
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _handleCSVUpload() async {
    try {
      final file = await _itemService.pickCSVFile();
      
      if (file == null) {
        return;
      }

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      final result = await _itemService.importItemsFromCSV(file);

      Navigator.of(context).pop();

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(
                result['success'] ? Icons.check_circle : Icons.error,
                color: result['success'] ? Colors.green : Colors.red,
              ),
              const SizedBox(width: 8),
              const Text('Import Complete'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Successfully imported: ${result['successCount']} items'),
              if (result['errorCount'] > 0) ...[
                const SizedBox(height: 8),
                Text(
                  'Failed: ${result['errorCount']} items',
                  style: const TextStyle(color: Colors.red),
                ),
              ],
              if (result['errors'] != null && result['errors'].isNotEmpty) ...[
                const SizedBox(height: 12),
                const Text('Errors:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Container(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: (result['errors'] as List).map((error) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Text(
                            '• ${error['row']}: ${error['error']}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                if (result['success']) {
                  _loadItems();
                }
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Import failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _downloadTemplate() async {
    try {
      final filePath = await _itemService.downloadCSVTemplate();
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(kIsWeb 
            ? '✅ Template downloaded! Check your Downloads folder.' 
            : '✅ Template saved to: $filePath'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 5),
          action: kIsWeb ? null : SnackBarAction(
            label: 'Open',
            textColor: Colors.white,
            onPressed: () async {
              try {
                await OpenFile.open(filePath);
              } catch (e) {
                print('Error opening file: $e');
              }
            },
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to download template: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ========== EXPORT FUNCTIONALITY ==========
  
  Future<void> _showExportDialog() async {
    showMenu<String>(
      context: context,
      position: RelativeRect.fromLTRB(
        MediaQuery.of(context).size.width - 200,
        100,
        20,
        0,
      ),
      items: [
        PopupMenuItem<String>(
          value: 'csv',
          child: Row(
            children: [
              Icon(Icons.table_chart, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Export as CSV'),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'excel',
          child: Row(
            children: [
              Icon(Icons.grid_on, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Export as Excel'),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'pdf',
          child: Row(
            children: [
              Icon(Icons.picture_as_pdf, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Export as PDF'),
            ],
          ),
        ),
      ],
    ).then((String? result) {
      if (result != null) {
        _handleExport(result);
      }
    });
  }

  Future<void> _handleExport(String format) async {
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No items to export'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      String filePath;
      if (format == 'csv') {
        filePath = await _itemService.exportItemsToCSV(_items);
      } else if (format == 'excel') {
        filePath = await _itemService.exportItemsToExcel(_items);
      } else if (format == 'pdf') {
        filePath = await _itemService.exportItemsToPDF(_items);
      } else {
        throw Exception('Unsupported format');
      }

      if (!mounted) return;
      Navigator.of(context).pop();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(kIsWeb 
            ? '✅ Exported ${_items.length} items! Check your Downloads folder.' 
            : '✅ Exported ${_items.length} items to: $filePath'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 5),
          action: kIsWeb ? null : SnackBarAction(
            label: 'Open',
            textColor: Colors.white,
            onPressed: () async {
              try {
                await OpenFile.open(filePath);
              } catch (e) {
                print('Error opening file: $e');
              }
            },
          ),
        ),
      );
    } catch (e) {
      if (mounted && Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Export failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ========== SORT OPTIONS ==========
  
  void _showSortOptions() {
    showMenu<String>(
      context: context,
      position: RelativeRect.fromLTRB(
        MediaQuery.of(context).size.width - 200,
        100,
        20,
        0,
      ),
      items: [
        PopupMenuItem<String>(
          value: 'name_asc',
          child: Row(
            children: [
              Icon(Icons.sort_by_alpha, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Name (A-Z)'),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'name_desc',
          child: Row(
            children: [
              Icon(Icons.sort_by_alpha, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Name (Z-A)'),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'price_asc',
          child: Row(
            children: [
              Icon(Icons.attach_money, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Price (Low to High)'),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'price_desc',
          child: Row(
            children: [
              Icon(Icons.attach_money, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Price (High to Low)'),
            ],
          ),
        ),
        PopupMenuItem<String>(
          value: 'date_desc',
          child: Row(
            children: [
              Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 8),
              const Text('Newest First'),
            ],
          ),
        ),
      ],
    ).then((String? result) {
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sorting by: $result'),
            duration: const Duration(seconds: 2),
            backgroundColor: const Color(0xFF2C3E50),
          ),
        );
      }
    });
  }
}
