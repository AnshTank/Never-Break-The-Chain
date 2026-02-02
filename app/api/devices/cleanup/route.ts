import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Find all devices for this user
    const devices = await db.collection('devices')
      .find({ userId, isActive: true })
      .sort({ lastActive: -1 })
      .toArray();

    // Group by device name to find duplicates
    const deviceGroups = new Map();
    
    devices.forEach(device => {
      const key = device.deviceName; // Group by device name
      
      if (!deviceGroups.has(key)) {
        deviceGroups.set(key, [device]);
      } else {
        deviceGroups.get(key).push(device);
      }
    });

    let cleanedCount = 0;

    // For each group, keep only the most recent device
    for (const [deviceName, deviceGroup] of deviceGroups) {
      if (deviceGroup.length > 1) {
        // Sort by lastActive (most recent first)
        deviceGroup.sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
        
        // Keep the first (most recent) device, delete the rest
        const toKeep = deviceGroup[0];
        const toRemove = deviceGroup.slice(1);

        for (const device of toRemove) {
          await db.collection('devices').deleteOne({ _id: device._id });
          cleanedCount++;
        }
      }
    }

    return NextResponse.json({ 
      message: `Cleaned up ${cleanedCount} duplicate devices`,
      cleanedCount 
    });

  } catch (error) {
    console.error('Device cleanup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}