const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkPendingRosters() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        
        // Check pending rosters
        console.log('\n📋 Checking pending rosters...');
        const pendingRosters = await rostersCollection.find({
            status: 'pending'
        }).toArray();
        
        console.log(`📊 Found ${pendingRosters.length} pending rosters`);
        
        if (pendingRosters.length > 0) {
            console.log('\n📝 Pending rosters details:');
            pendingRosters.forEach((roster, index) => {
                console.log(`\n${index + 1}. Roster ID: ${roster._id}`);
                console.log(`   Customer: ${roster.customerName || 'N/A'}`);
                console.log(`   Email: ${roster.customerEmail || 'N/A'}`);
                console.log(`   Phone: ${roster.customerPhone || 'N/A'}`);
                console.log(`   Pickup: ${roster.pickupLocation || 'N/A'}`);
                console.log(`   Drop: ${roster.dropLocation || 'N/A'}`);
                console.log(`   Time: ${roster.pickupTime || 'N/A'}`);
                console.log(`   Organization: ${roster.organization || 'N/A'}`);
                console.log(`   Status: ${roster.status}`);
                console.log(`   Created: ${roster.createdAt || 'N/A'}`);
            });
        }
        
        // Check if there are any rosters assigned to rajesh.kumar@abrafleet.com
        console.log('\n🔍 Checking rosters assigned to rajesh.kumar@abrafleet.com...');
        const assignedRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).toArray();
        
        console.log(`📊 Found ${assignedRosters.length} rosters assigned to Rajesh Kumar`);
        
        if (assignedRosters.length > 0) {
            console.log('\n📝 Assigned rosters details:');
            assignedRosters.forEach((roster, index) => {
                console.log(`\n${index + 1}. Roster ID: ${roster._id}`);
                console.log(`   Customer: ${roster.customerName || 'N/A'}`);
                console.log(`   Status: ${roster.status}`);
                console.log(`   Driver: ${roster.driverName || 'N/A'}`);
                console.log(`   Vehicle: ${roster.vehicleNumber || 'N/A'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

checkPendingRosters();