// debug-driver-notification-issue.js - Debug why driver notifications aren't working

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugDriverNotificationIssue() {
    console.log('\n🔍 DEBUGGING DRIVER NOTIFICATION ISSUE');
    console.log('='.repeat(80));
    
    try {
        // Step 1: Check backend health
        console.log('\n🏥 Step 1: Checking backend health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Backend is healthy:', healthResponse.data.message);
        
        // Step 2: Check recent notifications in the system
        console.log('\n🔔 Step 2: Checking recent notifications...');
        
        try {
            // Try to get notifications without auth first to see the endpoint structure
            const notificationsResponse = await axios.get(`${BASE_URL}/api/notifications?limit=10`);
            console.log('📱 Notifications API Response:');
            console.log('   Status:', notificationsResponse.status);
            console.log('   Data:', JSON.stringify(notificationsResponse.data, null, 2));
        } catch (notifError) {
            console.log('⚠️  Notifications endpoint requires auth (expected)');
            console.log('   Error:', notifError.response?.status, notifError.response?.data?.message);
        }
        
        // Step 3: Check feedback endpoints
        console.log('\n📝 Step 3: Checking feedback system...');
        
        try {
            const feedbackResponse = await axios.get(`${BASE_URL}/api/feedback/health`);
            console.log('✅ Feedback system accessible');
        } catch (feedbackError) {
            console.log('⚠️  Feedback endpoint requires auth (expected)');
        }
        
        // Step 4: Check if there are any recent driver feedback entries
        console.log('\n👤 Step 4: Checking for recent driver feedback...');
        
        // We'll need to check the database directly or use a test endpoint
        // Let's try to access the feedback router with a test call
        
        // Step 5: Test notification creation directly
        console.log('\n🧪 Step 5: Testing notification system architecture...');
        
        console.log('\n📋 NOTIFICATION SYSTEM ANALYSIS:');
        console.log('─'.repeat(50));
        
        console.log('\n🔧 BACKEND NOTIFICATION FLOW:');
        console.log('1. Admin submits reply via /api/feedback/admin/reply');
        console.log('2. Backend looks up driver Firebase UID by email');
        console.log('3. Creates notification with type "feedback_reply"');
        console.log('4. Stores in MongoDB notifications collection');
        console.log('5. Sends push notification via FCM');
        
        console.log('\n📱 FRONTEND NOTIFICATION FLOW:');
        console.log('1. Driver app calls /api/notifications?page=1&limit=50');
        console.log('2. Filters for driver notification types');
        console.log('3. Displays in driver notifications screen');
        
        console.log('\n🔍 POTENTIAL ISSUES:');
        console.log('• Driver email not found in drivers collection');
        console.log('• Driver Firebase UID not set correctly');
        console.log('• Notification not being created in MongoDB');
        console.log('• Driver notification screen not filtering correctly');
        console.log('• Authentication issues with notification API');
        
        // Step 6: Check notification service configuration
        console.log('\n⚙️  Step 6: Notification Service Configuration Check...');
        
        console.log('\n📊 DRIVER NOTIFICATION TYPES SUPPORTED:');
        const driverNotificationTypes = [
            'route_assigned',
            'roster_assigned', 
            'trip_cancelled',
            'trip_updated',
            'shift_reminder',
            'document_expiring_soon',
            'document_expired',
            'vehicle_assigned',
            'emergency_alert',
            'feedback_reply'  // ✅ This should be supported
        ];
        
        driverNotificationTypes.forEach(type => {
            console.log(`   • ${type}`);
        });
        
        // Step 7: Provide debugging steps
        console.log('\n🛠️  Step 7: DEBUGGING STEPS TO FOLLOW:');
        console.log('─'.repeat(50));
        
        console.log('\n1. 📧 CHECK DRIVER EMAIL LOOKUP:');
        console.log('   • Verify driver email exists in drivers collection');
        console.log('   • Check if Firebase UID is set for the driver');
        console.log('   • Ensure email matches exactly (case sensitive)');
        
        console.log('\n2. 🔔 CHECK NOTIFICATION CREATION:');
        console.log('   • Look at backend logs when admin replies');
        console.log('   • Verify notification is created in MongoDB');
        console.log('   • Check notification has correct userId (Firebase UID)');
        
        console.log('\n3. 📱 CHECK FRONTEND FILTERING:');
        console.log('   • Verify driver notifications screen includes "feedback_reply"');
        console.log('   • Check if notification API returns the notification');
        console.log('   • Ensure authentication is working for driver');
        
        console.log('\n4. 🔍 CHECK AUTHENTICATION:');
        console.log('   • Verify driver is logged in with correct Firebase UID');
        console.log('   • Check if driver token is valid');
        console.log('   • Ensure driver has access to notifications endpoint');
        
        // Step 8: Provide immediate fixes
        console.log('\n🚀 Step 8: IMMEDIATE FIXES TO TRY:');
        console.log('─'.repeat(50));
        
        console.log('\n✅ FRONTEND FIX (Already Applied):');
        console.log('   • Added "feedback_reply" to driver notification types');
        console.log('   • Added purple reply icon for feedback notifications');
        console.log('   • Added "View Feedback" button in notification details');
        
        console.log('\n🔧 BACKEND VERIFICATION NEEDED:');
        console.log('   • Check if driver exists in drivers collection');
        console.log('   • Verify driver has Firebase UID set');
        console.log('   • Confirm notification is being created');
        
        console.log('\n📱 TESTING STEPS:');
        console.log('1. Check browser network tab when driver loads notifications');
        console.log('2. Verify API call to /api/notifications returns data');
        console.log('3. Check if notification appears in response');
        console.log('4. Look at backend logs for notification creation');
        
        console.log('\n🎯 MOST LIKELY ISSUE:');
        console.log('The driver might not have a Firebase UID set in the drivers collection,');
        console.log('or the email lookup is failing. This would prevent notification creation.');
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Check the drivers collection in MongoDB');
        console.log('2. Verify the specific driver has firebaseUid field');
        console.log('3. Check backend logs when admin replies to feedback');
        console.log('4. Test with a driver that definitely has Firebase UID');
        
    } catch (error) {
        console.error('\n❌ DEBUG FAILED:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

// Run the debug
if (require.main === module) {
    debugDriverNotificationIssue();
}

module.exports = { debugDriverNotificationIssue };