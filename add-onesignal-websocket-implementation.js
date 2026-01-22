// add-onesignal-websocket-implementation.js
// Add complete OneSignal + WebSocket implementation to admin_main_shell.dart

const fs = require('fs');

const filePath = 'abra_fleet/lib/features/admin/shell/admin_main_shell.dart';

console.log('🔄 Adding OneSignal + WebSocket implementation...');

let content = fs.readFileSync(filePath, 'utf8');

// Find the AdminMainShell class and add WebSocket/OneSignal properties
const classPattern = /class _AdminMainShellState extends State<AdminMainShell>/;
if (classPattern.test(content)) {
  // Add WebSocket and OneSignal properties after the class declaration
  const newProperties = `
  // ========== ONESIGNAL + WEBSOCKET PROPERTIES ==========
  WebSocketService? _webSocketService;
  StreamSubscription<Map<String, dynamic>>? _oneSignalSubscription;
  StreamSubscription<WebSocketMessage>? _webSocketSubscription;
  
  // Real-time data
  int _pendingRostersCount = 0;
  int _availableVehiclesCount = 0;
  Map<String, dynamic> _realTimeVehicleLocations = {};
  
`;

  content = content.replace(
    /class _AdminMainShellState extends State<AdminMainShell>\s*with\s*TickerProviderStateMixin\s*\{/,
    `class _AdminMainShellState extends State<AdminMainShell> with TickerProviderStateMixin {${newProperties}`
  );
}

console.log('✅ Added WebSocket/OneSignal properties');

// Find initState and add real-time services initialization
const initStatePattern = /(@override\s+void initState\(\) \{[\s\S]*?)(WidgetsBinding\.instance\.addPostFrameCallback\([^}]*\}[\s\S]*?\);)/;

if (initStatePattern.test(content)) {
  content = content.replace(initStatePattern, (match, p1, p2) => {
    return `${p1}${p2}
    
    // Initialize OneSignal + WebSocket services
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _initializeRealTimeServices();
    });`;
  });
} else {
  // Fallback: add at the end of initState
  content = content.replace(
    /(@override\s+void initState\(\) \{[\s\S]*?)(\s+\})/,
    `$1
    
    // Initialize OneSignal + WebSocket services
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _initializeRealTimeServices();
    });$2`
  );
}

console.log('✅ Added initialization call to initState');

fs.writeFileSync(filePath, content);
console.log('💾 File saved');