import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import webpush from 'web-push'

// Configure web-push
webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'anshtank9@gmail.com'),
  process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

interface NotificationPayload {
  title: string
  body: string
  icon: string
  badge: string
  tag: string
  data: any
  requireInteraction?: boolean
  actions?: Array<{ action: string; title: string; icon?: string }>
}

// Smart notification messages based on user patterns and milestones
const getSmartMessage = (type: string, userData: any): NotificationPayload => {
  const { streak = 0, completedToday = 0, totalDays = 0, lastActive } = userData
  
  const messages = {
    morning: {
      fresh: [
        { title: '🌅 Rise & Shine, Champion!', body: 'Your MNZD journey awaits! Time to build today\'s link in your chain! ✨' },
        { title: '☕ Morning Energy Boost!', body: 'Coffee\'s brewing, goals are calling! Let\'s make today legendary! 🚀' },
        { title: '🔥 New Day, New Victory!', body: 'Your future self is cheering you on. Time to make them proud! 💪' },
        { title: '⚡ Champion Mode: ON!', body: 'Champions don\'t wait for motivation - they create it. Let\'s go! 🎯' }
      ],
      streak: [
        { title: `🔥 ${streak} Days Strong!`, body: `You're on fire! ${streak} days of pure dedication - don't let it cool down! 🌟` },
        { title: `💪 ${streak} Day Warrior!`, body: `${streak} days of showing up! That's the spirit of a true champion! 🏆` },
        { title: `🚀 ${streak} Days & Counting!`, body: `${streak} days of building something beautiful! Your consistency is inspiring! ✨` }
      ]
    },
    
    evening: {
      allComplete: [
        { title: '🎉 PERFECT DAY!', body: 'BOOM! All 4 pillars conquered! You\'re absolutely crushing it! 👑' },
        { title: '🏆 Mission Accomplished!', body: 'Perfect day achieved! Your dedication is next level! 🌟' },
        { title: '💎 Diamond Day!', body: '4/4 complete! You just added a diamond link to your chain! ✨' }
      ],
      threeComplete: [
        { title: '🌟 Almost Perfect!', body: '3/4 done! You\'re so close to perfection! One more push? 💪' },
        { title: '🎯 Nearly There!', body: 'Amazing progress! Just one pillar left to make it legendary! ⭐' },
        { title: '🔥 Finish Strong!', body: '3 pillars strong! Time to complete the masterpiece! 💝' }
      ],
      twoComplete: [
        { title: '💪 Halfway Hero!', body: 'Halfway there! 2/4 complete - momentum is building! 🌊' },
        { title: '🎯 Good Progress!', body: 'Solid foundation with 2/4! Let\'s build higher! 🏗️' },
        { title: '🌟 Keep Going!', body: '2 pillars standing tall! Time to rally and grab 2 more! 🚀' }
      ],
      oneComplete: [
        { title: '🌱 Every Step Counts!', body: 'Every journey starts with one step! 1/4 is progress! 🚶‍♂️' },
        { title: '⭐ Small Wins Matter!', body: '1 down, 3 to go! Small wins lead to big victories! 🎯' },
        { title: '🔥 You Showed Up!', body: 'You showed up! That\'s what separates winners from wishers! 🏆' }
      ],
      noneComplete: [
        { title: '🤗 Tomorrow\'s Fresh Start!', body: 'Tough day? We all have them! Tomorrow is a fresh start! 🌅' },
        { title: '💝 Rest & Reset!', body: 'Your chain isn\'t broken - it\'s just taking a breather! 😴' },
        { title: '🌟 Comeback Story!', body: 'Even champions have off days! What matters is getting back up! 💪' }
      ]
    },
    
    missed: {
      gentle: [
        { title: '👋 Gentle Check-in', body: 'Your MNZD journey is still calling! Ready for a quick win? 📞' },
        { title: '🌟 Small Steps Count', body: 'Gentle reminder: Small progress is still progress! 🐣' },
        { title: '💡 Quick Opportunity', body: 'Which pillar feels most doable right now? 🤔' }
      ],
      encouraging: [
        { title: '🔔 Friendly Nudge', body: 'Your chain misses you! Ready to reconnect? 🔗' },
        { title: '⏰ Perfect Timing', body: 'A few minutes of MNZD can energize your day! ⚡' },
        { title: '🎯 Quick Win Alert', body: 'Perfect moment for a quick victory! 🏹' }
      ],
      motivational: [
        { title: '🔥 Chain Calling!', body: 'Your chain is waiting! Which pillar will you strengthen next? 💎' },
        { title: '🏆 Champion Mindset', body: 'Champions show up even when they don\'t feel like it. That\'s you! 👑' },
        { title: '⭐ Plot Twist Time', body: 'Today\'s the day you surprise yourself with progress! 🎭' }
      ]
    },
    
    milestone: {
      week: { title: '🎉 7-Day Milestone!', body: 'One week of consistency! You\'re building something incredible! 🌟' },
      twoWeeks: { title: '🚀 14-Day Champion!', body: 'Two weeks strong! Your dedication is truly inspiring! 💪' },
      month: { title: '👑 30-Day Royalty!', body: 'One month of never breaking the chain! You\'re unstoppable! 🔥' },
      hundred: { title: '💎 100-Day Legend!', body: 'ONE HUNDRED DAYS! You\'ve achieved legendary status! 🏆' },
      year: { title: '🌟 365-Day Master!', body: 'A FULL YEAR! You\'ve mastered the art of consistency! 👑' }
    },
    
    streak: {
      fire: { title: '🔥 Streak on Fire!', body: `${streak} days of pure dedication! You\'re absolutely unstoppable! ⚡` },
      diamond: { title: '💎 Diamond Streak!', body: `${streak} days of excellence! Your consistency is precious! 🌟` },
      legendary: { title: '👑 Legendary Streak!', body: `${streak} days of never giving up! You\'re writing history! 📚` }
    }
  }
  
  // Smart message selection based on context
  if (type === 'morning') {
    if (streak >= 7) {
      const streakMessages = messages.morning.streak
      return {
        ...streakMessages[Math.floor(Math.random() * streakMessages.length)],
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'morning-streak',
        data: { url: '/dashboard', type: 'morning', streak }
      }
    } else {
      const freshMessages = messages.morning.fresh
      return {
        ...freshMessages[Math.floor(Math.random() * freshMessages.length)],
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'morning-fresh',
        data: { url: '/dashboard', type: 'morning' }
      }
    }
  }
  
  if (type === 'evening') {
    let categoryMessages
    if (completedToday === 4) categoryMessages = messages.evening.allComplete
    else if (completedToday === 3) categoryMessages = messages.evening.threeComplete
    else if (completedToday === 2) categoryMessages = messages.evening.twoComplete
    else if (completedToday === 1) categoryMessages = messages.evening.oneComplete
    else categoryMessages = messages.evening.noneComplete
    
    return {
      ...categoryMessages[Math.floor(Math.random() * categoryMessages.length)],
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'evening-checkin',
      data: { url: '/dashboard', type: 'evening', completed: completedToday },
      requireInteraction: completedToday === 4
    }
  }
  
  if (type === 'missed') {
    const hoursSinceActive = lastActive ? (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60) : 24
    let categoryMessages
    
    if (hoursSinceActive < 4) categoryMessages = messages.missed.gentle
    else if (hoursSinceActive < 12) categoryMessages = messages.missed.encouraging
    else categoryMessages = messages.missed.motivational
    
    return {
      ...categoryMessages[Math.floor(Math.random() * categoryMessages.length)],
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'missed-reminder',
      data: { url: '/dashboard', type: 'missed', hoursSince: Math.round(hoursSinceActive) }
    }
  }
  
  if (type === 'milestone') {
    let milestoneMessage
    if (totalDays >= 365) milestoneMessage = messages.milestone.year
    else if (totalDays >= 100) milestoneMessage = messages.milestone.hundred
    else if (totalDays >= 30) milestoneMessage = messages.milestone.month
    else if (totalDays >= 14) milestoneMessage = messages.milestone.twoWeeks
    else milestoneMessage = messages.milestone.week
    
    return {
      ...milestoneMessage,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'milestone-celebration',
      data: { url: '/dashboard', type: 'milestone', days: totalDays },
      requireInteraction: true,
      actions: [
        { action: 'celebrate', title: '🎉 Celebrate!', icon: '/favicon.svg' },
        { action: 'continue', title: '💪 Keep Going!', icon: '/favicon.svg' }
      ]
    }
  }
  
  if (type === 'streak') {
    let streakMessage
    if (streak >= 50) streakMessage = messages.streak.legendary
    else if (streak >= 21) streakMessage = messages.streak.diamond
    else streakMessage = messages.streak.fire
    
    return {
      ...streakMessage,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'streak-celebration',
      data: { url: '/dashboard', type: 'streak', streak },
      requireInteraction: true
    }
  }
  
  // Default fallback
  return {
    title: '🔗 Never Break The Chain',
    body: 'Your journey continues! Every step matters! 🌟',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'default-reminder',
    data: { url: '/dashboard', type: 'default' }
  }
}

// Send notification to all user devices
async function sendNotificationToUser(userId: ObjectId, notificationPayload: NotificationPayload) {
  const { db } = await connectToDatabase()
  
  // Get all active devices for user
  const devices = await db.collection('devices').find({
    userId,
    isActive: true
  }).toArray()
  
  let sent = 0
  let failed = 0
  
  for (const device of devices) {
    try {
      if (device.pushSubscription) {
        await webpush.sendNotification(
          device.pushSubscription,
          JSON.stringify(notificationPayload)
        )
        sent++
      }
    } catch (error) {
      console.error(`Failed to send notification to device ${device.deviceId}:`, error)
      failed++
    }
  }
  
  // Log notification
  await db.collection('notification_logs').insertOne({
    userId,
    type: notificationPayload.tag,
    title: notificationPayload.title,
    body: notificationPayload.body,
    sentAt: new Date(),
    devicesTargeted: devices.length,
    sent,
    failed
  })
  
  return { sent, failed, totalDevices: devices.length }
}

// Main notification scheduler endpoint
export async function POST(request: NextRequest) {
  try {
    const { type, userId, scheduleTime } = await request.json()
    
    if (!type) {
      return NextResponse.json({ error: 'Notification type required' }, { status: 400 })
    }
    
    const { db } = await connectToDatabase()
    
    if (userId) {
      // Send to specific user
      const userObjectId = new ObjectId(userId)
      
      // Get user progress data for smart messaging
      const user = await db.collection('users').findOne({ _id: userObjectId })
      const progressData = await db.collection('progress').findOne({ userId: userObjectId })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      const userData = {
        streak: progressData?.currentStreak || 0,
        completedToday: progressData?.todayCompleted || 0,
        totalDays: progressData?.totalDays || 0,
        lastActive: user.lastActive
      }
      
      const notificationPayload = getSmartMessage(type, userData)
      const result = await sendNotificationToUser(userObjectId, notificationPayload)
      
      return NextResponse.json({
        message: 'Notification sent successfully',
        ...result,
        notificationPayload
      })
    } else {
      // Bulk send to all eligible users
      const now = new Date()
      const hour = now.getHours()
      
      let query: any = {}
      
      // Smart targeting based on notification type and time
      if (type === 'morning' && hour >= 6 && hour <= 10) {
        // Morning notifications: target users who haven't completed today's tasks
        query = {
          'settings.morningNotifications': { $ne: false },
          'lastActive': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
        }
      } else if (type === 'evening' && hour >= 18 && hour <= 22) {
        // Evening notifications: check-in with all active users
        query = {
          'settings.eveningNotifications': { $ne: false },
          'lastActive': { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } // Active in last 3 days
        }
      } else if (type === 'missed') {
        // Missed day notifications: users who haven't been active recently
        query = {
          'settings.reminderNotifications': { $ne: false },
          'lastActive': { 
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Not more than 7 days
            $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // But not active in last 24 hours
          }
        }
      }
      
      const users = await db.collection('users').find(query).toArray()
      
      let totalSent = 0
      let totalFailed = 0
      let usersNotified = 0
      
      for (const user of users) {
        try {
          // Get user progress for personalized messaging
          const progressData = await db.collection('progress').findOne({ userId: user._id })
          
          const userData = {
            streak: progressData?.currentStreak || 0,
            completedToday: progressData?.todayCompleted || 0,
            totalDays: progressData?.totalDays || 0,
            lastActive: user.lastActive
          }
          
          const notificationPayload = getSmartMessage(type, userData)
          const result = await sendNotificationToUser(user._id, notificationPayload)
          
          totalSent += result.sent
          totalFailed += result.failed
          if (result.sent > 0) usersNotified++
          
        } catch (error) {
          console.error(`Failed to send notification to user ${user._id}:`, error)
          totalFailed++
        }
      }
      
      return NextResponse.json({
        message: `Bulk notification completed`,
        type,
        usersTargeted: users.length,
        usersNotified,
        totalSent,
        totalFailed,
        timestamp: now.toISOString()
      })
    }
    
  } catch (error) {
    console.error('Notification scheduler error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for checking notification status
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Get recent notification stats
    const recentLogs = await db.collection('notification_logs')
      .find({})
      .sort({ sentAt: -1 })
      .limit(10)
      .toArray()
    
    const stats = await db.collection('notification_logs').aggregate([
      {
        $match: {
          sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSent: { $sum: '$sent' },
          totalFailed: { $sum: '$failed' }
        }
      }
    ]).toArray()
    
    return NextResponse.json({
      recentLogs,
      dailyStats: stats,
      vapidConfigured: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    })
    
  } catch (error) {
    console.error('Notification status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}