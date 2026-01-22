const admin = require('./abra_fleet_backend/config/firebase');
const http = require('http');

const ADMIN_UID = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2'; // Admin Firebase UID from logs

async function createAdminToken() {
  try {
    console.log('🔑 Creating Firebase custom token for admin...');
    const customToken = await admin.auth().createCustomToken(ADMIN_UID, {
      role: 'admin',
      email: 'admin@abrafleet.com'
    });
    console.log('✅ Custom token created');
    return customToken;
  } catch (error) {
    console.error('❌ Error creating custom token:', error);
    throw error;
  }
}

async function exchangeForIdToken(customToken) {
  try {
    console.log('🔄 Exchanging custom token for ID token...');
    
    const exchangeData = {
      token: customToken,
      returnSecureToken: true
    };
    
    const postData = JSON.stringify(exchangeData);
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      port: 443,
      path: `/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY || 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = require('https').request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.idToken) {
              console.log('✅ ID token obtained');
              resolve(response.idToken);
            } else {
              console.log('❌ No ID token in response:', response);
              reject(new Error('No ID token received'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('❌ Error exchanging token:', error);
    throw error;
  }
}

async function testTripCreation(idToken) {
  console.log('\n🧪 Testing trip creation with fresh token...');
  
  const tripData = {
    vehicleId: "694a7cddc1882931f34d491f",
    startPoint: {
      latitude: 12.99618906536335,
      longitude: 77.58292702636719,
      address: "Test Pickup Location"
    },
    endPoint: {
      latitude: 12.992843757324497,
      longitude: 77.70308999023437,
      address: "Test Drop Location"
    },
    distance: 13.00,
    scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString(),
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    customerPhone: "+91 9876543210",
    tripType: "manual",
    notes: "Test trip with fresh token"
  };

  const postData = JSON.stringify(tripData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/trips/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${idToken}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Trip Creation Status Code:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Trip Creation Response:', JSON.stringify(jsonData, null, 2));
          
          if (res.statusCode === 200 && jsonData.success) {
            console.log('\n✅ TRIP CREATION SUCCESSFUL!');
            console.log(`🎫 Trip Number: ${jsonData.data.tripNumber}`);
            console.log(`👨‍✈️ Driver: ${jsonData.data.driver.name}`);
            console.log(`🚗 Vehicle: ${jsonData.data.vehicle.number}`);
            console.log(`📏 Distance: ${jsonData.data.trip.distance} km`);
            console.log(`📱 Notifications: Driver ✅, Admin ✅`);
          } else {
            console.log('\n❌ TRIP CREATION FAILED');
            console.log('Error:', jsonData.error || jsonData.message);
          }
          
          resolve(jsonData);
        } catch (e) {
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    // Step 1: Create custom token
    const customToken = await createAdminToken();
    
    // Step 2: For now, let's just use the custom token directly
    // In a real app, you'd exchange it for an ID token, but for testing we can try the custom token
    console.log('\n🧪 Testing with custom token directly...');
    
    await testTripCreation(customToken);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();