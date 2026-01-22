// Debug script to test what location is being sent from customer dashboard
const axios = require('axios');

// Test with Electronic City coordinates (what you're seeing in screenshot)
const electronicCityTest = {
    latitude: 12.8456,
    longitude: 77.6603,
    address: 'Electronic City, Bangalore'
};

// Test with Kasthuri Nagar coordinates (what should be sent)
const kasturiNagarTest = {
    latitude: 12.9850,
    longitude: 77.6362,
    address: 'Kasthuri Nagar, Bangalore'
};

async function testLocation(location, testName) {
    try {
        console.log(`\n🧪 ${testName}`);
        console.log('=' .repeat(50));
        console.log(`📍 Coordinates: ${location.latitude}, ${location.longitude}`);
        console.log(`📍 Address: ${location.address}`);
        
        const sosPayload = {
            customerId: 'debug_customer',
            customerName: 'Debug Customer',
            customerEmail: 'debug@example.com',
            customerPhone: '+91-9876543210',
            tripId: 'DEBUG_TRIP',
            driverId: 'debug_driver',
            driverName: 'Debug Driver',
            driverPhone: '+91-9876543211',
            vehicleReg: 'KA-01-DEBUG',
            vehicleMake: 'Test',
            vehicleModel: 'Vehicle',
            pickupLocation: 'Test Pickup',
            dropLocation: 'Test Drop',
            gps: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            timestamp: new Date().toISOString()
        };

        const response = await axios.post('http://localhost:3001/api/sos', sosPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        if (response.status === 201) {
            const nearbyStations = response.data.nearbyPoliceStations || [];
            console.log(`✅ Found ${nearbyStations.length} police stations:`);
            
            nearbyStations.slice(0, 3).forEach((station, index) => {
                console.log(`   ${index + 1}. ${station.name}`);
                console.log(`      📞 ${station.phone}`);
                console.log(`      📍 ${station.distance?.toFixed(2)} km away`);
                console.log('');
            });
            
            // Check for specific stations
            const hasKasturiNagar = nearbyStations.some(s => s.name.includes('Kasthuri Nagar'));
            const hasElectronicCity = nearbyStations.some(s => s.name.includes('Electronic City'));
            
            if (hasKasturiNagar) {
                console.log('🎯 Kasthuri Nagar Police Station found!');
            }
            if (hasElectronicCity) {
                console.log('⚠️  Electronic City Police Station found!');
            }
        }
        
    } catch (error) {
        console.error(`❌ Error testing ${testName}:`, error.message);
    }
}

async function runDiagnostics() {
    console.log('🔍 GPS Location Diagnostics for SOS Police Station Search');
    console.log('=' .repeat(60));
    
    await testLocation(kasturiNagarTest, 'Test 1: Kasthuri Nagar (Expected Location)');
    await testLocation(electronicCityTest, 'Test 2: Electronic City (What you\'re seeing)');
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 Diagnosis:');
    console.log('   If you see Electronic City stations in your app, your GPS');
    console.log('   coordinates are being detected as Electronic City area.');
    console.log('   This could be due to:');
    console.log('   1. GPS accuracy issues');
    console.log('   2. Location permissions not granted');
    console.log('   3. Using network location instead of GPS');
    console.log('   4. VPN or location spoofing');
    console.log('\n💡 Solution:');
    console.log('   1. Enable high accuracy GPS in your device settings');
    console.log('   2. Grant location permissions to the app');
    console.log('   3. Go outside for better GPS signal');
    console.log('   4. Restart the app and try again');
}

runDiagnostics().catch(console.error);