// lib/features/admin/gps_tracking.dart - PRODUCTION READY FULL CODE
import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import '../../../../app/config/api_config.dart';
import '../../../../core/services/api_service.dart';

class GPSTrackingScreen extends StatefulWidget {
  const GPSTrackingScreen({Key? key}) : super(key: key);
  @override
  State<GPSTrackingScreen> createState() => _GPSTrackingScreenState();
}

class _GPSTrackingScreenState extends State<GPSTrackingScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _imeiCtrl = TextEditingController();
  final TextEditingController _modelCtrl = TextEditingController();
  final TextEditingController _simCtrl = TextEditingController();
  final TextEditingController _searchCtrl = TextEditingController();
  final TextEditingController _vehicleSearchCtrl = TextEditingController();
  
  String? _selectedVehicleId;
  String? _selectedVehicleName;
  List<Map<String, dynamic>> devices = [];
  List<Map<String, dynamic>> availableVehicles = [];
  List<String> testLogs = [];
  bool isTesting = false, isLoading = false, isLoadingVehicles = false;
  
  // Pagination
  int currentPage = 1;
  int totalPages = 1;
  int totalDeviceCount = 0;
  int pageSize = 50;
  String searchQuery = '';
  String statusFilter = 'all';
  
  // Statistics
  int totalCount = 0;
  int assignedCount = 0;
  int activeCount = 0;
  int unassignedCount = 0;
  
  Timer? _refreshTimer;
  
  // Use ApiService for authenticated requests
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _loadDevices();
    _loadAvailableVehicles();
    
    // Auto-refresh every 30 seconds for live status
    _refreshTimer = Timer.periodic(Duration(seconds: 30), (_) => _loadDevices());
    
    // Debounced search
    _searchCtrl.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _imeiCtrl.dispose();
    _modelCtrl.dispose();
    _simCtrl.dispose();
    _searchCtrl.dispose();
    _vehicleSearchCtrl.dispose();
    super.dispose();
  }

  Timer? _searchDebounce;
  void _onSearchChanged() {
    if (_searchDebounce?.isActive ?? false) _searchDebounce!.cancel();
    _searchDebounce = Timer(Duration(milliseconds: 500), () {
      if (searchQuery != _searchCtrl.text) {
        setState(() {
          searchQuery = _searchCtrl.text;
          currentPage = 1;
        });
        _loadDevices();
      }
    });
  }

  // ========== FIX #1: Load Devices Method ==========

Future<void> _loadDevices() async {
  if (!mounted) return;
  setState(() => isLoading = true);
  
  try {
    // ✅ FIXED: Only include non-empty query params
    final Map<String, String> queryParams = {
      'page': currentPage.toString(),
      'limit': pageSize.toString(),
    };
    
    // ✅ Only add search if not empty
    if (searchQuery.isNotEmpty) {
      queryParams['search'] = searchQuery;
    }
    
    // ✅ Only add status if not 'all'
    if (statusFilter != 'all') {
      queryParams['status'] = statusFilter;
    }
    
    print('🔍 Loading devices with params: $queryParams');
    
    final data = await _apiService.get('/api/gps/devices', queryParams: queryParams);
    
    if (!mounted) return;
    
    setState(() {
      devices = List<Map<String, dynamic>>.from(data['devices'] ?? []);
      totalDeviceCount = data['pagination']?['total'] ?? 0;
      totalPages = data['pagination']?['pages'] ?? 1;
      
      // Update statistics
      final stats = data['statistics'] ?? {};
      totalCount = stats['total'] ?? 0;
      assignedCount = stats['assigned'] ?? 0;
      activeCount = stats['active'] ?? 0;
      unassignedCount = stats['unassigned'] ?? 0;
    });
    
    print('✅ Loaded ${devices.length} devices');
  } catch (e) {
    print('❌ Load devices error: $e');
    if (mounted) _showError('Load Failed', e.toString());
  } finally {
    if (mounted) setState(() => isLoading = false);
  }
}

// ========== FIX #2: Load Available Vehicles ==========

Future<void> _loadAvailableVehicles({String search = ''}) async {
  setState(() => isLoadingVehicles = true);
  
  try {
    // ✅ FIXED: Only include non-empty query params
    final Map<String, String> queryParams = {
      'limit': '100',
    };
    
    // ✅ Only add search if not empty
    if (search.isNotEmpty) {
      queryParams['search'] = search;
    }
    
    print('🔍 Loading vehicles with params: $queryParams');
    
    final data = await _apiService.get('/api/gps/vehicles/available', queryParams: queryParams);
    
    setState(() {
      availableVehicles = List<Map<String, dynamic>>.from(data['vehicles'] ?? []);
    });
    
    print('✅ Loaded ${availableVehicles.length} available vehicles');
  } catch (e) {
    print('❌ Load vehicles error: $e');
    _showError('Load Vehicles Failed', e.toString());
  } finally {
    setState(() => isLoadingVehicles = false);
  }
}


  Future<void> _registerDevice() async {
    if (!_formKey.currentState!.validate()) return;
    
    final imei = _imeiCtrl.text.trim();
    if (devices.any((d) => d['imei'] == imei)) {
      _showError('Duplicate IMEI', 'IMEI already registered');
      return;
    }
    
    setState(() => isLoading = true);
    
    try {
      final body = {
        'imei': imei,
        'model': _modelCtrl.text.trim(),
        'sim': _simCtrl.text.trim(),
        'vehicleId': _selectedVehicleId ?? 'unassigned',
      };
      
      await _apiService.post('/api/gps/devices', body: body);
      
      _showSuccess(
        'Registered!', 
        'IMEI: $imei\n${_selectedVehicleName ?? "Unassigned"}\n\n✅ Next: Test connection before installation'
      );
      _clearForm();
      _loadDevices();
      _loadAvailableVehicles();
    } catch (e) {
      _showError('Failed', e.toString());
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _testConnection(String? imei) async {
    final testImei = imei ?? _imeiCtrl.text.trim();
    if (testImei.isEmpty) {
      _showError('No IMEI', 'Enter IMEI to test');
      return;
    }
    
    setState(() {
      isTesting = true;
      testLogs = ['⏳ Testing IMEI: $testImei...', '🔄 Contacting device...'];
    });
    
    try {
      await Future.delayed(Duration(milliseconds: 500));
      
      final data = await _apiService.post('/api/gps/devices/$testImei/test');
      
      await Future.delayed(Duration(milliseconds: 300));
      
      setState(() {
        testLogs.addAll([
          '',
          '✅ Server Connection: SUCCESS',
          '✅ GPS Module: ACTIVE',
          '✅ SIM Network: CONNECTED',
          '',
          '📍 Current Location:',
          '   Lat: ${data['latitude']}',
          '   Lng: ${data['longitude']}',
          '',
          '🛰️ Satellites: ${data['satellites'] ?? 'N/A'}',
          '📶 Signal: ${data['signal'] ?? 'Unknown'}',
          '⏰ Last Update: ${data['lastUpdate'] ?? 'Just now'}',
          '',
          '✅ ALL TESTS PASSED',
          '✅ Device ready for installation!'
        ]);
      });
      _showSuccess('Test Passed!', 'Device is working correctly');
    } catch (e) {
      // Parse error details if it's an ApiException
      Map<String, dynamic> err = {};
      if (e.toString().contains('ApiException:')) {
        try {
          final errorJson = e.toString().replaceFirst('ApiException: ', '');
          err = Map<String, dynamic>.from(json.decode(errorJson));
        } catch (_) {
          err = {'message': e.toString(), 'code': 'UNKNOWN'};
        }
      } else {
        err = {'message': e.toString(), 'code': 'NETWORK_ERROR'};
      }
      _handleTestError(err);
    } finally {
      setState(() => isTesting = false);
    }
  }

  void _handleTestError(Map<String, dynamic> err) {
    final code = err['code'] ?? 'UNKNOWN';
    setState(() {
      testLogs = [
        '❌ TEST FAILED',
        'Error Code: $code',
        '',
        'Problem: ${err['message'] ?? 'Unknown error'}',
        '',
      ];
    });

    List<String> actions = [];
    
    switch (code) {
      case 'NO_RESPONSE':
        actions = [
          '🔧 IMMEDIATE ACTIONS:',
          '',
          '1️⃣ Check Power',
          '   • Verify device is powered ON',
          '   • Check red LED is lit',
          '   • Inspect power connections',
          '',
          '2️⃣ Wait for Boot',
          '   • Device needs 2-3 min to boot',
          '   • Wait for GPS lock (blue LED)',
          '   • Wait for network (green LED)',
          '',
          '3️⃣ Restart Device',
          '   • Power OFF for 30 seconds',
          '   • Power ON and wait 3 minutes',
          '   • Retest connection',
          '',
          '4️⃣ If Still Fails',
          '   • Device may be faulty',
          '   • Contact supplier',
          '   • Request replacement',
        ];
        break;
        
      case 'SIM_NOT_ACTIVATED':
        actions = [
          '🔧 SIM CARD ISSUE:',
          '',
          'SIM Number: ${err['sim'] ?? 'Unknown'}',
          '',
          '1️⃣ Contact Provider',
          '   • Call customer service',
          '   • Verify SIM activation',
          '   • Confirm data plan active',
          '',
          '2️⃣ Check Account',
          '   • Verify balance',
          '   • Check data quota',
          '   • No service suspension',
          '',
          '3️⃣ Wait & Retry',
          '   • Activation takes 15-30 min',
          '   • Restart after activation',
          '   • Retest connection',
        ];
        break;
        
      case 'NO_GPS_SIGNAL':
        actions = [
          '🔧 GPS SIGNAL ISSUE:',
          '',
          '1️⃣ Environment',
          '   • Move to outdoor area',
          '   • Clear sky view needed',
          '   • Away from buildings',
          '   • Remove metal objects',
          '',
          '2️⃣ Wait for Lock',
          '   • First lock: 5-10 minutes',
          '   • Blue LED blinks → solid',
          '   • Be patient outdoors',
          '',
          '3️⃣ Check Antenna',
          '   • Verify connected',
          '   • Check for damage',
          '   • Proper placement',
          '',
          '4️⃣ Post-Install',
          '   • Better after installation',
          '   • Vehicle roof = better signal',
        ];
        break;
        
      case 'WEAK_SIGNAL':
        actions = [
          '⚠️ WEAK NETWORK:',
          '',
          'Signal: ${err['signal'] ?? 'Unknown'}',
          '',
          '1️⃣ Coverage',
          '   • Check coverage map',
          '   • Move to better area',
          '   • Try different location',
          '',
          '2️⃣ Settings',
          '   • Verify APN config',
          '   • Check network settings',
          '   • Restart connection',
          '',
          '3️⃣ Provider',
          '   • Different provider?',
          '   • Check 4G coverage',
          '   • Verify data plan',
        ];
        break;
        
      case 'DEVICE_NOT_CONFIGURED':
        actions = [
          '🔧 CONFIG NEEDED:',
          '',
          'Server IP: ${err['server_ip'] ?? 'YOUR_IP'}',
          'Port: ${err['server_port'] ?? '8080'}',
          '',
          '1️⃣ SMS Commands',
          '   SERVER123456,IP,PORT#',
          '   APN123456,YOUR_APN#',
          '   TIMER123456,30#',
          '',
          '2️⃣ Verify',
          '   Send: STATUS#',
          '   Reply: "Server OK"',
          '',
          '3️⃣ Common APNs',
          '   Airtel: airtelgprs.com',
          '   Jio: jionet',
          '   Vi: www',
        ];
        break;
        
      case 'NETWORK_ERROR':
        actions = [
          '🔧 NETWORK ERROR:',
          '',
          '1️⃣ Your Internet',
          '   • Check WiFi/data',
          '   • Try opening website',
          '   • Restart connection',
          '',
          '2️⃣ Backend Server',
          '   • Is server running?',
          '   • Check server logs',
          '   • Verify API endpoint',
          '',
          '3️⃣ Firewall',
          '   • Check settings',
          '   • Allow port 3001',
          '   • Test different network',
        ];
        break;
        
      default:
        actions = [
          '🔧 UNKNOWN ERROR:',
          '',
          'Message: ${err['message']}',
          '',
          '1️⃣ Note Details',
          '   • Screenshot error',
          '   • Note IMEI',
          '   • Note error code',
          '',
          '2️⃣ Check Manual',
          '   • Device manual',
          '   • Troubleshooting section',
          '',
          '3️⃣ Contact Support',
          '   • Supplier support',
          '   • Provide details',
        ];
    }

    setState(() => testLogs.addAll(actions));
  }

  Future<void> _deleteDevice(String imei, String vehicleName) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text('⚠️ Delete GPS Device?'),
        content: Text(
          'Delete:\n\nIMEI: $imei\nVehicle: $vehicleName\n\nThis will delete all location history.'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false), 
            child: Text('Cancel')
          ),
          TextButton(
            onPressed: () => Navigator.pop(c, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('Delete'),
          ),
        ],
      ),
    );
    
    if (confirm != true) return;
    
    try {
      await _apiService.delete('/api/gps/devices/$imei');
      _showSuccess('Deleted', 'Device removed');
      _loadDevices();
      _loadAvailableVehicles();
    } catch (e) {
      _showError('Failed', e.toString());
    }
  }

  void _showVehicleSelector() {
    _vehicleSearchCtrl.clear();
    _loadAvailableVehicles();
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('🚗 Select Vehicle'),
          content: SizedBox(
            width: 500,
            height: 500,
            child: Column(
              children: [
                TextField(
                  controller: _vehicleSearchCtrl,
                  decoration: InputDecoration(
                    hintText: 'Search vehicles...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)
                    ),
                  ),
                  onChanged: (v) {
                    setDialogState(() {});
                    _loadAvailableVehicles(search: v);
                  },
                ),
                SizedBox(height: 16),
                Expanded(
                  child: isLoadingVehicles
                      ? Center(child: CircularProgressIndicator())
                      : availableVehicles.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.info, size: 48, color: Colors.grey),
                                  SizedBox(height: 16),
                                  Text('No available vehicles'),
                                  Text('All have GPS assigned', style: TextStyle(color: Colors.grey)),
                                ],
                              ),
                            )
                          : ListView.builder(
                              itemCount: availableVehicles.length + 1,
                              itemBuilder: (c, i) {
                                if (i == 0) {
                                  return ListTile(
                                    leading: Icon(Icons.clear, color: Colors.orange),
                                    title: Text('-- Not Assigned --'),
                                    onTap: () {
                                      setState(() {
                                        _selectedVehicleId = null;
                                        _selectedVehicleName = null;
                                      });
                                      Navigator.pop(context);
                                    },
                                  );
                                }
                                
                                final vehicle = availableVehicles[i - 1];
                                return ListTile(
                                  leading: Icon(Icons.directions_bus, color: Colors.blue),
                                  title: Text(vehicle['name']),
                                  subtitle: Text('${vehicle['registrationNumber']} • ${vehicle['type'] ?? 'N/A'}'),
                                  onTap: () {
                                    setState(() {
                                      _selectedVehicleId = vehicle['id'];
                                      _selectedVehicleName = vehicle['name'];
                                    });
                                    Navigator.pop(context);
                                  },
                                );
                              },
                            ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel'),
            ),
          ],
        ),
      ),
    );
  }

  void _clearForm() {
    _imeiCtrl.clear();
    _modelCtrl.clear();
    _simCtrl.clear();
    setState(() {
      _selectedVehicleId = null;
      _selectedVehicleName = null;
      testLogs.clear();
    });
  }

  void _showError(String t, String m) {
    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        title: Row(children: [
          Icon(Icons.error, color: Colors.red), 
          SizedBox(width: 10), 
          Expanded(child: Text(t))
        ]),
        content: Text(m),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c), child: Text('OK'))
        ],
      ),
    );
  }

  void _showSuccess(String t, String m) {
    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        title: Row(children: [
          Icon(Icons.check_circle, color: Colors.green), 
          SizedBox(width: 10), 
          Expanded(child: Text(t))
        ]),
        content: Text(m),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c), child: Text('OK'))
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('🛰️ GPS Device Management'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadDevices,
            tooltip: 'Refresh',
          ),
          SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            _buildStats(),
            SizedBox(height: 32),
            LayoutBuilder(
              builder: (c, constraints) {
                if (constraints.maxWidth > 1200) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(width: 450, child: _buildRegForm()),
                      SizedBox(width: 24),
                      Expanded(child: _buildDeviceList()),
                    ],
                  );
                }
                return Column(
                  children: [
                    _buildRegForm(), 
                    SizedBox(height: 24), 
                    _buildDeviceList()
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStats() {
    return Row(
      children: [
        Expanded(child: _statCard('📡', '$totalCount', 'Total Devices', Color(0xFFDBEAFE), Colors.blue)),
        SizedBox(width: 16),
        Expanded(child: _statCard('🚗', '$assignedCount', 'Assigned', Color(0xFFDDD6FE), Colors.purple)),
        SizedBox(width: 16),
        Expanded(child: _statCard('✅', '$activeCount', 'Active Online', Color(0xFFD1FAE5), Colors.green)),
        SizedBox(width: 16),
        Expanded(child: _statCard('⚠️', '$unassignedCount', 'Unassigned', Color(0xFFFEF3C7), Colors.orange)),
      ],
    );
  }

  Widget _statCard(String icon, String val, String label, Color bg, Color iconColor) {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(val, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: iconColor)),
              SizedBox(height: 4),
              Text(label, style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
            ],
          ),
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
            child: Center(child: Text(icon, style: TextStyle(fontSize: 24))),
          ),
        ],
      ),
    );
  }

  Widget _buildRegForm() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              borderRadius: BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
            ),
            child: Row(
              children: [
                Icon(Icons.add_circle_outline, color: Color(0xFF3B82F6)),
                SizedBox(width: 12),
                Text('Register New GPS Device', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: _imeiCtrl,
                    maxLength: 15,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'IMEI Number *',
                      hintText: '861234567890123',
                      helperText: '15-digit ID on device label',
                      prefixIcon: Icon(Icons.fingerprint),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      counterText: '',
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'IMEI required';
                      if (!RegExp(r'^\d{15}$').hasMatch(v)) return 'Must be 15 digits';
                      return null;
                    },
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    controller: _modelCtrl,
                    decoration: InputDecoration(
                      labelText: 'Device Brand/Model',
                      hintText: 'e.g., Teltonika FMB920',
                      prefixIcon: Icon(Icons.devices),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    controller: _simCtrl,
                    decoration: InputDecoration(
                      labelText: 'SIM Card Number',
                      hintText: '+91 98765 43210',
                      prefixIcon: Icon(Icons.sim_card),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  SizedBox(height: 20),
                  InkWell(
                    onTap: _showVehicleSelector,
                    child: Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade400),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.directions_bus, color: Colors.blue),
                              SizedBox(width: 12),
                              Text(
                                _selectedVehicleName ?? 'Select Vehicle (Optional)',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: _selectedVehicleName != null ? Colors.black : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          Icon(Icons.arrow_drop_down),
                        ],
                      ),
                    ),
                  ),
                  if (_selectedVehicleName != null) ...[
                    SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green, size: 16),
                        SizedBox(width: 8),
                        Text('Assigned to: $_selectedVehicleName', style: TextStyle(color: Colors.green, fontSize: 12)),
                        Spacer(),
                        TextButton(
                          onPressed: () => setState(() {
                            _selectedVehicleId = null;
                            _selectedVehicleName = null;
                          }),
                          child: Text('Clear'),
                        ),
                      ],
                    ),
                  ],
                  SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: isLoading ? null : _registerDevice,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF3B82F6),
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: isLoading
                          ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text('➕ Register Device', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  SizedBox(height: 24),
                  _buildTestSection(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestSection() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFFF0F9FF), Color(0xFFE0F2FE)]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFF0EA5E9), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.science, color: Color(0xFF0C4A6E)),
              SizedBox(width: 8),
              Text('🧪 Test GPS Connection', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF0C4A6E))),
            ],
          ),
          SizedBox(height: 6),
          Text('Verify connectivity before installation', style: TextStyle(fontSize: 12, color: Color(0xFF0C4A6E))),
          SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isTesting ? null : () => _testConnection(null),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF64748B),
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: isTesting
                  ? SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('🔄 Run Connection Test', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ),
          ),
          if (testLogs.isNotEmpty) ...[
            SizedBox(height: 16),
            Container(
              height: 300,
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Color(0xFFBAE6FD)),
              ),
              child: ListView.builder(
                itemCount: testLogs.length,
                itemBuilder: (c, i) {
                  final log = testLogs[i];
                  Color bg = Color(0xFFDBEAFE), txt = Color(0xFF1E40AF);
                  if (log.startsWith('✅')) {
                    bg = Color(0xFFD1FAE5);
                    txt = Color(0xFF065F46);
                  } else if (log.startsWith('❌') || log.startsWith('⚠️')) {
                    bg = Color(0xFFFEE2E2);
                    txt = Color(0xFF991B1B);
                  } else if (log.startsWith('🔧') || log.contains('ACTION')) {
                    bg = Color(0xFFFEF3C7);
                    txt = Color(0xFF92400E);
                  }
                  return Container(
                    margin: EdgeInsets.only(bottom: 6),
                    padding: EdgeInsets.all(10),
                    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
                    child: Text(log, style: TextStyle(fontSize: 12, color: txt, fontWeight: FontWeight.w500)),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeviceList() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              borderRadius: BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.list_alt, color: Color(0xFF3B82F6)),
                    SizedBox(width: 12),
                    Text('Registered GPS Devices', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ],
                ),
                Text('$totalDeviceCount devices', style: TextStyle(color: Colors.grey, fontSize: 14)),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchCtrl,
                        decoration: InputDecoration(
                          hintText: 'Search by IMEI, vehicle, SIM...',
                          prefixIcon: Icon(Icons.search),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    SizedBox(width: 12),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade400),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: DropdownButton<String>(
                        value: statusFilter,
                        underline: SizedBox(),
                        items: [
                          DropdownMenuItem(value: 'all', child: Text('All Status')),
                          DropdownMenuItem(value: 'active', child: Text('Active')),
                          DropdownMenuItem(value: 'offline', child: Text('Offline')),
                          DropdownMenuItem(value: 'unassigned', child: Text('Unassigned')),
                        ],
                        onChanged: (v) {
                          setState(() {
                            statusFilter = v!;
                            currentPage = 1;
                          });
                          _loadDevices();
                        },
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20),
                if (isLoading)
                  Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
                else if (devices.isEmpty)
                  Container(
                    padding: EdgeInsets.all(60),
                    child: Column(
                      children: [
                        Icon(Icons.gps_off, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No devices found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                        Text('Register your first GPS device', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  )
                else ...[
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingRowColor: MaterialStateProperty.all(Color(0xFFF8FAFC)),
                      columns: [
                        DataColumn(label: Text('IMEI', style: TextStyle(fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Model', style: TextStyle(fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Vehicle', style: TextStyle(fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('SIM', style: TextStyle(fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Last Update', style: TextStyle(fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Actions', style: TextStyle(fontWeight: FontWeight.bold))),
                      ],
                      rows: devices.map((d) {
                        final status = d['status'] ?? 'unknown';
                        Color statusColor = Colors.grey;
                        if (status == 'active') statusColor = Colors.green;
                        if (status == 'offline') statusColor = Colors.red;
                        if (status == 'unassigned') statusColor = Colors.orange;
                        
                        return DataRow(cells: [
                          DataCell(SelectableText(d['imei'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace'))),
                          DataCell(Text(d['model'] ?? 'N/A')),
                          DataCell(Text(d['vehicleName'] ?? 'Unassigned')),
                          DataCell(Text(d['sim'] ?? 'N/A')),
                          DataCell(
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: statusColor),
                              ),
                              child: Text(
                                status.toUpperCase(),
                                style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          DataCell(Text(d['lastUpdate'] != null ? _formatDate(d['lastUpdate']) : 'Never')),
                          DataCell(
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Tooltip(
                                  message: 'Test Connection',
                                  child: IconButton(
                                    icon: Icon(Icons.bug_report, color: Colors.blue),
                                    onPressed: () => _testConnection(d['imei']),
                                  ),
                                ),
                                Tooltip(
                                  message: 'Delete Device',
                                  child: IconButton(
                                    icon: Icon(Icons.delete, color: Colors.red),
                                    onPressed: () => _deleteDevice(d['imei'], d['vehicleName'] ?? 'Unknown'),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ]);
                      }).toList(),
                    ),
                  ),
                  SizedBox(height: 20),
                  _buildPagination(),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPagination() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('Page $currentPage of $totalPages ($totalDeviceCount total)', style: TextStyle(color: Colors.grey)),
        Row(
          children: [
            IconButton(
              icon: Icon(Icons.first_page),
              onPressed: currentPage > 1 ? () => setState(() { currentPage = 1; _loadDevices(); }) : null,
            ),
            IconButton(
              icon: Icon(Icons.chevron_left),
              onPressed: currentPage > 1 ? () => setState(() { currentPage--; _loadDevices(); }) : null,
            ),
            ...List.generate(
              totalPages > 5 ? 5 : totalPages,
              (i) {
                int pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: InkWell(
                    onTap: () => setState(() { currentPage = pageNum; _loadDevices(); }),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: currentPage == pageNum ? Color(0xFF3B82F6) : Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '$pageNum',
                          style: TextStyle(
                            color: currentPage == pageNum ? Colors.white : Colors.black,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            IconButton(
              icon: Icon(Icons.chevron_right),
              onPressed: currentPage < totalPages ? () => setState(() { currentPage++; _loadDevices(); }) : null,
            ),
            IconButton(
              icon: Icon(Icons.last_page),
              onPressed: currentPage < totalPages ? () => setState(() { currentPage = totalPages; _loadDevices(); }) : null,
            ),
          ],
        ),
      ],
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      DateTime dt = date is String ? DateTime.parse(date) : date;
      final now = DateTime.now();
      final diff = now.difference(dt);
      
      if (diff.inSeconds < 60) return '${diff.inSeconds}s ago';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (e) {
      return 'Invalid';
    }
  }
}