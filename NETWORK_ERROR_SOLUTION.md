# 🔴 SOLUTION: "Error loading rosters: ApiException: Network error during GET request"

## What's Happening?
Your Flutter app is trying to fetch rosters from the backend API, but it cannot connect. This is a **network connectivity issue**, not a code bug.

---

## 🚀 QUICK FIX (Choose One)

### Option 1: Automatic Fix (Recommended)
```bash
auto-fix-network-error.bat
```
This will:
- ✅ Check if backend is running (start it if not)
- ✅ Verify .env configuration
- ✅ Test API connectivity
- ✅ Show your IP address for mobile testing

### Option 2: Manual Fix

#### Step 1: Start Backend
```bash
cd abra_fleet_backend
node start-server.js
```

Wait for:
```
✅ MongoDB Connected
🚀 Server running on port 3001
```

#### Step 2: Verify Backend is Running
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

#### Step 3: Check Flutter Configuration

**For Web (Chrome/Edge):**
Edit `abra_fleet/.env`:
```env
API_BASE_URL=http://localhost:3001
WEBSOCKET_URL=ws://localhost:3001
```

**For Mobile (Physical Device):**
1. Find your computer's IP:
   ```bash
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. Edit `abra_fleet/.env`:
   ```env
   API_BASE_URL=http://192.168.1.100:3001
   WEBSOCKET_URL=ws://192.168.1.100:3001
   ```
   (Replace `192.168.1.100` with YOUR actual IP)

3. Ensure phone and computer are on **same WiFi network**

#### Step 4: Restart Flutter App
```bash
# Stop app (Ctrl+C)
flutter run
```

---

## 🔍 Diagnostic Tools

### Check Backend Status
```bash
diagnose-network-error.bat
```

### Test API Manually
```bash
# Health check
curl http://localhost:3001/health

# Roster endpoint (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/roster/admin/pending
```

---

## 🐛 Common Issues

### Issue 1: Backend Not Running
**Symptoms:**
- "Connection refused"
- "Network error"
- "Cannot connect to server"

**Solution:**
```bash
cd abra_fleet_backend
node start-server.js
```

### Issue 2: Wrong IP Address (Mobile)
**Symptoms:**
- Works on web, fails on mobile
- "Network unreachable"
- "Timeout"

**Solution:**
1. Get your IP: `ipconfig`
2. Update `abra_fleet/.env` with correct IP
3. Ensure same WiFi network
4. Restart Flutter app

### Issue 3: Port Already in Use
**Symptoms:**
- Backend shows "Port 3001 already in use"
- Backend won't start

**Solution:**
```bash
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in both:
# - abra_fleet_backend/.env → PORT=3002
# - abra_fleet/.env → API_BASE_URL=http://localhost:3002
```

### Issue 4: Firewall Blocking
**Symptoms:**
- Works on same computer, fails from mobile
- "Connection timeout"

**Solution:**
1. Temporarily disable Windows Firewall to test
2. If that fixes it, add firewall rule:
   ```
   Control Panel → Windows Defender Firewall → Advanced Settings
   → Inbound Rules → New Rule → Port → TCP → 3001 → Allow
   ```

### Issue 5: MongoDB Not Connected
**Symptoms:**
- Backend starts but crashes
- "MongoDB connection error"

**Solution:**
Check `abra_fleet_backend/.env`:
```env
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0
```

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] Backend is running (`node start-server.js`)
- [ ] Backend console shows "Server running on port 3001"
- [ ] MongoDB is connected
- [ ] Health check works: `curl http://localhost:3001/health`
- [ ] `.env` file has correct `API_BASE_URL`
- [ ] Flutter app restarted after `.env` changes
- [ ] (Mobile only) Same WiFi network
- [ ] (Mobile only) Correct IP address in `.env`
- [ ] No firewall blocking port 3001

---

## 📊 Expected Behavior After Fix

1. **Backend Console:**
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 3001
   📋 Loading Pending Rosters...
   ✅ Found X rosters
   ```

2. **Flutter App:**
   - No more "Network error"
   - Rosters load successfully
   - Shows list of pending rosters

---

## 🆘 Still Not Working?

### Collect Debug Info:
1. **Backend logs** (copy from backend console)
2. **Flutter logs** (copy from Flutter console)
3. **Your setup:**
   - Web or Mobile?
   - Your IP address
   - Contents of `abra_fleet/.env`
   - Contents of `abra_fleet_backend/.env`

### Quick Debug Commands:
```bash
# 1. Check backend
curl http://localhost:3001/health

# 2. Check port
netstat -ano | findstr :3001

# 3. Check IP
ipconfig

# 4. Check .env
type abra_fleet\.env

# 5. Test roster API
curl -v http://localhost:3001/api/roster/admin/pending
```

---

## 💡 Pro Tips

1. **Always start backend first** before running Flutter app
2. **Keep backend console open** to see errors in real-time
3. **Use localhost for web**, IP address for mobile
4. **Restart Flutter app** after changing `.env`
5. **Check backend logs** if API calls fail

---

## 📝 Summary

The error happens because:
1. Backend is not running, OR
2. Flutter app has wrong API URL, OR
3. Network connectivity issue (firewall, wrong IP, different WiFi)

**Fix:** Run `auto-fix-network-error.bat` and follow the instructions.

---

## 🎯 Quick Reference

| Platform | API_BASE_URL | Notes |
|----------|--------------|-------|
| Web (Chrome/Edge) | `http://localhost:3001` | Default |
| Mobile (Emulator) | `http://10.0.2.2:3001` | Android emulator |
| Mobile (Physical) | `http://YOUR_IP:3001` | Same WiFi required |
| Desktop (Windows) | `http://localhost:3001` | Default |

Replace `YOUR_IP` with your actual IP from `ipconfig`.
