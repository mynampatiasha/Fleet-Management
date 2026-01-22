// Debug script to check what fields are available in roster documents
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugRosterFields() {
  console.log('🔍 DEBUGGING ROSTER FIELDS');
  console.log('='.repeat(50));
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('✅ Connected to MongoDB');
    
    // Get a sample pending roster
    console.log('\n📋 GETTING SAMPLE PENDING ROSTER...');
    const sampleRoster = await db.collection('rosters').findOne({
      status: { $in: ['pending_assignment', 'pending'] }
    });
    
    if (!sampleRoster) {
      console.log('❌ No pending roster found');
      return;
    }
    
    console.log(`\n📄 SAMPLE ROSTER (ID: ${sampleRoster._id})`);
    console.log('='.repeat(50));
    
    // Print all available fields
    console.log('🔍 ALL AVAILABLE FIELDS:');
    Object.keys(sampleRoster).forEach(key => {
      const value = sampleRoster[key];
      const type = typeof value;
      const preview = type === 'object' && value !== null ? 
        (Array.isArray(value) ? `[${value.length} items]` : '{object}') :
        (type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value);
      
      console.log(`   ${key}: ${preview} (${type})`);
    });
    
    // Check specific fields that might be missing
    console.log('\n🔍 CHECKING SPECIFIC FIELDS:');
    const fieldsToCheck = [
      'customerName', 'customerEmail', 'customerPhone', 'phone', 'phoneNumber',
      'employeeId', 'department', 'companyName', 'organization', 'organizationName',
      'address', 'employeeDetails', 'employeeData',
      'startDate', 'endDate', 'fromDate', 'toDate',
      'startTime', 'endTime', 'fromTime', 'toTime',
      'loginPickupAddress', 'logoutDropAddress', 'pickupLocation', 'dropLocation',
      'officeLocation', 'rosterType', 'weekdays', 'weeklyOffDays'
    ];
    
    fieldsToCheck.forEach(field => {
      const value = sampleRoster[field];
      const exists = value !== undefined && value !== null;
      const status = exists ? '✅' : '❌';
      const preview = exists ? 
        (typeof value === 'object' ? JSON.stringify(value) : value) : 
        'NOT FOUND';
      
      console.log(`   ${status} ${field}: ${preview}`);
    });
    
    // Check nested employeeDetails/employeeData
    if (sampleRoster.employeeDetails || sampleRoster.employeeData) {
      console.log('\n🔍 NESTED EMPLOYEE DATA:');
      const empData = sampleRoster.employeeDetails || sampleRoster.employeeData;
      Object.keys(empData).forEach(key => {
        console.log(`   employeeDetails.${key}: ${empData[key]}`);
      });
    }
    
    // Check locations object
    if (sampleRoster.locations) {
      console.log('\n🔍 LOCATIONS OBJECT:');
      console.log('   locations:', JSON.stringify(sampleRoster.locations, null, 2));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 SUMMARY:');
    console.log('='.repeat(50));
    
    // Identify missing critical fields
    const criticalFields = {
      'Customer Name': sampleRoster.customerName,
      'Customer Email': sampleRoster.customerEmail,
      'Customer Phone': sampleRoster.phone || sampleRoster.phoneNumber || sampleRoster.customerPhone,
      'Employee ID': sampleRoster.employeeId,
      'Department': sampleRoster.department,
      'Company': sampleRoster.companyName || sampleRoster.organization || sampleRoster.organizationName,
      'Address': sampleRoster.address,
      'Office Location': sampleRoster.officeLocation,
      'Pickup Location': sampleRoster.loginPickupAddress || sampleRoster.pickupLocation,
      'Drop Location': sampleRoster.logoutDropAddress || sampleRoster.dropLocation
    };
    
    console.log('📊 CRITICAL FIELDS STATUS:');
    Object.entries(criticalFields).forEach(([label, value]) => {
      const status = (value !== undefined && value !== null && value !== '') ? '✅' : '❌';
      console.log(`   ${status} ${label}: ${value || 'MISSING'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugRosterFields().catch(console.error);