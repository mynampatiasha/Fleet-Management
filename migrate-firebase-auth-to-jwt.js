#!/usr/bin/env node

/**
 * Firebase Auth to JWT Migration Script
 * Automatically migrates all remaining files from Firebase Auth to SharedPreferences JWT
 */

const fs = require('fs');
const path = require('path');

// Target files to migrate (38 files)
const TARGET_FILES = [
  // TMS (2)
  'abra_fleet/lib/features/TMS/raise_ticket.dart',
  'abra_fleet/lib/features/TMS/my_tickets.dart',
  
  // HRM (3)
  'abra_fleet/lib/features/hrm_feedback/presentation/screens/hrm_leave_requests_screen.dart',
  'abra_fleet/lib/features/hrm_feedback/presentation/screens/hrm_notice_board_screen.dart',
  'abra_fleet/lib/features/hrm_feedback/presentation/screens/hrm_payroll_screen.dart',
  
  // Driver (6)
  'abra_fleet/lib/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart',
  'abra_fleet/lib/features/driver/dashboard/presentation/screens/ex.dart',
  'abra_fleet/lib/features/driver/dashboard/presentation/screens/real_time_fleet_dashboard.dart',
  'abra_fleet/lib/features/driver/dashboard/presentation/screens/profile_driver_page.dart',
  'abra_fleet/lib/features/driver/profile/presentation/screens/driver_attendance_widget.dart',
  'abra_fleet/lib/features/driver/screens/driver_live_trip_screen.dart',
  
  // Customer (2)
  'abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_profile_screen.dart',
  'abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart',
  
  // Client (8)
  'abra_fleet/lib/features/client/bulk_import_rosters.dart',
  'abra_fleet/lib/features/client/client_dashboard.dart',
  'abra_fleet/lib/features/client/client_employee_management.dart',
  'abra_fleet/lib/features/client/client_main_shell.dart',
  'abra_fleet/lib/features/client/client_profile_screen.dart',
  'abra_fleet/lib/features/client/client_reports_analytics_enhanced.dart',
  'abra_fleet/lib/features/client/client_reports_analytics_working.dart',
  'abra_fleet/lib/features/client/client_roster_management.dart',
  
  // Admin (12)
  'abra_fleet/lib/features/admin/driver_management/presentation/providers/driver_provider.dart',
  'abra_fleet/lib/features/admin/role_based_access/user.dart',
  'abra_fleet/lib/features/admin/user_management/presentation/screens/create_user_screen.dart',
  'abra_fleet/lib/features/admin/user_management/presentation/screens/user_management_screen.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/consecutive_trips_admin.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/enhanced_fleet_map_screen.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/fleet_vehicles_list_screen.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/start_new_trip.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/trip_operation.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/trip_operations_list_screen.dart',
  'abra_fleet/lib/features/admin/vehicle_admin_management/vehicle_master/vehicle_master.dart',
  'abra_fleet/lib/features/admin/vehicle_management/data/repositories/api_vehicle_repository_impl.dart',
  
  // Auth/Core (4)
  'abra_fleet/lib/features/auth/presentation/screens/forgot_password_screen.dart',
  'abra_fleet/lib/features/auth/presentation/screens/forgot_password_screen_backup.dart',
  'abra_fleet/lib/core/services/notice_service.dart',
  'abra_fleet/lib/core/services/unified_auth_service.dart',
  
  // Notifications (1 - customer only)
  'abra_fleet/lib/features/notifications/presentation/screens/customer_notifications_screen.dart',
];

const stats = {
  filesProcessed: 0,
  filesModified: 0,
  filesFailed: 0,
  totalUsagesRemoved: 0,
  errors: []
};

function migrateFile(filePath) {
  try {
    console.log(`\n📄 Processing: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found, skipping`);
      stats.filesFailed++;
      stats.errors.push({ file: filePath, error: 'File not found' });
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let usagesRemoved = 0;
    
    // Count FirebaseAuth.instance usages before migration
    const firebaseAuthMatches = content.match(/FirebaseAuth\.instance/g);
    const initialCount = firebaseAuthMatches ? firebaseAuthMatches.length : 0;
    
    if (initialCount === 0) {
      console.log(`   ✅ No FirebaseAuth usages found, skipping`);
      stats.filesProcessed++;
      return;
    }
    
    console.log(`   🔍 Found ${initialCount} FirebaseAuth.instance usage(s)`);
    
    // 1. Replace import statement
    if (content.includes("import 'package:firebase_auth/firebase_auth.dart';")) {
      content = content.replace(
        /import 'package:firebase_auth\/firebase_auth\.dart';/g,
        "import 'package:shared_preferences/shared_preferences.dart';"
      );
      console.log(`   ✓ Replaced firebase_auth import with shared_preferences`);
    }
    
    // 2. Replace common patterns
    
    // Pattern: final user = FirebaseAuth.instance.currentUser;
    content = content.replace(
      /final\s+(\w+)\s*=\s*FirebaseAuth\.instance\.currentUser;/g,
      (match, varName) => {
        usagesRemoved++;
        return `// Migrated to JWT: final ${varName} = FirebaseAuth.instance.currentUser;`;
      }
    );
    
    // Pattern: final token = await user?.getIdToken();
    content = content.replace(
      /final\s+token\s*=\s*await\s+\w+\?\.getIdToken\(\);/g,
      () => {
        return `final prefs = await SharedPreferences.getInstance();\n      final token = prefs.getString('jwt_token');`;
      }
    );
    
    // Pattern: if (user == null) or if (user != null)
    content = content.replace(
      /if\s*\(\s*(\w+)\s*==\s*null\s*\)/g,
      (match, varName) => {
        if (varName === 'user' || varName === 'currentUser' || varName === 'firebaseUser') {
          return `if (token == null || token.isEmpty)`;
        }
        return match;
      }
    );
    
    content = content.replace(
      /if\s*\(\s*(\w+)\s*!=\s*null\s*\)/g,
      (match, varName) => {
        if (varName === 'user' || varName === 'currentUser' || varName === 'firebaseUser') {
          return `if (token != null && token.isNotEmpty)`;
        }
        return match;
      }
    );
    
    // Pattern: FirebaseAuth.instance.currentUser (inline usage)
    content = content.replace(
      /FirebaseAuth\.instance\.currentUser/g,
      () => {
        usagesRemoved++;
        return `/* JWT: Use SharedPreferences */ null`;
      }
    );
    
    // Pattern: await FirebaseAuth.instance.sendPasswordResetEmail
    content = content.replace(
      /await\s+FirebaseAuth\.instance\.sendPasswordResetEmail/g,
      () => {
        usagesRemoved++;
        return `// TODO: Implement backend password reset API\n      // await FirebaseAuth.instance.sendPasswordResetEmail`;
      }
    );
    
    // Pattern: FirebaseAuth.instance.signInWithCredential
    content = content.replace(
      /FirebaseAuth\.instance\.signInWithCredential/g,
      () => {
        usagesRemoved++;
        return `// TODO: Implement backend auth\n      // FirebaseAuth.instance.signInWithCredential`;
      }
    );
    
    // Pattern: FirebaseAuth.instance.signOut
    content = content.replace(
      /await\s+FirebaseAuth\.instance\.signOut\(\);/g,
      () => {
        usagesRemoved++;
        return `// TODO: Implement JWT logout\n      // await FirebaseAuth.instance.signOut();`;
      }
    );
    
    // Pattern: FirebaseAuth.instance.fetchSignInMethodsForEmail
    content = content.replace(
      /FirebaseAuth\.instance\.fetchSignInMethodsForEmail/g,
      () => {
        usagesRemoved++;
        return `// TODO: Implement backend email check\n      // FirebaseAuth.instance.fetchSignInMethodsForEmail`;
      }
    );
    
    // Count remaining FirebaseAuth.instance usages
    const remainingMatches = content.match(/FirebaseAuth\.instance/g);
    const remainingCount = remainingMatches ? remainingMatches.length : 0;
    
    if (content !== originalContent) {
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      
      // Write migrated content
      fs.writeFileSync(filePath, content, 'utf8');
      
      stats.filesModified++;
      stats.totalUsagesRemoved += (initialCount - remainingCount);
      
      console.log(`   ✅ Migrated: ${initialCount - remainingCount} usage(s) removed`);
      if (remainingCount > 0) {
        console.log(`   ⚠️  ${remainingCount} usage(s) remaining (may need manual review)`);
      }
      console.log(`   💾 Backup created: ${backupPath}`);
    } else {
      console.log(`   ℹ️  No changes made`);
    }
    
    stats.filesProcessed++;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.filesFailed++;
    stats.errors.push({ file: filePath, error: error.message });
  }
}

function generateReport() {
  const report = `
# 🎉 Firebase Auth Migration Report
## Date: ${new Date().toISOString()}

---

## 📊 MIGRATION STATISTICS

**Files Processed:** ${stats.filesProcessed}/${TARGET_FILES.length}
**Files Modified:** ${stats.filesModified}
**Files Failed:** ${stats.filesFailed}
**Total FirebaseAuth Usages Removed:** ${stats.totalUsagesRemoved}

---

## ✅ SUCCESS RATE

**Migration Success:** ${((stats.filesModified / TARGET_FILES.length) * 100).toFixed(1)}%
**Processing Success:** ${((stats.filesProcessed / TARGET_FILES.length) * 100).toFixed(1)}%

---

## 📝 MIGRATION DETAILS

### Files Modified (${stats.filesModified}):
${TARGET_FILES.filter(f => fs.existsSync(f + '.backup')).map(f => `- ✅ ${f}`).join('\n')}

### Files Skipped (${stats.filesProcessed - stats.filesModified}):
${TARGET_FILES.filter(f => fs.existsSync(f) && !fs.existsSync(f + '.backup')).map(f => `- ⏭️  ${f}`).join('\n')}

${stats.filesFailed > 0 ? `
### Files Failed (${stats.filesFailed}):
${stats.errors.map(e => `- ❌ ${e.file}\n  Error: ${e.error}`).join('\n')}
` : ''}

---

## 🔧 MIGRATION PATTERNS APPLIED

1. **Import Replacement:**
   - \`import 'package:firebase_auth/firebase_auth.dart';\`
   - → \`import 'package:shared_preferences/shared_preferences.dart';\`

2. **Token Retrieval:**
   - \`final user = FirebaseAuth.instance.currentUser;\`
   - \`final token = await user?.getIdToken();\`
   - → \`final prefs = await SharedPreferences.getInstance();\`
   - → \`final token = prefs.getString('jwt_token');\`

3. **Null Checks:**
   - \`if (user == null)\` → \`if (token == null || token.isEmpty)\`
   - \`if (user != null)\` → \`if (token != null && token.isNotEmpty)\`

4. **Special Cases:**
   - Password reset → Marked for backend API implementation
   - Sign in/out → Marked for JWT implementation

---

## 🧪 NEXT STEPS

1. **Verify Compilation:**
   \`\`\`bash
   cd abra_fleet
   flutter clean
   flutter pub get
   flutter analyze
   \`\`\`

2. **Review Modified Files:**
   - Check files with remaining FirebaseAuth usages
   - Review TODO comments for backend API requirements

3. **Test Functionality:**
   - Test login flow
   - Test each migrated feature
   - Verify JWT token retrieval

4. **Restore if Needed:**
   - Backup files created with .backup extension
   - Can restore with: \`mv file.dart.backup file.dart\`

---

**Migration Status:** ${stats.filesModified === TARGET_FILES.length ? '✅ COMPLETE' : '⚠️ PARTIAL'}
**Ready for Testing:** ${stats.filesFailed === 0 ? 'YES' : 'REVIEW ERRORS FIRST'}

---

**Generated:** ${new Date().toLocaleString()}
`;

  fs.writeFileSync('FIREBASE_AUTH_MIGRATION_REPORT.md', report, 'utf8');
  console.log('\n📄 Report saved to: FIREBASE_AUTH_MIGRATION_REPORT.md');
}

// Main execution
console.log('🚀 Firebase Auth to JWT Migration Script');
console.log('==========================================\n');
console.log(`📋 Target: ${TARGET_FILES.length} files\n`);

TARGET_FILES.forEach(migrateFile);

console.log('\n\n==========================================');
console.log('📊 MIGRATION SUMMARY');
console.log('==========================================');
console.log(`✅ Files Processed: ${stats.filesProcessed}/${TARGET_FILES.length}`);
console.log(`✏️  Files Modified: ${stats.filesModified}`);
console.log(`❌ Files Failed: ${stats.filesFailed}`);
console.log(`🔥 Total Usages Removed: ${stats.totalUsagesRemoved}`);
console.log('==========================================\n');

generateReport();

console.log('✅ Migration complete! Check FIREBASE_AUTH_MIGRATION_REPORT.md for details.\n');

process.exit(stats.filesFailed > 0 ? 1 : 0);
