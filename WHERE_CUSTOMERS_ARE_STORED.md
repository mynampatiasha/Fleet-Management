# Where Customers Are Stored - Complete Flow

## 📍 Primary Storage Location
**All customers are stored in the MongoDB `customers` collection**

## 🔄 Customer Creation Methods & Files

### 1️⃣ **Self-Registration (User Signs Up)**
**File:** `abra_fleet_backend/routes/unified_registration.js`

**Flow:**
```
User fills registration form → POST /api/auth/register
→ Creates Firebase Auth user
→ Inserts into MongoDB `customers` collection
→ Syncs to Firestore `users` collection (for compatibility)
```

**Key Code Location:**
- Line 108-125: Creates customer record in MongoDB
- Line 131: `await req.db.collection('customers').insertOne(newUser)`

**Customer Document Structure:**
```javascript
{
  customerId: "CUST1234567890" or employeeId,
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  companyName: "ABC Corp",
  department: "IT",
  branch: "Bangalore",
  employeeId: "EMP001",
  status: "active",
  role: "customer",
  firebaseUid: "firebase_uid_here",
  createdAt: new Date(),
  updatedAt: new Date(),
  registrationMethod: "self-registration"
}
```

---

### 2️⃣ **Admin Creates Customer**
**File:** `abra_fleet_backend/routes/admin-customers-unified.js`

**Flow:**
```
Admin creates customer → POST /api/admin/customers
→ Creates Firebase Auth user (if password provided)
→ Inserts into MongoDB `customers` collection
→ Syncs to Firestore (optional)
```

**Key Code Location:**
- Line 108-200: Customer creation logic
- Line 177: `await req.db.collection('customers').insertOne(newCustomer)`

---

### 3️⃣ **Bulk Import (CSV Upload)**
**File:** `abra_fleet_backend/routes/roster_router.js`

**Flow:**
```
Admin uploads CSV → POST /api/roster/customer/bulk
→ Processes each row
→ Creates customer if doesn't exist
→ Inserts into MongoDB `customers` collection
→ Creates roster for that customer
```

**Key Code Location:**
- Line 194-500: Bulk import processing
- Creates customers during roster import process
- Each roster is linked to a customer via `customerId` or `employeeId`

**Note:** This route primarily creates **rosters**, but it references customers. If a customer doesn't exist, it should be created first through the admin or registration routes.

---

### 4️⃣ **Employee Bulk Import**
**File:** `abra_fleet_backend/routes/employeeManagement.js` (if exists)

**Flow:**
```
Admin uploads employee CSV → POST /api/employees/bulk-import
→ Creates employees who can also be customers
→ Inserts into MongoDB `customers` collection
```

---

## 📊 Database Collections

### Primary Collection: `customers`
- **Database:** MongoDB
- **Collection Name:** `customers`
- **Access:** `req.db.collection('customers')`

### Secondary Sync (Compatibility):
1. **Firestore:** `users` collection (synced for Firebase compatibility)
2. **Firebase Realtime Database:** Not used for customers (only for clients)

---

## 🔍 How to Query Customers

### Get All Customers:
```javascript
const customers = await req.db.collection('customers').find({}).toArray();
```

### Get Customer by Email:
```javascript
const customer = await req.db.collection('customers').findOne({ 
  email: 'john@example.com' 
});
```

### Get Customer by ID:
```javascript
const customer = await req.db.collection('customers').findOne({ 
  _id: new ObjectId(customerId) 
});
```

### Get Customer by Employee ID:
```javascript
const customer = await req.db.collection('customers').findOne({ 
  employeeId: 'EMP001' 
});
```

---

## 🎯 Key Files Summary

| File | Purpose | Collection |
|------|---------|------------|
| `unified_registration.js` | Self-registration | `customers` |
| `admin-customers-unified.js` | Admin creates customers | `customers` |
| `admin-customers.js` | Legacy admin customer management | `customers` |
| `roster_router.js` | Bulk roster import (references customers) | `rosters` + `customers` |
| `employeeManagement.js` | Employee management | `customers` |

---

## ✅ Important Notes

1. **Single Source of Truth:** MongoDB `customers` collection is the primary storage
2. **Firebase Sync:** Firestore is synced for compatibility with legacy Firebase code
3. **Unique Identifiers:**
   - `_id`: MongoDB ObjectId (primary key)
   - `customerId`: Business ID (e.g., "CUST1234567890" or employee ID)
   - `firebaseUid`: Firebase Auth UID (for authentication)
   - `employeeId`: Optional employee identifier

4. **Organization Filtering:** Customers are filtered by `companyName` or `organizationName` to ensure multi-tenant isolation

5. **Status Values:** `active`, `inactive`, `pending`

---

## 🔧 Testing Customer Creation

### Test Self-Registration:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer",
    "phone": "+1234567890",
    "companyName": "Test Corp",
    "employeeId": "EMP001"
  }'
```

### Test Admin Creation:
```bash
curl -X POST http://localhost:3001/api/admin/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Admin Created Customer",
    "email": "admin-customer@example.com",
    "phone": "+1234567890",
    "companyName": "Test Corp",
    "password": "password123"
  }'
```

---

## 📝 Summary

**When a customer is created by ANY method (registration, admin creation, bulk import), they are ALWAYS stored in the MongoDB `customers` collection through these files:**

1. ✅ `unified_registration.js` - Self-registration
2. ✅ `admin-customers-unified.js` - Admin creates customer
3. ✅ `admin-customers.js` - Legacy admin customer management
4. ✅ `roster_router.js` - References customers during bulk roster import

**All roads lead to:** `req.db.collection('customers').insertOne(customerData)`
