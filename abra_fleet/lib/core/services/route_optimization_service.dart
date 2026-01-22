// File: lib/core/services/route_optimization_service.dart
// Advanced route optimization service with TSP algorithm
// Now with OSRM integration for accurate road distances!

import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'osrm_routing_service.dart';

class RouteOptimizationService {
  /// Calculate distance between two points using Haversine formula
  static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371; // Earth's radius in km
    final dLat = (lat2 - lat1) * math.pi / 180;
    final dLon = (lon2 - lon1) * math.pi / 180;
    
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
              math.cos(lat1 * math.pi / 180) * math.cos(lat2 * math.pi / 180) *
              math.sin(dLon / 2) * math.sin(dLon / 2);
              
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return R * c;
  }

  /// Find N closest customers to each other (clustering)
  /// 🔥 CRITICAL BUSINESS RULE: Customers from different organizations CANNOT share a vehicle
  /// Even if only 1 person from a company, they travel alone - no mixing with other companies
  static List<Map<String, dynamic>> findOptimalCustomerCluster(
    List<Map<String, dynamic>> allCustomers,
    int count,
  ) {
    debugPrint('\n🔍 findOptimalCustomerCluster CALLED');
    debugPrint('   - Total customers: ${allCustomers.length}');
    debugPrint('   - Requested count: $count');
    
    if (allCustomers.isEmpty) {
      debugPrint('   ❌ No customers available');
      return [];
    }
    
    // 🔥 STEP 1: GROUP CUSTOMERS BY ORGANIZATION
    debugPrint('\n🏢 STEP 1: GROUPING BY ORGANIZATION');
    debugPrint('-'*60);
    
    final Map<String, List<Map<String, dynamic>>> customersByOrg = {};
    
    for (final customer in allCustomers) {
      // Extract organization from email domain instead of organization fields
      final email = _safeStringExtract(customer['customerEmail']) ?? 
                   _safeStringExtract(customer['employeeDetails']?['email']) ?? 
                   _safeStringExtract(customer['email']);
      
      String orgKey = 'Unknown Organization';
      
      if (email.isNotEmpty && email.contains('@')) {
        final domain = email.split('@')[1].toLowerCase();
        
        // Use domain as organization identifier
        switch (domain) {
          case 'techcorp.com':
            orgKey = 'techcorp.com';
            break;
          case 'innovate.com':
            orgKey = 'innovate.com';
            break;
          case 'abrafleet.com':
            orgKey = 'abrafleet.com';
            break;
          case 'infosys.com':
            orgKey = 'infosys.com';
            break;
          case 'tcs.com':
            orgKey = 'tcs.com';
            break;
          case 'wipro.com':
            orgKey = 'wipro.com';
            break;
          case 'gmail.com':
            orgKey = 'gmail.com';
            break;
          default:
            // Use the domain directly
            orgKey = domain;
            break;
        }
      }
      
      if (!customersByOrg.containsKey(orgKey)) {
        customersByOrg[orgKey] = [];
      }
      customersByOrg[orgKey]!.add(customer);
    }
    
    debugPrint('✅ Found ${customersByOrg.length} organizations:');
    for (final entry in customersByOrg.entries) {
      final orgName = entry.key;
      final customers = entry.value;
      debugPrint('   📊 $orgName: ${customers.length} customers');
      for (int i = 0; i < customers.length && i < 3; i++) {
        final name = _safeStringExtract(customers[i]['customerName']) ?? 
                    _safeStringExtract(customers[i]['employeeDetails']?['name']) ?? 
                    'Unknown';
        debugPrint('      - $name');
      }
      if (customers.length > 3) {
        debugPrint('      ... and ${customers.length - 3} more');
      }
    }
    debugPrint('-'*60);
    
    // 🔥 STEP 2: FIND BEST ORGANIZATION GROUP
    debugPrint('\n🎯 STEP 2: FINDING BEST ORGANIZATION GROUP');
    debugPrint('-'*60);
    debugPrint('Looking for organization with closest customers...');
    
    String? bestOrg;
    double bestScore = double.infinity;
    
    for (final entry in customersByOrg.entries) {
      final orgName = entry.key;
      final orgCustomers = entry.value;
      
      // Skip if this organization doesn't have enough customers
      if (orgCustomers.length < count) {
        debugPrint('   ⚪ $orgName: Only ${orgCustomers.length} customers (need $count) - SKIPPED');
        continue;
      }
      
      // Calculate centroid for this organization's customers
      double centerLat = 0, centerLng = 0;
      int validCount = 0;
      
      for (final customer in orgCustomers) {
        final lat = _getLatitude(customer);
        final lng = _getLongitude(customer);
        centerLat += lat;
        centerLng += lng;
        validCount++;
      }
      
      if (validCount == 0) continue;
      
      centerLat /= validCount;
      centerLng /= validCount;
      
      // Calculate average distance from centroid (compactness score)
      double totalDistance = 0;
      for (final customer in orgCustomers) {
        final lat = _getLatitude(customer);
        final lng = _getLongitude(customer);
        totalDistance += calculateDistance(centerLat, centerLng, lat, lng);
      }
      
      final avgDistance = totalDistance / validCount;
      
      debugPrint('   📍 $orgName:');
      debugPrint('      - Customers: ${orgCustomers.length}');
      debugPrint('      - Centroid: ($centerLat, $centerLng)');
      debugPrint('      - Avg distance from centroid: ${avgDistance.toStringAsFixed(2)} km');
      
      if (avgDistance < bestScore) {
        bestScore = avgDistance;
        bestOrg = orgName;
        debugPrint('      ✅ NEW BEST ORGANIZATION!');
      }
    }
    
    if (bestOrg == null) {
      debugPrint('\n⚠️ NO ORGANIZATION HAS $count CUSTOMERS');
      debugPrint('Falling back to largest organization group...');
      
      // Fallback: Return customers from the largest organization
      final largestOrg = customersByOrg.entries
          .reduce((a, b) => a.value.length > b.value.length ? a : b);
      
      bestOrg = largestOrg.key;
      final customers = largestOrg.value;
      
      debugPrint('✅ Selected: $bestOrg (${customers.length} customers)');
      debugPrint('⚠️ Returning ${customers.length} customers (less than requested $count)');
      debugPrint('-'*60);
      
      return customers;
    }
    
    debugPrint('\n✅ BEST ORGANIZATION: $bestOrg');
    debugPrint('   - Compactness score: ${bestScore.toStringAsFixed(2)} km');
    debugPrint('-'*60);
    
    // 🔥 STEP 3: SELECT CLOSEST CUSTOMERS FROM BEST ORGANIZATION
    debugPrint('\n📍 STEP 3: SELECTING $count CLOSEST CUSTOMERS FROM $bestOrg');
    debugPrint('-'*60);
    
    final orgCustomers = customersByOrg[bestOrg]!;
    
    if (orgCustomers.length <= count) {
      debugPrint('✅ Returning all ${orgCustomers.length} customers from $bestOrg');
      return orgCustomers;
    }
    
    // Calculate centroid of organization's customers
    double centerLat = 0, centerLng = 0;
    int validCount = 0;
    
    for (final customer in orgCustomers) {
      final lat = _getLatitude(customer);
      final lng = _getLongitude(customer);
      centerLat += lat;
      centerLng += lng;
      validCount++;
    }
    
    centerLat /= validCount;
    centerLng /= validCount;
    
    debugPrint('Organization centroid: ($centerLat, $centerLng)');

    // Score each customer by distance from centroid
    final scored = orgCustomers.map((customer) {
      final lat = _getLatitude(customer);
      final lng = _getLongitude(customer);
      final distance = calculateDistance(centerLat, centerLng, lat, lng);
      return {'customer': customer, 'score': distance};
    }).toList();

    // Sort by score and take top N - 🔥 SAFE CASTING
    scored.sort((a, b) {
      final aScore = a['score'];
      final bScore = b['score'];
      final aDouble = aScore is double ? aScore : (aScore is int ? aScore.toDouble() : 0.0);
      final bDouble = bScore is double ? bScore : (bScore is int ? bScore.toDouble() : 0.0);
      return aDouble.compareTo(bDouble);
    });
    
    final selected = scored
        .take(count)
        .map((item) => item['customer'] as Map<String, dynamic>)
        .toList();
    
    debugPrint('✅ Selected $count closest customers:');
    for (int i = 0; i < selected.length; i++) {
      final customer = selected[i];
      final name = _safeStringExtract(customer['customerName']) ?? 
                  _safeStringExtract(customer['employeeDetails']?['name']) ?? 
                  'Unknown';
      final distance = scored[i]['score'] as double;
      debugPrint('   ${i + 1}. $name - ${distance.toStringAsFixed(2)} km from centroid');
    }
    debugPrint('-'*60);
    debugPrint('🏢 ORGANIZATION RULE ENFORCED: All customers from $bestOrg only');
    debugPrint('-'*60 + '\n');
    
    return selected;
  }

  /// Solve Traveling Salesman Problem using Nearest Neighbor algorithm with OSRM
  /// Returns optimal order of customer pickups based on ACTUAL ROAD DISTANCES
  static Future<List<int>> solveTSP(
    double startLat,
    double startLng,
    List<Map<String, dynamic>> customers,
  ) async {
    if (customers.isEmpty) return [];
    if (customers.length == 1) return [0];

    debugPrint('\n🧮 SOLVING TSP WITH OSRM ROAD DISTANCES');
    debugPrint('   Starting from: ($startLat, $startLng)');
    debugPrint('   Customers: ${customers.length}');

    final visited = <int>{};
    final route = <int>[];
    
    double currentLat = startLat;
    double currentLng = startLng;

    // Nearest neighbor algorithm with OSRM
    while (visited.length < customers.length) {
      double minDistance = double.infinity;
      int nearestIndex = -1;

      for (int i = 0; i < customers.length; i++) {
        if (visited.contains(i)) continue;

        final lat = _getLatitude(customers[i]);
        final lng = _getLongitude(customers[i]);
        
        // 🗺️ Use OSRM for actual road distance
        final routeData = await OSRMRoutingService.getRoute(
          startLat: currentLat,
          startLng: currentLng,
          endLat: lat,
          endLng: lng,
        );
        
        final distance = routeData['distance'] as double;
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      if (nearestIndex == -1) break;

      visited.add(nearestIndex);
      route.add(nearestIndex);
      
      currentLat = _getLatitude(customers[nearestIndex]);
      currentLng = _getLongitude(customers[nearestIndex]);
      
      final customerName = _safeStringExtract(customers[nearestIndex]['customerName']) ?? 
                          _safeStringExtract(customers[nearestIndex]['employeeDetails']?['name']) ?? 
                          'Unknown';
      debugPrint('   ${route.length}. $customerName - ${minDistance.toStringAsFixed(1)} km (road distance)');
    }

    debugPrint('✅ TSP solved with OSRM road distances\n');
    return route;
  }

  /// Find best vehicle for given customers with SMART SEAT OPTIMIZATION
  /// 🔥 NEW RULE: Prioritize vehicles with FEWER seats for FEWER customers
  /// This ensures optimal vehicle utilization and leaves larger vehicles for bigger groups
  static Map<String, dynamic>? findBestVehicle(
    List<Map<String, dynamic>> customers,
    List<Map<String, dynamic>> vehicles, {
    bool returnDebugInfo = false,
  }) {
    debugPrint('\n' + '🔥'*40);
    debugPrint('findBestVehicle CALLED - SMART SEAT OPTIMIZATION');
    debugPrint('🔥'*40);
    debugPrint('📊 Input:');
    debugPrint('   - Vehicles: ${vehicles.length}');
    debugPrint('   - Customers: ${customers.length}');
    debugPrint('   - Return debug info: $returnDebugInfo');
    debugPrint('🎯 OPTIMIZATION RULE: Prefer smaller vehicles for fewer customers');
    
    if (vehicles.isEmpty || customers.isEmpty) {
      debugPrint('❌ EARLY EXIT: Empty vehicles or customers');
      if (returnDebugInfo) {
        return {
          'debugInfo': {
            'error': 'No vehicles or customers provided',
            'vehicleCount': vehicles.length,
            'customerCount': customers.length,
          }
        };
      }
      return null;
    }

    debugPrint('\n📍 STEP 1: Calculate customer cluster centroid');
    // Calculate customer cluster centroid
    double centerLat = 0, centerLng = 0;
    int validCount = 0;
    
    for (var customer in customers) {
      final lat = _getLatitude(customer);
      final lng = _getLongitude(customer);
      final customerName = _safeStringExtract(customer['customerName']) ?? 
                          _safeStringExtract(customer['employeeDetails']?['name']) ?? 
                          'Unknown';
      debugPrint('   Customer: $customerName - Lat: $lat, Lng: $lng');
      if (lat != null && lng != null) {
        centerLat += lat;
        centerLng += lng;
        validCount++;
      }
    }
    
    if (validCount == 0) {
      debugPrint('❌ EARLY EXIT: No valid customer locations');
      return null;
    }
    
    centerLat /= validCount;
    centerLng /= validCount;
    debugPrint('✅ Cluster centroid: Lat=$centerLat, Lng=$centerLng');

    debugPrint('\n🚗 STEP 2: Find best vehicle with SMART SEAT OPTIMIZATION');
    debugPrint('   Checking ${vehicles.length} vehicles...');
    debugPrint('   🎯 Priority: Smallest suitable vehicle for ${customers.length} customers');
    
    // Find vehicles with sufficient capacity, then prioritize by seat efficiency
    List<Map<String, dynamic>> suitableVehicles = [];
    int vehiclesChecked = 0;
    int vehiclesRejected = 0;
    String lastRejectionReason = '';
    
    for (int i = 0; i < vehicles.length; i++) {
      final vehicle = vehicles[i];
      vehiclesChecked++;
      
      debugPrint('\n   🔍 Vehicle ${i + 1}/${vehicles.length}:');
      
      try {
        final vehicleName = _safeStringExtract(vehicle['name']) ?? 
                           _safeStringExtract(vehicle['vehicleNumber']) ?? 
                           _safeStringExtract(vehicle['registrationNumber']) ?? 
                           'Unknown';
        final regNumber = _safeStringExtract(vehicle['registrationNumber']) ?? 'N/A';
        debugPrint('      Name: $vehicleName');
        debugPrint('      Registration: $regNumber');
        
        // Check status
        final status = vehicle['status']?.toString().toUpperCase() ?? 'UNKNOWN';
        debugPrint('      Status: $status');
        
        if (status != 'ACTIVE') {
          vehiclesRejected++;
          lastRejectionReason = 'Status is $status (not ACTIVE)';
          debugPrint('      ❌ REJECTED: $lastRejectionReason');
          continue;
        }
        
        // Check capacity - 🔥 SAFE PARSING to handle String or int
        int capacity = 4; // default
        if (vehicle['seatCapacity'] != null) {
          final value = vehicle['seatCapacity'];
          if (value is int) {
            capacity = value;
          } else if (value is String) {
            capacity = int.tryParse(value) ?? 4;
          } else if (value is double) {
            capacity = value.toInt();
          }
        } else if (vehicle['seatingCapacity'] != null) {
          final value = vehicle['seatingCapacity'];
          if (value is int) {
            capacity = value;
          } else if (value is String) {
            capacity = int.tryParse(value) ?? 4;
          } else if (value is double) {
            capacity = value.toInt();
          }
        } else if (vehicle['capacity'] != null) {
          final value = vehicle['capacity'];
          if (value is Map) {
            final capacityMap = value as Map;
            final passengers = capacityMap['passengers'];
            final seating = capacityMap['seating'];
            final standing = capacityMap['standing'];
            
            // Try to parse each field safely
            if (passengers != null) {
              if (passengers is int) capacity = passengers;
              else if (passengers is String) capacity = int.tryParse(passengers) ?? 4;
            } else if (seating != null) {
              if (seating is int) capacity = seating;
              else if (seating is String) capacity = int.tryParse(seating) ?? 4;
            } else if (standing != null) {
              if (standing is int) capacity = standing;
              else if (standing is String) capacity = int.tryParse(standing) ?? 4;
            }
          } else if (value is int) {
            capacity = value;
          } else if (value is String) {
            capacity = int.tryParse(value) ?? 4;
          } else if (value is double) {
            capacity = value.toInt();
          }
        }
        
        debugPrint('      Capacity: $capacity seats');
        
        final assigned = (vehicle['assignedCustomers'] as List?)?.length ?? 0;
        debugPrint('      Assigned customers: $assigned');
      
        // Check if driver is assigned
        bool hasDriver = false;
        String driverInfo = 'None';
        if (vehicle['assignedDriver'] != null) {
          final driver = vehicle['assignedDriver'];
          if (driver is Map) {
            hasDriver = driver['driverId'] != null || driver['name'] != null;
            driverInfo = _safeStringExtract(driver['name']) ?? 
                        _safeStringExtract(driver['driverId']) ?? 
                        'Unknown';
          } else if (driver is String && driver.isNotEmpty) {
            hasDriver = true;
            driverInfo = driver;
          }
        } else if (vehicle['driverId'] != null && vehicle['driverId'].toString().isNotEmpty) {
          hasDriver = true;
          driverInfo = _safeStringExtract(vehicle['driverId']);
        }
        
        debugPrint('      Driver: $driverInfo (${hasDriver ? "assigned" : "not assigned"})');
        
        final driverSeats = hasDriver ? 1 : 0;
        final available = capacity - driverSeats - assigned;
        
        debugPrint('      Available seats: $available (capacity: $capacity - driver: $driverSeats - assigned: $assigned)');
        debugPrint('      Need: ${customers.length} seats');

        if (!hasDriver) {
          vehiclesRejected++;
          lastRejectionReason = 'No driver assigned';
          debugPrint('      ❌ REJECTED: $lastRejectionReason');
          continue;
        }
        
        if (available < customers.length) {
          vehiclesRejected++;
          lastRejectionReason = 'Not enough seats (need ${customers.length}, have $available)';
          debugPrint('      ❌ REJECTED: $lastRejectionReason');
          continue;
        }

        // 🔥 TIME-BASED ORGANIZATION COMPATIBILITY CHECK
        // Rule: Different companies can use same vehicle at DIFFERENT TIMES
        // Same trip = same company only. Different time slots = different companies OK.
        debugPrint('      🏢 Checking time-based organization compatibility...');
        
        if (assigned > 0) {
          // Vehicle has customers - check if they conflict with new trip time
          final newCustomerOrg = _getOrganization(customers[0]);
          final newTripTime = customers[0]['startTime'] ?? 
                             customers[0]['loginTime'] ?? 
                             customers[0]['officeTime'] ?? 
                             '08:30';
          final newTripType = customers[0]['rosterType']?.toString().toLowerCase() ?? 'both';
          
          debugPrint('         New trip: $newCustomerOrg @ $newTripTime ($newTripType)');
          
          // Check vehicle's current assignments
          final vehicleOrg = vehicle['assignedCustomerOrganization'];
          final vehicleTripTime = vehicle['assignedTripTime'];
          final vehicleTripType = vehicle['assignedTripType'];
          
          if (vehicleOrg != null && vehicleOrg.toString().trim().isNotEmpty) {
            debugPrint('         Vehicle current: $vehicleOrg @ $vehicleTripTime ($vehicleTripType)');
            
            // Check if same organization
            if (vehicleOrg.toString().trim() == newCustomerOrg.trim()) {
              debugPrint('      ✅ Same organization: $newCustomerOrg');
            } else {
              // Different organizations - check if time slots conflict
              final timeConflict = _checkTimeConflict(
                vehicleTripTime?.toString() ?? '',
                vehicleTripType?.toString() ?? '',
                newTripTime,
                newTripType,
              );
              
              if (timeConflict) {
                vehiclesRejected++;
                lastRejectionReason = 'Time conflict: Vehicle serving "$vehicleOrg" at $vehicleTripTime ($vehicleTripType), cannot add "$newCustomerOrg" at $newTripTime ($newTripType)';
                debugPrint('      ❌ REJECTED: $lastRejectionReason');
                debugPrint('      ⏰ TIME CONFLICT - Same time slot, different companies');
                continue;
              } else {
                debugPrint('      ✅ Different time slots: Vehicle can serve multiple companies');
                debugPrint('         Current: $vehicleOrg @ $vehicleTripTime ($vehicleTripType)');
                debugPrint('         New: $newCustomerOrg @ $newTripTime ($newTripType)');
                debugPrint('      🎯 TIME-BASED SHARING ENABLED');
              }
            }
          } else {
            debugPrint('      ⚠️  Vehicle has assigned customers but no organization info stored');
          }
        } else {
          final newCustomerOrg = _getOrganization(customers[0]);
          debugPrint('      ✅ Vehicle is empty - will be assigned to organization: $newCustomerOrg');
        }

        // Get vehicle location
        final lat = vehicle['currentLocation']?['coordinates']?[1] ?? 
                    vehicle['currentLocation']?['latitude'] ?? 
                    vehicle['location']?['latitude'] ?? 
                    12.9716; // Default Bangalore
        final lng = vehicle['currentLocation']?['coordinates']?[0] ?? 
                    vehicle['currentLocation']?['longitude'] ?? 
                    vehicle['location']?['longitude'] ?? 
                    77.5946;

        debugPrint('      Location: Lat=$lat, Lng=$lng');

        final distance = calculateDistance(centerLat, centerLng, lat, lng);
        debugPrint('      Distance to cluster: ${distance.toStringAsFixed(2)} km');

        // 🔥 NEW: Calculate seat efficiency score
        final wastedSeats = available - customers.length;
        final efficiencyScore = distance + (wastedSeats * 0.5); // Penalize wasted seats
        
        debugPrint('      💺 Seat Analysis:');
        debugPrint('         Available: $available seats');
        debugPrint('         Needed: ${customers.length} seats');
        debugPrint('         Wasted: $wastedSeats seats');
        debugPrint('         Efficiency Score: ${efficiencyScore.toStringAsFixed(2)} (lower is better)');

        // Add to suitable vehicles list
        suitableVehicles.add({
          ...vehicle,
          'distanceToCluster': distance,
          'availableSeats': available,
          'wastedSeats': wastedSeats,
          'efficiencyScore': efficiencyScore,
        });
        
        debugPrint('      ✅ SUITABLE VEHICLE ADDED');
        
      } catch (e, stackTrace) {
        vehiclesRejected++;
        lastRejectionReason = 'Error: $e';
        debugPrint('      ❌ ERROR processing vehicle: $e');
        debugPrint('      Stack: $stackTrace');
        continue;
      }
    }
    
    debugPrint('\n📊 VEHICLE ANALYSIS SUMMARY:');
    debugPrint('   Total vehicles: ${vehicles.length}');
    debugPrint('   Vehicles checked: $vehiclesChecked');
    debugPrint('   Vehicles rejected: $vehiclesRejected');
    debugPrint('   Suitable vehicles: ${suitableVehicles.length}');
    if (vehiclesRejected > 0) {
      debugPrint('   Last rejection reason: $lastRejectionReason');
    }

    if (suitableVehicles.isEmpty) {
      debugPrint('\n' + '❌'*40);
      debugPrint('NO SUITABLE VEHICLE FOUND');
      debugPrint('❌'*40);
      debugPrint('📊 Summary:');
      debugPrint('   - Total vehicles: ${vehicles.length}');
      debugPrint('   - Vehicles checked: $vehiclesChecked');
      debugPrint('   - Vehicles rejected: $vehiclesRejected');
      debugPrint('   - Customers to assign: ${customers.length}');
      if (vehiclesRejected > 0) {
        debugPrint('   - Last rejection: $lastRejectionReason');
      }
      debugPrint('\n💡 Requirements:');
      debugPrint('   ✓ Status must be ACTIVE');
      debugPrint('   ✓ Must have assigned driver');
      debugPrint('   ✓ Must have at least ${customers.length} available seats');
      debugPrint('❌'*40 + '\n');
      return null;
    }

    // 🔥 NEW: Sort by efficiency score (distance + wasted seats penalty)
    debugPrint('\n🎯 STEP 3: SMART VEHICLE SELECTION');
    debugPrint('   Sorting ${suitableVehicles.length} suitable vehicles by efficiency...');
    
    suitableVehicles.sort((a, b) {
      final aScore = a['efficiencyScore'] as double;
      final bScore = b['efficiencyScore'] as double;
      return aScore.compareTo(bScore);
    });
    
    debugPrint('\n🏆 TOP 3 MOST EFFICIENT VEHICLES:');
    for (int i = 0; i < suitableVehicles.length && i < 3; i++) {
      final v = suitableVehicles[i];
      final name = _safeStringExtract(v['name']) ?? 
                  _safeStringExtract(v['vehicleNumber']) ?? 
                  _safeStringExtract(v['registrationNumber']) ?? 
                  'Unknown';
      final distance = v['distanceToCluster'] as double;
      final available = v['availableSeats'] as int;
      final wasted = v['wastedSeats'] as int;
      final score = v['efficiencyScore'] as double;
      
      debugPrint('   ${i + 1}. $name');
      debugPrint('      📏 Distance: ${distance.toStringAsFixed(1)} km');
      debugPrint('      💺 Available: $available seats (${wasted} wasted)');
      debugPrint('      🎯 Efficiency Score: ${score.toStringAsFixed(2)}');
      if (i == 0) debugPrint('      ⭐ SELECTED AS BEST VEHICLE');
    }

    final bestVehicle = suitableVehicles.first;
    final vehicleName = _safeStringExtract(bestVehicle['name']) ?? 
                       _safeStringExtract(bestVehicle['vehicleNumber']) ?? 
                       _safeStringExtract(bestVehicle['registrationNumber']) ?? 
                       'Unknown';
    final regNumber = _safeStringExtract(bestVehicle['registrationNumber']) ?? 'N/A';
    final distance = bestVehicle['distanceToCluster'] as double;
    final available = bestVehicle['availableSeats'] as int;
    final wasted = bestVehicle['wastedSeats'] as int;
    
    debugPrint('\n' + '✅'*40);
    debugPrint('OPTIMAL VEHICLE SELECTED');
    debugPrint('✅'*40);
    debugPrint('🚗 Vehicle Details:');
    debugPrint('   - Name: $vehicleName');
    debugPrint('   - Registration: $regNumber');
    debugPrint('   - Distance to cluster: ${distance.toStringAsFixed(2)} km');
    debugPrint('   - Available seats: $available');
    debugPrint('   - Wasted seats: $wasted');
    debugPrint('   - Customers to assign: ${customers.length}');
    debugPrint('🎯 OPTIMIZATION SUCCESS: Minimal waste, optimal distance');
    debugPrint('✅'*40 + '\n');

    return bestVehicle;
  }

  /// Generate complete route plan with REVERSE TIME CALCULATION + OSRM ROUTING
  /// For LOGIN trips: Calculate backwards from office arrival time
  /// For LOGOUT trips: Calculate forwards from office departure time
  /// Uses OSRM for ACTUAL ROAD DISTANCES instead of straight-line!
  static Future<Map<String, dynamic>> generateRoutePlan({
    required Map<String, dynamic> vehicle,
    required List<Map<String, dynamic>> customers,
    required DateTime startTime,
  }) async {
    debugPrint('\n🗺️ GENERATING ROUTE PLAN WITH OSRM + REVERSE TIME CALCULATION');
    debugPrint('='*80);
    
    // Get vehicle starting location
    final vehicleLat = vehicle['currentLocation']?['latitude'] ?? 
                       vehicle['location']?['latitude'] ?? 
                       12.9716;
    final vehicleLng = vehicle['currentLocation']?['longitude'] ?? 
                       vehicle['location']?['longitude'] ?? 
                       77.5946;

    // Determine trip type from first customer
    final firstCustomer = customers.isNotEmpty ? customers[0] : null;
    final rosterType = firstCustomer?['rosterType']?.toString().toLowerCase() ?? 'both';
    final isLoginTrip = rosterType == 'login' || rosterType == 'both';
    
    // Get office location and login time from first customer
    final officeTime = firstCustomer?['startTime'] ?? 
                      firstCustomer?['officeTime'] ?? 
                      firstCustomer?['loginTime'] ?? 
                      '08:30';
    
    debugPrint('📋 Trip Details:');
    debugPrint('   - Type: ${isLoginTrip ? "LOGIN (Morning)" : "LOGOUT (Evening)"}');
    debugPrint('   - Office Time: $officeTime');
    debugPrint('   - Customers: ${customers.length}');
    debugPrint('   - Vehicle: ${vehicle['name'] ?? vehicle['registrationNumber'] ?? 'Unknown'}');
    debugPrint('-'*80);

    // Solve TSP for optimal order using OSRM
    final optimalOrder = await solveTSP(vehicleLat, vehicleLng, customers);

    // Calculate office arrival/departure time with buffer
    final officeTimeParts = officeTime.split(':');
    final officeHour = int.tryParse(officeTimeParts[0]) ?? 8;
    final officeMinute = int.tryParse(officeTimeParts[1]) ?? 30;
    
    DateTime officeDateTime = DateTime(
      startTime.year,
      startTime.month,
      startTime.day,
      officeHour,
      officeMinute,
    );
    
    // Apply buffer
    if (isLoginTrip) {
      // LOGIN: Must arrive 20 minutes BEFORE office time
      officeDateTime = officeDateTime.subtract(const Duration(minutes: 20));
      debugPrint('🕐 Office Arrival Target: ${_formatTime(officeDateTime)} (20 min before $officeTime)');
    } else {
      // LOGOUT: Driver arrives 10 minutes BEFORE logout time
      officeDateTime = officeDateTime.subtract(const Duration(minutes: 10));
      debugPrint('🕐 Office Departure: ${_formatTime(officeDateTime)} (10 min before $officeTime)');
    }

    // Build route with OSRM ACTUAL ROAD DISTANCES
    debugPrint('\n🗺️ CALCULATING ROUTE WITH OSRM (ACTUAL ROAD DISTANCES):');
    debugPrint('-'*80);
    
    final route = <Map<String, dynamic>>[];
    double totalDistance = 0;
    int totalMinutes = 0;
    
    // First, calculate all distances and times using OSRM
    final routeSegments = <Map<String, dynamic>>[];
    double currentLat = vehicleLat;
    double currentLng = vehicleLng;
    
    for (int i = 0; i < optimalOrder.length; i++) {
      final customerIndex = optimalOrder[i];
      final customer = customers[customerIndex];
      
      final lat = _getLatitude(customer);
      final lng = _getLongitude(customer);
      
      // 🗺️ Use OSRM for ACTUAL ROAD DISTANCE and DURATION
      final routeData = await OSRMRoutingService.getRoute(
        startLat: currentLat,
        startLng: currentLng,
        endLat: lat,
        endLng: lng,
      );
      
      // 🔥 SAFE PARSING for distance and duration
      final distanceValue = routeData['distance'];
      final distanceFromPrevious = distanceValue is double ? distanceValue : 
                                   (distanceValue is int ? distanceValue.toDouble() : 
                                   (distanceValue is String ? double.tryParse(distanceValue) ?? 0.0 : 0.0));
      
      final durationValue = routeData['duration'];
      final minutes = durationValue is int ? durationValue : 
                     (durationValue is double ? durationValue.toInt() : 
                     (durationValue is String ? int.tryParse(durationValue) ?? 0 : 0));
      
      final isFallback = routeData['fallback'] == true;
      
      totalDistance += distanceFromPrevious;
      totalMinutes += minutes;
      
      final customerName = customer['customerName'] ?? 
                          customer['employeeDetails']?['name'] ?? 
                          'Unknown';
      
      debugPrint('   ${i + 1}. $customerName');
      debugPrint('      📏 Distance: ${distanceFromPrevious.toStringAsFixed(1)} km ${isFallback ? "(straight-line fallback)" : "(road distance)"}');
      debugPrint('      ⏱️  Duration: $minutes min');
      
      routeSegments.add({
        'sequence': i + 1,
        'customer': customer,
        'customerName': customerName,
        'location': {
          'latitude': lat,
          'longitude': lng,
          'address': customer['officeLocation'] ?? 
                    customer['pickupLocation'] ?? 
                    'Unknown Location',
        },
        'distanceFromPrevious': distanceFromPrevious,
        'estimatedTime': minutes,
        'cumulativeDistance': totalDistance,
        'cumulativeTime': totalMinutes,
        'routingMethod': isFallback ? 'fallback' : 'osrm',
      });
      
      currentLat = lat;
      currentLng = lng;
    }
    
    // Now calculate pickup/drop times based on trip type
    debugPrint('\n⏰ CALCULATING PICKUP/DROP TIMES (REVERSE CALCULATION):');
    debugPrint('-'*80);
    
    if (isLoginTrip) {
      // LOGIN TRIP: Work BACKWARDS from office arrival time
      DateTime currentTime = officeDateTime;
      
      // Process in REVERSE order (last customer first)
      for (int i = routeSegments.length - 1; i >= 0; i--) {
        final segment = routeSegments[i];
        // 🔥 SAFE PARSING for travel minutes
        final timeValue = segment['estimatedTime'];
        final travelMinutes = timeValue is int ? timeValue : 
                             (timeValue is double ? timeValue.toInt() : 
                             (timeValue is String ? int.tryParse(timeValue) ?? 0 : 0));
        
        // Subtract travel time to get pickup time
        currentTime = currentTime.subtract(Duration(minutes: travelMinutes));
        
        segment['eta'] = currentTime;
        route.insert(0, segment); // Insert at beginning to maintain order
        
        debugPrint('   ${segment['sequence']}. ${segment['customerName']}');
        debugPrint('      📍 Pickup: ${_formatTime(currentTime)}');
        debugPrint('      🚗 Travel: $travelMinutes min (${(segment['distanceFromPrevious'] as double).toStringAsFixed(1)} km road distance)');
      }
      
      final firstPickupTime = route.first['eta'] as DateTime;
      debugPrint('\n✅ Route Complete (OSRM Road Distances):');
      debugPrint('   🏁 First Pickup: ${_formatTime(firstPickupTime)}');
      debugPrint('   🏢 Office Arrival: ${_formatTime(officeDateTime)}');
      debugPrint('   📏 Total Distance: ${totalDistance.toStringAsFixed(1)} km (actual road distance)');
      debugPrint('   ⏱️  Total Time: $totalMinutes min (OSRM calculated)');
      
    } else {
      // LOGOUT TRIP: Work FORWARDS from office departure time
      DateTime currentTime = officeDateTime;
      
      for (int i = 0; i < routeSegments.length; i++) {
        final segment = routeSegments[i];
        // 🔥 SAFE PARSING for travel minutes
        final timeValue = segment['estimatedTime'];
        final travelMinutes = timeValue is int ? timeValue : 
                             (timeValue is double ? timeValue.toInt() : 
                             (timeValue is String ? int.tryParse(timeValue) ?? 0 : 0));
        
        // Add travel time to get drop time
        currentTime = currentTime.add(Duration(minutes: travelMinutes));
        
        segment['eta'] = currentTime;
        route.add(segment);
        
        debugPrint('   ${segment['sequence']}. ${segment['customerName']}');
        debugPrint('      📍 Drop: ${_formatTime(currentTime)}');
        debugPrint('      🚗 Travel: $travelMinutes min (${(segment['distanceFromPrevious'] as double).toStringAsFixed(1)} km road distance)');
      }
      
      final lastDropTime = route.last['eta'] as DateTime;
      debugPrint('\n✅ Route Complete (OSRM Road Distances):');
      debugPrint('   🏢 Office Departure: ${_formatTime(officeDateTime)}');
      debugPrint('   🏁 Last Drop: ${_formatTime(lastDropTime)}');
      debugPrint('   📏 Total Distance: ${totalDistance.toStringAsFixed(1)} km (actual road distance)');
      debugPrint('   ⏱️  Total Time: $totalMinutes min (OSRM calculated)');
    }
    
    debugPrint('='*80 + '\n');

    return {
      'vehicle': vehicle,
      'vehicleName': vehicle['name'] ?? vehicle['vehicleId'] ?? 'Unknown Vehicle',
      'vehicleNumber': vehicle['licensePlate'] ?? vehicle['registrationNumber'] ?? 'N/A',
      'driverName': vehicle['assignedDriver'] ?? vehicle['driverName'] ?? 'Unknown Driver',
      'startLocation': {
        'latitude': vehicleLat,
        'longitude': vehicleLng,
      },
      'route': route,
      'totalDistance': totalDistance,
      'totalTime': totalMinutes,
      'estimatedCompletion': isLoginTrip ? officeDateTime : route.last['eta'],
      'customerCount': customers.length,
      'tripType': isLoginTrip ? 'login' : 'logout',
      'officeArrivalTime': isLoginTrip ? officeDateTime : null,
      'officeDepartureTime': isLoginTrip ? null : officeDateTime,
      'routingMethod': 'osrm', // Indicates we used OSRM for routing
    };
  }
  
  /// Helper to format time for logging
  static String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  /// Estimate travel time based on distance (assumes average speed)
  /// NOTE: This is now only used as fallback - OSRM provides actual durations
  static int _estimateTravelTime(double distanceKm) {
    // Assume average speed of 25 km/h in city traffic
    const avgSpeedKmh = 25.0;
    final hours = distanceKm / avgSpeedKmh;
    return (hours * 60).ceil(); // Convert to minutes
  }

  /// Helper to extract latitude from customer data
  static double _getLatitude(Map<String, dynamic> customer) {
    // 🔥 ENHANCED: Safer parsing with better error handling
    try {
      // Try direct latitude field
      if (customer['latitude'] != null) {
        final value = customer['latitude'];
        if (value is double) return value;
        if (value is int) return value.toDouble();
        if (value is String) {
          final parsed = double.tryParse(value);
          if (parsed != null) return parsed;
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing latitude field: $e');
    }
    
    try {
      // Try location.latitude
      if (customer['location'] != null && customer['location'] is Map) {
        final location = customer['location'] as Map;
        if (location['latitude'] != null) {
          final value = location['latitude'];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing location.latitude: $e');
    }
    
    try {
      // Try pickupLocation.latitude
      if (customer['pickupLocation'] != null && customer['pickupLocation'] is Map) {
        final pickupLocation = customer['pickupLocation'] as Map;
        if (pickupLocation['latitude'] != null) {
          final value = pickupLocation['latitude'];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing pickupLocation.latitude: $e');
    }
    
    try {
      // Try loginPickupAddress.latitude
      if (customer['loginPickupAddress'] != null && customer['loginPickupAddress'] is Map) {
        final loginPickupAddress = customer['loginPickupAddress'] as Map;
        if (loginPickupAddress['latitude'] != null) {
          final value = loginPickupAddress['latitude'];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing loginPickupAddress.latitude: $e');
    }
    
    // 🔥 NEW: Try locations.pickup.coordinates (new data structure)
    try {
      if (customer['locations'] != null && customer['locations'] is Map) {
        final locations = customer['locations'] as Map;
        if (locations['pickup'] != null && locations['pickup'] is Map) {
          final pickup = locations['pickup'] as Map;
          if (pickup['coordinates'] != null && pickup['coordinates'] is Map) {
            final coords = pickup['coordinates'] as Map;
            if (coords['latitude'] != null) {
              final value = coords['latitude'];
              if (value is double) return value;
              if (value is int) return value.toDouble();
              if (value is String) {
                final parsed = double.tryParse(value);
                if (parsed != null) return parsed;
              }
            }
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing locations.pickup.coordinates.latitude: $e');
    }
    
    // 🔥 NEW: Try loginPickupLocation array format [lat, lng]
    try {
      if (customer['loginPickupLocation'] != null && customer['loginPickupLocation'] is List) {
        final coords = customer['loginPickupLocation'] as List;
        if (coords.length >= 2) {
          final value = coords[0];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing loginPickupLocation array: $e');
    }
    
    // FALLBACK: Use office-based coordinates
    try {
      final officeLocation = customer['officeLocation']?.toString().toLowerCase() ?? '';
      
      if (officeLocation.contains('indiranagar')) return 12.9716;
      if (officeLocation.contains('whitefield')) return 12.9698;
      if (officeLocation.contains('koramangala')) return 12.9352;
      if (officeLocation.contains('electronic city')) return 12.8456;
    } catch (e) {
      debugPrint('⚠️ Error parsing officeLocation: $e');
    }
    
    debugPrint('⚠️ Using default latitude for customer: ${_safeStringExtract(customer['customerName']) ?? 'Unknown'}');
    return 12.9716; // Default Bangalore
  }

  /// Helper to extract longitude from customer data
  static double _getLongitude(Map<String, dynamic> customer) {
    // 🔥 ENHANCED: Safer parsing with better error handling
    try {
      // Try direct longitude field
      if (customer['longitude'] != null) {
        final value = customer['longitude'];
        if (value is double) return value;
        if (value is int) return value.toDouble();
        if (value is String) {
          final parsed = double.tryParse(value);
          if (parsed != null) return parsed;
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing longitude field: $e');
    }
    
    try {
      // Try location.longitude
      if (customer['location'] != null && customer['location'] is Map) {
        final location = customer['location'] as Map;
        if (location['longitude'] != null) {
          final value = location['longitude'];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing location.longitude: $e');
    }
    
    try {
      // Try pickupLocation.longitude
      if (customer['pickupLocation'] != null && customer['pickupLocation'] is Map) {
        final pickupLocation = customer['pickupLocation'] as Map;
        if (pickupLocation['longitude'] != null) {
          final value = pickupLocation['longitude'];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing pickupLocation.longitude: $e');
    }
    
    try {
      // Try loginPickupAddress.longitude
      if (customer['loginPickupAddress'] != null && customer['loginPickupAddress'] is Map) {
        final loginPickupAddress = customer['loginPickupAddress'] as Map;
        if (loginPickupAddress['longitude'] != null) {
          final value = loginPickupAddress['longitude'];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing loginPickupAddress.longitude: $e');
    }
    
    // 🔥 NEW: Try locations.pickup.coordinates (new data structure)
    try {
      if (customer['locations'] != null && customer['locations'] is Map) {
        final locations = customer['locations'] as Map;
        if (locations['pickup'] != null && locations['pickup'] is Map) {
          final pickup = locations['pickup'] as Map;
          if (pickup['coordinates'] != null && pickup['coordinates'] is Map) {
            final coords = pickup['coordinates'] as Map;
            if (coords['longitude'] != null) {
              final value = coords['longitude'];
              if (value is double) return value;
              if (value is int) return value.toDouble();
              if (value is String) {
                final parsed = double.tryParse(value);
                if (parsed != null) return parsed;
              }
            }
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing locations.pickup.coordinates.longitude: $e');
    }
    
    // 🔥 NEW: Try loginPickupLocation array format [lat, lng]
    try {
      if (customer['loginPickupLocation'] != null && customer['loginPickupLocation'] is List) {
        final coords = customer['loginPickupLocation'] as List;
        if (coords.length >= 2) {
          final value = coords[1];
          if (value is double) return value;
          if (value is int) return value.toDouble();
          if (value is String) {
            final parsed = double.tryParse(value);
            if (parsed != null) return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error parsing loginPickupLocation array: $e');
    }
    
    // FALLBACK: Use office-based coordinates
    try {
      final officeLocation = customer['officeLocation']?.toString().toLowerCase() ?? '';
      
      if (officeLocation.contains('indiranagar')) return 77.6412;
      if (officeLocation.contains('whitefield')) return 77.7499;
      if (officeLocation.contains('koramangala')) return 77.6245;
      if (officeLocation.contains('electronic city')) return 77.6603;
    } catch (e) {
      debugPrint('⚠️ Error parsing officeLocation: $e');
    }
    
    debugPrint('⚠️ Using default longitude for customer: ${_safeStringExtract(customer['customerName']) ?? 'Unknown'}');
    return 77.5946; // Default Bangalore
  }

  /// 🔥 NEW: Multi-Organization Route Optimization
  /// When admin requests N customers but they're from different organizations,
  /// this creates separate vehicle assignments for each organization
  /// 
  /// Example: 11 employees from 11 different companies → 11 separate vehicles
  static List<Map<String, dynamic>> optimizeMultiOrganizationRoutes({
    required List<Map<String, dynamic>> allCustomers,
    required int requestedCount,
    required List<Map<String, dynamic>> availableVehicles,
  }) {
    debugPrint('\n' + '🚗'*40);
    debugPrint('MULTI-ORGANIZATION ROUTE OPTIMIZATION');
    debugPrint('🚗'*40);
    debugPrint('📊 Input:');
    debugPrint('   - Total customers: ${allCustomers.length}');
    debugPrint('   - Requested count: $requestedCount');
    debugPrint('   - Available vehicles: ${availableVehicles.length}');
    debugPrint('-'*80);
    
    // Group customers by organization
    final Map<String, List<Map<String, dynamic>>> customersByOrg = {};
    
    for (final customer in allCustomers) {
      final organization = _getOrganization(customer);
      final orgKey = organization.trim();
      
      if (!customersByOrg.containsKey(orgKey)) {
        customersByOrg[orgKey] = [];
      }
      customersByOrg[orgKey]!.add(customer);
    }
    
    debugPrint('\n🏢 Organizations found: ${customersByOrg.length}');
    for (final entry in customersByOrg.entries) {
      debugPrint('   📊 ${entry.key}: ${entry.value.length} customers');
    }
    debugPrint('-'*80);
    
    // Create vehicle assignments for each organization
    final List<Map<String, dynamic>> vehicleAssignments = [];
    int totalCustomersAssigned = 0;
    int vehicleIndex = 0;
    
    // Sort organizations by customer count (largest first) for better vehicle utilization
    final sortedOrgs = customersByOrg.entries.toList()
      ..sort((a, b) => b.value.length.compareTo(a.value.length));
    
    debugPrint('\n🎯 Creating vehicle assignments...');
    debugPrint('-'*80);
    
    for (final orgEntry in sortedOrgs) {
      final orgName = orgEntry.key;
      final orgCustomers = orgEntry.value;
      
      // Stop if we've assigned enough customers
      if (totalCustomersAssigned >= requestedCount) {
        debugPrint('✅ Reached requested count ($requestedCount) - stopping');
        break;
      }
      
      // Find suitable vehicle for this organization
      Map<String, dynamic>? assignedVehicle;
      
      while (vehicleIndex < availableVehicles.length) {
        final vehicle = availableVehicles[vehicleIndex];
        vehicleIndex++;
        
        // Check if vehicle has capacity for this organization's customers
        final capacity = vehicle['seatCapacity'] ?? 
                        vehicle['seatingCapacity'] ?? 
                        vehicle['capacity'] ?? 
                        4;
        
        final hasDriver = vehicle['assignedDriver'] != null || 
                         vehicle['driverId'] != null;
        
        final status = vehicle['status']?.toString().toUpperCase() ?? 'UNKNOWN';
        
        if (status == 'ACTIVE' && hasDriver && capacity >= orgCustomers.length) {
          assignedVehicle = vehicle;
          break;
        }
      }
      
      if (assignedVehicle == null) {
        debugPrint('⚠️  No suitable vehicle found for $orgName (${orgCustomers.length} customers)');
        continue;
      }
      
      final vehicleName = _safeStringExtract(assignedVehicle['name']) ?? 
                         _safeStringExtract(assignedVehicle['vehicleNumber']) ?? 
                         'Unknown';
      
      debugPrint('\n✅ Assignment ${vehicleAssignments.length + 1}:');
      debugPrint('   🏢 Organization: $orgName');
      debugPrint('   👥 Customers: ${orgCustomers.length}');
      debugPrint('   🚗 Vehicle: $vehicleName');
      
      // Determine how many customers to assign from this org
      final remainingSlots = requestedCount - totalCustomersAssigned;
      final customersToAssign = orgCustomers.length <= remainingSlots 
          ? orgCustomers 
          : orgCustomers.take(remainingSlots).toList();
      
      vehicleAssignments.add({
        'organization': orgName,
        'vehicle': assignedVehicle,
        'customers': customersToAssign,
        'customerCount': customersToAssign.length,
      });
      
      totalCustomersAssigned += customersToAssign.length;
      
      debugPrint('   📊 Total assigned so far: $totalCustomersAssigned/$requestedCount');
    }
    
    debugPrint('\n' + '='*80);
    debugPrint('MULTI-ORGANIZATION OPTIMIZATION COMPLETE');
    debugPrint('='*80);
    debugPrint('📊 Summary:');
    debugPrint('   - Organizations processed: ${vehicleAssignments.length}');
    debugPrint('   - Total customers assigned: $totalCustomersAssigned');
    debugPrint('   - Vehicles used: ${vehicleAssignments.length}');
    debugPrint('   - Requested count: $requestedCount');
    
    if (totalCustomersAssigned < requestedCount) {
      debugPrint('   ⚠️  Could not assign all requested customers');
      debugPrint('   - Shortfall: ${requestedCount - totalCustomersAssigned}');
    }
    
    debugPrint('='*80 + '\n');
    
    return vehicleAssignments;
  }

  /// Helper to extract organization name from customer data
  static String _getOrganization(Map<String, dynamic> customer) {
    // 🔥 SAFE STRING EXTRACTION - Prevents JsonMap type errors
    final candidates = [
      customer['organization'],
      customer['organizationName'],
      customer['companyName'],
      customer['company'],
      customer['employeeDetails']?['organization'],
      customer['employeeDetails']?['company'],
    ];
    
    for (final candidate in candidates) {
      final result = _safeStringExtract(candidate);
      if (result.isNotEmpty && result != 'null') {
        return result;
      }
    }
    
    // Extract from email domain as fallback
    final email = _safeStringExtract(customer['customerEmail']) ?? 
                 _safeStringExtract(customer['employeeDetails']?['email']) ?? 
                 _safeStringExtract(customer['email']);
    
    if (email.isNotEmpty && email.contains('@')) {
      final domain = email.split('@')[1].toLowerCase();
      return domain.split('.')[0]; // Get company name from domain
    }
    
    return 'Unknown Organization';
  }

  /// 🔥 SAFE STRING EXTRACTION - Prevents JsonMap type errors
  static String _safeStringExtract(dynamic value) {
    if (value == null) return '';
    
    if (value is String) {
      return value.trim();
    } else if (value is Map) {
      // If it's a Map, try to extract a meaningful string value
      if (value.containsKey('name')) {
        return _safeStringExtract(value['name']);
      } else if (value.containsKey('value')) {
        return _safeStringExtract(value['value']);
      } else if (value.containsKey('address')) {
        return _safeStringExtract(value['address']);
      } else if (value.containsKey('text')) {
        return _safeStringExtract(value['text']);
      } else {
        // Convert Map to string representation as last resort
        return value.toString();
      }
    } else if (value is List) {
      // If it's a List, join elements or return first element
      if (value.isNotEmpty) {
        return _safeStringExtract(value.first);
      }
      return '';
    } else {
      // Convert any other type to string
      return value.toString();
    }
  }

  /// Check if two trips have time conflicts
  /// Returns true if trips overlap (cannot share vehicle)
  /// Returns false if trips are at different times (can share vehicle)
  static bool _checkTimeConflict(
    String existingTime,
    String existingType,
    String newTime,
    String newType,
  ) {
    // If no existing time info, no conflict
    if (existingTime.isEmpty) return false;
    
    // Parse times (format: "HH:MM")
    final existingParts = existingTime.split(':');
    final newParts = newTime.split(':');
    
    if (existingParts.length != 2 || newParts.length != 2) {
      return false; // Can't determine, allow it
    }
    
    final existingHour = int.tryParse(existingParts[0]) ?? 0;
    final existingMinute = int.tryParse(existingParts[1]) ?? 0;
    final newHour = int.tryParse(newParts[0]) ?? 0;
    final newMinute = int.tryParse(newParts[1]) ?? 0;
    
    final existingMinutes = existingHour * 60 + existingMinute;
    final newMinutes = newHour * 60 + newMinute;
    
    // Normalize trip types
    final existingIsLogin = existingType.toLowerCase().contains('login');
    final newIsLogin = newType.toLowerCase().contains('login');
    
    debugPrint('      🕐 Time conflict check:');
    debugPrint('         Existing: $existingTime (${existingIsLogin ? "LOGIN" : "LOGOUT"}) = $existingMinutes min');
    debugPrint('         New: $newTime (${newIsLogin ? "LOGIN" : "LOGOUT"}) = $newMinutes min');
    
    // LOGIN trips: Morning (typically 6:00 AM - 11:00 AM)
    // LOGOUT trips: Evening (typically 4:00 PM - 10:00 PM)
    
    if (existingIsLogin && newIsLogin) {
      // Both LOGIN trips - check if times are close (within 2 hours)
      final timeDiff = (existingMinutes - newMinutes).abs();
      final conflict = timeDiff < 120; // 2 hours buffer
      debugPrint('         Both LOGIN: Time diff = $timeDiff min, Conflict = $conflict');
      return conflict;
    } else if (!existingIsLogin && !newIsLogin) {
      // Both LOGOUT trips - check if times are close (within 2 hours)
      final timeDiff = (existingMinutes - newMinutes).abs();
      final conflict = timeDiff < 120; // 2 hours buffer
      debugPrint('         Both LOGOUT: Time diff = $timeDiff min, Conflict = $conflict');
      return conflict;
    } else {
      // One LOGIN, one LOGOUT - different parts of day, no conflict
      debugPrint('         LOGIN + LOGOUT: Different time slots, NO CONFLICT');
      return false;
    }
  }
}
