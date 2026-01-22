// Test customer notifications from customer_notification collection
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Super admin Firebase UID (you mentioned you're logged in as super admin)
const SUPER_ADMIN_UID = 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2'; // Replace with actual super admin UID

async function testCustomerNotifications() {
    console.log('🔍 Testing customer notifications from customer_notification collection...');
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        
        // Check customer_notification collection
        console.log('\n📋 Checking customer_notification collection...');
        const customerNotifications = await db.collection('customer_notification')
            .find({ userId: SUPER_ADMIN_UID })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📬 Found ${customerNotifications.length} customer notifications`);
        
        if (customerNotifications.length > 0) {
            console.log('\n📋 Customer notifications found:');
            customerNotifications.forEach((notif, index) => {
                console.log(`   ${index + 1}. ${notif.title} (${notif.type})`);
                console.log(`      User ID: ${notif.userId}`);
                console.log(`      Created: ${new Date(notif.createdAt)}`);
                console.log(`      Read: ${notif.isRead || false}`);
                console.log('');
            });
        }
        
        // Also check regular notifications collection for comparison
        console.log('\n📋 Checking regular notifications collection for comparison...');
        const regularNotifications = await db.collection('notifications')
            .find({ userId: SUPER_ADMIN_UID })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📬 Found ${regularNotifications.length} regular notifications`);
        
        // Check if there are any admin-specific notification types
        console.log('\n📋 Checking for admin-specific notifications...');
        const adminNotificationTypes = [
            'trip_cancelled',
            'sos_alert', 
            'driver_report',
            'vehicle_maintenance',
            'roster_pending',
            'customer_registration',
            'document_expired',
            'document_expiring_soon',
            'leave_request_pending',
            'address_change_request'
        ];
        
        const adminNotifications = await db.collection('customer_notification')
            .find({ 
                userId: SUPER_ADMIN_UID,
                type: { $in: adminNotificationTypes }
            })
            .sort({ createdAt: -1 })
            .toArray();
            
        console.log(`📬 Found ${adminNotifications.length} admin-specific notifications in customer_notification`);
        
        if (adminNotifications.length > 0) {
            console.log('\n📋 Admin notifications:');
            adminNotifications.forEach((notif, index) => {
                console.log(`   ${index + 1}. ${notif.title} (${notif.type})`);
                console.log(`      Message: ${notif.body || notif.message || 'No message'}`);
                console.log(`      Read: ${notif.isRead || false}`);
                console.log('');
            });
        }
        
        // Check total count
        const totalCustomerNotifications = await db.collection('customer_notification')
            .countDocuments({ userId: SUPER_ADMIN_UID });
        console.log(`📊 Total customer notifications for user: ${totalCustomerNotifications}`);
        
        const unreadCustomerNotifications = await db.collection('customer_notification')
            .countDocuments({ userId: SUPER_ADMIN_UID, isRead: { $ne: true } });
        console.log(`📊 Unread customer notifications: ${unreadCustomerNotifications}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

testCustomerNotifications();