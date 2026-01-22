# Read all lines
$lines = Get-Content "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart"

# The class properly ends at line 2815 (index 2814)
# Everything after that is duplicate code
$cleanLines = $lines[0..2814]

# Write back to file
$cleanLines | Out-File "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart" -Encoding UTF8

Write-Host "✅ Fixed customer_dashboard.dart"
Write-Host "   Original lines: $($lines.Count)"
Write-Host "   Clean lines: $($cleanLines.Count)"
Write-Host "   Removed: $($lines.Count - $cleanLines.Count) duplicate lines"
