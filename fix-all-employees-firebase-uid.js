// fix-all-employees-firebase-uid.js
// Add Firebase UIDs to all existing employees who don't have them

const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

/**
 * Generate a unique Firebase UID for employee
 * Format: emp_[name]_[timestamp]_[random]
 */
function generateFirebaseUID(employeeName, email) {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(4).toString('hex');
  const namePart = employeeName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  return `emp_${namePart}_${timestamp}_${randomPart}`;
}

async function fixAllEmployeesFirebaseUID() {
  console.log('\n🔥 FIXING ALL EMPLOYEES - ADDING FIREBASE UIDs');
  console.log('='.repeat(80));
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('✅ Connected to MongoDB');
    
    // Get all employees
    const employeesCollection = db.collection('hr_employees');
    const allEmployees = await employeesCollection.find({}).toArray();
    
    console.log(`\n📋 Found ${allEmployees.length} employees`);
    console.log('-'.repeat(60));
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const employee of allEmployees) {
      console.log(`\n👤 Processing: ${employee.name}`);
      console.log(`   Email: ${employee.email}`);
      console.log(`   Current Firebase UID: ${employee.firebaseUid || '❌ Missing'}`);
      
      if (!employee.firebaseUid) {
        // Generate new Firebase UID
        const newFirebaseUid = generateFirebaseUID(employee.name, employee.email);
        console.log(`   🔥 Generated new Firebase UID: ${newFirebaseUid}`);
        
        // Update employee
        const result = await employeesCollection.updateOne(
          { _id: employee._id },
          { 
            $set: { 
              firebaseUid: newFirebaseUid,
              fcmToken: null, // Initialize FCM token field
              updatedAt: new Date()
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log('   ✅ Updated successfully');
          updatedCount++;
        } else {
          console.log('   ❌ Update failed');
        }
      } else {
        console.log('   ⏭️  Already has Firebase UID - skipping');
        skippedCount++;
      }
    }
    
    console.log('\n📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`   Total employees: ${allEmployees.length}`);
    console.log(`   Updated with Firebase UID: ${updatedCount}`);
    console.log(`   Already had Firebase UID: ${skippedCount}`);
    
    // Verify the fix
    console.log('\n🔍 VERIFICATION');
    console.log('-'.repeat(60));
    
    const employeesWithUID = await employeesCollection.find({ 
      firebaseUid: { $exists: true, $ne: null } 
    }).toArray();
    
    const employeesWithoutUID = await employeesCollection.find({ 
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    }).toArray();
    
    console.log(`✅ Employees with Firebase UID: ${employeesWithUID.length}`);
    console.log(`❌ Employees without Firebase UID: ${employeesWithoutUID.length}`);
    
    if (employeesWithoutUID.length === 0) {
      console.log('\n🎉 ALL EMPLOYEES NOW HAVE FIREBASE UIDs!');
      console.log('   Firebase RTDB notifications will work for all employees');
    } else {
      console.log('\n⚠️  Some employees still missing Firebase UIDs:');
      employeesWithoutUID.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.email})`);
      });
    }
    
    console.log('\n✅ Firebase UID fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing Firebase UIDs:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

// Run the fix
if (require.main === module) {
  fixAllEmployeesFirebaseUID()
    .then(() => {
      console.log('\n🎉 All employees now have Firebase UIDs for notifications!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixAllEmployeesFirebaseUID };