# 🧪 BILLING CUSTOMERS - TESTING GUIDE

## 📋 Quick Start Testing

### **Prerequisites**

1. ✅ Backend server running on port 3001
2. ✅ MongoDB connected
3. ✅ JWT token stored in SharedPreferences (login first)
4. ✅ Flutter app running

---

## 🎯 Test Scenarios

### **Scenario 1: Create Individual Customer**

**Steps:**
1. Navigate to Billing → Customers
2. Click "New Customer" button
3. Select "Individual" customer type
4. Fill required fields:
   - Customer Display Name: "John Doe"
   - Primary Email: "john.doe@example.com"
   - Primary Phone: "+91 9876543210"
   - Address Line 1: "123 Main Street"
   - City: "Bangalore"
   - State: "Karnataka"
   - Country: "India"
5. Select Customer Status: "Active"
6. Select Sales Territory: "Bangalore"
7. Click "Save & Activate"

**Expected Result:**
- ✅ Success message: "Customer saved successfully"
- ✅ Navigate back to customers list
- ✅ New customer appears in list
- ✅ Backend console shows: `✅ Customer created with ID: <mongodb_id>`

---

### **Scenario 2: Create Organization Customer with GST**

**Steps:**
1. Click "New Customer"
2. Select "Organization" customer type
3. Fill required fields:
   - Company Name: "ABC Technologies Pvt Ltd"
   - Primary Contact Person: "Rajesh Kumar"
   - Primary Email: "rajesh@abctech.com"
   - Primary Phone: "+91 9876543210"
   - Address: "456 Tech Park, Bangalore"
   - **GST Number: "29ABCDE1234A1Z5"** (Required for Organization)
4. Fill company details:
   - PAN Number: "ABCDE1234F"
   - Industry Type: "IT & Software"
   - Employee Strength: "500"
5. Add contact person:
   - Click "Add Contact Person"
   - Contact Type: "Billing Contact"
   - Full Name: "Priya Sharma"
   - Email: "priya@abctech.com"
   - Phone: "+91 9876543211"
6. Select Customer Tier: "Gold"
7. Click "Save & Activate"

**Expected Result:**
- ✅ Customer created with organization type
- ✅ GST validation passes
- ✅ Contact persons saved
- ✅ Company details saved

---

### **Scenario 3: Create Vendor with Commission**

**Steps:**
1. Click "New Customer"
2. Select "Vendor" customer type
3. Fill basic info:
   - Company Name: "XYZ Transport Services"
   - Primary Contact: "Amit Singh"
   - Email: "amit@xyztransport.com"
   - Phone: "+91 9876543212"
   - GST Number: "29XYZAB5678C1Z9"
4. Fill vendor-specific details:
   - Commission Type: "Percentage"
   - Commission Rate: "10" (%)
   - Payment Cycle: "Monthly"
   - Vehicle Types: Select "Sedan", "SUV"
   - Number of Vehicles: "25"
5. Fill bank details:
   - Bank Name: "HDFC Bank"
   - Account Number: "12345678901234"
   - IFSC Code: "HDFC0001234"
   - Account Holder: "XYZ Transport Services"
6. Click "Save & Activate"

**Expected Result:**
- ✅ Vendor created with commission structure
- ✅ Bank details saved
- ✅ Vehicle types saved

---

### **Scenario 4: Upload Documents**

**Steps:**
1. Create new customer (any type)
2. Scroll to "Document Uploads" section
3. Click "Upload Files" for "Company Documents"
4. Select 2-3 PDF files
5. Click "Upload Files" for "KYC Documents"
6. Select 1-2 image files
7. Click "Save & Activate"

**Expected Result:**
- ✅ Customer created
- ✅ Backend console shows: `📤 Uploading documents...`
- ✅ Backend console shows: `✅ Uploaded 3 files in category: Company Documents`
- ✅ Backend console shows: `✅ Uploaded 2 files in category: KYC Documents`
- ✅ Files saved in `uploads/billing-customers/<customer_id>/` folder

---

### **Scenario 5: Edit Existing Customer**

**Steps:**
1. Go to Customers List
2. Click "Edit" icon on any customer
3. Verify all fields are populated
4. Change Customer Display Name
5. Change Customer Status to "Inactive"
6. Add a tag: "VIP"
7. Click "Update Customer"

**Expected Result:**
- ✅ Form loads with existing data
- ✅ All fields populated correctly
- ✅ Success message: "Customer updated successfully"
- ✅ Changes reflected in customers list

---

### **Scenario 6: Validation Tests**

**Test 6.1: Missing Required Fields**
1. Click "New Customer"
2. Leave Customer Display Name empty
3. Click "Save & Activate"
4. **Expected:** Error message "Please fill all required fields"

**Test 6.2: Invalid Email**
1. Enter email: "invalid-email"
2. Click "Save & Activate"
3. **Expected:** Error message "Invalid email format"

**Test 6.3: Invalid Phone**
1. Enter phone: "123"
2. Click "Save & Activate"
3. **Expected:** Error message "Invalid phone number"

**Test 6.4: Invalid GST**
1. Select "Organization" type
2. Enter GST: "INVALID"
3. Click "Save & Activate"
4. **Expected:** Error message "Invalid GST format"

**Test 6.5: Missing GST for Organization**
1. Select "Organization" type
2. Leave GST Number empty
3. Click "Save & Activate"
4. **Expected:** Error message "GST Number is required for B2B customers"

**Test 6.6: Blocked Status without Reason**
1. Select Customer Status: "Blocked"
2. Leave "Reason for Blocking" empty
3. Click "Save & Activate"
4. **Expected:** Error message "Please provide reason for blocking"

---

### **Scenario 7: Error Handling**

**Test 7.1: Backend Not Running**
1. Stop backend server
2. Try to create customer
3. **Expected:** Error message "Failed to connect to server"

**Test 7.2: Invalid JWT Token**
1. Clear SharedPreferences
2. Try to create customer
3. **Expected:** Error message "Authentication failed. Please login again."

**Test 7.3: Network Timeout**
1. Set very short timeout in service
2. Try to create customer
3. **Expected:** Error message "Request timeout. Please try again."

---

## 🔍 Backend Verification

### **Check MongoDB**

```javascript
// Connect to MongoDB
use fleet_management_db

// View all customers
db.billing_customers.find().pretty()

// View specific customer
db.billing_customers.findOne({ customerDisplayName: "John Doe" })

// Count customers by type
db.billing_customers.aggregate([
  { $group: { _id: "$customerType", count: { $sum: 1 } } }
])

// View customers with documents
db.billing_customers.find({ "documents.0": { $exists: true } })
```

### **Check Uploaded Files**

```bash
# Navigate to uploads folder
cd abra_fleet_backend/uploads/billing-customers

# List customer folders
ls -la

# View files for specific customer
ls -la <customer_id>/
```

---

## 📊 API Testing with Postman

### **1. Create Customer**

```http
POST http://localhost:3001/api/billing-customers
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "customerType": "Individual",
  "customerDisplayName": "Test Customer",
  "primaryEmail": "test@example.com",
  "primaryPhone": "+91 9876543210",
  "addressLine1": "123 Test Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "customerStatus": "Active",
  "salesTerritory": "Bangalore",
  "paymentTerms": "Immediate/COD",
  "billingFrequency": "Per-trip"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "_id": "65abc123def456789...",
    "customerId": "CUST-20260122-143022",
    "customerType": "Individual",
    "customerDisplayName": "Test Customer",
    ...
  }
}
```

### **2. Get Customer by ID**

```http
GET http://localhost:3001/api/billing-customers/<customer_id>
Authorization: Bearer <your_jwt_token>
```

### **3. Get All Customers**

```http
GET http://localhost:3001/api/billing-customers?page=1&limit=20
Authorization: Bearer <your_jwt_token>
```

### **4. Update Customer**

```http
PUT http://localhost:3001/api/billing-customers/<customer_id>
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "customerDisplayName": "Updated Name",
  "customerStatus": "Inactive"
}
```

### **5. Upload Documents**

```http
POST http://localhost:3001/api/billing-customers/<customer_id>/upload-documents
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data

category: Company Documents
files: [file1.pdf, file2.pdf]
```

### **6. Delete Customer**

```http
DELETE http://localhost:3001/api/billing-customers/<customer_id>
Authorization: Bearer <your_jwt_token>
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Failed to connect to server"**

**Solution:**
- Check backend is running: `node index.js`
- Verify port 3001 is not blocked
- Check `_baseUrl` in `billing_customers_service.dart`

### **Issue 2: "Authentication failed"**

**Solution:**
- Login again to get fresh JWT token
- Check token is stored in SharedPreferences
- Verify token is not expired

### **Issue 3: "Customer not found"**

**Solution:**
- Verify customer ID is correct
- Check MongoDB connection
- Ensure customer exists in database

### **Issue 4: "Document upload failed"**

**Solution:**
- Check `uploads/billing-customers/` folder exists
- Verify folder permissions (write access)
- Check file size limits in multer config

### **Issue 5: "Invalid GST format"**

**Solution:**
- GST format: `29ABCDE1234A1Z5` (15 characters)
- First 2 digits: State code
- Next 10 characters: PAN
- Last 3 characters: Entity code

---

## ✅ Testing Checklist

### **Create Customer**
- [ ] Individual customer
- [ ] Organization customer
- [ ] Vendor customer
- [ ] With all required fields
- [ ] With optional fields
- [ ] With contact persons
- [ ] With documents
- [ ] With custom fields

### **Edit Customer**
- [ ] Load existing data
- [ ] Update basic info
- [ ] Update company details
- [ ] Add/remove contact persons
- [ ] Change customer status
- [ ] Upload additional documents

### **Validation**
- [ ] Required field validation
- [ ] Email format validation
- [ ] Phone format validation
- [ ] GST format validation
- [ ] PAN format validation
- [ ] Blocked status validation

### **Error Handling**
- [ ] Backend not running
- [ ] Invalid JWT token
- [ ] Network timeout
- [ ] Duplicate customer
- [ ] Invalid data format

### **Document Upload**
- [ ] Single file upload
- [ ] Multiple files upload
- [ ] Different file types (PDF, images)
- [ ] Multiple categories
- [ ] Large files

---

## 📈 Performance Testing

### **Load Test**
- Create 100 customers sequentially
- Measure average response time
- Check memory usage

### **Stress Test**
- Create 10 customers simultaneously
- Upload documents for multiple customers
- Check server stability

---

## 🎉 Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Data saved correctly in MongoDB
✅ Documents uploaded successfully
✅ Validation works as expected
✅ Error messages are user-friendly
✅ UI is responsive and smooth

---

**Happy Testing!** 🚀

If you find any issues, check:
1. Browser console (F12)
2. Backend logs
3. MongoDB data
4. Network tab in DevTools
