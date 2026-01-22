# Organization Segregation Rule - CRITICAL BUSINESS REQUIREMENT ⚠️

## Business Rule
**Employees from different companies/organizations MUST NEVER share the same vehicle.**

### Key Points
1. ✅ Employees from the **same organization** can share a vehicle
2. ❌ Employees from **different organizations** CANNOT share a vehicle
3. 🚗 Even if only **1 person** from a company, they travel **alone** - no mixing with other companies
4. 🔒 This is a **strict security and privacy requirement**

## Implementation

### File: `abra_fleet/lib/core/services/route_optimization_service.dart`

The `findOptimalCustomerCluster()` method now implements a **3-step process**:

#### Step 1: Group Customers by Organization
```dart
// Extract organization from customer data
final organization = customer['organization'] ?? 
                    customer['organizationName'] ?? 
                    customer['companyName'] ?? 
                    customer['company'] ?? 
                    customer['employeeDetails']?['organization'] ?? 
                    'Unknown Organization';
```

Groups all customers by their organization/company name.

#### Step 2: Find Best Organization Group
- Looks for organizations that have **at least** the requested number of customers
- Calculates **compactness score** (average distance from centroid) for each organization
- Selects the organization with the **most compact cluster** (closest customers to each other)
- **Fallback**: If no organization has enough customers, selects the largest organization group

#### Step 3: Select Closest Customers from Best Organization
- Within the selected organization, finds the N closest customers to each other
- Uses centroid-based clustering to minimize total travel distance
- Returns only customers from the **same organization**

## Example Scenarios

### Scenario 1: Multiple Organizations with Sufficient Customers
```
Organizations:
- TechCorp: 10 customers
- FinanceInc: 8 customers  
- RetailCo: 5 customers

Request: Optimize route for 3 customers

Result: 
✅ Selects 3 closest customers from TechCorp (most compact cluster)
❌ Will NOT mix TechCorp + FinanceInc customers
```

### Scenario 2: Single Customer from Organization
```
Organizations:
- TechCorp: 5 customers
- StartupXYZ: 1 customer

Request: Optimize route for 3 customers

Result:
✅ Selects 3 customers from TechCorp
❌ StartupXYZ customer travels alone (not mixed with TechCorp)
```

### Scenario 3: No Organization Has Enough Customers
```
Organizations:
- CompanyA: 2 customers
- CompanyB: 2 customers
- CompanyC: 1 customer

Request: Optimize route for 5 customers

Result:
✅ Selects all 2 customers from CompanyA (largest group)
⚠️ Returns only 2 customers (less than requested 5)
❌ Will NOT combine CompanyA + CompanyB to reach 5
```

## Database Fields Checked

The system checks multiple possible field names for organization:
- `organization`
- `organizationName`
- `companyName`
- `company`
- `employeeDetails.organization`
- `employeeDetails.company`

**Fallback**: If no organization field found, uses `"Unknown Organization"`

## Benefits

### Security & Privacy
- ✅ Prevents corporate espionage risks
- ✅ Maintains confidentiality between competing companies
- ✅ Ensures employees don't overhear sensitive business discussions

### Operational
- ✅ Reduces liability for fleet operator
- ✅ Meets corporate client requirements
- ✅ Enables organization-specific billing and tracking

### Customer Satisfaction
- ✅ Employees feel more comfortable with colleagues
- ✅ Can discuss work matters during commute
- ✅ Builds team camaraderie

## Testing

To verify this rule is working:

1. **Create test data** with customers from different organizations
2. **Run route optimization** requesting more customers than any single organization has
3. **Verify result** contains customers from only ONE organization
4. **Check logs** for organization grouping details

### Test Script Example
```javascript
// In MongoDB
db.rosters.find({ status: 'pending_assignment' }).forEach(roster => {
  print(`Customer: ${roster.customerName}, Org: ${roster.organization}`);
});
```

## Logging

The implementation includes comprehensive debug logging:

```
🏢 STEP 1: GROUPING BY ORGANIZATION
✅ Found 3 organizations:
   📊 TechCorp: 10 customers
   📊 FinanceInc: 8 customers
   📊 RetailCo: 5 customers

🎯 STEP 2: FINDING BEST ORGANIZATION GROUP
   📍 TechCorp: Avg distance 2.5 km ✅ NEW BEST!
   📍 FinanceInc: Avg distance 3.8 km
   📍 RetailCo: Avg distance 4.2 km

✅ BEST ORGANIZATION: TechCorp

📍 STEP 3: SELECTING 3 CLOSEST CUSTOMERS FROM TechCorp
✅ Selected 3 closest customers:
   1. John Doe - 1.2 km from centroid
   2. Jane Smith - 1.8 km from centroid
   3. Bob Wilson - 2.1 km from centroid

🏢 ORGANIZATION RULE ENFORCED: All customers from TechCorp only
```

## Related Files

- `abra_fleet/lib/core/services/route_optimization_service.dart` - Core implementation
- `abra_fleet/lib/features/admin/customer_management/notification/pending_rosters_screen.dart` - UI workflow
- `abra_fleet_backend/routes/route_optimization_router.js` - Backend API
- `ROUTE_ASSIGNMENT_BACKEND_FIX.md` - Backend setup
- `ROUTE_ASSIGNMENT_COMPLETE_IMPLEMENTATION.md` - Complete workflow

## Important Notes

⚠️ **DO NOT** modify this rule without explicit business approval
⚠️ **DO NOT** add a "mixed mode" option - this is a hard requirement
⚠️ **ALWAYS** verify organization field is populated in customer data

## Future Enhancements

Potential improvements while maintaining the segregation rule:

1. **Priority-based selection**: If multiple organizations qualify, prioritize by:
   - Customer priority level
   - Booking time (first-come-first-served)
   - Distance from depot

2. **Multi-vehicle optimization**: Optimize routes for multiple vehicles simultaneously, each serving a different organization

3. **Organization preferences**: Allow organizations to specify preferred pickup times or routes

4. **Analytics**: Track organization-specific metrics (on-time performance, satisfaction scores)
