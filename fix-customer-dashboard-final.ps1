# Read all lines
$allLines = Get-Content "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart"

Write-Host "Total lines in file: $($allLines.Count)"

# The class properly ends at line 2815 (index 2814 in 0-based array)
# Line 2815 contains the closing brace } for the class
$properEndLine = 2814  # 0-based index for line 2815

# Keep only lines up to and including line 2815
$cleanLines = $allLines[0..$properEndLine]

# Write back
$cleanLines | Set-Content "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart" -Encoding UTF8

Write-Host "✅ Fixed customer_dashboard.dart"
Write-Host "   Kept lines: $($cleanLines.Count) (up to line 2815)"
Write-Host "   Removed: $($allLines.Count - $cleanLines.Count) duplicate/garbage lines"
