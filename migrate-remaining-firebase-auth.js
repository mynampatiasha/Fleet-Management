#!/usr/bin/env node

/**
 * FIREBASE AUTH TO JWT MIGRATION - BATCH 2
 * Migrates remaining files with FirebaseAuth.instance usages to JWT with SharedPreferences
 * 
 * Target: Migrate 12+ files to reach 90%+ migration rate
 * Current: 64.1% (25/39 files)
 * Goal: 90%+ (35+/39 files)
 */

const fs = require('fs');
const path = require('path');

// Migration statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  filesSkipped: 0,
  filesFailed: 0,
  totalReplacements: 0,
};

// Files to migrate with their specific patterns
const filesToMigrate = [
  {
    path: 'abra_fleet/lib/core/services/real_time_fleet_service.dart',
    name: 'real_time_fleet_service.dart',
    priority: 1,
    usages: 12,
  },
  {
    path: 'abra_fleet/lib/features/notifications/presentation/screens/notifications_screen.dart',
    name: 'notifications_screen.dart',
    priority: 2,
    usages: 5,
  },
  {
    path: 'abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart',
    name: 'client_admin_dashboard_screen.dart',
    priority: 3,
    usages: 3,
  },
  {
    path: 'abra_fleet/lib/core/services/trip_notification_service.dart',
    name: 'trip_notification_service.dart',
    priority: 4,
    usages: 3,
  },
  {
    path: 'abra_fleet/lib/features/client/client_reports_analytics_enhanced.dart',
    name: 'client_reports_analytics_enhanced.dart',
    priority: 5,
    usages: 2,
  },
  {
    path: 'abra_fleet/lib/features/client/client_sos_alerts.dart',
    name: 'client_sos_alerts.dart',
    priority: 6,
    usages: 2,
  },
  {
    path: 'abra_fleet/lib/features/admin/user_management/presentation/screens/create_user_screen.dart',
    name: 'create_user_screen.dart',
    priority: 7,
    usages: 2,
  },
  {
    path: 'abra_fleet/lib/core/services/unified_auth_service.dart',
    name: 'unified_auth_service.dart',
    priority: 8,
    usages: 1,
  },
  {
    path: 'abra_fleet/lib/core/services/client_notification_service.dart',
    name: 'client_notification_service.dart',
    priority: 9,
    usages: 1,
  },
  {
    path: 'abra_fleet/lib/core/services/notification_service.dart',
    name: 'notification_service.dart',
    priority: 10,
    usages: 1,
  },
];

console.log('🚀 FIREBASE AUTH TO JWT MIGRATION - BATCH 2');
console.log('='.repeat(60));
console.log(`📋 Files to migrate: ${filesToMigrate.length}`);
console.log(`🎯 Target usages to remove: ${filesToMigrate.reduce((sum, f) => sum + f.usages, 0)}`);
console.log('='.repeat(60));
console.log('');

/**
 * Main migration patterns
 */
const migrationPatterns = [
  // Pattern 1: Simple user check with getIdToken
  {
    name: 'Simple user check with getIdToken',
    search: /final user = FirebaseAuth\.instance\.currentUser;\s*if \(user == null\) (?:return|throw Exception\([^)]+\));?\s*final token = await user\.getIdToken\(\);/g,
    replace: `final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null || token.isEmpty) {
      throw Exception('Not authenticated');
    }`,
  },
  
  // Pattern 2: User check with return
  {
    name: 'User check with return',
    search: /final user = FirebaseAuth\.instance\.currentUser;\s*if \(user == null\) return;/g,
    replace: `final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null || token.isEmpty) return;`,
  },
  
  // Pattern 3: User check with return value
  {
    name: 'User check with return value',
    search: /final user = FirebaseAuth\.instance\.currentUser;\s*if \(user == null\) return ([^;]+);/g,
    replace: (match, returnValue) => `final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null || token.isEmpty) return ${returnValue};`,
  },
  
  // Pattern 4: User check with print/debugPrint
  {
    name: 'User check with print statement',
    search: /final user = FirebaseAuth\.instance\.currentUser;\s*if \(user == null\) \{\s*(?:print|debugPrint)\([^)]+\);\s*return[^}]*\}/g,
    replace: `final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null || token.isEmpty) {
      debugPrint('❌ No JWT token found');
      return;
    }`,
  },
  
  // Pattern 5: currentUser with email check
  {
    name: 'currentUser with email check',
    search: /final currentUser = FirebaseAuth\.instance\.currentUser;\s*if \(currentUser\?\.email != null\)/g,
    replace: `final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null && token.isNotEmpty)`,
  },
  
  // Pattern 6: Simple currentUser assignment
  {
    name: 'Simple currentUser assignment',
    search: /final (?:currentUser|user) = FirebaseAuth\.instance\.currentUser;/g,
    replace: `// JWT token is retrieved when needed from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');`,
  },
  
  // Pattern 7: FirebaseAuth field declaration
  {
    name: 'FirebaseAuth field declaration',
    search: /final FirebaseAuth _(?:firebaseAuth|auth) = FirebaseAuth\.instance;/g,
    replace: `// Migrated to JWT authentication - no longer using FirebaseAuth`,
  },
];

/**
 * Add required imports if missing
 */
function ensureImports(content) {
  let modified = content;
  let added = [];
  
  // Check for SharedPreferences import
  if (!content.includes("import 'package:shared_preferences/shared_preferences.dart'")) {
    // Find the last import statement
    const importRegex = /import [^;]+;/g;
    const imports = content.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      modified = content.slice(0, lastImportIndex + lastImport.length) +
                "\nimport 'package:shared_preferences/shared_preferences.dart';" +
                content.slice(lastImportIndex + lastImport.length);
      added.push('shared_preferences');
    }
  }
  
  return { content: modified, added };
}

/**
 * Remove Firebase Auth import if no longer needed
 */
function removeFirebaseAuthImport(content) {
  // Only remove if there are no more FirebaseAuth usages
  if (!content.includes('FirebaseAuth.instance') && 
      !content.includes('FirebaseAuth ') &&
      !content.includes('firebase_auth.FirebaseAuth')) {
    return content.replace(/import 'package:firebase_auth\/firebase_auth\.dart';\n?/g, '');
  }
  return content;
}

/**
 * Migrate a single file
 */
function migrateFile(fileInfo) {
  const filePath = path.join(process.cwd(), fileInfo.path);
  
  console.log(`\n📄 Processing: ${fileInfo.name}`);
  console.log(`   Priority: ${fileInfo.priority} | Expected usages: ${fileInfo.usages}`);
  
  stats.filesProcessed++;
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${filePath}`);
      stats.filesSkipped++;
      return;
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Backup original file
    const backupPath = filePath + '.backup-batch2';
    fs.writeFileSync(backupPath, content, 'utf8');
    
    // Count initial FirebaseAuth.instance usages
    const initialCount = (content.match(/FirebaseAuth\.instance/g) || []).length;
    console.log(`   🔍 Found ${initialCount} FirebaseAuth.instance usages`);
    
    if (initialCount === 0) {
      console.log(`   ✅ Already migrated - skipping`);
      stats.filesSkipped++;
      return;
    }
    
    // Apply migration patterns
    let replacements = 0;
    migrationPatterns.forEach(pattern => {
      const matches = content.match(pattern.search);
      if (matches) {
        content = content.replace(pattern.search, pattern.replace);
        replacements += matches.length;
        console.log(`   ✓ Applied: ${pattern.name} (${matches.length} times)`);
      }
    });
    
    // Ensure required imports
    const { content: contentWithImports, added } = ensureImports(content);
    content = contentWithImports;
    if (added.length > 0) {
      console.log(`   ✓ Added imports: ${added.join(', ')}`);
    }
    
    // Remove Firebase Auth import if no longer needed
    const contentWithoutFirebaseImport = removeFirebaseAuthImport(content);
    if (contentWithoutFirebaseImport !== content) {
      console.log(`   ✓ Removed Firebase Auth import`);
      content = contentWithoutFirebaseImport;
    }
    
    // Count remaining FirebaseAuth.instance usages
    const finalCount = (content.match(/FirebaseAuth\.instance/g) || []).length;
    const removed = initialCount - finalCount;
    
    if (content !== originalContent) {
      // Write modified content
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.totalReplacements += removed;
      
      console.log(`   ✅ Modified: ${removed}/${initialCount} usages removed`);
      if (finalCount > 0) {
        console.log(`   ⚠️  ${finalCount} usages remaining (may need manual review)`);
      }
    } else {
      console.log(`   ⚠️  No changes made`);
      stats.filesSkipped++;
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    stats.filesFailed++;
  }
}

/**
 * Main execution
 */
function main() {
  // Sort files by priority
  const sortedFiles = [...filesToMigrate].sort((a, b) => a.priority - b.priority);
  
  // Migrate each file
  sortedFiles.forEach(fileInfo => {
    migrateFile(fileInfo);
  });
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Files processed: ${stats.filesProcessed}`);
  console.log(`✅ Files modified: ${stats.filesModified}`);
  console.log(`⚠️  Files skipped: ${stats.filesSkipped}`);
  console.log(`❌ Files failed: ${stats.filesFailed}`);
  console.log(`🔄 Total replacements: ${stats.totalReplacements}`);
  console.log('='.repeat(60));
  
  const successRate = ((stats.filesModified / stats.filesProcessed) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%`);
  
  if (stats.filesModified > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: cd abra_fleet && flutter analyze');
    console.log('   2. Check for any remaining FirebaseAuth.instance usages');
    console.log('   3. Test the application thoroughly');
    console.log('   4. Review backup files (.backup-batch2) if needed');
  }
}

// Run migration
main();
