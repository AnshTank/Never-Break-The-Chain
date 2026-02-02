import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest) {
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

    // Delete all devices for this user
    const result = await db.collection('devices').deleteMany({ userId });

    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} devices`,
      deletedCount: result.deletedCount 
    });

  } catch (error) {
    console.error('Delete all devices error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}