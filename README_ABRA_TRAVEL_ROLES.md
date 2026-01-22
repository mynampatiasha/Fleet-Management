# 🚀 Abra Travel Role Management System

A complete role-based user management system for Abra Travel fleet management application.

---

## ✨ Features

- 🎭 **6 Predefined Roles** - Super Admin, Org Admin, Fleet Manager, Operations, HR Manager, Finance
- 👥 **User Management** - Create, Read, Update, Delete users
- 🔍 **Search** - Find users by name or email
- 🎨 **Beautiful UI** - Modern Flutter interface with role cards
- 🔐 **Secure** - JWT authentication and MongoDB storage
- 📊 **Analytics** - User count per role
- ⚡ **Real-time** - Live updates and status tracking

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd abra_fleet_backend
node index.js
```

### 2. Initialize Roles (One-time)
```bash
cd abra_fleet_backend
node initialize-roles.js
```

### 3. Run Flutter App
```bash
cd abra_fleet
flutter run
```

---

## 🎯 Available Roles

| Icon | Role | Permissions |
|------|------|-------------|
| 👑 | Super Admin | All permissions |
| 🏢 | Organization Admin | Fleet, Driver, Route, Employee, User Management |
| 🚛 | Fleet Manager | Fleet, Driver, Route (limited) |
| 📊 | Operations Manager | Route, Tracking, Driver (limited) |
| 👥 | HR Manager | Employee, Route (limited), Reports |
| 💰 | Finance Admin | Billing, Finance, Reports |

---

## 📡 API Endpoints

### Roles
- `GET /api/roles` - Get all roles
- `PUT /api/roles/:roleId/permissions` - Update permissions
- `POST /api/roles/initialize` - Initialize default roles

### Users
- `GET /api/user-roles` - Get all users
- `GET /api/user-roles/search?q=query` - Search users
- `GET /api/user-roles/:id` - Get user by ID
- `POST /api/user-roles` - Create user
- `PUT /api/user-roles/:id` - Update user
- `DELETE /api/user-roles/:id` - Delete user
- `PATCH /api/user-roles/:id/toggle-status` - Toggle status

---

## 📦 Tech Stack

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Flutter
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **ODM**: Mongoose

---

## 📁 File Structure

```
abra_fleet_backend/
├── models/
│   ├── Role.js
│   └── UserRole.js
├── controllers/
│   ├── roleController.js
│   └── userRoleController.js
├── routes/
│   ├── role_router.js
│   └── userRole_router.js
└── initialize-roles.js

abra_fleet/
└── lib/features/admin/role_based_access/
    └── user_role_admin_access.dart
```

---

## 🧪 Testing

### Backend API Test
```bash
# Get all roles
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create user
curl -X POST http://localhost:3000/api/user-roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"fleetManager"}'
```

### Flutter App Test
1. Login as admin
2. Navigate to User Role Management
3. Create a test user
4. Verify user appears in list
5. Test edit, delete, status toggle

---

## 📚 Documentation

- `ABRA_TRAVEL_ROLE_MANAGEMENT_COMPLETE.md` - Complete guide
- `QUICK_START_ABRA_TRAVEL_ROLES.md` - Quick start
- `TESTING_COMMANDS.md` - API testing
- `SYSTEM_ARCHITECTURE_DIAGRAM.md` - Architecture
- `FINAL_CHECKLIST.md` - Testing checklist

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection in `.env`
- Verify all dependencies installed: `npm install`

### Roles not showing
- Run initialization script: `node initialize-roles.js`

### Flutter can't connect
- Check API base URL in `api_config.dart`
- Verify backend is running on port 3000

---

## 📝 License

Proprietary - Abra Travel

---

## 👥 Support

For issues or questions, contact the development team.

---

**Version**: 2.0.0
**Last Updated**: December 18, 2025
