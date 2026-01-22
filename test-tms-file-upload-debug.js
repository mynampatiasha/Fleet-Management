// test-tms-file-upload-debug.js
// Debug TMS file upload issues

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

const BASE_URL = 'http://localhost:3001';

async function testTMSFileUploadDebug() {
  console.log('\n🐛 ========== DEBUGGING TMS FILE UPLOAD ==========');
  
  try {
    // Step 1: Test backend health
    console.log('\n1️⃣ Testing backend health:');
    
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend health:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }
    
    // Step 2: Create a test image file
    console.log('\n2️⃣ Creating test image file:');
    
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Create a simple PNG file (1x1 pixel transparent PNG)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // Width: 1
      0x00, 0x00, 0x00, 0x01, // Height: 1
      0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
      0x1F, 0x15, 0xC4, 0x89, // CRC
      0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Compressed data
      0xE2, 0x21, 0xBC, 0x33, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ Test PNG file created:', testImagePath);
    console.log('   File size:', fs.statSync(testImagePath).size, 'bytes');
    
    // Step 3: Test file upload with proper authentication
    console.log('\n3️⃣ Testing file upload with authentication:');
    
    // Create a proper Firebase token (you'll need to get this from your app)
    // For now, let's test without file first
    const mockUser = {
      uid: 'qnwp8d0clDSSNuSm3ugmXYLSI3K2',
      email: 'admin@abrafleet.com',
      name: 'Admin User',
      role: 'admin'
    };
    
    console.log('⚠️  Note: This test requires a valid Firebase token');
    console.log('   For now, testing the file upload endpoint structure...');
    
    // Step 4: Test the multer configuration by checking file types
    console.log('\n4️⃣ Testing file type validation:');
    
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    console.log('✅ Allowed MIME types:');
    allowedTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type}`);
    });
    
    // Step 5: Check common file extensions and their MIME types
    console.log('\n5️⃣ Common file extensions and MIME types:');
    
    const commonTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    Object.entries(commonTypes).forEach(([ext, mime]) => {
      const isAllowed = allowedTypes.includes(mime);
      console.log(`   ${ext} -> ${mime} ${isAllowed ? '✅' : '❌'}`);
    });
    
    // Step 6: Test with different file types that might cause issues
    console.log('\n6️⃣ Potential problematic MIME types:');
    
    const problematicTypes = [
      'image/jpg', // Wrong MIME type (should be image/jpeg)
      'image/pjpeg', // IE specific JPEG MIME type
      'image/x-png', // Alternative PNG MIME type
      'application/octet-stream', // Generic binary
      'text/plain; charset=utf-8', // Text with charset
    ];
    
    problematicTypes.forEach(type => {
      const isAllowed = allowedTypes.includes(type);
      console.log(`   ${type} ${isAllowed ? '✅' : '❌'}`);
    });
    
    // Step 7: Recommendations
    console.log('\n7️⃣ Recommendations to fix the issue:');
    
    console.log('   1. Check the actual MIME type being sent by the frontend');
    console.log('   2. Add more flexible MIME type checking');
    console.log('   3. Add better error handling for file upload');
    console.log('   4. Log the actual file details in the backend');
    
    // Step 8: Create an improved file filter
    console.log('\n8️⃣ Improved file filter suggestion:');
    
    console.log(`
const improvedFileFilter = (req, file, cb) => {
  console.log('📁 File upload attempt:');
  console.log('   Original name:', file.originalname);
  console.log('   MIME type:', file.mimetype);
  console.log('   Field name:', file.fieldname);
  
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',     // Add this for compatibility
    'image/pjpeg',   // Add this for IE compatibility
    'image/png',
    'image/x-png',   // Add this for compatibility
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  // Also check file extension as fallback
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'];
  
  const mimeTypeAllowed = allowedTypes.includes(file.mimetype);
  const extensionAllowed = allowedExtensions.includes(ext);
  
  if (mimeTypeAllowed || extensionAllowed) {
    console.log('   ✅ File type allowed');
    cb(null, true);
  } else {
    console.log('   ❌ File type rejected');
    console.log('   Allowed MIME types:', allowedTypes);
    console.log('   Allowed extensions:', allowedExtensions);
    cb(new Error(\`Invalid file type. File: \${file.originalname}, MIME: \${file.mimetype}, Extension: \${ext}\`), false);
  }
};
    `);
    
    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Cleaned up test file');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  console.log('\n🐛 ========== DEBUG TEST COMPLETE ==========\n');
}

// Run the test
testTMSFileUploadDebug();