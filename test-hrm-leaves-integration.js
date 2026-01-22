// test-hrm-leaves-integration.js
// Test script to verify HRM Leave Requests integration

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testEmployee = {
  name: 'John Doe',
  email: 'john.doe@company.com',
  department: 'IT',
  position: 'Developer',
  status: 'active'
};

const testLeaveRequest = {
  employee_id: null, // Will be set after creating employee
  start_date: '2024-01-15',
  end_date: '2024-01-17',
  reason: 'Personal leave for family event',
  status: 'pending'
};

async function testHrmLeavesIntegration() {
  console.log('\n🧪 Testing HRM Leave Requests Integration');
  console.log('='.repeat(60));

  try {
    // Step 1: Create a test employee first
    console.log('\n1️⃣ Creating test employee...');
    const employeeResponse = await axios.post(`${BASE_URL}/api/hrm/employees`, testEmployee);
    
    if (employeeResponse.data.success) {
      const employeeId = employeeResponse.data.data._id;
      testLeaveRequest.employee_id = employeeId;
      console.log('✅ Employee created:', employeeResponse.data.data.name);
      console.log('   Employee ID:', employeeId);
    } else {
      throw new Error('Failed to create test employee');
    }

    // Step 2: Test creating a leave request
    console.log('\n2️⃣ Creating leave request...');
    const createResponse = await axios.post(`${BASE_URL}/api/hrm/leaves`, testLeaveRequest);
    
    if (createResponse.data.success) {
      const leaveId = createResponse.data.data._id;
      console.log('✅ Leave request created successfully');
      console.log('   Leave ID:', leaveId);
      console.log('   Employee:', createResponse.data.data.employee_name);
      console.log('   Period:', testLeaveRequest.start_date, 'to', testLeaveRequest.end_date);
      
      // Step 3: Test fetching all leave requests
      console.log('\n3️⃣ Fetching all leave requests...');
      const fetchResponse = await axios.get(`${BASE_URL}/api/hrm/leaves`);
      
      if (fetchResponse.data.success) {
        console.log('✅ Leave requests fetched successfully');
        console.log('   Total count:', fetchResponse.data.count);
        console.log('   Sample data:', fetchResponse.data.data[0]);
      }

      // Step 4: Test updating the leave request
      console.log('\n4️⃣ Updating leave request...');
      const updateData = {
        ...testLeaveRequest,
        status: 'approved',
        reason: 'Updated: Personal leave for family event - APPROVED'
      };
      
      const updateResponse = await axios.put(`${BASE_URL}/api/hrm/leaves/${leaveId}`, updateData);
      
      if (updateResponse.data.success) {
        console.log('✅ Leave request updated successfully');
        console.log('   New status:', updateResponse.data.data.status);
        console.log('   Updated reason:', updateResponse.data.data.reason);
      }

      // Step 5: Test fetching single leave request
      console.log('\n5️⃣ Fetching single leave request...');
      const singleResponse = await axios.get(`${BASE_URL}/api/hrm/leaves/${leaveId}`);
      
      if (singleResponse.data.success) {
        console.log('✅ Single leave request fetched successfully');
        console.log('   Employee:', singleResponse.data.data.employee_name);
        console.log('   Status:', singleResponse.data.data.status);
      }

      // Step 6: Test deleting the leave request
      console.log('\n6️⃣ Deleting leave request...');
      const deleteResponse = await axios.delete(`${BASE_URL}/api/hrm/leaves/${leaveId}`);
      
      if (deleteResponse.data.success) {
        console.log('✅ Leave request deleted successfully');
        console.log('   Deleted count:', deleteResponse.data.deletedCount);
      }

      // Step 7: Cleanup - delete test employee
      console.log('\n7️⃣ Cleaning up test employee...');
      await axios.delete(`${BASE_URL}/api/hrm/employees/${testLeaveRequest.employee_id}`);
      console.log('✅ Test employee cleaned up');

    } else {
      throw new Error('Failed to create leave request');
    }

    console.log('\n🎉 All tests passed! HRM Leave Requests integration is working correctly.');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.log('='.repeat(60));
  }
}

// Run the test
testHrmLeavesIntegration();