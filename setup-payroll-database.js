// setup-payroll-database.js
// Script to set up MongoDB collections and indexes for HRM Payroll Management

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function setupPayrollDatabase() {
  console.log('\n🔧 Setting up HRM Payroll Database...');
  console.log('═'.repeat(80));

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    // Create hr_payroll collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const payrollCollectionExists = collections.some(col => col.name === 'hr_payroll');
    
    if (!payrollCollectionExists) {
      await db.createCollection('hr_payroll');
      console.log('✅ Created hr_payroll collection');
    } else {
      console.log('ℹ️  hr_payroll collection already exists');
    }

    // Create indexes for hr_payroll collection
    const payrollCollection = db.collection('hr_payroll');
    
    console.log('\n📊 Creating indexes for hr_payroll collection...');
    
    // Index for sorting by creation date (most recent first)
    await payrollCollection.createIndex({ "createdAt": -1 });
    console.log('✅ Created index on createdAt (descending)');
    
    // Compound index for employee payroll history
    await payrollCollection.createIndex({ "employee_id": 1, "pay_date": -1 });
    console.log('✅ Created compound index on employee_id + pay_date');
    
    // Index for pay date queries
    await payrollCollection.createIndex({ "pay_date": -1 });
    console.log('✅ Created index on pay_date (descending)');

    // Check if hr_employees collection exists
    const employeesCollectionExists = collections.some(col => col.name === 'hr_employees');
    
    if (!employeesCollectionExists) {
      await db.createCollection('hr_employees');
      console.log('✅ Created hr_employees collection');
      
      // Create sample employees for testing
      const sampleEmployees = [
        {
          name: 'John Doe',
          email: 'john.doe@abrafleet.com',
          phone: '+91-9876543210',
          department: 'Engineering',
          position: 'Software Developer',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@abrafleet.com',
          phone: '+91-9876543211',
          department: 'HR',
          position: 'HR Manager',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Mike Johnson',
          email: 'mike.johnson@abrafleet.com',
          phone: '+91-9876543212',
          department: 'Operations',
          position: 'Fleet Manager',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await db.collection('hr_employees').insertMany(sampleEmployees);
      console.log(`✅ Created ${result.insertedCount} sample employees`);
    } else {
      console.log('ℹ️  hr_employees collection already exists');
    }

    // Create sample payroll data for testing
    const payrollCount = await payrollCollection.countDocuments();
    
    if (payrollCount === 0) {
      console.log('\n💰 Creating sample payroll data...');
      
      const employees = await db.collection('hr_employees').find({}).toArray();
      
      if (employees.length > 0) {
        const samplePayrollEntries = [];
        
        for (const employee of employees) {
          // Create 3 months of payroll data for each employee
          for (let i = 0; i < 3; i++) {
            const payDate = new Date();
            payDate.setMonth(payDate.getMonth() - i);
            payDate.setDate(1); // First day of the month
            
            const baseAmount = 50000 + (Math.random() * 30000); // Random salary between 50k-80k
            
            samplePayrollEntries.push({
              employee_id: employee._id.toString(),
              amount: Math.round(baseAmount * 100) / 100, // Round to 2 decimal places
              pay_date: payDate.toISOString(),
              comment: `${payDate.toLocaleString('default', { month: 'long', year: 'numeric' })} salary`,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'admin@abrafleet.com'
            });
          }
        }
        
        const payrollResult = await payrollCollection.insertMany(samplePayrollEntries);
        console.log(`✅ Created ${payrollResult.insertedCount} sample payroll entries`);
      }
    } else {
      console.log(`ℹ️  hr_payroll collection already has ${payrollCount} entries`);
    }

    console.log('\n📋 Database Setup Summary:');
    console.log('─'.repeat(50));
    
    const finalPayrollCount = await payrollCollection.countDocuments();
    const finalEmployeeCount = await db.collection('hr_employees').countDocuments();
    
    console.log(`📊 hr_payroll entries: ${finalPayrollCount}`);
    console.log(`👥 hr_employees entries: ${finalEmployeeCount}`);
    
    // Show sample data
    console.log('\n💼 Sample Payroll Entries:');
    const samplePayroll = await payrollCollection.aggregate([
      {
        $lookup: {
          from: 'hr_employees',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          employee_name: '$employee.name',
          amount: 1,
          pay_date: 1,
          comment: 1
        }
      },
      { $limit: 5 }
    ]).toArray();

    samplePayroll.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.employee_name} - ₹${entry.amount.toFixed(2)} - ${new Date(entry.pay_date).toLocaleDateString()}`);
    });

    console.log('\n✅ HRM Payroll Database setup completed successfully!');
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupPayrollDatabase().catch(console.error);