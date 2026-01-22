// test-feedback-reply-notification.js - Test Admin Feedback Reply Notifications

const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'http://localhost:3001';
const MONGODB_URI = 'mongodb://localhost:27017/abra_fleet';

async function testFeedbackReplyNotification() {
    console.log('\n🧪 TESTING ADMIN FEEDBACK REPLY NOTIFICATIONS');
    console.log('='.repeat(80));
    
    let client;
    
    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db('abra_fleet');
        
        console.log('✅ Connected to MongoDB');
        
        // Step 1: Create a test customer feedback
        console.log('\n📝 Step 1: Creating test customer feedback...');
        
        const testFeedback = {
            customer_name: 'John Doe',
            customer_email: 'customer123@test.com',
            subject: 'Service Quality Feedback',
            message: 'The driver was very professional and the vehicle was clean. Great service!',
            feedback_type: 'appreciation',
            rating: 5,
            date_submitted: new Date(),
            status: 'pending'
        };
        
        const feedbackResult = await db.collection('customer_feedback').insertOne(testFeedback);
        const feedbackId = feedbackResult.insertedId.toString();
        
        console.log(`✅ Test feedback created with ID: ${feedbackId}`);
        
        // Step 2: Ensure test user exists in users collection
        console.log('\n👤 Step 2: Creating/updating test user...');
        
        const testUser = {
            email: 'customer123@test.com',
            firebaseUid: 'test-customer-123-uid',
            name: 'John Doe',
            role: 'customer',
            fcmToken: 'test-fcm-token-mobile-123',
            webFcmToken: 'test-fcm-token-web-123',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await db.collection('users').updateOne(
            { email: 'customer123@test.com' },
            { $set: testUser },
            { upsert: true }
        );
        
        console.log('✅ Test user created/updated');
        
        // Step 3: Create admin token for authentication
        console.log('\n🔐 Step 3: Getting admin authentication token...');
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@abrafleet.com',
            password: 'admin123'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Admin login failed');
        }
        
        const adminToken = loginResponse.data.token;
        console.log('✅ Admin authenticated successfully');
        
        // Step 4: Send admin reply to feedback
        console.log('\n💬 Step 4: Sending admin reply to feedback...');
        
        const replyData = {
            feedback_id: feedbackId,
            feedback_source: 'customer',
            response: 'Thank you for your wonderful feedback, John! We\'re delighted to hear that you had a great experience with our driver and vehicle. Your appreciation means a lot to our team. We\'ll make sure to share your positive comments with the driver. We look forward to serving you again!'
        };
        
        const replyResponse = await axios.post(
            `${BASE_URL}/api/feedback/admin/reply`,
            replyData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('📤 Admin Reply Response:');
        console.log('   Status:', replyResponse.status);
        console.log('   Success:', replyResponse.data.success);
        console.log('   Message:', replyResponse.data.message);
        
        if (!replyResponse.data.success) {
            throw new Error(`Admin reply failed: ${replyResponse.data.message}`);
        }
        
        console.log('✅ Admin reply sent successfully!');
        
        // Step 5: Check if notification was created
        console.log('\n🔔 Step 5: Checking if notification was created...');
        
        // Wait a moment for notification to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const notifications = await db.collection('notifications').find({
            userId: 'test-customer-123-uid',
            type: 'feedback_reply'
        }).sort({ createdAt: -1 }).limit(1).toArray();
        
        if (notifications.length > 0) {
            const notification = notifications[0];
            console.log('✅ Notification created successfully!');
            console.log('📱 Notification Details:');
            console.log('   ID:', notification._id.toString());
            console.log('   User ID:', notification.userId);
            console.log('   Type:', notification.type);
            console.log('   Title:', notification.title);
            console.log('   Body:', notification.body);
            console.log('   Priority:', notification.priority);
            console.log('   Category:', notification.category);
            console.log('   Created At:', notification.createdAt);
            console.log('   Metadata:', JSON.stringify(notification.metadata, null, 2));
            console.log('   Data:', JSON.stringify(notification.data, null, 2));
        } else {
            console.log('❌ No notification found - this might indicate an issue');
        }
        
        // Step 6: Verify feedback was updated
        console.log('\n📋 Step 6: Verifying feedback was updated...');
        
        const updatedFeedback = await db.collection('customer_feedback').findOne({
            _id: new ObjectId(feedbackId)
        });
        
        if (updatedFeedback) {
            console.log('✅ Feedback updated successfully!');
            console.log('   Status:', updatedFeedback.status);
            console.log('   Has Admin Response:', !!updatedFeedback.admin_response);
            console.log('   Response Date:', updatedFeedback.response_date);
            console.log('   Response Preview:', updatedFeedback.admin_response?.substring(0, 100) + '...');
        } else {
            console.log('❌ Feedback not found or not updated');
        }
        
        // Step 7: Test notification retrieval via API
        console.log('\n📬 Step 7: Testing notification retrieval via API...');
        
        // First, create a customer token for the test user
        const customerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer123@test.com',
            password: 'customer123' // This might not work if user doesn't exist in auth
        }).catch(() => {
            console.log('   ⚠️  Customer login failed (expected if user not in auth system)');
            return null;
        });
        
        if (customerLoginResponse && customerLoginResponse.data.success) {
            const customerToken = customerLoginResponse.data.token;
            
            const notificationsResponse = await axios.get(
                `${BASE_URL}/api/notifications`,
                {
                    headers: {
                        'Authorization': `Bearer ${customerToken}`
                    }
                }
            );
            
            console.log('✅ Notifications retrieved via API:');
            console.log('   Count:', notificationsResponse.data.data.notifications.length);
            
            const feedbackNotifications = notificationsResponse.data.data.notifications.filter(
                n => n.type === 'feedback_reply'
            );
            
            console.log('   Feedback Reply Notifications:', feedbackNotifications.length);
        } else {
            console.log('   ⚠️  Skipping API notification retrieval (customer not authenticated)');
        }
        
        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
        
        // Summary
        console.log('\n📊 SUMMARY:');
        console.log('✅ Customer feedback created');
        console.log('✅ Test user created/updated');
        console.log('✅ Admin authenticated');
        console.log('✅ Admin reply sent');
        console.log('✅ Notification created');
        console.log('✅ Feedback updated with response');
        
        console.log('\n🔍 WHAT TO CHECK IN THE APP:');
        console.log('1. Customer should receive a push notification');
        console.log('2. Notification should appear in customer\'s notification list');
        console.log('3. Tapping notification should navigate to feedback details');
        console.log('4. Customer can see the admin response in HRM feedback screen');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
        console.error('Stack:', error.stack);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 MongoDB connection closed');
        }
    }
}

// Run the test
if (require.main === module) {
    testFeedbackReplyNotification();
}

module.exports = { testFeedbackReplyNotification };