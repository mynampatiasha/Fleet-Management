// Debug Customer Notification 403 Error
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'abra_fleet';

async function debugCustomerNotification403() {
    console.log('\n' + '🔍'.repeat(60));
    console.log('🔍 DEBUGGING CUSTOMER NOTIFICATION 403 ERROR');
    console.log('🔍'.repeat(60));
    console.log('Timestamp:', new Date().toISOString());
    console.log('🔍'.repeat(60) + '\n');

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // ========== STEP 1: Check Current User ==========
        console.log('\n📋 STEP 1: Current User Analysis');
        console.log('─'.repeat(80));
        
        const currentFirebaseUid = 'b5aoloVR7xYI6SICibCIWecBaf82';
        console.log(`🔍 Current Firebase UID: ${currentFirebaseUid}`);
        
        // Check if user exists in users collection
        const currentUser = await db.collection('users').findOne({ 
            firebaseUid: currentFirebaseUid 
        });
        
        console.log(`👤 User Profile: ${currentUser ? '✅ Found' : '❌ Missing'}`);
        if (currentUser) {
            console.log(`   Email: ${currentUser.email}`);
            console.log(`   Role: ${currentUser.role}`);
            console.log(`   Organization: ${currentUser.organization || 'Not set'}`);
            console.log(`   Active: ${currentUser.isActive}`);
        }
        
        // Check notifications for current user
        const currentUserNotifications = await db.collection('notifications')
            .find({ userId: currentFirebaseUid })
            .limit(5)
            .toArray();
        
        console.log(`📬 Notifications for current user: ${currentUserNotifications.length}`);
        
        // ========== STEP 2: Check Test Customer User ==========
        console.log('\n📋 STEP 2: Test Customer User Analysis');
        console.log('─'.repeat(80));
        
        const testCustomerUid = 'customer_test_uid_123456789';
        console.log(`🔍 Test Customer UID: ${testCustomerUid}`);
        
        const testCustomerUser = await db.collection('users').findOne({ 
            firebaseUid: testCustomerUid 
        });
        
        console.log(`👤 Test Customer Profile: ${testCustomerUser ? '✅ Found' : '❌ Missing'}`);
        if (testCustomerUser) {
            console.log(`   Email: ${testCustomerUser.email}`);
            console.log(`   Role: ${testCustomerUser.role}`);
            console.log(`   Organization: ${testCustomerUser.organization || 'Not set'}`);
            console.log(`   Active: ${testCustomerUser.isActive}`);
        }
        
        const testCustomerNotifications = await db.collection('notifications')
            .find({ userId: testCustomerUid })
            .limit(5)
            .toArray();
        
        console.log(`📬 Notifications for test customer: ${testCustomerNotifications.length}`);
        
        // ========== STEP 3: Permission Analysis ==========
        console.log('\n📋 STEP 3: Permission Analysis');
        console.log('─'.repeat(80));
        
        console.log('🔍 ISSUE ANALYSIS:');
        console.log('');
        
        if (!currentUser) {
            console.log('❌ PROBLEM: Current user not found in database');
            console.log('   - Firebase UID exists but no user profile');
            console.log('   - Backend cannot determine user role/permissions');
            console.log('   - Results in 403 Forbidden error');
        } else if (currentUser.role !== 'customer') {
            console.log(`❌ PROBLEM: Current user role is '${currentUser.role}', not 'customer'`);
            console.log('   - User trying to access customer notifications');
            console.log('   - But user role doesn\'t match customer');
            console.log('   - Backend permission check fails');
        } else {
            console.log('✅ User profile and role look correct');
            console.log('   - Check backend permission middleware');
            console.log('   - Check API endpoint authentication');
        }
        
        // ========== STEP 4: Solutions ==========
        console.log('\n📋 STEP 4: Solutions');
        console.log('─'.repeat(80));
        
        console.log('🔧 SOLUTION OPTIONS:');
        console.log('');
        
        console.log('OPTION 1: Update Current User to Customer Role');
        console.log('   - Change current user role to "customer"');
        console.log('   - Update user profile with customer permissions');
        console.log('   - Keep same Firebase UID');
        console.log('');
        
        console.log('OPTION 2: Create Customer Firebase Account');
        console.log('   - Create Firebase Auth account for customertest@abrafleet.com');
        console.log('   - Login with customer credentials');
        console.log('   - Use customer Firebase UID');
        console.log('');
        
        console.log('OPTION 3: Temporarily Switch User Data');
        console.log('   - Copy customer notifications to current user ID');
        console.log('   - Test customer notifications with current login');
        console.log('   - Quick testing solution');
        
        // ========== STEP 5: Quick Fix Implementation ==========
        console.log('\n📋 STEP 5: Quick Fix - Update Current User to Customer');
        console.log('─'.repeat(80));
        
        if (currentUser) {
            console.log('🔧 Updating current user to customer role...');
            
            const updateResult = await db.collection('users').updateOne(
                { firebaseUid: currentFirebaseUid },
                { 
                    $set: { 
                        role: 'customer',
                        email: 'current-user-as-customer@abrafleet.com',
                        name: 'Current User (Customer Mode)',
                        organization: 'Test Organization',
                        updatedAt: new Date()
                    } 
                }
            );
            
            console.log(`✅ User role updated: ${updateResult.modifiedCount > 0 ? 'Success' : 'Failed'}`);
            
            // Copy customer notifications to current user
            console.log('🔧 Copying customer notifications to current user...');
            
            const customerNotifications = await db.collection('notifications')
                .find({ userId: testCustomerUid })
                .toArray();
            
            if (customerNotifications.length > 0) {
                // Update notifications to use current user ID
                const notificationsForCurrentUser = customerNotifications.map(notif => ({
                    ...notif,
                    _id: undefined, // Remove _id to create new documents
                    userId: currentFirebaseUid,
                    createdAt: new Date(notif.createdAt)
                }));
                
                const insertResult = await db.collection('notifications')
                    .insertMany(notificationsForCurrentUser);
                
                console.log(`✅ Copied ${insertResult.insertedCount} notifications to current user`);
            }
            
        } else {
            console.log('🔧 Creating user profile for current Firebase UID...');
            
            const newUser = {
                firebaseUid: currentFirebaseUid,
                email: 'current-user-customer@abrafleet.com',
                name: 'Current User (Customer)',
                role: 'customer',
                organization: 'Test Organization',
                mobileFcmToken: 'current_user_mobile_fcm_token',
                webFcmToken: 'current_user_web_fcm_token',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                profile: {
                    phone: '+91-9876543210',
                    address: 'Test Address, Bangalore',
                    employeeId: 'CURR001',
                    department: 'Operations'
                }
            };
            
            const insertResult = await db.collection('users').insertOne(newUser);
            console.log(`✅ Created user profile: ${insertResult.insertedId ? 'Success' : 'Failed'}`);
            
            // Copy customer notifications
            const customerNotifications = await db.collection('notifications')
                .find({ userId: testCustomerUid })
                .toArray();
            
            if (customerNotifications.length > 0) {
                const notificationsForCurrentUser = customerNotifications.map(notif => ({
                    ...notif,
                    _id: undefined,
                    userId: currentFirebaseUid,
                    createdAt: new Date(notif.createdAt)
                }));
                
                const notifInsertResult = await db.collection('notifications')
                    .insertMany(notificationsForCurrentUser);
                
                console.log(`✅ Copied ${notifInsertResult.insertedCount} notifications to current user`);
            }
        }
        
        // ========== STEP 6: Verification ==========
        console.log('\n📋 STEP 6: Verification');
        console.log('─'.repeat(80));
        
        const updatedUser = await db.collection('users').findOne({ 
            firebaseUid: currentFirebaseUid 
        });
        
        const updatedNotifications = await db.collection('notifications')
            .find({ userId: currentFirebaseUid })
            .toArray();
        
        console.log('✅ VERIFICATION RESULTS:');
        console.log(`   User Profile: ${updatedUser ? '✅ Exists' : '❌ Missing'}`);
        if (updatedUser) {
            console.log(`   Role: ${updatedUser.role}`);
            console.log(`   Email: ${updatedUser.email}`);
        }
        console.log(`   Notifications: ${updatedNotifications.length} found`);
        
        // ========== STEP 7: Testing Instructions ==========
        console.log('\n📋 STEP 7: Testing Instructions');
        console.log('─'.repeat(80));
        
        console.log('🧪 NOW TEST THE APP:');
        console.log('');
        console.log('1. REFRESH THE APP:');
        console.log('   - Pull down to refresh notifications screen');
        console.log('   - Or restart the app completely');
        console.log('');
        console.log('2. EXPECTED RESULTS:');
        console.log(`   - Should see ${updatedNotifications.length} customer notifications`);
        console.log('   - No more 403 Forbidden errors');
        console.log('   - Notifications should load properly');
        console.log('');
        console.log('3. IF STILL 403 ERROR:');
        console.log('   - Check backend authentication middleware');
        console.log('   - Verify API endpoint permissions');
        console.log('   - Check Firebase token validity');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
        
        console.log('\n' + '🔍'.repeat(60));
        console.log('✅ CUSTOMER NOTIFICATION 403 DEBUG COMPLETED');
        console.log('🔍'.repeat(60) + '\n');
    }
}

debugCustomerNotification403();