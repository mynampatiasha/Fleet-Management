# Backend Files for user_role_admin_access.dart

## Overview
The `user_role_admin_access.dart` Flutter screen connects to the backend through REST APIs. Here are all the backend files it uses:

---

## 📁 Backend File Structure

```
abra_fleet_backend/
├── routes/
│   ├── userRole_router.js       ← User management routes
│   └── role_router.js            ← Role management routes
├── controllers/
│   ├── userRoleController.js    ← User CRUD operations
│   └── roleController.js         ← Role operations
├── models/
│   ├── UserRole.js               ← User data model
│   └── Role.js                   ← Role data model
└── middleware/
    └── auth.js                   ← Authentication middleware
```

---

## 🔗 API Endpoints Used

### 1. **User Management APIs** (`/api/user-roles`)

| Method | Endpoint | Controller Function | Purpose |
|--------|----------|-------------------|---------|
| GET | `/api/user-roles` | `getAllUsers()` | Fetch all users |
| GET | `/api/user-roles/search?q=query` | `searchUsers()` | Search users by name/email |
| GET | `/api/user-roles/:id` | `getUserById()` | Get single user details |
| POST | `/api/user-roles` | `createUser()` | Create new user |
| PUT | `/api/user-roles/:id` | `updateUser()` | Update user details |
| DELETE | `/api/user-roles/:id` | `deleteUser()` | Delete user |
| PATCH | `/api/user-roles/:id/toggle-status` | `toggleUserStatus()` | Toggle active/inactive |

### 2. **Role Management APIs** (`/api/roles`)

| Method | Endpoint | Controller Function | Purpose |
|--------|----------|-------------------|---------|
| GET | `/api/roles` | `getAllRoles()` | Fetch all roles with user counts |
| PUT | `/api/roles/:roleId/permissions` | `updateRolePermissions()` | Update role permissions |
| POST | `/api/roles/initialize` | `initializeRoles()` | Initialize default roles |

---

## 📄 Detailed File Descriptions

### 1. **routes/userRole_router.js**
- **Purpose**: Defines all user management routes
- **Authentication**: All routes require `verifyToken` middleware
- **Routes**: CRUD operations for users + search + toggle status

### 2. **routes/role_router.js**
- **Purpose**: Defines role management routes
- **Authentication**: All routes require `verifyToken` middleware
- **Routes**: Get roles, update permissions, initialize defaults

### 3. **controllers/userRoleController.js**
- **Purpose**: Business logic for user operations
- **Key Functions**:
  - `getAllUsers()` - Returns all users sorted by creation date
  - `createUser()` - Creates new user with validation (checks for duplicate email)
  - `updateUser()` - Updates user, handles password updates, validates email uniqueness
  - `deleteUser()` - Deletes user from database
  - `toggleUserStatus()` - Switches between active/inactive
  - `searchUsers()` - Searches by name or email using regex
  - `getUserById()` - Fetches single user by ID

### 4. **controllers/roleController.js**
- **Purpose**: Business logic for role operations
- **Key Functions**:
  - `getAllRoles()` - Returns all roles with user counts
  - `updateRolePermissions()` - Updates permissions for a role
  - `initializeRoles()` - Creates default 6 roles (superAdmin, orgAdmin, fleetManager, operations, hrManager, finance)

### 5. **models/UserRole.js**
- **Purpose**: MongoDB schema for users
- **Fields**:
  - `name` (String, required)
  - `email` (String, required, unique)
  - `phone` (String, optional)
  - `password` (String, optional)
  - `role` (String, enum: superAdmin, orgAdmin, fleetManager, operations, hrManager, finance)
  - `status` (String, enum: active, inactive)
  - `lastActive` (Date)
  - `customPermissions` (Map of String arrays) ← **NEW: Stores custom permissions**
- **Features**: Auto-updates `lastActive` on save

### 6. **models/Role.js**
- **Purpose**: MongoDB schema for roles
- **Fields**:
  - `id` (String, unique) - Role identifier
  - `title` (String) - Display name
  - `icon` (String) - Emoji icon
  - `color` (String) - Hex color code
  - `permissions` (Map of String arrays) - Permission structure
- **Features**: Virtual field for user count

### 7. **middleware/auth.js**
- **Purpose**: JWT token verification
- **Function**: `verifyToken()` - Validates Firebase/JWT tokens
- **Usage**: Applied to all user-role and role routes

---

## 🔄 Data Flow

### Creating a User with Custom Permissions:

```
Flutter App (user_role_admin_access.dart)
    ↓
ApiService.createUser(user)
    ↓
POST /api/user-roles
    ↓
verifyToken middleware (auth.js)
    ↓
userRoleController.createUser()
    ↓
UserRole.save() (models/UserRole.js)
    ↓
MongoDB Database
    ↓
Response back to Flutter
```

### Loading Roles:

```
Flutter App (user_role_admin_access.dart)
    ↓
ApiService.getRoles()
    ↓
GET /api/roles
    ↓
verifyToken middleware (auth.js)
    ↓
roleController.getAllRoles()
    ↓
Role.find() + UserRole.countDocuments()
    ↓
Response with roles + user counts
    ↓
Flutter displays role cards
```

---

## 🔐 Authentication Flow

All API calls from `user_role_admin_access.dart` include:
```dart
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <firebase_token>'
}
```

The backend `auth.js` middleware:
1. Extracts token from Authorization header
2. Verifies token with Firebase Admin SDK
3. Attaches user info to `req.user`
4. Allows request to proceed or returns 401

---

## 📊 Custom Permissions Feature

### How it works:

1. **Frontend** (`user_role_admin_access.dart`):
   - User selects a role → Permissions section appears
   - User customizes permissions → Stored in `customPermissions` map
   - On save → Sent to backend as part of user object

2. **Backend** (`UserRole.js` model):
   - `customPermissions` field stores the custom permission structure
   - Type: `Map<String, Array<String>>`
   - Example:
   ```javascript
   {
     "Fleet Management": ["View vehicles", "Add/Edit vehicles"],
     "Driver Management": ["View drivers"],
     "Route Planning": ["View routes", "Create routes"]
   }
   ```

3. **Storage** (MongoDB):
   - Stored as a nested object in the user document
   - Can be queried and updated independently

---

## 🚀 How to Register Routes in Backend

In `abra_fleet_backend/index.js`, these routes should be registered:

```javascript
const userRoleRouter = require('./routes/userRole_router');
const roleRouter = require('./routes/role_router');

// Register routes
app.use('/api/user-roles', userRoleRouter);
app.use('/api/roles', roleRouter);
```

---

## 🧪 Testing the Backend

### Initialize Roles (Run Once):
```bash
POST http://localhost:3000/api/roles/initialize
Authorization: Bearer <your_token>
```

### Create a User:
```bash
POST http://localhost:3000/api/user-roles
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "hrManager",
  "customPermissions": {
    "Customer/Employee": ["View employees", "Manage rosters"],
    "Route Planning": ["View routes"]
  }
}
```

### Get All Users:
```bash
GET http://localhost:3000/api/user-roles
Authorization: Bearer <your_token>
```

### Get All Roles:
```bash
GET http://localhost:3000/api/roles
Authorization: Bearer <your_token>
```

---

## 📝 Summary

**Total Backend Files Used: 7**

1. ✅ `routes/userRole_router.js` - User routes
2. ✅ `routes/role_router.js` - Role routes  
3. ✅ `controllers/userRoleController.js` - User logic
4. ✅ `controllers/roleController.js` - Role logic
5. ✅ `models/UserRole.js` - User schema
6. ✅ `models/Role.js` - Role schema
7. ✅ `middleware/auth.js` - Authentication

All files are already created and configured to support the custom permissions feature!

---

**Last Updated:** December 18, 2024
