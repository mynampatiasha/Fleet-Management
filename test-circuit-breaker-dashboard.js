// Test Circuit Breaker Implementation in Admin Dashboard
// This script simulates backend failures to test the circuit breaker

const http = require('http');
const express = require('express');

console.log('🧪 Testing Circuit Breaker Implementation');
console.log('');

// Create a mock server that fails requests
const app = express();

let requestCount = 0;
const maxFailures = 5;

app.use((req, res, next) => {
  requestCount++;
  console.log(`📡 Request ${requestCount}: ${req.method} ${req.path}`);
  
  // Simulate failures for first 5 requests
  if (requestCount <= maxFailures) {
    console.log(`❌ Simulating failure ${requestCount}/${maxFailures}`);
    res.status(500).json({
      success: false,
      error: 'Simulated backend failure for testing'
    });
    return;
  }
  
  // After 5 failures, start succeeding
  console.log(`✅ Request ${requestCount} - Success!`);
  res.json({
    success: true,
    message: 'Backend is working again',
    data: {
      stats: {
        totalCustomers: 150,
        totalDrivers: 45,
        totalClients: 12,
        pendingRosters: 8,
        ongoingRosters: 23,
        activeTrips: 15,
        completedTripsToday: 67,
        cancelledTripsToday: 3
      }
    }
  });
});

const server = app.listen(3001, () => {
  console.log('🚀 Mock backend server running on port 3001');
  console.log('');
  console.log('📋 Test Instructions:');
  console.log('1. Start your Flutter app');
  console.log('2. Navigate to Admin Dashboard');
  console.log('3. The first 5 API calls will fail');
  console.log('4. After 5 failures, circuit breaker should open');
  console.log('5. You should see orange banner: "Backend Connection Issues"');
  console.log('6. Wait 2 minutes OR click "Retry Now" button');
  console.log('7. Subsequent requests should succeed');
  console.log('');
  console.log('🔍 Expected Behavior:');
  console.log('✅ No error dialogs after 5 failures');
  console.log('✅ Orange banner appears when circuit breaker opens');
  console.log('✅ "Retry Now" button resets circuit breaker');
  console.log('✅ Cached data shown during failures');
  console.log('✅ Auto-recovery after 2 minutes');
  console.log('');
  console.log('Press Ctrl+C to stop the test server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping test server...');
  server.close(() => {
    console.log('✅ Test server stopped');
    process.exit(0);
  });
});