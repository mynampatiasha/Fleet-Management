// Test SOS endpoint with sample data
const axios = require('axios');

async function testSOS() {
  try {
    console.log('🚨 Testing SOS endpoint...\n');

    const sosPayload = {
      // Customer fields
      customerId: 'test-customer-123',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91-9876543210',
      
      // Trip fields (no active trip scenario)
      tripId: 'no_active_trip',
      rosterId: 'no_active_trip',
      
      // Driver fields (no active trip scenario)
      driverId: 'no_driver',
      driverName: 'N/A',
      driverPhone: 'N/A',
      
      // Vehicle fields (no active trip scenario)
      vehicleReg: 'N/A',
      vehicleMake: 'N/A',
      vehicleModel: 'N/A',
      
      // Route fields (no active trip scenario)
      pickupLocation: 'N/A',
      dropLocation: 'N/A',
      
      // Location fields
      gps: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
      adminNotes: ''
    };

    const response = await axios.post('http://localhost:3001/api/sos', sosPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SOS Response Status:', response.status);
    console.log('✅ SOS Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201) {
      console.log('\n🎉 SOS endpoint is working correctly!');
      console.log('📧 Police notified:', response.data.policeNotified);
      console.log('🆔 Event ID:', response.data.eventId);
    }

  } catch (error) {
    console.error('❌ SOS Test Failed:', error.response?.data || error.message);
  }
}

testSOS();