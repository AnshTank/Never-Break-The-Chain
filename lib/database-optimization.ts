import { connectToDatabase } from './mongodb';

// Database indexes for optimal performance
export async function createOptimalIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    // Users collection indexes
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true, background: true });
    await users.createIndex({ _id: 1, email: 1 }, { background: true });
    await users.createIndex({ emailVerified: 1 }, { background: true });
    await users.createIndex({ createdAt: 1 }, { background: true });
    
    // Progress collection indexes  
    const progress = db.collection('progress');
    await progress.createIndex({ userId: 1, date: 1 }, { unique: true, background: true });
    await progress.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await progress.createIndex({ date: 1 }, { background: true });
    
    // Devices collection indexes
    const devices = db.collection('devices');
    await devices.createIndex({ userId: 1, deviceId: 1 }, { unique: true, background: true });
    await devices.createIndex({ deviceId: 1 }, { background: true });
    await devices.createIndex({ userId: 1, isActive: 1 }, { background: true });
    await devices.createIndex({ lastActive: 1 }, { background: true });
    await devices.createIndex({ rememberMeExpiry: 1 }, { background: true, sparse: true });
    
    // Timer data collection indexes
    const timerData = db.collection('timerData');
    await timerData.createIndex({ userId: 1, date: 1 }, { background: true });
    await timerData.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    
    // Settings collection indexes
    const settings = db.collection('settings');
    await settings.createIndex({ userId: 1 }, { unique: true, background: true });
    
    console.log('✅ Database indexes created successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create database indexes:', error);
    return false;
  }
}

// Cleanup expired data for performance
export async function cleanupExpiredData() {
  try {
    const { db } = await connectToDatabase();
    
    // Remove expired OTP codes
    const users = db.collection('users');
    await users.updateMany(
      { otpExpires: { $lt: new Date() } },
      { $unset: { otpCode: 1, otpExpires: 1 } }
    );
    
    // Remove expired device remember me
    const devices = db.collection('devices');
    await devices.updateMany(
      { 
        rememberMeExpiry: { $lt: new Date() },
        rememberMe: true 
      },
      { 
        $set: { rememberMe: false },
        $unset: { rememberMeExpiry: 1 }
      }
    );
    
    // Remove inactive devices older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    await devices.deleteMany({
      lastActive: { $lt: ninetyDaysAgo },
      isActive: false
    });
    
    console.log('✅ Expired data cleanup completed');
    return true;
  } catch (error) {
    console.error('❌ Failed to cleanup expired data:', error);
    return false;
  }
}

// Initialize database optimizations
export async function initializeDatabaseOptimizations() {
  await createOptimalIndexes();
  
  // Run cleanup every 6 hours
  setInterval(cleanupExpiredData, 6 * 60 * 60 * 1000);
  
  // Initial cleanup
  await cleanupExpiredData();
}