// lib/core/services/permission_service.dart
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:abra_fleet/core/services/api_service.dart';

class PermissionService {
  static final PermissionService _instance = PermissionService._internal();
  factory PermissionService() => _instance;
  PermissionService._internal();

  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _cachedPermissions;
  String? _cachedUserId;
  DateTime? _lastFetch;
  
  // Cache duration: 5 minutes
  static const Duration _cacheDuration = Duration(minutes: 5);

  /// Get user permissions from backend
  Future<Map<String, dynamic>> getUserPermissions({bool forceRefresh = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString('user_data');
    
    if (userDataString == null) {
      debugPrint('❌ No user logged in');
      return {};
    }
    
    final userData = jsonDecode(userDataString);
    final userId = userData['id'];

    // Return cached permissions if valid
    if (!forceRefresh &&
        _cachedPermissions != null &&
        _cachedUserId == userId &&
        _lastFetch != null &&
        DateTime.now().difference(_lastFetch!) < _cacheDuration) {
      debugPrint('✅ Using cached permissions');
      return _cachedPermissions!;
    }

    try {
      debugPrint('📡 Fetching user permissions from backend...');
      
      final response = await _apiService.getProfile();
      
      if (response['success'] == true && response['user'] != null) {
        final userData = response['user'];
        final permissions = userData['permissions'] as Map<String, dynamic>? ?? {};
        
        // Cache the permissions
        _cachedPermissions = permissions;
        _cachedUserId = userId;
        _lastFetch = DateTime.now();
        
        debugPrint('✅ User permissions loaded:');
        permissions.forEach((key, value) {
          if (value is Map && value['can_access'] == true) {
            debugPrint('   - $key: ✓');
          }
        });
        
        return permissions;
      }
      
      debugPrint('⚠️ No permissions found in user profile');
      return {};
      
    } catch (e) {
      debugPrint('❌ Error fetching permissions: $e');
      return _cachedPermissions ?? {};
    }
  }

  /// Check if user has access to a specific permission
  Future<bool> hasAccess(String permissionKey) async {
    final permissions = await getUserPermissions();
    
    if (permissions.isEmpty) {
      debugPrint('⚠️ No permissions available for user');
      return false;
    }

    final permission = permissions[permissionKey];
    if (permission is Map) {
      final canAccess = permission['can_access'] == true;
      debugPrint('🔐 Permission check: $permissionKey = $canAccess');
      return canAccess;
    }
    
    debugPrint('⚠️ Permission not found: $permissionKey');
    return false;
  }

  /// Check if user can edit/delete in a specific permission
  Future<bool> canEditDelete(String permissionKey) async {
    final permissions = await getUserPermissions();
    
    final permission = permissions[permissionKey];
    if (permission is Map) {
      return permission['edit_delete'] == true;
    }
    
    return false;
  }

  /// Check if user is admin or super_admin
  Future<bool> isAdmin() async {
    try {
      final response = await _apiService.getProfile();
      if (response['success'] == true && response['user'] != null) {
        final role = response['user']['role']?.toString().toLowerCase();
        return role == 'admin' || role == 'super_admin';
      }
    } catch (e) {
      debugPrint('❌ Error checking admin status: $e');
    }
    return false;
  }

  /// Clear cached permissions (call on logout)
  void clearCache() {
    _cachedPermissions = null;
    _cachedUserId = null;
    _lastFetch = null;
    debugPrint('🗑️ Permission cache cleared');
  }

  /// Get readable permission name
  String getPermissionName(String key) {
    final names = {
      'dashboard': 'Dashboard',
      'fleet_drivers': 'Drivers',
      'fleet_vehicles': 'Vehicles',
      'fleet_trips': 'Trips',
      'fleet_maintenance': 'Maintenance',
      'fleet_management': 'Fleet Management',
      'customer_fleet': 'Customer Management',
      'fleet_gps_tracking': 'GPS Tracking',
      'hrm_feedback': 'HRM & Feedback',
      'abra_global_trading': 'Global Trading',
    };
    return names[key] ?? key;
  }
}