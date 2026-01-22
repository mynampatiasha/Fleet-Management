# Roster Delete 403 Error - Complete Fix

## Problem Summary
Users were getting a **403 Forbidden** error when trying to delete/cancel their own rosters with the message "Access denied - you can only cancel your own rosters".

## Root Cause Analysis

### The Issue
The DELETE endpoint `/api/roster/customer/:id` was using an outdated approach:

1. **Wrong Model Usage**: Using `Roster.findById()` (Mongoose model) instead of MongoDB direct queries
2. **Incorrect Ownership Check**: Checking `existingRoster.userId !== req.user.uid` but rosters don't have `userId` field
3. **Field Mismatch**: Rosters use `customerEmail` field, not `userId` for ownership
4. **Database Inconsistency**: Using Mongoose model operations instead of direct MongoDB operations like other endpoints

### Data Structure Reality
- **Rosters Collection**: Uses `customerEmail`, `employeeDetails.email`, `employeeData.email` for ownership
- **Admin Users Collection**: Uses `email`, `emailAddress`, `firebaseUid` for user identification
- **Ownership Logic**: Match user's email with roster's email fields, not Firebase UID with non-existent userId

## Complete Solution

### 1. Fixed Backend DELETE Endpoint

**File**: `abra_fleet_backend/routes/roster_router.js`

**Key Changes**:
- Replaced Mongoose model usage with direct MongoDB operations
- Fixed ownership verification using email matching instead of userId
- Added comprehensive logging for debugging
- Enhanced error handling and validation
- Added proper status checks (can't cancel completed/already cancelled rosters)

**New Logic**:
```javascript
// Find user in admin_users collection
const user = await db.collection('admin_users').findOne({ 
  $or: [
    { firebaseUid: req.user.uid },
    { email: req.user.email }
  ]
});

// Get user email
const userEmail = user.email || user.emailAddress || user.customerEmail;

// Find roster in MongoDB
const existingRoster = await db.collection('rosters').findOne({ 
  _id: new require('mongodb').ObjectId(rosterId)
});

// Check ownership using email fields
const rosterOwnerEmail = existingRoster.customerEmail || 
                        existingRoster.employeeDetails?.email || 
                        existingRoster.employeeData?.email;

if (!rosterOwnerEmail || rosterOwnerEmail !== userEmail) {
  return res.status(403).json({
    success: false,
    message: 'Access denied - you can only cancel your own rosters'
  });
}

// Update roster status in MongoDB
const updateResult = await db.collection('rosters').updateOne(
  { _id: new require('mongodb').ObjectId(rosterId) },
  {
    $set: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.user.uid,
      updatedAt: new Date()
    }
  }
);
```

### 2. Enhanced Error Handling

**Added Comprehensive Logging**:
- User lookup and email extraction
- Roster ownership verification
- Status validation
- MongoDB update operations
- Firebase sync operations

**Better Error Messages**:
- Clear distinction between "not found" and "access denied"
- Specific validation for already cancelled/completed rosters
- Detailed logging for troubleshooting

### 3. Validation Improvements

**Status Checks**:
- Cannot cancel completed rosters
- Cannot cancel already cancelled rosters
- Proper status transitions

**Ownership Verification**:
- Multiple email field fallbacks
- Clear ownership chain verification
- Detailed logging of ownership checks

## Testing

### 1. Debug Scripts Created

**`debug-roster-ownership.js`**:
- Analyzes roster and user data structures
- Identifies ownership patterns
- Helps troubleshoot email matching issues

**`test-roster-delete-fix.js`**:
- Complete end-to-end test of DELETE functionality
- Creates test roster, verifies deletion, checks status updates
- Tests edge cases (non-existent rosters, invalid tokens)

### 2. Test Scenarios Covered

1. **Successful Deletion**: User can cancel their own roster
2. **Ownership Verification**: Only roster owner can cancel
3. **Status Validation**: Cannot cancel completed/cancelled rosters
4. **Error Handling**: Proper 404 for non-existent rosters
5. **Authentication**: Proper 401 for invalid tokens

## Frontend Integration

The frontend `my_trips_screen.dart` already has the correct delete functionality:

```dart
Future<void> _handleDeleteRoster(String rosterId) async {
  // Show confirmation dialog
  final bool? confirmDelete = await showDialog<bool>(...);

  if (confirmDelete == true) {
    try {
      final success = await _rosterRepository.cancelRoster(rosterId);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Roster cancelled successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        _fetchMyRosters(); // Refresh the list
      }
    } catch (e) {
      // Show error message
    }
  }
}
```

The `RosterRepository.cancelRoster()` method calls the DELETE endpoint:

```dart
Future<bool> cancelRoster(String rosterId) async {
  try {
    final response = await _apiService.delete('/api/roster/customer/$rosterId');
    
    if (response['success'] == true) {
      return true;
    } else {
      throw Exception(response['message'] ?? 'Failed to cancel roster');
    }
  } catch (e) {
    rethrow;
  }
}
```

## Verification Steps

### 1. Backend Verification
```bash
# Test the debug script
node debug-roster-ownership.js

# Test the complete DELETE flow
node test-roster-delete-fix.js
```

### 2. Frontend Verification
1. Login as a customer
2. Create a roster
3. Go to My Trips screen
4. Try to delete the roster
5. Verify success message and roster status change

### 3. Expected Results
- ✅ 200 Success response for valid deletions
- ✅ Roster status changes to 'cancelled'
- ✅ Success message in frontend
- ✅ Roster list refreshes automatically
- ✅ 403 error only for actual ownership violations
- ✅ 404 error for non-existent rosters

## Key Improvements

### 1. Consistency
- All roster endpoints now use direct MongoDB operations
- Consistent email-based ownership verification
- Unified error handling patterns

### 2. Reliability
- Proper validation of roster status before deletion
- Comprehensive error handling
- Detailed logging for troubleshooting

### 3. User Experience
- Clear error messages
- Proper status updates
- Automatic UI refresh after deletion

### 4. Security
- Proper ownership verification
- Authentication validation
- Status-based operation restrictions

## Files Modified

1. **`abra_fleet_backend/routes/roster_router.js`**
   - Fixed DELETE `/api/roster/customer/:id` endpoint
   - Added comprehensive logging and error handling

2. **Test Scripts Created**:
   - `debug-roster-ownership.js` - Debug ownership patterns
   - `test-roster-delete-fix.js` - End-to-end DELETE testing

## Summary

The 403 error was caused by incorrect ownership verification logic in the DELETE endpoint. The fix involved:

1. **Replacing Mongoose model usage** with direct MongoDB operations
2. **Fixing ownership checks** to use email matching instead of non-existent userId
3. **Adding comprehensive validation** for roster status and user permissions
4. **Enhancing error handling** with detailed logging and clear messages

The solution ensures that customers can successfully delete their own rosters while maintaining proper security and validation. The fix is consistent with other endpoints in the system and provides a reliable user experience.