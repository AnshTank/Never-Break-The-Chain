"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, RotateCcw, Timer, Settings, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";

interface FocusTimerProps {
  onTimeUpdate: (minutes: number) => void;
  onSessionComplete?: (minutes: number) => void;
  taskName?: string;
  initialMinutes?: number;
}

export default function FocusTimer({ onTimeUpdate, onSessionComplete, taskName = "Focus Session", initialMinutes = 25 }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(initialMinutes * 60);
  const [sessionTime, setSessionTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [presetMinutes, setPresetMinutes] = useState(initialMinutes);
  const [scrollValue, setScrollValue] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            const completedMinutes = Math.ceil(totalTime / 60);
            const newSessionTime = sessionTime + completedMinutes;
            setSessionTime(newSessionTime);
            try {
              onTimeUpdate(newSessionTime);
              onSessionComplete?.(completedMinutes);
            } catch (error) {
              console.error('Timer callback error:', error);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, totalTime, sessionTime, onTimeUpdate, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const elapsedMinutes = elapsed / 60;
      const newSessionTime = sessionTime + elapsedMinutes;
      setSessionTime(newSessionTime);
      try {
        onTimeUpdate(newSessionTime);
      } catch (error) {
        console.error('Timer update error:', error);
      }
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const elapsedMinutes = elapsed / 60;
      const newSessionTime = sessionTime + elapsedMinutes;
      setSessionTime(newSessionTime);
      try {
        onTimeUpdate(newSessionTime);
      } catch (error) {
        console.error('Timer update error:', error);
      }
    }
    setTimeLeft(totalTime);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setSessionTime(0);
    try {
      onTimeUpdate(0);
    } catch (error) {
      console.error('Timer reset error:', error);
    }
  };

  const setPreset = (minutes: number) => {
    setPresetMinutes(minutes);
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const adjustTime = (delta: number) => {
    const newMinutes = Math.max(1, Math.min(120, presetMinutes + delta));
    setPreset(newMinutes);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newValue = Math.max(1, Math.min(120, presetMinutes + delta));
    setScrollValue(newValue);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setPreset(newValue);
      setScrollValue(null);
    }, 150);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-3 border border-blue-200 dark:border-blue-800 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <Timer className="w-3 h-3 text-blue-600" />
          <h3 className="font-semibold text-xs text-blue-900 dark:text-blue-100 truncate max-w-[100px]">{taskName}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-blue-600 hover:text-blue-700 p-1 h-6 w-6"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      {showSettings && (
        <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Duration</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => adjustTime(-5)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span 
                className="w-8 text-center text-xs font-mono cursor-pointer select-none"
                onWheel={handleWheel}
              >
                {scrollValue !== null ? `${scrollValue}m` : `${presetMinutes}m`}
              </span>
              <Button size="sm" variant="outline" onClick={() => adjustTime(5)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[15, 25, 45, 60].map(minutes => (
              <Button
                key={minutes}
                size="sm"
                variant={presetMinutes === minutes ? "default" : "outline"}
                onClick={() => setPreset(minutes)}
                className="text-xs min-w-0 px-1 py-1 h-6"
              >
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-3">
        <div className="w-20 h-20 mx-auto relative">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-blue-200 dark:text-blue-800"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              className="text-blue-600 transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-base font-mono font-bold text-blue-900 dark:text-blue-100">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {isRunning ? "Running" : timeLeft === 0 ? "Complete" : "Paused"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1 mb-3 flex-wrap">
        {!isRunning ? (
          <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7">
            <Play className="w-3 h-3 mr-1" />
            Start
          </Button>
        ) : (
          <Button onClick={handlePause} className="bg-yellow-600 hover:bg-yellow-700 text-xs px-2 py-1 h-7">
            <Pause className="w-3 h-3 mr-1" />
            Pause
          </Button>
        )}
        <Button onClick={handleStop} variant="outline" className="text-xs px-2 py-1 h-7">
          <Square className="w-3 h-3 mr-1" />
          Stop
        </Button>
        <Button onClick={handleReset} variant="outline" className="text-xs px-2 py-1 h-7">
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="text-center">
        <div className="text-xs text-blue-700 dark:text-blue-300">
          Session Time: <span className="font-mono font-semibold">{Math.floor(sessionTime)}m</span>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Total Hours: {(sessionTime / 60).toFixed(1)}h
        </div>
      </div>
    </div>
  );
}