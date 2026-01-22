@echo off
echo.
echo ===============================================
echo FIXING FLUTTER COMPILATION ERRORS
echo ===============================================
echo.

cd abra_fleet

echo 🧹 Cleaning Flutter cache...
flutter clean

echo 📦 Getting dependencies...
flutter pub get

echo 🔄 Running code generation (if needed)...
flutter packages pub run build_runner build --delete-conflicting-outputs

echo ✅ Ready to run!
echo.
echo Now run: flutter run -d chrome
echo.
pause