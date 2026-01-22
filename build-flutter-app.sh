#!/bin/bash

# ABRA Fleet Flutter App Build Script
# This script builds the Flutter app for Android

set -e  # Exit on error

echo "=========================================="
echo "ABRA Fleet Flutter App Build"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if Flutter is installed
print_info "Checking Flutter installation..."
if ! command -v flutter &> /dev/null; then
    print_error "Flutter is not installed"
    echo "Please install Flutter first: https://flutter.dev/docs/get-started/install"
    exit 1
fi
print_success "Flutter $(flutter --version | head -n 1) found"

# Navigate to Flutter app directory
print_info "Navigating to Flutter app directory..."
cd abra_fleet
print_success "In directory: $(pwd)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create .env file with API_BASE_URL"
    exit 1
fi
print_success ".env file found"

# Clean previous builds
print_info "Cleaning previous builds..."
flutter clean
print_success "Clean complete"

# Get dependencies
print_info "Getting dependencies..."
flutter pub get
print_success "Dependencies fetched"

# Build APK
print_info "Building Android APK (release)..."
flutter build apk --release
print_success "APK build complete"

# Build App Bundle (for Play Store)
print_info "Building Android App Bundle (release)..."
flutter build appbundle --release
print_success "App Bundle build complete"

# Display output locations
echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo ""
echo "APK Location:"
echo "  $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
echo ""
echo "App Bundle Location:"
echo "  $(pwd)/build/app/outputs/bundle/release/app-release.aab"
echo ""
echo "APK Size: $(du -h build/app/outputs/flutter-apk/app-release.apk | cut -f1)"
echo ""
echo "You can now:"
echo "1. Share the APK directly with users"
echo "2. Upload the App Bundle to Google Play Store"
echo ""
