#!/usr/bin/env node

/**
 * Fix Firebase Database Permissions
 * This script helps configure Firebase Realtime Database rules for proper access
 */

console.log('🔧 Firebase Database Permissions Fix');
console.log('=====================================');

console.log(`
📋 FIREBASE REALTIME DATABASE RULES NEEDED:

Copy and paste these rules into your Firebase Console:
Firebase Console > Realtime Database > Rules

{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "roster_requests": {
      ".read": "auth != null && (auth.token.role == 'admin' || auth.token.role == 'superAdmin')",
      ".write": "auth != null && (auth.token.role == 'admin' || auth.token.role == 'superAdmin')"
    },
    "notifications": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.role == 'admin' || auth.token.role == 'superAdmin')"
    },
    "trips": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "drivers": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.role == 'admin' || auth.token.role == 'superAdmin')"
    },
    "vehicles": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.role == 'admin' || auth.token.role == 'superAdmin')"
    }
  }
}

📋 STEPS TO FIX:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: abrafleet-cec94
3. Go to "Realtime Database" in the left menu
4. Click on "Rules" tab
5. Replace the existing rules with the rules above
6. Click "Publish" to save the changes

📋 FIREBASE AUTH CUSTOM CLAIMS:

You also need to set custom claims for the admin user.
Run this in your Firebase Functions or Admin SDK:

const admin = require('firebase-admin');

// Set custom claims for admin user
admin.auth().setCustomUserClaims('ADMIN_USER_UID', {
  role: 'admin'
}).then(() => {
  console.log('Custom claims set for admin user');
});

📋 ALTERNATIVE SIMPLE RULES (for development):

If you want to allow all authenticated users (less secure but simpler):

{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}

⚠️  WARNING: The simple rules above allow any authenticated user to read/write.
   Use the detailed rules for production.
`);

console.log('\n✅ Instructions provided above');
console.log('📋 After updating Firebase rules, restart your Flutter app');