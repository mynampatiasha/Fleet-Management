# ABRA Fleet - Deployment Documentation

This folder contains all the documentation and scripts needed to deploy the ABRA Fleet application to a production server.

---

## 📁 Files Overview

### Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **START_HERE_DEPLOYMENT.md** | Overview and quick start guide | Start here if this is your first deployment |
| **DEPLOYMENT_GUIDE.md** | Complete step-by-step deployment instructions | Follow for detailed deployment process |
| **DEPLOYMENT_CHECKLIST.md** | Checklist to track deployment progress | Use to ensure nothing is missed |
| **QUICK_DEPLOYMENT_REFERENCE.md** | Quick command reference | Keep handy for common commands |
| **DEPLOYMENT_OPTIONS.md** | Different deployment strategies and costs | Read to choose the best deployment option |

### Configuration Files

| File | Purpose |
|------|---------|
| **.env.production.template** | Production environment variables template |
| **nginx-config-template.conf** | Nginx reverse proxy configuration |

### Automation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **setup-server.sh** | Automates server setup (Node.js, PM2, Nginx) | Run once on fresh server |
| **deploy-backend.sh** | Deploys and starts backend application | Run to deploy/update backend |
| **build-flutter-app.sh** | Builds Flutter app for Android | Run to create release APK |

---

## 🚀 Quick Start

### First Time Deployment

1. **Read**: START_HERE_DEPLOYMENT.md
2. **Follow**: DEPLOYMENT_GUIDE.md
3. **Track**: Use DEPLOYMENT_CHECKLIST.md
4. **Reference**: Keep QUICK_DEPLOYMENT_REFERENCE.md handy

### Subsequent Deployments

1. Update your code
2. Run `deploy-backend.sh` on server
3. Run `build-flutter-app.sh` locally
4. Distribute new APK

---

## 📋 Deployment Process Summary

### Backend Deployment (Server)
```bash
# 1. Setup server (one time)
sudo ./setup-server.sh

# 2. Deploy backend
cd /var/www/abra_fleet_backend
./deploy-backend.sh

# 3. Configure Nginx (one time)
sudo nano /etc/nginx/sites-available/abra-fleet
# Use nginx-config-template.conf

# 4. Enable and restart Nginx
sudo ln -s /etc/nginx/sites-available/abra-fleet /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Flutter App Build (Local)
```bash
# 1. Update API URL
cd abra_fleet
nano .env  # Set API_BASE_URL

# 2. Build app
../build-flutter-app.sh

# 3. APK location
# build/app/outputs/flutter-apk/app-release.apk
```

---

## 🎯 What You Need

### Server Requirements
- Ubuntu 20.04+ (or similar Linux)
- 2GB RAM minimum (4GB recommended)
- 20GB storage
- Public IP address
- SSH access

### Software (Installed by setup-server.sh)
- Node.js 18+
- PM2 (process manager)
- Nginx (web server)
- Git

### Accounts & Credentials
- MongoDB Atlas (already configured)
- Firebase project (already configured)
- Email SMTP (already configured)
- Server provider account (DigitalOcean, Linode, etc.)

---

## 💰 Cost Breakdown

### Minimal Setup (~$13/month)
- Server: $12/month (DigitalOcean 2GB)
- Database: Free (MongoDB Atlas)
- Domain: $10/year
- SSL: Free (Let's Encrypt)

### Recommended Setup (~$46/month)
- Server: $20/month (DigitalOcean 4GB)
- Database: $25/month (MongoDB Atlas)
- Domain: $10/year
- SSL: Free

---

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
MONGODB_URI=mongodb+srv://...
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=abrafleet-cec94
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d
WEBSOCKET_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=<app-password>
```

### Flutter Environment Variables (.env)
```env
API_BASE_URL=http://your-server-ip/api
# or
API_BASE_URL=https://your-domain.com/api
```

---

## 🛠️ Common Commands

### Backend Management
```bash
pm2 start index.js --name abra-fleet-backend
pm2 restart abra-fleet-backend
pm2 stop abra-fleet-backend
pm2 logs abra-fleet-backend
pm2 status
```

### Nginx Management
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
sudo nginx -t
```

### Monitoring
```bash
pm2 monit
pm2 logs abra-fleet-backend --lines 100
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if running
pm2 status

# View logs
pm2 logs abra-fleet-backend

# Restart
pm2 restart abra-fleet-backend
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Issues
```bash
# Test MongoDB connection
node -e "require('mongoose').connect('YOUR_MONGODB_URI').then(() => console.log('Connected')).catch(e => console.error(e))"
```

---

## 📊 Deployment Checklist

- [ ] Server provisioned and accessible
- [ ] Server software installed (Node.js, PM2, Nginx)
- [ ] Backend code uploaded
- [ ] Environment variables configured
- [ ] Firebase service account key uploaded
- [ ] Backend started with PM2
- [ ] Nginx configured and running
- [ ] API accessible through Nginx
- [ ] Flutter app built with production API URL
- [ ] App tested on device
- [ ] All features working

---

## 🔐 Security Checklist

- [ ] Strong JWT_SECRET generated
- [ ] .env file permissions set to 600
- [ ] Firebase key permissions set to 600
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] SSL certificate installed (recommended)
- [ ] Regular security updates scheduled

---

## 📈 Monitoring & Maintenance

### Daily
- Check PM2 status
- Review error logs

### Weekly
- Review application logs
- Check disk space
- Verify backups

### Monthly
- Update system packages
- Review security updates
- Test backup restoration

---

## 🔄 Update Process

### Backend Updates
```bash
cd /var/www/abra_fleet_backend
git pull  # or upload new files
npm install --production
pm2 restart abra-fleet-backend
pm2 logs abra-fleet-backend
```

### Flutter App Updates
```bash
cd abra_fleet
# Update code
flutter clean
flutter pub get
flutter build apk --release
# Distribute new APK
```

---

## 📞 Support Resources

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Firebase Console**: https://console.firebase.google.com
- **PM2 Docs**: https://pm2.keymetrics.io/docs
- **Nginx Docs**: https://nginx.org/en/docs
- **Flutter Docs**: https://flutter.dev/docs/deployment

---

## 📝 Notes

- All scripts are designed for Ubuntu/Debian Linux
- Scripts require bash shell
- Make scripts executable: `chmod +x script-name.sh`
- Always test in a staging environment first
- Keep backups of configuration files
- Document any custom changes

---

## 🎓 Learning Resources

### For Beginners
1. Start with START_HERE_DEPLOYMENT.md
2. Follow DEPLOYMENT_GUIDE.md step by step
3. Use DEPLOYMENT_CHECKLIST.md to track progress

### For Experienced Users
1. Review DEPLOYMENT_OPTIONS.md
2. Use automation scripts
3. Refer to QUICK_DEPLOYMENT_REFERENCE.md

---

## 📅 Version History

- **v1.0.0** (December 16, 2025) - Initial deployment documentation

---

## 🤝 Contributing

If you find issues or have improvements:
1. Document the issue
2. Test the solution
3. Update relevant documentation
4. Share with the team

---

**Ready to deploy?** Open **START_HERE_DEPLOYMENT.md** to begin!
