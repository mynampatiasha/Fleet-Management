# 🧪 Abra Travel - Quick Testing Commands

## 🚀 Start Everything

```bash
# Terminal 1: Backend
cd abra_fleet_backend
node index.js

# Terminal 2: Initialize Roles (one-time)
cd abra_fleet_backend
node initialize-roles.js

# Terminal 3: Flutter
cd abra_fleet
flutter run
```

---

## 📡 API Testing (Postman/curl)

### 1. Initialize Roles (Run Once)
```bash
POST http://localhost:3000/api/roles/initialize
Authorization: Bearer YOUR_TOKEN
```

### 2. Get All Roles
```bash
GET http://localhost:3000/api/roles
Authorization: Bearer YOUR_TOKEN
```

### 3. Create User
```bash
POST http://localhost:3000/api/user-roles
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "role": "fleetManager"
}
```

### 4. Get All Users
```bash
GET http://localhost:3000/api/user-roles
Authorization: Bearer YOUR_TOKEN
```

### 5. Search Users
```bash
GET http://localhost:3000/api/user-roles/search?q=john
Authorization: Bearer YOUR_TOKEN
```

### 6. Update User
```bash
PUT http://localhost:3000/api/user-roles/:userId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "role": "operations"
}
```

### 7. Toggle Status
```bash
PATCH http://localhost:3000/api/user-roles/:userId/toggle-status
Authorization: Bearer YOUR_TOKEN
```

### 8. Delete User
```bash
DELETE http://localhost:3000/api/user-roles/:userId
Authorization: Bearer YOUR_TOKEN
```

---

## 🎯 Valid Role IDs

Use these in the `role` field:

- `superAdmin` - 👑 Super Admin
- `orgAdmin` - 🏢 Organization Admin
- `fleetManager` - 🚛 Fleet Manager
- `operations` - 📊 Operations Manager
- `hrManager` - 👥 HR Manager
- `finance` - 💰 Finance Admin

---

## ✅ Quick Verification

### Check Roles in MongoDB
```javascript
// MongoDB Compass or mongo shell
use abra_fleet
db.roles.find().pretty()
// Should show 6 roles
```

### Check Users in MongoDB
```javascript
use abra_fleet
db.userroles.find().pretty()
// Should show your created users
```

---

## 🔍 Debug Commands

### Check Backend Logs
```bash
# Backend should show:
✅ Connected to MongoDB Atlas!
🚀 Server running on port 3000
```

### Check Role Initialization
```bash
node initialize-roles.js

# Should show:
✅ Inserted 6 new roles
📋 Roles Created:
   👑 Super Admin (superAdmin)
   🏢 Organization Admin (orgAdmin)
   🚛 Fleet Manager (fleetManager)
   📊 Operations Manager (operations)
   👥 HR Manager (hrManager)
   💰 Finance Admin (finance)
```

---

## 📱 Flutter Testing

1. Run app: `flutter run`
2. Login as admin
3. Navigate to "User Role Management"
4. Should see:
   - 6 role cards with icons
   - User list (empty initially)
   - Create user button
5. Create a test user
6. Verify user appears in list
7. Test edit, delete, status toggle

---

## 🎉 Success Indicators

✅ Backend starts without errors
✅ Roles initialize successfully (6 roles)
✅ Can create users via API
✅ Can get users via API
✅ Flutter app shows role cards
✅ Can create users in Flutter
✅ Users appear in MongoDB

---

**Quick Reference**: Keep this file open while testing!
