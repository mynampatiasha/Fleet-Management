// Fix for roster endpoint - check correct collection based on user role
const fs = require('fs');
const path = require('path');

const rosterRouterPath = path.join(__dirname, 'abra_fleet_backend', 'routes', 'roster_router.js');

console.log('🔧 Fixing roster endpoint collection lookup...');

// Read the current file
let content = fs.readFileSync(rosterRouterPath, 'utf8');

// Find the problematic section and replace it
const oldCode = `    // Find user in admin_users collection
    const user = await db.collection('admin_users').findOne({ 
      $or: [
        { firebaseUid: req.user.uid },
        { email: req.user.email }
      ]
    });

    if (!user) {
      console.log('❌ MY-ROSTERS: User not found in admin_users collection');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }`;

const newCode = `    // Find user in correct collection based on role (set by auth middleware)
    let user = null;
    let userCollection = null;
    
    // Check the collection that auth middleware determined
    if (req.user.collectionName) {
      userCollection = req.user.collectionName;
      user = await db.collection(userCollection).findOne({ 
        $or: [
          { firebaseUid: req.user.uid },
          { email: req.user.email }
        ]
      });
    } else {
      // Fallback: search all possible collections
      const collections = ['customers', 'admin_users', 'users', 'clients', 'drivers'];
      
      for (const collectionName of collections) {
        user = await db.collection(collectionName).findOne({ 
          $or: [
            { firebaseUid: req.user.uid },
            { email: req.user.email }
          ]
        });
        
        if (user) {
          userCollection = collectionName;
          console.log(\`✅ MY-ROSTERS: User found in \${collectionName} collection\`);
          break;
        }
      }
    }

    if (!user) {
      console.log('❌ MY-ROSTERS: User not found in any collection');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(\`✅ MY-ROSTERS: User found in \${userCollection} collection\`);`;

// Replace the code
if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  
  // Write the updated file
  fs.writeFileSync(rosterRouterPath, content, 'utf8');
  
  console.log('✅ Fixed roster endpoint to check correct collection');
  console.log('✅ Now supports customers, admin_users, and other collections');
} else {
  console.log('❌ Could not find the exact code section to replace');
  console.log('❌ Manual fix may be required');
}