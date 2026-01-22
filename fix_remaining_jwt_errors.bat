@echo off
echo Fixing remaining JWT compilation errors...

REM This will be done through Kiro's strReplace tool
echo Please run the Dart compilation to see remaining errors
echo Then we'll fix them one by one

cd abra_fleet
flutter analyze > ../flutter_errors.txt 2>&1
cd ..

echo Analysis complete. Check flutter_errors.txt for details.
