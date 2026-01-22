// Test script for hierarchical permission system
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data for hierarchical permissions
const testPermissions = {
  'Customer Management': {
    'All Customers': {
      enabled: true,
      index: 16,
      description: 'View all customers'
    },
    'Pending Customers': {
      enabled: true,
      index: 17,
      description: 'Approve new customers'
    },
    'Pending Rosters': {
      enabled: false,
      index: 18,
      description: 'Review roster assignments'
    },
    'Approved Rosters': {
      enabled: true,
      index: 19,
      description: 'Manage approved rosters'
    }
  },
  'Client Management': {
    'Clients': {
      enabled: true,
      index: 21,
      description: 'Manage client accounts'
    },
    'Billing': {
      enabled: true,
      index: 22,
      description: 'Invoices and payments'
    },
    'Trips': {
      enabled: false,
      index: 23,
      description: 'Client trip management'
    }
  },
  'Vehicle Management': {
    'Vehicle Dashboard': {
      enabled: true,
      index: 1,
      description: 'Vehicle overview and stats'
    },
    'GPS Tracking': {
      enabled: false,
      index: 25,
      description: 'Real-time vehicle tracking'
    }
  }
};

async function testHierarchicalPermissions() {
  console.log('\n🧪 TESTING HIERARCHICAL PERMISSION SYSTEM');
  console.log('='.repeat(80));

  try {
    // Test 1: Get admin token (you'll need to login first)
    console.log('\n1️⃣  Testing Permission Update for HR Manager...');
    
    const response = await axios.put(
      `${API_BASE}/roles/hrManager/permissions`,
      {
        permissions: testPermissions,
        updatedAt: new Date().toISOString()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // You'll need to add your auth token here
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      }
    );

    console.log('✅ Permission update successful!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));

    // Test 2: Verify the permissions were saved
    console.log('\n2️⃣  Verifying saved permissions...');
    
    const getRolesResponse = await axios.get(`${API_BASE}/roles`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });

    const hrManagerRole = getRolesResponse.data.find(role => role.id === 'hrManager');
    if (hrManagerRole && hrManagerRole.customPermissions) {
      console.log('✅ Custom permissions found!');
      console.log('📋 Saved permissions:', JSON.stringify(hrManagerRole.customPermissions, null, 2));
    } else {
      console.log('❌ Custom permissions not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 To run this test:');
      console.log('1. Login as admin@abrafleet.com');
      console.log('2. Get your auth token from browser dev tools');
      console.log('3. Replace YOUR_TOKEN_HERE with your actual token');
      console.log('4. Run: node test-hierarchical-permissions.js');
    }
  }

  console.log('\n' + '='.repeat(80));
}

// Helper function to count enabled permissions
function countEnabledPermissions(permissions) {
  let count = 0;
  for (const module in permissions) {
    for (const subModule in permissions[module]) {
      if (permissions[module][subModule].enabled) {
        count++;
      }
    }
  }
  return count;
}

console.log('\n📊 TEST PERMISSION STRUCTURE:');
console.log('─'.repeat(50));
console.log(`Total Modules: ${Object.keys(testPermissions).length}`);

let totalSubModules = 0;
let enabledSubModules = 0;

for (const module in testPermissions) {
  const subModules = Object.keys(testPermissions[module]);
  totalSubModules += subModules.length;
  
  const enabled = subModules.filter(sub => testPermissions[module][sub].enabled);
  enabledSubModules += enabled.length;
  
  console.log(`${module}: ${enabled.length}/${subModules.length} enabled`);
}

console.log('─'.repeat(50));
console.log(`Total Sub-modules: ${totalSubModules}`);
console.log(`Enabled Sub-modules: ${enabledSubModules}`);
console.log('─'.repeat(50));

testHierarchicalPermissions();