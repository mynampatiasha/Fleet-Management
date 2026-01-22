# Quick Start: Smart Grouping Feature

## 🚀 What It Does
Automatically groups employees with matching schedules and locations so they can share the same vehicle.

---

## 📍 Where to Find It
**Pending Rosters Screen** → **"Smart Grouping"** button (purple, next to Route Optimization)

---

## 🎯 How to Use

### Step 1: Open Pending Rosters
Navigate to: **Admin Dashboard** → **Customer Management** → **Pending Rosters**

### Step 2: Click "Smart Grouping"
- Purple button with group icon
- Located in the top action bar

### Step 3: View Groups
Dialog shows groups sorted by size (largest first):
- **5 employees from Infosys**
  - Login: 09:30 @ Electronic City
  - Logout: 18:30 @ Electronic City
  - Type: both

### Step 4: Expand a Group
Click on any group card to see:
- Full list of employees
- Email addresses
- "Optimize Route" button

### Step 5: Optimize Route
Click **"Optimize Route for X Employees"** button:
- System finds best vehicle
- Generates optimal route
- Shows confirmation
- Assigns with notifications

---

## 🔍 Grouping Criteria

Employees are grouped when they have:
- ✅ Same organization/company
- ✅ Same login time
- ✅ Same logout time
- ✅ Same login location
- ✅ Same logout location
- ✅ Same roster type (login/logout/both)

---

## 💡 Example Scenario

**Before Smart Grouping:**
- Admin sees 15 pending rosters
- Hard to identify which can share vehicles
- Manual checking required

**After Smart Grouping:**
- Click "Smart Grouping" button
- See: "5 employees from Infosys going to Electronic City at 9:30 AM"
- Click "Optimize Route" → Done!

---

## ⚠️ Important: Backend Restart Required

**Before testing, restart your backend server:**

```bash
# Stop current backend (Ctrl+C)
cd abra_fleet_backend
node index.js
```

This applies the syntax fixes from the route optimization router.

---

## 🐛 Troubleshooting

### "No groups found"
- All rosters have unique criteria
- Try creating rosters with matching schedules

### "Failed to group rosters"
- Check backend is running
- Check backend logs for errors
- Verify admin has organization set

### Route optimization returns "0 customers"
- Restart backend server (CRITICAL)
- Check roster status is 'pending_assignment'
- Verify vehicle has assigned driver

---

## 📊 What Happens Behind the Scenes

1. **Backend analyzes** all pending rosters for your organization
2. **Groups** rosters with matching criteria
3. **Sorts** groups by employee count (largest first)
4. **Returns** grouped data to frontend
5. **Displays** in expandable cards
6. **Optimizes** route when you select a group

---

## ✅ Benefits

- **Saves Time**: No manual roster checking
- **Reduces Errors**: System ensures compatibility
- **Maximizes Efficiency**: Groups use vehicle capacity better
- **One-Click**: Direct optimization from groups

---

## 🎨 UI Elements

### Smart Grouping Button
- **Color**: Purple
- **Icon**: Group work icon
- **Location**: Top action bar

### Group Cards
- **Badge**: Employee count (purple circle)
- **Title**: "X employees from [Organization]"
- **Details**: Login/logout times and locations
- **Expandable**: Shows employee list
- **Action**: "Optimize Route" button (amber)

---

## 📝 Testing Steps

1. ✅ Restart backend server
2. ✅ Create 3-5 rosters with same organization, time, location
3. ✅ Go to Pending Rosters screen
4. ✅ Click "Smart Grouping" button
5. ✅ Verify group appears with correct count
6. ✅ Expand group to see employees
7. ✅ Click "Optimize Route"
8. ✅ Verify route optimization works
9. ✅ Check notifications are sent

---

## 🔗 Related Features

- **Route Optimization**: Automatically triggered from groups
- **Vehicle Confirmation**: Shows before route generation
- **Compatibility Check**: Ensures organization/shift matching
- **Notifications**: Sent to customers and driver

---

## 📞 Support

If you encounter issues:
1. Check backend logs for errors
2. Verify backend is restarted
3. Check roster status in database
4. Review SMART_GROUPING_FEATURE_COMPLETE.md for details
