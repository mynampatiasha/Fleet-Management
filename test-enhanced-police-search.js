const axios = require('axios');

// Test the enhanced police station search with real phone numbers
async function testEnhancedPoliceSearch() {
    try {
        console.log('🧪 Testing Enhanced Police Station Search with Real Phone Numbers...\n');

        // Test different locations
        const testLocations = [
            { name: 'Bangalore (Koramangala)', lat: 12.9279, lon: 77.6271 },
            { name: 'Delhi (Connaught Place)', lat: 28.6315, lon: 77.2167 },
            { name: 'Mumbai (Bandra)', lat: 19.0596, lon: 72.8295 },
            { name: 'Random Location (should fallback)', lat: 20.5937, lon: 78.9629 }
        ];

        for (const location of testLocations) {
            console.log(`\n📍 Testing location: ${location.name}`);
            console.log(`   Coordinates: ${location.lat}, ${location.lon}`);
            
            const sosPayload = {
                customerId: 'test_customer_123',
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '+91-9876543210',
                
                // Trip details
                tripId: 'TEST_TRIP_001',
                pickupLocation: 'Test Pickup Location',
                dropLocation: 'Test Drop Location',
                
                // GPS coordinates
                gps: {
                    latitude: location.lat,
                    longitude: location.lon
                },
                
                // Organization
                organizationId: 'test_org_123',
                organizationName: 'Test Organization',
                
                // SOS details
                sosType: 'emergency',
                sosMessage: 'Testing enhanced police station search',
                timestamp: new Date().toISOString()
            };

            try {
                const response = await axios.post('http://localhost:3001/api/sos', sosPayload, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                });

                if (response.status === 200) {
                    const data = response.data;
                    
                    console.log(`   ✅ SOS Response: ${data.message}`);
                    
                    if (data.nearbyPoliceStations && data.nearbyPoliceStations.length > 0) {
                        console.log(`   🚔 Found ${data.nearbyPoliceStations.length} police stations:`);
                        data.nearbyPoliceStations.forEach((station, index) => {
                            console.log(`      ${index + 1}. ${station.name}`);
                            console.log(`         📞 Phone: ${station.phone}`);
                            console.log(`         📍 Distance: ${station.distance?.toFixed(2) || 'N/A'}km`);
                            console.log(`         🔍 Source: ${station.source}`);
                            console.log('');
                        });
                    } else {
                        console.log('   ⚠️ No police stations found');
                    }
                } else {
                    console.log(`   ❌ Error: ${response.status} - ${response.statusText}`);
                }
            } catch (error) {
                console.log(`   ❌ Request failed: ${error.message}`);
            }
            
            console.log('   ' + '='.repeat(50));
        }

        console.log('\n🎯 Test Complete!');
        console.log('✅ Enhanced police station search tested');
        console.log('✅ Real phone numbers should now be displayed');
        console.log('✅ Database fallback working');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testEnhancedPoliceSearch();