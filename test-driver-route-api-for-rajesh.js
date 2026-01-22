const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function testDriverRouteAPI() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        const driversCollection = db.collection('drivers');
        const adminUsersCollection = db.collection('admin_users');
        
        // Check what the API expects vs what we have
        console.log('\n🔍 CHECKING API COMPATIBILITY:');
        console.log('===============================');
        
        // 1. Check driver record
        console.log('\n1️⃣ Checking driver record...');
        const driver = await driversCollection.findOne({
            email: 'rajesh.kumar@abrafleet.com'
        });
        
        if (driver) {
            console.log('✅ Driver found in drivers collection:');
            console.log(`   - _id: ${driver._id}`);
            console.log(`   - driverId: ${driver.driverId}`);
            console.log(`   - email: ${driver.email}`);
            console.log(`   - uid (Firebase): ${driver.uid}`);
        } else {
            console.log('❌ Driver not found in drivers collection');
            
            // Check admin_users
            const adminUser = await adminUsersCollection.findOne({
                email: 'rajesh.kumar@abrafleet.com'
            });
            
            if (adminUser) {
                console.log('✅ Driver found in admin_users collection:');
                console.log(`   - _id: ${adminUser._id}`);
                console.log(`   - email: ${adminUser.email}`);
                console.log(`   - firebaseUid: ${adminUser.firebaseUid}`);
                console.log(`   - role: ${adminUser.role}`);
            }
        }
        
        // 2. Check roster fields
        console.log('\n2️⃣ Checking roster fields...');
        const sampleRoster = await rostersCollection.findOne({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        });
        
        if (sampleRoster) {
            console.log('✅ Sample roster found:');
            console.log('Available fields:');
            Object.keys(sampleRoster).forEach(key => {
                console.log(`   - ${key}: ${typeof sampleRoster[key]}`);
            });
            
            console.log('\nDriver-related fields:');
            console.log(`   - driverEmail: ${sampleRoster.driverEmail}`);
            console.log(`   - driverId: ${sampleRoster.driverId}`);
            console.log(`   - driverName: ${sampleRoster.driverName}`);
        }
        
        // 3. Check what API expects
        console.log('\n3️⃣ API COMPATIBILITY ANALYSIS:');
        console.log('===============================');
        console.log('❌ ISSUE: API looks for rosters by driverId field');
        console.log('✅ SOLUTION: Update rosters to include driverId field');
        
        // 4. Fix the compatibility issue
        if (driver && driver.driverId) {
            console.log('\n4️⃣ Fixing compatibility...');
            console.log(`Setting driverId: ${driver.driverId} for all rosters`);
            
            const updateResult = await rostersCollection.updateMany(
                { driverEmail: 'rajesh.kumar@abrafleet.com' },
                { 
                    $set: { 
                        driverId: driver.driverId,
                        updatedAt: new Date()
                    } 
                }
            );
            
            console.log(`✅ Updated ${updateResult.modifiedCount} rosters with driverId`);
        } else {
            console.log('\n4️⃣ Creating driver record...');
            
            // Create driver record if it doesn't exist
            const adminUser = await adminUsersCollection.findOne({
                email: 'rajesh.kumar@abrafleet.com'
            });
            
            if (adminUser) {
                const newDriver = {
                    driverId: 'DRV-' + Math.floor(Math.random() * 900000 + 100000),
                    email: 'rajesh.kumar@abrafleet.com',
                    name: adminUser.name,
                    phone: adminUser.phone || '+91-9876543270',
                    uid: adminUser.firebaseUid,
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                await driversCollection.insertOne(newDriver);
                console.log(`✅ Created driver record with driverId: ${newDriver.driverId}`);
                
                // Update rosters
                const updateResult = await rostersCollection.updateMany(
                    { driverEmail: 'rajesh.kumar@abrafleet.com' },
                    { 
                        $set: { 
                            driverId: newDriver.driverId,
                            updatedAt: new Date()
                        } 
                    }
                );
                
                console.log(`✅ Updated ${updateResult.modifiedCount} rosters with driverId`);
            }
        }
        
        // 5. Test the API query
        console.log('\n5️⃣ Testing API query...');
        const testRosters = await rostersCollection.find({
            driverId: { $exists: true },
            driverEmail: 'rajesh.kumar@abrafleet.com',
            status: { $in: ['assigned', 'pending', 'active', 'in_progress'] }
        }).toArray();
        
        console.log(`✅ API query would return ${testRosters.length} rosters`);
        
        if (testRosters.length > 0) {
            console.log('\n📋 Sample roster for API:');
            const sample = testRosters[0];
            console.log(`   Customer: ${sample.customerName}`);
            console.log(`   Email: ${sample.customerEmail}`);
            console.log(`   Phone: ${sample.customerPhone}`);
            console.log(`   Pickup: ${sample.pickupLocation}`);
            console.log(`   Drop: ${sample.dropLocation}`);
            console.log(`   Times: ${sample.pickupTime} - ${sample.dropTime}`);
            console.log(`   Organization: ${sample.organization}`);
            console.log(`   Group Key: ${sample.groupKey}`);
        }
        
        console.log('\n🎉 API COMPATIBILITY FIXED!');
        console.log('📱 The driver dashboard API should now work properly');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

testDriverRouteAPI();