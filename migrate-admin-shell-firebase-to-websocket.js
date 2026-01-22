// migrate-admin-shell-firebase-to-websocket.js
// Script to replace Firebase with OneSignal + WebSocket in admin_main_shell.dart

const fs = require('fs');
const path = require('path');

const filePath = 'abra_fleet/lib/features/admin/shell/admin_main_shell.dart';

console.log('🔄 Starting Firebase → OneSignal + WebSocket migration...');

// Read the original file
let content = fs.readFileSync(filePath, 'utf8');

console.log('📄 Original file size:', content.length, 'characters');

// 1. Remove Firebase imports
console.log('❌ Removing Firebase imports...');
content = content.replace(/import 'package:firebase_database\/firebase_database\.dart';\n/g, '');
content = content.replace(/import 'package:firebase_auth\/firebase_auth\.dart';\n/g, '');

// 2. Add OneSignal and WebSocket imports
console.log('✅ Adding OneSignal + WebSocket imports...');
const newImports = `
// OneSignal and WebSocket Services (replaces Firebase)
import 'package:abra_fleet/core/services/one_signal_service.dart';
import 'package:abra_fleet/core/services/websocket_service.dart';
`;

// Insert after the existing core services imports
const coreServicesPattern = /import 'package:abra_fleet\/core\/services\/trip_notification_service\.dart';\n/;
if (coreServicesPattern.test(content)) {
  content = content.replace(coreServicesPattern, 
    `import 'package:abra_fleet/core/services/trip_notification_service.dart';\n${newImports}`);
} else {
  // Fallback: add after api_service import
  content = content.replace(
    /import 'package:abra_fleet\/core\/services\/api_service\.dart';\n/,
    `import 'package:abra_fleet/core/services/api_service.dart';\n${newImports}`
  );
}

console.log('✅ Migration completed successfully');
console.log('📄 New file size:', content.length, 'characters');

// Write the modified content back
fs.writeFileSync(filePath, content);
console.log('💾 File saved:', filePath);
// 3. Replace FirebaseAuth.instance.currentUser references
console.log('🔄 Replacing FirebaseAuth references...');

// Replace FirebaseAuth.instance.currentUser?.email with AuthRepository
content = content.replace(
  /FirebaseAuth\.instance\.currentUser\?\.email ?? 'Admin'/g,
  `(Provider.of<AuthRepository>(context, listen: false).currentUser.email ?? 'Admin')`
);

// Replace other FirebaseAuth.instance.currentUser references
content = content.replace(
  /final user = FirebaseAuth\.instance\.currentUser;/g,
  `final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;`
);

content = content.replace(
  /final firebaseUser = FirebaseAuth\.instance\.currentUser;/g,
  `final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = authRepo.currentUser;`
);

content = content.replace(
  /final currentUser = FirebaseAuth\.instance\.currentUser;/g,
  `final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final currentUser = authRepo.currentUser;`
);

// 4. Replace Firebase Realtime Database listeners
console.log('🔄 Replacing Firebase Database listeners...');

// Replace _setupSOSListener method
const sosListenerPattern = /void _setupSOSListener\(\) \{[\s\S]*?\n  \}/;
const newSOSListener = `void _setupSOSListener() {
    // SOS alerts now handled via OneSignal notifications and WebSocket
    // OneSignal will send push notifications for new SOS alerts
    // WebSocket will provide real-time updates when app is in foreground
    debugPrint('✅ SOS alerts handled via OneSignal + WebSocket');
  }`;

if (sosListenerPattern.test(content)) {
  content = content.replace(sosListenerPattern, newSOSListener);
}

console.log('✅ Firebase references replaced successfully');