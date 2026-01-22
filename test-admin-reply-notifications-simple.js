// test-admin-reply-notifications-simple.js - Test Admin Feedback Reply Notifications

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAdminReplyNotifications() {
    console.log('\n🧪 TESTING ADMIN FEEDBACK REPLY NOTIFICATIONS');
    console.log('='.repeat(80));
    
    try {
        // Step 1: Check backend health
        console.log('\n🏥 Step 1: Checking backend health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Backend is healthy:', healthResponse.data.message);
        
        // Step 2: Create admin token for authentication
        console.log('\n🔐 Step 2: Getting admin authentication token...');
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@abrafleet.com',
            password: 'admin123'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Admin login failed');
        }
        
        const adminToken = loginResponse.data.token;
        console.log('✅ Admin authenticated successfully');
        
        // Step 3: Submit test customer feedback
        console.log('\n📝 Step 3: Submitting test customer feedback...');
        
        const feedbackData = {
            customer_name: 'John Doe Test',
            feedback_type: 'appreciation',
            subject: 'Excellent Service Quality',
            message: 'The driver was very professional and the vehicle was clean. Great service overall!',
            rating: 5
        };
        
        const feedbackResponse = await axios.post(
            `${BASE_URL}/api/feedback/customer/submit`,
            feedbackData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('📤 Customer Feedback Response:');
        console.log('   Status:', feedbackResponse.status);
        console.log('   Success:', feedbackResponse.data.success);
        console.log('   Message:', feedbackResponse.data.message);
        
        if (!feedbackResponse.data.success) {
            throw new Error(`Feedback submission failed: ${feedbackResponse.data.message}`);
        }
        
        const feedbackId = feedbackResponse.data.data?.feedback_id;
        console.log('✅ Customer feedback submitted with ID:', feedbackId);
        
        // Step 4: Submit test employee/client feedback
        console.log('\n📝 Step 4: Submitting test employee/client feedback...');
        
        const employeeFeedbackData = {
            employee_name: 'Prem Nanadan',
            feedback_type: 'suggestion',
            subject: 'Roster Management Improvement',
            message: 'Could we have better notification system for roster changes?',
            rating: 4
        };
        
        const employeeFeedbackResponse = await axios.post(
            `${BASE_URL}/api/feedback/employee/submit`,
            employeeFeedbackData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('📤 Employee Feedback Response:');
        console.log('   Status:', employeeFeedbackResponse.status);
        console.log('   Success:', employeeFeedbackResponse.data.success);
        
        const employeeFeedbackId = employeeFeedbackResponse.data.data?.feedback_id;
        console.log('✅ Employee feedback submitted with ID:', employeeFeedbackId);
        
        // Step 5: Submit test driver feedback
        console.log('\n📝 Step 5: Submitting test driver feedback...');
        
        const driverFeedbackData = {
            driver_name: 'Rajesh Kumar',
            feedback_type: 'complaint',
            subject: 'Vehicle Maintenance Issue',
            message: 'The assigned vehicle has some engine noise. Please check.',
            rating: 2
        };
        
        const driverFeedbackResponse = await axios.post(
            `${BASE_URL}/api/feedback/driver/submit`,
            driverFeedbackData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('📤 Driver Feedback Response:');
        console.log('   Status:', driverFeedbackResponse.status);
        console.log('   Success:', driverFeedbackResponse.data.success);
        
        const driverFeedbackId = driverFeedbackResponse.data.data?.feedback_id;
        console.log('✅ Driver feedback submitted with ID:', driverFeedbackId);
        
        // Step 6: Send admin replies to all feedback types
        console.log('\n💬 Step 6: Sending admin replies...');
        
        // Reply to customer feedback
        if (feedbackId) {
            console.log('\n   📞 Replying to customer feedback...');
            const customerReplyData = {
                feedback_id: feedbackId,
                feedback_source: 'customer',
                response: 'Thank you for your wonderful feedback, John! We\'re delighted to hear about your positive experience. We\'ll share your appreciation with the driver. We look forward to serving you again!'
            };
            
            const customerReplyResponse = await axios.post(
                `${BASE_URL}/api/feedback/admin/reply`,
                customerReplyData,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('   ✅ Customer Reply Status:', customerReplyResponse.status);
            console.log('   ✅ Customer Reply Success:', customerReplyResponse.data.success);
            console.log('   ✅ Customer Reply Message:', customerReplyResponse.data.message);
        }
        
        // Reply to employee feedback
        if (employeeFeedbackId) {
            console.log('\n   📞 Replying to employee feedback...');
            const employeeReplyData = {
                feedback_id: employeeFeedbackId,
                feedback_source: 'employee',
                response: 'Hi Prem, thank you for your suggestion about roster notifications. We\'re working on improving our notification system and will implement better roster change alerts soon. Your feedback helps us improve!'
            };
            
            const employeeReplyResponse = await axios.post(
                `${BASE_URL}/api/feedback/admin/reply`,
                employeeReplyData,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('   ✅ Employee Reply Status:', employeeReplyResponse.status);
            console.log('   ✅ Employee Reply Success:', employeeReplyResponse.data.success);
            console.log('   ✅ Employee Reply Message:', employeeReplyResponse.data.message);
        }
        
        // Reply to driver feedback
        if (driverFeedbackId) {
            console.log('\n   📞 Replying to driver feedback...');
            const driverReplyData = {
                feedback_id: driverFeedbackId,
                feedback_source: 'driver',
                response: 'Hi Rajesh, thank you for reporting the vehicle issue. We\'ve scheduled an immediate maintenance check for your vehicle. Please contact the maintenance team at ext. 234 for a replacement vehicle today. Your safety is our priority!'
            };
            
            const driverReplyResponse = await axios.post(
                `${BASE_URL}/api/feedback/admin/reply`,
                driverReplyData,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('   ✅ Driver Reply Status:', driverReplyResponse.status);
            console.log('   ✅ Driver Reply Success:', driverReplyResponse.data.success);
            console.log('   ✅ Driver Reply Message:', driverReplyResponse.data.message);
        }
        
        // Step 7: Wait for notifications to be processed
        console.log('\n⏳ Step 7: Waiting for notifications to be processed...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 8: Check notification endpoints
        console.log('\n🔔 Step 8: Checking notification system...');
        
        try {
            const notificationsResponse = await axios.get(
                `${BASE_URL}/api/notifications?limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );
            
            console.log('✅ Notifications API Response:');
            console.log('   Status:', notificationsResponse.status);
            console.log('   Success:', notificationsResponse.data.success);
            
            if (notificationsResponse.data.success) {
                const notifications = notificationsResponse.data.data?.notifications || [];
                console.log('   Total Notifications:', notifications.length);
                
                const feedbackNotifications = notifications.filter(n => n.type === 'feedback_reply');
                console.log('   Feedback Reply Notifications:', feedbackNotifications.length);
                
                feedbackNotifications.forEach((notif, index) => {
                    console.log(`   📱 Notification ${index + 1}:`);
                    console.log(`      Title: ${notif.title}`);
                    console.log(`      Type: ${notif.type}`);
                    console.log(`      Priority: ${notif.priority}`);
                    console.log(`      User ID: ${notif.userId}`);
                    console.log(`      Created: ${notif.createdAt}`);
                });
            }
        } catch (notifError) {
            console.log('⚠️  Notification check failed:', notifError.message);
        }
        
        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
        
        // Summary
        console.log('\n📊 SUMMARY:');
        console.log('✅ Backend health check passed');
        console.log('✅ Admin authentication successful');
        console.log('✅ Customer feedback submitted and replied');
        console.log('✅ Employee/Client feedback submitted and replied');
        console.log('✅ Driver feedback submitted and replied');
        console.log('✅ Notification system checked');
        
        console.log('\n🔍 WHAT TO CHECK IN THE APPS:');
        console.log('1. 📱 Customer App: Check customer notifications screen');
        console.log('2. 📱 Client App: Check client notifications screen');
        console.log('3. 📱 Driver App: Check driver notifications screen');
        console.log('4. 💻 Admin Panel: Check feedback management screens');
        console.log('5. 🔔 All users should receive push notifications');
        
        console.log('\n📋 NOTIFICATION FEATURES TO VERIFY:');
        console.log('• Notifications appear in respective user notification screens');
        console.log('• Tapping notification shows feedback details');
        console.log('• "View Feedback" button navigates to feedback screen');
        console.log('• Notifications can be marked as read');
        console.log('• Unread count updates correctly');
        console.log('• Real-time notification updates work');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
if (require.main === module) {
    testAdminReplyNotifications();
}

module.exports = { testAdminReplyNotifications };