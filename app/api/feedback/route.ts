import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export const runtime = 'nodejs'

interface FeedbackData {
  name: string
  email: string
  subject: string
  message: string
  type: 'feedback' | 'bug' | 'feature' | 'other'
}

// Input validation and sanitization
function validateFeedbackData(data: any): FeedbackData | null {
  if (!data || typeof data !== 'object') return null
  
  const { name, email, subject, message, type } = data
  
  // Required fields validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) return null
  if (!email || typeof email !== 'string' || email.trim().length === 0) return null
  if (!message || typeof message !== 'string' || message.trim().length === 0) return null
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) return null
  
  // Type validation
  const validTypes = ['feedback', 'bug', 'feature', 'other']
  if (!type || !validTypes.includes(type)) return null
  
  // Length validations
  if (name.trim().length > 100) return null
  if (email.trim().length > 255) return null
  if (subject && subject.length > 200) return null
  if (message.trim().length > 1000) return null
  
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject ? subject.trim() : '',
    message: message.trim(),
    type: type as 'feedback' | 'bug' | 'feature' | 'other'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input
    const validatedData = validateFeedbackData(body)
    if (!validatedData) {
      return NextResponse.json(
        { error: 'Invalid input data. Please check all required fields.' },
        { status: 400 }
      )
    }
    
    // Connect to database
    const { db } = await connectToDatabase()
    const feedbackCollection = db.collection('feedback')
    
    // Create feedback document
    const feedbackDoc = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'new', // new, read, replied
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
    
    // Insert into database
    const result = await feedbackCollection.insertOne(feedbackDoc)
    
    if (!result.insertedId) {
      throw new Error('Failed to save feedback')
    }
    
    // Return success response
    return NextResponse.json(
      { 
        message: 'Feedback submitted successfully',
        id: result.insertedId.toString()
      },
      { status: 201 }
    )
    
  } catch (error) {
    // Log error securely (don't expose details to client)
    // console.error('Feedback submission error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint could be used for admin purposes to view feedback
    // For now, return method not allowed for security
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}