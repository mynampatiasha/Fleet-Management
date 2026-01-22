const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Calculate estimated duration (3 minutes per km average)
function estimateDuration(distanceKm) {
  return Math.round(distanceKm * 3);
}

async function calculateAllRosterDistances() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('abra_fleet');
    const rostersCollection = db.collection('rosters');

    // Find all assigned rosters without distance data
    const rosters = await rostersCollection.find({
      status: { $in: ['assigned', 'scheduled', 'ongoing', 'completed'] },
      $or: [
        { distanceData: { $exists: false } },
        { distanceData: null },
        { 'distanceData.totalDistanceKm': { $exists: false } }
      ]
    }).toArray();

    console.log(`\n📋 Found ${rosters.length} rosters without distance data\n`);

    let updated = 0;
    let skipped = 0;

    for (const roster of rosters) {
      console.log(`\n🔍 Processing roster for ${roster.customerName || 'Unknown'}:`);
      console.log(`   Roster ID: ${roster._id}`);

      // Extract coordinates from various possible fields
      let pickupLat, pickupLon, dropLat, dropLon, officeLat, officeLon;

      // Try to get pickup coordinates
      if (roster.locations?.pickup?.coordinates) {
        pickupLat = roster.locations.pickup.coordinates.latitude;
        pickupLon = roster.locations.pickup.coordinates.longitude;
      } else if (roster.pickupLatitude && roster.pickupLongitude) {
        pickupLat = roster.pickupLatitude;
        pickupLon = roster.pickupLongitude;
      } else if (roster.pickupCoordinates) {
        pickupLat = roster.pickupCoordinates.latitude;
        pickupLon = roster.pickupCoordinates.longitude;
      }

      // Try to get drop coordinates
      if (roster.locations?.drop?.coordinates) {
        dropLat = roster.locations.drop.coordinates.latitude;
        dropLon = roster.locations.drop.coordinates.longitude;
      } else if (roster.dropLatitude && roster.dropLongitude) {
        dropLat = roster.dropLatitude;
        dropLon = roster.dropLongitude;
      } else if (roster.dropCoordinates) {
        dropLat = roster.dropCoordinates.latitude;
        dropLon = roster.dropCoordinates.longitude;
      }

      // Try to get office coordinates
      if (roster.officeLocationCoordinates) {
        officeLat = roster.officeLocationCoordinates.latitude;
        officeLon = roster.officeLocationCoordinates.longitude;
      } else if (roster.officeCoordinates) {
        officeLat = roster.officeCoordinates.latitude;
        officeLon = roster.officeCoordinates.longitude;
      }

      console.log(`   Pickup coords: ${pickupLat ? 'Found' : 'Missing'} (${pickupLat}, ${pickupLon})`);
      console.log(`   Drop coords: ${dropLat ? 'Found' : 'Missing'} (${dropLat}, ${dropLon})`);
      console.log(`   Office coords: ${officeLat ? 'Found' : 'Missing'} (${officeLat}, ${officeLon})`);

      // Calculate distances based on available coordinates
      let loginDistance = 0;
      let logoutDistance = 0;
      let totalDistance = 0;

      // Login trip: Home (pickup) → Office
      if (pickupLat && pickupLon && officeLat && officeLon) {
        loginDistance = calculateDistance(pickupLat, pickupLon, officeLat, officeLon);
        totalDistance += loginDistance;
        console.log(`   ✅ Login distance: ${loginDistance.toFixed(1)} km`);
      }

      // Logout trip: Office → Home (drop)
      if (officeLat && officeLon && dropLat && dropLon) {
        logoutDistance = calculateDistance(officeLat, officeLon, dropLat, dropLon);
        totalDistance += logoutDistance;
        console.log(`   ✅ Logout distance: ${logoutDistance.toFixed(1)} km`);
      }

      // If no office coordinates, calculate direct pickup to drop
      if (totalDistance === 0 && pickupLat && pickupLon && dropLat && dropLon) {
        totalDistance = calculateDistance(pickupLat, pickupLon, dropLat, dropLon);
        console.log(`   ✅ Direct distance: ${totalDistance.toFixed(1)} km`);
      }

      if (totalDistance > 0) {
        const totalDuration = estimateDuration(totalDistance);
        
        // Create distance data object
        const distanceData = {
          login: loginDistance > 0 ? {
            from: {
              latitude: pickupLat,
              longitude: pickupLon,
              address: roster.pickupLocation || roster.locations?.pickup?.address || 'Pickup Location'
            },
            to: {
              latitude: officeLat,
              longitude: officeLon,
              address: roster.officeLocation || 'Office'
            },
            distanceKm: Math.round(loginDistance * 10) / 10,
            estimatedDurationMin: estimateDuration(loginDistance)
          } : null,
          logout: logoutDistance > 0 ? {
            from: {
              latitude: officeLat,
              longitude: officeLon,
              address: roster.officeLocation || 'Office'
            },
            to: {
              latitude: dropLat,
              longitude: dropLon,
              address: roster.dropLocation || roster.locations?.drop?.address || 'Drop Location'
            },
            distanceKm: Math.round(logoutDistance * 10) / 10,
            estimatedDurationMin: estimateDuration(logoutDistance)
          } : null,
          totalDistanceKm: Math.round(totalDistance * 10) / 10,
          totalDurationMin: totalDuration,
          calculatedAt: new Date(),
          calculatedBy: 'system-migration'
        };

        // Update roster with distance data
        await rostersCollection.updateOne(
          { _id: roster._id },
          { 
            $set: { 
              distanceData: distanceData,
              distance: Math.round(totalDistance * 10) / 10, // Legacy field
              estimatedDuration: totalDuration // Legacy field
            } 
          }
        );

        console.log(`   ✅ Updated with total distance: ${Math.round(totalDistance * 10) / 10} km`);
        updated++;
      } else {
        console.log(`   ⚠️  Insufficient coordinates, skipping`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ DISTANCE CALCULATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Processed: ${rosters.length} rosters`);
    console.log(`✅ Updated: ${updated} rosters`);
    console.log(`⚠️  Skipped: ${skipped} rosters`);
    console.log(`📈 Success rate: ${((updated/rosters.length)*100).toFixed(1)}%`);

    if (updated > 0) {
      console.log('\n🎉 Distance data has been added to the database!');
      console.log('The trips screen should now display distance information.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

calculateAllRosterDistances();