# ⚠️ BACKEND RESTART REQUIRED

## Issue
Getting **500 Internal Server Error** when clicking "Send Mail" button for drivers.

## Root Cause
The new endpoint `POST /api/admin/drivers/:id/send-password-reset` was added to the backend, but **Node.js needs to be restarted** to load the new route.

## Solution

### Step 1: Stop the Backend
```bash
# Press Ctrl+C in the terminal running the backend
# Or find and kill the process
```

### Step 2: Restart the Backend
```bash
cd abra_fleet_backend
node index.js
```

### Step 3: Verify Backend Started
You should see:
```
🚀 Server running on port 3000
✅ MongoDB connected successfully
```

### Step 4: Test the Endpoint (Optional)
```bash
cd abra_fleet_backend
node test-send-password-reset.js
```

### Step 5: Test in the App
1. Open Driver Management
2. Click the purple email icon for any driver
3. Confirm sending email
4. Should see success message

## What the Endpoint Does

**Endpoint:** `POST /api/admin/drivers/:id/send-password-reset`

**Process:**
1. Finds driver by ID
2. Gets driver's email address
3. Generates Firebase password reset link
4. Sends email using email service
5. Returns success/error response

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/admin/drivers/EMP002/send-password-reset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully to driver@example.com"
}
```

**Error Responses:**
- **404:** Driver not found
- **400:** Driver has no email address
- **500:** Firebase or email service error

## Backend Logs to Watch

When you click "Send Mail", you should see:
```
📧 ========== SEND PASSWORD RESET EMAIL ==========
Driver ID: EMP002
✅ Driver found: John Doe
📧 Email: john.doe@example.com
🔐 Generating Firebase password reset link...
✅ Password reset link generated
📤 Sending password reset email...
✅ Password reset email sent successfully
========== EMAIL SENT COMPLETE ==========
```

## If Still Getting Errors After Restart

### Check 1: Email Service Configuration
Make sure `.env` file has:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Check 2: Firebase Admin SDK
Make sure Firebase Admin is initialized in `services/firebase_admin.js`

### Check 3: Driver Has Email
Check if the driver in database has `personalInfo.email` field:
```javascript
db.drivers.findOne({ driverId: 'EMP002' })
```

## Quick Fix Checklist

- [ ] Backend restarted
- [ ] No errors in backend console
- [ ] Email service configured
- [ ] Firebase Admin SDK working
- [ ] Driver has email address
- [ ] Test endpoint with curl/Postman
- [ ] Test in Flutter app

## Still Not Working?

Check backend console for detailed error logs. The endpoint has comprehensive logging that will show exactly where it's failing.

Common issues:
1. **Firebase error:** Check Firebase Admin SDK credentials
2. **Email error:** Check SMTP configuration
3. **Driver not found:** Check driver ID format
4. **No email:** Driver record missing email field

---

**Remember:** Always restart Node.js backend after adding new routes! 🔄
