# JWT "Invalid Algorithm" Error - FIX 🔧

## Problem
After login, all API requests are failing with:
```
❌ JWT TOKEN VERIFICATION FAILED
Error Message: invalid algorithm
Error Name: JsonWebTokenError
```

## Root Cause
Your Flutter app is using an **OLD TOKEN** that was created with:
- Firebase authentication (uses RS256 algorithm)
- A different JWT system
- Or the token is corrupted

The backend now expects JWT tokens signed with **HS256** algorithm (the default).

## Solution: Clear Old Tokens and Re-login

### Option 1: Clear App Data (Easiest)
1. **On Android/iOS**: Uninstall and reinstall the app
2. **On Web**: Clear browser storage:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear all storage (Local Storage, Session Storage, IndexedDB)
   - Refresh the page

### Option 2: Add Logout Button (Recommended)
Add a logout function that clears the stored token:

```dart
// In your auth service or repository
Future<void> logout() async {
  final storage = FlutterSecureStorage();
  
  // Clear all stored auth data
  await storage.delete(key: 'auth_token');
  await storage.delete(key: 'user_data');
  await storage.deleteAll(); // Clear everything
  
  // Navigate to login screen
  // Navigator.pushReplacementNamed(context, '/login');
}
```

### Option 3: Force Token Refresh on Algorithm Error

Update your API service to detect this error and auto-logout:

```dart
// In api_service.dart or wherever you handle API errors
if (response.statusCode == 401) {
  final body = jsonDecode(response.body);
  
  // Check for invalid algorithm error
  if (body['code'] == 'INVALID_TOKEN' || 
      body['message']?.contains('algorithm') == true) {
    
    // Clear token and redirect to login
    await _authRepository.logout();
    // Navigate to login
  }
}
```

## Quick Test Steps

1. **Clear browser/app storage** (see Option 1 above)
2. **Login again** with:
   - Email: `admin@abrafleet.com`
   - Password: `admin123`
3. **Verify** the new token works by navigating to any protected page

## Technical Details

### Why This Happens
- **Firebase tokens** use RS256 (asymmetric encryption with public/private keys)
- **Our JWT tokens** use HS256 (symmetric encryption with a shared secret)
- The backend cannot verify a Firebase token because it's looking for HS256

### Token Format Comparison
```
Firebase Token (RS256):
- Header: {"alg":"RS256","typ":"JWT"}
- Verified with: Public key

Our JWT Token (HS256):
- Header: {"alg":"HS256","typ":"JWT"}
- Verified with: Shared secret (JWT_SECRET)
```

## Verification

After clearing tokens and logging in again, you should see:
```
✅ JWT token verified successfully
   User ID: [your-user-id]
   User Email: admin@abrafleet.com
   User Role: super_admin
```

## Prevention

To prevent this in the future:
1. Always clear tokens when switching authentication systems
2. Add token validation on app startup
3. Implement automatic token refresh
4. Add better error handling for auth failures

---

**Status**: ⚠️ ACTION REQUIRED - Clear old tokens and login again
