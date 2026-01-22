# Item Billing System - Testing Guide

## 🧪 Complete Testing Instructions

### Prerequisites
1. **Backend Server Running**: Port 3001
2. **MongoDB Running**: Local or Atlas connection
3. **Flutter App Running**: Web or mobile

## 🚀 Quick Start Testing

### Step 1: Start Backend Server
```bash
# Option 1: Using batch file
start-item-billing-backend.bat

# Option 2: Manual start
cd abra_fleet_backend
npm install
npm start
```

### Step 2: Verify Backend Health
```bash
# Test API connectivity
node test-item-billing-backend.js
```

Expected output:
```
✅ Health check: Abra Travels Backend is running!
⚠️  Units endpoint requires auth: 401
⚠️  Vendors endpoint requires auth: 401
⚠️  Items endpoint requires auth: 401
✅ Item Billing API is accessible!
```

### Step 3: Start Flutter App
```bash
cd abra_fleet
flutter run
```

## 📋 Manual Testing Checklist

### Navigation Testing
- [ ] 1. Login to admin panel
- [ ] 2. Navigate to Billing section
- [ ] 3. Click on "Items" in the sidebar
- [ ] 4. Verify items_billing.dart page loads
- [ ] 5. Click "New" button
- [ ] 6. Verify new_item_billing.dart page opens

### Form Testing - Basic Item Creation
- [ ] 1. Select "Goods" type
- [ ] 2. Enter item name: "Test Vehicle Service"
- [ ] 3. Select unit: "pcs"
- [ ] 4. Check "Sellable" checkbox
- [ ] 5. Enter selling price: "2500"
- [ ] 6. Select sales account: "Sales"
- [ ] 7. Enter sales description: "Vehicle maintenance service"
- [ ] 8. Check "Purchasable" checkbox
- [ ] 9. Enter cost price: "1500"
- [ ] 10. Select purchase account: "Cost of Goods Sold"
- [ ] 11. Enter purchase description: "Service cost"
- [ ] 12. Click "Save"
- [ ] 13. Verify success message appears
- [ ] 14. Verify navigation back to items list

### Form Validation Testing
- [ ] 1. Try to save without item name → Should show error
- [ ] 2. Try to save sellable item without price → Should show error
- [ ] 3. Try to save purchasable item without cost → Should show error
- [ ] 4. Enter invalid price format → Should show error
- [ ] 5. All validation messages should be user-friendly

### Service Type Testing
- [ ] 1. Create item with type "Service"
- [ ] 2. Verify all fields work correctly
- [ ] 3. Save and verify success

### Sales Only Item Testing
- [ ] 1. Uncheck "Purchasable"
- [ ] 2. Verify purchase fields are hidden/disabled
- [ ] 3. Fill only sales information
- [ ] 4. Save successfully

### Purchase Only Item Testing
- [ ] 1. Uncheck "Sellable"
- [ ] 2. Verify sales fields are hidden/disabled
- [ ] 3. Fill only purchase information
- [ ] 4. Save successfully

### Vendor Selection Testing
- [ ] 1. Create purchasable item
- [ ] 2. Select preferred vendor from dropdown
- [ ] 3. Save and verify vendor is stored

### Items List Features Testing
- [ ] 1. Verify items appear in the list after creation
- [ ] 2. Test "All Items" dropdown filter
- [ ] 3. Click three dots menu
- [ ] 4. Test "Sort by" submenu options
- [ ] 5. Test "Import Items" dialog
- [ ] 6. Test "Export" submenu options

### Error Handling Testing
- [ ] 1. Stop backend server
- [ ] 2. Try to create item → Should show connection error
- [ ] 3. Restart backend
- [ ] 4. Try again → Should work normally

### Loading States Testing
- [ ] 1. Verify loading spinner shows during save
- [ ] 2. Verify loading spinner shows during data fetch
- [ ] 3. Verify form is disabled during save operation

## 🔧 Backend API Testing

### Direct API Testing (with Postman or curl)

#### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

#### 2. Get Units (requires auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/units
```

#### 3. Create Item (requires auth)
```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Item",
    "type": "Goods",
    "unit": "pcs",
    "isSellable": true,
    "isPurchasable": true,
    "sellingPrice": 100,
    "salesAccount": "Sales",
    "costPrice": 60,
    "purchaseAccount": "Cost of Goods Sold"
  }'
```

#### 4. Get All Items (requires auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/items
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Not Starting
- **Error**: `EADDRINUSE: address already in use :::3001`
- **Solution**: Kill existing process or change port
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

#### 2. MongoDB Connection Failed
- **Error**: `MongoNetworkError: failed to connect to server`
- **Solution**: Check MongoDB is running and connection string is correct

#### 3. CORS Errors in Flutter Web
- **Error**: `Access to XMLHttpRequest has been blocked by CORS policy`
- **Solution**: Verify CORS is properly configured in backend

#### 4. Authentication Errors
- **Error**: `401 Unauthorized`
- **Solution**: Ensure user is logged in and token is valid

#### 5. Import Path Errors in Flutter
- **Error**: `Target of URI doesn't exist`
- **Solution**: Verify all import paths are correct

### Debug Mode Testing

#### Enable Debug Logging
1. Set `NODE_ENV=development` in backend
2. Check browser console for detailed error messages
3. Monitor backend console for request logs

#### Database Inspection
```javascript
// Connect to MongoDB and check data
use abra_fleet_billing
db.items.find().pretty()
db.vendors.find().pretty()
```

## ✅ Success Criteria

The Item Billing System is working correctly when:

1. **Navigation**: Smooth navigation between pages
2. **Form Validation**: All validation rules work properly
3. **Data Persistence**: Items are saved to database correctly
4. **Error Handling**: Graceful error messages for all failure scenarios
5. **Loading States**: Proper feedback during async operations
6. **API Integration**: All CRUD operations work through the service layer
7. **Authentication**: Proper security with token validation
8. **User Experience**: Professional UI matching Zoho Books design

## 📊 Performance Testing

### Load Testing (Optional)
- Create 100+ items to test pagination
- Test search functionality with large datasets
- Verify export performance with many items
- Test concurrent user access

### Memory Testing
- Monitor memory usage during bulk operations
- Check for memory leaks in long-running sessions
- Verify proper cleanup of resources

## 🎉 Completion Verification

When all tests pass, the Item Billing System is ready for production use!

### Final Checklist
- [ ] All manual tests pass
- [ ] API tests pass
- [ ] No compilation errors
- [ ] No runtime errors
- [ ] Performance is acceptable
- [ ] User experience is smooth
- [ ] Data integrity is maintained
- [ ] Security requirements are met