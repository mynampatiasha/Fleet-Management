# Complete Firebase Removal Script
# This script removes all Firebase dependencies from the Flutter project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIREBASE COMPLETE REMOVAL SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "abra_fleet"

# Step 1: Remove Firebase packages from pubspec.yaml
Write-Host "Step 1: Removing Firebase packages from pubspec.yaml..." -ForegroundColor Yellow
$pubspecPath = Join-Path $projectPath "pubspec.yaml"
$pubspecContent = Get-Content $pubspecPath -Raw

# Remove all Firebase dependencies
$pubspecContent = $pubspecContent -replace '  firebase_core:.*\n', ''
$pubspecContent = $pubspecContent -replace '  firebase_auth:.*\n', ''
$pubspecContent = $pubspecContent -replace '  firebase_database:.*\n', ''
$pubspecContent = $pubspecContent -replace '  firebase_storage:.*\n', ''
$pubspecContent = $pubspecContent -replace '  cloud_firestore:.*\n', ''
$pubspecContent = $pubspecContent -replace '  firebase_messaging:.*\n', ''

Set-Content -Path $pubspecPath -Value $pubspecContent
Write-Host "✓ Firebase packages removed from pubspec.yaml" -ForegroundColor Green

# Step 2: Delete firebase_options.dart
Write-Host "`nStep 2: Deleting firebase_options.dart..." -ForegroundColor Yellow
$firebaseOptionsPath = Join-Path $projectPath "lib\firebase_options.dart"
if (Test-Path $firebaseOptionsPath) {
    Remove-Item $firebaseOptionsPath -Force
    Write-Host "✓ firebase_options.dart deleted" -ForegroundColor Green
} else {
    Write-Host "✓ firebase_options.dart already deleted" -ForegroundColor Green
}

# Step 3: Remove Firebase imports from all Dart files
Write-Host "`nStep 3: Removing Firebase imports from Dart files..." -ForegroundColor Yellow
$dartFiles = Get-ChildItem -Path (Join-Path $projectPath "lib") -Filter "*.dart" -Recurse

$importPatterns = @(
    "import 'package:firebase_core/firebase_core.dart';",
    "import 'package:firebase_auth/firebase_auth.dart';",
    "import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;",
    "import 'package:firebase_database/firebase_database.dart';",
    "import 'package:firebase_storage/firebase_storage.dart';",
    "import 'package:cloud_firestore/cloud_firestore.dart';",
    "import 'package:firebase_messaging/firebase_messaging.dart';",
    "import '../../../firebase_options.dart';",
    "import '../../firebase_options.dart';",
    "import '../firebase_options.dart';"
)

$filesModified = 0
foreach ($file in $dartFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($pattern in $importPatterns) {
        $content = $content -replace [regex]::Escape($pattern), "// $pattern // REMOVED"
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content
        $filesModified++
    }
}

Write-Host "✓ Removed Firebase imports from $filesModified files" -ForegroundColor Green

# Step 4: Clean Flutter project
Write-Host "`nStep 4: Cleaning Flutter project..." -ForegroundColor Yellow
Set-Location $projectPath
flutter clean | Out-Null
Write-Host "✓ Flutter clean completed" -ForegroundColor Green

# Step 5: Get packages
Write-Host "`nStep 5: Getting Flutter packages..." -ForegroundColor Yellow
flutter pub get | Out-Null
Write-Host "✓ Flutter pub get completed" -ForegroundColor Green

Set-Location ..

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FIREBASE REMOVAL COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Review files with // REMOVED comments" -ForegroundColor White
Write-Host "2. Replace Firebase calls with HTTP API calls" -ForegroundColor White
Write-Host "3. Test the application" -ForegroundColor White
Write-Host ""
Write-Host "Files that need manual fixes:" -ForegroundColor Yellow
Write-Host "- lib/features/notifications/presentation/screens/notifications_screen.dart" -ForegroundColor White
Write-Host "- lib/features/client/client_sos_alerts.dart" -ForegroundColor White
Write-Host "- lib/features/admin/client_management/client_admin_dashboard_screen.dart" -ForegroundColor White
Write-Host "- lib/core/services/document_storage_service.dart" -ForegroundColor White
Write-Host "- lib/core/services/roster_service.dart" -ForegroundColor White
Write-Host "- lib/features/admin/driver_management/presentation/providers/driver_provider.dart" -ForegroundColor White
Write-Host ""
