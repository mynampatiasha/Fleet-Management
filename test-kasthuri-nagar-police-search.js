// Test script for enhanced police station search - Kasthuri Nagar area
const axios = require('axios');

// Test coordinates for Kasthuri Nagar, Bangalore
const testLocation = {
    latitude: 12.9850,
    longitude: 77.6362,
    address: 'Kasthuri Nagar, Bangalore, Karnataka, India'
};

console.log('🧪 Testing Enhanced Police Station Search for Kasthuri Nagar');
console.log('=' .repeat(60));
console.log(`📍 Test Location: ${testLocation.address}`);
console.log(`🗺️  Coordinates: ${testLocation.latitude}, ${testLocation.longitude}`);
console.log('=' .repeat(60));

async function testPoliceStationSearch() {
    try {
        // Test the SOS endpoint with Kasthuri Nagar location
        const sosPayload = {
            customerId: 'test_customer_kasthuri_nagar',
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '+91-9876543210',
            tripId: 'TEST_TRIP_001',
            driverId: 'test_driver',
            driverName: 'Test Driver',
            driverPhone: '+91-9876543211',
            vehicleReg: 'KA-01-AB-1234',
            vehicleMake: 'Tata',
            vehicleModel: 'Ace',
            pickupLocation: 'Kasthuri Nagar Main Road',
            dropLocation: 'Banaswadi Railway Station',
            gps: {
                latitude: testLocation.latitude,
                longitude: testLocation.longitude
            },
            timestamp: new Date().toISOString()
        };

        console.log('🚨 Sending SOS request...');
        
        const response = await axios.post('http://localhost:3001/api/sos', sosPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.status === 201) {
            console.log('✅ SOS request successful!');
            console.log('\n📊 Response Summary:');
            console.log(`   Event ID: ${response.data.eventId}`);
            console.log(`   Police Notified: ${response.data.policeNotified}`);
            console.log(`   Police Email: ${response.data.policeEmail}`);
            console.log(`   City Detected: ${response.data.city}`);
            
            const nearbyStations = response.data.nearbyPoliceStations || [];
            console.log(`   Nearby Stations Found: ${nearbyStations.length}`);
            
            if (nearbyStations.length > 0) {
                console.log('\n🚔 Nearby Police Stations:');
                console.log('-' .repeat(50));
                
                nearbyStations.forEach((station, index) => {
                    const priorityFlag = station.isPriority ? ' ⭐ [AREA MATCH]' : '';
                    console.log(`${index + 1}. ${station.name}${priorityFlag}`);
                    console.log(`   📞 Phone: ${station.phone}`);
                    console.log(`   📍 Distance: ${station.distance?.toFixed(2) || 'N/A'} km`);
                    console.log(`   🏢 Address: ${station.address}`);
                    console.log(`   🔍 Source: ${station.source}`);
                    console.log('');
                });
                
                // Check if Kasthuri Nagar Police Station is found
                const kasturiStation = nearbyStations.find(station => 
                    station.name.toLowerCase().includes('kasthuri nagar')
                );
                
                if (kasturiStation) {
                    console.log('🎯 SUCCESS: Kasthuri Nagar Police Station found!');
                    console.log(`   Name: ${kasturiStation.name}`);
                    console.log(`   Phone: ${kasturiStation.phone}`);
                    console.log(`   Distance: ${kasturiStation.distance?.toFixed(2)} km`);
                } else {
                    console.log('⚠️  Kasthuri Nagar Police Station not found, but other nearby stations available');
                }
                
                // Check for area-specific matches
                const areaMatches = nearbyStations.filter(station => station.isPriority);
                if (areaMatches.length > 0) {
                    console.log(`\n⭐ Area-specific matches found: ${areaMatches.length}`);
                    areaMatches.forEach(station => {
                        console.log(`   - ${station.name} (${station.phone})`);
                    });
                }
                
            } else {
                console.log('❌ No nearby police stations found');
            }
            
        } else {
            console.log(`❌ SOS request failed with status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Make sure the backend server is running:');
            console.error('   npm start (or node index.js) in abra_fleet_backend folder');
        }
    }
}

// Test different scenarios
async function runAllTests() {
    console.log('\n🧪 Test 1: Kasthuri Nagar Location');
    await testPoliceStationSearch();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🧪 Test 2: Nearby Area (Banaswadi)');
    
    // Test nearby area
    const banaswadi = {
        latitude: 12.9789,
        longitude: 77.6456,
        address: 'Banaswadi, Bangalore, Karnataka, India'
    };
    
    testLocation.latitude = banaswadi.latitude;
    testLocation.longitude = banaswadi.longitude;
    testLocation.address = banaswadi.address;
    
    await testPoliceStationSearch();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed!');
    console.log('\n📋 Expected Results:');
    console.log('   - Kasthuri Nagar Police Station should be found for Kasthuri Nagar');
    console.log('   - Banaswadi Police Station should be found for Banaswadi');
    console.log('   - Area matches should be prioritized over distance-only matches');
    console.log('   - Real phone numbers should be provided (080-XXXXXXXX format)');
}

// Run the tests
runAllTests().catch(console.error);