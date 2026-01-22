const http = require('http');

// Test data matching what the frontend is sending
const tripData = {
  vehicleId: "694a7cddc1882931f34d491f", // The exact vehicle ID from the logs
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
  notes: "Test trip from debug script"
};

// Use a real Firebase token from the logs
const REAL_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY2NzMzMDI0LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3NjY3MzMyNDEsImV4cCI6MTc2NjczNjg0MSwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.b5gRpRJhMm-MY4vqr2GLHoKux42ak0gxR0TqwU7WetpBz6StsgbexPiO3K09PbW5tb_95lE1bZpzIwBZfKn7CE6h1V38pm8ctUvUS20ZZsjscJjwlvOhMY657bYLvTAcVnugEjUjdziBkyJM-XzmcH5rIrG4mwJhc7hKHpdxOt2c3bVv8q7w9cNfwfG7yaxe_1wuvDmRP1L0zm-ZarieVgwuNNA43-1J8VIBkDM3HWSS-H5NNGYyfEJhBlTYFUzqiRnvlGSK7A-vZtRVRfAY90RB1RZIp3HAOU8vlun79mvOqGCOukXZHCJaqgJA__ZxCYIRC2GFXQDv1ilXeiYgKw";

const postData = JSON.stringify(tripData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/trips/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${REAL_TOKEN}`
  }
};

console.log('🧪 Testing trip creation with real data and token...');
console.log('Vehicle ID:', tripData.vehicleId);
console.log('Distance:', tripData.distance);
console.log('Token preview:', REAL_TOKEN.substring(0, 50) + '...');

const req = http.request(options, (res) => {
  console.log('\n📡 Response received:');
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 500) {
        console.log('\n❌ 500 Error Details:');
        console.log('Error:', jsonData.error);
        console.log('Message:', jsonData.message);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();