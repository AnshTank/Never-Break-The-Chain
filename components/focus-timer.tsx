"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, RotateCcw, Timer, Settings, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";

interface FocusTimerProps {
  onTimeUpdate: (minutes: number) => void;
  taskName?: string;
  initialMinutes?: number;
}

export default function FocusTimer({ onTimeUpdate, taskName = "Focus Session", initialMinutes = 25 }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(initialMinutes * 60);
  const [sessionTime, setSessionTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [presetMinutes, setPresetMinutes] = useState(initialMinutes);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Timer completed
            const completedMinutes = Math.ceil(totalTime / 60);
            setSessionTime(prev => prev + completedMinutes);
            onTimeUpdate(Math.ceil((sessionTime + completedMinutes) / 60 * 100) / 100);
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
  }, [isRunning, totalTime, sessionTime, onTimeUpdate]);

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
    // Add elapsed time to session
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const elapsedMinutes = elapsed / 60;
      setSessionTime(prev => prev + elapsedMinutes);
      onTimeUpdate(Math.ceil((sessionTime + elapsedMinutes) / 60 * 100) / 100);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const elapsedMinutes = elapsed / 60;
      setSessionTime(prev => prev + elapsedMinutes);
      onTimeUpdate(Math.ceil((sessionTime + elapsedMinutes) / 60 * 100) / 100);
    }
    setTimeLeft(totalTime);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setSessionTime(0);
    onTimeUpdate(0);
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">{taskName}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-blue-600 hover:text-blue-700"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Timer Duration</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => adjustTime(-5)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-12 text-center text-sm font-mono">{presetMinutes}m</span>
              <Button size="sm" variant="outline" onClick={() => adjustTime(5)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[15, 25, 45, 60].map(minutes => (
              <Button
                key={minutes}
                size="sm"
                variant={presetMinutes === minutes ? "default" : "outline"}
                onClick={() => setPreset(minutes)}
                className="text-xs"
              >
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto relative">
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
              <div className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {isRunning ? "Running" : timeLeft === 0 ? "Complete" : "Paused"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {!isRunning ? (
          <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        ) : (
          <Button onClick={handlePause} className="bg-yellow-600 hover:bg-yellow-700">
            <Pause className="w-4 h-4 mr-1" />
            Pause
          </Button>
        )}
        <Button onClick={handleStop} variant="outline">
          <Square className="w-4 h-4 mr-1" />
          Stop
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="text-center">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Session Time: <span className="font-mono font-semibold">{Math.floor(sessionTime)}m</span>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Total Hours: {(sessionTime / 60).toFixed(1)}h
        </div>
      </div>
    </div>
  );
}