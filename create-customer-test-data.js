// Create Customer Test Data for Notification Testing
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

async function createCustomerTestData() {
    console.log('\n' + '👤'.repeat(60));
    console.log('👤 CREATING CUSTOMER TEST DATA FOR NOTIFICATIONS');
    console.log('👤'.repeat(60));
    console.log('Timestamp:', new Date().toISOString());
    console.log('👤'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== STEP 1: Create Customer User Profile ==========
        console.log('\n📋 STEP 1: Creating Customer User Profile');
        console.log('─'.repeat(80));
        
        const customerUser = {
            firebaseUid: 'customer_test_uid_123456789',
            email: 'customertest@abrafleet.com',
            name: 'Test Customer',
            role: 'customer',
            organization: 'Test Organization',
            mobileFcmToken: 'customer_mobile_fcm_token_sample_123',
            webFcmToken: 'customer_web_fcm_token_sample_123',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: {
                phone: '+91-9876543210',
                address: 'Test Address, Bangalore',
                employeeId: 'CUST001',
                department: 'Operations'
            }
        };
        
        await db.collection('users').updateOne(
            { firebaseUid: customerUser.firebaseUid },
            { $set: customerUser },
            { upsert: true }
        );
        
        console.log('✅ Customer user profile created');
        console.log(`   Email: ${customerUser.email}`);
        console.log(`   Firebase UID: ${customerUser.firebaseUid}`);
        console.log(`   Role: ${customerUser.role}`);
        
        // ========== STEP 2: Create Customer Notifications ==========
        console.log('\n📋 STEP 2: Creating Customer Notifications');
        console.log('─'.repeat(80));
        
        const customerNotifications = [
            {
                userId: customerUser.firebaseUid,
                title: 'Trip Assigned',
                body: 'Your trip from Home to Office has been assigned. Driver: Rajesh Kumar',
                type: 'trip_assigned',
                priority: 'normal',
                isRead: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                data: {
                    tripId: 'TRIP-001',
                    driverName: 'Rajesh Kumar',
                    vehicleNumber: 'KA-01-AB-1234',
                    pickupTime: '09:00 AM',
                    route: 'Home → Office'
                },
                metadata: {
                    source: 'trip_management',
                    category: 'trip_update'
                }
            },
            {
                userId: customerUser.firebaseUid,
                title: 'Driver Started Trip',
                body: 'Your driver Rajesh Kumar has started the trip. ETA: 15 minutes',
                type: 'trip_started',
                priority: 'high',
                isRead: false,
                createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                data: {
                    tripId: 'TRIP-001',
                    driverName: 'Rajesh Kumar',
                    driverPhone: '+91-9876543210',
                    currentLocation: 'Electronic City',
                    eta: '15 minutes'
                },
                metadata: {
                    source: 'trip_tracking',
                    category: 'trip_update'
                }
            },
            {
                userId: customerUser.firebaseUid,
                title: 'Driver Arriving Soon',
                body: 'Your driver is 5 minutes away. Please be ready at the pickup point.',
                type: 'eta_5min',
                priority: 'urgent',
                isRead: false,
                createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                data: {
                    tripId: 'TRIP-001',
                    driverName: 'Rajesh Kumar',
                    pickupLocation: 'Home - Test Address',
                    eta: '5 minutes'
                },
                metadata: {
                    source: 'trip_tracking',
                    category: 'trip_alert'
                }
            },
            {
                userId: customerUser.firebaseUid,
                title: 'Roster Updated',
                body: 'Your weekly roster has been updated. New pickup time: 8:45 AM',
                type: 'roster_assignment_updated',
                priority: 'normal',
                isRead: true,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                data: {
                    rosterId: 'ROSTER-001',
                    oldPickupTime: '09:00 AM',
                    newPickupTime: '08:45 AM',
                    effectiveDate: '2026-01-13'
                },
                metadata: {
                    source: 'roster_management',
                    category: 'roster_update'
                }
            },
            {
                userId: customerUser.firebaseUid,
                title: 'Trip Completed',
                body: 'Your trip has been completed successfully. Thank you for traveling with us!',
                type: 'trip_completed',
                priority: 'normal',
                isRead: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                data: {
                    tripId: 'TRIP-002',
                    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    distance: '12.5 km',
                    duration: '35 minutes'
                },
                metadata: {
                    source: 'trip_management',
                    category: 'trip_completion'
                }
            },
            {
                userId: customerUser.firebaseUid,
                title: 'Feedback Reply',
                body: 'Admin has replied to your feedback about trip service quality.',
                type: 'feedback_reply',
                priority: 'normal',
                isRead: false,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                data: {
                    feedbackId: 'FB-001',
                    adminReply: 'Thank you for your feedback. We have addressed the issue with the driver.',
                    originalFeedback: 'Driver was late and did not follow the route properly'
                },
                metadata: {
                    source: 'feedback_system',
                    category: 'feedback_reply'
                }
            }
        ];
        
        // Insert notifications
        const result = await db.collection('notifications').insertMany(customerNotifications);
        console.log(`✅ Created ${result.insertedCount} customer notifications`);
        
        // Show notification summary
        console.log('\n📊 Customer Notification Summary:');
        customerNotifications.forEach((notif, index) => {
            const status = notif.isRead ? '✅ Read' : '📬 Unread';
            console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${status}`);
        });
        
        // ========== STEP 3: Verification ==========
        console.log('\n📋 STEP 3: Verification');
        console.log('─'.repeat(80));
        
        const userCount = await db.collection('users').countDocuments({ 
            firebaseUid: customerUser.firebaseUid 
        });
        
        const notificationCount = await db.collection('notifications').countDocuments({ 
            userId: customerUser.firebaseUid 
        });
        
        const unreadCount = await db.collection('notifications').countDocuments({ 
            userId: customerUser.firebaseUid,
            isRead: false
        });
        
        console.log(`✅ User Profile: ${userCount > 0 ? 'Created' : 'Failed'}`);
        console.log(`✅ Total Notifications: ${notificationCount}`);
        console.log(`📬 Unread Notifications: ${unreadCount}`);
        
        // ========== STEP 4: Testing Instructions ==========
        console.log('\n📋 STEP 4: Testing Instructions');
        console.log('─'.repeat(80));
        
        console.log('🧪 To test customer notifications:');
        console.log('');
        console.log('1. LOGIN CREDENTIALS:');
        console.log(`   Email: ${customerUser.email}`);
        console.log(`   Firebase UID: ${customerUser.firebaseUid}`);
        console.log('');
        console.log('2. EXPECTED RESULTS:');
        console.log(`   - Total notifications: ${notificationCount}`);
        console.log(`   - Unread notifications: ${unreadCount}`);
        console.log('   - Notification types: trip_assigned, trip_started, eta_5min, etc.');
        console.log('');
        console.log('3. TEST SCENARIOS:');
        console.log('   - Open customer app and navigate to notifications');
        console.log('   - Should see trip updates, roster changes, feedback replies');
        console.log('   - Urgent notifications should be highlighted');
        console.log('   - Mark notifications as read functionality');
        console.log('');
        console.log('4. BACKEND API TEST:');
        console.log('   curl -X GET "http://localhost:3001/api/notifications" \\');
        console.log('     -H "Authorization: Bearer CUSTOMER_AUTH_TOKEN"');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '👤'.repeat(60));
        console.log('✅ CUSTOMER TEST DATA CREATION COMPLETED');
        console.log('👤'.repeat(60) + '\n');
    }
}

createCustomerTestData();