# 🔥 Firebase Auth Removal - Comprehensive Find & Replace Guide

## 📋 System Context

**Current Architecture:**
- ✅ JWT Authentication via `AuthRepository`
- ✅ User info stored in `UserEntity` (id, email, name, role, phoneNumber)
- ✅ JWT token stored in SharedPreferences as 'jwt_token'
- ✅ Pure MongoDB + Node.js + JWT (No Firebase)

**Key Files:**
- `lib/features/auth/domain/repositories/auth_repository.dart` - Main auth interface
- `lib/features/auth/data/repositories/jwt_auth_repository_impl.dart` - JWT implementation
- `lib/features/auth/domain/entities/user_entity.dart` - User model

---

## 🎯 10 Common Patterns to Replace

### Pattern 1: Getting Current User

**OLD:**
```dart
final user = FirebaseAuth.instance.currentUser;
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final user = authRepo.currentUser;
```

**When to use:** Any time you need to access the logged-in user's information.

---

### Pattern 2: Getting Auth Token

**OLD:**
```dart
final user = FirebaseAuth.instance.currentUser;
final token = await user?.getIdToken();
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final token = await authRepo.getAuthToken();
```

**When to use:** Before making API calls that require authentication.

---

### Pattern 3: Check if User is Logged In

**OLD:**
```dart
if (FirebaseAuth.instance.currentUser != null) {
  // User is logged in
}
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
if (authRepo.currentUser != UserEntity.empty) {
  // User is logged in
}
```

**Alternative (for boolean checks):**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final isLoggedIn = authRepo.currentUser.id.isNotEmpty;
```

---

### Pattern 4: Get User Email

**OLD:**
```dart
final email = FirebaseAuth.instance.currentUser?.email;
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final email = authRepo.currentUser.email;
```

---

### Pattern 5: Get User UID

**OLD:**
```dart
final uid = FirebaseAuth.instance.currentUser?.uid;
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final uid = authRepo.currentUser.id;
```

**Note:** `uid` becomes `id` in UserEntity.

---

### Pattern 6: Sign Out

**OLD:**
```dart
await FirebaseAuth.instance.signOut();
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
await authRepo.signOut();
```

---

### Pattern 7: Sign In (if used directly)

**OLD:**
```dart
await FirebaseAuth.instance.signInWithEmailAndPassword(
  email: email,
  password: password,
);
```

**NEW:**
```dart
final authRepo = Provider.of<AuthRepository>(context, listen: false);
await authRepo.signInWithEmailAndPassword(
  email: email,
  password: password,
);
```

---

### Pattern 8: Import Statements

**OLD:**
```dart
import 'package:firebase_auth/firebase_auth.dart';
```

**NEW:**
```dart
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:provider/provider.dart';
import 'package:abra_fleet/features/auth/domain/entities/user_entity.dart';
```

**Note:** Only import what you need. If you only check user status, you might not need all three.

---

### Pattern 9: FirebaseAuthException

**OLD:**
```dart
try {
  // auth operation
} on FirebaseAuthException catch (e) {
  print('Auth error: ${e.message}');
}
```

**NEW:**
```dart
try {
  // auth operation
} catch (e) {
  print('Auth error: $e');
  // Handle auth errors generically
}
```

**Alternative (if you want specific error handling):**
```dart
try {
  // auth operation
} on Exception catch (e) {
  if (e.toString().contains('401') || e.toString().contains('Unauthorized')) {
    print('Authentication failed');
  } else {
    print('Auth error: $e');
  }
}
```

---

### Pattern 10: User? Type Declarations

**OLD:**
```dart
User? currentUser;
final User? user = FirebaseAuth.instance.currentUser;
```

**NEW:**
```dart
UserEntity currentUser = UserEntity.empty;
final UserEntity user = authRepo.currentUser;
```

**Note:** `UserEntity` is never null; use `UserEntity.empty` as the default.

---

## 📝 Systematic Replacement Checklist

### Phase 1: Preparation (5 minutes)
- [ ] Backup your current code (commit to git)
- [ ] Ensure backend is running and JWT auth is working
- [ ] Test login/logout flow manually before starting
- [ ] Close all running Flutter apps

### Phase 2: Import Cleanup (10-15 minutes)
- [ ] Search for `import 'package:firebase_auth/firebase_auth.dart';` across all files
- [ ] Replace with appropriate imports (Pattern 8)
- [ ] Remove unused Firebase imports

### Phase 3: Variable Declarations (15-20 minutes)
- [ ] Search for `User?` type declarations
- [ ] Replace with `UserEntity` (Pattern 10)
- [ ] Search for `User ` (with space) to catch non-nullable declarations
- [ ] Update to `UserEntity`

### Phase 4: Current User Access (20-30 minutes)
- [ ] Search for `FirebaseAuth.instance.currentUser`
- [ ] Replace with Provider-based access (Pattern 1)
- [ ] Pay attention to context availability
- [ ] For StatelessWidget: use `context` parameter
- [ ] For StatefulWidget: use `context` from build method or widget tree

### Phase 5: Token Retrieval (10-15 minutes)
- [ ] Search for `getIdToken()`
- [ ] Replace with `authRepo.getAuthToken()` (Pattern 2)
- [ ] Ensure async/await is properly used

### Phase 6: User Properties (15-20 minutes)
- [ ] Search for `.uid` and replace with `.id` (Pattern 5)
- [ ] Search for `.email` and update context (Pattern 4)
- [ ] Search for `.displayName` - map to `.name` if needed
- [ ] Search for `.phoneNumber` - already exists in UserEntity

### Phase 7: Authentication Checks (10-15 minutes)
- [ ] Search for `!= null` checks on Firebase user
- [ ] Replace with `!= UserEntity.empty` (Pattern 3)
- [ ] Search for `== null` checks
- [ ] Replace with `== UserEntity.empty`

### Phase 8: Sign Out Operations (5-10 minutes)
- [ ] Search for `FirebaseAuth.instance.signOut()`
- [ ] Replace with `authRepo.signOut()` (Pattern 6)

### Phase 9: Exception Handling (10-15 minutes)
- [ ] Search for `FirebaseAuthException`
- [ ] Replace with generic exception handling (Pattern 9)
- [ ] Update error messages to be Firebase-agnostic

### Phase 10: Testing & Validation (30-45 minutes)
- [ ] Run `flutter clean`
- [ ] Run `flutter pub get`
- [ ] Run `flutter analyze` - fix any errors
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test authenticated API calls
- [ ] Test navigation after login
- [ ] Test token refresh scenarios

---

## ⚠️ Special Cases to Watch Out For

### Case 1: Context Not Available
**Problem:** Using Provider in initState or outside widget tree

**Solution:**
```dart
// BAD - No context in initState
@override
void initState() {
  super.initState();
  final authRepo = Provider.of<AuthRepository>(context, listen: false); // ❌ Error
}

// GOOD - Use didChangeDependencies or build method
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  final authRepo = Provider.of<AuthRepository>(context, listen: false); // ✅
}

// ALTERNATIVE - Pass as parameter
void _loadData(BuildContext context) {
  final authRepo = Provider.of<AuthRepository>(context, listen: false);
}
```

### Case 2: Null Safety Issues
**Problem:** UserEntity is never null, but old code expects null

**Solution:**
```dart
// OLD
if (user != null) {
  print(user.email);
}

// NEW - Check for empty instead
if (user != UserEntity.empty && user.id.isNotEmpty) {
  print(user.email);
}
```

### Case 3: Stream Listeners
**Problem:** Firebase had `authStateChanges()` stream

**Solution:**
```dart
// OLD
FirebaseAuth.instance.authStateChanges().listen((User? user) {
  // Handle auth state change
});

// NEW - Use Provider with Consumer or watch
Consumer<AuthRepository>(
  builder: (context, authRepo, child) {
    final user = authRepo.currentUser;
    // Handle user state
    return YourWidget();
  },
)
```

### Case 4: Async Operations in Build Method
**Problem:** Can't use async/await directly in build

**Solution:**
```dart
// BAD
@override
Widget build(BuildContext context) {
  final token = await authRepo.getAuthToken(); // ❌ Can't await in build
}

// GOOD - Use FutureBuilder
@override
Widget build(BuildContext context) {
  final authRepo = Provider.of<AuthRepository>(context, listen: false);
  
  return FutureBuilder<String?>(
    future: authRepo.getAuthToken(),
    builder: (context, snapshot) {
      if (snapshot.hasData) {
        final token = snapshot.data;
        // Use token
      }
      return YourWidget();
    },
  );
}
```

### Case 5: Multiple Provider Access
**Problem:** Need to access AuthRepository in multiple places

**Solution:**
```dart
// OPTION 1 - Store reference (if context available)
final authRepo = Provider.of<AuthRepository>(context, listen: false);
final user = authRepo.currentUser;
final token = await authRepo.getAuthToken();

// OPTION 2 - Use Consumer for reactive updates
Consumer<AuthRepository>(
  builder: (context, authRepo, child) {
    return Text('User: ${authRepo.currentUser.email}');
  },
)
```

### Case 6: Testing Scenarios
**Problem:** Tests might mock FirebaseAuth

**Solution:**
```dart
// Update test mocks to use AuthRepository
final mockAuthRepo = MockAuthRepository();
when(mockAuthRepo.currentUser).thenReturn(testUser);
when(mockAuthRepo.getAuthToken()).thenAnswer((_) async => 'test_token');
```

---

## ✅ Validation Steps

### Step 1: Compilation Check
```bash
flutter clean
flutter pub get
flutter analyze
```

**Expected:** No errors related to Firebase Auth

### Step 2: Import Verification
```bash
# Search for remaining Firebase Auth imports
grep -r "firebase_auth" lib/
```

**Expected:** No results (or only in commented code)

### Step 3: Type Check
```bash
# Search for Firebase User type
grep -r "User?" lib/ | grep -v "UserEntity"
grep -r "User " lib/ | grep -v "UserEntity" | grep -v "// User"
```

**Expected:** No Firebase User types remaining

### Step 4: Functional Testing

**Test Checklist:**
- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → Error message
- [ ] Logout → Returns to login screen
- [ ] Access protected route while logged in → Success
- [ ] Access protected route while logged out → Redirect to login
- [ ] API call with token → Success (200 response)
- [ ] API call without token → Unauthorized (401 response)
- [ ] Token refresh on expiry → Automatic re-authentication
- [ ] User profile display → Shows correct user data
- [ ] Role-based navigation → Correct dashboard for user role

### Step 5: Edge Case Testing
- [ ] App restart while logged in → User stays logged in
- [ ] App restart while logged out → Shows login screen
- [ ] Network error during login → Proper error handling
- [ ] Token expiry during session → Graceful re-authentication
- [ ] Multiple rapid API calls → All use valid token

---

## 🔍 Quick Search Commands

### Find All Firebase Auth References
```bash
# In project root
grep -r "FirebaseAuth" lib/
grep -r "firebase_auth" lib/
grep -r "User?" lib/ | grep -v "UserEntity"
grep -r "getIdToken" lib/
grep -r "FirebaseAuthException" lib/
```

### Count Remaining Issues
```bash
grep -r "FirebaseAuth" lib/ | wc -l
```

**Expected:** 0 after completion

---

## 📊 Progress Tracking Template

Create a file `FIREBASE_AUTH_REMOVAL_PROGRESS.md`:

```markdown
# Firebase Auth Removal Progress

## Files Completed: 0 / 71

### Phase 1: Import Cleanup
- [ ] File 1
- [ ] File 2
...

### Phase 2: Variable Declarations
- [ ] File 1
- [ ] File 2
...

### Issues Encountered:
1. [Issue description] - [Solution]
2. [Issue description] - [Solution]

### Testing Results:
- [ ] Login: ✅ / ❌
- [ ] Logout: ✅ / ❌
- [ ] API Calls: ✅ / ❌
- [ ] Navigation: ✅ / ❌
```

---

## 🚀 Quick Start Script

For automated search and replace (use with caution):

```bash
#!/bin/bash
# firebase_auth_cleanup.sh

echo "Starting Firebase Auth cleanup..."

# Backup
git add .
git commit -m "Backup before Firebase Auth removal"

# Replace imports (manual review recommended)
find lib/ -name "*.dart" -exec sed -i.bak \
  's/import.*firebase_auth.*;//g' {} \;

# Clean backup files
find lib/ -name "*.bak" -delete

echo "Automated cleanup complete. Manual review required!"
echo "Run: flutter analyze"
```

**⚠️ Warning:** Always review changes manually before committing!

---

## 📞 Support & Troubleshooting

### Common Errors

**Error 1:** `Provider.of() called with a context that does not contain a AuthRepository`
- **Solution:** Ensure AuthRepository is provided in main.dart or parent widget

**Error 2:** `The getter 'uid' isn't defined for the type 'UserEntity'`
- **Solution:** Replace `.uid` with `.id`

**Error 3:** `A value of type 'UserEntity' can't be compared to null`
- **Solution:** Use `UserEntity.empty` instead of null checks

**Error 4:** `Unhandled Exception: type 'Null' is not a subtype of type 'String'`
- **Solution:** Check for empty UserEntity before accessing properties

---

## 🎉 Completion Checklist

- [ ] All 71 files updated
- [ ] No Firebase Auth imports remaining
- [ ] All compilation errors resolved
- [ ] `flutter analyze` shows no warnings
- [ ] All functional tests passing
- [ ] Edge case tests passing
- [ ] Code committed to version control
- [ ] Team notified of changes
- [ ] Documentation updated

---

## 📚 Reference Files

**Key Implementation Files:**
1. `lib/features/auth/domain/repositories/auth_repository.dart` - Interface
2. `lib/features/auth/data/repositories/jwt_auth_repository_impl.dart` - JWT implementation
3. `lib/features/auth/domain/entities/user_entity.dart` - User model
4. `lib/main.dart` - Provider setup

**Example Migration:**
See `lib/features/auth/presentation/screens/login_screen.dart` for complete example.

---

**Last Updated:** January 16, 2026
**Status:** Ready for implementation
**Estimated Time:** 3-4 hours for 71 files
