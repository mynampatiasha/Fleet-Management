// File: lib/features/notifications/presentation/screens/customer_notifications_screen.dart
// UPDATED: Now uses OneSignal instead of Firebase - FIREBASE-FREE

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'package:abra_fleet/core/services/one_signal_service.dart';
import 'package:abra_fleet/features/hrm_feedback/presentation/screens/hrm_customer_feedback_screen.dart';

class CustomerNotificationsScreen extends StatefulWidget {
  const CustomerNotificationsScreen({super.key});

  static const String routeName = '/customer/notifications';

  @override
  State<CustomerNotificationsScreen> createState() => _CustomerNotificationsScreenState();
}

class _CustomerNotificationsScreenState extends State<CustomerNotificationsScreen> {
  final OneSignalService _oneSignalService = OneSignalService();
  
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;
  StreamSubscription<Map<String, dynamic>>? _notificationSubscription;
  int _unreadCount = 0;

  // ✅ MODIFIED: Added new trip notification types
  static const List<String> _customerNotificationTypes = [
    // Original types
    'route_assigned',
    'roster_assigned',
    'roster_assignment_updated',
    'leave_approved',
    'leave_rejected',
    'trip_updated',
    'trip_cancelled',
    'pickup_reminder',
    'address_change_approved',
    'address_change_rejected',
    
    // ✅ NEW: Trip-specific notifications (RouteMatic-style)
    'trip_assigned',           // Trip assigned to customer
    'trip_started',            // Driver started the trip
    'eta_15min',               // Driver 15 minutes away
    'eta_5min',                // Driver 5 minutes away
    'driver_arrived',          // Driver arrived at pickup
    'trip_delayed',            // Trip is delayed
    'trip_completed',          // Trip completed successfully
    
    // ✅ NEW: Feedback reply notifications
    'feedback_reply',          // Admin replied to customer feedback
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🔔 CustomerNotificationsScreen: initState called');
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
      debugPrint('📡 Fetching customer notifications from OneSignal backend...');
      
      final response = await _oneSignalService.getNotifications(
        page: 1,
        limit: 50,
      );

      if (response['success'] == true) {
        final notifications = response['notifications'] as List<dynamic>? ?? [];
        
        // Filter for customer-relevant notifications
        _notifications = notifications
            .cast<Map<String, dynamic>>()
            .where((notification) {
              final type = notification['type']?.toString() ?? '';
              return _customerNotificationTypes.contains(type);
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

        debugPrint('✅ Loaded ${_notifications.length} customer notifications');
        debugPrint('📬 Unread count: $_unreadCount');
      } else {
        _errorMessage = response['message'] ?? 'Failed to load notifications';
        debugPrint('❌ Error from backend: $_errorMessage');
      }
    } catch (e) {
      debugPrint('❌ Error loading customer notifications: $e');
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
    debugPrint('🔔 Setting up real-time notification listener for customer');
    _notificationSubscription = _oneSignalService.onNewNotification.listen(
      (notification) {
        debugPrint('🔔 New notification received: ${notification['type']}');
        
        // Check if it's a customer notification
        final type = notification['type']?.toString() ?? '';
        if (_customerNotificationTypes.contains(type)) {
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
            const Text('My Notifications'),
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
              'You\'ll see updates about your trips,\nrosters, and leave requests here',
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

    // ✅ MODIFIED: Enhanced card with priority indicators
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

  // ✅ NEW: Get priority-based background color
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

  // ✅ NEW: Calculate time ago
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
    final metadata = notification['metadata'] as Map<String, dynamic>? ?? {};

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
          // ✅ NEW: Add action button for feedback reply notifications
          if (type == 'feedback_reply') ...[
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                _navigateToFeedbackScreen();
              },
              icon: const Icon(Icons.feedback),
              label: const Text('View Feedback'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.purple,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ✅ NEW: Navigate to feedback screen
  void _navigateToFeedbackScreen() {
    try {
      // Import the feedback screen
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => const HrmCustomerFeedbackScreen(),
        ),
      );
    } catch (e) {
      debugPrint('❌ Error navigating to feedback screen: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to open feedback screen'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ✅ MODIFIED: Enhanced icons for trip notifications
  Widget _getNotificationIcon(String type, String priority) {
    IconData iconData;
    Color color;

    switch (type) {
      // Original types
      case 'route_assigned':
      case 'roster_assigned':
        iconData = Icons.directions_car;
        color = Colors.green;
        break;
      case 'roster_assignment_updated':
        iconData = Icons.update;
        color = Colors.blue;
        break;
      case 'leave_approved':
        iconData = Icons.check_circle;
        color = Colors.green;
        break;
      case 'leave_rejected':
        iconData = Icons.cancel;
        color = Colors.red;
        break;
      case 'trip_updated':
        iconData = Icons.edit;
        color = Colors.orange;
        break;
      case 'trip_cancelled':
        iconData = Icons.cancel;
        color = Colors.red;
        break;
      case 'pickup_reminder':
        iconData = Icons.alarm;
        color = Colors.purple;
        break;
      case 'address_change_approved':
        iconData = Icons.location_on;
        color = Colors.green;
        break;
      case 'address_change_rejected':
        iconData = Icons.location_off;
        color = Colors.red;
        break;

      // ✅ NEW: Trip notification icons
      case 'trip_assigned':
        iconData = Icons.assignment_turned_in;
        color = Colors.blue;
        break;
      case 'trip_started':
        iconData = Icons.directions_car_filled;
        color = Colors.green;
        break;
      case 'eta_15min':
        iconData = Icons.schedule;
        color = Colors.orange;
        break;
      case 'eta_5min':
        iconData = Icons.notifications_active;
        color = Colors.red;
        break;
      case 'driver_arrived':
        iconData = Icons.location_on;
        color = Colors.green;
        break;
      case 'trip_delayed':
        iconData = Icons.warning;
        color = Colors.red;
        break;
      case 'trip_completed':
        iconData = Icons.check_circle;
        color = Colors.green;
        break;

      // ✅ NEW: Feedback reply notification
      case 'feedback_reply':
        iconData = Icons.reply;
        color = Colors.purple;
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