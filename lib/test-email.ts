// Test script for email service
// Run with: node -r ts-node/register lib/test-email.ts

import { testEmailConnection, sendOTPEmail } from './email-service';
import { createOTP, verifyOTP } from './otp-manager';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');
  
  // Test 1: Connection
  console.log('1. Testing email connection...');
  const connectionTest = await testEmailConnection();
  console.log(connectionTest ? '✅ Connection successful' : '❌ Connection failed');
  
  if (!connectionTest) {
    console.log('❌ Please check your Gmail App Password in .env file');
    return;
  }
  
  // Test 2: OTP Generation
  console.log('\n2. Testing OTP generation...');
  const testEmail = 'anshtank9@gmail.com'; // Your personal email for testing
  const otpResult = createOTP(testEmail);
  console.log(otpResult.success ? '✅ OTP generated' : '❌ OTP generation failed');
  
  if (!otpResult.success) {
    console.log('Error:', otpResult.message);
    return;
  }
  
  // Test 3: Send OTP Email
  console.log('\n3. Testing OTP email send...');
  const emailSent = await sendOTPEmail(testEmail, '123456', 'verification');
  console.log(emailSent ? '✅ Email sent successfully' : '❌ Email send failed');
  
  console.log('\n🎉 Email service test complete!');
  console.log('📧 Check your email:', testEmail);
}

// Run test if this file is executed directly
if (require.main === module) {
  testEmailService().catch(console.error);
}