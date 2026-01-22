const { MongoClient } = require('mongodb');

async function createPoojaJoshiUser() {
    console.log('👤 Creating Pooja Joshi User Account');
    console.log('Email: pooja.joshi@wipro.com');
    console.log('Organization: Wipro');
    console.log('=' .repeat(50));

    const mongoUrl = 'mongodb://localhost:27017';
    const dbName = 'abra_fleet_management';
    
    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(mongoUrl);
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(dbName);
        
        // Create user in users collection (without password hashing for now)
        const usersCollection = db.collection('users');
        
        const userData = {
            email: 'pooja.joshi@wipro.com',
            password: 'pooja.joshi', // Plain text for testing - should be hashed in production
            name: 'Pooja Joshi',
            firstName: 'Pooja',
            lastName: 'Joshi',
            organization: 'Wipro',
            role: 'client',
            permissions: [
                'billing_access',
                'reports_view',
                'client_dashboard',
                'trip_management'
            ],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firebaseUID: null,
            profile: {
                company: 'Wipro',
                department: 'IT Services',
                designation: 'Manager',
                phone: '+91-9876543210',
                address: 'Wipro Campus, Bangalore'
            }
        };

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: userData.email });
        
        if (existingUser) {
            console.log('⚠️  User already exists, updating...');
            
            await usersCollection.updateOne(
                { email: userData.email },
                { 
                    $set: {
                        ...userData,
                        updatedAt: new Date()
                    }
                }
            );
            console.log('✅ User updated successfully');
        } else {
            const result = await usersCollection.insertOne(userData);
            console.log('✅ User created successfully');
            console.log('User ID:', result.insertedId);
        }

        // Create user in admin_users collection
        const adminUsersCollection = db.collection('admin_users');
        
        const adminUserData = {
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi',
            role: 'client_admin',
            organization: 'Wipro',
            permissions: {
                billing: true,
                reports: true,
                user_management: false,
                vehicle_management: false,
                trip_management: true,
                client_dashboard: true
            },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const existingAdminUser = await adminUsersCollection.findOne({ email: adminUserData.email });
        
        if (!existingAdminUser) {
            await adminUsersCollection.insertOne(adminUserData);
            console.log('✅ Admin user record created');
        } else {
            await adminUsersCollection.updateOne(
                { email: adminUserData.email },
                { $set: adminUserData }
            );
            console.log('✅ Admin user record updated');
        }

        // Create billing user record
        const billingUsersCollection = db.collection('billing_users');
        
        const billingUserData = {
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi',
            organization: 'Wipro',
            billingAccess: true,
            invoiceAccess: true,
            reportsAccess: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const existingBillingUser = await billingUsersCollection.findOne({ email: billingUserData.email });
        
        if (!existingBillingUser) {
            await billingUsersCollection.insertOne(billingUserData);
            console.log('✅ Billing user record created');
        } else {
            await billingUsersCollection.updateOne(
                { email: billingUserData.email },
                { $set: billingUserData }
            );
            console.log('✅ Billing user record updated');
        }

        // Also add to employees collection for HRM access
        const employeesCollection = db.collection('employees');
        
        const employeeData = {
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi',
            firstName: 'Pooja',
            lastName: 'Joshi',
            organization: 'Wipro',
            department: 'IT Services',
            designation: 'Manager',
            phone: '+91-9876543210',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const existingEmployee = await employeesCollection.findOne({ email: employeeData.email });
        
        if (!existingEmployee) {
            await employeesCollection.insertOne(employeeData);
            console.log('✅ Employee record created');
        } else {
            console.log('ℹ️  Employee record already exists');
        }

        console.log('\n🎉 USER CREATION SUMMARY');
        console.log('=' .repeat(50));
        console.log('✅ User account: CREATED/UPDATED');
        console.log('✅ Admin permissions: SET');
        console.log('✅ Billing access: ENABLED');
        console.log('✅ Employee record: CREATED');
        console.log('✅ Password: SET (pooja.joshi)');
        console.log('✅ Organization: Wipro');
        console.log('✅ Role: Client Admin');

        console.log('\n📋 LOGIN CREDENTIALS');
        console.log('Username: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Access Level: Client Admin with Billing');

        // Verify the user was created
        const verifyUser = await usersCollection.findOne({ email: 'pooja.joshi@wipro.com' });
        console.log('\n🔍 VERIFICATION');
        console.log('User exists in database:', verifyUser ? 'YES' : 'NO');
        if (verifyUser) {
            console.log('User role:', verifyUser.role);
            console.log('User permissions:', verifyUser.permissions);
        }

    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        console.error(error);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 MongoDB connection closed');
        }
    }
}

// Run the user creation
createPoojaJoshiUser().catch(console.error);