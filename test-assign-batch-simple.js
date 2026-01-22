// Simple test script to verify the assign-batch endpoint fix
async function testAssignBatch() {
  try {
    console.log('🧪 Testing assign-batch endpoint...');
    
    // Test data - using the same data from the error logs
    const testData = {
      vehicleId: '694a7cddc1882931f34d491f', // VH234588 - KA18FG5678 with Rajesh Kumar
      rosterIds: [
        '694a8a867dad313c6ad8b976', // Priya Sharma
        '694a8a867dad313c6ad8b97d', // Ravi Desai
        '694a8a867dad313c6ad8b97c'  // Naveen Menon
      ],
      routeDetails: {
        optimized: true,
        totalDistance: 15.2,
        estimatedTime: 45
      }
    };
    
    console.log('📦 Test data:', JSON.stringify(testData, null, 2));
    
    // Make the API call without authentication first to see if endpoint exists
    const response = await fetch('http://localhost:3001/api/roster/admin/assign-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 401) {
      console.log('✅ SUCCESS: Endpoint exists (401 = needs auth, which is expected)');
    } else if (response.status === 404) {
      console.log('❌ FAILED: Endpoint not found (404)');
    } else {
      console.log(`ℹ️  Endpoint responded with status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssignBatch();