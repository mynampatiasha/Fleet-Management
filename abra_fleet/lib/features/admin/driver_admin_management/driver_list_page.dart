// lib/features/admin/driver_admin_management/driver_list_page.dart

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb, Uint8List;
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/core/services/driver_service.dart';
import 'package:abra_fleet/core/services/vehicle_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io';

class DriverListPage extends StatefulWidget {
  final AuthRepository authRepository;
  final DriverService driverService;
  final VehicleService vehicleService;
  final String? initialDocumentFilter;
  final bool isEmbedded;

  const DriverListPage({
    Key? key,
    required this.authRepository,
    required this.driverService,
    required this.vehicleService,
    this.initialDocumentFilter,
    this.isEmbedded = false,
  }) : super(key: key);

  @override
  State<DriverListPage> createState() => _DriverListPageState();
}

class _DriverListPageState extends State<DriverListPage> {
  List<Map<String, dynamic>> _drivers = [];
  List<Map<String, dynamic>> _vehicles = [];
  bool _isLoading = false;
  String _selectedStatus = '';
  String _searchQuery = '';
  String _selectedVehicleFilter = '';
  String _selectedDocumentFilter = '';
  final TextEditingController _searchController = TextEditingController();

  Map<String, dynamic> _pagination = {
    'page': 1,
    'limit': 10,
    'total': 0,
    'pages': 1,
  };

  @override
  void initState() {
    super.initState();
    // Set initial document filter if provided
    if (widget.initialDocumentFilter != null) {
      _selectedDocumentFilter = widget.initialDocumentFilter!;
    }
    _fetchDrivers();
    _fetchVehicles();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchDrivers() async {
    setState(() => _isLoading = true);

    try {
      final response = await widget.driverService.getDrivers(
        status: _selectedStatus.isNotEmpty ? _selectedStatus : null,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        page: _pagination['page'] ?? 1,
        limit: _pagination['limit'] ?? 10,
        fullDetails: true, // ✅ Request full driver details including documents
      );

      if (response['success'] == true) {
        setState(() {
          _drivers = List<Map<String, dynamic>>.from(response['data'] ?? []);
          _pagination = response['pagination'] ?? _pagination;
        });
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch drivers');
      }
    } catch (e) {
      print('[DriverListPage] Error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load drivers: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchVehicles() async {
    try {
      // Fetch ALL vehicles (don't filter by status yet, we'll do that in getAvailableVehicles)
      final response = await widget.vehicleService.getVehicles(
        limit: 100,
      );
      
      if (response['success'] == true) {
        setState(() {
          _vehicles = List<Map<String, dynamic>>.from(response['data'] ?? []);
        });
        
        // 🐛 DEBUG: Print vehicles after fetching
        print('[DriverListPage] Fetched ${_vehicles.length} vehicles');
        if (_vehicles.isNotEmpty) {
          print('[DriverListPage] Sample vehicle: ${_vehicles.first}');
          print('[DriverListPage] Sample vehicle status: ${_vehicles.first['status']}');
          print('[DriverListPage] Sample vehicle capacity: ${_vehicles.first['capacity']}');
          print('[DriverListPage] Sample vehicle seatingCapacity: ${_vehicles.first['seatingCapacity']}');
          print('[DriverListPage] Sample vehicle seatCapacity: ${_vehicles.first['seatCapacity']}');
        }
      } else {
        print('[DriverListPage] Failed to fetch vehicles: ${response['message']}');
      }
    } catch (e) {
      print('[DriverListPage] Error fetching vehicles: $e');
    }
  }

  // Apply local filters after fetching
  List<Map<String, dynamic>> get _filteredDrivers {
    List<Map<String, dynamic>> filtered = List.from(_drivers);

    // Filter by vehicle assignment
    if (_selectedVehicleFilter == 'assigned') {
      filtered = filtered.where((d) => d['assignedVehicle'] != null).toList();
    } else if (_selectedVehicleFilter == 'unassigned') {
      filtered = filtered.where((d) => d['assignedVehicle'] == null).toList();
    }

    // Filter by document status
    if (_selectedDocumentFilter == 'expired') {
      filtered = filtered.where((d) => _hasExpiredDocuments(d)).toList();
    } else if (_selectedDocumentFilter == 'expiring_soon') {
      filtered = filtered.where((d) => _hasExpiringSoonDocuments(d)).toList();
    } else if (_selectedDocumentFilter == 'all_valid') {
      filtered = filtered.where((d) => !_hasExpiredDocuments(d) && !_hasExpiringSoonDocuments(d) && _hasDocuments(d)).toList();
    } else if (_selectedDocumentFilter == 'no_documents') {
      filtered = filtered.where((d) => !_hasDocuments(d)).toList();
    }

    return filtered;
  }

  bool _hasDocuments(Map<String, dynamic> driver) {
    final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    return documents.isNotEmpty;
  }

  bool _hasExpiredDocuments(Map<String, dynamic> driver) {
    final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    final now = DateTime.now();
    
    return documents.any((doc) {
      final expiryDate = doc['expiryDate'];
      if (expiryDate != null) {
        try {
          return DateTime.parse(expiryDate).isBefore(now);
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  }

  bool _hasExpiringSoonDocuments(Map<String, dynamic> driver) {
    final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    final now = DateTime.now();
    final thirtyDaysFromNow = now.add(const Duration(days: 30));
    
    return documents.any((doc) {
      final expiryDate = doc['expiryDate'];
      if (expiryDate != null) {
        try {
          final expiry = DateTime.parse(expiryDate);
          return expiry.isAfter(now) && expiry.isBefore(thirtyDaysFromNow);
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  }

  void _clearFilters() {
    setState(() {
      _selectedStatus = '';
      _selectedVehicleFilter = '';
      _selectedDocumentFilter = '';
      _searchQuery = '';
      _searchController.clear();
      _pagination['page'] = 1;
    });
    _fetchDrivers();
  }

  // Get available vehicles (not assigned to other drivers)
  List<Map<String, dynamic>> _getAvailableVehicles(String? currentDriverId) {
    // Get all vehicle IDs that are assigned to OTHER drivers (not the current one)
    final assignedVehicleIds = _drivers
        .where((driver) => 
            driver['assignedVehicle'] != null && 
            driver['driverId'] != currentDriverId)
        .map((driver) => driver['assignedVehicle']?['vehicleId'] ?? driver['assignedVehicle']?['_id'])
        .where((id) => id != null)
        .toSet();

    print('[DriverListPage] Assigned vehicle IDs (excluding current driver): $assignedVehicleIds');

    // Return vehicles that are:
    // 1. NOT in the assignedVehicleIds set (i.e., not assigned to other drivers)
    // 2. Have 'active' or 'ACTIVE' status (case-insensitive)
    final available = _vehicles.where((vehicle) {
      final vehicleId = vehicle['vehicleId'] ?? vehicle['_id'];
      final status = vehicle['status']?.toString().toUpperCase() ?? '';
      
      final isNotAssigned = !assignedVehicleIds.contains(vehicleId);
      final isActive = status == 'ACTIVE';
      
      print('[DriverListPage] Vehicle $vehicleId: status=$status, isActive=$isActive, isNotAssigned=$isNotAssigned');
      
      return isNotAssigned && isActive;
    }).toList();

    print('[DriverListPage] Found ${available.length} available vehicles');
    return available;
  }

  Future<void> _showVehicleAssignmentDialog(Map<String, dynamic> driver) async {
    // ✅ CRITICAL FIX: Refresh vehicles list BEFORE showing dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    await _fetchVehicles();
    
    if (!mounted) return;
    Navigator.pop(context); // Close loading dialog

    final currentVehicle = driver['assignedVehicle'];
    final currentVehicleId = currentVehicle?['_id'] ?? currentVehicle?['vehicleId'];
    final availableVehicles = _getAvailableVehicles(driver['driverId']);

    // 🐛 DEBUG: Print to see what's happening
    print('=== DEBUG ===');
    print('Total vehicles: ${_vehicles.length}');
    print('Available vehicles: ${availableVehicles.length}');
    print('Current driver: ${driver['driverId']}');
    print('Current vehicle ID: $currentVehicleId');
    
    // Print assigned vehicle IDs
    final assignedIds = _drivers
        .where((d) => d['assignedVehicle'] != null)
        .map((d) => d['assignedVehicle']?['vehicleId'] ?? d['assignedVehicle']?['_id'])
        .toList();
    print('Assigned vehicle IDs: $assignedIds');
    
    // Print all vehicle statuses and capacity info
    if (_vehicles.isNotEmpty) {
      print('Vehicle statuses and capacity:');
      for (var v in _vehicles) {
        print('  ${v['registrationNumber']}: status=${v['status']}, capacity=${v['capacity']}, seatingCapacity=${v['seatingCapacity']}, seatCapacity=${v['seatCapacity']}');
      }
    }
    
    // Print available vehicles capacity info
    if (availableVehicles.isNotEmpty) {
      print('Available vehicles capacity:');
      for (var v in availableVehicles) {
        print('  ${v['registrationNumber']}: capacity=${v['capacity']}, seatingCapacity=${v['seatingCapacity']}, seatCapacity=${v['seatCapacity']}');
      }
    }
    print('=============');
    
    // If current vehicle exists but isn't in available list, add it
    if (currentVehicle != null && !availableVehicles.any((v) => 
        (v['_id'] ?? v['vehicleId']) == currentVehicleId)) {
      availableVehicles.insert(0, currentVehicle);
    }

    String? selectedVehicleId = currentVehicleId;

    final result = await showDialog<String>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.directions_car, color: Color(0xFF1565C0)),
              const SizedBox(width: 12),
              const Expanded(
                child: Text('Assign Vehicle', style: TextStyle(fontSize: 18)),
              ),
            ],
          ),
          content: SizedBox(
            width: 400,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Driver: ${driver['name'] ?? 'N/A'}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  'Driver ID: ${driver['driverId'] ?? 'N/A'}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
                const SizedBox(height: 24),
                if (availableVehicles.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning, color: Colors.orange.shade700),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'No available vehicles. All active vehicles are assigned.',
                            style: TextStyle(color: Colors.orange.shade900),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Select Vehicle:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: selectedVehicleId,
                        isExpanded: true,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.grey.shade50,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                        ),
                        hint: const Text('Select a vehicle'),
                        items: [
                          const DropdownMenuItem<String>(value: 'UNASSIGN', child: Text('Unassign Vehicle')),
                          ...availableVehicles.map((vehicle) {
                            final vehicleId = vehicle['_id'] ?? vehicle['vehicleId'];
                            final isCurrentVehicle = vehicleId == currentVehicleId;
                            
                            return DropdownMenuItem<String>(
                              value: vehicleId,
                              child: Row(
                                children: [
                                  if (isCurrentVehicle)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade100,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text('CURRENT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue.shade700)),
                                    ),
                                  if (isCurrentVehicle) const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '${vehicle['registrationNumber']} - ${vehicle['make']} ${vehicle['model']}',
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ],
                        onChanged: (value) {
                          setDialogState(() {
                            selectedVehicleId = value;
                          });
                        },
                      ),
                      if (selectedVehicleId != null && selectedVehicleId != 'UNASSIGN') ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blue.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Vehicle Details:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 8),
                              ...availableVehicles
                                  .where((v) => (v['_id'] ?? v['vehicleId']) == selectedVehicleId)
                                  .map((vehicle) {
                                        // Extract seat capacity from various possible fields safely
                                        int? seatCapacity;
                                        try {
                                          if (vehicle['seatCapacity'] != null) {
                                            seatCapacity = int.tryParse(vehicle['seatCapacity'].toString());
                                          } else if (vehicle['seatingCapacity'] != null) {
                                            seatCapacity = int.tryParse(vehicle['seatingCapacity'].toString());
                                          } else if (vehicle['capacity'] != null) {
                                            final capacity = vehicle['capacity'];
                                            if (capacity is Map && capacity['passengers'] != null) {
                                              seatCapacity = int.tryParse(capacity['passengers'].toString());
                                            } else if (capacity is num) {
                                              seatCapacity = capacity.toInt();
                                            } else {
                                              seatCapacity = int.tryParse(capacity.toString());
                                            }
                                          }
                                        } catch (e) {
                                          print('Error parsing seat capacity: $e');
                                          seatCapacity = null;
                                        }
                                        
                                        if (seatCapacity == null && vehicle['seatCapacity'] != null) {
                                          seatCapacity = int.tryParse(vehicle['seatCapacity'].toString());
                                        }
                                        
                                        return Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            _buildDetailText('Type', vehicle['type']?.toString() ?? 'N/A'),
                                            _buildDetailText('Year', vehicle['year']?.toString() ?? 'N/A'),
                                            _buildDetailText('Capacity', seatCapacity != null ? '$seatCapacity seats' : 'N/A'),
                                          ],
                                        );
                                      })
                                  .toList(),
                            ],
                          ),
                        ),
                      ],
                    ],
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
              onPressed: availableVehicles.isEmpty ? null : () => Navigator.pop(context, selectedVehicleId),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1565C0),
                disabledBackgroundColor: Colors.grey.shade300,
              ),
              child: const Text('Assign'),
            ),
          ],
        ),
      ),
    );

    if (result != null) {
      await _assignVehicleToDriver(driver['driverId'], result);
    }
  }

  Widget _buildDetailText(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text('$label: ', style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Future<void> _assignVehicleToDriver(String driverId, String? vehicleId) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      Map<String, dynamic> response;
      
      if (vehicleId == 'UNASSIGN' || vehicleId == null) {
        // Unassign vehicle
        print('🚗 Driver List: Unassigning vehicle from driver $driverId');
        response = await widget.driverService.unassignVehicle(driverId);
      } else {
        // Assign vehicle - pass both driverId and vehicleId
        print('🚗 Driver List: Assigning vehicle $vehicleId to driver $driverId');
        response = await widget.driverService.assignVehicle(driverId, vehicleId);
      }

      if (!mounted) return;
      Navigator.pop(context); // Close loading dialog

      if (response['success'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              vehicleId == 'UNASSIGN' || vehicleId == null
                  ? 'Vehicle unassigned successfully'
                  : 'Vehicle assigned successfully',
            ),
            backgroundColor: Colors.green,
          ),
        );
        
        // ✅ Refresh both drivers and vehicles lists to sync UI
        print('🔄 Driver List: Refreshing drivers and vehicles after assignment...');
        await Future.wait([_fetchDrivers(), _fetchVehicles()]);
        print('✅ Driver List: Refresh complete - UI should now show updated assignments');
      } else {
        throw Exception(response['message'] ?? 'Failed to assign vehicle');
      }
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading dialog
      
      print('❌ Driver List: Assignment failed - $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _showDriverDetails(Map<String, dynamic> driver) async {
    // Fetch full driver details including documents
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await widget.driverService.getDriverById(driver['driverId']);
      Navigator.pop(context); // Close loading

      if (response != null && response['success'] != true) {
        throw Exception(response['message'] ?? 'Failed to load driver details');
      }

      final fullDriver = response?['data'];
      final vehicle = fullDriver?['assignedVehicle'];
      final documents = (fullDriver?['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
      
      await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.person, color: Color(0xFF1565C0)),
              const SizedBox(width: 12),
              const Expanded(child: Text('Driver Details')),
            ],
          ),
          content: SizedBox(
            width: 600,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Basic Information
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Basic Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 12),
                          _buildInfoRow('Driver ID', fullDriver['driverId'] ?? 'N/A'),
                          _buildInfoRow('Name', fullDriver['name'] ?? 'N/A'),
                          _buildInfoRow('Email', fullDriver['email'] ?? 'N/A'),
                          _buildInfoRow('Phone', fullDriver['phone'] ?? 'N/A'),
                          _buildInfoRow('Status', (fullDriver['status'] ?? 'N/A').toString().toUpperCase()),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Assigned Vehicle
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Assigned Vehicle', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 12),
                          if (vehicle != null) ...[
                            _buildInfoRow('Registration', vehicle['registrationNumber'] ?? 'N/A'),
                            _buildInfoRow('Make & Model', '${vehicle['make']} ${vehicle['model']}'),
                            _buildInfoRow('Type', vehicle['type'] ?? 'N/A'),
                          ] else
                            const Text('No vehicle assigned', style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Documents Section
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
                              const Text('Driver Documents', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.pop(context);
                                  _showAddDocumentDialog(fullDriver['driverId']);
                                },
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Add Document'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1565C0),
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (documents.isEmpty)
                            const Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text('No documents uploaded', style: TextStyle(color: Colors.grey)),
                            )
                          else
                            ...documents.map((doc) => _buildDocumentTile(doc, fullDriver['driverId'])),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
            ElevatedButton.icon(
              onPressed: () async {
                Navigator.pop(context);
                await _fetchDrivers();
                _showDriverDetails(driver);
              },
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Refresh'),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1565C0)),
            ),
          ],
        ),
      );
    } catch (e) {
      Navigator.pop(context); // Close loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label + ':', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey.shade700)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 14)),
          ),
        ],
      ),
    );
  }

  Future<void> _showEditDriverDialog(Map<String, dynamic> driver) async {
    print('[DriverListPage] 📝 Opening edit dialog for driver: ${driver['driverId']}');
    print('[DriverListPage] Driver data: $driver');
    
    final nameController = TextEditingController(text: driver['name']);
    final emailController = TextEditingController(text: driver['email']);
    final phoneController = TextEditingController(text: driver['phone']);
    
    // Ensure status is one of the valid dropdown values
    final validStatuses = ['active', 'on_leave', 'inactive'];
    String driverStatus = driver['status']?.toString().toLowerCase() ?? 'active';
    String selectedStatus = validStatuses.contains(driverStatus) ? driverStatus : 'active';
    
    print('[DriverListPage] Initial status: $driverStatus, Selected: $selectedStatus');

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.edit, color: Color(0xFF1565C0)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Edit Driver'),
                    Text(
                      'Driver ID: ${driver['driverId'] ?? 'N/A'}',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.normal),
                    ),
                  ],
                ),
              ),
            ],
          ),
          content: SizedBox(
            width: 500,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Name *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.email),
                    ),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Phone *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.phone),
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: selectedStatus,
                    decoration: const InputDecoration(
                      labelText: 'Status *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.info),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'active', child: Text('Active')),
                      DropdownMenuItem(value: 'on_leave', child: Text('On Leave')),
                      DropdownMenuItem(value: 'inactive', child: Text('Inactive')),
                    ],
                    onChanged: (value) {
                      setDialogState(() {
                        selectedStatus = value ?? 'active';
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nameController.text.isEmpty || 
                    emailController.text.isEmpty || 
                    phoneController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please fill all required fields'),
                      backgroundColor: Colors.orange,
                    ),
                  );
                  return;
                }
                
                Navigator.pop(context, true);
                
                await _updateDriver(
                  driver['driverId'],
                  {
                    'name': nameController.text,
                    'email': emailController.text,
                    'phone': phoneController.text,
                    'status': selectedStatus,
                  },
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1565C0)),
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );

    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
  }

  Future<void> _updateDriver(String driverId, Map<String, dynamic> updateData) async {
    try {
      print('[DriverListPage] 🔄 Updating driver: $driverId with data: $updateData');
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final response = await widget.driverService.updateDriver(
        driverId: driverId,
        personalInfo: {
          'name': updateData['name'],
          'email': updateData['email'],
          'phone': updateData['phone'],
        },
        status: updateData['status'],
      );

      if (!mounted) return;
      Navigator.pop(context);

      print('[DriverListPage] ✅ Update response: $response');

      if (response != null && response['success'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Driver updated successfully'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
        // ✅ FIX: Refresh the driver list to show updated data
        await _fetchDrivers();
      } else {
        throw Exception(response?['message'] ?? 'Failed to update driver');
      }
    } catch (e) {
      print('[DriverListPage] ❌ Error updating driver: $e');
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _deleteDriver(String driverId, String driverName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.red),
            SizedBox(width: 12),
            Text('Delete Driver'),
          ],
        ),
        content: Text('Are you sure you want to delete driver "$driverName"? This action cannot be undone.'),
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

    if (confirmed != true) {
      print('[DriverListPage] ❌ Delete cancelled by user');
      return;
    }

    try {
      print('[DriverListPage] 🗑️ Deleting driver: $driverId ($driverName)');
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final response = await widget.driverService.deleteDriver(driverId);

      if (!mounted) return;
      Navigator.pop(context);

      print('[DriverListPage] ✅ Delete response: $response');

      if (response == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Driver deleted successfully'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
        // ✅ FIX: Refresh the driver list to show updated data
        await _fetchDrivers();
      } else {
        throw Exception('Failed to delete driver');
      }
    } catch (e) {
      print('[DriverListPage] ❌ Error deleting driver: $e');
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _sendPasswordResetEmail(Map<String, dynamic> driver) async {
    final email = driver['email'];
    final name = driver['name'];
    
    if (email == null || email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Driver does not have an email address'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.email, color: Color(0xFF1565C0)),
            SizedBox(width: 12),
            Text('Send Password Reset Email'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Send password reset email to:'),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name ?? 'Unknown Driver',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    email,
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'The driver will receive an email with a link to reset their password.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context, true),
            icon: const Icon(Icons.send, size: 18),
            label: const Text('Send Email'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1565C0),
              foregroundColor: Colors.white,
            ),
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text(
                'Sending password reset email...',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
        ),
      );

      final response = await widget.driverService.sendPasswordResetEmail(driver['driverId']);

      Navigator.pop(context); // Close loading dialog

      if (response == true) {
        // Show success dialog similar to forgot password screen
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 28),
                const SizedBox(width: 12),
                const Expanded(child: Text('Email Sent!')),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Password reset email sent to:',
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 8),
                Text(
                  'Driver: $name',
                  style: TextStyle(color: Colors.grey[700], fontSize: 14),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.schedule, size: 16, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          Text(
                            'Email arrives in 1-2 minutes',
                            style: TextStyle(
                              color: Colors.blue.shade900,
                              fontWeight: FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '📧 Check inbox\n'
                        '📁 Check spam/junk folder\n'
                        '🔒 Link expires in 1 hour',
                        style: TextStyle(
                          color: Colors.blue.shade800,
                          fontSize: 12,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Close dialog
                  _sendPasswordResetEmail(driver); // Resend email
                },
                child: const Text('Resend', style: TextStyle(fontSize: 16)),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Close dialog and stay on driver list
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1565C0),
                ),
                child: const Text('OK', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        );
      } else {
        throw Exception('Failed to send email');
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      
      // Show error dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(Icons.error_outline, color: Colors.red, size: 28),
              const SizedBox(width: 12),
              const Text('Error'),
            ],
          ),
          content: Text(
            'Failed to send password reset email: $e',
            style: const TextStyle(fontSize: 15),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;

    switch (status.toLowerCase()) {
      case 'active':
        bgColor = Colors.green.shade100;
        textColor = Colors.green.shade800;
        break;
      case 'on_leave':
        bgColor = Colors.orange.shade100;
        textColor = Colors.orange.shade800;
        break;
      case 'inactive':
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade800;
        break;
      default:
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade800;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.replaceAll('_', ' ').toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildDocumentStatusIndicator(Map<String, dynamic> driver) {
    final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    
    if (documents.isEmpty) {
      return Tooltip(
        message: 'No documents uploaded',
        child: Icon(Icons.info_outline, color: Colors.grey.shade600, size: 16),
      );
    }

    final now = DateTime.now();
    bool hasExpiredDocuments = false;
    bool hasExpiringSoonDocuments = false;

    for (final doc in documents) {
      final expiryDate = doc['expiryDate'];
      if (expiryDate != null) {
        try {
          final expiry = DateTime.parse(expiryDate);
          if (expiry.isBefore(now)) {
            hasExpiredDocuments = true;
          } else if (expiry.isBefore(now.add(const Duration(days: 30)))) {
            hasExpiringSoonDocuments = true;
          }
        } catch (e) {
          // Invalid date format, skip
        }
      }
    }

    Widget icon;
    String message;
    
    if (hasExpiredDocuments) {
      icon = Icon(Icons.error, color: Colors.red.shade700, size: 16);
      message = 'Has expired documents - Click to view';
    } else if (hasExpiringSoonDocuments) {
      icon = Icon(Icons.warning, color: Colors.orange.shade700, size: 16);
      message = 'Documents expiring soon - Click to view';
    } else {
      icon = Icon(Icons.check_circle, color: Colors.green.shade700, size: 16);
      message = 'All documents valid - Click to view';
    }

    return GestureDetector(
      onTap: () => _showDocumentStatusDialog(driver),
      child: Tooltip(
        message: message,
        child: icon,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // If embedded, return just the content without the overlay wrapper
    if (widget.isEmbedded) {
      return _buildContent(context);
    }
    
    // Otherwise, return the full overlay version
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.95,
          height: MediaQuery.of(context).size.height * 0.9,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: _buildContent(context),
        ),
      ),
    );
  }

  // ✅ NEW: Build trip status badges (DATE-BASED)
  Widget _buildTripStatusBadges(Map<String, dynamic> driver) {
    final tripStats = driver['tripStats'];
    if (tripStats == null) return const SizedBox.shrink();
    
    return Wrap(
      spacing: 4,
      runSpacing: 4,
      children: [
        if (tripStats['ongoing'] > 0)
          _buildTripBadge(
            '🟢 ${tripStats['ongoing']}',
            Colors.green,
            'Ongoing (Today)',
          ),
        if (tripStats['assigned'] > 0)
          _buildTripBadge(
            '🔵 ${tripStats['assigned']}',
            Colors.blue,
            'Assigned (Future)',
          ),
        _buildTripBadge(
          '⚪ ${tripStats['completed'] ?? 0}',
          Colors.grey,
          'Completed (Past)',
        ),
      ],
    );
  }

  // ✅ NEW: Build individual trip badge
  Widget _buildTripBadge(String label, Color color, String tooltip) {
    return Tooltip(
      message: tooltip,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ),
    );
  }

  // ✅ NEW: Build current trip indicator (TODAY'S TRIP)
  Widget _buildCurrentTripIndicator(Map<String, dynamic>? currentTrip) {
    if (currentTrip == null) return const SizedBox.shrink();
    
    return Container(
      margin: const EdgeInsets.only(top: 4),
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.green.shade200),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.local_shipping, size: 14, color: Colors.green.shade700),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              'Trip: ${currentTrip['tripId'] ?? currentTrip['tripNumber'] ?? 'N/A'}',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Colors.green.shade700,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Column(
      children: [
        // Header (only show if not embedded)
        if (!widget.isEmbedded)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF1565C0),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.people, color: Colors.white, size: 28),
                const SizedBox(width: 12),
                const Text(
                  'Driver Management',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

        // Filters
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search by name, email, phone, or driver ID...',
                        prefixIcon: const Icon(Icons.search, size: 20),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      onChanged: (value) => _searchQuery = value,
                      onSubmitted: (value) => _fetchDrivers(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 150,
                    child: DropdownButtonFormField<String>(
                      value: _selectedStatus.isEmpty ? null : _selectedStatus,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      hint: const Text('Status'),
                      items: const [
                        DropdownMenuItem(value: '', child: Text('All Status')),
                        DropdownMenuItem(value: 'active', child: Text('Active')),
                        DropdownMenuItem(value: 'on_leave', child: Text('On Leave')),
                        DropdownMenuItem(value: 'inactive', child: Text('Inactive')),
                      ],
                      onChanged: (value) {
                        setState(() => _selectedStatus = value ?? '');
                        _fetchDrivers();
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 150,
                    child: DropdownButtonFormField<String>(
                            value: _selectedVehicleFilter.isEmpty ? null : _selectedVehicleFilter,
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            hint: const Text('Vehicle'),
                            items: const [
                              DropdownMenuItem(value: '', child: Text('All Drivers')),
                              DropdownMenuItem(value: 'assigned', child: Text('With Vehicle')),
                              DropdownMenuItem(value: 'unassigned', child: Text('No Vehicle')),
                            ],
                            onChanged: (value) {
                              setState(() => _selectedVehicleFilter = value ?? '');
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        SizedBox(
                          width: 150,
                          child: DropdownButtonFormField<String>(
                            value: _selectedDocumentFilter.isEmpty ? null : _selectedDocumentFilter,
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            hint: const Text('Documents'),
                            items: const [
                              DropdownMenuItem(value: '', child: Text('All Documents')),
                              DropdownMenuItem(value: 'expired', child: Text('Expired')),
                              DropdownMenuItem(value: 'expiring_soon', child: Text('Expiring Soon')),
                              DropdownMenuItem(value: 'all_valid', child: Text('All Valid')),
                              DropdownMenuItem(value: 'no_documents', child: Text('No Documents')),
                            ],
                            onChanged: (value) {
                              setState(() => _selectedDocumentFilter = value ?? '');
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: _fetchDrivers,
                          icon: const Icon(Icons.search, size: 18),
                          label: const Text('Search'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1565C0),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton.icon(
                          onPressed: _clearFilters,
                          icon: const Icon(Icons.clear, size: 18),
                          label: const Text('Clear Filters'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton.icon(
                          onPressed: () async {
                            await _fetchDrivers();
                            await _fetchVehicles();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Data refreshed'),
                                  duration: Duration(seconds: 1),
                                ),
                              );
                            }
                          },
                          icon: const Icon(Icons.refresh, size: 18),
                          label: const Text('Refresh'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          'Showing ${_filteredDrivers.length} of ${_pagination['total']} drivers',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Table
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _filteredDrivers.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.person_off, size: 64, color: Colors.grey.shade400),
                                const SizedBox(height: 16),
                                Text(
                                  'No drivers found',
                                  style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Try adjusting your filters',
                                  style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
                                ),
                              ],
                            ),
                          )
                        : SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: SingleChildScrollView(
                              child: Container(
                                margin: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: DataTable(
                                  headingRowColor: MaterialStateProperty.all(Colors.grey.shade100),
                                  border: TableBorder.all(color: Colors.grey.shade300),
                                  columnSpacing: 12,
                                  horizontalMargin: 16,
                                  columns: const [
                                    DataColumn(label: Text('Driver ID', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Name', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Email', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Phone', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Vehicle', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Trip Status', style: TextStyle(fontWeight: FontWeight.bold))), // ✅ NEW COLUMN
                                    DataColumn(label: Text('Documents', style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Actions', style: TextStyle(fontWeight: FontWeight.bold))),
                                  ],
                                  rows: _filteredDrivers.map((driver) {
                                    final vehicle = driver['assignedVehicle'];
                                    final hasVehicle = vehicle != null;
                                    
                                    return DataRow(
                                      cells: [
                                        DataCell(Text(driver['driverId'] ?? 'N/A', style: const TextStyle(fontSize: 12))),
                                        DataCell(Text(driver['name'] ?? 'N/A', style: const TextStyle(fontSize: 12))),
                                        DataCell(
                                          SizedBox(
                                            width: 180,
                                            child: Text(
                                              driver['email'] ?? 'N/A',
                                              style: const TextStyle(fontSize: 12),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ),
                                        DataCell(Text(driver['phone'] ?? 'N/A', style: const TextStyle(fontSize: 12))),
                                        DataCell(_buildStatusBadge(driver['status'] ?? 'inactive')),
                                        DataCell(
                                          SizedBox(
                                            width: 200,
                                            child: hasVehicle
                                                ? Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      color: Colors.green.shade50,
                                                      borderRadius: BorderRadius.circular(6),
                                                      border: Border.all(color: Colors.green.shade200),
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Icon(Icons.directions_car, size: 16, color: Colors.green.shade700),
                                                        const SizedBox(width: 6),
                                                        Expanded(
                                                          child: Text(
                                                            '${vehicle['registrationNumber'] ?? vehicle['make']} ${vehicle['model'] ?? ''}',
                                                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.green.shade900),
                                                            overflow: TextOverflow.ellipsis,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  )
                                                : TextButton.icon(
                                                    onPressed: () => _showVehicleAssignmentDialog(driver),
                                                    icon: const Icon(Icons.add, size: 16),
                                                    label: const Text('Assign'),
                                                    style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
                                                  ),
                                          ),
                                        ),
                                        // ✅ NEW: Trip Status Column
                                        DataCell(
                                          SizedBox(
                                            width: 180,
                                            child: Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                _buildTripStatusBadges(driver),
                                                if (driver['currentTrip'] != null) ...[
                                                  const SizedBox(height: 4),
                                                  _buildCurrentTripIndicator(driver['currentTrip']),
                                                ],
                                              ],
                                            ),
                                          ),
                                        ),
                                        DataCell(
                                          SizedBox(
                                            width: 60,
                                            child: Center(child: _buildDocumentStatusIndicator(driver)),
                                          ),
                                        ),
                                        DataCell(
                                          SizedBox(
                                            width: 220,
                                            child: Wrap(
                                              spacing: 4,
                                              runSpacing: 4,
                                              children: [
                                                Tooltip(
                                                  message: hasVehicle ? 'Change Vehicle' : 'Assign Vehicle',
                                                  child: IconButton(
                                                    icon: const Icon(Icons.directions_car, size: 18),
                                                    color: hasVehicle ? Colors.orange : const Color(0xFF1565C0),
                                                    onPressed: () => _showVehicleAssignmentDialog(driver),
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                                  ),
                                                ),
                                                Tooltip(
                                                  message: 'View Details',
                                                  child: IconButton(
                                                    icon: const Icon(Icons.visibility, size: 18),
                                                    color: const Color(0xFF1565C0),
                                                    onPressed: () => _showDriverDetails(driver),
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                                  ),
                                                ),
                                                Tooltip(
                                                  message: 'Edit Driver',
                                                  child: IconButton(
                                                    icon: const Icon(Icons.edit, size: 18),
                                                    color: Colors.orange.shade700,
                                                    onPressed: () => _showEditDriverDialog(driver),
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                                  ),
                                                ),
                                                Tooltip(
                                                  message: 'Delete Driver',
                                                  child: IconButton(
                                                    icon: const Icon(Icons.delete, size: 18),
                                                    color: Colors.red.shade700,
                                                    onPressed: () => _deleteDriver(driver['driverId'], driver['name'] ?? 'Unknown'),
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                                  ),
                                                ),
                                                Tooltip(
                                                  message: 'Send Password Reset Email',
                                                  child: IconButton(
                                                    icon: const Icon(Icons.email, size: 18),
                                                    color: Colors.purple.shade700,
                                                    onPressed: () => _sendPasswordResetEmail(driver),
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    );
                                  }).toList(),
                                ),
                              ),
                            ),
                          ),
              ),

              // Pagination
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Showing ${(_pagination['page'] - 1) * _pagination['limit'] + 1} to ${(_pagination['page'] * _pagination['limit'] > _pagination['total']) ? _pagination['total'] : _pagination['page'] * _pagination['limit']} of ${_pagination['total']} entries',
                      style: const TextStyle(fontSize: 14),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chevron_left),
                          onPressed: _pagination['page'] > 1
                              ? () {
                                  setState(() => _pagination['page']--);
                                  _fetchDrivers();
                                }
                              : null,
                        ),
                        Text('Page ${_pagination['page']} of ${_pagination['pages']}'),
                        IconButton(
                          icon: const Icon(Icons.chevron_right),
                          onPressed: _pagination['page'] < _pagination['pages']
                              ? () {
                                  setState(() => _pagination['page']++);
                                  _fetchDrivers();
                                }
                              : null,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
  }

  Widget _buildTableHeader(String text) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Text(
        text,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 13,
          color: Color(0xFF1A1A1A),
        ),
      ),
    );
  }

  Widget _buildTableCell(String text) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Text(
        text,
        style: const TextStyle(fontSize: 12),
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _buildTableCellWidget(Widget widget) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: widget,
    );
  }

  // Document Management Methods
  Future<void> _showAddDocumentDialog(String driverId) async {
    final documentNameController = TextEditingController();
    DateTime? selectedExpiryDate;
    String? selectedDocumentType;
    File? selectedFile;
    Uint8List? selectedFileBytes;
    String? selectedFileName;

    final documentTypes = ['License', 'Medical Certificate', 'Background Check', 'Training Certificate', 'ID Proof', 'Other'];

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Driver Document'),
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
                                    selectedFileBytes = null;
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
                            backgroundColor: const Color(0xFF1565C0),
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
                  driverId,
                  selectedDocumentType!,
                  documentNameController.text,
                  selectedExpiryDate,
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
    String driverId,
    String documentType,
    String documentName,
    DateTime? expiryDate,
    File? file,
    Uint8List? fileBytes,
    String? fileName,
  ) async {
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

      final response = await widget.driverService.uploadDriverDocument(
        driverId: driverId,
        file: file,
        bytes: fileBytes,
        fileName: fileName ?? 'document.pdf',
        documentType: documentType,
        documentName: documentName,
        expiryDate: expiryDate,
      );

      Navigator.pop(context);

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Document uploaded successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _fetchDrivers();
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

  Widget _buildDocumentTile(Map<String, dynamic> doc, String driverId) {
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
              color: const Color(0xFF1565C0),
              onPressed: () => _viewDocument(documentUrl),
              tooltip: 'View/Download Document',
            ),
          IconButton(
            icon: const Icon(Icons.delete, size: 20),
            color: Colors.red.shade700,
            onPressed: () => _deleteDocument(driverId, doc['id']),
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

  Future<void> _deleteDocument(String driverId, String documentId) async {
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

      final response = await widget.driverService.deleteDriverDocument(
        driverId,
        documentId,
      );

      Navigator.pop(context);

      if (response == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _fetchDrivers();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to delete document'),
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

  Future<void> _showDocumentStatusDialog(Map<String, dynamic> driver) async {
    final documents = (driver['documents'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    final now = DateTime.now();
    
    // Categorize documents
    final expiredDocs = <Map<String, dynamic>>[];
    final expiringSoonDocs = <Map<String, dynamic>>[];
    final validDocs = <Map<String, dynamic>>[];
    final noExpiryDocs = <Map<String, dynamic>>[];

    for (final doc in documents) {
      final expiryDate = doc['expiryDate'];
      if (expiryDate != null) {
        try {
          final expiry = DateTime.parse(expiryDate);
          if (expiry.isBefore(now)) {
            expiredDocs.add(doc);
          } else if (expiry.isBefore(now.add(const Duration(days: 30)))) {
            expiringSoonDocs.add(doc);
          } else {
            validDocs.add(doc);
          }
        } catch (e) {
          noExpiryDocs.add(doc);
        }
      } else {
        noExpiryDocs.add(doc);
      }
    }

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.description, color: Color(0xFF1565C0)),
            const SizedBox(width: 12),
            Expanded(
              child: Text('Document Status - ${driver['name'] ?? 'Unknown Driver'}'),
            ),
          ],
        ),
        content: SizedBox(
          width: 600,
          height: 500,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Driver Info
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.person, color: Colors.blue.shade700),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            driver['name'] ?? 'Unknown Driver',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            'Driver ID: ${driver['driverId'] ?? 'N/A'}',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Expired Documents
                if (expiredDocs.isNotEmpty) ...[
                  _buildDocumentSection(
                    'Expired Documents',
                    expiredDocs,
                    Colors.red,
                    Icons.error,
                    driver['driverId'],
                  ),
                  const SizedBox(height: 16),
                ],

                // Expiring Soon Documents
                if (expiringSoonDocs.isNotEmpty) ...[
                  _buildDocumentSection(
                    'Documents Expiring Soon (Within 30 Days)',
                    expiringSoonDocs,
                    Colors.orange,
                    Icons.warning,
                    driver['driverId'],
                  ),
                  const SizedBox(height: 16),
                ],

                // Valid Documents
                if (validDocs.isNotEmpty) ...[
                  _buildDocumentSection(
                    'Valid Documents',
                    validDocs,
                    Colors.green,
                    Icons.check_circle,
                    driver['driverId'],
                  ),
                  const SizedBox(height: 16),
                ],

                // No Expiry Documents
                if (noExpiryDocs.isNotEmpty) ...[
                  _buildDocumentSection(
                    'Documents Without Expiry Date',
                    noExpiryDocs,
                    Colors.grey,
                    Icons.info,
                    driver['driverId'],
                  ),
                  const SizedBox(height: 16),
                ],

                // No Documents
                if (documents.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.grey.shade600),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'No documents uploaded for this driver',
                            style: TextStyle(fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              _showAddDocumentDialog(driver['driverId']);
            },
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Add Document'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1565C0),
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentSection(
    String title,
    List<Map<String, dynamic>> documents,
    Color color,
    IconData icon,
    String driverId,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: color,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${documents.length}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...documents.map((doc) => _buildDocumentTile(doc, driverId)),
        ],
      ),
    );
  }
}