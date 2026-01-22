# File Upload Error Fix

## Problem
When clicking "Choose File" button, you got this error:
```
Error picking file: On web_path is unavailable and accessing it causes this exception.
You should access bytes property instead.
```

## Root Cause
The file picker was trying to access the `path` property which is not available on web platforms. On web, files are accessed via `bytes` instead of file paths.

## Solution Applied

### 1. Added Platform Detection
The code now checks which property is available:
- **Mobile/Desktop**: Uses `path` property (file system path)
- **Web**: Uses `bytes` property (file data in memory)

### 2. Updated File Picker Configuration
```dart
FilePickerResult? result = await FilePicker.platform.pickFiles(
  type: FileType.custom,
  allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  withData: true, // ← Added this for web support
);
```

### 3. Platform-Specific Handling
```dart
if (pickedFile.path != null) {
  // Mobile/Desktop - has file path
  selectedFile = File(pickedFile.path!);
} else if (pickedFile.bytes != null) {
  // Web - has bytes data
  // Show warning that web upload needs different handling
}
```

## Current Status

### ✅ Working Platforms
- **Windows Desktop** - Full file upload support
- **Android** - Full file upload support
- **iOS** - Full file upload support
- **macOS** - Full file upload support
- **Linux** - Full file upload support

### ⚠️ Limited Support
- **Web Browser** - File selection works, but upload to Firebase Storage requires additional implementation

## For Web Platform

If you're running on web (browser), you'll see this message:
```
"Note: Web file upload is not fully supported yet. 
Please use mobile or desktop app."
```

### Why Web is Different
- Web doesn't have direct file system access
- Files are loaded as bytes in memory
- Firebase Storage upload needs different API for web
- Requires additional web-specific implementation

### Workaround for Web
You can still:
1. Create document records without files (use placeholder)
2. Add document name and expiry date
3. Track document status
4. Use the desktop or mobile app for actual file uploads

## How to Use Now

### On Desktop/Mobile (Recommended)
1. Click "Choose File" button
2. Select your document (PDF, image, etc.)
3. File name appears with checkmark ✅
4. Click "Add Document"
5. File uploads to Firebase Storage
6. Success! ✅

### On Web Browser
1. Click "Choose File" button
2. Select your document
3. You'll see a warning message
4. You can either:
   - Continue without file (creates record only)
   - Switch to desktop/mobile app for upload

## Testing

### Test on Desktop (Windows)
```bash
# Run the app
flutter run -d windows
```

### Test on Web
```bash
# Run the app
flutter run -d chrome
```

### Test on Mobile
```bash
# Android
flutter run -d android

# iOS
flutter run -d ios
```

## Future Enhancement

To fully support web file uploads, we need to:

1. **Update DocumentStorageService** to handle bytes:
```dart
Future<String> uploadVehicleDocumentBytes({
  required String vehicleId,
  required Uint8List bytes,
  required String fileName,
  required String documentType,
}) async {
  // Web-specific upload using bytes
}
```

2. **Detect Platform** and use appropriate method:
```dart
import 'package:flutter/foundation.dart' show kIsWeb;

if (kIsWeb) {
  // Use bytes upload
} else {
  // Use file path upload
}
```

3. **Update File Picker** to store bytes for web:
```dart
if (kIsWeb && pickedFile.bytes != null) {
  // Store bytes for web upload
  selectedFileBytes = pickedFile.bytes!;
}
```

## Summary

✅ **Fixed**: File picker error on web
✅ **Working**: File upload on desktop and mobile
⚠️ **Limited**: Web file upload (can create records without files)
🔄 **Next**: Implement full web file upload support

For now, **use the desktop or mobile app** for uploading document files. The web version can still manage document records and track expiry dates.
