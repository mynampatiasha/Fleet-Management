// Create sample company data for the bar chart demo
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function createSampleData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🏢 Creating sample company data...');
    
    // Sample companies (clients)
    const companies = [
      {
        firebaseUid: 'company1-uid',
        name: 'Tech Solutions Ltd',
        companyName: 'Tech Solutions Ltd',
        role: 'client',
        email: 'admin@techsolutions.com',
        contactPerson: 'John Smith',
        phone: '+91-9876543210',
        status: 'active',
        createdAt: new Date()
      },
      {
        firebaseUid: 'company2-uid',
        name: 'Global Industries',
        companyName: 'Global Industries',
        role: 'client',
        email: 'contact@globalind.com',
        contactPerson: 'Sarah Johnson',
        phone: '+91-9876543211',
        status: 'active',
        createdAt: new Date()
      },
      {
        firebaseUid: 'company3-uid',
        name: 'Metro Services',
        companyName: 'Metro Services',
        role: 'client',
        email: 'info@metroservices.com',
        contactPerson: 'Mike Wilson',
        phone: '+91-9876543212',
        status: 'active',
        createdAt: new Date()
      },
      {
        firebaseUid: 'company4-uid',
        name: 'Digital Corp',
        companyName: 'Digital Corp',
        role: 'client',
        email: 'admin@digitalcorp.com',
        contactPerson: 'Lisa Brown',
        phone: '+91-9876543213',
        status: 'active',
        createdAt: new Date()
      },
      {
        firebaseUid: 'company5-uid',
        name: 'Innovation Hub',
        companyName: 'Innovation Hub',
        role: 'client',
        email: 'contact@innovhub.com',
        contactPerson: 'David Lee',
        phone: '+91-9876543214',
        status: 'active',
        createdAt: new Date()
      }
    ];
    
    // Insert companies
    await db.collection('users').insertMany(companies);
    console.log(`✅ Created ${companies.length} companies`);
    
    // Sample employees for each company
    const employees = [];
    const companyEmployeeCounts = [45, 32, 28, 15, 8]; // Different employee counts
    
    companies.forEach((company, companyIndex) => {
      const employeeCount = companyEmployeeCounts[companyIndex];
      
      for (let i = 1; i <= employeeCount; i++) {
        employees.push({
          firebaseUid: `${company.firebaseUid}-emp-${i}`,
          name: `Employee ${i}`,
          email: `emp${i}@${company.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          role: 'customer',
          companyName: company.companyName,
          clientId: company.firebaseUid,
          department: i <= 10 ? 'Engineering' : i <= 20 ? 'Sales' : i <= 30 ? 'Marketing' : 'Operations',
          status: 'active',
          createdAt: new Date()
        });
      }
    });
    
    // Insert employees
    await db.collection('users').insertMany(employees);
    console.log(`✅ Created ${employees.length} employees`);
    
    // Sample trips for some employees
    const trips = [];
    const tripStatuses = ['completed', 'completed', 'completed', 'in_progress', 'cancelled'];
    const fares = [150, 200, 180, 220, 160, 190, 170, 210];
    
    employees.forEach((employee, index) => {
      // Create 0-3 trips per employee randomly
      const tripCount = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < tripCount; i++) {
        const status = tripStatuses[Math.floor(Math.random() * tripStatuses.length)];
        const fare = fares[Math.floor(Math.random() * fares.length)];
        
        trips.push({
          _id: `trip-${employee.firebaseUid}-${i}`,
          customerId: employee.firebaseUid,
          driverId: 'driver-1',
          vehicleId: 'vehicle-1',
          status: status,
          fare: status === 'completed' ? fare : 0,
          pickupLocation: 'Sample Pickup Location',
          dropLocation: 'Sample Drop Location',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          completedAt: status === 'completed' ? new Date() : null
        });
      }
    });
    
    // Insert trips
    if (trips.length > 0) {
      await db.collection('trips').insertMany(trips);
      console.log(`✅ Created ${trips.length} trips`);
    }
    
    console.log('\n🎉 Sample data created successfully!');
    console.log('Company breakdown:');
    companies.forEach((company, index) => {
      console.log(`- ${company.name}: ${companyEmployeeCounts[index]} employees`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await client.close();
  }
}

createSampleData();