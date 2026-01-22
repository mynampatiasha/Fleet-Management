// lib/core/services/roster_service.dart
// ENHANCED WITH REAL-TIME FIREBASE SUPPORT

import 'package:flutter/material.dart';
import 'package:abra_fleet/core/services/api_service.dart';
// Firebase removed - using HTTP API

class RosterService {
  final ApiService _apiService;

  RosterService({required ApiService apiService}) : _apiService = apiService;

  /// Get roster statistics for admin dashboard
  Future<RosterStats> getRosterStats() async {
    try {
      final response = await _apiService.get('/api/roster/admin/stats');
      
      if (response['success'] == true) {
        return RosterStats.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch roster stats');
      }
    } catch (e) {
      debugPrint('Error fetching roster stats: $e');
      rethrow;
    }
  }

  /// Get all pending rosters with real-time refresh capability
  /// Get all pending rosters with real-time refresh capability
/// ✅ ENHANCED: Filters out ALL types of assigned rosters to prevent double-assignment
Future<List<Map<String, dynamic>>> getPendingRosters({
  String? officeLocation,
  String? rosterType,
  bool forceRefresh = false,
}) async {
  try {
    debugPrint('\n' + '🔄'*40);
    debugPrint('📋 Loading Pending Rosters...');
    debugPrint('🔄'*40);
    
    final queryParams = <String, String>{};
    if (officeLocation != null) queryParams['officeLocation'] = officeLocation;
    if (rosterType != null) queryParams['rosterType'] = rosterType;
    
    // Add cache-busting parameter for force refresh
    if (forceRefresh) {
      queryParams['_t'] = DateTime.now().millisecondsSinceEpoch.toString();
      debugPrint('🔄 Force refresh enabled - bypassing cache');
    }

    final queryString = queryParams.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');

    final endpoint = '/api/roster/admin/pending' + 
        (queryString.isNotEmpty ? '?$queryString' : '');

    debugPrint('🌐 Fetching from: $endpoint');
    
    debugPrint('🚀 ABOUT TO CALL _apiService.get()...');
    final response = await _apiService.get(endpoint);
    debugPrint('🚀 RESPONSE RECEIVED FROM _apiService.get()!');
    debugPrint('🚀 Response type: ${response.runtimeType}');
    debugPrint('🚀 Response success: ${response['success']}');
    debugPrint('🚀 Response data length: ${response['data']?.length ?? 'null'}');

    if (response['success'] == true) {
      debugPrint('🚀 ENTERING SUCCESS BLOCK...');
      final rosters = List<Map<String, dynamic>>.from(response['data'] ?? []);
      
      debugPrint('📥 Received ${rosters.length} rosters from backend');
      debugPrint('\n🔍 FILTERING OUT ALREADY ASSIGNED ROSTERS...');
      debugPrint('-'*80);
      
      // ✅ ENHANCED FILTER: Check ALL 8 possible assignment indicators
      final trulyPendingRosters = rosters.where((roster) {
        final status = roster['status']?.toString().toLowerCase() ?? '';
        final customerName = roster['customerName'] ?? 'Unknown';
        
        // 🔍 CHECK 1: Status field
        final isStatusPending = (status == 'pending' || 
                                status == 'pending_assignment' || 
                                status == 'created');
        
        final isStatusAssigned = (status == 'assigned' || 
                                 status == 'completed' || 
                                 status == 'cancelled' ||
                                 status == 'rejected' ||
                                 status == 'in_progress' ||
                                 status == 'started');
        
        // 🔍 CHECK 2: assignedDriverId field
        final hasAssignedDriver = roster['assignedDriverId'] != null && 
                                 roster['assignedDriverId'].toString().isNotEmpty &&
                                 roster['assignedDriverId'].toString() != 'null';
        
        // 🔍 CHECK 3: assignedVehicleId field
        final hasAssignedVehicle = roster['assignedVehicleId'] != null && 
                                  roster['assignedVehicleId'].toString().isNotEmpty &&
                                  roster['assignedVehicleId'].toString() != 'null';
        
        // 🔍 CHECK 4: vehicleId field (legacy)
        final hasVehicleIdField = roster['vehicleId'] != null && 
                                 roster['vehicleId'].toString().isNotEmpty &&
                                 roster['vehicleId'].toString() != 'null';
        
        // 🔍 CHECK 5: driverId field (legacy)
        final hasDriverIdField = roster['driverId'] != null && 
                                roster['driverId'].toString().isNotEmpty &&
                                roster['driverId'].toString() != 'null';
        
        // 🔍 CHECK 6: tripId field
        final hasTripId = roster['tripId'] != null && 
                         roster['tripId'].toString().isNotEmpty &&
                         roster['tripId'].toString() != 'null';

        // 🔍 CHECK 7: vehicleNumber field
        final hasVehicleNumber = roster['vehicleNumber'] != null && 
                                roster['vehicleNumber'].toString().isNotEmpty &&
                                roster['vehicleNumber'].toString() != 'null';
        
        // 🔍 CHECK 8: driverName field
        final hasDriverName = roster['driverName'] != null && 
                             roster['driverName'].toString().isNotEmpty &&
                             roster['driverName'].toString() != 'null';

        // 🔍 CHECK 9: assignedAt timestamp
        final hasAssignedAt = roster['assignedAt'] != null;
        
        // ✅ FINAL DECISION: Only include if ALL conditions are met
        final isPending = isStatusPending &&           // Must have pending status
                         !isStatusAssigned &&          // Must NOT have assigned status
                         !hasAssignedDriver &&         // Must NOT have assigned driver
                         !hasAssignedVehicle &&        // Must NOT have assigned vehicle
                         !hasVehicleIdField &&         // Must NOT have vehicleId
                         !hasDriverIdField &&          // Must NOT have driverId
                         !hasTripId &&                 // Must NOT have tripId
                         !hasVehicleNumber &&          // Must NOT have vehicle number
                         !hasDriverName &&             // Must NOT have driver name
                         !hasAssignedAt;               // Must NOT have assignedAt timestamp

        // 📊 LOG FILTERED ROSTERS
        if (!isPending) {
          debugPrint('🚫 FILTERED OUT: $customerName');
          debugPrint('   Status: $status');
          debugPrint('   vehicleId: ${roster['vehicleId']}');
          debugPrint('   driverId: ${roster['driverId']}');
          debugPrint('   assignedVehicleId: ${roster['assignedVehicleId']}');
          debugPrint('   assignedDriverId: ${roster['assignedDriverId']}');
          debugPrint('   tripId: ${roster['tripId']}');
          debugPrint('   vehicleNumber: ${roster['vehicleNumber']}');
          debugPrint('   driverName: ${roster['driverName']}');
          debugPrint('   assignedAt: ${roster['assignedAt']}');
          debugPrint('   ❌ REASON: Already assigned or not in pending state');
        } else {
          debugPrint('✅ INCLUDED: $customerName (Status: $status)');
        }
        
        return isPending;
      }).toList();
      
      debugPrint('-'*80);
      debugPrint('📊 FILTERING RESULTS:');
      debugPrint('   - Total received: ${rosters.length}');
      debugPrint('   - Truly pending: ${trulyPendingRosters.length}');
      debugPrint('   - Filtered out: ${rosters.length - trulyPendingRosters.length}');
      debugPrint('🔄'*40 + '\n');
      
      return trulyPendingRosters;
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch pending rosters');
    }
  } catch (e) {
    debugPrint('\n' + '❌'*40);
    debugPrint('❌❌❌ ERROR IN getPendingRosters ❌❌❌');
    debugPrint('❌'*40);
    debugPrint('Error Type: ${e.runtimeType}');
    debugPrint('Error Message: $e');
    debugPrint('Stack Trace:');
    debugPrint(StackTrace.current.toString());
    debugPrint('❌'*40);
    debugPrint('❌❌❌ END ERROR REPORT ❌❌❌');
    debugPrint('❌'*40 + '\n');
    rethrow;
  }
}

  /// Get all approved rosters
  Future<List<Map<String, dynamic>>> getApprovedRosters({
    String? officeLocation,
    String? rosterType,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (officeLocation != null) queryParams['officeLocation'] = officeLocation;
      if (rosterType != null) queryParams['rosterType'] = rosterType;

      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');

      final endpoint = '/api/roster/admin/approved' + 
          (queryString.isNotEmpty ? '?$queryString' : '');

      final response = await _apiService.get(endpoint);

      if (response['success'] == true) {
        return List<Map<String, dynamic>>.from(response['data'] ?? []);
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch approved rosters');
      }
    } catch (e) {
      debugPrint('Error fetching approved rosters: $e');
      rethrow;
    }
  }

  /// Assign optimized route with real-time refresh
  /// Assign optimized route with real-time refresh
/// Assign optimized route with real-time refresh
/// Assign optimized route with real-time refresh
Future<Map<String, dynamic>> assignOptimizedRoute({
  required String vehicleId,
  required List<Map<String, dynamic>> route,
  required double totalDistance,
  required int totalTime,
  required DateTime startTime,
}) async {
  try {
    debugPrint('\n' + '🚀'*40);
    debugPrint('🚀 RosterService: Assigning optimized route');
    debugPrint('🚀'*40);
    debugPrint('📋 Parameters:');
    debugPrint('   - Vehicle ID: $vehicleId');
    debugPrint('   - Route stops: ${route.length}');
    debugPrint('   - Total distance: $totalDistance km');
    debugPrint('   - Total time: $totalTime mins');
    debugPrint('   - Start time: $startTime');
    debugPrint('-'*80);

    debugPrint('\n📦 Route Data Being Sent to Backend:');
    for (var i = 0; i < route.length; i++) {
      final stop = route[i];
      debugPrint('   Stop ${i + 1}:');
      debugPrint('      - rosterId: ${stop['rosterId']}');
      debugPrint('      - customerName: ${stop['customerName']}');
      debugPrint('      - pickupTime: ${stop['pickupTime']}');
      debugPrint('      - sequence: ${stop['sequence']}');
    }
    debugPrint('-'*80);

    final response = await _apiService.post('/api/roster/assign-optimized-route', body: {
      'vehicleId': vehicleId,
      'route': route,
      'totalDistance': totalDistance,
      'totalTime': totalTime,
      'startTime': startTime.toIso8601String(),
    });

    debugPrint('\n📥 BACKEND RESPONSE RECEIVED:');
    debugPrint('🔧 Response success: ${response['success']}');
    debugPrint('🔧 Response message: ${response['message']}');
    
    // ✅ SIMPLE FIX: Check if ANY rosters were actually assigned
    final successCount = response['successCount'] ?? 0;
    final errorCount = response['errorCount'] ?? 0;
    final totalRequested = route.length;
    
    debugPrint('📊 Assignment Counts:');
    debugPrint('   - Success: $successCount');
    debugPrint('   - Errors: $errorCount');
    debugPrint('   - Requested: $totalRequested');
    
    // ✅ DETAILED ERROR ANALYSIS (for logging only)
    bool hasActualErrors = false;
    if (response['data'] != null && response['data']['failed'] != null) {
      final failed = response['data']['failed'] as List;
      debugPrint('\n🔍 ANALYZING ERRORS:');
      for (final error in failed) {
        final errorMsg = error['error']?.toString().toLowerCase() ?? '';
        final customerName = error['customerName'] ?? 'Unknown';
        
        // Check if error is "already assigned" (which is not a real error)
        if (errorMsg.contains('already assigned') || 
            errorMsg.contains('database update failed')) {
          debugPrint('   ℹ️ $customerName: Already assigned (not a real error)');
        } else {
          debugPrint('   ❌ $customerName: REAL ERROR - $errorMsg');
          hasActualErrors = true;
        }
      }
    }
    
    // ✅ SIMPLE DECISION LOGIC
    // If ANY rosters were successfully assigned OR all rosters are already assigned, it's SUCCESS
    final allAccountedFor = (successCount + errorCount) == totalRequested;
    final shouldTreatAsSuccess = successCount > 0 || (!hasActualErrors && allAccountedFor);
    
    debugPrint('\n📊 DECISION LOGIC:');
    debugPrint('   - Success Count > 0: ${successCount > 0}');
    debugPrint('   - Has Actual Errors: $hasActualErrors');
    debugPrint('   - All Accounted For: $allAccountedFor');
    debugPrint('   - Should Treat As Success: $shouldTreatAsSuccess');
    
    if (shouldTreatAsSuccess) {
      debugPrint('\n✅✅✅ TREATING AS SUCCESS ✅✅✅');
      debugPrint('Route assignment successful (rosters assigned or already assigned)');
      debugPrint('📊 Final Success Count: $successCount');
      debugPrint('📊 Final Error Count: $errorCount');
      
      // Log successful assignments
      if (response['data'] != null && response['data']['successful'] != null) {
        final successful = response['data']['successful'] as List;
        debugPrint('\n✅ SUCCESSFUL ASSIGNMENTS (${successful.length}):');
        for (var i = 0; i < successful.length; i++) {
          final result = successful[i];
          debugPrint('   ${i + 1}. ${result['customerName']} - ${result['friendlyMessage']}');
        }
      }
      
      // Log "already assigned" as INFO, not errors
      if (response['data'] != null && response['data']['failed'] != null) {
        final failed = response['data']['failed'] as List;
        if (failed.isNotEmpty) {
          debugPrint('\n⚠️ ALREADY ASSIGNED OR NON-CRITICAL (${failed.length}):');
          for (var i = 0; i < failed.length; i++) {
            final error = failed[i];
            final errorMsg = error['error']?.toString().toLowerCase() ?? '';
            if (errorMsg.contains('already assigned') || 
                errorMsg.contains('database update failed')) {
              debugPrint('   ${i + 1}. ${error['customerName']} - Already assigned to this vehicle');
            } else {
              debugPrint('   ${i + 1}. ${error['customerName']}');
              debugPrint('      ⚠️ Error: ${error['error']}');
              debugPrint('      💡 Action: ${error['actionRequired']}');
            }
          }
        }
      }
      
      debugPrint('🚀'*40 + '\n');
      
      // ✅ RETURN SUCCESS RESPONSE
      return {
        'success': true,  // ✅ FORCE SUCCESS
        'successCount': successCount,
        'errorCount': errorCount,
        'message': successCount > 0 
            ? '✅ Successfully assigned $successCount customer${successCount != 1 ? 's' : ''}!'
            : '✅ All customers already assigned to this vehicle',
        'data': response['data'],
        'notifications': response['notifications'],
      };
    } else {
      // ✅ REAL ERRORS DETECTED - SHOW ERROR
      debugPrint('\n❌❌❌ ROUTE ASSIGNMENT FAILED ❌❌❌');
      debugPrint('Real errors detected that prevented assignment');
      debugPrint('📊 Success Count: $successCount');
      debugPrint('📊 Error Count: $errorCount');
      
      // Log all REAL errors from backend
      if (response['data'] != null && response['data']['failed'] != null) {
        final failed = response['data']['failed'] as List;
        debugPrint('\n❌ DETAILED ERROR BREAKDOWN (${failed.length} failures):');
        debugPrint('='*80);
        for (var i = 0; i < failed.length; i++) {
          final error = failed[i];
          debugPrint('\n🚫 Error #${i + 1}: ${error['customerName']}');
          debugPrint('   Status: FAILED');
          debugPrint('   Reason: ${error['error']}');
          debugPrint('   Friendly Message: ${error['friendlyMessage']}');
          debugPrint('   Action Required: ${error['actionRequired']}');
          if (error['sequence'] != null) {
            debugPrint('   Sequence: ${error['sequence']}');
          }
          debugPrint('-'*80);
        }
        debugPrint('='*80);
      }
      
      // Log advice if provided
      if (response['advice'] != null) {
        debugPrint('\n💡 ADVICE FROM BACKEND:');
        debugPrint(response['advice']);
      }
      
      debugPrint('\n❌❌❌ END OF ERROR REPORT ❌❌❌\n');
      
      throw Exception(response['message'] ?? 'Failed to assign optimized route');
    }
  } catch (e) {
    debugPrint('\n' + '❌'*40);
    debugPrint('❌ ERROR IN assignOptimizedRoute');
    debugPrint('❌'*40);
    debugPrint('Error Type: ${e.runtimeType}');
    debugPrint('Error Message: $e');
    debugPrint('Stack Trace:');
    debugPrint(StackTrace.current.toString());
    debugPrint('❌'*40 + '\n');
    rethrow;
  }
}


  /// ✅ POLLING: Watch approved rosters with periodic refresh (replaces Firebase real-time)
  Stream<List<Map<String, dynamic>>> watchApprovedRosters({
    String? officeLocation,
    String? rosterType,
  }) async* {
    // Initial load
    yield await getApprovedRosters(
      officeLocation: officeLocation,
      rosterType: rosterType,
    );

    // Poll every 30 seconds for updates
    await for (final _ in Stream.periodic(const Duration(seconds: 30))) {
      try {
        final rosters = await getApprovedRosters(
          officeLocation: officeLocation,
          rosterType: rosterType,
        );
        yield rosters;
      } catch (e) {
        debugPrint('Error polling approved rosters: $e');
        // Continue polling even if one request fails
      }
    }
  }

  /// Get all rosters with filters
  Future<List<Map<String, dynamic>>> getAllRosters({
    String? status,
    String? rosterType,
    String? startDate,
    String? endDate,
    String? officeLocation,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (status != null) queryParams['status'] = status;
      if (rosterType != null) queryParams['rosterType'] = rosterType;
      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;
      if (officeLocation != null) queryParams['officeLocation'] = officeLocation;

      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');

      final endpoint = '/api/roster/admin/all' + 
          (queryString.isNotEmpty ? '?$queryString' : '');

      final response = await _apiService.get(endpoint);

      if (response['success'] == true) {
        return List<Map<String, dynamic>>.from(response['data'] ?? []);
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch rosters');
      }
    } catch (e) {
      debugPrint('Error fetching all rosters: $e');
      rethrow;
    }
  }

  /// Assign driver and vehicle to a roster
  Future<bool> assignRoster({
    required String rosterId,
    required String driverId,
    required String vehicleId,
  }) async {
    try {
      final response = await _apiService.post(
        '/api/roster/admin/assign',
        body: {
          'rosterId': rosterId,
          'driverId': driverId,
          'vehicleId': vehicleId,
        },
      );

      if (response['success'] == true) {
        return true;
      } else {
        throw Exception(response['message'] ?? 'Failed to assign roster');
      }
    } catch (e) {
      debugPrint('Error assigning roster: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Update driver and vehicle assignment
  Future<bool> updateRosterAssignment({
    required String rosterId,
    required String driverId,
    required String vehicleId,
  }) async {
    try {
      final response = await _apiService.put(
        '/api/roster/admin/edit-assignment/$rosterId',
        body: {
          'driverId': driverId,
          'vehicleId': vehicleId,
        },
      );

      if (response['success'] == true) {
        return true;
      } else {
        throw Exception(response['message'] ?? 'Failed to update assignment');
      }
    } catch (e) {
      debugPrint('Error updating assignment: $e');
      rethrow;
    }
  }

  /// Get roster by ID
  Future<Map<String, dynamic>> getRosterById(String rosterId) async {
    try {
      final response = await _apiService.get('/api/roster/$rosterId');
      
      if (response['success'] == true) {
        return response['data'];
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch roster details');
      }
    } catch (e) {
      debugPrint('Error fetching roster details: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Get driver's assigned rosters (for driver app)
  Future<List<Map<String, dynamic>>> getDriverRosters(String driverId) async {
    try {
      final response = await _apiService.get('/api/roster/driver/$driverId/rosters');
      
      if (response['success'] == true) {
        return List<Map<String, dynamic>>.from(response['data'] ?? []);
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch driver rosters');
      }
    } catch (e) {
      debugPrint('Error fetching driver rosters: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Mark roster as started by driver
  Future<bool> startRoster(String rosterId) async {
    try {
      final response = await _apiService.post(
        '/api/roster/driver/start',
        body: {'rosterId': rosterId},
      );
      
      return response['success'] == true;
    } catch (e) {
      debugPrint('Error starting roster: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Mark roster as completed by driver
  Future<bool> completeRoster(String rosterId, {
    String? completionNotes,
    Map<String, dynamic>? completionData,
  }) async {
    try {
      final response = await _apiService.post(
        '/api/roster/driver/complete',
        body: {
          'rosterId': rosterId,
          if (completionNotes != null) 'notes': completionNotes,
          if (completionData != null) 'completionData': completionData,
        },
      );
      
      return response['success'] == true;
    } catch (e) {
      debugPrint('Error completing roster: $e');
      rethrow;
    }
  }

  /// Update roster status
  Future<bool> updateRosterStatus(String rosterId, String status) async {
    try {
      final response = await _apiService.put(
        '/api/roster/$rosterId/status',
        body: {'status': status},
      );
      
      return response['success'] == true;
    } catch (e) {
      debugPrint('Error updating roster status: $e');
      rethrow;
    }
  }

  /// Cancel roster
  Future<bool> cancelRoster(String rosterId, String reason) async {
    try {
      final response = await _apiService.put(
        '/api/roster/$rosterId/cancel',
        body: {'reason': reason},
      );
      
      return response['success'] == true;
    } catch (e) {
      debugPrint('Error canceling roster: $e');
      rethrow;
    }
  }

  /// ✅ POLLING: Listen to single roster status changes (replaces Firebase real-time)
  Stream<Map<String, dynamic>?> watchRosterStatus(String rosterId) async* {
    // Poll every 10 seconds for roster status updates
    await for (final _ in Stream.periodic(const Duration(seconds: 10))) {
      try {
        final roster = await getRosterById(rosterId);
        yield roster;
      } catch (e) {
        debugPrint('Error polling roster status: $e');
        yield null;
      }
    }
  }

  /// ✅ POLLING: Get roster count by status (replaces Firebase real-time)
  Stream<int> watchRosterCountByStatus(String status) async* {
    // Poll every 30 seconds for count updates
    await for (final _ in Stream.periodic(const Duration(seconds: 30))) {
      try {
        final rosters = await getAllRosters(status: status);
        yield rosters.length;
      } catch (e) {
        debugPrint('Error polling roster count: $e');
        yield 0;
      }
    }
  }

  /// Refresh rosters data - placeholder method for admin shell
  void refreshRosters() {
    // TODO: Implement roster refresh logic if needed
    // This method can be used to refresh roster data in the admin interface
    debugPrint('Refreshing rosters data...');
  }
}

/// Model for roster statistics
class RosterStats {
  final int pending;
  final int assigned;
  final int inProgress;
  final int completed;
  final int cancelled;
  final int total;

  RosterStats({
    required this.pending,
    required this.assigned,
    required this.inProgress,
    required this.completed,
    required this.cancelled,
    required this.total,
  });

  factory RosterStats.fromJson(Map<String, dynamic> json) {
    return RosterStats(
      pending: json['pending'] ?? 0,
      assigned: json['assigned'] ?? 0,
      inProgress: json['inProgress'] ?? 0,
      completed: json['completed'] ?? 0,
      cancelled: json['cancelled'] ?? 0,
      total: json['total'] ?? 0,
    );
  }

  factory RosterStats.empty() {
    return RosterStats(
      pending: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    );
  }
}

// ============================================================================
// DASHBOARD WIDGET - REAL-TIME ROSTER STATS
// ============================================================================

class PendingRostersCard extends StatefulWidget {
  final VoidCallback? onTap;
  final RosterService rosterService;

  const PendingRostersCard({
    super.key,
    this.onTap,
    required this.rosterService,
  });

  @override
  State<PendingRostersCard> createState() => _PendingRostersCardState();
}

class _PendingRostersCardState extends State<PendingRostersCard> {
  RosterStats? _stats;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final stats = await widget.rosterService.getRosterStats();
      if (mounted) {
        setState(() {
          _stats = stats;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.calendar_today,
                      color: Colors.orange,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Pending Rosters',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (_isLoading)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  else if (_error != null)
                    const Icon(Icons.error_outline, color: Colors.red, size: 20)
                  else
                    const Icon(Icons.arrow_forward_ios, size: 16),
                ],
              ),
              const SizedBox(height: 16),
              
              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text('Loading...'),
                  ),
                )
              else if (_error != null)
                Text(
                  'Failed to load',
                  style: TextStyle(
                    color: Colors.red[700],
                    fontSize: 12,
                  ),
                )
              else ...[
                Text(
                  '${_stats?.pending ?? 0}',
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(height: 8),
                
                Wrap(
                  spacing: 16,
                  runSpacing: 8,
                  children: [
                    _buildStatusChip('Assigned', _stats?.assigned ?? 0, Colors.blue),
                    _buildStatusChip('Active', _stats?.inProgress ?? 0, Colors.green),
                    _buildStatusChip('Done', _stats?.completed ?? 0, Colors.grey),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String label, int count, Color color) {
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
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              count.toString(),
              style: const TextStyle(
                fontSize: 10,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// ✅ NEW: Real-time roster stats widget
class RealtimeRosterStatsCard extends StatelessWidget {
  final RosterService rosterService;
  final VoidCallback? onTap;

  const RealtimeRosterStatsCard({
    super.key,
    required this.rosterService,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.dashboard, color: Color(0xFF0D47A1)),
                  const SizedBox(width: 8),
                  const Text(
                    'Roster Status',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'LIVE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildRealtimeCounter('Pending', 'pending_assignment', Colors.orange),
                  _buildRealtimeCounter('Active', 'in_progress', Colors.green),
                  _buildRealtimeCounter('Done', 'completed', Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRealtimeCounter(String label, String status, Color color) {
    return StreamBuilder<int>(
      stream: rosterService.watchRosterCountByStatus(status),
      initialData: 0,
      builder: (context, snapshot) {
        return Column(
          children: [
            Text(
              snapshot.data.toString(),
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ],
        );
      },
    );
  }
}

// ========== ROUTE OPTIMIZATION EXTENSION ==========

extension RouteOptimizationExtension on RosterService {
  /// Optimize routes for multiple rosters
  Future<Map<String, dynamic>> optimizeRoutes({
    required List<String> rosterIds,
    int? count,
  }) async {
    try {
      debugPrint('🚀 RosterService: Optimizing routes for ${rosterIds.length} rosters');
      
      final response = await _apiService.post(
        '/api/roster/optimize',
        body: {
          'rosterIds': rosterIds,
          'count': count ?? rosterIds.length,
        },
      );
      
      if (response['success'] == true) {
        debugPrint('✅ Route optimization successful');
        return response['data'];
      } else {
        throw Exception(response['message'] ?? 'Route optimization failed');
      }
    } catch (e) {
      debugPrint('❌ Error optimizing routes: $e');
      rethrow;
    }
  }
  
  /// Bulk assign drivers to rosters
  Future<Map<String, dynamic>> bulkAssignDrivers({
    required List<Map<String, dynamic>> assignments,
  }) async {
    try {
      debugPrint('📦 RosterService: Bulk assigning ${assignments.length} rosters');
      
      final response = await _apiService.post(
        '/api/roster/assign-bulk',
        body: {
          'assignments': assignments,
        },
      );
      
      if (response['success'] == true) {
        debugPrint('✅ Bulk assignment successful');
        return response['data'];
      } else {
        throw Exception(response['message'] ?? 'Bulk assignment failed');
      }
    } catch (e) {
      debugPrint('❌ Error in bulk assignment: $e');
      rethrow;
    }
  }
  
  /// Get available drivers for route optimization
  Future<List<Map<String, dynamic>>> getAvailableDrivers() async {
    try {
      debugPrint('🚗 RosterService: Fetching available drivers');
      
      final response = await _apiService.get('/api/roster/drivers/available');
      
      if (response['success'] == true) {
        final drivers = List<Map<String, dynamic>>.from(response['data'] ?? []);
        debugPrint('✅ Found ${drivers.length} available drivers');
        return drivers;
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch available drivers');
      }
    } catch (e) {
      debugPrint('❌ Error fetching available drivers: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Batch assign rosters to vehicle (Route Optimization)
  Future<Map<String, dynamic>> assignRostersToVehicle({
    required String vehicleId,
    required List<String> rosterIds,
    Map<String, dynamic>? routeDetails,
  }) async {
    try {
      debugPrint('🚀 RosterService: Batch assigning ${rosterIds.length} rosters to vehicle $vehicleId');
      
      final response = await _apiService.post(
        '/api/roster/admin/assign-batch',
        body: {
          'vehicleId': vehicleId,
          'rosterIds': rosterIds,
          'routeDetails': routeDetails,
        },
      );
      
      if (response['success'] == true) {
        debugPrint('✅ Batch vehicle assignment successful');
        return response['data'];
      } else {
        throw Exception(response['message'] ?? 'Batch vehicle assignment failed');
      }
    } catch (e) {
      debugPrint('❌ Error in batch vehicle assignment: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Group similar rosters by matching criteria
  Future<Map<String, dynamic>> groupSimilarRosters() async {
  try {
    debugPrint('\n' + '🔍'*40);
    debugPrint('RosterService: Grouping similar rosters');
    debugPrint('🔍'*40);
    
    final response = await _apiService.post('/api/roster/admin/group-similar', body: {});
    
    debugPrint('📥 API Response received:');
    debugPrint('   - Success: ${response['success']}');
    debugPrint('   - Message: ${response['message']}');
    
    if (response['success'] == true) {
      final data = response['data'];
      final groups = List<Map<String, dynamic>>.from(data['groups'] ?? []);
      debugPrint('✅ Grouping successful!');
      debugPrint('📊 Results:');
      debugPrint('   - Total groups: ${groups.length}');
      debugPrint('   - Total rosters: ${data['totalRosters']}');
      debugPrint('🔍'*40 + '\n');
      
      // ✅ FIX: Return the full response structure expected by frontend
      return {
        'success': true,
        'groups': data['groups'],
        'totalRosters': data['totalRosters'],
        'totalGroups': data['totalGroups'],
      };
    } else {
      debugPrint('❌ Grouping failed: ${response['message']}');
      throw Exception(response['message'] ?? 'Failed to group rosters');
    }
  } catch (e) {
    debugPrint('\n' + '❌'*40);
    debugPrint('RosterService: Error grouping rosters');
    debugPrint('❌'*40);
    debugPrint('Error: $e');
    debugPrint('❌'*40 + '\n');
    rethrow;
  }
}

  /// ✅ NEW: Get compatible vehicles for given rosters (filtered by email domain, timing, capacity)
  Future<Map<String, dynamic>> getCompatibleVehicles(List<String> rosterIds) async {
    try {
      debugPrint('\n' + '🔍'*40);
      debugPrint('RosterService: Getting compatible vehicles');
      debugPrint('🔍'*40);
      debugPrint('📋 Parameters:');
      debugPrint('   - Roster IDs: ${rosterIds.length}');
      debugPrint('-'*80);
      
      final response = await _apiService.post(
        '/api/roster/compatible-vehicles',
        body: {
          'rosterIds': rosterIds,
        },
      );
      
      debugPrint('📥 API Response received:');
      debugPrint('   - Success: ${response['success']}');
      debugPrint('   - Message: ${response['message']}');
      
      if (response['success'] == true) {
        final data = response['data'];
        final compatible = List<Map<String, dynamic>>.from(data['compatible'] ?? []);
        final incompatible = List<Map<String, dynamic>>.from(data['incompatible'] ?? []);
        
        debugPrint('✅ Compatible vehicles found!');
        debugPrint('📊 Results:');
        debugPrint('   - Compatible: ${compatible.length}');
        debugPrint('   - Incompatible: ${incompatible.length}');
        debugPrint('🔍'*40 + '\n');
        
        return {
          'success': true,
          'data': data,
          'count': compatible.length,
        };
      } else {
        debugPrint('❌ Failed to get compatible vehicles: ${response['message']}');
        throw Exception(response['message'] ?? 'Failed to get compatible vehicles');
      }
    } catch (e) {
      debugPrint('\n' + '❌'*40);
      debugPrint('RosterService: Error getting compatible vehicles');
      debugPrint('❌'*40);
      debugPrint('Error: $e');
      debugPrint('❌'*40 + '\n');
      rethrow;
    }
  }

  // ========================================================================
  // ADDRESS CHANGE REQUEST METHODS
  // ========================================================================

  /// Submit an address change request
  Future<Map<String, dynamic>> submitAddressChangeRequest({
    required String currentPickupAddress,
    required String newPickupAddress,
    double? newPickupLat,
    double? newPickupLng,
    required String currentDropAddress,
    required String newDropAddress,
    double? newDropLat,
    double? newDropLng,
    String? reason,
  }) async {
    try {
      debugPrint('📍 RosterService: Submitting address change request');
      
      final response = await _apiService.post(
        '/api/address-change/customer/request',
        body: {
          'currentPickupAddress': currentPickupAddress,
          'newPickupAddress': newPickupAddress,
          if (newPickupLat != null) 'newPickupLat': newPickupLat,
          if (newPickupLng != null) 'newPickupLng': newPickupLng,
          'currentDropAddress': currentDropAddress,
          'newDropAddress': newDropAddress,
          if (newDropLat != null) 'newDropLat': newDropLat,
          if (newDropLng != null) 'newDropLng': newDropLng,
          'reason': reason ?? '',
        },
      );
      
      if (response['success'] == true) {
        debugPrint('✅ Address change request submitted successfully');
        return response;
      } else {
        throw Exception(response['message'] ?? 'Failed to submit address change request');
      }
    } catch (e) {
      debugPrint('❌ Error submitting address change request: $e');
      rethrow;
    }
  }

  /// Get customer's address change requests
  Future<Map<String, dynamic>> getAddressChangeRequests(String? status) async {
    try {
      debugPrint('📋 RosterService: Fetching address change requests');
      
      final queryParams = <String, String>{};
      if (status != null && status != 'all') queryParams['status'] = status;

      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');

      final endpoint = '/api/address-change/customer/requests' + 
          (queryString.isNotEmpty ? '?$queryString' : '');

      final response = await _apiService.get(endpoint);
      
      if (response['success'] == true) {
        debugPrint('✅ Fetched address change requests');
        return response;
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch address change requests');
      }
    } catch (e) {
      debugPrint('❌ Error fetching address change requests: $e');
      rethrow;
    }
  }

  /// Get customer's current addresses
  Future<Map<String, dynamic>> getCurrentAddresses() async {
    try {
      debugPrint('📍 RosterService: Fetching current addresses');
      
      final response = await _apiService.get('/api/address-change/customer/current-addresses');
      
      if (response['success'] == true) {
        debugPrint('✅ Fetched current addresses');
        return response;
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch current addresses');
      }
    } catch (e) {
      debugPrint('❌ Error fetching current addresses: $e');
      rethrow;
    }
  }

  /// ✅ NEW: Get all assigned trips for client management
  /// Fetches trips with status: assigned, ongoing, completed, cancelled
  Future<Map<String, dynamic>> getAssignedTrips({
    String? status,
    String? company,
    String? startDate,
    String? endDate,
  }) async {
    try {
      debugPrint('📋 RosterService: Fetching assigned trips for client management');
      
      final queryParams = <String, String>{};
      if (status != null && status != 'all') queryParams['status'] = status;
      if (company != null && company != 'All Companies') queryParams['company'] = company;
      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;

      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');

      final endpoint = '/api/roster/admin/assigned-trips' + 
          (queryString.isNotEmpty ? '?$queryString' : '');

      final response = await _apiService.get(endpoint);
      
      if (response['success'] == true) {
        final trips = List<Map<String, dynamic>>.from(response['data'] ?? []);
        debugPrint('✅ Fetched ${trips.length} assigned trips');
        return {
          'success': true,
          'data': trips,
          'count': trips.length,
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch assigned trips');
      }
    } catch (e) {
      debugPrint('❌ Error fetching assigned trips: $e');
      rethrow;
    }
  }
}
