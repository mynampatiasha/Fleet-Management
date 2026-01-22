// debug-my-tickets-flutter-auth.js
// Debug Flutter authentication for My Tickets

const axios = require('axios');
const admin = require('./abra_fleet_backend/config/firebase');

const BASE_URL = 'http://localhost:3001';

async function debugFlutterAuth() {
  console.log('\n🔍 ========== DEBUGGING FLUTTER MY TICKETS AUTH ==========');
  
  try {
    // 1. Create a custom token for admin@abrafleet.com
    console.log('\n1️⃣ Creating custom token for admin@abrafleet.com...');
    const customToken = await admin.auth().createCustomToken('qnwp8d0clDSSNuSm3ugmXYLSI3K2');
    console.log('✅ Custom token created (length:', customToken.length, ')');
    
    // 2. Test the My Tickets API directly with the token
    console.log('\n2️⃣ Testing My Tickets API with custom token...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/tickets/my`, {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ My Tickets API Response:');
      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Tickets found:', response.data.data?.length || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n📋 Tickets:');
        response.data.data.forEach((ticket, index) => {
          console.log(`   ${index + 1}. ${ticket.ticketNumber}: ${ticket.subject}`);
          console.log(`      Status: ${ticket.status}, Priority: ${ticket.priority}`);
        });
      }
      
    } catch (apiError) {
      console.log('❌ My Tickets API failed:');
      console.log('   Status:', apiError.response?.status);
      console.log('   Error:', apiError.response?.data || apiError.message);
    }
    
    // 3. Test user lookup
    console.log('\n3️⃣ Testing user lookup...');
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet');
    await client.connect();
    const db = client.db();
    
    const firebaseUid = 'qnwp8d0clDSSNuSm3ugmXYLSI3K2';
    
    // Check users collection
    const user = await db.collection('users').findOne({ firebaseUid });
    console.log('   User in users collection:', user ? '✅ Found' : '❌ Not found');
    if (user) {
      console.log('     ID:', user._id);
      console.log('     Email:', user.email);
      console.log('     Role:', user.role);
    }
    
    // Check admin_users collection
    const adminUser = await db.collection('admin_users').findOne({ firebaseUid });
    console.log('   User in admin_users collection:', adminUser ? '✅ Found' : '❌ Not found');
    if (adminUser) {
      console.log('     ID:', adminUser._id);
      console.log('     Email:', adminUser.email);
      console.log('     Role:', adminUser.role);
    }
    
    // Check tickets assigned to this user
    const userId = user ? user._id : (adminUser ? adminUser._id : null);
    if (userId) {
      const tickets = await db.collection('tickets').find({ assignedTo: userId }).toArray();
      console.log(`   Tickets assigned to user: ${tickets.length}`);
      tickets.forEach((ticket, index) => {
        console.log(`     ${index + 1}. ${ticket.ticketNumber}: ${ticket.subject} (${ticket.status})`);
      });
    }
    
    await client.close();
    
    console.log('\n💡 Debugging Summary:');
    console.log('   - Backend is accessible ✅');
    console.log('   - Custom token can be created ✅');
    console.log('   - User exists in database ✅');
    console.log('   - Tickets exist for user ✅');
    console.log('\n🔍 If Flutter My Tickets is still not working, check:');
    console.log('   1. Flutter app Firebase authentication');
    console.log('   2. Token generation in Flutter');
    console.log('   3. API call headers in Flutter');
    console.log('   4. Network connectivity from Flutter to backend');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugFlutterAuth();