// check-employee-firebase-uid.js
// Check if employees have firebaseUid for notifications

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkEmployeeFirebaseUids() {
  console.log('\n🔍 CHECKING EMPLOYEE FIREBASE UIDs');
  console.log('='.repeat(60));
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    
    const employeesCollection = db.collection('hr_employees');
    const employees = await employeesCollection.find({}).toArray();
    
    console.log(`📋 Found ${employees.length} employees`);
    console.log('-'.repeat(60));
    
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.name}`);
      console.log(`   Email: ${employee.email || 'Not set'}`);
      console.log(`   Firebase UID: ${employee.firebaseUid || '❌ Missing'}`);
      console.log(`   FCM Token: ${employee.fcmToken ? '✅ Present' : '❌ Missing'}`);
      console.log('');
    });
    
    const withFirebaseUid = employees.filter(emp => emp.firebaseUid);
    const withFcmToken = employees.filter(emp => emp.fcmToken);
    
    console.log('📊 SUMMARY:');
    console.log(`   Total employees: ${employees.length}`);
    console.log(`   With Firebase UID: ${withFirebaseUid.length}`);
    console.log(`   With FCM Token: ${withFcmToken.length}`);
    
    if (withFirebaseUid.length === 0) {
      console.log('\n⚠️  WARNING: No employees have Firebase UID!');
      console.log('   Firebase RTDB notifications will not work.');
      console.log('   MongoDB notifications will still work.');
      
      console.log('\n💡 TO FIX: Add firebaseUid to employees');
      console.log('   Example: db.hr_employees.updateOne(');
      console.log('     { _id: ObjectId("employee_id") },');
      console.log('     { $set: { firebaseUid: "firebase_user_id" } }');
      console.log('   )');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkEmployeeFirebaseUids();