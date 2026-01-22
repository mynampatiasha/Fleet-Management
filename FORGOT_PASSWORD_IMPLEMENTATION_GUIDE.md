# Forgot Password Implementation Guide

## Overview
Implementing forgot password functionality in the login screen that sends password reset emails using NodeMailer.

## Current Status
✅ Backend already has forgot password implementation:
- Route: `POST /api/auth/forgot-password`
- File: `abra_fleet_backend/routes/password_reset_router.js`
- Email Service: `abra_fleet_backend/services/email_service.js`
- Uses NodeMailer to send emails

✅ Frontend has forgot password screen:
- File: `abra_fleet/lib/features/auth/presentation/screens/forgot_password_screen.dart`
- Already linked from login screen

## Implementation Flow

### 1. User Flow
1. User clicks "Forgot Password?" on login screen
2. User enters their registered email address
3. System checks if email exists in database
4. If exists, sends password reset email via NodeMailer
5. User receives email with reset link
6. User clicks link and sets new password

### 2. Backend Implementation (Already Done)
```javascript
// Route: POST /api/auth/forgot-password
// File: abra_fleet_backend/routes/password_reset_router.js

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // 1. Validate email
  // 2. Check if user exists
  // 3. Generate password reset link
  // 4. Send email using NodeMailer
  // 5. Return success response
});
```

### 3. Email Service (Already Done)
```javascript
// File: abra_fleet_backend/services/email_service.js

class EmailService {
  async sendPasswordResetEmail({ email, name, resetLink }) {
    // Uses NodeMailer to send HTML email
    // Template includes reset link button
    // Returns success/failure status
  }
}
```

### 4. Frontend Implementation Needed
The forgot password screen needs to:
1. Accept email input
2. Validate email format
3. Call backend API: `POST http://localhost:3001/api/auth/forgot-password`
4. Show success/error messages
5. Handle loading states

## Email Configuration
Required environment variables in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Testing
1. Enter registered email in forgot password screen
2. Check backend console for email sending logs
3. Check email inbox for password reset email
4. Click reset link in email
5. Set new password

## Reference Implementation
Similar implementation exists in:
- `driver_list_page.dart` - `_sendPasswordResetEmail()` method
- Shows how to call backend API and handle responses
- Displays success/error dialogs

## Next Steps
1. Check if `forgot_password_screen.dart` exists
2. If not, create it with proper API integration
3. Test email sending functionality
4. Verify reset link works correctly
