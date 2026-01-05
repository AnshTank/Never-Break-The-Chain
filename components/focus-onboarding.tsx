"use client";

import { useState } from "react";
import { X, ArrowRight, ArrowLeft, Timer, Target, Coffee, Settings } from "lucide-react";

interface FocusOnboardingProps {
  onComplete: (settings: {
    focusTime: number;
    breakTime: number;
    dailySessionGoal: number;
  }) => void;
  onClose: () => void;
}

export default function FocusOnboarding({ onComplete, onClose }: FocusOnboardingProps) {
  const [step, setStep] = useState(0);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [dailySessionGoal, setDailySessionGoal] = useState(8);

  const steps = [
    {
      title: "Welcome to Focus Timer! 🎯",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">⏰</div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Focus Timer helps you maintain deep concentration using proven time management techniques.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your personalized focus experience in just a few steps.
          </p>
        </div>
      )
    },
    {
      title: "What is a Focus Session? 🧠",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">A Complete Session Includes:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-600" />
                <span><strong>Focus Time:</strong> Deep work period (default: 25 minutes)</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-green-600" />
                <span><strong>Break Time:</strong> Rest period (default: 5 minutes)</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            One session = Focus Time + Break Time. This cycle helps maintain peak performance throughout your day.
          </p>
        </div>
      )
    },
    {
      title: "Configure Your Focus Time ⏱️",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            How long can you maintain deep focus without distraction?
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Focus Duration (minutes)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={focusTime}
                onChange={(e) => setFocusTime(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-lg w-12">{focusTime}m</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15m</span>
              <span>90m</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> Start with 25 minutes if you're unsure. You can adjust this anytime.
          </div>
        </div>
      )
    },
    {
      title: "Set Your Break Time ☕",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            How long do you need to recharge between focus sessions?
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Break Duration (minutes)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={breakTime}
                onChange={(e) => setBreakTime(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-lg w-12">{breakTime}m</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5m</span>
              <span>30m</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> Short breaks (5-10m) keep momentum, longer breaks (15-30m) for deeper rest.
          </div>
        </div>
      )
    },
    {
      title: "Daily Session Goal 🎯",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            How many complete sessions do you want to achieve daily?
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Daily Sessions Target</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={dailySessionGoal}
                onChange={(e) => setDailySessionGoal(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-lg w-12">{dailySessionGoal}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span>
              <span>12</span>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <strong>Your Daily Plan:</strong><br/>
            {dailySessionGoal} sessions × ({focusTime}m focus + {breakTime}m break) = {Math.round((dailySessionGoal * (focusTime + breakTime)) / 60 * 10) / 10} hours total
          </div>
        </div>
      )
    },
    {
      title: "You're All Set! 🚀",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold">Your Focus Setup:</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-left">
            <div className="flex justify-between">
              <span>Focus Time:</span>
              <span className="font-mono">{focusTime} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Break Time:</span>
              <span className="font-mono">{breakTime} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Goal:</span>
              <span className="font-mono">{dailySessionGoal} sessions</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Daily Time:</span>
              <span className="font-mono">{Math.round((dailySessionGoal * (focusTime + breakTime)) / 60 * 10) / 10}h</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            You can change these settings anytime from the timer sidebar.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ focusTime, breakTime, dailySessionGoal });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-500">Step {step + 1} of {steps.length}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{steps[step].title}</h2>
            {steps[step].content}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                step === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {step === steps.length - 1 ? 'Start Focusing' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}