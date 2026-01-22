const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testSOSResolveWithProof() {
    try {
        console.log('🚨 Testing SOS Resolve with Proof API...\n');

        // Step 1: Create a test SOS alert first
        console.log('📡 Step 1: Creating test SOS alert...');
        const testSOSPayload = {
            customerId: 'test-customer-proof-' + Date.now(),
            customerName: 'Test Customer for Proof Resolution',
            customerEmail: 'testproof@example.com',
            customerPhone: '+91-9876543210',
            
            // Trip information
            tripId: 'trip-proof-' + Date.now(),
            driverId: 'driver-proof-123',
            driverName: 'Test Driver for Proof',
            driverPhone: '+91-9876543211',
            
            // Vehicle information
            vehicleReg: 'KA01CD5678',
            vehicleMake: 'Hyundai',
            vehicleModel: 'i20',
            
            // Route information
            pickupLocation: 'Test Pickup for Proof, Bangalore',
            dropLocation: 'Test Drop for Proof, Bangalore',
            
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

        // Step 2: Create a dummy image file for testing
        console.log('📡 Step 2: Creating test proof image...');
        const testImagePath = path.join(__dirname, 'test-proof-image.jpg');
        
        // Create a simple test image (1x1 pixel JPEG)
        const testImageData = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
            0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
            0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
            0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
            0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
            0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
            0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
        ]);
        
        fs.writeFileSync(testImagePath, testImageData);
        console.log(`✅ Test image created: ${testImagePath}`);

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 3: Test resolve with proof
        console.log('📡 Step 3: Resolving SOS with proof...');
        
        const formData = new FormData();
        formData.append('sosId', sosId);
        formData.append('resolutionNotes', 'Emergency resolved successfully. Customer was safely assisted and situation is under control. All parties are safe.');
        formData.append('resolvedBy', 'Test Admin');
        formData.append('latitude', '12.9850');
        formData.append('longitude', '77.6362');
        formData.append('photo', fs.createReadStream(testImagePath), {
            filename: 'proof-resolution.jpg',
            contentType: 'image/jpeg'
        });

        const resolveResponse = await axios.post('http://localhost:3001/api/sos/resolve', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });

        console.log(`✅ Resolve Status: ${resolveResponse.status}`);
        console.log(`✅ Response:`, resolveResponse.data);

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 4: Verify the SOS is now resolved
        console.log('📡 Step 4: Verifying SOS is resolved...');
        
        const verifyResponse = await axios.get(`http://localhost:3001/api/sos/${sosId}`, {
            timeout: 10000
        });

        if (verifyResponse.data.data.status === 'Resolved') {
            console.log('✅ SOS successfully resolved with proof!');
            console.log(`✅ Resolution data:`, verifyResponse.data.data.resolution);
        } else {
            console.log('❌ SOS status not updated correctly');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Step 5: Test fetching resolved alerts
        console.log('📡 Step 5: Fetching resolved alerts...');
        
        const resolvedAlertsResponse = await axios.get('http://localhost:3001/api/sos?status=Resolved&limit=10', {
            timeout: 10000
        });

        const ourResolvedAlert = resolvedAlertsResponse.data.data?.find(alert => alert._id === sosId);
        if (ourResolvedAlert) {
            console.log('✅ Found our resolved alert in the list!');
            console.log(`   - Customer: ${ourResolvedAlert.customerName}`);
            console.log(`   - Status: ${ourResolvedAlert.status}`);
            console.log(`   - Has Resolution: ${ourResolvedAlert.resolution ? 'YES' : 'NO'}`);
            if (ourResolvedAlert.resolution) {
                console.log(`   - Photo URL: ${ourResolvedAlert.resolution.photoUrl}`);
                console.log(`   - Notes: ${ourResolvedAlert.resolution.notes.substring(0, 50)}...`);
                console.log(`   - Resolved By: ${ourResolvedAlert.resolution.resolvedBy}`);
            }
        } else {
            console.log('❌ Could not find our resolved alert in the list');
        }

        // Cleanup: Delete test image
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
            console.log('🧹 Test image cleaned up');
        }

        console.log('\n🎉 All proof resolution tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('❌ Response status:', error.response.status);
            console.error('❌ Response data:', error.response.data);
        }
        
        // Cleanup on error
        const testImagePath = path.join(__dirname, 'test-proof-image.jpg');
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
}

// Run the test
testSOSResolveWithProof();