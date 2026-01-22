// Setup TMS Database - Create indexes and test data
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setupTMSDatabase() {
  console.log('🗄️ Setting up TMS Database...\n');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const ticketsCollection = db.collection('tickets');
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    
    await ticketsCollection.createIndex({ ticketNumber: 1 }, { unique: true });
    console.log('✅ Created unique index on ticketNumber');
    
    await ticketsCollection.createIndex({ status: 1 });
    console.log('✅ Created index on status');
    
    await ticketsCollection.createIndex({ assignedTo: 1 });
    console.log('✅ Created index on assignedTo');
    
    await ticketsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on createdAt (descending)');
    
    await ticketsCollection.createIndex({ priority: 1 });
    console.log('✅ Created index on priority');
    
    await ticketsCollection.createIndex({ 'createdBy.id': 1 });
    console.log('✅ Created index on createdBy.id');
    
    // Check existing tickets
    const ticketCount = await ticketsCollection.countDocuments();
    console.log(`\n📋 Current tickets in database: ${ticketCount}`);
    
    if (ticketCount === 0) {
      console.log('💡 No tickets found. Ready for first ticket creation!');
    } else {
      console.log('📝 Existing tickets found. System ready!');
    }
    
    console.log('\n🎉 TMS Database setup complete!');
    console.log('📊 Indexes created:');
    console.log('   - ticketNumber (unique)');
    console.log('   - status');
    console.log('   - assignedTo');
    console.log('   - createdAt (desc)');
    console.log('   - priority');
    console.log('   - createdBy.id');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

setupTMSDatabase();