# Driver CSV Import Guide

This guide explains the CSV format required for bulk importing drivers into the Admin Dashboard.

## CSV Template File

A template file `driver_import_template.csv` has been created with sample data. You can use this as a starting point for your driver imports.

## Required Fields

All 29 fields below are **MANDATORY** and must be included in your CSV file with exact column names:

### 1. **First Name** (Required)
- **Description**: Driver's first name
- **Format**: Text string
- **Example**: `John`

### 2. **Last Name** (Required)
- **Description**: Driver's last name
- **Format**: Text string
- **Example**: `Doe`

### 3. **Email** (Required)
- **Description**: Driver's email address
- **Format**: Valid email format
- **Example**: `john.doe@example.com`
- **Notes**: Must be unique across all drivers

### 4. **Phone** (Required)
- **Description**: Driver's contact phone number (10 digits)
- **Format**: 10-digit number without country code
- **Example**: `9876543210`
- **Notes**: Must be unique across all drivers

### 5. **DOB** (Required)
- **Description**: Driver's date of birth
- **Format**: YYYY-MM-DD
- **Example**: `1990-05-15`

### 6. **Gender** (Required)
- **Description**: Driver's gender
- **Format**: Text string
- **Example**: `Male`, `Female`, `Other`

### 7. **Blood Group** (Required)
- **Description**: Driver's blood group
- **Format**: Text string
- **Example**: `O+`, `A+`, `B+`, `AB+`, `O-`, `A-`, `B-`, `AB-`

### 8. **Street** (Required)
- **Description**: Street address
- **Format**: Text string
- **Example**: `123 Main Street`

### 9. **City** (Required)
- **Description**: City name
- **Format**: Text string
- **Example**: `New York`

### 10. **State** (Required)
- **Description**: State or province
- **Format**: Text string or abbreviation
- **Example**: `NY`, `California`, `Karnataka`

### 11. **Postal Code** (Required)
- **Description**: Postal/ZIP code
- **Format**: Alphanumeric string
- **Example**: `10001`, `560001`

### 12. **Country** (Required)
- **Description**: Country name
- **Format**: Text string
- **Example**: `USA`, `India`

### 13. **License Number** (Required)
- **Description**: Driver's license number
- **Format**: Alphanumeric string
- **Example**: `DL123456789`, `KA0120230001234`
- **Notes**: Must be unique across all drivers

### 14. **License Type** (Required)
- **Description**: Type of driver's license
- **Format**: Text string
- **Example**: `Commercial`, `LMV`, `Heavy Vehicle`

### 15. **Issue Date** (Required)
- **Description**: Date when the license was issued
- **Format**: YYYY-MM-DD
- **Example**: `2020-01-15`

### 16. **Expiry Date** (Required)
- **Description**: Date when the license expires
- **Format**: YYYY-MM-DD
- **Example**: `2030-01-15`
- **Notes**: System will track expiring licenses for notifications

### 17. **Issuing Authority** (Required)
- **Description**: Authority that issued the license
- **Format**: Text string
- **Example**: `State DMV`, `RTO Bangalore`

### 18. **Emergency Contact Name** (Required)
- **Description**: Name of emergency contact person
- **Format**: Text string
- **Example**: `Jane Doe`

### 19. **Emergency Contact Phone** (Required)
- **Description**: Emergency contact's phone number (10 digits)
- **Format**: 10-digit number without country code
- **Example**: `9876543211`

### 20. **Emergency Contact Relationship** (Required)
- **Description**: Relationship to the driver
- **Format**: Text string
- **Example**: `Spouse`, `Parent`, `Sibling`, `Friend`

### 21. **Employee ID** (Required)
- **Description**: Unique employee identifier
- **Format**: Alphanumeric string
- **Example**: `EMP001`, `EMP002`

### 22. **Join Date** (Required)
- **Description**: Date when driver joined the company
- **Format**: YYYY-MM-DD
- **Example**: `2023-01-01`

### 23. **Employment Type** (Required)
- **Description**: Type of employment
- **Format**: Text string
- **Example**: `Full-time`, `Part-time`, `Contract`

### 24. **Salary** (Required)
- **Description**: Monthly salary amount
- **Format**: Numeric value (without currency symbol)
- **Example**: `30000`, `35000`

### 25. **Bank Name** (Required)
- **Description**: Name of the bank
- **Format**: Text string
- **Example**: `HDFC Bank`, `ICICI Bank`, `SBI Bank`

### 26. **Account Holder** (Required)
- **Description**: Name on the bank account
- **Format**: Text string
- **Example**: `John Doe`

### 27. **Account Number** (Required)
- **Description**: Bank account number
- **Format**: Numeric string (14 digits typical)
- **Example**: `12345678901234`

### 28. **IFSC Code** (Required)
- **Description**: Bank IFSC code
- **Format**: 11-character alphanumeric code
- **Example**: `HDFC0001234`, `ICIC0002345`

### 29. **Status** (Required)
- **Description**: Driver's current status
- **Format**: Text string (lowercase)
- **Example**: `active`, `inactive`, `on_leave`
- **Valid Values**: 
  - `active` - Driver is currently active and available
  - `inactive` - Driver is not currently working
  - `on_leave` - Driver is on leave

## CSV Format Rules

1. **Header Row**: First row must contain column names exactly as specified above
2. **Encoding**: UTF-8 encoding recommended
3. **Delimiter**: Comma (,) separated values
4. **Text Qualifier**: Use double quotes (") for text containing commas
5. **Date Format**: Always use YYYY-MM-DD format for dates
6. **Empty Fields**: Leave optional fields empty if no data available
7. **No Special Characters**: Avoid special characters in IDs (use alphanumeric only)

## Sample CSV Structure

```csv
First Name,Last Name,Email,Phone,DOB,Gender,Blood Group,Street,City,State,Postal Code,Country,License Number,License Type,Issue Date,Expiry Date,Issuing Authority,Emergency Contact Name,Emergency Contact Phone,Emergency Contact Relationship,Employee ID,Join Date,Employment Type,Salary,Bank Name,Account Holder,Account Number,IFSC Code,Status
John,Doe,john.doe@example.com,9876543210,1990-05-15,Male,O+,123 Main Street,New York,NY,10001,USA,DL123456789,Commercial,2020-01-15,2030-01-15,State DMV,Jane Doe,9876543211,Spouse,EMP001,2023-01-01,Full-time,30000,HDFC Bank,John Doe,12345678901234,HDFC0001234,active
```

## Import Process

1. **Prepare CSV File**: Use the template and fill in your driver data
2. **Validate Data**: Ensure all required fields are filled and formats are correct
3. **Open Admin Dashboard**: Navigate to Driver Management section
4. **Click Import Button**: Located in the top-right corner of the dashboard
5. **Select CSV File**: Choose your prepared CSV file
6. **Review Preview**: System will show a preview of drivers to be imported
7. **Confirm Import**: Click confirm to import all drivers
8. **Check Results**: System will show success/error messages for each driver

## Common Errors and Solutions

### Error: "Missing required fields"
- **Solution**: Ensure all required fields (marked as Required above) are filled for each driver

### Error: "Driver already exists"
- **Solution**: Check for duplicate driverId, phone, email, or licenseNumber in your CSV or existing database

### Error: "Invalid date format"
- **Solution**: Use YYYY-MM-DD format for all date fields (e.g., 2025-01-15)

### Error: "Invalid email format"
- **Solution**: Ensure email addresses follow standard format (e.g., user@domain.com)

### Error: "Invalid phone format"
- **Solution**: Use 10-digit format without country code (e.g., 9876543210)

## Best Practices

1. **Start Small**: Test with 2-3 drivers first before importing large batches
2. **Backup Data**: Keep a backup of your CSV file before importing
3. **Unique Employee IDs**: Use a consistent naming convention for employee IDs (e.g., EMP001, EMP002)
4. **Complete Information**: All 29 fields are required - ensure every field has valid data
5. **Verify Licenses**: Double-check license numbers and expiry dates
6. **Emergency Contacts**: Always include emergency contact information for safety
7. **Regular Updates**: Keep driver information up-to-date, especially license expiry dates
8. **Phone Numbers**: Use 10-digit format without country code or special characters
9. **IFSC Codes**: Verify bank IFSC codes are correct (11 characters, format: ABCD0123456)
10. **Status Values**: Use lowercase for status field (active, inactive, on_leave)

## Data Mapping

The CSV fields map to the backend driver structure as follows:

```
CSV Column Name              → Backend Field
─────────────────────────────────────────────────────
First Name                   → personalInfo.firstName
Last Name                    → personalInfo.lastName
Email                        → personalInfo.email
Phone                        → personalInfo.phone
DOB                          → personalInfo.dateOfBirth
Gender                       → personalInfo.gender
Blood Group                  → personalInfo.bloodGroup
Street                       → address.street
City                         → address.city
State                        → address.state
Postal Code                  → address.postalCode
Country                      → address.country
License Number               → license.licenseNumber
License Type                 → license.type
Issue Date                   → license.issueDate
Expiry Date                  → license.expiryDate
Issuing Authority            → license.issuingAuthority
Emergency Contact Name       → emergencyContact.name
Emergency Contact Phone      → emergencyContact.phone
Emergency Contact Relationship → emergencyContact.relationship
Employee ID                  → employmentDetails.employeeId
Join Date                    → employmentDetails.joinDate
Employment Type              → employmentDetails.employmentType
Salary                       → employmentDetails.salary
Bank Name                    → bankDetails.bankName
Account Holder               → bankDetails.accountHolderName
Account Number               → bankDetails.accountNumber
IFSC Code                    → bankDetails.ifscCode
Status                       → status
```

## Support

If you encounter any issues during the import process:
1. Check this guide for common errors
2. Verify your CSV format matches the template
3. Ensure all required fields are present
4. Contact system administrator for assistance

---

**Last Updated**: December 2025
**Version**: 1.0
