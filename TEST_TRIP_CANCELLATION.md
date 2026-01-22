# Quick Test Guide - Trip Cancellation Management

## Prerequisites
- Backend server running on port 3000
- Admin user logged in to web app

## Test Steps

### 1. Navigate to Screen
1. Open admin dashboard
2. Click on "Customer Management" in sidebar
3. Click on "Trip Cancellation" submenu
4. **Expected**: Screen loads without blank page

### 2. Verify Screen Display

#### Scenario A: No Approved Leaves
**Expected Display**:
- ✅ Green checkmark icon
- ✅ "All Trips Processed" heading
- ✅ "No approved leave requests require trip cancellation." message

#### Scenario B: Approved Leaves Exist
**Expected Display**:
- ✅ Header with "Trip Cancellation Management" title
- ✅ Refresh button in header
- ✅ List of leave request cards showing:
  - Employee name and email
  - Leave period and duration
  - Number of trips to cancel
  - "Action Required" badge
  - "Cancel Trips" button

#### Scenario C: API Error
**Expected Display**:
- ✅ Red error icon
- ✅ Error message
- ✅ Retry button

### 3. Test Cancel Trips Dialog
1. Click "Cancel Trips" button on any leave request
2. **Expected**: Dialog opens showing:
   - Warning message
   - Leave request details
   - List of trips to be cancelled
   - Admin notes field (optional)
   - Cancel and "Cancel Trips" buttons

### 4. Check Debug Console
Open browser console (F12) and look for:
```
🔄 Fetching approved leave requests...
📊 Response received: ...
✅ Successfully fetched X approved leave requests
🔍 FutureBuilder state: ConnectionState.done
```

## Troubleshooting

### Blank Screen
1. Check browser console for errors
2. Verify backend is running: `netstat -ano | findstr :3000`
3. Check Flutter console for debug logs
4. Verify you're logged in as admin

### Loading Forever
1. Check network tab in browser dev tools
2. Verify API endpoint is being called
3. Check backend logs for errors
4. Verify authentication token is valid

### Error Message
1. Read the error message carefully
2. Check backend logs
3. Verify database connection
4. Check if leave requests exist in database

## Quick Backend Check
```bash
# Check if backend is running
netstat -ano | findstr :3000

# Test endpoint (requires admin token)
node abra_fleet_backend/test-trip-cancellation-screen.js
```

## Quick Frontend Check
```bash
# Run Flutter web app
cd abra_fleet
flutter run -d chrome
```

## Success Criteria
- ✅ Screen loads without blank page
- ✅ Appropriate message shown based on data
- ✅ No console errors
- ✅ Debug logs appear in console
- ✅ Can interact with UI elements
- ✅ Dialog opens when clicking "Cancel Trips"

## Common Issues Fixed
1. ✅ Blank screen - Added proper error handling
2. ✅ No feedback - Added loading indicators
3. ✅ Silent failures - Added debug logging
4. ✅ Performance - Added const keyword
