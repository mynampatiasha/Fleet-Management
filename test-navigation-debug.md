# Navigation Debug Test Guide

## Issue Description
- **Leave Management** button should navigate to `HrmLeaveRequestsScreen` but user reports it goes to "leave request page" (which might be correct)
- **Raise Ticket** button should navigate to `RaiseTicketScreen` but user reports it goes to "all tickets page" (which is incorrect)

## Debug Steps Added

### 1. Enhanced Navigation Logging
Added detailed debug logging to `_navigateToTab()` method that will show:
- Navigation key being used
- Screen index being navigated to
- Actual screen type being displayed
- Special logging for problematic navigation keys

### 2. Dropdown Click Logging
Added debug logging to both HRM and TMS dropdown menus that will show:
- Which menu item was clicked
- The navigation key being used
- The expected screen index

### 3. Screen Initialization Logging
Added logging during screen initialization to verify:
- Total number of screens
- Specific screen types at critical indices
- Navigation mapping verification

## How to Test

1. **Open the Flutter app in debug mode**
2. **Navigate to Admin Shell**
3. **Click on "Leave Management" in HRM dropdown**
   - Check debug console for logs starting with `🏢 HRM DROPDOWN CLICKED:`
   - Check for navigation logs starting with `🔍 NAVIGATION DEBUG:`
4. **Click on "Raise Ticket" in TMS dropdown**
   - Check debug console for logs starting with `🎫 TMS DROPDOWN CLICKED:`
   - Check for navigation logs starting with `🔍 NAVIGATION DEBUG:`

## Expected Debug Output

### For Leave Management (Should work correctly):
```
🏢 HRM DROPDOWN CLICKED:
   Title: Leave Requests
   NavKey: hrm_leave_requests
   Expected Index: 34
🔍 NAVIGATION DEBUG:
   Navigation Key: hrm_leave_requests
   Screen Index: 34
   Screen Type: HrmLeaveRequestsScreen
```

### For Raise Ticket (Should show the problem):
```
🎫 TMS DROPDOWN CLICKED:
   Title: Raise a Ticket
   NavKey: raise_ticket
   Expected Index: 36
🔍 NAVIGATION DEBUG:
   Navigation Key: raise_ticket
   Screen Index: 36
   Screen Type: RaiseTicketScreen (should be this)
   OR
   Screen Type: AllTicketsScreen (if there's a bug)
```

## Possible Issues to Look For

1. **Index Mismatch**: Screen array index doesn't match navigation mapping
2. **Screen Array Order**: Screens are not in the expected order in `_adminScreens` array
3. **Navigation Key Confusion**: Wrong navigation key being passed
4. **Caching Issue**: Old navigation state being cached

## Next Steps

After running the debug test:
1. Share the debug console output
2. If the logs show correct navigation but wrong screen appears, there might be a widget key or state issue
3. If the logs show wrong navigation, we can trace the exact cause