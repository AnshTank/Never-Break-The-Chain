"use client"

import { useState, useEffect } from "react"

const loadingMessages = [
  "Building your journey...",
  "Preparing your MNZD dashboard...",
  "Loading your progress...",
  "Setting up your chain...",
  "Almost ready to track...",
  "Syncing your data...",
  "Preparing analytics...",
  "Loading your streak..."
]

const motivationalQuotes = [
  "Every expert was once a beginner.",
  "Progress, not perfection.",
  "Small steps, big results.",
  "Consistency beats intensity.",
  "Your future self will thank you.",
  "One day at a time.",
  "Never break the chain.",
  "Show up, even on bad days."
]

interface LoadingStep {
  name: string
  progress: number
  completed: boolean
}

export default function CoolLoading({ 
  message = "Loading...", 
  onLoadingComplete 
}: { 
  message?: string
  onLoadingComplete?: (data: any) => void 
}) {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0])
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])
  const [progress, setProgress] = useState(0)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { name: "Authenticating user", progress: 0, completed: false },
    { name: "Loading settings", progress: 0, completed: false },
    { name: "Fetching analytics", progress: 0, completed: false },
    { name: "Loading today's progress", progress: 0, completed: false }
  ])
  const [allData, setAllData] = useState<any>({})
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }))
    setParticles(newParticles)

    const messageInterval = setInterval(() => {
      setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])
    }, 2500)

    const quoteInterval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
    }, 4000)

    return () => {
      clearInterval(messageInterval)
      clearInterval(quoteInterval)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      const updateStep = (index: number, progress: number, completed: boolean = false) => {
        if (!mounted) return
        setLoadingSteps(prev => prev.map((step, i) => 
          i === index ? { ...step, progress, completed } : step
        ))
        
        // Calculate overall progress
        const totalProgress = Math.round(((index * 25) + (progress * 0.25)))
        setProgress(Math.min(totalProgress, 100))
      }

      try {
        // Step 1: User authentication
        updateStep(0, 20)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const userResponse = await fetch('/api/user')
        updateStep(0, 60)
        
        if (!userResponse.ok) {
          window.location.href = '/login'
          return
        }
        
        const userData = await userResponse.json()
        updateStep(0, 100, true)
        setAllData(prev => ({ ...prev, user: userData }))
        
        if (userData.isNewUser) {
          window.location.href = '/welcome'
          return
        }
        
        await new Promise(resolve => setTimeout(resolve, 200))

        // Step 2: Settings
        updateStep(1, 30)
        const settingsResponse = await fetch('/api/settings')
        updateStep(1, 70)
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setAllData(prev => ({ ...prev, settings: settingsData }))
        }
        updateStep(1, 100, true)
        
        await new Promise(resolve => setTimeout(resolve, 200))

        // Step 3: Analytics
        updateStep(2, 40)
        const analyticsResponse = await fetch('/api/analytics')
        updateStep(2, 80)
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAllData(prev => ({ ...prev, analytics: analyticsData }))
        }
        updateStep(2, 100, true)
        
        await new Promise(resolve => setTimeout(resolve, 200))

        // Step 4: Today's progress
        updateStep(3, 50)
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        const progressResponse = await fetch(`/api/progress?date=${todayStr}`)
        updateStep(3, 90)
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          setAllData(prev => ({ ...prev, todayProgress: progressData }))
        }
        updateStep(3, 100, true)
        
        // Final completion
        setProgress(100)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (mounted && onLoadingComplete) {
          onLoadingComplete(allData)
        }
        
      } catch (error) {
        console.error('Loading error:', error)
        if (mounted) {
          setProgress(100)
          if (onLoadingComplete) {
            onLoadingComplete({})
          }
        }
      }
    }

    loadData()
    
    return () => {
      mounted = false
    }
  }, [onLoadingComplete])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-slate-300 dark:border-slate-600 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Rotating Ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-b-emerald-500 border-l-teal-500 rounded-full animate-spin-reverse"></div>
              
              {/* Center Icon */}
              <div className="absolute inset-4 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-3xl animate-bounce">
                  🔗
                </div>
              </div>
              
              {/* Pulsing Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-ping"></div>
            </div>
            
            {/* Orbiting Elements */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-500"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse animation-delay-1000"></div>
              <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-1500"></div>
            </div>
          </div>

          {/* Loading Message with Typewriter Effect */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 animate-fade-in-up">
              {currentMessage}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic animate-fade-in-up animation-delay-300">
              "{currentQuote}"
            </p>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-4">
            <div className="relative">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              {/* Progress Percentage */}
              <div className="absolute -top-8 left-0 right-0 flex justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 animate-bounce">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Animated Loading Steps */}
          <div className="space-y-3">
            {loadingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 transition-all duration-500 hover:scale-105">
                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  step.completed 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 scale-110' 
                    : step.progress > 0 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' 
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {step.completed ? (
                    <svg className="w-4 h-4 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.progress > 0 ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  )}
                  
                  {/* Loading Ring */}
                  {step.progress > 0 && !step.completed && (
                    <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                  )}
                </div>
                
                <span className={`flex-1 text-left font-medium transition-all duration-300 ${
                  step.completed 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : step.progress > 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.name}
                </span>
                
                {/* Step Progress Indicator */}
                {step.progress > 0 && !step.completed && (
                  <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Animated Chain */}
          <div className="flex justify-center items-center space-x-1 opacity-70">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-7 border-3 border-gray-400 dark:border-gray-500 rounded-full animate-chain-wave"
                style={{ 
                  animationDelay: `${i * 150}ms`,
                  transform: `rotate(${i % 2 === 0 ? '15deg' : '-15deg'})` 
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        
        @keyframes chain-wave {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-8px) rotate(var(--rotation, 0deg)); }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-chain-wave { animation: chain-wave 2s ease-in-out infinite; }
        
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </div>
  )
}