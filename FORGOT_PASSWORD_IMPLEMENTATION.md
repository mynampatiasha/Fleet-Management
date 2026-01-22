# Forgot Password Feature - Complete Implementation

## Overview
Simple and user-friendly forgot password feature that sends password reset emails via NodeMailer.

## User Flow

### 1. User Clicks "Forgot Password" on Login Screen
- User is on the login screen
- Clicks "Forgot Password?" link below the password field

### 2. Forgot Password Screen Opens
- Clean, simple screen with:
  - Lock icon
  - "Forgot Password?" title
  - Description text
  - Email input field
  - "Send Reset Link" button
  - Info box about checking spam folder
  - "Back to Login" button

### 3. User Enters Email
- User types their registered email address
- Email validation ensures proper format

### 4. Email Sent via NodeMailer
- Backend generates Firebase password reset link
- NodeMailer sends professional email with:
  - Personalized greeting
  - Reset password button
  - Link expires in 1 hour
  - Security tips
  - Plain text fallback

### 5. User Receives Email
- Email arrives in inbox (or spam folder)
- User clicks "Reset My Password" button
- Opens Firebase password reset page

### 6. User Resets Password
- User enters new password
- Confirms new password
- Firebase updates the password

### 7. User Logs In Again
- Returns to login screen
- Logs in with new password
- Success!

## Technical Implementation

### Frontend (Flutter)

**File:** `abra_fleet/lib/features/auth/presentation/screens/forgot_password_screen.dart`

**Features:**
- Clean, modern UI matching login screen design
- Email validation
- Loading states
- Success/error messages
- Uses Firebase Auth's `sendPasswordResetEmail()`

**Key Code:**
```dart
await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
```

### Backend (Node.js)

**File:** `abra_fleet_backend/routes/password_reset_router.js`

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully. Please check your inbox."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "No account found with this email address"
}
```

**Process:**
1. Validates email
2. Checks if user exists in Firebase Auth
3. Generates password reset link using Firebase Admin SDK
4. Sends email via NodeMailer
5. Returns success/error response

### Email Service

**File:** `abra_fleet_backend/services/email_service.js`

**Method:** `sendPasswordResetEmail({ email, name, resetLink })`

**Features:**
- Professional HTML email template
- Plain text fallback
- Personalized with user's name
- Security tips included
- 1-hour expiration notice

### Email Templates

**File:** `abra_fleet_backend/services/email_templates.js`

**Templates:**
- `getPasswordResetTemplate(name, resetLink)` - HTML version
- `getPasswordResetText(name, resetLink)` - Plain text version

**Email Design:**
- Gradient header with lock icon
- Clear call-to-action button
- Warning about 1-hour expiration
- Security tips box
- Professional footer

## Configuration

### Environment Variables (.env)

Make sure these are set in `abra_fleet_backend/.env`:

```env
# SMTP Configuration for NodeMailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Gmail App Password Setup

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security > App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Use it as `SMTP_PASSWORD` in .env

## Testing

### Test Script

**File:** `abra_fleet_backend/test-forgot-password.js`

**Run:**
```bash
node test-forgot-password.js
```

**What it does:**
- Sends password reset request to backend
- Displays success/error response
- Reminds you to check email

### Manual Testing

1. **Start Backend:**
   ```bash
   cd abra_fleet_backend
   node index.js
   ```

2. **Start Flutter App:**
   ```bash
   cd abra_fleet
   flutter run -d chrome
   ```

3. **Test Flow:**
   - Open login screen
   - Click "Forgot Password?"
   - Enter your email
   - Click "Send Reset Link"
   - Check your email inbox
   - Click reset link in email
   - Enter new password
   - Return to login
   - Login with new password

## Error Handling

### Frontend Errors
- **Empty email:** "Please enter your email"
- **Invalid format:** "Enter a valid email address"
- **User not found:** "No account found with this email address"
- **Too many requests:** "Too many requests. Please try again later"
- **Network error:** Shows error message

### Backend Errors
- **Missing email:** 400 - "Email address is required"
- **User not found:** 404 - "No account found with this email address"
- **Email service not configured:** 500 - "Email service not configured"
- **Email sending failed:** 500 - "Failed to send password reset email"

## Security Features

1. **Link Expiration:** Reset links expire after 1 hour
2. **Firebase Security:** Uses Firebase's secure password reset mechanism
3. **Email Validation:** Validates email format before processing
4. **User Verification:** Checks if user exists before sending email
5. **HTTPS:** Email links use HTTPS for secure password reset
6. **No Password Exposure:** Never sends passwords via email

## UI/UX Features

1. **Clean Design:** Matches login screen aesthetic
2. **Clear Instructions:** Tells user exactly what to do
3. **Loading States:** Shows spinner while processing
4. **Success Feedback:** Green snackbar confirms email sent
5. **Error Feedback:** Red snackbar shows clear error messages
6. **Spam Reminder:** Info box reminds to check spam folder
7. **Easy Navigation:** Back button returns to login
8. **Responsive:** Works on mobile, tablet, and web

## Files Modified/Created

### Created Files:
1. `abra_fleet/lib/features/auth/presentation/screens/forgot_password_screen.dart` (rewritten)
2. `abra_fleet_backend/routes/password_reset_router.js`
3. `abra_fleet_backend/test-forgot-password.js`
4. `FORGOT_PASSWORD_IMPLEMENTATION.md`

### Modified Files:
1. `abra_fleet_backend/services/email_service.js` - Added `sendPasswordResetEmail()` method
2. `abra_fleet_backend/services/email_templates.js` - Added password reset templates
3. `abra_fleet_backend/index.js` - Registered password reset router

## Next Steps

1. **Test the feature:**
   ```bash
   # Terminal 1: Start backend
   cd abra_fleet_backend
   node index.js
   
   # Terminal 2: Test forgot password
   node test-forgot-password.js
   ```

2. **Verify email configuration:**
   - Check SMTP credentials in .env
   - Test email sending works

3. **Test in Flutter app:**
   - Run the app
   - Try forgot password flow
   - Verify email arrives
   - Test password reset

4. **Deploy to production:**
   - Update production .env with SMTP credentials
   - Test in production environment
   - Monitor email delivery

## Troubleshooting

### Email Not Sending

**Check:**
1. SMTP credentials in .env are correct
2. Gmail App Password is valid (not regular password)
3. Email service initialized: Check backend logs for "✅ Email service initialized"
4. No firewall blocking port 587

**Fix:**
```bash
# Check backend logs when starting
node index.js
# Should see: ✅ Email service initialized
```

### Email Goes to Spam

**Solutions:**
1. Add sender email to contacts
2. Mark email as "Not Spam"
3. Check SPF/DKIM records (for production)

### Link Expired

**User sees:** "The action code is invalid or expired"

**Solution:**
- Request new password reset
- Links expire after 1 hour for security

### User Not Found

**Error:** "No account found with this email address"

**Causes:**
1. Email not registered
2. Typo in email address
3. User deleted from system

**Solution:**
- Verify email is correct
- Register new account if needed

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Verify email configuration
3. Test with test script first
4. Check Firebase console for user existence

---

**Status:** ✅ Complete and Ready to Test

**Last Updated:** December 12, 2025
