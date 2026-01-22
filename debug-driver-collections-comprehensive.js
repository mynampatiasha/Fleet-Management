const { MongoClient } = require('mongodb');

async function debugDriverCollections() {
    let client;
    
    try {
        console.log('🔍 COMPREHENSIVE DRIVER COLLECTION ANALYSIS');
        console.log('='.repeat(80));
        
        // Connect to MongoDB
        const uri = 'mongodb://localhost:27017';
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db('abra_fleet_management');
        
        console.log('✅ Connected to MongoDB');
        
        // Test driver email
        const testDriverEmail = 'rajesh.kumar@abrafleet.com';
        const testDriverUid = 'aVIF9Ahluig993fCNyZRrIDC3KO2';
        
        console.log('\n📧 Testing with driver email:', testDriverEmail);
        console.log('🆔 Testing with Firebase UID:', testDriverUid);
        
        // Check all collections that might contain driver data
        const collectionsToCheck = [
            'drivers',
            'admin_users', 
            'employee_admins',
            'users',
            'customers',
            'clients'
        ];
        
        console.log('\n🗂️  CHECKING ALL COLLECTIONS:');
        console.log('='.repeat(80));
        
        for (const collectionName of collectionsToCheck) {
            console.log(`\n📁 Collection: ${collectionName}`);
            console.log('-'.repeat(40));
            
            try {
                // Check total count
                const totalCount = await db.collection(collectionName).countDocuments();
                console.log(`   Total documents: ${totalCount}`);
                
                if (totalCount === 0) {
                    console.log('   ⚠️  Collection is empty');
                    continue;
                }
                
                // Search by email
                const byEmail = await db.collection(collectionName).findOne({
                    $or: [
                        { email: testDriverEmail },
                        { 'personalInfo.email': testDriverEmail },
                        { 'contactInfo.email': testDriverEmail }
                    ]
                });
                
                if (byEmail) {
                    console.log('   ✅ Found by EMAIL:');
                    console.log('      - _id:', byEmail._id);
                    console.log('      - firebaseUid:', byEmail.firebaseUid || byEmail.uid || 'NOT SET');
                    console.log('      - role:', byEmail.role || 'NOT SET');
                    console.log('      - status:', byEmail.status || byEmail.isActive || 'NOT SET');
                    console.log('      - name:', byEmail.name || byEmail.personalInfo?.firstName || 'NOT SET');
                    console.log('      - driverId:', byEmail.driverId || 'NOT SET');
                } else {
                    console.log('   ❌ NOT found by email');
                }
                
                // Search by Firebase UID
                const byUid = await db.collection(collectionName).findOne({
                    $or: [
                        { firebaseUid: testDriverUid },
                        { uid: testDriverUid }
                    ]
                });
                
                if (byUid) {
                    console.log('   ✅ Found by FIREBASE UID:');
                    console.log('      - _id:', byUid._id);
                    console.log('      - email:', byUid.email || byUid.personalInfo?.email || 'NOT SET');
                    console.log('      - role:', byUid.role || 'NOT SET');
                    console.log('      - status:', byUid.status || byUid.isActive || 'NOT SET');
                    console.log('      - name:', byUid.name || byUid.personalInfo?.firstName || 'NOT SET');
                    console.log('      - driverId:', byUid.driverId || 'NOT SET');
                } else {
                    console.log('   ❌ NOT found by Firebase UID');
                }
                
                // Show sample documents to understand structure
                if (totalCount > 0 && totalCount <= 5) {
                    console.log('   📋 Sample documents:');
                    const samples = await db.collection(collectionName).find({}).limit(3).toArray();
                    samples.forEach((doc, index) => {
                        console.log(`      Sample ${index + 1}:`);
                        console.log('         - _id:', doc._id);
                        console.log('         - email:', doc.email || doc.personalInfo?.email || 'NOT SET');
                        console.log('         - firebaseUid:', doc.firebaseUid || doc.uid || 'NOT SET');
                        console.log('         - role:', doc.role || 'NOT SET');
                        console.log('         - driverId:', doc.driverId || 'NOT SET');
                    });
                }
                
            } catch (error) {
                console.log(`   ❌ Error checking collection: ${error.message}`);
            }
        }
        
        console.log('\n🔍 DRIVER-SPECIFIC ANALYSIS:');
        console.log('='.repeat(80));
        
        // Check drivers collection structure
        const driversCount = await db.collection('drivers').countDocuments();
        console.log(`\n📊 Drivers collection has ${driversCount} documents`);
        
        if (driversCount > 0) {
            // Get all drivers to see structure
            const allDrivers = await db.collection('drivers').find({}).limit(10).toArray();
            console.log('\n👥 All drivers in collection:');
            allDrivers.forEach((driver, index) => {
                console.log(`   Driver ${index + 1}:`);
                console.log('      - _id:', driver._id);
                console.log('      - driverId:', driver.driverId || 'NOT SET');
                console.log('      - email:', driver.personalInfo?.email || driver.email || 'NOT SET');
                console.log('      - firebaseUid:', driver.firebaseUid || driver.uid || 'NOT SET');
                console.log('      - name:', driver.personalInfo?.firstName || driver.name || 'NOT SET');
                console.log('      - status:', driver.status || 'NOT SET');
            });
        }
        
        console.log('\n🔍 ADMIN_USERS ANALYSIS:');
        console.log('='.repeat(80));
        
        // Check admin_users collection for drivers
        const adminUsersWithDriverRole = await db.collection('admin_users').find({
            role: 'driver'
        }).toArray();
        
        console.log(`\n👤 Found ${adminUsersWithDriverRole.length} admin_users with driver role:`);
        adminUsersWithDriverRole.forEach((user, index) => {
            console.log(`   Admin User ${index + 1}:`);
            console.log('      - _id:', user._id);
            console.log('      - email:', user.email || 'NOT SET');
            console.log('      - firebaseUid:', user.firebaseUid || 'NOT SET');
            console.log('      - role:', user.role);
            console.log('      - status:', user.status || user.isActive || 'NOT SET');
            console.log('      - driverId:', user.driverId || 'NOT SET');
        });
        
        console.log('\n🎯 AUTHENTICATION FLOW SIMULATION:');
        console.log('='.repeat(80));
        
        // Simulate the auth middleware flow
        console.log('\n🔐 Simulating auth middleware for:', testDriverEmail);
        
        const collections = ['users', 'admin_users', 'employee_admins', 'drivers', 'customers', 'clients'];
        let foundUser = null;
        let foundIn = null;
        
        for (const collectionName of collections) {
            const user = await db.collection(collectionName).findOne({ 
                $or: [
                    { firebaseUid: testDriverUid },
                    { email: testDriverEmail }
                ]
            });
            
            if (user) {
                foundUser = user;
                foundIn = collectionName;
                console.log(`   ✅ User found in ${collectionName}`);
                break;
            }
        }
        
        if (foundUser) {
            console.log('\n📋 User details from auth flow:');
            console.log('   - Collection:', foundIn);
            console.log('   - Role:', foundUser.role || 'NOT SET');
            console.log('   - Status:', foundUser.status || foundUser.isActive || 'NOT SET');
            console.log('   - Firebase UID:', foundUser.firebaseUid || foundUser.uid || 'NOT SET');
            console.log('   - Email:', foundUser.email || foundUser.personalInfo?.email || 'NOT SET');
            console.log('   - Driver ID:', foundUser.driverId || 'NOT SET');
            
            // Check if user is active
            const isActive = foundUser.isActive !== false && 
                           (!foundUser.status || foundUser.status === 'active');
            console.log('   - Is Active:', isActive);
            
            if (!isActive) {
                console.log('   ⚠️  USER ACCOUNT IS INACTIVE - This would cause 403 errors!');
            }
        } else {
            console.log('   ❌ User NOT found in any collection');
        }
        
        console.log('\n🚗 DRIVER ENDPOINT REQUIREMENTS:');
        console.log('='.repeat(80));
        
        // Check what driver endpoints need
        console.log('\n📊 Driver Reports endpoint requirements:');
        console.log('   - Needs: req.user.uid (Firebase UID)');
        console.log('   - Searches trips by: driverId field');
        console.log('   - Maps Firebase UID to driverId via admin_users collection');
        
        console.log('\n🚗 Driver Profile endpoint requirements:');
        console.log('   - Needs: req.user.uid (Firebase UID)');
        console.log('   - Searches drivers collection by: firebaseUid or uid');
        console.log('   - Also searches by: personalInfo.email');
        
        console.log('\n🛣️  Driver Route endpoint requirements:');
        console.log('   - Needs: req.user.uid (Firebase UID)');
        console.log('   - Searches drivers collection by: uid field');
        console.log('   - Then searches rosters by: driverId field');
        
        // Check if there's a mapping issue
        if (foundUser && foundIn === 'admin_users' && foundUser.role === 'driver') {
            console.log('\n🔍 CHECKING DRIVER MAPPING:');
            console.log('='.repeat(40));
            
            const driverRecord = await db.collection('drivers').findOne({
                $or: [
                    { uid: foundUser.firebaseUid },
                    { firebaseUid: foundUser.firebaseUid },
                    { driverId: foundUser.driverId },
                    { 'personalInfo.email': foundUser.email }
                ]
            });
            
            if (driverRecord) {
                console.log('   ✅ Found corresponding driver record:');
                console.log('      - Driver ID:', driverRecord.driverId);
                console.log('      - Firebase UID:', driverRecord.firebaseUid || driverRecord.uid);
                console.log('      - Email:', driverRecord.personalInfo?.email);
            } else {
                console.log('   ❌ NO corresponding driver record found!');
                console.log('   🚨 This is likely the cause of 403 errors!');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (client) {
            await client.close();
            console.log('\n✅ MongoDB connection closed');
        }
    }
}

debugDriverCollections();