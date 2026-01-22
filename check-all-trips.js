const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const uri = process.env.MONGODB_URI;

async function checkAllTrips() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet_management');
    const tripsCollection = db.collection('trips');
    
    // Get total count
    const totalCount = await tripsCollection.countDocuments();
    console.log(`\n📊 Total trips in collection: ${totalCount}\n`);
    
    if (totalCount === 0) {
      console.log('❌ No trips found in the collection');
      return;
    }
    
    // Get all trips
    const allTrips = await tripsCollection.find({}).toArray();
    
    console.log('📋 ALL TRIPS:\n');
    console.log('='.repeat(80));
    
    allTrips.forEach((trip, index) => {
      console.log(`\n--- Trip ${index + 1} ---`);
      console.log(`Trip ID: ${trip.tripId || trip._id}`);
      console.log(`Driver ID: ${trip.driverId || 'N/A'}`);
      console.log(`Driver Name: ${trip.driverName || 'N/A'}`);
      console.log(`Vehicle Number: ${trip.vehicleNumber || 'N/A'}`);
      console.log(`Status: ${trip.status || 'N/A'}`);
      console.log(`Trip Type: ${trip.tripType || 'N/A'}`);
      console.log(`Date: ${trip.date || trip.createdAt || 'N/A'}`);
      console.log(`Customers: ${trip.customers?.length || 0}`);
      console.log(`Organization: ${trip.organization || 'N/A'}`);
      
      if (trip.customers && trip.customers.length > 0) {
        console.log(`Customer Names: ${trip.customers.map(c => c.name || c.customerName).join(', ')}`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Group by status
    console.log('\n\n📊 TRIPS BY STATUS:');
    const statusGroups = {};
    allTrips.forEach(trip => {
      const status = trip.status || 'unknown';
      statusGroups[status] = (statusGroups[status] || 0) + 1;
    });
    
    Object.keys(statusGroups).forEach(status => {
      console.log(`  ${status}: ${statusGroups[status]}`);
    });
    
    // Group by driver
    console.log('\n\n📊 TRIPS BY DRIVER:');
    const driverGroups = {};
    allTrips.forEach(trip => {
      const driverId = trip.driverId || 'No Driver';
      const driverName = trip.driverName || 'Unknown';
      const key = `${driverId} (${driverName})`;
      driverGroups[key] = (driverGroups[key] || 0) + 1;
    });
    
    Object.keys(driverGroups).forEach(driver => {
      console.log(`  ${driver}: ${driverGroups[driver]}`);
    });
    
    // Group by vehicle
    console.log('\n\n📊 TRIPS BY VEHICLE:');
    const vehicleGroups = {};
    allTrips.forEach(trip => {
      const vehicle = trip.vehicleNumber || 'No Vehicle';
      vehicleGroups[vehicle] = (vehicleGroups[vehicle] || 0) + 1;
    });
    
    Object.keys(vehicleGroups).forEach(vehicle => {
      console.log(`  ${vehicle}: ${vehicleGroups[vehicle]}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkAllTrips();
