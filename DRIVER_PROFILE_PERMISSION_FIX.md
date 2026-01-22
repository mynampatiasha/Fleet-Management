# Driver Profile Permission Fix

## Problem
The driver profile page shows "Error: [cloud_firestore/permission-denied] Missing or insufficient permissions" when drivers try to access their profile.

## Root Cause
The issue occurs because:
1. The driver is authenticated with Firebase Auth using email/password
2. The Firestore security rules don't properly allow drivers to access their own profile data
3. There might be a mismatch between Firebase Auth UID and Firestore document structure

## Solution

### 1. Updated Firestore Rules
I've updated the Firestore rules in `abra_fleet/firestore.rules` to include:

```javascript
// ✅ DRIVER FIX: Allow drivers to read their own profile by email lookup
allow read: if isAuthenticated() && 
               resource.data.role == 'driver' && 
               resource.data.email == request.auth.token.email;

// ✅ DRIVER UPDATE FIX: Allow drivers to update their own profile by email lookup
allow update: if isAuthenticated() && 
                 resource.data.role == 'driver' && 
                 resource.data.email == request.auth.token.email &&
                 request.resource.data.role == 'driver';
```

### 2. Deploy Updated Rules
You need to deploy the updated Firestore rules:

```bash
# If using Firebase CLI
firebase deploy --only firestore:rules

# Or update rules directly in Firebase Console
# Go to Firestore > Rules and paste the updated rules
```

### 3. Verify Driver Data Structure
Run the check script to verify driver data exists:

```bash
node check-driver-firestore-profile.js
```

### 4. Create Test Driver (if needed)
If no driver exists for testing:

```bash
node create-test-driver.js
```

This creates a test driver with:
- Email: `drivertest@abrafleet.com`
- Password: `driver123`

### 5. Test the Fix
1. Deploy the updated Firestore rules
2. Login as a driver using email/password
3. Navigate to the profile page
4. The permission error should be resolved

## Technical Details

### The Issue
The driver profile page uses this code to fetch driver data:
```dart
Future<DocumentSnapshot<Map<String, dynamic>>> _fetchDriverProfile() async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) throw Exception('No authenticated user found.');

  try {
    final userDoc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();

    if (userDoc.exists && userDoc.data()?['role'] == 'driver') {
      return userDoc;
    }

    // Fallback: Query by email
    final querySnapshot = await FirebaseFirestore.instance
        .collection('users')
        .where('email', isEqualTo: user.email)
        .where('role', isEqualTo: 'driver')
        .limit(1)
        .get();

    if (querySnapshot.docs.isNotEmpty) return querySnapshot.docs.first;

    throw Exception('Driver profile not found. Please contact admin.');
  } catch (e) {
    debugPrint('Error fetching driver profile: $e');
    rethrow;
  }
}
```

### The Fix
The updated Firestore rules now allow:
1. Drivers to read their own document by UID match
2. Drivers to read their own document by email match (for the fallback query)
3. Drivers to update their own profile data

## Verification Steps

1. **Check Firestore Rules**: Ensure the updated rules are deployed
2. **Verify Driver Data**: Run `node check-driver-firestore-profile.js`
3. **Test Login**: Login as driver and check profile page
4. **Check Browser Console**: Look for any remaining permission errors

## Alternative Solutions

If the issue persists, consider:

1. **Backend-Only Approach**: Modify the driver profile page to fetch data from MongoDB backend instead of Firestore
2. **Custom Claims**: Add custom claims to Firebase Auth tokens for role-based access
3. **Firestore Functions**: Use Cloud Functions to handle driver profile operations

## Files Modified
- `abra_fleet/firestore.rules` - Updated security rules
- `check-driver-firestore-profile.js` - Diagnostic script
- `create-test-driver.js` - Test driver creation script

## Next Steps
1. Deploy the updated Firestore rules
2. Test with existing driver accounts
3. Create test driver if needed
4. Verify profile page works correctly