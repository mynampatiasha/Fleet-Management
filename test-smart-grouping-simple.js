// test-smart-grouping-simple.js
// Simple test to check smart grouping issue

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSmartGroupingSimple() {
  try {
    console.log('🔍 Testing Smart Grouping (Simple)...\n');
    
    // Try to call the smart grouping endpoint directly
    console.log('📞 Calling smart grouping endpoint...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/roster/admin/group-similar`,
        {},
        {
          timeout: 30000,
          validateStatus: function (status) {
            return status < 500; // Accept any status less than 500
          }
        }
      );
      
      console.log(`📊 Response Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('🔐 Authentication required - this is expected');
        console.log('   The endpoint requires admin authentication');
        
        // Let's check the backend logs instead
        console.log('\n💡 SOLUTION: Check the backend console logs');
        console.log('   When you click "Smart Grouping" in the UI, check the backend console');
        console.log('   The logs will show exactly why there are 47 groups');
        
        console.log('\n🔍 LIKELY ROOT CAUSES:');
        console.log('   1. Each employee has a different email domain (company)');
        console.log('   2. Each employee has a different office location');
        console.log('   3. Each employee has different time schedules');
        console.log('   4. Each employee has different roster types (login/logout/both)');
        console.log('   5. Each employee has different weekday patterns');
        
        console.log('\n📋 GROUPING LOGIC EXPLANATION:');
        console.log('   The smart grouping creates a unique group for each combination of:');
        console.log('   - Email domain (e.g., @wipro.com, @infosys.com)');
        console.log('   - Office location (e.g., "Koramangala", "Whitefield")');
        console.log('   - Login time (e.g., "08:00", "09:00")');
        console.log('   - Logout time (e.g., "17:00", "18:00")');
        console.log('   - Roster type (e.g., "login", "logout", "both")');
        console.log('   - Weekdays (e.g., "Mon,Tue,Wed,Thu,Fri")');
        
        console.log('\n🔧 HOW TO FIX:');
        console.log('   If you want fewer groups, you need to:');
        console.log('   1. Standardize office locations (use exact same spelling)');
        console.log('   2. Standardize time schedules (use same times for same shifts)');
        console.log('   3. Group by location only (ignore company differences)');
        console.log('   4. Use time ranges instead of exact times');
        
        console.log('\n🎯 IMMEDIATE ACTION:');
        console.log('   1. Click "Smart Grouping" in the UI');
        console.log('   2. Watch the backend console (where you ran "node index.js")');
        console.log('   3. Look for the detailed grouping logs');
        console.log('   4. Identify which criteria are causing the splits');
        
      } else if (response.data) {
        console.log('✅ Got response:', JSON.stringify(response.data, null, 2));
      } else {
        console.log('❌ Unexpected response format');
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend server is not running!');
        console.log('   Start the backend with: cd abra_fleet_backend && node index.js');
      } else if (error.code === 'ECONNABORTED') {
        console.log('❌ Request timed out');
        console.log('   The smart grouping is taking too long (>30 seconds)');
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY: Smart Grouping Issue Analysis');
    console.log('='.repeat(80));
    console.log('PROBLEM: 47 groups for 29 rosters means each roster is almost in its own group');
    console.log('');
    console.log('MOST LIKELY CAUSE:');
    console.log('• Each employee has different email domains (different companies)');
    console.log('• OR each employee has different office locations');
    console.log('• OR each employee has different time schedules');
    console.log('');
    console.log('SOLUTION OPTIONS:');
    console.log('1. STANDARDIZE DATA:');
    console.log('   • Use same office location names (exact spelling)');
    console.log('   • Use same time schedules for same shifts');
    console.log('');
    console.log('2. MODIFY GROUPING LOGIC:');
    console.log('   • Group by location only (ignore company)');
    console.log('   • Use time ranges (8:00-8:30 AM) instead of exact times');
    console.log('   • Allow ±15 minute time tolerance');
    console.log('');
    console.log('3. MANUAL GROUPING:');
    console.log('   • Allow admins to manually group employees');
    console.log('   • Override automatic grouping when needed');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testSmartGroupingSimple();