import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export class UserService {
  static async findByEmail(email: string) {
    const { db } = await connectToDatabase();
    return await db.collection('users').findOne({ email });
  }

  static async createUser(email: string, password: string) {
    const { db } = await connectToDatabase();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date(),
      isNewUser: true
    });
  }

  static async updateOTP(email: string, otp: string, expiresAt: Date) {
    const { db } = await connectToDatabase();
    return await db.collection('users').updateOne(
      { email },
      { 
        $set: { 
          otp, 
          otpExpiresAt: expiresAt 
        } 
      }
    );
  }

  static async verifyOTP(email: string, otp: string) {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ 
      email, 
      otp,
      otpExpiresAt: { $gt: new Date() }
    });
    
    if (user) {
      await db.collection('users').updateOne(
        { email },
        { $unset: { otp: "", otpExpiresAt: "" } }
      );
    }
    
    return user;
  }

  static async updatePassword(email: string, password: string) {
    const { db } = await connectToDatabase();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return await db.collection('users').updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
  }

  static async canSendOTP(email: string) {
    // Simple rate limiting - allow OTP every 60 seconds
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return { canSend: false, cooldownSeconds: 0, message: 'User not found' };
    }
    
    const now = new Date();
    const lastOTPTime = user.lastOTPSent || new Date(0);
    const timeDiff = (now.getTime() - lastOTPTime.getTime()) / 1000;
    
    if (timeDiff < 60) {
      return { 
        canSend: false, 
        cooldownSeconds: Math.ceil(60 - timeDiff), 
        message: 'Please wait before requesting another OTP' 
      };
    }
    
    return { canSend: true, cooldownSeconds: 0, message: 'OK' };
  }

  static async updateUser(email: string, updates: any) {
    const { db } = await connectToDatabase();
    return await db.collection('users').updateOne(
      { email },
      { $set: updates }
    );
  }
}