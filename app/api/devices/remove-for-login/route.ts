import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DeviceSessionManager } from '@/lib/device-session-manager';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { deviceIdToRemove, email, password } = await request.json();
    
    if (!deviceIdToRemove || !email || !password) {
      return NextResponse.json({ 
        error: 'Device ID, email, and password are required' 
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!user || !user.password) {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    await DeviceSessionManager.removeDevice(user._id.toString(), deviceIdToRemove);
    
    return NextResponse.json({ 
      success: true
    });

  } catch (error) {
    console.error('Device removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}