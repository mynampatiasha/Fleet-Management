import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb, Uint8List;
import 'package:abra_fleet/features/admin/vehicle_admin_management/vehicle_master/add_vehicle.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/vehicle_master/bulk_import_vehicles.dart';
import 'package:abra_fleet/features/admin/vehicle_admin_management/maintainace_managemnt/maintainance_management.dart';
import 'package:abra_fleet/core/services/vehicle_service.dart';
import 'package:abra_fleet/core/services/document_storage_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:async';
// Add these imports for Excel export
import 'package:excel/excel.dart' as excel;
import 'package:path_provider/path_provider.dart';
import 'dart:html' as html show AnchorElement, Blob, Url;

class _VehicleData {
  final String id;
  final String vehicleId;
  final String registration;
  final String type;
  final String model;
  final String status;
  final String year;
  final String engineType;
  final String engineCapacity;
  final String seatingCapacity;
  final String mileage;
  final String lastServiceDate;
  final String nextServiceDue;
  final String? assignedDriverName;
  final String? assignedDriverId;
  final DateTime? onboardedDate;
  final List<Map<String, dynamic>> documents;
  final String? vendor;
  final int assignedCustomersCount;
  final int maintenanceScheduleCount;

  const _VehicleData({
    required this.id,
    required this.vehicleId,
    required this.registration,
    required this.type,
    required this.model,
    required this.status,
    required this.year,
    required this.engineType,
    required this.engineCapacity,
    required this.seatingCapacity,
    required this.mileage,
    required this.lastServiceDate,
    required this.nextServiceDue,
    this.assignedDriverName,
    this.assignedDriverId,
    this.onboardedDate,
    this.documents = const [],
    this.vendor,
    this.assignedCustomersCount = 0,
    this.maintenanceScheduleCount = 0,
  });

  bool get hasExpiredDocuments {
    final now = DateTime.now();
    return documents.any((doc) {
      final expiryDate = doc['expiryDate'];
      return expiryDate != null && DateTime.parse(expiryDate).isBefore(now);
    });
  }

  bool get hasExpiringSoonDocuments {
    final now = DateTime.now();
    final thirtyDaysFromNow = now.add(const Duration(days: 30));
    return documents.any((doc) {
      final expiryDate = doc['expiryDate'];
      if (expiryDate == null) return false;
      final expiry = DateTime.parse(expiryDate);
      return expiry.isAfter(now) && expiry.isBefore(thirtyDaysFromNow);
    });
  }

  factory _VehicleData.fromBackend(Map<String, dynamic> data) {
    String mongoId = '';
    if (data['_id'] != null) {
      if (data['_id'] is Map) {
        mongoId = data['_id']['\$oid'] ?? '';
      } else {
        mongoId = data['_id'].toString();
      }
    }

    // Extract assigned driver information
    String? driverName;
    String? driverId;
    
    if (data['assignedDriver'] != null) {
      final driver = data['assignedDriver'];
      driverName = driver['name'] ?? driver['personalInfo']?['firstName'] ?? 'Unknown Driver';
      driverId = driver['driverId'];
    }

    // Extract documents
    List<Map<String, dynamic>> vehicleDocs = [];
    if (data['documents'] != null && data['documents'] is List) {
      vehicleDocs = (data['documents'] as List).map((doc) => Map<String, dynamic>.from(doc)).toList();
    }

    // Extract onboarded date
    DateTime? onboarded;
    if (data['onboardedDate'] != null) {
      try {
        onboarded = DateTime.parse(data['onboardedDate']);
      } catch (e) {
        onboarded = null;
      }
    }

    // Extract assigned customers count
    int assignedCount = 0;
    if (data['assignedCustomers'] != null && data['assignedCustomers'] is List) {
      assignedCount = (data['assignedCustomers'] as List).length;
    }

    // Extract maintenance schedule count
    int maintenanceCount = 0;
    if (data['maintenanceScheduleCount'] != null) {
      maintenanceCount = int.tryParse(data['maintenanceScheduleCount'].toString()) ?? 0;
    }

    return _VehicleData(
      id: mongoId,
      vehicleId: data['vehicleId'] ?? '',
      registration: data['registrationNumber'] ?? '',
      type: (data['type'] ?? '').toString().toUpperCase(),
      model: '${data['make'] ?? ''} ${data['model'] ?? ''}'.trim(),
      status: (data['status'] ?? 'active').toString().toUpperCase(),
      year: (data['year'] ?? data['yearOfManufacture'] ?? '').toString(),
      engineType: data['specifications']?['engineType'] ?? data['engineType'] ?? '',
      engineCapacity: (data['specifications']?['engineCapacity'] ?? data['engineCapacity'] ?? '').toString(),
      seatingCapacity: (() {
        try {
          if (data['seatCapacity'] != null) {
            return data['seatCapacity'].toString();
          }
          
          if (data['seatingCapacity'] != null) {
            return data['seatingCapacity'].toString();
          }
          
          if (data['capacity'] != null) {
            final capacity = data['capacity'];
            if (capacity is Map && capacity['passengers'] != null) {
              return capacity['passengers'].toString();
            } else if (capacity is num) {
              return capacity.toString();
            } else {
              return capacity.toString();
            }
          }
          
          return '4';
        } catch (e) {
          print('Error parsing seating capacity: $e');
          return '4';
        }
      })(),
      mileage: (data['specifications']?['mileage'] ?? data['mileage'] ?? '').toString(),
      lastServiceDate: data['maintenance']?['lastServiceDate'] != null 
          ? DateTime.parse(data['maintenance']['lastServiceDate']).toString().split(' ')[0]
          : '-',
      nextServiceDue: data['maintenance']?['nextServiceDue'] != null
          ? DateTime.parse(data['maintenance']['nextServiceDue']).toString().split(' ')[0]
          : '-',
      assignedDriverName: driverName,
      assignedDriverId: driverId,
      onboardedDate: onboarded,
      documents: vehicleDocs,
      vendor: data['vendor'],
      assignedCustomersCount: assignedCount,
      maintenanceScheduleCount: maintenanceCount,
    );
  }

  Map<String, dynamic> toMap() {
    final seatCapacity = int.tryParse(seatingCapacity) ?? 4;
    final driverSeats = assignedDriverName != null ? 1 : 0;
    final availableSeats = seatCapacity - driverSeats - assignedCustomersCount;
    
    return {
      'Vehicle ID': vehicleId,
      'Registration Number': registration,
      'Vehicle Type': type,
      'Make & Model': model,
      'Year of Manufacture': year,
      'Engine Type': engineType,
      'Engine Capacity (CC)': engineCapacity,
      'Seating Capacity': seatingCapacity,
      'Seat Availability': '$availableSeats/$seatCapacity',
      'Mileage (km/l)': mileage,
      'Status': status,
      'Vendor': vendor ?? 'Own Fleet',
      'Assigned Driver': assignedDriverName ?? 'Not Assigned',
      'Assigned Customers': assignedCustomersCount.toString(),
      'Last Service Date': lastServiceDate,
      'Next Service Due': nextServiceDue,
      'Onboarded Date': onboardedDate != null ? onboardedDate.toString().split(' ')[0] : 'Not Onboarded',
      'Document Status': hasExpiredDocuments 
          ? 'Has Expired Documents' 
          : hasExpiringSoonDocuments 
              ? 'Expiring Soon' 
              : documents.isNotEmpty 
                  ? 'All Valid' 
                  : 'No Documents',
    };
  }
}

class VehicleMasterScreen extends StatefulWidget {
  const VehicleMasterScreen({super.key});

  @override
  State<VehicleMasterScreen> createState() => _VehicleMasterScreenState();
}

class _VehicleMasterScreenState extends State<VehicleMasterScreen> with WidgetsBindingObserver {
  final VehicleService _vehicleService = VehicleService();
  final DocumentStorageService _documentStorageService = DocumentStorageService();
  List<Widget> _overlayStack = [];
  List<_VehicleData> _vehicleData = [];
  List<_VehicleData> _filteredVehicleData = [];
  bool _isLoading = true;
  String? _errorMessage;
  
  // Filter states
  String _selectedStatusFilter = 'All';
  String _selectedDocumentFilter = 'All';
  String _selectedVendorFilter = 'All';
  String _selectedDriverFilter = 'All';
  
  // Search controller
  final TextEditingController _searchController = TextEditingController();
  
  // Auto-refresh timer
  Timer? _refreshTimer;
  DateTime? _lastRefreshTime;

  @override
  void initState() {
    super.initState();
    _loadVehicles();
    _searchController.addListener(_applyFilters);
    WidgetsBinding.instance.addObserver(this);
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _refreshTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      print('🔄 Vehicle Master: App resumed, refreshing vehicles...');
      _loadVehicles();
    }
  }

  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (mounted && !_isLoading) {
        print('🔄 Vehicle Master: Auto-refresh triggered (every 30s)');
        _loadVehicles();
      }
    });
  }

  Future<void> _loadVehicles() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _vehicleService.getVehicles(limit: 100);
      
      if (response['success'] == true) {
        final List<dynamic> vehiclesData = response['data'] ?? [];
        setState(() {
          _vehicleData = vehiclesData
              .map((vehicle) => _VehicleData.fromBackend(vehicle))
              .toList();
          _applyFilters();
          _isLoading = false;
          _lastRefreshTime = DateTime.now();
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to load vehicles';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading vehicles: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    final searchQuery = _searchController.text.toLowerCase().trim();
    
    _filteredVehicleData = _vehicleData.where((vehicle) {
      // Search filter - enhanced to search across all fields
      if (searchQuery.isNotEmpty) {
        final seatCapacity = int.tryParse(vehicle.seatingCapacity) ?? 4;
        final driverSeats = vehicle.assignedDriverName != null ? 1 : 0;
        final assignedCustomers = vehicle.assignedCustomersCount;
        final availableSeats = seatCapacity - driverSeats - assignedCustomers;
        
        final matchesSearch = 
          vehicle.vehicleId.toLowerCase().contains(searchQuery) ||
          vehicle.registration.toLowerCase().contains(searchQuery) ||
          vehicle.type.toLowerCase().contains(searchQuery) ||
          vehicle.model.toLowerCase().contains(searchQuery) ||
          vehicle.status.toLowerCase().contains(searchQuery) ||
          vehicle.year.toLowerCase().contains(searchQuery) ||
          vehicle.engineType.toLowerCase().contains(searchQuery) ||
          vehicle.engineCapacity.toLowerCase().contains(searchQuery) ||
          vehicle.mileage.toLowerCase().contains(searchQuery) ||
          (vehicle.vendor?.toLowerCase().contains(searchQuery) ?? false) ||
          (vehicle.assignedDriverName?.toLowerCase().contains(searchQuery) ?? false) ||
          vehicle.seatingCapacity.contains(searchQuery) ||
          availableSeats.toString().contains(searchQuery) ||
          '$availableSeats/$seatCapacity'.contains(searchQuery) ||
          vehicle.lastServiceDate.toLowerCase().contains(searchQuery) ||
          vehicle.nextServiceDue.toLowerCase().contains(searchQuery);
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (_selectedStatusFilter != 'All' && 
          vehicle.status.toUpperCase() != _selectedStatusFilter.toUpperCase()) {
        return false;
      }
      
      // Vendor filter
      if (_selectedVendorFilter == 'Own Fleet' && vehicle.vendor != null && vehicle.vendor!.isNotEmpty) {
        return false;
      } else if (_selectedVendorFilter == 'Vendor' && (vehicle.vendor == null || vehicle.vendor!.isEmpty)) {
        return false;
      }
      
      // Driver filter
      if (_selectedDriverFilter == 'Assigned' && vehicle.assignedDriverName == null) {
        return false;
      } else if (_selectedDriverFilter == 'Not Assigned' && vehicle.assignedDriverName != null) {
        return false;
      }
      
      // Document filter
      if (_selectedDocumentFilter == 'Expired Documents' && !vehicle.hasExpiredDocuments) {
        return false;
      } else if (_selectedDocumentFilter == 'Expiring Soon' && !vehicle.hasExpiringSoonDocuments) {
        return false;
      } else if (_selectedDocumentFilter == 'All Valid' && 
                 (vehicle.hasExpiredDocuments || vehicle.hasExpiringSoonDocuments)) {
        return false;
      } else if (_selectedDocumentFilter == 'No Documents' && vehicle.documents.isNotEmpty) {
        return false;
      }
      
      return true;
    }).toList();
    
    setState(() {});
  }

  void _updateFilter(String filterType, String value) {
    setState(() {
      if (filterType == 'status') {
        _selectedStatusFilter = value;
      } else if (filterType == 'document') {
        _selectedDocumentFilter = value;
      } else if (filterType == 'vendor') {
        _selectedVendorFilter = value;
      } else if (filterType == 'driver') {
        _selectedDriverFilter = value;
      }
      _applyFilters();
    });
  }

  void _clearAllFilters() {
    setState(() {
      _selectedStatusFilter = 'All';
      _selectedDocumentFilter = 'All';
      _selectedVendorFilter = 'All';
      _selectedDriverFilter = 'All';
      _searchController.clear();
      _applyFilters();
    });
  }

  // Direct Excel Export Function
  Future<void> _exportToExcel() async {
    try {
      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text(
                'Generating Excel file...',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
        ),
      );

      // Create Excel workbook
      var excelFile = excel.Excel.createExcel();
      var sheet = excelFile['Vehicles'];

      // Add headers with styling
      final headers = [
        'Vehicle ID',
        'Registration Number',
        'Vehicle Type',
        'Make & Model',
        'Year of Manufacture',
        'Engine Type',
        'Engine Capacity (CC)',
        'Seating Capacity',
        'Seat Availability',
        'Mileage (km/l)',
        'Status',
        'Vendor',
        'Assigned Driver',
        'Assigned Customers',
        'Last Service Date',
        'Next Service Due',
        'Onboarded Date',
        'Document Status',
      ];

      // Add headers to first row with styling
      for (var i = 0; i < headers.length; i++) {
        var cell = sheet.cell(excel.CellIndex.indexByColumnRow(columnIndex: i, rowIndex: 0));
        cell.value = excel.TextCellValue(headers[i]);
        cell.cellStyle = excel.CellStyle(
          bold: true,
          backgroundColorHex: excel.ExcelColor.blue700,
          fontColorHex: excel.ExcelColor.white,
        );
      }

      // Add data rows (use ALL vehicles, not filtered)
      for (var i = 0; i < _vehicleData.length; i++) {
        final vehicle = _vehicleData[i];
        final vehicleMap = vehicle.toMap();
        
        for (var j = 0; j < headers.length; j++) {
          var cell = sheet.cell(excel.CellIndex.indexByColumnRow(columnIndex: j, rowIndex: i + 1));
          final value = vehicleMap[headers[j]] ?? '';
          cell.value = excel.TextCellValue(value.toString());
        }
      }

      // Auto-fit columns
      for (var i = 0; i < headers.length; i++) {
        sheet.setColumnWidth(i, 20);
      }

      // Generate Excel file bytes
      var fileBytes = excelFile.save();

      if (fileBytes == null) {
        throw Exception('Failed to generate Excel file');
      }

      // Close loading dialog
      if (mounted) Navigator.pop(context);

      // Download file
      if (kIsWeb) {
        // Web download
        final blob = html.Blob([fileBytes], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        final url = html.Url.createObjectUrlFromBlob(blob);
        final anchor = html.AnchorElement(href: url)
          ..setAttribute('download', 'Vehicles_Export_${DateTime.now().millisecondsSinceEpoch}.xlsx')
          ..click();
        html.Url.revokeObjectUrl(url);
      } else {
        // Mobile/Desktop download
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/Vehicles_Export_${DateTime.now().millisecondsSinceEpoch}.xlsx';
        final file = File(filePath);
        await file.writeAsBytes(fileBytes);
        
        // Show success message with file location
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Excel file saved to: $filePath'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 5),
              action: SnackBarAction(
                label: 'Open',
                textColor: Colors.white,
                onPressed: () async {
                  final uri = Uri.file(filePath);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  }
                },
              ),
            ),
          );
        }
      }

      // Show success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Successfully exported ${_vehicleData.length} vehicles to Excel'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // Close loading dialog if still open
      if (mounted) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error exporting to Excel: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _pushOverlay(Widget overlay) {
    setState(() {
      _overlayStack.add(overlay);
    });
  }

  void _popOverlay() {
    if (_overlayStack.isNotEmpty) {
      setState(() {
        _overlayStack.removeLast();
      });
    }
  }

  void _clearAllOverlays() {
    setState(() {
      _overlayStack.clear();
    });
  }

  void _showAddVehicleScreen() {
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Add New Vehicle',
        child: AddVehicleScreen(
          onCancel: _popOverlay,
          onSave: () {
            _popOverlay();
            _loadVehicles();
          },
        ),
      ),
    );
  }

  void _showBulkImportScreen() {
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Bulk Import Vehicles',
        child: BulkImportVehiclesScreen(
          onCancel: _popOverlay,
          onImportComplete: () {
            _popOverlay();
            _loadVehicles();
          },
        ),
      ),
    );
  }

  void _showVehicleDetails(String mongoId) {
    final vehicle = _vehicleData.firstWhere((v) => v.id == mongoId);
    
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Vehicle Details',
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Basic Information Card
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        vehicle.registration,
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      _buildDetailRow('Vehicle ID:', vehicle.vehicleId),
                      _buildDetailRow('Type:', vehicle.type),
                      _buildDetailRow('Model:', vehicle.model),
                      _buildDetailRow('Year:', vehicle.year),
                      _buildDetailRow('Vendor:', vehicle.vendor ?? 'Own Fleet'),
                      _buildDetailRow('Engine Type:', vehicle.engineType),
                      _buildDetailRow('Engine Capacity:', '${vehicle.engineCapacity} CC'),
                      const SizedBox(height: 8),
                      // Highlighted Seat Capacity
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.airline_seat_recline_normal, color: Colors.blue.shade700, size: 24),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Seating Capacity',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  '${vehicle.seatingCapacity} seats total',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue.shade700,
                                  ),
                                ),
                                if (vehicle.assignedDriverName != null)
                                  Text(
                                    '${int.tryParse(vehicle.seatingCapacity) != null ? (int.parse(vehicle.seatingCapacity) - 1) : vehicle.seatingCapacity} seats for customers (1 for driver)',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      _buildDetailRow('Mileage:', '${vehicle.mileage} km/l'),
                      _buildDetailRow('Status:', vehicle.status),
                      _buildDetailRow('Assigned Driver:', vehicle.assignedDriverName ?? 'Not Assigned'),
                      _buildDetailRow('Assigned Customers:', '${vehicle.assignedCustomersCount}'),
                      _buildDetailRow('Last Service:', vehicle.lastServiceDate),
                      _buildDetailRow('Next Service Due:', vehicle.nextServiceDue),
                      if (vehicle.onboardedDate != null)
                        _buildDetailRow('Onboarded:', vehicle.onboardedDate.toString().split(' ')[0]),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Vehicle Documents Card
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Vehicle Documents',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          ElevatedButton.icon(
                            onPressed: () => _showAddDocumentDialog(vehicle.id, false),
                            icon: const Icon(Icons.add, size: 18),
                            label: const Text('Add Document'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue.shade700,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (vehicle.documents.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Text('No vehicle documents uploaded', style: TextStyle(color: Colors.grey)),
                        )
                      else
                        ...vehicle.documents.map((doc) => _buildDocumentTile(doc, vehicle.id, false)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton.icon(
                    onPressed: () async {
                      await _loadVehicles();
                      _popOverlay();
                      _showVehicleDetails(vehicle.id);
                    },
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Refresh'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade700,
                      foregroundColor: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 12),
                  TextButton(
                    onPressed: _popOverlay,
                    child: const Text('Close'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: () {
                      _popOverlay();
                      _showEditVehicle(vehicle.id);
                    },
                    child: const Text('Edit Vehicle'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.grey),
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

  Widget _buildDocumentTile(Map<String, dynamic> doc, String vehicleId, bool isDriverDoc) {
    final expiryDate = doc['expiryDate'] != null ? DateTime.parse(doc['expiryDate']) : null;
    final isExpired = expiryDate != null && expiryDate.isBefore(DateTime.now());
    final isExpiringSoon = expiryDate != null && 
        expiryDate.isAfter(DateTime.now()) && 
        expiryDate.isBefore(DateTime.now().add(const Duration(days: 30)));
    
    Color statusColor = Colors.green;
    String statusText = 'Valid';
    IconData statusIcon = Icons.check_circle;
    
    if (isExpired) {
      statusColor = Colors.red;
      statusText = 'Expired';
      statusIcon = Icons.error;
    } else if (isExpiringSoon) {
      statusColor = Colors.orange;
      statusText = 'Expiring Soon';
      statusIcon = Icons.warning;
    }

    final documentUrl = doc['documentUrl'] as String?;
    final hasRealDocument = documentUrl != null && 
        !documentUrl.contains('placeholder') && 
        documentUrl.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: statusColor.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(8),
        color: statusColor.withOpacity(0.05),
      ),
      child: Row(
        children: [
          Icon(Icons.description, color: statusColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doc['documentName'] ?? doc['documentType'] ?? 'Unknown Document',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  'Type: ${doc['documentType'] ?? 'N/A'}',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                ),
                if (expiryDate != null)
                  Text(
                    'Expires: ${expiryDate.toString().split(' ')[0]}',
                    style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                if (!hasRealDocument)
                  Text(
                    'No file uploaded',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontStyle: FontStyle.italic),
                  ),
              ],
            ),
          ),
          Chip(
            label: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(statusIcon, size: 14, color: statusColor),
                const SizedBox(width: 4),
                Text(statusText, style: TextStyle(color: statusColor, fontSize: 11)),
              ],
            ),
            backgroundColor: statusColor.withOpacity(0.1),
            side: BorderSide(color: statusColor.withOpacity(0.3)),
          ),
          const SizedBox(width: 8),
          if (hasRealDocument)
            IconButton(
              icon: const Icon(Icons.download, size: 20),
              color: Colors.blue.shade700,
              onPressed: () => _viewDocument(documentUrl),
              tooltip: 'View/Download Document',
            ),
          IconButton(
            icon: const Icon(Icons.delete, size: 20),
            color: Colors.red.shade700,
            onPressed: () => _deleteDocument(vehicleId, doc['id'], isDriverDoc),
            tooltip: 'Delete Document',
          ),
        ],
      ),
    );
  }

  Future<void> _viewDocument(String documentUrl) async {
    try {
      String fullUrl = documentUrl;
      if (documentUrl.startsWith('/api/')) {
        fullUrl = 'http://localhost:3001$documentUrl';
      }
      
      print('Opening document: $fullUrl');
      
      final Uri url = Uri.parse(fullUrl);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        if (kIsWeb) {
          await launchUrl(url, mode: LaunchMode.platformDefault);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Cannot open document. URL may be invalid.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error opening document: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _showAddDocumentDialog(String vehicleId, bool isDriverDoc) async {
    final documentNameController = TextEditingController();
    DateTime? selectedExpiryDate;
    String? selectedDocumentType;
    File? selectedFile;
    Uint8List? selectedFileBytes;
    String? selectedFileName;

    final documentTypes = ['Registration', 'Insurance', 'Permit', 'Fitness Certificate', 'Pollution Certificate', 'Other'];

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Vehicle Document'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedDocumentType,
                  decoration: const InputDecoration(
                    labelText: 'Document Type *',
                    border: OutlineInputBorder(),
                  ),
                  items: documentTypes.map((type) {
                    return DropdownMenuItem(value: type, child: Text(type));
                  }).toList(),
                  onChanged: (value) {
                    setState(() => selectedDocumentType = value);
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: documentNameController,
                  decoration: const InputDecoration(
                    labelText: 'Document Name *',
                    border: OutlineInputBorder(),
                    hintText: 'e.g., DL-2024-12345',
                  ),
                ),
                const SizedBox(height: 16),
                
                // File Upload Section
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.upload_file, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          const Text(
                            'Upload Document File',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (selectedFileName != null)
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.green.shade200),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.check_circle, color: Colors.green.shade700, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  selectedFileName!,
                                  style: TextStyle(color: Colors.green.shade900, fontSize: 12),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, size: 18),
                                onPressed: () {
                                  setState(() {
                                    selectedFile = null;
                                    selectedFileName = null;
                                  });
                                },
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                            ],
                          ),
                        )
                      else
                        ElevatedButton.icon(
                          onPressed: () async {
                            try {
                              FilePickerResult? result = await FilePicker.platform.pickFiles(
                                type: FileType.custom,
                                allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
                                withData: true,
                              );

                              if (result != null) {
                                final pickedFile = result.files.single;
                                
                                setState(() {
                                  selectedFileName = pickedFile.name;
                                  
                                  if (kIsWeb) {
                                    selectedFileBytes = pickedFile.bytes;
                                    selectedFile = null;
                                  } else {
                                    if (pickedFile.path != null) {
                                      selectedFile = File(pickedFile.path!);
                                      selectedFileBytes = null;
                                    }
                                  }
                                });
                              }
                            } catch (e) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Error picking file: $e')),
                              );
                            }
                          },
                          icon: const Icon(Icons.folder_open, size: 18),
                          label: const Text('Choose File'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue.shade700,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      const SizedBox(height: 4),
                      Text(
                        'Supported: PDF, JPG, PNG, DOC, DOCX',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Expiry Date (Optional)'),
                  subtitle: Text(
                    selectedExpiryDate != null
                        ? selectedExpiryDate.toString().split(' ')[0]
                        : 'No expiry date set',
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now().add(const Duration(days: 365)),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 3650)),
                      );
                      if (date != null) {
                        setState(() => selectedExpiryDate = date);
                      }
                    },
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
            ElevatedButton(
              onPressed: () async {
                if (selectedDocumentType == null || documentNameController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please fill all required fields')),
                  );
                  return;
                }

                Navigator.pop(context);
                await _addDocumentWithFile(
                  vehicleId,
                  selectedDocumentType!,
                  documentNameController.text,
                  selectedExpiryDate,
                  isDriverDoc,
                  selectedFile,
                  selectedFileBytes,
                  selectedFileName,
                );
              },
              child: const Text('Add Document'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _addDocumentWithFile(
    String vehicleId,
    String documentType,
    String documentName,
    DateTime? expiryDate,
    bool isDriverDoc,
    File? file,
    Uint8List? fileBytes,
    String? fileName,
  ) async {
    if (isDriverDoc) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Driver documents should be managed in Driver Management'),
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text(
                'Uploading document...',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
        ),
      );

      final response = await _vehicleService.uploadVehicleDocumentToMongoDB(
        vehicleId: vehicleId,
        file: file,
        bytes: fileBytes,
        fileName: fileName ?? 'document.pdf',
        documentType: documentType,
        documentName: documentName,
        expiryDate: expiryDate,
        isDriverDoc: false,
      );

      Navigator.pop(context);

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Document uploaded successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadVehicles();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to upload document'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error uploading document: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _deleteDocument(String vehicleId, String documentId, bool isDriverDoc) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Document'),
        content: const Text('Are you sure you want to delete this document?'),
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

    if (confirmed != true) return;

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final response = await _vehicleService.deleteVehicleDocument(
        vehicleId,
        documentId,
        isDriverDoc,
      );

      Navigator.pop(context);

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Document deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadVehicles();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to delete document'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error deleting document: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showEditVehicle(String mongoId) {
    final vehicle = _vehicleData.firstWhere((v) => v.id == mongoId);
    
    String normalizeVehicleType(String type) {
      final typeMap = {
        'BUS': 'Bus',
        'VAN': 'Van',
        'CAR': 'Car',
        'TRUCK': 'Truck',
        'MINI BUS': 'Mini Bus',
      };
      return typeMap[type.toUpperCase()] ?? 'Car';
    }
    
    _pushOverlay(
      _buildOverlayWrapper(
        title: 'Edit Vehicle',
        child: AddVehicleScreen(
          onCancel: _popOverlay,
          onSave: () {
            _popOverlay();
            _loadVehicles();
          },
          isEditMode: true,
          vehicleId: vehicle.id,
          initialData: {
            'registrationNumber': vehicle.registration,
            'vehicleType': normalizeVehicleType(vehicle.type),
            'makeModel': vehicle.model,
            'yearOfManufacture': int.tryParse(vehicle.year) ?? DateTime.now().year,
            'engineType': vehicle.engineType,
            'engineCapacity': double.tryParse(vehicle.engineCapacity) ?? 0.0,
            'seatingCapacity': int.tryParse(vehicle.seatingCapacity) ?? 0,
            'mileage': double.tryParse(vehicle.mileage) ?? 0.0,
            'status': vehicle.status,
            'vendor': vehicle.vendor,
          },
        ),
      ),
    );
  }

  Future<void> _deleteVehicle(String mongoId, String registrationNumber) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Vehicle'),
        content: Text('Are you sure you want to delete vehicle $registrationNumber? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      final response = await _vehicleService.deleteVehicle(mongoId);

      Navigator.pop(context);

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Vehicle deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadVehicles();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to delete vehicle'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      Navigator.pop(context);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error deleting vehicle: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Navigate to Maintenance Management page
  void _navigateToMaintenanceManagement(String vehicleId, String vehicleNumber) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const MaintenanceManagementScreen(),
      ),
    ).then((_) {
      // Refresh vehicle data when returning from maintenance page
      _loadVehicles();
    });
    
    // Show a snackbar to inform the user
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Opening maintenance management for $vehicleNumber'),
        duration: const Duration(seconds: 2),
        backgroundColor: Colors.orange.shade700,
      ),
    );
  }

  Widget _buildOverlayWrapper({
    required String title,
    required Widget child,
    double? width,
    double? height,
  }) {
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          width: width ?? MediaQuery.of(context).size.width * 0.9,
          height: height ?? MediaQuery.of(context).size.height * 0.85,
          margin: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: _popOverlay,
                      icon: const Icon(Icons.arrow_back, color: Colors.black),
                      tooltip: 'Back',
                    ),
                    const SizedBox(width: 12),
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.black,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: _clearAllOverlays,
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                  child: child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildVehicleMasterView(),
          ..._overlayStack,
        ],
      ),
    );
  }

  Widget _buildVehicleMasterView() {
    return RefreshIndicator(
      onRefresh: _loadVehicles,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Action Buttons Row
            Wrap(
              spacing: 12.0,
              runSpacing: 12.0,
              children: [
                _buildActionButton(
                  context,
                  icon: Icons.add,
                  label: 'Add New Vehicle',
                  onPressed: _showAddVehicleScreen,
                  color: const Color(0xFF0D47A1),
                ),
                _buildActionButton(
                  context, 
                  icon: Icons.cloud_upload, 
                  label: 'Bulk Import', 
                  onPressed: _showBulkImportScreen, 
                  color: Colors.grey.shade700
                ),
                _buildActionButton(
                  context, 
                  icon: Icons.download, 
                  label: 'Export to Excel', 
                  onPressed: _exportToExcel,
                  color: Colors.green.shade700
                ),
                _buildActionButton(
                  context, 
                  icon: Icons.refresh, 
                  label: 'Refresh', 
                  onPressed: _loadVehicles, 
                  color: Colors.blue.shade700
                ),
              ],
            ),
            
            if (_lastRefreshTime != null) ...[
              const SizedBox(height: 8),
              Text(
                'Last updated: ${_lastRefreshTime!.hour}:${_lastRefreshTime!.minute.toString().padLeft(2, '0')}',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
            
            const SizedBox(height: 24),

            // Enhanced Search Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Icon(Icons.search, color: Colors.grey.shade600, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search by ID, registration, type, model, year, engine, driver, vendor, seat availability...',
                        hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 14),
                        border: InputBorder.none,
                        isDense: true,
                      ),
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                  if (_searchController.text.isNotEmpty)
                    IconButton(
                      icon: Icon(Icons.clear, color: Colors.grey.shade600, size: 20),
                      onPressed: () {
                        _searchController.clear();
                      },
                      tooltip: 'Clear search',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Enhanced Filter Chips
            Wrap(
              spacing: 8.0,
              runSpacing: 8.0,
              children: [
                _buildFilterChip('Status', _selectedStatusFilter, ['All', 'Active', 'Maintenance', 'Inactive'], 'status'),
                _buildFilterChip('Vendor', _selectedVendorFilter, ['All', 'Own Fleet', 'Vendor'], 'vendor'),
                _buildFilterChip('Driver', _selectedDriverFilter, ['All', 'Assigned', 'Not Assigned'], 'driver'),
                _buildFilterChip('Documents', _selectedDocumentFilter, ['All', 'Expired Documents', 'Expiring Soon', 'All Valid', 'No Documents'], 'document'),
                
                // Clear all filters button
                if (_selectedStatusFilter != 'All' || 
                    _selectedDocumentFilter != 'All' ||
                    _selectedVendorFilter != 'All' ||
                    _selectedDriverFilter != 'All' ||
                    _searchController.text.isNotEmpty)
                  ActionChip(
                    avatar: const Icon(Icons.clear_all, size: 18),
                    label: const Text('Clear All Filters'),
                    onPressed: _clearAllFilters,
                    backgroundColor: Colors.red.shade50,
                    labelStyle: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.bold),
                  ),
              ],
            ),
            const SizedBox(height: 24),

            // Statistics Cards Row
            Row(
              children: [
                Expanded(
                  child: _buildStatsCard(
                    'Total Vehicles', 
                    _vehicleData.length.toString(),
                    Icons.directions_car,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatsCard(
                    'Active', 
                    _vehicleData.where((v) => v.status.toUpperCase() == 'ACTIVE').length.toString(),
                    Icons.check_circle,
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatsCard(
                    'Assigned', 
                    _vehicleData.where((v) => v.assignedDriverName != null).length.toString(),
                    Icons.person,
                    Colors.purple,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatsCard(
                    'Maintenance', 
                    _vehicleData.where((v) => v.status.toUpperCase() == 'MAINTENANCE').length.toString(),
                    Icons.build,
                    Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Content Area
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40.0),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_errorMessage != null)
              Center(
                child: Column(
                  children: [
                    Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      style: TextStyle(color: Colors.red.shade700),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadVehicles,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            else if (_vehicleData.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey.shade400),
                    const SizedBox(height: 16),
                    Text(
                      'No vehicles found',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _showAddVehicleScreen,
                      icon: const Icon(Icons.add),
                      label: const Text('Add Your First Vehicle'),
                    ),
                  ],
                ),
              )
            else
              LayoutBuilder(
                builder: (context, constraints) {
                  final displayData = _filteredVehicleData.isEmpty ? _vehicleData : _filteredVehicleData;
                  if (displayData.isEmpty) {
                    return Center(
                      child: Column(
                        children: [
                          Icon(Icons.filter_alt_off, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 16),
                          Text(
                            'No vehicles match the selected filters',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _clearAllFilters,
                            child: const Text('Clear Filters'),
                          ),
                        ],
                      ),
                    );
                  }
                  if (constraints.maxWidth > 800) {
                    return _buildVehicleDataTable();
                  } else {
                    return _buildVehicleCardList();
                  }
                },
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 24),
                const Spacer(),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String currentValue, List<String> options, String filterType) {
    return PopupMenuButton<String>(
      child: Chip(
        avatar: const Icon(Icons.filter_list, size: 18),
        label: Text('$label: $currentValue'),
        backgroundColor: currentValue != 'All' ? Colors.blue.shade100 : Colors.grey.shade200,
      ),
      onSelected: (value) => _updateFilter(filterType, value),
      itemBuilder: (context) => options.map((option) {
        return PopupMenuItem<String>(
          value: option,
          child: Row(
            children: [
              if (option == currentValue)
                const Icon(Icons.check, size: 18, color: Colors.blue),
              if (option == currentValue)
                const SizedBox(width: 8),
              Text(option),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildVehicleDataTable() {
    final displayData = _filteredVehicleData.isEmpty ? _vehicleData : _filteredVehicleData;
    return Card(
      elevation: 4.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Vehicle ID', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Registration', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Type', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Model', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Year', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Vendor', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Seat Capacity', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Seat Availability', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Assigned Driver', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Documents', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Maintenance', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Actions', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
          rows: displayData.map((vehicle) => _buildVehicleDataRow(vehicle)).toList(),
        ),
      ),
    );
  }

  Widget _buildVehicleCardList() {
    final displayData = _filteredVehicleData.isEmpty ? _vehicleData : _filteredVehicleData;
    return ListView.separated(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: displayData.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final vehicle = displayData[index];
        
        // Calculate seat availability
        final seatCapacity = int.tryParse(vehicle.seatingCapacity) ?? 4;
        final driverSeats = vehicle.assignedDriverName != null ? 1 : 0;
        final assignedCustomers = vehicle.assignedCustomersCount;
        final availableSeats = seatCapacity - driverSeats - assignedCustomers;
        
        // Determine availability status color
        Color availabilityColor;
        if (availableSeats == 0) {
          availabilityColor = Colors.red.shade700;
        } else if (availableSeats <= 1) {
          availabilityColor = Colors.orange.shade700;
        } else {
          availabilityColor = Colors.green.shade700;
        }
        
        return Card(
          elevation: 4.0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(vehicle.registration, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    _buildStatusChip(vehicle.status),
                  ],
                ),
                const Divider(height: 16),
                _buildCardInfoRow('Vehicle ID:', vehicle.vehicleId),
                _buildCardInfoRow('Model:', vehicle.model),
                _buildCardInfoRow('Type:', vehicle.type),
                _buildCardInfoRow('Year:', vehicle.year),
                _buildCardInfoRow('Vendor:', vehicle.vendor ?? 'Own Fleet'),
                _buildCardInfoRow('Seat Capacity:', '${vehicle.seatingCapacity} seats'),
                // Seat Availability Row
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    children: [
                      Text('Seat Availability:', style: TextStyle(color: Colors.grey.shade600)),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: availabilityColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: availabilityColor.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.event_seat, size: 14, color: availabilityColor),
                            const SizedBox(width: 4),
                            Text(
                              '$availableSeats/$seatCapacity available',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: availabilityColor,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                _buildCardInfoRow('Assigned Driver:', vehicle.assignedDriverName ?? 'Not Assigned'),
                _buildCardInfoRow('Assigned Customers:', '${vehicle.assignedCustomersCount}'),
                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      icon: Icon(Icons.visibility, size: 18, color: Colors.blue.shade700),
                      label: Text('View', style: TextStyle(color: Colors.blue.shade700)),
                      onPressed: () => _showVehicleDetails(vehicle.id),
                    ),
                    const SizedBox(width: 8),
                    TextButton.icon(
                      icon: Icon(Icons.edit, size: 18, color: Colors.orange.shade700),
                      label: Text('Edit', style: TextStyle(color: Colors.orange.shade700)),
                      onPressed: () => _showEditVehicle(vehicle.id),
                    ),
                    const SizedBox(width: 8),
                    TextButton.icon(
                      icon: Icon(Icons.delete, size: 18, color: Colors.red.shade700),
                      label: Text('Delete', style: TextStyle(color: Colors.red.shade700)),
                      onPressed: () => _deleteVehicle(vehicle.id, vehicle.registration),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCardInfoRow(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text(title, style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(width: 8),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, {required IconData icon, required String label, required VoidCallback onPressed, required Color color}) {
    return ElevatedButton.icon(
      icon: Icon(icon, size: 18),
      label: Text(label),
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  Widget _buildDocumentStatusIndicator(_VehicleData vehicle) {
    if (vehicle.hasExpiredDocuments) {
      return Tooltip(
        message: 'Has expired documents',
        child: Icon(Icons.error, color: Colors.red.shade700, size: 20),
      );
    } else if (vehicle.hasExpiringSoonDocuments) {
      return Tooltip(
        message: 'Documents expiring soon',
        child: Icon(Icons.warning, color: Colors.orange.shade700, size: 20),
      );
    } else if (vehicle.documents.isNotEmpty) {
      return Tooltip(
        message: 'All documents valid',
        child: Icon(Icons.check_circle, color: Colors.green.shade700, size: 20),
      );
    } else {
      return Tooltip(
        message: 'No documents uploaded',
        child: Icon(Icons.info_outline, color: Colors.grey.shade600, size: 20),
      );
    }
  }

  DataRow _buildVehicleDataRow(_VehicleData vehicle) {
    final seatCapacity = int.tryParse(vehicle.seatingCapacity) ?? 4;
    final driverSeats = vehicle.assignedDriverName != null ? 1 : 0;
    final assignedCustomers = vehicle.assignedCustomersCount;
    final availableSeats = seatCapacity - driverSeats - assignedCustomers;
    
    Color availabilityColor;
    if (availableSeats == 0) {
      availabilityColor = Colors.red.shade700;
    } else if (availableSeats <= 1) {
      availabilityColor = Colors.orange.shade700;
    } else {
      availabilityColor = Colors.green.shade700;
    }
    
    return DataRow(cells: [
      DataCell(Text(vehicle.vehicleId)),
      DataCell(Text(vehicle.registration)),
      DataCell(Text(vehicle.type)),
      DataCell(Text(vehicle.model)),
      DataCell(Text(vehicle.year)),
      // Vendor Cell
      DataCell(
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              vehicle.vendor != null && vehicle.vendor!.isNotEmpty 
                ? Icons.business 
                : Icons.home_work,
              size: 16,
              color: vehicle.vendor != null && vehicle.vendor!.isNotEmpty 
                ? Colors.purple.shade700 
                : Colors.blue.shade700,
            ),
            const SizedBox(width: 4),
            Text(
              vehicle.vendor ?? 'Own Fleet',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: vehicle.vendor != null && vehicle.vendor!.isNotEmpty 
                  ? Colors.purple.shade700 
                  : Colors.blue.shade700,
              ),
            ),
          ],
        ),
      ),
      // Seat Capacity Cell
      DataCell(
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.airline_seat_recline_normal, size: 16, color: Colors.blue.shade700),
            const SizedBox(width: 4),
            Text(
              '$seatCapacity seats',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.blue.shade700,
              ),
            ),
          ],
        ),
      ),
      // Seat Availability Cell
      DataCell(
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: availabilityColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: availabilityColor.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.event_seat, size: 16, color: availabilityColor),
              const SizedBox(width: 6),
              Text(
                '$availableSeats/$seatCapacity',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: availabilityColor,
                  fontSize: 13,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                'available',
                style: TextStyle(
                  fontSize: 11,
                  color: availabilityColor,
                ),
              ),
            ],
          ),
        ),
      ),
      DataCell(
        vehicle.assignedDriverName != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.person, size: 16, color: Colors.green.shade700),
                  const SizedBox(width: 4),
                  Text(
                    vehicle.assignedDriverName!,
                    style: TextStyle(
                      fontWeight: FontWeight.w500,
                      color: Colors.green.shade700,
                    ),
                  ),
                ],
              )
            : Text(
                'Not Assigned',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontStyle: FontStyle.italic,
                ),
              ),
      ),
      DataCell(_buildStatusChip(vehicle.status)),
      DataCell(_buildDocumentStatusIndicator(vehicle)),
      // Maintenance Cell - Clickable to navigate to maintenance management
      DataCell(
        InkWell(
          onTap: () => _navigateToMaintenanceManagement(vehicle.id, vehicle.registration),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: vehicle.maintenanceScheduleCount > 0 
                ? Colors.orange.shade50 
                : Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: vehicle.maintenanceScheduleCount > 0 
                  ? Colors.orange.shade300 
                  : Colors.grey.shade300,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.build_circle,
                  size: 18,
                  color: vehicle.maintenanceScheduleCount > 0 
                    ? Colors.orange.shade700 
                    : Colors.grey.shade600,
                ),
                const SizedBox(width: 6),
                Text(
                  '${vehicle.maintenanceScheduleCount}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: vehicle.maintenanceScheduleCount > 0 
                      ? Colors.orange.shade700 
                      : Colors.grey.shade600,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  'scheduled',
                  style: TextStyle(
                    fontSize: 11,
                    color: vehicle.maintenanceScheduleCount > 0 
                      ? Colors.orange.shade700 
                      : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      DataCell(
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.visibility),
              color: Colors.blue.shade700,
              onPressed: () => _showVehicleDetails(vehicle.id),
              tooltip: 'View Details',
            ),
            IconButton(
              icon: const Icon(Icons.edit),
              color: Colors.orange.shade700,
              onPressed: () => _showEditVehicle(vehicle.id),
              tooltip: 'Edit Vehicle',
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              color: Colors.red.shade700,
              onPressed: () => _deleteVehicle(vehicle.id, vehicle.registration),
              tooltip: 'Delete Vehicle',
            ),
          ],
        ),
      ),
    ]);
  }

  Widget _buildStatusChip(String status) {
    final String normalizedStatus = status.toUpperCase();
    final Color color;
    final Color textColor;
    switch (normalizedStatus) {
      case 'ACTIVE':
        color = Colors.green.shade100;
        textColor = Colors.green.shade800;
        break;
      case 'MAINTENANCE':
        color = Colors.orange.shade100;
        textColor = Colors.orange.shade800;
        break;
      case 'INACTIVE':
        color = Colors.red.shade100;
        textColor = Colors.red.shade800;
        break;
      default:
        color = Colors.grey.shade200;
        textColor = Colors.grey.shade800;
    }
    return Chip(
      label: Text(normalizedStatus, style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 12)),
      backgroundColor: color,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      labelPadding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: -4.0),
    );
  }
}