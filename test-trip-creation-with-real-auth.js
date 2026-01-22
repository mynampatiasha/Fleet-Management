// Test trip creation with real Firebase authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testTripCreationWithAuth() {
  try {
    console.log('🔍 Testing Trip Creation with Real Authentication');
    console.log('='.repeat(80));
    
    // Test with a Firebase token from the frontend logs
    // From the error logs, I can see a valid token being used
    const testToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY2NzM4MDgxLCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3NjY3NDEzNzUsImV4cCI6MTc2Njc0NDk3NSwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.FoXWkme-pB2zuEttKIBy_D8QPX8Ui0EMP77qa9w4aXki-1qLTi8F2KfOeZz3bVuyMCQP5UvmOoMajbR9aT79dH2LXAt9Hi_BJUPwMEwPxwlVO6LZKodPbwLOBooCATsJ4xf_kTrsRVpJjcsSHBGie6Px8rNo43oVQYWn2BG-HfH3Dw0XX90r1Qny27mXRvDs3h8-9AG7B9oUR2m3ALiJ9NOPigB02rQjLgb4WADr1LoUXLhLH3ZE9k6ktW6pFXRYWh_xFLAkmtZnqalMZii3AnZc9BPgqlxuVeF9g5RR-Bz2K26bPqFBuP5mg_V60DDqDgEzBk1bagq51WnlY56ajg';
    
    console.log('🔑 Using Firebase token from frontend logs...');
    
    // Test trip creation with real data
    const tripData = {
      vehicleId: '694ce98f6e04aa748dda86ff', // Toyota Innova from the logs
      startPoint: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Bangalore, Karnataka, India'
      },
      endPoint: {
        latitude: 13.0827,
        longitude: 80.2707,
        address: 'Chennai, Tamil Nadu, India'
      },
      distance: 350,
      scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      tripType: 'manual',
      notes: 'Test trip creation from debug script'
    };
    
    console.log('📋 Trip Data:');
    console.log('   Vehicle ID:', tripData.vehicleId);
    console.log('   From:', tripData.startPoint.address);
    console.log('   To:', tripData.endPoint.address);
    console.log('   Distance:', tripData.distance, 'km');
    console.log('   Customer:', tripData.customerName);
    
    console.log('\n🚀 Creating trip...');
    
    const response = await axios.post(`${BASE_URL}/api/trips/create`, tripData, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Trip Creation Successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS SUMMARY:');
      console.log('   Trip ID:', response.data.data.tripId);
      console.log('   Trip Number:', response.data.data.tripNumber);
      console.log('   Status:', response.data.data.status);
      console.log('   Driver:', response.data.data.driver.name);
      console.log('   Vehicle:', response.data.data.vehicle.number);
      console.log('   Notifications Sent:', response.data.data.notifications);
    }
    
  } catch (error) {
    console.error('❌ Trip Creation Failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data);
    
    if (error.response?.data?.error === 'Database connection error') {
      console.error('\n🔍 Database Connection Error Details:');
      console.error('   This suggests the MongoDB client or database is not properly initialized');
      console.error('   Check the backend logs for more details');
    }
  }
}

testTripCreationWithAuth();