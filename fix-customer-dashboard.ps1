# Read the file
$content = Get-Content "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart" -Raw

# Find the position of the first proper class ending (after _buildQuickStatItem method)
# The file should end after the _buildQuickStatItem method closes

# Read line by line and stop at line 2819 (first proper ending)
$lines = Get-Content "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart"

# Take only the first 2819 lines (which includes the proper class ending)
$cleanLines = $lines[0..2818]

# Write back to file
$cleanLines | Out-File "abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart" -Encoding UTF8

Write-Host "✅ Fixed customer_dashboard.dart - removed duplicate code"
Write-Host "Original lines: $($lines.Count)"
Write-Host "Clean lines: $($cleanLines.Count)"
