import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  lastActive: Date;
  rememberMe: boolean;
  expiresAt: Date;
  pushSubscription?: any;
}

export class DeviceSessionManager {
  private static readonly MAX_DEVICES = 2;
  private static readonly REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly DEFAULT_DURATION = 12 * 60 * 60 * 1000; // 12 hours

  static async registerDevice(
    userId: string, 
    deviceInfo: Omit<DeviceInfo, 'lastActive' | 'expiresAt'>,
    forceRegister = false
  ): Promise<{ success: boolean; requiresSelection?: boolean; existingDevices?: any[] }> {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    // Calculate expiry
    const expiresAt = new Date(
      now.getTime() + (deviceInfo.rememberMe ? this.REMEMBER_ME_DURATION : this.DEFAULT_DURATION)
    );

    // Check if exact device already exists by deviceId
    const existingDevice = await db.collection('devices').findOne({
      userId: userId,
      deviceId: deviceInfo.deviceId,
      isActive: true
    });

    if (existingDevice) {
      // Update existing device with latest info
      await db.collection('devices').updateOne(
        { _id: existingDevice._id },
        {
          $set: {
            deviceName: deviceInfo.deviceName,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            deviceType: deviceInfo.deviceType,
            lastActive: now,
            expiresAt,
            isActive: true
          }
        }
      );
      return { success: true };
    }

    // Check for similar device (same browser+OS combo) to prevent duplicates
    const similarDevice = await db.collection('devices').findOne({
      userId: userId,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceName: deviceInfo.deviceName,
      isActive: true
    });

    if (similarDevice) {
      // Update the similar device with new deviceId
      await db.collection('devices').updateOne(
        { _id: similarDevice._id },
        {
          $set: {
            deviceId: deviceInfo.deviceId,
            lastActive: now,
            expiresAt,
            isActive: true
          }
        }
      );
      return { success: true };
    }

    // Register new device
    await db.collection('devices').insertOne({
      userId: userId,
      ...deviceInfo,
      lastActive: now,
      expiresAt,
      isActive: true,
      registeredAt: now
    });

    return { success: true };
  }

  static async removeDevice(userId: string, deviceId: string): Promise<void> {
    const { db } = await connectToDatabase();

    await db.collection('devices').deleteOne({
      userId: userId,
      deviceId
    });

    // Invalidate any cached sessions
    const { cache, CacheKeys } = await import('./cache');
    cache.delete(CacheKeys.user(userId));
    cache.delete(`device:${deviceId}`);
  }

  static async getActiveDevices(userId: string): Promise<DeviceInfo[]> {
    const { db } = await connectToDatabase();
    const now = new Date();

    const devices = await db.collection('devices')
      .find({ 
        userId: userId, 
        isActive: true, 
        expiresAt: { $gt: now } 
      })
      .toArray();

    return devices.map(d => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      deviceType: d.deviceType,
      browser: d.browser,
      os: d.os,
      lastActive: d.lastActive,
      rememberMe: d.rememberMe,
      expiresAt: d.expiresAt,
      pushSubscription: d.pushSubscription
    }));
  }

  static async updateDeviceActivity(userId: string, deviceId: string): Promise<void> {
    const { db } = await connectToDatabase();

    await db.collection('devices').updateOne(
      { userId: userId, deviceId },
      { $set: { lastActive: new Date() } }
    );
  }

  static async cleanupExpiredDevices(): Promise<number> {
    const { db } = await connectToDatabase();
    const now = new Date();

    const result = await db.collection('devices').deleteMany({
      expiresAt: { $lt: now }
    });

    return result.deletedCount || 0;
  }
}