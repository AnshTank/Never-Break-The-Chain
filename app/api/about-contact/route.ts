import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { sendAboutContactEmail } from '@/lib/email-service';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - more lenient for development
    const rateLimitResult = await applyRateLimit(request, 'about-contact-form', 10, 1800); // 10 per 30 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = contactSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // Send about contact email to admin
    const emailSent = await sendAboutContactEmail(name, email, subject, message);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Your message has been sent successfully. We\'ll get back to you soon!'
    });

  } catch (error) {
    console.error('About contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}