const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkRosterFields() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        const driversCollection = db.collection('drivers');
        
        // Check what fields exist in Rajesh's rosters
        console.log('\n📋 Checking roster fields for Rajesh Kumar...');
        const rajeshRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).limit(3).toArray();
        
        console.log(`📊 Found ${rajeshRosters.length} rosters`);
        
        if (rajeshRosters.length > 0) {
            console.log('\n🔍 Sample roster fields:');
            const sampleRoster = rajeshRosters[0];
            console.log('Available fields:', Object.keys(sampleRoster));
            console.log('\nDriver-related fields:');
            console.log('- driverEmail:', sampleRoster.driverEmail);
            console.log('- driverId:', sampleRoster.driverId);
            console.log('- driverName:', sampleRoster.driverName);
            console.log('- driverPhone:', sampleRoster.driverPhone);
        }
        
        // Check driver collection for Rajesh Kumar
        console.log('\n👤 Checking driver collection...');
        const driver = await driversCollection.findOne({
            email: 'rajesh.kumar@abrafleet.com'
        });
        
        if (driver) {
            console.log('✅ Driver found in drivers collection:');
            console.log('- _id:', driver._id);
            console.log('- driverId:', driver.driverId);
            console.log('- email:', driver.email);
            console.log('- name:', driver.name);
            console.log('- uid (Firebase):', driver.uid);
        } else {
            console.log('❌ Driver not found in drivers collection');
            
            // Check admin_users collection
            const adminUser = await db.collection('admin_users').findOne({
                email: 'rajesh.kumar@abrafleet.com'
            });
            
            if (adminUser) {
                console.log('✅ Driver found in admin_users collection:');
                console.log('- _id:', adminUser._id);
                console.log('- email:', adminUser.email);
                console.log('- name:', adminUser.name);
                console.log('- firebaseUid:', adminUser.firebaseUid);
                console.log('- role:', adminUser.role);
            }
        }
        
        // Check what the API expects vs what we have
        console.log('\n🔧 API COMPATIBILITY CHECK:');
        console.log('=====================================');
        console.log('API expects: rosters with driverId field');
        console.log('We have: rosters with driverEmail field');
        console.log('Solution: Update rosters to include driverId field');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

checkRosterFields();