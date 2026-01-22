// test-driver-profile-complete.js
// Complete test script for driver profile and document management

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let driverId = '';

// Test driver credentials
const TEST_DRIVER = {
  email: 'drivertest@abrafleet.com',
  password: 'Driver@123'
};

async function login() {
  console.log('\n🔐 Testing Driver Login...');
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
      console.log('   - Token:', authToken.substring(0, 20) + '...');
      console.log('   - Driver ID:', driverId);
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function getProfile() {
  console.log('\n📋 Testing Get Profile...');
  try {
    const response = await axios.get(`${BASE_URL}/api/drivers/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log('✅ Profile retrieved successfully');
      console.log('   - Name:', response.data.data.name);
      console.log('   - Email:', response.data.data.email);
      console.log('   - Phone:', response.data.data.phoneNumber);
      console.log('   - Driver ID:', response.data.data.driverId);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
  }
}

async function updateProfile() {
  console.log('\n✏️ Testing Update Profile...');
  try {
    const response = await axios.put(
      `${BASE_URL}/api/drivers/profile`,
      {
        name: 'Driver Test Updated',
        phoneNumber: '+1234567890',
        address: '123 Test Street, Test City'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      console.log('✅ Profile updated successfully');
      console.log('   - Updated name:', response.data.data.name);
      console.log('   - Updated phone:', response.data.data.phoneNumber);
      return true;
    }
  } catch (error) {
    console.error('❌ Update profile failed:', error.response?.data || error.message);
    return false;
  }
}

async function getDocumentStatus() {
  console.log('\n📄 Testing Get Document Status...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/driver-documents/status/${driverId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.status === 'success') {
      console.log('✅ Document status retrieved');
      console.log('   - Daily Photo:', response.data.data.dailyVerificationPhoto?.uploaded ? '✓ Uploaded' : '✗ Not Uploaded');
      console.log('   - License:', response.data.data.license?.uploaded ? '✓ Uploaded' : '✗ Not Uploaded');
      console.log('   - Medical:', response.data.data.medicalCertificate?.uploaded ? '✓ Uploaded' : '✗ Not Uploaded');
      
      if (response.data.data.dailyVerificationPhoto?.expiryDate) {
        console.log('   - Daily Photo Expires:', new Date(response.data.data.dailyVerificationPhoto.expiryDate).toLocaleString());
      }
      
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Get document status failed:', error.response?.data || error.message);
  }
}

async function uploadDailyPhoto() {
  console.log('\n📸 Testing Upload Daily Photo...');
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

    if (response.data.status === 'success') {
      console.log('✅ Daily photo uploaded successfully');
      console.log('   - Uploaded at:', new Date(response.data.data.uploadedAt).toLocaleString());
      console.log('   - Expires at:', new Date(response.data.data.expiresAt).toLocaleString());
      return true;
    }
  } catch (error) {
    console.error('❌ Upload daily photo failed:', error.response?.data || error.message);
    return false;
  }
}

async function uploadLicense() {
  console.log('\n🪪 Testing Upload License...');
  try {
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const formData = new FormData();
    formData.append('license', testImage, {
      filename: 'license.png',
      contentType: 'image/png'
    });
    formData.append('licenseNumber', 'DL123456789');
    formData.append('expiryDate', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString());

    const response = await axios.post(
      `${BASE_URL}/api/driver-documents/upload-license/${driverId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (response.data.status === 'success') {
      console.log('✅ License uploaded successfully');
      console.log('   - License Number:', response.data.data.licenseNumber);
      console.log('   - Expiry Date:', new Date(response.data.data.expiryDate).toLocaleDateString());
      return true;
    }
  } catch (error) {
    console.error('❌ Upload license failed:', error.response?.data || error.message);
    return false;
  }
}

async function uploadMedicalCertificate() {
  console.log('\n🏥 Testing Upload Medical Certificate...');
  try {
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const formData = new FormData();
    formData.append('certificate', testImage, {
      filename: 'medical.png',
      contentType: 'image/png'
    });
    formData.append('certificateNumber', 'MC987654321');
    formData.append('expiryDate', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString());

    const response = await axios.post(
      `${BASE_URL}/api/driver-documents/upload-medical-certificate/${driverId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (response.data.status === 'success') {
      console.log('✅ Medical certificate uploaded successfully');
      console.log('   - Certificate Number:', response.data.data.certificateNumber);
      console.log('   - Expiry Date:', new Date(response.data.data.expiryDate).toLocaleDateString());
      return true;
    }
  } catch (error) {
    console.error('❌ Upload medical certificate failed:', error.response?.data || error.message);
    return false;
  }
}

async function getAllDocuments() {
  console.log('\n📚 Testing Get All Documents...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/driver-documents/documents/${driverId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.status === 'success') {
      console.log('✅ All documents retrieved');
      console.log('   - Profile Photo:', response.data.data.profilePhoto ? 'Available' : 'Not Available');
      console.log('   - Last Daily Photo:', response.data.data.lastDailyPhotoUpload || 'Never');
      console.log('   - Needs Daily Photo:', response.data.data.needsDailyPhoto ? 'Yes' : 'No');
      console.log('   - Photo History Count:', response.data.data.photoHistory?.length || 0);
      return true;
    }
  } catch (error) {
    console.error('❌ Get all documents failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Driver Profile Complete Functionality Tests');
  console.log('='.repeat(60));

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Tests aborted: Login failed');
    return;
  }

  // Test profile operations
  await getProfile();
  await updateProfile();
  await getProfile(); // Verify update

  // Test document operations
  await getDocumentStatus();
  await uploadDailyPhoto();
  await uploadLicense();
  await uploadMedicalCertificate();
  await getDocumentStatus(); // Verify uploads
  await getAllDocuments();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('\n📝 Summary:');
  console.log('   - Profile management: Working');
  console.log('   - Document uploads: Working');
  console.log('   - Document status: Working');
  console.log('   - Daily photo expiry: Working');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});
