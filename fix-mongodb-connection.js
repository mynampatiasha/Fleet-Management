// Fix MongoDB connection by updating index.js to use Mongoose properly
const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'abra_fleet_backend', 'index.js.backup');
const indexPath = path.join(__dirname, 'abra_fleet_backend', 'index.js');

// Create backup
fs.copyFileSync(indexPath, backupPath);
console.log('✅ Created backup at:', backupPath);

// Read current index.js
let content = fs.readFileSync(indexPath, 'utf8');

// Replace MongoDB native driver with Mongoose
const mongooseReplacement = `const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose'); // Use Mongoose instead of native driver

// Load environment variables with explicit path
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Validate critical environment variables
const requiredEnvVars = ['MONGODB_URI', 'FIREBASE_PROJECT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(\`   - \${varName}\`);
  });
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('   MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('   Firebase Project ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');

// Import Firebase config and middleware
const admin = require('./config/firebase');
const { verifyToken, requireRole } = require('./middleware/auth');

// Import email service
const emailService = require('./services/email_service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;`;

// Replace the MongoDB connection section
const connectionReplacement = `// MongoDB connection using Mongoose
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB with Mongoose...');
    
    // Configure Mongoose
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    });
    
    console.log('✅ Connected to MongoDB Atlas with Mongoose!');

    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB connection verified');

    // Initialize collections and indexes
    console.log('🔄 Creating indexes...');
    const db = mongoose.connection.db;
    await Promise.all([
      db.collection('rosters').createIndex({ driverId: 1, startTime: 1, endTime: 1 }),
      db.collection('rosters').createIndex({ vehicleId: 1, startTime: 1, endTime: 1 }),
      db.collection('rosters').createIndex({ status: 1, createdAt: -1 }),
      db.collection('sos_events').createIndex({ "location": "2dsphere" }),
      db.collection('trips').createIndex({ driverId: 1, status: 1 }),
      db.collection('trips').createIndex({ status: 1, startTime: -1 }),
      db.collection('trips').createIndex({ "currentLocation": "2dsphere" }),
      db.collection('admin_users').createIndex({ email: 1 }, { unique: true }),
      db.collection('admin_users').createIndex({ firebaseUid: 1 }),
      db.collection('users').createIndex({ email: 1 }),
      db.collection('users').createIndex({ firebaseUid: 1 }),
      db.collection('leave_requests').createIndex({ status: 1, createdAt: -1 }),
    ]).catch(err => {
      console.warn('⚠️  Some indexes failed to create (may already exist):', err.message);
    });
    console.log('✅ Indexes created');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('   Error message:', error.message);
    console.error('   Connection string:', process.env.MONGODB_URI ? 'SET (hidden)' : 'NOT SET');
    process.exit(1);
  }
}`;

// Replace the DB middleware section
const middlewareReplacement = `// ✅ ENHANCED DB MIDDLEWARE WITH MONGOOSE
app.use((req, res, next) => {
  if (!mongoose.connection.readyState) {
    console.error('❌ DATABASE NOT AVAILABLE');
    console.error('   Path:', req.path);
    console.error('   Method:', req.method);
    return res.status(500).json({
      success: false,
      error: 'Database connection not established',
      message: 'Server is starting up. Please try again in a moment.',
      code: 'DB_NOT_READY'
    });
  }

  // Add Mongoose database wrapper
  req.db = mongoose.connection.db;
  req.mongoClient = mongoose.connection.getClient();

  next();
});`;

// Update the test-db endpoint
const testDbReplacement = `// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        status: 'error',
        message: 'Database not connected'
      });
    }

    // Use mongoose connection to ping
    await mongoose.connection.db.admin().ping();
    res.json({
      status: 'success',
      message: 'Database connection is working!'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});`;

// Update graceful shutdown
const shutdownReplacement = `// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n🛑 Shutting down gracefully...');
  try {
    // Close Mongoose connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    }

    // Close HTTP server
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

// Handle SIGTERM (for production deployments)
process.on('SIGTERM', async () => {
  console.log('\\n🛑 SIGTERM received, shutting down...');
  try {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error during SIGTERM shutdown:', err);
    process.exit(1);
  }
});`;

// Apply replacements
content = content.replace(
  /const express = require\('express'\);[\s\S]*?const emailService = require\('\.\/services\/email_service'\);/,
  mongooseReplacement
);

content = content.replace(
  /\/\/ MongoDB connection[\s\S]*?console\.log\('✅ Indexes created'\);[\s\S]*?}\s*}/,
  connectionReplacement
);

content = content.replace(
  /\/\/ ✅ ENHANCED DB MIDDLEWARE[\s\S]*?next\(\);\s*}\);/,
  middlewareReplacement
);

content = content.replace(
  /\/\/ Database test endpoint[\s\S]*?}\s*}\);/,
  testDbReplacement
);

content = content.replace(
  /\/\/ Graceful shutdown[\s\S]*?process\.exit\(1\);\s*}\s*}\);/,
  shutdownReplacement
);

// Write the updated content
fs.writeFileSync(indexPath, content);
console.log('✅ Updated index.js to use Mongoose properly');
console.log('✅ Backup saved as index.js.backup');
console.log('');
console.log('🔄 Now restart your backend server to apply the changes');