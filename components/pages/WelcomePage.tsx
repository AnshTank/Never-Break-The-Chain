'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Check, Lock, Eye, EyeOff, Loader2, ChevronDown, X,
  Activity, BookOpen, Target, PenTool, Sparkles,
  ArrowRight, TrendingUp, Calendar, Clock, Zap,
  BarChart3, Award, Flame
} from 'lucide-react';
import { toast } from 'sonner';
import TermsAcceptance from '@/components/TermsAcceptance';

// Types
interface MNZDConfig {
  id: string;
  name: string;
  description: string;
  minMinutes: number;
  color: string;
}

const defaultMNZDConfigs: MNZDConfig[] = [
  { id: 'move', name: 'Move', description: 'Physical activity and health', minMinutes: 25, color: '#10b981' },
  { id: 'nourish', name: 'Nourish', description: 'Learning and mental growth', minMinutes: 20, color: '#8b5cf6' },
  { id: 'zone', name: 'Zone', description: 'Deep focus and flow state', minMinutes: 30, color: '#3b82f6' },
  { id: 'document', name: 'Document', description: 'Capture wisdom and insights', minMinutes: 15, color: '#f97316' }
];

// Phase configuration
const PHASES = [
  { id: 0, name: 'Welcome', title: 'Start' },
  { id: 1, name: 'Philosophy', title: 'Chapter 1' },
  { id: 2, name: 'Identity', title: 'Chapter 2' },
  { id: 3, name: 'Framework', title: 'MNZD' },
  { id: 4, name: 'Move', title: 'Pillar 1' },
  { id: 5, name: 'Nourish', title: 'Pillar 2' },
  { id: 6, name: 'Zone', title: 'Pillar 3' },
  { id: 7, name: 'Document', title: 'Pillar 4' },
  { id: 8, name: 'Analytics', title: 'Impact' },
];

// FIXED: Pre-generate particle data with consistent values
const generateParticles = (count: number, seed: number) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    // Use simple deterministic calculations for consistent server/client values
    const baseX = (i * 7 + seed * 3) % 100;
    const baseY = (i * 11 + seed * 5) % 40 + 30;
    const baseDelay = (i * 13 + seed * 7) % 50 / 10;
    const baseDuration = (i * 17 + seed * 11) % 30 / 10 + 4;
    const baseSize = (i * 19 + seed * 13) % 25 / 10 + 1.5;
    
    particles.push({
      id: i,
      x: Math.round(baseX * 100) / 100, // Round to 2 decimal places
      startY: Math.round(baseY * 100) / 100,
      delay: Math.round(baseDelay * 100) / 100,
      duration: Math.round(baseDuration * 100) / 100,
      size: Math.round(baseSize * 100) / 100
    });
  }
  return particles;
};

const generateBubbles = (count: number, seed: number) => {
  const bubbles = [];
  for (let i = 0; i < count; i++) {
    const baseX = (i * 23 + seed * 29) % 100;
    const baseDelay = (i * 31 + seed * 37) % 30 / 10;
    const baseDuration = (i * 41 + seed * 43) % 30 / 10 + 4;
    const baseSize = (i * 47 + seed * 53) % 80 + 40;
    
    bubbles.push({
      id: i,
      x: Math.round(baseX * 100) / 100,
      delay: Math.round(baseDelay * 100) / 100,
      duration: Math.round(baseDuration * 100) / 100,
      size: Math.round(baseSize * 100) / 100
    });
  }
  return bubbles;
};

// Floating Particles Component - FIXED for hydration
const FloatingParticles = ({ color = 'white', seed = 0 }: { color?: string; seed?: number }) => {
  const particles = generateParticles(15, seed);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.startY}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
          }}
          initial={{
            y: 0,
            opacity: 0,
            x: 0,
          }}
          animate={{
            y: [0, -600],
            opacity: [0, 0.4, 0.2, 0],
            x: [0, (particle.x - 50) / 10],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// Bubble Effect Component - FIXED for hydration
const BubbleEffect = ({ seed = 0 }: { seed?: number }) => {
  const bubbles = generateBubbles(8, seed);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full border border-white/10 bg-white/5"
          style={{
            left: `${bubble.x}%`,
            bottom: '50%',
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
          }}
          initial={{
            y: 0,
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            y: [0, -300],
            opacity: [0, 0.3, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

const WelcomePage = () => {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [unlockedPhases, setUnlockedPhases] = useState<number[]>([0]); // Track unlocked phases
  const [mnzdConfigs, setMnzdConfigs] = useState<MNZDConfig[]>(defaultMNZDConfigs);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showConfirmInput, setShowConfirmInput] = useState(false);
  const [showMotivationalHint, setShowMotivationalHint] = useState<{show: boolean, type: 'min' | 'max', taskName: string}>({show: false, type: 'min', taskName: ''});
  const [isLoading, setIsLoading] = useState(false);

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showMotivationalHint.show || showPasswordModal || showTermsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMotivationalHint.show, showPasswordModal, showTermsModal]);

  // Fetch user email on mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || '');
          setIsEmailVerified(data.isEmailVerified || false);
        }
      } catch (error) {
        console.error('Failed to fetch user email:', error);
      }
    };
    fetchUserEmail();
  }, []);

  // Save MNZD configs to both localStorage and database
  const saveMNZDConfigs = async (configs: MNZDConfig[]) => {
    // Save to localStorage for immediate persistence
    localStorage.setItem('welcomeMNZDConfigs', JSON.stringify(configs));
    
    // Save to database
    try {
      await fetch('/api/user/mnzd-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mnzdConfigs: configs }),
      });
    } catch (error) {
      console.error('Failed to save MNZD configs to database:', error);
    }
  };

  // Save MNZD configs whenever they change
  useEffect(() => {
    saveMNZDConfigs(mnzdConfigs);
  }, [mnzdConfigs]);

  // Load MNZD configs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('welcomeMNZDConfigs');
    if (saved) {
      try {
        const savedConfigs = JSON.parse(saved);
        setMnzdConfigs(savedConfigs);
      } catch (error) {
        console.error('Failed to load saved MNZD configs:', error);
      }
    }
  }, []);

  // Refs for each section
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollLockRef = useRef(false);

  // Set section ref
  const setSectionRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  };

  const totalDailyMinutes = mnzdConfigs.reduce((sum, config) => sum + config.minMinutes, 0);

  const passwordRequirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };
  const metRequirements = Object.values(passwordRequirements).filter(Boolean).length;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Update MNZD config with validation
  const updateConfig = (id: string, field: keyof MNZDConfig, value: string | number) => {
    if (field === 'minMinutes' && typeof value === 'number') {
      const config = mnzdConfigs.find(c => c.id === id);
      
      // Show hint when trying to go below 5
      if (value < 5) {
        setShowMotivationalHint({show: true, type: 'min', taskName: config?.name || id});
        // Set to minimum value
        setMnzdConfigs(prev => prev.map(c => 
          c.id === id ? { ...c, [field]: 5 } : c
        ));
        return;
      }
      
      // Show hint when trying to go above 120
      if (value > 120) {
        setShowMotivationalHint({show: true, type: 'max', taskName: config?.name || id});
        // Set to maximum value
        setMnzdConfigs(prev => prev.map(c => 
          c.id === id ? { ...c, [field]: 120 } : c
        ));
        return;
      }
    }
    
    setMnzdConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ));
  };

  // Handle manual input with validation
  const handleManualInput = (id: string, inputValue: string) => {
    const numValue = parseInt(inputValue) || 0;
    const config = mnzdConfigs.find(c => c.id === id);
    
    if (numValue < 5) {
      setShowMotivationalHint({show: true, type: 'min', taskName: config?.name || id});
      updateConfig(id, 'minMinutes', 5);
    } else if (numValue > 120) {
      setShowMotivationalHint({show: true, type: 'max', taskName: config?.name || id});
      updateConfig(id, 'minMinutes', 120);
    } else {
      updateConfig(id, 'minMinutes', numValue);
    }
  };

  // Complete phase with validation - ensure sequential progression
  const completePhase = useCallback((phase: number) => {
    // Check if all previous phases are completed
    for (let i = 0; i < phase; i++) {
      if (!completedPhases.includes(i)) {
        toast.error(`Please complete ${PHASES[i]?.title || `Phase ${i + 1}`} first!`);
        // Navigate to the first incomplete phase
        setCurrentPhase(i);
        setTimeout(() => {
          const element = sectionRefs.current[i];
          if (element) {
            isScrollingRef.current = true;
            scrollLockRef.current = true;
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { 
              isScrollingRef.current = false;
              scrollLockRef.current = false;
            }, 2000);
          }
        }, 150);
        return;
      }
    }
    
    if (!completedPhases.includes(phase)) {
      setCompletedPhases(prev => [...prev, phase]);
    }
    
    // Unlock next phase
    const nextPhase = phase + 1;
    if (nextPhase < PHASES.length && !unlockedPhases.includes(nextPhase)) {
      setUnlockedPhases(prev => [...prev, nextPhase]);
    }
    
    // Auto-scroll to next phase with enhanced smoothness
    if (nextPhase < PHASES.length) {
      setCurrentPhase(nextPhase);
      
      setTimeout(() => {
        const element = sectionRefs.current[nextPhase];
        if (element) {
          isScrollingRef.current = true;
          scrollLockRef.current = true;
          
          // Use smooth scroll with guaranteed full viewport positioning
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
          });
          
          // Extended timeout for smoother completion
          setTimeout(() => { 
            isScrollingRef.current = false;
            scrollLockRef.current = false;
          }, 2000); // Increased from 1500ms
        }
      }, 150); // Slight delay for state update
    }
  }, [completedPhases, unlockedPhases]);

  // Navigate to phase - ONLY UNLOCKED PHASES
  const navigateToPhase = useCallback((phase: number) => {
    if (!unlockedPhases.includes(phase)) {
      toast.info('Complete the current phase to unlock this section!');
      return;
    }
    
    setCurrentPhase(phase);
    
    setTimeout(() => {
      const element = sectionRefs.current[phase];
      if (element) {
        isScrollingRef.current = true;
        scrollLockRef.current = true;
        
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
        });
        
        setTimeout(() => { 
          isScrollingRef.current = false;
          scrollLockRef.current = false;
        }, 2000); // Increased for smoother completion
      }
    }, 150);
  }, [unlockedPhases]);

  // SCROLL LOCK - Prevent scrolling to locked phases with smooth recovery
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let isRecovering = false;
    let lastScrollTime = 0;
    
    const handleScroll = () => {
      // If scrolling programmatically, allow it
      if (isScrollingRef.current || isRecovering) return;
      
      const now = Date.now();
      const windowHeight = window.innerHeight;
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Find which section user is trying to scroll to
      let targetPhase = currentPhase;
      let closestPhase = currentPhase;
      let minDistance = Infinity;
      
      sectionRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        
        // Find closest phase to top
        if (distance < minDistance) {
          minDistance = distance;
          closestPhase = index;
        }
        
        // Find phase at viewport center
        if (rect.top <= windowHeight / 3 && rect.bottom >= windowHeight / 3) {
          targetPhase = index;
        }
      });
      
      // If trying to scroll to locked phase
      if (!unlockedPhases.includes(closestPhase) || !unlockedPhases.includes(targetPhase)) {
        // Debounce the recovery to avoid jitter
        scrollTimeout = setTimeout(() => {
          if (isScrollingRef.current || isRecovering) return;
          
          // Find the highest unlocked phase that's <= currentPhase
          const maxUnlockedPhase = Math.max(...unlockedPhases.filter(p => p <= currentPhase));
          const recoveryPhase = maxUnlockedPhase >= 0 ? maxUnlockedPhase : currentPhase;
          
          const currentElement = sectionRefs.current[recoveryPhase];
          if (currentElement) {
            isRecovering = true;
            isScrollingRef.current = true;
            
            // Smooth scroll back with longer duration
            currentElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
            });
            
            // Show toast only if enough time has passed since last one
            if (now - lastScrollTime > 3000) {
              toast.info('🔒 Complete the current phase to unlock this section! Click the button below to continue.', {
                duration: 4000,
                position: 'top-center',
                style: {
                  background: 'linear-gradient(135deg, #0070A0, #1B9CCA)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,112,160,0.3)',
                },
              });
              lastScrollTime = now;
            }
            
            // Reset flags after animation completes
            setTimeout(() => {
              isScrollingRef.current = false;
              isRecovering = false;
            }, 1500);
          }
        }, 150); // Debounce delay
        return;
      }
      
      // Update current phase if in unlocked area (with debounce)
      scrollTimeout = setTimeout(() => {
        if (unlockedPhases.includes(targetPhase) && targetPhase !== currentPhase) {
          setCurrentPhase(targetPhase);
        }
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [currentPhase, unlockedPhases]);

  // Handle password submit
  const handlePasswordSubmit = async () => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      // Setup password
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Clear saved MNZD configs from localStorage only
        localStorage.removeItem('welcomeMNZDConfigs');
        setShowPasswordModal(false);
        toast.success('Welcome to your journey!');
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to setup password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = (config: MNZDConfig) => {
    return config.name.trim().length > 0 && 
           config.description.trim().length > 0 && 
           config.minMinutes >= 5;
  };

  // Success screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0070A0] to-[#1B9CCA] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white max-w-lg w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Chain Begins!</h1>
          <p className="text-lg text-white/80 mb-8">
            You have committed to <span className="font-bold text-white">{totalDailyMinutes} minutes</span> of daily growth across 4 life pillars.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{Math.round((totalDailyMinutes * 365) / 60)}h</p>
              <p className="text-sm text-white/70">growth per year</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">37x</p>
              <p className="text-sm text-white/70">better in a year</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-white text-[#0070A0] font-semibold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 mx-auto"
          >
            <Zap className="w-5 h-5" />
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative scroll-smooth">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        /* Enhanced smooth scrolling */
        * {
          scroll-behavior: smooth;
        }
        
        /* Smoother scroll transitions */
        html, body {
          scroll-padding-top: 0;
          scroll-snap-type: y mandatory;
        }
        
        section {
          scroll-snap-align: start;
        }
        
        /* Hide scrollbar */
        ::-webkit-scrollbar {
          display: none;
        }
        
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* REDESIGNED Fixed Progress Indicator - Bubble Style */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        {/* Progress percentage */}
        <div className="text-center mb-3">
          <div className="text-white/80 text-xs font-medium">
            {Math.round((completedPhases.length / PHASES.length) * 100)}% Complete
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {PHASES.map((phase, idx) => {
          const isUnlocked = unlockedPhases.includes(phase.id);
          const isActive = currentPhase === phase.id;
          const isCompleted = completedPhases.includes(phase.id);
          
          return (
            <div key={phase.id} className="flex items-center gap-2">
              <motion.button
                onClick={() => navigateToPhase(phase.id)}
                disabled={!isUnlocked}
                whileHover={isUnlocked ? { scale: 1.3 } : {}}
                whileTap={isUnlocked ? { scale: 0.9 } : {}}
                className={`relative group ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={phase.title}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-[#0070A0]/30 to-[#1B9CCA]/30 blur-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Main bubble */}
                <motion.div
                  className={`relative rounded-full transition-all duration-500 ${
                    isCompleted 
                      ? 'w-3 h-3 bg-emerald-400 shadow-lg shadow-emerald-500/50' 
                      : isActive 
                        ? 'w-4 h-4 bg-white shadow-xl shadow-white/50' 
                        : isUnlocked 
                          ? 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80' 
                          : 'w-2 h-2 bg-white/20'
                  }`}
                  animate={isActive ? { 
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={isActive ? { 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}}
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="w-2 h-2 text-white" strokeWidth={4} />
                    </motion.div>
                  )}
                </motion.div>

                {/* Tooltip */}
                {isUnlocked && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    <div className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
                      {phase.title}
                    </div>
                  </div>
                )}
              </motion.button>

              {/* Connector line */}
              {idx < PHASES.length - 1 && (
                <div className="w-6 h-0.5 bg-white/20 relative overflow-hidden rounded-full">
                  <AnimatePresence>
                    {completedPhases.includes(phase.id) && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Phase Label */}
      <div className="fixed top-6 right-6 z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-white/90 text-sm font-medium bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg"
          >
            {PHASES[currentPhase]?.title}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* PHASE 0: Hero */}
      <section 
        ref={setSectionRef(0)}
        className="min-h-screen relative flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(/images/hero-sketch.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              transform: 'scale(1.0)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <BubbleEffect seed={0} />
        <FloatingParticles seed={0} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 md:mb-8 border border-white/20">
              {/* <Sparkles className="w-4 h-4 text-[#F2B124]" /> */}
              <span className="text-base text-teal-400">Your Journey Starts Here</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-tight">
              NEVER BREAK
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0070A0] to-[#1B9CCA]">
                THE CHAIN
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-8 md:mb-12 px-4">
              Transform your life through the power of consistent daily action. 
              One link at a time.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => completePhase(0)}
              className="px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] text-white font-semibold rounded-full shadow-2xl flex items-center gap-2 mx-auto text-sm"
            >
              Begin Your Story
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-white/50" />
        </motion.div>
      </section>

      {/* PHASE 1: Philosophy */}
      <section 
        ref={setSectionRef(1)}
        className="min-h-screen relative flex items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/images/story-philosophy.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            transform: 'scale(1.0)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        
        <BubbleEffect seed={1} />
        <FloatingParticles seed={1} />

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-24 py-16 md:py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#F2B124] text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
                Chapter 1
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8">
                The Chain Reaction
              </h2>
              
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-white/80 leading-relaxed">
                <p>
                  In the 1990s, a young comedian named Jerry Seinfeld was asked how he became 
                  one of the most successful comics of his generation.
                </p>
                <p>
                  His answer was surprisingly simple: <strong className="text-white">&ldquo;Do one important thing daily. 
                  Mark it on a calendar. After a few days, you&apos;ll have a chain. 
                  Your only job is to not break it.&rdquo;</strong>
                </p>
                <p>
                  The fear of breaking the chain becomes your greatest motivator. 
                  Each link represents a vote for the person you want to become.
                </p>
              </div>

              <motion.div 
                className="mt-8 md:mt-12 p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0070A0] rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white">1% Daily</p>
                    <p className="text-white/70 text-sm md:text-base">= 37x better in a year</p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => completePhase(1)}
                className="mt-5 md:mt-6 px-4 md:px-5 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
              >
                Continue Reading
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHASE 2: Identity */}
      <section 
        ref={setSectionRef(2)}
        className="min-h-screen relative flex items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/images/story-identity.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            transform: 'scale(1.0)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/70 to-black/50" />

        <BubbleEffect seed={2} />
        <FloatingParticles seed={2} />

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-24 py-16 md:py-24">
          <div className="max-w-3xl ml-auto text-right">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#F2B124] text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
                Chapter 2
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8">
                Become Who You Want
              </h2>
              
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-white/80 leading-relaxed">
                <p>
                  Every action you take is a vote for the type of person you wish to become. 
                  You don&apos;t rise to your goals — you fall to your systems.
                </p>
                <p>
                  The chain method isn&apos;t about perfection. It&apos;s about <strong className="text-white">showing up</strong>, 
                  day after day, even when you don&apos;t feel like it.
                </p>
                <p>
                  Small daily actions compound into extraordinary results. 
                  What starts small accumulates into something remarkable.
                </p>
              </div>

              <motion.div 
                className="mt-8 md:mt-12 flex justify-end"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 inline-block">
                  <p className="text-lg md:text-2xl font-bold text-white italic">
                    &ldquo;Change who you are, not just what you do.&rdquo;
                  </p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => completePhase(2)}
                className="mt-5 md:mt-6 px-4 md:px-5 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-all ml-auto text-sm"
              >
                Discover the Framework
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHASE 3: MNZD Framework Intro */}
      <section 
        ref={setSectionRef(3)}
        className="min-h-screen relative flex items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/images/story-mnzd.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            transform: 'scale(1.0)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-24 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <span className="text-[#F2B124] text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
              The Framework
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              Four Pillars of Growth
            </h2>
            <p className="text-base md:text-xl text-white/70 mb-10 md:mb-16">
              The MNZD system covers every aspect of personal development
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[
                { letter: 'M', name: 'Move', desc: 'Physical Foundation', icon: Activity, color: '#10b981', benefit: 'Exercise grows new brain cells' },
                { letter: 'N', name: 'Nourish', desc: 'Mental Growth', icon: BookOpen, color: '#8b5cf6', benefit: '180+ hours of learning/year' },
                { letter: 'Z', name: 'Zone', desc: 'Deep Focus', icon: Target, color: '#3b82f6', benefit: 'Sustained attention = breakthroughs' },
                { letter: 'D', name: 'Document', desc: 'Capture Wisdom', icon: PenTool, color: '#f97316', benefit: 'Written thoughts = future resources' }
              ].map((pillar, idx) => (
                <motion.div
                  key={pillar.letter}
                  initial={{ opacity: 1, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: idx * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/30 hover:border-white/40 transition-all duration-300"
                >
                  <div 
                    className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center text-white text-lg md:text-2xl font-bold mb-3 md:mb-4 mx-auto"
                    style={{ backgroundColor: pillar.color }}
                  >
                    {pillar.letter}
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-white mb-1">{pillar.name}</h3>
                  <p className="text-white/60 text-xs md:text-sm mb-2">{pillar.desc}</p>
                  <p className="text-white/40 text-xs hidden md:block">{pillar.benefit}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => completePhase(3)}
              className="mt-6 md:mt-8 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] text-white font-semibold rounded-full shadow-2xl flex items-center gap-2 mx-auto text-sm"
            >
              Configure Your Pillars
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* PHASES 4-7: Individual MNZD Forms */}
      {mnzdConfigs.map((config, idx) => {
        const phaseNum = 4 + idx;
        const Icon = [Activity, BookOpen, Target, PenTool][idx];
        
        return (
          <section 
            key={config.id}
            ref={setSectionRef(phaseNum)}
            className="min-h-screen relative flex items-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${config.color}15 0%, #0f172a 100%)` }}
          >
            {/* Static background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Large static orbs */}
              <div
                className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30"
                style={{ backgroundColor: config.color }}
              />
              <div
                className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full blur-[100px] opacity-25"
                style={{ backgroundColor: config.color }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[90px] opacity-20"
                style={{ backgroundColor: config.color }}
              />
            </div>

            <FloatingParticles color={config.color} seed={phaseNum} />

            <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-24 py-16 md:py-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-xl mx-auto"
              >
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-white/50 text-xs md:text-sm font-medium mb-2 block">
                    Pillar {idx + 1} of 4
                  </span>
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-white text-lg md:text-xl font-bold mb-2 md:mb-3 mx-auto shadow-lg"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white mb-1 drop-shadow-lg">
                    {config.name}
                  </h2>
                  <p className="text-white/80 text-sm font-medium drop-shadow">{config.description}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 space-y-3 md:space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 md:mb-1.5 block flex justify-between">
                      <span>Custom Name</span>
                      <span className="text-white/40">{config.name.length}/18</span>
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={config.name}
                      onChange={(e) => updateConfig(config.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/50 transition-all"
                      placeholder={`e.g., ${config.id === 'move' ? 'Exercise' : config.id === 'nourish' ? 'Reading' : config.id === 'zone' ? 'Deep Work' : 'Journaling'}`}
                    />
                  </div>

                  {/* Minutes */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 md:mb-1.5 block">Daily Minutes</label>
                    <div className="flex items-center bg-white/5 rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          const newValue = config.minMinutes - 5;
                          if (newValue < 5) {
                            setShowMotivationalHint({show: true, type: 'min', taskName: config.name});
                          } else {
                            updateConfig(config.id, 'minMinutes', newValue);
                          }
                        }}
                        className="px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-all text-lg"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          min="5"
                          max="120"
                          value={config.minMinutes}
                          onChange={(e) => handleManualInput(config.id, e.target.value)}
                          className="bg-transparent text-white text-xl font-bold text-center w-16 border-none outline-none focus:bg-white/10 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-white/50 text-xs ml-1">min</span>
                      </div>
                      <button
                        onClick={() => {
                          const newValue = config.minMinutes + 5;
                          if (newValue > 120) {
                            setShowMotivationalHint({show: true, type: 'max', taskName: config.name});
                          } else {
                            updateConfig(config.id, 'minMinutes', newValue);
                          }
                        }}
                        className="px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-all text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 md:mb-1.5 block flex justify-between">
                      <span>Description</span>
                      <span className="text-white/40">{config.description.length}/100</span>
                    </label>
                    <textarea
                      maxLength={100}
                      value={config.description}
                      onChange={(e) => updateConfig(config.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/50 transition-all resize-none"
                      placeholder="What does this pillar mean to you?"
                      rows={2}
                    />
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 md:mb-1.5 block">Theme Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.color}
                        onChange={(e) => updateConfig(config.id, 'color', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <div 
                        className="flex-1 h-8 rounded-lg"
                        style={{ backgroundColor: config.color }}
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isFormValid(config)) {
                      toast.error('Please fill in all fields');
                      return;
                    }
                    completePhase(phaseNum);
                  }}
                  className="mt-5 md:mt-6 w-full py-2.5 md:py-3 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
                  style={{ 
                    backgroundColor: isFormValid(config) ? config.color : `${config.color}50`,
                    color: 'white'
                  }}
                  disabled={!isFormValid(config)}
                >
                  {idx < 3 ? (
                    <>
                      Next Pillar
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </>
                  ) : (
                    <>
                      View Your Impact
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </section>
        );
      })}

      {/* PHASE 8: Analytics */}
      <section 
        ref={setSectionRef(8)}
        className="min-h-screen relative flex items-center overflow-hidden bg-slate-900"
      >
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: 'url(/images/story-success.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-900" />
        
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 -left-20 w-72 md:w-96 h-72 md:h-96 bg-emerald-500/20 rounded-full blur-[80px] md:blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-20 right-0 w-56 md:w-80 h-56 md:h-80 bg-purple-500/20 rounded-full blur-[60px] md:blur-[100px]"
          />
        </div>

        <FloatingParticles seed={8} />

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-8 md:mb-12">
              <span className="text-[#F2B124] text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
                Your Impact
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4">
                The Power of Consistency
              </h2>
              <p className="text-white/60 text-base md:text-lg">
                Here is what your daily {totalDailyMinutes}-minute commitment will achieve
              </p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
              {[
                { value: `${totalDailyMinutes}m`, label: 'Daily', icon: Clock, color: 'text-blue-400' },
                { value: `${Math.round((totalDailyMinutes * 7) / 60)}h`, label: 'Weekly', icon: Calendar, color: 'text-emerald-400' },
                { value: `${Math.round((totalDailyMinutes * 30) / 60)}h`, label: 'Monthly', icon: BarChart3, color: 'text-purple-400' },
                { value: `${Math.round((totalDailyMinutes * 365) / 60)}h`, label: 'Yearly', icon: Award, color: 'text-amber-400' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 text-center"
                >
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 mx-auto mb-1.5 ${stat.color}`} />
                  <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/50 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Motivation Cards */}
            <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-emerald-500/30"
              >
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <Flame className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                  <h3 className="text-white font-semibold text-sm md:text-base">The 1% Rule</h3>
                </div>
                <p className="text-white/70 text-sm md:text-base">
                  Improving just 1% each day means you will be <span className="text-emerald-400 font-bold">37 times better</span> by the end of the year.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30"
              >
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <h3 className="text-white font-semibold text-sm md:text-base">Compound Effect</h3>
                </div>
                <p className="text-white/70 text-sm md:text-base">
                  Small actions compound over time. Your {totalDailyMinutes} minutes today becomes <span className="text-purple-400 font-bold">{Math.round((totalDailyMinutes * 365) / 60)} hours</span> of growth per year.
                </p>
              </motion.div>
            </div>

            {/* Pillar Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 mb-6 md:mb-8"
            >
              <h3 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Your Four Pillars</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {mnzdConfigs.map((config) => (
                  <div key={config.id} className="flex items-center gap-2 md:gap-3">
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.id.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs md:text-sm font-medium truncate">{config.name}</p>
                      <p className="text-white/50 text-xs">{config.minMinutes}m</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTermsModal(true)}
                className="w-full md:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] text-white font-semibold rounded-full shadow-2xl flex items-center justify-center gap-2 mx-auto text-sm"
              >
                <Lock className="w-4 h-4" />
                Complete Your Journey
              </motion.button>
              
              {/* Quick Skip Option */}
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    // Complete all phases and go directly to terms
                    const allPhases = PHASES.map((_, idx) => idx);
                    setCompletedPhases(allPhases);
                    setUnlockedPhases(allPhases);
                    setShowTermsModal(true);
                  }}
                  className="text-white/60 hover:text-white/80 text-sm underline transition-colors"
                >
                  Skip customization (use defaults)
                </button>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 relative max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <TermsAcceptance 
                onAccept={() => {
                  setShowTermsModal(false);
                  setShowPasswordModal(true);
                }}
                isLoading={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="text-center mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Lock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Secure Your Account</h2>
                <p className="text-white/60 text-sm md:text-base">Create a password to protect your journey</p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="text-white/60 text-xs md:text-sm mb-1.5 md:mb-2 block">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userEmail || 'Loading...'}
                      disabled
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-white/60 text-sm md:text-base cursor-not-allowed pr-10"
                    />
                    {isEmailVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  {isEmailVerified && (
                    <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Email verified
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-white/60 text-xs md:text-sm mb-1.5 md:mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordInput ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 pr-10 md:pr-12 bg-white/5 border border-white/20 rounded-lg md:rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-[#0070A0] transition-all"
                    />
                    <button
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPasswordInput ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </div>
                </div>

                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs md:text-sm">Strength</span>
                      <span className={`text-xs md:text-sm font-medium ${
                        metRequirements === 4 ? 'text-emerald-400' : 
                        metRequirements === 3 ? 'text-blue-400' : 
                        metRequirements === 2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {metRequirements === 4 ? 'Strong' : metRequirements === 3 ? 'Good' : metRequirements === 2 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(metRequirements / 4) * 100}%` }}
                        className={`h-full rounded-full ${
                          metRequirements === 4 ? 'bg-emerald-500' : 
                          metRequirements === 3 ? 'bg-blue-500' : 
                          metRequirements === 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {[
                        { key: 'length', label: '6+ chars', met: passwordRequirements.length },
                        { key: 'uppercase', label: 'A-Z', met: passwordRequirements.uppercase },
                        { key: 'lowercase', label: 'a-z', met: passwordRequirements.lowercase },
                        { key: 'number', label: '0-9', met: passwordRequirements.number }
                      ].map((req) => (
                        <span
                          key={req.key}
                          className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
                            req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'
                          }`}
                        >
                          {req.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-white/60 text-xs md:text-sm mb-1.5 md:mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmInput ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 pr-10 md:pr-12 bg-white/5 border rounded-lg md:rounded-xl text-white text-sm md:text-base focus:outline-none transition-all ${
                        confirmPassword && !passwordsMatch ? 'border-red-500/50' : 
                        passwordsMatch ? 'border-emerald-500/50' : 'border-white/20'
                      }`}
                    />
                    <button
                      onClick={() => setShowConfirmInput(!showConfirmInput)}
                      className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showConfirmInput ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-red-400 text-xs md:text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password || !confirmPassword || !passwordsMatch || isLoading}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] text-white font-semibold rounded-lg md:rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 md:w-5 md:h-5" />
                      Complete Setup
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational Hint Modal */}
      <AnimatePresence>
        {showMotivationalHint.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMotivationalHint({show: false, type: 'min', taskName: ''})}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 border border-gray-200 relative shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMotivationalHint({show: false, type: 'min', taskName: ''})}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {showMotivationalHint.type === 'min' ? (
                    <Target className="w-8 h-8 text-white" />
                  ) : (
                    <Flame className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {showMotivationalHint.type === 'min' ? 'Minimum Foundation' : 'Sustainable Growth'}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {showMotivationalHint.type === 'min' ? (
                    <>5 minutes is the <strong>minimum foundation</strong> for <strong>{showMotivationalHint.taskName}</strong>. Even on your toughest days, this small commitment keeps your chain alive and builds unstoppable momentum.</>
                  ) : (
                    <>120 minutes is the <strong>maximum recommended</strong> for <strong>{showMotivationalHint.taskName}</strong>. Sustainable growth comes from consistency, not intensity. Keep it achievable for long-term success.</>
                  )}
                </p>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 mb-4">
                  <p className="text-amber-800 text-xs font-medium">
                    {showMotivationalHint.type === 'min' ? 
                      '"Small daily actions compound into extraordinary results."' : 
                      '"Progress, not perfection. Consistency beats intensity."'
                    }
                  </p>
                </div>
                
                <button
                  onClick={() => setShowMotivationalHint({show: false, type: 'min', taskName: ''})}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage;