// Send password reset email to Deepak Joshi
const axios = require('axios');

async function sendDeepakPasswordReset() {
  const BASE_URL = 'http://localhost:3001';
  const driverId = 'DRV-100012'; // Deepak Joshi's driver ID
  
  console.log('📧 Sending Password Reset Email to Deepak Joshi');
  console.log('='.repeat(60));
  console.log('Driver ID:', driverId);
  console.log('Email: deepak.joshi@abrafleet.com');
  console.log('Vehicle: KA07JK1234');
  console.log('Endpoint:', `${BASE_URL}/api/admin/drivers/${driverId}/send-password-reset`);
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/drivers/${driverId}/send-password-reset`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Using admin token - you may need to get a fresh one
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY2Mzk0MDQ1LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3NjY0MDMxNzMsImV4cCI6MTc2NjQwNjc3MywiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.TzMvWnEOmKwr0grYYIPLGy0I5iEifXsFPyF7RbwzwNe10dkhfgku3VQZPf6WQLU5jMOKHmOBqOTZCYNo9Fm8aEaxLzub8yzYRMsWxEWPYrQ0jNBrwbUamsy-Mx2jumkqRb9TOTB-ENYUuA1SxsxyXv88FZsBFEdZwuVmgReSfk599M97qf5bezWXN0-RKhS8wQRedWDimFWtGC7xYFNK6dvnyG9vJCBYWHX8dwSJ6vCwkBaU2A25Or02zVP_MNOWG78Kf4MTYLxUY9UD6ShHwmxsrCVxSKExxBKOd5fC_BfmaYU1a3kcF1xnifQdAYFGvjVIN3oUnwCp4CmJ3maAsg'
        }
      }
    );
    
    console.log('\n✅ SUCCESS! Password reset email sent!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    console.log('\n📧 EMAIL SENT TO: deepak.joshi@abrafleet.com');
    console.log('🔗 The email contains a password reset link');
    console.log('💡 Deepak can click the link to set a new password');
    
    console.log('\n🎯 FOR TESTING PURPOSES:');
    console.log('1. Check the email inbox for deepak.joshi@abrafleet.com');
    console.log('2. Click the password reset link in the email');
    console.log('3. Set a new password (e.g., "Deepak123!")');
    console.log('4. Use the new password to login to the app');
    
  } catch (error) {
    console.log('\n❌ ERROR OCCURRED:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', error.response?.data);
    console.log('Error Message:', error.message);
    
    if (error.response?.data) {
      console.log('\nDetailed Error:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n💡 POSSIBLE SOLUTIONS:');
    console.log('1. Make sure the backend server is running on port 3001');
    console.log('2. Check if the admin token is still valid');
    console.log('3. Verify that DRV-100012 exists in the database');
  }
}

sendDeepakPasswordReset();