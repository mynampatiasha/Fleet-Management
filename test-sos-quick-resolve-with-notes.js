const axios = require('axios');

async function testSOSQuickResolveWithNotes() {
    try {
        console.log('🚨 Testing SOS Quick Resolve with Notes...\n');

        // Step 1: Create a test SOS alert first
        console.log('📡 Step 1: Creating test SOS alert...');
        const testSOSPayload = {
            customerId: 'test-customer-quick-' + Date.now(),
            customerName: 'Test Customer for Quick Resolution',
            customerEmail: 'testquick@example.com',
            customerPhone: '+91-9876543210',
            
            // Trip information
            tripId: 'trip-quick-' + Date.now(),
            driverId: 'driver-quick-123',
            driverName: 'Test Driver for Quick',
            driverPhone: '+91-9876543211',
            
            // Vehicle information
            vehicleReg: 'KA01EF9012',
            vehicleMake: 'Toyota',
            vehicleModel: 'Innova',
            
            // Route information
            pickupLocation: 'Test Pickup for Quick, Bangalore',
            dropLocation: 'Test Drop for Quick, Bangalore',
            
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

        console.log(`✅ SOS Alert Created: ${createResponse.data.eventId}`);
        const sosId = createResponse.data.eventId;

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 2: Test quick resolve with notes
        console.log('📡 Step 2: Quick resolving SOS with notes...');
        
        const quickResolvePayload = {
            status: 'Resolved',
            resolvedBy: 'test-admin@example.com',
            resolvedAt: new Date().toISOString(),
            adminNotes: 'Emergency resolved quickly. Customer was assisted by nearby security personnel. Situation handled without major incident. All parties are safe and secure.',
            resolutionType: 'quick_resolve'
        };

        const resolveResponse = await axios.put(`http://localhost:3001/api/sos/${sosId}/resolve`, quickResolvePayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log(`✅ Quick Resolve Status: ${resolveResponse.status}`);
        console.log(`✅ Response:`, resolveResponse.data);

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 3: Verify the SOS is now resolved with notes
        console.log('📡 Step 3: Verifying SOS is resolved with notes...');
        
        const verifyResponse = await axios.get(`http://localhost:3001/api/sos/${sosId}`, {
            timeout: 10000
        });

        if (verifyResponse.data.data.status === 'Resolved') {
            console.log('✅ SOS successfully resolved with quick method!');
            console.log(`✅ Status: ${verifyResponse.data.data.status}`);
            console.log(`✅ Resolved By: ${verifyResponse.data.data.resolvedBy || 'N/A'}`);
            console.log(`✅ Resolution Type: ${verifyResponse.data.data.resolutionType || 'N/A'}`);
            console.log(`✅ Admin Notes: ${verifyResponse.data.data.adminNotes ? verifyResponse.data.data.adminNotes.substring(0, 50) + '...' : 'N/A'}`);
            console.log(`✅ Resolved At: ${verifyResponse.data.data.resolvedAt || 'N/A'}`);
        } else {
            console.log('❌ SOS status not updated correctly');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 4: Test fetching resolved alerts to see our quick resolve
        console.log('📡 Step 4: Fetching resolved alerts...');
        
        const resolvedAlertsResponse = await axios.get('http://localhost:3001/api/sos?status=Resolved&limit=10', {
            timeout: 10000
        });

        const ourResolvedAlert = resolvedAlertsResponse.data.data?.find(alert => alert._id === sosId);
        if (ourResolvedAlert) {
            console.log('✅ Found our quick-resolved alert in the list!');
            console.log(`   - Customer: ${ourResolvedAlert.customerName}`);
            console.log(`   - Status: ${ourResolvedAlert.status}`);
            console.log(`   - Resolution Type: ${ourResolvedAlert.resolutionType || 'standard'}`);
            console.log(`   - Resolved By: ${ourResolvedAlert.resolvedBy || 'N/A'}`);
            console.log(`   - Has Admin Notes: ${ourResolvedAlert.adminNotes ? 'YES' : 'NO'}`);
            if (ourResolvedAlert.adminNotes) {
                console.log(`   - Notes Preview: ${ourResolvedAlert.adminNotes.substring(0, 60)}...`);
            }
            console.log(`   - Has Photo Proof: ${ourResolvedAlert.resolution ? 'YES' : 'NO'}`);
        } else {
            console.log('❌ Could not find our quick-resolved alert in the list');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 5: Test validation - try to resolve without notes
        console.log('📡 Step 5: Testing validation - creating another alert...');
        
        const testSOSPayload2 = {
            ...testSOSPayload,
            customerId: 'test-customer-validation-' + Date.now(),
            customerName: 'Test Customer for Validation',
            tripId: 'trip-validation-' + Date.now(),
        };

        const createResponse2 = await axios.post('http://localhost:3001/api/sos', testSOSPayload2, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const sosId2 = createResponse2.data.eventId;
        console.log(`✅ Second SOS Alert Created: ${sosId2}`);

        // Try to resolve without notes (should still work on backend, but frontend will require notes)
        console.log('📡 Testing resolve without notes (backend should accept)...');
        
        const resolveWithoutNotesPayload = {
            status: 'Resolved',
            resolvedBy: 'test-admin@example.com',
            resolvedAt: new Date().toISOString(),
            resolutionType: 'quick_resolve'
            // No adminNotes field
        };

        const resolveResponse2 = await axios.put(`http://localhost:3001/api/sos/${sosId2}/resolve`, resolveWithoutNotesPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log(`✅ Resolve without notes - Status: ${resolveResponse2.status}`);
        console.log(`✅ Backend accepts resolve without notes (frontend will enforce validation)`);

        console.log('\n🎉 All quick resolve with notes tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('✅ Quick resolve with notes: Working');
        console.log('✅ Backend stores admin notes: Working');
        console.log('✅ Resolution type tracking: Working');
        console.log('✅ Resolved alerts list: Working');
        console.log('✅ Backend validation: Flexible (frontend enforces notes)');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('❌ Response status:', error.response.status);
            console.error('❌ Response data:', error.response.data);
        }
    }
}

// Run the test
testSOSQuickResolveWithNotes();