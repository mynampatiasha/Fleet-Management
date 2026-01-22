// test-payroll-system.js
// Test script for HRM Payroll Management system

const http = require('http');
const https = require('https');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testPayrollSystem() {
  console.log('\n🧪 Testing HRM Payroll Management System');
  console.log('═'.repeat(80));
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`🔑 Using Token: ${TEST_TOKEN.substring(0, 20)}...`);
  console.log('═'.repeat(80));

  try {
    // Test 1: Get all payroll entries
    console.log('\n📋 Test 1: Get All Payroll Entries');
    console.log('─'.repeat(50));
    
    const payrollResponse = await makeRequest('GET', '/api/hrm/payroll');
    console.log(`Status: ${payrollResponse.statusCode}`);
    
    if (payrollResponse.statusCode === 200) {
      console.log(`✅ Found ${payrollResponse.data.count} payroll entries`);
      
      if (payrollResponse.data.data && payrollResponse.data.data.length > 0) {
        console.log('\n📊 Sample Payroll Entries:');
        payrollResponse.data.data.slice(0, 3).forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.employee_name} - ₹${entry.amount} - ${new Date(entry.pay_date).toLocaleDateString()}`);
        });
      }
    } else {
      console.log(`❌ Failed: ${JSON.stringify(payrollResponse.data, null, 2)}`);
    }

    // Test 2: Get employees for dropdown
    console.log('\n👥 Test 2: Get Employees for Dropdown');
    console.log('─'.repeat(50));
    
    const employeesResponse = await makeRequest('GET', '/api/hrm/employees?status=active');
    console.log(`Status: ${employeesResponse.statusCode}`);
    
    let testEmployeeId = null;
    if (employeesResponse.statusCode === 200) {
      console.log(`✅ Found ${employeesResponse.data.count || employeesResponse.data.data?.length || 0} active employees`);
      
      if (employeesResponse.data.data && employeesResponse.data.data.length > 0) {
        testEmployeeId = employeesResponse.data.data[0]._id;
        console.log('\n👤 Sample Employees:');
        employeesResponse.data.data.slice(0, 3).forEach((emp, index) => {
          console.log(`${index + 1}. ${emp.name} (${emp.email})`);
        });
      }
    } else {
      console.log(`❌ Failed: ${JSON.stringify(employeesResponse.data, null, 2)}`);
    }

    // Test 3: Create new payroll entry
    if (testEmployeeId) {
      console.log('\n💰 Test 3: Create New Payroll Entry');
      console.log('─'.repeat(50));
      
      const newPayrollData = {
        employee_id: testEmployeeId,
        amount: 75000.00,
        pay_date: new Date().toISOString(),
        comment: 'Test payroll entry from automated test'
      };
      
      const createResponse = await makeRequest('POST', '/api/hrm/payroll', newPayrollData);
      console.log(`Status: ${createResponse.statusCode}`);
      
      if (createResponse.statusCode === 201) {
        console.log('✅ Payroll entry created successfully');
        console.log(`📄 Entry ID: ${createResponse.data.data._id}`);
        console.log(`👤 Employee: ${createResponse.data.data.employee_name}`);
        console.log(`💵 Amount: ₹${createResponse.data.data.amount}`);
        
        const createdEntryId = createResponse.data.data._id;
        
        // Test 4: Update the created entry
        console.log('\n✏️  Test 4: Update Payroll Entry');
        console.log('─'.repeat(50));
        
        const updateData = {
          employee_id: testEmployeeId,
          amount: 80000.00,
          pay_date: new Date().toISOString(),
          comment: 'Updated test payroll entry'
        };
        
        const updateResponse = await makeRequest('PUT', `/api/hrm/payroll/${createdEntryId}`, updateData);
        console.log(`Status: ${updateResponse.statusCode}`);
        
        if (updateResponse.statusCode === 200) {
          console.log('✅ Payroll entry updated successfully');
          console.log(`💵 New Amount: ₹${updateResponse.data.data.amount}`);
        } else {
          console.log(`❌ Update failed: ${JSON.stringify(updateResponse.data, null, 2)}`);
        }
        
        // Test 5: Get single payroll entry
        console.log('\n🔍 Test 5: Get Single Payroll Entry');
        console.log('─'.repeat(50));
        
        const singleResponse = await makeRequest('GET', `/api/hrm/payroll/${createdEntryId}`);
        console.log(`Status: ${singleResponse.statusCode}`);
        
        if (singleResponse.statusCode === 200) {
          console.log('✅ Retrieved payroll entry successfully');
          console.log(`👤 Employee: ${singleResponse.data.data.employee_name}`);
          console.log(`💵 Amount: ₹${singleResponse.data.data.amount}`);
        } else {
          console.log(`❌ Retrieval failed: ${JSON.stringify(singleResponse.data, null, 2)}`);
        }
        
        // Test 6: Delete the created entry
        console.log('\n🗑️  Test 6: Delete Payroll Entry');
        console.log('─'.repeat(50));
        
        const deleteResponse = await makeRequest('DELETE', `/api/hrm/payroll/${createdEntryId}`);
        console.log(`Status: ${deleteResponse.statusCode}`);
        
        if (deleteResponse.statusCode === 200) {
          console.log('✅ Payroll entry deleted successfully');
        } else {
          console.log(`❌ Delete failed: ${JSON.stringify(deleteResponse.data, null, 2)}`);
        }
        
      } else {
        console.log(`❌ Create failed: ${JSON.stringify(createResponse.data, null, 2)}`);
      }
    }

    // Test 7: Get payroll statistics
    console.log('\n📊 Test 7: Get Payroll Statistics');
    console.log('─'.repeat(50));
    
    const statsResponse = await makeRequest('GET', '/api/hrm/payroll/stats/summary');
    console.log(`Status: ${statsResponse.statusCode}`);
    
    if (statsResponse.statusCode === 200) {
      console.log('✅ Retrieved payroll statistics successfully');
      const stats = statsResponse.data.data.summary;
      console.log(`💰 Total Amount: ₹${stats.totalAmount?.toFixed(2) || 0}`);
      console.log(`📄 Total Entries: ${stats.totalEntries || 0}`);
      console.log(`📊 Average Amount: ₹${stats.averageAmount?.toFixed(2) || 0}`);
    } else {
      console.log(`❌ Stats failed: ${JSON.stringify(statsResponse.data, null, 2)}`);
    }

    console.log('\n✅ All Payroll System Tests Completed!');
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.log('═'.repeat(80));
  }
}

// Run the tests
testPayrollSystem().catch(console.error);