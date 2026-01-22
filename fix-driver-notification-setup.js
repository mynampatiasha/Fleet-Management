// fix-driver-notification-setup.js - Fix driver notification setup

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function fixDriverNotificationSetup() {
    console.log('\n🔧 FIXING DRIVER NOTIFICATION SETUP');
    console.log('='.repeat(80));
    
    try {
        // Step 1: Create a test driver feedback to work with
        console.log('\n📝 Step 1: Creating test driver feedback...');
        
        // We'll use a simple approach - create feedback via API
        const testFeedbackData = {
            driver_name: 'Test Driver',
            driver_email: 'testdriver@abrafleet.com',
            feedback_type: 'complaint',
            subject: 'Test Vehicle Issue',
            message: 'This is a test feedback to verify notification system.',
            rating: 3
        };
        
        console.log('📤 Test feedback data:');
        console.log('   Driver Name:', testFeedbackData.driver_name);
        console.log('   Driver Email:', testFeedbackData.driver_email);
        console.log('   Subject:', testFeedbackData.subject);
        
        // Step 2: Try to submit feedback (this will help us understand the auth flow)
        console.log('\n🔐 Step 2: Testing feedback submission flow...');
        
        try {
            // First, let's try without auth to see the error
            const feedbackResponse = await axios.post(
                `${BASE_URL}/api/feedback/driver/submit`,
                testFeedbackData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Feedback submitted successfully');
            console.log('   Response:', feedbackResponse.data);
            
        } catch (feedbackError) {
            console.log('⚠️  Feedback submission requires authentication');
            console.log('   Status:', feedbackError.response?.status);
            console.log('   Message:', feedbackError.response?.data?.message);
        }
        
        // Step 3: Test the admin reply flow
        console.log('\n💬 Step 3: Testing admin reply flow...');
        
        const testReplyData = {
            feedback_id: 'test-feedback-id',
            feedback_source: 'driver',
            response: 'Thank you for your feedback. We will look into this issue immediately.'
        };
        
        try {
            const replyResponse = await axios.post(
                `${BASE_URL}/api/feedback/admin/reply`,
                testReplyData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Admin reply submitted successfully');
            console.log('   Response:', replyResponse.data);
            
        } catch (replyError) {
            console.log('⚠️  Admin reply requires authentication');
            console.log('   Status:', replyError.response?.status);
            console.log('   Message:', replyError.response?.data?.message);
        }
        
        // Step 4: Check notification endpoint structure
        console.log('\n🔔 Step 4: Testing notification endpoint...');
        
        try {
            const notificationResponse = await axios.get(`${BASE_URL}/api/notifications`);
            console.log('✅ Notifications accessible');
            console.log('   Response:', notificationResponse.data);
            
        } catch (notificationError) {
            console.log('⚠️  Notifications require authentication');
            console.log('   Status:', notificationError.response?.status);
            console.log('   Message:', notificationError.response?.data?.message);
        }
        
        // Step 5: Provide manual testing instructions
        console.log('\n📋 Step 5: MANUAL TESTING INSTRUCTIONS');
        console.log('─'.repeat(50));
        
        console.log('\n🎯 TO TEST DRIVER NOTIFICATIONS MANUALLY:');
        
        console.log('\n1. 📱 SUBMIT DRIVER FEEDBACK:');
        console.log('   • Open driver app and login');
        console.log('   • Go to HRM feedback screen');
        console.log('   • Submit feedback with subject "Test Notification"');
        console.log('   • Note the driver email used');
        
        console.log('\n2. 💻 ADMIN REPLY:');
        console.log('   • Open admin panel');
        console.log('   • Go to HRM > Driver Feedback');
        console.log('   • Find the submitted feedback');
        console.log('   • Click reply and enter response');
        console.log('   • Submit the reply');
        
        console.log('\n3. 🔍 CHECK BACKEND LOGS:');
        console.log('   • Watch backend console for notification creation logs');
        console.log('   • Look for "SENDING NOTIFICATION TO USER" messages');
        console.log('   • Check if Firebase UID is found for the driver');
        
        console.log('\n4. 📱 CHECK DRIVER NOTIFICATIONS:');
        console.log('   • Go to driver notifications screen');
        console.log('   • Pull to refresh');
        console.log('   • Look for notification with purple reply icon');
        
        console.log('\n🔧 DEBUGGING CHECKLIST:');
        console.log('─'.repeat(30));
        
        console.log('\n✅ FRONTEND VERIFICATION:');
        console.log('   • Driver notifications screen includes "feedback_reply" type');
        console.log('   • Purple reply icon is configured');
        console.log('   • "View Feedback" button is available');
        
        console.log('\n🔍 BACKEND VERIFICATION NEEDED:');
        console.log('   • Driver exists in drivers collection');
        console.log('   • Driver has firebaseUid field set');
        console.log('   • Notification is created in notifications collection');
        console.log('   • Driver email lookup is successful');
        
        console.log('\n📊 COMMON ISSUES & SOLUTIONS:');
        console.log('─'.repeat(30));
        
        console.log('\n❌ ISSUE: Driver has no Firebase UID');
        console.log('   ✅ SOLUTION: Ensure driver logs in via Firebase Auth');
        console.log('   ✅ SOLUTION: Check drivers collection has firebaseUid field');
        
        console.log('\n❌ ISSUE: Email mismatch');
        console.log('   ✅ SOLUTION: Ensure feedback email matches driver collection email');
        console.log('   ✅ SOLUTION: Check case sensitivity');
        
        console.log('\n❌ ISSUE: Notification not created');
        console.log('   ✅ SOLUTION: Check backend logs for errors');
        console.log('   ✅ SOLUTION: Verify notification model is working');
        
        console.log('\n❌ ISSUE: Driver not authenticated');
        console.log('   ✅ SOLUTION: Ensure driver is logged in');
        console.log('   ✅ SOLUTION: Check Firebase token is valid');
        
        // Step 6: Provide test commands
        console.log('\n🧪 Step 6: TEST COMMANDS TO RUN');
        console.log('─'.repeat(50));
        
        console.log('\n📝 CHECK DRIVER DATA:');
        console.log('   node check-specific-driver.js');
        console.log('   node check-drivers-in-db.js');
        
        console.log('\n🔔 TEST NOTIFICATIONS:');
        console.log('   node test-driver-notifications-simple.js');
        console.log('   node create-driver-test-notifications.js');
        
        console.log('\n🔍 DEBUG BACKEND:');
        console.log('   node debug-notifications-backend.js');
        console.log('   node test-notifications-direct-db.js');
        
        console.log('\n🎉 EXPECTED RESULT:');
        console.log('After admin replies to driver feedback:');
        console.log('• Driver receives notification with purple reply icon');
        console.log('• Notification shows admin response preview');
        console.log('• "View Feedback" button navigates to feedback screen');
        console.log('• Notification can be marked as read');
        
    } catch (error) {
        console.error('\n❌ SETUP FAILED:');
        console.error('Error:', error.message);
    }
}

// Run the setup
if (require.main === module) {
    fixDriverNotificationSetup();
}

module.exports = { fixDriverNotificationSetup };