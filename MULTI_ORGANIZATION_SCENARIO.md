# Multi-Organization Route Optimization Scenario

## Scenario: 11 Employees from 11 Different Companies

### Problem Statement
Admin has 11 pending roster requests:
- Employee 1 from Company A
- Employee 2 from Company B
- Employee 3 from Company C
- ... (and so on)
- Employee 11 from Company K

Admin enters "11" in the route optimization dialog.

### Business Rule
**Employees from different companies CANNOT share a vehicle.**

Even if there's only 1 person from each company, they must travel alone.

## Solution: Multi-Vehicle Assignment

### New Method Added
`RouteOptimizationService.optimizeMultiOrganizationRoutes()`

This method handles scenarios where customers are from multiple organizations by:
1. **Grouping** customers by organization
2. **Assigning** each organization to a separate vehicle
3. **Respecting** the organization segregation rule

### How It Works

#### Step 1: Group by Organization
```
Organizations:
- Company A: [Employee 1]
- Company B: [Employee 2]
- Company C: [Employee 3]
- Company D: [Employee 4]
- Company E: [Employee 5]
- Company F: [Employee 6]
- Company G: [Employee 7]
- Company H: [Employee 8]
- Company I: [Employee 9]
- Company J: [Employee 10]
- Company K: [Employee 11]

Total: 11 organizations, 11 customers
```

#### Step 2: Sort by Organization Size
Organizations are sorted by customer count (largest first):
- All have 1 customer, so order remains as-is

#### Step 3: Assign Vehicles
```
Assignment 1:
  🏢 Organization: Company A
  👥 Customers: 1 (Employee 1)
  🚗 Vehicle: Vehicle-001

Assignment 2:
  🏢 Organization: Company B
  👥 Customers: 1 (Employee 2)
  🚗 Vehicle: Vehicle-002

Assignment 3:
  🏢 Organization: Company C
  👥 Customers: 1 (Employee 3)
  🚗 Vehicle: Vehicle-003

... (continues for all 11 organizations)

Assignment 11:
  🏢 Organization: Company K
  👥 Customers: 1 (Employee 11)
  🚗 Vehicle: Vehicle-011
```

### Result
✅ **11 vehicles assigned** (one per organization)
✅ **11 customers assigned** (each traveling alone)
✅ **Organization rule enforced** (no mixing)

## Implementation Status

### Current Implementation
The `findOptimalCustomerCluster()` method currently:
- ✅ Groups customers by organization
- ✅ Finds the best single organization with enough customers
- ⚠️ Returns customers from only ONE organization

### What Happens Now (Before Multi-Vehicle Support)
When admin enters "11" with 11 employees from 11 different companies:

```
🏢 STEP 1: GROUPING BY ORGANIZATION
✅ Found 11 organizations:
   📊 Company A: 1 customer
   📊 Company B: 1 customer
   ... (11 total)

🎯 STEP 2: FINDING BEST ORGANIZATION GROUP
   ⚪ Company A: Only 1 customer (need 11) - SKIPPED
   ⚪ Company B: Only 1 customer (need 11) - SKIPPED
   ... (all skipped)

⚠️ NO ORGANIZATION HAS 11 CUSTOMERS
Falling back to largest organization group...

✅ Selected: Company A (1 customer)
⚠️ Returning 1 customer (less than requested 11)
```

**Result**: Only 1 customer assigned (from Company A)

### Recommended Approach

#### Option 1: Show Multi-Vehicle Dialog (RECOMMENDED)
When no single organization has enough customers, show a dialog:

```
┌─────────────────────────────────────────────┐
│  Multi-Vehicle Assignment Required          │
├─────────────────────────────────────────────┤
│                                             │
│  You requested 11 customers, but they are  │
│  from 11 different organizations.           │
│                                             │
│  To maintain organization segregation:      │
│                                             │
│  • 11 vehicles will be assigned             │
│  • Each employee travels alone              │
│  • No mixing between companies              │
│                                             │
│  Organizations:                             │
│  • Company A: 1 employee → Vehicle 1        │
│  • Company B: 1 employee → Vehicle 2        │
│  • Company C: 1 employee → Vehicle 3        │
│  ... (8 more)                               │
│                                             │
│  [Cancel]  [Assign 11 Vehicles]             │
└─────────────────────────────────────────────┘
```

#### Option 2: Auto-Assign Multiple Vehicles
Automatically call `optimizeMultiOrganizationRoutes()` and assign multiple vehicles without confirmation.

#### Option 3: Suggest Organization Filter
Show a message suggesting the admin filter by organization first:

```
┌─────────────────────────────────────────────┐
│  Organization Filter Recommended            │
├─────────────────────────────────────────────┤
│                                             │
│  The 11 selected customers are from 11      │
│  different organizations.                   │
│                                             │
│  Recommendation:                            │
│  1. Filter by organization first            │
│  2. Optimize routes for each organization   │
│     separately                              │
│                                             │
│  Or:                                        │
│  • Assign 11 vehicles (one per employee)    │
│                                             │
│  [Filter by Org]  [Assign 11 Vehicles]      │
└─────────────────────────────────────────────┘
```

## Code Integration

### File: `pending_rosters_screen.dart`

Update `_performAdvancedRouteOptimization()` method:

```dart
Future<void> _performAdvancedRouteOptimization(int count) async {
  // ... existing code ...
  
  // After grouping by organization
  final optimalCustomers = RouteOptimizationService.findOptimalCustomerCluster(
    _filteredRosters,
    count,
  );
  
  // 🔥 NEW: Check if we got fewer customers than requested
  if (optimalCustomers.length < count) {
    debugPrint('⚠️ Only ${optimalCustomers.length} customers from single org');
    debugPrint('   Requested: $count');
    debugPrint('   Checking if multi-vehicle assignment needed...');
    
    // Check if customers are from multiple organizations
    final organizations = <String>{};
    for (final customer in _filteredRosters) {
      final org = RouteOptimizationService._getOrganization(customer);
      organizations.add(org);
    }
    
    if (organizations.length > 1) {
      // Show multi-vehicle dialog
      _showMultiVehicleConfirmationDialog(
        requestedCount: count,
        organizations: organizations.length,
        customers: _filteredRosters.take(count).toList(),
        vehicles: allVehicles,
      );
      return;
    }
  }
  
  // Continue with single-vehicle optimization...
}
```

## Benefits of Multi-Vehicle Approach

### Operational
✅ Handles edge cases gracefully
✅ Maintains organization segregation rule
✅ Maximizes customer assignment efficiency

### User Experience
✅ Admin understands why multiple vehicles are needed
✅ Clear visibility into organization distribution
✅ Transparent decision-making process

### Business
✅ Complies with corporate client requirements
✅ Reduces liability and security risks
✅ Enables accurate billing per organization

## Testing Scenarios

### Test Case 1: 11 Employees, 11 Companies
```
Input: 11 customers from 11 different companies
Expected: 11 vehicle assignments (one per company)
```

### Test Case 2: Mixed Organization Sizes
```
Input: 
- Company A: 5 employees
- Company B: 3 employees
- Company C: 2 employees
- Company D: 1 employee

Request: 11 customers

Expected:
- Vehicle 1: Company A (5 employees)
- Vehicle 2: Company B (3 employees)
- Vehicle 3: Company C (2 employees)
- Vehicle 4: Company D (1 employee)
Total: 4 vehicles, 11 customers
```

### Test Case 3: Insufficient Vehicles
```
Input: 11 customers from 11 companies
Available: 5 vehicles

Expected:
- Assign first 5 organizations to 5 vehicles
- Show warning: "Only 5 of 11 customers assigned (insufficient vehicles)"
```

## Related Files

- ✅ `abra_fleet/lib/core/services/route_optimization_service.dart` - Core algorithm
- ⏳ `abra_fleet/lib/features/admin/customer_management/notification/pending_rosters_screen.dart` - UI integration (TODO)
- ✅ `ORGANIZATION_SEGREGATION_RULE.md` - Business rule documentation
- ✅ `ORGANIZATION_RULE_IMPLEMENTATION_SUMMARY.md` - Implementation summary

## Next Steps

1. **Integrate** `optimizeMultiOrganizationRoutes()` into UI workflow
2. **Create** multi-vehicle confirmation dialog
3. **Test** with real data (11 employees from different companies)
4. **Monitor** vehicle availability and capacity
5. **Add** analytics for multi-vehicle assignments

---

**Status**: ✅ Algorithm implemented, ⏳ UI integration pending
**Priority**: HIGH (handles critical edge case)
**Business Impact**: Ensures organization segregation rule is always enforced
