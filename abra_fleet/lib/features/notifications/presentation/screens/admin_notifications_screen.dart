// File: lib/features/notifications/presentation/screens/admin_notifications_screen.dart
// Admin-specific notifications screen - OneSignal Implementation with DELETE functionality

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'package:abra_fleet/core/services/one_signal_service.dart';

class AdminNotificationsScreen extends StatefulWidget {
  const AdminNotificationsScreen({super.key});

  static const String routeName = '/admin/notifications';

  @override
  State<AdminNotificationsScreen> createState() => _AdminNotificationsScreenState();
}

class _AdminNotificationsScreenState extends State<AdminNotificationsScreen> {
  final OneSignalService _oneSignalService = OneSignalService();
  
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;
  StreamSubscription<Map<String, dynamic>>? _notificationSubscription;
  int _unreadCount = 0;

  // Selection mode for bulk delete
  bool _isSelectionMode = false;
  Set<String> _selectedNotifications = {};

  // Comprehensive list of admin notification types
  static const List<String> _adminNotificationTypes = [
    'trip_cancelled', 'trip_started', 'trip_completed', 'trip_issue',
    'sos_alert', 'driver_report', 'vehicle_maintenance', 'maintenance_due',
    'roster_pending', 'roster_assigned', 'roster_updated', 'roster_cancelled',
    'leave_request', 'leave_request_pending', 'leave_approved', 'leave_rejected',
    'customer_registration', 'new_user_registered', 'address_change_request',
    'document_expired', 'document_expiring_soon',
    'system', 'test',
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🔔 AdminNotificationsScreen: initState called');
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
      debugPrint('📡 Fetching admin notifications from OneSignal backend...');
      
      final response = await _oneSignalService.getNotifications(
        page: 1,
        limit: 50,
      );

      if (response['success'] == true) {
        final notifications = response['notifications'] as List<dynamic>? ?? [];
        
        debugPrint('📦 Raw notifications received: ${notifications.length}');
        
        _notifications = notifications
            .cast<Map<String, dynamic>>()
            .where((notification) {
              final type = notification['type']?.toString() ?? '';
              return _adminNotificationTypes.contains(type);
            })
            .toList();

        _notifications.sort((a, b) {
          final aDate = DateTime.parse(a['createdAt'] ?? DateTime.now().toIso8601String());
          final bDate = DateTime.parse(b['createdAt'] ?? DateTime.now().toIso8601String());
          return bDate.compareTo(aDate);
        });

        _unreadCount = _notifications.where((n) => n['isRead'] != true).length;

        debugPrint('✅ Loaded ${_notifications.length} admin notifications');
        debugPrint('📬 Unread count: $_unreadCount');
      } else {
        _errorMessage = response['message'] ?? 'Failed to load notifications';
        debugPrint('❌ API Error: $_errorMessage');
      }
    } catch (e) {
      debugPrint('❌ Error loading admin notifications: $e');
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
    debugPrint('🔔 Setting up real-time OneSignal notification listener for admin');
    _notificationSubscription = _oneSignalService.onNewNotification.listen(
      (notification) {
        debugPrint('🔔 New OneSignal notification received: ${notification['type']}');
        
        final type = notification['type']?.toString() ?? '';
        if (_adminNotificationTypes.contains(type)) {
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

  // 🔥 NEW: Delete single notification
  Future<void> _deleteNotification(String notificationId, {bool showConfirmation = true}) async {
    if (showConfirmation) {
      final confirm = await _showDeleteConfirmationDialog(single: true);
      if (confirm != true) return;
    }

    try {
      debugPrint('🗑️ Deleting notification: $notificationId');
      
      final success = await _oneSignalService.deleteNotification(notificationId);
      
      if (success && mounted) {
        setState(() {
          _notifications.removeWhere((n) => n['_id'] == notificationId);
          _unreadCount = _notifications.where((n) => n['isRead'] != true).length;
        });
        
        if (mounted && showConfirmation) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Notification deleted'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        throw Exception('Delete operation returned false');
      }
    } catch (e) {
      debugPrint('❌ Error deleting notification: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Failed to delete: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // 🔥 NEW: Delete selected notifications (bulk)
  Future<void> _deleteSelectedNotifications() async {
    if (_selectedNotifications.isEmpty) return;

    final confirm = await _showDeleteConfirmationDialog(
      single: false,
      count: _selectedNotifications.length,
    );
    
    if (confirm != true) return;

    try {
      debugPrint('🗑️ Deleting ${_selectedNotifications.length} notifications');
      
      int successCount = 0;
      int failCount = 0;
      
      for (String notificationId in _selectedNotifications) {
        try {
          final success = await _oneSignalService.deleteNotification(notificationId);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          debugPrint('❌ Error deleting notification $notificationId: $e');
          failCount++;
        }
      }
      
      if (mounted) {
        setState(() {
          _notifications.removeWhere((n) => _selectedNotifications.contains(n['_id']));
          _unreadCount = _notifications.where((n) => n['isRead'] != true).length;
          _selectedNotifications.clear();
          _isSelectionMode = false;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Deleted $successCount notification(s)${failCount > 0 ? ', $failCount failed' : ''}'),
            backgroundColor: failCount > 0 ? Colors.orange : Colors.green,
          ),
        );
      }
    } catch (e) {
      debugPrint('❌ Error in bulk delete: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Bulk delete failed: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // 🔥 NEW: Delete all notifications
  Future<void> _deleteAllNotifications() async {
    if (_notifications.isEmpty) return;

    final confirm = await _showDeleteConfirmationDialog(
      single: false,
      count: _notifications.length,
      deleteAll: true,
    );
    
    if (confirm != true) return;

    try {
      debugPrint('🗑️ Deleting ALL ${_notifications.length} notifications');
      
      int successCount = 0;
      int failCount = 0;
      
      for (var notification in _notifications) {
        try {
          final notificationId = notification['_id']?.toString() ?? '';
          if (notificationId.isEmpty) continue;
          
          final success = await _oneSignalService.deleteNotification(notificationId);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          debugPrint('❌ Error deleting notification: $e');
          failCount++;
        }
      }
      
      if (mounted) {
        setState(() {
          _notifications.clear();
          _unreadCount = 0;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Deleted $successCount notification(s)${failCount > 0 ? ', $failCount failed' : ''}'),
            backgroundColor: failCount > 0 ? Colors.orange : Colors.green,
          ),
        );
      }
    } catch (e) {
      debugPrint('❌ Error deleting all notifications: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Failed to delete all: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // 🔥 NEW: Confirmation dialog
  Future<bool?> _showDeleteConfirmationDialog({
    required bool single,
    int count = 1,
    bool deleteAll = false,
  }) async {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.delete_forever, color: Colors.red[700]),
            const SizedBox(width: 8),
            const Text('Delete Notification(s)?'),
          ],
        ),
        content: Text(
          deleteAll
              ? 'Are you sure you want to delete ALL $count notifications? This action cannot be undone.'
              : single
                  ? 'Are you sure you want to delete this notification?'
                  : 'Are you sure you want to delete $count selected notifications?',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  // 🔥 NEW: Toggle selection mode
  void _toggleSelectionMode() {
    setState(() {
      _isSelectionMode = !_isSelectionMode;
      if (!_isSelectionMode) {
        _selectedNotifications.clear();
      }
    });
  }

  // 🔥 NEW: Toggle notification selection
  void _toggleNotificationSelection(String notificationId) {
    setState(() {
      if (_selectedNotifications.contains(notificationId)) {
        _selectedNotifications.remove(notificationId);
      } else {
        _selectedNotifications.add(notificationId);
      }
    });
  }

  // 🔥 NEW: Select all notifications
  void _selectAllNotifications() {
    setState(() {
      if (_selectedNotifications.length == _notifications.length) {
        _selectedNotifications.clear();
      } else {
        _selectedNotifications = _notifications
            .map((n) => n['_id']?.toString() ?? '')
            .where((id) => id.isNotEmpty)
            .toSet();
      }
    });
  }

  Future<void> _sendTestNotification() async {
    try {
      final result = await _oneSignalService.sendNotification(
        targetRole: 'admin',
        title: '🧪 Test Admin Notification',
        message: 'This is a test notification for admin users sent via OneSignal',
        type: 'system',
        category: 'test',
        priority: 'normal',
        data: {
          'testId': DateTime.now().millisecondsSinceEpoch.toString(),
          'source': 'admin_panel',
        },
      );

      if (mounted) {
        if (result['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Test notification sent successfully!'),
              backgroundColor: Colors.green,
            ),
          );
          
          Future.delayed(const Duration(seconds: 2), () {
            _loadNotifications();
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('❌ Failed to send test notification: ${result['message']}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('❌ Error sending test notification: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _isSelectionMode
            ? Text('${_selectedNotifications.length} selected')
            : Row(
                children: [
                  const Text('Admin Notifications'),
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
        leading: _isSelectionMode
            ? IconButton(
                icon: const Icon(Icons.close),
                onPressed: _toggleSelectionMode,
              )
            : null,
        actions: _isSelectionMode
            ? [
                IconButton(
                  icon: Icon(
                    _selectedNotifications.length == _notifications.length
                        ? Icons.check_box
                        : Icons.check_box_outline_blank,
                  ),
                  tooltip: 'Select all',
                  onPressed: _selectAllNotifications,
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  tooltip: 'Delete selected',
                  onPressed: _selectedNotifications.isEmpty
                      ? null
                      : _deleteSelectedNotifications,
                ),
              ]
            : [
                IconButton(
                  icon: const Icon(Icons.science),
                  tooltip: 'Send test notification',
                  onPressed: _sendTestNotification,
                ),
                if (_unreadCount > 0)
                  IconButton(
                    icon: const Icon(Icons.done_all),
                    tooltip: 'Mark all as read',
                    onPressed: _markAllAsRead,
                  ),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    switch (value) {
                      case 'select':
                        _toggleSelectionMode();
                        break;
                      case 'delete_all':
                        _deleteAllNotifications();
                        break;
                      case 'refresh':
                        _loadNotifications();
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'select',
                      child: Row(
                        children: [
                          Icon(Icons.checklist, size: 20),
                          SizedBox(width: 8),
                          Text('Select mode'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'refresh',
                      child: Row(
                        children: [
                          Icon(Icons.refresh, size: 20),
                          SizedBox(width: 8),
                          Text('Refresh'),
                        ],
                      ),
                    ),
                    if (_notifications.isNotEmpty)
                      const PopupMenuItem(
                        value: 'delete_all',
                        child: Row(
                          children: [
                            Icon(Icons.delete_sweep, size: 20, color: Colors.red),
                            SizedBox(width: 8),
                            Text('Delete all', style: TextStyle(color: Colors.red)),
                          ],
                        ),
                      ),
                  ],
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              ),
            ),
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
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.notifications_none, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('No admin notifications', style: TextStyle(fontSize: 18)),
            const SizedBox(height: 8),
            const Text(
              'Notifications will appear here once they are sent',
              style: TextStyle(fontSize: 14, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _sendTestNotification,
              icon: const Icon(Icons.science),
              label: const Text('Send Test Notification'),
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
    final isSelected = _selectedNotifications.contains(notificationId);

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
      color: isSelected 
          ? Colors.blue.shade100 
          : (isRead ? null : Colors.blue.shade50),
      elevation: isRead ? 1 : 3,
      child: ListTile(
        leading: _isSelectionMode
            ? Checkbox(
                value: isSelected,
                onChanged: (_) => _toggleNotificationSelection(notificationId),
              )
            : _getNotificationIcon(type, priority),
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
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    type.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (dateTime != null)
                  Expanded(
                    child: Text(
                      DateFormat('MMM dd, yyyy • hh:mm a').format(dateTime),
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
          ],
        ),
        trailing: _isSelectionMode
            ? null
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!isRead)
                    IconButton(
                      icon: const Icon(Icons.check, color: Colors.blue),
                      onPressed: () => _markAsRead(notificationId),
                      tooltip: 'Mark as read',
                    ),
                  IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _deleteNotification(notificationId),
                    tooltip: 'Delete',
                  ),
                ],
              ),
        onTap: () {
          if (_isSelectionMode) {
            _toggleNotificationSelection(notificationId);
          } else {
            _showNotificationDetails(notification);
            if (!isRead) {
              _markAsRead(notificationId);
            }
          }
        },
        onLongPress: () {
          if (!_isSelectionMode) {
            setState(() {
              _isSelectionMode = true;
              _selectedNotifications.add(notificationId);
            });
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
    final notificationId = notification['_id']?.toString() ?? '';

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
              Wrap(
                spacing: 8,
                runSpacing: 8,
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
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      type.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
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
          TextButton.icon(
            onPressed: () {
              Navigator.of(context).pop();
              _deleteNotification(notificationId);
            },
            icon: const Icon(Icons.delete, color: Colors.red),
            label: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
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