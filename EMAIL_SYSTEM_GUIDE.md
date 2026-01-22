# Email System - Complete Guide

## Overview
Complete documentation for the email notification system in Abra Fleet, including setup, debugging, troubleshooting, and testing.

---

## Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Email Features](#email-features)
3. [Debugging System](#debugging-system)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Setup & Configuration

### SMTP Configuration (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Configure Backend (.env file):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

4. **Restart Backend Server:**
```bash
cd abra_fleet_backend
npm start
```

---

## Email Features

### 1. Customer Registration Approval
- **Trigger:** Admin approves pending customer
- **Email Type:** Approval notification
- **Contains:** Welcome message, account details, login instructions

### 2. Customer Registration Rejection
- **Trigger:** Admin rejects pending customer
- **Email Type:** Rejection notification
- **Contains:** Rejection reason, contact information

### 3. Customer Created by Admin/Client
- **Trigger:** Admin/client creates customer directly
- **Email Type:** Welcome + Password Setup
- **Contains:** Welcome message, password reset link, account details

### 4. Bulk Import Customers
- **Trigger:** Admin/client imports customers via CSV
- **Email Type:** Welcome + Password Setup (for each customer)
- **Contains:** Welcome message, password reset link, account details

---

## Debugging System

### Where Debugging Happens

#### 1. Flutter Frontend
**File:** `customer_provider.dart`

**Methods:**
- `createCustomer()` - Single customer creation
- `addCustomer()` - Bulk import
- `_sendWelcomeEmail()` - Email sending

**Output Example:**
```
📧📧📧📧... SENDING WELCOME EMAIL TO NEW CUSTOMER
================================================================================
📧 WELCOME EMAIL DEBUGGING - START
================================================================================
🔹 Customer ID: abc123
🔹 Customer Name: John Doe
🔹 Customer Email: john@example.com
🔹 Company Name: Acme Corp
🔹 Timestamp: 2024-12-05T10:30:00.000Z
--------------------------------------------------------------------------------
🔹 Backend URL: http://192.168.1.2:3000
🔹 Endpoint: /api/customer-approval/send-welcome-email
✅ Authenticated user: admin@example.com
✅ Auth token obtained (length: 1234)
--------------------------------------------------------------------------------
📤 Sending HTTP POST request...
📦 Request body: {"customerId":"abc123",...}
--------------------------------------------------------------------------------
📥 Response received:
🔹 Status Code: 200
🔹 Response Body: {"success":true,"emailSent":true}
================================================================================
✅ SUCCESS: Welcome email sent to john@example.com
================================================================================
```

#### 2. Backend API
**File:** `customer_approval_router.js`

**Endpoint:** `POST /api/customer-approval/send-welcome-email`

**Output Example:**
```
================================================================================
📧 BACKEND - SEND WELCOME EMAIL ENDPOINT
================================================================================
🔹 Timestamp: 2024-12-05T10:30:00.000Z
--------------------------------------------------------------------------------
📦 Request Body:
   Customer ID: abc123
   Customer Email: john@example.com
   Customer Name: John Doe
   Company Name: Acme Corp
--------------------------------------------------------------------------------
✅ Validation passed
--------------------------------------------------------------------------------
🔐 Generating Firebase password reset link...
✅ Password reset link generated successfully
   Link length: 456 characters
--------------------------------------------------------------------------------
📧 Calling email service...
--------------------------------------------------------------------------------
📬 Email Service Result:
   Success: true
   Message ID: <abc123@gmail.com>
================================================================================
✅ SUCCESS: Welcome email sent successfully
🔹 Recipient: john@example.com
🔹 Message ID: <abc123@gmail.com>
================================================================================
```

#### 3. Email Service
**File:** `email_service.js`

**Method:** `sendCustomerApprovalEmail()`

**Output Example:**
```
================================================================================
📧 EMAIL SERVICE - SEND CUSTOMER APPROVAL EMAIL
================================================================================
🔹 Recipient Email: john@example.com
🔹 Recipient Name: John Doe
🔹 Company Name: Acme Corp
🔹 Password Reset Link: YES (provided)
🔹 Timestamp: 2024-12-05T10:30:00.000Z
--------------------------------------------------------------------------------
✅ Email service is initialized
🔹 SMTP Host: smtp.gmail.com
🔹 SMTP Port: 587
🔹 SMTP User: your-email@gmail.com
--------------------------------------------------------------------------------
📝 Email Type: WELCOME + PASSWORD SETUP
📦 Mail Options:
   From: "Abra Fleet Support" <your-email@gmail.com>
   To: john@example.com
   Subject: 🎉 Welcome to Abra Fleet - Set Your Password
   HTML Length: 3456 characters
   Text Length: 1234 characters
--------------------------------------------------------------------------------
📤 Sending email via SMTP...
================================================================================
✅ SUCCESS: Email sent successfully!
🔹 Message ID: <abc123@gmail.com>
🔹 Response: 250 2.0.0 OK
🔹 Accepted: ["john@example.com"]
🔹 Rejected: []
🔹 Email Type: Welcome + Password Setup
🔹 Recipient: john@example.com
================================================================================
```

### Success Flow
```
1. Flutter: 📧 SENDING WELCOME EMAIL
2. Flutter: ✅ Auth token obtained
3. Flutter: 📤 Sending HTTP POST request
4. Backend: 📧 BACKEND - SEND WELCOME EMAIL ENDPOINT
5. Backend: ✅ Password reset link generated
6. Backend: 📧 Calling email service
7. Email Service: 📧 EMAIL SERVICE - SEND CUSTOMER APPROVAL EMAIL
8. Email Service: ✅ SUCCESS: Email sent successfully!
9. Backend: ✅ SUCCESS: Welcome email sent successfully
10. Flutter: ✅ SUCCESS: Welcome email sent to [email]
```

---

## Testing

### Option 1: Automated Test Script
```bash
cd abra_fleet_backend
node test-customer-email-debugging.js
```

This script will:
- Check email service initialization
- Verify SMTP connection
- Generate password reset link
- Send test email

### Option 2: Manual Test - Admin UI
1. Run Flutter app in debug mode
2. Login as admin
3. Go to Customer Management → Add Customer
4. Fill in details and submit
5. Watch Flutter console and backend console

### Option 3: Manual Test - Bulk Import
1. Run Flutter app in debug mode
2. Login as admin or client
3. Go to Bulk Import
4. Upload CSV with customer data
5. Watch console output for each customer

### Option 4: Test Approval Flow
1. Have a customer register via app
2. Login as admin
3. Go to Pending Customers
4. Approve the customer
5. Check customer's email inbox

---

## Troubleshooting

### Issue 1: Email Service Not Initialized

**Symptoms:**
```
❌ FAILED: Email service not initialized
🔹 SMTP_USER: NOT SET
🔹 SMTP_PASSWORD: NOT SET
```

**Solution:**
1. Check `.env` file exists in `abra_fleet_backend/`
2. Verify SMTP credentials are set
3. Restart backend server

### Issue 2: SMTP Authentication Failed

**Symptoms:**
```
❌ FAILED: Error sending email
🔹 Error Code: EAUTH
```

**Solutions:**
1. Verify Gmail App Password is correct (16 characters, no spaces)
2. Ensure 2-factor authentication is enabled on Gmail
3. Generate a new App Password
4. Update `SMTP_PASSWORD` in `.env`
5. Restart backend server

### Issue 3: Password Reset Link Generation Failed

**Symptoms:**
```
❌ FAILED: Could not generate password reset link
🔹 Error Code: auth/user-not-found
```

**Solutions:**
1. Verify customer exists in Firebase Authentication
2. Check Firebase service account credentials
3. Ensure customer email is correct

### Issue 4: Email Not Received

**Symptoms:**
- Backend shows success but customer doesn't receive email

**Solutions:**
1. Check customer's spam/junk folder
2. Verify email address is correct
3. Check Gmail sending limits (500 emails/day)
4. Verify SMTP_USER email is not blocked
5. Check email service logs for delivery status

### Issue 5: HTTP Request Failed

**Symptoms:**
```
❌ FAILED: HTTP request failed
🔹 Status: 500
```

**Solutions:**
1. Check backend server is running
2. Verify `API_BASE_URL` in Flutter app matches backend
3. Check network connectivity
4. Review backend logs for errors

### Issue 6: Connection Timeout

**Symptoms:**
```
❌ Error: Connection timeout
```

**Solutions:**
1. Check firewall settings
2. Verify SMTP port 587 is not blocked
3. Try alternative port (465 with SMTP_SECURE=true)
4. Check network proxy settings

---

## Quick Reference

### Visual Markers
- 📧 = Email-related action
- ✅ = Success
- ❌ = Failure
- ⚠️ = Warning
- 🔹 = Detail/Info
- 📦 = Data/Payload
- 📤 = Sending
- 📥 = Receiving
- 🔐 = Security/Auth

### Key Files
- **Flutter:** `customer_provider.dart`
- **Backend:** `customer_approval_router.js`
- **Email Service:** `email_service.js`
- **Email Templates:** `email_templates.js`
- **Test Script:** `test-customer-email-debugging.js`

### Important Notes
- Email sending is non-critical - customer creation succeeds even if email fails
- Password reset links expire in 1 hour
- Gmail has a limit of 500 emails per day
- Always check both Flutter console and backend console
- Check spam folder if email not received

---

## Configuration Checklist

- [ ] Gmail 2-factor authentication enabled
- [ ] Gmail App Password generated
- [ ] Backend `.env` file configured with SMTP credentials
- [ ] Backend server restarted after configuration
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Password reset link works
- [ ] Debugging output is clear and helpful

---

## Support

If you encounter issues not covered in this guide:
1. Check the debugging output for specific error messages
2. Run the test script: `node test-customer-email-debugging.js`
3. Verify all configuration steps are completed
4. Check Firebase Authentication is enabled
5. Review backend server logs for additional details

---

**Last Updated:** December 5, 2024
**Status:** ✅ Complete and tested
