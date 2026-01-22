// Test script to check SOS history for a customer
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function testSOSHistory() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('abra_fleet');
        
        // First, let's see what customers exist
        console.log('\n📋 Checking customers collection:');
        const customers = await db.collection('customers').find({}).limit(5).toArray();
        console.log(`Found ${customers.length} customers (showing first 5):`);
        customers.forEach(c => {
            console.log(`  - ${c.name} (${c.email})`);
            console.log(`    _id: ${c._id}`);
            console.log(`    customerId: ${c.customerId || 'N/A'}`);
            console.log(`    firebaseUid: ${c.firebaseUid || 'N/A'}`);
        });
        
        // Now check SOS events
        console.log('\n🚨 Checking sos_events collection:');
        const sosEvents = await db.collection('sos_events').find({}).limit(10).toArray();
        console.log(`Found ${sosEvents.length} SOS events (showing first 10):`);
        sosEvents.forEach(event => {
            console.log(`  - ${event.customerName} (${event.customerEmail})`);
            console.log(`    customerId: ${event.customerId}`);
            console.log(`    customerFirebaseUid: ${event.customerFirebaseUid || 'N/A'}`);
            console.log(`    status: ${event.status}`);
            console.log(`    timestamp: ${event.timestamp}`);
        });
        
        // Test the query that the endpoint uses
        if (customers.length > 0) {
            const testCustomer = customers[0];
            const testUserId = testCustomer._id.toString();
            
            console.log(`\n🔍 Testing query for customer: ${testCustomer.name}`);
            console.log(`   Using userId: ${testUserId}`);
            
            const matchingEvents = await db.collection('sos_events')
                .find({ 
                    $or: [
                        { customerId: testUserId },
                        { customerFirebaseUid: testUserId }
                    ]
                })
                .sort({ timestamp: -1 })
                .limit(50)
                .toArray();
            
            console.log(`   Found ${matchingEvents.length} matching events`);
            
            // Also try with the customer's email
            console.log(`\n🔍 Testing query with email: ${testCustomer.email}`);
            const emailEvents = await db.collection('sos_events')
                .find({ customerEmail: testCustomer.email })
                .sort({ timestamp: -1 })
                .limit(50)
                .toArray();
            
            console.log(`   Found ${emailEvents.length} events by email`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

testSOSHistory();
