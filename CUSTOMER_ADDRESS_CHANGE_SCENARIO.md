# Customer Address Change - Mid-Roster Scenario

## Scenario
Customer booked a 30-day roster. After 17 days, they moved to a new address and need to change their pickup/drop location for the remaining 13 days.

## Solution: Use Address Change Request Feature

### Step-by-Step Process

#### 1. Customer Submits Address Change Request (Mobile App)

**Customer Actions:**
1. Open the Abra Fleet mobile app
2. Go to **"My Trips"** screen
3. Tap the menu icon (⋮) in the top right
4. Select **"Change Address"**
5. The system will show:
   - Current pickup address (auto-filled)
   - Current drop address (auto-filled)
6. Customer enters:
   - **New Pickup Address** (tap map to select exact location)
   - **New Drop Address** (tap map to select exact location)
   - **Reason**: "Moved to new residence"
   - **Effective Date**: Day 18 (tomorrow or specific date)
7. System shows: "This will affect 13 upcoming trips"
8. Tap **"Submit Request"**
9. Success message: "Processing will take 4-5 working days"

**What Happens:**
- Request is saved with status: "Under Review"
- Admin receives immediate notification
- Customer can track status in "My Address Requests"

---

#### 2. Admin Reviews Request (Web/Admin Panel) - Within 4-5 Days

**Admin Actions:**
1. Admin receives notification: "New Address Change Request from [Customer Name]"
2. Admin opens **"Address Change Requests"** section
3. Admin views request details:
   - Customer: Name, Email, Phone
   - Current addresses (with map pins)
   - New addresses (with map pins)
   - Reason: "Moved to new residence"
   - Affected trips: 13 trips (Days 18-30)
4. Admin validates:
   - ✅ New address is within service area
   - ✅ Route is feasible
   - ✅ Driver availability

**Admin Decision:**

**Option A: Approve & Process**
1. Click **"Process Request"**
2. Fill in assignment details:
   - **Driver**: Select from available drivers (can be same or different)
   - **Vehicle**: Select from available vehicles (can be same or different)
   - **Pickup Time**: 09:00 AM (or existing time)
   - **Start Date**: Day 18 (when change takes effect)
   - **Service Days**: Mon-Fri (or existing schedule)
   - **Notes**: "Address updated due to relocation"
3. Click **"Assign & Notify"**

**Option B: Reject**
1. Click **"Reject Request"**
2. Enter reason: "New address is outside service area" or "Route not feasible"
3. Click **"Reject & Notify"**

---

#### 3. System Updates (Automatic)

**If Approved:**

**A. Updates Customer Profile:**
```
✅ Default pickup address → New address
✅ Default drop address → New address
✅ Coordinates updated
```

**B. Creates New Roster:**
```
✅ New roster for Days 18-30 (13 days)
✅ With new pickup/drop addresses
✅ Assigned to selected driver & vehicle
✅ Status: "Assigned"
```

**C. Handles Old Roster:**
```
✅ Days 1-17 remain unchanged (for records)
✅ Days 18-30 marked as "superseded" or cancelled
✅ History preserved for billing/audit
```

**D. Sends Notifications:**

**To Customer:**
- Title: "Your Transportation is Ready!"
- Message: "Good news! Your address change has been processed. Your vehicle is ready from Day 18 onwards."
- Details shown:
  - Vehicle: KA-01-AB-1234 (Toyota Innova)
  - Driver: Rajesh Kumar (+91 98765 43210)
  - New Pickup: 456 New Street, Bangalore
  - New Drop: 321 New Office, Bangalore
  - Start Date: Day 18
  - Pickup Time: 09:00 AM

**To Driver:**
- Title: "Roster Updated - [Customer Name]"
- Message: "Address changed for [Customer Name] from Day 18"
- Details shown:
  - Customer: John Doe (+91 98765 12345)
  - New Pickup: 456 New Street (with map)
  - New Drop: 321 New Office (with map)
  - Effective: Day 18
  - Time: 09:00 AM

---

#### 4. Customer Receives Confirmation (Mobile App)

**Customer sees:**
1. Notification: "Your Transportation is Ready!"
2. In "My Address Requests":
   - Status: ✅ **Completed** (Green)
   - Processed on: [Date]
   - New vehicle details
   - New driver details
3. In "My Trips":
   - Days 1-17: Old address (completed/in-progress)
   - Days 18-30: New address (assigned)

---

#### 5. Driver Receives Assignment (Mobile App)

**Driver sees:**
1. Notification: "Roster Updated"
2. In "My Rosters":
   - Customer: John Doe
   - New Pickup: 456 New Street (map pin)
   - New Drop: 321 New Office (map pin)
   - Start: Day 18
   - Time: 09:00 AM
3. Driver can:
   - View route on map
   - Navigate to new location
   - Contact customer
   - Acknowledge assignment

---

## Important Notes

### ✅ What Gets Updated:
- Customer's default addresses (for future bookings)
- Remaining trips (Days 18-30) with new addresses
- Driver assignment (if changed)
- Vehicle assignment (if changed)

### ❌ What Stays Unchanged:
- Completed trips (Days 1-17) - preserved for records
- Billing history
- Past trip data

### ⏱️ Timeline:
- **Customer submits**: Instant
- **Admin reviews**: Within 4-5 working days
- **Change takes effect**: From specified start date (Day 18)

### 🔄 If Same Driver/Vehicle:
- Admin can assign the same driver and vehicle
- Driver just gets updated route information
- Seamless transition for customer

### 🚗 If Different Driver/Vehicle:
- Admin assigns new driver and vehicle
- Old driver's roster ends at Day 17
- New driver's roster starts at Day 18
- Both drivers notified

---

## Alternative: Manual Admin Process (If Address Change Feature Not Available)

If the address change request feature is not yet deployed, admin can manually:

1. **Create New Roster:**
   - Go to "Pending Rosters" or "Customer Management"
   - Create new roster for Days 18-30
   - Enter new pickup/drop addresses
   - Assign driver and vehicle
   - Set start date as Day 18

2. **Update Customer Profile:**
   - Go to "Customer Management"
   - Find customer
   - Edit profile
   - Update default pickup/drop addresses
   - Save changes

3. **Cancel/Complete Old Roster:**
   - Find original 30-day roster
   - Mark Days 18-30 as cancelled or completed
   - Add note: "Address changed - see new roster [ID]"

4. **Notify Parties:**
   - Send notification to customer with new details
   - Send notification to driver with updated route
   - Update any affected schedules

---

## Billing Considerations

### Option 1: Continue Existing Contract
- Days 1-17: Billed at original rate
- Days 18-30: Billed at original rate (same contract)
- No additional charges for address change

### Option 2: New Route Pricing (If Significantly Different)
- Days 1-17: Billed at original rate
- Days 18-30: Billed at new rate (if route is longer/shorter)
- Admin can adjust pricing if needed

### Recommended:
- Keep same pricing unless route distance changes significantly (>20%)
- Goodwill gesture for customer loyalty
- Simplifies billing and accounting

---

## FAQ

**Q: Can customer edit the roster directly?**
A: No, once assigned, rosters cannot be edited directly. This prevents operational confusion. Address change requests ensure proper review and assignment.

**Q: What if the new address is far away?**
A: Admin will review feasibility. If outside service area or route is not feasible, admin can reject with explanation.

**Q: Can customer cancel and create new roster instead?**
A: Yes, but address change request is better because:
- Preserves booking history
- Maintains contract continuity
- Simpler for billing
- Faster processing

**Q: What if customer moves again during the remaining days?**
A: Customer can submit another address change request. Admin will review and process similarly.

**Q: Does driver have to accept the change?**
A: Admin assigns based on driver availability. Driver receives notification but assignment is confirmed by admin.

---

## Summary

For your scenario (30-day roster, address change after 17 days):

1. ✅ **Customer**: Submit address change request via mobile app
2. ✅ **Admin**: Review and process within 4-5 days
3. ✅ **System**: Updates addresses for Days 18-30 automatically
4. ✅ **Driver**: Receives updated route information
5. ✅ **Customer**: Gets confirmation with new vehicle/driver details

**Result**: Seamless address change without disrupting service or losing booking history.
