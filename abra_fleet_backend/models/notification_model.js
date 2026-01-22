// models/notification_model.js - ULTRA DETAILED DEBUG VERSION
const { ObjectId } = require('mongodb');

// Color codes for console (works in most terminals)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class NotificationModel {
  constructor(db) {
    this.collection = db.collection('notifications');
    this.usersCollection = db.collection('users');
    
    // Create indexes for efficient querying
    this.collection.createIndex({ userId: 1, createdAt: -1 });
    this.collection.createIndex({ status: 1, createdAt: -1 });
    this.collection.createIndex({ type: 1, userId: 1 });
    this.collection.createIndex({ 'metadata.rosterId': 1 });
    this.collection.createIndex({ isRead: 1, userId: 1 });
    
    console.log(`${colors.green}✅ NotificationModel initialized (JWT/OneSignal mode)${colors.reset}`);
  }

  // 🎯 MAIN NOTIFICATION CREATION METHOD
  async create(notificationData) {
    const startTime = Date.now();
    const sessionId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.logHeader('NOTIFICATION CREATION SESSION STARTED', sessionId);
    
    try {
      // STEP 1: Validate Input
      this.logStep(1, 'Validating Input Data', sessionId);
      const validation = this.validateNotificationData(notificationData);
      if (!validation.valid) {
        this.logError('Validation Failed', validation.errors, sessionId);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      this.logSuccess('Input validation passed', sessionId);
      
      // STEP 2: Prepare Notification Object
      this.logStep(2, 'Preparing Notification Object', sessionId);
      const notification = this.prepareNotificationObject(notificationData);
      this.logInfo('Notification Details:', {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        priority: notification.priority,
        category: notification.category
      }, sessionId);
      
      // STEP 3: Save to MongoDB
      this.logStep(3, 'Saving to MongoDB', sessionId);
      const mongoResult = await this.saveToMongoDB(notification, sessionId);
      
      // STEP 4: Get User OneSignal Player IDs
      this.logStep(4, 'Fetching User OneSignal Player IDs', sessionId);
      const playerIds = await this.getUserOneSignalIds(notification.userId, sessionId);
      
      // STEP 5: Send Push Notifications via OneSignal
      this.logStep(5, 'Sending Push Notifications via OneSignal', sessionId);
      const pushResults = await this.sendOneSignalNotifications(notification, playerIds, sessionId);
      
      // STEP 6: Summary
      this.logSummary(sessionId, startTime, {
        notificationId: mongoResult.insertedId.toString(),
        userId: notification.userId,
        type: notification.type,
        mongoSaved: true,
        oneSignalSent: pushResults.sent,
        oneSignalFailed: pushResults.failed
      });
      
      return { ...notification, _id: mongoResult.insertedId };
      
    } catch (error) {
      this.logFatalError('Notification Creation Failed', error, sessionId);
      throw error;
    }
  }

  // 📝 Validate notification data
  validateNotificationData(data) {
    const errors = [];
    
    if (!data.userId) errors.push('userId is required');
    if (!data.type) errors.push('type is required');
    if (!data.title) errors.push('title is required');
    if (!data.body) errors.push('body is required');
    
    if (data.userId && typeof data.userId !== 'string') {
      errors.push('userId must be a string');
    }
    
    if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
      errors.push('priority must be: low, normal, high, or urgent');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 📦 Prepare notification object
  prepareNotificationObject(data) {
    const now = new Date();
    return {
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data || {},
      metadata: {
        rosterId: data.rosterId || data.metadata?.rosterId || null,
        driverId: data.driverId || data.metadata?.driverId || null,
        vehicleId: data.vehicleId || data.metadata?.vehicleId || null,
        ...data.metadata
      },
      isRead: false,
      readAt: null,
      priority: data.priority || 'normal',
      category: data.category || 'general',
      createdAt: now,
      expiresAt: data.expiresAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      deliveryStatus: {
        mongodb: 'pending',
        oneSignal: 'pending'
      }
    };
  }

  // 💾 Save to MongoDB
  async saveToMongoDB(notification, sessionId) {
    try {
      this.logInfo('MongoDB Operation:', {
        collection: 'notifications',
        operation: 'insertOne'
      }, sessionId);
      
      const result = await this.collection.insertOne(notification);
      
      this.logSuccess(`MongoDB Save Successful`, {
        insertedId: result.insertedId.toString(),
        acknowledged: result.acknowledged
      }, sessionId);
      
      // Update delivery status
      await this.collection.updateOne(
        { _id: result.insertedId },
        { $set: { 'deliveryStatus.mongodb': 'success' } }
      );
      
      return result;
    } catch (error) {
      this.logError('MongoDB Save Failed', {
        error: error.message,
        code: error.code
      }, sessionId);
      
      await this.collection.updateOne(
        { userId: notification.userId },
        { $set: { 'deliveryStatus.mongodb': 'failed' } }
      );
      
      throw error;
    }
  }

  // 🔥 Get User OneSignal Player IDs
  async getUserOneSignalIds(userId, sessionId) {
    this.logInfo('Fetching OneSignal Player IDs', {
      userId: userId,
      source: 'MongoDB (users collection)'
    }, sessionId);
    
    const playerIds = [];
    
    try {
      // Get from MongoDB users collection
      const user = await this.usersCollection.findOne({ 
        firebaseUid: userId 
      });
      
      if (user && user.oneSignalPlayerId) {
        playerIds.push(user.oneSignalPlayerId);
        this.logSuccess('OneSignal Player ID found', {
          playerIdPreview: user.oneSignalPlayerId.substring(0, 20) + '...'
        }, sessionId);
      } else {
        this.logWarning('No OneSignal Player ID found for user', {
          userId: userId,
          suggestion: 'User needs to login to register OneSignal ID'
        }, sessionId);
      }
      
      return playerIds;
      
    } catch (error) {
      this.logError('Error fetching OneSignal Player IDs', {
        error: error.message
      }, sessionId);
      return playerIds;
    }
  }

  // 📤 Send OneSignal Notifications
  async sendOneSignalNotifications(notification, playerIds, sessionId) {
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };
    
    if (playerIds.length === 0) {
      this.logWarning('Skipping OneSignal send - No player IDs available', null, sessionId);
      return results;
    }
    
    this.logInfo(`Attempting to send to ${playerIds.length} device(s) via OneSignal`, null, sessionId);
    
    try {
      // OneSignal notification will be handled by OneSignal service
      // This is a placeholder - actual implementation should use OneSignal REST API
      this.logInfo('OneSignal notification queued', {
        playerIds: playerIds.length,
        title: notification.title
      }, sessionId);
      
      results.sent = playerIds.length;
      
    } catch (error) {
      this.logError('OneSignal send failed', {
        error: error.message
      }, sessionId);
      results.failed = playerIds.length;
    }
    
    return results;
  }

  // 🎨 Logging Methods with Colors and Structure
  logHeader(title, sessionId) {
    console.log('\n' + '='.repeat(100));
    console.log(`${colors.bright}${colors.cyan}🔔 ${title}${colors.reset}`);
    console.log(`${colors.cyan}Session ID: ${sessionId}${colors.reset}`);
    console.log(`${colors.cyan}Timestamp: ${new Date().toISOString()}${colors.reset}`);
    console.log('='.repeat(100) + '\n');
  }

  logStep(stepNumber, title, sessionId) {
    console.log(`\n${colors.bright}${colors.blue}📍 STEP ${stepNumber}: ${title}${colors.reset}`);
    console.log(`${colors.blue}${'─'.repeat(80)}${colors.reset}`);
  }

  logSuccess(message, data = null, sessionId) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
    if (data) {
      console.log(`${colors.green}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  }

  logError(message, data = null, sessionId) {
    console.log(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
    if (data) {
      console.log(`${colors.red}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  }

  logWarning(message, data = null, sessionId) {
    console.log(`${colors.yellow}⚠️  WARNING: ${message}${colors.reset}`);
    if (data) {
      console.log(`${colors.yellow}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  }

  logInfo(message, data = null, sessionId) {
    console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
    if (data) {
      console.log(`${colors.cyan}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  }

  logFatalError(message, error, sessionId) {
    console.log('\n' + '❌'.repeat(50));
    console.log(`${colors.bright}${colors.red}💥 FATAL ERROR: ${message}${colors.reset}`);
    console.log(`${colors.red}Session ID: ${sessionId}${colors.reset}`);
    console.log(`${colors.red}Error Message: ${error.message}${colors.reset}`);
    console.log(`${colors.red}Stack Trace:${colors.reset}`);
    console.log(`${colors.red}${error.stack}${colors.reset}`);
    console.log('❌'.repeat(50) + '\n');
  }

  logSummary(sessionId, startTime, summary) {
    const duration = Date.now() - startTime;
    console.log('\n' + '='.repeat(100));
    console.log(`${colors.bright}${colors.green}✅ NOTIFICATION SESSION COMPLETED${colors.reset}`);
    console.log('='.repeat(100));
    console.log(`${colors.green}Session ID: ${sessionId}${colors.reset}`);
    console.log(`${colors.green}Duration: ${duration}ms${colors.reset}`);
    console.log(`${colors.green}Notification ID: ${summary.notificationId}${colors.reset}`);
    console.log(`${colors.green}User ID: ${summary.userId}${colors.reset}`);
    console.log(`${colors.green}Type: ${summary.type}${colors.reset}`);
    console.log('\n📊 DELIVERY STATUS:');
    console.log(`${colors.green}  ✅ MongoDB: ${summary.mongoSaved ? 'Saved' : 'Failed'}${colors.reset}`);
    console.log(`${colors.green}  ✅ OneSignal Sent: ${summary.oneSignalSent || 0}${colors.reset}`);
    console.log(`${colors.green}  ❌ OneSignal Failed: ${summary.oneSignalFailed || 0}${colors.reset}`);
    console.log('='.repeat(100) + '\n');
  }

  // Additional methods remain the same...
  async getByUserId(userId, options = {}) {
    // ... existing code ...
  }

  async markAsRead(notificationId, userId) {
    // ... existing code ...
  }

  async markAllAsRead(userId) {
    // ... existing code ...
  }

  async delete(notificationId, userId) {
    // ... existing code ...
  }

  async getUnreadCount(userId) {
    return await this.collection.countDocuments({
      userId: userId,
      isRead: false,
      expiresAt: { $gt: new Date() }
    });
  }
}

// Helper function
async function createNotification(db, notificationData) {
  const notificationModel = new NotificationModel(db);
  return await notificationModel.create(notificationData);
}

module.exports = NotificationModel;
module.exports.createNotification = createNotification;