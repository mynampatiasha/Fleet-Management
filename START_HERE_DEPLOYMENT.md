# 🚀 ABRA Fleet Deployment - START HERE

Welcome! This guide will help you deploy your ABRA Fleet application to a production server.

---

## 📚 Documentation Overview

We've created several documents to help you deploy:

1. **START_HERE_DEPLOYMENT.md** (this file) - Overview and quick start
2. **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment guide
3. **DEPLOYMENT_CHECKLIST.md** - Checklist to track your progress
4. **QUICK_DEPLOYMENT_REFERENCE.md** - Quick commands reference
5. **DEPLOYMENT_OPTIONS.md** - Different deployment strategies
6. **Scripts** - Automated deployment scripts

---

## ⚡ Quick Start (Choose Your Path)

### Path A: I want the fastest deployment (30 minutes)
1. Get a DigitalOcean/Linode server ($6-12/month)
2. Follow **DEPLOYMENT_GUIDE.md** sections 1-6
3. Use the automated scripts: `setup-server.sh` and `deploy-backend.sh`
4. Build Flutter app with `build-flutter-app.sh`

### Path B: I want to understand everything (2 hours)
1. Read **DEPLOYMENT_OPTIONS.md** to choose deployment strategy
2. Follow **DEPLOYMENT_GUIDE.md** step by step
3. Use **DEPLOYMENT_CHECKLIST.md** to track progress
4. Keep **QUICK_DEPLOYMENT_REFERENCE.md** handy for commands

### Path C: I have a server ready (15 minutes)
1. Run `setup-server.sh` on your server
2. Upload backend code to `/var/www/abra_fleet_backend`
3. Run `deploy-backend.sh`
4. Configure Nginx using `nginx-config-template.conf`
5. Build app with `build-flutter-app.sh`

---

## 🎯 What You Need

### Required
- [ ] A server (VPS) with Ubuntu 20.04+ (2GB RAM minimum)
- [ ] SSH access to the server
- [ ] MongoDB Atlas connection string (you already have this)
- [ ] Firebase service account key file
- [ ] Domain name (optional but recommended)

### Already Configured
- ✅ MongoDB Atlas database
- ✅ Firebase project
- ✅ Email SMTP (Gmail)
- ✅ Backend code
- ✅ Flutter app code

---

## 📋 Deployment Steps Overview

### Backend (30-45 minutes)
1. **Setup Server** - Install Node.js, PM2, Nginx
2. **Upload Code** - Transfer backend files to server
3. **Configure** - Set environment variables and Firebase key
4. **Start Application** - Run with PM2
5. **Setup Nginx** - Configure reverse proxy
6. **Enable SSL** - Optional but recommended

### Flutter App (15-20 minutes)
1. **Update Config** - Set production API URL
2. **Build APK** - Create release build
3. **Test** - Verify app works with production backend
4. **Distribute** - Share APK or upload to Play Store

---

## 🛠️ Available Scripts

All scripts are in the root directory:

### `setup-server.sh`
Sets up a fresh Ubuntu server with all required software.
```bash
sudo ./setup-server.sh
```

### `deploy-backend.sh`
Deploys and starts the backend application.
```bash
./deploy-backend.sh
```

### `build-flutter-app.sh`
Builds the Flutter app for Android.
```bash
./build-flutter-app.sh
```

---

## 💰 Cost Estimate

### Minimal Setup (Good for 50-100 users)
- **Server**: DigitalOcean Droplet - $12/month
- **Database**: MongoDB Atlas Free Tier - $0/month
- **Domain**: Namecheap - $10/year
- **SSL**: Let's Encrypt - Free
- **Total**: ~$13/month

### Recommended Setup (Good for 200-500 users)
- **Server**: DigitalOcean Droplet - $20/month
- **Database**: MongoDB Atlas - $25/month
- **Domain**: $10/year
- **SSL**: Free
- **Total**: ~$46/month

---

## 🎬 Step-by-Step (First Time)

### Step 1: Get a Server (5 minutes)

**Recommended**: DigitalOcean
1. Go to https://digitalocean.com
2. Create account
3. Create a Droplet:
   - **Image**: Ubuntu 20.04 LTS
   - **Plan**: Basic ($12/month - 2GB RAM)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH key (recommended) or password
4. Note your server IP address

### Step 2: Connect to Server (2 minutes)

```bash
# From your local machine
ssh root@YOUR_SERVER_IP
```

### Step 3: Setup Server (10 minutes)

```bash
# On the server
wget https://raw.githubusercontent.com/YOUR_REPO/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

Or manually follow **DEPLOYMENT_GUIDE.md** Part 1, Step 1.

### Step 4: Upload Backend Code (5 minutes)

```bash
# From your local machine
cd /path/to/your/project
scp -r abra_fleet_backend root@YOUR_SERVER_IP:/var/www/
```

### Step 5: Configure Backend (5 minutes)

```bash
# On the server
cd /var/www/abra_fleet_backend

# Create .env file
nano .env
# Copy content from .env.production.template
# Update JWT_SECRET with a strong random value

# Upload Firebase key (from local machine)
scp abrafleet-*-firebase-adminsdk-*.json root@YOUR_SERVER_IP:/var/www/abra_fleet_backend/
```

### Step 6: Deploy Backend (5 minutes)

```bash
# On the server
cd /var/www/abra_fleet_backend
chmod +x deploy-backend.sh
./deploy-backend.sh
```

### Step 7: Configure Nginx (5 minutes)

```bash
# On the server
sudo nano /etc/nginx/sites-available/abra-fleet
# Paste content from nginx-config-template.conf
# Update server_name with your domain or IP

sudo ln -s /etc/nginx/sites-available/abra-fleet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Test Backend (2 minutes)

```bash
# From your local machine or browser
curl http://YOUR_SERVER_IP/api/health
# Should return: {"status":"ok"}
```

### Step 9: Build Flutter App (10 minutes)

```bash
# On your local machine
cd abra_fleet

# Update .env with your server URL
nano .env
# Set: API_BASE_URL=http://YOUR_SERVER_IP/api

# Build
chmod +x ../build-flutter-app.sh
../build-flutter-app.sh
```

### Step 10: Test App (5 minutes)

1. Install APK on your Android device
2. Open app
3. Try to register/login
4. Verify all features work

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend is running (`pm2 status`)
- [ ] Health endpoint responds (`curl http://YOUR_SERVER_IP/api/health`)
- [ ] Nginx is running (`sudo systemctl status nginx`)
- [ ] Can access API through Nginx
- [ ] Flutter app connects to backend
- [ ] User registration works
- [ ] User login works
- [ ] Firebase authentication works
- [ ] MongoDB data persists
- [ ] Email notifications send

---

## 🆘 Common Issues

### "Connection refused" when accessing API
- Check if backend is running: `pm2 status`
- Check if Nginx is running: `sudo systemctl status nginx`
- Check firewall: `sudo ufw status`

### "Cannot connect to MongoDB"
- Verify MongoDB Atlas IP whitelist includes your server IP
- Test connection string in .env

### "Firebase authentication failed"
- Verify Firebase service account key is uploaded
- Check file path in backend code
- Verify FIREBASE_PROJECT_ID in .env

### App can't connect to backend
- Verify API_BASE_URL in Flutter .env
- Rebuild app after changing .env
- Test API endpoint from browser first

---

## 📞 Need Help?

1. **Check logs**: `pm2 logs abra-fleet-backend`
2. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Review documentation**: See DEPLOYMENT_GUIDE.md for detailed steps
4. **Use checklist**: DEPLOYMENT_CHECKLIST.md to track progress

---

## 🎉 Next Steps After Deployment

1. **Setup SSL** - Follow DEPLOYMENT_GUIDE.md Step 7 for HTTPS
2. **Configure Domain** - Point your domain to server IP
3. **Setup Monitoring** - Monitor server resources and logs
4. **Create Backups** - Setup automated backups
5. **Distribute App** - Share APK or upload to Play Store
6. **Document** - Record server credentials and configuration

---

## 📖 Additional Resources

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Firebase Console**: https://console.firebase.google.com
- **DigitalOcean Docs**: https://docs.digitalocean.com
- **PM2 Documentation**: https://pm2.keymetrics.io
- **Nginx Documentation**: https://nginx.org/en/docs
- **Flutter Deployment**: https://flutter.dev/docs/deployment

---

## 🔄 Updating Your Deployment

When you make changes to your code:

```bash
# Backend update
cd /var/www/abra_fleet_backend
git pull  # or upload new files
npm install --production
pm2 restart abra-fleet-backend

# Flutter app update
cd abra_fleet
flutter clean
flutter pub get
flutter build apk --release
# Distribute new APK
```

---

**Ready to deploy?** Start with **DEPLOYMENT_GUIDE.md** for detailed instructions!

**Last Updated**: December 16, 2025
**Version**: 1.0.0
