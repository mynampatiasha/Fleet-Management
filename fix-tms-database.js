// Fix TMS Database - Clean up and setup properly
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixTMSDatabase() {
  console.log('🔧 Fixing TMS Database...\n');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const ticketsCollection = db.collection('tickets');
    
    // Check existing tickets
    const allTickets = await ticketsCollection.find({}).toArray();
    console.log(`📋 Found ${allTickets.length} existing tickets`);
    
    // Remove tickets with null or missing ticketNumber
    const invalidTickets = await ticketsCollection.find({
      $or: [
        { ticketNumber: null },
        { ticketNumber: { $exists: false } },
        { ticketNumber: '' }
      ]
    }).toArray();
    
    if (invalidTickets.length > 0) {
      console.log(`🗑️ Removing ${invalidTickets.length} invalid tickets...`);
      await ticketsCollection.deleteMany({
        $or: [
          { ticketNumber: null },
          { ticketNumber: { $exists: false } },
          { ticketNumber: '' }
        ]
      });
      console.log('✅ Invalid tickets removed');
    }
    
    // Drop existing indexes to recreate them
    console.log('\n🔄 Dropping existing indexes...');
    try {
      await ticketsCollection.dropIndexes();
      console.log('✅ Existing indexes dropped');
    } catch (error) {
      console.log('⚠️ No indexes to drop or error dropping:', error.message);
    }
    
    // Create new indexes
    console.log('\n📊 Creating new indexes...');
    
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
    
    // Final count
    const finalCount = await ticketsCollection.countDocuments();
    console.log(`\n📋 Final ticket count: ${finalCount}`);
    
    console.log('\n🎉 TMS Database fixed and ready!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixTMSDatabase();