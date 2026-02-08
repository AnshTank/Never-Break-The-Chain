// Migration script to convert userId from ObjectId to email
// Run: node scripts/migrate-userid-to-email.js

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://anshtank9:QAZWSXrfv9%40%23@cluster0.xhvd4ww.mongodb.net/?appName=Cluster0";

async function migrate() {
  const client = new MongoClient(MONGODB_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('journey-tracker');
    
    // Get all users to create userId -> email mapping
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    const userIdToEmail = {};
    users.forEach(user => {
      userIdToEmail[user._id.toString()] = user.email;
    });
    
    // Migrate dailyProgress collection
    console.log('\nMigrating dailyProgress...');
    const progressDocs = await db.collection('dailyProgress').find({}).toArray();
    console.log(`Found ${progressDocs.length} progress documents`);
    
    for (const doc of progressDocs) {
      const oldUserId = doc.userId;
      let newUserId;
      
      // Check if userId is ObjectId
      if (oldUserId instanceof ObjectId || ObjectId.isValid(oldUserId)) {
        const userIdStr = oldUserId.toString();
        newUserId = userIdToEmail[userIdStr];
        
        if (newUserId) {
          await db.collection('dailyProgress').updateOne(
            { _id: doc._id },
            { $set: { userId: newUserId } }
          );
          console.log(`Updated progress ${doc.date}: ${userIdStr} -> ${newUserId}`);
        }
      }
    }
    
    // Migrate userSettings collection
    console.log('\nMigrating userSettings...');
    const settingsDocs = await db.collection('userSettings').find({}).toArray();
    console.log(`Found ${settingsDocs.length} settings documents`);
    
    for (const doc of settingsDocs) {
      const oldUserId = doc.userId;
      let newUserId;
      
      // Check if userId is ObjectId
      if (oldUserId instanceof ObjectId || ObjectId.isValid(oldUserId)) {
        const userIdStr = oldUserId.toString();
        newUserId = userIdToEmail[userIdStr];
        
        if (newUserId) {
          // Check if email-based document already exists
          const existing = await db.collection('userSettings').findOne({ userId: newUserId });
          if (existing) {
            // Delete the old ObjectId document
            await db.collection('userSettings').deleteOne({ _id: doc._id });
            console.log(`Deleted duplicate settings: ${userIdStr} (email version exists)`);
          } else {
            // Update to email
            await db.collection('userSettings').updateOne(
              { _id: doc._id },
              { $set: { userId: newUserId } }
            );
            console.log(`Updated settings: ${userIdStr} -> ${newUserId}`);
          }
        }
      }
    }
    
    // Migrate devices collection
    console.log('\nMigrating devices...');
    const devicesDocs = await db.collection('devices').find({}).toArray();
    console.log(`Found ${devicesDocs.length} device documents`);
    
    for (const doc of devicesDocs) {
      const oldUserId = doc.userId;
      let newUserId;
      
      // Check if userId is ObjectId
      if (oldUserId instanceof ObjectId || ObjectId.isValid(oldUserId)) {
        const userIdStr = oldUserId.toString();
        newUserId = userIdToEmail[userIdStr];
        
        if (newUserId) {
          await db.collection('devices').updateOne(
            { _id: doc._id },
            { $set: { userId: newUserId } }
          );
          console.log(`Updated device ${doc.deviceName}: ${userIdStr} -> ${newUserId}`);
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
