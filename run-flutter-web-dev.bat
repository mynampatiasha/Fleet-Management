@echo off
echo Starting Flutter Web with CORS disabled for development...
cd abra_fleet
flutter run -d chrome --web-browser-flag="--disable-web-security" --web-browser-flag="--user-data-dir=temp" --web-browser-flag="--disable-features=VizDisplayCompositor"
pause