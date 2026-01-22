# 🧪 Permission Management System - Testing Guide

## ✅ Pre-Testing Checklist

### Backend Setup
- [x] MongoDB connection configured in `.env`
- [x] Firebase service account key in place
- [x] User management routes registered (`/api/admin/users`)
- [x] Dependencies installed (`npm install`)

### Frontend Setup
- [x] API base URL configured
- [x] User management service created
- [x] User role admin access screen implemented
- [x] Custom permissions section visible

---

## 🚀 Step-by-Step Testing

### Step 1: Start Backend Server

```bash
cd abra_fleet_backend
node index.js
```

**Expected Output:**
```
✅ Connected to MongoDB Atlas!
🚀 Server running on port 3000
```

**If you see errors:**
- Check MongoDB connection string in `.env`
- Verify Firebase `serviceAccountKey.json` exists in `config/` folder

---

### Step 2: Start Flutter App

```bash
cd abra_fleet
flutter run
```

**Choose your platform:**
- Press `1` for Android
- Press `2` for iOS
- Press `3` for Web (Chrome)

---

### Step 3: Login as Admin

1. **Use existing admin credentials** or create one first
2. Navigate to Admin Dashboard
3. Look for "User Role Management" or "Role Access Control" menu

**Finding the Screen:**
- Check admin sidebar menu
- Or navigate directly if you have a route

---

### Step 4: Test User Role Management Screen

#### 4.1 Check UI Elements

Scroll through the screen and verify you see:

✅ **Basic Information Section**
- Full Name field
- Email Address field
- Phone Number field
- Password field

✅ **Quick Role Selection Section**
- 🔑 Super Admin card
- 👨‍💼 Admin card
- 🚗 Fleet Manager card
- ⚙️ Custom card

✅ **Summary Section**
- Shows selected permissions count
- Shows filters count
- Shows custom permissions count

✅ **Standard Permissions Section**
- 🚗 Vehicle Management module
- 💰 Billing & Invoices module
- 👥 Customer Management module
- Each with expandable permissions

✅ **Custom Permissions Section** (NEW!)
- Permission Name input
- Description input
- Module dropdown
- "Add Custom Permission" button
- List of added custom permissions

---

### Step 5: Test Creating a User with Standard Permissions

#### Test Case 1: Super Admin Role

1. Fill in basic info:
   ```
   Name: Test Super Admin
   Email: superadmin@test.com
   Phone: +91 9876543210
   Password: test123456
   ```

2. Click "🔑 Super Admin" role card

3. Verify:
   - All permissions are automatically selected
   - Summary shows all permissions selected

4. Click "💾 Save User"

5. Check console output for JSON data

6. **Expected Result:**
   - Success dialog appears
   - Console shows user data with all permissions
   - Backend creates user in Firebase + MongoDB

---

#### Test Case 2: Fleet Manager Role

1. Fill in basic info:
   ```
   Name: Test Fleet Manager
   Email: fleetmanager@test.com
   Phone: +91 9876543211
   Password: test123456
   ```

2. Click "🚗 Fleet Manager" role card

3. Verify:
   - Only vehicle management permissions are selected
   - Billing and customer permissions are NOT selected

4. Add filters to "View Vehicles" permission:
   - Click on "View Vehicles" checkbox
   - Select location filters: "Bangalore", "Delhi"
   - Add custom filter: "Only AC vehicles"

5. Click "💾 Save User"

6. **Expected Result:**
   - Success dialog appears
   - Console shows user with vehicle permissions and filters

---

#### Test Case 3: Custom Role with Filters

1. Fill in basic info:
   ```
   Name: Test Custom User
   Email: customuser@test.com
   Phone: +91 9876543212
   Password: test123456
   ```

2. Click "⚙️ Custom" role card

3. Manually select permissions:
   - Expand "🚗 Vehicle Management"
   - Check "View Vehicles"
   - Select filters: "Bangalore Only"
   - Add custom filter: "Registered after 2023"
   - Check "Add Vehicle"
   - Expand "💰 Billing & Invoices"
   - Check "View Billing"
   - Select filters: "Client A", "Up to ₹50,000"

4. Verify summary updates in real-time

5. Click "💾 Save User"

6. **Expected Result:**
   - Success dialog appears
   - Console shows selected permissions with filters

---

### Step 6: Test Custom Permissions (NEW!)

#### Test Case 4: Add Custom Permissions

1. Fill in basic info:
   ```
   Name: Test Custom Permissions
   Email: customperm@test.com
   Phone: +91 9876543213
   Password: test123456
   ```

2. Scroll down to "✨ Create Custom Permissions" section

3. Add first custom permission:
   ```
   Permission Name: Manage Bangalore Fleet Only
   Description: Full access to vehicles in Bangalore region
   Module: Vehicles
   ```
   Click "➕ Add Custom Permission"

4. Verify:
   - Permission appears in "Added Custom Permissions" list
   - Form fields are cleared
   - Summary count updates

5. Add second custom permission:
   ```
   Permission Name: Approve High Value Invoices
   Description: Can approve invoices above ₹1,00,000
   Module: Billing
   ```
   Click "➕ Add Custom Permission"

6. Verify:
   - Both permissions are listed
   - Each has a "Remove" button

7. Test remove functionality:
   - Click "Remove" on first permission
   - Verify it's removed from the list

8. Add it back and click "💾 Save User"

9. **Expected Result:**
   - Success dialog appears
   - Console shows customPermissions array with both permissions

---

### Step 7: Test Form Validation

#### Test Case 5: Empty Fields

1. Leave Name and Email empty
2. Click "💾 Save User"
3. **Expected**: Error message "❌ Please fill Name and Email"

#### Test Case 6: Empty Custom Permission Name

1. In custom permissions section, leave Permission Name empty
2. Click "➕ Add Custom Permission"
3. **Expected**: Error message "Please enter permission name"

---

### Step 8: Verify in Backend

#### Check MongoDB

1. Open MongoDB Compass or use mongo shell
2. Connect to your database
3. Navigate to `users` collection
4. Find the users you just created

**Expected Document Structure:**
```json
{
  "_id": "...",
  "name": "Test Custom User",
  "email": "customuser@test.com",
  "phone": "+91 9876543212",
  "password": "$2a$10$...", // Hashed
  "role": "custom",
  "standardPermissions": [
    {
      "permission": "view_vehicles",
      "filters": ["Bangalore Only"],
      "customFilters": ["Registered after 2023"]
    },
    {
      "permission": "add_vehicle",
      "filters": [],
      "customFilters": []
    }
  ],
  "customPermissions": [
    {
      "name": "Manage Bangalore Fleet Only",
      "description": "Full access to vehicles in Bangalore region",
      "module": "vehicles"
    }
  ],
  "firebaseUid": "...",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Check Firebase

1. Go to Firebase Console
2. Navigate to Authentication
3. Verify users are created with correct emails
4. Check custom claims (if visible)

---

### Step 9: Test Backend API Directly (Optional)

Use Postman or Thunder Client to test the API:

#### Get Auth Token First

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "firebaseUid": "YOUR_FIREBASE_UID",
  "email": "admin@abrafleet.com",
  "name": "Admin"
}
```

Copy the token from response.

#### Test Create User Endpoint

```
POST http://localhost:3000/api/admin/users
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "API Test User",
  "email": "apitest@test.com",
  "phone": "+91 9876543214",
  "password": "test123456",
  "role": "custom",
  "standardPermissions": [
    {
      "permission": "view_vehicles",
      "filters": ["Bangalore"],
      "customFilters": ["Only AC vehicles"]
    }
  ],
  "customPermissions": [
    {
      "name": "Test Custom Permission",
      "description": "Test description",
      "module": "vehicles"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... },
    "firebaseUid": "..."
  }
}
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to backend"

**Symptoms:**
- Network error in Flutter
- API calls fail

**Solutions:**
1. Check if backend server is running
2. Verify API base URL in `api_config.dart`:
   - Android Emulator: `http://10.0.2.2:3000`
   - iOS Simulator: `http://localhost:3000`
   - Real Device: `http://YOUR_LOCAL_IP:3000`
3. Check firewall settings

### Issue 2: "401 Unauthorized"

**Symptoms:**
- API returns 401 error
- "Unauthorized" message

**Solutions:**
1. Verify you're logged in as admin
2. Check if token is being saved in SharedPreferences
3. Verify token is included in API headers
4. Check token expiration (7 days)

### Issue 3: "Custom permissions section not visible"

**Symptoms:**
- Can't see custom permissions section

**Solutions:**
1. Scroll down to the bottom of the screen
2. Verify the fix was applied (check if `_buildCustomPermissionSection()` is called)
3. Hot reload the app: Press `r` in terminal

### Issue 4: "Firebase error: Email already exists"

**Symptoms:**
- Error when creating user with existing email

**Solutions:**
1. Use a different email address
2. Or delete the existing user from Firebase Console
3. Check if user exists in MongoDB and remove if needed

### Issue 5: "Database connection not established"

**Symptoms:**
- Backend returns 500 error
- "Database connection not established" message

**Solutions:**
1. Check MongoDB connection string in `.env`
2. Verify MongoDB Atlas network access (whitelist your IP)
3. Restart backend server

---

## ✅ Success Criteria

Your testing is successful if:

- [x] Backend server starts without errors
- [x] Flutter app runs and shows User Role Management screen
- [x] All UI sections are visible (including custom permissions)
- [x] Can select different roles and permissions auto-select
- [x] Can manually select/deselect permissions
- [x] Can add filters to permissions
- [x] Can add custom permissions
- [x] Can remove custom permissions
- [x] Form validation works
- [x] Save button creates user successfully
- [x] Success dialog appears
- [x] Console shows correct JSON data
- [x] User appears in MongoDB with correct structure
- [x] User appears in Firebase Authentication
- [x] Can create multiple users with different permissions

---

## 📊 Test Results Template

Use this to track your testing:

```
Date: _______________
Tester: _______________

Backend Server:
[ ] Started successfully
[ ] MongoDB connected
[ ] Routes registered

Frontend App:
[ ] App runs without errors
[ ] Navigation to screen works
[ ] All UI sections visible

Test Cases:
[ ] Test Case 1: Super Admin Role
[ ] Test Case 2: Fleet Manager Role
[ ] Test Case 3: Custom Role with Filters
[ ] Test Case 4: Add Custom Permissions
[ ] Test Case 5: Empty Fields Validation
[ ] Test Case 6: Empty Custom Permission Validation

Database Verification:
[ ] Users created in MongoDB
[ ] Correct document structure
[ ] Users created in Firebase
[ ] Passwords are hashed

Issues Found:
_________________________________________________
_________________________________________________
_________________________________________________

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🎯 Next Steps After Testing

Once testing is complete:

1. **Document any issues found**
2. **Test user login with created accounts**
3. **Implement permission checking in other screens**
4. **Add user list/edit screens**
5. **Deploy to production**

---

**Ready to test!** 🚀

Start with Step 1 and work through each test case systematically.

**Last Updated**: December 18, 2025
