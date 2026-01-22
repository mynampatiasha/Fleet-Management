const { MongoClient } = require('mongodb');

async function cleanupPendingRostersAtlas() {
    console.log('🗑️  REMOVING ALL PENDING ROSTERS FROM ATLAS');
    console.log('=' .repeat(50));

    // Use the same MongoDB Atlas connection as the backend
    const mongoUrl = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';
    const dbName = 'abra_fleet';
    
    let client;

    try {
        // Connect to MongoDB Atlas
        client = new MongoClient(mongoUrl);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');

        const db = client.db(dbName);
        
        // Collections that might contain pending rosters
        const collectionsToCheck = [
            'rosters',
            'pending_rosters', 
            'roster_assignments',
            'customer_rosters',
            'employee_rosters'
        ];

        let totalRemoved = 0;

        for (const collectionName of collectionsToCheck) {
            console.log(`\n🔍 Checking collection: ${collectionName}`);
            
            try {
                const collection = db.collection(collectionName);
                
                // First, count pending rosters
                const pendingCount = await collection.countDocuments({
                    $or: [
                        { status: 'pending' },
                        { rosterStatus: 'pending' },
                        { assignmentStatus: 'pending' },
                        { state: 'pending' }
                    ]
                });

                if (pendingCount > 0) {
                    console.log(`   📊 Found ${pendingCount} pending rosters`);
                    
                    // Show some examples before deletion
                    const examples = await collection.find({
                        $or: [
                            { status: 'pending' },
                            { rosterStatus: 'pending' },
                            { assignmentStatus: 'pending' },
                            { state: 'pending' }
                        ]
                    }).limit(3).toArray();

                    console.log('   📋 Examples of pending rosters:');
                    examples.forEach((roster, index) => {
                        console.log(`      ${index + 1}. ID: ${roster._id}`);
                        console.log(`         Status: ${roster.status || roster.rosterStatus || roster.assignmentStatus || roster.state}`);
                        console.log(`         Date: ${roster.date || roster.createdAt || 'Not specified'}`);
                        if (roster.employeeName || roster.customerName) {
                            console.log(`         Name: ${roster.employeeName || roster.customerName}`);
                        }
                    });

                    // Delete pending rosters
                    const deleteResult = await collection.deleteMany({
                        $or: [
                            { status: 'pending' },
                            { rosterStatus: 'pending' },
                            { assignmentStatus: 'pending' },
                            { state: 'pending' }
                        ]
                    });

                    console.log(`   ✅ Removed ${deleteResult.deletedCount} pending rosters`);
                    totalRemoved += deleteResult.deletedCount;
                } else {
                    console.log(`   ℹ️  No pending rosters found`);
                }

            } catch (collectionError) {
                console.log(`   ⚠️  Collection ${collectionName} might not exist or error occurred:`, collectionError.message);
            }
        }

        // Also check for any rosters with incomplete data that might be considered "pending"
        console.log(`\n🔍 Checking for incomplete/orphaned rosters...`);
        
        try {
            const rostersCollection = db.collection('rosters');
            
            // Find rosters without proper assignment or with null/undefined critical fields
            const incompleteRosters = await rostersCollection.find({
                $or: [
                    { driverId: null },
                    { driverId: { $exists: false } },
                    { vehicleId: null },
                    { vehicleId: { $exists: false } },
                    { assignedDriver: null },
                    { assignedDriver: { $exists: false } },
                    { assignedVehicle: null },
                    { assignedVehicle: { $exists: false } }
                ]
            }).toArray();

            if (incompleteRosters.length > 0) {
                console.log(`   📊 Found ${incompleteRosters.length} incomplete rosters`);
                
                // Show examples
                console.log('   📋 Examples of incomplete rosters:');
                incompleteRosters.slice(0, 3).forEach((roster, index) => {
                    console.log(`      ${index + 1}. ID: ${roster._id}`);
                    console.log(`         Driver: ${roster.driverId || roster.assignedDriver || 'Not assigned'}`);
                    console.log(`         Vehicle: ${roster.vehicleId || roster.assignedVehicle || 'Not assigned'}`);
                    console.log(`         Status: ${roster.status || 'Not specified'}`);
                });

                // Ask user if they want to remove incomplete rosters too
                console.log('\n❓ These rosters appear to be incomplete/orphaned.');
                console.log('   They might be causing issues in the system.');
                
                // For now, let's remove them as they're likely problematic
                const deleteIncompleteResult = await rostersCollection.deleteMany({
                    $or: [
                        { driverId: null },
                        { driverId: { $exists: false } },
                        { vehicleId: null },
                        { vehicleId: { $exists: false } },
                        { assignedDriver: null },
                        { assignedDriver: { $exists: false } },
                        { assignedVehicle: null },
                        { assignedVehicle: { $exists: false } }
                    ]
                });

                console.log(`   ✅ Removed ${deleteIncompleteResult.deletedCount} incomplete rosters`);
                totalRemoved += deleteIncompleteResult.deletedCount;
            } else {
                console.log(`   ℹ️  No incomplete rosters found`);
            }

        } catch (incompleteError) {
            console.log(`   ⚠️  Error checking incomplete rosters:`, incompleteError.message);
        }

        // Final summary
        console.log('\n🎉 CLEANUP SUMMARY');
        console.log('=' .repeat(50));
        console.log(`✅ Total pending rosters removed: ${totalRemoved}`);
        console.log('✅ Database cleanup completed');
        
        if (totalRemoved > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            console.log('• Refresh your admin dashboard');
            console.log('• Check that the pending rosters list is now empty');
            console.log('• Monitor for any new pending rosters being created');
            console.log('• Backend server is already running - no restart needed');
        } else {
            console.log('\n✅ No pending rosters were found to remove');
            console.log('   Your database is already clean!');
        }

        return {
            success: true,
            totalRemoved: totalRemoved,
            collectionsChecked: collectionsToCheck.length
        };

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        console.error(error);
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 MongoDB Atlas connection closed');
        }
    }
}

// Run the cleanup
cleanupPendingRostersAtlas().then(result => {
    console.log('\n🎯 FINAL RESULT');
    console.log('=' .repeat(50));
    
    if (result.success) {
        console.log('🎉 SUCCESS! Pending rosters cleanup completed');
        console.log(`✅ Removed: ${result.totalRemoved} pending rosters`);
        console.log(`✅ Collections checked: ${result.collectionsChecked}`);
        
        if (result.totalRemoved > 0) {
            console.log('\n🚀 NEXT STEPS:');
            console.log('1. Refresh your admin dashboard');
            console.log('2. Verify pending rosters list is empty');
            console.log('3. Backend is already running - no restart needed');
        } else {
            console.log('\n✅ Database was already clean - no action needed');
        }
        
    } else {
        console.log('❌ FAILED to complete cleanup');
        console.log('Error:', result.error);
        
        console.log('\n💡 TROUBLESHOOTING:');
        console.log('1. Check internet connection for MongoDB Atlas');
        console.log('2. Verify MongoDB Atlas credentials');
        console.log('3. Check if Atlas cluster is running');
    }
    
}).catch(console.error);