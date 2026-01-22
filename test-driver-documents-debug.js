// test-driver-documents-debug.js
// Debug script to test driver documents functionality

const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let driverId = '';

// Test driver credentials
const TEST_DRIVER = {
  email: 'drivertest@abrafleet.com',
  password: 'Driver@123'
};

async function login() {
  console.log('\n🔐 Logging in as driver...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_DRIVER.email,
      password: TEST_DRIVER.password,
      role: 'driver'
    });

    if (response.data.success) {
      authToken = response.data.token;
      driverId = response.data.user.userId;
      console.log('✅ Login successful');
      console.log('   - Driver ID:', driverId);
      console.log('   - Token:', authToken.substring(0, 30) + '...');
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function getDocumentStatus() {
  console.log('\n📄 Getting document status...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/driver-documents/status/${driverId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log('✅ Status retrieved successfully');
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    
    const data = response.data.data;
    console.log('\n📊 Document Status Summary:');
    console.log('   Daily Photo:', data.dailyVerificationPhoto?.uploaded ? '✓ Uploaded' : '✗ Not Uploaded');
    console.log('   License:', data.license?.uploaded ? '✓ Uploaded' : '✗ Not Uploaded');
    console.log('   Medical:', data.medicalCertificate?.uploaded ? '✓ Uploaded' : '✗ Not Uploaded');
    
    if (data.dailyVerificationPhoto?.dailyPhotoUrl) {
      console.log('   Daily Photo URL:', data.dailyVerificationPhoto.dailyPhotoUrl.substring(0, 50) + '...');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to get status:', error.response?.data || error.message);
    return null;
  }
}

async function uploadDailyPhoto() {
  console.log('\n📸 Uploading daily photo...');
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const formData = new FormData();
    formData.append('photo', testImage, {
      filename: 'daily-photo.png',
      contentType: 'image/png'
    });

    const response = await axios.post(
      `${BASE_URL}/api/driver-documents/upload-daily-photo/${driverId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ Daily photo uploaded');
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    return false;
  }
}

async function runDebugTest() {
  console.log('🚀 Starting Driver Documents Debug Test');
  console.log('='.repeat(60));

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Tests aborted: Login failed');
    return;
  }

  // Get initial status
  console.log('\n📋 BEFORE UPLOAD:');
  await getDocumentStatus();

  // Upload daily photo
  await uploadDailyPhoto();

  // Wait a moment
  console.log('\n⏳ Waiting 1 second for backend to process...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get status after upload
  console.log('\n📋 AFTER UPLOAD:');
  const statusAfter = await getDocumentStatus();

  // Verify
  console.log('\n' + '='.repeat(60));
  if (statusAfter?.dailyVerificationPhoto?.uploaded) {
    console.log('✅ SUCCESS: Daily photo is showing as uploaded!');
    console.log('   The backend is working correctly.');
    console.log('   If the frontend is not showing it, the issue is in the Flutter app.');
  } else {
    console.log('❌ FAILURE: Daily photo is NOT showing as uploaded!');
    console.log('   The issue is in the backend.');
  }
}

// Run the test
runDebugTest().catch(error => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});
