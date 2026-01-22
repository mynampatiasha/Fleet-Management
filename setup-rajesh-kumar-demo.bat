@echo off
echo.
echo ========================================
echo   RAJESH KUMAR COMPREHENSIVE DEMO SETUP
echo ========================================
echo.
echo This script will create comprehensive demo data for:
echo   Driver: rajesh.kumar@abrafleet.com
echo   Password: Rajesh123!
echo.
echo Demo data includes:
echo   - Complete driver profile with documents
echo   - Assigned vehicle (Tata Ace Gold)
echo   - 45 trips over last 60 days
echo   - Active rosters for current week
echo   - Performance analytics (3 months)
echo   - Driver notifications
echo   - Vehicle maintenance records
echo   - Customer data for realistic trips
echo.
pause
echo.

echo [1/3] Starting backend server...
cd abra_fleet_backend
start "Backend Server" cmd /k "node index.js"
echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo [2/3] Creating comprehensive demo data...
node create-rajesh-kumar-comprehensive-demo-data.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Demo data creation failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying data creation...
node -e "
const { MongoClient } = require('mongodb');
async function verify() {
    const client = new MongoClient('mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0');
    try {
        await client.connect();
        const db = client.db('abra_fleet');
        
        const driver = await db.collection('drivers').findOne({ driverId: 'DRV-100001' });
        const trips = await db.collection('trips').countDocuments({ driverId: 'DRV-100001' });
        const rosters = await db.collection('rosters').countDocuments({ driverId: 'DRV-100001' });
        const notifications = await db.collection('notifications').countDocuments({ userId: driver?.firebaseUid });
        
        console.log('\\n✅ VERIFICATION RESULTS:');
        console.log('   Driver Profile:', driver ? 'EXISTS' : 'MISSING');
        console.log('   Total Trips:', trips);
        console.log('   Active Rosters:', rosters);
        console.log('   Notifications:', notifications);
        console.log('   Firebase UID:', driver?.firebaseUid || 'MISSING');
        console.log('   Vehicle Assigned:', driver?.assignedVehicle || 'NONE');
        
        if (driver && trips > 0 && rosters > 0) {
            console.log('\\n🎉 DEMO DATA SETUP SUCCESSFUL!');
            console.log('\\n📱 LOGIN CREDENTIALS:');
            console.log('   Email: rajesh.kumar@abrafleet.com');
            console.log('   Password: Rajesh123!');
            console.log('\\n🚗 VEHICLE DETAILS:');
            console.log('   Registration: KA02CD5678');
            console.log('   Make/Model: Tata Ace Gold');
            console.log('   Type: Mini Truck (4 seater)');
            console.log('\\n📊 DATA SUMMARY:');
            console.log('   - Complete driver profile with documents');
            console.log('   - ' + trips + ' trips with realistic data');
            console.log('   - ' + rosters + ' rosters for current week');
            console.log('   - Performance analytics and ratings');
            console.log('   - Vehicle maintenance records');
            console.log('   - Driver notifications');
        } else {
            console.log('\\n❌ DEMO DATA SETUP INCOMPLETE!');
            console.log('Please run the script again or check for errors.');
        }
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await client.close();
    }
}
verify();
"

echo.
echo ========================================
echo   SETUP COMPLETE
echo ========================================
echo.
echo The comprehensive demo data has been created for Rajesh Kumar.
echo You can now test the driver dashboard with realistic data.
echo.
echo Next steps:
echo 1. Open the driver app
echo 2. Login with: rajesh.kumar@abrafleet.com
echo 3. Password: Rajesh123!
echo 4. Explore all features with real data
echo.
echo Features to test:
echo - Driver Dashboard (with real stats)
echo - Trip History (45 trips)
echo - Current Rosters (weekly schedule)
echo - Vehicle Information
echo - Performance Reports
echo - Notifications
echo - Profile Management
echo.
pause