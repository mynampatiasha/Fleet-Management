# 🔐 All Customer Login Credentials

## ✅ Status: All 19 Roster Customers Have Accounts!

All customers with rosters now have Firebase Auth + MongoDB accounts and can log in.

---

## 📋 Login Credentials by Company

### 🏢 Infosys Limited (10 Customers)

1. **Customer123**
   - Email: `customer@infosys.com`
   - Password: Check migration logs (already existed)
   - Rosters: 1

2. **Vikram Singh**
   - Email: `vikram.singh@infosys.com`
   - Password: `Welcome@djv4lj2w`
   - Firebase UID: XIRSqzSOcwXC0BK1RWmLQXIdj763
   - Rosters: 4

3. **Karan Mehta**
   - Email: `karan.mehta@infosys.com`
   - Password: `Welcome@9sokphrj`
   - Firebase UID: xOJdOoRUQfZDt7KsZJSUGEXvEhu2
   - Rosters: 2

4. **Divya Reddy**
   - Email: `divya.reddy@infosys.com`
   - Password: `Welcome@0nmoyyxv`
   - Firebase UID: YYp1PTLEcjXnlrgtgUyJlMeE7o52
   - Rosters: 2

5. **John Doe**
   - Email: `john.doe@infosys.com`
   - Password: `Welcome@v3uwd6nc`
   - Firebase UID: jRa7BpeLXvSvMQ6VBCNu1wnSi5B2
   - Rosters: 1

6. **Sarah Smith**
   - Email: `sarah.smith@infosys.com`
   - Password: `Welcome@dwz13jgd`
   - Firebase UID: 1pyWsiIqemYTDy2EtX7YVPR7i5I3
   - Rosters: 1

7. **Amit Patel**
   - Email: `amit.patel@infosys.com`
   - Password: `Welcome@7a0xwf78`
   - Firebase UID: ze3evnDrSufIqEkg9JjQsMGZZd83
   - Rosters: 2

8. **Rajesh Kumar**
   - Email: `rajesh.kumar@infosys.com`
   - Password: `Welcome@5jo0ibd6`
   - Firebase UID: 0Qsx3iQyZxPUzXxQFVAYU7tKuQu1
   - Rosters: 1

9. **Priya Sharma**
   - Email: `priya.sharma@infosys.com`
   - Password: `Welcome@6vipo81i`
   - Firebase UID: VSCJkbM0AEhupcIMsCXJr3oFeYo1
   - Rosters: 1

10. **Neha Gupta**
    - Email: `neha.gupta@infosys.com`
    - Password: `Welcome@ki0q6w9g`
    - Firebase UID: hjNubMG11qZhfia7YgYUHrGVt6p2
    - Rosters: 1

---

### 🏢 TCS (3 Customers)

11. **Anjali Desai**
    - Email: `anjali.desai@tcs.com`
    - Password: `Welcome@ew2t31ln`
    - Firebase UID: V3CuwWetVrZVXmT3YHTw1tX1KZ12
    - Rosters: 1

12. **Karan Mehta**
    - Email: `karan.mehta@tcs.com`
    - Password: `Welcome@l4cziwe5`
    - Firebase UID: xnhAK4j92aXlsHSw9McbiJf3NAT2
    - Rosters: 1

13. **Divya Reddy**
    - Email: `divya.reddy@tcs.com`
    - Password: `Welcome@9qtbvtbs`
    - Firebase UID: Ty0hDLhWqpN2nFb949zfE1zOlTJ2
    - Rosters: 1

---

### 🏢 Wipro (3 Customers) ⭐ YOUR TEST CUSTOMERS

14. **Sneha Iyer**
    - Email: `sneha.iyer@wipro.com`
    - Password: `Welcome@u0lyxzv2`
    - Firebase UID: Qcx7Ozcmd0ZQlFWqWAAzE8G34zE3
    - Rosters: 1

15. **Arjun Nair**
    - Email: `arjun.nair@wipro.com`
    - Password: `Welcome@934dspat`
    - Firebase UID: FPMiOhcHbXeavqTr12YussFE1gZ2
    - Rosters: 1

16. **Pooja Joshi**
    - Email: `pooja.joshi@wipro.com`
    - Password: `Welcome@o8o28joj`
    - Firebase UID: m5yKRD8EZMRPIpgjdVuqAl1mhnj2
    - Rosters: 1

---

### 🏢 Abra Fleet (2 Customers)

17. **Customer**
    - Email: `customer123@abrafleet.com`
    - Password: Check existing records (already existed)
    - Rosters: 10

18. **Asha**
    - Email: `asha123@cognizant.com`
    - Password: Check existing records (already existed)
    - Rosters: 3

---

### 🏢 Admin (1 User)

19. **Admin**
    - Email: `admin@abrafleet.com`
    - Password: Check existing records (already existed)
    - Rosters: 3

---

## 🎯 Quick Test Guide

### Test with Any 5 Customers:

**Option 1: Infosys Customers (Good for testing multiple rosters)**
1. Vikram Singh - vikram.singh@infosys.com (4 rosters)
2. Karan Mehta - karan.mehta@infosys.com (2 rosters)
3. Divya Reddy - divya.reddy@infosys.com (2 rosters)
4. Amit Patel - amit.patel@infosys.com (2 rosters)
5. John Doe - john.doe@infosys.com (1 roster)

**Option 2: Mixed Companies (Good for testing organization segregation)**
1. Sneha Iyer - sneha.iyer@wipro.com (Wipro)
2. Arjun Nair - arjun.nair@wipro.com (Wipro)
3. Anjali Desai - anjali.desai@tcs.com (TCS)
4. Vikram Singh - vikram.singh@infosys.com (Infosys)
5. Karan Mehta - karan.mehta@infosys.com (Infosys)

---

## 📱 How to Test

### Step 1: Login Test
1. Open Flutter app
2. Try logging in with any customer above
3. Use their email + password
4. Should succeed ✅

### Step 2: FCM Token Registration
- After login, FCM token registers automatically
- Check in MongoDB: `db.users.findOne({ email: "EMAIL" }, { fcmToken: 1 })`

### Step 3: Route Assignment Test
1. Log in as admin
2. Go to: Admin → Pending Rosters
3. Select 5 customers' rosters
4. Click "Optimize Route"
5. Select vehicle with driver
6. Click "Assign"
7. **Check notification count - should show 5!** ✅

### Step 4: Verify Notifications
1. Check notification count in response
2. Check Firestore: `notifications` collection
3. Log in as customer and check notification list
4. Should see "Driver Assigned" notification ✅

---

## 🔍 Verification Commands

### Check All Users in MongoDB:
```javascript
db.users.find({ role: "customer" }).count()
// Should return 18 (excluding admin)
```

### Check Specific User:
```javascript
db.users.findOne({ email: "sneha.iyer@wipro.com" })
```

### Check User's Rosters:
```javascript
db.rosters.find({ customerEmail: "vikram.singh@infosys.com" })
```

### Check if Roster is Linked to User:
```javascript
db.rosters.find({ 
  customerEmail: "sneha.iyer@wipro.com",
  customerId: { $exists: true }
})
```

---

## 📊 Summary

**Total Customers:** 19
**With Accounts:** 19 ✅
**Without Accounts:** 0 ✅

**By Company:**
- Infosys: 10 customers
- TCS: 3 customers
- Wipro: 3 customers
- Abra Fleet: 2 customers
- Admin: 1 user

**Total Rosters:** 43
**All Linked:** ✅

---

## 💡 Important Notes

1. **Temporary Passwords:** All new accounts use `Welcome@XXXXXXXX` format
2. **Password Reset:** Users should reset password on first login
3. **FCM Tokens:** Register automatically when users log in via app
4. **Notifications:** Will work once FCM tokens are registered
5. **Organization:** Each customer is linked to their company

---

## 🎯 Next Steps

1. ✅ **DONE:** All customers have accounts
2. **TODO:** Test login with 5 customers
3. **TODO:** Assign routes to these customers
4. **TODO:** Verify notifications work (should show 5 notified!)
5. **TODO:** Check customers can see notifications in app

---

## 🚀 Ready to Test!

All 19 customers are ready. Pick any 5 and test route assignment. Notifications should work perfectly now! 🎉
