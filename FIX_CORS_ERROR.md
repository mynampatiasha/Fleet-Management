# 🔧 Fix CORS Error for Firebase Storage

## The Error You're Seeing

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:50473' has been blocked by CORS policy
```

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature that prevents web pages from making requests to a different domain than the one serving the page. Firebase Storage needs to be configured to allow requests from your web app.

## ✅ Solution: Apply CORS Configuration

You already have a `cors.json` file in your project. Now you need to apply it to your Firebase Storage bucket.

### Method 1: Using Google Cloud SDK (Recommended)

#### Step 1: Install Google Cloud SDK

**Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run the installer
3. Follow the installation wizard

**Or use PowerShell:**
```powershell
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

#### Step 2: Initialize gcloud

Open Command Prompt or PowerShell and run:

```bash
# Initialize gcloud
gcloud init

# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project abrafleet-cec94
```

#### Step 3: Apply CORS Configuration

Navigate to your project folder and run:

```bash
# Navigate to your project
cd path\to\abra_fleet

# Apply CORS configuration
gsutil cors set cors.json gs://abrafleet-cec94.firebasestorage.app
```

#### Step 4: Verify CORS Configuration

```bash
# Check if CORS is applied
gsutil cors get gs://abrafleet-cec94.firebasestorage.app
```

You should see your CORS configuration displayed.

### Method 2: Using Firebase Console (Alternative)

If you don't want to install Google Cloud SDK, you can use the Firebase Console:

1. Go to: https://console.firebase.google.com/
2. Select your project: **abrafleet-cec94**
3. Click on **Storage** in the left menu
4. Click on the **Rules** tab
5. Update your storage rules to be more permissive (temporarily for testing)

### Method 3: Quick Fix for Development

For development purposes, you can temporarily use a more permissive CORS configuration:

**Update your `cors.json` file:**

```json
[
  {
    "origin": ["http://localhost:*", "http://127.0.0.1:*"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
      "x-goog-meta-*"
    ]
  }
]
```

Then apply it using gsutil as shown in Method 1.

## 🚀 Quick Commands (Copy & Paste)

### For Windows PowerShell:

```powershell
# 1. Install gcloud (if not installed)
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Initialize and login
gcloud init
gcloud auth login

# 3. Set project
gcloud config set project abrafleet-cec94

# 4. Navigate to your project
cd C:\path\to\abra_fleet

# 5. Apply CORS
gsutil cors set cors.json gs://abrafleet-cec94.firebasestorage.app

# 6. Verify
gsutil cors get gs://abrafleet-cec94.firebasestorage.app
```

### For Command Prompt:

```cmd
REM 1. Initialize and login
gcloud init
gcloud auth login

REM 2. Set project
gcloud config set project abrafleet-cec94

REM 3. Navigate to your project
cd C:\path\to\abra_fleet

REM 4. Apply CORS
gsutil cors set cors.json gs://abrafleet-cec94.firebasestorage.app

REM 5. Verify
gsutil cors get gs://abrafleet-cec94.firebasestorage.app
```

## 🔍 Troubleshooting

### Error: "gsutil: command not found"

**Solution:** Install Google Cloud SDK first.

### Error: "AccessDeniedException: 403"

**Solution:** Make sure you're logged in with the correct Google account:
```bash
gcloud auth login
```

### Error: "Invalid bucket name"

**Solution:** Make sure the bucket name is correct:
```bash
# Your bucket name is:
gs://abrafleet-cec94.firebasestorage.app
```

### CORS Still Not Working After Applying

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Hard refresh** (Ctrl + F5)
3. **Restart your app** (flutter run)
4. **Wait 5-10 minutes** for changes to propagate

## ✅ After Applying CORS

Once CORS is configured, you should be able to:

1. ✅ Upload files from web browser
2. ✅ No more CORS errors
3. ✅ Files appear in Firebase Storage
4. ✅ Download/view documents works

## 🧪 Test the Fix

After applying CORS:

1. **Refresh your browser** (Ctrl + R)
2. **Try uploading a document again**
3. **Check browser console** (F12) - should see no CORS errors
4. **Verify upload success** - document should appear in list

## 📝 Alternative: Use Firebase Storage Emulator (Development)

For local development, you can use the Firebase Storage Emulator:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize emulators
firebase init emulators

# Start emulator
firebase emulators:start
```

Then update your Flutter app to use the emulator:

```dart
// In your main.dart or initialization code
if (kDebugMode) {
  await FirebaseStorage.instance.useStorageEmulator('localhost', 9199);
}
```

## 🎯 Recommended Solution

**For Production:**
- Use Method 1 (Google Cloud SDK) to apply CORS configuration
- This is a one-time setup
- Works for all environments

**For Development:**
- Use Firebase Storage Emulator
- No CORS issues
- Faster development

## 📚 Additional Resources

- [Firebase Storage CORS Documentation](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud SDK Installation](https://cloud.google.com/sdk/docs/install)
- [gsutil CORS Documentation](https://cloud.google.com/storage/docs/configuring-cors)

## Summary

1. Install Google Cloud SDK
2. Run: `gcloud init` and login
3. Run: `gsutil cors set cors.json gs://abrafleet-cec94.firebasestorage.app`
4. Refresh browser and test upload
5. Done! ✅

The CORS error will be fixed and file uploads will work perfectly on web! 🎉
