@echo off
echo ========================================
echo Firebase Storage CORS Configuration
echo ========================================
echo.
echo This will configure CORS for your Firebase Storage bucket
echo to allow uploads from localhost and other origins.
echo.
echo Make sure you have:
echo 1. Google Cloud SDK (gcloud) installed
echo 2. Authenticated with: gcloud auth login
echo.
pause

echo.
echo Applying CORS configuration...
gsutil cors set cors.json gs://abrafleet-cec94.firebasestorage.app

echo.
echo ========================================
echo CORS Configuration Applied!
echo ========================================
echo.
echo Your Firebase Storage bucket now accepts uploads from web apps.
echo You can now upload SOS resolution photos from the admin dashboard.
echo.
pause
