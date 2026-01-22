# 🏗️ ABRA Fleet Management - Deployment Architecture

## 🌐 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                    USERS / CLIENTS                                    │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Admin   │  │  Client  │  │  Driver  │  │ Customer │           │
│  │  Portal  │  │  Portal  │  │   App    │  │   App    │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │             │              │              │                  │
└───────┼─────────────┼──────────────┼──────────────┼──────────────────┘
        │             │              │              │
        └─────────────┴──────────────┴──────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│              DOMAIN: abra-fleet-management.com                        │
│                   (SSL/HTTPS Enabled)                                 │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│              cPanel Server (103.185.75.245)                          │
│              User: royaldxd                                           │
│              Home: /home/royaldxd                                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /public_html/abra-fleet-management/                         │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  .htaccess (Apache Configuration)                     │   │   │
│  │  │  - URL Rewriting                                      │   │   │
│  │  │  - CORS Headers                                       │   │   │
│  │  │  - Security Headers                                   │   │   │
│  │  │  - Proxy Rules                                        │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  backend/ (Node.js Application)                       │   │   │
│  │  │                                                        │   │   │
│  │  │  ├── index.js (Entry Point)                           │   │   │
│  │  │  ├── .env (Environment Variables)                     │   │   │
│  │  │  ├── routes/ (API Endpoints)                          │   │   │
│  │  │  ├── services/ (Business Logic)                       │   │   │
│  │  │  ├── middleware/ (Auth, CORS, etc.)                   │   │   │
│  │  │  ├── node_modules/ (Dependencies)                     │   │   │
│  │  │  └── abrafleet-firebase-key.json                      │   │   │
│  │  │                                                        │   │   │
│  │  │  Port: 3000 (Internal)                                │   │   │
│  │  │  Proxied via: /api/* → localhost:3000                 │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  web/ (Flutter Web Build)                             │   │   │
│  │  │                                                        │   │   │
│  │  │  ├── index.html                                       │   │   │
│  │  │  ├── main.dart.js                                     │   │   │
│  │  │  ├── flutter.js                                       │   │   │
│  │  │  ├── assets/                                          │   │   │
│  │  │  └── canvaskit/                                       │   │   │
│  │  │                                                        │   │   │
│  │  │  Access: /web/* → Static Files                        │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  downloads/ (APK Distribution)                        │   │   │
│  │  │                                                        │   │   │
│  │  │  └── app-release.apk                                  │   │   │
│  │  │                                                        │   │   │
│  │  │  Access: /downloads/app-release.apk                   │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                    EXTERNAL SERVICES                                  │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  MongoDB Atlas   │  │  Firebase Auth   │  │  Gmail SMTP      │  │
│  │                  │  │                  │  │                  │  │
│  │  Database:       │  │  Authentication  │  │  Email Service   │  │
│  │  abra_fleet      │  │  User Management │  │  Notifications   │  │
│  │                  │  │  Token Verify    │  │  Password Reset  │  │
│  │  Collections:    │  │                  │  │                  │  │
│  │  - users         │  │  Project:        │  │  Host:           │  │
│  │  - vehicles      │  │  abrafleet-cec94 │  │  smtp.gmail.com  │  │
│  │  - drivers       │  │                  │  │  Port: 587       │  │
│  │  - rosters       │  │                  │  │                  │  │
│  │  - trips         │  │                  │  │                  │  │
│  │  - notifications │  │                  │  │                  │  │
│  │                  │  │                  │  │                  │  │
│  │  IP Whitelist:   │  │                  │  │                  │  │
│  │  103.185.75.245  │  │                  │  │                  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### Web Application Request Flow

```
User Browser
    │
    │ HTTPS Request
    │ https://abra-fleet-management.com/web/
    ↓
Domain DNS
    │
    │ Resolves to
    │ 103.185.75.245
    ↓
cPanel Server
    │
    │ Apache Web Server
    │ Reads .htaccess
    ↓
Static Files
    │
    │ Serves Flutter Web Build
    │ /public_html/abra-fleet-management/web/
    ↓
User Browser
    │
    │ Loads Flutter App
    │ Executes JavaScript
    ↓
API Calls
    │
    │ HTTPS Request
    │ https://abra-fleet-management.com/api/login
    ↓
.htaccess Proxy
    │
    │ Rewrites URL
    │ /api/* → http://localhost:3000/*
    ↓
Node.js Backend
    │
    │ Express Server (Port 3000)
    │ Processes Request
    ↓
Authentication
    │
    │ Verifies JWT Token
    │ Checks Firebase Auth
    ↓
Database Query
    │
    │ MongoDB Atlas
    │ Fetch/Update Data
    ↓
Response
    │
    │ JSON Response
    │ Back through proxy
    ↓
User Browser
    │
    │ Updates UI
    │ Displays Data
    ↓
User sees result
```

---

## 📱 Mobile App Request Flow

```
Android Device
    │
    │ App Launch
    │ Reads .env config
    ↓
API Configuration
    │
    │ API_BASE_URL=https://abra-fleet-management.com/api
    │ WEBSOCKET_URL=wss://abra-fleet-management.com
    ↓
Login Request
    │
    │ HTTPS POST
    │ /api/auth/login
    ↓
Internet
    │
    │ Mobile Network / WiFi
    ↓
Domain DNS
    │
    │ Resolves to
    │ 103.185.75.245
    ↓
cPanel Server
    │
    │ .htaccess Proxy
    │ /api/* → localhost:3000
    ↓
Node.js Backend
    │
    │ Express Server
    │ Validates Credentials
    ↓
Firebase Auth
    │
    │ Verify User
    │ Generate Token
    ↓
MongoDB Atlas
    │
    │ Fetch User Data
    │ Get Permissions
    ↓
Response
    │
    │ JSON + JWT Token
    │ User Profile Data
    ↓
Android Device
    │
    │ Store Token
    │ Navigate to Dashboard
    ↓
Subsequent Requests
    │
    │ Include JWT in Headers
    │ Authorization: Bearer <token>
    ↓
Backend validates token
    │
    │ Processes request
    │ Returns data
    ↓
App updates UI
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
│ (Web/Mobile)│
└──────┬──────┘
       │
       │ 1. Login Request
       │ POST /api/auth/login
       │ { email, password }
       ↓
┌──────────────────┐
│  Node.js Backend │
└──────┬───────────┘
       │
       │ 2. Verify Credentials
       ↓
┌──────────────────┐
│  Firebase Auth   │
└──────┬───────────┘
       │
       │ 3. Validate User
       │ Return Firebase UID
       ↓
┌──────────────────┐
│  MongoDB Atlas   │
└──────┬───────────┘
       │
       │ 4. Fetch User Profile
       │ Get Role & Permissions
       ↓
┌──────────────────┐
│  Node.js Backend │
└──────┬───────────┘
       │
       │ 5. Generate JWT Token
       │ Sign with JWT_SECRET
       ↓
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 6. Store Token
       │ Use in subsequent requests
       ↓
┌──────────────────┐
│  Protected Route │
└──────┬───────────┘
       │
       │ 7. Verify JWT
       │ Check expiration
       │ Validate signature
       ↓
┌──────────────────┐
│  Process Request │
└──────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  FLUTTER APPLICATION                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   UI     │→ │ Provider │→ │ Service  │→ │   API    │   │
│  │  Layer   │  │  State   │  │  Layer   │  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  NODE.JS BACKEND                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │→ │Middleware│→ │Controller│→ │ Service  │   │
│  │  /api/*  │  │Auth/CORS │  │ Business │  │  Logic   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA PERSISTENCE                            │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  MongoDB Atlas   │         │  Firebase Auth   │         │
│  │                  │         │                  │         │
│  │  - Users         │         │  - User Tokens   │         │
│  │  - Vehicles      │         │  - Auth State    │         │
│  │  - Drivers       │         │  - Sessions      │         │
│  │  - Rosters       │         │                  │         │
│  │  - Trips         │         │                  │         │
│  │  - Notifications │         │                  │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌍 Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DNS LAYER                                 │
│                                                              │
│  abra-fleet-management.com → 103.185.75.245                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SSL/TLS LAYER                             │
│                                                              │
│  Let's Encrypt Certificate (AutoSSL)                         │
│  HTTPS Encryption                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    WEB SERVER (Apache)                       │
│                                                              │
│  Port 80 (HTTP) → Redirect to 443                           │
│  Port 443 (HTTPS) → Process Requests                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    .htaccess ROUTING                         │
│                                                              │
│  /web/*      → Static Files (Flutter Web)                   │
│  /api/*      → Proxy to localhost:3000 (Node.js)            │
│  /downloads/* → Static Files (APK)                           │
│  WebSocket   → Proxy to localhost:3001                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Node.js App     │         │  Static Files    │         │
│  │  Port: 3000      │         │  Flutter Web     │         │
│  │  (Internal)      │         │  APK Downloads   │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Deployment Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: PREPARE LOCAL ENVIRONMENT                          │
│  ├── Install Node.js, Flutter, Git                          │
│  ├── Clone repository                                        │
│  ├── Test locally                                            │
│  └── Prepare Firebase service account key                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: UPLOAD BACKEND FILES                               │
│  ├── Connect via SFTP (FileZilla/WinSCP)                    │
│  ├── Upload abra_fleet_backend folder                       │
│  ├── Upload Firebase service account key                     │
│  └── Verify all files uploaded                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: CONFIGURE cPANEL                                   │
│  ├── Login to cPanel (https://103.185.75.245:2083)         │
│  ├── Setup Node.js App                                      │
│  ├── Configure application settings                          │
│  └── Note virtual environment command                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: INSTALL DEPENDENCIES                               │
│  ├── Open cPanel Terminal                                   │
│  ├── Enter Node.js virtual environment                      │
│  ├── Run: npm install --production                          │
│  └── Verify installation success                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: CONFIGURE ENVIRONMENT                              │
│  ├── Create .env file in backend folder                     │
│  ├── Generate JWT secret                                    │
│  ├── Add MongoDB connection string                          │
│  ├── Configure Firebase project ID                          │
│  └── Add email SMTP settings                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: CONFIGURE EXTERNAL SERVICES                        │
│  ├── MongoDB Atlas: Add IP whitelist (103.185.75.245)      │
│  ├── Firebase: Verify project settings                      │
│  └── Gmail: Verify SMTP credentials                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: CREATE .htaccess                                   │
│  ├── Create .htaccess in abra-fleet-management folder       │
│  ├── Add rewrite rules for /api/*                           │
│  ├── Add CORS headers                                        │
│  └── Add security headers                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: START BACKEND                                      │
│  ├── Go to Setup Node.js App in cPanel                      │
│  ├── Click "Start App"                                      │
│  ├── Verify status: "Running"                               │
│  └── Check application logs                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: TEST BACKEND                                       │
│  ├── Visit: /api/health                                     │
│  ├── Verify response: {"status":"ok"}                       │
│  ├── Test login endpoint                                    │
│  └── Check for errors                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: BUILD & DEPLOY FLUTTER WEB                        │
│  ├── Update .env with production URLs                       │
│  ├── Run: flutter build web --release                       │
│  ├── Upload build/web folder to server                      │
│  └── Test web app access                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 11: BUILD MOBILE APP                                  │
│  ├── Update .env with production URLs                       │
│  ├── Run: flutter build apk --release                       │
│  ├── Test APK on device                                     │
│  └── Distribute to users                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 12: ENABLE SSL/HTTPS                                  │
│  ├── Login to cPanel                                        │
│  ├── Go to SSL/TLS Status                                   │
│  ├── Run AutoSSL for domain                                 │
│  └── Verify HTTPS works                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 13: FINAL TESTING                                     │
│  ├── Test all features end-to-end                           │
│  ├── Verify authentication works                            │
│  ├── Check database operations                              │
│  ├── Test email notifications                               │
│  └── Monitor logs for errors                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ DEPLOYMENT COMPLETE                                     │
│  Application is live at:                                    │
│  https://abra-fleet-management.com/                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure on Server

```
/home/royaldxd/
│
├── public_html/
│   │
│   └── abra-fleet-management/
│       │
│       ├── .htaccess                    # Apache configuration
│       │
│       ├── backend/                     # Node.js application
│       │   ├── index.js                 # Entry point
│       │   ├── package.json             # Dependencies
│       │   ├── .env                     # Environment variables
│       │   ├── abrafleet-firebase.json  # Firebase key
│       │   ├── node_modules/            # Installed packages
│       │   ├── routes/                  # API routes
│       │   ├── services/                # Business logic
│       │   ├── middleware/              # Auth, CORS, etc.
│       │   └── models/                  # Data models
│       │
│       ├── web/                         # Flutter web build
│       │   ├── index.html               # Entry HTML
│       │   ├── main.dart.js             # Compiled Dart
│       │   ├── flutter.js               # Flutter runtime
│       │   ├── assets/                  # Images, fonts
│       │   └── canvaskit/               # Rendering engine
│       │
│       └── downloads/                   # APK distribution
│           └── app-release.apk          # Android app
│
├── nodevenv/                            # Node.js virtual env
│   └── public_html/
│       └── abra-fleet-management/
│           └── backend/
│               └── 18/                  # Node.js v18
│                   └── bin/
│                       └── activate     # Activation script
│
└── logs/                                # Application logs
    ├── abra-fleet-management-error.log
    └── abra-fleet-management-access.log
```

---

## 🔄 Update & Maintenance Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CODE CHANGES (Local Development)                           │
│  ├── Make changes to code                                   │
│  ├── Test locally                                           │
│  ├── Commit to Git                                          │
│  └── Push to repository                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BACKEND UPDATE                                             │
│  ├── SSH into server                                        │
│  ├── Navigate to backend folder                             │
│  ├── Pull latest changes (git pull)                         │
│  ├── Install new dependencies (npm install)                 │
│  └── Restart application in cPanel                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND UPDATE                                            │
│  ├── Build Flutter web locally                              │
│  ├── Upload new build/web folder                            │
│  └── Clear browser cache and test                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MOBILE APP UPDATE                                          │
│  ├── Build new APK                                          │
│  ├── Test on device                                         │
│  ├── Upload to server/distribute                            │
│  └── Notify users of update                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  VERIFICATION                                               │
│  ├── Test all updated features                              │
│  ├── Check logs for errors                                  │
│  ├── Monitor performance                                    │
│  └── Gather user feedback                                   │
└─────────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: December 17, 2025
**Domain**: abra-fleet-management.com
