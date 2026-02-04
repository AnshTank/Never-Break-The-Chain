import { NextRequest, NextResponse } from 'next/server';
import { aiContentService } from '@/lib/ai-content-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2026';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { type, userContext } = await request.json();

    // Default test user context
    const defaultContext = {
      name: 'Test User',
      currentStreak: 7,
      longestStreak: 14,
      completionRate: 0.75,
      weakestHabit: 'Meditation',
      strongestHabit: 'Discipline',
      daysSinceJoin: 30,
      timeOfDay: 'morning' as const,
      lastActivity: new Date()
    };

    const context = { ...defaultContext, ...userContext };
    let result;

    switch (type) {
      case 'morning':
        result = await aiContentService.generateMorningMotivation(context);
        break;
      case 'evening':
        result = await aiContentService.generateEveningReflection(context);
        break;
      case 'milestone':
        result = await aiContentService.generateMilestoneMessage({
          ...context,
          milestoneReached: context.currentStreak
        });
        break;
      case 'comeback':
        result = await aiContentService.generateComebackMessage(context, 5);
        break;
      case 'weekly':
        result = await aiContentService.generateWeeklySummary(context, {
          completionRate: context.completionRate * 100
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      context,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI content test error:', error);
    return NextResponse.json({
      error: 'AI content generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2026';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Test all AI content types
    const testContext = {
      name: 'Demo User',
      currentStreak: 21,
      longestStreak: 30,
      completionRate: 0.85,
      weakestHabit: 'Nutrition',
      strongestHabit: 'Zone',
      daysSinceJoin: 45,
      timeOfDay: 'morning' as const,
      lastActivity: new Date()
    };

    const results = {
      morning: await aiContentService.generateMorningMotivation(testContext),
      evening: await aiContentService.generateEveningReflection(testContext),
      milestone: await aiContentService.generateMilestoneMessage({
        ...testContext,
        milestoneReached: 21
      }),
      comeback: await aiContentService.generateComebackMessage(testContext, 3),
      weekly: await aiContentService.generateWeeklySummary(testContext, {
        completionRate: 85
      })
    };

    return NextResponse.json({
      success: true,
      message: 'AI content generation test completed',
      testContext,
      results,
      timestamp: new Date().toISOString(),
      aiEnabled: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? true : false
    });

  } catch (error) {
    console.error('AI content test error:', error);
    return NextResponse.json({
      error: 'AI content test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}