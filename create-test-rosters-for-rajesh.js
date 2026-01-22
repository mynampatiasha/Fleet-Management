const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function createTestRosters() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        
        // Create test pending rosters
        const testRosters = [
            {
                _id: new ObjectId(),
                customerName: 'Priya Sharma',
                customerEmail: 'priya.sharma@techcorp.com',
                customerPhone: '+91-9876543210',
                pickupLocation: 'Electronic City, Bangalore',
                dropLocation: 'Koramangala, Bangalore',
                pickupTime: '09:00 AM',
                dropTime: '06:00 PM',
                organization: 'TechCorp Solutions',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                routeType: 'pickup_drop',
                seatRequired: 1,
                specialRequirements: 'None'
            },
            {
                _id: new ObjectId(),
                customerName: 'Amit Kumar',
                customerEmail: 'amit.kumar@innovate.com',
                customerPhone: '+91-9876543211',
                pickupLocation: 'Whitefield, Bangalore',
                dropLocation: 'MG Road, Bangalore',
                pickupTime: '08:30 AM',
                dropTime: '05:30 PM',
                organization: 'Innovate Tech',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                routeType: 'pickup_drop',
                seatRequired: 1,
                specialRequirements: 'None'
            },
            {
                _id: new ObjectId(),
                customerName: 'Sneha Reddy',
                customerEmail: 'sneha.reddy@globaltech.com',
                customerPhone: '+91-9876543212',
                pickupLocation: 'HSR Layout, Bangalore',
                dropLocation: 'Brigade Road, Bangalore',
                pickupTime: '09:15 AM',
                dropTime: '06:15 PM',
                organization: 'Global Tech',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                routeType: 'pickup_drop',
                seatRequired: 1,
                specialRequirements: 'None'
            },
            {
                _id: new ObjectId(),
                customerName: 'Rajesh Patel',
                customerEmail: 'rajesh.patel@startupinc.com',
                customerPhone: '+91-9876543213',
                pickupLocation: 'Indiranagar, Bangalore',
                dropLocation: 'Commercial Street, Bangalore',
                pickupTime: '08:45 AM',
                dropTime: '05:45 PM',
                organization: 'Startup Inc',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                routeType: 'pickup_drop',
                seatRequired: 1,
                specialRequirements: 'None'
            },
            {
                _id: new ObjectId(),
                customerName: 'Kavya Nair',
                customerEmail: 'kavya.nair@digitalsol.com',
                customerPhone: '+91-9876543214',
                customerPhone: '+91-9876543214',
                pickupLocation: 'Jayanagar, Bangalore',
                dropLocation: 'UB City Mall, Bangalore',
                pickupTime: '09:30 AM',
                dropTime: '06:30 PM',
                organization: 'Digital Solutions',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                routeType: 'pickup_drop',
                seatRequired: 1,
                specialRequirements: 'None'
            }
        ];
        
        console.log('\n📝 Creating test pending rosters...');
        const result = await rostersCollection.insertMany(testRosters);
        console.log(`✅ Created ${result.insertedCount} test rosters`);
        
        // Display created rosters
        console.log('\n📋 Created rosters:');
        testRosters.forEach((roster, index) => {
            console.log(`\n${index + 1}. ${roster.customerName}`);
            console.log(`   Email: ${roster.customerEmail}`);
            console.log(`   Phone: ${roster.customerPhone}`);
            console.log(`   Route: ${roster.pickupLocation} → ${roster.dropLocation}`);
            console.log(`   Time: ${roster.pickupTime} - ${roster.dropTime}`);
            console.log(`   Organization: ${roster.organization}`);
            console.log(`   Status: ${roster.status}`);
        });
        
        console.log('\n🎉 Test rosters created successfully!');
        console.log('📱 These rosters are now ready to be assigned to rajesh.kumar@abrafleet.com');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

createTestRosters();