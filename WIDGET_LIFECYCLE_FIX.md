# Widget Lifecycle Error Fix

## Problem
You're getting this error:
```
❌ Error assigning rosters: Looking up a deactivated widget's ancestor is unsafe.
```

This happens when trying to show a SnackBar after the widget has been disposed (user navigated away).

## Root Cause
The code checks `if (mounted)` but still uses `context` which might be invalid after async operations complete.

## Solution

Replace the `_showSnackBar` helper method I just added with this improved version:

### Step 1: Update the Helper Method

Find this code in `pending_rosters_screen.dart` (around line 75):

```dart
  // ==========================================
  // HELPER: SAFE SNACKBAR DISPLAY
  // ==========================================
  
  void _showSnackBar(String message, {Color? backgroundColor}) {
    if (!mounted || !context.mounted) {
      debugPrint('⚠️ Cannot show SnackBar: Widget not mounted');
      return;
    }
    
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: backgroundColor,
          duration: const Duration(seconds: 4),
        ),
      );
    } catch (e) {
      debugPrint('❌ Error showing SnackBar: $e');
    }
  }
```

**Replace it with:**

```dart
  // ==========================================
  // HELPER: SAFE SNACKBAR DISPLAY
  // ==========================================
  
  void _showSnackBar(String message, {Color? backgroundColor}) {
    // Check if widget is still mounted AND context is valid
    if (!mounted) {
      debugPrint('⚠️ Cannot show SnackBar: Widget not mounted');
      return;
    }
    
    // Use WidgetsBinding to ensure we're in a safe state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      
      try {
        // Double-check context is still valid
        final scaffold = ScaffoldMessenger.maybeOf(context);
        if (scaffold != null) {
          scaffold.showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: backgroundColor,
              duration: const Duration(seconds: 4),
            ),
          );
        } else {
          debugPrint('⚠️ No ScaffoldMessenger found in context');
        }
      } catch (e) {
        debugPrint('❌ Error showing SnackBar: $e');
      }
    });
  }
```

### Step 2: Replace All Direct SnackBar Calls

Now find and replace ALL occurrences of this pattern:

**FIND:**
```dart
if (mounted) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('some message'),
      backgroundColor: someColor,
    ),
  );
}
```

**REPLACE WITH:**
```dart
_showSnackBar('some message', backgroundColor: someColor);
```

### Step 3: Specific Replacements Needed

1. **Line ~390** (_confirmRouteAssignment):
```dart
// OLD:
if (mounted) {
  final successCount = result['successCount'] ?? rosterIds.length;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('✅ Successfully assigned $successCount customers to vehicle!\n📧 Notifications sent to customers and driver.'),
      backgroundColor: Colors.green,
      duration: const Duration(seconds: 4),
    ),
  );
}

// NEW:
final successCount = result['successCount'] ?? rosterIds.length;
_showSnackBar(
  '✅ Successfully assigned $successCount customers to vehicle!\n📧 Notifications sent to customers and driver.',
  backgroundColor: Colors.green,
);
```

2. **Line ~400** (error handler):
```dart
// OLD:
if (mounted) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('Assignment failed: ${e.toString()}'),
      backgroundColor: Colors.red,
    ),
  );
}

// NEW:
_showSnackBar(
  'Assignment failed: ${e.toString()}',
  backgroundColor: Colors.red,
);
```

3. **Line ~675** (_confirmManualAssignment):
```dart
// Same pattern - replace with _showSnackBar
```

4. **Line ~690** (error handler):
```dart
// Same pattern - replace with _showSnackBar
```

5. **Line ~720** (no drivers found):
```dart
// OLD:
if (mounted) {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('No suitable drivers found nearby.')),
  );
}

// NEW:
_showSnackBar('No suitable drivers found nearby.');
```

6. **Line ~735** (smart assignment error):
```dart
// Same pattern - replace with _showSnackBar
```

7. **Line ~800** (dialog success):
```dart
// OLD:
Navigator.pop(context);
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(
    content: Text('Assigned ${assignments.length} rosters to drivers'),
    backgroundColor: Colors.green,
  ),
);

// NEW:
Navigator.pop(context);
_showSnackBar(
  'Assigned ${assignments.length} rosters to drivers',
  backgroundColor: Colors.green,
);
```

8. **Line ~910** (load error):
```dart
// Same pattern - replace with _showSnackBar
```

9. **Line ~2240** (bulk assignment success):
```dart
// Same pattern - replace with _showSnackBar
```

10. **Line ~2255** (bulk assignment error):
```dart
// Same pattern - replace with _showSnackBar
```

## Why This Works

1. **`maybeOf` instead of `of`**: Returns `null` if no ScaffoldMessenger found instead of throwing error
2. **`addPostFrameCallback`**: Ensures we're not in the middle of a build cycle
3. **Double `mounted` check**: Once before scheduling, once before executing
4. **Try-catch**: Catches any remaining edge cases

## Testing

After making these changes:
1. Assign rosters to a vehicle
2. Immediately navigate away (press back button)
3. The error should no longer appear
4. SnackBars will only show if you're still on the screen

## Alternative Quick Fix

If you don't want to update all occurrences, just wrap the existing code:

```dart
if (mounted) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    final scaffold = ScaffoldMessenger.maybeOf(context);
    scaffold?.showSnackBar(/* your snackbar */);
  });
}
```

But the helper method approach is cleaner and more maintainable.
