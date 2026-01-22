// lib/core/services/one_signal_service.dart
// ============================================================================
// COMPLETE ONESIGNAL NOTIFICATION SERVICE - FIREBASE-FREE
// ============================================================================
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:abra_fleet/app/config/api_config.dart';
import 'package:abra_fleet/core/services/floating_notification_service.dart';

class OneSignalService with WidgetsBindingObserver {
  static OneSignalService? _instance;
  
  final FloatingNotificationService _floatingNotificationService = 
      FloatingNotificationService();
  
  static GlobalKey<NavigatorState>? navigatorKey;
  
  final StreamController<Map<String, dynamic>> _newNotificationController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onNewNotification =>
      _newNotificationController.stream;

  // User preferences for notification sounds
  static const String _customSoundEnabledKey = 'notification_custom_sound_enabled';
  bool _customSoundEnabled = true;
  
  // Track processed notifications to prevent duplicates
  final Set<String> _processedNotificationIds = {};
  static const int _maxProcessedIds = 100;

  // Current user info
  String? _currentUserId;
  String? _currentUserRole;
  String? _currentAuthToken;

  OneSignalService._internal();

  factory OneSignalService() {
    _instance ??= OneSignalService._internal();
    return _instance!;
  }

  static OneSignalService get instance {
    _instance ??= OneSignalService._internal();
    return _instance!;
  }

  static void setNavigatorKey(GlobalKey<NavigatorState> key) {
    navigatorKey = key;
    debugPrint('✅ Navigator key set in OneSignalService');
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /// Auto-initialize from SharedPreferences if not already initialized
  Future<void> _autoInitializeFromStorage() async {
    try {
      debugPrint('🔄 Auto-initializing OneSignal from storage...');
      
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final userId = prefs.getString('user_id');
      final userRole = prefs.getString('user_role');
      
      if (token != null && userId != null && userRole != null) {
        debugPrint('✅ Found user credentials in storage: $userId');
        
        // Store credentials
        _currentUserId = userId;
        _currentUserRole = userRole;
        _currentAuthToken = token;
        
        // Call main initialize to setup tags and login
        await initialize(
          userId: userId, 
          userRole: userRole, 
          authToken: token
        );
        
        debugPrint('✅ OneSignal auto-initialized successfully');
      } else {
        debugPrint('❌ No user credentials found in storage');
      }
    } catch (e) {
      debugPrint('❌ Error auto-initializing OneSignal: $e');
    }
  }

  /// Initialize OneSignal service
  Future<void> initialize({
    required String userId,
    required String userRole,
    required String authToken,
  }) async {
    try {
      debugPrint('🔔 ========================================');
      debugPrint('🔔 INITIALIZING ONESIGNAL SERVICE');
      debugPrint('🔔 ========================================');
      debugPrint('   User ID: $userId');
      debugPrint('   User Role: $userRole');
      
      // Store user info
      _currentUserId = userId;
      _currentUserRole = userRole;
      _currentAuthToken = authToken;
      
      // Add lifecycle observer
      WidgetsBinding.instance.addObserver(this);
      
      await _loadUserPreferences();
      
      // 1. Initialize SDK
      OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
      OneSignal.initialize("6a1ab1b8-286b-4d08-82ef-6e35f9c08363");

      // 2. 🔥 LOGIN & TAGS (Critical for Backend Targeting)
      // This allows the backend to find this user by 'userId' tag
      if (_currentUserId != null) {
        OneSignal.login(_currentUserId!);
        OneSignal.User.addTags({
          "userId": _currentUserId,
          "userRole": _currentUserRole
        });
        debugPrint('✅ OneSignal User Logged In & Tagged: $_currentUserId');
      }
      
      // 3. Request permissions
      await OneSignal.Notifications.requestPermission(true);
      
      // 4. Set up handlers
      _setupNotificationHandlers();
      
      // 5. Register with backend (Legacy/Backup)
      await _registerDeviceWithBackend();
      
      debugPrint('✅ OneSignal SDK initialized complete');
    } catch (e) {
      debugPrint('❌ Error initializing OneSignal SDK: $e');
    }
  }

  /// Setup OneSignal notification handlers
  void _setupNotificationHandlers() {
    debugPrint('🔧 Setting up OneSignal notification handlers...');
    
    // Handle notification received while app is in foreground
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      debugPrint('📬 ========================================');
      debugPrint('📬 FOREGROUND NOTIFICATION RECEIVED');
      debugPrint('📬 ========================================');
      
      final notification = event.notification;
      debugPrint('   Title: ${notification.title}');
      
      // Generate unique ID for duplicate prevention
      final notificationId = notification.notificationId ?? 
                            '${notification.title}_${notification.body}_${DateTime.now().millisecondsSinceEpoch ~/ 5000}';
      
      // Check if already processed
      if (_processedNotificationIds.contains(notificationId)) {
        debugPrint('⏭️  SKIPPING: Duplicate notification');
        event.preventDefault(); 
        return;
      }
      
      // Mark as processed
      _processedNotificationIds.add(notificationId);
      _cleanupProcessedIds();
      
      // Get context for floating notification
      final context = navigatorKey?.currentContext;
      
      // 🔥 FIX: Only suppress system notification if we have a context to show Floating UI
      if (context != null && context.mounted) {
        debugPrint('✅ Context valid: Hiding system notification to show Floating UI');
        
        // Prevent OneSignal from showing the system tray notification
        event.preventDefault();
        
        // Show custom floating notification
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (context.mounted) {
            _showFloatingNotification(
              context: context,
              title: notification.title ?? 'Notification',
              body: notification.body ?? '',
              type: notification.additionalData?['type'] ?? 'system',
              priority: notification.additionalData?['priority'] ?? 'normal',
              data: notification.additionalData,
            );
          }
        });
        
        // Play sound if enabled
        final notificationType = notification.additionalData?['type'] ?? 'system';
        if (_shouldPlayCustomSound(notificationType)) {
          _playCustomNotificationSound();
        }

      } else {
        debugPrint('⚠️ No UI Context available. Allowing System Notification to display.');
        // Do NOT call event.preventDefault() here.
      }
      
      // Emit to stream (updates badges/lists)
      _newNotificationController.add({
        'id': notificationId,
        'title': notification.title ?? 'Notification',
        'body': notification.body ?? '',
        'data': notification.additionalData ?? {},
        'type': notification.additionalData?['type'] ?? 'system',
        'priority': notification.additionalData?['priority'] ?? 'normal',
        'createdAt': DateTime.now().toIso8601String(),
      });
    });
    
    // Handle notification clicked/opened
    OneSignal.Notifications.addClickListener((event) {
      debugPrint('👆 ========================================');
      debugPrint('👆 NOTIFICATION CLICKED');
      
      final notification = event.notification;
      _handleNotificationTap(notification.additionalData);
    });
    
    // Handle permission changes
    OneSignal.Notifications.addPermissionObserver((state) {
      debugPrint('🔔 Notification permission changed: $state');
    });
    
    // Handle subscription changes
    OneSignal.User.pushSubscription.addObserver((state) {
      debugPrint('📱 Push subscription changed ID: ${state.current.id}');
      // Re-register device when subscription changes
      if (state.current.optedIn && state.current.id != null) {
        _registerDeviceWithBackend();
      }
    });
  }

  /// Register device with backend
  Future<void> _registerDeviceWithBackend() async {
    try {
      // Small delay to ensure OneSignal has initialized
      await Future.delayed(const Duration(seconds: 2));
      final subscriptionId = OneSignal.User.pushSubscription.id;
      
      if (subscriptionId == null) {
        debugPrint('⚠️ No OneSignal subscription ID available');
        return;
      }
      
      debugPrint('📱 Registering device with backend...');
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/register-device');
      
      final response = await http.post(
        uri,
        headers: await _getHeaders(),
        body: json.encode({
          'playerId': subscriptionId,
          'deviceType': Platform.isAndroid ? 'android' : Platform.isIOS ? 'ios' : 'web',
          'tags': {
            'userId': _currentUserId,
            'userRole': _currentUserRole,
          }
        }),
      );
      
      if (response.statusCode == 200) {
        debugPrint('✅ Device registered with backend successfully');
      }
    } catch (e) {
      debugPrint('❌ Error registering device with backend: $e');
    }
  }

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  /// Load user notification preferences
  Future<void> _loadUserPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _customSoundEnabled = prefs.getBool(_customSoundEnabledKey) ?? true;
    } catch (e) {
      _customSoundEnabled = true;
    }
  }

  /// Enable or disable custom notification sounds
  Future<void> setCustomSoundEnabled(bool enabled) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_customSoundEnabledKey, enabled);
      _customSoundEnabled = enabled;
    } catch (e) {
      debugPrint('❌ Error saving notification preference: $e');
    }
  }

  /// Get current custom sound preference
  bool get isCustomSoundEnabled => _customSoundEnabled;

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      debugPrint('✅ App resumed, OneSignal active');
    }
  }

  // ============================================================================
  // NOTIFICATION DISPLAY
  // ============================================================================

  /// Show floating notification
  void _showFloatingNotification({
    required BuildContext context,
    required String title,
    required String body,
    required String type,
    required String priority,
    Map<String, dynamic>? data,
  }) {
    debugPrint('🎨 Showing Floating Notification: $title');
    
    try {
      _floatingNotificationService.showFloatingNotification(
        context: context,
        title: title,
        body: body,
        icon: getNotificationIcon(type),
        type: type,
        priority: priority,
        backgroundColor: Color(getNotificationColor(priority)),
        duration: const Duration(seconds: 5),
        onTap: () {
          debugPrint('👆 Floating notification tapped');
          _handleNotificationTap(data);
        },
        onDismiss: () {
          debugPrint('❌ Floating notification dismissed');
        },
      );
    } catch (e) {
      debugPrint('❌ Error showing floating notification: $e');
    }
  }

  /// Handle notification tap
  void _handleNotificationTap(Map<String, dynamic>? data) {
    if (data == null) return;
    debugPrint('👆 Handling notification tap with data: $data');
    
    // Add custom navigation logic here
    final type = data['type'] as String?;
    // Example: Navigator.pushNamed(...)
  }

  // ============================================================================
  // SOUND MANAGEMENT
  // ============================================================================

  /// Check if custom sound should be played for this notification type
  bool _shouldPlayCustomSound(String type) {
    if (!_customSoundEnabled) return false;
    return true; 
  }

  /// Play custom notification sound
  Future<void> _playCustomNotificationSound() async {
    try {
      final AudioPlayer audioPlayer = AudioPlayer();
      await audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      debugPrint('❌ Error playing custom notification sound: $e');
    }
  }

  // ============================================================================
  // API METHODS
  // ============================================================================

  /// Get authentication headers
  Future<Map<String, String>> _getHeaders() async {
    return {
      'Content-Type': 'application/json',
      if (_currentAuthToken != null) 'Authorization': 'Bearer $_currentAuthToken',
    };
  }

  /// Get notifications from backend
  Future<Map<String, dynamic>> getNotifications({
    int page = 1,
    int limit = 50,
    bool? isRead,
    String? type,
    String? category,
  }) async {
    try {
      // Auto-initialize if not already initialized
      if (_currentUserId == null || _currentAuthToken == null) {
        await _autoInitializeFromStorage();
      }
      
      if (_currentUserId == null) {
        return {'success': false, 'message': 'User not logged in'};
      }

      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (isRead != null) 'isRead': isRead.toString(),
        if (type != null) 'type': type,
        if (category != null) 'category': category,
      };

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/notifications')
          .replace(queryParameters: queryParams);
      
      final response = await http.get(uri, headers: await _getHeaders());

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'notifications': data['data']['notifications'] ?? [],
          'pagination': data['data']['pagination'] ?? {},
        };
      } else {
        return {'success': false, 'message': 'Failed to fetch notifications'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Get unread notification count
  Future<int> getUnreadCount() async {
    try {
      if (_currentUserId == null) await _autoInitializeFromStorage();
      if (_currentUserId == null) return 0;
      
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/stats');
      final response = await http.get(uri, headers: await _getHeaders());

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data']['unread'] ?? 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  /// Mark notification as read
  Future<bool> markAsRead(String notificationId) async {
    try {
      if (_currentUserId == null) await _autoInitializeFromStorage();
      
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/mark-read/$notificationId');
      final response = await http.put(uri, headers: await _getHeaders());
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Mark all notifications as read
  Future<bool> markAllAsRead() async {
    try {
      if (_currentUserId == null) await _autoInitializeFromStorage();
      
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/mark-all-read');
      final response = await http.put(uri, headers: await _getHeaders());
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Get notification statistics
  Future<Map<String, dynamic>> getStats() async {
    try {
      if (_currentUserId == null) await _autoInitializeFromStorage();
      if (_currentUserId == null) {
        return {'success': false, 'message': 'User not logged in'};
      }
      
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/stats');
      final response = await http.get(uri, headers: await _getHeaders());

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'data': data['data'] ?? {},
        };
      } else {
        return {'success': false, 'message': 'Failed to fetch stats'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Delete a notification
  Future<bool> deleteNotification(String notificationId) async {
    try {
      if (_currentUserId == null) await _autoInitializeFromStorage();
      
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/notifications/$notificationId');
      final response = await http.delete(uri, headers: await _getHeaders());
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('❌ Error deleting notification: $e');
      return false;
    }
  }

  /// Send a notification (admin only)
  Future<Map<String, dynamic>> sendNotification({
    required String title,
    required String message,
    String? targetRole,
    List<String>? targetUserIds,
    String? type,
    String? category,
    String? priority,
    Map<String, dynamic>? data,
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      if (_currentUserId == null) await _autoInitializeFromStorage();
      if (_currentUserId == null) {
        return {'success': false, 'message': 'User not logged in'};
      }
      
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/send');
      final Map<String, dynamic> requestBody = {
        'title': title,
        'message': message,
        'type': type ?? 'system',
        'priority': priority ?? 'normal',
      };

      // Add target role or user IDs
      if (targetRole != null) {
        requestBody['targetRole'] = targetRole;
      }
      if (targetUserIds != null && targetUserIds.isNotEmpty) {
        requestBody['targetUsers'] = targetUserIds;
      }
      
      // Add optional fields
      if (category != null) {
        requestBody['category'] = category;
      }
      if (data != null) {
        requestBody['data'] = data;
      }
      if (additionalData != null) {
        requestBody['additionalData'] = additionalData;
      }

      final response = await http.post(
        uri,
        headers: await _getHeaders(),
        body: json.encode(requestBody),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return {
          'success': true,
          'data': responseData['data'] ?? {},
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to send notification'
        };
      }
    } catch (e) {
      debugPrint('❌ Error sending notification: $e');
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Send templated notification
  Future<Map<String, dynamic>> sendTemplatedNotification({
    List<String>? targetUsers,
    required String targetRole,
    required String templateKey,
    Map<String, dynamic>? templateData,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/onesignal/send-template');
      final response = await http.post(
        uri,
        headers: await _getHeaders(),
        body: json.encode({
          'targetUsers': targetUsers,
          'targetRole': targetRole,
          'templateKey': templateKey,
          'templateData': templateData,
        }),
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        debugPrint('✅ Templated notification sent successfully');
        return result;
      } else {
        final error = json.decode(response.body);
        debugPrint('❌ Failed to send templated notification: ${error['message']}');
        return {
          'success': false,
          'message': error['message'] ?? 'Failed to send templated notification',
        };
      }
    } catch (e) {
      debugPrint('❌ Error sending templated notification: $e');
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Cleanup processed notification IDs
  void _cleanupProcessedIds() {
    if (_processedNotificationIds.length > _maxProcessedIds) {
      final idsToRemove = _processedNotificationIds.take(_processedNotificationIds.length - _maxProcessedIds).toList();
      _processedNotificationIds.removeAll(idsToRemove);
    }
  }

  /// Get notification icon based on type
  static String getNotificationIcon(String type) {
    switch (type) {
      case 'roster_assigned': return '🚗';
      case 'vehicle_assigned': return '🚗';
      case 'roster_updated': return '🔄';
      case 'roster_cancelled': return '❌';
      case 'leave_request': return '🏖️';
      case 'leave_approved': return '✅';
      case 'trip_cancelled': return '🚫';
      case 'trip_started': return '🚀';
      case 'trip_completed': return '🏁';
      case 'sos_alert': return '🚨';
      case 'system': return '🔔';
      default: return '📬';
    }
  }

  /// Get notification color based on priority
  static int getNotificationColor(String priority) {
    switch (priority) {
      case 'urgent': return 0xFFFF1744;
      case 'high': return 0xFFFF5252;
      case 'normal': return 0xFF2196F3;
      default: return 0xFF2196F3;
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /// Update user info (call when user changes or logs in)
  void updateUserInfo({
    required String userId,
    required String userRole,
    required String authToken,
  }) {
    _currentUserId = userId;
    _currentUserRole = userRole;
    _currentAuthToken = authToken;
    
    // Perform login again to ensure tags are correct
    OneSignal.login(userId);
    OneSignal.User.addTags({
        "userId": userId,
        "userRole": userRole
    });
    
    _registerDeviceWithBackend();
  }

  /// Dispose service
  void dispose() {
    _newNotificationController.close();
    _floatingNotificationService.dispose();
    WidgetsBinding.instance.removeObserver(this);
    _currentUserId = null;
    _currentUserRole = null;
    _currentAuthToken = null;
    debugPrint('🛑 OneSignalService disposed');
  }
}