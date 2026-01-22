# 🚀 Quick Start - Abra Travel Role Management

## ⚡ 3-Step Setup

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

---

### Step 2: Initialize Roles (One-Time)

```bash
# In a new terminal
cd abra_fleet_backend
node initialize-roles.js
```

**Expected Output:**
```
🔧 Initializing Abra Travel Roles...
✅ Connected to MongoDB
🗑️  Deleted 0 existing roles
✅ Inserted 6 new roles

📋 Roles Created:
   👑 Super Admin (superAdmin)
   🏢 Organization Admin (orgAdmin)
   🚛 Fleet Manager (fleetManager)
   📊 Operations Manager (operations)
   👥 HR Manager (hrManager)
   💰 Finance Admin (finance)

✅ Role initialization complete!
```

---

### Step 3: Run Flutter App

```bash
cd abra_fleet
flutter run
```

Then navigate to **User Role Management** screen in your admin dashboard.

---

## 🧪 Quick API Tests

### Test 1: Get All Roles

```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Create a User

```bash
curl -X POST http://localhost:3000/api/user-roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91 9876543210",
    "role": "fleetManager"
  }'
```

### Test 3: Get All Users

```bash
curl -X GET http://localhost:3000/api/user-roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Flutter UI Features

Your Flutter app now has:

✅ **Role Cards** - Visual role selection with icons and colors
✅ **User List** - View all users with their roles
✅ **Search** - Find users by name or email
✅ **Create/Edit** - Add or modify users
✅ **Custom Permissions** - Assign specific permissions per user
✅ **Status Toggle** - Activate/deactivate users
✅ **User Count** - See how many users per role

---

## 🎯 Available Roles

| Icon | Role | ID | Color |
|------|------|-----|-------|
| 👑 | Super Admin | `superAdmin` | Red |
| 🏢 | Organization Admin | `orgAdmin` | Teal |
| 🚛 | Fleet Manager | `fleetManager` | Purple |
| 📊 | Operations Manager | `operations` | Blue |
| 👥 | HR Manager | `hrManager` | Green |
| 💰 | Finance Admin | `finance` | Cyan |

---

## ✅ What's Working

- ✅ Backend API endpoints
- ✅ MongoDB models and schemas
- ✅ Role initialization script
- ✅ User CRUD operations
- ✅ Custom permissions support
- ✅ User search functionality
- ✅ Status management
- ✅ Flutter UI integration

---

## 🎉 You're Ready!

Everything is set up and ready to test. Just follow the 3 steps above and start creating users with roles!

**Need help?** Check `ABRA_TRAVEL_ROLE_MANAGEMENT_COMPLETE.md` for detailed documentation.

---

**Last Updated**: December 18, 2025
