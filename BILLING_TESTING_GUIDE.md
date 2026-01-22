# Billing System Testing Guide

## Quick Start - Setup Test Data

### Step 1: Populate Database with Sample Data

```bash
cd abra_fleet_backend
node setup-billing-data.js
```

This will create:
- ✅ 3 sample contracts (ABC Logistics, XYZ Transport, Global Freight)
- ✅ 4 sample invoices (Paid, Partially Paid, Overdue, Pending)
- ✅ Audit logs for all transactions

### Step 2: Verify Data Was Created

```bash
node verify-billing-data.js
```

This shows:
- All contracts with details
- All invoices with status
- Audit log entries
- Statistics summary

### Step 3: Start Backend Server

```bash
node index.js
```

Server will start on `http://localhost:3000`

## Test Data Overview

### Contracts Created

1. **CNT-2024-ABC-001** - ABC Logistics Pvt Ltd
   - Status: Active
   - Period: 2024-01-01 to 2025-12-31
   - Vehicles: Truck, Van, Car
   - Min/Max: ₹70,000 / ₹200,000
   - Billing: Monthly, Net 30

2. **CNT-2024-XYZ-002** - XYZ Transport Solutions
   - Status: Active
   - Period: 2024-03-15 to 2025-03-14
   - Vehicles: Car, Bike
   - Min/Max: ₹50,000 / ₹150,000
   - Billing: Weekly, Net 15

3. **CNT-2023-GFS-003** - Global Freight Services
   - Status: Active
   - Period: 2023-06-01 to 2025-05-31
   - Vehicles: Heavy Truck, Trailer
   - Min/Max: ₹150,000 / ₹500,000
   - Billing: Monthly, Net 45

### Invoices Created

1. **INV-2024-001** - ABC Logistics
   - Status: ✅ Paid
   - Amount: ₹289,902.99
   - Paid: ₹289,902.99
   - Trips: 156

2. **INV-2024-002** - XYZ Transport
   - Status: ⏳ Partially Paid
   - Amount: ₹147,500.00
   - Paid: ₹75,000.00
   - Due: ₹72,500.00
   - Trips: 89

3. **INV-2024-003** - Global Freight
   - Status: ⚠️ Overdue
   - Amount: ₹572,300.00
   - Paid: ₹0.00
   - Due: ₹572,300.00
   - Trips: 234
   - Due Date: 2024-12-16 (OVERDUE)

4. **INV-2024-004** - ABC Logistics
   - Status: 🕐 Pending
   - Amount: ₹198,830.00
   - Paid: ₹0.00
   - Due: ₹198,830.00
   - Trips: 142

## API Testing

### 1. Get All Contracts

```bash
curl http://localhost:3000/api/billing/contracts \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "contracts": [
    {
      "contractId": "CNT-2024-ABC-001",
      "organizationName": "ABC Logistics Pvt Ltd",
      "status": "active",
      ...
    }
  ]
}
```

### 2. Get Contract by ID

```bash
curl http://localhost:3000/api/billing/contracts/CNT-2024-ABC-001 \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 3. Get All Invoices

```bash
curl http://localhost:3000/api/billing/invoices \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 4. Get Invoices by Status

```bash
# Get only pending invoices
curl "http://localhost:3000/api/billing/invoices?status=Pending" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Get only overdue invoices
curl "http://localhost:3000/api/billing/invoices?status=Overdue" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 5. Get Invoices by Organization

```bash
curl "http://localhost:3000/api/billing/invoices?organizationId=ORG-ABC" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 6. Record Payment

```bash
curl -X PATCH http://localhost:3000/api/billing/invoices/INV-2024-004/payment \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amountPaid": 100000,
    "paymentMode": "Bank Transfer",
    "paidDate": "2024-12-09"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully"
}
```

### 7. Generate New Invoice from Contract

```bash
curl -X POST http://localhost:3000/api/billing/invoices/generate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CNT-2024-ABC-001",
    "tripIds": ["trip1", "trip2", "trip3"],
    "billingPeriodStart": "2024-12-01",
    "billingPeriodEnd": "2024-12-31"
  }'
```

## Flutter App Testing

### Update Your Billing Pages

1. **Import the API Service**

```dart
import 'package:abra_fleet/core/services/billing_api_service.dart';
```

2. **Load Invoices from API**

```dart
List<Map<String, dynamic>> _invoices = [];
bool _isLoading = true;

@override
void initState() {
  super.initState();
  _loadInvoices();
}

Future<void> _loadInvoices() async {
  setState(() => _isLoading = true);
  try {
    final invoices = await BillingApiService.getAllInvoices();
    setState(() {
      _invoices = invoices;
      _isLoading = false;
    });
  } catch (e) {
    setState(() => _isLoading = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: $e')),
    );
  }
}
```

3. **Show Loading State**

```dart
@override
Widget build(BuildContext context) {
  if (_isLoading) {
    return Center(child: CircularProgressIndicator());
  }
  
  return ListView.builder(
    itemCount: _invoices.length,
    itemBuilder: (context, index) {
      return _buildInvoiceCard(_invoices[index]);
    },
  );
}
```

## Testing Scenarios

### Scenario 1: View All Invoices
1. Open billing page in Flutter app
2. Should see 4 invoices loaded from API
3. Check different statuses: Paid, Partially Paid, Overdue, Pending

### Scenario 2: Filter by Status
1. Click on "Overdue" filter chip
2. Should see only INV-2024-003

### Scenario 3: Record Payment
1. Click on INV-2024-004 (Pending)
2. Click "Record Payment"
3. Enter amount: ₹100,000
4. Select payment mode: Bank Transfer
5. Submit
6. Invoice status should change to "Partially Paid"

### Scenario 4: View Contract Details
1. Click on any invoice
2. Click "View Agreement"
3. Should show contract details with pricing

### Scenario 5: Generate New Invoice
1. Click "New Invoice" button
2. Select contract: CNT-2024-ABC-001
3. Select billing period
4. System generates invoice with contract pricing
5. New invoice appears in list

## Validation Testing

### Test 1: Contract Validation
Try to generate invoice with invalid contract ID:
```bash
curl -X POST http://localhost:3000/api/billing/invoices/generate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "INVALID-CONTRACT",
    "tripIds": ["trip1"],
    "billingPeriodStart": "2024-12-01",
    "billingPeriodEnd": "2024-12-31"
  }'
```

**Expected:** Error message "Contract not found"

### Test 2: Date Range Validation
Try to generate invoice outside contract period:
```bash
curl -X POST http://localhost:3000/api/billing/invoices/generate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CNT-2024-ABC-001",
    "tripIds": ["trip1"],
    "billingPeriodStart": "2026-01-01",
    "billingPeriodEnd": "2026-01-31"
  }'
```

**Expected:** Error message "Billing period outside contract validity"

### Test 3: Payment Validation
Try to record payment for non-existent invoice:
```bash
curl -X PATCH http://localhost:3000/api/billing/invoices/INVALID-INV/payment \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amountPaid": 1000,
    "paymentMode": "Cash"
  }'
```

**Expected:** Error message "Invoice not found"

## Database Verification

### Check MongoDB Collections

```javascript
// Connect to MongoDB and run these queries

// Count contracts
db.contracts.countDocuments()
// Expected: 3

// Count invoices
db.invoices.countDocuments()
// Expected: 4

// Count audit logs
db.audit_logs.countDocuments({ entityType: { $in: ['contract', 'invoice'] } })
// Expected: 7 (3 contracts + 4 invoices)

// Get all invoice statuses
db.invoices.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
// Expected: Paid: 1, Partially Paid: 1, Overdue: 1, Pending: 1
```

## Troubleshooting

### Issue: "Database connection not established"
**Solution:** Make sure MongoDB is running and MONGODB_URI is set in .env

### Issue: "Authorization failed"
**Solution:** Get a valid Firebase token from your logged-in user

### Issue: "No invoices showing in Flutter app"
**Solution:** 
1. Check backend is running: `node index.js`
2. Check API URL in billing_api_service.dart
3. Check Firebase authentication token

### Issue: "CORS error"
**Solution:** Backend already configured for localhost. Check the port matches.

## Success Criteria

✅ All 3 contracts visible in database
✅ All 4 invoices visible in database
✅ Audit logs created for all transactions
✅ API endpoints return correct data
✅ Flutter app loads invoices from API
✅ Payment recording updates invoice status
✅ Contract validation prevents invalid invoices
✅ Date range validation works
✅ Filters work correctly (status, organization)

## Next Steps After Testing

1. ✅ Verify all test scenarios pass
2. ✅ Update Flutter billing pages to use API
3. ✅ Add error handling for network failures
4. ✅ Add loading states
5. ✅ Add refresh functionality
6. ✅ Test with real user authentication
7. ✅ Deploy to production

## Summary

Your billing system now has:
- ✅ Backend API with MongoDB persistence
- ✅ Sample test data (3 contracts, 4 invoices)
- ✅ Contract-based invoice generation
- ✅ Payment tracking
- ✅ Audit logging
- ✅ Data validation
- ✅ Flutter API service ready

Run the setup script and start testing!
