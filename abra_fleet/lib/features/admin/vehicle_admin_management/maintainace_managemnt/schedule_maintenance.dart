import 'package:flutter/material.dart';
import 'package:abra_fleet/core/services/maintenance_service.dart';
import 'package:abra_fleet/core/services/vehicle_service.dart';
// Import to access color constants


const Color kPrimaryColor = Color(0xFF0D47A1);
const Color kTextPrimaryColor = Color(0xFF212121);
const Color kTextSecondaryColor = Color(0xFF757575);
const Color kWarningColor = Color(0xFFF57C00);
const Color kWarningBackgroundColor = Color(0xFFFFF8E1);
const Color kSuccessColor = Color(0xFF4CAF50);
const Color kErrorColor = Color(0xFFF44336);
const Color kInfoColor = Color(0xFF0288D1);
// ============ DATA MODEL FOR VENDOR ============
class Vendor {
  final String id;
  final String name;
  final String contactEmail;

  Vendor({required this.id, required this.name, required this.contactEmail});
}

// ============ DATA MODEL FOR VEHICLE ============
class Vehicle {
  final String id;
  final String registrationNumber;
  final String makeModel;
  final String vehicleType;
  final int seatingCapacity;
  final String status;

  Vehicle({
    required this.id,
    required this.registrationNumber,
    required this.makeModel,
    required this.vehicleType,
    required this.seatingCapacity,
    required this.status,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    // Extract seating capacity from multiple possible fields
    int seatingCapacity = 0;
    
    // Try different field names for seating capacity safely
    try {
      if (json['seatCapacity'] != null) {
        seatingCapacity = json['seatCapacity'];
      } else if (json['seatingCapacity'] != null) {
        seatingCapacity = json['seatingCapacity'];
      } else if (json['capacity'] != null) {
        final capacity = json['capacity'];
        if (capacity is Map && capacity['passengers'] != null) {
          seatingCapacity = capacity['passengers'];
        } else if (capacity is num) {
          seatingCapacity = capacity.toInt();
        } else {
          seatingCapacity = int.tryParse(capacity.toString()) ?? 4;
        }
      } else {
        seatingCapacity = 4; // Default fallback
      }
    } catch (e) {
      print('Error parsing seating capacity: $e');
      seatingCapacity = 4; // Safe fallback
    }
    
    return Vehicle(
      id: json['_id'] ?? json['id'] ?? '',
      registrationNumber: json['registrationNumber'] ?? json['vehicleNumber'] ?? '',
      makeModel: json['makeModel'] ?? '${json['make'] ?? ''} ${json['model'] ?? ''}'.trim(),
      vehicleType: json['vehicleType'] ?? json['type'] ?? '',
      seatingCapacity: seatingCapacity,
      status: json['status'] ?? 'active',
    );
  }
}

// ============ SCHEDULE MAINTENANCE SCREEN (ENHANCED) ============
class ScheduleMaintenanceScreen extends StatefulWidget {
  final VoidCallback onBack;
  const ScheduleMaintenanceScreen({required this.onBack, Key? key})
      : super(key: key);

  @override
  State<ScheduleMaintenanceScreen> createState() =>
      _ScheduleMaintenanceScreenState();
}

class _ScheduleMaintenanceScreenState extends State<ScheduleMaintenanceScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();
  final MaintenanceService _maintenanceService = MaintenanceService();
  final VehicleService _vehicleService = VehicleService();
  bool _isSubmitting = false;
  bool _isLoadingVehicles = true;

  // Form Data
  String? _selectedVehicle;
  String? _selectedType;
  DateTime? _selectedDate;
  final _descriptionController = TextEditingController();
  bool _assignToVendor = true;
  Vendor? _selectedVendor;
  String _selectedPriority = 'medium';
  final _estimatedCostController = TextEditingController();

  // Vehicle Data
  List<Vehicle> _vehicles = [];
  Vehicle? _selectedVehicleObject;

  // Dummy Data
  // Fetch vehicles from backend
  Future<void> _fetchVehicles() async {
    setState(() => _isLoadingVehicles = true);
    
    try {
      print('🚗 Fetching vehicles from backend...');
      final result = await _vehicleService.getVehicles(
        limit: 100, // Get all vehicles
        status: 'ACTIVE', // Use uppercase as expected by backend
      );

      if (result['success']) {
        final List<dynamic> vehiclesData = result['data'] ?? [];
        final List<Vehicle> fetchedVehicles = vehiclesData.map((data) {
          print('🚗 Processing vehicle data: ${data['registrationNumber']} - seatCapacity: ${data['seatCapacity']}, capacity: ${data['capacity']}');
          return Vehicle.fromJson(data);
        }).toList();

        setState(() {
          _vehicles = fetchedVehicles;
          _isLoadingVehicles = false;
        });

        print('✅ Successfully fetched ${_vehicles.length} vehicles');
        for (var vehicle in _vehicles) {
          print('   - ${vehicle.registrationNumber} (${vehicle.makeModel}) - ${vehicle.seatingCapacity} seats');
        }
      } else {
        print('❌ Failed to fetch vehicles: ${result['message']}');
        setState(() => _isLoadingVehicles = false);
        
        // Show error message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to load vehicles: ${result['message']}'),
              backgroundColor: kErrorColor,
            ),
          );
        }
      }
    } catch (e) {
      print('❌ Error fetching vehicles: $e');
      setState(() => _isLoadingVehicles = false);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading vehicles: ${e.toString()}'),
            backgroundColor: kErrorColor,
          ),
        );
      }
    }
  }

  final List<String> _maintenanceTypes = [
    'Oil Change',
    'Filter Replacement',
    'Tire Rotation',
    'Brake Service',
    'General Inspection',
    'AC Service',
    'Engine Diagnostics',
  ];
  final List<Vendor> _vendors = [
    Vendor(
        id: 'V001',
        name: 'Premium Auto Service',
        contactEmail: 'contact@premiumauto.com'),
    Vendor(
        id: 'V002',
        name: 'Dubai Maintenance Hub',
        contactEmail: 'info@dubaihub.com'),
    Vendor(
        id: 'V003',
        name: 'Gulf Auto Care',
        contactEmail: 'support@gulfautocare.ae'),
  ];

  @override
  void initState() {
    super.initState();
    _fetchVehicles();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _estimatedCostController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        colorScheme: const ColorScheme.light(primary: kPrimaryColor),
      ),
      child: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: () {
          final isLastStep = _currentStep == getSteps().length - 1;

          if (_currentStep == 0 && !_formKey.currentState!.validate()) {
            return;
          }

          if (isLastStep) {
            _submitRequest();
          } else {
            setState(() => _currentStep += 1);
          }
        },
        onStepCancel:
            _currentStep == 0 ? null : () => setState(() => _currentStep -= 1),
        onStepTapped: (step) => setState(() => _currentStep = step),
        steps: getSteps(),
        controlsBuilder: (context, details) {
          final isLastStep = _currentStep == getSteps().length - 1;
          return Padding(
            padding: const EdgeInsets.only(top: 16.0),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : details.onStepContinue,
                    child: _isSubmitting 
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(isLastStep ? 'CONFIRM & SCHEDULE' : 'CONTINUE'),
                  ),
                ),
                const SizedBox(width: 12),
                if (_currentStep != 0)
                  Expanded(
                    child: TextButton(
                      onPressed: _isSubmitting ? null : details.onStepCancel,
                      child: const Text('BACK'),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  List<Step> getSteps() => [
        Step(
          isActive: _currentStep >= 0,
          title: const Text('Service Details'),
          content: _buildServiceDetailsForm(),
        ),
        Step(
          isActive: _currentStep >= 1,
          title: const Text('Assign Vendor'),
          content: _buildVendorSelection(),
        ),
        Step(
          isActive: _currentStep >= 2,
          title: const Text('Preview Notification'),
          content: _buildNotificationPreview(),
        ),
        Step(
          isActive: _currentStep >= 3,
          title: const Text('Confirm & Schedule'),
          content: _buildConfirmation(),
        ),
      ];

  Widget _buildServiceDetailsForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Vehicle',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _isLoadingVehicles
              ? Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Row(
                    children: [
                      SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: 12),
                      Text('Loading vehicles...'),
                    ],
                  ),
                )
              : DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                      border: OutlineInputBorder(), hintText: 'Choose a vehicle'),
                  value: _selectedVehicle,
                  validator: (value) =>
                      value == null ? 'Please select a vehicle' : null,
                  onChanged: (value) {
                    setState(() {
                      _selectedVehicle = value;
                      _selectedVehicleObject = _vehicles.firstWhere(
                        (vehicle) => vehicle.id == value,
                        orElse: () => _vehicles.first,
                      );
                    });
                  },
                  items: _vehicles.isEmpty
                      ? [
                          const DropdownMenuItem(
                            value: null,
                            child: Text('No vehicles available'),
                          )
                        ]
                      : _vehicles
                          .map((vehicle) => DropdownMenuItem(
                                value: vehicle.id,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      vehicle.registrationNumber,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '${vehicle.makeModel} • ${vehicle.vehicleType} • ${vehicle.seatingCapacity} seats',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
                                ),
                              ))
                          .toList(),
                ),
          const SizedBox(height: 16),
          const Text('Maintenance Type',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          FormField<String>(
            validator: (value) =>
                _selectedType == null ? 'Please select a maintenance type' : null,
            builder: (FormFieldState<String> state) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: _maintenanceTypes
                        .map((type) => FilterChip(
                              label: Text(type),
                              selected: _selectedType == type,
                              onSelected: (selected) => setState(() {
                                _selectedType = selected ? type : null;
                                state.didChange(_selectedType);
                              }),
                              selectedColor: kPrimaryColor,
                              labelStyle: TextStyle(
                                  color: _selectedType == type
                                      ? Colors.white
                                      : null),
                            ))
                        .toList(),
                  ),
                  if (state.hasError)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0, left: 12.0),
                      child: Text(state.errorText!,
                          style: TextStyle(color: kErrorColor, fontSize: 12)),
                    )
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          const Text('Schedule Date',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          FormField<DateTime>(
            validator: (value) =>
                _selectedDate == null ? 'Please select a date' : null,
            builder: (FormFieldState<DateTime> state) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (picked != null) {
                        setState(() => _selectedDate = picked);
                        state.didChange(_selectedDate);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade400),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today,
                              color: kPrimaryColor),
                          const SizedBox(width: 12),
                          Text(_selectedDate != null
                              ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                              : 'Select a Date'),
                        ],
                      ),
                    ),
                  ),
                  if (state.hasError)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0, left: 12.0),
                      child: Text(state.errorText!,
                          style: TextStyle(color: kErrorColor, fontSize: 12)),
                    ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          const Text('Additional Notes / Description',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _descriptionController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'e.g., Check for rattling noise from the back.',
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          const Text('Priority Level',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            decoration: const InputDecoration(
                border: OutlineInputBorder(), hintText: 'Select priority'),
            value: _selectedPriority,
            onChanged: (value) => setState(() => _selectedPriority = value!),
            items: const [
              DropdownMenuItem(value: 'low', child: Text('Low Priority')),
              DropdownMenuItem(value: 'medium', child: Text('Medium Priority')),
              DropdownMenuItem(value: 'high', child: Text('High Priority')),
              DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Estimated Cost (Optional)',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _estimatedCostController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Enter estimated cost in ₹',
              prefixText: '₹ ',
            ),
            keyboardType: TextInputType.number,
          ),
        ],
      ),
    );
  }

  Widget _buildVendorSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SwitchListTile(
          title: const Text('Assign to a specific vendor'),
          value: _assignToVendor,
          onChanged: (value) => setState(() {
            _assignToVendor = value;
            if (!value) _selectedVendor = null;
          }),
        ),
        const SizedBox(height: 8),
        if (_assignToVendor)
          const Text('Select a Vendor',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        if (_assignToVendor)
          ..._vendors.map((vendor) => RadioListTile<Vendor>(
                title: Text(vendor.name),
                value: vendor,
                groupValue: _selectedVendor,
                onChanged: (value) => setState(() => _selectedVendor = value),
              )),
        if (!_assignToVendor)
          const ListTile(
            leading: Icon(Icons.info_outline, color: kInfoColor),
            title: Text(
                'This service request will be open for all vendors to view and bid on.',
                style: TextStyle(fontSize: 13, color: kTextSecondaryColor)),
          ),
      ],
    );
  }

  Widget _buildNotificationPreview() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Notification Preview',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const Divider(height: 24),
          _buildPreviewRow('To:',
              _selectedVendor?.contactEmail ?? 'All Registered Vendors'),
          _buildPreviewRow('Subject:',
              'New Maintenance Request for ${_selectedVehicleObject?.registrationNumber ?? _selectedVehicle ?? 'Vehicle'}'),
          const Divider(height: 24),
          const Text('Message:', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            'Dear ${_selectedVendor?.name ?? 'Vendor'},\n\nA new maintenance service has been requested for vehicle ${_selectedVehicleObject?.registrationNumber ?? _selectedVehicle ?? ''}.\n\nDetails:\n- Service: ${_selectedType ?? ''}\n- Preferred Date: ${_selectedDate != null ? "${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}" : 'Not specified'}\n\nNotes:\n${_descriptionController.text.isNotEmpty ? _descriptionController.text : 'None'}\n\nPlease confirm your availability.\n\nThank you.',
            style: TextStyle(height: 1.5, color: kTextSecondaryColor),
          ),
        ],
      ),
    );
  }

  Widget _buildPreviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(width: 8),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Widget _buildConfirmation() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Please review the details before confirming.',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const Divider(height: 24),
          _buildPreviewRow('Vehicle:', _selectedVehicleObject?.registrationNumber ?? _selectedVehicle ?? 'N/A'),
          _buildPreviewRow('Service:', _selectedType ?? 'N/A'),
          _buildPreviewRow(
              'Date:',
              _selectedDate != null
                  ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                  : 'N/A'),
          _buildPreviewRow('Assigned To:',
              _selectedVendor?.name ?? 'Open for all vendors'),
          _buildPreviewRow('Notes:',
              _descriptionController.text.isNotEmpty ? _descriptionController.text : 'None'),
        ],
      ),
    );
  }

  void _submitRequest() async {
    // Final validation
    if (_assignToVendor && _selectedVendor == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a vendor before confirming.'),
          backgroundColor: kErrorColor,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Parse estimated cost
      double? estimatedCost;
      if (_estimatedCostController.text.isNotEmpty) {
        estimatedCost = double.tryParse(_estimatedCostController.text);
      }

      // Call the maintenance service to schedule maintenance with real-time email
      final result = await _maintenanceService.scheduleMaintenanceWithEmail(
        vehicleId: _selectedVehicle!,
        maintenanceType: _selectedType!,
        scheduledDate: _selectedDate!,
        vendorEmail: _selectedVendor!.contactEmail,
        vendorName: _selectedVendor!.name,
        description: _descriptionController.text.isNotEmpty ? _descriptionController.text : null,
        estimatedCost: estimatedCost,
        priority: _selectedPriority,
      );

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Maintenance successfully scheduled for ${_selectedVehicleObject?.registrationNumber ?? _selectedVehicle}! Real-time email sent to ${_selectedVendor!.name}.',
            ),
            backgroundColor: kSuccessColor,
            duration: const Duration(seconds: 4),
          ),
        );

        // Show success dialog with details
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('✅ Maintenance Scheduled'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Vehicle: ${_selectedVehicleObject?.registrationNumber ?? _selectedVehicle}'),
                Text('Service: $_selectedType'),
                Text('Date: ${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'),
                Text('Vendor: ${_selectedVendor!.name}'),
                Text('Priority: ${_selectedPriority.toUpperCase()}'),
                const SizedBox(height: 10),
                const Text(
                  '📧 Real-time email notification has been sent to the vendor with all maintenance details.',
                  style: TextStyle(color: kSuccessColor, fontWeight: FontWeight.w500),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  widget.onBack(); // Close the overlay
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Failed to schedule maintenance'),
            backgroundColor: kErrorColor,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: kErrorColor,
          duration: const Duration(seconds: 4),
        ),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }
}