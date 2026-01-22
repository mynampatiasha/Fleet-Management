  // ========== ONESIGNAL + WEBSOCKET METHODS ==========
  
  /// Initialize OneSignal and WebSocket services
  Future<void> _initializeRealTimeServices() async {
    try {
      final authRepo = Provider.of<AuthRepository>(context, listen: false);
      final user = authRepo.currentUser;
      final token = await authRepo.getAuthToken();
      
      if (token == null || user.id.isEmpty) {
        debugPrint('⚠️ No auth token or user ID, skipping real-time services');
        return;
      }
      
      debugPrint('🔄 Initializing real-time services for admin...');
      
      // 1. Initialize OneSignal for push notifications
      await OneSignalService.instance.initialize(
        userId: user.id,
        userRole: user.role ?? 'admin',
        authToken: token,
      );
      
      // 2. Setup OneSignal notification listener
      _setupOneSignalListener();
      
      // 3. Initialize WebSocket for real-time updates
      _webSocketService = WebSocketService();
      await _webSocketService!.connect('admin-room', authToken: token);
      
      // 4. Setup WebSocket listeners
      _setupWebSocketListeners();
      
      debugPrint('✅ Real-time services initialized successfully');
    } catch (e) {
      debugPrint('❌ Error initializing real-time services: $e');
    }
  }
  
  /// Setup OneSignal notification listener
  void _setupOneSignalListener() {
    _oneSignalSubscription = OneSignalService.instance.onNewNotification.listen((notification) {
      debugPrint('📬 New notification received: ${notification['title']}');
      
      final type = notification['type'] as String?;
      
      // Handle different notification types
      switch (type) {
        case 'roster_assigned':
          _handleRosterAssignedNotification(notification);
          break;
        case 'new_roster':
          _handleNewRosterNotification(notification);
          break;
        case 'sos_alert':
          _handleSOSAlertNotification(notification);
          break;
        case 'trip_started':
        case 'trip_completed':
          _handleTripNotification(notification);
          break;
        default:
          _showGenericNotification(notification);
      }
    });
  }
  
  /// Setup WebSocket listeners
  void _setupWebSocketListeners() {
    if (_webSocketService == null) return;
    
    _webSocketSubscription = _webSocketService!.messageStream.listen((message) {
      debugPrint('📡 WebSocket message received: ${message.type}');
      
      switch (message.type) {
        case 'new_roster':
          _handleNewRosterWebSocket(message.data);
          break;
        case 'roster_assigned':
          _handleRosterAssignedWebSocket(message.data);
          break;
        case 'roster_unassigned':
          _handleRosterUnassignedWebSocket(message.data);
          break;
        case 'pending_count_update':
          _handlePendingCountUpdate(message.data);
          break;
        case 'vehicle_location_updated':
          _handleVehicleLocationUpdate(message.data);
          break;
        case 'vehicle_status_changed':
          _handleVehicleStatusChanged(message.data);
          break;
        case 'trip_started':
        case 'trip_completed':
          _handleTripStatusUpdate(message.data);
          break;
        case 'passenger_status_changed':
          _handlePassengerStatusChanged(message.data);
          break;
        case 'assignment_conflict':
          _handleAssignmentConflict(message.data);
          break;
        default:
          debugPrint('⚠️ Unknown WebSocket message type: ${message.type}');
      }
    }, onError: (error) {
      debugPrint('❌ WebSocket error: $error');
    });
  }
  
  // ========== ONESIGNAL NOTIFICATION HANDLERS ==========
  
  void _handleRosterAssignedNotification(Map<String, dynamic> notification) {
    debugPrint('✅ Roster assigned notification received');
    if (mounted) {
      setState(() {
        // Trigger UI update for roster lists
      });
    }
  }
  
  void _handleNewRosterNotification(Map<String, dynamic> notification) {
    debugPrint('📬 New roster notification received');
    _playNotificationSound();
    if (mounted) {
      setState(() {
        // Trigger UI update for pending rosters
      });
    }
  }
  
  void _handleSOSAlertNotification(Map<String, dynamic> notification) {
    debugPrint('🚨 SOS alert notification received');
    _playNotificationSound();
    if (mounted) {
      // Show urgent SOS alert - could navigate to SOS screen
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🚨 New SOS Alert: ${notification['title']}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 10),
          action: SnackBarAction(
            label: 'VIEW',
            textColor: Colors.white,
            onPressed: () {
              // Navigate to SOS alerts
              setState(() {
                _selectedIndex = 2; // Assuming SOS is at index 2
              });
            },
          ),
        ),
      );
    }
  }
  
  void _handleTripNotification(Map<String, dynamic> notification) {
    debugPrint('🚗 Trip notification received: ${notification['type']}');
    if (mounted) {
      setState(() {
        // Update trip-related UI
      });
    }
  }
  
  void _showGenericNotification(Map<String, dynamic> notification) {
    debugPrint('📬 Generic notification: ${notification['title']}');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(notification['title'] ?? 'New Notification'),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }
  
  // ========== WEBSOCKET EVENT HANDLERS ==========
  
  void _handleNewRosterWebSocket(Map<String, dynamic> data) {
    debugPrint('📬 New roster created: ${data['rosterId']}');
    _playNotificationSound();
    if (mounted) {
      setState(() {
        // Refresh pending rosters list
      });
    }
  }
  
  void _handleRosterAssignedWebSocket(Map<String, dynamic> data) {
    debugPrint('✅ Roster assigned: ${data['rosterId']} → ${data['vehicleReg']}');
    if (mounted) {
      setState(() {
        // Update roster assignment UI
      });
    }
  }
  
  void _handleRosterUnassignedWebSocket(Map<String, dynamic> data) {
    debugPrint('❌ Roster unassigned: ${data['rosterId']}');
    if (mounted) {
      setState(() {
        // Update roster UI
      });
    }
  }
  
  void _handlePendingCountUpdate(Map<String, dynamic> data) {
    final count = data['count'] as int? ?? 0;
    debugPrint('🔢 Pending rosters count: $count');
    if (mounted) {
      setState(() {
        _pendingRostersCount = count;
      });
    }
  }
  
  void _handleVehicleLocationUpdate(Map<String, dynamic> data) {
    final vehicleId = data['vehicleId'] as String?;
    if (vehicleId != null) {
      debugPrint('📍 Vehicle location updated: $vehicleId');
      if (mounted) {
        setState(() {
          _realTimeVehicleLocations[vehicleId] = {
            'lat': data['lat'],
            'lon': data['lon'],
            'speed': data['speed'],
            'heading': data['heading'],
            'timestamp': data['timestamp'],
          };
        });
      }
    }
  }
  
  void _handleVehicleStatusChanged(Map<String, dynamic> data) {
    debugPrint('🚗 Vehicle status changed: ${data['vehicleId']} → ${data['status']}');
    if (mounted) {
      setState(() {
        // Update vehicle status in UI
      });
    }
  }
  
  void _handleTripStatusUpdate(Map<String, dynamic> data) {
    debugPrint('🚀 Trip status update: ${data['tripId']}');
    if (mounted) {
      setState(() {
        // Update trip status in UI
      });
    }
  }
  
  void _handlePassengerStatusChanged(Map<String, dynamic> data) {
    debugPrint('👤 Passenger status changed: ${data['passengerId']} → ${data['status']}');
    // Could show a toast or update passenger list
  }
  
  void _handleAssignmentConflict(Map<String, dynamic> data) {
    debugPrint('⚠️ Assignment conflict: ${data['message']}');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(data['message'] ?? 'Assignment conflict detected'),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }
  
  // ========== HELPER METHODS ==========
  
  Future<void> _playNotificationSound() async {
    try {
      final AudioPlayer audioPlayer = AudioPlayer();
      await audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      debugPrint('❌ Error playing notification sound: $e');
    }
  }
  
  /// Request live pending count from WebSocket
  void _requestPendingCount() {
    _webSocketService?.sendMessage('get_pending_count', {});
  }
  
  /// Request live available vehicles count from WebSocket  
  void _requestAvailableVehiclesCount() {
    _webSocketService?.sendMessage('get_available_vehicles_count', {});
  }
  
  /// Subscribe to specific roster updates
  void _subscribeToRoster(String rosterId) {
    _webSocketService?.sendMessage('subscribe_roster', {'rosterId': rosterId});
  }
  
  /// Unsubscribe from roster updates
  void _unsubscribeFromRoster(String rosterId) {
    _webSocketService?.sendMessage('unsubscribe_roster', {'rosterId': rosterId});
  }
  
  /// Subscribe to specific vehicle updates
  void _subscribeToVehicle(String vehicleId) {
    _webSocketService?.sendMessage('subscribe_vehicle', {'vehicleId': vehicleId});
  }
  
  /// Unsubscribe from vehicle updates
  void _unsubscribeFromVehicle(String vehicleId) {
    _webSocketService?.sendMessage('unsubscribe_vehicle', {'vehicleId': vehicleId});
  }