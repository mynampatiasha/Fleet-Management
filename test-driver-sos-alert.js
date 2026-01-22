const axios = require('axios');

async function testDriverSOS() {
    console.log('🚨 Testing Driver SOS Alert...\n');

    const sosPayload = {
        customerId: '6789012345abcdef12345678', // Simulated driver ID
        customerName: 'Test Driver',
        customerEmail: 'testdriver@example.com',
        userType: 'driver',
        assignedDriverId: '6789012345abcdef12345678',
        gps: {
            latitude: 12.9850,
            longitude: 77.6362
        },
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
        adminNotes: ''
    };

    console.log('📤 Sending SOS payload:');
    console.log(JSON.stringify(sosPayload, null, 2));
    console.log('\n');

    try {
        const response = await axios.post('http://localhost:3001/api/sos', sosPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ ERROR!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testDriverSOS();
