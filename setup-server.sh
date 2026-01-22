#!/bin/bash

# ABRA Fleet Server Setup Script
# This script sets up a fresh Ubuntu server for ABRA Fleet deployment

set -e  # Exit on error

echo "=========================================="
echo "ABRA Fleet Server Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Update system
print_info "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Install Node.js 18.x
print_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
print_success "Node.js $(node -v) installed"

# Install PM2
print_info "Installing PM2..."
npm install -g pm2
print_success "PM2 installed"

# Install Nginx
print_info "Installing Nginx..."
apt install -y nginx
print_success "Nginx installed"

# Install Git
print_info "Installing Git..."
apt install -y git
print_success "Git installed"

# Install other utilities
print_info "Installing utilities..."
apt install -y curl wget unzip
print_success "Utilities installed"

# Create application directory
print_info "Creating application directory..."
mkdir -p /var/www
print_success "Directory created: /var/www"

# Configure firewall
print_info "Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
print_success "Firewall configured"

# Setup PM2 startup
print_info "Configuring PM2 startup..."
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
print_success "PM2 startup configured"

echo ""
echo "=========================================="
echo "Server Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Upload your backend code to /var/www/abra_fleet_backend"
echo "2. Configure Nginx (see DEPLOYMENT_GUIDE.md)"
echo "3. Run deploy-backend.sh to start the application"
echo ""
