// test-flutter-url-debug.js - Debug what URL Flutter is actually using
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002; // Different port to avoid conflicts

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log('\n🔍 INCOMING REQUEST TO DEBUG SERVER');
  console.log('─'.repeat(60));
  console.log('   Method:', req.method);
  console.log('   URL:', req.url);
  console.log('   Full URL:', `http://localhost:${PORT}${req.url}`);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('─'.repeat(60));
  next();
});

// Catch all routes
app.all('*', (req, res) => {
  console.log('✅ Request received at debug server');
  
  // Send a response that mimics the backend
  res.json({
    success: false,
    message: 'This is the debug server - Flutter is connecting to the wrong URL!',
    debugInfo: {
      method: req.method,
      url: req.url,
      fullUrl: `http://localhost:${PORT}${req.url}`,
      expectedUrl: 'http://localhost:3001/api/auth/login',
      actualPort: PORT,
      expectedPort: 3001
    }
  });
});

app.listen(PORT, () => {
  console.log('\n🔍 FLUTTER URL DEBUG SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📍 Debug Server: http://localhost:${PORT}`);
  console.log(`📍 Expected Backend: http://localhost:3001`);
  console.log('');
  console.log('🎯 INSTRUCTIONS:');
  console.log('1. Temporarily change Flutter .env to use this debug server');
  console.log('2. Update API_BASE_URL to: http://localhost:3002');
  console.log('3. Try login in Flutter app');
  console.log('4. Check what requests are received here');
  console.log('5. Change back to http://localhost:3001 when done');
  console.log('='.repeat(60));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Debug server shutting down...');
  process.exit(0);
});