import { connectToDatabase } from '../mongodb';
import { User } from './User';
import bcrypt from 'bcryptjs';

export class UserService {
  
  static async createUser(email: string, password: string, name?: string): Promise<User> {
    const { db } = await connectToDatabase();
    
    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name ? name.trim() : undefined;
    
    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email: sanitizedEmail });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser: User = {
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      emailVerified: false,
      otpAttempts: 0,
      otpSendCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection<User>('users').insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  }
  
  static async findUserByEmail(email: string): Promise<User | null> {
    const { db } = await connectToDatabase();
    // Sanitize email input
    const sanitizedEmail = email.toLowerCase().trim();
    return await db.collection<User>('users').findOne({ email: sanitizedEmail });
  }
  
  static async updateUser(email: string, updates: Partial<User>): Promise<void> {
    const { db } = await connectToDatabase();
    const sanitizedEmail = email.toLowerCase().trim();
    await db.collection<User>('users').updateOne(
      { email: sanitizedEmail },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
  }
  
  static async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (!user) return false;
    
    return await bcrypt.compare(password, user.password);
  }
  
  static async updatePassword(email: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.updateUser(email, { password: hashedPassword });
  }
  
  static async setOTP(email: string, otp: string, expiresInMinutes: number = 5): Promise<void> {
    const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const user = await this.findUserByEmail(email);
    const now = Date.now();
    
    // Reset daily counter if 24 hours have passed
    const lastSent = user?.lastOTPSent?.getTime() || 0;
    const daysPassed = (now - lastSent) / (1000 * 60 * 60 * 24);
    const dailyCount = daysPassed >= 1 ? 1 : (user?.otpSendCount || 0) + 1;
    
    await this.updateUser(email, {
      otpCode: otp,
      otpExpires: expires,
      otpAttempts: 0,
      lastOTPSent: new Date(),
      otpSendCount: dailyCount
    });
  }
  
  static async verifyOTP(email: string, inputOTP: string): Promise<{ success: boolean; message: string }> {
    const user = await this.findUserByEmail(email);
    
    console.log('OTP Verification Debug:', {
      email,
      inputOTP,
      userExists: !!user,
      storedOTP: user?.otpCode,
      otpExpires: user?.otpExpires,
      currentTime: new Date(),
      otpAttempts: user?.otpAttempts
    });
    
    if (!user || !user.otpCode || !user.otpExpires) {
      return { success: false, message: 'No OTP found. Please request a new code.' };
    }
    
    if (new Date() > user.otpExpires) {
      await this.clearOTP(email);
      return { success: false, message: 'OTP has expired. Please request a new code.' };
    }
    
    if (user.otpAttempts >= 5) {
      await this.clearOTP(email);
      return { success: false, message: 'Too many failed attempts. Please request a new code.' };
    }
    
    // Ensure both OTPs are strings and trim whitespace
    const storedOTP = String(user.otpCode).trim();
    const providedOTP = String(inputOTP).trim();
    
    console.log('OTP Comparison:', {
      storedOTP,
      providedOTP,
      match: storedOTP === providedOTP
    });
    
    if (storedOTP === providedOTP) {
      await this.clearOTP(email);
      return { success: true, message: 'OTP verified successfully' };
    }
    
    // Increment attempts only after failed verification
    const newAttempts = user.otpAttempts + 1;
    await this.updateUser(email, { otpAttempts: newAttempts });
    
    const remainingAttempts = 5 - newAttempts;
    return { 
      success: false, 
      message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
    };
  }
  
  static async clearOTP(email: string): Promise<void> {
    await this.updateUser(email, {
      otpCode: undefined,
      otpExpires: undefined,
      otpAttempts: 0
    });
  }
  
  static async canSendOTP(email: string): Promise<{ canSend: boolean; cooldownSeconds: number; message?: string }> {
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      return { canSend: true, cooldownSeconds: 0 };
    }
    
    const now = Date.now();
    const lastSent = user.lastOTPSent?.getTime() || 0;
    const timeSinceLastSent = now - lastSent;
    
    // Reset daily counter if 24 hours have passed
    const daysPassed = timeSinceLastSent / (1000 * 60 * 60 * 24);
    let currentDailyCount = user.otpSendCount || 0;
    if (daysPassed >= 1) {
      currentDailyCount = 0;
    }
    
    // Check daily limit per email (3 per day to prevent email spam)
    if (currentDailyCount >= 3) {
      const hoursUntilReset = Math.ceil((24 - (timeSinceLastSent / (1000 * 60 * 60))));
      return { 
        canSend: false, 
        cooldownSeconds: hoursUntilReset * 3600,
        message: `Too many password reset requests for this email today. Please try again in ${hoursUntilReset} hours.`
      };
    }
    
    // Check 60-second cooldown between requests to same email
    const oneMinuteAgo = now - (60 * 1000);
    if (lastSent > oneMinuteAgo) {
      const cooldownMs = (lastSent + (60 * 1000)) - now;
      const cooldownSeconds = Math.ceil(cooldownMs / 1000);
      
      return { 
        canSend: false, 
        cooldownSeconds,
        message: `Please wait ${cooldownSeconds} seconds before requesting another code for this email.`
      };
    }
    
    return { canSend: true, cooldownSeconds: 0 };
  }
}