// Create sample ratings data for dashboard testing
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'abra_fleet_db';

async function createSampleRatings() {
  console.log('🚀 Creating sample ratings data for dashboard...');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // Get some existing drivers
    const drivers = await db.collection('drivers').find({}).limit(10).toArray();
    
    if (drivers.length === 0) {
      console.log('❌ No drivers found. Please create some drivers first.');
      return;
    }

    console.log(`📊 Found ${drivers.length} drivers to create ratings for...`);

    // Create sample ratings for each driver
    const ratings = [];
    
    for (const driver of drivers) {
      // Create 3-8 ratings per driver
      const numRatings = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < numRatings; i++) {
        // Generate ratings with a bias towards higher ratings (3-5 stars)
        const rating = Math.random() < 0.8 
          ? Math.floor(Math.random() * 3) + 3  // 3-5 stars (80% chance)
          : Math.floor(Math.random() * 2) + 1; // 1-2 stars (20% chance)
        
        ratings.push({
          driverId: driver.firebaseUid || driver._id.toString(),
          customerId: `customer_${Math.floor(Math.random() * 100)}`,
          tripId: `trip_${Math.floor(Math.random() * 1000)}`,
          rating: rating,
          comment: getRatingComment(rating),
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          updatedAt: new Date()
        });
      }
    }

    // Insert ratings
    if (ratings.length > 0) {
      await db.collection('ratings').insertMany(ratings);
      console.log(`✅ Created ${ratings.length} sample ratings`);

      // Calculate and display statistics
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const distribution = {};
      for (let i = 1; i <= 5; i++) {
        distribution[i] = ratings.filter(r => r.rating === i).length;
      }

      console.log('\n📈 Ratings Statistics:');
      console.log(`Average Rating: ${avgRating.toFixed(2)}`);
      console.log('Distribution:', distribution);

      // Show top rated drivers
      const driverRatings = {};
      ratings.forEach(rating => {
        if (!driverRatings[rating.driverId]) {
          driverRatings[rating.driverId] = { total: 0, count: 0, name: '' };
        }
        driverRatings[rating.driverId].total += rating.rating;
        driverRatings[rating.driverId].count += 1;
      });

      // Add driver names
      for (const driverId in driverRatings) {
        const driver = drivers.find(d => (d.firebaseUid || d._id.toString()) === driverId);
        driverRatings[driverId].name = driver?.name || 'Unknown Driver';
        driverRatings[driverId].average = driverRatings[driverId].total / driverRatings[driverId].count;
      }

      const topDrivers = Object.entries(driverRatings)
        .sort(([,a], [,b]) => b.average - a.average)
        .slice(0, 5);

      console.log('\n🏆 Top 5 Rated Drivers:');
      topDrivers.forEach(([driverId, data], index) => {
        console.log(`${index + 1}. ${data.name}: ${data.average.toFixed(2)} stars (${data.count} ratings)`);
      });

    } else {
      console.log('❌ No ratings to create');
    }

  } catch (error) {
    console.error('❌ Error creating sample ratings:', error);
  } finally {
    await client.close();
  }
}

function getRatingComment(rating) {
  const comments = {
    5: [
      'Excellent service! Very professional driver.',
      'Amazing experience, highly recommend!',
      'Perfect trip, on time and safe driving.',
      'Outstanding service, will book again!',
      'Fantastic driver, very courteous and helpful.'
    ],
    4: [
      'Good service, minor delays but overall satisfied.',
      'Nice driver, comfortable ride.',
      'Good experience, would recommend.',
      'Professional service, clean vehicle.',
      'Reliable and punctual driver.'
    ],
    3: [
      'Average service, nothing special.',
      'Okay experience, could be better.',
      'Decent ride, met expectations.',
      'Fair service, room for improvement.',
      'Standard service, no complaints.'
    ],
    2: [
      'Below average, had some issues.',
      'Not satisfied with the service.',
      'Driver was late and unprofessional.',
      'Poor communication, disappointing.',
      'Service needs improvement.'
    ],
    1: [
      'Terrible experience, very unprofessional.',
      'Worst service ever, would not recommend.',
      'Driver was rude and vehicle was dirty.',
      'Completely unsatisfied, waste of money.',
      'Horrible service, never again.'
    ]
  };

  const ratingComments = comments[rating] || comments[3];
  return ratingComments[Math.floor(Math.random() * ratingComments.length)];
}

// Run the script
createSampleRatings();