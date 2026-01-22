// Test script to verify vehicle selection data structure
const { MongoClient } = require('mongodb');

async function testVehicleSelection() {
  console.log('\n' + '🧪' * 80);
  console.log('🧪 TESTING VEHICLE SELECTION DATA STRUCTURE');
  console.log('🧪' * 80);
  
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n✅ Connected to MongoDB');
    
    // Get a sample pending roster
    const sampleRoster = await db.collection('rosters').findOne({
      status: { $in: ['pending_assignment', 'pending', 'created'] },
      $and: [
        {
          $or: [
            { assignedVehicleId: { $exists: false } },
            { assignedVehicleId: null },
          ]
        }
      ]
    });
    
    if (!sampleRoster) {
      console.log('❌ No pending rosters found for testing');
      return;
    }
    
    console.log(`\n📋 Sample Roster: ${sampleRoster.customerName}`);
    console.log(`   ID: ${sampleRoster._id}`);
    console.log(`   Email: ${sampleRoster.customerEmail}`);
    
    // Import the assignment algorithm
    const { findBestMatches } = require('./abra_fleet_backend/utils/assignment_algorithm');
    
    console.log('\n🔍 Testing findBestMatches function...');
    
    const matches = await findBestMatches([sampleRoster], db);
    
    console.log('\n📊 MATCHES RESULT STRUCTURE:');
    console.log('   Type:', typeof matches);
    console.log('   Keys:', Object.keys(matches));
    console.log('   Best Match:', matches.bestMatch ? 'Found' : 'None');
    console.log('   Alternatives:', matches.alternatives?.length || 0);
    console.log('   All Options:', matches.allOptions?.length || 0);
    console.log('   Total Checked:', matches.totalChecked);
    console.log('   Compatible Count:', matches.compatibleCount);
    
    if (matches.allOptions && matches.allOptions.length > 0) {
      console.log('\n🚗 SAMPLE VEHICLE STRUCTURE:');
      const sampleVehicle = matches.allOptions[0];
      console.log('   Keys:', Object.keys(sampleVehicle));
      console.log('   Vehicle ID:', sampleVehicle.vehicleId);
      console.log('   Vehicle Reg:', sampleVehicle.vehicleReg);
      console.log('   Total Score:', sampleVehicle.totalScore);
      console.log('   Details Keys:', Object.keys(sampleVehicle.details || {}));
      console.log('   Breakdown Keys:', Object.keys(sampleVehicle.breakdown || {}));
    }
    
    // Test the API response structure
    console.log('\n📡 SIMULATING API RESPONSE STRUCTURE:');
    const apiResponse = {
      success: true,
      data: {
        bestMatch: matches.bestMatch,
        alternatives: matches.alternatives,
        allOptions: matches.allOptions,
        rejected: matches.rejected,
        stats: {
          totalChecked: matches.totalChecked,
          compatible: matches.compatibleCount,
          rejected: matches.rejected?.length || 0,
        }
      },
      timestamp: new Date().toISOString(),
    };
    
    console.log('   API Response Keys:', Object.keys(apiResponse));
    console.log('   API Data Keys:', Object.keys(apiResponse.data));
    console.log('   Frontend should access: result["data"]["allOptions"]');
    console.log('   Vehicle count in response:', apiResponse.data.allOptions?.length || 0);
    
    if (apiResponse.data.allOptions?.length > 0) {
      console.log('\n✅ SUCCESS: Vehicles found and properly structured');
      console.log(`   ${apiResponse.data.allOptions.length} vehicles available for selection`);
    } else {
      console.log('\n❌ ISSUE: No vehicles in response');
      console.log('   Check vehicle compatibility filters');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n' + '🧪' * 80 + '\n');
}

testVehicleSelection();