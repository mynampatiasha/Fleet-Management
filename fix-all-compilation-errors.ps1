# PowerShell script to fix all compilation errors from Firebase to JWT migration

Write-Host "🔧 Starting compilation error fixes..." -ForegroundColor Cyan

# List of files with errors (from your error log)
$filesToFix = @(
    "abra_fleet/lib/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart",
    "abra_fleet/lib/features/client/client_main_shell.dart",
    "abra_fleet/lib/features/notifications/presentation/screens/notifications_screen.dart",
    "abra_fleet/lib/features/client/client_dashboard.dart",
    "abra_fleet/lib/features/client/client_employee_management.dart",
    "abra_fleet/lib/features/client/client_sos_alerts.dart",
    "abra_fleet/lib/features/client/client_profile_screen.dart",
    "abra_fleet/lib/core/services/trip_notification_service.dart",
    "abra_fleet/lib/features/admin/vehicle_admin_management/trip_operations/start_new_trip.dart",
    "abra_fleet/lib/features/admin/driver_admin_management/driver_admin_management_screen.dart",
    "abra_fleet/lib/features/admin/dashboard/presentation/screens/resolved_alerts_view.dart",
    "abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart",
    "abra_fleet/lib/features/admin/role_based_access/user_management_screen.dart",
    "abra_fleet/lib/features/TMS/my_tickets.dart",
    "abra_fleet/lib/features/driver/dashboard/presentation/screens/profile_driver_page.dart"
)

Write-Host "📝 Files to fix: $($filesToFix.Count)" -ForegroundColor Yellow

# Function to add missing import
function Add-MissingImport {
    param($filePath, $import)
    
    $content = Get-Content $filePath -Raw
    if ($content -notmatch [regex]::Escape($import)) {
        Write-Host "  ➕ Adding import: $import" -ForegroundColor Green
        $content = $import + "`n" + $content
        Set-Content $filePath $content -NoNewline
    }
}

# Function to fix duplicate variable declarations
function Fix-DuplicateDeclarations {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Pattern: Find methods with duplicate prefs/token declarations
    # This is a simplified fix - removes obvious duplicates
    $content = $content -replace '(\s+final prefs = await SharedPreferences\.getInstance\(\);)\s+final token = prefs\.getString\(''jwt_token''\);\s+final prefs = await SharedPreferences\.getInstance\(\);\s+final token = prefs\.getString\(''jwt_token''\);', '$1' + "`n" + '      final token = prefs.getString(''jwt_token'');'
    
    if ($content -ne $originalContent) {
        Write-Host "  ✅ Fixed duplicate declarations" -ForegroundColor Green
        Set-Content $filePath $content -NoNewline
        return $true
    }
    return $false
}

# Process each file
foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "`n📄 Processing: $file" -ForegroundColor Cyan
        
        # Add missing imports
        Add-MissingImport $file "import 'dart:convert';"
        Add-MissingImport $file "import 'package:shared_preferences/shared_preferences.dart';"
        
        # Fix duplicate declarations
        Fix-DuplicateDeclarations $file
        
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Basic fixes applied. Now applying specific file fixes..." -ForegroundColor Green
Write-Host "⚠️  Note: Some errors require manual fixes due to complexity" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run the Dart fix script: dart fix_specific_files.dart" -ForegroundColor White
Write-Host "2. Check remaining errors: flutter analyze" -ForegroundColor White
Write-Host "3. Manual fixes may be needed for complex cases" -ForegroundColor White
