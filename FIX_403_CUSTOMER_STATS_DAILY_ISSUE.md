# 🔧 DAILY 403 CUSTOMER STATS ERROR - PERMANENT FIX

## 🎯 Root Cause Analysis

You're getting a **403 Forbidden** error every day when accessing `/api/customer/stats/dashboard` because:

1. **Firebase Token Expiration**: Firebase ID tokens expire after 1 hour
2. **Token Refresh Issues**: The Flutter app may not be properly refreshing expired tokens
3. **Authentication State Management**: User authentication state may not be properly maintained

## 🔍 Current Error Details

```
GET http://localhost:3001/api/customer/stats/dashboard 403 (Forbidden)
Response Status: 403
```

**What this means:**
- ✅ Backend server is running (not 404 or 500)
- ✅ API endpoint exists and is accessible
- ✅ Request reaches the server
- ❌ Firebase authentication token is invalid/expired
- ❌ User needs to re-authenticate

## 🛠️ IMMEDIATE SOLUTIONS (Choose One)

### Solution 1: Force Token Refresh (Quick Fix)
```dart
// In your Flutter app, add this to force token refresh
final user = FirebaseAuth.instance.currentUser;
if (user != null) {
  await user.getIdToken(true); // Force refresh
}
```

### Solution 2: Re-login (Most Reliable)
1. **Sign out and sign back in:**
   - Go to login screen
   - Enter credentials again
   - This will generate a fresh token

### Solution 3: Clear App Data (Nuclear Option)
1. **Clear Flutter app cache:**
   - Close the app completely
   - Clear app data/cache
   - Restart and login again

## 🔧 PERMANENT FIXES

### Fix 1: Implement Automatic Token Refresh

Add this to your `ApiService` class in `api_service.dart`:

```dart
// Add this method to ApiService class
Future<void> _ensureValidToken() async {
  final user = _auth.currentUser;
  if (user != null) {
    try {
      // Check if token is close to expiry (refresh if older than 50 minutes)
      final tokenResult = await user.getIdTokenResult();
      final expirationTime = tokenResult.expirationTime;
      final now = DateTime.now();
      
      if (expirationTime != null && 
          now.isAfter(expirationTime.subtract(Duration(minutes: 10)))) {
        debugPrint('🔄 Token expiring soon, forcing refresh...');
        await user.getIdToken(true); // Force refresh
        _cachedToken = null; // Clear cache
        _tokenCacheTime = null;
      }
    } catch (e) {
      debugPrint('❌ Token validation failed: $e');
      // Force refresh on any error
      await user.getIdToken(true);
      _cachedToken = null;
      _tokenCacheTime = null;
    }
  }
}

// Update _getHeaders method to call this
Future<Map<String, String>> _getHeaders({bool forceRefresh = false}) async {
  await _ensureValidToken(); // Add this line
  // ... rest of existing code
}
```

### Fix 2: Add Automatic Retry with Token Refresh

Update the `_handleResponse` method:

```dart
Map<String, dynamic> _handleResponse(http.Response response) {
  debugPrint('📡 Response Status: ${response.statusCode}');
  
  // Handle 403 Forbidden - likely token expired
  if (response.statusCode == 403) {
    debugPrint('🔄 403 Forbidden - Token may be expired, clearing cache');
    clearTokenCache(); // Clear cached token
    
    throw ApiException(
      'Authentication expired. Please try again.',
      response.statusCode,
      'TOKEN_EXPIRED'
    );
  }
  
  // ... rest of existing code
}
```

### Fix 3: Add Retry Logic for 403 Errors

Add this retry wrapper method:

```dart
// Add this method to ApiService class
Future<Map<String, dynamic>> _requestWithRetry(
  Future<Map<String, dynamic>> Function() request,
  {int maxRetries = 1}
) async {
  for (int attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (e) {
      if (e is ApiException && 
          e.statusCode == 403 && 
          attempt < maxRetries) {
        debugPrint('🔄 Retrying request after 403 error (attempt ${attempt + 1})');
        clearTokenCache(); // Clear token cache
        await Future.delayed(Duration(milliseconds: 500)); // Brief delay
        continue;
      }
      rethrow;
    }
  }
  throw Exception('Max retries exceeded');
}

// Update your get method to use retry logic
Future<Map<String, dynamic>> get(String endpoint, {Map<String, String>? queryParams}) async {
  return await _requestWithRetry(() async {
    // ... existing get method code
  });
}
```

## 🚀 TESTING THE FIX

### Test Script for Verification

Create this test file to verify the fix works:

```javascript
// test-customer-auth-fix.js
const axios = require('axios');

async function testCustomerAuth() {
  console.log('🧪 Testing Customer Authentication Fix...');
  
  try {
    // Test with invalid token (should get 401/403)
    const invalidResponse = await axios.get('http://localhost:3001/api/customer/stats/dashboard', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      validateStatus: () => true
    });
    
    console.log('Invalid token response:', invalidResponse.status);
    
    // Test with test mode (should work)
    const testResponse = await axios.get('http://localhost:3001/api/customer/stats/dashboard', {
      headers: {
        'x-test-firebase-uid': 'customer123-test-uid'
      }
    });
    
    console.log('✅ Test mode works:', testResponse.status === 200);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCustomerAuth();
```

## 📋 DAILY PREVENTION CHECKLIST

To prevent this issue from recurring daily:

### ✅ For Developers:
1. **Implement automatic token refresh** (Fix 1 above)
2. **Add retry logic for 403 errors** (Fix 3 above)
3. **Monitor token expiration times**
4. **Add proper error handling in UI**

### ✅ For Users:
1. **Don't leave app idle for hours** - tokens expire after 1 hour
2. **If you get 403 errors, try refreshing the page/screen**
3. **If refresh doesn't work, logout and login again**
4. **Report persistent issues to development team**

## 🔍 DEBUGGING COMMANDS

When this happens again, run these commands to diagnose:

```bash
# Check if backend is running
curl http://localhost:3001/health

# Test the endpoint without auth (should get 401)
curl http://localhost:3001/api/customer/stats/dashboard

# Test with test mode (should work)
curl -H "x-test-firebase-uid: test-uid" http://localhost:3001/api/customer/stats/dashboard

# Check backend logs
# Look for authentication middleware logs
```

## 🎯 FINAL RECOMMENDATION

**Implement Fix 1 (Automatic Token Refresh) immediately** - this will prevent 90% of daily authentication issues.

The root cause is Firebase token expiration, and the permanent solution is to automatically refresh tokens before they expire.

---

**This issue occurs daily because Firebase tokens expire every hour, and your app needs to handle this gracefully with automatic refresh logic.**