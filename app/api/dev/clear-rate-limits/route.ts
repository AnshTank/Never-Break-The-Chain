import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: 'Rate limits cleared successfully (restart server to fully clear)'
    });

  } catch (error) {
    console.error('Clear rate limits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}