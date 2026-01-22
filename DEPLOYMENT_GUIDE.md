# ABRA Fleet - Server Deployment Guide

## Overview
This guide covers deploying the ABRA Fleet application which consists of:
- **Frontend**: Flutter mobile app (Android/iOS)
- **Backend**: Node.js/Express API server
- **Database**: MongoDB Atlas (cloud)
- **Authentication**: Firebase

---

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Minimum 2GB RAM, 2 CPU cores
- 20GB storage
- Node.js 18+ and npm
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt recommended)

### Required Accounts
- MongoDB Atlas account (already configured)
- Firebase project (already configured)
- Domain name (optional but recommended)

---

## Part 1: Backend Deployment

### Step 1: Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git (if not already installed)
sudo apt install -y git
```

### Step 2: Upload Backend Code

Option A: Using Git (Recommended)
```bash
# On your server
cd /var/www
sudo git clone <your-repository-url>
cd abra_fleet_backend
```

Option B: Using SCP/SFTP
```bash
# From your local machine
scp -r abra_fleet_backend user@your-server-ip:/var/www/
```

### Step 3: Configure Backend

```bash
cd /var/www/abra_fleet_backend

# Install dependencies
npm install --production

# Create production .env file
sudo nano .env
```

Update your `.env` file for production:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=3000
NODE_ENV=production

FIREBASE_PROJECT_ID=abrafleet-cec94

# JWT Configuration
JWT_SECRET=<GENERATE_STRONG_SECRET_HERE>
JWT_EXPIRES_IN=7d

# WebSocket Configuration
WEBSOCKET_PORT=3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=vwng vlfv immf udam
```

**IMPORTANT**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Upload Firebase Service Account Key

You need to upload your Firebase service account JSON file:

```bash
# On your local machine, find your Firebase service account key
# Usually named: abrafleet-cec94-firebase-adminsdk-xxxxx.json

# Upload to server
scp abrafleet-cec94-firebase-adminsdk-*.json user@your-server-ip:/var/www/abra_fleet_backend/

# On server, set proper permissions
cd /var/www/abra_fleet_backend
chmod 600 abrafleet-cec94-firebase-adminsdk-*.json
```

### Step 5: Start Backend with PM2

```bash
cd /var/www/abra_fleet_backend

# Start the application
pm2 start index.js --name abra-fleet-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs abra-fleet-backend
```

### Step 6: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/abra-fleet
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # WebSocket endpoint
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/abra-fleet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Step 8: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## Part 2: Flutter App Deployment

### Step 1: Update API Endpoint

Update the backend URL in your Flutter app:

```bash
# Edit the .env file in abra_fleet folder
cd abra_fleet
nano .env
```

Update with your server URL:
```env
API_BASE_URL=https://your-domain.com/api
# or
API_BASE_URL=http://your-server-ip/api
```

### Step 2: Build Android APK

```bash
cd abra_fleet

# Clean previous builds
flutter clean
flutter pub get

# Build release APK
flutter build apk --release

# Or build App Bundle for Play Store
flutter build appbundle --release
```

The APK will be at: `build/app/outputs/flutter-apk/app-release.apk`

### Step 3: Build iOS App (Mac only)

```bash
cd abra_fleet

# Clean previous builds
flutter clean
flutter pub get

# Build iOS
flutter build ios --release

# Open in Xcode for signing and distribution
open ios/Runner.xcworkspace
```

### Step 4: Distribute the App

**Option A: Direct Distribution**
- Share the APK file directly with users
- Users need to enable "Install from Unknown Sources"

**Option B: Google Play Store**
- Upload the App Bundle to Google Play Console
- Follow Play Store submission guidelines

**Option C: Apple App Store**
- Use Xcode to archive and upload to App Store Connect
- Follow App Store submission guidelines

---

## Part 3: Post-Deployment

### Monitor Backend

```bash
# View logs
pm2 logs abra-fleet-backend

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart abra-fleet-backend

# Stop
pm2 stop abra-fleet-backend
```

### Update Backend Code

```bash
cd /var/www/abra_fleet_backend

# Pull latest changes
git pull

# Install new dependencies
npm install --production

# Restart
pm2 restart abra-fleet-backend
```

### Database Backup

```bash
# MongoDB Atlas has automatic backups
# You can also create manual backups from Atlas dashboard
```

### Health Check Endpoints

Test your deployment:
```bash
# Check backend health
curl http://your-domain.com/api/health

# Check specific endpoints
curl http://your-domain.com/api/vehicles
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs abra-fleet-backend --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Check environment variables
pm2 env 0
```

### MongoDB connection issues
- Verify MongoDB Atlas IP whitelist includes your server IP
- Check connection string in .env
- Test connection: `node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"`

### Firebase authentication issues
- Verify service account key is uploaded
- Check file permissions (should be 600)
- Verify FIREBASE_PROJECT_ID matches your project

### Nginx errors
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### App can't connect to backend
- Verify API_BASE_URL in Flutter .env
- Check firewall rules on server
- Test API endpoint from browser
- Check CORS settings in backend

---

## Security Checklist

- [ ] Change default JWT_SECRET to strong random value
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall (UFW)
- [ ] Set proper file permissions (especially .env and Firebase key)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use strong passwords for all services
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Monitor PM2 logs for suspicious activity
- [ ] Setup automated backups
- [ ] Configure rate limiting (already in code)

---

## Quick Commands Reference

```bash
# Backend Management
pm2 start index.js --name abra-fleet-backend
pm2 restart abra-fleet-backend
pm2 stop abra-fleet-backend
pm2 logs abra-fleet-backend
pm2 monit

# Nginx Management
sudo systemctl restart nginx
sudo systemctl status nginx
sudo nginx -t

# View Logs
pm2 logs abra-fleet-backend --lines 100
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Flutter Build
flutter build apk --release
flutter build appbundle --release
flutter build ios --release
```

---

## Support

For issues or questions:
1. Check PM2 logs: `pm2 logs abra-fleet-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Test API endpoints manually with curl or Postman

---

**Deployment Date**: December 16, 2025
**Version**: 1.0.0
