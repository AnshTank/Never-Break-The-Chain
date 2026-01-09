"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserSettings, useUserStatus } from "@/hooks/use-data";
import { MNZDConfig } from "@/lib/types";
import PasswordSetupModal from "@/components/password-setup-modal";

const defaultMNZDConfigs: MNZDConfig[] = [
  {
    id: "code",
    name: "Code",
    description: "Programming and technical skills",
    minMinutes: 30,
    color: "#3b82f6",
  },
  {
    id: "think",
    name: "Think",
    description: "Learning and mental growth",
    minMinutes: 20,
    color: "#8b5cf6",
  },
  {
    id: "express",
    name: "Express",
    description: "Writing and communication",
    minMinutes: 15,
    color: "#06b6d4",
  },
  {
    id: "move",
    name: "Move",
    description: "Physical activity and health",
    minMinutes: 25,
    color: "#10b981",
  },
];

export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [mnzdConfigs, setMnzdConfigs] =
    useState<MNZDConfig[]>(defaultMNZDConfigs);
  const [mounted, setMounted] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { updateSettings } = useUserSettings();
  const {
    isNewUser,
    loading: userStatusLoading,
    updateUserStatus,
  } = useUserStatus();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Load saved MNZD configs from localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        const savedConfigs = localStorage.getItem('welcome-mnzd-configs');
        if (savedConfigs) {
          const parsedConfigs = JSON.parse(savedConfigs);
          // Validate the structure before setting
          if (Array.isArray(parsedConfigs) && parsedConfigs.length === 4) {
            setMnzdConfigs(parsedConfigs);
          }
        }
      } catch (error) {
        console.error('Error loading saved configs:', error);
        // Clear corrupted data
        localStorage.removeItem('welcome-mnzd-configs');
      }
    }

    // Prevent accidental navigation away from welcome flow
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNewUser === true) {
        e.preventDefault();
        e.returnValue =
          "Your account setup is not complete. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isNewUser]);

  // Fetch user email when component mounts
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || "");
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    if (mounted && !userEmail) {
      fetchUserEmail();
    }
  }, [mounted, userEmail]);

  // Redirect if not a new user and not already redirecting
  useEffect(() => {
    if (userStatusLoading) return;

    if (isNewUser === false) {
      router.push("/");
      return;
    }
  }, [isNewUser, userStatusLoading, router]);

  const handleNext = () => {
    if (step === 2 && cardIndex < 2) {
      setCardIndex(cardIndex + 1);
    } else if (step === 3 && cardIndex < 3) {
      setCardIndex(cardIndex + 1);
    } else if (step < 4) {
      setStep(step + 1);
      setCardIndex(0);
    }
  };

  const handlePrev = () => {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
    } else if (step > 1) {
      setStep(step - 1);
      setCardIndex(step === 2 ? 2 : step === 3 ? 3 : 0);
    }
  };

  const handleFinish = async () => {
    setShowPasswordSetup(true);
  };

  const handlePasswordSetupComplete = async () => {
    try {
      // Mark welcome as completed and save MNZD configs
      const response = await fetch("/api/user/complete-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mnzdConfigs }),
      });

      if (response.ok) {
        // Update user status to not new user
        await updateUserStatus(false);
        // Clear localStorage after successful completion
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('welcome-mnzd-configs');
          } catch (error) {
            console.error('Error clearing localStorage:', error);
          }
        }
        setShowPasswordSetup(false);
        router.push("/");
      } else {
        console.error("Failed to complete welcome");
        // Still proceed to avoid blocking user
        setShowPasswordSetup(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Error completing welcome:", error);
      // Still proceed to avoid blocking user
      setShowPasswordSetup(false);
      router.push("/");
    }
  };

  const updateConfig = (
    id: string,
    field: keyof MNZDConfig,
    value: string | number
  ) => {
    const updatedConfigs = mnzdConfigs.map((config) =>
      config.id === id ? { ...config, [field]: value } : config
    );
    setMnzdConfigs(updatedConfigs);
    
    // Save to localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('welcome-mnzd-configs', JSON.stringify(updatedConfigs));
      } catch (error) {
        console.error('Error saving configs to localStorage:', error);
      }
    }
  };

  if (userStatusLoading || !mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isNewUser === false || isNewUser === null) {
    return null;
  }

  return (
    <div className="h-screen relative overflow-hidden">
      <style jsx global>{`
        .card-stack {
          perspective: 1000px;
        }
        .card-3d {
          transform-style: preserve-3d;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-enter {
          transform: translateX(100%) rotateY(-15deg) scale(0.9);
          opacity: 0;
        }
        .card-active {
          transform: translateX(0) rotateY(0deg) scale(1);
          opacity: 1;
          z-index: 10;
        }
        .card-exit {
          transform: translateX(-100%) rotateY(15deg) scale(0.9);
          opacity: 0;
        }
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .morph {
          animation: morph 8s ease-in-out infinite;
        }
        @keyframes morph {
          0%,
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
        }

        /* Dynamic viewport scaling */
        @media (max-height: 800px) {
          .welcome-container {
            transform: scale(0.85);
            transform-origin: center;
          }
          .daily-commitment-header {
            margin-top: 1rem;
          }
        }
        @media (max-height: 700px) {
          .welcome-container {
            transform: scale(0.75);
            transform-origin: center;
          }
          .daily-commitment-header {
            margin-top: 0.5rem;
          }
        }
        @media (max-height: 600px) {
          .welcome-container {
            transform: scale(0.65);
            transform-origin: center;
            overflow-y: auto;
          }
          .daily-commitment-header {
            margin-top: 0.25rem;
          }
        }
        
        /* Less aggressive scaling for Daily Commitment section */
        @media (max-height: 800px) {
          .welcome-container:has(.daily-commitment-header) {
            transform: scale(0.9);
          }
        }
        @media (max-height: 700px) {
          .welcome-container:has(.daily-commitment-header) {
            transform: scale(0.85);
          }
        }
        @media (max-height: 600px) {
          .welcome-container:has(.daily-commitment-header) {
            transform: scale(0.8);
          }
        }
      `}</style>

      {/* Minimal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_50%)]" />
        {mounted && (
          <>
            <div className="absolute top-32 right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-32 left-32 w-48 h-48 bg-slate-500/5 rounded-full blur-2xl" />
          </>
        )}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Progress Indicator - Mobile Responsive */}
        <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-20" style={{top: 'clamp(1rem, 5vh, 2rem)'}}>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-700">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <button
                    onClick={() => (i < step ? setStep(i) : undefined)}
                    disabled={i > step}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                      i <= step ? "bg-blue-400" : "bg-slate-600"
                    } ${
                      i < step
                        ? "cursor-pointer hover:scale-125"
                        : i === step
                        ? ""
                        : "cursor-not-allowed"
                    }`}
                  />
                  {i < 4 && (
                    <div
                      className={`w-4 sm:w-6 h-px mx-1.5 sm:mx-2 transition-all duration-300 ${
                        i < step ? "bg-blue-400" : "bg-slate-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area - Mobile Responsive */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-4 welcome-container">
          <div className="max-w-3xl w-full">
            {/* Step 1: Hero Welcome - Mobile Responsive */}
            {step === 1 && (
              <div className="text-center space-y-6 sm:space-y-8 animate-in fade-in duration-1000">
                <div className="relative">
                  <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl floating" />
                  <div
                    className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl floating"
                    style={{ animationDelay: "2s" }}
                  />

                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight mb-3 sm:mb-4">
                    NEVER BREAK
                  </h1>
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    THE CHAIN
                  </h1>
                </div>

                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  <p className="text-lg sm:text-2xl md:text-3xl text-white/90 font-light leading-relaxed px-2">
                    Transform your life through the power of{" "}
                    <span className="font-semibold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                      consistent daily action
                    </span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                          ∞
                        </div>
                        <div className="text-white/80 font-medium text-sm sm:text-base">
                          Unlimited Potential
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                        <div className="text-3xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
                          1%
                        </div>
                        <div className="text-white/80 font-medium text-sm sm:text-base">
                          Daily Improvement
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                          365
                        </div>
                        <div className="text-white/80 font-medium text-sm sm:text-base">
                          Days of Growth
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Philosophy - Mobile Responsive */}
            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                    The Philosophy
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300">
                    Core principles behind lasting change
                  </p>
                </div>

                <div className="relative h-[350px] sm:h-[450px]">
                  {[
                    {
                      title: "The Chain Reaction",
                      icon: "🔗",
                      subtitle: "Jerry Seinfeld's Method",
                      content:
                        "Do one important thing daily. Mark it on a calendar. After a few days, you'll have a chain. Your only job is to not break it.",
                      highlight:
                        "The fear of breaking the chain becomes your greatest motivator.",
                    },
                    {
                      title: "Compound Growth",
                      icon: "📈",
                      subtitle: "Mathematics of Success",
                      content:
                        "1% daily improvement equals 37x better in a year. Small daily actions compound into extraordinary results over time.",
                      highlight:
                        "What starts small accumulates into something extraordinary.",
                    },
                    {
                      title: "Identity Shift",
                      icon: "🎯",
                      subtitle: "Become Who You Want",
                      content:
                        "Every action is a vote for the type of person you wish to become. You don't rise to your goals, you fall to your systems.",
                      highlight: "Change who you are, not just what you do.",
                    },
                  ].map((card, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-out ${
                        index === cardIndex
                          ? "opacity-100 translate-x-0"
                          : index < cardIndex
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                      }`}
                    >
                      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-700/50 h-full flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-4xl sm:text-6xl opacity-10">
                          {card.icon}
                        </div>
                        <div className="text-center space-y-4 sm:space-y-6">
                          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                            {card.icon}
                          </div>
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                              {card.title}
                            </h3>
                            <p className="text-blue-400 text-sm font-medium mb-3 sm:mb-4">
                              {card.subtitle}
                            </p>
                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-3 sm:mb-4 px-2">
                              {card.content}
                            </p>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-xl mx-auto">
                              <p className="text-blue-300 font-medium text-xs sm:text-sm italic">
                                "{card.highlight}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center space-x-4 sm:space-x-6 mt-6 sm:mt-8">
                  <button
                    onClick={handlePrev}
                    disabled={cardIndex === 0}
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    ←
                  </button>

                  <div className="flex space-x-1.5 sm:space-x-2">
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        onClick={() => setCardIndex(i)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                          i === cardIndex
                            ? "bg-blue-400"
                            : "bg-slate-600 hover:bg-slate-500"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={
                      cardIndex === 2
                        ? handleNext
                        : () => setCardIndex(cardIndex + 1)
                    }
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm sm:text-base"
                  >
                    {cardIndex === 2 ? "Next" : "→"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: MNZD Framework - Mobile Responsive */}
            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                    The MNZD Framework
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300">
                    Four pillars of personal growth
                  </p>
                </div>

                <div className="relative h-[350px] sm:h-[450px]">
                  {[
                    {
                      letter: "M",
                      title: "MOVE",
                      subtitle: "Physical Foundation",
                      color: "from-emerald-500 to-teal-500",
                      description:
                        "Your body is the temple of your mind. Physical movement creates mental clarity and builds discipline.",
                      benefit:
                        "Exercise increases BDNF, literally growing new brain cells.",
                    },
                    {
                      letter: "N",
                      title: "NOURISH",
                      subtitle: "Mental Growth",
                      color: "from-purple-500 to-indigo-500",
                      description:
                        "Feed your mind with quality input daily. Reading, podcasts, courses - your mind is like a garden.",
                      benefit:
                        "30 minutes daily = 180+ hours of growth per year.",
                    },
                    {
                      letter: "Z",
                      title: "ZONE",
                      subtitle: "Deep Focus",
                      color: "from-blue-500 to-cyan-500",
                      description:
                        "Enter flow state through focused work. Deep work is becoming a superpower in our distracted world.",
                      benefit:
                        "Sustained attention creates breakthrough moments.",
                    },
                    {
                      letter: "D",
                      title: "DOCUMENT",
                      subtitle: "Capture Wisdom",
                      color: "from-orange-500 to-red-500",
                      description:
                        "Writing clarifies thinking. Document insights to build your personal knowledge base and track growth.",
                      benefit:
                        "Written thoughts become valuable future resources.",
                    },
                  ].map((pillar, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-out ${
                        index === cardIndex
                          ? "opacity-100 translate-x-0"
                          : index < cardIndex
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                      }`}
                    >
                      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-700/50 h-full flex flex-col justify-center relative overflow-hidden">
                        <div
                          className={`absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r ${pillar.color} opacity-10 rounded-full blur-2xl`}
                        />
                        <div className="text-center space-y-4 sm:space-y-6">
                          <div
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-r ${pillar.color} flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto shadow-2xl`}
                          >
                            {pillar.letter}
                          </div>
                          <div>
                            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                              {pillar.title}
                            </h3>
                            <p
                              className={`bg-gradient-to-r ${pillar.color} bg-clip-text text-transparent text-base sm:text-lg font-semibold mb-3 sm:mb-4`}
                            >
                              {pillar.subtitle}
                            </p>
                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-3 sm:mb-4 px-2">
                              {pillar.description}
                            </p>
                            <div
                              className={`bg-gradient-to-r ${pillar.color} bg-opacity-10 border border-opacity-20 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-xl mx-auto`}
                              style={{
                                borderColor: pillar.color.includes("emerald")
                                  ? "#10b981"
                                  : pillar.color.includes("purple")
                                  ? "#8b5cf6"
                                  : pillar.color.includes("blue")
                                  ? "#3b82f6"
                                  : "#f97316",
                              }}
                            >
                              <p className="text-white font-medium text-xs sm:text-sm">
                                ✨ {pillar.benefit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center space-x-4 sm:space-x-6 mt-6 sm:mt-8">
                  <button
                    onClick={handlePrev}
                    disabled={cardIndex === 0}
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    ←
                  </button>

                  <div className="flex space-x-1.5 sm:space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <button
                        key={i}
                        onClick={() => setCardIndex(i)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                          i === cardIndex
                            ? "bg-blue-400"
                            : "bg-slate-600 hover:bg-slate-500"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={
                      cardIndex === 3
                        ? handleNext
                        : () => setCardIndex(cardIndex + 1)
                    }
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm sm:text-base"
                  >
                    {cardIndex === 3 ? "Customize" : "→"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: MNZD Setup - Mobile Responsive */}
            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                {cardIndex < 4 ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-4">
                      <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
                          Setup Your {mnzdConfigs[cardIndex]?.name}
                        </h1>
                        <p className="text-sm sm:text-lg text-slate-300">
                          Pillar {cardIndex + 1} of 4 • Customize your daily
                          target
                        </p>
                      </div>
                      <div className="hidden sm:block bg-slate-700/30 rounded-xl p-3 border border-slate-600/50 max-w-xs">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                          💡 Pro Tip
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {mnzdConfigs[cardIndex]?.id === "code" &&
                            "Start with 30 minutes of focused coding. Use the Pomodoro technique: 25 min work, 5 min break."}
                          {mnzdConfigs[cardIndex]?.id === "think" &&
                            "Read for 20 minutes daily. Choose books that challenge your thinking and expand your worldview."}
                          {mnzdConfigs[cardIndex]?.id === "express" &&
                            "Write for 15 minutes daily. Journal, blog, or document learnings. Writing clarifies thinking."}
                          {mnzdConfigs[cardIndex]?.id === "move" &&
                            "Move for 25 minutes daily. Walking, gym, yoga - any movement counts. Your body fuels your mind."}
                        </p>
                      </div>
                    </div>

                    <div className="max-w-2xl mx-auto px-2 sm:px-0">
                      {/* Mobile Pro Tip - Above card */}
                      <div className="sm:hidden bg-slate-700/30 rounded-2xl p-4 border border-slate-600/50 mb-4">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                          💡 Pro Tip
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {mnzdConfigs[cardIndex]?.id === "code" &&
                            "Start with 30 minutes of focused coding. Use the Pomodoro technique: 25 min work, 5 min break."}
                          {mnzdConfigs[cardIndex]?.id === "think" &&
                            "Read for 20 minutes daily. Choose books that challenge your thinking and expand your worldview."}
                          {mnzdConfigs[cardIndex]?.id === "express" &&
                            "Write for 15 minutes daily. Journal, blog, or document learnings. Writing clarifies thinking."}
                          {mnzdConfigs[cardIndex]?.id === "move" &&
                            "Move for 25 minutes daily. Walking, gym, yoga - any movement counts. Your body fuels your mind."}
                        </p>
                      </div>

                      <div className="relative h-[450px] sm:h-[500px]">
                        {mnzdConfigs.map((config, index) => (
                          <div
                            key={config.id}
                            className={`absolute inset-0 transition-all duration-500 ease-out ${
                              index === cardIndex
                                ? "opacity-100 translate-x-0"
                                : index < cardIndex
                                ? "opacity-0 -translate-x-full"
                                : "opacity-0 translate-x-full"
                            }`}
                          >
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-700 h-full flex flex-col">
                              <div className="flex-1 space-y-3 sm:space-y-4">
                                {/* Header with Theme Color - Left aligned on mobile and desktop */}
                                <div className="flex items-center mb-3 sm:mb-4">
                                  <div
                                    className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-3xl shadow-lg flex-shrink-0`}
                                    style={{ backgroundColor: config.color }}
                                  >
                                    {config.id.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3 flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                                      {config.name}
                                    </h3>
                                    <p className="text-slate-400 text-xs sm:text-sm break-words">
                                      {config.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Configuration */}
                                <div className="space-y-3 sm:space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="sm:col-span-2">
                                      <Label className="text-slate-300 text-sm font-medium">
                                        Daily Minutes
                                      </Label>
                                      <div className="relative mt-2">
                                        <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateConfig(
                                                config.id,
                                                "minMinutes",
                                                Math.max(
                                                  5,
                                                  config.minMinutes - 5
                                                )
                                              )
                                            }
                                            className="px-2 sm:px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all text-lg sm:text-xl"
                                          >
                                            −
                                          </button>
                                          <input
                                            type="text"
                                            value={config.minMinutes}
                                            onChange={(e) => {
                                              const val =
                                                parseInt(e.target.value) || 0;
                                              if (val >= 5 && val <= 480)
                                                updateConfig(
                                                  config.id,
                                                  "minMinutes",
                                                  val
                                                );
                                            }}
                                            className="flex-1 bg-transparent text-white text-center text-xl sm:text-2xl font-bold focus:outline-none py-2"
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateConfig(
                                                config.id,
                                                "minMinutes",
                                                Math.min(
                                                  480,
                                                  config.minMinutes + 5
                                                )
                                              )
                                            }
                                            className="px-2 sm:px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all text-lg sm:text-xl"
                                          >
                                            +
                                          </button>
                                        </div>
                                        <div className="absolute inset-0 pointer-events-none">
                                          <div
                                            className="h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent transition-all duration-300"
                                            style={{
                                              width: `${Math.min(
                                                (config.minMinutes / 120) * 100,
                                                100
                                              )}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-slate-300 text-sm font-medium">
                                        Theme Color
                                      </Label>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <Input
                                          type="color"
                                          value={config.color}
                                          onChange={(e) =>
                                            updateConfig(
                                              config.id,
                                              "color",
                                              e.target.value
                                            )
                                          }
                                          className="w-10 h-8 sm:w-12 sm:h-10 bg-slate-700/50 border-slate-600 rounded cursor-pointer"
                                        />
                                        <div
                                          className="flex-1 h-8 sm:h-10 rounded border border-slate-600 shadow-inner"
                                          style={{
                                            backgroundColor: config.color,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-slate-300 text-sm font-medium">
                                        Custom Name
                                      </Label>
                                      <Input
                                        type="text"
                                        maxLength={18}
                                        value={config.name}
                                        onChange={(e) =>
                                          updateConfig(
                                            config.id,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        className="mt-2 bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 text-sm"
                                        placeholder="e.g., Code"
                                      />
                                      <p className="text-xs text-slate-500 mt-1">
                                        {config.name.length}/18
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-slate-300 text-sm font-medium">
                                      Description
                                    </Label>
                                    <Input
                                      type="text"
                                      maxLength={100}
                                      value={config.description}
                                      onChange={(e) =>
                                        updateConfig(
                                          config.id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="mt-2 bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 text-sm"
                                      placeholder="Brief description"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                      {config.description.length}/100
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center items-center space-x-4 sm:space-x-6 mt-6 sm:mt-8">
                        <button
                          onClick={handlePrev}
                          disabled={cardIndex === 0}
                          className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          ←
                        </button>

                        <div className="flex space-x-1.5 sm:space-x-2">
                          {[0, 1, 2, 3].map((i) => (
                            <button
                              key={i}
                              onClick={() =>
                                i < cardIndex ? setCardIndex(i) : undefined
                              }
                              disabled={i > cardIndex}
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                                i === cardIndex
                                  ? "bg-blue-400"
                                  : i < cardIndex
                                  ? "bg-slate-500 hover:bg-slate-400 cursor-pointer"
                                  : "bg-slate-600 cursor-not-allowed"
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={
                            cardIndex === 3
                              ? () => setCardIndex(4)
                              : () => setCardIndex(cardIndex + 1)
                          }
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm sm:text-base"
                        >
                          {cardIndex === 3 ? "Review" : "Next"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Summary & Edit Option - Mobile Responsive */
                  <div className="welcome-container">
                    <div className="text-center mb-2 daily-commitment-header">
                      <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                        Your Daily Commitment
                      </h1>
                      <p className="text-xs sm:text-base text-slate-300">
                        Review your MNZD system • Edit if needed
                      </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-2 sm:space-y-4 px-2 sm:px-0">
                      {/* Summary Cards - Mobile Responsive */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {mnzdConfigs.map((config, index) => (
                          <div
                            key={config.id}
                            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-700/50"
                          >
                            <div className="text-center">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl flex items-center justify-center text-white text-sm sm:text-lg font-bold mb-2`}
                                style={{ backgroundColor: config.color }}
                              >
                                {config.id.charAt(0).toUpperCase()}
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                                {config.name}
                              </h3>
                              <div className="text-lg sm:text-xl font-bold text-white mt-1 sm:mt-2">
                                {config.minMinutes}m
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Summary - Mobile Responsive */}
                      <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-slate-600/30">
                        <div className="text-center">
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                            Daily Overview
                          </h3>
                          <div className="flex items-center justify-center space-x-3 sm:space-x-6">
                            <div className="text-center">
                              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                                {mnzdConfigs.reduce(
                                  (sum, config) => sum + config.minMinutes,
                                  0
                                )}
                                m
                              </div>
                              <div className="text-xs sm:text-sm text-slate-400">
                                total daily
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                                4
                              </div>
                              <div className="text-xs sm:text-sm text-slate-400">
                                life pillars
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                                ∞
                              </div>
                              <div className="text-xs sm:text-sm text-slate-400">
                                potential
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Motivational Impact Calculations */}
                      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-blue-500/20">
                        <div className="text-center mb-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                            Your Journey Impact
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400">
                            See the compound effect of your daily commitment
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-white/5 rounded-xl">
                            <div className="text-lg sm:text-xl font-bold text-blue-400">
                              {Math.round(
                                (mnzdConfigs.reduce(
                                  (sum, config) => sum + config.minMinutes,
                                  0
                                ) *
                                  30) /
                                  60
                              )}
                              h
                            </div>
                            <div className="text-xs text-slate-400">
                              per month
                            </div>
                            <div className="text-xs text-blue-300 mt-1">
                              ={" "}
                              {Math.round(
                                (mnzdConfigs.reduce(
                                  (sum, config) => sum + config.minMinutes,
                                  0
                                ) *
                                  30) /
                                  60 /
                                  8
                              )}{" "}
                              work days
                            </div>
                          </div>

                          <div className="text-center p-3 bg-white/5 rounded-xl">
                            <div className="text-lg sm:text-xl font-bold text-emerald-400">
                              {Math.round(
                                (mnzdConfigs.reduce(
                                  (sum, config) => sum + config.minMinutes,
                                  0
                                ) *
                                  180) /
                                  60
                              )}
                              h
                            </div>
                            <div className="text-xs text-slate-400">
                              in 6 months
                            </div>
                            <div className="text-xs text-emerald-300 mt-1">
                              ={" "}
                              {Math.round(
                                (mnzdConfigs.reduce(
                                  (sum, config) => sum + config.minMinutes,
                                  0
                                ) *
                                  180) /
                                  60 /
                                  40
                              )}{" "}
                              weeks of learning
                            </div>
                          </div>

                          <div className="text-center p-3 bg-white/5 rounded-xl">
                            <div className="text-lg sm:text-xl font-bold text-purple-400">
                              {Math.round(
                                (mnzdConfigs.reduce(
                                  (sum, config) => sum + config.minMinutes,
                                  0
                                ) *
                                  365) /
                                  60
                              )}
                              h
                            </div>
                            <div className="text-xs text-slate-400">
                              per year
                            </div>
                            <div className="text-xs text-purple-300 mt-1">
                              = Master level expertise
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 p-2 sm:p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                          <div className="text-center">
                            <div className="text-sm font-medium text-yellow-300 mb-1">
                              💡 Fun Fact
                            </div>
                            <div className="text-xs text-slate-300">
                              {(() => {
                                const yearlyHours = Math.round(
                                  (mnzdConfigs.reduce(
                                    (sum, config) => sum + config.minMinutes,
                                    0
                                  ) *
                                    365) /
                                    60
                                );
                                if (yearlyHours < 600) {
                                  return "Even this pace puts you ahead of people who rely only on motivation.";
                                } else if (yearlyHours < 900) {
                                  return "This level builds stronger fundamentals than most college coursework.";
                                } else if (yearlyHours < 1200) {
                                  return "This is where real skill separation begins — consistency beats raw talent here.";
                                } else if (yearlyHours < 3000) {
                                  return "4–8 focused hours a day compounds into elite-level expertise most people never reach.";
                                } else {
                                  return "This intensity is how founders, athletes, and top performers compress decades into years.";
                                }
                              })()}{" "}
                              🎯
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Mobile Responsive */}
                      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <Button
                          onClick={() => setCardIndex(0)}
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto px-6 py-3 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          Edit Setup
                        </Button>
                        <Button
                          onClick={handleFinish}
                          size="lg"
                          className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Complete Setup
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Mobile Responsive */}
        {step === 1 && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={handleNext}
              size="lg"
              className="px-6 py-2.5 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
            >
              Begin Journey
            </Button>
          </div>
        )}
      </div>

      <PasswordSetupModal
        isOpen={showPasswordSetup}
        onComplete={handlePasswordSetupComplete}
        onClose={() => setShowPasswordSetup(false)}
        userEmail={userEmail}
      />
    </div>
  );
}
