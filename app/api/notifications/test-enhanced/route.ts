import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';
import { 
  sendMorningMotivationEmail,
  sendEveningCheckinEmail,
  sendMilestoneEmail,
  sendStreakRecoveryEmail 
} from '@/lib/email-service';

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

    const { type } = await request.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Get user
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user || !user.email) {
      return NextResponse.json({ message: 'User not found or no email' }, { status: 404 });
    }
    
    const userName = user.name || 'Champion';
    let success = false;

    // Send appropriate email based on type
    try {
      switch (type) {
        case 'morning':
          success = await sendMorningMotivationEmail(userName, user.email, 5, 'Test morning motivation!');
          break;
        case 'evening':
          success = await sendEveningCheckinEmail(userName, user.email, 3, 4);
          break;
        case 'milestone':
          success = await sendMilestoneEmail(userName, user.email, 7);
          break;
        case 'recovery':
          success = await sendStreakRecoveryEmail(userName, user.email);
          break;
        default:
          success = await sendMorningMotivationEmail(userName, user.email, 0, 'Test email notification!');
          break;
      }
    } catch (error) {
      console.error('Email send error:', error);
      return NextResponse.json({
        message: 'Email send failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: success ? '✅ Test email sent successfully!' : '❌ Test email failed',
      sent: success ? 1 : 0,
      failed: success ? 0 : 1,
      type,
      recipient: user.email,
      note: 'EMAIL ONLY - No push notifications used'
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        message: 'Test email error occurred', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}