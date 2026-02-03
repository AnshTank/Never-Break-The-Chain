import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { sendEmail, testEmailConnection } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'nbtc-secure-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Test email connection
    console.log('🔍 Testing email connection...');
    const emailTest = await testEmailConnection();
    console.log(`📧 Email connection test: ${emailTest ? 'SUCCESS' : 'FAILED'}`);
    
    // Get user count
    const userCount = await db.collection('users').countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    
    // Get active users with emails
    const activeUsers = await db.collection('users').find({
      isActive: { $ne: false },
      email: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`✅ Active users with emails: ${activeUsers.length}`);
    
    // Get sample user data
    const sampleUsers = activeUsers.slice(0, 3).map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      notificationPreferences: user.notificationPreferences
    }));
    
    // Test sending email to first user if exists
    let emailTestResult = null;
    if (activeUsers.length > 0) {
      const testUser = activeUsers[0];
      console.log(`📨 Testing email send to: ${testUser.email}`);
      
      emailTestResult = await sendEmail({
        to: testUser.email,
        subject: '🧪 Test Email - Never Break The Chain',
        html: `
          <h2>🧪 Email Test Successful!</h2>
          <p>Hi ${testUser.name || 'there'}!</p>
          <p>This is a test email to verify our notification system is working.</p>
          <p>If you received this, our email service is functioning correctly! 🎉</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        `
      });
      
      console.log(`📧 Test email result: ${emailTestResult ? 'SUCCESS' : 'FAILED'}`);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        emailConnectionTest: emailTest,
        totalUsers: userCount,
        activeUsersWithEmails: activeUsers.length,
        sampleUsers,
        testEmailSent: emailTestResult,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Debug users error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}