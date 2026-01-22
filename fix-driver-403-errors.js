const { MongoClient } = require('mongodb');

async function fixDriver403Errors() {
    const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        
        console.log('\n🔧 FIXING DRIVER 403 ERRORS');
        console.log('='.repeat(60));
        
        // Driver details from previous analysis
        const driverFirebaseUid = 'aVIF9Ahluig993fCNyZRrIDC3KO2';
        const driverEmail = 'rajesh.kumar@abrafleet.com';
        const driverId = 'DRV-100001';
        
        console.log('📧 Driver Email:', driverEmail);
        console.log('🆔 Firebase UID:', driverFirebaseUid);
        console.log('🚗 Driver ID:', driverId);
        
        // Step 1: Check if admin_users record exists
        console.log('\n1️⃣ CHECKING ADMIN_USERS RECORD');
        console.log('-'.repeat(40));
        
        const existingAdminUser = await db.collection('admin_users').findOne({
            $or: [
                { firebaseUid: driverFirebaseUid },
                { email: driverEmail }
            ]
        });
        
        if (existingAdminUser) {
            console.log('✅ Admin user record already exists');
            console.log('   - ID:', existingAdminUser._id);
            console.log('   - Role:', existingAdminUser.role);
            console.log('   - Driver ID:', existingAdminUser.driverId);
        } else {
            console.log('❌ Admin user record missing - creating...');
            
            // Create admin_users record
            const adminUserRecord = {
                firebaseUid: driverFirebaseUid,
                email: driverEmail,
                name: 'Rajesh Kumar',
                role: 'driver',
                status: 'active',
                isActive: true,
                driverId: driverId,
                modules: ['dashboard', 'reports', 'routes', 'profile'],
                permissions: {
                    dashboard: true,
                    reports: true,
                    routes: true,
                    profile: true
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await db.collection('admin_users').insertOne(adminUserRecord);
            console.log('✅ Admin user record created');
            console.log('   - ID:', result.insertedId);
            console.log('   - Mapped Firebase UID → Driver ID');
        }
        
        // Step 2: Verify driver record has both uid and firebaseUid
        console.log('\n2️⃣ CHECKING DRIVER RECORD CONSISTENCY');
        console.log('-'.repeat(40));
        
        const driverRecord = await db.collection('drivers').findOne({
            $or: [
                { firebaseUid: driverFirebaseUid },
                { driverId: driverId }
            ]
        });
        
        if (driverRecord) {
            console.log('✅ Driver record found');
            console.log('   - Firebase UID:', driverRecord.firebaseUid);
            console.log('   - UID field:', driverRecord.uid);
            console.log('   - Driver ID:', driverRecord.driverId);
            
            // Ensure both uid and firebaseUid are set
            if (!driverRecord.uid || driverRecord.uid !== driverFirebaseUid) {
                console.log('🔧 Updating driver record with consistent UIDs...');
                
                await db.collection('drivers').updateOne(
                    { _id: driverRecord._id },
                    {
                        $set: {
                            uid: driverFirebaseUid,
                            firebaseUid: driverFirebaseUid,
                            updatedAt: new Date()
                        }
                    }
                );
                console.log('✅ Driver record updated with consistent UIDs');
            } else {
                console.log('✅ Driver record UIDs are consistent');
            }
        } else {
            console.log('❌ Driver record not found!');
        }
        
        // Step 3: Create sample trip data for testing
        console.log('\n3️⃣ ENSURING TEST DATA EXISTS');
        console.log('-'.repeat(40));
        
        const existingTrips = await db.collection('trips').countDocuments({
            driverId: driverId
        });
        
        console.log(`📊 Found ${existingTrips} trips for driver ${driverId}`);
        
        if (existingTrips === 0) {
            console.log('🔧 Creating sample trip data...');
            
            const sampleTrips = [
                {
                    tripNumber: 'TR-001',
                    driverId: driverId,
                    status: 'completed',
                    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                    endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
                    distance: 25.5,
                    rating: 4.5,
                    pickupLocation: 'Koramangala',
                    dropoffLocation: 'Electronic City',
                    createdAt: new Date()
                },
                {
                    tripNumber: 'TR-002',
                    driverId: driverId,
                    status: 'completed',
                    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                    distance: 15.2,
                    rating: 4.8,
                    pickupLocation: 'Whitefield',
                    dropoffLocation: 'MG Road',
                    createdAt: new Date()
                }
            ];
            
            await db.collection('trips').insertMany(sampleTrips);
            console.log(`✅ Created ${sampleTrips.length} sample trips`);
        }
        
        // Step 4: Create sample roster data
        const existingRosters = await db.collection('rosters').countDocuments({
            driverId: driverId
        });
        
        console.log(`📊 Found ${existingRosters} rosters for driver ${driverId}`);
        
        if (existingRosters === 0) {
            console.log('🔧 Creating sample roster data...');
            
            const sampleRoster = {
                driverId: driverId,
                customerName: 'Test Customer',
                customerPhone: '+91-9876543210',
                customerEmail: 'test.customer@example.com',
                pickupLocation: 'HSR Layout',
                dropLocation: 'Koramangala',
                pickupTime: '09:00',
                status: 'assigned',
                tripType: 'pickup',
                vehicleNumber: 'KA-01-AB-1234',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await db.collection('rosters').insertOne(sampleRoster);
            console.log('✅ Created sample roster');
        }
        
        console.log('\n✅ DRIVER 403 ERROR FIXES COMPLETED!');
        console.log('='.repeat(60));
        console.log('🎯 What was fixed:');
        console.log('   1. ✅ Created/verified admin_users record');
        console.log('   2. ✅ Ensured consistent UID fields in driver record');
        console.log('   3. ✅ Created sample data for testing');
        console.log('');
        console.log('🧪 Next steps:');
        console.log('   1. Test driver endpoints with proper authentication');
        console.log('   2. Verify all endpoints return data instead of 403');
        console.log('   3. Update other driver endpoints if needed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB connection closed');
    }
}

fixDriver403Errors();