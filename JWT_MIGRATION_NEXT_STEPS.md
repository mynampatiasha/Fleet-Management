# JWT MIGRATION - NEXT STEPS TO COMPLETE

## 🎯 CURRENT STATUS
**✅ COMPLETED:**
- JWT router with complete authentication system (`abra_fleet_backend/routes/jwt_router.js`)
- User migration script (`abra_fleet_backend/scripts/migrate_users_to_collections.js`)
- JWT authentication repository (`abra_fleet/lib/features/auth/data/repositories/jwt_auth_repository_impl.dart`)
- Updated login screen to use JWT authentication
- Updated registration screen to use JWT authentication  
- Updated main.dart to use JWT authentication instead of Firebase
- Updated API service to use JWT tokens from SharedPreferences

## 🚀 IMMEDIATE NEXT STEPS

### 1. Run User Migration Script
```bash
cd abra_fleet_backend
node scripts/migrate_users_to_collections.js
```
This will move users to correct MongoDB collections based on their roles.

### 2. Update Flutter Dependencies
Edit `abra_fleet/pubspec.yaml` and remove Firebase dependencies:
```yaml
# Remove these lines:
# firebase_core: ^2.24.2
# firebase_auth: ^4.15.3
# cloud_firestore: ^4.13.6
# firebase_messaging: ^14.7.10
# firebase_database: ^10.4.0
# google_sign_in: ^6.1.6

# Ensure these are present:
shared_preferences: ^2.2.2
http: ^1.1.0
```

### 3. Update Backend Dependencies
```bash
cd abra_fleet_backend
npm uninstall firebase-admin
npm install jsonwebtoken bcryptjs
```

### 4. Update Environment Variables
Ensure `.env` files have JWT configuration:
```env
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=24h
```

### 5. Remove Firebase Configuration Files
Delete these files:
- `abra_fleet_backend/config/firebase.js`
- `abra_fleet_backend/serviceAccountKey.json`
- `abra_fleet/android/app/google-services.json`
- `abra_fleet/lib/firebase_options.dart`
- `abra_fleet/firestore.rules`

### 6. Update Backend Server
Update `abra_fleet_backend/index.js` to use JWT router:
```javascript
// Replace Firebase imports with JWT
const { verifyJWT } = require('./routes/jwt_router');

// Replace all verifyToken middleware with verifyJWT
app.use('/api/protected-routes', verifyJWT);
```

### 7. Test the Migration
1. Start the backend server
2. Try logging in with existing credentials
3. Test registration of new users
4. Verify role-based access control works
5. Test password reset functionality

## 🔧 TECHNICAL DETAILS

### JWT Token Structure
```javascript
{
  userId: user._id,
  email: user.email,
  role: user.role,
  name: user.name,
  organizationId: user.organizationId,
  modules: user.modules,
  permissions: user.permissions,
  collectionName: user.collectionName
}
```

### User Collection Mapping
- **admin/super_admin** → `admin_users` collection
- **driver** → `drivers` collection  
- **customer** → `customers` collection
- **client** → `clients` collection
- **employee** → `employee_admins` collection

### Authentication Flow
1. User enters email/password
2. Backend validates credentials against MongoDB
3. JWT token generated and returned
4. Flutter stores token in SharedPreferences
5. All API calls include JWT token in Authorization header
6. Backend validates JWT token on each request

## ✅ VERIFICATION CHECKLIST

- [ ] Run user migration script successfully
- [ ] Remove Firebase dependencies from pubspec.yaml
- [ ] Update backend dependencies (remove firebase-admin, add JWT packages)
- [ ] Set JWT_SECRET in environment variables
- [ ] Remove Firebase configuration files
- [ ] Update backend server to use JWT middleware
- [ ] Test login functionality
- [ ] Test registration functionality
- [ ] Test role-based navigation
- [ ] Test password reset
- [ ] Verify all existing features work without Firebase

## 🎉 EXPECTED BENEFITS

1. **Simplified Architecture**: No more Firebase complexity
2. **Better Control**: Full control over authentication logic
3. **Cost Reduction**: No Firebase service costs
4. **Performance**: Reduced external dependencies
5. **Maintenance**: Easier to maintain and debug
6. **Security**: Custom security implementation
7. **Flexibility**: Easy to extend and modify

## 📞 TROUBLESHOOTING

### Common Issues:
1. **"No token found"** - Check if JWT_SECRET is set in environment
2. **"Invalid token"** - Clear app data/SharedPreferences and login again
3. **"User not found"** - Run the migration script to move users to correct collections
4. **Role navigation issues** - Verify user has correct role in MongoDB collection

### Debug Commands:
```bash
# Check if users are in correct collections
node -e "
const { MongoClient } = require('mongodb');
MongoClient.connect('your_mongodb_url').then(async client => {
  const db = client.db('your_db_name');
  console.log('Customers:', await db.collection('customers').countDocuments());
  console.log('Drivers:', await db.collection('drivers').countDocuments());
  console.log('Admins:', await db.collection('admin_users').countDocuments());
  client.close();
});
"
```

The system is now ready to work completely without Firebase! 🚀