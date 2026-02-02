import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'anshtank9@gmail.com'),
  process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    const pendingNotifications = await db.collection('notifications')
      .find({
        status: 'pending',
        sendAt: { $lte: now }
      })
      .toArray();

    let delivered = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      try {
        const userId = new ObjectId(notification.userId);
        
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
          await db.collection('notifications').updateOne(
            { _id: notification._id },
            { $set: { status: 'failed', failedAt: now, error: 'User not found' } }
          );
          failed++;
          continue;
        }

        let deliverySuccess = false;

        // Try push notification first if channel is push
        if (notification.channel === 'push') {
          const devices = await db.collection('devices').find({
            userId,
            isActive: true,
            expiresAt: { $gt: now },
            pushSubscription: { $exists: true }
          }).toArray();

          for (const device of devices) {
            try {
              await webpush.sendNotification(
                device.pushSubscription,
                JSON.stringify({
                  title: notification.message.title,
                  body: notification.message.body,
                  icon: '/favicon.svg',
                  tag: `notification-${notification._id}`,
                  data: { url: '/dashboard' }
                })
              );
              deliverySuccess = true;
            } catch (pushError) {
              console.error(`Push failed for device ${device.deviceId}:`, pushError);
            }
          }
        }

        // Fallback to email if push failed or channel is email
        if (!deliverySuccess || notification.channel === 'email') {
          try {
            const { sendEmail } = await import('@/lib/email-service');
            const emailSent = await sendEmail({
              to: user.email,
              subject: notification.message.email?.subject || notification.message.title,
              html: `<p>${notification.message.body}</p>`
            });
            
            if (emailSent) {
              deliverySuccess = true;
            }
          } catch (emailError) {
            console.error(`Email failed for user ${userId}:`, emailError);
          }
        }

        if (deliverySuccess) {
          await db.collection('notifications').updateOne(
            { _id: notification._id },
            { 
              $set: { 
                status: 'delivered', 
                deliveredAt: now,
                actualChannel: notification.channel
              } 
            }
          );
          delivered++;
        } else {
          await db.collection('notifications').updateOne(
            { _id: notification._id },
            { 
              $set: { 
                status: 'failed', 
                failedAt: now, 
                error: 'All delivery methods failed' 
              } 
            }
          );
          failed++;
        }

      } catch (error) {
        console.error(`Notification delivery failed for ${notification._id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Processed ${pendingNotifications.length} notifications`,
      delivered,
      failed,
      timestamp: now
    });

  } catch (error) {
    console.error('Notification delivery error:', error);
    return NextResponse.json(
      { message: 'Delivery failed' },
      { status: 500 }
    );
  }
}