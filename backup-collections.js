const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function backupCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet');
    
    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupDir = `database_backups_${timestamp}`;
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log(`\n📁 Creating backups in: ${backupDir}\n`);
    
    // Backup Drivers Collection
    console.log('🚗 Backing up drivers collection...');
    const drivers = await db.collection('drivers').find().toArray();
    const driversFile = path.join(backupDir, 'drivers_backup.json');
    fs.writeFileSync(driversFile, JSON.stringify(drivers, null, 2));
    console.log(`✅ Backed up ${drivers.length} drivers to ${driversFile}`);
    
    // Backup Vehicles Collection
    console.log('\n🚙 Backing up vehicles collection...');
    const vehicles = await db.collection('vehicles').find().toArray();
    const vehiclesFile = path.join(backupDir, 'vehicles_backup.json');
    fs.writeFileSync(vehiclesFile, JSON.stringify(vehicles, null, 2));
    console.log(`✅ Backed up ${vehicles.length} vehicles to ${vehiclesFile}`);
    
    // Backup Trips Collection
    console.log('\n📦 Backing up trips collection...');
    const trips = await db.collection('trips').find().toArray();
    const tripsFile = path.join(backupDir, 'trips_backup.json');
    fs.writeFileSync(tripsFile, JSON.stringify(trips, null, 2));
    console.log(`✅ Backed up ${trips.length} trips to ${tripsFile}`);
    
    // Backup Rosters Collection
    console.log('\n📋 Backing up rosters collection...');
    const rosters = await db.collection('rosters').find().toArray();
    const rostersFile = path.join(backupDir, 'rosters_backup.json');
    fs.writeFileSync(rostersFile, JSON.stringify(rosters, null, 2));
    console.log(`✅ Backed up ${rosters.length} rosters to ${rostersFile}`);
    
    // Backup Users Collection
    console.log('\n👥 Backing up users collection...');
    const users = await db.collection('users').find().toArray();
    const usersFile = path.join(backupDir, 'users_backup.json');
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log(`✅ Backed up ${users.length} users to ${usersFile}`);
    
    // Create CSV backups for easier viewing
    console.log('\n📊 Creating CSV backups...');
    
    // Drivers CSV
    const driversCsv = [
      'driverId,name,email,phone,status,assignedVehicle',
      ...drivers.map(d => 
        `"${d.driverId || ''}","${d.name || d.driverName || ''}","${d.email || ''}","${d.phone || d.phoneNumber || ''}","${d.status || d.isActive ? 'Active' : 'Inactive'}","${d.assignedVehicle || d.vehicleId || d.vehicleNumber || ''}"`
      )
    ].join('\n');
    fs.writeFileSync(path.join(backupDir, 'drivers_backup.csv'), driversCsv);
    
    // Vehicles CSV
    const vehiclesCsv = [
      'vehicleId,vehicleNumber,type,capacity,status,assignedDriver',
      ...vehicles.map(v => 
        `"${v.vehicleId || v._id}","${v.vehicleNumber || v.registrationNumber || ''}","${v.vehicleType || v.type || ''}","${v.capacity || v.seatCapacity || ''}","${v.status || ''}","${v.assignedDriver || v.driverId || v.driver || ''}"`
      )
    ].join('\n');
    fs.writeFileSync(path.join(backupDir, 'vehicles_backup.csv'), vehiclesCsv);
    
    // Trips CSV
    const tripsCsv = [
      'tripId,driverId,driverName,vehicleNumber,customerId,status,distance,createdAt',
      ...trips.map(t => 
        `"${t.tripId || t._id}","${t.driverId || ''}","${t.driverName || ''}","${t.vehicleNumber || ''}","${t.customerId || ''}","${t.status || ''}","${t.distance || ''}","${t.createdAt || ''}"`
      )
    ].join('\n');
    fs.writeFileSync(path.join(backupDir, 'trips_backup.csv'), tripsCsv);
    
    console.log('✅ CSV backups created');
    
    // Create summary file
    const summary = {
      backupDate: new Date().toISOString(),
      collections: {
        drivers: {
          count: drivers.length,
          file: 'drivers_backup.json',
          csvFile: 'drivers_backup.csv'
        },
        vehicles: {
          count: vehicles.length,
          file: 'vehicles_backup.json',
          csvFile: 'vehicles_backup.csv'
        },
        trips: {
          count: trips.length,
          file: 'trips_backup.json',
          csvFile: 'trips_backup.csv'
        },
        rosters: {
          count: rosters.length,
          file: 'rosters_backup.json'
        },
        users: {
          count: users.length,
          file: 'users_backup.json'
        }
      },
      notes: [
        'All JSON files contain complete data with all fields',
        'CSV files contain key fields for quick reference',
        'To restore: Use MongoDB import tools or custom restore script'
      ]
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'BACKUP_SUMMARY.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Create README
    const readme = `# Database Backup - ${timestamp}

## Backup Contents

- **Drivers**: ${drivers.length} records
- **Vehicles**: ${vehicles.length} records
- **Trips**: ${trips.length} records
- **Rosters**: ${rosters.length} records
- **Users**: ${users.length} records

## Files

### JSON Files (Complete Data)
- \`drivers_backup.json\` - Full driver records
- \`vehicles_backup.json\` - Full vehicle records
- \`trips_backup.json\` - Full trip records
- \`rosters_backup.json\` - Full roster records
- \`users_backup.json\` - Full user records

### CSV Files (Quick Reference)
- \`drivers_backup.csv\` - Key driver fields
- \`vehicles_backup.csv\` - Key vehicle fields
- \`trips_backup.csv\` - Key trip fields

## How to Restore

### Using MongoDB Import
\`\`\`bash
mongoimport --uri="YOUR_MONGODB_URI" --collection=drivers --file=drivers_backup.json --jsonArray
mongoimport --uri="YOUR_MONGODB_URI" --collection=vehicles --file=vehicles_backup.json --jsonArray
mongoimport --uri="YOUR_MONGODB_URI" --collection=trips --file=trips_backup.json --jsonArray
\`\`\`

### Using Node.js Script
Create a restore script that reads these JSON files and inserts them back into MongoDB.

## Notes
- Backup created: ${new Date().toISOString()}
- Database: abra_fleet
- Keep these files safe for disaster recovery
`;
    
    fs.writeFileSync(path.join(backupDir, 'README.md'), readme);
    
    console.log('\n\n✅ === BACKUP COMPLETE ===\n');
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`\nFiles created:`);
    console.log(`  - drivers_backup.json (${drivers.length} records)`);
    console.log(`  - drivers_backup.csv`);
    console.log(`  - vehicles_backup.json (${vehicles.length} records)`);
    console.log(`  - vehicles_backup.csv`);
    console.log(`  - trips_backup.json (${trips.length} records)`);
    console.log(`  - trips_backup.csv`);
    console.log(`  - rosters_backup.json (${rosters.length} records)`);
    console.log(`  - users_backup.json (${users.length} records)`);
    console.log(`  - BACKUP_SUMMARY.json`);
    console.log(`  - README.md`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

backupCollections();
