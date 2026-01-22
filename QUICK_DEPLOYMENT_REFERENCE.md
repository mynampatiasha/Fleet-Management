# ABRA Fleet - Quick Deployment Reference

## 🚀 Quick Start (5 Minutes)

### 1. Setup Server
```bash
# On your server (as root)
curl -o setup-server.sh https://your-repo/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### 2. Deploy Backend
```bash
# Upload code to /var/www/abra_fleet_backend
cd /var/www/abra_fleet_backend

# Create .env file (use template)
nano .env

# Upload Firebase key
# scp abrafleet-*-firebase-adminsdk-*.json user@server:/var/www/abra_fleet_backend/

# Run deployment script
chmod +x deploy-backend.sh
./deploy-backend.sh
```

### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/abra-fleet
# Paste nginx-config-template.conf content
# Update server_name with your domain

sudo ln -s /etc/nginx/sites-available/abra-fleet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Build Flutter App
```bash
# On your local machine
cd abra_fleet
nano .env  # Update API_BASE_URL

chmod +x ../build-flutter-app.sh
../build-flutter-app.sh
```

---

## 📋 Essential Commands

### Backend Management
```bash
# Start
pm2 start index.js --name abra-fleet-backend

# Restart
pm2 restart abra-fleet-backend

# Stop
pm2 stop abra-fleet-backend

# View logs
pm2 logs abra-fleet-backend

# Monitor
pm2 monit

# Status
pm2 status
```

### Nginx Management
```bash
# Test config
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Flutter Build
```bash
# Clean
flutter clean

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

---

## 🔧 Configuration Files

### Backend .env
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

### Flutter .env
```env
API_BASE_URL=https://your-domain.com/api
```

---

## 🔍 Health Checks

```bash
# Backend health
curl http://localhost:3000/health
curl http://your-domain.com/api/health

# Check if backend is running
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check ports
sudo netstat -tulpn | grep 3000
sudo netstat -tulpn | grep 80
```

---

## 🐛 Quick Troubleshooting

### Backend won't start
```bash
pm2 logs abra-fleet-backend --lines 50
# Check for missing .env or Firebase key
```

### Can't connect to MongoDB
```bash
# Test connection
node -e "require('mongoose').connect('YOUR_MONGODB_URI').then(() => console.log('OK')).catch(e => console.error(e))"

# Check MongoDB Atlas IP whitelist
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs abra-fleet-backend

# Restart backend
pm2 restart abra-fleet-backend
```

### App can't connect to API
```bash
# Test API from browser
curl http://your-domain.com/api/health

# Check Flutter .env has correct API_BASE_URL
# Rebuild app after changing .env
```

---

## 🔐 Security Quick Checks

```bash
# Check file permissions
ls -la /var/www/abra_fleet_backend/.env
ls -la /var/www/abra_fleet_backend/*firebase*.json
# Should be 600 or 400

# Check firewall
sudo ufw status

# Check SSL certificate (if configured)
sudo certbot certificates
```

---

## 📦 Update Deployment

```bash
# Pull latest code
cd /var/www/abra_fleet_backend
git pull

# Install dependencies
npm install --production

# Restart
pm2 restart abra-fleet-backend

# Check logs
pm2 logs abra-fleet-backend
```

---

## 🆘 Emergency Commands

```bash
# Stop everything
pm2 stop all

# Restart everything
pm2 restart all

# View all logs
pm2 logs

# Flush logs
pm2 flush

# Restart Nginx
sudo systemctl restart nginx

# Check system resources
htop
df -h
free -m
```

---

## 📞 Support URLs

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Firebase Console**: https://console.firebase.google.com
- **PM2 Documentation**: https://pm2.keymetrics.io/docs
- **Nginx Documentation**: https://nginx.org/en/docs
- **Flutter Documentation**: https://flutter.dev/docs

---

## 🎯 Production URLs

- **API Base**: `https://your-domain.com/api`
- **Health Check**: `https://your-domain.com/api/health`
- **WebSocket**: `wss://your-domain.com/socket.io`

---

**Last Updated**: December 16, 2025
