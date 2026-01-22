# 🔔 FCM Token Failure - Complete Fix Guide

## 🔍 **Problem Analysis**

### **Error Observed:**
```
❌ ERROR: FCM send failed (Device 1)
"errorCode": "messaging/registration-token-not-registered"
"errorMessage": "Requested entity was not found."
```

### **What This Means:**
The FCM token stored in your database is **invalid** or **expired**. Firebase Cloud Messaging cannot deliver notifications to this token.

## 🎯 **Root Causes**

### **1. Token Expiration** ⏰
- FCM tokens can expire after a period of inactivity
- Tokens become invalid if not refreshed periodically
- **Solution:** Implement automatic token refresh

### **2. App Reinstallation** 📱
- User uninstalled and reinstalled the app
- New installation generates a new FCM token
- Old token in database becomes invalid
- **Solution:** Update token on every app launch

### **3. Token Not Registered** 🚫
- User never granted notification permissions
- FCM token was never properly saved
- **Solution:** Ensure token registration on login

### **4. Development vs Production** 🔧
- Tokens generated in debug mode don't work in release mode
- Different Firebase projects for dev/prod
- **Solution:** Use correct Firebase config for each environment

## ✅ **Complete Solution**

### **Step 1: Add FCM Token Management Routes**

I've created `abra_fleet_backend/routes/fcm_token_management.js` with:

1. **Token Refresh Endpoint** - `/api/fcm/refresh-token`
2. **Token Cleanup Endpoint** - `/api/fcm/cleanup-invalid-tokens`
3. **Token Status Check** - `/api/fcm/token-status/:userId`

### **Step 2: Register the New Routes**

Add to `abra_fleet_backend/index.js`:

```javascript
const fcmTokenManagement = require('./routes/fcm_token_management');

// FCM Token Management
app.use('/api/fcm', fcmTokenManagement);
```

### **Step 3: Update Flutter App - Token Refresh on Launch**

Update your app initialization to refresh FCM token on every launch:

```dart
// In your main.dart or app initialization
Future<void> initializeFCM() async {
  final messaging = FirebaseMessaging.instance;
  
  // Request permission
  await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );
  
  // Get current token
  final token = await messaging.getToken();
  
  if (token != null) {
    // Send to backend to refresh/validate
    await _refreshFCMToken(token);
  }
  
  // Listen for token refresh
  messaging.onTokenRefresh.listen((newToken) {
    _refreshFCMToken(newToken);
  });
}

Future<void> _refreshFCMToken(String token) async {
  try {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    final idToken = await user.getIdToken();
    
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/fcm/refresh-token'),
      headers: {
        'Authorization': 'Bearer $idToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'fcmToken': token,
        'platform': kIsWeb ? 'web' : 'mobile',
      }),
    );
    
    if (response.statusCode == 200) {
      debugPrint('✅ FCM token refreshed successfully');
    }
  } catch (e) {
    debugPrint('❌ Failed to refresh FCM token: $e');
  }
}
```

### **Step 4: Clean Up Invalid Tokens**

Run this command to remove all invalid tokens from your database:

```bash
curl -X POST http://localhost:3001/api/fcm/cleanup-invalid-tokens \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Or create a script:

```javascript
// cleanup-invalid-fcm-tokens.js
const axios = require('axios');

async function cleanupInvalidTokens() {
  try {
    const response = await axios.post(
      'http://localhost:3001/api/fcm/cleanup-invalid-tokens',
      {},
      {
        headers: {
          'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
        }
      }
    );
    
    console.log('✅ Cleanup completed:', response.data);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

cleanupInvalidTokens();
```

### **Step 5: Handle Token Refresh in Notification Model**

Update `abra_fleet_backend/models/notification_model.js` to automatically remove invalid tokens:

```javascript
// In the FCM send section, after catching the error:
if (error.code === 'messaging/registration-token-not-registered') {
  // Remove invalid token from database
  await removeInvalidToken(userId, token, source);
  
  this.logWarning('Invalid token removed from database', {
    userId,
    tokenPreview: token.substring(0, 20) + '...',
    source
  }, sessionId);
}

async function removeInvalidToken(userId, token, source) {
  try {
    if (source === 'firebase_rtdb') {
      await admin.database().ref(`customers/${userId}/fcmToken`).remove();
    } else if (source === 'mongodb') {
      await db.collection('users').updateOne(
        { firebaseUid: userId },
        { $unset: { fcmToken: '' } }
      );
    }
    console.log(`🗑️ Removed invalid token for user: ${userId}`);
  } catch (err) {
    console.error('❌ Failed to remove invalid token:', err);
  }
}
```

## 🧪 **Testing the Fix**

### **1. Check Current Token Status**
```bash
curl http://localhost:3001/api/fcm/token-status/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Test Token Refresh**
```bash
curl -X POST http://localhost:3001/api/fcm/refresh-token \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "YOUR_FCM_TOKEN",
    "platform": "mobile"
  }'
```

### **3. Clean Up Invalid Tokens**
```bash
curl -X POST http://localhost:3001/api/fcm/cleanup-invalid-tokens \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📊 **Expected Results After Fix**

### **Before:**
```
❌ FCM Failed: 1
📱 Mobile Notifications: 0
```

### **After:**
```
✅ FCM Sent: 1
📱 Mobile Notifications: 1
```

## 🔄 **Ongoing Maintenance**

### **1. Automatic Token Refresh**
- App refreshes token on every launch
- Token refresh listener updates backend automatically

### **2. Periodic Cleanup**
- Run cleanup script weekly/monthly
- Remove tokens that haven't been used in 30+ days

### **3. Monitoring**
- Track FCM success/failure rates
- Alert when failure rate exceeds threshold
- Log invalid tokens for analysis

## 🎯 **Quick Fix for Current Issue**

**Immediate Action:**
1. Ask affected users to **logout and login again**
2. This will generate a new FCM token
3. New token will be saved to database
4. Notifications will work again

**Long-term Solution:**
1. Implement automatic token refresh (Step 3 above)
2. Add token validation before sending notifications
3. Automatically remove invalid tokens
4. Monitor FCM delivery rates

## 📱 **User Instructions**

If users are not receiving notifications:

1. **Check Notification Permissions**
   - Go to device Settings → Apps → Your App → Notifications
   - Ensure notifications are enabled

2. **Refresh Token**
   - Logout from the app
   - Login again
   - This generates a new FCM token

3. **Reinstall App** (if needed)
   - Uninstall the app
   - Reinstall from store
   - Login again

## 🔐 **Security Considerations**

- Never expose FCM tokens in logs (use token preview)
- Validate tokens before storing
- Remove tokens on user logout
- Implement rate limiting on token refresh endpoint

## 📈 **Success Metrics**

Track these metrics to measure improvement:

- **FCM Success Rate**: Should be > 95%
- **Invalid Token Rate**: Should be < 5%
- **Notification Delivery Time**: Should be < 5 seconds
- **User Engagement**: Track notification open rates

---

## 🚀 **Implementation Checklist**

- [ ] Add FCM token management routes to backend
- [ ] Register routes in index.js
- [ ] Update Flutter app with token refresh logic
- [ ] Run cleanup script to remove invalid tokens
- [ ] Test token refresh endpoint
- [ ] Monitor FCM delivery rates
- [ ] Document process for team
- [ ] Set up automated cleanup job

Once implemented, your FCM notification delivery rate should improve significantly!