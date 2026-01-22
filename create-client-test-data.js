// Create Client Test Data for Notification Testing
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

async function createClientTestData() {
    console.log('\n' + '🏢'.repeat(60));
    console.log('🏢 CREATING CLIENT TEST DATA FOR NOTIFICATIONS');
    console.log('🏢'.repeat(60));
    console.log('Timestamp:', new Date().toISOString());
    console.log('🏢'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== STEP 1: Create Client User Profile ==========
        console.log('\n📋 STEP 1: Creating Client User Profile');
        console.log('─'.repeat(80));
        
        const clientUser = {
            firebaseUid: 'client_test_uid_123456789',
            email: 'clienttest@abrafleet.com',
            name: 'Test Client Manager',
            role: 'client',
            organization: 'Test Corporation',
            mobileFcmToken: 'client_mobile_fcm_token_sample_123',
            webFcmToken: 'client_web_fcm_token_sample_123',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: {
                phone: '+91-9876543211',
                address: 'Corporate Office, Bangalore',
                employeeId: 'CLIENT001',
                department: 'Fleet Management',
                designation: 'Fleet Manager'
            }
        };
        
        await db.collection('users').updateOne(
            { firebaseUid: clientUser.firebaseUid },
            { $set: clientUser },
            { upsert: true }
        );
        
        console.log('✅ Client user profile created');
        console.log(`   Email: ${clientUser.email}`);
        console.log(`   Firebase UID: ${clientUser.firebaseUid}`);
        console.log(`   Role: ${clientUser.role}`);
        
        // ========== STEP 2: Create Client Notifications ==========
        console.log('\n📋 STEP 2: Creating Client Notifications');
        console.log('─'.repeat(80));
        
        const clientNotifications = [
            {
                userId: clientUser.firebaseUid,
                title: 'Monthly Invoice Generated',
                body: 'Your monthly fleet invoice for December 2025 has been generated. Amount: ₹1,25,000',
                type: 'invoice_generated',
                priority: 'high',
                isRead: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                data: {
                    invoiceId: 'INV-2025-12-001',
                    amount: '₹1,25,000',
                    period: 'December 2025',
                    dueDate: '2026-01-15',
                    totalTrips: 245,
                    totalDistance: '3,450 km'
                },
                metadata: {
                    source: 'billing_system',
                    category: 'invoice'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'Fleet Analytics Report Ready',
                body: 'Your weekly fleet performance report is ready for review.',
                type: 'report_generated',
                priority: 'normal',
                isRead: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                data: {
                    reportId: 'RPT-2026-W02',
                    reportType: 'Weekly Performance',
                    period: 'Jan 06-12, 2026',
                    totalTrips: 58,
                    onTimePercentage: '94.5%',
                    customerSatisfaction: '4.7/5'
                },
                metadata: {
                    source: 'analytics_system',
                    category: 'report'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'SOS Alert Resolved',
                body: 'Emergency alert from trip TRIP-789 has been resolved successfully.',
                type: 'sos_resolved',
                priority: 'urgent',
                isRead: false,
                createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
                data: {
                    sosId: 'SOS-001',
                    tripId: 'TRIP-789',
                    customerName: 'Priya Sharma',
                    driverName: 'Rajesh Kumar',
                    location: 'Electronic City Phase 1',
                    resolvedBy: 'Admin Team',
                    resolutionTime: '12 minutes'
                },
                metadata: {
                    source: 'sos_system',
                    category: 'emergency'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'New Roster Requests',
                body: '15 new roster requests are pending approval from your organization.',
                type: 'roster_requests_pending',
                priority: 'normal',
                isRead: true,
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                data: {
                    pendingCount: 15,
                    organization: 'Test Corporation',
                    requestTypes: ['New Employee', 'Route Change', 'Time Change'],
                    oldestRequest: '2 days ago'
                },
                metadata: {
                    source: 'roster_management',
                    category: 'approval_required'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'Vehicle Maintenance Alert',
                body: 'Vehicle KA-01-AB-1234 is due for scheduled maintenance.',
                type: 'maintenance_due',
                priority: 'high',
                isRead: false,
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                data: {
                    vehicleNumber: 'KA-01-AB-1234',
                    maintenanceType: 'Scheduled Service',
                    dueDate: '2026-01-15',
                    currentMileage: '45,230 km',
                    lastService: '2025-10-15'
                },
                metadata: {
                    source: 'maintenance_system',
                    category: 'vehicle_alert'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'Customer Feedback Summary',
                body: 'Weekly customer feedback summary: 23 feedbacks received, average rating 4.6/5',
                type: 'feedback_summary',
                priority: 'normal',
                isRead: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                data: {
                    period: 'Jan 06-12, 2026',
                    totalFeedbacks: 23,
                    averageRating: '4.6/5',
                    positiveCount: 19,
                    negativeCount: 4,
                    topComplaint: 'Driver late arrival'
                },
                metadata: {
                    source: 'feedback_system',
                    category: 'summary'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'Driver Performance Alert',
                body: 'Driver Suresh Kumar has received 3 negative feedbacks this week.',
                type: 'driver_performance_alert',
                priority: 'high',
                isRead: false,
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
                data: {
                    driverName: 'Suresh Kumar',
                    driverId: 'DRV-100005',
                    negativeFeedbacks: 3,
                    issues: ['Late arrival', 'Rude behavior', 'Route deviation'],
                    actionRequired: 'Manager review needed'
                },
                metadata: {
                    source: 'performance_monitoring',
                    category: 'driver_alert'
                }
            },
            {
                userId: clientUser.firebaseUid,
                title: 'Payment Received',
                body: 'Payment of ₹85,000 received for invoice INV-2025-11-001',
                type: 'payment_received',
                priority: 'normal',
                isRead: true,
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                data: {
                    paymentId: 'PAY-001',
                    invoiceId: 'INV-2025-11-001',
                    amount: '₹85,000',
                    paymentMethod: 'Bank Transfer',
                    receivedDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
                },
                metadata: {
                    source: 'payment_system',
                    category: 'payment'
                }
            }
        ];
        
        // Insert notifications
        const result = await db.collection('notifications').insertMany(clientNotifications);
        console.log(`✅ Created ${result.insertedCount} client notifications`);
        
        // Show notification summary
        console.log('\n📊 Client Notification Summary:');
        clientNotifications.forEach((notif, index) => {
            const status = notif.isRead ? '✅ Read' : '📬 Unread';
            console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${status}`);
        });
        
        // ========== STEP 3: Verification ==========
        console.log('\n📋 STEP 3: Verification');
        console.log('─'.repeat(80));
        
        const userCount = await db.collection('users').countDocuments({ 
            firebaseUid: clientUser.firebaseUid 
        });
        
        const notificationCount = await db.collection('notifications').countDocuments({ 
            userId: clientUser.firebaseUid 
        });
        
        const unreadCount = await db.collection('notifications').countDocuments({ 
            userId: clientUser.firebaseUid,
            isRead: false
        });
        
        console.log(`✅ User Profile: ${userCount > 0 ? 'Created' : 'Failed'}`);
        console.log(`✅ Total Notifications: ${notificationCount}`);
        console.log(`📬 Unread Notifications: ${unreadCount}`);
        
        // ========== STEP 4: Testing Instructions ==========
        console.log('\n📋 STEP 4: Testing Instructions');
        console.log('─'.repeat(80));
        
        console.log('🧪 To test client notifications:');
        console.log('');
        console.log('1. LOGIN CREDENTIALS:');
        console.log(`   Email: ${clientUser.email}`);
        console.log(`   Firebase UID: ${clientUser.firebaseUid}`);
        console.log('');
        console.log('2. EXPECTED RESULTS:');
        console.log(`   - Total notifications: ${notificationCount}`);
        console.log(`   - Unread notifications: ${unreadCount}`);
        console.log('   - Notification types: invoice_generated, report_generated, sos_resolved, etc.');
        console.log('');
        console.log('3. TEST SCENARIOS:');
        console.log('   - Open client app and navigate to notifications');
        console.log('   - Should see billing, analytics, SOS, maintenance alerts');
        console.log('   - High priority notifications should be highlighted');
        console.log('   - Mark notifications as read functionality');
        console.log('');
        console.log('4. BACKEND API TEST:');
        console.log('   curl -X GET "http://localhost:3001/api/notifications" \\');
        console.log('     -H "Authorization: Bearer CLIENT_AUTH_TOKEN"');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '🏢'.repeat(60));
        console.log('✅ CLIENT TEST DATA CREATION COMPLETED');
        console.log('🏢'.repeat(60) + '\n');
    }
}

createClientTestData();