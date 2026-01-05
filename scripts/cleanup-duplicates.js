// Run this script once to clean up duplicate documents
// node scripts/cleanup-duplicates.js

const { MongoClient } = require('mongodb')

async function cleanupDuplicates() {
  const client = new MongoClient(process.env.MONGODB_URL)
  
  try {
    await client.connect()
    const db = client.db()
    const collection = db.collection('dailyProgress')
    
    // Find all duplicates
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: { userId: "$userId", date: "$date" },
          docs: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray()
    
    console.log(`Found ${duplicates.length} duplicate groups`)
    
    // Remove duplicates, keep the most recent one
    for (const duplicate of duplicates) {
      const docs = await collection.find({
        _id: { $in: duplicate.docs }
      }).sort({ updatedAt: -1 }).toArray()
      
      // Keep the first (most recent), delete the rest
      const toDelete = docs.slice(1).map(doc => doc._id)
      
      if (toDelete.length > 0) {
        const result = await collection.deleteMany({
          _id: { $in: toDelete }
        })
        console.log(`Deleted ${result.deletedCount} duplicates for ${duplicate._id.userId} on ${duplicate._id.date}`)
      }
    }
    
    console.log('Cleanup completed')
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await client.close()
  }
}

cleanupDuplicates()