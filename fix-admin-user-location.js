// Move admin user to correct collection
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function fixAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Find user in employee_admins
    const user = await db.collection('employee_admins').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    if (!user) {
      console.log('❌ User not found in employee_admins');
      return;
    }
    
    console.log('✅ Found user in employee_admins');
    
    // Hash password if not already hashed
    let password = user.password || 'admin123';
    if (!password.startsWith('$2')) {
      console.log('🔐 Hashing password...');
      password = await bcrypt.hash('admin123', 12);
    }
    
    // Create user in admin_users collection
    const adminUser = {
      email: 'admin@abrafleet.com',
      password: password,
      name: 'Admin',
      role: 'super_admin',
      organizationId: null,
      modules: ['fleet', 'drivers', 'routes', 'customers', 'billing', 'users', 'system', 'tracking', 'reports'],
      permissions: {},
      status: 'active',
      isActive: true,
      createdAt: user.createdAt || new Date(),
      updatedAt: new Date(),
      lastLogin: user.lastLogin || null,
      lastActive: new Date()
    };
    
    // Check if already exists in admin_users
    const existing = await db.collection('admin_users').findOne({ 
      email: 'admin@abrafleet.com' 
    });
    
    if (existing) {
      console.log('⚠️  User already exists in admin_users, updating...');
      await db.collection('admin_users').updateOne(
        { email: 'admin@abrafleet.com' },
        { $set: adminUser }
      );
      console.log('✅ Updated user in admin_users');
    } else {
      console.log('📝 Creating user in admin_users...');
      await db.collection('admin_users').insertOne(adminUser);
      console.log('✅ Created user in admin_users');
    }
    
    console.log('\n✅ DONE! You can now login with:');
    console.log('   Email: admin@abrafleet.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixAdminUser();
