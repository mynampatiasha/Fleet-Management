@echo off
echo ========================================
echo FIREBASE REMOVAL - SIMPLE APPROACH
echo ========================================
echo.

echo This will guide you through removing Firebase manually.
echo.
echo STEP 1: Edit pubspec.yaml
echo ----------------------------------------
echo Open abra_fleet/pubspec.yaml and remove these lines:
echo   firebase_core: ^2.24.2
echo   firebase_auth: ^4.16.0
echo   firebase_database: ^10.4.0
echo   firebase_storage: ^11.6.0
echo   cloud_firestore: ^4.14.0
echo   firebase_messaging: ^14.7.10
echo.
pause

echo.
echo STEP 2: Delete firebase_options.dart
echo ----------------------------------------
if exist "abra_fleet\lib\firebase_options.dart" (
    del "abra_fleet\lib\firebase_options.dart"
    echo ✓ Deleted firebase_options.dart
) else (
    echo ✓ firebase_options.dart already deleted
)
echo.
pause

echo.
echo STEP 3: Clean Flutter project
echo ----------------------------------------
cd abra_fleet
call flutter clean
echo ✓ Flutter clean completed
echo.

echo STEP 4: Get packages
echo ----------------------------------------
call flutter pub get
echo ✓ Flutter pub get completed
echo.
cd ..

echo.
echo ========================================
echo NEXT: Fix compilation errors manually
echo ========================================
echo.
echo Open FIREBASE_COMPLETE_REMOVAL_GUIDE_FINAL.md
echo Follow the file-by-file instructions to replace Firebase calls
echo.
pause
