# 🏗️ Abra Travel Role Management - System Architecture

## 📊 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUTTER APP (Frontend)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  User Role Admin Access Screen                         │   │
│  │  (user_role_admin_access.dart)                         │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │  Role Cards (6 roles)                        │     │   │
│  │  │  👑 Super Admin    🏢 Org Admin              │     │   │
│  │  │  🚛 Fleet Manager  📊 Operations             │     │   │
│  │  │  👥 HR Manager     💰 Finance                │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │  User List                                   │     │   │
│  │  │  - Search users                              │     │   │
│  │  │  - View user details                         │     │   │
│  │  │  - Edit/Delete users                         │     │   │
│  │  │  - Toggle status                             │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │  Create/Edit User Form                       │     │   │
│  │  │  - Name, Email, Phone                        │     │   │
│  │  │  - Role selection                            │     │   │
│  │  │  - Custom permissions                        │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│                          ↓ HTTP/HTTPS                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  NODE.JS BACKEND (Express)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  index.js (Main Server)                                │   │
│  │  - CORS configuration                                  │   │
│  │  - MongoDB connection                                  │   │
│  │  - Route registration                                  │   │
│  │  - Authentication middleware                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Routes                                                │   │
│  │                                                         │   │
│  │  /api/roles (role_router.js)                          │   │
│  │  ├─ GET /                  → Get all roles            │   │
│  │  ├─ PUT /:roleId/permissions → Update permissions     │   │
│  │  └─ POST /initialize       → Initialize default roles │   │
│  │                                                         │   │
│  │  /api/user-roles (userRole_router.js)                 │   │
│  │  ├─ GET /                  → Get all users            │   │
│  │  ├─ GET /search            → Search users             │   │
│  │  ├─ GET /:id               → Get user by ID           │   │
│  │  ├─ POST /                 → Create user              │   │
│  │  ├─ PUT /:id               → Update user              │   │
│  │  ├─ DELETE /:id            → Delete user              │   │
│  │  └─ PATCH /:id/toggle-status → Toggle status         │   │
│  └────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Controllers                                           │   │
│  │                                                         │   │
│  │  roleController.js                                     │   │
│  │  ├─ getAllRoles()                                      │   │
│  │  ├─ updateRolePermissions()                            │   │
│  │  └─ initializeRoles()                                  │   │
│  │                                                         │   │
│  │  userRoleController.js                                 │   │
│  │  ├─ getAllUsers()                                      │   │
│  │  ├─ getUserById()                                      │   │
│  │  ├─ createUser()                                       │   │
│  │  ├─ updateUser()                                       │   │
│  │  ├─ deleteUser()                                       │   │
│  │  ├─ toggleUserStatus()                                 │   │
│  │  └─ searchUsers()                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Models (Mongoose)                                     │   │
│  │                                                         │   │
│  │  Role.js                                               │   │
│  │  ├─ id: String (unique)                                │   │
│  │  ├─ title: String                                      │   │
│  │  ├─ icon: String                                       │   │
│  │  ├─ color: String                                      │   │
│  │  └─ permissions: Map<String, Array<String>>           │   │
│  │                                                         │   │
│  │  UserRole.js                                           │   │
│  │  ├─ name: String                                       │   │
│  │  ├─ email: String (unique)                             │   │
│  │  ├─ phone: String                                      │   │
│  │  ├─ role: String (enum)                                │   │
│  │  ├─ status: String (enum)                              │   │
│  │  ├─ lastActive: Date                                   │   │
│  │  └─ customPermissions: Map<String, Array<String>>     │   │
│  └────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS (Database)                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Database: abra_fleet                                  │   │
│  │                                                         │   │
│  │  Collection: roles                                     │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ {                                            │     │   │
│  │  │   id: "superAdmin",                          │     │   │
│  │  │   title: "Super Admin",                      │     │   │
│  │  │   icon: "👑",                                │     │   │
│  │  │   color: "#ff6b6b",                          │     │   │
│  │  │   permissions: {                             │     │   │
│  │  │     "Fleet Management": [...],               │     │   │
│  │  │     "Driver Management": [...],              │     │   │
│  │  │     ...                                      │     │   │
│  │  │   }                                          │     │   │
│  │  │ }                                            │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │  (6 role documents)                                    │   │
│  │                                                         │   │
│  │  Collection: userroles                                 │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ {                                            │     │   │
│  │  │   name: "John Doe",                          │     │   │
│  │  │   email: "john@example.com",                 │     │   │
│  │  │   phone: "+91 9876543210",                   │     │   │
│  │  │   role: "fleetManager",                      │     │   │
│  │  │   status: "active",                          │     │   │
│  │  │   lastActive: Date,                          │     │   │
│  │  │   customPermissions: {                       │     │   │
│  │  │     "Fleet Management": [...]                │     │   │
│  │  │   }                                          │     │   │
│  │  │ }                                            │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │  (User documents)                                      │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Get All Roles

```
Flutter App
    ↓
    GET /api/roles
    ↓
role_router.js
    ↓
roleController.getAllRoles()
    ↓
Role.find() (Mongoose)
    ↓
MongoDB: roles collection
    ↓
Returns 6 roles with user counts
    ↓
Flutter displays role cards
```

### Example 2: Create User

```
Flutter App (User fills form)
    ↓
    POST /api/user-roles
    Body: { name, email, phone, role }
    ↓
userRole_router.js
    ↓
userRoleController.createUser()
    ↓
Check if email exists
    ↓
new UserRole({ ... })
    ↓
user.save() (Mongoose)
    ↓
MongoDB: userroles collection
    ↓
Returns created user
    ↓
Flutter shows success message
```

### Example 3: Search Users

```
Flutter App (User types in search)
    ↓
    GET /api/user-roles/search?q=john
    ↓
userRole_router.js
    ↓
userRoleController.searchUsers()
    ↓
UserRole.find({ $or: [...] })
    ↓
MongoDB: userroles collection
    ↓
Returns matching users
    ↓
Flutter updates user list
```

---

## 📦 File Structure

```
abra_fleet_backend/
├── models/
│   ├── Role.js                    ← Role schema
│   └── UserRole.js                ← User schema
├── controllers/
│   ├── roleController.js          ← Role logic
│   └── userRoleController.js      ← User logic
├── routes/
│   ├── role_router.js             ← Role endpoints
│   └── userRole_router.js         ← User endpoints
├── middleware/
│   └── auth.js                    ← Authentication
├── index.js                       ← Main server (routes registered)
├── initialize-roles.js            ← Quick setup script
└── .env                           ← Configuration

abra_fleet/
└── lib/
    └── features/
        └── admin/
            └── role_based_access/
                └── user_role_admin_access.dart  ← Flutter UI
```

---

## 🎯 Key Components

### Backend Components

1. **Models** - Define data structure
   - Role: Stores role definitions
   - UserRole: Stores user data

2. **Controllers** - Business logic
   - roleController: Role operations
   - userRoleController: User CRUD

3. **Routes** - API endpoints
   - role_router: Role endpoints
   - userRole_router: User endpoints

4. **Middleware** - Authentication
   - auth.js: Verify tokens

### Frontend Components

1. **Models** - Data classes
   - User: User data model
   - RoleData: Role data model

2. **UI** - User interface
   - Role cards
   - User list
   - Create/Edit forms

3. **API** - Backend communication
   - HTTP requests
   - JSON parsing

---

## 🔐 Security Flow

```
Flutter App
    ↓
    Sends request with JWT token
    Authorization: Bearer <token>
    ↓
Backend: auth.js middleware
    ↓
    Verifies token
    ↓
    If valid: Continue to controller
    If invalid: Return 401 Unauthorized
    ↓
Controller processes request
    ↓
Returns response
```

---

## 📊 Database Schema

### roles Collection

```javascript
{
  _id: ObjectId("..."),
  id: "superAdmin",           // Unique identifier
  title: "Super Admin",       // Display name
  icon: "👑",                 // Emoji icon
  color: "#ff6b6b",          // Hex color
  permissions: {
    "Fleet Management": [
      "View all vehicles",
      "Add/Edit/Delete vehicles",
      ...
    ],
    "Driver Management": [...],
    ...
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### userroles Collection

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",  // Unique
  phone: "+91 9876543210",
  role: "fleetManager",       // Enum: superAdmin, orgAdmin, etc.
  status: "active",           // Enum: active, inactive
  lastActive: ISODate("..."),
  customPermissions: {
    "Fleet Management": [
      "View vehicles",
      "Add vehicles"
    ]
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🎉 Summary

This architecture provides:

✅ **Separation of Concerns** - Models, Controllers, Routes
✅ **RESTful API** - Standard HTTP methods
✅ **Authentication** - JWT token verification
✅ **Database** - MongoDB with Mongoose ODM
✅ **Frontend** - Flutter with clean UI
✅ **Scalability** - Easy to add new roles/permissions
✅ **Maintainability** - Clear file structure

---

**Last Updated**: December 18, 2025
