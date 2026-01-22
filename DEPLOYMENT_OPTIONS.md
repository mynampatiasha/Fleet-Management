# ABRA Fleet - Deployment Options

This document outlines different deployment strategies for the ABRA Fleet application.

---

## Option 1: Traditional VPS Deployment (Recommended)

**Best for**: Full control, cost-effective for long-term

### Providers
- **DigitalOcean** - $6-12/month (Droplet)
- **Linode** - $5-10/month
- **Vultr** - $6-12/month
- **AWS EC2** - $10-20/month (t3.small)
- **Google Cloud Compute Engine** - $10-20/month

### Pros
- Full control over server
- Cost-effective
- Easy to scale
- Direct SSH access

### Cons
- Requires server management
- Manual security updates
- Need to configure everything

### Setup Time
- 30-60 minutes

### See
- `DEPLOYMENT_GUIDE.md` for detailed instructions
- `setup-server.sh` for automated setup

---

## Option 2: Docker Deployment

**Best for**: Containerized deployment, easy scaling

### Requirements
- Docker installed on server
- Docker Compose

### Create Dockerfile for Backend

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000 3001

CMD ["node", "index.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./abra_fleet_backend
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    volumes:
      - ./abra_fleet_backend/.env:/app/.env
      - ./firebase-key.json:/app/firebase-key.json
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped
```

### Deploy
```bash
docker-compose up -d
docker-compose logs -f
```

### Pros
- Isolated environment
- Easy to replicate
- Simple updates
- Portable

### Cons
- Requires Docker knowledge
- Slightly more resource usage

---

## Option 3: Platform as a Service (PaaS)

**Best for**: Zero server management, quick deployment

### 3A: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create abra-fleet-backend

# Set environment variables
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1
```

**Cost**: $7-25/month
**Pros**: Zero configuration, automatic SSL, easy scaling
**Cons**: More expensive, less control

### 3B: Railway.app

1. Connect GitHub repository
2. Select `abra_fleet_backend` folder
3. Add environment variables
4. Deploy automatically

**Cost**: $5-20/month
**Pros**: Modern UI, automatic deployments, free tier available
**Cons**: Newer platform

### 3C: Render.com

1. Connect repository
2. Select Node.js environment
3. Configure environment variables
4. Deploy

**Cost**: $7-25/month
**Pros**: Easy setup, automatic SSL, good documentation
**Cons**: Limited free tier

---

## Option 4: Serverless Deployment

**Best for**: Pay-per-use, auto-scaling

### AWS Lambda + API Gateway

Requires refactoring backend to serverless functions.

**Pros**: 
- Pay only for usage
- Auto-scaling
- No server management

**Cons**:
- Requires code refactoring
- Cold start issues
- More complex setup

**Not recommended for this project** due to WebSocket requirements.

---

## Option 5: Managed Kubernetes

**Best for**: Large scale, enterprise deployment

### Providers
- Google Kubernetes Engine (GKE)
- Amazon EKS
- Azure AKS
- DigitalOcean Kubernetes

**Cost**: $50-200+/month
**Pros**: Enterprise-grade, auto-scaling, high availability
**Cons**: Overkill for small projects, expensive, complex

**Not recommended** unless you have 1000+ concurrent users.

---

## Recommended Deployment Strategy

### For Development/Testing
- **Local server** or **DigitalOcean Droplet** ($6/month)
- Manual deployment
- Single server setup

### For Production (Small Scale)
- **DigitalOcean/Linode VPS** ($12/month)
- PM2 + Nginx setup (see DEPLOYMENT_GUIDE.md)
- SSL with Let's Encrypt
- MongoDB Atlas (free tier or $9/month)

### For Production (Medium Scale)
- **Docker deployment** on VPS ($20-40/month)
- Load balancer (if needed)
- MongoDB Atlas ($25-50/month)
- CDN for static assets

### For Production (Large Scale)
- **Kubernetes cluster**
- Multiple backend instances
- Redis for caching
- MongoDB Atlas dedicated cluster
- CDN + Load balancer

---

## Cost Comparison (Monthly)

| Option | Server | Database | Total | Users Supported |
|--------|--------|----------|-------|-----------------|
| VPS Basic | $6 | Free | $6 | 10-50 |
| VPS Standard | $12 | $9 | $21 | 50-200 |
| VPS + Docker | $20 | $25 | $45 | 200-500 |
| Heroku | $25 | $9 | $34 | 100-300 |
| Railway | $20 | $9 | $29 | 100-300 |
| Kubernetes | $100+ | $50+ | $150+ | 1000+ |

---

## Flutter App Distribution Options

### Option 1: Direct APK Distribution
- Share APK file directly
- Users install manually
- **Cost**: Free
- **Best for**: Internal testing, small user base

### Option 2: Google Play Store
- Professional distribution
- Automatic updates
- **Cost**: $25 one-time fee
- **Best for**: Public release, Android users

### Option 3: Apple App Store
- iOS distribution
- Requires Mac for build
- **Cost**: $99/year
- **Best for**: iOS users

### Option 4: Firebase App Distribution
- Beta testing platform
- Easy distribution to testers
- **Cost**: Free
- **Best for**: Testing phase

### Option 5: TestFlight (iOS)
- Apple's beta testing platform
- **Cost**: Free
- **Best for**: iOS beta testing

---

## Recommended Setup for ABRA Fleet

Based on your current setup, here's the recommended deployment:

### Phase 1: Initial Launch
1. **Backend**: DigitalOcean Droplet ($12/month)
   - 2GB RAM, 1 CPU
   - Ubuntu 20.04
   - PM2 + Nginx
   - SSL with Let's Encrypt

2. **Database**: MongoDB Atlas (Free tier or $9/month)
   - Shared cluster
   - Automatic backups

3. **App Distribution**: Direct APK + Firebase App Distribution
   - Free
   - Easy updates

**Total Cost**: $12-21/month

### Phase 2: Growth (100+ users)
1. **Backend**: Upgrade to $20/month VPS
   - 4GB RAM, 2 CPU
   - Docker deployment

2. **Database**: MongoDB Atlas ($25/month)
   - Dedicated cluster

3. **App**: Google Play Store
   - Professional distribution

**Total Cost**: $45-50/month

### Phase 3: Scale (500+ users)
1. **Backend**: Multiple instances with load balancer
2. **Database**: MongoDB Atlas dedicated cluster
3. **CDN**: Cloudflare (free tier)
4. **Monitoring**: Datadog or New Relic

**Total Cost**: $100-200/month

---

## Quick Decision Guide

**Choose VPS (Option 1) if**:
- You want full control
- Budget is limited
- You're comfortable with Linux
- You need custom configurations

**Choose Docker (Option 2) if**:
- You want easy deployment
- You plan to scale
- You want environment isolation

**Choose PaaS (Option 3) if**:
- You want zero server management
- Budget allows $20-30/month
- You want automatic scaling
- You prefer simplicity over control

**Choose Kubernetes (Option 5) if**:
- You have 1000+ users
- You need high availability
- You have DevOps expertise
- Budget allows $150+/month

---

## Next Steps

1. Choose your deployment option
2. Follow the corresponding guide
3. Test thoroughly
4. Monitor performance
5. Scale as needed

For detailed instructions on VPS deployment (recommended), see `DEPLOYMENT_GUIDE.md`.

---

**Last Updated**: December 16, 2025
