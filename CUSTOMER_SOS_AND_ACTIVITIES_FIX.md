# Customer Dashboard SOS Alerts and Activities Fix

## Issues Found

### 1. SOS Alerts Not Showing
**Problem**: The Flutter customer dashboard is calling the wrong endpoint for SOS history.
- **Current call**: `GET /api/sos/customer/$_userId`
- **Actual endpoint**: `GET /api/sos/history/$userId`

### 2. Activity Screen Not Showing Data
**Problem**: There's no "recent activities" endpoint or implementation for customers. The customer stats dashboard endpoint exists but doesn't include recent activities.

## Solutions

### Fix 1: Update SOS Endpoint Call in Flutter
Change the endpoint from `/api/sos/customer/$_userId` to `/api/sos/history/$_userId`

**File**: `abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart`
**Line**: ~638

### Fix 2: Add Recent Activities to Customer Stats
We need to either:
1. Add a recent activities section to the customer stats dashboard endpoint, OR
2. Create a separate recent activities endpoint for customers

The admin dashboard has recent activities, so we should implement similar functionality for customers.

## Implementation Steps

1. Update the SOS API call in customer dashboard
2. Add recent activities to customer stats router
3. Update customer dashboard to display recent activities

## Files to Modify

1. `abra_fleet/lib/features/customer/dashboard/presentation/screens/customer_dashboard.dart` - Fix SOS endpoint
2. `abra_fleet_backend/routes/customer_stats_router.js` - Add recent activities endpoint
3. `abra_fleet/lib/features/customer/dashboard/data/services/customer_stats_service.dart` - Add recent activities method

---
**Status**: Ready to implement
**Date**: January 19, 2026
