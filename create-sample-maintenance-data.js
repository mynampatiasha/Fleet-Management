// Create sample maintenance data for testing
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'abra_travels';

async function createSampleMaintenanceData() {
  console.log('🔧 ========== CREATING SAMPLE MAINTENANCE DATA ==========');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Get some vehicles first
    const vehicles = await db.collection('vehicles').find({}).limit(5).toArray();
    console.log(`📋 Found ${vehicles.length} vehicles to use for maintenance data`);
    
    if (vehicles.length === 0) {
      console.log('❌ No vehicles found. Please add vehicles first.');
      return;
    }
    
    // Create sample maintenance schedules
    const maintenanceSchedules = [];
    const maintenanceTypes = ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Tune-up', 'AC Service', 'Battery Check'];
    const vendors = [
      { name: 'Premium Auto Service', email: 'service@premiumauto.com', phone: '+971 4 123 4567' },
      { name: 'Dubai Maintenance Hub', email: 'info@dubaimaintenance.com', phone: '+971 4 234 5678' },
      { name: 'Gulf Auto Care', email: 'contact@gulfautocare.com', phone: '+971 4 345 6789' },
    ];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['scheduled', 'completed', 'cancelled', 'in_progress'];
    
    for (let i = 0; i < 10; i++) {
      const vehicle = vehicles[i % vehicles.length];
      const vendor = vendors[i % vendors.length];
      const maintenanceType = maintenanceTypes[i % maintenanceTypes.length];
      const priority = priorities[i % priorities.length];
      const status = statuses[i % statuses.length];
      
      // Create dates - some past, some future
      const baseDate = new Date();
      const dayOffset = (i - 5) * 7; // Some past, some future
      const scheduledDate = new Date(baseDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
      
      const schedule = {
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.registrationNumber || vehicle.vehicleNumber || `VEH-${i + 1}`,
        vehicleMake: vehicle.make || 'Toyota',
        vehicleModel: vehicle.model || 'Hiace',
        maintenanceType,
        scheduledDate,
        vendorEmail: vendor.email,
        vendorName: vendor.name,
        vendorPhone: vendor.phone,
        description: `${maintenanceType} for ${vehicle.registrationNumber || vehicle.vehicleNumber}. Regular maintenance as per schedule.`,
        estimatedCost: Math.floor(Math.random() * 5000) + 1000, // Random cost between 1000-6000
        priority,
        status,
        emailSent: Math.random() > 0.3, // 70% chance email was sent
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          uid: 'admin-test',
          email: 'admin@abratravels.com',
          name: 'Admin User'
        }
      };
      
      if (schedule.emailSent) {
        schedule.emailSentAt = new Date(scheduledDate.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days before
        schedule.emailMessageId = `msg-${Date.now()}-${i}`;
      }
      
      maintenanceSchedules.push(schedule);
    }
    
    // Insert maintenance schedules
    console.log('\n📝 Creating maintenance schedules...');
    const scheduleResult = await db.collection('maintenance_schedules').insertMany(maintenanceSchedules);
    console.log(`✅ Created ${scheduleResult.insertedCount} maintenance schedules`);
    
    // Create sample maintenance reports
    const maintenanceReports = [];
    
    for (let i = 0; i < 8; i++) {
      const vehicle = vehicles[i % vehicles.length];
      const vendor = vendors[i % vendors.length];
      const maintenanceType = maintenanceTypes[i % maintenanceTypes.length];
      
      // Create completed dates - all in the past
      const baseDate = new Date();
      const dayOffset = -Math.floor(Math.random() * 90); // Random past date within 90 days
      const completedDate = new Date(baseDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
      
      const report = {
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.registrationNumber || vehicle.vehicleNumber || `VEH-${i + 1}`,
        vehicleMake: vehicle.make || 'Toyota',
        vehicleModel: vehicle.model || 'Hiace',
        maintenanceType,
        completedDate,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        actualCost: Math.floor(Math.random() * 6000) + 800, // Random cost between 800-6800
        description: `Completed ${maintenanceType} for ${vehicle.registrationNumber || vehicle.vehicleNumber}. All work completed successfully.`,
        status: 'completed',
        partsReplaced: i % 3 === 0 ? [`Part-${i + 1}`, `Component-${i + 2}`] : [],
        nextMaintenanceDue: new Date(completedDate.getTime() + (90 * 24 * 60 * 60 * 1000)), // 90 days later
        warrantyInfo: i % 2 === 0 ? '6 months warranty on parts' : '',
        invoiceNumber: `INV-${Date.now()}-${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          uid: 'admin-test',
          email: 'admin@abratravels.com',
          name: 'Admin User'
        }
      };
      
      maintenanceReports.push(report);
    }
    
    // Insert maintenance reports
    console.log('\n📊 Creating maintenance reports...');
    const reportResult = await db.collection('maintenance_reports').insertMany(maintenanceReports);
    console.log(`✅ Created ${reportResult.insertedCount} maintenance reports`);
    
    // Display summary
    console.log('\n📋 ========== SAMPLE DATA SUMMARY ==========');
    console.log(`✅ Maintenance Schedules: ${scheduleResult.insertedCount}`);
    console.log(`✅ Maintenance Reports: ${reportResult.insertedCount}`);
    
    // Show some sample data
    console.log('\n🔍 Sample Scheduled Maintenances:');
    maintenanceSchedules.slice(0, 3).forEach((schedule, index) => {
      console.log(`${index + 1}. ${schedule.vehicleNumber} - ${schedule.maintenanceType} (${schedule.status}) - ${schedule.scheduledDate.toDateString()}`);
    });
    
    console.log('\n🔍 Sample Maintenance Reports:');
    maintenanceReports.slice(0, 3).forEach((report, index) => {
      console.log(`${index + 1}. ${report.vehicleNumber} - ${report.maintenanceType} (₹${report.actualCost}) - ${report.completedDate.toDateString()}`);
    });
    
    console.log('\n🎯 Sample maintenance data created successfully!');
    console.log('💡 You can now test the maintenance management screen in the Flutter app');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
createSampleMaintenanceData();