const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function updateRajeshRostersWithGroupingRules() {
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
        
        console.log(`📊 Found ${assignedRosters.length} rosters to update with grouping rules`);
        
        // ✅ GROUPING RULES IMPLEMENTATION
        // Create customer groups following the exact rules from pending_rosters_screen.dart
        const customerGroups = [
            // GROUP 1: TechCorp Solutions - Morning Shift (Electronic City to Koramangala)
            {
                emailDomain: '@techcorp.com',
                organization: 'TechCorp Solutions',
                loginTime: '09:00 AM',
                logoutTime: '06:00 PM',
                officeLocation: 'Koramangala 4th Block, Bangalore',
                rosterType: 'pickup_drop',
                customers: [
                    {
                        customerName: 'Priya Sharma',
                        customerEmail: 'priya.sharma@techcorp.com',
                        customerPhone: '+91-9876543210',
                        pickupLocation: 'Electronic City Phase 1, Bangalore',
                        dropLocation: 'Koramangala 4th Block, Bangalore'
                    },
                    {
                        customerName: 'Amit Kumar',
                        customerEmail: 'amit.kumar@techcorp.com',
                        customerPhone: '+91-9876543211',
                        pickupLocation: 'Electronic City Phase 2, Bangalore',
                        dropLocation: 'Koramangala 4th Block, Bangalore'
                    },
                    {
                        customerName: 'Sneha Reddy',
                        customerEmail: 'sneha.reddy@techcorp.com',
                        customerPhone: '+91-9876543212',
                        pickupLocation: 'Electronic City Gate, Bangalore',
                        dropLocation: 'Koramangala 4th Block, Bangalore'
                    }
                ]
            },
            // GROUP 2: Infosys Technologies - Early Morning Shift (Whitefield to Mysore Road)
            {
                emailDomain: '@infosys.com',
                organization: 'Infosys Technologies',
                loginTime: '08:30 AM',
                logoutTime: '05:30 PM',
                officeLocation: 'Mysore Road Campus, Bangalore',
                rosterType: 'pickup_drop',
                customers: [
                    {
                        customerName: 'Rajesh Patel',
                        customerEmail: 'rajesh.patel@infosys.com',
                        customerPhone: '+91-9876543213',
                        pickupLocation: 'Whitefield ITPL Main Gate, Bangalore',
                        dropLocation: 'Mysore Road Campus, Bangalore'
                    },
                    {
                        customerName: 'Kavya Nair',
                        customerEmail: 'kavya.nair@infosys.com',
                        customerPhone: '+91-9876543214',
                        pickupLocation: 'Whitefield Forum Mall, Bangalore',
                        dropLocation: 'Mysore Road Campus, Bangalore'
                    },
                    {
                        customerName: 'Arjun Menon',
                        customerEmail: 'arjun.menon@infosys.com',
                        customerPhone: '+91-9876543215',
                        pickupLocation: 'Whitefield Railway Station, Bangalore',
                        dropLocation: 'Mysore Road Campus, Bangalore'
                    },
                    {
                        customerName: 'Naveen Kumar',
                        customerEmail: 'naveen.kumar@infosys.com',
                        customerPhone: '+91-9876543225',
                        pickupLocation: 'Whitefield Bus Stand, Bangalore',
                        dropLocation: 'Mysore Road Campus, Bangalore'
                    }
                ]
            },
            // GROUP 3: TCS Limited - Standard Shift (Manyata to Forum Mall)
            {
                emailDomain: '@tcs.com',
                organization: 'TCS Limited',
                loginTime: '09:15 AM',
                logoutTime: '06:15 PM',
                officeLocation: 'Forum Mall, Bangalore',
                rosterType: 'pickup_drop',
                customers: [
                    {
                        customerName: 'Deepika Singh',
                        customerEmail: 'deepika.singh@tcs.com',
                        customerPhone: '+91-9876543216',
                        pickupLocation: 'Manyata Tech Park Gate 1, Bangalore',
                        dropLocation: 'Forum Mall, Bangalore'
                    },
                    {
                        customerName: 'Vikram Joshi',
                        customerEmail: 'vikram.joshi@tcs.com',
                        customerPhone: '+91-9876543217',
                        pickupLocation: 'Manyata Tech Park Gate 2, Bangalore',
                        dropLocation: 'Forum Mall, Bangalore'
                    },
                    {
                        customerName: 'Pooja Gupta',
                        customerEmail: 'pooja.gupta@tcs.com',
                        customerPhone: '+91-9876543224',
                        pickupLocation: 'Manyata Tech Park Main Entrance, Bangalore',
                        dropLocation: 'Forum Mall, Bangalore'
                    }
                ]
            },
            // GROUP 4: Wipro Limited - Flexible Shift (HSR Layout to Brigade Road)
            {
                emailDomain: '@wipro.com',
                organization: 'Wipro Limited',
                loginTime: '08:45 AM',
                logoutTime: '05:45 PM',
                officeLocation: 'Brigade Road, Bangalore',
                rosterType: 'pickup_drop',
                customers: [
                    {
                        customerName: 'Ananya Gupta',
                        customerEmail: 'ananya.gupta@wipro.com',
                        customerPhone: '+91-9876543218',
                        pickupLocation: 'HSR Layout Sector 1, Bangalore',
                        dropLocation: 'Brigade Road, Bangalore'
                    },
                    {
                        customerName: 'Rohit Verma',
                        customerEmail: 'rohit.verma@wipro.com',
                        customerPhone: '+91-9876543219',
                        pickupLocation: 'HSR Layout Sector 2, Bangalore',
                        dropLocation: 'Brigade Road, Bangalore'
                    }
                ]
            },
            // GROUP 5: Accenture - Late Shift (Jayanagar to UB City Mall)
            {
                emailDomain: '@accenture.com',
                organization: 'Accenture',
                loginTime: '10:00 AM',
                logoutTime: '07:00 PM',
                officeLocation: 'UB City Mall, Bangalore',
                rosterType: 'pickup_drop',
                customers: [
                    {
                        customerName: 'Meera Krishnan',
                        customerEmail: 'meera.krishnan@accenture.com',
                        customerPhone: '+91-9876543220',
                        pickupLocation: 'Jayanagar 4th Block, Bangalore',
                        dropLocation: 'UB City Mall, Bangalore'
                    },
                    {
                        customerName: 'Suresh Babu',
                        customerEmail: 'suresh.babu@accenture.com',
                        customerPhone: '+91-9876543221',
                        pickupLocation: 'Jayanagar 9th Block, Bangalore',
                        dropLocation: 'UB City Mall, Bangalore'
                    },
                    {
                        customerName: 'Lakshmi Devi',
                        customerEmail: 'lakshmi.devi@accenture.com',
                        customerPhone: '+91-9876543222',
                        pickupLocation: 'Jayanagar BDA Complex, Bangalore',
                        dropLocation: 'UB City Mall, Bangalore'
                    },
                    {
                        customerName: 'Karthik Reddy',
                        customerEmail: 'karthik.reddy@accenture.com',
                        customerPhone: '+91-9876543223',
                        pickupLocation: 'Jayanagar Shopping Complex, Bangalore',
                        dropLocation: 'UB City Mall, Bangalore'
                    }
                ]
            }
        ];
        
        console.log('\n🔄 Updating rosters with proper grouping rules...');
        console.log('📋 Groups created:');
        customerGroups.forEach((group, index) => {
            console.log(`   Group ${index + 1}: ${group.organization} (${group.customers.length} customers)`);
            console.log(`      Email Domain: ${group.emailDomain}`);
            console.log(`      Times: ${group.loginTime} - ${group.logoutTime}`);
            console.log(`      Office: ${group.officeLocation}`);
        });
        
        // Update each roster with grouped customer data
        let customerIndex = 0;
        for (let groupIndex = 0; groupIndex < customerGroups.length; groupIndex++) {
            const group = customerGroups[groupIndex];
            
            for (let custIndex = 0; custIndex < group.customers.length; custIndex++) {
                if (customerIndex >= assignedRosters.length) break;
                
                const roster = assignedRosters[customerIndex];
                const customer = group.customers[custIndex];
                
                // Create group key following the exact format from pending_rosters_screen.dart
                const groupKey = `${group.emailDomain}|${group.loginTime}|${group.logoutTime}|${group.officeLocation.toLowerCase()}|${group.rosterType}`;
                
                const updateData = {
                    // Customer details
                    customerName: customer.customerName,
                    customerEmail: customer.customerEmail,
                    customerPhone: customer.customerPhone,
                    
                    // Location details
                    pickupLocation: customer.pickupLocation,
                    dropLocation: customer.dropLocation,
                    officeLocation: group.officeLocation,
                    
                    // Time details
                    pickupTime: group.loginTime,
                    dropTime: group.logoutTime,
                    loginTime: group.loginTime,
                    logoutTime: group.logoutTime,
                    startTime: group.loginTime,
                    endTime: group.logoutTime,
                    
                    // Organization details
                    organization: group.organization,
                    emailDomain: group.emailDomain,
                    
                    // Roster type
                    rosterType: group.rosterType,
                    routeType: group.rosterType,
                    
                    // Vehicle details
                    vehicleNumber: vehicle.vehicleNumber,
                    vehicleType: vehicle.vehicleType,
                    vehicleCapacity: vehicle.capacity,
                    
                    // Grouping metadata
                    groupKey: groupKey,
                    groupIndex: groupIndex + 1,
                    groupName: group.organization,
                    
                    // Additional fields
                    seatRequired: 1,
                    specialRequirements: 'None',
                    updatedAt: new Date()
                };
                
                await rostersCollection.updateOne(
                    { _id: roster._id },
                    { $set: updateData }
                );
                
                console.log(`✅ Updated roster ${customerIndex + 1}: ${customer.customerName} (${group.organization})`);
                customerIndex++;
            }
        }
        
        // Get updated rosters to display
        console.log('\n📝 Fetching updated roster details...');
        const updatedRosters = await rostersCollection.find({
            driverEmail: 'rajesh.kumar@abrafleet.com'
        }).toArray();
        
        console.log('\n📊 COMPLETE DRIVER DASHBOARD DATA WITH GROUPING RULES:');
        console.log('=======================================================');
        console.log(`Driver: Rajesh Kumar`);
        console.log(`Email: rajesh.kumar@abrafleet.com`);
        console.log(`Phone: +91-9876543270`);
        console.log(`Vehicle: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
        console.log(`Vehicle Capacity: ${vehicle.capacity} seats`);
        console.log(`Total Customers: ${updatedRosters.length}`);
        console.log(`Status: Active`);
        
        // Group customers by organization for display
        const groupedCustomers = {};
        updatedRosters.forEach(roster => {
            const org = roster.organization || 'Unknown';
            if (!groupedCustomers[org]) {
                groupedCustomers[org] = [];
            }
            groupedCustomers[org].push(roster);
        });
        
        console.log('\n👥 CUSTOMERS GROUPED BY ORGANIZATION:');
        console.log('====================================');
        
        Object.keys(groupedCustomers).forEach((org, orgIndex) => {
            const customers = groupedCustomers[org];
            const firstCustomer = customers[0];
            
            console.log(`\n${orgIndex + 1}. ${org} (${customers.length} customers)`);
            console.log(`   📧 Email Domain: ${firstCustomer.emailDomain || 'N/A'}`);
            console.log(`   🕐 Times: ${firstCustomer.pickupTime || 'N/A'} - ${firstCustomer.dropTime || 'N/A'}`);
            console.log(`   🏢 Office: ${firstCustomer.officeLocation || 'N/A'}`);
            console.log(`   🔑 Group Key: ${firstCustomer.groupKey || 'N/A'}`);
            console.log(`   👥 Customers:`);
            
            customers.forEach((customer, custIndex) => {
                console.log(`      ${custIndex + 1}. ${customer.customerName}`);
                console.log(`         📧 ${customer.customerEmail}`);
                console.log(`         📱 ${customer.customerPhone}`);
                console.log(`         📍 ${customer.pickupLocation} → ${customer.dropLocation}`);
            });
        });
        
        console.log('\n🎉 All rosters updated with proper grouping rules!');
        console.log('📱 The driver dashboard should now display customers grouped by:');
        console.log('   ✅ Email Domain (Organization)');
        console.log('   ✅ Login/Logout Times');
        console.log('   ✅ Office Location');
        console.log('   ✅ Roster Type');
        
        // Summary for testing
        console.log('\n🧪 TESTING SUMMARY:');
        console.log('===================');
        console.log(`✅ Driver: rajesh.kumar@abrafleet.com is active and ready`);
        console.log(`✅ Vehicle: ${vehicle.vehicleNumber} assigned`);
        console.log(`✅ ${updatedRosters.length} customers with complete details`);
        console.log(`✅ ${Object.keys(groupedCustomers).length} organization groups created`);
        console.log(`✅ All rosters follow proper grouping rules`);
        console.log(`✅ Driver dashboard should display grouped customer information`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

updateRajeshRostersWithGroupingRules();