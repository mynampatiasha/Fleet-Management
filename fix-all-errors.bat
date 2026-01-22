@echo off
echo ========================================
echo  Firebase to JWT Migration Error Fixes
echo ========================================
echo.

echo Step 1: Running Dart fix script...
dart fix_specific_files.dart

echo.
echo Step 2: Running Flutter clean...
cd abra_fleet
call flutter clean

echo.
echo Step 3: Getting dependencies...
call flutter pub get

echo.
echo Step 4: Running Flutter analyze...
call flutter analyze

echo.
echo ========================================
echo  Fix process complete!
echo ========================================
echo.
echo If there are still errors, check the output above.
echo Some complex errors may require manual fixes.
echo.
pause
