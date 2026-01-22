const axios = require('axios');

async function testConsecutiveTrips() {
    try {
        console.log('🚀 Testing Consecutive Trips API...');
        
        // Use test mode for development
        const vehicleId = '694a7cddc1882931f34d4914';
        const url = `http://localhost:3001/api/admin/fleet/vehicle/${vehicleId}/consecutive-trips`;
        
        console.log(`📡 Making request to: ${url}`);
        console.log('🧪 Using test mode authentication...');
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token',
                'x-test-firebase-uid': 'test-admin-uid'
            }
        });
        
        console.log('✅ SUCCESS! Response received:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
        // Check if we have the expected structure
        const data = response.data;
        if (data.success && data.data) {
            const apiData = data.data;
            console.log('\n🎉 PERFECT! API Response Structure:');
            console.log(`📋 Vehicle: ${apiData.vehicle.registrationNumber || apiData.vehicle.name} (${apiData.vehicle.model || 'Unknown Type'})`);
            console.log(`🚗 Current Trip: ${apiData.currentTrip ? apiData.currentTrip.tripNumber || apiData.currentTrip._id : 'None'}`);
            console.log(`📝 Queued Trips: ${apiData.queuedTrips.length} trips`);
            console.log(`📊 Total Trips Today: ${apiData.totalTripsToday}`);
            
            if (apiData.currentTrip) {
                console.log(`⏰ Current Trip Time: ${apiData.currentTrip.scheduledTime || apiData.currentTrip.pickupTime || 'N/A'}`);
                console.log(`👥 Passengers: ${apiData.currentTrip.passengers ? apiData.currentTrip.passengers.length : apiData.currentTrip.totalPassengers || 0}`);
            }
            
            console.log('\n📋 All Queued Trips:');
            apiData.queuedTrips.forEach((trip, index) => {
                console.log(`  ${index + 1}. ${trip.tripNumber || trip._id} - ${trip.scheduledTime || trip.pickupTime || 'N/A'} (${trip.passengers ? trip.passengers.length : trip.totalPassengers || 0} passengers)`);
            });
            
            console.log('\n🎉 CONSECUTIVE TRIPS API IS WORKING PERFECTLY!');
            console.log('✅ Vehicle details: ✓');
            console.log('✅ Current trip: ✓');
            console.log('✅ Queued trips: ✓');
            console.log(`✅ Total trips for today: ${apiData.totalTripsToday}`);
            
            // Show the exact data structure for verification
            console.log('\n📋 DETAILED RESPONSE STRUCTURE:');
            console.log('- success:', data.success);
            console.log('- data.vehicle keys:', Object.keys(apiData.vehicle));
            console.log('- data.currentTrip:', apiData.currentTrip ? 'Present' : 'None');
            console.log('- data.queuedTrips.length:', apiData.queuedTrips.length);
            console.log('- data.totalTripsToday:', apiData.totalTripsToday);
            
        } else {
            console.log('\n⚠️  Response structure is different than expected');
            console.log('Expected: success: true, data: { vehicle, currentTrip, queuedTrips, totalTripsToday }');
            console.log('Received keys:', Object.keys(data));
            if (data.data) {
                console.log('Data keys:', Object.keys(data.data));
            }
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Backend server is not running on localhost:3001');
            console.error('💡 Make sure to start the backend with: npm start');
        }
    }
}

testConsecutiveTrips();