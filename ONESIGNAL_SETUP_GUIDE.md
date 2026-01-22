# OneSignal Setup Guide - Complete Firebase-Free Notification System

## 🎯 Overview

This guide will help you set up OneSignal for push notifications in the Abra Fleet Management system, completely replacing Firebase Cloud Messaging (FCM).

## 📋 Prerequisites

1. OneSignal account (free at https://onesignal.com)
2. Google Play Console account (for Android)
3. Apple Developer account (for iOS)

## 🔧 OneSignal Configuration

### Step 1: Create OneSignal App

1. Go to https://onesignal.com and sign up/login
2. Click "New App/Website"
3. Enter app name: "Abra Fleet Management"
4. Select platforms: Android, iOS, Web
5. Click "Create App"

### Step 2: Get OneSignal Credentials

After creating the app, you'll get:
- **App ID**: Found in Settings > Keys & IDs
- **REST API Key**: Found in Settings > Keys & IDs

### Step 3: Configure Android

1. In OneSignal dashboard, go to Settings > Platforms
2. Click "Google Android (FCM)"
3. Upload your `google-services.json` file
4. Or enter Firebase Server Key and Sender ID

### Step 4: Configure iOS

1. In OneSignal dashboard, go to Settings > Platforms
2. Click "Apple iOS"
3. Upload your iOS Push Certificate (.p12 file)
4. Or configure using Apple Push Notification service (APNs) Auth Key

### Step 5: Configure Web Push

1. In OneSignal dashboard, go to Settings > Platforms
2. Click "Web Push"
3. Enter your site URL
4. Configure web push icon and settings

## 🔑 Environment Configuration

### Backend Configuration

Add to your `abra_fleet_backend/.env` file:

```env
# OneSignal Configuration
ONESIGNAL_APP_ID=your_onesignal_app_id_here
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key_here
```

### Flutter Configuration

Update `abra_fleet/lib/core/services/one_signal_service.dart`:

```dart
// Replace this line:
OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");

// With your actual App ID:
OneSignal.initialize("your_onesignal_app_id_here");
```

## 📱 Platform-Specific Setup

### Android Setup

1. **Add OneSignal Gradle Plugin**

   In `abra_fleet/android/build.gradle`:
   ```gradle
   buildscript {
       dependencies {
           classpath 'gradle.plugin.com.onesignal:onesignal-gradle-plugin:0.15.0'
       }
   }
   ```

2. **Apply Plugin**

   In `abra_fleet/android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.onesignal.androidsdk.onesignal-gradle-plugin'
   
   android {
       compileSdkVersion 34
       
       defaultConfig {
           manifestPlaceholders = [
               onesignal_app_id: 'your_onesignal_app_id_here',
               onesignal_google_project_number: 'your_firebase_project_number'
           ]
       }
   }
   ```

3. **Update AndroidManifest.xml**

   In `abra_fleet/android/app/src/main/AndroidManifest.xml`:
   ```xml
   <application>
       <!-- OneSignal App ID -->
       <meta-data android:name="com.onesignal.NotificationOpened.DEFAULT" 
                  android:value="DISABLE" />
   </application>
   ```

### iOS Setup

1. **Add Capability**

   In Xcode, add "Push Notifications" capability to your app target.

2. **Update Info.plist**

   In `abra_fleet/ios/Runner/Info.plist`:
   ```xml
   <key>OneSignal_APPID</key>
   <string>your_onesignal_app_id_here</string>
   ```

### Web Setup

1. **Add OneSignal SDK**

   In `abra_fleet/web/index.html`:
   ```html
   <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async=""></script>
   ```

## 🧪 Testing the Setup

### 1. Test Device Registration

Run this test script to verify device registration:

```javascript
// test-onesignal-registration.js
const axios = require('axios');

async function testDeviceRegistration() {
    try {
        const response = await axios.post('http://localhost:3001/api/onesignal/register-device', {
            playerId: 'test-player-id-12345',
            deviceType: 'web',
            deviceModel: 'Test Browser',
            tags: { userRole: 'admin', userId: 'test-user' }
        }, {
            headers: {
                'Authorization': 'Bearer your_jwt_token_here',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Device registration successful:', response.data);
    } catch (error) {
        console.error('❌ Device registration failed:', error.response?.data || error.message);
    }
}

testDeviceRegistration();
```

### 2. Test Notification Sending

```javascript
// test-onesignal-send.js
const axios = require('axios');

async function testNotificationSend() {
    try {
        const response = await axios.post('http://localhost:3001/api/onesignal/send', {
            targetRole: 'admin',
            title: '🧪 Test Notification',
            message: 'This is a test notification from OneSignal!',
            type: 'test',
            category: 'system',
            priority: 'normal',
            data: { testData: 'Hello World' }
        }, {
            headers: {
                'Authorization': 'Bearer your_jwt_token_here',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Notification sent successfully:', response.data);
    } catch (error) {
        console.error('❌ Notification send failed:', error.response?.data || error.message);
    }
}

testNotificationSend();
```

### 3. Test Health Check

```bash
curl http://localhost:3001/api/onesignal/health
```

Expected response:
```json
{
  "success": true,
  "message": "OneSignal notification service is running",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "config": {
    "appId": "configured",
    "restApiKey": "configured",
    "database": "connected"
  }
}
```

## 🚀 Deployment Checklist

### Production Environment Variables

```env
# Production OneSignal Configuration
ONESIGNAL_APP_ID=your_production_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_production_onesignal_rest_api_key
```

### Security Considerations

1. **Never expose REST API Key in frontend code**
2. **Use environment variables for all sensitive data**
3. **Implement proper JWT authentication**
4. **Validate all notification requests on backend**

## 📊 Monitoring and Analytics

### OneSignal Dashboard

Monitor your notifications in the OneSignal dashboard:
- Delivery rates
- Click-through rates
- User engagement
- Device statistics

### Backend Logging

The system logs all notification activities:
- Device registrations
- Notification sends
- Delivery confirmations
- Error tracking

## 🔧 Troubleshooting

### Common Issues

1. **"App ID not configured" Error**
   - Check that `ONESIGNAL_APP_ID` is set in environment variables
   - Verify the App ID is correct in OneSignal dashboard

2. **"REST API Key invalid" Error**
   - Check that `ONESIGNAL_REST_API_KEY` is set correctly
   - Verify the key in OneSignal Settings > Keys & IDs

3. **Notifications not received**
   - Check device registration in database
   - Verify user has granted notification permissions
   - Check OneSignal delivery reports

4. **Database connection issues**
   - Verify MongoDB connection string
   - Check database permissions
   - Ensure collections exist

### Debug Mode

Enable debug logging in Flutter:
```dart
OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
```

## 📚 API Reference

### Available Endpoints

- `POST /api/onesignal/register-device` - Register user device
- `POST /api/onesignal/send` - Send notification
- `POST /api/onesignal/send-template` - Send templated notification
- `GET /api/onesignal/my-notifications` - Get user notifications
- `PUT /api/onesignal/mark-read/:id` - Mark notification as read
- `PUT /api/onesignal/mark-all-read` - Mark all notifications as read
- `DELETE /api/onesignal/:id` - Delete notification
- `GET /api/onesignal/stats` - Get notification statistics
- `GET /api/onesignal/health` - Health check

### Notification Types by Role

**Admin:**
- `new_user_registered`
- `sos_alert`
- `trip_issue`
- `maintenance_due`

**Driver:**
- `trip_assigned`
- `trip_updated`
- `route_optimized`
- `payment_received`

**Customer:**
- `trip_confirmed`
- `driver_assigned`
- `trip_started`
- `trip_completed`
- `invoice_generated`

**Client:**
- `roster_assigned`
- `bulk_import_completed`
- `monthly_report`
- `payment_due`

## ✅ Success Criteria

Your OneSignal setup is complete when:

1. ✅ Device registration works for all user types
2. ✅ Notifications are sent and received successfully
3. ✅ Real-time notifications appear in the app
4. ✅ Notification history is stored in database
5. ✅ All user roles receive appropriate notifications
6. ✅ Health check endpoint returns success
7. ✅ No Firebase dependencies remain in the codebase

## 🎉 Next Steps

After completing the setup:

1. **Test with real devices** on Android, iOS, and Web
2. **Configure notification templates** for your specific use cases
3. **Set up monitoring** and alerting for notification failures
4. **Train your team** on the new notification system
5. **Remove all Firebase dependencies** from the codebase

## 📞 Support

If you encounter issues:

1. Check the OneSignal documentation: https://documentation.onesignal.com/
2. Review the backend logs for error messages
3. Test with the provided test scripts
4. Verify all environment variables are set correctly

---

**🎯 Goal Achieved: Complete Firebase-Free Notification System with OneSignal! 🎯**