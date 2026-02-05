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

// Milestone definitions
const MILESTONES = {
  streak: [
    { days: 3, title: '🔥 3-Day Streak!', message: 'Three days strong! You\'re building momentum! 🚀' },
    { days: 7, title: '⭐ Week Warrior!', message: 'One week of consistency! You\'re on fire! 🔥' },
    { days: 14, title: '💪 Two-Week Champion!', message: 'Fourteen days of dedication! Incredible! 🏆' },
    { days: 21, title: '💎 21-Day Habit Master!', message: 'Three weeks! You\'ve formed a diamond habit! ✨' },
    { days: 30, title: '👑 Monthly Royalty!', message: 'One month of never breaking the chain! Legendary! 🌟' },
    { days: 50, title: '🚀 50-Day Rocket!', message: 'Fifty days of excellence! You\'re unstoppable! ⚡' },
    { days: 75, title: '🏆 75-Day Champion!', message: 'Seventy-five days! Your consistency is inspiring! 💫' },
    { days: 100, title: '💯 Century Club!', message: 'ONE HUNDRED DAYS! Welcome to the elite! 👑' },
    { days: 150, title: '🌟 150-Day Star!', message: 'One hundred fifty days! You\'re a shining example! ✨' },
    { days: 200, title: '🔥 200-Day Inferno!', message: 'Two hundred days of pure dedication! Incredible! 🚀' },
    { days: 365, title: '🎉 YEAR-LONG LEGEND!', message: 'A FULL YEAR! You\'ve achieved the impossible! 👑🏆' }
  ],
  
  totalDays: [
    { days: 10, title: '🌱 First Steps!', message: 'Ten days of growth! Every journey starts here! 🚶‍♂️' },
    { days: 25, title: '🌿 Growing Strong!', message: 'Twenty-five days of progress! You\'re flourishing! 🌸' },
    { days: 50, title: '🌳 Mighty Oak!', message: 'Fifty days of building! Your roots run deep! 🌳' },
    { days: 100, title: '🏔️ Mountain Climber!', message: 'One hundred days! You\'ve climbed mountains! ⛰️' },
    { days: 200, title: '🌊 Ocean Deep!', message: 'Two hundred days! Your commitment runs ocean deep! 🌊' },
    { days: 365, title: '🌍 World Changer!', message: 'Three sixty-five days! You\'ve changed your world! 🌍' },
    { days: 500, title: '🚀 Space Explorer!', message: 'Five hundred days! You\'re exploring new galaxies! 🌌' },
    { days: 1000, title: '👑 IMMORTAL LEGEND!', message: 'ONE THOUSAND DAYS! You are IMMORTAL! 🏆✨' }
  ],
  
  perfectDays: [
    { count: 5, title: '⭐ Perfect Pentad!', message: 'Five perfect days! All pillars conquered! 🏛️' },
    { count: 10, title: '💎 Diamond Decade!', message: 'Ten perfect days! You\'re a diamond! 💎' },
    { count: 25, title: '🏆 Perfect Quarter!', message: 'Twenty-five perfect days! Absolute mastery! 👑' },
    { count: 50, title: '🌟 Perfection Personified!', message: 'Fifty perfect days! You ARE perfection! ✨' },
    { count: 100, title: '👑 PERFECTION ROYALTY!', message: 'One hundred perfect days! BOW DOWN! 🙇‍♂️' }
  ]
}

// Special achievement messages
const SPECIAL_ACHIEVEMENTS = {
  comeback: {
    title: '🔄 Comeback King/Queen!',
    message: 'You bounced back stronger! That\'s the spirit of a true champion! 💪'
  },
  consistency: {
    title: '📈 Mr./Ms. Consistent!',
    message: 'Your steady rhythm is beautiful! Consistency is your superpower! 🎵'
  },
  weekendWarrior: {
    title: '🎉 Weekend Warrior!',
    message: 'You dominate weekends! Your dedication never rests! 💪'
  },
  earlyBird: {
    title: '🌅 Early Bird Champion!',
    message: 'Morning person detected! You catch all the worms! ☕'
  },
  nightOwl: {
    title: '🦉 Night Owl Master!',
    message: 'You shine when others sleep! Nocturnal excellence! 🌙'
  }
}

async function sendMilestoneNotification(userId: ObjectId, milestone: any) {
  const { db } = await connectToDatabase()
  
  // Get user devices
  const devices = await db.collection('devices').find({
    userId,
    isActive: true
  }).toArray()
  
  const notificationPayload = {
    title: milestone.title,
    body: milestone.message,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'milestone-celebration',
    requireInteraction: true,
    data: {
      url: '/dashboard',
      type: 'milestone',
      milestone: milestone.days || milestone.count,
      celebrationType: milestone.type
    },
    actions: [
      { action: 'celebrate', title: '🎉 Celebrate!', icon: '/favicon.svg' },
      { action: 'share', title: '📱 Share!', icon: '/favicon.svg' },
      { action: 'continue', title: '💪 Keep Going!', icon: '/favicon.svg' }
    ]
  }
  
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
      console.error(`Failed to send milestone notification to device ${device.deviceId}:`, error)
      failed++
    }
  }
  
  // Log milestone achievement
  await db.collection('milestone_achievements').insertOne({
    userId,
    milestoneType: milestone.type,
    milestoneValue: milestone.days || milestone.count,
    title: milestone.title,
    message: milestone.message,
    achievedAt: new Date(),
    notificationSent: sent > 0,
    devicesNotified: sent
  })
  
  return { sent, failed }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const now = new Date()
    
    // Get all users with recent activity
    const activeUsers = await db.collection('users').find({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
    }).toArray()
    
    let milestonesDetected = 0
    let notificationsSent = 0
    const achievements = []
    
    for (const user of activeUsers) {
      try {
        // Get user's progress data
        const progress = await db.collection('progress').findOne({ userId: user._id })
        if (!progress) continue
        
        const { currentStreak = 0, totalDays = 0, perfectDays = 0 } = progress
        
        // Check for streak milestones
        for (const milestone of MILESTONES.streak) {
          if (currentStreak === milestone.days) {
            // Check if we already celebrated this milestone
            const existingAchievement = await db.collection('milestone_achievements').findOne({
              userId: user._id,
              milestoneType: 'streak',
              milestoneValue: milestone.days
            })
            
            if (!existingAchievement) {

              
              const result = await sendMilestoneNotification(user._id, {
                ...milestone,
                type: 'streak'
              })
              
              achievements.push({
                userId: user._id.toString(),
                type: 'streak',
                value: milestone.days,
                title: milestone.title,
                notificationsSent: result.sent
              })
              
              milestonesDetected++
              notificationsSent += result.sent
            }
          }
        }
        
        // Check for total days milestones
        for (const milestone of MILESTONES.totalDays) {
          if (totalDays === milestone.days) {
            const existingAchievement = await db.collection('milestone_achievements').findOne({
              userId: user._id,
              milestoneType: 'totalDays',
              milestoneValue: milestone.days
            })
            
            if (!existingAchievement) {

              
              const result = await sendMilestoneNotification(user._id, {
                ...milestone,
                type: 'totalDays'
              })
              
              achievements.push({
                userId: user._id.toString(),
                type: 'totalDays',
                value: milestone.days,
                title: milestone.title,
                notificationsSent: result.sent
              })
              
              milestonesDetected++
              notificationsSent += result.sent
            }
          }
        }
        
        // Check for perfect days milestones
        for (const milestone of MILESTONES.perfectDays) {
          if (perfectDays === milestone.count) {
            const existingAchievement = await db.collection('milestone_achievements').findOne({
              userId: user._id,
              milestoneType: 'perfectDays',
              milestoneValue: milestone.count
            })
            
            if (!existingAchievement) {

              
              const result = await sendMilestoneNotification(user._id, {
                ...milestone,
                type: 'perfectDays'
              })
              
              achievements.push({
                userId: user._id.toString(),
                type: 'perfectDays',
                value: milestone.count,
                title: milestone.title,
                notificationsSent: result.sent
              })
              
              milestonesDetected++
              notificationsSent += result.sent
            }
          }
        }
        
        // Check for special achievements based on patterns
        const recentProgress = await db.collection('daily_progress').find({
          userId: user._id,
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }).toArray()
        
        if (recentProgress.length >= 7) {
          // Analyze patterns for special achievements
          const weekendDays = recentProgress.filter(p => {
            const day = new Date(p.date).getDay()
            return day === 0 || day === 6 // Sunday or Saturday
          })
          
          const weekdayDays = recentProgress.filter(p => {
            const day = new Date(p.date).getDay()
            return day >= 1 && day <= 5 // Monday to Friday
          })
          
          // Weekend Warrior detection
          if (weekendDays.length >= 4 && weekendDays.every(d => d.completed >= 3)) {
            const existingAchievement = await db.collection('milestone_achievements').findOne({
              userId: user._id,
              milestoneType: 'weekendWarrior',
              achievedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
            
            if (!existingAchievement) {
              const result = await sendMilestoneNotification(user._id, {
                ...SPECIAL_ACHIEVEMENTS.weekendWarrior,
                type: 'weekendWarrior'
              })
              
              achievements.push({
                userId: user._id.toString(),
                type: 'weekendWarrior',
                title: SPECIAL_ACHIEVEMENTS.weekendWarrior.title,
                notificationsSent: result.sent
              })
              
              milestonesDetected++
              notificationsSent += result.sent
            }
          }
        }
        
      } catch (error) {
        console.error(`Error processing milestones for user ${user._id}:`, error)
      }
    }
    
    // Log milestone check
    await db.collection('milestone_checks').insertOne({
      checkedAt: now,
      usersChecked: activeUsers.length,
      milestonesDetected,
      notificationsSent,
      achievements
    })
    
    return NextResponse.json({
      message: 'Milestone check completed successfully',
      timestamp: now.toISOString(),
      usersChecked: activeUsers.length,
      milestonesDetected,
      notificationsSent,
      achievements,
      summary: {
        streakMilestones: achievements.filter(a => a.type === 'streak').length,
        totalDaysMilestones: achievements.filter(a => a.type === 'totalDays').length,
        perfectDaysMilestones: achievements.filter(a => a.type === 'perfectDays').length,
        specialAchievements: achievements.filter(a => a.type === 'weekendWarrior').length
      }
    })
    
  } catch (error) {
    console.error('Milestone detection error:', error)
    return NextResponse.json(
      { error: 'Milestone detection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for milestone statistics
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Get recent milestone achievements
    const recentAchievements = await db.collection('milestone_achievements')
      .find({})
      .sort({ achievedAt: -1 })
      .limit(20)
      .toArray()
    
    // Get milestone statistics
    const stats = await db.collection('milestone_achievements').aggregate([
      {
        $group: {
          _id: '$milestoneType',
          count: { $sum: 1 },
          totalNotifications: { $sum: '$devicesNotified' }
        }
      }
    ]).toArray()
    
    // Get recent milestone checks
    const recentChecks = await db.collection('milestone_checks')
      .find({})
      .sort({ checkedAt: -1 })
      .limit(5)
      .toArray()
    
    return NextResponse.json({
      recentAchievements,
      statistics: stats,
      recentChecks,
      milestoneDefinitions: MILESTONES
    })
    
  } catch (error) {
    console.error('Milestone stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get milestone statistics' },
      { status: 500 }
    )
  }
}