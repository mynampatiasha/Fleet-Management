# 🔧 FIX: "Error loading rosters: ApiException: Network error during GET request"

## Problem
Your Flutter app cannot connect to the backend API server.

## Quick Diagnosis

### Step 1: Check if Backend is Running
```bash
# Run this command:
test-backend-running.bat
```

OR manually check:
```bash
curl http://localhost:3001/health
```

If you get a response, backend is running ✅  
If you get "connection refused", backend is NOT running ❌

---

### Step 2: Start Backend (if not running)
```bash
cd abra_fleet_backend
node start-server.js
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 3001
```

---

### Step 3: Check Flutter Configuration

**For Web (Chrome/Edge):**
- Backend URL should be: `http://localhost:3001`
- Check `abra_fleet/.env` file:
  ```
  API_BASE_URL=http://localhost:3001
  WEBSOCKET_URL=ws://localhost:3001
  ```

**For Mobile (Physical Device/Emulator):**
- Find your computer's IP address:
  ```bash
  ipconfig
  # Look for "IPv4 Address" under your active network
  # Example: 192.168.1.100
  ```
- Update `abra_fleet/.env`:
  ```
  API_BASE_URL=http://YOUR_IP:3001
  WEBSOCKET_URL=ws://YOUR_IP:3001
  ```
  Replace `YOUR_IP` with your actual IP (e.g., `192.168.1.100`)

---

### Step 4: Restart Flutter App
After changing `.env`:
```bash
# Stop the app (Ctrl+C in terminal)
# Then restart:
flutter run
```

---

## Common Issues & Solutions

### Issue 1: "Connection Refused"
**Cause:** Backend not running  
**Fix:** Start backend with `node start-server.js`

### Issue 2: "Network Unreachable" (Mobile)
**Cause:** Wrong IP address or firewall blocking  
**Fix:**
1. Verify IP address with `ipconfig`
2. Ensure phone and computer are on same WiFi
3. Disable Windows Firewall temporarily to test

### Issue 3: "Timeout"
**Cause:** Backend is slow or crashed  
**Fix:**
1. Check backend console for errors
2. Restart backend
3. Check MongoDB connection

### Issue 4: CORS Error (Web only)
**Cause:** Backend not allowing web requests  
**Fix:** Backend already has CORS enabled, but verify in `abra_fleet_backend/start-server.js`

---

## Test Connection Manually

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"ok"}`

### Test 2: Roster API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/roster/admin/pending
```

---

## Still Not Working?

### Check Backend Logs
Look for errors in the backend console:
- MongoDB connection errors
- Port already in use (3001)
- Authentication errors

### Check Flutter Logs
Look for:
- `DioException`
- `SocketException`
- `Connection refused`
- `Network unreachable`

### Verify Port 3001 is Free
```bash
netstat -ano | findstr :3001
```
If something else is using port 3001, change it in:
- `abra_fleet_backend/.env` → `PORT=3002`
- `abra_fleet/.env` → `API_BASE_URL=http://localhost:3002`

---

## Quick Test Script

Run this to test everything:
```bash
# 1. Test backend
curl http://localhost:3001/health

# 2. Test roster endpoint (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/roster/admin/pending

# 3. Check if port is listening
netstat -ano | findstr :3001
```

---

## Final Checklist

- [ ] Backend is running (`node start-server.js`)
- [ ] Backend shows "Server running on port 3001"
- [ ] MongoDB is connected
- [ ] `.env` file has correct API_BASE_URL
- [ ] Flutter app restarted after `.env` changes
- [ ] Same WiFi network (for mobile)
- [ ] Firewall not blocking port 3001

---

## Need More Help?

1. Share backend console output
2. Share Flutter error logs
3. Share your IP address and `.env` configuration
4. Confirm: Web or Mobile app?
