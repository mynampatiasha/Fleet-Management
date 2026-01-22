# Customer Profile Data Not Showing - Debug Guide

## Issue
The customer profile screen shows "Not provided" for all fields instead of displaying the actual customer data.

## Root Cause Analysis

The issue is likely one of the following:

### 1. **Backend Not Running**
- The backend server needs to be running on port 3001
- Check if MongoDB is running

### 2. **Authentication Token Issue**
- The JWT token might not be stored properly
- The token might be expired
- The token might not be sent with the API request

### 3. **Database Has No Data**
- The customer record might not have the required fields populated
- The customer might not exist in the database

### 4. **API Endpoint Issue**
- The endpoint `/api/customer/stats/profile` might not be working
- There might be a middleware authentication issue

## Debugging Steps

### Step 1: Check if Backend is Running

```bash
# Start MongoDB (if not running)
start-mongodb.bat

# Start Backend
start-backend.bat
```

### Step 2: Check Flutter Console Logs

After the fix I applied, you should see detailed logs in the Flutter console:

```
📱 Fetching profile for user: <user_id>
📱 Current user data: <user_data>
🌐 Making API call to: /api/customer/stats/profile
📥 API Response received: <response>
📥 Response success: <true/false>
📥 Response data: <data>
```

**Look for:**
- ❌ Any error messages
- The actual API response
- Whether `success` is true or false
- What data is being returned

### Step 3: Test the Backend API Directly

Create a test file to verify the backend is working:

```javascript
// test-customer-profile-backend.js
const axios = require('axios');

async function testProfile() {
  try {
    // 1. Login first
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'YOUR_CUSTOMER_EMAIL',  // Replace with actual email
      password: 'YOUR_PASSWORD'       // Replace with actual password
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // 2. Fetch profile
    console.log('\n2. Fetching profile...');
    const profileRes = await axios.get('http://localhost:3001/api/customer/stats/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Profile data:');
    console.log(JSON.stringify(profileRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProfile();
```

Run it:
```bash
node test-customer-profile-backend.js
```

### Step 4: Check Database Records

```javascript
// check-customer-data.js
const { MongoClient, ObjectId } = require('mongodb');

async function checkCustomer() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('abra_fleet');
  
  // Find customer by email
  const customer = await db.collection('customers').findOne({
    email: 'YOUR_CUSTOMER_EMAIL'  // Replace with actual email
  });
  
  console.log('Customer record:');
  console.log(JSON.stringify(customer, null, 2));
  
  // Check what fields are missing
  const fields = ['name', 'email', 'phoneNumber', 'alternativePhone', 
                  'companyName', 'department', 'employeeId', 'designation'];
  
  console.log('\nField Status:');
  fields.forEach(field => {
    console.log(`${customer[field] ? '✅' : '❌'} ${field}: ${customer[field] || 'NOT SET'}`);
  });
  
  await client.close();
}

checkCustomer();
```

### Step 5: Check JWT Token Storage

Add this to your Flutter code temporarily to debug:

```dart
Future<void> _debugTokenStorage() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt_token');
  final userData = prefs.getString('user_data');
  
  debugPrint('🔍 DEBUG TOKEN STORAGE:');
  debugPrint('Token exists: ${token != null}');
  debugPrint('Token length: ${token?.length ?? 0}');
  debugPrint('Token preview: ${token?.substring(0, 20) ?? 'NULL'}...');
  debugPrint('User data: $userData');
}
```

Call this in `initState()`:
```dart
@override
void initState() {
  super.initState();
  _debugTokenStorage();  // Add this
  _fetchProfileData();
}
```

## Common Solutions

### Solution 1: Ensure Customer Data Exists

If the database record is empty, populate it:

```javascript
// populate-customer-data.js
const { MongoClient, ObjectId } = require('mongodb');

async function populateCustomerData() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('abra_fleet');
  
  await db.collection('customers').updateOne(
    { email: 'YOUR_CUSTOMER_EMAIL' },
    {
      $set: {
        name: 'Customer Name',
        phoneNumber: '+919876543210',
        alternativePhone: '+919876543211',
        companyName: 'Test Company',
        department: 'Engineering',
        employeeId: 'EMP001',
        designation: 'Software Engineer',
        updatedAt: new Date()
      }
    }
  );
  
  console.log('✅ Customer data populated');
  await client.close();
}

populateCustomerData();
```

### Solution 2: Re-login to Refresh Token

Sometimes the token gets corrupted. Have the user:
1. Logout
2. Login again
3. Navigate to profile

### Solution 3: Check API Base URL

Verify the `.env` file has the correct URL:

```env
API_BASE_URL=http://localhost:3001
```

And that it's loaded in Flutter:

```dart
// In main.dart
await dotenv.load(fileName: ".env");
```

## What I Fixed

I added comprehensive debugging to the `_fetchProfileData()` method in `customer_profile_screen.dart`:

1. **Added detailed logging** at each step
2. **Log the current user data** to verify authentication
3. **Log the API response** to see what's being returned
4. **Log each field** to see which ones have data
5. **Added stack trace** to error logging

## Next Steps

1. **Run the app** and navigate to the profile screen
2. **Check the Flutter console** for the debug logs
3. **Look for the specific error** or empty data
4. **Share the console output** with me if you need further help

## Expected Console Output (Success)

```
📱 Fetching profile for user: 507f1f77bcf86cd799439011
📱 Current user data: User(id: 507f1f77bcf86cd799439011, email: customer@test.com, ...)
🌐 Making API call to: /api/customer/stats/profile
📥 API Response received: {success: true, data: {...}}
📥 Response success: true
📥 Response data: {name: John Doe, email: customer@test.com, ...}
📋 Profile data fields:
   Name: John Doe
   Email: customer@test.com
   Phone: +919876543210
   Alt Phone: +919876543211
   Company: Test Company
   Department: Engineering
   Employee ID: EMP001
   Designation: Software Engineer
✅ Profile data loaded from HTTP API
✅ Controllers populated successfully
```

## Expected Console Output (Failure)

```
📱 Fetching profile for user: 507f1f77bcf86cd799439011
📱 Current user data: User(id: 507f1f77bcf86cd799439011, email: customer@test.com, ...)
🌐 Making API call to: /api/customer/stats/profile
📥 API Response received: {success: false, message: Customer profile not found}
📥 Response success: false
📥 Response data: null
❌ API response indicates failure or no data
❌ Response: {success: false, message: Customer profile not found}
❌ Error fetching profile: Exception: No profile data found: Customer profile not found
```

This will tell you exactly what's wrong!
