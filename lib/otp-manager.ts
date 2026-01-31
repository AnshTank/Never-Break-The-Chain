import { generateOTP } from './email-service';

// In-memory store for OTP rate limiting (use Redis in production)
const otpStore = new Map<string, {
  code: string;
  expires: number;
  attempts: number;
  lastSent: number;
  sendCount: number;
}>();

// Rate limiting constants
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_SENDS_PER_HOUR = 3;

export interface OTPResult {
  success: boolean;
  message: string;
  canResend?: boolean;
  cooldownSeconds?: number;
}

// Generate and store OTP with rate limiting
export function createOTP(email: string): OTPResult {
  const now = Date.now();
  const existing = otpStore.get(email);
  
  // Check hourly send limit
  if (existing && existing.sendCount >= MAX_SENDS_PER_HOUR) {
    const hoursPassed = (now - existing.lastSent) / (1000 * 60 * 60);
    if (hoursPassed < 1) {
      return {
        success: false,
        message: 'Too many OTP requests. Please try again in an hour.',
        canResend: false
      };
    }
  }
  
  // Check resend cooldown
  if (existing && (now - existing.lastSent) < (RESEND_COOLDOWN_SECONDS * 1000)) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - (now - existing.lastSent)) / 1000);
    return {
      success: false,
      message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
      canResend: false,
      cooldownSeconds: remainingSeconds
    };
  }
  
  const otp = generateOTP();
  const expires = now + (OTP_EXPIRY_MINUTES * 60 * 1000);
  
  otpStore.set(email, {
    code: otp,
    expires,
    attempts: 0,
    lastSent: now,
    sendCount: existing ? existing.sendCount + 1 : 1
  });
  
  return {
    success: true,
    message: 'OTP generated successfully',
    canResend: true
  };
}

// Verify OTP
export function verifyOTP(email: string, inputOTP: string): OTPResult {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return {
      success: false,
      message: 'No OTP found. Please request a new code.',
      canResend: true
    };
  }
  
  // Check expiry
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return {
      success: false,
      message: 'OTP has expired. Please request a new code.',
      canResend: true
    };
  }
  
  // Check max attempts
  if (stored.attempts >= MAX_OTP_ATTEMPTS) {
    otpStore.delete(email);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new code.',
      canResend: true
    };
  }
  
  // Increment attempts
  stored.attempts++;
  
  // Verify code
  if (stored.code === inputOTP) {
    otpStore.delete(email); // Clean up on success
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }
  
  const remainingAttempts = MAX_OTP_ATTEMPTS - stored.attempts;
  return {
    success: false,
    message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
    canResend: remainingAttempts === 0
  };
}

// Get OTP status for frontend
export function getOTPStatus(email: string): {
  hasOTP: boolean;
  canResend: boolean;
  cooldownSeconds: number;
  attemptsRemaining: number;
} {
  const stored = otpStore.get(email);
  const now = Date.now();
  
  if (!stored) {
    return {
      hasOTP: false,
      canResend: true,
      cooldownSeconds: 0,
      attemptsRemaining: MAX_OTP_ATTEMPTS
    };
  }
  
  const isExpired = now > stored.expires;
  const cooldownRemaining = Math.max(0, Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - (now - stored.lastSent)) / 1000));
  
  return {
    hasOTP: !isExpired,
    canResend: isExpired || cooldownRemaining === 0,
    cooldownSeconds: cooldownRemaining,
    attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - stored.attempts)
  };
}

// Clean up expired OTPs (call periodically)
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(email);
    }
  }
}

// Get the actual OTP for testing (remove in production)
export function getStoredOTP(email: string): string | null {
  const stored = otpStore.get(email);
  return stored && Date.now() <= stored.expires ? stored.code : null;
}