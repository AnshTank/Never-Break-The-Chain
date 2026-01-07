"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PasswordSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
  userEmail: string;
}

export default function PasswordSetupModal({
  isOpen,
  onComplete,
  onClose,
  userEmail,
}: PasswordSetupModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // EXACT SAME LOGIC - Fetch user email if not provided
  useEffect(() => {
    if (!userEmail && isOpen) {
      const fetchUserEmail = async () => {
        try {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            setCurrentUserEmail(data.email || "");
          }
        } catch (error) {
          // console.error("Error fetching user email:", error);
        }
      };
      fetchUserEmail();
    } else {
      setCurrentUserEmail(userEmail);
    }
  }, [userEmail, isOpen]);

  // EXACT SAME LOGIC - Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // console.log("=== PASSWORD SETUP API CALL ===");
      // console.log("Sending password length:", password.length);

      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      // console.log("Response status:", response.status);
      // console.log(
      //   "Response headers:",
      //   Object.fromEntries(response.headers.entries())
      // );

      const responseText = await response.text();
      // console.log("Raw response:", responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          // console.log("Parsed success data:", data);
          localStorage.removeItem("userEmail");
          onComplete();
        } catch (parseError) {
          // console.log("Success but no JSON - completing anyway");
          onComplete();
        }
      } else {
        try {
          const data = JSON.parse(responseText);
          setError(data.error || "Failed to setup password");
        } catch (parseError) {
          setError(`HTTP ${response.status}: ${responseText}`);
        }
      }
    } catch (error) {
      // console.error("Network error:", error);
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  // Password validation
  const passwordRequirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  // Calculate strength
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "" };
    const met = Object.values(passwordRequirements).filter(Boolean).length;
    if (met === 4) return { label: "Strong", color: "text-emerald-400" };
    if (met === 3) return { label: "Good", color: "text-blue-400" };
    if (met === 2) return { label: "Fair", color: "text-yellow-400" };
    return { label: "Weak", color: "text-red-400" };
  };

  const strength = getPasswordStrength();
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "animate-fadeIn"
      }`}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out;
        }

        .input-field {
          transition: all 0.25s ease;
        }

        .input-field:focus {
          transform: translateY(-1px);
        }

        .field-border {
          transition: all 0.25s ease;
        }

        .progress-bar {
          transition: width 0.3s ease, background-color 0.3s ease;
        }
      `}</style>

      <div
        className={`relative w-full max-w-md bg-gradient-to-br from-slate-900/95 via-purple-900/80 to-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-400 ${
          isClosing ? "opacity-0 scale-95 translate-y-4" : "animate-slideUp"
        }`}
      >
        {/* Close Button - Does NOT call onComplete */}
        <button
          onClick={() => {
            if (onClose) {
              setIsClosing(true);
              setTimeout(() => {
                onClose();
                setIsClosing(false);
              }, 300);
            }
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4 text-gray-300 hover:text-white transition-colors" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Setup Your Password
            </h2>
            <p className="text-gray-300 text-sm">
              Create a secure password for your account
            </p>
          </div>

          <div className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={currentUserEmail}
                disabled
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 transition-colors duration-200 ${
                  focusedField === "password"
                    ? "text-purple-300"
                    : "text-gray-300"
                }`}
              >
                Password
              </label>

              <div className="relative">
                <div
                  className={`field-border absolute inset-0 rounded-lg pointer-events-none ${
                    focusedField === "password"
                      ? "ring-2 ring-purple-500/50"
                      : ""
                  }`}
                ></div>

                <div className="relative bg-white/5 rounded-lg border border-white/10">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoFocus={false}
                    className="input-field w-full px-4 py-2.5 pr-11 bg-transparent border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Compact Password Strength */}
              {password && (
                <div className="mt-2.5 animate-fadeInScale">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-300">
                      Password Strength
                    </span>
                    <span className={`text-xs font-medium ${strength.color}`}>
                      {strength.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`progress-bar h-full rounded-full ${
                        strength.label === "Strong"
                          ? "bg-emerald-500 w-full"
                          : strength.label === "Good"
                          ? "bg-blue-500 w-3/4"
                          : strength.label === "Fair"
                          ? "bg-yellow-500 w-1/2"
                          : "bg-red-500 w-1/4"
                      }`}
                    ></div>
                  </div>

                  {/* Compact Requirements */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        passwordRequirements.length
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      6+ chars
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        passwordRequirements.uppercase
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      A-Z
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        passwordRequirements.lowercase
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      a-z
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        passwordRequirements.number
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      0-9
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 transition-colors duration-200 ${
                  focusedField === "confirmPassword"
                    ? "text-purple-300"
                    : "text-gray-300"
                }`}
              >
                Confirm Password
              </label>

              <div className="relative">
                <div
                  className={`field-border absolute inset-0 rounded-lg pointer-events-none ${
                    focusedField === "confirmPassword"
                      ? "ring-2 ring-purple-500/50"
                      : confirmPassword && !passwordsMatch
                      ? "ring-2 ring-red-500/50"
                      : confirmPassword && passwordsMatch
                      ? "ring-2 ring-emerald-500/50"
                      : ""
                  }`}
                ></div>

                <div className="relative bg-white/5 rounded-lg border border-white/10">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoFocus={false}
                    className="input-field w-full px-4 py-2.5 pr-20 bg-transparent border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Confirm your password"
                  />

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Match Indicator */}
                    {confirmPassword && (
                      <div
                        className={`transition-colors ${
                          passwordsMatch ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {passwordsMatch ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Message */}
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-400 animate-fadeInScale">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg animate-fadeInScale">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !password || !confirmPassword}
                type="button"
                className={`relative w-full py-3 rounded-lg font-semibold overflow-hidden transition-all duration-200 ${
                  loading || !password || !confirmPassword
                    ? "bg-white/10 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 0.6s linear infinite" }}
                    ></div>
                    <span>Setting up...</span>
                  </div>
                ) : (
                  <span>Complete Setup</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
