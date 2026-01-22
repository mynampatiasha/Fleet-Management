# Contract-Based Billing System Implementation

## Overview
Your billing system has been enhanced with contract management to prevent data corruption and ensure accurate invoicing based on negotiated agreements.

## Files Created

### 1. Contract Models (`contract_models.dart`)
Defines the data structure for:
- **ContractPricing**: Main contract with all pricing terms
- **VehiclePricing**: Per-vehicle-type rates (base fare, per km, waiting charges)
- **SurchargeRates**: Peak hours, night shift, weekend, fuel surcharges
- **VolumeSlab**: Volume-based discount tiers
- **PaymentTerms**: Billing cycle, payment due days, credit limits
- **AdditionalCharges**: Toll, parking, cleaning, penalties
- **SLATerms**: Service level agreements and breach penalties
- **AuditLog**: Track all changes to contracts and invoices

### 2. Contract Billing Service (`contract_billing_service.dart`)
Core service that:
- Manages contracts (CRUD operations)
- Generates invoices from contracts and trip data
- Validates invoices against contract terms
- Applies volume discounts automatically
- Enforces minimum/maximum billing limits
- Calculates surcharges based on time/day
- Prevents data corruption through validation

## Key Features to Prevent Corruption

### 1. Contract Validation
```dart
// Every invoice MUST reference a valid contract
final contract = ContractBillingService.getContractById(contractId);
if (contract == null) {
  throw Exception('Contract not found');
}
```

### 2. Date Range Validation
```dart
// Invoice dates must be within contract validity period
if (billingPeriodStart.isBefore(contract.startDate) || 
    billingPeriodEnd.isAfter(contract.endDate)) {
  throw Exception('Billing period outside contract validity');
}
```

### 3. Amount Limits
```dart
// Enforce minimum commitment
if (totalAmount < contract.paymentTerms.monthlyMinimum) {
  totalAmount = contract.paymentTerms.monthlyMinimum;
}

// Prevent exceeding maximum
if (totalAmount > contract.paymentTerms.monthlyMaximum) {
  throw Exception('Invoice exceeds monthly maximum');
}
```

### 4. Pricing Consistency
```dart
// All charges calculated from contract, not hardcoded
var pricing = contract.vehiclePricing[vehicleType];
tripCost += pricing.baseFarePerTrip;
tripCost += distance * pricing.ratePerKm;
```

### 5. Audit Trail
```dart
// Log all changes
ContractBillingService.logAuditEntry(AuditLog(
  entityType: 'invoice',
  action: 'created',
  userId: currentUserId,
  changes: {...},
));
```

## How to Use in Your Billing Pages

### Step 1: Initialize Contracts
```dart
@override
void initState() {
  super.initState();
  ContractBillingService.initializeSampleContracts();
}
```

### Step 2: Generate Invoice from Contract
```dart
void _generateInvoice(String contractId, List<Map<String, dynamic>> trips) {
  try {
    final invoice = ContractBillingService.generateInvoiceFromContract(
      contractId: contractId,
      trips: trips,
      billingPeriodStart: DateTime(2024, 12, 1),
      billingPeriodEnd: DateTime(2024, 12, 31),
    );
    
    setState(() {
      _invoices.add(invoice);
    });
  } catch (e) {
    // Show error - contract validation failed
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: $e')),
    );
  }
}
```

### Step 3: Validate Before Saving
```dart
void _saveInvoice(Map<String, dynamic> invoice) {
  final contract = ContractBillingService.getContractById(invoice['contractId']);
  if (contract != null) {
    final errors = ContractBillingService.validateInvoiceAgainstContract(invoice, contract);
    if (errors.isNotEmpty) {
      // Show validation errors
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Validation Errors'),
          content: Text(errors.join('\n')),
        ),
      );
      return;
    }
  }
  
  // Save invoice
  _saveToDatabase(invoice);
}
```

## Integration with Existing Code

### Update Your Invoice Data Structure
Your existing invoices should now include:
```dart
{
  'id': 'INV-2024-001',
  'contractId': 'CNT-2024-ABC-001',  // REQUIRED: Link to contract
  'organizationId': 'ORG-ABC',
  'organizationName': 'ABC Logistics',
  
  // Contract reference
  'agreementId': 'CNT-2024-ABC-001',
  'agreementStartDate': '2024-01-01',
  'agreementEndDate': '2025-12-31',
  
  // Pricing applied from contract
  'pricingReference': {
    'contractId': 'CNT-2024-ABC-001',
    'volumeSlabApplied': {...},
    'minimumCommitmentApplied': true,
    'discountAmount': 5000.0,
  },
  
  // Rest of invoice data...
}
```

## Benefits

### 1. No More Hardcoded Prices
❌ Before:
```dart
'charges': {
  'baseCharges': 180000.0,  // Where did this come from?
  'perKmCharges': 45680.50,  // How was this calculated?
}
```

✅ After:
```dart
// All charges calculated from contract
final invoice = ContractBillingService.generateInvoiceFromContract(...);
```

### 2. Automatic Discounts
```dart
// Volume discounts applied automatically based on trip count
// 0-500 trips: 0% discount
// 501-1000 trips: 8.33% discount
// 1001-1500 trips: 16.67% discount
// 1501+ trips: 25% discount
```

### 3. Surcharge Automation
```dart
// Surcharges applied based on trip time
// Peak hours (8-10 AM, 5-8 PM): +15%
// Night shift (10 PM - 6 AM): +25%
// Weekend: +10%
// Fuel surcharge: +5%
```

### 4. Data Integrity
- Contract must exist before invoice creation
- Invoice dates must be within contract period
- Amounts must be within min/max limits
- All pricing must come from contract
- Changes are logged in audit trail

## Next Steps

1. **Update Admin Billing Page**: Import and use `ContractBillingService`
2. **Update Client Billing Page**: Same integration
3. **Add Contract Management UI**: Create/edit contracts
4. **Connect to Backend**: Replace sample data with API calls
5. **Add Audit Log Viewer**: Show all changes to contracts/invoices

## Sample Contract Structure

```dart
ContractPricing(
  contractId: 'CNT-2024-ABC-001',
  organizationId: 'ORG-ABC',
  organizationName: 'ABC Logistics Pvt Ltd',
  startDate: DateTime(2024, 1, 1),
  endDate: DateTime(2025, 12, 31),
  status: 'active',
  
  vehiclePricing: {
    'Truck': VehiclePricing(
      baseFarePerTrip: 50.0,
      ratePerKm: 12.0,
      ratePerMinuteWaiting: 2.0,
      gracePeriodMinutes: 5,
      minimumChargePerTrip: 100.0,
    ),
  },
  
  paymentTerms: PaymentTerms(
    monthlyMinimum: 70000.0,
    monthlyMaximum: 200000.0,
    paymentDueDays: 30,
    billingCycle: 'Monthly',
  ),
  
  // ... other terms
)
```

## Error Prevention

The system now prevents:
- ❌ Creating invoices without contracts
- ❌ Using outdated pricing
- ❌ Billing outside contract period
- ❌ Exceeding credit limits
- ❌ Inconsistent charge calculations
- ❌ Missing audit trails
- ❌ Unauthorized price changes

## Summary

Your billing system now has a solid foundation with contract management. All invoices are generated from contracts, ensuring consistency, accuracy, and preventing data corruption. The system validates every invoice against contract terms before creation.
