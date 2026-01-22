# Comment out Firebase imports automatically
$files = @(
    "abra_fleet/lib/features/notifications/presentation/screens/notifications_screen.dart",
    "abra_fleet/lib/features/driver/dashboard/presentation/screens/driver_dashboard_screen.dart",
    "abra_fleet/lib/features/client/client_main_shell.dart",
    "abra_fleet/lib/features/client/client_employee_management.dart",
    "abra_fleet/lib/features/client/client_sos_alerts.dart",
    "abra_fleet/lib/features/client/client_profile_screen.dart",
    "abra_fleet/lib/core/services/roster_service.dart",
    "abra_fleet/lib/features/admin/dashboard/presentation/screens/sos_alert.dart",
    "abra_fleet/lib/features/admin/client_management/client_admin_dashboard_screen.dart",
    "abra_fleet/lib/features/admin/customer_management/admin_pending_customers.dart",
    "abra_fleet/lib/features/admin/customer_management/notification/roster_model.dart",
    "abra_fleet/lib/features/admin/customer_management/notification/approved_rosters_screen.dart",
    "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_profile_screen.dart",
    "abra_fleet/lib/core/services/document_storage_service.dart",
    "abra_fleet/lib/features/admin/driver_management/presentation/providers/driver_provider.dart",
    "abra_fleet/lib/features/admin/driver_management/domain/entities/driver_entity.dart",
    "abra_fleet/lib/features/admin/customer_management/domain/entities/customer_entity.dart"
)

$patterns = @(
    "import 'package:firebase_core/firebase_core.dart';",
    "import 'package:firebase_auth/firebase_auth.dart';",
    "import 'package:firebase_database/firebase_database.dart';",
    "import 'package:firebase_storage/firebase_storage.dart';",
    "import 'package:cloud_firestore/cloud_firestore.dart';",
    "import 'package:firebase_messaging/firebase_messaging.dart';"
)

Write-Host "Commenting out Firebase imports..." -ForegroundColor Yellow

$count = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $modified = $false
        
        foreach ($pattern in $patterns) {
            if ($content -match [regex]::Escape($pattern)) {
                $content = $content -replace [regex]::Escape($pattern), "// $pattern // TODO: Remove Firebase"
                $modified = $true
            }
        }
        
        if ($modified) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "✓ $file" -ForegroundColor Green
            $count++
        }
    }
}

Write-Host "`n✓ Commented out Firebase imports in $count files" -ForegroundColor Green
Write-Host "`nNext: Run 'cd abra_fleet' then 'flutter pub get'" -ForegroundColor Yellow
