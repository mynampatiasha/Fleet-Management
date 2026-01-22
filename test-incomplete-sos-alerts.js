const axios = require('axios');

async function testIncompleteSOS() {
    try {
        console.log('🚨 Testing Incomplete SOS Alerts API...\n');

        // Test 1: Get all active SOS alerts
        console.log('📡 Test 1: Fetching active SOS alerts...');
        const activeAlertsResponse = await axios.get('http://localhost:3001/api/sos?status=ACTIVE&limit=100', {
            timeout: 10000
        });

        console.log(`✅ Status: ${activeAlertsResponse.status}`);
        console.log(`✅ Active Alerts Count: ${activeAlertsResponse.data.data?.length || 0}`);
        
        if (activeAlertsResponse.data.data && activeAlertsResponse.data.data.length > 0) {
            const firstAlert = activeAlertsResponse.data.data[0];
            console.log(`✅ First Alert Sample:`);
            console.log(`   - ID: ${firstAlert._id}`);
            console.log(`   - Customer: ${firstAlert.customerName}`);
            console.log(`   - Driver: ${firstAlert.driverName || 'N/A'}`);
            console.log(`   - Vehicle: ${firstAlert.vehicleReg || 'N/A'}`);
            console.log(`   - Address: ${firstAlert.address}`);
            console.log(`   - Police Notified: ${firstAlert.emailSentStatus === 'sent' ? 'YES' : 'NO'}`);
            console.log(`   - Timestamp: ${firstAlert.timestamp}`);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Create a test SOS alert
        console.log('📡 Test 2: Creating a test SOS alert...');
        const testSOSPayload = {
            customerId: 'test-customer-incomplete-' + Date.now(),
            customerName: 'Test Customer for Incomplete Alerts',
            customerEmail: 'testcustomer@example.com',
            customerPhone: '+91-9876543210',
            
            // Trip information
            tripId: 'trip-test-' + Date.now(),
            rosterId: 'roster-test-' + Date.now(),
            
            // Driver information
            driverId: 'driver-test-123',
            driverName: 'Test Driver',
            driverPhone: '+91-9876543211',
            
            // Vehicle information
            vehicleReg: 'KA01AB1234',
            vehicleMake: 'Maruti',
            vehicleModel: 'Swift',
            
            // Route information
            pickupLocation: 'Test Pickup Location, Bangalore',
            dropLocation: 'Test Drop Location, Bangalore',
            
            // GPS coordinates (Kasthuri Nagar, Bangalore)
            gps: {
                latitude: 12.9850,
                longitude: 77.6362
            },
            
            timestamp: new Date().toISOString()
        };

        const createResponse = await axios.post('http://localhost:3001/api/sos', testSOSPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log(`✅ Create Status: ${createResponse.status}`);
        console.log(`✅ Event ID: ${createResponse.data.eventId}`);
        console.log(`✅ Police Notified: ${createResponse.data.policeNotified ? 'YES' : 'NO'}`);
        console.log(`✅ Police Email: ${createResponse.data.policeEmail || 'N/A'}`);
        console.log(`✅ City: ${createResponse.data.city || 'Unknown'}`);

        const newEventId = createResponse.data.eventId;

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Fetch active alerts again to see the new one
        console.log('📡 Test 3: Fetching active alerts again...');
        const updatedActiveResponse = await axios.get('http://localhost:3001/api/sos?status=ACTIVE&limit=100', {
            timeout: 10000
        });

        console.log(`✅ Status: ${updatedActiveResponse.status}`);
        console.log(`✅ Updated Active Alerts Count: ${updatedActiveResponse.data.data?.length || 0}`);

        // Find our test alert
        const ourAlert = updatedActiveResponse.data.data?.find(alert => alert._id === newEventId);
        if (ourAlert) {
            console.log(`✅ Found our test alert:`);
            console.log(`   - ID: ${ourAlert._id}`);
            console.log(`   - Customer: ${ourAlert.customerName}`);
            console.log(`   - Driver: ${ourAlert.driverName}`);
            console.log(`   - Vehicle: ${ourAlert.vehicleReg}`);
            console.log(`   - Status: ${ourAlert.status}`);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 4: Resolve the test alert
        console.log('📡 Test 4: Resolving the test alert...');
        const resolveResponse = await axios.put(`http://localhost:3001/api/sos/${newEventId}/resolve`, {
            resolvedBy: 'Test Admin',
            resolvedAt: new Date().toISOString()
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log(`✅ Resolve Status: ${resolveResponse.status}`);
        console.log(`✅ Message: ${resolveResponse.data.message}`);

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 5: Verify it's no longer in active alerts
        console.log('📡 Test 5: Verifying alert is resolved...');
        const finalActiveResponse = await axios.get('http://localhost:3001/api/sos?status=ACTIVE&limit=100', {
            timeout: 10000
        });

        const stillActive = finalActiveResponse.data.data?.find(alert => alert._id === newEventId);
        if (!stillActive) {
            console.log(`✅ Alert successfully resolved and removed from active list`);
        } else {
            console.log(`❌ Alert still appears in active list`);
        }

        // Check if it appears in resolved list
        const resolvedResponse = await axios.get('http://localhost:3001/api/sos?status=Resolved&limit=100', {
            timeout: 10000
        });

        const nowResolved = resolvedResponse.data.data?.find(alert => alert._id === newEventId);
        if (nowResolved) {
            console.log(`✅ Alert found in resolved list`);
            console.log(`   - Status: ${nowResolved.status}`);
            console.log(`   - Updated At: ${nowResolved.updatedAt}`);
        }

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('❌ Response status:', error.response.status);
            console.error('❌ Response data:', error.response.data);
        }
    }
}

// Run the test
testIncompleteSOS();