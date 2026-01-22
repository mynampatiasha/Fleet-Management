const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');

    const db = client.db('abra_fleet');
    console.log('🔄 Testing database ping...');
    await db.admin().ping();
    console.log('✅ Database ping successful!');

    console.log('🔄 Testing admin_users collection...');
    const adminUsers = await db.collection('admin_users').findOne({});
    console.log('✅ admin_users collection accessible');
    console.log('Sample admin user:', adminUsers ? 'Found' : 'Empty collection');

    console.log('🔄 Testing collections list...');
    const collections = await db.listCollections().toArray();
    console.log('✅ Available collections:', collections.map(c => c.name).join(', '));

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('timeout')) {
      console.error('🔍 This appears to be a timeout issue. Possible causes:');
      console.error('   1. Network connectivity issues');
      console.error('   2. MongoDB Atlas cluster is paused/sleeping');
      console.error('   3. IP address not whitelisted in MongoDB Atlas');
      console.error('   4. Incorrect connection string');
    }
  } finally {
    try {
      await client.close();
      console.log('✅ Connection closed');
    } catch (err) {
      console.error('❌ Error closing connection:', err.message);
    }
  }
}

testConnection();