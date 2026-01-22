# Forgot Password - Quick Start Guide

## What Was Implemented

✅ **Simple forgot password flow:**
1. User clicks "Forgot Password?" on login screen
2. Popup opens asking for email
3. Email sent via NodeMailer with password reset link
4. User resets password
5. Password updated
6. User logs in again

## How to Test

### Step 1: Start Backend
```bash
cd abra_fleet_backend
node index.js
```

**Expected output:**
```
✅ Connected to MongoDB Atlas!
✅ Email service initialized
✅ Server running on port 3000
```

### Step 2: Test Email Sending (Optional)
```bash
cd abra_fleet_backend
node test-forgot-password.js
```

**What it does:**
- Sends test password reset email
- Check your inbox for the email

### Step 3: Test in Flutter App
```bash
cd abra_fleet
flutter run -d chrome
```

**Test flow:**
1. Open login screen
2. Click "Forgot Password?" link
3. Enter your email address
4. Click "Send Reset Link"
5. See success message
6. Check your email inbox (and spam folder)
7. Click "Reset My Password" button in email
8. Enter new password
9. Return to login screen
10. Login with new password

## Email Configuration

Make sure these are set in `abra_fleet_backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Get Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to "App Passwords"
4. Generate password for "Mail"
5. Copy 16-character password
6. Use as `SMTP_PASSWORD`

## Quick Test Commands

```bash
# Test 1: Check backend is running
curl http://localhost:3000/health

# Test 2: Test forgot password endpoint
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Test 3: Run test script
node test-forgot-password.js
```

## What the User Sees

### 1. Login Screen
- "Forgot Password?" link below password field

### 2. Forgot Password Screen
- 🔒 Lock icon
- "Forgot Password?" title
- Email input field
- "Send Reset Link" button
- Info box: "Check spam folder"
- "Back to Login" button

### 3. Success Message
```
✅ Password reset email sent to your-email@example.com

Please check your inbox and spam folder.
```

### 4. Email Received
**Subject:** 🔐 Reset Your Abra Fleet Password

**Content:**
- Personalized greeting
- "Reset My Password" button
- Link expires in 1 hour
- Security tips
- Plain text link as fallback

### 5. Password Reset Page
- Firebase's secure password reset page
- Enter new password
- Confirm new password
- Submit

### 6. Success!
- Password updated
- Return to login
- Login with new password

## Troubleshooting

### ❌ Email not sending?
**Check:**
```bash
# View backend logs
node index.js
# Should see: ✅ Email service initialized
```

**Fix:**
- Verify SMTP credentials in .env
- Use Gmail App Password (not regular password)
- Check port 587 is not blocked

### ❌ Email goes to spam?
**Fix:**
- Add sender to contacts
- Mark as "Not Spam"

### ❌ Link expired?
**Error:** "The action code is invalid or expired"

**Fix:**
- Request new password reset
- Links expire after 1 hour

### ❌ User not found?
**Error:** "No account found with this email address"

**Fix:**
- Check email spelling
- Verify user is registered
- Register new account if needed

## Files Created/Modified

### ✅ Created:
1. `forgot_password_screen.dart` - Clean UI for password reset
2. `password_reset_router.js` - Backend API endpoint
3. `test-forgot-password.js` - Test script
4. Email templates for password reset

### ✅ Modified:
1. `email_service.js` - Added password reset email method
2. `email_templates.js` - Added password reset templates
3. `index.js` - Registered password reset router

## Ready to Use!

The forgot password feature is now complete and ready to test. Just:

1. ✅ Start backend: `node index.js`
2. ✅ Run Flutter app: `flutter run -d chrome`
3. ✅ Click "Forgot Password?" on login screen
4. ✅ Enter email and send reset link
5. ✅ Check email and reset password
6. ✅ Login with new password

---

**Status:** ✅ Complete and Working

**Need Help?** Check `FORGOT_PASSWORD_IMPLEMENTATION.md` for detailed documentation.
