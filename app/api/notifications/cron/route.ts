import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called by Vercel Cron Jobs or external cron services
// Add this to vercel.json: 
// {
//   "crons": [
//     {
//       "path": "/api/notifications/cron",
//       "schedule": "0 7 * * *"
//     },
//     {
//       "path": "/api/notifications/cron",
//       "schedule": "0 20 * * *"
//     },
//     {
//       "path": "/api/notifications/cron",
//       "schedule": "0 */4 * * *"
//     }
//   ]
// }

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const now = new Date()
    const hour = now.getHours()
    const results = []
    
    // Morning notifications (7 AM)
    if (hour === 7) {
      console.log('🌅 Sending morning notifications...')
      
      const morningResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'morning' })
      })
      
      const morningResult = await morningResponse.json()
      results.push({ type: 'morning', ...morningResult })
    }
    
    // Evening notifications (8 PM)
    if (hour === 20) {
      console.log('🌙 Sending evening notifications...')
      
      const eveningResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'evening' })
      })
      
      const eveningResult = await eveningResponse.json()
      results.push({ type: 'evening', ...eveningResult })
    }
    
    // Missed day reminders (every 4 hours during day)
    if (hour >= 8 && hour <= 20 && hour % 4 === 0) {
      console.log('🔔 Sending missed day reminders...')
      
      const missedResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'missed' })
      })
      
      const missedResult = await missedResponse.json()
      results.push({ type: 'missed', ...missedResult })
    }
    
    // Milestone and streak detection (daily at 11 PM)
    if (hour === 23) {
      console.log('🏆 Checking for milestones and streaks...')
      
      // Check for milestone achievements
      const milestoneResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const milestoneResult = await milestoneResponse.json()
      results.push({ type: 'milestone_check', ...milestoneResult })
    }
    
    return NextResponse.json({
      message: 'Cron job executed successfully',
      timestamp: now.toISOString(),
      hour,
      results,
      executedTasks: results.length
    })
    
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST endpoint for manual cron trigger (for testing)
export async function POST(request: NextRequest) {
  try {
    const { type, force = false } = await request.json()
    
    if (!force) {
      return NextResponse.json({ error: 'Manual cron execution requires force=true' }, { status: 400 })
    }
    
    const now = new Date()
    let result
    
    switch (type) {
      case 'morning':
        const morningResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'morning' })
        })
        result = await morningResponse.json()
        break
        
      case 'evening':
        const eveningResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'evening' })
        })
        result = await eveningResponse.json()
        break
        
      case 'missed':
        const missedResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'missed' })
        })
        result = await missedResponse.json()
        break
        
      case 'milestones':
        const milestoneResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/milestones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        result = await milestoneResponse.json()
        break
        
      default:
        return NextResponse.json({ error: 'Invalid cron type' }, { status: 400 })
    }
    
    return NextResponse.json({
      message: `Manual ${type} cron executed successfully`,
      timestamp: now.toISOString(),
      result
    })
    
  } catch (error) {
    console.error('Manual cron error:', error)
    return NextResponse.json(
      { error: 'Manual cron failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}