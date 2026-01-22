// fix-existing-user-roles.js
// Script to fix existing users who have wrong roles in MongoDB

const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "abra-fleet-management",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5+5Q5Q5Q5Q5Q5\n-----END PRIVATE KEY-----\n",
      clientEmail: "firebase-adminsdk-xxxxx@abra-fleet-management.iam.gserviceaccount.com"
    }),
    databaseURL: "https://abra-fleet-management-default-rtdb.firebaseio.com"
  });
}

async function fixExistingUserRoles() {
  console.log('\n🔧 FIXING EXISTING USER ROLES');
  console.log('='.repeat(80));
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    // Get all users from Firestore (source of truth for roles)
    console.log('1️⃣ Fetching users from Firestore...');
    const firestoreUsers = await admin.firestore().collection('users').get();
    console.log(`   Found ${firestoreUsers.size} users in Firestore`);
    
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    
    console.log('\n2️⃣ Processing users...');
    console.log('-'.repeat(50));
    
    for (const doc of firestoreUsers.docs) {
      const firestoreData = doc.data();
      const email = firestoreData.email;
      const firestoreRole = firestoreData.role;
      const name = firestoreData.name;
      
      if (!email || !firestoreRole) {
        console.log(`   ⚠️  Skipping ${email || 'unknown'} - missing email or role`);
        skipped++;
        continue;
      }
      
      try {
        // Find user in MongoDB
        const mongoUser = await db.collection('admin_users').findOne({ email });
        
        if (!mongoUser) {
          console.log(`   ➕ Creating new user in MongoDB: ${email} (${firestoreRole})`);
          
          // Create new user in MongoDB with correct role
          const newUser = {
            firebaseUid: doc.id,
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            role: firestoreRole,
            status: 'active',
            modules: [],
            permissions: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActive: new Date()
          };
          
          await db.collection('admin_users').insertOne(newUser);
          fixed++;
          
        } else if (mongoUser.role !== firestoreRole) {
          console.log(`   🔄 Updating ${email}: ${mongoUser.role} → ${firestoreRole}`);
          
          // Update role in MongoDB
          await db.collection('admin_users').updateOne(
            { _id: mongoUser._id },
            { 
              $set: { 
                role: firestoreRole,
                updatedAt: new Date()
              } 
            }
          );
          fixed++;
          
        } else {
          console.log(`   ✅ ${email} already has correct role: ${firestoreRole}`);
          skipped++;
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing ${email}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('\n3️⃣ Summary:');
    console.log('-'.repeat(50));
    console.log(`   ✅ Fixed: ${fixed} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users`);
    console.log(`   ❌ Errors: ${errors} users`);
    
    // Verify the fix
    console.log('\n4️⃣ Verification - Role Distribution After Fix:');
    console.log('-'.repeat(50));
    
    const roleStats = await db.collection('admin_users').aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    roleStats.forEach(stat => {
      console.log(`   ${stat._id || 'null'}: ${stat.count} users`);
    });
    
    console.log('\n✅ USER ROLE FIX COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await client.close();
  }
}

// Run the fix
fixExistingUserRoles().catch(console.error);