// File: lib/features/notifications/presentation/screens/client_notifications_screen.dart
// CREATED: Client notifications screen using OneSignal - FIREBASE-FREE

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'package:abra_fleet/core/services/one_signal_service.dart';

class ClientNotificationsScreen extends StatefulWidget {
  const ClientNotificationsScreen({super.key});

  static const String routeName = '/client/notifications';

  @override
  State<ClientNotificationsScreen> createState() => _ClientNotificationsScreenState();
}

class _ClientNotificationsScreenState extends State<ClientNotificationsScreen> {
  final OneSignalService _oneSignalService = OneSignalService();
  
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;
  StreamSubscription<Map<String, dynamic>>? _notificationSubscription;
  int _unreadCount = 0;

  // Client-specific notification types
  static const List<String> _clientNotificationTypes = [
    // Roster management
    'roster_assigned',
    'roster_assignment_updated',
    'roster_bulk_import_completed',
    'roster_optimization_completed',
    
    // Employee management
    'employee_bulk_import_completed',
    'employee_added',
    'employee_updated',
    
    // Trip management
    'trip_created',
    'trip_updated',
    'trip_cancelled',
    'trip_completed',
    'multiple_trips_assigned',
    
    // Billing and reports
    'invoice_generated',
    'payment_received',
    'monthly_report_ready',
    'billing_summary_ready',
    
    // System notifications
    'system_maintenance',
    'feature_update',
    'data_backup_completed',
    
    // Feedback and support
    'feedback_received',
    'support_ticket_created',
    'support_ticket_resolved',
    
    // Alerts and warnings
    'vehicle_maintenance_due',
    'driver_unavailable',
    'route_optimization_failed',
    'capacity_exceeded',
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🔔 ClientNotificationsScreen: initState called');
    _loadNotifications();
    _setupRealtimeListener();
  }

  @override
  void dispose() {
    _notificationSubscription?.cancel();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      debugPrint('📡 Fetching client notifications from OneSignal backend...');
      
      final response = await _oneSignalService.getNotifications(
        page: 1,
        limit: 50,
      );

      if (response['success'] == true) {
        final notifications = response['notifications'] as List<dynamic>? ?? [];
        
        // Filter for client-relevant notifications
        _notifications = notifications
            .cast<Map<String, dynamic>>()
            .where((notification) {
              final type = notification['type']?.toString() ?? '';
              return _clientNotificationTypes.contains(type);
            })
            .toList();

        // Sort by date (newest first)
        _notifications.sort((a, b) {
          final aDate = DateTime.parse(a['createdAt'] ?? DateTime.now().toIso8601String());
          final bDate = DateTime.parse(b['createdAt'] ?? DateTime.now().toIso8601String());
          return bDate.compareTo(aDate);
        });

        // Count unread
        _unreadCount = _notifications.where((n) => n['isRead'] != true).length;

        debugPrint('✅ Loaded ${_notifications.length} client notifications');
        debugPrint('📬 Unread count: $_unreadCount');
      } else {
        _errorMessage = response['message'] ?? 'Failed to load notifications';
        debugPrint('❌ Error from backend: $_errorMessage');
      }
    } catch (e) {
      debugPrint('❌ Error loading client notifications: $e');
      _errorMessage = 'Failed to load notifications: $e';
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _setupRealtimeListener() {
    debugPrint('🔔 Setting up real-time notification listener for client');
    _notificationSubscription = _oneSignalService.onNewNotification.listen(
      (notification) {
        debugPrint('🔔 New notification received: ${notification['type']}');
        
        // Check if it's a client notification
        final type = notification['type']?.toString() ?? '';
        if (_clientNotificationTypes.contains(type)) {
          if (mounted) {
            setState(() {
              _notifications.insert(0, notification);
              if (notification['isRead'] != true) {
                _unreadCount++;
              }
            });
          }
        }
      },
      onError: (error) {
        debugPrint('❌ Error in notification stream: $error');
      },
    );
  }

  Future<void> _markAsRead(String notificationId) async {
    try {
      final success = await _oneSignalService.markAsRead(notificationId);
      
      if (success && mounted) {
        setState(() {
          final index = _notifications.indexWhere((n) => n['_id'] == notificationId);
          if (index != -1) {
            _notifications[index]['isRead'] = true;
            _unreadCount = _notifications.where((n) => n['isRead'] != true).length;
          }
        });
      }
    } catch (e) {
      debugPrint('❌ Error marking notification as read: $e');
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      final success = await _oneSignalService.markAllAsRead();
      
      if (success && mounted) {
        setState(() {
          for (var notification in _notifications) {
            notification['isRead'] = true;
          }
          _unreadCount = 0;
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('All notifications marked as read')),
          );
        }
      }
    } catch (e) {
      debugPrint('❌ Error marking all as read: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Client Notifications'),
            if (_unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$_unreadCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            IconButton(
              icon: const Icon(Icons.done_all),
              tooltip: 'Mark all as read',
              onPressed: _markAllAsRead,
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadNotifications,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(_errorMessage!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadNotifications,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_notifications.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No notifications yet', style: TextStyle(fontSize: 18)),
            SizedBox(height: 8),
            Text(
              'You\'ll see updates about your fleet,\nrosters, billing, and reports here',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: ListView.builder(
        itemCount: _notifications.length,
        itemBuilder: (context, index) {
          final notification = _notifications[index];
          return _buildNotificationCard(notification);
        },
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification) {
    final isRead = notification['isRead'] == true;
    final title = notification['title']?.toString() ?? 'Notification';
    final body = notification['body']?.toString() ?? '';
    final type = notification['type']?.toString() ?? '';
    final createdAt = notification['createdAt']?.toString();
    final notificationId = notification['_id']?.toString() ?? '';
    final priority = notification['priority']?.toString() ?? 'normal';

    DateTime? dateTime;
    if (createdAt != null) {
      try {
        dateTime = DateTime.parse(createdAt);
      } catch (e) {
        debugPrint('Error parsing date: $e');
      }
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      color: isRead ? null : _getPriorityColor(priority),
      elevation: isRead ? 1 : 3,
      child: ListTile(
        leading: _getNotificationIcon(type, priority),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (body.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(body, maxLines: 3, overflow: TextOverflow.ellipsis),
            ],
            if (dateTime != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.access_time, size: 12, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    _getTimeAgo(dateTime),
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ],
          ],
        ),
        trailing: !isRead
            ? IconButton(
                icon: const Icon(Icons.check, color: Colors.blue),
                onPressed: () => _markAsRead(notificationId),
              )
            : null,
        onTap: () {
          _showNotificationDetails(notification);
          if (!isRead) {
            _markAsRead(notificationId);
          }
        },
      ),
    );
  }

  Color? _getPriorityColor(String priority) {
    switch (priority) {
      case 'urgent':
        return Colors.red.shade50;
      case 'high':
        return Colors.orange.shade50;
      default:
        return Colors.blue.shade50;
    }
  }

  String _getTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM dd').format(dateTime);
    }
  }

  void _showNotificationDetails(Map<String, dynamic> notification) {
    final title = notification['title']?.toString() ?? 'Notification';
    final body = notification['body']?.toString() ?? '';
    final type = notification['type']?.toString() ?? '';
    final createdAt = notification['createdAt']?.toString();
    final data = notification['data'] as Map<String, dynamic>? ?? {};

    DateTime? dateTime;
    if (createdAt != null) {
      try {
        dateTime = DateTime.parse(createdAt);
      } catch (e) {
        debugPrint('Error parsing date: $e');
      }
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            _getNotificationIcon(type, notification['priority']?.toString() ?? 'normal'),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (dateTime != null) ...[
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      DateFormat('MMM dd, yyyy • hh:mm a').format(dateTime),
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              if (body.isNotEmpty) ...[
                const Text(
                  'Message:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                Text(body, style: const TextStyle(fontSize: 14)),
                const SizedBox(height: 16),
              ],
              if (data.isNotEmpty) ...[
                const Text(
                  'Details:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                ...data.entries.map((entry) {
                  final key = entry.key.replaceAll('_', ' ').toUpperCase();
                  final value = entry.value?.toString() ?? 'N/A';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$key: ',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            value,
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _getNotificationIcon(String type, String priority) {
    IconData iconData;
    Color color;

    switch (type) {
      // Roster management
      case 'roster_assigned':
        iconData = Icons.assignment;
        color = Colors.green;
        break;
      case 'roster_assignment_updated':
        iconData = Icons.update;
        color = Colors.blue;
        break;
      case 'roster_bulk_import_completed':
        iconData = Icons.cloud_upload;
        color = Colors.green;
        break;
      case 'roster_optimization_completed':
        iconData = Icons.auto_fix_high;
        color = Colors.purple;
        break;

      // Employee management
      case 'employee_bulk_import_completed':
        iconData = Icons.people;
        color = Colors.green;
        break;
      case 'employee_added':
        iconData = Icons.person_add;
        color = Colors.blue;
        break;
      case 'employee_updated':
        iconData = Icons.person;
        color = Colors.orange;
        break;

      // Trip management
      case 'trip_created':
        iconData = Icons.add_road;
        color = Colors.green;
        break;
      case 'trip_updated':
        iconData = Icons.edit_road;
        color = Colors.orange;
        break;
      case 'trip_cancelled':
        iconData = Icons.cancel;
        color = Colors.red;
        break;
      case 'trip_completed':
        iconData = Icons.check_circle;
        color = Colors.green;
        break;
      case 'multiple_trips_assigned':
        iconData = Icons.multiple_stop;
        color = Colors.blue;
        break;

      // Billing and reports
      case 'invoice_generated':
        iconData = Icons.receipt;
        color = Colors.green;
        break;
      case 'payment_received':
        iconData = Icons.payment;
        color = Colors.green;
        break;
      case 'monthly_report_ready':
        iconData = Icons.analytics;
        color = Colors.blue;
        break;
      case 'billing_summary_ready':
        iconData = Icons.account_balance;
        color = Colors.purple;
        break;

      // System notifications
      case 'system_maintenance':
        iconData = Icons.build;
        color = Colors.orange;
        break;
      case 'feature_update':
        iconData = Icons.new_releases;
        color = Colors.blue;
        break;
      case 'data_backup_completed':
        iconData = Icons.backup;
        color = Colors.green;
        break;

      // Feedback and support
      case 'feedback_received':
        iconData = Icons.feedback;
        color = Colors.purple;
        break;
      case 'support_ticket_created':
        iconData = Icons.support_agent;
        color = Colors.orange;
        break;
      case 'support_ticket_resolved':
        iconData = Icons.check_circle;
        color = Colors.green;
        break;

      // Alerts and warnings
      case 'vehicle_maintenance_due':
        iconData = Icons.car_repair;
        color = Colors.orange;
        break;
      case 'driver_unavailable':
        iconData = Icons.person_off;
        color = Colors.red;
        break;
      case 'route_optimization_failed':
        iconData = Icons.error;
        color = Colors.red;
        break;
      case 'capacity_exceeded':
        iconData = Icons.warning;
        color = Colors.red;
        break;

      default:
        iconData = Icons.notifications;
        color = Colors.grey;
    }

    // Override color for urgent priority
    if (priority == 'urgent') {
      color = Colors.red;
    }

    return CircleAvatar(
      backgroundColor: color.withOpacity(0.1),
      child: Icon(iconData, color: color),
    );
  }
}