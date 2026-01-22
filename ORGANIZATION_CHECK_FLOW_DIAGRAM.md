# Organization Check Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  ROUTE ASSIGNMENT REQUEST                       │
│  POST /api/roster/assign-optimized-route                        │
│  { vehicleId, route: [customers...] }                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 1: FETCH VEHICLE DETAILS                      │
│  • Get vehicle from database                                    │
│  • Verify vehicle exists                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│       STEP 2: CHECK FOR EXISTING ASSIGNMENTS (TODAY)            │
│  Query: rosters.find({                                          │
│    vehicleId: vehicleId,                                        │
│    status: 'assigned',                                          │
│    assignedAt: { $gte: today }                                  │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                    ┌────┴────┐
                    │ Any?    │
                    └────┬────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
          YES                         NO
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│ STEP 3A:             │    │ STEP 3B:             │
│ ORGANIZATION CHECK   │    │ SKIP CHECK           │
│                      │    │                      │
│ Extract orgs from:   │    │ First assignment     │
│ • Existing customers │    │ Sets organization    │
│ • New customers      │    │                      │
│                      │    │ ✅ PROCEED           │
│ Compare:             │    └──────────┬───────────┘
│ allOrgs.size > 1?    │               │
└──────────┬───────────┘               │
           │                           │
      ┌────┴────┐                      │
      │ Match?  │                      │
      └────┬────┘                      │
           │                           │
    ┌──────┴──────┐                    │
    │             │                    │
   YES           NO                    │
    │             │                    │
    ▼             ▼                    │
┌────────┐  ┌──────────────┐          │
│ ✅ PASS │  │ ❌ CONFLICT  │          │
│        │  │              │          │
│ Same   │  │ Different    │          │
│ Org    │  │ Orgs         │          │
└───┬────┘  └──────┬───────┘          │
    │              │                  │
    │              ▼                  │
    │    ┌──────────────────┐         │
    │    │ RETURN 400 ERROR │         │
    │    │                  │         │
    │    │ error:           │         │
    │    │ ORGANIZATION_    │         │
    │    │ CONFLICT         │         │
    │    │                  │         │
    │    │ details: {       │         │
    │    │   existing: [...] │        │
    │    │   new: [...]     │         │
    │    │   conflict: [...] │        │
    │    │ }                │         │
    │    └──────────────────┘         │
    │                                 │
    └─────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: PROCESS ROUTE ASSIGNMENTS                  │
│  For each customer in route:                                    │
│  • Update roster with vehicle & driver                          │
│  • Set status to 'assigned'                                     │
│  • Store pickup sequence & times                                │
│  • Send notifications                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         STEP 5: UPDATE VEHICLE WITH ORGANIZATION                │
│  vehicles.updateOne({                                           │
│    $set: {                                                      │
│      currentOrganization: "TechCorp",                           │
│      lastRouteAssignment: new Date(),                           │
│      currentRouteDistance: 15.5,                                │
│      currentRouteTime: 45                                       │
│    }                                                            │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RETURN SUCCESS RESPONSE                       │
│  {                                                              │
│    success: true,                                               │
│    message: "Successfully assigned N customers",                │
│    data: { ... }                                                │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Organization Check Logic

```
┌─────────────────────────────────────────────────────────────────┐
│           ORGANIZATION EXTRACTION ALGORITHM                     │
└─────────────────────────────────────────────────────────────────┘

For each roster, check fields in order:
  1. roster.organization
  2. roster.organizationName
  3. roster.companyName
  4. roster.company
  5. roster.employeeDetails?.organization
  6. roster.employeeDetails?.company
  7. Default: "Unknown Organization"

┌─────────────────────────────────────────────────────────────────┐
│              ORGANIZATION COMPARISON LOGIC                      │
└─────────────────────────────────────────────────────────────────┘

existingOrgs = Set(["TechCorp"])
newOrgs = Set(["TechCorp", "FinanceInc"])

allOrgs = existingOrgs ∪ newOrgs
        = Set(["TechCorp", "FinanceInc"])

if (allOrgs.size > 1) {
  ❌ CONFLICT DETECTED
  Cannot mix: TechCorp + FinanceInc
} else {
  ✅ PASS
  All from: TechCorp
}
```

## Example Scenarios

### Scenario 1: Empty Vehicle (First Assignment)

```
┌──────────────┐
│ Vehicle-001  │
│ Empty        │
└──────┬───────┘
       │
       │ Assign 3 customers from TechCorp
       ▼
┌──────────────┐
│ Vehicle-001  │
│ TechCorp (3) │
└──────────────┘

Result: ✅ SUCCESS
Reason: First assignment sets organization
```

### Scenario 2: Same Organization (Pass)

```
┌──────────────┐
│ Vehicle-001  │
│ TechCorp (2) │
└──────┬───────┘
       │
       │ Assign 3 more from TechCorp
       ▼
┌──────────────┐
│ Vehicle-001  │
│ TechCorp (5) │
└──────────────┘

Result: ✅ SUCCESS
Reason: All customers from same organization
```

### Scenario 3: Different Organization (Fail)

```
┌──────────────┐
│ Vehicle-001  │
│ TechCorp (2) │
└──────┬───────┘
       │
       │ Assign 3 from FinanceInc
       ▼
       ❌
┌──────────────┐
│ CONFLICT!    │
│ TechCorp ≠   │
│ FinanceInc   │
└──────────────┘

Result: ❌ REJECTED (400 Error)
Reason: Organization mismatch
Error: ORGANIZATION_CONFLICT
```

## State Diagram

```
                    ┌─────────────┐
                    │   VEHICLE   │
                    │   EMPTY     │
                    └──────┬──────┘
                           │
                           │ First Assignment
                           │ (Any Organization)
                           ▼
                    ┌─────────────┐
                    │   VEHICLE   │
                    │  ASSIGNED   │
                    │  (Org: X)   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              │ New Assignment          │ New Assignment
              │ (Org: X)                │ (Org: Y)
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   VEHICLE   │           │   REJECT    │
       │  ASSIGNED   │           │  CONFLICT   │
       │  (Org: X)   │           │  X ≠ Y      │
       │  +N more    │           └─────────────┘
       └─────────────┘
              │
              │ End of Day / Reset
              ▼
       ┌─────────────┐
       │   VEHICLE   │
       │   EMPTY     │
       └─────────────┘
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   REQUEST    │────▶│   BACKEND    │────▶│   DATABASE   │
│              │     │              │     │              │
│ vehicleId    │     │ 1. Fetch     │     │ vehicles     │
│ route[]      │     │    vehicle   │     │ rosters      │
└──────────────┘     │              │     │              │
                     │ 2. Check     │     │              │
                     │    existing  │◀────│              │
                     │    rosters   │     │              │
                     │              │     │              │
                     │ 3. Extract   │     │              │
                     │    orgs      │     │              │
                     │              │     │              │
                     │ 4. Compare   │     │              │
                     │    orgs      │     │              │
                     │              │     │              │
                     │ 5. Assign or │     │              │
                     │    Reject    │────▶│              │
                     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   RESPONSE   │
                     │              │
                     │ Success or   │
                     │ Conflict     │
                     └──────────────┘
```

## Organization Field Priority

```
┌─────────────────────────────────────────┐
│  ORGANIZATION FIELD DETECTION ORDER     │
└─────────────────────────────────────────┘

1. roster.organization              ← Highest Priority
   ↓ (if not found)
2. roster.organizationName
   ↓ (if not found)
3. roster.companyName
   ↓ (if not found)
4. roster.company
   ↓ (if not found)
5. roster.employeeDetails?.organization
   ↓ (if not found)
6. roster.employeeDetails?.company
   ↓ (if not found)
7. "Unknown Organization"           ← Fallback
```

## Error Response Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  CONFLICT ERROR (400)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  {                                                          │
│    success: false,                                          │
│    message: "Organization segregation violation...",        │
│    error: "ORGANIZATION_CONFLICT",                          │
│    details: {                                               │
│      vehicleId: "...",                                      │
│      vehicleName: "Vehicle-001",                            │
│      existingOrganizations: ["TechCorp"],                   │
│      newOrganizations: ["FinanceInc"],                      │
│      conflictingOrganizations: ["TechCorp", "FinanceInc"],  │
│      existingCustomerCount: 2,                              │
│      newCustomerCount: 3,                                   │
│      rule: "Employees from different companies..."          │
│    }                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Success Response Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  SUCCESS RESPONSE (200)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  {                                                          │
│    success: true,                                           │
│    message: "Successfully assigned N customers...",         │
│    data: {                                                  │
│      vehicleId: "...",                                      │
│      vehicleName: "Vehicle-001",                            │
│      driverId: "...",                                       │
│      driverName: "John Driver",                             │
│      successful: [                                          │
│        { rosterId, sequence, customerName, status }         │
│      ],                                                     │
│      successCount: 3,                                       │
│      trackingEnabled: true,                                 │
│      routeSummary: {                                        │
│        totalDistance: 15.5,                                 │
│        totalTime: 45,                                       │
│        customerCount: 3                                     │
│      }                                                      │
│    }                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual Guide for Organization Segregation Rule**
**Date**: December 10, 2025
