# Database Backup - 2026-01-21

## Backup Contents

- **Drivers**: 42 records
- **Vehicles**: 33 records
- **Trips**: 238 records
- **Rosters**: 9 records
- **Users**: 4 records

## Files

### JSON Files (Complete Data)
- `drivers_backup.json` - Full driver records
- `vehicles_backup.json` - Full vehicle records
- `trips_backup.json` - Full trip records
- `rosters_backup.json` - Full roster records
- `users_backup.json` - Full user records

### CSV Files (Quick Reference)
- `drivers_backup.csv` - Key driver fields
- `vehicles_backup.csv` - Key vehicle fields
- `trips_backup.csv` - Key trip fields

## How to Restore

### Using MongoDB Import
```bash
mongoimport --uri="YOUR_MONGODB_URI" --collection=drivers --file=drivers_backup.json --jsonArray
mongoimport --uri="YOUR_MONGODB_URI" --collection=vehicles --file=vehicles_backup.json --jsonArray
mongoimport --uri="YOUR_MONGODB_URI" --collection=trips --file=trips_backup.json --jsonArray
```

### Using Node.js Script
Create a restore script that reads these JSON files and inserts them back into MongoDB.

## Notes
- Backup created: 2026-01-21T04:00:40.104Z
- Database: abra_fleet
- Keep these files safe for disaster recovery
