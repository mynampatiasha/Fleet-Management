#!/bin/bash

# ABRA Fleet - cPanel Deployment Script
# Server: 103.185.75.245
# User: royaldxd

echo "=========================================="
echo "ABRA Fleet - cPanel Deployment Script"
echo "=========================================="
echo ""

# Configuration
SERVER_IP="103.185.75.245"
SERVER_USER="royaldxd"
REMOTE_PATH="/home/royaldxd/public_html/fleet-management"
BACKEND_PATH="./abra_fleet_backend"
FLUTTER_PATH="./abra_fleet"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if SSH is available
echo "Checking SSH connection..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} exit 2>/dev/null; then
    print_success "SSH connection successful"
else
    print_error "SSH connection failed. Please check your credentials."
    echo ""
    echo "To setup SSH key authentication:"
    echo "1. Generate SSH key: ssh-keygen -t rsa"
    echo "2. Copy to server: ssh-copy-id ${SERVER_USER}@${SERVER_IP}"
    echo ""
    echo "Or use password authentication when prompted."
    exit 1
fi

# Create remote directories
echo ""
echo "Creating remote directories..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_PATH}/backend ${REMOTE_PATH}/web ${REMOTE_PATH}/downloads"
print_success "Directories created"

# Upload backend files
echo ""
echo "Uploading backend files..."
if [ -d "$BACKEND_PATH" ]; then
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '*.log' \
        --exclude 'test-*.js' \
        --exclude 'check-*.js' \
        --exclude 'fix-*.js' \
        --exclude 'setup-*.js' \
        --exclude 'verify-*.js' \
        ${BACKEND_PATH}/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/
    print_success "Backend files uploaded"
else
    print_error "Backend directory not found: $BACKEND_PATH"
    exit 1
fi

# Upload .htaccess
echo ""
echo "Uploading .htaccess configuration..."
if [ -f ".htaccess.cpanel" ]; then
    scp .htaccess.cpanel ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/.htaccess
    print_success ".htaccess uploaded"
else
    print_error ".htaccess.cpanel file not found"
fi

# Upload environment template
echo ""
echo "Uploading environment template..."
if [ -f ".env.cpanel.template" ]; then
    scp .env.cpanel.template ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/.env.template
    print_success "Environment template uploaded"
else
    print_error ".env.cpanel.template file not found"
fi

# Check for Firebase key
echo ""
echo "Checking for Firebase service account key..."
FIREBASE_KEY=$(find . -maxdepth 2 -name "abrafleet-*-firebase-adminsdk-*.json" | head -n 1)
if [ -n "$FIREBASE_KEY" ]; then
    print_info "Found Firebase key: $FIREBASE_KEY"
    read -p "Upload Firebase key? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        scp "$FIREBASE_KEY" ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/
        ssh ${SERVER_USER}@${SERVER_IP} "chmod 600 ${REMOTE_PATH}/backend/abrafleet-*.json"
        print_success "Firebase key uploaded and secured"
    fi
else
    print_error "Firebase service account key not found"
    echo "Please upload it manually to: ${REMOTE_PATH}/backend/"
fi

# Install dependencies
echo ""
echo "Installing Node.js dependencies..."
print_info "This may take a few minutes..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/royaldxd/public_html/fleet-management/backend
source /home/royaldxd/nodevenv/public_html/fleet-management/backend/18/bin/activate 2>/dev/null || echo "Node.js environment not found. Please setup Node.js app in cPanel first."
npm install --production
ENDSSH
print_success "Dependencies installed"

# Generate JWT secret
echo ""
echo "Generating JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
print_success "JWT secret generated"
echo ""
echo "Your JWT secret (save this securely):"
echo "======================================"
echo "$JWT_SECRET"
echo "======================================"
echo ""

# Create .env file
echo ""
read -p "Create .env file on server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${REMOTE_PATH}/backend
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=abrafleet-cec94
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
WEBSOCKET_PORT=3001
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hostelmatrix19@gmail.com
SMTP_PASSWORD=vwng vlfv immf udam
EOF
chmod 600 .env
ENDSSH
    print_success ".env file created on server"
fi

# Summary
echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
print_success "Backend files uploaded"
print_success ".htaccess configuration uploaded"
print_success "Dependencies installed"
print_success "JWT secret generated"
echo ""
echo "Next Steps:"
echo "1. Login to cPanel: https://${SERVER_IP}:2083"
echo "2. Go to 'Setup Node.js App'"
echo "3. Create/Restart your application"
echo "4. Add server IP to MongoDB Atlas whitelist: ${SERVER_IP}"
echo "5. Test API: http://${SERVER_IP}/fleet-management/api/health"
echo ""
echo "Build Flutter app:"
echo "1. Update abra_fleet/.env with production URL"
echo "2. Run: cd ${FLUTTER_PATH} && flutter build apk --release"
echo "3. APK location: ${FLUTTER_PATH}/build/app/outputs/flutter-apk/app-release.apk"
echo ""
echo "=========================================="
print_success "Deployment script completed!"
echo "=========================================="
