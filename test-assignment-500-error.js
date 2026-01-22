// Test script to debug the 500 error in assignment endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAssignmentEndpoints() {
  console.log('🔍 TESTING ASSIGNMENT ENDPOINTS FOR 500 ERROR');
  console.log('═'.repeat(80));
  
  try {
    // Test 1: Health check
    console.log('\n📡 Test 1: Health Check');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);
    
    // Test 2: Test single assignment endpoint (the one causing 500 error)
    console.log('\n📡 Test 2: Single Assignment Endpoint (POST /api/assignment/assign)');
    try {
      const assignResponse = await axios.post(`${BASE_URL}/api/assignment/assign`, {
        rosterId: '507f1f77bcf86cd799439011',
        vehicleId: '507f1f77bcf86cd799439013'
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Single assignment response:', assignResponse.data);
    } catch (error) {
      console.log('❌ Single assignment error:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔍 500 ERROR DETAILS:');
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        console.log('   Headers:', error.response.headers);
      }
    }
    
    // Test 3: Test group assignment endpoint
    console.log('\n📡 Test 3: Group Assignment Endpoint (POST /api/assignment/assign-group)');
    try {
      const groupResponse = await axios.post(`${BASE_URL}/api/assignment/assign-group`, {
        rosterIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        vehicleId: '507f1f77bcf86cd799439013'
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Group assignment response:', groupResponse.data);
    } catch (error) {
      console.log('❌ Group assignment error:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔍 500 ERROR DETAILS:');
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        console.log('   Headers:', error.response.headers);
      }
    }
    
    // Test 4: Check if endpoints exist (HEAD requests)
    console.log('\n📡 Test 4: Endpoint Existence Check');
    
    try {
      const headAssign = await axios.head(`${BASE_URL}/api/assignment/assign`);
      console.log('✅ /api/assignment/assign exists:', headAssign.status);
    } catch (error) {
      console.log('❌ /api/assignment/assign:', error.response?.status || 'Not reachable');
    }
    
    try {
      const headGroup = await axios.head(`${BASE_URL}/api/assignment/assign-group`);
      console.log('✅ /api/assignment/assign-group exists:', headGroup.status);
    } catch (error) {
      console.log('❌ /api/assignment/assign-group:', error.response?.status || 'Not reachable');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('🏁 Tests completed');
}

testAssignmentEndpoints();