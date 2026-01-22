const fs = require('fs');
const path = require('path');

/**
 * Script to integrate Firebase UID middleware into existing route files
 */

const routeFiles = [
  'abra_fleet_backend/routes/admin-drivers.js',
  'abra_fleet_backend/routes/employeeManagement.js', 
  'abra_fleet_backend/routes/client_router.js',
  'abra_fleet_backend/routes/userManagement.js',
  'abra_fleet_backend/routes/auth.js'
];

const middlewareImport = `const firebaseUserMiddleware = require('../middleware/firebase_user_middleware');`;

function integrateMiddleware() {
  console.log('🔧 Integrating Firebase UID middleware into route files...\n');

  routeFiles.forEach(filePath => {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`);
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if middleware is already imported
      if (content.includes('firebase_user_middleware')) {
        console.log(`✅ ${filePath} - Middleware already integrated`);
        return;
      }

      // Add import at the top (after other requires)
      const requireRegex = /(const .+ = require\(.+\);?\n)+/;
      const match = content.match(requireRegex);
      
      if (match) {
        const insertPosition = match.index + match[0].length;
        content = content.slice(0, insertPosition) + 
                 middlewareImport + '\n' + 
                 content.slice(insertPosition);
      } else {
        // If no requires found, add at the beginning
        content = middlewareImport + '\n\n' + content;
      }

      // Add middleware initialization after database connection
      const dbInitRegex = /(app\.locals\.db = db|req\.db = db|const db = )/;
      if (content.match(dbInitRegex)) {
        content = content.replace(
          dbInitRegex,
          '$&\n  firebaseUserMiddleware.init(db);'
        );
      }

      // Add middleware to POST routes (user creation)
      content = content.replace(
        /router\.post\(['"`]([^'"`]*user|employee|driver|client)[^'"`]*['"`],/g,
        `router.post('$1', firebaseUserMiddleware.ensureFirebaseUidOnCreate(), firebaseUserMiddleware.addFirebaseInfoToResponse(),`
      );

      // Add middleware to PUT/PATCH routes (user updates)
      content = content.replace(
        /router\.(put|patch)\(['"`]([^'"`]*user|employee|driver|client)[^'"`]*['"`],/g,
        `router.$1('$2', firebaseUserMiddleware.ensureFirebaseUidOnUpdate(), firebaseUserMiddleware.addFirebaseInfoToResponse(),`
      );

      // Add middleware to bulk import routes
      content = content.replace(
        /router\.post\(['"`]([^'"`]*bulk|import)[^'"`]*['"`],/g,
        `router.post('$1', firebaseUserMiddleware.ensureFirebaseUidOnBulk(), firebaseUserMiddleware.addFirebaseInfoToResponse(),`
      );

      // Write the modified content back
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath} - Middleware integrated successfully`);

    } catch (error) {
      console.error(`❌ ${filePath} - Integration failed:`, error.message);
    }
  });

  console.log('\n🎉 Firebase UID middleware integration completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: node fix-all-missing-firebase-uids.js');
  console.log('2. Restart your backend server');
  console.log('3. Test user creation/import functionality');
}

// Create a backup script
function createBackupScript() {
  const backupScript = `#!/bin/bash
# Backup script for route files before middleware integration

BACKUP_DIR="route_backups_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "Creating backups in $BACKUP_DIR..."

${routeFiles.map(file => `cp ${file} $BACKUP_DIR/$(basename ${file})`).join('\n')}

echo "✅ Backup completed in $BACKUP_DIR"
`;

  fs.writeFileSync('backup-routes.sh', backupScript);
  fs.chmodSync('backup-routes.sh', '755');
  console.log('📦 Backup script created: backup-routes.sh');
}

// Manual integration guide
function createManualIntegrationGuide() {
  const guide = `# Manual Firebase UID Middleware Integration Guide

If the automatic integration script doesn't work perfectly, follow these manual steps:

## 1. Add Import Statement
Add this import to the top of each route file:
\`\`\`javascript
const firebaseUserMiddleware = require('../middleware/firebase_user_middleware');
\`\`\`

## 2. Initialize Middleware
After database connection, add:
\`\`\`javascript
firebaseUserMiddleware.init(db);
\`\`\`

## 3. Add to User Creation Routes (POST)
\`\`\`javascript
// Before:
router.post('/create-user', async (req, res) => {

// After:
router.post('/create-user', 
  firebaseUserMiddleware.ensureFirebaseUidOnCreate(),
  firebaseUserMiddleware.addFirebaseInfoToResponse(),
  async (req, res) => {
\`\`\`

## 4. Add to User Update Routes (PUT/PATCH)
\`\`\`javascript
// Before:
router.put('/update-user/:id', async (req, res) => {

// After:
router.put('/update-user/:id',
  firebaseUserMiddleware.ensureFirebaseUidOnUpdate(),
  firebaseUserMiddleware.addFirebaseInfoToResponse(),
  async (req, res) => {
\`\`\`

## 5. Add to Bulk Import Routes
\`\`\`javascript
// Before:
router.post('/bulk-import', async (req, res) => {

// After:
router.post('/bulk-import',
  firebaseUserMiddleware.ensureFirebaseUidOnBulk(),
  firebaseUserMiddleware.addFirebaseInfoToResponse(),
  async (req, res) => {
\`\`\`

## Files to Update:
${routeFiles.map(file => `- ${file}`).join('\n')}

## Testing:
1. Create a new user via API
2. Check that firebaseUid is automatically generated
3. Verify Firebase Auth user is created
4. Test bulk import functionality
`;

  fs.writeFileSync('FIREBASE_UID_INTEGRATION_GUIDE.md', guide);
  console.log('📖 Manual integration guide created: FIREBASE_UID_INTEGRATION_GUIDE.md');
}

// Run the integration
if (require.main === module) {
  console.log('🚀 Starting Firebase UID middleware integration...\n');
  
  createBackupScript();
  createManualIntegrationGuide();
  integrateMiddleware();
  
  console.log('\n⚠️ IMPORTANT: Review the changes before committing!');
  console.log('💡 TIP: Run backup-routes.sh first to create backups');
}

module.exports = { integrateMiddleware };