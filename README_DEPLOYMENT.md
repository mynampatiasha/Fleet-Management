# 🚀 ABRA Fleet - cPanel Deployment Package

## Welcome! 👋

This package contains everything you need to deploy your ABRA Fleet application to your cPanel server at **103.185.75.245**.

---

## 📦 What's Included

```
✅ Complete deployment documentation
✅ Configuration files ready to use
✅ Automated deployment scripts
✅ Step-by-step guides with visuals
✅ Troubleshooting resources
✅ Quick reference cards
```

---

## 🎯 Choose Your Path

### 🆕 New to Deployment? Start Here!

```
📖 Read: CPANEL_STEP_BY_STEP.md
   └─> Visual guide with diagrams
   └─> Easy to follow phases
   └─> Checkpoints at each step
   └─> Time: 40-60 minutes
```

### ⚡ Want Quick Deployment?

```
🚀 Run: deploy-to-cpanel.sh (Linux/Mac)
   OR: deploy-to-cpanel.bat (Windows)
   └─> Automated deployment
   └─> Minimal manual steps
   └─> Time: 20-30 minutes
```

### 📚 Need Detailed Reference?

```
📄 Read: CPANEL_DEPLOYMENT_GUIDE.md
   └─> Complete documentation
   └─> All details explained
   └─> Troubleshooting included
   └─> Time: Reference as needed
```

---

## 🗂️ File Guide

| File | Purpose | When to Use |
|------|---------|-------------|
| **CPANEL_STEP_BY_STEP.md** | Visual walkthrough | First deployment |
| **CPANEL_DEPLOYMENT_GUIDE.md** | Complete reference | Detailed help |
| **CPANEL_QUICK_REFERENCE.md** | Command cheat sheet | Quick lookups |
| **cpanel-deploy-checklist.md** | Progress tracker | Track deployment |
| **DEPLOYMENT_FILES_SUMMARY.md** | Package overview | Understand files |
| **.htaccess.cpanel** | Server config | Upload to server |
| **.env.cpanel.template** | Backend config | Configure backend |
| **.env.production.cpanel** | App config | Build Flutter app |
| **deploy-to-cpanel.sh** | Auto deploy | Linux/Mac users |
| **deploy-to-cpanel.bat** | Deploy helper | Windows users |

---

## ⚡ Quick Start (3 Steps)

### Step 1: Prepare
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy and save the output
```

### Step 2: Deploy Backend
```bash
# Linux/Mac
./deploy-to-cpanel.sh

# Windows
deploy-to-cpanel.bat
```

### Step 3: Build App
```bash
cd abra_fleet
flutter build apk --release
```

**Done! 🎉**

---

## 🔑 Server Information

```
Server IP:      103.185.75.245
cPanel URL:     https://103.185.75.245:2083
Username:       royaldxd
Backend Path:   /home/royaldxd/public_html/fleet-management/backend

API URL:        http://103.185.75.245/fleet-management/api
Health Check:   http://103.185.75.245/fleet-management/api/health
```

---

## 📋 Deployment Checklist

- [ ] Generate JWT secret
- [ ] Upload backend files to cPanel
- [ ] Create Node.js app in cPanel
- [ ] Install dependencies
- [ ] Configure MongoDB whitelist (IP: 103.185.75.245)
- [ ] Upload Firebase service account key
- [ ] Start application
- [ ] Test API endpoints
- [ ] Update Flutter .env
- [ ] Build APK
- [ ] Test on device

---

## 🎓 Documentation Levels

### Level 1: Quick Reference (5 min read)
→ **CPANEL_QUICK_REFERENCE.md**
- Commands and URLs
- Quick troubleshooting
- One-page reference

### Level 2: Visual Guide (20 min read)
→ **CPANEL_STEP_BY_STEP.md**
- Phase-by-phase walkthrough
- Diagrams and visuals
- Checkpoints included

### Level 3: Complete Guide (45 min read)
→ **CPANEL_DEPLOYMENT_GUIDE.md**
- Every detail explained
- All options covered
- Comprehensive troubleshooting

---

## 🛠️ What You'll Deploy

```
┌─────────────────────────────────────┐
│    cPanel Server (103.185.75.245)   │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Node.js Backend (Port 3000)   │ │
│  │  - Express API                 │ │
│  │  - Firebase Auth               │ │
│  │  - WebSocket (Port 3001)       │ │
│  └────────────────────────────────┘ │
│              ↕                       │
│  ┌────────────────────────────────┐ │
│  │  MongoDB Atlas (Cloud)         │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Flutter Mobile App (APK)       │
│  - Android/iOS                      │
│  - Connects to production API       │
└─────────────────────────────────────┘
```

---

## ✅ Success Indicators

After deployment, verify:

```bash
# 1. Health check
curl http://103.185.75.245/fleet-management/api/health
# Expected: {"status":"ok"}

# 2. Database test
curl http://103.185.75.245/fleet-management/test-db
# Expected: {"status":"success"}

# 3. App connects
# Install APK and test login
```

---

## 🆘 Need Help?

### Quick Issues
→ Check **CPANEL_QUICK_REFERENCE.md**

### Step-by-Step Help
→ Follow **CPANEL_STEP_BY_STEP.md**

### Detailed Troubleshooting
→ See **CPANEL_DEPLOYMENT_GUIDE.md**

### Common Problems

**App won't start?**
```bash
# Check logs
tail -f /home/royaldxd/logs/fleet-management-error.log
```

**MongoDB connection failed?**
```
1. Check IP whitelist: 103.185.75.245
2. Verify connection string in .env
```

**API returns 404?**
```
1. Check .htaccess exists
2. Verify app is running in cPanel
```

---

## 🎯 Deployment Timeline

```
Preparation:     5 minutes
Upload Files:    10 minutes
Setup Node.js:   10 minutes
Configure:       5 minutes
Test Backend:    5 minutes
Build App:       10 minutes
Test App:        5 minutes
─────────────────────────────
Total:          ~50 minutes
```

---

## 📞 Support Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| MongoDB Atlas | https://cloud.mongodb.com | Database management |
| Firebase Console | https://console.firebase.google.com | Auth management |
| cPanel | https://103.185.75.245:2083 | Server management |

---

## 🔄 After Deployment

### Immediate Tasks
1. ✅ Test all features
2. ✅ Verify user registration
3. ✅ Check dashboard loads
4. ✅ Test real-time updates

### Optional Enhancements
1. 🔒 Setup SSL/HTTPS
2. 🌐 Configure custom domain
3. 📊 Setup monitoring
4. 💾 Configure backups

---

## 🎉 Ready to Deploy?

### Recommended Path for Beginners:

```
1. Open: CPANEL_STEP_BY_STEP.md
2. Follow: Each phase carefully
3. Use: cpanel-deploy-checklist.md to track progress
4. Reference: CPANEL_QUICK_REFERENCE.md for commands
5. Time: Allow 60-90 minutes
```

### Recommended Path for Experienced Users:

```
1. Run: deploy-to-cpanel.sh (or .bat)
2. Follow: On-screen instructions
3. Reference: CPANEL_QUICK_REFERENCE.md
4. Time: 30-45 minutes
```

---

## 📝 Important Notes

- ⚠️ Generate a strong JWT secret (don't use default)
- ⚠️ Add server IP to MongoDB whitelist: 103.185.75.245
- ⚠️ Upload Firebase service account key
- ⚠️ Set proper file permissions (chmod 600)
- ⚠️ Test thoroughly before distributing app

---

## 🏆 You're All Set!

Everything you need is in this package. Choose your starting point and begin deployment.

**Questions?** Check the documentation files.
**Issues?** See troubleshooting sections.
**Ready?** Let's deploy! 🚀

---

## 📊 Package Contents

```
📦 Deployment Package
├── 📚 Documentation (5 files)
│   ├── CPANEL_DEPLOYMENT_GUIDE.md
│   ├── CPANEL_STEP_BY_STEP.md
│   ├── CPANEL_QUICK_REFERENCE.md
│   ├── cpanel-deploy-checklist.md
│   └── DEPLOYMENT_FILES_SUMMARY.md
│
├── ⚙️ Configuration (3 files)
│   ├── .htaccess.cpanel
│   ├── .env.cpanel.template
│   └── .env.production.cpanel
│
├── 🚀 Scripts (2 files)
│   ├── deploy-to-cpanel.sh
│   └── deploy-to-cpanel.bat
│
└── 📖 This File
    └── README_DEPLOYMENT.md
```

---

**Package Version**: 1.0.0
**Created**: December 16, 2025
**Server**: 103.185.75.245
**Status**: ✅ Ready for Deployment

---

**Good luck with your deployment! 🎉**
