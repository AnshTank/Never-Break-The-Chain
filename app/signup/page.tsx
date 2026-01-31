"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles, Rocket, Star, Heart, CheckCircle2 } from "lucide-react";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";

// Animated floating background shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(218,165,32,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -30, 0],
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
        className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(205,133,63,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 20, 0],
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
        className="absolute top-1/3 -left-20 w-72 h-72 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(244,164,96,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 15, 0],
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
        className="absolute top-24 right-[15%] text-amber-400/20"
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
        <Rocket size={32} />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-[10%] text-orange-400/20"
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
        <Star size={28} />
      </motion.div>
      <motion.div
        className="absolute top-40 left-[12%] text-yellow-400/20"
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
        <Heart size={32} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-[18%] text-amber-400/20"
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
        <CheckCircle2 size={26} />
      </motion.div>

      {/* Floating bubbles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 20 + (i * 5) % 60;
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
            radial-gradient(ellipse at 80% 30%, rgba(218,165,32,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 70%, rgba(205,133,63,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(244,164,96,0.06) 0%, transparent 60%)
          `,
        }}
        animate={{
          scale: [1, 1.02, 1],
          rotate: [0, -1, 0],
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

// Feature highlights
function FeatureHighlights() {
  const features = [
    { icon: CheckCircle2, text: "Track 4 daily habits" },
    { icon: Star, text: "Build streaks" },
    { icon: Rocket, text: "Achieve goals" },
  ];

  return (
    <div className="flex justify-center gap-4 mt-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + index * 0.1 }}
        >
          <feature.icon className="w-3.5 h-3.5 text-amber-500" />
          <span>{feature.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError("Signup failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a verification needed response
        if (data.needsVerification) {
          setSignupEmail(email);
          setShowVerificationModal(true);
          return;
        }
        throw new Error(data.error || "Failed to create account");
      }

      // Show verification modal instead of redirecting
      if (data.needsVerification) {
        setSignupEmail(email);
        setShowVerificationModal(true);
      } else {
        localStorage.setItem("userEmail", email);
        window.location.replace(data.redirect || "/welcome");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerified = async () => {
    try {
      const response = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: signupEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userEmail", signupEmail);
        window.location.replace(data.redirect || "/welcome");
      } else {
        setError(data.error || "Failed to complete signup");
        setShowVerificationModal(false);
      }
    } catch (err) {
      setError("Failed to complete signup");
      setShowVerificationModal(false);
    }
  };

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
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo/Brand area */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight mb-2 transition-all duration-300 hover:from-amber-800 hover:to-orange-700">
            🔗 NEVER BREAK THE CHAIN
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Start your consistency journey today
          </p>
        </motion.div>

        <motion.div
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Create account
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Join thousands building better habits
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                disabled={isLoading}
                className="mt-1.5 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="mt-1.5 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
              />
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-800 font-medium mb-1">
                    Password setup comes later
                  </p>
                  <p className="text-xs text-emerald-600">
                    Just your name and email for now. We'll set up your secure password during the welcome flow.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)',
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgb(180,83,9) 0%, rgb(146,64,14) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)';
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </motion.div>
          </form>

          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <motion.div
            className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-600 font-medium hover:text-amber-800 transition-colors duration-300 cursor-pointer"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Feature highlights */}
        <FeatureHighlights />

        {/* Footer quote */}
        <motion.p
          className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          "Consistency beats intensity"
        </motion.p>
      </motion.div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={signupEmail}
        onVerified={handleEmailVerified}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
