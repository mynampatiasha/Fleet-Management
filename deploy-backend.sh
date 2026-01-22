#!/bin/bash

# ABRA Fleet Backend Deployment Script
# This script automates the backend deployment process

set -e  # Exit on error

echo "=========================================="
echo "ABRA Fleet Backend Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="abra-fleet-backend"
APP_DIR="/var/www/abra_fleet_backend"
NODE_VERSION="18"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root${NC}"
    exit 1
fi

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js $NODE_VERSION first"
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check if PM2 is installed
print_info "Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed"
    echo "Installing PM2..."
    sudo npm install -g pm2
fi
print_success "PM2 found"

# Navigate to app directory
print_info "Navigating to application directory..."
if [ ! -d "$APP_DIR" ]; then
    print_error "Directory $APP_DIR does not exist"
    exit 1
fi
cd "$APP_DIR"
print_success "In directory: $(pwd)"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    print_info "Pulling latest code from git..."
    git pull
    print_success "Code updated"
fi

# Install dependencies
print_info "Installing dependencies..."
npm install --production
print_success "Dependencies installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create .env file with required configuration"
    exit 1
fi
print_success ".env file found"

# Check if Firebase service account key exists
if ! ls abrafleet-*-firebase-adminsdk-*.json 1> /dev/null 2>&1; then
    print_error "Firebase service account key not found!"
    echo "Please upload your Firebase service account JSON file"
    exit 1
fi
print_success "Firebase service account key found"

# Stop existing PM2 process if running
print_info "Checking for existing PM2 process..."
if pm2 list | grep -q "$APP_NAME"; then
    print_info "Stopping existing process..."
    pm2 stop "$APP_NAME"
    pm2 delete "$APP_NAME"
    print_success "Existing process stopped"
fi

# Start application with PM2
print_info "Starting application with PM2..."
pm2 start index.js --name "$APP_NAME" --node-args="--max-old-space-size=2048"
print_success "Application started"

# Save PM2 configuration
print_info "Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

# Display status
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
pm2 status
echo ""
echo "View logs with: pm2 logs $APP_NAME"
echo "Monitor with: pm2 monit"
echo ""
