# ABRA Fleet Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### Server Preparation
- [ ] Server provisioned (Ubuntu 20.04+, 2GB RAM minimum)
- [ ] SSH access configured
- [ ] Domain name configured (optional)
- [ ] DNS records pointing to server IP

### Accounts & Credentials
- [ ] MongoDB Atlas account accessible
- [ ] MongoDB connection string tested
- [ ] Firebase project accessible
- [ ] Firebase service account key downloaded
- [ ] Email SMTP credentials ready

### Code Preparation
- [ ] All code committed to version control
- [ ] Backend tested locally
- [ ] Flutter app tested on device
- [ ] Environment variables documented

---

## Backend Deployment

### Server Setup
- [ ] Run `setup-server.sh` or manually install:
  - [ ] Node.js 18+
  - [ ] PM2
  - [ ] Nginx
  - [ ] Git
- [ ] Firewall configured (ports 22, 80, 443)

### Code Deployment
- [ ] Backend code uploaded to `/var/www/abra_fleet_backend`
- [ ] Dependencies installed (`npm install --production`)
- [ ] `.env` file created with production values
- [ ] JWT_SECRET generated and set
- [ ] Firebase service account key uploaded
- [ ] File permissions set correctly (`.env` and Firebase key: 600)

### Application Start
- [ ] Backend started with PM2
- [ ] PM2 configuration saved
- [ ] PM2 startup configured
- [ ] Application logs checked (no errors)
- [ ] Health endpoint responding

### Nginx Configuration
- [ ] Nginx config file created
- [ ] Config file enabled (symlink created)
- [ ] Nginx configuration tested (`sudo nginx -t`)
- [ ] Nginx restarted
- [ ] API accessible through Nginx

### SSL Setup (Optional but Recommended)
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS configuration enabled
- [ ] HTTP to HTTPS redirect configured
- [ ] Certificate auto-renewal tested

### Database Configuration
- [ ] MongoDB Atlas IP whitelist updated (add server IP)
- [ ] Database connection tested from server
- [ ] Initial data seeded (if needed)

---

## Flutter App Deployment

### Configuration
- [ ] `.env` file updated with production API URL
- [ ] Firebase configuration verified
- [ ] API endpoints tested from app

### Android Build
- [ ] App cleaned (`flutter clean`)
- [ ] Dependencies updated (`flutter pub get`)
- [ ] Release APK built successfully
- [ ] App Bundle built (for Play Store)
- [ ] APK tested on physical device
- [ ] All features working with production backend

### iOS Build (if applicable)
- [ ] iOS build completed
- [ ] App signed with distribution certificate
- [ ] App tested on physical iOS device

### Distribution
- [ ] APK uploaded to distribution platform
- [ ] App Bundle uploaded to Play Store (if applicable)
- [ ] iOS app uploaded to App Store Connect (if applicable)
- [ ] Release notes prepared

---

## Post-Deployment

### Testing
- [ ] Backend health check passing
- [ ] User registration working
- [ ] User login working
- [ ] Firebase authentication working
- [ ] MongoDB data persisting
- [ ] Email notifications sending
- [ ] WebSocket connections working
- [ ] File uploads working
- [ ] All API endpoints responding correctly

### Monitoring
- [ ] PM2 monitoring active
- [ ] Nginx logs accessible
- [ ] Application logs reviewed
- [ ] Error tracking configured (optional)

### Security
- [ ] Firewall rules verified
- [ ] SSL certificate active (if configured)
- [ ] Environment variables secured
- [ ] File permissions correct
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Rate limiting active
- [ ] CORS configured properly

### Documentation
- [ ] Deployment date recorded
- [ ] Server credentials documented (securely)
- [ ] API endpoint URLs documented
- [ ] Admin access credentials documented
- [ ] Backup procedures documented

### Backup & Recovery
- [ ] MongoDB Atlas automatic backups enabled
- [ ] Manual backup tested
- [ ] Recovery procedure documented
- [ ] Code repository backed up

---

## Maintenance Tasks

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor server resources

### Weekly
- [ ] Review application logs
- [ ] Check disk space
- [ ] Verify backups

### Monthly
- [ ] Update system packages
- [ ] Review security updates
- [ ] Test backup restoration
- [ ] Review SSL certificate expiry

---

## Rollback Plan

If deployment fails:

1. **Backend Issues**
   ```bash
   pm2 stop abra-fleet-backend
   # Restore previous version
   git checkout <previous-commit>
   npm install --production
   pm2 restart abra-fleet-backend
   ```

2. **Database Issues**
   - Restore from MongoDB Atlas backup
   - Verify data integrity

3. **App Issues**
   - Revert to previous APK version
   - Notify users of temporary issues

---

## Emergency Contacts

- **Server Provider**: _________________
- **MongoDB Support**: support@mongodb.com
- **Firebase Support**: firebase.google.com/support
- **Domain Registrar**: _________________
- **Development Team**: _________________

---

## Deployment Sign-off

- **Deployed By**: _________________
- **Date**: _________________
- **Version**: _________________
- **Backend URL**: _________________
- **Status**: ☐ Success  ☐ Issues (describe below)

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
