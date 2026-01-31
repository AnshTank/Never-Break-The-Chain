"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft, Mail, Shield, Clock, HelpCircle, Sparkles, Target, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Animated floating background shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(218,165,32,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-60 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(205,133,63,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 -right-20 w-72 h-72 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(244,164,96,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -15, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating icons */}
      <motion.div
        className="absolute top-20 left-[15%] text-amber-400/20"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Target size={32} />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-[10%] text-orange-400/20"
        animate={{
          y: [0, 12, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Zap size={28} />
      </motion.div>
      <motion.div
        className="absolute top-40 right-[12%] text-yellow-400/20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <TrendingUp size={36} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-[18%] text-amber-400/20"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <Sparkles size={24} />
      </motion.div>

      {/* Floating bubbles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 20 + ((i * 5) % 60);
        const left = (i * 8.33) % 100;
        const top = (i * 12.5) % 100;
        const duration = 8 + (i % 5) * 2;
        const delay = i * 0.5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/20"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={{
              y: [0, -100, -200],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(218,165,32,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(218,165,32,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

// Animated gradient background
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - warm sand tones */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(250,248,246,1) 0%, 
              rgba(254,252,232,1) 25%, 
              rgba(255,251,235,1) 50%, 
              rgba(253,246,227,1) 75%, 
              rgba(250,248,246,1) 100%
            )
          `,
        }}
      />

      {/* Animated mesh gradient overlay - warm tones */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(218,165,32,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(205,133,63,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(244,164,96,0.06) 0%, transparent 60%)
          `,
        }}
        animate={{
          scale: [1, 1.02, 1],
          rotate: [0, 1, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Password strength checker
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
    { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
    { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
    { test: (p: string) => /[0-9]/.test(p), label: "One number" },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
  ];

  const passedChecks = checks.filter(check => check.test(password)).length;
  const strength = passedChecks === 0 ? 0 : (passedChecks / checks.length) * 100;
  
  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Password strength</span>
        <span className={`font-medium ${
          strength < 40 ? "text-red-600" : 
          strength < 80 ? "text-yellow-600" : "text-green-600"
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              check.test(password) ? "bg-green-500" : "bg-slate-300"
            }`} />
            <span className={check.test(password) ? "text-green-600" : "text-slate-500"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// OTP Input Component
function OTPInput({ onVerify, email, onContactSupport }: { 
  onVerify: (otp: string) => void; 
  email: string;
  onContactSupport: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCooldown(60);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (error) {
      setError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Check your email</h3>
        <p className="text-sm text-slate-600 mt-2">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
              setError("");
            }}
            className="text-center text-2xl font-mono tracking-widest"
            maxLength={6}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={otp.length !== 6}
        >
          Verify Code
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="text-blue-600 hover:text-blue-800"
          >
            {isResending ? (
              "Sending..."
            ) : cooldown > 0 ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Resend in {cooldown}s
              </div>
            ) : (
              "Resend code"
            )}
          </Button>
        </div>

        <div className="border-t pt-3">
          <Button
            variant="outline"
            onClick={onContactSupport}
            className="w-full text-slate-600 hover:text-slate-800"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Didn't receive the code? Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

// Contact Support Form
function ContactForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("OTP Delivery Issue");
  const [message, setMessage] = useState(`I'm having trouble receiving the OTP code for password reset on my account: ${email}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Message Sent!</h3>
        <p className="text-sm text-slate-600">
          We'll get back to you within 24 hours at <strong>{email}</strong>
        </p>
        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Reset
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <HelpCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Contact Support</h3>
        <p className="text-sm text-slate-600 mt-2">
          Having trouble with OTP delivery? We're here to help!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input
            value={email}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-lg resize-none h-24"
            placeholder="Describe your issue..."
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ForgotPasswordContent() {
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'contact'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // First check if user exists
      const checkResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, checkOnly: true })
      })
      
      if (checkResponse.ok) {
        // User exists, send OTP
        const otpResponse = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        
        if (otpResponse.ok) {
          setStep('otp')
        } else {
          const data = await otpResponse.json()
          setError(data.error || 'Failed to send OTP')
        }
      } else {
        const data = await checkResponse.json()
        setError(data.error || 'Email not found. Please check your email or create a new account.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      
      if (response.ok) {
        setStep('password')
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid OTP')
      }
    } catch (error) {
      setError('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    const checks = [
      { test: (p: string) => p.length >= 8, msg: "Password must be at least 8 characters" },
      { test: (p: string) => /[A-Z]/.test(p), msg: "Password must contain an uppercase letter" },
      { test: (p: string) => /[a-z]/.test(p), msg: "Password must contain a lowercase letter" },
      { test: (p: string) => /[0-9]/.test(p), msg: "Password must contain a number" },
      { test: (p: string) => /[^A-Za-z0-9]/.test(p), msg: "Password must contain a special character" },
    ];

    const failedCheck = checks.find(check => !check.test(password));
    if (failedCheck) {
      setError(failedCheck.msg);
      return;
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password })
      })

      if (response.ok) {
        router.push('/login?message=Password updated successfully! You can now sign in with your new password.')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update password')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Email step
  if (step === 'email') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background layers */}
        <AnimatedBackground />
        <FloatingShapes />

        {/* Main content */}
        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo/Brand area */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight mb-2 transition-all duration-300 hover:from-amber-800 hover:to-orange-700">
              🔗 NEVER BREAK THE CHAIN
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Reset your password
            </p>
          </motion.div>

          {/* Forgot Password Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center gap-3 justify-center mb-4">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <h2 className="text-2xl font-bold text-slate-800">Forgot Password</h2>
                </div>
                <p className="text-slate-600 text-sm">
                  Enter your email to receive a reset code
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors duration-300"
                  />
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full cursor-pointer transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)",
                    color: "white",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgb(180,83,9) 0%, rgb(146,64,14) 100%)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)"
                  }}
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-amber-600 hover:text-amber-800 transition-colors duration-300 cursor-pointer"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // OTP step
  if (step === 'otp') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background layers */}
        <AnimatedBackground />
        <FloatingShapes />

        {/* Main content */}
        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* OTP Verification Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('email')} className="hover:bg-slate-100">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold text-slate-800">Verify Email</h2>
              </div>
              
              <OTPInput 
                onVerify={handleOTPVerify} 
                email={email}
                onContactSupport={() => setStep('contact')}
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Contact support step
  if (step === 'contact') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background layers */}
        <AnimatedBackground />
        <FloatingShapes />

        {/* Main content */}
        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Contact Support Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('otp')} className="hover:bg-slate-100">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold text-slate-800">Contact Support</h2>
              </div>
              
              <ContactForm 
                email={email}
                onBack={() => setStep('otp')}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Password reset step
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background layers */}
      <AnimatedBackground />
      <FloatingShapes />

      {/* Main content */}
      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Password Reset Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">Create New Password</h2>
              <p className="text-slate-600 text-sm mt-2">
                Choose a strong password for your account
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-12 border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {password && <PasswordStrength password={password} />}
                
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-12 border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
              
              <Button 
                type="submit" 
                disabled={isLoading || !password || !confirmPassword}
                className="w-full cursor-pointer transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)",
                  color: "white",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgb(180,83,9) 0%, rgb(146,64,14) 100%)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)"
                }}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}