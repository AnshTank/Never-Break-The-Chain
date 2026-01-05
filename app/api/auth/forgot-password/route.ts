import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, checkOnly } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const user = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please check your email or create a new account.' },
        { status: 404 }
      )
    }

    // If only checking if user exists
    if (checkOnly) {
      return NextResponse.json({ message: 'User found' })
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    )

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}