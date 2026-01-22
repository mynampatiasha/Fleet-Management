// fix-tms-duplicate-ticket-numbers.js
// Fix duplicate ticket number issue in TMS

const { MongoClient } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'abra_fleet_backend/.env') });

async function fixTMSDuplicateTicketNumbers() {
  console.log('\n🎫 ========== FIXING TMS DUPLICATE TICKET NUMBERS ==========');
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Check for existing duplicate ticket numbers
    console.log('\n1️⃣ Checking for duplicate ticket numbers...');
    const duplicates = await db.collection('tickets').aggregate([
      {
        $group: {
          _id: '$ticketNumber',
          count: { $sum: 1 },
          tickets: { $push: { _id: '$_id', createdAt: '$createdAt' } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Found ${duplicates.length} duplicate ticket numbers:`);
      
      for (const duplicate of duplicates) {
        console.log(`   - ${duplicate._id}: ${duplicate.count} tickets`);
        
        // Keep the oldest ticket, rename the others
        const sortedTickets = duplicate.tickets.sort((a, b) => a.createdAt - b.createdAt);
        const ticketsToRename = sortedTickets.slice(1); // Skip the first (oldest) one
        
        for (let i = 0; i < ticketsToRename.length; i++) {
          const ticket = ticketsToRename[i];
          const newTicketNumber = `${duplicate._id}-DUP-${i + 1}`;
          
          await db.collection('tickets').updateOne(
            { _id: ticket._id },
            { $set: { ticketNumber: newTicketNumber } }
          );
          
          console.log(`     ✅ Renamed duplicate to: ${newTicketNumber}`);
        }
      }
    } else {
      console.log('✅ No duplicate ticket numbers found');
    }
    
    // Step 2: Create unique index on ticketNumber
    console.log('\n2️⃣ Creating unique index on ticketNumber...');
    try {
      await db.collection('tickets').createIndex(
        { ticketNumber: 1 }, 
        { unique: true, name: 'ticketNumber_unique' }
      );
      console.log('✅ Unique index created successfully');
    } catch (error) {
      if (error.code === 85) { // Index already exists
        console.log('ℹ️ Unique index already exists');
      } else {
        console.log('⚠️ Failed to create unique index:', error.message);
      }
    }
    
    // Step 3: Test the new ticket number generation
    console.log('\n3️⃣ Testing new ticket number generation...');
    
    // Simulate the new generation logic
    const year = new Date().getFullYear();
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const datePrefix = `TKT-${year}-${month}${day}`;
    console.log('   Date prefix:', datePrefix);
    
    // Find existing tickets with today's prefix
    const todayTickets = await db.collection('tickets')
      .find({ 
        ticketNumber: { $regex: `^${datePrefix}` }
      })
      .sort({ ticketNumber: -1 })
      .limit(5)
      .toArray();
    
    console.log(`   Found ${todayTickets.length} tickets with today's prefix:`);
    todayTickets.forEach(ticket => {
      console.log(`     - ${ticket.ticketNumber}`);
    });
    
    // Generate next ticket number
    let nextSequence = 1;
    if (todayTickets.length > 0) {
      const lastTicketNumber = todayTickets[0].ticketNumber;
      const parts = lastTicketNumber.split('-');
      if (parts.length >= 3) {
        const lastSequence = parseInt(parts[parts.length - 1]) || 0;
        nextSequence = lastSequence + 1;
      }
    }
    
    const nextTicketNumber = `${datePrefix}-${String(nextSequence).padStart(3, '0')}`;
    console.log('   Next ticket number would be:', nextTicketNumber);
    
    // Step 4: Show current ticket statistics
    console.log('\n4️⃣ Current ticket statistics:');
    const totalTickets = await db.collection('tickets').countDocuments();
    const todayTicketsCount = await db.collection('tickets').countDocuments({
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    console.log(`   Total tickets: ${totalTickets}`);
    console.log(`   Today's tickets: ${todayTicketsCount}`);
    
    console.log('\n✅ TMS duplicate ticket number fix completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🎫 ========== FIX COMPLETE ==========\n');
}

// Run the fix
fixTMSDuplicateTicketNumbers();