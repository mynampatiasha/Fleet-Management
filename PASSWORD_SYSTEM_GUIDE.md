# Password System - Complete Guide

## Overview
Complete documentation for password management in Abra Fleet, including password setup for new customers, password updates by admin, and password reset functionality.

---

## Table of Contents
1. [Password Setup for New Customers](#password-setup-for-new-customers)
2. [Admin Password Update](#admin-password-update)
3. [Customer Password Reset](#customer-password-reset)
4. [Testing](#testing)

---

## Password Setup for New Customers

### When It's Needed
When customers are added by:
- Admin (via Customer Management UI)
- Client (via Client Dashboard)
- Bulk Import (via CSV upload)

These customers don't have a password yet and need to set one.

### How It Works

1. **Customer Created** → Admin/client creates customer account
2. **Firebase Auth Created** → Account created in Firebase Authentication
3. **Password Reset Link Generated** → Backend generates Firebase password reset link
4. **Email Sent** → Customer receives "Welcome + Set Your Password" email
5. **Customer Sets Password** → Customer clicks link and sets their password
6. **Account Active** → Customer can now login

### Email Template
**Subject:** 🎉 Welcome to Abra Fleet - Set Your Password

**Contains:**
- Welcome message
- Account details (email, company)
- "Set Your Password" button with reset link
- Link expires in 1 hour
- Instructions for getting started

### Technical Implementation

**Backend Endpoint:** `POST /api/customer-approval/send-welcome-email`

**Request:**
```json
{
  "customerId": "abc123",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "companyName": "Acme Corp"
}
```

**Process:**
1. Validate input
2. Generate Firebase password reset link
3. Send email with link
4. Return success/failure

**Files:**
- `customer_approval_router.js` - API endpoint
- `email_service.js` - Email sending
- `email_templates.js` - Email template
- `customer_provider.dart` - Flutter integration

---

## Admin Password Update

### Feature
Admins can update client/customer passwords without requiring the current password.

### Where to Find It

**For Clients:**
Admin Dashboard → Client Management → Edit Client (pencil icon) → Update Password

**For Customers:**
Admin Dashboard → Customer Management → Edit Customer → Update Password

### How to Use

1. Click edit icon on client/customer row
2. Scroll to "Update Password" section
3. Click "Update Password" button to expand
4. Enter new password (minimum 6 characters)
5. Confirm the password
6. Click "Update Client/Customer"
7. Password is updated immediately

### Features
- ✅ No current password required (admin privilege)
- ✅ Password visibility toggle
- ✅ Password confirmation validation
- ✅ Minimum 6 characters validation
- ✅ Optional - leave blank to keep current password
- ✅ Secure - uses Firebase Admin SDK

### Technical Implementation

**Backend Endpoint:** `POST /api/users/update-password`

**Request:**
```json
{
  "userId": "abc123",
  "newPassword": "newSecurePassword123"
}
```

**Process:**
1. Verify admin authentication
2. Validate password (min 6 chars)
3. Update password using Firebase Admin SDK
4. Log the change for audit
5. Return success/failure

**Files:**
- `user_management_router.js` - API endpoint
- `customer_provider.dart` - Flutter integration
- `client_admin_dashboard_screen.dart` - Client UI
- `admin_add_edit_customer_screen.dart` - Customer UI

### Security
- Admin-only access (verified by backend)
- Uses Firebase Admin SDK (bypasses current password requirement)
- All password changes are logged
- Passwords are never stored in plain text

---

## Customer Password Reset

### Self-Service Password Reset

**For Customers Who Forgot Password:**

1. Go to login screen
2. Click "Forgot Password?"
3. Enter email address
4. Receive password reset email
5. Click link in email
6. Set new password
7. Login with new password

### Admin-Initiated Password Reset

**When Admin Needs to Reset Customer Password:**

1. Go to Customer Management
2. Find the customer
3. Click edit
4. Use "Update Password" section
5. Enter new password
6. Customer can login with new password

---

## Testing

### Test 1: New Customer Password Setup

**Steps:**
1. Login as admin
2. Go to Customer Management → Add Customer
3. Fill in customer details
4. Submit
5. Check customer's email inbox
6. Verify "Welcome + Set Your Password" email received
7. Click "Set Your Password" button
8. Set password
9. Login as customer with new password

**Expected Result:**
- ✅ Customer created successfully
- ✅ Email received within 1 minute
- ✅ Password reset link works
- ✅ Customer can set password
- ✅ Customer can login

### Test 2: Bulk Import Password Setup

**Steps:**
1. Login as admin or client
2. Go to Bulk Import
3. Upload CSV with customer data
4. Submit
5. Check each customer's email inbox
6. Verify all received "Welcome + Set Your Password" emails
7. Test password setup for one customer

**Expected Result:**
- ✅ All customers created successfully
- ✅ All emails received
- ✅ Password setup works for all

### Test 3: Admin Password Update

**Steps:**
1. Login as admin
2. Go to Client Management
3. Click edit on a client
4. Click "Update Password"
5. Enter new password: "TestPassword123"
6. Confirm password: "TestPassword123"
7. Click "Update Client"
8. Logout
9. Login as that client with new password

**Expected Result:**
- ✅ Password updated successfully
- ✅ Success message shown
- ✅ Client can login with new password
- ✅ Old password no longer works

### Test 4: Password Validation

**Steps:**
1. Try to set password with less than 6 characters
2. Try to set password with mismatched confirmation
3. Try to leave password blank when required

**Expected Result:**
- ✅ Error message for short password
- ✅ Error message for mismatched passwords
- ✅ Appropriate handling for blank password

---

## Troubleshooting

### Issue 1: Password Reset Email Not Received

**Symptoms:**
- Customer created successfully
- No email received

**Solutions:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check backend logs for email sending errors
4. Verify SMTP configuration (see EMAIL_SYSTEM_GUIDE.md)
5. Run test script: `node test-customer-email-debugging.js`

### Issue 2: Password Reset Link Expired

**Symptoms:**
- Customer clicks link
- Error: "Link expired"

**Solutions:**
1. Password reset links expire in 1 hour
2. Admin can resend email or manually update password
3. Customer can request new password reset from login screen

### Issue 3: Admin Password Update Fails

**Symptoms:**
- Admin tries to update password
- Error message shown

**Solutions:**
1. Check backend server is running
2. Verify admin is authenticated
3. Check password meets minimum requirements (6 chars)
4. Check backend logs for specific error
5. Verify Firebase Admin SDK is configured

### Issue 4: Password Too Weak

**Symptoms:**
- Error: "Password should be at least 6 characters"

**Solution:**
- Firebase requires minimum 6 characters
- Use stronger passwords for better security
- Consider adding password strength indicator

---

## Configuration

### Backend (.env)
```env
# Firebase Admin SDK (for password updates)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# SMTP (for password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Flutter (environment)
```dart
API_BASE_URL=http://192.168.1.2:3000
```

---

## API Reference

### 1. Send Welcome Email with Password Setup
```
POST /api/customer-approval/send-welcome-email
Authorization: Bearer <firebase-token>

Body:
{
  "customerId": "string",
  "customerEmail": "string",
  "customerName": "string",
  "companyName": "string"
}

Response:
{
  "success": true,
  "message": "Welcome email sent successfully",
  "emailSent": true,
  "messageId": "string"
}
```

### 2. Update Password (Admin)
```
POST /api/users/update-password
Authorization: Bearer <firebase-token>

Body:
{
  "userId": "string",
  "newPassword": "string"
}

Response:
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Security Best Practices

1. **Password Requirements:**
   - Minimum 6 characters (Firebase requirement)
   - Consider enforcing stronger passwords in production

2. **Password Reset Links:**
   - Expire in 1 hour
   - Single-use only
   - Secure Firebase-generated links

3. **Admin Password Updates:**
   - Admin-only access
   - All changes logged
   - Uses Firebase Admin SDK

4. **Password Storage:**
   - Never stored in plain text
   - Handled by Firebase Authentication
   - Industry-standard encryption

---

## Quick Reference

### Key Files
- **Backend:** `user_management_router.js`, `customer_approval_router.js`
- **Email:** `email_service.js`, `email_templates.js`
- **Flutter:** `customer_provider.dart`, `client_admin_dashboard_screen.dart`
- **Test:** `test-customer-email-debugging.js`, `test-password-update.js`

### Important Notes
- Password reset links expire in 1 hour
- Minimum password length: 6 characters
- Admin can update passwords without current password
- All password changes are logged
- Customers receive email with password setup link

---

**Last Updated:** December 5, 2024
**Status:** ✅ Complete and tested
