// Test script for Admin Dashboard Detailed APIs
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminDashboardAPIs() {
  console.log('🚀 Testing Admin Dashboard Detailed APIs...\n');

  try {
    // Test 1: Active Trips
    console.log('1️⃣ Testing Active Trips API...');
    const activeTripsResponse = await axios.get(`${BASE_URL}/api/admin/analytics/trips/active`);
    console.log('✅ Active Trips Response:', {
      success: activeTripsResponse.data.success,
      count: activeTripsResponse.data.count,
      sampleTrip: activeTripsResponse.data.trips[0] || 'No active trips'
    });

    // Test 2: Completed Trips Today
    console.log('\n2️⃣ Testing Completed Trips Today API...');
    const completedTripsResponse = await axios.get(`${BASE_URL}/api/admin/analytics/trips/completed-today`);
    console.log('✅ Completed Trips Today Response:', {
      success: completedTripsResponse.data.success,
      count: completedTripsResponse.data.count,
      sampleTrip: completedTripsResponse.data.trips[0] || 'No completed trips today'
    });

    // Test 3: Cancelled Trips Today
    console.log('\n3️⃣ Testing Cancelled Trips Today API...');
    const cancelledTripsResponse = await axios.get(`${BASE_URL}/api/admin/analytics/trips/cancelled-today`);
    console.log('✅ Cancelled Trips Today Response:', {
      success: cancelledTripsResponse.data.success,
      count: cancelledTripsResponse.data.count,
      sampleTrip: cancelledTripsResponse.data.trips[0] || 'No cancelled trips today'
    });

    // Test 4: Average Driver Rating
    console.log('\n4️⃣ Testing Average Driver Rating API...');
    const averageRatingResponse = await axios.get(`${BASE_URL}/api/admin/analytics/ratings/average`);
    console.log('✅ Average Rating Response:', {
      success: averageRatingResponse.data.success,
      averageRating: averageRatingResponse.data.averageRating,
      totalRatings: averageRatingResponse.data.totalRatings
    });

    // Test 5: Ratings Overview
    console.log('\n5️⃣ Testing Ratings Overview API...');
    const ratingsOverviewResponse = await axios.get(`${BASE_URL}/api/admin/analytics/ratings/overview`);
    console.log('✅ Ratings Overview Response:', {
      success: ratingsOverviewResponse.data.success,
      averageRating: ratingsOverviewResponse.data.ratingsData.averageRating,
      totalRatings: ratingsOverviewResponse.data.ratingsData.totalRatings,
      topDriversCount: ratingsOverviewResponse.data.ratingsData.topDrivers.length,
      distribution: ratingsOverviewResponse.data.ratingsData.distribution
    });

    // Test 6: Today Revenue Details
    console.log('\n6️⃣ Testing Today Revenue Details API...');
    const todayRevenueResponse = await axios.get(`${BASE_URL}/api/admin/analytics/revenue/details?type=today`);
    console.log('✅ Today Revenue Details Response:', {
      success: todayRevenueResponse.data.success,
      totalRevenue: todayRevenueResponse.data.revenueData.totalRevenue,
      totalTrips: todayRevenueResponse.data.revenueData.totalTrips,
      breakdownCount: todayRevenueResponse.data.revenueData.breakdown.length
    });

    // Test 7: Week Revenue Details
    console.log('\n7️⃣ Testing Week Revenue Details API...');
    const weekRevenueResponse = await axios.get(`${BASE_URL}/api/admin/analytics/revenue/details?type=week`);
    console.log('✅ Week Revenue Details Response:', {
      success: weekRevenueResponse.data.success,
      totalRevenue: weekRevenueResponse.data.revenueData.totalRevenue,
      totalTrips: weekRevenueResponse.data.revenueData.totalTrips,
      breakdownCount: weekRevenueResponse.data.revenueData.breakdown.length
    });

    // Test 8: Month Revenue Details
    console.log('\n8️⃣ Testing Month Revenue Details API...');
    const monthRevenueResponse = await axios.get(`${BASE_URL}/api/admin/analytics/revenue/details?type=month`);
    console.log('✅ Month Revenue Details Response:', {
      success: monthRevenueResponse.data.success,
      totalRevenue: monthRevenueResponse.data.revenueData.totalRevenue,
      totalTrips: monthRevenueResponse.data.revenueData.totalTrips,
      breakdownCount: monthRevenueResponse.data.revenueData.breakdown.length
    });

    console.log('\n🎉 All Admin Dashboard Detailed APIs tested successfully!');

  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
  }
}

// Run the test
testAdminDashboardAPIs();