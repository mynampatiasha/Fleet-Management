// File: lib/features/admin/customer_management/widgets/vehicle_confirmation_dialog.dart
// Dialog to confirm vehicle selection before route optimization

import 'package:flutter/material.dart';

class VehicleConfirmationDialog extends StatelessWidget {
  final Map<String, dynamic> vehicle;
  final List<Map<String, dynamic>> customers;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const VehicleConfirmationDialog({
    super.key,
    required this.vehicle,
    required this.customers,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    // 🔥 FIX: Use registrationNumber for vehicle display
    final vehicleName = vehicle['registrationNumber'] ?? 
                       vehicle['vehicleNumber'] ?? 
                       vehicle['name'] ?? 
                       'Unknown Vehicle';
    final licensePlate = vehicle['licensePlate'] ?? vehicle['registrationNumber'] ?? 'N/A';
    
    // 🔥 FIX: Extract driver name properly and avoid MongoDB IDs
    String driverName = 'No Driver';
    if (vehicle['assignedDriver'] != null) {
      final driver = vehicle['assignedDriver'];
      if (driver is Map) {
        // Extract only the name field, ignore MongoDB ObjectId
        final nameValue = driver['name'];
        if (nameValue != null && nameValue.toString().isNotEmpty) {
          driverName = nameValue.toString();
        } else {
          // If no name, show a user-friendly message instead of ID
          driverName = 'Driver Assigned';
        }
      } else if (driver is String && driver.isNotEmpty) {
        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (driver.length == 24 && RegExp(r'^[0-9a-fA-F]{24}$').hasMatch(driver)) {
          // Don't show MongoDB ID, show user-friendly message
          driverName = 'Driver Assigned';
        } else {
          driverName = driver;
        }
      }
    }
    
    // 🔥 SAFE PARSING for seat capacity - handle String, int, or double
    int totalSeats = 4; // default
    
    // ✅ FIX: Check capacity map first (like in pending_rosters_screen)
    if (vehicle['capacity'] != null && vehicle['capacity'] is Map) {
      final capacityMap = vehicle['capacity'] as Map;
      final seatingValue = capacityMap['seating'] ?? capacityMap['passengers'];
      if (seatingValue is int) {
        totalSeats = seatingValue;
      } else if (seatingValue is String) {
        totalSeats = int.tryParse(seatingValue) ?? 4;
      }
    } else {
      final seatCapacityValue = vehicle['seatCapacity'] ?? 
                               vehicle['seatingCapacity'] ?? 
                               vehicle['passengers']; 
                               
      if (seatCapacityValue != null) {
        if (seatCapacityValue is int) {
          totalSeats = seatCapacityValue;
        } else if (seatCapacityValue is String) {
          totalSeats = int.tryParse(seatCapacityValue) ?? 4;
        } else if (seatCapacityValue is double) {
          totalSeats = seatCapacityValue.toInt();
        }
      }
    }
    
    final assignedSeats = (vehicle['assignedCustomers'] as List?)?.length ?? 0;
    final availableSeats = totalSeats - 1 - assignedSeats; // -1 for driver
    
    // 🔥 SAFE PARSING for distance
    double? distanceToCluster;
    final distanceValue = vehicle['distanceToCluster'];
    if (distanceValue != null) {
      if (distanceValue is double) {
        distanceToCluster = distanceValue;
      } else if (distanceValue is int) {
        distanceToCluster = distanceValue.toDouble();
      } else if (distanceValue is String) {
        distanceToCluster = double.tryParse(distanceValue);
      }
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 600,
        constraints: const BoxConstraints(maxHeight: 700),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.blue.shade700,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.directions_car, color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Vehicle Auto-Detected',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Confirm vehicle selection to proceed',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: onCancel,
                  ),
                ],
              ),
            ),

            // Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Vehicle Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.blue.shade200, width: 2),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade700,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.directions_car,
                                  color: Colors.white,
                                  size: 40,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      vehicleName,
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      licensePlate,
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.grey.shade700,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 16),
                          
                          // Vehicle Details
                          Row(
                            children: [
                              Expanded(
                                child: _buildInfoTile(
                                  icon: Icons.person,
                                  label: 'Driver',
                                  value: driverName,
                                  color: Colors.green,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildInfoTile(
                                  icon: Icons.airline_seat_recline_normal,
                                  label: 'Available Seats',
                                  value: '$availableSeats / $totalSeats',
                                  color: Colors.orange,
                                ),
                              ),
                            ],
                          ),
                          if (distanceToCluster != null) ...[
                            const SizedBox(height: 12),
                            _buildInfoTile(
                              icon: Icons.straighten,
                              label: 'Distance to Cluster',
                              value: '${distanceToCluster.toStringAsFixed(1)} km',
                              color: Colors.purple,
                            ),
                          ],
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Customers to Assign
                    const Text(
                      'Customers to Assign',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Icon(Icons.people, color: Colors.blue.shade700, size: 24),
                              const SizedBox(width: 8),
                              Text(
                                '${customers.length} Customers',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue.shade700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...customers.map((customer) {
                            final name = customer['customerName'] ?? 
                                       customer['employeeDetails']?['name'] ?? 
                                       'Unknown';
                            final location = customer['officeLocation'] ?? 
                                           customer['pickupLocation'] ?? 
                                           'Unknown Location';
                            
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                children: [
                                  Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade100,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.person,
                                      size: 18,
                                      color: Colors.blue.shade700,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          name,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 14,
                                          ),
                                        ),
                                        Text(
                                          location,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Info Box
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.green.shade700),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'This vehicle has been automatically selected based on proximity and availability. Click "Confirm" to generate the optimal route.',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.green.shade900,
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

            // Actions
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                border: Border(top: BorderSide(color: Colors.grey.shade300)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: onCancel,
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: onConfirm,
                    icon: const Icon(Icons.check_circle),
                    label: const Text('Confirm & Generate Route'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade700,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
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
  }

  Widget _buildInfoTile({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
