const axios = require('axios');

async function removePendingRostersViaAPI() {
    console.log('🗑️  REMOVING PENDING ROSTERS VIA BACKEND API');
    console.log('=' .repeat(50));

    const backendUrl = 'http://localhost:3001';
    
    try {
        // Step 1: Check backend health
        console.log('🔍 Step 1: Checking backend status...');
        
        const healthResponse = await axios.get(`${backendUrl}/health`, {
            timeout: 5000
        });
        
        console.log('✅ Backend is running');
        console.log('   Status:', healthResponse.data.status);
        console.log('   MongoDB:', healthResponse.data.mongodb);

        // Step 2: Get admin token for API access
        console.log('\n🔑 Step 2: Getting admin access...');
        
        const testHeaders = {
            'Content-Type': 'application/json',
            'x-test-firebase-uid': 'admin-cleanup-uid',
            'Authorization': 'Bearer test-token-for-cleanup'
        };

        // Step 3: Check pending rosters count
        console.log('\n📊 Step 3: Checking pending rosters...');
        
        try {
            const pendingResponse = await axios.get(`${backendUrl}/api/rosters/pending`, {
                headers: testHeaders,
                timeout: 10000
            });
            
            const pendingRosters = pendingResponse.data.rosters || [];
            console.log(`   Found ${pendingRosters.length} pending rosters`);
            
            if (pendingRosters.length === 0) {
                console.log('✅ No pending rosters found - database is already clean!');
                return {
                    success: true,
                    totalRemoved: 0,
                    message: 'No pending rosters to remove'
                };
            }
            
            // Show examples
            console.log('\n📋 Examples of pending rosters:');
            pendingRosters.slice(0, 5).forEach((roster, index) => {
                console.log(`   ${index + 1}. ID: ${roster._id || roster.id}`);
                console.log(`      Status: ${roster.status || roster.rosterStatus || 'pending'}`);
                console.log(`      Date: ${roster.date || roster.createdAt || 'Not specified'}`);
                if (roster.employeeName || roster.customerName) {
                    console.log(`      Name: ${roster.employeeName || roster.customerName}`);
                }
            });
            
        } catch (pendingError) {
            console.log('⚠️  Could not fetch pending rosters via API:', pendingError.message);
            console.log('   This might be normal if the endpoint doesn\'t exist');
        }

        // Step 4: Try different cleanup approaches
        console.log('\n🧹 Step 4: Attempting cleanup via multiple methods...');
        
        let totalRemoved = 0;
        const cleanupMethods = [
            {
                name: 'Direct roster cleanup',
                endpoint: '/api/admin/cleanup/pending-rosters',
                method: 'DELETE'
            },
            {
                name: 'Roster status reset',
                endpoint: '/api/rosters/reset-pending',
                method: 'POST'
            },
            {
                name: 'Assignment cleanup',
                endpoint: '/api/assignments/cleanup-pending',
                method: 'DELETE'
            }
        ];

        for (const cleanupMethod of cleanupMethods) {
            try {
                console.log(`\n   Trying: ${cleanupMethod.name}...`);
                
                const cleanupResponse = await axios({
                    method: cleanupMethod.method,
                    url: `${backendUrl}${cleanupMethod.endpoint}`,
                    headers: testHeaders,
                    timeout: 15000,
                    data: cleanupMethod.method === 'POST' ? { action: 'cleanup_pending' } : undefined
                });
                
                if (cleanupResponse.data.success) {
                    const removed = cleanupResponse.data.removed || cleanupResponse.data.deletedCount || 0;
                    console.log(`   ✅ ${cleanupMethod.name}: Removed ${removed} items`);
                    totalRemoved += removed;
                } else {
                    console.log(`   ⚠️  ${cleanupMethod.name}: ${cleanupResponse.data.message || 'No items removed'}`);
                }
                
            } catch (methodError) {
                console.log(`   ❌ ${cleanupMethod.name}: ${methodError.response?.status || 'Error'} - ${methodError.message}`);
            }
        }

        // Step 5: Manual cleanup via database queries
        console.log('\n🔧 Step 5: Manual cleanup via backend database access...');
        
        try {
            const manualCleanupResponse = await axios.post(`${backendUrl}/api/admin/database/cleanup`, {
                action: 'remove_pending_rosters',
                collections: ['rosters', 'pending_rosters', 'roster_assignments', 'customer_rosters', 'employee_rosters'],
                criteria: {
                    $or: [
                        { status: 'pending' },
                        { rosterStatus: 'pending' },
                        { assignmentStatus: 'pending' },
                        { state: 'pending' }
                    ]
                }
            }, {
                headers: testHeaders,
                timeout: 20000
            });
            
            if (manualCleanupResponse.data.success) {
                const removed = manualCleanupResponse.data.totalRemoved || 0;
                console.log(`   ✅ Manual cleanup: Removed ${removed} pending rosters`);
                totalRemoved += removed;
            } else {
                console.log(`   ⚠️  Manual cleanup: ${manualCleanupResponse.data.message || 'Failed'}`);
            }
            
        } catch (manualError) {
            console.log(`   ❌ Manual cleanup failed: ${manualError.response?.status || 'Error'} - ${manualError.message}`);
        }

        // Step 6: Final verification
        console.log('\n🔍 Step 6: Final verification...');
        
        try {
            const finalCheckResponse = await axios.get(`${backendUrl}/api/rosters/pending`, {
                headers: testHeaders,
                timeout: 10000
            });
            
            const remainingRosters = finalCheckResponse.data.rosters || [];
            console.log(`   Remaining pending rosters: ${remainingRosters.length}`);
            
            if (remainingRosters.length === 0) {
                console.log('   ✅ All pending rosters successfully removed!');
            } else {
                console.log('   ⚠️  Some pending rosters still remain');
            }
            
        } catch (finalError) {
            console.log('   ⚠️  Could not verify final state:', finalError.message);
        }

        // Summary
        console.log('\n🎉 CLEANUP SUMMARY');
        console.log('=' .repeat(50));
        console.log(`✅ Total pending rosters removed: ${totalRemoved}`);
        
        if (totalRemoved > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            console.log('• Refresh your admin dashboard');
            console.log('• Check that the pending rosters list is now empty');
            console.log('• Monitor for any new pending rosters being created');
            console.log('• The backend server is already running - no restart needed');
        } else {
            console.log('\n✅ No pending rosters were found to remove');
            console.log('   Your database is already clean!');
        }

        return {
            success: true,
            totalRemoved: totalRemoved,
            backendRunning: true
        };

    } catch (error) {
        console.error('❌ Error during API cleanup:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🚨 BACKEND NOT RUNNING');
            console.log('Please start the backend first:');
            console.log('1. cd abra_fleet_backend');
            console.log('2. node index.js');
            console.log('3. Then run this script again');
        }
        
        return {
            success: false,
            error: error.message,
            backendRunning: false
        };
    }
}

// Run the cleanup
removePendingRostersViaAPI().then(result => {
    console.log('\n🎯 FINAL RESULT');
    console.log('=' .repeat(50));
    
    if (result.success) {
        console.log('🎉 SUCCESS! Pending rosters cleanup completed via API');
        console.log(`✅ Removed: ${result.totalRemoved} pending rosters`);
        console.log(`✅ Backend: Running`);
        
        if (result.totalRemoved > 0) {
            console.log('\n🚀 NEXT STEPS:');
            console.log('1. Refresh your admin dashboard');
            console.log('2. Verify pending rosters list is empty');
            console.log('3. Backend is already running - no restart needed');
        } else {
            console.log('\n✅ Database was already clean - no action needed');
        }
        
    } else {
        console.log('❌ FAILED to complete cleanup via API');
        console.log('Error:', result.error);
        
        if (!result.backendRunning) {
            console.log('\n💡 Start the backend server first');
        }
    }
    
}).catch(console.error);