// Verify New Customer and Client Test Data
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

async function verifyNewTestData() {
    console.log('\n' + '🔍'.repeat(60));
    console.log('🔍 VERIFYING NEW CUSTOMER & CLIENT TEST DATA');
    console.log('🔍'.repeat(60));
    console.log('Timestamp:', new Date().toISOString());
    console.log('🔍'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== Check Customer Test Data ==========
        console.log('\n📋 CUSTOMER TEST DATA VERIFICATION');
        console.log('─'.repeat(80));
        
        const customerUserId = 'customer_test_uid_123456789';
        
        const customerUser = await db.collection('users').findOne({ 
            firebaseUid: customerUserId 
        });
        
        const customerNotifications = await db.collection('notifications')
            .find({ userId: customerUserId })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`👤 Customer User Profile: ${customerUser ? '✅ Found' : '❌ Missing'}`);
        if (customerUser) {
            console.log(`   Email: ${customerUser.email}`);
            console.log(`   Role: ${customerUser.role}`);
            console.log(`   FCM Tokens: Mobile(${!!customerUser.mobileFcmToken}) Web(${!!customerUser.webFcmToken})`);
        }
        
        console.log(`📬 Customer Notifications: ${customerNotifications.length} found`);
        if (customerNotifications.length > 0) {
            console.log('   Recent notifications:');
            customerNotifications.slice(0, 5).forEach((notif, index) => {
                const status = notif.isRead ? '✅ Read' : '📬 Unread';
                console.log(`      ${index + 1}. ${notif.title} (${notif.type}) - ${status}`);
            });
        }
        
        // ========== Check Client Test Data ==========
        console.log('\n📋 CLIENT TEST DATA VERIFICATION');
        console.log('─'.repeat(80));
        
        const clientUserId = 'client_test_uid_123456789';
        
        const clientUser = await db.collection('users').findOne({ 
            firebaseUid: clientUserId 
        });
        
        const clientNotifications = await db.collection('notifications')
            .find({ userId: clientUserId })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`🏢 Client User Profile: ${clientUser ? '✅ Found' : '❌ Missing'}`);
        if (clientUser) {
            console.log(`   Email: ${clientUser.email}`);
            console.log(`   Role: ${clientUser.role}`);
            console.log(`   FCM Tokens: Mobile(${!!clientUser.mobileFcmToken}) Web(${!!clientUser.webFcmToken})`);
        }
        
        console.log(`📬 Client Notifications: ${clientNotifications.length} found`);
        if (clientNotifications.length > 0) {
            console.log('   Recent notifications:');
            clientNotifications.slice(0, 5).forEach((notif, index) => {
                const status = notif.isRead ? '✅ Read' : '📬 Unread';
                console.log(`      ${index + 1}. ${notif.title} (${notif.type}) - ${status}`);
            });
        }
        
        // ========== Check All User IDs with New Pattern ==========
        console.log('\n📋 ALL USER IDS WITH NOTIFICATIONS (Updated)');
        console.log('─'.repeat(80));
        
        const uniqueUserIds = await db.collection('notifications').distinct('userId');
        console.log(`📊 Total unique user IDs: ${uniqueUserIds.length}`);
        
        // Updated categorization
        const userTypes = {
            drivers: [],
            customers: [],
            clients: [],
            admins: [],
            others: []
        };
        
        uniqueUserIds.forEach(userId => {
            if (userId.includes('DRV-') || userId.length > 20) {
                userTypes.drivers.push(userId);
            } else if (userId.includes('customer_test_uid') || userId.includes('customer') || userId.includes('CUST-')) {
                userTypes.customers.push(userId);
            } else if (userId.includes('client_test_uid') || userId.includes('client') || userId.includes('CLIENT-')) {
                userTypes.clients.push(userId);
            } else if (userId.includes('admin') || userId.includes('ADMIN-')) {
                userTypes.admins.push(userId);
            } else {
                userTypes.others.push(userId);
            }
        });
        
        console.log('\n📊 Updated User Types Distribution:');
        console.log(`   🚗 Drivers: ${userTypes.drivers.length}`);
        console.log(`   👤 Customers: ${userTypes.customers.length}`);
        console.log(`   🏢 Clients: ${userTypes.clients.length}`);
        console.log(`   👨‍💼 Admins: ${userTypes.admins.length}`);
        console.log(`   ❓ Others: ${userTypes.others.length}`);
        
        if (userTypes.customers.length > 0) {
            console.log('\n👤 Customer User IDs:');
            userTypes.customers.forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
        }
        
        if (userTypes.clients.length > 0) {
            console.log('\n🏢 Client User IDs:');
            userTypes.clients.forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
        }
        
        // ========== Summary ==========
        console.log('\n📋 SUMMARY');
        console.log('─'.repeat(80));
        
        console.log('✅ NOTIFICATION SYSTEM STATUS BY USER TYPE:');
        console.log('');
        
        console.log('🚗 DRIVERS:');
        console.log(`   ✅ ${userTypes.drivers.length} drivers with notifications`);
        console.log('   📱 Test user: drivertest@gmail.com (wvm5wdXaWNOAqVOXX5l8fWbfYFz2)');
        console.log('   🔧 Status: Ready to test');
        
        console.log('\n👤 CUSTOMERS:');
        if (userTypes.customers.length > 0) {
            console.log(`   ✅ ${userTypes.customers.length} customers with notifications`);
            console.log('   📱 Test user: customertest@abrafleet.com (customer_test_uid_123456789)');
            console.log('   🔧 Status: Ready to test');
        } else {
            console.log('   ❌ No customers with notifications found');
        }
        
        console.log('\n🏢 CLIENTS:');
        if (userTypes.clients.length > 0) {
            console.log(`   ✅ ${userTypes.clients.length} clients with notifications`);
            console.log('   📱 Test user: clienttest@abrafleet.com (client_test_uid_123456789)');
            console.log('   🔧 Status: Ready to test');
        } else {
            console.log('   ❌ No clients with notifications found');
        }
        
        // ========== Testing Instructions ==========
        console.log('\n📋 TESTING INSTRUCTIONS FOR ALL USER TYPES');
        console.log('─'.repeat(80));
        
        console.log('🧪 DRIVER TESTING:');
        console.log('   1. Login with: drivertest@gmail.com');
        console.log('   2. Navigate to driver notifications screen');
        console.log('   3. Expected: 8 notifications (6 unread)');
        
        if (customerNotifications.length > 0) {
            console.log('\n🧪 CUSTOMER TESTING:');
            console.log('   1. Login with: customertest@abrafleet.com');
            console.log('   2. Navigate to customer notifications screen');
            console.log(`   3. Expected: ${customerNotifications.length} notifications`);
            console.log('   4. Should see: trip updates, ETA alerts, roster changes');
        }
        
        if (clientNotifications.length > 0) {
            console.log('\n🧪 CLIENT TESTING:');
            console.log('   1. Login with: clienttest@abrafleet.com');
            console.log('   2. Navigate to client notifications screen');
            console.log(`   3. Expected: ${clientNotifications.length} notifications`);
            console.log('   4. Should see: invoices, reports, SOS alerts, maintenance');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '🔍'.repeat(60));
        console.log('✅ VERIFICATION COMPLETED');
        console.log('🔍'.repeat(60) + '\n');
    }
}

verifyNewTestData();