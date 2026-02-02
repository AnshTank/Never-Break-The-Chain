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

    const { deviceId } = await request.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Update device last active time
    await db.collection('devices').updateOne(
      { userId, deviceId },
      { $set: { lastActive: new Date() } }
    );

    return NextResponse.json({ message: 'Heartbeat updated' });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}