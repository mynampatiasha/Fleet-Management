const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkDriverCollections() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        
        // Check admin_users collection
        console.log('\n1️⃣ Checking admin_users collection...');
        const adminUsersCollection = db.collection('admin_users');
        const adminDriver = await adminUsersCollection.findOne({
            email: 'rajesh.kumar@abrafleet.com'
        });
        
        if (adminDriver) {
            console.log('✅ Found in admin_users:');
            console.log(`   Name: ${adminDriver.name}`);
            console.log(`   Email: ${adminDriver.email}`);
            console.log(`   Role: ${adminDriver.role}`);
            console.log(`   Phone: ${adminDriver.phone || 'N/A'}`);
        } else {
            console.log('❌ Not found in admin_users');
        }
        
        // Check users collection
        console.log('\n2️⃣ Checking users collection...');
        const usersCollection = db.collection('users');
        const userDriver = await usersCollection.findOne({
            email: 'rajesh.kumar@abrafleet.com'
        });
        
        if (userDriver) {
            console.log('✅ Found in users:');
            console.log(`   Name: ${userDriver.name}`);
            console.log(`   Email: ${userDriver.email}`);
            console.log(`   Role: ${userDriver.role}`);
            console.log(`   Phone: ${userDriver.phone || 'N/A'}`);
        } else {
            console.log('❌ Not found in users');
        }
        
        // Check drivers collection
        console.log('\n3️⃣ Checking drivers collection...');
        const driversCollection = db.collection('drivers');
        const driverRecord = await driversCollection.findOne({
            email: 'rajesh.kumar@abrafleet.com'
        });
        
        if (driverRecord) {
            console.log('✅ Found in drivers:');
            console.log(`   Name: ${driverRecord.name}`);
            console.log(`   Email: ${driverRecord.email}`);
            console.log(`   Phone: ${driverRecord.phone || 'N/A'}`);
        } else {
            console.log('❌ Not found in drivers');
        }
        
        // List all collections to see what's available
        console.log('\n📋 Available collections:');
        const collections = await db.listCollections().toArray();
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

checkDriverCollections();