import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name?: string;
  emailVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  otpAttempts: number;
  lastOTPSent?: Date;
  otpSendCount: number;
  recentOTPAttempts?: number[]; // Timestamps of recent OTP requests
  createdAt: Date;
  updatedAt: Date;
}

export interface OTPData {
  email: string;
  code: string;
  type: 'verification' | 'reset';
  expires: Date;
  attempts: number;
  createdAt: Date;
}