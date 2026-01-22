const { MongoClient } = require('mongodb');

async function checkDriverCollections() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet_management');
        
        // Test driver details
        const testDriverEmail = 'rajesh.kumar@abrafleet.com';
        const testDriverUid = 'aVIF9Ahluig993fCNyZRrIDC3KO2';
        
        console.log('\n🔍 CHECKING DRIVER COLLECTIONS');
        console.log('='.repeat(60));
        console.log('📧 Test Email:', testDriverEmail);
        console.log('🆔 Test Firebase UID:', testDriverUid);
        
        // Collections to check
        const collections = [
            'drivers',
            'admin_users', 
            'employee_admins',
            'users',
            'customers',
            'clients'
        ];
        
        console.log('\n📁 COLLECTION ANALYSIS:');
        console.log('='.repeat(60));
        
        for (const collectionName of collections) {
            console.log(`\n📂 ${collectionName.toUpperCase()}`);
            console.log('-'.repeat(30));
            
            try {
                const totalCount = await db.collection(collectionName).countDocuments();
                console.log(`   Total documents: ${totalCount}`);
                
                if (totalCount === 0) {
                    console.log('   ⚠️  Empty collection');
                    continue;
                }
                
                // Search by email
                const byEmail = await db.collection(collectionName).findOne({
                    $or: [
                        { email: testDriverEmail },
                        { 'personalInfo.email': testDriverEmail }
                    ]
                });
                
                // Search by Firebase UID
                const byUid = await db.collection(collectionName).findOne({
                    $or: [
                        { firebaseUid: testDriverUid },
                        { uid: testDriverUid }
                    ]
                });
                
                if (byEmail || byUid) {
                    console.log('   ✅ DRIVER FOUND!');
                    const driver = byEmail || byUid;
                    console.log('      - _id:', driver._id);
                    console.log('      - email:', driver.email || driver.personalInfo?.email || 'NOT SET');
                    console.log('      - firebaseUid:', driver.firebaseUid || driver.uid || 'NOT SET');
                    console.log('      - role:', driver.role || 'NOT SET');
                    console.log('      - status:', driver.status || driver.isActive || 'NOT SET');
                    console.log('      - driverId:', driver.driverId || 'NOT SET');
                    console.log('      - name:', driver.name || driver.personalInfo?.firstName || 'NOT SET');
                } else {
                    console.log('   ❌ Driver not found');
                }
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
        console.log('\n🎯 AUTHENTICATION SIMULATION:');
        console.log('='.repeat(60));
        
        // Simulate auth middleware search order
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
                console.log(`✅ Auth would find user in: ${collectionName}`);
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
            
            // Check if user is active
            const isActive = foundUser.isActive !== false && 
                           (!foundUser.status || foundUser.status === 'active');
            console.log('   - Is Active:', isActive);
            
            if (!isActive) {
                console.log('   🚨 USER IS INACTIVE - This causes 403 errors!');
            }
        } else {
            console.log('❌ User NOT found in any collection');
        }
        
        console.log('\n🚗 DRIVER ENDPOINT ANALYSIS:');
        console.log('='.repeat(60));
        
        // Check what each endpoint needs
        console.log('\n1. Driver Profile (/api/drivers/profile):');
        console.log('   - Searches: drivers collection');
        console.log('   - By: firebaseUid, uid, personalInfo.email');
        
        console.log('\n2. Driver Reports (/api/driver/reports/*):');
        console.log('   - Uses: req.user.uid (Firebase UID)');
        console.log('   - Maps to driverId via admin_users collection');
        console.log('   - Searches trips by: driverId field');
        
        console.log('\n3. Driver Dashboard (/api/driver/dashboard/*):');
        console.log('   - Uses: req.user.uid directly');
        console.log('   - Searches trips/rosters by: driverId = req.user.uid');
        
        console.log('\n4. Driver Route (/api/driver/route/*):');
        console.log('   - Searches drivers collection by: uid field');
        console.log('   - Then searches rosters by: driverId field');
        
        // Check if there's a mapping issue
        if (foundUser && foundIn) {
            console.log('\n🔍 ENDPOINT COMPATIBILITY CHECK:');
            console.log('='.repeat(40));
            
            if (foundIn === 'drivers') {
                console.log('✅ Driver Profile: Will work (found in drivers collection)');
                console.log('✅ Driver Route: Will work (found in drivers collection)');
            } else {
                console.log('❌ Driver Profile: Will fail (not in drivers collection)');
                console.log('❌ Driver Route: Will fail (not in drivers collection)');
            }
            
            if (foundIn === 'admin_users' && foundUser.driverId) {
                console.log('✅ Driver Reports: Will work (has driverId mapping)');
            } else {
                console.log('❌ Driver Reports: May fail (no driverId mapping)');
            }
            
            console.log('❌ Driver Dashboard: Will likely fail (expects uid as driverId)');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB connection closed');
    }
}

checkDriverCollections();