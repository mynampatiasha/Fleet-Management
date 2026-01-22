# Forgot Password - Test Checklist

## Pre-Testing Setup

### ✅ Backend Configuration

- [ ] Backend `.env` file has SMTP credentials:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASSWORD=your-app-password
  ```

- [ ] Gmail App Password generated (not regular password)
- [ ] Backend starts without errors: `node index.js`
- [ ] See "✅ Email service initialized" in logs
- [ ] See "✅ Server running on port 3000" in logs

### ✅ Frontend Configuration

- [ ] Flutter app compiles without errors
- [ ] Firebase configuration is correct
- [ ] App can connect to backend

## Functional Testing

### Test 1: Basic Flow (Happy Path)

- [ ] **Step 1:** Open login screen
- [ ] **Step 2:** Click "Forgot Password?" link
- [ ] **Step 3:** Forgot password screen opens
- [ ] **Step 4:** Enter valid email address
- [ ] **Step 5:** Click "Send Reset Link" button
- [ ] **Step 6:** See loading spinner
- [ ] **Step 7:** See success message (green snackbar)
- [ ] **Step 8:** Return to login screen
- [ ] **Step 9:** Check email inbox
- [ ] **Step 10:** Email received within 1 minute
- [ ] **Step 11:** Email has correct subject
- [ ] **Step 12:** Email has "Reset My Password" button
- [ ] **Step 13:** Click button in email
- [ ] **Step 14:** Firebase reset page opens
- [ ] **Step 15:** Enter new password
- [ ] **Step 16:** Confirm new password
- [ ] **Step 17:** Click "Reset Password"
- [ ] **Step 18:** See success message
- [ ] **Step 19:** Return to login screen
- [ ] **Step 20:** Login with new password
- [ ] **Step 21:** Login successful ✅

**Expected Result:** Complete flow works without errors

### Test 2: Email Validation

- [ ] **Test 2.1:** Leave email empty → See "Please enter your email"
- [ ] **Test 2.2:** Enter "invalid" → See "Enter a valid email address"
- [ ] **Test 2.3:** Enter "test@" → See "Enter a valid email address"
- [ ] **Test 2.4:** Enter "test@example" → See "Enter a valid email address"
- [ ] **Test 2.5:** Enter "test@example.com" → Validation passes ✅

**Expected Result:** All invalid emails are rejected

### Test 3: User Not Found

- [ ] **Step 1:** Enter email that doesn't exist: `nonexistent@example.com`
- [ ] **Step 2:** Click "Send Reset Link"
- [ ] **Step 3:** See error message (red snackbar)
- [ ] **Step 4:** Error says "No account found with this email address"

**Expected Result:** Clear error message for non-existent users

### Test 4: Email Delivery

- [ ] **Test 4.1:** Email arrives in inbox (not spam)
- [ ] **Test 4.2:** Email has correct sender: "Abra Fleet Support"
- [ ] **Test 4.3:** Email has correct subject: "🔐 Reset Your Abra Fleet Password"
- [ ] **Test 4.4:** Email has personalized greeting with user's name
- [ ] **Test 4.5:** Email has blue "Reset My Password" button
- [ ] **Test 4.6:** Email mentions 1-hour expiration
- [ ] **Test 4.7:** Email has security tips
- [ ] **Test 4.8:** Email has plain text link as fallback
- [ ] **Test 4.9:** Email has professional footer

**Expected Result:** Professional, well-formatted email

### Test 5: Link Expiration

- [ ] **Step 1:** Request password reset
- [ ] **Step 2:** Wait 61 minutes (or manually expire link)
- [ ] **Step 3:** Click reset link in email
- [ ] **Step 4:** See "The action code is invalid or expired" error
- [ ] **Step 5:** Request new reset link
- [ ] **Step 6:** New link works ✅

**Expected Result:** Expired links are rejected, new links work

### Test 6: Multiple Requests

- [ ] **Step 1:** Request password reset
- [ ] **Step 2:** Immediately request again
- [ ] **Step 3:** Request 3rd time
- [ ] **Step 4:** All emails received
- [ ] **Step 5:** Latest link works
- [ ] **Step 6:** Old links still work (until used or expired)

**Expected Result:** Multiple requests work, all links valid

### Test 7: UI/UX Testing

- [ ] **Test 7.1:** Screen layout looks good on mobile
- [ ] **Test 7.2:** Screen layout looks good on tablet
- [ ] **Test 7.3:** Screen layout looks good on web
- [ ] **Test 7.4:** Lock icon displays correctly
- [ ] **Test 7.5:** Text is readable and clear
- [ ] **Test 7.6:** Button is easy to click
- [ ] **Test 7.7:** Loading spinner shows during processing
- [ ] **Test 7.8:** Success message is clear and visible
- [ ] **Test 7.9:** Error messages are clear and helpful
- [ ] **Test 7.10:** "Back to Login" button works
- [ ] **Test 7.11:** Info box about spam folder is visible

**Expected Result:** Clean, professional, user-friendly interface

### Test 8: Error Handling

- [ ] **Test 8.1:** Backend offline → See network error
- [ ] **Test 8.2:** Invalid SMTP credentials → See email error
- [ ] **Test 8.3:** Firebase error → See clear error message
- [ ] **Test 8.4:** Network timeout → See timeout error

**Expected Result:** All errors handled gracefully with clear messages

### Test 9: Security Testing

- [ ] **Test 9.1:** Reset link uses HTTPS
- [ ] **Test 9.2:** Link expires after 1 hour
- [ ] **Test 9.3:** Link can only be used once
- [ ] **Test 9.4:** Old password stops working after reset
- [ ] **Test 9.5:** New password works immediately
- [ ] **Test 9.6:** No password sent in email
- [ ] **Test 9.7:** Email doesn't expose sensitive data

**Expected Result:** Secure password reset process

### Test 10: Backend API Testing

- [ ] **Test 10.1:** Run test script: `node test-forgot-password.js`
- [ ] **Test 10.2:** API returns 200 for valid email
- [ ] **Test 10.3:** API returns 404 for non-existent email
- [ ] **Test 10.4:** API returns 400 for invalid email
- [ ] **Test 10.5:** Backend logs show detailed information
- [ ] **Test 10.6:** Email service logs show email sent

**Expected Result:** API works correctly, logs are detailed

## Performance Testing

### Test 11: Speed & Responsiveness

- [ ] **Test 11.1:** Screen opens in < 1 second
- [ ] **Test 11.2:** Email validation is instant
- [ ] **Test 11.3:** API responds in < 2 seconds
- [ ] **Test 11.4:** Email arrives in < 30 seconds
- [ ] **Test 11.5:** Password reset completes in < 5 seconds
- [ ] **Test 11.6:** Total flow completes in < 1 minute

**Expected Result:** Fast, responsive user experience

## Cross-Platform Testing

### Test 12: Platform Compatibility

- [ ] **Test 12.1:** Works on Android
- [ ] **Test 12.2:** Works on iOS
- [ ] **Test 12.3:** Works on Web (Chrome)
- [ ] **Test 12.4:** Works on Web (Firefox)
- [ ] **Test 12.5:** Works on Web (Safari)
- [ ] **Test 12.6:** Works on Web (Edge)

**Expected Result:** Works on all platforms

## Email Client Testing

### Test 13: Email Compatibility

- [ ] **Test 13.1:** Email displays correctly in Gmail
- [ ] **Test 13.2:** Email displays correctly in Outlook
- [ ] **Test 13.3:** Email displays correctly in Yahoo Mail
- [ ] **Test 13.4:** Email displays correctly in Apple Mail
- [ ] **Test 13.5:** Email displays correctly on mobile
- [ ] **Test 13.6:** Plain text version works
- [ ] **Test 13.7:** Button is clickable
- [ ] **Test 13.8:** Link is clickable

**Expected Result:** Email works in all major email clients

## Accessibility Testing

### Test 14: Accessibility

- [ ] **Test 14.1:** Screen reader can read all text
- [ ] **Test 14.2:** Tab navigation works
- [ ] **Test 14.3:** Focus indicators are visible
- [ ] **Test 14.4:** Color contrast is sufficient
- [ ] **Test 14.5:** Text is readable at 200% zoom
- [ ] **Test 14.6:** Touch targets are large enough

**Expected Result:** Accessible to all users

## Integration Testing

### Test 15: Integration with Other Features

- [ ] **Test 15.1:** Can navigate from login to forgot password
- [ ] **Test 15.2:** Can navigate back to login
- [ ] **Test 15.3:** After reset, can login normally
- [ ] **Test 15.4:** After reset, all features work
- [ ] **Test 15.5:** User data is preserved after reset
- [ ] **Test 15.6:** Sessions are invalidated after reset

**Expected Result:** Integrates seamlessly with existing features

## Regression Testing

### Test 16: Existing Features Still Work

- [ ] **Test 16.1:** Normal login still works
- [ ] **Test 16.2:** Google sign-in still works
- [ ] **Test 16.3:** Registration still works
- [ ] **Test 16.4:** Other backend routes still work
- [ ] **Test 16.5:** Email service for other features still works

**Expected Result:** No existing features broken

## Production Readiness

### Test 17: Production Checklist

- [ ] **Test 17.1:** All tests passed
- [ ] **Test 17.2:** No console errors
- [ ] **Test 17.3:** No console warnings
- [ ] **Test 17.4:** Backend logs are clean
- [ ] **Test 17.5:** Email delivery is reliable
- [ ] **Test 17.6:** Performance is acceptable
- [ ] **Test 17.7:** Security is verified
- [ ] **Test 17.8:** Documentation is complete
- [ ] **Test 17.9:** Test script works
- [ ] **Test 17.10:** Ready for production ✅

**Expected Result:** Feature is production-ready

## Test Results Summary

### Overall Status

- [ ] All functional tests passed
- [ ] All error handling tests passed
- [ ] All UI/UX tests passed
- [ ] All security tests passed
- [ ] All performance tests passed
- [ ] All cross-platform tests passed
- [ ] All email tests passed
- [ ] All accessibility tests passed
- [ ] All integration tests passed
- [ ] All regression tests passed

### Issues Found

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Test Environment

- **Date:** _______________
- **Tester:** _______________
- **Backend Version:** _______________
- **Frontend Version:** _______________
- **Platform:** _______________
- **Browser:** _______________

### Sign-Off

- [ ] **Developer:** Feature complete and tested
- [ ] **QA:** All tests passed
- [ ] **Product Owner:** Approved for production
- [ ] **DevOps:** Deployed to production

---

## Quick Test Commands

```bash
# Start backend
cd abra_fleet_backend
node index.js

# Run test script
node test-forgot-password.js

# Start Flutter app
cd ../abra_fleet
flutter run -d chrome

# Check backend health
curl http://localhost:3000/health

# Test forgot password API
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

**Status:** Ready for Testing  
**Last Updated:** December 12, 2025
