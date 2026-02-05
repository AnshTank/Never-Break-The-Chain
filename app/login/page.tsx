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
import { DeviceManager } from "@/lib/device-manager";

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
  const [isCheckingAutoLogin, setIsCheckingAutoLogin] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showIncompleteSetup, setShowIncompleteSetup] = useState(false);
  const [incompleteEmail, setIncompleteEmail] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [showDeviceSelectionModal, setShowDeviceSelectionModal] = useState(false);
  const [deviceSelectionData, setDeviceSelectionData] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for auto-login on component mount
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        // Check if user is already authenticated via middleware redirect
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('error') === 'device_removed') {
          setError('Your device was removed from another location. Please sign in again.')
          setIsCheckingAutoLogin(false)
          return
        }

        const result = await DeviceManager.performAutoLogin()
        if (result.success && result.redirect) {
          router.replace(result.redirect)
          return
        }
      } catch (error) {
        console.error('Auto-login check failed:', error)
      } finally {
        setIsCheckingAutoLogin(false)
      }
    }

    checkAutoLogin()
  }, [router])

  // Initialize activity tracking when component mounts
  useEffect(() => {
    DeviceManager.initActivityTracking();
    
    return () => {
      DeviceManager.stopActivityTracking();
    };
  }, []);

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
      // Get device ID for device limit checking
      const deviceId = DeviceManager.getDeviceId();
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId
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

        if (data.deviceLimitReached) {

          // Show device selection modal instead of just error
          setDeviceSelectionData({
            email,
            password,
            rememberMe,
            activeDevices: data.activeDevices,
            message: data.message
          });
          setShowDeviceSelectionModal(true);
          setError(""); // Clear error since we're showing modal
        } else if (data.needsVerification) {
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

  const handleDeviceRemoval = async (deviceIdToRemove: string) => {
    if (!deviceSelectionData) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/devices/remove-for-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deviceIdToRemove,
          email: deviceSelectionData.email,
          password: deviceSelectionData.password
        })
      });
      
      if (response.ok) {
        setShowDeviceSelectionModal(false);
        
        // Retry login immediately
        const deviceId = DeviceManager.getDeviceId();
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-device-id": deviceId
          },
          body: JSON.stringify({
            email: deviceSelectionData.email,
            password: deviceSelectionData.password,
            rememberMe: deviceSelectionData.rememberMe,
          }),
        });
        
        if (loginResponse.ok) {
          router.push("/dashboard");
        } else {
          const loginData = await loginResponse.json();
          setError(loginData.error || "Login failed after device removal");
        }
      } else {
        setError("Failed to remove device");
      }
    } catch (error) {
      setError("Failed to remove device");
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

  // Show loading screen while checking auto-login
  if (isCheckingAutoLogin) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <AnimatedBackground />
        <FloatingShapes />
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Checking login status...</p>
        </motion.div>
      </div>
    );
  }

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
                    : "You'll be logged out after 12 hours of inactivity"}
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: isLoading 
                      ? "linear-gradient(135deg, rgb(156,163,175) 0%, rgb(107,114,128) 100%)"
                      : "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)",
                    color: "white",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgb(180,83,9) 0%, rgb(146,64,14) 100%)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgb(245,158,11) 0%, rgb(217,119,6) 100%)";
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
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
      
      {/* Device Selection Modal */}
      {showDeviceSelectionModal && deviceSelectionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Device Limit Reached
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can only be logged in on 2 devices
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Please select a device to remove and continue:
              </p>
              
              <div className="space-y-2 mb-6">
                {deviceSelectionData.activeDevices?.map((device: any) => (
                  <div 
                    key={device.deviceId}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600 dark:text-gray-400">
                        {device.deviceType === 'mobile' ? '📱' : '💻'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {device.deviceName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {device.browser} • Last active: {new Date(device.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeviceRemoval(device.deviceId)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeviceSelectionModal(false);
                    setDeviceSelectionData(null);
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
