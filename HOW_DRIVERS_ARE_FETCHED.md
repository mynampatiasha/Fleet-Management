# How Drivers Are Fetched - Quick Answer

## Your Question
**"Can I know how these are fetched from db or mongodb?"**

## Quick Answer

### 1️⃣ **Frontend Makes API Call**
```dart
// File: abra_fleet/lib/core/services/driver_service.dart
// Line: ~30

Future<Map<String, dynamic>> getDrivers() async {
  final uri = Uri.parse('$baseUrl/api/admin/drivers');
  final response = await http.get(uri, headers: await _getHeaders());
  return json.decode(response.body);
}
```
**Translation:** Flutter app calls backend API at `http://localhost:3000/api/admin/drivers`

---

### 2️⃣ **Backend Queries MongoDB Atlas**
```javascript
// File: abra_fleet_backend/routes/admin-drivers.js
// Line: ~15

router.get('/', async (req, res) => {
  const drivers = await req.db.collection('drivers')
    .find(filter)
    .toArray();
  
  res.json({ success: true, data: drivers });
});
```
**Translation:** Backend queries **MongoDB Atlas** (NOT Firebase) and returns driver list

---

### 3️⃣ **Authentication via Firebase**
```javascript
// File: abra_fleet_backend/middleware/auth.js
// Line: ~10

const verifyToken = async (req, res, next) => {
  const idToken = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  req.user = { uid: decodedToken.uid, email: decodedToken.email };
  next();
};
```
**Translation:** Firebase verifies user token, then MongoDB is queried

---

## The Problem

```
┌──────────────────────────────────────────────────────┐
│  WHERE IS YOUR DRIVER?                               │
├──────────────────────────────────────────────────────┤
│                                                       │
│  FIREBASE (Firestore)     MONGODB ATLAS             │
│  ✅ Driver exists          ❌ Driver missing         │
│                                                       │
│  - DRV-852306              - 0 drivers               │
│  - Rajesh Kumar            - Empty collection        │
│  - ashamynampati24@        - Nothing found           │
│    gmail.com                                         │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Why you see driver in UI but can't edit/delete:**
- Driver exists in **Firebase** only
- Backend API queries **MongoDB Atlas**
- MongoDB has 0 drivers
- Edit/Delete operations fail

---

## The Solution

### **Run Sync Script:**

```bash
cd abra_fleet_backend
node sync-firebase-drivers-to-mongodb.js
```

**What it does:**
1. Reads all drivers from Firebase
2. Copies them to MongoDB Atlas
3. Links everything together
4. Shows summary report

**After running:**
- ✅ Driver will exist in MongoDB
- ✅ Edit/Delete will work
- ✅ Driver list will show correct data

---

## Verification

### **Before Sync:**
```bash
cd abra_fleet_backend
node check-driver-email.js
# Output: Email not found, 0 total drivers
```

### **After Sync:**
```bash
node check-driver-email.js
# Output: ✅ Driver found! DRV-852306, Rajesh Kumar
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR APP FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Flutter App (UI)                                    │
│     │                                                    │
│     ├─ Shows driver list                                │
│     └─ Calls driver_service.dart                        │
│                                                          │
│  2. driver_service.dart                                 │
│     │                                                    │
│     ├─ Makes HTTP GET request                           │
│     └─ URL: /api/admin/drivers                          │
│                                                          │
│  3. Backend API (admin-drivers.js)                      │
│     │                                                    │
│     ├─ Verifies Firebase token (auth.js)                │
│     ├─ Queries MongoDB Atlas                            │
│     └─ Returns driver list                              │
│                                                          │
│  4. MongoDB Atlas                                       │
│     │                                                    │
│     ├─ Stores driver data                               │
│     └─ Returns query results                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `abra_fleet/lib/core/services/driver_service.dart` | Frontend API calls |
| `abra_fleet_backend/routes/admin-drivers.js` | Backend API routes |
| `abra_fleet_backend/middleware/auth.js` | Firebase authentication |
| `abra_fleet_backend/check-driver-email.js` | Check if driver exists |
| `abra_fleet_backend/sync-firebase-drivers-to-mongodb.js` | **Sync script (RUN THIS!)** |

---

## Summary

**Problem:** Driver in Firebase, not in MongoDB  
**Cause:** Two databases not synced  
**Solution:** Run sync script  
**Result:** Driver works everywhere  

**Run this now:**
```bash
cd abra_fleet_backend
node sync-firebase-drivers-to-mongodb.js
```
