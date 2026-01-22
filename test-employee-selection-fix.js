// test-employee-selection-fix.js
// Test script to verify employee selection fix for TMS

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testEmployeeAPI() {
  console.log('\n🔍 Testing Employee API for TMS Fix');
  console.log('='.repeat(60));
  
  try {
    // Test without auth first to see the structure
    console.log('\n1. Testing employee API endpoint...');
    
    const response = await axios.get(`${API_BASE}/employee-management/employees`, {
      params: { limit: 5 },
      validateStatus: () => true // Don't throw on error status
    });
    
    console.log('Status:', response.status);
    console.log('Response keys:', Object.keys(response.data));
    
    if (response.data.success === false) {
      console.log('❌ API Error (expected without auth):', response.data.message);
      console.log('\n2. This confirms the API endpoint exists');
      console.log('   The 401/403 error is expected without authentication');
      console.log('   The fix should work when called from authenticated Flutter app');
    } else if (response.data.data) {
      console.log('✅ API Response received');
      console.log('Data type:', Array.isArray(response.data.data) ? 'Array' : typeof response.data.data);
      console.log('Data length:', response.data.data.length);
      
      if (response.data.data.length > 0) {
        const firstEmployee = response.data.data[0];
        console.log('\n📋 First Employee Structure:');
        console.log('   Keys:', Object.keys(firstEmployee));
        console.log('   _id:', firstEmployee._id, '(', typeof firstEmployee._id, ')');
        console.log('   id:', firstEmployee.id, '(', typeof firstEmployee.id, ')');
        console.log('   name_parson:', firstEmployee.name_parson);
        console.log('   email:', firstEmployee.email);
        
        if (firstEmployee.id) {
          console.log('✅ ID field is now present - fix should work!');
        } else {
          console.log('❌ ID field still missing - need to check backend transformation');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Backend is not running on port 3001');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Summary:');
  console.log('   - Backend API endpoint: /api/employee-management/employees');
  console.log('   - Expected: Each employee should have both _id and id fields');
  console.log('   - Flutter fix: Uses id field for employee selection');
  console.log('   - Test from Flutter app to verify complete fix');
}

testEmployeeAPI();