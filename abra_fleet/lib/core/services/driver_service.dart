// lib/core/services/driver_service.dart
// ============================================================================
// DRIVER SERVICE - Centralized Driver Data Management (JWT AUTH ONLY)
// ============================================================================
// This service manages ALL drivers from MongoDB 'drivers' collection ONLY
// regardless of how they were created:
// - Self-registration (driver registration)
// - Admin creation (admin-drivers.js)
// - Bulk import (admin-drivers.js bulk-import)
// - Employee conversion to driver
// ============================================================================
// AUTHENTICATION: JWT-based authentication (NO FIREBASE)
// SINGLE SOURCE OF TRUTH: drivers collection only
// ============================================================================

import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../app/config/api_config.dart';

class DriverService {
  // Singleton pattern
  static final DriverService _instance = DriverService._internal();
  factory DriverService() => _instance;
  DriverService._internal();

  /// ========================================================================
  /// CORE DRIVER MANAGEMENT - Single Source of Truth
  /// ========================================================================

  /// Fetch ALL drivers from MongoDB 'drivers' collection
  /// This is the SINGLE SOURCE OF TRUTH for all driver data
  Future<Map<String, dynamic>> getAllDrivers({
    String? status,
    String? search,
    String? organization,
    String? department,
    int page = 1,
    int limit = 100,
    bool fullDetails = false,
  }) async {
    try {
      print('\n🚗 FETCHING ALL DRIVERS FROM BACKEND (JWT AUTH)');
      print('─' * 80);

      // Build query parameters
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
        'fullDetails': fullDetails.toString(),
      };

      if (status != null && status.isNotEmpty && status != 'All') {
        queryParams['status'] = status;
      }

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      if (organization != null && organization.isNotEmpty && organization != 'All Organizations') {
        queryParams['organization'] = organization;
      }

      if (department != null && department.isNotEmpty && department != 'All Departments') {
        queryParams['department'] = department;
      }

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers')
          .replace(queryParameters: queryParams);

      print('📡 API URL: $uri');

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Request timeout - Please check your connection');
        },
      );

      print('📥 Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          final List<dynamic> driversJson = jsonData['data'] ?? [];
          
          print('✅ Successfully fetched ${driversJson.length} drivers');
          
          // Print summary
          if (jsonData['summary'] != null) {
            print('📊 Summary:');
            print('   Total: ${jsonData['summary']['total']}');
            print('   Active: ${jsonData['summary']['active']}');
            print('   On Leave: ${jsonData['summary']['onLeave']}');
            print('   Inactive: ${jsonData['summary']['inactive']}');
          }

          return jsonData;
        } else {
          throw Exception(jsonData['message'] ?? 'Failed to fetch drivers');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else if (response.statusCode == 403) {
        throw Exception('Access denied - You don\'t have permission to view drivers');
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to fetch drivers');
      }
    } catch (e) {
      print('❌ Error fetching drivers: $e');
      rethrow;
    }
  }

  /// Get driver by ID from drivers collection
  Future<Map<String, dynamic>?> getDriverById(String driverId) async {
    try {
      print('\n🔍 FETCHING DRIVER BY ID: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId');

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true && jsonData['data'] != null) {
          print('✅ Driver found');
          return jsonData['data'];
        }
      } else if (response.statusCode == 404) {
        print('⚠️ Driver not found');
        return null;
      }

      throw Exception('Failed to fetch driver details');
    } catch (e) {
      print('❌ Error fetching driver: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// DRIVER CREATION - Multiple Sources, Single Destination
  /// ========================================================================

  /// Create new driver (Admin creation)
  /// Stores ONLY in 'drivers' collection with JWT authentication
  Future<Map<String, dynamic>> createDriver({
    required String driverId,
    required Map<String, dynamic> personalInfo,
    required Map<String, dynamic> license,
    Map<String, dynamic>? emergencyContact,
    Map<String, dynamic>? address,
    Map<String, dynamic>? employment,
    Map<String, dynamic>? bankDetails,
    String status = 'active',
  }) async {
    try {
      print('\n➕ CREATING NEW DRIVER (JWT AUTH ONLY)');
      print('─' * 80);

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers');

      final body = {
        'driverId': driverId,
        'personalInfo': personalInfo,
        'license': license,
        'status': status,
      };

      if (emergencyContact != null) body['emergencyContact'] = emergencyContact;
      if (address != null) body['address'] = address;
      if (employment != null) body['employment'] = employment;
      if (bankDetails != null) body['bankDetails'] = bankDetails;

      print('📤 Request body: ${json.encode(body)}');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
        body: json.encode(body),
      ).timeout(const Duration(seconds: 30));

      print('📥 Response Status: ${response.statusCode}');

      if (response.statusCode == 201 || response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Driver created successfully in drivers collection');
          print('   MongoDB _id: ${jsonData['data']['_id']}');
          print('   Driver ID: ${jsonData['data']['driverId']}');
          print('   Authentication: JWT-based (NO Firebase)');
          return jsonData;
        }
      }

      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to create driver');
    } catch (e) {
      print('❌ Error creating driver: $e');
      rethrow;
    }
  }

  /// Bulk import drivers
  /// All drivers stored ONLY in 'drivers' collection
  Future<Map<String, dynamic>> bulkImportDrivers(List<Map<String, dynamic>> drivers) async {
    try {
      print('\n📦 BULK IMPORTING ${drivers.length} DRIVERS (JWT AUTH)');
      print('─' * 80);

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/bulk-import');

      final body = {'drivers': drivers};

      print('📤 Importing ${drivers.length} drivers...');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
        body: json.encode(body),
      ).timeout(const Duration(seconds: 120)); // Longer timeout for bulk operations

      print('📥 Response Status: ${response.statusCode}');

      if (response.statusCode == 201 || response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Bulk import completed successfully');
          print('   Imported: ${jsonData['imported']} drivers');
          print('   Failed: ${jsonData['failed']} drivers');
          return jsonData;
        }
      }

      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to bulk import drivers');
    } catch (e) {
      print('❌ Error bulk importing drivers: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// DRIVER UPDATES & MANAGEMENT
  /// ========================================================================

  /// Update driver information
  Future<Map<String, dynamic>> updateDriver({
    required String driverId,
    Map<String, dynamic>? personalInfo,
    Map<String, dynamic>? license,
    Map<String, dynamic>? emergencyContact,
    Map<String, dynamic>? address,
    Map<String, dynamic>? employment,
    Map<String, dynamic>? bankDetails,
    String? status,
  }) async {
    try {
      print('\n✏️ UPDATING DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId');

      final body = <String, dynamic>{};
      if (personalInfo != null) body['personalInfo'] = personalInfo;
      if (license != null) body['license'] = license;
      if (emergencyContact != null) body['emergencyContact'] = emergencyContact;
      if (address != null) body['address'] = address;
      if (employment != null) body['employment'] = employment;
      if (bankDetails != null) body['bankDetails'] = bankDetails;
      if (status != null) body['status'] = status;

      final response = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
        body: json.encode(body),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Driver updated successfully');
          return jsonData;
        }
      }

      throw Exception('Failed to update driver');
    } catch (e) {
      print('❌ Error updating driver: $e');
      rethrow;
    }
  }

  /// Delete/Deactivate driver
  Future<bool> deleteDriver(String driverId) async {
    try {
      print('\n🗑️ DELETING DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId');

      final response = await http.delete(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Driver deleted/deactivated successfully');
          return true;
        }
      }

      throw Exception('Failed to delete driver');
    } catch (e) {
      print('❌ Error deleting driver: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// VEHICLE ASSIGNMENT MANAGEMENT
  /// ========================================================================

  /// Assign vehicle to driver
  Future<Map<String, dynamic>> assignVehicle(String driverId, String vehicleId) async {
    try {
      print('\n🚗 ASSIGNING VEHICLE TO DRIVER (JWT AUTH)');
      print('   Driver: $driverId');
      print('   Vehicle: $vehicleId');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/assign-vehicle');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
        body: json.encode({'vehicleId': vehicleId}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Vehicle assigned successfully');
          return jsonData;
        }
      }

      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to assign vehicle');
    } catch (e) {
      print('❌ Error assigning vehicle: $e');
      rethrow;
    }
  }

  /// Unassign vehicle from driver
  Future<Map<String, dynamic>> unassignVehicle(String driverId) async {
    try {
      print('\n🚗 UNASSIGNING VEHICLE FROM DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/unassign-vehicle');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Vehicle unassigned successfully');
          return jsonData;
        }
      }

      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to unassign vehicle');
    } catch (e) {
      print('❌ Error unassigning vehicle: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// DOCUMENT MANAGEMENT
  /// ========================================================================

  /// Add driver document
  Future<Map<String, dynamic>> addDriverDocument({
    required String driverId,
    required String documentType,
    required String documentName,
    required String documentUrl,
    DateTime? expiryDate,
  }) async {
    try {
      print('\n📄 ADDING DOCUMENT TO DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/documents');

      final body = {
        'documentType': documentType,
        'documentName': documentName,
        'documentUrl': documentUrl,
        if (expiryDate != null) 'expiryDate': expiryDate.toIso8601String(),
      };

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
        body: json.encode(body),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Document added successfully');
          return jsonData;
        }
      }

      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to add document');
    } catch (e) {
      print('❌ Error adding document: $e');
      rethrow;
    }
  }

  /// Upload driver document with file
  Future<Map<String, dynamic>> uploadDriverDocument({
    required String driverId,
    File? file,
    Uint8List? bytes,
    required String fileName,
    required String documentType,
    required String documentName,
    DateTime? expiryDate,
  }) async {
    try {
      print('\n📤 UPLOADING DOCUMENT FOR DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/documents/drivers/$driverId/documents');

      var request = http.MultipartRequest('POST', uri);
      
      // Add auth headers
      final token = await _getAuthToken();
      request.headers['Authorization'] = 'Bearer $token';

      // Add file
      if (file != null) {
        request.files.add(await http.MultipartFile.fromPath('file', file.path));
      } else if (bytes != null) {
        request.files.add(http.MultipartFile.fromBytes('file', bytes, filename: fileName));
      } else {
        throw Exception('Either file or bytes must be provided');
      }

      // Add metadata
      request.fields['documentType'] = documentType;
      request.fields['documentName'] = documentName;
      if (expiryDate != null) {
        request.fields['expiryDate'] = expiryDate.toIso8601String();
      }

      final streamedResponse = await request.send().timeout(const Duration(seconds: 60));
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonData = json.decode(response.body);
        print('✅ Document uploaded successfully');
        return jsonData;
      }

      final errorData = json.decode(response.body);
      throw Exception(errorData['message'] ?? 'Failed to upload document');
    } catch (e) {
      print('❌ Error uploading document: $e');
      rethrow;
    }
  }

  /// Delete driver document
  Future<bool> deleteDriverDocument(String driverId, String documentId) async {
    try {
      print('\n🗑️ DELETING DOCUMENT: $documentId FROM DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/documents/$documentId');

      final response = await http.delete(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('✅ Document deleted successfully');
        return true;
      }

      throw Exception('Failed to delete document');
    } catch (e) {
      print('❌ Error deleting document: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// DRIVER STATISTICS & REPORTS
  /// ========================================================================

  /// Get driver statistics
  Future<Map<String, dynamic>> getDriverStats() async {
    try {
      print('\n📊 FETCHING DRIVER STATISTICS (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers?limit=1');

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true && jsonData['summary'] != null) {
          print('✅ Driver stats fetched successfully');
          return jsonData['summary'];
        }
      }

      // Fallback: return default stats
      return {
        'total': 0,
        'active': 0,
        'onLeave': 0,
        'inactive': 0,
      };
    } catch (e) {
      print('❌ Error fetching driver stats: $e');
      return {
        'total': 0,
        'active': 0,
        'onLeave': 0,
        'inactive': 0,
      };
    }
  }

  /// Get driver trip history
  Future<Map<String, dynamic>> getDriverTrips(
    String driverId, {
    int page = 1,
    int limit = 10,
    String? status,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      print('\n🚛 FETCHING TRIPS FOR DRIVER: $driverId (JWT AUTH)');

      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status.isNotEmpty) queryParams['status'] = status;
      if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/trips')
          .replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Driver trips fetched successfully');
          return jsonData;
        }
      }

      throw Exception('Failed to fetch driver trips');
    } catch (e) {
      print('❌ Error fetching driver trips: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// PASSWORD MANAGEMENT (JWT-based)
  /// ========================================================================

  /// Send password reset email to driver
  Future<bool> sendPasswordResetEmail(String driverId) async {
    try {
      print('\n📧 SENDING PASSWORD RESET EMAIL TO DRIVER: $driverId (JWT AUTH)');

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/admin/drivers/$driverId/send-password-reset');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await _getAuthToken()}',
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        
        if (jsonData['success'] == true) {
          print('✅ Password reset email sent successfully');
          return true;
        }
      }

      throw Exception('Failed to send password reset email');
    } catch (e) {
      print('❌ Error sending password reset email: $e');
      rethrow;
    }
  }

  /// ========================================================================
  /// UTILITY METHODS
  /// ========================================================================

  /// Get authentication token from SharedPreferences (JWT)
  Future<String> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null && token.isNotEmpty) {
      return token;
    }
    throw Exception('User not authenticated - Please login again');
  }

  /// Legacy method aliases for backward compatibility
  @Deprecated('Use getAllDrivers() instead')
  Future<Map<String, dynamic>> getDrivers({
    String? status,
    int page = 1,
    int limit = 20,
    String? search,
    bool fullDetails = false,
  }) async {
    return getAllDrivers(
      status: status,
      page: page,
      limit: limit,
      search: search,
      fullDetails: fullDetails,
    );
  }

  @Deprecated('Use createDriver() instead')
  Future<Map<String, dynamic>> addDriver(Map<String, dynamic> driverData) async {
    return createDriver(
      driverId: driverData['driverId'],
      personalInfo: driverData['personalInfo'],
      license: driverData['license'],
      emergencyContact: driverData['emergencyContact'],
      address: driverData['address'],
      employment: driverData['employment'],
      bankDetails: driverData['bankDetails'],
      status: driverData['status'] ?? 'active',
    );
  }
}