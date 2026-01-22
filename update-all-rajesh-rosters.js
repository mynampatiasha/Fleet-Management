const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function updateAllRajeshRosters() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        const rostersCollection = db.collection('rosters');
        const vehiclesCollection = db.collection('vehicles');
        
        // Get or create a proper vehicle
        console.log('\n🚗 Setting up vehicle...');
        let vehicle = await vehiclesCollection.findOne({
            status: { $in: ['active', 'available'] }
        });
        
        if (!vehicle) {
            // Create a test vehicle
            const testVehicle = {
                vehicleNumber: 'KA-01-AB-1234',
                vehicleType: 'SUV',
                make: 'Toyota',
                model: 'Innova',
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
        
        // Get all rosters assigned to Rajesh Kumar
        console.log('\n📋 Getting all assigned rosters...');
        const assignedRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).toArray();
        
        console.log(`📊 Found ${assignedRosters.length} rosters to update`);
        
        // Complete customer data for all rosters
        const customerUpdates = [
            {
                customerName: 'Priya Sharma',
                customerEmail: 'priya.sharma@techcorp.com',
                customerPhone: '+91-9876543210',
                pickupLocation: 'Electronic City Phase 1, Bangalore',
                dropLocation: 'Koramangala 4th Block, Bangalore',
                pickupTime: '09:00 AM',
                dropTime: '06:00 PM',
                organization: 'TechCorp Solutions'
            },
            {
                customerName: 'Amit Kumar',
                customerEmail: 'amit.kumar@innovate.com',
                customerPhone: '+91-9876543211',
                pickupLocation: 'Whitefield ITPL, Bangalore',
                dropLocation: 'MG Road Metro Station, Bangalore',
                pickupTime: '08:30 AM',
                dropTime: '05:30 PM',
                organization: 'Innovate Tech'
            },
            {
                customerName: 'Sneha Reddy',
                customerEmail: 'sneha.reddy@globaltech.com',
                customerPhone: '+91-9876543212',
                pickupLocation: 'HSR Layout Sector 2, Bangalore',
                dropLocation: 'Brigade Road, Bangalore',
                pickupTime: '09:15 AM',
                dropTime: '06:15 PM',
                organization: 'Global Tech'
            },
            {
                customerName: 'Rajesh Patel',
                customerEmail: 'rajesh.patel@startupinc.com',
                customerPhone: '+91-9876543213',
                pickupLocation: 'Indiranagar 100 Feet Road, Bangalore',
                dropLocation: 'Commercial Street, Bangalore',
                pickupTime: '08:45 AM',
                dropTime: '05:45 PM',
                organization: 'Startup Inc'
            },
            {
                customerName: 'Kavya Nair',
                customerEmail: 'kavya.nair@digitalsol.com',
                customerPhone: '+91-9876543214',
                pickupLocation: 'Jayanagar 4th Block, Bangalore',
                dropLocation: 'UB City Mall, Bangalore',
                pickupTime: '09:30 AM',
                dropTime: '06:30 PM',
                organization: 'Digital Solutions'
            },
            {
                customerName: 'Arjun Menon',
                customerEmail: 'arjun.menon@fintech.com',
                customerPhone: '+91-9876543215',
                pickupLocation: 'Marathahalli, Bangalore',
                dropLocation: 'Cubbon Park, Bangalore',
                pickupTime: '08:15 AM',
                dropTime: '05:15 PM',
                organization: 'FinTech Solutions'
            },
            {
                customerName: 'Deepika Singh',
                customerEmail: 'deepika.singh@healthcare.com',
                customerPhone: '+91-9876543216',
                pickupLocation: 'Banashankari, Bangalore',
                dropLocation: 'Vidhana Soudha, Bangalore',
                pickupTime: '09:45 AM',
                dropTime: '06:45 PM',
                organization: 'Healthcare Plus'
            },
            {
                customerName: 'Vikram Joshi',
                customerEmail: 'vikram.joshi@edutech.com',
                customerPhone: '+91-9876543217',
                pickupLocation: 'Rajajinagar, Bangalore',
                dropLocation: 'Lalbagh Botanical Garden, Bangalore',
                pickupTime: '08:00 AM',
                dropTime: '05:00 PM',
                organization: 'EduTech India'
            },
            {
                customerName: 'Ananya Gupta',
                customerEmail: 'ananya.gupta@consulting.com',
                customerPhone: '+91-9876543218',
                pickupLocation: 'Malleshwaram, Bangalore',
                dropLocation: 'Bangalore Palace, Bangalore',
                pickupTime: '09:00 AM',
                dropTime: '06:00 PM',
                organization: 'Consulting Corp'
            },
            {
                customerName: 'Rohit Verma',
                customerEmail: 'rohit.verma@logistics.com',
                customerPhone: '+91-9876543219',
                pickupLocation: 'Yeshwanthpur, Bangalore',
                dropLocation: 'Chinnaswamy Stadium, Bangalore',
                pickupTime: '08:30 AM',
                dropTime: '05:30 PM',
                organization: 'Logistics Pro'
            },
            {
                customerName: 'Meera Krishnan',
                customerEmail: 'meera.krishnan@biotech.com',
                customerPhone: '+91-9876543220',
                pickupLocation: 'Yelahanka, Bangalore',
                dropLocation: 'ISKCON Temple, Bangalore',
                pickupTime: '09:15 AM',
                dropTime: '06:15 PM',
                organization: 'BioTech Labs'
            },
            {
                customerName: 'Suresh Babu',
                customerEmail: 'suresh.babu@manufacturing.com',
                customerPhone: '+91-9876543221',
                pickupLocation: 'Peenya Industrial Area, Bangalore',
                dropLocation: 'Visvesvaraya Museum, Bangalore',
                pickupTime: '08:45 AM',
                dropTime: '05:45 PM',
                organization: 'Manufacturing Hub'
            },
            {
                customerName: 'Lakshmi Devi',
                customerEmail: 'lakshmi.devi@textiles.com',
                customerPhone: '+91-9876543222',
                pickupLocation: 'Chickpet, Bangalore',
                dropLocation: 'Tipu Sultan Palace, Bangalore',
                pickupTime: '09:30 AM',
                dropTime: '06:30 PM',
                organization: 'Textiles United'
            },
            {
                customerName: 'Karthik Reddy',
                customerEmail: 'karthik.reddy@realestate.com',
                customerPhone: '+91-9876543223',
                pickupLocation: 'Sarjapur Road, Bangalore',
                dropLocation: 'Bull Temple, Bangalore',
                pickupTime: '08:15 AM',
                dropTime: '05:15 PM',
                organization: 'Real Estate Pro'
            },
            {
                customerName: 'Pooja Gupta',
                customerEmail: 'pooja.gupta@tcs.com',
                customerPhone: '+91-9876543224',
                pickupLocation: 'Manyata Tech Park, Bangalore',
                dropLocation: 'Forum Mall, Bangalore',
                pickupTime: '09:00 AM',
                dropTime: '06:00 PM',
                organization: 'TCS Limited'
            },
            {
                customerName: 'Naveen Kumar',
                customerEmail: 'naveen.kumar@infosys.com',
                customerPhone: '+91-9876543225',
                pickupLocation: 'Mysore Road, Bangalore',
                dropLocation: 'Orion Mall, Bangalore',
                pickupTime: '08:30 AM',
                dropTime: '05:30 PM',
                organization: 'Infosys Technologies'
            }
        ];
        
        console.log('\n🔄 Updating all rosters with complete customer details...');
        
        // Update each roster with complete information
        for (let i = 0; i < assignedRosters.length; i++) {
            const roster = assignedRosters[i];
            const customerData = customerUpdates[i % customerUpdates.length]; // Cycle through customer data
            
            const updateData = {
                ...customerData,
                vehicleNumber: vehicle.vehicleNumber,
                vehicleType: vehicle.vehicleType,
                vehicleCapacity: vehicle.capacity,
                routeType: 'pickup_drop',
                seatRequired: 1,
                specialRequirements: 'None',
                updatedAt: new Date()
            };
            
            await rostersCollection.updateOne(
                { _id: roster._id },
                { $set: updateData }
            );
            
            console.log(`✅ Updated roster ${i + 1}: ${customerData.customerName}`);
        }
        
        // Get updated rosters to display
        console.log('\n📝 Fetching updated roster details...');
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
            console.log(`\n${index + 1}. ${roster.customerName}`);
            console.log(`   📧 Email: ${roster.customerEmail}`);
            console.log(`   📱 Phone: ${roster.customerPhone}`);
            console.log(`   📍 Pickup: ${roster.pickupLocation}`);
            console.log(`   📍 Drop: ${roster.dropLocation}`);
            console.log(`   🕐 Time: ${roster.pickupTime} - ${roster.dropTime}`);
            console.log(`   🏢 Organization: ${roster.organization}`);
            console.log(`   📊 Status: ${roster.status}`);
        });
        
        console.log('\n🎉 All rosters updated successfully!');
        console.log('📱 The driver dashboard should now display complete customer information for all assigned customers');
        
        // Summary for testing
        console.log('\n🧪 TESTING SUMMARY:');
        console.log('===================');
        console.log(`✅ Driver: rajesh.kumar@abrafleet.com is active and ready`);
        console.log(`✅ Vehicle: ${vehicle.vehicleNumber} assigned`);
        console.log(`✅ ${updatedRosters.length} customers with complete details`);
        console.log(`✅ All rosters have pickup/drop locations and times`);
        console.log(`✅ Driver dashboard should display all customer information`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

updateAllRajeshRosters();