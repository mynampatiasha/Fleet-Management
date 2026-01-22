// lib/core/services/client_service.dart
// Client Service - Handles all client-related API operations (MongoDB only, no Firebase)

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'package:abra_fleet/app/config/api_config.dart';
import 'package:abra_fleet/core/models/client_model.dart';

class ClientService {
  // Singleton pattern
  static final ClientService _instance = ClientService._internal();
  factory ClientService() => _instance;
  ClientService._internal();

  // Base URL for client APIs
  String get _baseUrl => '${ApiConfig.baseUrl}/api/admin/clients/unified';

  // Get JWT token from SharedPreferences
  Future<String?> _getToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('jwt_token');
    } catch (e) {
      debugPrint('❌ Error getting JWT token: $e');
      return null;
    }
  }

  // Get authorization headers
  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${token ?? ''}',
    };
  }

  /// Fetch all clients from MongoDB
  /// 
  /// Parameters:
  /// - [page]: Page number for pagination (default: 1)
  /// - [limit]: Number of items per page (default: 50)
  /// - [status]: Filter by status ('active', 'inactive', 'pending', or null for all)
  /// - [search]: Search query for name, email, phone, or clientId
  /// - [organization]: Filter by organization name
  /// 
  /// Returns: List of ClientModel objects
  Future<List<ClientModel>> getAllClients({
    int page = 1,
    int limit = 50,
    String? status,
    String? search,
    String? organization,
  }) async {
    try {
      debugPrint('📥 Fetching clients from MongoDB...');
      debugPrint('   - Page: $page, Limit: $limit');
      if (status != null) debugPrint('   - Status filter: $status');
      if (search != null) debugPrint('   - Search query: $search');
      if (organization != null) debugPrint('   - Organization filter: $organization');

      // Build query parameters
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      if (organization != null && organization.isNotEmpty) {
        queryParams['organization'] = organization;
      }

      final uri = Uri.parse(_baseUrl).replace(queryParameters: queryParams);
      final headers = await _getHeaders();

      final response = await http.get(uri, headers: headers);

      debugPrint('📡 Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> clientsJson = data['data'];
          final clients = clientsJson
              .map((json) => ClientModel.fromJson(json))
              .toList();
          
          debugPrint('✅ Loaded ${clients.length} clients from MongoDB');
          
          // Log pagination info if available
          if (data['pagination'] != null) {
            debugPrint('📊 Pagination: ${data['pagination']}');
          }
          
          return clients;
        } else {
          debugPrint('⚠️ Unexpected response format: ${data}');
          return [];
        }
      } else if (response.statusCode == 401) {
        debugPrint('❌ Unauthorized: Invalid or expired token');
        throw Exception('Unauthorized: Please login again');
      } else {
        debugPrint('❌ Failed to fetch clients: ${response.statusCode}');
        debugPrint('   Response: ${response.body}');
        throw Exception('Failed to fetch clients: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('❌ Error fetching clients: $e');
      rethrow;
    }
  }

  /// Get a single client by ID
  /// 
  /// Parameters:
  /// - [clientId]: The client ID (MongoDB _id or custom clientId)
  /// 
  /// Returns: ClientModel object or null if not found
  Future<ClientModel?> getClientById(String clientId) async {
    try {
      debugPrint('📥 Fetching client by ID: $clientId');

      final uri = Uri.parse('$_baseUrl/$clientId');
      final headers = await _getHeaders();

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          final client = ClientModel.fromJson(data['data']);
          debugPrint('✅ Client found: ${client.name}');
          return client;
        }
      } else if (response.statusCode == 404) {
        debugPrint('⚠️ Client not found: $clientId');
        return null;
      } else {
        debugPrint('❌ Failed to fetch client: ${response.statusCode}');
        throw Exception('Failed to fetch client: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('❌ Error fetching client: $e');
      rethrow;
    }
    return null;
  }

  /// Create a new client
  /// 
  /// Parameters:
  /// - [name]: Client company name
  /// - [email]: Client email (unique)
  /// - [password]: Client password
  /// - [phone]: Client phone number
  /// - [address]: Client address
  /// - [contactPerson]: Contact person name
  /// - [branch]: Branch name (optional)
  /// - [gstNumber]: GST number (optional)
  /// - [panNumber]: PAN number (optional)
  /// - [companyName]: Company name (optional, defaults to name)
  /// - [organizationName]: Organization name (optional, defaults to name)
  /// 
  /// Returns: Created ClientModel object
  Future<ClientModel> createClient({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String address,
    required String contactPerson,
    String? branch,
    String? gstNumber,
    String? panNumber,
    String? companyName,
    String? organizationName,
  }) async {
    try {
      debugPrint('➕ Creating new client: $name');

      final uri = Uri.parse(_baseUrl);
      final headers = await _getHeaders();

      final body = json.encode({
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'address': address,
        'contactPerson': contactPerson,
        'branch': branch,
        'gstNumber': gstNumber,
        'panNumber': panNumber,
        'companyName': companyName ?? name,
        'organizationName': organizationName ?? name,
        'role': 'client',
        'status': 'active',
      });

      final response = await http.post(uri, headers: headers, body: body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          final client = ClientModel.fromJson(data['data']);
          debugPrint('✅ Client created successfully: ${client.id}');
          return client;
        } else {
          throw Exception(data['message'] ?? 'Failed to create client');
        }
      } else if (response.statusCode == 409) {
        debugPrint('❌ Client already exists with this email');
        throw Exception('A client with this email already exists');
      } else {
        final error = json.decode(response.body);
        debugPrint('❌ Failed to create client: ${error['message']}');
        throw Exception(error['message'] ?? 'Failed to create client');
      }
    } catch (e) {
      debugPrint('❌ Error creating client: $e');
      rethrow;
    }
  }

  /// Update an existing client
  /// 
  /// Parameters:
  /// - [clientId]: The client ID to update
  /// - [updateData]: Map of fields to update
  /// 
  /// Returns: Updated ClientModel object
  Future<ClientModel> updateClient(
    String clientId,
    Map<String, dynamic> updateData,
  ) async {
    try {
      debugPrint('🔄 Updating client: $clientId');
      debugPrint('   Update data: $updateData');

      final uri = Uri.parse('$_baseUrl/$clientId');
      final headers = await _getHeaders();

      final response = await http.put(
        uri,
        headers: headers,
        body: json.encode(updateData),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          final client = ClientModel.fromJson(data['data']);
          debugPrint('✅ Client updated successfully');
          return client;
        } else {
          throw Exception(data['message'] ?? 'Failed to update client');
        }
      } else if (response.statusCode == 404) {
        debugPrint('❌ Client not found: $clientId');
        throw Exception('Client not found');
      } else {
        final error = json.decode(response.body);
        debugPrint('❌ Failed to update client: ${error['message']}');
        throw Exception(error['message'] ?? 'Failed to update client');
      }
    } catch (e) {
      debugPrint('❌ Error updating client: $e');
      rethrow;
    }
  }

  /// Delete a client
  /// 
  /// Parameters:
  /// - [clientId]: The client ID to delete
  /// 
  /// Returns: true if successful
  Future<bool> deleteClient(String clientId) async {
    try {
      debugPrint('🗑️ Deleting client: $clientId');

      final uri = Uri.parse('$_baseUrl/$clientId');
      final headers = await _getHeaders();

      final response = await http.delete(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true) {
          debugPrint('✅ Client deleted successfully');
          return true;
        } else {
          throw Exception(data['message'] ?? 'Failed to delete client');
        }
      } else if (response.statusCode == 404) {
        debugPrint('❌ Client not found: $clientId');
        throw Exception('Client not found');
      } else {
        final error = json.decode(response.body);
        debugPrint('❌ Failed to delete client: ${error['message']}');
        throw Exception(error['message'] ?? 'Failed to delete client');
      }
    } catch (e) {
      debugPrint('❌ Error deleting client: $e');
      rethrow;
    }
  }

  /// Sync customer counts for all clients
  /// This triggers a backend process to update totalCustomers for each client
  /// 
  /// Returns: Map with sync results
  Future<Map<String, dynamic>> syncCustomerCounts({bool forceRefresh = false}) async {
    try {
      debugPrint('🔄 Syncing customer counts...');

      final uri = Uri.parse('${ApiConfig.baseUrl}/clients/sync-customer-counts');
      final headers = await _getHeaders();

      final response = await http.post(
        uri,
        headers: headers,
        body: json.encode({'forceRefresh': forceRefresh}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true) {
          debugPrint('✅ Customer counts synced successfully');
          debugPrint('   Total customers: ${data['totalCustomers']}');
          debugPrint('   Clients updated: ${data['updated']}');
          return data;
        } else {
          throw Exception(data['message'] ?? 'Failed to sync customer counts');
        }
      } else {
        debugPrint('❌ Failed to sync customer counts: ${response.statusCode}');
        throw Exception('Failed to sync customer counts');
      }
    } catch (e) {
      debugPrint('❌ Error syncing customer counts: $e');
      rethrow;
    }
  }

  /// Get client statistics summary
  /// 
  /// Returns: Map with client statistics
  Future<Map<String, dynamic>> getClientStatistics() async {
    try {
      debugPrint('📊 Fetching client statistics...');

      final uri = Uri.parse(_baseUrl);
      final headers = await _getHeaders();

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['summary'] != null) {
          debugPrint('✅ Client statistics fetched');
          return data['summary'];
        } else {
          return {
            'total': 0,
            'active': 0,
            'inactive': 0,
            'pending': 0,
          };
        }
      } else {
        debugPrint('❌ Failed to fetch statistics: ${response.statusCode}');
        return {
          'total': 0,
          'active': 0,
          'inactive': 0,
          'pending': 0,
        };
      }
    } catch (e) {
      debugPrint('❌ Error fetching statistics: $e');
      return {
        'total': 0,
        'active': 0,
        'inactive': 0,
        'pending': 0,
      };
    }
  }

  /// Get clients with pagination info
  /// 
  /// Returns: Map with clients list and pagination data
  Future<Map<String, dynamic>> getClientsPaginated({
    int page = 1,
    int limit = 50,
    String? status,
    String? search,
  }) async {
    try {
      debugPrint('📥 Fetching clients with pagination...');

      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final uri = Uri.parse(_baseUrl).replace(queryParameters: queryParams);
      final headers = await _getHeaders();

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true) {
          final List<dynamic> clientsJson = data['data'] ?? [];
          final clients = clientsJson
              .map((json) => ClientModel.fromJson(json))
              .toList();
          
          return {
            'clients': clients,
            'pagination': data['pagination'] ?? {},
            'summary': data['summary'] ?? {},
          };
        }
      }
      
      return {
        'clients': <ClientModel>[],
        'pagination': {},
        'summary': {},
      };
    } catch (e) {
      debugPrint('❌ Error fetching paginated clients: $e');
      return {
        'clients': <ClientModel>[],
        'pagination': {},
        'summary': {},
      };
    }
  }
}
