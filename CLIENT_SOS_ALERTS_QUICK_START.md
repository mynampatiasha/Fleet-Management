# Client SOS Alerts - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Test Data Setup
```bash
cd abra_fleet_backend
node test-client-sos-alerts.js
```

This creates test SOS alerts for different organizations:
- 3 alerts for @cognizant.com
- 1 alert for @tcs.com  
- 1 alert for @abrafleet.com

### Step 2: Login as Client
Use any client credentials with organization email:
- `client@cognizant.com` / password
- `client@tcs.com` / password
- `client@abrafleet.com` / password

### Step 3: Navigate to SOS Alerts
Click on "SOS Alerts" in the left sidebar (⚠️ icon)

### Step 4: Verify Organization Filtering
You should see ONLY alerts from your organization's employees!

## 📊 What You'll See

### Dashboard Stats
```
Active Alerts: 2    In Progress: 1    Resolved: 3    Today: 4
```

### Filter Options
- **Status**: All, ACTIVE, Pending, In Progress, Resolved, Escalated
- **Time**: All Time, Today, This Week, This Month
- **Search**: By name, email, or location

### Alert Cards
Each alert shows:
- 👤 Employee name
- 📧 Email address
- 📍 Location
- 🕐 Time (e.g., "30m ago")
- 🏷️ Status badge

## 🎯 Key Features

### ✅ Organization-Based Filtering
- Clients see ONLY their employees' alerts
- Based on email domain matching
- Example: `client@cognizant.com` sees alerts from `*@cognizant.com`

### ✅ Real-Time Updates
- New alerts appear instantly
- No page refresh needed
- Live status updates

### ✅ Advanced Filtering
- Filter by status (Active, Resolved, etc.)
- Filter by time period
- Search by name/email/location

### ✅ Beautiful UI
- Modern card-based design
- Color-coded status badges
- Responsive layout
- Professional fleet management style

## 🧪 Testing Scenarios

### Scenario 1: Organization Isolation
1. Login as `client@cognizant.com`
2. Should see 3 alerts (John, Jane, Charlie)
3. Should NOT see Bob (@tcs.com) or Alice (@abrafleet.com)

### Scenario 2: Status Filtering
1. Click "ACTIVE" status filter
2. Should see only active alerts
3. Other statuses should be hidden

### Scenario 3: Time Filtering
1. Click "Today" time filter
2. Should see only today's alerts
3. Older alerts should be hidden

### Scenario 4: Search
1. Type "John" in search box
2. Should see only John Doe's alert
3. Other alerts should be hidden

### Scenario 5: Real-Time Updates
1. Keep dashboard open
2. Create new SOS alert via mobile app
3. Should appear immediately (no refresh)

## 📱 Mobile App Integration

When a customer presses SOS button in mobile app, include email:

```dart
// In mobile app SOS trigger
final sosData = {
  'customerId': currentUser.uid,
  'customerName': currentUser.displayName,
  'customerEmail': currentUser.email, // ← Important!
  'gps': {
    'latitude': position.latitude,
    'longitude': position.longitude,
  },
  'timestamp': DateTime.now().toIso8601String(),
};

// Send to backend
await http.post(
  Uri.parse('$baseUrl/api/sos'),
  body: jsonEncode(sosData),
);
```

## 🔧 Troubleshooting

### Problem: No alerts showing
**Solution**: 
- Run test script: `node test-client-sos-alerts.js`
- Check Firebase Realtime Database for `sos_events`
- Verify user email has correct domain

### Problem: Seeing alerts from other organizations
**Solution**:
- Check `customerEmail` field in SOS events
- Verify domain extraction logic
- Check console logs for filtering

### Problem: Real-time updates not working
**Solution**:
- Check Firebase connection
- Verify listener setup in `initState`
- Check for subscription cancellation

## 📋 Checklist

Before going live:
- [ ] Test with multiple organizations
- [ ] Verify domain filtering works
- [ ] Test all status filters
- [ ] Test time filters
- [ ] Test search functionality
- [ ] Verify real-time updates
- [ ] Test on mobile devices
- [ ] Check performance with many alerts
- [ ] Verify security rules
- [ ] Test error handling

## 🎨 UI Customization

### Change Colors
Edit `client_sos_alerts.dart`:
```dart
// Status colors
case 'ACTIVE': return const Color(0xFFEF4444); // Red
case 'In Progress': return const Color(0xFFF59E0B); // Orange
case 'Resolved': return const Color(0xFF10B981); // Green
```

### Change Card Layout
Modify `_buildAlertCard()` method in `client_sos_alerts.dart`

### Add More Filters
Add to `_buildFiltersSection()` method

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify Firebase connection
3. Check backend logs
4. Review documentation

## 🎉 Success Criteria

Your implementation is successful when:
- ✅ Clients see only their organization's alerts
- ✅ Real-time updates work smoothly
- ✅ All filters function correctly
- ✅ UI is responsive and beautiful
- ✅ No errors in console
- ✅ Performance is good with many alerts

## Next Steps

1. **Test thoroughly** with real data
2. **Customize UI** to match your brand
3. **Add map integration** for location viewing
4. **Implement status updates** for clients
5. **Add push notifications** for new alerts
6. **Create analytics dashboard** for insights

---

**Implementation Status**: ✅ Complete and Ready to Use

**Time to Deploy**: ~5 minutes

**Difficulty**: Easy - Just run test script and login!
