# Vehicle Assigned Customers Dialog - Implementation Guide

## Feature Request
When clicking on a vehicle (especially when it shows red "0/3 available"), display a dialog showing:
- All assigned customers
- Their time slots (from X time to Y time)
- Customer details (name, phone, location)

## Backend API (Already Exists) ✅

### Endpoint
```
GET /api/admin/vehicles/:id/assigned-customers
```

### Response Format
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "vehicleId": "VH070571",
      "name": "Toyota Innova",
      "registrationNumber": "KA05GH9012",
      "seatCapacity": 3,
      "status": "ACTIVE"
    },
    "driver": {
      "name": "John Doe",
      "phone": "+91 9876543210",
      "email": "john@example.com"
    },
    "customers": [
      {
        "sequence": 1,
        "customerName": "Asha Patel",
        "customerEmail": "asha@infosys.com",
        "customerPhone": "+91 9876543210",
        "organization": "Infosys",
        "rosterType": "both",
        "loginTime": "09:00",
        "logoutTime": "18:00",
        "loginLocation": "Whitefield, Bangalore",
        "logoutLocation": "Electronic City, Bangalore",
        "officeLocation": "Infosys Campus",
        "assignedAt": "2025-12-16T10:30:00Z",
        "status": "assigned"
      }
    ],
    "summary": {
      "totalCustomers": 2,
      "availableSeats": 0,
      "utilizationPercentage": 100
    }
  }
}
```

## Frontend Implementation

### Step 1: Create Assigned Customers Dialog Widget

**File:** `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/widgets/assigned_customers_dialog.dart`

```dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AssignedCustomersDialog extends StatelessWidget {
  final Map<String, dynamic> vehicleData;
  final List<Map<String, dynamic>> customers;
  final Map<String, dynamic>? driver;

  const AssignedCustomersDialog({
    Key? key,
    required this.vehicleData,
    required this.customers,
    this.driver,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final vehicleName = vehicleData['name'] ?? vehicleData['vehicleNumber'] ?? 'Unknown';
    final seatCapacity = vehicleData['seatCapacity'] ?? 0;
    final availableSeats = seatCapacity - 1 - customers.length;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 700,
        constraints: const BoxConstraints(maxHeight: 600),
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
                  Icon(Icons.directions_car, color: Colors.white, size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          vehicleName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${customers.length} customers assigned • $availableSeats/$seatCapacity seats available',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Driver Info (if available)
            if (driver != null)
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.grey.shade100,
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Colors.green.shade100,
                      child: Icon(Icons.person, color: Colors.green.shade700),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Driver: ${driver!['name'] ?? 'Unknown'}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          if (driver!['phone'] != null)
                            Text(
                              driver!['phone'],
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 12,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // Customer List
            Flexible(
              child: customers.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.people_outline,
                              size: 64,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No Customers Assigned',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey.shade600,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'This vehicle is currently empty',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: customers.length,
                      separatorBuilder: (_, __) => const Divider(height: 24),
                      itemBuilder: (context, index) {
                        final customer = customers[index];
                        return _buildCustomerCard(customer, index + 1);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerCard(Map<String, dynamic> customer, int sequence) {
    final loginTime = customer['loginTime'] ?? 'N/A';
    final logoutTime = customer['logoutTime'] ?? 'N/A';
    final loginLocation = customer['loginLocation'] ?? 'N/A';
    final logoutLocation = customer['logoutLocation'] ?? 'N/A';
    final rosterType = customer['rosterType'] ?? 'both';

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.blue.shade100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Customer Name & Sequence
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: Colors.blue.shade700,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      '$sequence',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer['customerName'] ?? 'Unknown',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        customer['organization'] ?? 'N/A',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildRosterTypeBadge(rosterType),
              ],
            ),
            const SizedBox(height: 16),

            // Time Slots
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Column(
                children: [
                  // Login Time
                  if (rosterType == 'login' || rosterType == 'both')
                    Row(
                      children: [
                        Icon(Icons.login, size: 18, color: Colors.green.shade700),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Pickup: $loginTime',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green.shade900,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                loginLocation,
                                style: TextStyle(
                                  color: Colors.green.shade700,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                  // Divider between login and logout
                  if (rosterType == 'both')
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Divider(color: Colors.green.shade300, height: 1),
                    ),

                  // Logout Time
                  if (rosterType == 'logout' || rosterType == 'both')
                    Row(
                      children: [
                        Icon(Icons.logout, size: 18, color: Colors.orange.shade700),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Drop: $logoutTime',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.orange.shade900,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                logoutLocation,
                                style: TextStyle(
                                  color: Colors.orange.shade700,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),

            // Contact Info
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.phone, size: 14, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Text(
                  customer['customerPhone'] ?? 'N/A',
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 16),
                Icon(Icons.email, size: 14, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    customer['customerEmail'] ?? 'N/A',
                    style: TextStyle(
                      color: Colors.grey.shade700,
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRosterTypeBadge(String rosterType) {
    Color color;
    String label;
    IconData icon;

    switch (rosterType) {
      case 'login':
        color = Colors.green;
        label = 'Pickup Only';
        icon = Icons.login;
        break;
      case 'logout':
        color = Colors.orange;
        label = 'Drop Only';
        icon = Icons.logout;
        break;
      default:
        color = Colors.blue;
        label = 'Both Ways';
        icon = Icons.swap_horiz;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color.shade700),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color.shade700,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
```

### Step 2: Add Click Handler in Vehicle Master

**File:** `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart`

Add this method to fetch and show assigned customers:

```dart
Future<void> _showAssignedCustomersDialog(VehicleEntity vehicle) async {
  try {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    // Fetch assigned customers from API
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/admin/vehicles/${vehicle.id}/assigned-customers'),
      headers: {
        'Authorization': 'Bearer ${await _getAuthToken()}',
        'Content-Type': 'application/json',
      },
    );

    // Close loading
    if (mounted) Navigator.pop(context);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      
      if (data['success'] == true) {
        final vehicleData = data['data']['vehicle'];
        final customers = List<Map<String, dynamic>>.from(data['data']['customers'] ?? []);
        final driver = data['data']['driver'];

        // Show dialog
        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AssignedCustomersDialog(
              vehicleData: vehicleData,
              customers: customers,
              driver: driver,
            ),
          );
        }
      } else {
        _showErrorSnackBar(data['message'] ?? 'Failed to load assigned customers');
      }
    } else {
      _showErrorSnackBar('Failed to fetch assigned customers');
    }
  } catch (e) {
    if (mounted) Navigator.pop(context); // Close loading if still open
    _showErrorSnackBar('Error: ${e.toString()}');
  }
}
```

### Step 3: Add Click Handler to Vehicle Row

In the `_buildVehicleDataRow` method, wrap the seat availability cell with `InkWell`:

```dart
DataCell(
  InkWell(
    onTap: () => _showAssignedCustomersDialog(vehicle),
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
            '$availableSeats/$seatCapacity available',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: availabilityColor,
              fontSize: 13,
            ),
          ),
          const SizedBox(width: 4),
          Icon(Icons.info_outline, size: 14, color: availabilityColor),
        ],
      ),
    ),
  ),
),
```

## Testing

### Test Case 1: Empty Vehicle
- Click on a vehicle with "39/40 available" (green)
- Should show: "No Customers Assigned" message

### Test Case 2: Partially Full Vehicle
- Assign 2 customers to a 3-seater
- Click on "1/3 available" (orange)
- Should show: 2 customers with their time slots

### Test Case 3: Full Vehicle
- Assign 2 customers to a 3-seater (driver + 2 = full)
- Click on "0/3 available" (red)
- Should show: 2 customers with detailed time information

## Expected Dialog Display

```
┌─────────────────────────────────────────────────┐
│ 🚗 Toyota Innova KA05GH9012                  ✕ │
│ 2 customers assigned • 0/3 seats available     │
├─────────────────────────────────────────────────┤
│ 👤 Driver: Rajesh Kumar                         │
│    +91 9876543210                               │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 1  Asha Patel                    [Both Ways]│ │
│ │    Infosys                                  │ │
│ │    ┌───────────────────────────────────────┐│ │
│ │    │ 🔼 Pickup: 09:00                      ││ │
│ │    │    Whitefield, Bangalore              ││ │
│ │    │ ─────────────────────────────────────  ││ │
│ │    │ 🔽 Drop: 18:00                        ││ │
│ │    │    Electronic City, Bangalore         ││ │
│ │    └───────────────────────────────────────┘│ │
│ │    📞 +91 9876543210  ✉ asha@infosys.com   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 2  Sunil Kumar                  [Both Ways] │ │
│ │    Wipro                                    │ │
│ │    ┌───────────────────────────────────────┐│ │
│ │    │ 🔼 Pickup: 09:15                      ││ │
│ │    │    Koramangala, Bangalore             ││ │
│ │    │ ─────────────────────────────────────  ││ │
│ │    │ 🔽 Drop: 18:15                        ││ │
│ │    │    Sarjapur Road, Bangalore           ││ │
│ │    └───────────────────────────────────────┘│ │
│ │    📞 +91 9876543211  ✉ sunil@wipro.com    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Files to Create/Modify

1. **CREATE:** `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/widgets/assigned_customers_dialog.dart`
2. **MODIFY:** `abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart`
   - Add `_showAssignedCustomersDialog` method
   - Add click handler to seat availability cell

## Status

- [x] Backend API exists and returns correct data
- [ ] Create AssignedCustomersDialog widget
- [ ] Add click handler in Vehicle Master
- [ ] Test with empty, partial, and full vehicles
- [ ] Verify time slots display correctly

## Next Steps

1. Create the dialog widget file
2. Add the click handler to Vehicle Master
3. Test the feature
4. Adjust styling as needed

This feature will greatly improve the UX by allowing admins to quickly see who is assigned to each vehicle and their time slots!
