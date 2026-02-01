import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Clock, HelpCircle, CheckCircle2, X } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

export function EmailVerificationModal({ isOpen, email, onVerified, onClose }: EmailVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactMessage, setContactMessage] = useState(`I'm having trouble receiving the email verification code for my account: ${email}`);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Auto-send OTP when modal opens - REMOVED to prevent double sending
  // The OTP is already sent by the signup/login API
  // useEffect(() => {
  //   if (isOpen && email) {
  //     handleSendOTP();
  //   }
  // }, [isOpen, email]);

  const handleSendOTP = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'verification' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCooldown(60);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Failed to send verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsVerifying(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      if (response.ok) {
        onVerified();
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email,
          subject: 'Email Verification Issue',
          message: contactMessage
        })
      });
      
      if (response.ok) {
        setContactSubmitted(true);
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <div className="p-8">
              {!showContactForm ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Your Email</h2>
                    <p className="text-sm text-slate-600">
                      We sent a 6-digit code to <strong>{email}</strong>
                    </p>
                  </div>

                  {/* OTP Form */}
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          setError('');
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
                      disabled={otp.length !== 6 || isVerifying}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Email'}
                    </Button>
                  </form>

                  {/* Resend and Support */}
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={handleSendOTP}
                        disabled={cooldown > 0 || isResending}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {isResending ? (
                          'Sending...'
                        ) : cooldown > 0 ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Resend in {cooldown}s
                          </div>
                        ) : (
                          'Resend code'
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowContactForm(true)}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Didn't receive the code?
                      </Button>
                    </div>
                  </div>
                </>
              ) : contactSubmitted ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Message Sent!</h3>
                  <p className="text-sm text-slate-600">
                    We'll get back to you within 24 hours at <strong>{email}</strong>
                  </p>
                  <Button onClick={() => setShowContactForm(false)} variant="outline" className="w-full">
                    Back to Verification
                  </Button>
                </div>
              ) : (
                <>
                  {/* Contact Form */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Need Help?</h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Having trouble with email delivery? We're here to help!
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Your name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
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
                        onClick={() => setShowContactForm(false)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingContact}
                        className="flex-1"
                      >
                        {isSubmittingContact ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}