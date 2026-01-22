const axios = require('axios');

async function testGetVehicles() {
    try {
        console.log('🚗 Getting list of vehicles first...');
        
        const url = `http://localhost:3001/api/admin/vehicles`;
        
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
        
        const data = response.data;
        if (data.success && data.vehicles) {
            console.log(`\n📋 Found ${data.vehicles.length} vehicles:`);
            data.vehicles.forEach((vehicle, index) => {
                console.log(`  ${index + 1}. ID: ${vehicle._id}`);
                console.log(`     Registration: ${vehicle.registrationNumber || vehicle.vehicleNumber || 'N/A'}`);
                console.log(`     Model: ${vehicle.model || vehicle.vehicleType || 'N/A'}`);
                console.log(`     Driver: ${vehicle.assignedDriver?.name || vehicle.driver?.name || 'N/A'}`);
                console.log('');
            });
            
            // Now test consecutive trips with the first vehicle
            if (data.vehicles.length > 0) {
                const firstVehicle = data.vehicles[0];
                console.log(`\n🚗 Testing consecutive trips for vehicle: ${firstVehicle._id}`);
                
                const consecutiveUrl = `http://localhost:3001/api/admin/fleet/vehicle/${firstVehicle._id}/consecutive-trips`;
                
                const consecutiveResponse = await axios.get(consecutiveUrl, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token',
                        'x-test-firebase-uid': 'test-admin-uid'
                    }
                });
                
                console.log('\n✅ CONSECUTIVE TRIPS SUCCESS!');
                console.log('Status:', consecutiveResponse.status);
                console.log('Data:', JSON.stringify(consecutiveResponse.data, null, 2));
            }
        } else {
            console.log('Response:', JSON.stringify(data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testGetVehicles();