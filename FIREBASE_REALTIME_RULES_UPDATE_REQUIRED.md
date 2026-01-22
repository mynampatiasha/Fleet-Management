# 🔥 Firebase Realtime Database Rules Update Required

## Issue
The admin user `admin@abrafleet.com` is getting permission denied errors for Firebase Realtime Database paths like `/roster_requests`.

## Solution
You need to manually update the Firebase Realtime Database rules in the Firebase Console.

## Steps to Fix

### 1. Go to Firebase Console
- Open https://console.firebase.google.com/
- Select your project
- Go to **Realtime Database** > **Rules**

### 2. Replace the current rules with these:

```json
{
  "rules": {
    ".read": "auth != null && auth.token.email == 'admin@abrafleet.com'",
    ".write": "auth != null && auth.token.email == 'admin@abrafleet.com'",
    
    "sos_events": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    "roster_requests": {
      ".read": "auth != null && auth.token.email == 'admin@abrafleet.com'",
      ".write": "auth != null"
    },
    
    "notifications": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    "driver_locations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    "trip_tracking": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 3. Click "Publish"

## What This Does
- Gives full read/write access to `admin@abrafleet.com`
- Allows authenticated users to read/write SOS events
- Allows admin to read roster requests
- Allows all authenticated users to access notifications and tracking data

## Test After Update
1. Hot reload your Flutter app (press 'r' in terminal)
2. Login with `admin@abrafleet.com` / `admin123`
3. You should now see the admin dashboard without permission errors

## Status
✅ Backend role mapping fixed (super_admin)
✅ Flutter app routing updated
⏳ **Firebase Realtime Database rules need manual update**