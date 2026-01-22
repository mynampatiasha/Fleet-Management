const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    const serviceAccount = require('./abra_fleet_backend/config/serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://abra-fleet-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
}

async function debugSOSAlerts() {
    console.log('🚨 SOS ALERTS DEBUG TOOL');
    console.log('=' .repeat(50));
    
    try {
        // 1. Check Firebase Realtime Database for active SOS alerts
        console.log('\n📡 1. Checking Firebase Realtime Database...');
        const db = admin.database();
        const sosRef = db.ref('sos_events');
        
        const snapshot = await sosRef.once('value');
        const firebaseData = snapshot.val();
        
        if (!firebaseData) {
            console.log('❌ No SOS events found in Firebase Realtime Database');
        } else {
            console.log(`✅ Found ${Object.keys(firebaseData).length} SOS events in Firebase`);
            
            // Count by status
            const statusCounts = {};
            Object.values(firebaseData).forEach(event => {
                const status = event.status || 'Unknown';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            console.log('📊 Status breakdown:');
            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`   ${status}: ${count}`);
            });
            
            // Show active alerts
            const activeAlerts = Object.entries(firebaseData)
                .filter(([key, value]) => value.status === 'ACTIVE' || value.status === 'Pending')
                .map(([key, value]) => ({ id: key, ...value }));
                
            console.log(`\n🔴 Active/Pending Alerts: ${activeAlerts.length}`);
            activeAlerts.forEach(alert => {
                console.log(`   - ${alert.customerName} (${alert.customerEmail}) - ${alert.status}`);
                console.log(`     Location: ${alert.address}`);
                console.log(`     Time: ${new Date(alert.timestamp).toLocaleString()}`);
            });
        }
        
        // 2. Check MongoDB for resolved SOS alerts
        console.log('\n📡 2. Checking MongoDB for resolved alerts...');
        const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet');
        await mongoClient.connect();
        const mongoDb = mongoClient.db('abra_fleet');
        
        const resolvedAlerts = await mongoDb.collection('sos_events')
            .find({ status: 'Resolved' })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();
            
        console.log(`✅ Found ${resolvedAlerts.length} resolved alerts in MongoDB`);
        resolvedAlerts.forEach(alert => {
            console.log(`   - ${alert.customerName} (${alert.customerEmail})`);
            console.log(`     Resolved: ${alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'N/A'}`);
        });
        
        // 3. Check organization filtering
        console.log('\n📡 3. Checking organization filtering...');
        const organizations = new Set();
        
        if (firebaseData) {
            Object.values(firebaseData).forEach(event => {
                if (event.customerEmail) {
                    const domain = '@' + event.customerEmail.split('@')[1];
                    organizations.add(domain);
                }
            });
        }
        
        resolvedAlerts.forEach(alert => {
            if (alert.customerEmail) {
                const domain = '@' + alert.customerEmail.split('@')[1];
                organizations.add(domain);
            }
        });
        
        console.log(`📊 Organizations found: ${organizations.size}`);
        organizations.forEach(org => {
            console.log(`   - ${org}`);
        });
        
        // 4. Test specific organization filtering
        console.log('\n📡 4. Testing organization filtering...');
        const testOrg = '@example.com'; // Change this to test specific org
        
        if (firebaseData) {
            const orgActiveAlerts = Object.values(firebaseData)
                .filter(event => event.customerEmail && event.customerEmail.endsWith(testOrg))
                .filter(event => event.status === 'ACTIVE' || event.status === 'Pending');
            console.log(`🔍 Active alerts for ${testOrg}: ${orgActiveAlerts.length}`);
        }
        
        const orgResolvedAlerts = await mongoDb.collection('sos_events')
            .find({ 
                status: 'Resolved',
                customerEmail: { $regex: testOrg + '$', $options: 'i' }
            })
            .toArray();
        console.log(`🔍 Resolved alerts for ${testOrg}: ${orgResolvedAlerts.length}`);
        
        await mongoClient.close();
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Debug complete!');
}

// Run the debug
debugSOSAlerts().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});