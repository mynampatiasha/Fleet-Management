const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function assignRostersToRajesh() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        const driversCollection = db.collection('admin_users');
        const vehiclesCollection = db.collection('vehicles');
        
        // Get driver details
        console.log('\n👤 Getting driver details...');
        const driver = await driversCollection.findOne({
            email: 'rajesh.kumar@abrafleet.com'
        });
        
        if (!driver) {
            console.log('❌ Driver not found');
            return;
        }
        
        console.log(`✅ Driver found: ${driver.name}`);
        
        // Get a vehicle for assignment (preferably one not assigned)
        console.log('\n🚗 Getting available vehicle...');
        const vehicle = await vehiclesCollection.findOne({
            status: { $in: ['active', 'available'] }
        });
        
        if (!vehicle) {
            console.log('❌ No available vehicle found');
            return;
        }
        
        console.log(`✅ Vehicle found: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
        
        // Get pending rosters
        console.log('\n📋 Getting pending rosters...');
        const pendingRosters = await rostersCollection.find({
            status: 'pending'
        }).toArray();
        
        console.log(`📊 Found ${pendingRosters.length} pending rosters`);
        
        if (pendingRosters.length === 0) {
            console.log('❌ No pending rosters to assign');
            return;
        }
        
        // Assign all pending rosters to Rajesh Kumar
        console.log('\n🔄 Assigning rosters to Rajesh Kumar...');
        
        const updateData = {
            driverName: driver.name,
            driverEmail: driver.email,
            driverPhone: driver.phone || '+91-9876543200',
            vehicleNumber: vehicle.vehicleNumber,
            vehicleType: vehicle.vehicleType,
            vehicleCapacity: vehicle.capacity || 7,
            status: 'assigned',
            assignedAt: new Date(),
            updatedAt: new Date()
        };
        
        const assignResult = await rostersCollection.updateMany(
            { status: 'pending' },
            { $set: updateData }
        );
        
        console.log(`✅ Assigned ${assignResult.modifiedCount} rosters to ${driver.name}`);
        
        // Get the updated rosters to display
        console.log('\n📝 Assigned rosters details:');
        const assignedRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).toArray();
        
        assignedRosters.forEach((roster, index) => {
            console.log(`\n${index + 1}. Customer: ${roster.customerName}`);
            console.log(`   Email: ${roster.customerEmail}`);
            console.log(`   Phone: ${roster.customerPhone}`);
            console.log(`   Route: ${roster.pickupLocation} → ${roster.dropLocation}`);
            console.log(`   Time: ${roster.pickupTime} - ${roster.dropTime}`);
            console.log(`   Organization: ${roster.organization}`);
            console.log(`   Driver: ${roster.driverName}`);
            console.log(`   Vehicle: ${roster.vehicleNumber} (${roster.vehicleType})`);
            console.log(`   Status: ${roster.status}`);
        });
        
        console.log('\n🎉 Assignment completed successfully!');
        console.log(`📱 Driver ${driver.name} now has ${assignedRosters.length} assigned customers`);
        console.log('🚗 Vehicle assigned:', vehicle.vehicleNumber);
        
        // Summary for driver dashboard
        console.log('\n📊 DRIVER DASHBOARD SUMMARY:');
        console.log('================================');
        console.log(`Driver: ${driver.name}`);
        console.log(`Email: ${driver.email}`);
        console.log(`Vehicle: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
        console.log(`Total Customers: ${assignedRosters.length}`);
        console.log(`Status: Ready for trips`);
        
        console.log('\n👥 CUSTOMER LIST:');
        assignedRosters.forEach((roster, index) => {
            console.log(`${index + 1}. ${roster.customerName} (${roster.customerPhone})`);
            console.log(`   📍 ${roster.pickupLocation} → ${roster.dropLocation}`);
            console.log(`   🕐 ${roster.pickupTime} - ${roster.dropTime}`);
            console.log(`   🏢 ${roster.organization}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

assignRostersToRajesh();