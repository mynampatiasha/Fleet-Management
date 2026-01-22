# Fix all Firebase compilation errors
Write-Host "Fixing all Firebase compilation errors..." -ForegroundColor Cyan

$files = @(
    "abra_fleet\lib\features\admin\driver_management\presentation\providers\driver_provider.dart",
    "abra_fleet\lib\features\driver\dashboard\presentation\screens\driver_dashboard_screen.dart",
    "abra_fleet\lib\core\services\roster_service.dart",
    "abra_fleet\lib\features\admin\dashboard\presentation\screens\sos_alert.dart",
    "abra_fleet\lib\features\admin\client_management\client_admin_dashboard_screen.dart",
    "abra_fleet\lib\features\admin\customer_management\admin_pending_customers.dart",
    "abra_fleet\lib\features\admin\customer_management\notification\roster_model.dart",
    "abra_fleet\lib\features\admin\customer_management\notification\approved_rosters_screen.dart",
    "abra_fleet\lib\features\client\client_main_shell.dart",
    "abra_fleet\lib\features\notifications\presentation\screens\notifications_screen.dart",
    "abra_fleet\lib\features\client\client_employee_management.dart",
    "abra_fleet\lib\features\client\client_sos_alerts.dart",
    "abra_fleet\lib\features\client\client_profile_screen.dart",
    "abra_fleet\lib\features\customer\dashboard\presentation\screens\customer_profile_screen.dart"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        
        $content = $content -replace 'final FirebaseFirestore _firestore = FirebaseFirestore\.instance;', '// Firebase removed'
        $content = $content -replace 'final DatabaseReference _firebaseDb = FirebaseDatabase\.instance\.ref\(\);', '// Firebase removed'
        $content = $content -replace 'FirebaseDatabase\.instance', '// FirebaseDatabase removed'
        $content = $content -replace 'FirebaseFirestore\.instance', '// FirebaseFirestore removed'
        $content = $content -replace 'FieldValue\.serverTimestamp\(\)', 'DateTime.now().toIso8601String()'
        $content = $content -replace 'Timestamp\.fromDate\(', 'DateTime('
        $content = $content -replace 'StreamSubscription<DatabaseEvent>\?', 'StreamSubscription<dynamic>?'
        $content = $content -replace 'DatabaseReference\?', 'dynamic'
        
        Set-Content $file -Value $content -NoNewline
    }
}

Write-Host "All files processed!" -ForegroundColor Green
