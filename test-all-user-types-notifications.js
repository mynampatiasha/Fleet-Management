// Test Notifications for All User Types (Client, Customer, Driver)
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

// Test users for different roles
const TEST_USERS = {
    driver: 'wvm5wdXaWNOAqVOXX5l8fWbfYFz2',  // drivertest@gmail.com (Asha Mynampati)
    customer: 'customer123',                    // Sample customer ID
    client: 'client123',                        // Sample client ID
    admin: 'admin123'                          // Sample admin ID
};

async function testAllUserTypesNotifications() {
    console.log('\n' + '👥'.repeat(60));
    console.log('👥 NOTIFICATION SYSTEM TEST - ALL USER TYPES');
    console.log('👥'.repeat(60));
    console.log('Timestamp:', new Date().toISOString());
    console.log('👥'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== STEP 1: Check All Unique User IDs ==========
        console.log('\n📋 STEP 1: All User IDs in Notifications Collection');
        console.log('─'.repeat(80));
        
        const uniqueUserIds = await db.collection('notifications').distinct('userId');
        console.log(`📊 Found ${uniqueUserIds.length} unique user IDs with notifications:`);
        
        // Group by user type patterns
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
            } else if (userId.includes('customer') || userId.includes('CUST-')) {
                userTypes.customers.push(userId);
            } else if (userId.includes('client') || userId.includes('CLIENT-')) {
                userTypes.clients.push(userId);
            } else if (userId.includes('admin') || userId.includes('ADMIN-')) {
                userTypes.admins.push(userId);
            } else {
                userTypes.others.push(userId);
            }
        });
        
        console.log('\n📊 User Types Distribution:');
        console.log(`   🚗 Drivers: ${userTypes.drivers.length}`);
        console.log(`   👤 Customers: ${userTypes.customers.length}`);
        console.log(`   🏢 Clients: ${userTypes.clients.length}`);
        console.log(`   👨‍💼 Admins: ${userTypes.admins.length}`);
        console.log(`   ❓ Others: ${userTypes.others.length}`);
        
        // Show samples
        if (userTypes.drivers.length > 0) {
            console.log('\n🚗 Driver User IDs (sample):');
            userTypes.drivers.slice(0, 5).forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
        }
        
        if (userTypes.customers.length > 0) {
            console.log('\n👤 Customer User IDs (sample):');
            userTypes.customers.slice(0, 5).forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
        }
        
        if (userTypes.clients.length > 0) {
            console.log('\n🏢 Client User IDs (sample):');
            userTypes.clients.slice(0, 5).forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
        }
        
        if (userTypes.others.length > 0) {
            console.log('\n❓ Other User IDs (sample):');
            userTypes.others.slice(0, 5).forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
        }
        
        // ========== STEP 2: Test Specific User Types ==========
        console.log('\n📋 STEP 2: Testing Specific User Types');
        console.log('─'.repeat(80));
        
        // Test Driver (we know this works)
        await testUserNotifications(db, TEST_USERS.driver, '🚗 DRIVER', 'drivertest@gmail.com');
        
        // Test other user types if they exist
        if (userTypes.customers.length > 0) {
            await testUserNotifications(db, userTypes.customers[0], '👤 CUSTOMER', 'Sample Customer');
        }
        
        if (userTypes.clients.length > 0) {
            await testUserNotifications(db, userTypes.clients[0], '🏢 CLIENT', 'Sample Client');
        }
        
        if (userTypes.admins.length > 0) {
            await testUserNotifications(db, userTypes.admins[0], '👨‍💼 ADMIN', 'Sample Admin');
        }
        
        // ========== STEP 3: Notification Types Analysis ==========
        console.log('\n📋 STEP 3: Notification Types Analysis');
        console.log('─'.repeat(80));
        
        const notificationTypes = await db.collection('notifications').aggregate([
            { $group: { _id: '$type', count: { $sum: 1 }, users: { $addToSet: '$userId' } } },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('📊 Notification Types by Frequency:');
        notificationTypes.forEach((type, index) => {
            console.log(`   ${index + 1}. ${type._id}: ${type.count} notifications (${type.users.length} users)`);
        });
        
        // ========== STEP 4: User Profile Check ==========
        console.log('\n📋 STEP 4: User Profile Check');
        console.log('─'.repeat(80));
        
        const userProfiles = await db.collection('users').find({}).limit(10).toArray();
        console.log(`📊 Found ${userProfiles.length} user profiles in database`);
        
        if (userProfiles.length > 0) {
            console.log('\n👤 Sample User Profiles:');
            userProfiles.slice(0, 5).forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email || user.name || user.firebaseUid}`);
                console.log(`      Firebase UID: ${user.firebaseUid}`);
                console.log(`      Role: ${user.role || 'Not specified'}`);
                console.log(`      FCM Tokens: Mobile(${!!user.mobileFcmToken}) Web(${!!user.webFcmToken})`);
                console.log('');
            });
        }
        
        // ========== STEP 5: Recommendations ==========
        console.log('\n📋 STEP 5: Recommendations by User Type');
        console.log('─'.repeat(80));
        
        console.log('🚗 DRIVER NOTIFICATIONS:');
        if (userTypes.drivers.length > 0) {
            console.log('   ✅ Drivers have notifications');
            console.log('   📱 Test with: drivertest@gmail.com');
            console.log('   🔧 Status: Ready to test');
        } else {
            console.log('   ❌ No driver notifications found');
            console.log('   🔧 Action: Create driver test data');
        }
        
        console.log('\n👤 CUSTOMER NOTIFICATIONS:');
        if (userTypes.customers.length > 0) {
            console.log('   ✅ Customers have notifications');
            console.log('   📱 Test with customer app');
            console.log('   🔧 Status: Ready to test');
        } else {
            console.log('   ❌ No customer notifications found');
            console.log('   🔧 Action: Create customer test data');
        }
        
        console.log('\n🏢 CLIENT NOTIFICATIONS:');
        if (userTypes.clients.length > 0) {
            console.log('   ✅ Clients have notifications');
            console.log('   📱 Test with client app');
            console.log('   🔧 Status: Ready to test');
        } else {
            console.log('   ❌ No client notifications found');
            console.log('   🔧 Action: Create client test data');
        }
        
        // ========== STEP 6: Create Test Data Recommendations ==========
        console.log('\n📋 STEP 6: Test Data Creation Recommendations');
        console.log('─'.repeat(80));
        
        console.log('💡 To test all user types, create:');
        
        if (userTypes.customers.length === 0) {
            console.log('\n👤 CUSTOMER TEST DATA:');
            console.log('   1. Create customer user profile');
            console.log('   2. Create customer notifications (trip updates, roster changes)');
            console.log('   3. Register FCM tokens for customer');
        }
        
        if (userTypes.clients.length === 0) {
            console.log('\n🏢 CLIENT TEST DATA:');
            console.log('   1. Create client user profile');
            console.log('   2. Create client notifications (billing, reports, analytics)');
            console.log('   3. Register FCM tokens for client');
        }
        
        console.log('\n🔧 QUICK SETUP COMMANDS:');
        console.log('   node create-customer-test-data.js');
        console.log('   node create-client-test-data.js');
        console.log('   node fix-fcm-tokens-all-users.js');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '👥'.repeat(60));
        console.log('✅ ALL USER TYPES NOTIFICATION TEST COMPLETED');
        console.log('👥'.repeat(60) + '\n');
    }
}

async function testUserNotifications(db, userId, userType, userEmail) {
    console.log(`\n${userType} Test (${userEmail}):`);
    console.log(`   User ID: ${userId}`);
    
    const notifications = await db.collection('notifications')
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
    
    const unreadCount = await db.collection('notifications')
        .countDocuments({ userId: userId, isRead: false });
    
    const totalCount = await db.collection('notifications')
        .countDocuments({ userId: userId });
    
    console.log(`   📊 Total: ${totalCount}, Unread: ${unreadCount}`);
    
    if (notifications.length > 0) {
        console.log('   ✅ Has notifications - Ready to test');
        console.log('   📋 Recent notifications:');
        notifications.slice(0, 3).forEach((notif, index) => {
            console.log(`      ${index + 1}. ${notif.title} (${notif.type})`);
        });
    } else {
        console.log('   ❌ No notifications found');
        console.log('   🔧 Action needed: Create test notifications');
    }
    
    // Check user profile
    const userProfile = await db.collection('users').findOne({ firebaseUid: userId });
    if (userProfile) {
        console.log('   👤 User profile: ✅ Exists');
        console.log(`   📱 FCM tokens: Mobile(${!!userProfile.mobileFcmToken}) Web(${!!userProfile.webFcmToken})`);
    } else {
        console.log('   👤 User profile: ❌ Missing');
        console.log('   🔧 Action needed: Create user profile');
    }
}

testAllUserTypesNotifications();