@echo off
echo ========================================
echo Firebase Storage CORS Configuration
echo ========================================
echo.

echo Step 1: Checking if gcloud is installed...
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Google Cloud SDK is not installed!
    echo.
    echo Please download and install from:
    echo https://cloud.google.com/sdk/docs/install
    echo.
    pause
    exit /b 1
)
echo ✓ gcloud is installed

echo.
echo Step 2: Initializing gcloud (if needed)...
gcloud config get-value project >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Running gcloud init...
    gcloud init
)

echo.
echo Step 3: Setting project to abrafleet-cec94...
gcloud config set project abrafleet-cec94

echo.
echo Step 4: Applying CORS configuration...
gsutil cors set cors.json gs://abrafleet-cec94.firebasestorage.app

echo.
echo Step 5: Verifying CORS configuration...
gsutil cors get gs://abrafleet-cec94.firebasestorage.app

echo.
echo ========================================
echo ✓ CORS Configuration Applied!
echo ========================================
echo.
echo Next steps:
echo 1. Refresh your browser (Ctrl + R)
echo 2. Try uploading a document again
echo 3. The CORS error should be gone!
echo.
pause
