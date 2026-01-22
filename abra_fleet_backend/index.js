// server.js - COMPLETE VERSION WITH ALL ORIGINAL ROUTES + NEW FEATURES
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables with explicit path
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Validate critical environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('   MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('   JWT Secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Import JWT authentication middleware (REPLACES FIREBASE)
const { verifyJWT, requireRole } = require('./routes/jwt_router');

// ✅ ADD REDIS & WEBSOCKET IMPORTS
const { connectRedis, disconnectRedis } = require('./config/redis');
const { initializeWebSocket } = require('./config/websocket_config');

// Import email service
const emailService = require('./services/email_service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// CORS Configuration - Allow requests from Flutter web app
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Check - Origin:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Allow all localhost and 127.0.0.1 ports for development
    if (origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('https://localhost:') ||
      origin.startsWith('https://127.0.0.1:') ||
      origin.startsWith('http://192.168.1.2:') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')) {
      console.log('✅ CORS: Allowing localhost origin:', origin);
      return callback(null, true);
    }

    // Allow production domains
    if (origin.includes('abra-fleet-management.com') ||
      origin.includes('abrafleet.com')) {
      console.log('✅ CORS: Allowing production origin:', origin);
      return callback(null, true);
    }

    // Log and reject other origins
    console.log('❌ CORS: Rejecting origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ REQUEST LOGGING MIDDLEWARE (BEFORE EVERYTHING)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`📥 INCOMING REQUEST - ${timestamp}`);
  console.log('='.repeat(80));
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Bearer ***' : 'None'
  });
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('='.repeat(80) + '\n');
  next();
});

// MongoDB connection using Mongoose
// MongoDB connection using Mongoose - FIXED VERSION
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
    });
    
    console.log('✅ Connected to MongoDB Atlas with Mongoose!');

    // ✅ CRITICAL FIX: Wait for db object to be available
    console.log('⏳ Waiting for database object to be ready...');
    let retries = 0;
    const maxRetries = 20; // Wait up to 10 seconds (20 * 500ms)
    
    while (!mongoose.connection.db && retries < maxRetries) {
      console.log(`   → Attempt ${retries + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }

    if (!mongoose.connection.db) {
      throw new Error('❌ Database object not available after connection - this should not happen');
    }

    console.log('✅ Database object is ready');

    // Test the connection
    const db = mongoose.connection.db;
    await db.admin().ping();
    console.log('✅ MongoDB connection verified with ping');

    // Initialize collections and indexes
    console.log('🔄 Creating indexes...');
    
    try {
      await Promise.all([
        // Roster indexes
        db.collection('rosters').createIndex({ driverId: 1, startTime: 1, endTime: 1 }),
        db.collection('rosters').createIndex({ vehicleId: 1, startTime: 1, endTime: 1 }),
        db.collection('rosters').createIndex({ status: 1, createdAt: -1 }),
        db.collection('rosters').createIndex({ assignedVehicleId: 1 }),
        db.collection('rosters').createIndex({ assignedDriverId: 1 }),
        db.collection('rosters').createIndex({ driverEmail: 1 }), // ✅ NEW: Email index
        
        // Trip indexes
        db.collection('trips').createIndex({ vehicleId: 1, scheduledDate: 1 }),
        db.collection('trips').createIndex({ tripSequence: 1 }),
        db.collection('trips').createIndex({ tripNumber: 1 }, { unique: true }),
        db.collection('trips').createIndex({ driverId: 1, status: 1 }),
        db.collection('trips').createIndex({ driverEmail: 1 }), // ✅ NEW: Email index
        db.collection('trips').createIndex({ driverEmail: 1, 'passengers.status': 1 }), // ✅ NEW: Passenger status
        db.collection('trips').createIndex({ status: 1, startTime: -1 }),
        db.collection('trips').createIndex({ "currentLocation": "2dsphere" }),
        db.collection('trips').createIndex({ 'passengers.rosterId': 1 }), // ✅ NEW: Passenger roster lookup
        
        // SOS indexes
        db.collection('sos_events').createIndex({ "location": "2dsphere" }),
        
        // User indexes
        db.collection('admin_users').createIndex({ email: 1 }, { unique: true }),
        db.collection('users').createIndex({ email: 1 }),
        db.collection('drivers').createIndex({ email: 1 }), // ✅ NEW: Driver email
        db.collection('drivers').createIndex({ driverId: 1 }), // ✅ NEW: Driver ID
        
        // Other indexes
        db.collection('leave_requests').createIndex({ status: 1, createdAt: -1 }),
        db.collection('vehicles').createIndex({ status: 1 }),
        db.collection('vehicles').createIndex({ assignedDriver: 1 }),
      ]);
      
      console.log('✅ All indexes created successfully');
    } catch (indexError) {
      // Some indexes may already exist, that's okay
      console.warn('⚠️  Some indexes failed to create (may already exist):', indexError.message);
    }

    console.log('✅ MongoDB initialization complete\n');

  } catch (error) {
    console.error('\n' + '❌'.repeat(40));
    console.error('MONGODB CONNECTION FAILED');
    console.error('❌'.repeat(40));
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Connection string:', process.env.MONGODB_URI ? 'SET (hidden for security)' : 'NOT SET');
    
    if (error.name === 'MongoNetworkError') {
      console.error('\n💡 TROUBLESHOOTING:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas cluster is running');
      console.error('   3. Check if your IP is whitelisted in MongoDB Atlas');
      console.error('   4. Verify MONGODB_URI in .env file\n');
    }
    
    console.error('❌'.repeat(40) + '\n');
    process.exit(1);
  }
}

// ✅ ENHANCED DB MIDDLEWARE WITH MONGOOSE
// ✅ ENHANCED DB MIDDLEWARE WITH MONGOOSE - FIXED VERSION
app.use((req, res, next) => {
  // Check if Mongoose is connected
  if (!mongoose.connection.readyState) {
    console.error('\n❌ DATABASE NOT AVAILABLE');
    console.error('   ReadyState:', mongoose.connection.readyState);
    console.error('   Path:', req.path);
    console.error('   Method:', req.method);
    console.error('   Time:', new Date().toISOString());
    
    return res.status(500).json({
      success: false,
      error: 'Database connection not established',
      message: 'Server is starting up. Please try again in a moment.',
      code: 'DB_NOT_READY'
    });
  }

  // ✅ CRITICAL FIX: Check if db object exists
  const db = mongoose.connection.db;
  
  if (!db) {
    console.error('\n❌ DATABASE OBJECT NOT AVAILABLE');
    console.error('   ReadyState:', mongoose.connection.readyState);
    console.error('   Connection name:', mongoose.connection.name);
    console.error('   Path:', req.path);
    console.error('   Method:', req.method);
    console.error('   Time:', new Date().toISOString());
    console.error('   This usually means the connection is still initializing\n');
    
    return res.status(503).json({
      success: false,
      error: 'Database not ready',
      message: 'Database connection is initializing. Please try again in a moment.',
      code: 'DB_INITIALIZING'
    });
  }

  // ✅ SUCCESS: Attach database to request
  req.db = db;
  req.mongoClient = mongoose.connection.getClient();
  
  // Optional: Log successful db attachment for debugging
  // console.log('✅ Database attached to request:', req.path);

  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const adminUsersRoutes = require('./routes/admin-users');
const adminDriverRoutes = require('./routes/admin-drivers');
const adminVehicleRoutes = require('./routes/admin-vehicles');
const adminCustomerRoutes = require('./routes/admin-customers');
const adminTripRoutes = require('./routes/admin-trips');

// ✅ UNIFIED CLIENT/CUSTOMER ROUTES (NEW SYSTEM)
const adminClientsUnifiedRoutes = require('./routes/admin-clients-unified-test');
const adminCustomersUnifiedRoutes = require('./routes/admin-customers-unified');
const unifiedRegistrationRoutes = require('./routes/unified_registration');
const rosterRoutes = require('./routes/roster_router');
const routeOptimizationRoutes = require('./routes/route_optimization_router');
const { router: trackingRoutes } = require('./routes/tracking');
const sosRoutes = require('./routes/sos_router');
const driverDocumentsRouter = require('./routes/driver-documents');
const accountSettingsRoutes = require('./routes/account-settings');
const driverReportsRoutes = require('./routes/driver-reports');
const driverTripsRoutes = require('./routes/driver-trips');
const driverDashboardRoutes = require('./routes/driver-dashboard');
const driverRouteDetailsRoutes = require('./routes/driver-route-details');
const driverProfileRoutes = require('./routes/driver-profile');
const notificationRoutes = require('./routes/notification_router');
const clientRoutes = require('./routes/client_router');
const clientSyncRoutes = require('./routes/client_sync_router');
const userManagementRoutes = require('./routes/user_management_router');
const adminUserRoutes = require('./routes/userManagement');
const roleRoutes = require('./routes/role_router');
const userRoleRoutes = require('./routes/userRole_router');
const customerApprovalRoutes = require('./routes/customer_approval_router');
const documentRoutes = require('./routes/document_router');
const addressChangeRoutes = require('./routes/address_change_router');
const passwordResetRoutes = require('./routes/password_reset_router');
const multiTripRoutes = require('./routes/multi_trip_routes');
const liveTrackingRoutes = require('./routes/live_tracking_routes');
const gpsRoutes = require('./routes/gps_tracking_router');
const maintenanceRoutes = require('./routes/maintenance_router');
const tripCreationRoutes = require('./routes/trip_creation_router');
const adminAnalyticsRoutes = require('./routes/admin_analytics');
const realTimeFleetRoutes = require('./routes/real_time_fleet_router');
const consecutiveTripsRoutes = require('./routes/consecutive_trips');
const feedbackRoutes = require('./routes/feedback_router');
const attendanceRoutes = require('./routes/attendance_router');
const noticeRoutes = require('./routes/notice_router');
const hrmEmployeesRoutes = require('./routes/hrm_employees');
const hrmDepartmentsRoutes = require('./routes/hrm_departments');
const hrmLeavesRoutes = require('./routes/hrm_leaves');
const hrmPayrollRoutes = require('./routes/hrm_payroll');
const tmsRoutes = require('./routes/tms');
const invoiceRoutes = require('./routes/invoice');
const itemBillingRoutes = require('./routes/new_item_billing');

// ✅ ASSIGNMENT ROUTES (NEW - INTEGRATED WITH TRIP CREATION)
const assignmentRoutes = require('./routes/assignment_routes');

// ✅ EMPLOYEE MANAGEMENT ROUTES (NEW COLLECTION SYSTEM)
const employeeManagementRoutes = require('./routes/employeeManagement');

// ✅ IMPORT USER ROLE MANAGEMENT ROUTE (Admin Users Only)
const { router: userRoleManagementRoutes, checkPermission: checkAdminPermission } = require('./routes/user_role_management');

// ✅ IMPORT USER PERMISSION MIDDLEWARE (Regular Users)
const { checkUserPermission, checkEitherPermission } = require('./middleware/user_permissions');

// WebSocket will be initialized later in startServer() function

// ==================== PUBLIC ROUTES (NO AUTH REQUIRED) ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Abra Travels Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState ? 'connected' : 'disconnected'
  });
});

// Email configuration test endpoint
app.get('/api/test-email-config', (req, res) => {
  const emailService = require('./services/email_service');

  const config = {
    initialized: emailService.initialized,
    smtpHost: process.env.SMTP_HOST || 'Not set',
    smtpPort: process.env.SMTP_PORT || 'Not set',
    smtpUser: process.env.SMTP_USER ? 'Set' : 'Not set',
    smtpPassword: process.env.SMTP_PASSWORD ? 'Set' : 'Not set',
  };

  res.json({
    success: true,
    message: 'Email configuration status',
    config: config
  });
});

// Database test endpoint
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
});

// Public endpoint for receiving SOS alerts
app.use('/api/sos', sosRoutes);

// SOS Resolution with image upload (protected)
const sosResolutionRoutes = require('./routes/sos_resolution');
app.use('/api/sos', verifyJWT, sosResolutionRoutes);

// Auth routes (JWT-based authentication)
app.use('/api/auth', passwordResetRoutes); // Password reset (public)
app.use('/api/auth', require('./routes/jwt_router')); // JWT auth routes (login, register, etc.)
app.use('/api/auth', authRoutes); // Legacy auth routes (protected by verifyJWT inside routes)

// ✅ UNIFIED REGISTRATION ROUTES (PUBLIC - NO AUTH REQUIRED)
console.log('🔐 Mounting unified registration routes at /api/auth');
app.use('/api/auth', unifiedRegistrationRoutes);

// ✅ ONESIGNAL NOTIFICATION ROUTES (PROTECTED)
const oneSignalRouter = require('./routes/one_signal_router');
app.use('/api/onesignal', verifyJWT, oneSignalRouter);
console.log('✅ OneSignal notification routes mounted at /api/onesignal (protected)');

// ✅ PUBLIC USER VERIFICATION ROUTE (NO AUTH REQUIRED)
app.get('/api/user-management/verify-user/:email', async (req, res) => {
  console.log('\n🔍 PUBLIC USER VERIFICATION');
  console.log('─'.repeat(80));

  try {
    const email = req.params.email.toLowerCase();
    console.log('   Email:', email);

    // Find user in MongoDB
    const User = require('./models/User');
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log('   ❌ User not found in MongoDB');
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this email'
      });
    }

    console.log('   ✅ User found:', user.name);
    console.log('   Role:', user.role);
    console.log('   Status:', user.isActive ? 'Active' : 'Inactive');

    // Check if user is active
    if (!user.isActive) {
      console.log('   ⚠️  User account is inactive');
      return res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: 'Your account is currently inactive. Please contact administrator.'
      });
    }

    console.log('✅ USER VERIFICATION SUCCESSFUL');
    console.log('─'.repeat(80) + '\n');

    res.json({
      success: true,
      message: 'User verification successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ USER VERIFICATION FAILED');
    console.error('   Error:', error.message);
    console.error('─'.repeat(80) + '\n');

    res.status(500).json({
      success: false,
      error: 'Failed to verify user',
      message: error.message
    });
  }
});

// ==================== PROTECTED ROUTES (AUTH REQUIRED) ====================

// Test authentication endpoint
app.get('/api/test-auth', verifyJWT, (req, res) => {
  res.json({
    status: 'success',
    message: 'JWT Authentication working!',
    user: {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// ✅ ASSIGNMENT ROUTES (Protected - Requires Auth - INTEGRATED WITH TRIP CREATION)
console.log('🎯 Mounting assignment routes at /api/assignment');
console.log('🎯 Loading assignment routes...');
try {
  app.use('/api/assignment', verifyJWT, assignmentRoutes);
  console.log('✅ Assignment routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load assignment routes:', error.message);
}

// ✅ USER ROLE MANAGEMENT ROUTES
console.log('🔐 Mounting user role management routes at /api/user-management');
app.use('/api/user-management', verifyJWT, userRoleManagementRoutes);

// ✅ EMPLOYEE MANAGEMENT ROUTES (NEW COLLECTION SYSTEM)
console.log('🔐 Mounting employee management routes at /api/employee-management');
app.use('/api/employee-management', verifyJWT, employeeManagementRoutes);

// Admin user management routes (protected)
app.use('/api/admin/users', verifyJWT, adminUsersRoutes);

// Admin analytics routes (protected)
app.use('/api/admin/analytics', verifyJWT, adminAnalyticsRoutes);

// ✅ ADD MISSING RATING ROUTES - Redirect to analytics
app.get('/api/admin/ratings/average', verifyJWT, (req, res, next) => {
  req.url = '/api/admin/analytics/ratings/average';
  adminAnalyticsRoutes(req, res, next);
});

app.get('/api/admin/ratings/overview', verifyJWT, (req, res, next) => {
  req.url = '/api/admin/analytics/ratings/overview';
  adminAnalyticsRoutes(req, res, next);
});

// Admin recent activities routes (protected)
const adminRecentActivitiesRoutes = require('./routes/admin_recent_activities');
app.use('/api/admin', verifyJWT, adminRecentActivitiesRoutes);

// ✅ ROSTER ROUTES WITH SMART PERMISSION CHECKING
app.use('/api/roster', verifyJWT, rosterRoutes);

// Route optimization routes (admin only)
// Mount route optimization routes at /api/roster for compatibility with Flutter app
app.use('/api/roster', verifyJWT, routeOptimizationRoutes);

// ✅ ALSO MOUNT ROSTER ROUTES AT /api/rosters (plural) for compatibility
app.use('/api/rosters', verifyJWT, (req, res, next) => {
  // Skip admin check for customer routes
  const publicEndpoints = ['/customer/', '/active-trip/'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.path.startsWith(endpoint));

  if (isPublicEndpoint) {
    return next();
  }

  checkPermission('routes')(req, res, next);
}, rosterRoutes);

// ✅ PROTECTED API ROUTES WITH DUAL PERMISSION CHECKS
// Routes now check BOTH AdminUser (navigation permissions) AND User (standardPermissions)

// ============================================================================
// IMPORTANT: ROUTE ORDER MATTERS!
// More specific routes (like /api/admin/fleet) must come BEFORE general routes (like /api/admin)
// Otherwise Express will match the general route first and block access
// ============================================================================

// ✅ CONSECUTIVE TRIPS ROUTES - Must be BEFORE /api/admin route
// Accessible to both admin and drivers without additional permission checks
app.use('/api/admin/fleet', verifyJWT, consecutiveTripsRoutes);
app.use('/api/driver/fleet', verifyJWT, consecutiveTripsRoutes);

// Fleet Management - allow both AdminUser and User with fleet permissions
app.use('/api/admin/vehicles', verifyJWT, checkEitherPermission('fleet'), adminVehicleRoutes);

// Maintenance Management - allow both AdminUser and User with fleet permissions
app.use('/api/maintenance', verifyJWT, checkEitherPermission('fleet'), maintenanceRoutes);

// Driver Management - allow both AdminUser and User with drivers permissions
app.use('/api/admin/drivers', verifyJWT, checkEitherPermission('drivers'), adminDriverRoutes);

// Customer/Employee Management - allow both AdminUser and User with customers permissions
app.use('/api/admin/customers', verifyJWT, checkEitherPermission('customers'), adminCustomerRoutes);

// ✅ CLIENT-SPECIFIC CUSTOMER ENDPOINT (No permission check, filtered by domain automatically)
console.log('👥 Mounting client customer routes at /api/client/customers');
app.use('/api/client/customers', verifyJWT, adminCustomerRoutes);

// ✅ UNIFIED CLIENT MANAGEMENT ROUTES (NEW SYSTEM)
console.log('🏢 Mounting unified client management routes at /api/admin/clients/unified');
app.use('/api/admin/clients/unified', verifyJWT, checkEitherPermission('customers'), adminClientsUnifiedRoutes);

// ✅ UNIFIED CUSTOMER MANAGEMENT ROUTES (NEW SYSTEM) 
console.log('👥 Mounting unified customer management routes at /api/admin/customers/unified');
app.use('/api/admin/customers/unified', verifyJWT, checkEitherPermission('customers'), adminCustomersUnifiedRoutes);

// Trip Management - allow both AdminUser and User with routes permissions
app.use('/api/admin/trips', verifyJWT, checkEitherPermission('routes'), adminTripRoutes);

// Tracking - accessible to authenticated users
app.use('/api/tracking', verifyJWT, liveTrackingRoutes);

// Billing - allow both AdminUser and User with billing permissions
console.log('💰 Mounting billing dashboard routes at /api/billing');
// Health endpoint without auth
app.get('/api/billing/health', (req, res) => {
  console.log('💰 Billing Dashboard Health Check (no auth)');
  res.json({
    success: true,
    message: 'Billing Dashboard API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
// All other billing routes require auth
app.use('/api/billing', verifyJWT, require('./routes/billing_dashboard'));

// Payments Received System - allow both AdminUser and User with billing permissions
console.log('💰 Mounting payments received routes at /api/payments-received');
const paymentsReceivedRoutes = require('./routes/payments_received');
app.use('/api/payments-received', verifyJWT, checkEitherPermission('billing'), paymentsReceivedRoutes);

// Invoice System - allow both AdminUser and User with billing permissions
console.log('🧾 Mounting invoice routes at /api/invoices');
app.use('/api/invoices', verifyJWT, checkEitherPermission('billing'), invoiceRoutes);

// Item Billing System - allow both AdminUser and User with billing permissions
console.log('📦 Mounting item billing routes at /api/item-billing');
app.use('/api/item-billing', verifyJWT, checkEitherPermission('billing'), itemBillingRoutes);

// Reports - allow any authenticated user to access their own reports
app.use('/api/driver/reports', verifyJWT, driverReportsRoutes);

// User Management - ADMIN ONLY (use checkAdminPermission)
app.use('/api/users', verifyJWT, checkAdminPermission('users'), userManagementRoutes);

// GPS routes - allow both AdminUser and User with fleet permissions
app.use('/api/gps', verifyJWT, checkEitherPermission('fleet'), gpsRoutes);

// Routes accessible to all authenticated users (no specific module required)
app.use('/api/customer/stats', verifyJWT, require('./routes/customer_stats_router'));
app.use('/api/driver', verifyJWT, realTimeFleetRoutes); // Real-time fleet management for drivers

// System Administration - ADMIN ONLY (use checkAdminPermission)
// IMPORTANT: This MUST come AFTER all specific /api/admin/* routes
app.use('/api/admin', verifyJWT, checkAdminPermission('system'), adminUserRoutes);
app.use('/api/roles', verifyJWT, checkAdminPermission('system'), roleRoutes);
app.use('/api/user-roles', verifyJWT, checkAdminPermission('system'), userRoleRoutes);

// Driver-specific routes (accessible to authenticated users)
app.use('/api/driver-documents', verifyJWT, driverDocumentsRouter);
app.use('/api/account-settings', verifyJWT, accountSettingsRoutes);
app.use('/api/driver/trips', verifyJWT, driverTripsRoutes);
app.use('/api/driver/dashboard', verifyJWT, driverDashboardRoutes);
app.use('/api/driver/route', verifyJWT, driverRouteDetailsRoutes);
app.use('/api/drivers', verifyJWT, driverProfileRoutes);

// General routes (accessible to authenticated users)
app.use('/api/notifications', verifyJWT, notificationRoutes);
app.use('/api/clients', verifyJWT, clientRoutes);
app.use('/clients', verifyJWT, clientSyncRoutes);
app.use('/api/customer-approval', verifyJWT, customerApprovalRoutes);
app.use('/api/documents', verifyJWT, documentRoutes);
app.use('/api/address-change', verifyJWT, addressChangeRoutes);

// Trip routes
app.use('/api/trips', verifyJWT, multiTripRoutes);
app.use('/api/trips', verifyJWT, tripCreationRoutes); // NEW: Trip creation and management

// Feedback routes
app.use('/api/feedback', verifyJWT, feedbackRoutes);

// Attendance routes (with database injection)
app.use('/api/attendance', verifyJWT, (req, res, next) => {
  // Pass the database to the attendance router
  const attendanceRouter = attendanceRoutes(req.db);
  attendanceRouter(req, res, next);
});

// Notice routes (with database injection)
app.use('/api/notices', verifyJWT, (req, res, next) => {
  // Pass the database to the notice router
  const noticeRouter = noticeRoutes(req.db);
  noticeRouter(req, res, next);
});

// HRM Employee Management
app.use('/api/hrm/employees', verifyJWT, hrmEmployeesRoutes);

// HRM Department Management
app.use('/api/hrm/departments', verifyJWT, hrmDepartmentsRoutes);

// HRM Leave Management
app.use('/api/hrm/leaves', verifyJWT, hrmLeavesRoutes);

// HRM Payroll Management
app.use('/api/hrm/payroll', verifyJWT, hrmPayrollRoutes);

// ✅ TMS (Ticket Management System) Routes
app.use('/api/tickets', verifyJWT, tmsRoutes);
console.log('✅ TMS routes mounted at /api/tickets');

app.get('/api/trips', verifyJWT, async (req, res) => {
  try {
    const trips = await req.db.collection('trips').find({}).limit(10).toArray();
    res.json({
      status: 'success',
      data: trips,
      user: req.user.email
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ==================== ERROR HANDLERS (MUST BE LAST) ====================

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('\n' + '💥'.repeat(40));
  console.error('UNHANDLED ERROR IN EXPRESS');
  console.error('💥'.repeat(40));
  console.error('Error:', err?.message || 'Unknown');
  console.error('Name:', err?.name || 'Unknown');
  console.error('Code:', err?.code || 'None');
  console.error('Path:', req?.path || 'Unknown');
  console.error('Method:', req?.method || 'Unknown');
  console.error('User:', req?.user?.email || 'Anonymous');
  console.error('Stack:', err?.stack || 'No stack');
  console.error('💥'.repeat(40) + '\n');

  // Determine status code
  let statusCode = 500;
  let errorMessage = 'Internal server error';

  if (err?.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation failed';
  } else if (err?.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid data format';
  } else if (err?.message?.includes('ObjectId')) {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
  } else if (err?.code === 'ENOENT') {
    statusCode = 404;
    errorMessage = 'Resource not found';
  } else if (err?.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorMessage = 'Service unavailable';
  }

  // Safety check - ensure response hasn't been sent
  if (res.headersSent) {
    console.error('⚠️  Headers already sent, cannot send error response');
    return next(err);
  }

  // ALWAYS return JSON, never plain text
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    message: err?.message || errorMessage,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err?.stack,
      code: err?.code,
      name: err?.name
    })
  });
});

// ✅ 404 HANDLER (MUST BE ABSOLUTE LAST)
app.use((req, res) => {
  console.log('⚠️  404 - Route not found:', req.method, req.path);

  // Safety check
  if (res.headersSent) {
    return;
  }

  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path,
    method: req.method
  });
});

// ==================== SERVER STARTUP ====================

async function startServer() {
  try {
    console.log('\n' + '🚀'.repeat(40));
    console.log('STARTING ABRA TRAVELS BACKEND SERVER');
    console.log('🚀'.repeat(40) + '\n');
    
    // ────────────────────────────────────────────────────────────────────
    // STEP 1: Connect to MongoDB
    // ────────────────────────────────────────────────────────────────────
    console.log('📊 STEP 1: Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ MongoDB connected and indexed\n');

    // ────────────────────────────────────────────────────────────────────
    // STEP 2: Connect to Redis (Optional)
    // ────────────────────────────────────────────────────────────────────
    console.log('💾 STEP 2: Connecting to Redis...');
    try {
      const redisConnections = await connectRedis();
      if (redisConnections.redisClient) {
        console.log('✅ Redis connected - Real-time features enabled');
        console.log('   - Assignment locks: ACTIVE');
        console.log('   - Location caching: ACTIVE');
        console.log('   - Trip status caching: ACTIVE\n');
      } else {
        console.log('⚠️  Redis not available - Running in fallback mode');
        console.log('   - Assignment locks: IN-MEMORY (single server only)');
        console.log('   - Location caching: DISABLED');
        console.log('   - Trip status caching: DISABLED\n');
      }
    } catch (error) {
      console.warn('⚠️  Redis connection failed:', error.message);
      console.warn('   Continuing without Redis - Using fallback mechanisms\n');
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 3: Initialize WebSocket Server
    // ────────────────────────────────────────────────────────────────────
    console.log('🌐 STEP 3: Initializing WebSocket server...');
    try {
      const io = initializeWebSocket(server);
      app.set('wsServer', io);
      console.log('✅ WebSocket server initialized');
      console.log('   - Real-time roster updates: ACTIVE');
      console.log('   - Live vehicle tracking: ACTIVE');
      console.log('   - Assignment notifications: ACTIVE\n');
      
      // Make broadcast helpers available globally
      const { 
        broadcastNewRoster, 
        broadcastRosterAssigned, 
        updatePendingCount,
        updateAvailableVehiclesCount
      } = require('./config/websocket_config');
      
      app.set('broadcastNewRoster', broadcastNewRoster);
      app.set('broadcastRosterAssigned', broadcastRosterAssigned);
      app.set('updatePendingCount', updatePendingCount);
      app.set('updateAvailableVehiclesCount', updateAvailableVehiclesCount);
      
      console.log('✅ WebSocket broadcast helpers configured\n');
    } catch (error) {
      console.warn('⚠️  WebSocket initialization failed:', error.message);
      console.warn('   Real-time features will be disabled\n');
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 4: Initialize Email Service
    // ────────────────────────────────────────────────────────────────────
    console.log('📧 STEP 4: Initializing email service...');
    const emailInitialized = emailService.initialize();
    if (emailInitialized) {
      console.log('✅ Email service initialized');
      // Verify connection in background
      setTimeout(async () => {
        try {
          const verified = await emailService.verifyConnection();
          if (verified) {
            console.log('✅ Email server connection verified');
          }
        } catch (err) {
          console.warn('⚠️  Email verification failed:', err.message);
        }
      }, 2000);
    } else {
      console.warn('⚠️  Email service not configured - Notifications will be skipped\n');
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 5: Start Background Jobs
    // ────────────────────────────────────────────────────────────────────
    console.log('⏰ STEP 5: Starting background jobs...');
    try {
      // Document expiry checks (every 6 hours)
      const db = mongoose.connection.db;
      if (db) {
        notificationRoutes.startDocumentExpiryChecks(db);
        console.log('✅ Document expiry checks started (every 6 hours)\n');
      } else {
        console.warn('⚠️  Skipping document expiry checks - database connection not ready\n');
      }
    } catch (err) {
      console.warn('⚠️  Background jobs failed to start:', err.message, '\n');
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 6: Start HTTP Server
    // ────────────────────────────────────────────────────────────────────
    console.log('🌐 STEP 6: Starting HTTP server...');
    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '🚀'.repeat(40));
      console.log('✅ ABRA TRAVELS BACKEND SERVER RUNNING');
      console.log('🚀'.repeat(40));
      console.log(`📍 Local:          http://localhost:${PORT}`);
      console.log(`📍 Network:        http://192.168.1.2:${PORT}`);
      console.log(`📍 Health Check:   http://localhost:${PORT}/health`);
      console.log(`🔐 Auth Test:      http://localhost:${PORT}/api/test-auth`);
      console.log(`🌐 WebSocket:      ws://localhost:${PORT}`);
      console.log('🚀'.repeat(40));
      console.log('\n📋 ASSIGNMENT API ENDPOINTS (WITH TRIP CREATION):');
      console.log('   ✅ /api/assignment/pending-rosters     - Get pending rosters');
      console.log('   ✅ /api/assignment/find-matches        - Find matching vehicles');
      console.log('   ✅ /api/assignment/assign              - Assign roster + CREATE TRIP');
      console.log('   ✅ /api/assignment/assign-group        - Assign group + CREATE TRIP');
      console.log('   ✅ /api/assignment/available-vehicles  - Get available vehicles');
      console.log('   ✅ /api/assignment/unassign            - Unassign roster + REMOVE TRIP');
      console.log('\n🚗 TRIP MANAGEMENT ENDPOINTS:');
      console.log('   ✅ /api/admin/fleet/vehicles/live-status                 - All vehicles live');
      console.log('   ✅ /api/admin/fleet/vehicle/:id/consecutive-trips        - Vehicle trips');
      console.log('   ✅ /api/admin/fleet/trip/:id/passenger/:rosterId/status  - Update passenger');
      console.log('\n🔐 PERMISSION-BASED ACCESS CONTROL: ACTIVE');
      console.log('   - Fleet routes require "fleet" module');
      console.log('   - Driver routes require "drivers" module');
      console.log('   - Customer routes require "customers" module');
      console.log('   - Routes require "routes" module');
      console.log('   - Billing routes require "billing" module');
      console.log('   - System routes require "system" module\n');
    });
  } catch (error) {
    console.error('\n' + '❌'.repeat(40));
    console.error('FATAL: Server startup failed');
    console.error('❌'.repeat(40));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌'.repeat(40) + '\n');
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('❌ FATAL: Unhandled error during startup:', error);
  process.exit(1);
});

// ==================== PROCESS HANDLERS ====================

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    // Close Redis
    await disconnectRedis();
    console.log('✅ Redis disconnected');
    
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
  console.log('\n🛑 SIGTERM received, shutting down...');
  try {
    await disconnectRedis();
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
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n' + '💥'.repeat(40));
  console.error('UNCAUGHT EXCEPTION');
  console.error('💥'.repeat(40));
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('💥'.repeat(40) + '\n');

  // Give time for logs to flush
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n' + '💥'.repeat(40));
  console.error('UNHANDLED PROMISE REJECTION');
  console.error('💥'.repeat(40));
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
  console.error('💥'.repeat(40) + '\n');

  // Give time for logs to flush
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Log when server is ready
console.log('✅ Server script loaded, waiting for startup...');
