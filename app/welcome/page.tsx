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
  const [mnzdConfigs, setMnzdConfigs] =
    useState<MNZDConfig[]>(defaultMNZDConfigs);
  const [mounted, setMounted] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
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
  }, []);

  // Fetch user email when component mounts
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || '');
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };
    
    if (mounted && !userEmail) {
      fetchUserEmail();
    }
  }, [mounted, userEmail]);

  // Redirect if not a new user
  useEffect(() => {
    if (userStatusLoading) return;

    if (isNewUser === false) {
      router.push("/");
      return;
    }
  }, [isNewUser, userStatusLoading, router]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      const container = document.querySelector(".welcome-container");
      if (container) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleFinish = async () => {
    setShowJourneyModal(true);
  };

  const handleConfirmJourney = async () => {
    setShowJourneyModal(false);
    setShowPasswordSetup(true);
  };

  const handlePasswordSetupComplete = async () => {
    try {
      // Mark welcome as completed
      const response = await fetch('/api/user/complete-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Update user status to not new user
        await updateUserStatus(false);
        setShowPasswordSetup(false);
        router.push("/");
      } else {
        console.error('Failed to complete welcome');
        // Still proceed to avoid blocking user
        setShowPasswordSetup(false);
        router.push("/");
      }
    } catch (error) {
      console.error('Error completing welcome:', error);
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
    setMnzdConfigs((prev) =>
      prev.map((config) =>
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  if (userStatusLoading || !mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isNewUser === false) {
    return null;
  }

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx global>{`
        .welcome-container::-webkit-scrollbar {
          display: none;
        }
        .welcome-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        {mounted && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              >
                <div className="w-1 h-1 bg-white/20 rounded-full" />
              </div>
            ))}
          </div>
        )}
        <div
          className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "6s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        />
      </div>

      <div className="welcome-container relative z-10 h-full overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-500 transform ${
                      i <= step
                        ? "bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-500/25 scale-110"
                        : "bg-white/20 backdrop-blur-sm scale-100"
                    }`}
                  />
                  {i < 4 && (
                    <div
                      className={`w-16 h-0.5 mx-2 transition-all duration-500 ${
                        i < step
                          ? "bg-gradient-to-r from-blue-400 to-purple-400"
                          : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Hero Welcome */}
          {step === 1 && (
            <div className="text-center space-y-8 animate-in fade-in duration-1000">
              <div className="space-y-8">
                <div className="relative">
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                    NEVER BREAK
                  </h1>
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    THE CHAIN
                  </h1>
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div
                    className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-40 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                  <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
                    Transform your life through the power of{" "}
                    <span className="font-semibold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                      consistent daily action
                    </span>
                  </p>
                  <p className="text-lg text-white/70 max-w-2xl mx-auto">
                    Join thousands who have built unstoppable momentum using
                    Jerry Seinfeld's legendary productivity method. Every chain
                    starts with a single link. Every journey begins with a
                    single step.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-white/30">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div className="space-y-3">
                        <div className="text-4xl font-bold text-white">∞</div>
                        <div className="text-white/80">Unlimited Potential</div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                          1%
                        </div>
                        <div className="text-white/80">Daily Improvement</div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-4xl font-bold text-white">365</div>
                        <div className="text-white/80">Days of Growth</div>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-6">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        The Science of Success
                      </h3>
                      <p className="text-white/80 text-base leading-relaxed mb-6">
                        Research shows that it takes an average of 66 days to
                        form a habit. But here's the secret:
                        <span className="font-semibold text-white">
                          {" "}
                          consistency beats perfection
                        </span>
                        . Small daily actions compound into extraordinary
                        results over time.
                      </p>

                      <Button
                        onClick={handleNext}
                        size="lg"
                        className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                      >
                        Begin Your Transformation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: The Philosophy */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-1000">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  The Philosophy
                </h1>
                <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Understanding the deeper principles behind lasting change
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur-xl" />
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-3">
                        The Chain Reaction
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        Jerry Seinfeld's method is deceptively simple: Do one
                        important thing every day. Mark it on a calendar. After
                        a few days, you'll have a chain.
                        <span className="font-semibold text-white">
                          Your only job is to not break the chain.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl" />
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Compound Growth
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        If you improve by just 1% each day, you'll be 37 times
                        better by the end of the year. This isn't just math—it's
                        the fundamental law of personal transformation.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Identity Shift
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        You don't just build habits—you become the type of
                        person who does these things naturally. Every action is
                        a vote for the person you want to become.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-xl" />
                  <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <div className="text-center space-y-6">
                      <div className="text-7xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                        🔗
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-white">
                          Your Chain Awaits
                        </h3>
                        <p className="text-white/80">
                          Every master was once a beginner. Every expert was
                          once a disaster. The difference? They never broke
                          their chain.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">
                            Day 1
                          </div>
                          <div className="text-white/60">Motivation</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                            Day 365
                          </div>
                          <div className="text-white/60">Transformation</div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="text-sm text-white/70 mb-4 italic">
                          "Success is the sum of small efforts repeated day in
                          and day out." - Robert Collier
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-xs text-white/60 mb-2">
                            The Math of Transformation
                          </div>
                          <div className="text-white/80 font-mono text-center">
                            <div className="text-green-400">
                              1.01³⁶⁵ = 37.78x better
                            </div>
                            <div className="text-red-400">
                              0.99³⁶⁵ = 0.03x worse
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Discover the MNZD System
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: MNZD Deep Dive */}
          {step === 3 && (
            <div className="space-y-12 animate-in fade-in duration-1000">
              <div className="text-center space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white">
                  The MNZD Framework
                </h1>
                <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                  Four interconnected pillars that create a foundation for
                  extraordinary personal growth
                </p>
              </div>

              <div className="grid gap-8">
                {[
                  {
                    letter: "M",
                    title: "MOVE",
                    subtitle: "Physical Mastery",
                    fullForm: "Movement • Momentum • Muscle",
                    philosophy:
                      "Your body is the vehicle for all your dreams. When you move your body, you move your life.",
                    description:
                      "Physical activity isn't just about fitness—it's about building the discipline, energy, and mental clarity needed for peak performance in all areas of life.",
                    benefits: [
                      "Increased energy and vitality throughout the day",
                      "Enhanced mood through endorphin release",
                      "Improved cognitive function and memory",
                      "Greater self-confidence and body awareness",
                      "Better sleep quality and recovery",
                      "Stress reduction and emotional regulation",
                    ],
                    science:
                      "Exercise increases BDNF (brain-derived neurotrophic factor), literally growing new brain cells and improving neuroplasticity.",
                    color: "from-green-400 to-emerald-600",
                    bgColor: "from-green-500/20 to-emerald-500/20",
                  },
                  {
                    letter: "N",
                    title: "NOURISH",
                    subtitle: "Mental Expansion",
                    fullForm: "Nurture • Navigate • Neurons",
                    philosophy:
                      "The mind that opens to a new idea never returns to its original size.",
                    description:
                      "Continuous learning and mental stimulation create new neural pathways, expanding your capacity for creativity, problem-solving, and innovation.",
                    benefits: [
                      "Expanded knowledge base and expertise",
                      "Enhanced critical thinking abilities",
                      "Improved creativity and innovation",
                      "Greater adaptability to change",
                      "Increased intellectual confidence",
                      "Better decision-making skills",
                    ],
                    science:
                      "Neuroplasticity research shows that learning new skills literally rewires your brain, creating stronger neural networks.",
                    color: "from-purple-400 to-violet-600",
                    bgColor: "from-purple-500/20 to-violet-500/20",
                  },
                  {
                    letter: "Z",
                    title: "ZONE",
                    subtitle: "Flow State Mastery",
                    fullForm:
                      "Zero Distractions • Zenith Performance • Zone of Genius",
                    philosophy:
                      "In the zone, time disappears, self-consciousness fades, and peak performance emerges naturally.",
                    description:
                      "Deep, focused work on your most important skills and projects. This is where mastery is built and breakthroughs happen.",
                    benefits: [
                      "Accelerated skill development and mastery",
                      "Increased productivity and output quality",
                      "Enhanced creative breakthroughs",
                      "Greater professional recognition",
                      "Improved problem-solving abilities",
                      "Deeper sense of purpose and fulfillment",
                    ],
                    science:
                      "Flow states increase performance by up to 500% and trigger the release of norepinephrine, dopamine, and anandamide.",
                    color: "from-blue-400 to-cyan-600",
                    bgColor: "from-blue-500/20 to-cyan-500/20",
                  },
                  {
                    letter: "D",
                    title: "DOCUMENT",
                    subtitle: "Wisdom Capture",
                    fullForm: "Document • Develop • Discover",
                    philosophy:
                      "Writing is thinking on paper. When you write, you don't just record thoughts—you create them.",
                    description:
                      "Capture insights, reflect on experiences, and express ideas through writing. This practice clarifies thinking and preserves wisdom.",
                    benefits: [
                      "Improved communication and articulation",
                      "Enhanced self-awareness and reflection",
                      "Better emotional processing and regulation",
                      "Preserved insights and learning",
                      "Increased creativity through expression",
                      "Stronger personal and professional relationships",
                    ],
                    science:
                      "Writing activates the reticular activating system, helping you notice and remember important information.",
                    color: "from-cyan-400 to-teal-600",
                    bgColor: "from-cyan-500/20 to-teal-500/20",
                  },
                ].map((pillar, index) => (
                  <div key={index} className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${pillar.bgColor} rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
                    />
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300">
                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${pillar.color} flex items-center justify-center text-white font-black text-2xl shadow-lg`}
                            >
                              {pillar.letter}
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold text-white">
                                {pillar.title}
                              </h3>
                              <p className="text-white/60 text-lg">
                                {pillar.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                              Full Form
                            </div>
                            <div
                              className={`text-lg font-medium text-transparent bg-gradient-to-r ${pillar.color} bg-clip-text`}
                            >
                              {pillar.fullForm}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                              Philosophy
                            </div>
                            <p className="text-white/90 italic leading-relaxed">
                              "{pillar.philosophy}"
                            </p>
                          </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                          <p className="text-white/80 text-lg leading-relaxed">
                            {pillar.description}
                          </p>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-lg font-semibold text-white">
                                Key Benefits
                              </h4>
                              <ul className="space-y-2">
                                {pillar.benefits.map((benefit, i) => (
                                  <li
                                    key={i}
                                    className="text-white/70 flex items-start"
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${pillar.color} mt-2 mr-3 flex-shrink-0`}
                                    />
                                    <span className="text-sm">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-lg font-semibold text-white">
                                The Science
                              </h4>
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-white/80 text-sm leading-relaxed">
                                  {pillar.science}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-xl" />
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      The Synergy Effect
                    </h3>
                    <p className="text-white/80 text-lg leading-relaxed mb-6">
                      These four pillars don't work in isolation—they amplify
                      each other. Physical movement enhances mental clarity.
                      Learning fuels focused work. Deep work generates insights
                      worth documenting. Documentation reinforces learning.
                    </p>
                    <div className="text-6xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text">
                      M + N + Z + D = ∞
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Customize Your MNZD
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Customization */}
          {step === 4 && (
            <div className="space-y-12 animate-in fade-in duration-1000">
              <div className="text-center space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white">
                  Make It Yours
                </h1>
                <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Customize each pillar to align with your unique goals,
                  lifestyle, and aspirations
                </p>
              </div>

              <div className="grid gap-8">
                {mnzdConfigs.map((config, index) => {
                  const colors = [
                    {
                      gradient: "from-green-400 to-emerald-600",
                      bg: "from-green-500/20 to-emerald-500/20",
                    },
                    {
                      gradient: "from-purple-400 to-violet-600",
                      bg: "from-purple-500/20 to-violet-500/20",
                    },
                    {
                      gradient: "from-blue-400 to-cyan-600",
                      bg: "from-blue-500/20 to-cyan-500/20",
                    },
                    {
                      gradient: "from-cyan-400 to-teal-600",
                      bg: "from-cyan-500/20 to-teal-500/20",
                    },
                  ];
                  const colorScheme = colors[index] || colors[0];

                  return (
                    <div key={config.id} className="relative group">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
                      />
                      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                        <div className="grid lg:grid-cols-4 gap-6">
                          <div className="lg:col-span-1 space-y-4">
                            <div
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${colorScheme.gradient} flex items-center justify-center text-white font-black text-2xl shadow-lg`}
                            >
                              {config.id.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {config.name}
                              </h3>
                              <p className="text-white/60">
                                Pillar {index + 1}
                              </p>
                            </div>
                          </div>

                          <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`${config.id}-name`}
                                className="text-white font-medium"
                              >
                                Task Name
                              </Label>
                              <Input
                                id={`${config.id}-name`}
                                value={config.name}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                                placeholder="Enter task name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`${config.id}-minutes`}
                                className="text-white font-medium"
                              >
                                Daily Minutes
                              </Label>
                              <Input
                                id={`${config.id}-minutes`}
                                type="number"
                                value={config.minMinutes}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "minMinutes",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                                placeholder="30"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`${config.id}-color`}
                                className="text-white font-medium"
                              >
                                Theme Color
                              </Label>
                              <div className="flex items-center space-x-3">
                                <Input
                                  id={`${config.id}-color`}
                                  type="color"
                                  value={config.color}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 h-10 bg-white/10 border-white/20 rounded-lg cursor-pointer"
                                />
                                <div
                                  className="flex-1 h-10 rounded-lg"
                                  style={{ backgroundColor: config.color }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Label
                            htmlFor={`${config.id}-description`}
                            className="text-white font-medium"
                          >
                            Personal Description
                          </Label>
                          <Textarea
                            id={`${config.id}-description`}
                            value={config.description}
                            onChange={(e) =>
                              updateConfig(
                                config.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 min-h-[80px]"
                            placeholder="Describe what this pillar means to you and your goals..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
                    <div className="space-y-6">
                      <h3 className="text-3xl font-bold text-white">
                        Your Journey Begins Now
                      </h3>
                      <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
                        You've designed your personal MNZD system. Every day you
                        complete these four pillars, you're not just building
                        habits—you're becoming the person you've always wanted
                        to be.
                      </p>

                      <div className="grid md:grid-cols-4 gap-4 mt-8">
                        {mnzdConfigs.map((config, index) => (
                          <div
                            key={config.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <div
                              className="w-8 h-8 rounded-lg mb-2 mx-auto"
                              style={{ backgroundColor: config.color }}
                            />
                            <div className="text-white font-semibold">
                              {config.name}
                            </div>
                            <div className="text-white/60 text-sm">
                              {config.minMinutes} min/day
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6">
                        <Button
                          onClick={handleFinish}
                          size="lg"
                          className="px-16 py-6 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                        >
                          Start My Chain Today
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PasswordSetupModal
        isOpen={showPasswordSetup}
        onComplete={handlePasswordSetupComplete}
        userEmail={userEmail}
      />

      {/* Journey Confirmation Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full mx-4 animate-in fade-in duration-300">
            <div className="text-center space-y-6">
              <div className="text-6xl">🤝</div>
              <h3 className="text-2xl font-bold text-white">Our Promise</h3>
              <div className="space-y-4 text-white/90">
                <p className="leading-relaxed">
                  We haven't forgotten our promise to help you set up a secure
                  password for your account.
                </p>
                <p className="leading-relaxed">
                  Every day you complete your MNZD tasks, you're not just
                  building habits—you're becoming the person you've always
                  wanted to be.
                </p>
                <p className="font-semibold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Your chain starts today. Never break it.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleConfirmJourney}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  Setup Password 🔐
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
