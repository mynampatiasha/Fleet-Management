// complete-firebase-migration.js
// Complete Firebase → OneSignal + WebSocket migration for admin_main_shell.dart

const fs = require('fs');

const filePath = 'abra_fleet/lib/features/admin/shell/admin_main_shell.dart';

console.log('🔄 Starting complete Firebase migration...');

let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Firebase imports
content = content.replace(/import 'package:firebase_database\/firebase_database\.dart';\n/g, '');
content = content.replace(/import 'package:firebase_auth\/firebase_auth\.dart';\n/g, '');

// 2. Add OneSignal and WebSocket imports (if not already added)
if (!content.includes('one_signal_service.dart')) {
  const newImports = `
// OneSignal and WebSocket Services (replaces Firebase)
import 'package:abra_fleet/core/services/one_signal_service.dart';
import 'package:abra_fleet/core/services/websocket_service.dart';
`;
  content = content.replace(
    /import 'package:abra_fleet\/core\/services\/trip_notification_service\.dart';\n/,
    `import 'package:abra_fleet/core/services/trip_notification_service.dart';\n${newImports}`
  );
}

// 3. Replace all FirebaseAuth references
content = content.replace(
  /FirebaseAuth\.instance\.currentUser\?\.email ?? 'Admin'/g,
  `'Admin' // TODO: Get from AuthRepository`
);

content = content.replace(
  /final user = FirebaseAuth\.instance\.currentUser;/g,
  `// TODO: Replace with AuthRepository
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;`
);

content = content.replace(
  /final firebaseUser = FirebaseAuth\.instance\.currentUser;/g,
  `// TODO: Replace with AuthRepository  
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;`
);

content = content.replace(
  /final currentUser = FirebaseAuth\.instance\.currentUser;/g,
  `// TODO: Replace with AuthRepository
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final currentUser = authRepo.currentUser;`
);

// 4. Replace Firebase Database references
content = content.replace(
  /final sosRef = FirebaseDatabase\.instance\.ref\('sos_events'\);/g,
  `// TODO: Replace with WebSocket listener for SOS events
    // WebSocket will emit 'sos_alert' events`
);

content = content.replace(
  /final rosterRef = FirebaseDatabase\.instance\.ref\('roster_requests'\);/g,
  `// TODO: Replace with WebSocket listener for roster events
    // WebSocket will emit 'new_roster', 'roster_assigned' events`
);

content = content.replace(
  /final notificationsRef = FirebaseDatabase\.instance/g,
  `// TODO: Replace with OneSignal notifications
    // OneSignal handles push notifications automatically`
);

console.log('✅ Complete Firebase migration completed');
fs.writeFileSync(filePath, content);
console.log('💾 File saved');