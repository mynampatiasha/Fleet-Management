const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function updateRosterDetails() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        const vehiclesCollection = db.collection('vehicles');
        
        // Get a proper vehicle
        console.log('\n🚗 Getting a vehicle...');
        let vehicle = await vehiclesCollection.findOne({
            status: { $in: ['active', 'available'] }
        });
        
        if (!vehicle) {
            // Create a test vehicle if none exists
            console.log('🔧 Creating a test vehicle...');
            const testVehicle = {
                vehicleNumber: 'KA-01-AB-1234',
                vehicleType: 'SUV',
                capacity: 7,
                status: 'active',
                driverAssigned: 'rajesh.kumar@abrafleet.com',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await vehiclesCollection.insertOne(testVehicle);
            vehicle = testVehicle;
            console.log('✅ Test vehicle created');
        }
        
        console.log(`✅ Vehicle: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
        
        // Get assigned rosters for Rajesh Kumar
        console.log('\n📋 Getting assigned rosters...');
        const assignedRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).limit(5).toArray();
        
        console.log(`📊 Found ${assignedRosters.length} assigned rosters to update`);
        
        // Update roster details with complete information
        const updates = [
            {
                customerName: 'Priya Sharma',
                customerEmail: 'priya.sharma@techcorp.com',
                customerPhone: '+91-9876543210',
                pickupLocation: 'Electronic City Phase 1, Bangalore',
                dropLocation: 'Koramangala 4th Block, Bangalore',
                pickupTime: '09:00 AM',
                dropTime: '06:00 PM',
                organization: 'TechCorp Solutions',
                routeType: 'pickup_drop'
            },
            {
                customerName: 'Amit Kumar',
                customerEmail: 'amit.kumar@innovate.com',
                customerPhone: '+91-9876543211',
                pickupLocation: 'Whitefield ITPL, Bangalore',
                dropLocation: 'MG Road Metro Station, Bangalore',
                pickupTime: '08:30 AM',
                dropTime: '05:30 PM',
                organization: 'Innovate Tech',
                routeType: 'pickup_drop'
            },
            {
                customerName: 'Sneha Reddy',
                customerEmail: 'sneha.reddy@globaltech.com',
                customerPhone: '+91-9876543212',
                pickupLocation: 'HSR Layout Sector 2, Bangalore',
                dropLocation: 'Brigade Road, Bangalore',
                pickupTime: '09:15 AM',
                dropTime: '06:15 PM',
                organization: 'Global Tech',
                routeType: 'pickup_drop'
            },
            {
                customerName: 'Rajesh Patel',
                customerEmail: 'rajesh.patel@startupinc.com',
                customerPhone: '+91-9876543213',
                pickupLocation: 'Indiranagar 100 Feet Road, Bangalore',
                dropLocation: 'Commercial Street, Bangalore',
                pickupTime: '08:45 AM',
                dropTime: '05:45 PM',
                organization: 'Startup Inc',
                routeType: 'pickup_drop'
            },
            {
                customerName: 'Kavya Nair',
                customerEmail: 'kavya.nair@digitalsol.com',
                customerPhone: '+91-9876543214',
                pickupLocation: 'Jayanagar 4th Block, Bangalore',
                dropLocation: 'UB City Mall, Bangalore',
                pickupTime: '09:30 AM',
                dropTime: '06:30 PM',
                organization: 'Digital Solutions',
                routeType: 'pickup_drop'
            }
        ];
        
        console.log('\n🔄 Updating roster details...');
        
        for (let i = 0; i < Math.min(assignedRosters.length, updates.length); i++) {
            const roster = assignedRosters[i];
            const updateData = {
                ...updates[i],
                vehicleNumber: vehicle.vehicleNumber,
                vehicleType: vehicle.vehicleType,
                vehicleCapacity: vehicle.capacity,
                updatedAt: new Date()
            };
            
            await rostersCollection.updateOne(
                { _id: roster._id },
                { $set: updateData }
            );
            
            console.log(`✅ Updated roster for ${updates[i].customerName}`);
        }
        
        // Get updated rosters to display
        console.log('\n📝 Updated roster details:');
        const updatedRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).toArray();
        
        console.log('\n📊 COMPLETE DRIVER DASHBOARD DATA:');
        console.log('=====================================');
        console.log(`Driver: Rajesh Kumar`);
        console.log(`Email: rajesh.kumar@abrafleet.com`);
        console.log(`Phone: +91-9876543270`);
        console.log(`Vehicle: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
        console.log(`Vehicle Capacity: ${vehicle.capacity} seats`);
        console.log(`Total Customers: ${updatedRosters.length}`);
        console.log(`Status: Active`);
        
        console.log('\n👥 DETAILED CUSTOMER LIST:');
        console.log('===========================');
        
        updatedRosters.forEach((roster, index) => {
            console.log(`\n${index + 1}. ${roster.customerName || 'Customer ' + (index + 1)}`);
            console.log(`   📧 Email: ${roster.customerEmail || 'N/A'}`);
            console.log(`   📱 Phone: ${roster.customerPhone || 'N/A'}`);
            console.log(`   📍 Pickup: ${roster.pickupLocation || 'N/A'}`);
            console.log(`   📍 Drop: ${roster.dropLocation || 'N/A'}`);
            console.log(`   🕐 Time: ${roster.pickupTime || 'N/A'} - ${roster.dropTime || 'N/A'}`);
            console.log(`   🏢 Organization: ${roster.organization || 'N/A'}`);
            console.log(`   📊 Status: ${roster.status}`);
        });
        
        console.log('\n🎉 Roster details updated successfully!');
        console.log('📱 The driver dashboard should now display complete customer information');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

updateRosterDetails();