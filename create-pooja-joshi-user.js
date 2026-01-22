const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

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
        
        // Hash the password
        const hashedPassword = await bcrypt.hash('pooja.joshi', 10);
        console.log('🔐 Password hashed successfully');

        // Create user in users collection
        const usersCollection = db.collection('users');
        
        const userData = {
            email: 'pooja.joshi@wipro.com',
            password: hashedPassword,
            name: 'Pooja Joshi',
            firstName: 'Pooja',
            lastName: 'Joshi',
            organization: 'Wipro',
            role: 'client', // or 'admin' if needed
            permissions: [
                'billing_access',
                'reports_view',
                'client_dashboard',
                'trip_management'
            ],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firebaseUID: null, // Will be set when user logs in via Firebase
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

        // Create user in admin_users collection for admin access
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
            console.log('ℹ️  Admin user record already exists');
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
            console.log('ℹ️  Billing user record already exists');
        }

        console.log('\n🎉 USER CREATION SUMMARY');
        console.log('=' .repeat(50));
        console.log('✅ User account: CREATED/UPDATED');
        console.log('✅ Admin permissions: SET');
        console.log('✅ Billing access: ENABLED');
        console.log('✅ Password: SET (pooja.joshi)');
        console.log('✅ Organization: Wipro');
        console.log('✅ Role: Client Admin');

        console.log('\n📋 LOGIN CREDENTIALS');
        console.log('Username: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Access Level: Client Admin with Billing');

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