// Debug script for trip creation database connection error
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function debugTripCreation() {
  try {
    console.log('🔍 Debugging Trip Creation Database Connection Error');
    console.log('='.repeat(80));
    
    // First, test if backend is running
    console.log('1. Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }
    
    // Test MongoDB connection
    console.log('\n2. Testing MongoDB connection...');
    try {
      const dbResponse = await axios.get(`${BASE_URL}/test-db`);
      console.log('✅ MongoDB connection:', dbResponse.data);
    } catch (error) {
      console.log('❌ MongoDB connection failed:', error.message);
      return;
    }
    
    // Test MongoDB client availability
    console.log('\n3. Testing MongoDB client availability...');
    try {
      const clientResponse = await axios.get(`${BASE_URL}/test-mongodb-client`);
      console.log('✅ MongoDB client:', clientResponse.data);
    } catch (error) {
      console.log('❌ MongoDB client test failed:', error.message);
      return;
    }
    
    // Test trip creation with proper auth token
    console.log('\n4. Testing trip creation with auth...');
    
    // First, let's try to get a valid auth token by logging in
    console.log('   Getting auth token...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@abrafleet.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        const token = loginResponse.data.token;
        console.log('✅ Got auth token');
        
        // Now test trip creation
        console.log('   Testing trip creation...');
        const tripData = {
          vehicleId: '694ce98f6e04aa748dda86ff', // Use a valid vehicle ID from the logs
          startPoint: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Bangalore, Karnataka'
          },
          endPoint: {
            latitude: 13.0827,
            longitude: 80.2707,
            address: 'Chennai, Tamil Nadu'
          },
          distance: 350,
          scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          customerPhone: '+91 9876543210',
          tripType: 'manual',
          notes: 'Debug test trip'
        };
        
        const tripResponse = await axios.post(`${BASE_URL}/api/trips/create`, tripData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Trip creation successful:', tripResponse.data);
        
      } else {
        console.log('❌ Login failed:', loginResponse.data);
      }
      
    } catch (loginError) {
      console.log('❌ Login error:', loginError.response?.data || loginError.message);
      
      // If login fails, let's try with a mock token to see the specific error
      console.log('\n   Trying with mock token to see specific error...');
      try {
        const tripData = {
          vehicleId: '694ce98f6e04aa748dda86ff',
          startPoint: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Bangalore, Karnataka'
          },
          endPoint: {
            latitude: 13.0827,
            longitude: 80.2707,
            address: 'Chennai, Tamil Nadu'
          },
          distance: 350,
          scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString(),
          customerName: 'Test Customer',
          tripType: 'manual'
        };
        
        const tripResponse = await axios.post(`${BASE_URL}/api/trips/create`, tripData, {
          headers: {
            'Authorization': 'Bearer mock-token-for-debugging',
            'Content-Type': 'application/json'
          }
        });
        
      } catch (tripError) {
        console.log('❌ Trip creation error details:');
        console.log('   Status:', tripError.response?.status);
        console.log('   Data:', tripError.response?.data);
        console.log('   Headers:', tripError.response?.headers);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Debug Summary:');
    console.log('   - Backend is running');
    console.log('   - MongoDB connection is working');
    console.log('   - MongoDB client is available');
    console.log('   - Issue might be in authentication or trip creation logic');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

debugTripCreation();