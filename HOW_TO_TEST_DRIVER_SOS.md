# How to Test Driver SOS Alerts 🚨

## Quick Testing Guide

### Prerequisites
✅ Backend server running (`npm start` in `abra_fleet_backend`)  
✅ Flutter app running  
✅ Driver account credentials  
✅ Admin account credentials  
✅ Location permissions enabled on device  

---

## Test Scenario 1: Send SOS as Driver

### Step 1: Login as Driver
```
Email: asha@wipro.com (or any driver account)
Password: [driver password]
```

### Step 2: Navigate to Driver Dashboard
- You should see the main driver dashboard
- Look for the **red floating action button** at the bottom right
- Button shows "SOS" with emergency icon 🚨

### Step 3: Click SOS Button
- Tap the red SOS button
- **Confirmation dialog appears** with:
  - ⚠️ Warning icon
  - "Confirm SOS Alert" title
  - Message about sending emergency alert
  - "Cancel" and "CONFIRM SOS" buttons

### Step 4: Confirm SOS
- Click **"CONFIRM SOS"** button
- You'll see messages:
  1. "Initiating SOS... Requesting location"
  2. "Location captured. Sending SOS alert..."
  3. "SOS Alert Sent Successfully! Help is on the way." (green)

### Step 5: Check SOS History
- Scroll down on the driver dashboard
- Find **"SOS Alert History"** card (🚨 icon)
- Your SOS should appear with:
  - Date and time
  - Status badge: "ACTIVE" (gray)
  - No admin notes yet

### Expected Result ✅
- SOS sent successfully
- Appears in history
- Status is "ACTIVE"
- No errors

---

## Test Scenario 2: Admin Receives and Responds

### Step 1: Login as Admin (Different Device/Browser)
```
Email: admin@abrafleet.com
Password: [admin password]
```

### Step 2: Check Admin Dashboard
- Go to Admin Dashboard
- Look for **"SOS Alerts"** quick action button
- Should show red color if there are active SOS alerts
- Click on "SOS Alerts"

### Step 3: View Driver SOS
- You should see the driver's SOS in the list
- Information shown:
  - Driver name
  - Time of SOS
  - Location (address)
  - Status: "ACTIVE"
  - GPS coordinates

### Step 4: Update SOS Status
- Click on the SOS event
- Update status to **"In Progress"**
- Add admin notes: "Help is on the way! Stay safe."
- Save changes

### Expected Result ✅
- Admin can see driver SOS
- Can update status
- Can add notes

---

## Test Scenario 3: Driver Receives Admin Response

### Step 1: Return to Driver App
- Go back to the driver dashboard
- **Dialog should appear automatically** showing:
  - ✅ Green checkmark icon
  - "Update on Your SOS" title
  - "An admin has updated your alert status to 'In Progress'"
  - Admin notes: "Help is on the way! Stay safe."

### Step 2: Check SOS History
- Scroll to "SOS Alert History" card
- The SOS status should now show:
  - Status badge: "In Progress" (orange)
  - Admin notes displayed below status
  - Message icon with admin's message

### Expected Result ✅
- Driver receives real-time update
- Dialog shows admin response
- History updates automatically
- Status changes from gray to orange

---

## Test Scenario 4: Resolve SOS

### Step 1: Admin Resolves SOS
- Admin updates status to **"Resolved"**
- Adds final notes: "Emergency handled. Driver is safe."

### Step 2: Driver Sees Resolution
- Driver receives dialog with "Resolved" status
- SOS history shows:
  - Status badge: "Resolved" (green)
  - Admin's final notes
  - Checkmark icon

### Expected Result ✅
- SOS marked as resolved
- Driver informed
- History shows green status

---

## Test Scenario 5: Multiple SOS Events

### Step 1: Send Another SOS
- Driver sends a new SOS
- Previous SOS should still be in history

### Step 2: Check History
- Should see **both SOS events**:
  1. Old SOS: "Resolved" (green)
  2. New SOS: "ACTIVE" (gray)
- Sorted by most recent first

### Expected Result ✅
- Multiple SOS events tracked
- History shows all events
- Newest at top

---

## Test Scenario 6: Empty State

### Step 1: New Driver Account
- Login with a driver who has never sent SOS

### Step 2: Check SOS History
- Scroll to "SOS Alert History" card
- Should show:
  - ✅ Green checkmark icon
  - "No SOS alerts found"
  - "You're all safe! 🎉"

### Expected Result ✅
- Empty state displays correctly
- Positive message shown
- No errors

---

## Common Issues & Solutions

### Issue 1: Location Permission Denied
**Symptom**: Error message "Location permission denied"  
**Solution**: 
- Go to device settings
- Enable location for the app
- Try SOS again

### Issue 2: SOS Not Appearing in Admin Dashboard
**Symptom**: Admin doesn't see the SOS  
**Solution**:
- Check backend is running
- Check Firebase connection
- Verify driver and admin are in same organization
- Check browser console for errors

### Issue 3: No Real-Time Update
**Symptom**: Driver doesn't see admin response automatically  
**Solution**:
- Check Firebase Realtime Database connection
- Verify internet connection
- Try refreshing the dashboard
- Check Firebase rules allow read access

### Issue 4: "Failed to send SOS" Error
**Symptom**: Error message when sending SOS  
**Solution**:
- Check backend server is running
- Verify API endpoint: `http://localhost:5000/api/sos`
- Check network connection
- Look at backend logs for errors

---

## Backend Verification

### Check MongoDB
```javascript
// In MongoDB Compass or shell
db.sos_events.find().sort({createdAt: -1}).limit(5)
```

Should show:
- Driver's SOS event
- userType: "driver"
- Location coordinates
- Status and timestamps

### Check Firebase Realtime Database
```
Firebase Console → Realtime Database → sos_events
```

Should show:
- Event ID as key
- Driver data
- GPS coordinates
- Status updates

### Check Backend Logs
```bash
# In backend terminal
# Should see:
[SOS] Received alert from Driver Name
[SOS] Location resolved to: [address]
[SOS] Event stored in MongoDB with ID: [id]
[SOS] Event pushed to Firebase Realtime DB
```

---

## API Testing (Optional)

### Test SOS Creation
```bash
curl -X POST http://localhost:5000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_driver_123",
    "customerName": "Test Driver",
    "customerEmail": "test@driver.com",
    "userType": "driver",
    "gps": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "timestamp": "2025-12-15T10:30:00.000Z",
    "status": "ACTIVE"
  }'
```

Expected Response:
```json
{
  "status": "success",
  "message": "SOS event processed successfully.",
  "eventId": "mongodb_object_id"
}
```

### Test SOS Status Update
```bash
curl -X PUT http://localhost:5000/api/sos/[eventId]/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress"
  }'
```

---

## Success Criteria ✅

### Driver Side:
- ✅ Can send SOS with one tap
- ✅ Receives confirmation message
- ✅ Sees SOS in history
- ✅ Gets real-time admin updates
- ✅ Sees admin notes/messages
- ✅ Status updates automatically

### Admin Side:
- ✅ Receives push notification
- ✅ Sees SOS in dashboard
- ✅ Can view driver location
- ✅ Can update status
- ✅ Can add notes
- ✅ Changes sync to driver

### System:
- ✅ No compilation errors
- ✅ No runtime errors
- ✅ Real-time sync works
- ✅ Data persists in databases
- ✅ UI updates smoothly

---

## Performance Checklist

- [ ] SOS sends within 3 seconds
- [ ] Location captured accurately
- [ ] Admin receives notification immediately
- [ ] Driver sees update within 2 seconds
- [ ] History loads quickly
- [ ] No memory leaks
- [ ] Works offline (queues SOS)

---

## Next Steps After Testing

1. **If all tests pass**: ✅ Ready for production
2. **If issues found**: 🔧 Debug and fix
3. **Gather feedback**: 📝 From drivers and admins
4. **Monitor**: 📊 Track SOS usage and response times
5. **Iterate**: 🔄 Improve based on real-world usage

---

**Happy Testing! 🚀**

Remember: This is an emergency feature. Test thoroughly but also test the real emergency response process with your team!
