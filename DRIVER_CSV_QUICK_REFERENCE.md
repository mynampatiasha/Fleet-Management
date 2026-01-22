# Driver CSV Import - Quick Reference

## Required CSV Column Names (Exact Match Required)

Copy these exact column names as your CSV header row:

```
First Name,Last Name,Email,Phone,DOB,Gender,Blood Group,Street,City,State,Postal Code,Country,License Number,License Type,Issue Date,Expiry Date,Issuing Authority,Emergency Contact Name,Emergency Contact Phone,Emergency Contact Relationship,Employee ID,Join Date,Employment Type,Salary,Bank Name,Account Holder,Account Number,IFSC Code,Status
```

## All 29 Fields Are REQUIRED

| # | Column Name | Format | Example |
|---|-------------|--------|---------|
| 1 | First Name | Text | John |
| 2 | Last Name | Text | Doe |
| 3 | Email | email@domain.com | john.doe@example.com |
| 4 | Phone | 10 digits | 9876543210 |
| 5 | DOB | YYYY-MM-DD | 1990-05-15 |
| 6 | Gender | Male/Female/Other | Male |
| 7 | Blood Group | A+, B+, O+, AB+, etc. | O+ |
| 8 | Street | Text | 123 Main Street |
| 9 | City | Text | New York |
| 10 | State | Text | NY |
| 11 | Postal Code | Alphanumeric | 10001 |
| 12 | Country | Text | USA |
| 13 | License Number | Alphanumeric | DL123456789 |
| 14 | License Type | Text | Commercial |
| 15 | Issue Date | YYYY-MM-DD | 2020-01-15 |
| 16 | Expiry Date | YYYY-MM-DD | 2030-01-15 |
| 17 | Issuing Authority | Text | State DMV |
| 18 | Emergency Contact Name | Text | Jane Doe |
| 19 | Emergency Contact Phone | 10 digits | 9876543211 |
| 20 | Emergency Contact Relationship | Text | Spouse |
| 21 | Employee ID | Alphanumeric | EMP001 |
| 22 | Join Date | YYYY-MM-DD | 2023-01-01 |
| 23 | Employment Type | Full-time/Part-time/Contract | Full-time |
| 24 | Salary | Number | 30000 |
| 25 | Bank Name | Text | HDFC Bank |
| 26 | Account Holder | Text | John Doe |
| 27 | Account Number | 14 digits | 12345678901234 |
| 28 | IFSC Code | 11 characters | HDFC0001234 |
| 29 | Status | active/inactive/on_leave | active |

## Key Format Rules

- **Dates**: Always YYYY-MM-DD format (e.g., 2023-01-15)
- **Phone**: 10 digits only, no country code, no spaces (e.g., 9876543210)
- **Status**: Lowercase only (active, inactive, on_leave)
- **IFSC Code**: 11 characters, format ABCD0123456
- **No Empty Fields**: All 29 fields must have values

## Quick Test Data

Use this sample row to test your import:

```csv
John,Doe,john.doe@example.com,9876543210,1990-05-15,Male,O+,123 Main St,Bangalore,Karnataka,560001,India,KA0120230001234,Commercial,2020-01-15,2030-01-14,RTO Bangalore,Jane Doe,9876543211,Spouse,EMP001,2023-01-01,Full-time,30000,HDFC Bank,John Doe,12345678901234,HDFC0001234,active
```

## Common Mistakes to Avoid

1. ❌ Using different column names (e.g., "FirstName" instead of "First Name")
2. ❌ Adding country code to phone numbers (e.g., +91 or +1)
3. ❌ Using uppercase for status (e.g., "Active" instead of "active")
4. ❌ Wrong date format (e.g., 15-01-2023 instead of 2023-01-15)
5. ❌ Leaving any field empty
6. ❌ Adding extra columns not in the template
7. ❌ Missing the header row

## Import Steps

1. Download template: `driver_import_template.csv`
2. Fill in your driver data (keep all 29 columns)
3. Save as CSV file
4. Go to Admin Dashboard → Driver Management
5. Click "Import" button
6. Select your CSV file
7. Review validation errors (if any)
8. Fix errors and re-upload
9. Confirm import

## Need Help?

- See full guide: `DRIVER_CSV_IMPORT_GUIDE.md`
- Use template: `driver_import_template.csv`
- Check validation errors in the import dialog
