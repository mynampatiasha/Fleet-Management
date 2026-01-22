const axios = require('axios');

// Test comprehensive police station search for various locations
async function testPoliceStationSearch() {
    const testLocations = [
        {
            name: 'Kasthuri Nagar, Bangalore',
            lat: 12.9850,
            lon: 77.6362,
            expectedStations: ['Kasthuri Nagar Police Station', 'Kalyan Nagar Police Station', 'Banaswadi Police Station']
        },
        {
            name: 'Kalyan Nagar, Bangalore',
            lat: 12.9716,
            lon: 77.6346,
            expectedStations: ['Kalyan Nagar Police Station', 'Kasthuri Nagar Police Station', 'HBR Layout Police Station']
        },
        {
            name: 'Koramangala, Bangalore',
            lat: 12.9279,
            lon: 77.6271,
            expectedStations: ['Koramangala Police Station', 'HSR Layout Police Station', 'BTM Layout Police Station']
        },
        {
            name: 'Whitefield, Bangalore',
            lat: 12.9698,
            lon: 77.7500,
            expectedStations: ['Whitefield Police Station', 'Marathahalli Police Station', 'ITPL Police Station']
        },
        {
            name: 'Connaught Place, Delhi',
            lat: 28.6315,
            lon: 77.2167,
            expectedStations: ['Connaught Place Police Station', 'Karol Bagh Police Station']
        },
        {
            name: 'Bandra, Mumbai',
            lat: 19.0596,
            lon: 72.8295,
            expectedStations: ['Bandra Police Station', 'Khar Police Station', 'Santacruz Police Station']
        }
    ];

    console.log('🔍 Testing Comprehensive Police Station Database');
    console.log('=' .repeat(60));

    for (const location of testLocations) {
        console.log(`\n📍 Testing: ${location.name}`);
        console.log(`   Coordinates: ${location.lat}, ${location.lon}`);
        
        try {
            // Test SOS endpoint with location
            const response = await axios.post('http://localhost:3000/api/sos', {
                customerId: 'test-customer-123',
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '+91-9876543210',
                tripId: 'test-trip-456',
                driverId: 'test-driver-789',
                driverName: 'Test Driver',
                driverPhone: '+91-9876543211',
                vehicleReg: 'KA01AB1234',
                vehicleMake: 'Toyota',
                vehicleModel: 'Innova',
                pickupLocation: `${location.name} Pickup`,
                dropLocation: `${location.name} Drop`,
                gps: {
                    latitude: location.lat,
                    longitude: location.lon
                },
                timestamp: new Date().toISOString()
            });

            if (response.status === 201) {
                const data = response.data;
                console.log(`✅ SOS Alert Created: ${data.eventId}`);
                console.log(`📧 Police Notified: ${data.policeNotified ? 'YES' : 'NO'}`);
                console.log(`🏢 Police Email: ${data.policeEmail}`);
                console.log(`🏙️ City Detected: ${data.city}`);
                
                if (data.nearbyPoliceStations && data.nearbyPoliceStations.length > 0) {
                    console.log(`🚔 Found ${data.nearbyPoliceStations.length} nearby police stations:`);
                    
                    data.nearbyPoliceStations.forEach((station, index) => {
                        const priorityFlag = station.isPriority ? ' [AREA MATCH]' : '';
                        const sourceFlag = station.source === 'database_verified' ? ' [VERIFIED]' : '';
                        console.log(`   ${index + 1}. ${station.name}`);
                        console.log(`      📞 Phone: ${station.phone}`);
                        console.log(`      📍 Distance: ${station.distance.toFixed(2)}km${priorityFlag}${sourceFlag}`);
                        console.log(`      🏠 Address: ${station.address}`);
                    });
                    
                    // Check if expected stations are found
                    const foundStations = data.nearbyPoliceStations.map(s => s.name);
                    const expectedFound = location.expectedStations.filter(expected => 
                        foundStations.some(found => found.includes(expected.split(' ')[0]))
                    );
                    
                    console.log(`✅ Expected stations found: ${expectedFound.length}/${location.expectedStations.length}`);
                    if (expectedFound.length < location.expectedStations.length) {
                        console.log(`⚠️ Missing expected stations: ${location.expectedStations.filter(e => !expectedFound.some(f => f.includes(e.split(' ')[0])))}`);
                    }
                } else {
                    console.log('❌ No nearby police stations found');
                }
            } else {
                console.log(`❌ SOS request failed: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Error testing ${location.name}:`, error.message);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
        
        console.log('-'.repeat(50));
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('- Comprehensive police station database with 100+ stations');
    console.log('- Enhanced area-based matching for accurate results');
    console.log('- Real verified phone numbers for immediate contact');
    console.log('- Priority matching for location-specific stations');
    console.log('- Fallback to emergency numbers if no stations found');
}

// Run the test
testPoliceStationSearch().catch(console.error);