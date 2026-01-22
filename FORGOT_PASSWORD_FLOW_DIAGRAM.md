# Forgot Password - Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIN SCREEN                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Email: [________________]                            │          │
│  │  Password: [________________]                         │          │
│  │                                                        │          │
│  │  [Forgot Password?] ◄─── USER CLICKS HERE            │          │
│  │                                                        │          │
│  │  [Login Button]                                       │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   FORGOT PASSWORD SCREEN                             │
│                                                                      │
│                          🔒                                          │
│                   Forgot Password?                                   │
│                                                                      │
│  Enter your email address and we'll send you                        │
│  a link to reset your password.                                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Email: [user@example.com]                           │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │         📧 Send Reset Link                            │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ℹ️  Check your spam folder if you don't receive                    │
│     the email within a few minutes.                                 │
│                                                                      │
│  [← Back to Login]                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUTTER APP (Frontend)                            │
│                                                                      │
│  FirebaseAuth.instance.sendPasswordResetEmail(                      │
│    email: "user@example.com"                                        │
│  )                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FIREBASE AUTH SERVICE                             │
│                                                                      │
│  1. Validates email format                                          │
│  2. Checks if user exists                                           │
│  3. Generates secure reset link                                     │
│  4. Link expires in 1 hour                                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Optional)                            │
│                                                                      │
│  POST /api/auth/forgot-password                                     │
│  {                                                                   │
│    "email": "user@example.com"                                      │
│  }                                                                   │
│                                                                      │
│  1. Verify user exists in Firebase Auth                             │
│  2. Generate password reset link                                    │
│  3. Send email via NodeMailer                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EMAIL SERVICE (NodeMailer)                        │
│                                                                      │
│  SMTP Configuration:                                                │
│  - Host: smtp.gmail.com                                             │
│  - Port: 587                                                        │
│  - User: your-email@gmail.com                                       │
│  - Pass: app-password                                               │
│                                                                      │
│  Sends professional HTML email with:                                │
│  - Personalized greeting                                            │
│  - Reset password button                                            │
│  - Security tips                                                    │
│  - Plain text fallback                                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER'S EMAIL INBOX                                │
│                                                                      │
│  From: Abra Fleet Support                                           │
│  Subject: 🔐 Reset Your Abra Fleet Password                         │
│                                                                      │
│  ┌────────────────────────────────────────────────────┐            │
│  │  Hello John,                                        │            │
│  │                                                     │            │
│  │  We received a request to reset your password.     │            │
│  │                                                     │            │
│  │  ┌──────────────────────────────────────┐         │            │
│  │  │    🔐 Reset My Password               │         │            │
│  │  └──────────────────────────────────────┘         │            │
│  │                                                     │            │
│  │  ⏰ This link expires in 1 hour                    │            │
│  │                                                     │            │
│  │  🔒 Security Tips:                                 │            │
│  │  • Never share your password                       │            │
│  │  • Use a strong, unique password                   │            │
│  └────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ USER CLICKS BUTTON
┌─────────────────────────────────────────────────────────────────────┐
│                FIREBASE PASSWORD RESET PAGE                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  New Password: [________________]                     │          │
│  │  Confirm Password: [________________]                 │          │
│  │                                                        │          │
│  │  [Reset Password]                                     │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FIREBASE AUTH SERVICE                             │
│                                                                      │
│  1. Validates new password                                          │
│  2. Updates password in Firebase Auth                               │
│  3. Invalidates reset link                                          │
│  4. Shows success message                                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUCCESS MESSAGE                                   │
│                                                                      │
│  ✅ Password updated successfully!                                  │
│                                                                      │
│  You can now login with your new password.                          │
│                                                                      │
│  [Return to Login]                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIN SCREEN                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Email: [user@example.com]                            │          │
│  │  Password: [new-password]  ◄─── NEW PASSWORD         │          │
│  │                                                        │          │
│  │  [Login Button]  ◄─── USER LOGS IN                   │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ✅ Login Successful! Welcome back.                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FORGOT PASSWORD SCREEN                            │
│                                                                      │
│  Email: [invalid-email]                                             │
│  [Send Reset Link]                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VALIDATION ERROR                                  │
│                                                                      │
│  ❌ Enter a valid email address                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    FORGOT PASSWORD SCREEN                            │
│                                                                      │
│  Email: [nonexistent@example.com]                                   │
│  [Send Reset Link]                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER NOT FOUND ERROR                              │
│                                                                      │
│  ❌ No account found with this email address                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    FIREBASE PASSWORD RESET PAGE                      │
│                                                                      │
│  Link expired or invalid                                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LINK EXPIRED ERROR                                │
│                                                                      │
│  ❌ The action code is invalid or expired                           │
│                                                                      │
│  Please request a new password reset link.                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Success Flow Timeline

```
Time: 0s
┌────────────────────────────────────────┐
│ User clicks "Forgot Password?"         │
└────────────────────────────────────────┘

Time: 1s
┌────────────────────────────────────────┐
│ Forgot password screen opens           │
└────────────────────────────────────────┘

Time: 5s
┌────────────────────────────────────────┐
│ User enters email and clicks send      │
└────────────────────────────────────────┘

Time: 6s
┌────────────────────────────────────────┐
│ Firebase generates reset link          │
└────────────────────────────────────────┘

Time: 7s
┌────────────────────────────────────────┐
│ NodeMailer sends email                 │
└────────────────────────────────────────┘

Time: 8s
┌────────────────────────────────────────┐
│ Success message shown                  │
│ User returns to login screen           │
└────────────────────────────────────────┘

Time: 10s
┌────────────────────────────────────────┐
│ Email arrives in user's inbox          │
└────────────────────────────────────────┘

Time: 15s
┌────────────────────────────────────────┐
│ User opens email and clicks button     │
└────────────────────────────────────────┘

Time: 16s
┌────────────────────────────────────────┐
│ Firebase password reset page opens     │
└────────────────────────────────────────┘

Time: 25s
┌────────────────────────────────────────┐
│ User enters new password                │
└────────────────────────────────────────┘

Time: 26s
┌────────────────────────────────────────┐
│ Password updated successfully          │
└────────────────────────────────────────┘

Time: 30s
┌────────────────────────────────────────┐
│ User returns to login screen           │
│ Logs in with new password              │
│ ✅ Success!                            │
└────────────────────────────────────────┘
```

## Component Interaction

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Flutter    │────▶│   Firebase   │────▶│   Backend    │
│     App      │     │     Auth     │     │     API      │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │                    │                     ▼
       │                    │              ┌──────────────┐
       │                    │              │  NodeMailer  │
       │                    │              │    SMTP      │
       │                    │              └──────────────┘
       │                    │                     │
       │                    │                     ▼
       │                    │              ┌──────────────┐
       │                    │              │    Email     │
       │                    │              │   Inbox      │
       │                    │              └──────────────┘
       │                    │                     │
       │                    ▼                     │
       │             ┌──────────────┐            │
       │             │   Password   │◀───────────┘
       │             │  Reset Page  │
       │             └──────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       └────────────▶│   Success!   │
                     │  Login Again │
                     └──────────────┘
```

---

**This diagram shows the complete flow from clicking "Forgot Password?" to successfully logging in with the new password.**
