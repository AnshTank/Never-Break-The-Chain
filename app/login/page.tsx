"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Sparkles, Target, Zap, TrendingUp, Eye } from "lucide-react";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";

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

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showIncompleteSetup, setShowIncompleteSetup] = useState(false);
  const [incompleteEmail, setIncompleteEmail] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    const message = searchParams.get("message");
    if (oauthError) {
      setError("Login failed. Please try again.");
    } else if (message) {
      setError("");
    }
  }, [searchParams]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: password || "",
          rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.needsVerification) {
          setLoginEmail(email);
          setShowVerificationModal(true);
        } else {
          router.push("/dashboard");
        }
      } else {
        if (data.needsVerification) {
          setLoginEmail(email);
          setShowVerificationModal(true);
        } else if (data.needsPasswordSetup && data.email) {
          setIncompleteEmail(data.email);
          setShowIncompleteSetup(true);
          setError("");
        } else {
          setError(data.error || "Invalid email or password");
        }
      }
    } catch (err) {
      setError("Failed to sign in");
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
        body: JSON.stringify({ email: loginEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userEmail", loginEmail);
        window.location.replace(data.redirect || "/welcome");
      } else {
        setError(data.error || "Failed to complete verification");
        setShowVerificationModal(false);
      }
    } catch (err) {
      setError("Failed to complete verification");
      setShowVerificationModal(false);
    }
  };

  const handleContinueSetup = async () => {
    setIsLoading(true);
    try {
      const emailToUse = incompleteEmail || email;
      const response = await fetch("/api/auth/resend-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/welcome";
      } else {
        setError(data.error || "Failed to continue setup");
        setShowIncompleteSetup(false);
      }
    } catch (err) {
      setError("Failed to continue setup");
      setShowIncompleteSetup(false);
    } finally {
      setIsLoading(false);
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
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-800 hover:underline transition-all duration-300 cursor-pointer mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight mb-2 transition-all duration-300 hover:from-amber-800 hover:to-orange-700">
            🔗 NEVER BREAK THE CHAIN
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Welcome back to your journey
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {showIncompleteSetup ? (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Setup incomplete
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Your account <strong>{incompleteEmail}</strong> needs to be
                  set up.
                </p>
                <Button
                  type="button"
                  onClick={handleContinueSetup}
                  disabled={isLoading}
                  className="w-full cursor-pointer transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)",
                    color: "white",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgb(180,83,9) 0%, rgb(146,64,14) 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)";
                  }}
                >
                  {isLoading ? "Continuing..." : "Continue setup"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowIncompleteSetup(false)}
                  className="w-full cursor-pointer text-slate-600 hover:text-amber-800 transition-colors duration-300 mt-2"
                >
                  Back to login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Continue your chain
                  </p>
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

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors duration-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors duration-300 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                      disabled={isLoading}
                      className="border-slate-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 cursor-pointer"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm text-slate-600 cursor-pointer select-none hover:text-slate-800 transition-colors duration-200"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-amber-600 hover:text-amber-800 hover:underline transition-all duration-300 cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>

                <p className="text-xs text-slate-500">
                  {rememberMe
                    ? "You'll stay logged in for 7 days"
                    : "You'll be logged out after 24 hours of inactivity"}
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)",
                    color: "white",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgb(180,83,9) 0%, rgb(146,64,14) 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)";
                  }}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!email) {
                      setError("Please enter your email first");
                      return;
                    }
                    handleContinueSetup();
                  }}
                  className="text-sm text-amber-600 hover:text-amber-800 hover:underline transition-all duration-300 cursor-pointer"
                  disabled={isLoading}
                >
                  Can't remember your password? Try account recovery
                </button>
              </div>
            </>
          )}

          {searchParams.get("message") && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-600 dark:text-green-400 text-sm">
                {searchParams.get("message")}
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-center space-y-2">
              <Link
                href="/delete-account"
                className="text-red-500 text-sm hover:text-red-700 hover:underline transition-all duration-300 cursor-pointer block"
              >
                Delete account
              </Link>
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-amber-600 hover:text-amber-800 transition-colors duration-300 cursor-pointer"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={loginEmail}
        onVerified={handleEmailVerified}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
