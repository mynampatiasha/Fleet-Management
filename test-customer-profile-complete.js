const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'http://localhost:3001';
const MONGO_URL = 'mongodb://localhost:27017';

async function testCustomerProfileComplete() {
  console.log('🧪 COMPLETE CUSTOMER PROFILE TEST\n');
  console.log('=' .repeat(80) + '\n');
  
  let mongoClient;
  
  try {
    // ========================================
    // STEP 1: Check MongoDB Connection
    // ========================================
    console.log('📊 STEP 1: Checking MongoDB Connection...\n');
    
    try {
      mongoClient = new MongoClient(MONGO_URL);
      await mongoClient.connect();
      console.log('✅ MongoDB connected successfully\n');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.error('   Please start MongoDB first: start-mongodb.bat\n');
      return;
    }
    
    const db = mongoClient.db('abra_fleet');
    
    // ========================================
    // STEP 2: List All Customers
    // ========================================
    console.log('📋 STEP 2: Listing All Customers...\n');
    
    const customers = await db.collection('customers').find({}).toArray();
    
    if (customers.length === 0) {
      console.log('❌ No customers found in database');
      console.log('   You need to create a customer account first\n');
      return;
    }
    
    console.log(`Found ${customers.length} customer(s):\n`);
    
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name || 'Unnamed'} (${customer.email})`);
      console.log(`   ID: ${customer._id}`);
      console.log(`   Phone: ${customer.phoneNumber || 'NOT SET'}`);
      console.log(`   Company: ${customer.companyName || 'NOT SET'}`);
      console.log(`   Department: ${customer.department || 'NOT SET'}`);
      console.log(`   Status: ${customer.status || 'NOT SET'}`);
      console.log(`   Has Password: ${customer.password ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Use the first customer for testing
    const testCustomer = customers[0];
    console.log(`Using customer: ${testCustomer.email} for testing\n`);
    console.log('=' .repeat(80) + '\n');
    
    // ========================================
    // STEP 3: Check Backend Connection
    // ========================================
    console.log('🌐 STEP 3: Checking Backend Connection...\n');
    
    try {
      const healthCheck = await axios.get(`${BASE_URL}/health`, {
        timeout: 5000
      });
      console.log('✅ Backend is running');
      console.log(`   Status: ${healthCheck.status}`);
      console.log(`   Response: ${JSON.stringify(healthCheck.data)}\n`);
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      console.error('   Please start backend: start-backend.bat\n');
      return;
    }
    
    // ========================================
    // STEP 4: Test Login
    // ========================================
    console.log('🔐 STEP 4: Testing Login...\n');
    
    let token;
    try {
      // Try to login with the customer
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testCustomer.email,
        password: 'password123'  // Default password
      });
      
      token = loginResponse.data.token;
      const userData = loginResponse.data.user;
      
      console.log('✅ Login successful');
      console.log(`   User ID: ${userData.id}`);
      console.log(`   Name: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Token: ${token.substring(0, 30)}...\n`);
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      console.error('   The customer might not have a password set');
      console.error('   Or the password might not be "password123"\n');
      
      // Try to set password
      console.log('🔧 Attempting to set password for customer...\n');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.collection('customers').updateOne(
        { _id: testCustomer._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('✅ Password set to: password123');
      console.log('   Please try logging in again\n');
      return;
    }
    
    // ========================================
    // STEP 5: Test Profile API
    // ========================================
    console.log('👤 STEP 5: Testing Profile API...\n');
    
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/customer/stats/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile API successful');
      console.log(`   Success: ${profileResponse.data.success}`);
      console.log('\n📋 Profile Data:\n');
      console.log(JSON.stringify(profileResponse.data.data, null, 2));
      
      // Check which fields are populated
      console.log('\n🔍 Field Status:\n');
      const data = profileResponse.data.data;
      const fields = [
        'name', 'email', 'phoneNumber', 'alternativePhone',
        'companyName', 'department', 'employeeId', 'designation'
      ];
      
      fields.forEach(field => {
        const value = data[field];
        const status = value ? '✅' : '❌';
        console.log(`${status} ${field}: ${value || 'NOT PROVIDED'}`);
      });
      
      // Count missing fields
      const missingFields = fields.filter(f => !data[f]);
      if (missingFields.length > 0) {
        console.log(`\n⚠️  ${missingFields.length} field(s) are missing data`);
        console.log('   Missing: ' + missingFields.join(', '));
        console.log('\n💡 To populate these fields:');
        console.log('   1. Login to the app');
        console.log('   2. Go to Profile');
        console.log('   3. Click "Edit Profile"');
        console.log('   4. Fill in the missing fields');
        console.log('   5. Click "Save Changes"');
      } else {
        console.log('\n✅ All fields are populated!');
      }
      
    } catch (error) {
      console.error('❌ Profile API failed:', error.response?.data || error.message);
      console.error('   Status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.error('   The JWT token might be invalid or expired');
      } else if (error.response?.status === 404) {
        console.error('   Customer profile not found in database');
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('=' .repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

// Run the test
testCustomerProfileComplete();
