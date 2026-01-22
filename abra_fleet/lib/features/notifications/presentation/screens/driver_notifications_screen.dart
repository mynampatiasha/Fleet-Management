// File: lib/features/notifications/presentation/screens/driver_notifications_screen.dart
// Driver-specific notifications screen - OneSignal Implementation

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'package:abra_fleet/core/services/one_signal_service.dart';

class DriverNotificationsScreen extends StatefulWidget {
  const DriverNotificationsScreen({super.key});

  static const String routeName = '/driver/notifications';

  @override
  State<DriverNotificationsScreen> createState() => _DriverNotificationsScreenState();
}

class _DriverNotificationsScreenState extends State<DriverNotificationsScreen> {
  final OneSignalService _oneSignalService = OneSignalService();
  
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;
  StreamSubscription<Map<String, dynamic>>? _notificationSubscription;
  int _unreadCount = 0;

  // Driver-specific notification types
  static const List<String> _driverNotificationTypes = [
    'trip_assigned',
    'trip_updated',
    'route_optimized',
    'payment_received',
    'roster_assigned',
    'vehicle_assigned',
    'roster_updated',
    'roster_cancelled',
    'trip_cancelled',
    'trip_started',
    'trip_completed',
    'route_assigned',
    'shift_reminder',
    'document_expiring_soon',
    'document_expired',
    'emergency_alert',
    'feedback_reply',
    'system',
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🔔 DriverNotificationsScreen: initState called');
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
      debugPrint('📡 Fetching driver notifications from OneSignal backend...');
      
      final response = await _oneSignalService.getNotifications(
        page: 1,
        limit: 50,
      );

      if (response['success'] == true) {
        final notifications = response['notifications'] as List<dynamic>? ?? [];
        
        // Filter for driver-relevant notifications
        _notifications = notifications
            .cast<Map<String, dynamic>>()
            .where((notification) {
              final type = notification['type']?.toString() ?? '';
              return _driverNotificationTypes.contains(type);
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

        debugPrint('✅ Loaded ${_notifications.length} driver notifications');
        debugPrint('📬 Unread count: $_unreadCount');
      } else {
        _errorMessage = response['message'] ?? 'Failed to load notifications';
      }
    } catch (e) {
      debugPrint('❌ Error loading driver notifications: $e');
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
    debugPrint('🔔 Setting up real-time OneSignal notification listener for driver');
    _notificationSubscription = _oneSignalService.onNewNotification.listen(
      (notification) {
        debugPrint('🔔 New OneSignal notification received: ${notification['type']}');
        
        // Check if it's a driver notification
        final type = notification['type']?.toString() ?? '';
        if (_driverNotificationTypes.contains(type)) {
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
        debugPrint('❌ Error in OneSignal notification stream: $error');
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
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All notifications marked as read')),
        );
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
            const Text('Driver Notifications'),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.orange,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'OneSignal',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
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
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading OneSignal notifications...'),
          ],
        ),
      );
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
              'You\'ll see updates about your routes,\ntrips, and schedules here',
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
    final message = notification['message']?.toString() ?? '';
    final type = notification['type']?.toString() ?? '';
    final priority = notification['priority']?.toString() ?? 'normal';
    final createdAt = notification['createdAt']?.toString();
    final notificationId = notification['_id']?.toString() ?? '';

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
      color: isRead ? null : Colors.blue.shade50,
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
            if (message.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(message, maxLines: 3, overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getPriorityColor(priority).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    priority.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: _getPriorityColor(priority),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (dateTime != null)
                  Text(
                    DateFormat('MMM dd, yyyy • hh:mm a').format(dateTime),
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
              ],
            ),
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

  void _showNotificationDetails(Map<String, dynamic> notification) {
    final title = notification['title']?.toString() ?? 'Notification';
    final message = notification['message']?.toString() ?? '';
    final type = notification['type']?.toString() ?? '';
    final priority = notification['priority']?.toString() ?? 'normal';
    final category = notification['category']?.toString() ?? '';
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
            _getNotificationIcon(type, priority),
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
              // Metadata row
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getPriorityColor(priority).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      priority.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _getPriorityColor(priority),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (category.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        category.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                ],
              ),
              if (dateTime != null) ...[
                const SizedBox(height: 8),
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
              ],
              const SizedBox(height: 16),
              if (message.isNotEmpty) ...[
                const Text(
                  'Message:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                Text(message, style: const TextStyle(fontSize: 14)),
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
          // Add action button for feedback reply notifications
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

  // Navigate to feedback screen
  void _navigateToFeedbackScreen() {
    try {
      // Navigate to driver feedback screen
      Navigator.of(context).pushNamed('/driver/feedback');
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

  Widget _getNotificationIcon(String type, String priority) {
    final iconData = OneSignalService.getNotificationIcon(type);
    final color = Color(OneSignalService.getNotificationColor(priority));

    return CircleAvatar(
      backgroundColor: color.withOpacity(0.1),
      child: Text(
        iconData,
        style: TextStyle(fontSize: 20, color: color),
      ),
    );
  }

  Color _getPriorityColor(String priority) {
    return Color(OneSignalService.getNotificationColor(priority));
  }
}
