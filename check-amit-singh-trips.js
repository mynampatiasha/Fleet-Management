const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const uri = process.env.MONGODB_URI;

async function checkAmitSinghTrips() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet');
    const tripsCollection = db.collection('trips');
    
    // Search for trips with driver ID DRV-100002
    console.log('\n🔍 Searching for trips with driverId: DRV-100002...\n');
    
    const tripsByDriverId = await tripsCollection.find({ 
      driverId: 'DRV-100002' 
    }).toArray();
    
    console.log(`Found ${tripsByDriverId.length} trips with driverId: DRV-100002`);
    
    if (tripsByDriverId.length > 0) {
      console.log('\n📋 Trips found:');
      tripsByDriverId.forEach((trip, index) => {
        console.log(`\n--- Trip ${index + 1} ---`);
        console.log(`Trip ID: ${trip.tripId || trip._id}`);
        console.log(`Driver ID: ${trip.driverId}`);
        console.log(`Driver Name: ${trip.driverName || 'N/A'}`);
        console.log(`Vehicle Number: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`Status: ${trip.status}`);
        console.log(`Trip Type: ${trip.tripType || 'N/A'}`);
        console.log(`Date: ${trip.date || trip.createdAt || 'N/A'}`);
        console.log(`Customers: ${trip.customers?.length || 0}`);
      });
    }
    
    // Also search by vehicle number
    console.log('\n\n🔍 Searching for trips with vehicleNumber: KA07JK1234...\n');
    
    const tripsByVehicle = await tripsCollection.find({ 
      vehicleNumber: 'KA07JK1234' 
    }).toArray();
    
    console.log(`Found ${tripsByVehicle.length} trips with vehicleNumber: KA07JK1234`);
    
    if (tripsByVehicle.length > 0) {
      console.log('\n📋 Trips found:');
      tripsByVehicle.forEach((trip, index) => {
        console.log(`\n--- Trip ${index + 1} ---`);
        console.log(`Trip ID: ${trip.tripId || trip._id}`);
        console.log(`Driver ID: ${trip.driverId || 'N/A'}`);
        console.log(`Driver Name: ${trip.driverName || 'N/A'}`);
        console.log(`Vehicle Number: ${trip.vehicleNumber}`);
        console.log(`Status: ${trip.status}`);
        console.log(`Trip Type: ${trip.tripType || 'N/A'}`);
        console.log(`Date: ${trip.date || trip.createdAt || 'N/A'}`);
        console.log(`Customers: ${trip.customers?.length || 0}`);
      });
    }
    
    // Also search by driver name
    console.log('\n\n🔍 Searching for trips with driverName containing "Amit Singh"...\n');
    
    const tripsByDriverName = await tripsCollection.find({ 
      driverName: /Amit Singh/i 
    }).toArray();
    
    console.log(`Found ${tripsByDriverName.length} trips with driverName containing "Amit Singh"`);
    
    if (tripsByDriverName.length > 0) {
      console.log('\n📋 Trips found:');
      tripsByDriverName.forEach((trip, index) => {
        console.log(`\n--- Trip ${index + 1} ---`);
        console.log(`Trip ID: ${trip.tripId || trip._id}`);
        console.log(`Driver ID: ${trip.driverId || 'N/A'}`);
        console.log(`Driver Name: ${trip.driverName}`);
        console.log(`Vehicle Number: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`Status: ${trip.status}`);
        console.log(`Trip Type: ${trip.tripType || 'N/A'}`);
        console.log(`Date: ${trip.date || trip.createdAt || 'N/A'}`);
        console.log(`Customers: ${trip.customers?.length || 0}`);
      });
    }
    
    // Summary
    console.log('\n\n📊 SUMMARY:');
    console.log(`Total trips by driverId (DRV-100002): ${tripsByDriverId.length}`);
    console.log(`Total trips by vehicleNumber (KA07JK1234): ${tripsByVehicle.length}`);
    console.log(`Total trips by driverName (Amit Singh): ${tripsByDriverName.length}`);
    
    if (tripsByDriverId.length === 0 && tripsByVehicle.length === 0 && tripsByDriverName.length === 0) {
      console.log('\n❌ No trips found for Amit Singh (DRV-100002) with vehicle KA07JK1234');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkAmitSinghTrips();
