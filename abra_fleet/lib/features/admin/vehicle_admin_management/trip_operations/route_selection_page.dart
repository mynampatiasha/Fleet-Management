import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:async';
import 'dart:math';
import '../../../../core/services/enhanced_location_service.dart';
import 'widgets/enhanced_location_search_widget.dart';

class RouteSelectionPage extends StatefulWidget {
  final LatLng? initialStartPoint;
  final LatLng? initialEndPoint;

  const RouteSelectionPage({
    Key? key,
    this.initialStartPoint,
    this.initialEndPoint,
  }) : super(key: key);

  @override
  _RouteSelectionPageState createState() => _RouteSelectionPageState();
}

class _RouteSelectionPageState extends State<RouteSelectionPage> {
  final MapController _mapController = MapController();
  
  LatLng? _startPoint;
  LatLng? _endPoint;
  LocationSearchResult? _startLocationResult;
  LocationSearchResult? _endLocationResult;
  List<LatLng> _routePoints = [];
  
  String _selectingPointFor = ''; // 'start' or 'end'
  LatLng? _currentMapCenter;

  // Default center: Bengaluru, Karnataka
  final LatLng _defaultCenter = LatLng(12.9716, 77.5946);

  @override
  void initState() {
    super.initState();
    _startPoint = widget.initialStartPoint;
    _endPoint = widget.initialEndPoint;
    _currentMapCenter = _defaultCenter;
    
    if (_startPoint != null && _endPoint != null) {
      _routePoints = [_startPoint!, _endPoint!];
    }
    
    // Load initial addresses for existing points
    if (_startPoint != null) {
      _loadAddressForPoint(_startPoint!, true);
    }
    if (_endPoint != null) {
      _loadAddressForPoint(_endPoint!, false);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _loadAddressForPoint(LatLng point, bool isStart) async {
    try {
      final result = await EnhancedLocationService.getAddressFromCoordinates(
        point.latitude,
        point.longitude,
      );
      
      if (result != null && mounted) {
        setState(() {
          if (isStart) {
            _startLocationResult = result;
          } else {
            _endLocationResult = result;
          }
        });
      }
    } catch (e) {
      print('Error loading address: $e');
    }
  }

  void _onStartLocationSelected(LocationSearchResult result) {
    setState(() {
      _startPoint = result.latLng;
      _startLocationResult = result;
      _selectingPointFor = '';
      
      if (_startPoint != null && _endPoint != null) {
        _routePoints = [_startPoint!, _endPoint!];
      }
    });

    _mapController.move(result.latLng, 15.0);
  }

  void _onEndLocationSelected(LocationSearchResult result) {
    setState(() {
      _endPoint = result.latLng;
      _endLocationResult = result;
      _selectingPointFor = '';
      
      if (_startPoint != null && _endPoint != null) {
        _routePoints = [_startPoint!, _endPoint!];
      }
    });

    _mapController.move(result.latLng, 15.0);
  }

  void _onMapTap(TapPosition tapPosition, LatLng point) {
    if (_selectingPointFor == 'start') {
      setState(() {
        _startPoint = point;
        _selectingPointFor = '';
        if (_startPoint != null && _endPoint != null) {
          _routePoints = [_startPoint!, _endPoint!];
        }
      });
      // Load address for the tapped point
      _loadAddressForPoint(point, true);
    } else if (_selectingPointFor == 'end') {
      setState(() {
        _endPoint = point;
        _selectingPointFor = '';
        if (_startPoint != null && _endPoint != null) {
          _routePoints = [_startPoint!, _endPoint!];
        }
      });
      // Load address for the tapped point
      _loadAddressForPoint(point, false);
    }
  }

  void _startSelectingPoint(String type) {
    setState(() {
      _selectingPointFor = type;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          type == 'start' 
            ? 'Tap on the map or search to select start point'
            : 'Tap on the map or search to select end point',
        ),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF0D47A1),
      ),
    );
  }

  void _clearRoute() {
    setState(() {
      _startPoint = null;
      _endPoint = null;
      _startLocationResult = null;
      _endLocationResult = null;
      _routePoints = [];
      _selectingPointFor = '';
    });
  }

  double _calculateRouteDistance() {
    if (_startPoint == null || _endPoint == null) return 0;
    
    final distance = Distance();
    return distance.as(
      LengthUnit.Kilometer,
      _startPoint!,
      _endPoint!,
    );
  }

  void _confirmRoute() {
    if (_startPoint != null && _endPoint != null) {
      Navigator.pop(context, {
        'startPoint': _startPoint,
        'endPoint': _endPoint,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Route'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
        actions: [
          if (_startPoint != null || _endPoint != null)
            IconButton(
              icon: const Icon(Icons.clear_all),
              onPressed: _clearRoute,
              tooltip: 'Clear Route',
            ),
        ],
      ),
      body: Column(
        children: [
          // Enhanced Location Selection
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // Start Point Selection
                _buildLocationSelectionCard(
                  title: 'Pickup Location',
                  icon: Icons.trip_origin,
                  color: Colors.green,
                  point: _startPoint,
                  locationResult: _startLocationResult,
                  isSelecting: _selectingPointFor == 'start',
                  onSelectPressed: () => _startSelectingPoint('start'),
                ),
                
                const SizedBox(height: 16),
                
                // End Point Selection
                _buildLocationSelectionCard(
                  title: 'Drop Location',
                  icon: Icons.location_on,
                  color: Colors.red,
                  point: _endPoint,
                  locationResult: _endLocationResult,
                  isSelecting: _selectingPointFor == 'end',
                  onSelectPressed: () => _startSelectingPoint('end'),
                ),
                
                // Enhanced Search Widget
                if (_selectingPointFor.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  EnhancedLocationSearchWidget(
                    hintText: _selectingPointFor == 'start' 
                        ? 'Search for pickup location...'
                        : 'Search for drop location...',
                    onLocationSelected: _selectingPointFor == 'start' 
                        ? _onStartLocationSelected
                        : _onEndLocationSelected,
                    currentLocation: _currentMapCenter,
                    showCurrentLocationButton: true,
                    showNearbyPlaces: true,
                  ),
                ],
                
                // Route Info Summary
                if (_routePoints.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildRouteInfoCard(),
                ],
              ],
            ),
          ),
          
          // Map
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: _selectingPointFor.isNotEmpty 
                      ? (_selectingPointFor == 'start' ? Colors.green : Colors.red)
                      : Colors.grey.shade300,
                  width: _selectingPointFor.isNotEmpty ? 3 : 0,
                ),
              ),
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _defaultCenter,
                  initialZoom: 12.0,
                  onTap: _onMapTap,
                  onPositionChanged: (position, hasGesture) {
                    if (hasGesture) {
                      _currentMapCenter = position.center;
                    }
                  },
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.abra.fleet',
                  ),
                  if (_routePoints.isNotEmpty)
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: _routePoints,
                          color: const Color(0xFF0D47A1),
                          strokeWidth: 4.0,
                        ),
                      ],
                    ),
                  MarkerLayer(
                    markers: [
                      if (_startPoint != null)
                        Marker(
                          point: _startPoint!,
                          width: 40,
                          height: 40,
                          child: const Icon(
                            Icons.trip_origin,
                            color: Colors.green,
                            size: 40,
                          ),
                        ),
                      if (_endPoint != null)
                        Marker(
                          point: _endPoint!,
                          width: 40,
                          height: 40,
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.red,
                            size: 40,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton.icon(
            icon: const Icon(Icons.check),
            label: const Text('Confirm Route'),
            onPressed: _startPoint != null && _endPoint != null ? _confirmRoute : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D47A1),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
              disabledBackgroundColor: Colors.grey.shade300,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLocationSelectionCard({
    required String title,
    required IconData icon,
    required Color color,
    required LatLng? point,
    required LocationSearchResult? locationResult,
    required bool isSelecting,
    required VoidCallback onSelectPressed,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: point != null ? color.withOpacity(0.1) : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelecting 
              ? color 
              : point != null 
                  ? color.withOpacity(0.3)
                  : Colors.grey.shade300,
          width: isSelecting ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: point != null ? color : Colors.grey.shade400,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 4),
                if (locationResult != null) ...[
                  Text(
                    locationResult.shortName,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: color.withOpacity(0.9),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    locationResult.address,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ] else if (point != null) ...[
                  Text(
                    'Selected Location',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: color.withOpacity(0.9),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${point.latitude.toStringAsFixed(4)}, ${point.longitude.toStringAsFixed(4)}',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ] else ...[
                  Text(
                    'Not selected',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Tap to select or search',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton.icon(
            onPressed: onSelectPressed,
            icon: Icon(
              isSelecting ? Icons.cancel : Icons.add_location,
              size: 18,
            ),
            label: Text(
              isSelecting ? 'Cancel' : 'Select',
              style: const TextStyle(fontSize: 12),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: isSelecting ? Colors.grey.shade600 : color,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              minimumSize: const Size(0, 36),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteInfoCard() {
    final distance = _calculateRouteDistance();
    final estimatedTime = (distance / 40 * 60).round();
    
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                Icon(Icons.straighten, color: Colors.blue.shade700, size: 24),
                const SizedBox(height: 8),
                Text(
                  '${distance.toStringAsFixed(1)} km',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade900,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'Distance',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.blue.shade700,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 1,
            height: 40,
            color: Colors.blue.shade200,
          ),
          Expanded(
            child: Column(
              children: [
                Icon(Icons.access_time, color: Colors.blue.shade700, size: 24),
                const SizedBox(height: 8),
                Text(
                  '$estimatedTime min',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade900,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'Est. Time',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.blue.shade700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}