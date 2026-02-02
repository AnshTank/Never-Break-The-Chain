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

    // Clean up all devices for this user to reset state
    const result = await db.collection('devices').deleteMany({ userId });

    console.log(`Cleaned up ${result.deletedCount} devices for user ${userId}`);

    return NextResponse.json({
      message: `Cleaned up ${result.deletedCount} devices`,
      deletedCount: result.deletedCount,
      success: true
    });

  } catch (error) {
    console.error('Device cleanup error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}